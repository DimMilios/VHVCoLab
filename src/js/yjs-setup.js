import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
import {
  updateSingleSelect,
  updateMultiSelect,
  removeUnusedElements,
  userListDisplay,
} from './vhv-scripts/collab-extension.js';
import { humdrumDataNoteIntoView } from './vhv-scripts/utility-ace.js';
import { markItem } from './vhv-scripts/utility-svg.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';

export let yProvider;
export let userData = {
  name: Math.random().toString(36).substring(7),
  color: '#' + Math.floor(Math.random() * 16777215).toString(16),
};

window.addEventListener('load', () => {
  // console.log(Y)
  const ydoc = new Y.Doc();
  
  if (typeof yProvider == 'undefined') {
    // yProvider = new WebsocketProvider('ws://localhost:9000', 'ace-demo', ydoc); // local
    // yProvider.on('status', event => {
    //   console.log(event.status) // websocket logs "connected" or "disconnected"
    // })

    yProvider = new WebrtcProvider('ace-demo', ydoc);
  }

  const type = ydoc.getText('ace');
  const yUndoManager = new Y.UndoManager(type);

  const editor = getAceEditor();
  if (!editor) {
    throw new Error('Ace Editor is undefined');
  }

  const binding = new AceBinding(type, editor, yProvider.awareness, {
    yUndoManager,
  });

  
  // Define user name and user name
  yProvider.awareness.setLocalStateField('user', userData);

  editor.getSession().selection.on('changeCursor', function (event) {
    const { row, column } = editor.selection.getCursor();
    const item = humdrumDataNoteIntoView(row, column);
    if (item) {
      markItem(item);
      updateSingleSelect(yProvider.awareness.clientID, item, {
        text: userData.name,
        color: userData.color,
      });

      const { user, cursor } = yProvider.awareness.getLocalState();
      yProvider.awareness.setLocalStateField('cursor', {
        itemId: item.id,
        ...cursor,
      });
    }
  });

  yProvider.awareness.on('change', function ({ added, updated, removed }) {
    const awarenessState = yProvider.awareness.getStates();
    removeUnusedElements(Array.from(awarenessState.keys()));
    // console.log(`[${new Date().toLocaleTimeString()}]`, awarenessState);

    const users = [...awarenessState.values()].map((s) => s.user.name);
    userListDisplay(users);

    const f = (clientId) => {
      if (clientId === yProvider.awareness.clientID) return;

      const aw = awarenessState.get(clientId);
      if (aw) {
        updateMultiSelect({ clientId, ...aw }, aw?.multiSelect);

        const item = document.querySelector(`#${aw?.cursor?.itemId}`);
        if (item) {
          updateSingleSelect(clientId, item, {
            text: aw.user.name,
            color: aw.user.color,
          });
        }
      }
    };

    added.forEach(f);
    updated.forEach(f);
    removed.forEach(f);
  });

  window.example = { yProvider, ydoc, type };
});
