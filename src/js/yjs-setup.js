import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  commentsObserver,
  updateHandler,
} from './collaboration/collab-extension.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';
import { setState, state } from './state/comments.js';
import { multiSelectCoords } from './collaboration/templates.js';
import Cookies from 'js-cookie';

import { baseUrl, wsBaseUrl, fetchRoom, getURLInfo } from './api/util.js';

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

/** @type{WebsocketProvider} */
export let yProvider;

/** @type {Y.Doc} */
export let ydoc;

export async function setupCollaboration() {
  ydoc = new Y.Doc();

  const { file, user } = getURLInfo();

  let room = file ?? 'test-room';
  // let roomData;
  /*
  if (file && user) {
    roomData = await fetchRoom(file, user);
    room = roomData?.room ?? room;
  }
  */

  if (typeof yProvider == 'undefined') {
    yProvider = new WebsocketProvider(wsBaseUrl, room, ydoc); // local
    yProvider.on('status', (event) => {
      console.log(event.status); // websocket logs "connected" or "disconnected"
    });
  }

  setUserAwarenessData(user);

  const type = ydoc.getText('ace');
  const yUndoManager = new Y.UndoManager(type);

  const editor = getAceEditor();
  if (!editor) {
    throw new Error('Ace Editor is undefined');
  }

  const binding = new AceBinding(type, editor, yProvider.awareness, {
    yUndoManager,
  });

  const commentsList = ydoc.getArray('comments');
  commentsList.observe((event) => {
    // console.log(event.changes.added);

    const focusedArea = document.querySelector('.highlight-area-focus');
    // If a comment reply was added, render comments while focusing on its parent
    const arr = event?.changes?.added?.values()?.next()?.value?.content?.arr;
    if (arr?.length > 0) {
      const commentAdded = JSON.parse(arr[0]);
      if (
        commentAdded?.parentCommentId &&
        commentAdded.parentCommentId === focusedArea?.dataset?.commentId
      ) {
        commentsObserver({ [commentAdded.parentCommentId]: true });
        return;
      }
    }

    const focus = focusedArea ? { [focusedArea.dataset.commentId]: true } : {};
    commentsObserver(focus);
  });

  yProvider.awareness.on('change', updateHandler);
  // yProvider.awareness.on('update', updateHandler);

  window.example = { yProvider, ydoc, type };
  window.awareness = yProvider.awareness;

  // setupSSE(DOC_ID);
}

/**
 * Contains JSON serialized comments
 *
 * @returns {Y.Array<string>}
 */
export function getCommentsList() {
  return ydoc.getArray('comments');
}

function setUserAwarenessData(user) {
  console.log({ user });
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
    return;
  }

  if (user) {
    userData.name = user;
  }
  yProvider.awareness.setLocalStateField('user', userData);
}

function setupSSE(DOC_ID) {
  function handleCommentsMessage(event) {
    let payload = JSON.parse(event.data);
    console.log('Message event', payload);

    if (Array.isArray(payload)) {
      let shouldCompute = payload.some((p) => p.highlight == null);

      if (document.querySelector('#output svg') && shouldCompute) {
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
              computeCommentHighlights(
                state.comments.concat(payload.createdComment)
              );
              updateHandler();
            }
            break;
          case 'delete':
            if (resource === 'comments') {
              if (Array.isArray(payload.ids)) {
                setState({
                  comments: state.comments.filter(
                    (r) => !payload.ids.includes(r.id)
                  ),
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
}
