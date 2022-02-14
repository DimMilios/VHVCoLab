import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
import { updateHandler } from './collaboration/collab-extension.js';
import { humdrumDataNoteIntoView } from './vhv-scripts/utility-ace.js';
import { markItem } from './vhv-scripts/utility-svg.js';
import { getAceEditor, insertSplashMusic } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';
import { setState, state } from './state/comments.js';
import { multiSelectCoords } from './collaboration/templates.js';
import Cookies from 'js-cookie';
import { IndexeddbPersistence, storeState } from 'y-indexeddb';

import * as userService from './api/users.js';
import { baseUrl, getURLParams } from './api/util.js';
import {
  createDraggableContainer,
  createNewEditorSession,
} from './collaboration/svg-interaction.js';


const names = [
  'Michael',
  'John',
  'Jim',
  'Maria',
  'Nick',
  'Jake',
  'Isabella',
  'Kate',
];
const colors = [
  '#30bced',
  '#6eeb83',
  '#ffbc42',
  '#ecd444',
  '#ee6352',
  '#9ac2c9',
  '#8acb88',
  '#1be7ff',
];

const oneOf = (array) => array[Math.floor(Math.random() * array.length)];

let name = oneOf(names);
let userData = {
  name,
  color: oneOf(colors),
  email: name + '@test.com',
  id: 1,
};

let lastSnapshot = null;
const suffix = '-v1';

/**
 * 
 * @param {Y.Item} item 
 * @returns {boolean}
 */
// const gcFilter = (item) =>
//   !Y.isParentOf(type, item) ||
//   (lastSnapshot && (lastSnapshot.sv.get(item.id.client) || 0) <= item.id.clock);

// export const versionDoc = new Y.Doc()
// export const versionIndexeddbPersistence = new IndexeddbPersistence('website-version' + suffix, versionDoc);
// export const versionType = versionDoc.getArray('versions');

// versionIndexeddbPersistence.on('synced', () => {
//   lastSnapshot = versionType.length > 0 ? Y.decodeSnapshot(versionType.get(0).snapshot) : Y.emptySnapshot
//   versionType.observe(() => {
//     const nextSnapshot = Y.decodeSnapshot(versionType.get(0).snapshot);
//     yUndoManager.clear();
//     Y.tryGc(nextSnapshot.ds, ydoc.store, gcFilter);
//     lastSnapshot = nextSnapshot;
//     storeState(indexeddbPersistence);
//   })
// })

// const ydoc = new Y.Doc({ gcFilter });

// export const indexeddbPersistence = new IndexeddbPersistence('website' + suffix, ydoc)

export let yProvider;
const ydoc = new Y.Doc();


let { docId: DOC_ID, roomname } = getURLParams(['docId', 'roomname']);
let room = `docId=${DOC_ID}&roomname=${roomname}`;

if (typeof yProvider == 'undefined') {
  yProvider = new WebsocketProvider('ws://localhost:3001', room, ydoc); // local
  yProvider.on('status', (event) => {
    console.log(event.status); // websocket logs "connected" or "disconnected"
  });

  // yProvider = new WebrtcProvider(roomname, ydoc);
}

let appUser = Cookies.get('user');
if (appUser) {
  let user = JSON.parse(appUser);
  if (!user.name) {
    user.name = user.email.split('@')[0];
  }
  yProvider.awareness.setLocalStateField('user', {
    ...user,
    color: oneOf(colors),
  });
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
// insertSplashMusic();
editor.renderer.setOption('maxLines', 50);

editor.getSession().selection.on('changeCursor', function () {
  const { row, column } = editor.selection.getCursor();
  const item = humdrumDataNoteIntoView(row, column);
  // console.log('changeCursor event', { row, column, item })
  if (item && item.classList.contains('note')) {
    markItem(item);

    // createNewEditorSession({ item, row, column });
    // createDraggableContainer(item);
    const localState = yProvider.awareness.getLocalState();

    yProvider.awareness.setLocalState({
      ...localState,
      singleSelect: { elemId: item.id },
      multiSelect: null,
    });
  }
});

editor.on('changeSession', (event) => {
  console.log(event);
});

// yProvider.awareness.on('update', updateHandler);
yProvider.awareness.on('change', updateHandler);

let eventSource = new EventSource(
  `${baseUrl}events/comments?docId=${DOC_ID}&clientId=${yProvider.awareness.clientID}`,
  { withCredentials: true }
);

eventSource.addEventListener('open', async () => {
  console.log('Event source connection for comments open');

  userService.getByDocumentId(DOC_ID, {
    onSuccess: (usersJSON) => {
      let connectedIds = [...yProvider.awareness.getStates().values()].map(
        (s) => s.user.id
      );
      let users = [];
      for (let user of usersJSON) {
        user.online = connectedIds.includes(user.id);
        users.push(user);
      }

      setState({ users });
    },
  });
});

export function handleCommentsMessage (event) {
    let payload = JSON.parse(event.data);
    console.log('Message event', payload);
  
    if (Array.isArray(payload)) {
      let shouldCompute = payload.some(p => p.highlight == null);
      
      if (document.querySelector('#output > svg') && shouldCompute) {
        computeCommentHighlights(payload);
      } else {
        // The SVG music score element hasn't been rendered yet here.
        // We can't calculate comment highlight coordinates yet.
        setState({ comments: payload }, { reRender: false });
      }
      return;
    }
  
    // { type: 'resource:method', id: number }
    // e.g { type: 'comment:delete', id: 1 }
    if (payload.hasOwnProperty('type')) {
      let [resource, method] = payload.type.split(':');
  
      if (Object.keys(state).includes(resource)) {
        switch (method) {
          case 'create':
            if (resource === 'comments') {
              computeCommentHighlights(state.comments.concat(payload.createdComment))
              updateHandler();
            }
            break;
          case 'delete':
            if (resource === 'comments') {
              if (Array.isArray(payload.ids)) {
                setState({
                  comments: state.comments.filter((r) => !payload.ids.includes(r.id)),
                });
              }
            }
            updateHandler(); // Re-render collab layer
            break;
          default:
            console.log(`Unknown method: ${method}`);
        }
      }
  
      return;
    }
  
    // let comments = state?.comments ? [...state.comments, payload] : [payload];
}

function computeCommentHighlights(comments) {
  // Add the highlight coordinates for each comment
  setState({
    comments: comments.map((c) => {
      return c.highlight == null && typeof c?.multiSelectElements == 'string'
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
}

eventSource.addEventListener('message', handleCommentsMessage);

eventSource.addEventListener('error', (error) => {
  console.log('Error', error);
  eventSource.close();
});

window.addEventListener('beforeunload', () => {
  eventSource.close();
});

window.example = { yProvider, ydoc, type };
window.awareness = yProvider.awareness;
