import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'my-roomname', ydoc);

const type = ydoc.getText('ace');  // Create a Yjs Text type
const editor = getAceEditor();  // Get the instance of the Ace Editor

// Bind the Ace Editor to the Yjs Text type.
const binding = new AceBinding(type, editor, wsProvider.awareness);

// Assign a random name and color. This is our local user.
// Changes to the awareness state are broadcasted to every client.
wsProvider.awareness.setLocalStateField('user', {
  name: oneOf(['Michael', 'John', 'Jim', 'Maria', 'Nick', 'Jake', 'Isabella', 'Kate']),
  color: oneOf(['#30bced','#6eeb83','#ffbc42','#ecd444','#ee6352','#9ac2c9','#8acb88','#1be7ff'])
});

// Awareness states are stored in a Map:
// 12342342342 => { user: {} }

// Listen to local and remote state changes
wsProvider.awareness.on('change', (clientIDs) => {

})

wsProvider.on('status', (event) => {
  console.log(event.status); // logs "connected" or "disconnected"
});
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