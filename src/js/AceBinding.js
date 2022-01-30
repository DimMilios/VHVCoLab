import { createMutex } from 'lib0/mutex';
import { simpleDiffString } from 'lib0/diff';

export default class AceBinding {
  /**
   * @param {Y.Text} type
   * @param {any} ace
   * @param {Awareness} [awareness]
   * @param {{ yUndoManager?: Y.UndoManager }} [options]
   */
  constructor(type, ace, awareness, { yUndoManager = null } = {}) {
    const mux = createMutex();
    const doc = /** @type {Y.Doc} */ (type.doc);
    this.mux = mux;
    this.type = type;
    this.doc = doc;
    this.ace = ace;
    this.ace.session.getUndoManager().reset();
    this.aceCursors = new AceCursors(this.ace);

    this.yUndoManager = yUndoManager;
    if (yUndoManager) {
      yUndoManager.trackedOrigins.add(this); // track changes performed by this editor binding
      const editorUndo = () => {
        yUndoManager.undo();
      };
      const editorRedo = () => {
        yUndoManager.redo();
      };

      this.ace.commands.addCommand({
        name: 'undo',
        bindKey: { win: 'Ctrl-Z', mac: 'Command-Z' },
        exec: editorUndo,
      });
      this.ace.commands.addCommand({
        name: 'redo',
        bindKey: { win: 'Ctrl-Y', mac: 'Command-Y' },
        exec: editorRedo,
      });

      yUndoManager.on('stack-item-added', this._onStackItemAdded)
      yUndoManager.on('stack-item-popped', this._onStackItemPopped)
    }

    this.awareness = awareness;
    this._awarenessChange = ({ added, removed, updated }) => {
      this.aceCursors.marker.cursors = [];
      const states = /** @type {Awareness} */ (this.awareness).getStates();
      added.forEach((id) => {
        // console.log('added: ' + id)
        this.aceCursors.updateCursors(states.get(id), id);
      });
      updated.forEach((id) => {
        // console.log('updated: ' + id)
        this.aceCursors.updateCursors(states.get(id), id);
      });
      removed.forEach((id) => {
        // console.log('removed: ' + id)
        this.aceCursors.updateCursors(states.get(id), id);
      });

      this.aceCursors.marker.redraw();
    };

    this._typeObserver = (event) => {
      const aceDocument = this.ace.getSession().getDocument();
      // console.log('>>Yjs: type event', event)
      let rev = this.ace.session.$undoManager.startNewGroup();
      mux(() => {
        const delta = event.delta;
        let currentPos = 0;
        for (const op of delta) {
          if (op.retain) {
            currentPos += op.retain;
          } else if (op.insert) {
            const start = aceDocument.indexToPosition(currentPos, 0);
            aceDocument.insert(start, op.insert);
            currentPos += op.insert.length;
            // console.log('>>>Yjs: inserting at position:', start)
            // console.log('>>>Yjs: inserting text:', op.insert)
          } else if (op.delete) {
            const start = aceDocument.indexToPosition(currentPos, 0);
            const end = aceDocument.indexToPosition(currentPos + op.delete, 0);
            const range = new Range(
              start.row,
              start.column,
              end.row,
              end.column
            );
            aceDocument.remove(range);
            // console.log('>>>Yjs: removing at', start, end)
          }
        }
        this.ace.session.$undoManager.markIgnored(rev);
        this._cursorObserver();
      });
    };
    type.observe(this._typeObserver);

    this._aceObserver = (eventType, delta) => {
      const aceDocument = this.ace.getSession().getDocument();
      mux(() => {
        this.type.doc.transact(() => {
          if (eventType.lines.length > 1) {
            // If there are several consecutive changes, we can't reliably compute the positions anymore.
            // Instead, we will compute the diff and apply the changes
            const d = simpleDiffString(
              this.type.toString(),
              aceDocument.getValue()
            );
            console.log('>>>Ace Observer: diff', { diff: d });
            this.type.delete(d.index, d.remove);
            this.type.insert(d.index, d.insert);
          } else {
            if (eventType.action === 'insert') {
              const start = aceDocument.positionToIndex(eventType.start, 0);
              // console.log('>>>Ace: inserting at index: ', start);
              if (window.navigator.userAgent.indexOf('Win') != -1) {
                eventType.lines.forEach((line) => line.replaceAll('\r', ''));
              }
              // console.log('>>>Ace: Event lines:', eventType.lines)
              type.insert(start, eventType.lines.join('\n'));
            } else if (eventType.action === 'remove') {
              const start = aceDocument.positionToIndex(eventType.start, 0);
              // console.log('>>>Ace: Deleting at index: ', start);
              if (window.navigator.userAgent.indexOf('Win') != -1) {
                eventType.lines.forEach((line) => line.replaceAll('\r', ''));
              }
              const length = eventType.lines.join('\n').length;
              type.delete(start, length);
            }
          }
          type.applyDelta(eventType);
          this._cursorObserver();
        }, this);
      });
    };
    this.ace.on('change', this._aceObserver);

    this._cursorObserver = () => {
      let user = this.awareness.getLocalState().user;
      let curSel = this.ace.getSession().selection;
      let cursor = {
        id: doc.clientID,
        name: user.name,
        sel: true,
        color: user.color,
      };

      let indexAnchor = this.ace
        .getSession()
        .doc.positionToIndex(curSel.getSelectionAnchor());
      let indexHead = this.ace
        .getSession()
        .doc.positionToIndex(curSel.getSelectionLead());
      cursor.anchor = indexAnchor;
      cursor.head = indexHead;

      // flip if selected right to left
      if (indexAnchor > indexHead) {
        cursor.anchor = indexHead;
        cursor.head = indexAnchor;
      }

      cursor.pos = cursor.head;

      if (cursor.anchor === cursor.head) {
        cursor.sel = false;
      }

      const aw = /** @type {any} */ (this.awareness.getLocalState());
      if (curSel === null) {
        if (this.awareness.getLocalState() !== null) {
          this.awareness.setLocalStateField('cursor',/** @type {any} */(null));
        }
      } else {
        if (!aw ||
          !aw.cursor ||
          cursor.anchor !== aw.cursor.anchor ||
          cursor.head !== aw.cursor.head) {
          this.awareness.setLocalStateField('cursor', cursor);
        }
      }
    };

    // update cursors
    this.ace
      .getSession()
      .selection.on('changeCursor', () => this._cursorObserver());

    if (this.awareness) {
      this.awareness.on('change', this._awarenessChange);
    }
  }
  _onStackItemPopped(event) {
    // console.log('stackItem added to UndoManager', event);
    // event.stackItem.meta.set('replacedValue',);
  }
  _onStackItemAdded(event) {
    // console.log('stackItem removed from UndoManager', event);
  }

  destroy() {
    console.log('destroyed');
    this.type.unobserve(this._typeObserver);
    this.ace.off('change', this._aceObserver);
    if (this.awareness) {
      this.awareness.off('change', this._awarenessChange);
    }
    if (this.yUndoManager) {
      this.yUndoManager.off('stack-item-added', this._onStackItemAdded);
      this.yUndoManager.off('stack-item-popped', this._onStackItemPopped);
      this.yUndoManager.trackedOrigins.delete(this);
    }
  }
}
/*
AceCursors // cc teddavis.org 2021
Small class for tracking cursors/selection in Ace Editor
*/
class AceCursors {
  constructor(ace) {
    this.ace = ace;
    this.marker = {};
    this.marker.self = this;
    this.markerID = {};
    this.marker.cursors = [];
    this.aceID = this.ace.container.id;

    this.marker.update = function (html, markerLayer, session, config) {
      let start = config.firstRow, end = config.lastRow;
      let cursors = this.cursors;

      for (let i = 0; i < cursors.length; i++) {
        let pos = this.cursors[i];
        if (pos.row < start) {
          continue;
        } else if (pos.row > end) {
          break;
        } else {
          // compute cursor position on screen
          // this code is based on ace/layer/marker.js
          let screenPos = session.documentToScreenPosition(pos.row, pos.column);
          let aceGutter = document.getElementsByClassName('ace_gutter')[0].offsetWidth;
          let height = config.lineHeight;
          let width = config.characterWidth;
          let top = markerLayer.$getTop(screenPos.row, config);
          let left = markerLayer.$padding + aceGutter + screenPos.column * width;

          // draw cursor and flag
          let el = document.getElementById(
            this.self.aceID + '_cursor_' + pos.id
          );
          if (el == undefined) {
            el = document.createElement('div');
            el.id = this.self.aceID + '_cursor_' + pos.id;
            el.className = 'cursor';
            el.style.position = 'absolute';
            el.innerHTML =
              '<div class="cursor-label" style="background: ' +
              pos.color +
              ';top: -1.8em;white-space: nowrap;">' +
              pos.name +
              '</div>';
            this.self.ace.container.appendChild(el);
          } else {
            el.style.height = height + 'px';
            el.style.width = width + 'px';
            el.style.top = top + 'px';
            el.style.left = left + 'px';
            el.style.borderLeft = '2px solid ' + pos.color;
            el.style.zIndex = 100;
            el.style.color = '#000';
            el.style.cursor = 'help';
          }
        }
      }
    };

    this.marker.redraw = function () {
      this.session._signal('changeFrontMarker');
    };

    this.marker.session = this.ace.getSession();
    this.marker.session.addDynamicMarker(this.marker, true);
  }

  updateCursors(cur, cid) {
    if (cur !== undefined && cur.hasOwnProperty('cursor')) {
      let c = cur.cursor;
      let pos = this.ace.getSession().doc.indexToPosition(c.pos);

      let curCursor = {
        row: pos.row,
        column: pos.column,
        color: c.color,
        id: c.id,
        name: c.name,
      };

      // handle selection
      if (c.sel) {
        if (this.markerID[c.id] !== undefined &&
          this.markerID[c.id].hasOwnProperty('sel') &&
          this.markerID[c.id].sel !== undefined) {
          this.ace.session.removeMarker(this.markerID[c.id].sel);
          this.markerID[c.id].sel = undefined;
        }

        let anchor = this.ace.getSession().doc.indexToPosition(c.anchor);
        let head = this.ace.getSession().doc.indexToPosition(c.head);

        let customStyle = document.getElementById('style_' + c.id);
        if (customStyle) {
          customStyle.innerHTML =
            '.selection-' +
            c.id +
            ' { position: absolute; z-index: 20; opacity: 0.5; background: ' +
            c.color +
            '; }';
        } else {
          let style = document.createElement('style');
          style.type = 'text/css';
          style.id = 'style_' + c.id;
          document.getElementsByTagName('head')[0].appendChild(style);
        }

        this.markerID[c.id] = {
          id: c.id,
          sel: this.ace.session.addMarker(
            new Range(anchor.row, anchor.column, head.row, head.column),
            'selection-' + c.id,
            'text'
          ),
        };
      } else {
        if (this.markerID[c.id] !== undefined &&
          this.markerID[c.id].hasOwnProperty('sel') &&
          this.markerID[c.id].sel !== undefined) {
          this.ace.session.removeMarker(this.markerID[c.id].sel);
          this.markerID[c.id].sel = undefined;
        }
      }
      // console.log(curCursor)
      this.marker.cursors.push(curCursor);
    } else {
      let el = document.getElementById(this.aceID + '_cursor_' + cid);
      if (el) {
        el.parentNode.removeChild(el);
        if (this.markerID[cid] !== undefined &&
          this.markerID[cid].hasOwnProperty('sel') &&
          this.markerID[cid].sel !== undefined) {
          this.ace.session.removeMarker(this.markerID[cid].sel);
          this.markerID[cid].sel = undefined;
        }
      }
    }
  }
}
