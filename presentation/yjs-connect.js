import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'my-roomname', ydoc);

wsProvider.on('status', (event) => {
  console.log(event.status); // logs "connected" or "disconnected"
});

const type = ydoc.getText('ace');
const editor = getAceEditor();
const binding = new AceBinding(type, editor, wsProvider.awareness);

wsProvider.awareness.on('change', function ({ added, updated, removed }) {
  const awarenessState = wsProvider.awareness.getStates();
  const f = (clientId) => {
    if (clientId === wsProvider.awareness.clientID) return; // Ignore changes from self
    const aw = awarenessState.get(clientId);
    if (aw) {
     // Update UI 
    }
  };

  added.forEach(f);
  updated.forEach(f);
  removed.forEach(f);
});


