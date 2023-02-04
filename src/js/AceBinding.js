import * as Y from 'yjs';
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

      yUndoManager.on('stack-item-added', this._onStackItemAdded);
      yUndoManager.on('stack-item-popped', this._onStackItemPopped);
    }

    this.awareness = awareness;

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
        // this._cursorObserver();
      });
      this.ace.session.$undoManager.markIgnored(rev);
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
              type.insert(start, eventType.lines.join('\n'));
            } else if (eventType.action === 'remove') {
              const start = aceDocument.positionToIndex(eventType.start, 0);
              const length = eventType.lines.join('\n').length;
              type.delete(start, length);
            }
          }
          type.applyDelta(eventType);
          // this._cursorObserver();
        }, this);
      });
    };
    this.ace.session.on('change', this._aceObserver);

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
          this.awareness.setLocalStateField(
            'cursor',
            /** @type {any} */ (null)
          );
        }
      } else {
        if (
          !aw ||
          !aw.cursor ||
          cursor.anchor !== aw.cursor.anchor ||
          cursor.head !== aw.cursor.head
        ) {
          this.awareness.setLocalStateField('cursor', cursor);
        }
      }
    };

    // update cursors
    // this.ace
    //   .getSession()
    //   .selection.on('changeCursor', () => this._cursorObserver());
  }
  _onStackItemPopped(event) {
    // console.log('stackItem removed from UndoManager', event);
    // event.stackItem.meta.set('replacedValue',);
  }
  _onStackItemAdded(event) {
    // console.log('stackItem added to UndoManager', event);
  }

  destroy() {
    console.log('destroyed');
    this.type.unobserve(this._typeObserver);
    this.ace.off('change', this._aceObserver);
    // this.ace.session.off('changeCursor', this._cursorObserver);
    if (this.yUndoManager) {
      this.yUndoManager.off('stack-item-added', this._onStackItemAdded);
      this.yUndoManager.off('stack-item-popped', this._onStackItemPopped);
      this.yUndoManager.trackedOrigins.delete(this);
    }
  }
}
