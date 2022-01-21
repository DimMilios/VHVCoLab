import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
import { updateHandler } from './collaboration/collab-extension.js';
import { humdrumDataNoteIntoView } from './vhv-scripts/utility-ace.js';
import { markItem } from './vhv-scripts/utility-svg.js';
import { getAceEditor, insertSplashMusic } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';
import { setState, state } from './state/comments.js';
import { multiSelectCoords, renderComments } from './collaboration/templates.js';
import Cookies from 'js-cookie';

export let yProvider;

const names = ['Michael', 'John', 'Jim', 'Maria', 'Nick', 'Jake', 'Isabella', 'Kate'];
const colors = [ '#30bced','#6eeb83','#ffbc42','#ecd444','#ee6352','#9ac2c9','#8acb88','#1be7ff'];

const oneOf = (array) => array[Math.floor(Math.random() * array.length)];

let name = oneOf(names);
let userData = {
  name,
  color: oneOf(colors),
  email: name + '@test.com',
  id: 1
};

window.addEventListener('load', () => {
  const ydoc = new Y.Doc();
  
  let params = (new URL(document.location)).searchParams;
  let roomname = params.has('roomname') ? params.get('roomname') : 'ace-demo';
  let DOC_ID = params.get('docId');
  let room = `docId=${DOC_ID}&roomname=${roomname}`;

  if (typeof yProvider == 'undefined') {
    yProvider = new WebsocketProvider('ws://localhost:3001', room, ydoc); // local
    yProvider.on('status', event => {
      console.log(event.status) // websocket logs "connected" or "disconnected"
    })

    // yProvider = new WebrtcProvider(roomname, ydoc);
  }

  let appUser = Cookies.get('user');
  if (appUser) {
    let user = JSON.parse(appUser);
    if (!user.name) {
      user.name = user.email.split('@')[0]
    }
    yProvider.awareness.setLocalStateField('user', { ...user, color: oneOf(colors) });
  } else {
    yProvider.awareness.setLocalStateField('user', userData);
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

  // yProvider.awareness.setLocalStateField('user', userData);

  // Insert an initial song to the text editor
  insertSplashMusic();
  editor.renderer.setOption('maxLines', 50);

  editor.getSession().selection.on('changeCursor', function () {
    const { row, column } = editor.selection.getCursor();
    const item = humdrumDataNoteIntoView(row, column);
    // console.log('changeCursor event', { row, column, item })
    if (item && item.classList.contains('note')) {
      markItem(item);
      const localState = yProvider.awareness.getLocalState();

      yProvider.awareness.setLocalState({
        ...localState,
        singleSelect: { elemId: item.id },
        multiSelect: null,
      });
    }
  });

  yProvider.awareness.on('update', updateHandler);

  let eventSource = new EventSource(`http://localhost:3001/events/comments?docId=${DOC_ID}&clientId=${yProvider.awareness.clientID}`, { withCredentials: true });
  
  eventSource.addEventListener('open', () => 
    console.log('Event source connection for comments open'));

  eventSource.addEventListener('message', event => {
    let payload = JSON.parse(event.data);
    console.log('Message event', payload);

    if (Array.isArray(payload)) {
      // The SVG music score element hasn't been rendered yet here.
      // We can't calculate comment highlight coordinates yet.
      setState({ comments: payload });
      return;
    }

    // { type: 'resource:method', id: number }
    // e.g { type: 'comment:delete', id: 1 }
    if (payload.hasOwnProperty('type')) {
      let [resource, method] = payload.type.split(':');

      if (Object.keys(state).includes(resource)) {
        switch (method) {
          case 'delete':
            if (resource === 'comments') {
              setState({
                comments: state.comments.filter(r => r.id !== payload.id)
              })
            }
            renderComments(state.comments);
            
            updateHandler(); // Re-render collab layer
            
            // TODO: We could dynamically render a changed resource (e.g comments) 
            // setState({
            //   [resource]: state[resource].filter(r => r.id !== payload.id)
            // })
            break;
          default:
            console.log(`Unknown method: ${method}`);
        }
      }

      return;
    }

    let comments = state?.comments ? [...state.comments, payload] : [payload];
    
    // Add the highlight coordinates for each comment
    setState({
      comments: comments.map((c) => {
        return c.highlight == null
          ? {
              ...c,
              highlight: Object.assign(
                {},
                multiSelectCoords(c.multiSelectElements.split(','))
              ),
            }
          : c;
      }),
    });

    // console.log('Comments after calculating coords', state.comments)

    renderComments(state.comments);
  })
  
  eventSource.addEventListener('error', error => {
    console.log('Error', error);
  })

  window.example = { yProvider, ydoc, type };
});
