import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  awaranessUpdateHandler,
  commentsObserver,
  stateChangeHandler,
} from './collaboration/collab-extension.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';
import Cookies from 'js-cookie';

import {
  baseUrl,
  wsBaseUrl,
  fetchRoom,
  getURLInfo,
  getURLParams,
} from './api/util.js';
import { loadFileFromURLParam } from './vhv-scripts/file-operations.js';

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
};

export const messageActionsReset = 100;

/** @type{WebsocketProvider} */
export let yProvider;

/** @type {Y.Doc} */
export let ydoc;

/** @type {Y.UndoManager} */
export let yUndoManager;

/** @type {Y.PermanentUserData} */
export let permanentUserData;

let binding;

export async function setupCollaboration() {
  if (typeof ydoc == 'undefined') {
    ydoc = new Y.Doc();

    // const type = ydoc.getText('ace');

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

      const focus = focusedArea
        ? { [focusedArea.dataset.commentId]: true }
        : {};
      commentsObserver(focus);
    });
  }

  if (typeof yProvider == 'undefined') {
    const { file, user, course, id } = getURLInfo();

    let room = file ?? 'test-room';
    let filename;
    const fileParams = new URLSearchParams(file);
    if (fileParams.has('course')) {
      // Loaded from Moodle
      room = file;
      filename = fileParams.get('filename');
    } else {
      // Loaded from public repository
      room = file;
      filename = file;
    }

    permanentUserData = new Y.PermanentUserData(ydoc);
    permanentUserData.setUserMapping(
      ydoc,
      ydoc.clientID,
      `user=${user} id=${id}`
    );

    yProvider = new WebsocketProvider(wsBaseUrl, room, ydoc, {
      params: { username: user, file: filename, course: course ?? null },
    }); // local
    yProvider.on('status', (event) => {
      console.log(event.status); // websocket logs "connected" or "disconnected"
      if (event.status === 'connected') {
        document.title = document.title.replace('🔴', '🟢');
      } else if (event.status === 'disconnected') {
        document.title = document.title.replace('🟢', '🔴');
      }
    });

    yProvider.messageHandlers[messageActionsReset] = () => {
      document.dispatchEvent(new Event('actions_reset'));
    };

    const editor = getAceEditor();
    if (!editor) {
      throw new Error('Ace Editor is undefined');
    }

    yUndoManager = new Y.UndoManager(ydoc.getText('ace'), {
      captureTimeout: 100,
    });

    binding = new AceBinding(ydoc.getText('ace'), editor, yProvider.awareness, {
      yUndoManager,
    });

    yProvider.on('synced', (event) => {
      console.log('Yjs content was synced with the WebSocket server');
      const contentLength = Number(getAceEditor()?.getSession()?.getLength());
      if (!Number.isNaN(contentLength) && contentLength < 10) {
        loadFileFromURLParam().then((f) => {
          console.log(
            `Editor content was nearly empty. Fetched and initialized editor from repository with: ${f}`
          );
        });
      }
    });

    yProvider.awareness.on('change', stateChangeHandler);
    yProvider.awareness.on('update', awaranessUpdateHandler);

    setUserAwarenessData( {name: user, course, id} );
  }

  window.example = { yProvider, ydoc, type: ydoc.getText('ace') };
  window.awareness = yProvider.awareness;
  window.yUndoManager = yUndoManager;
  window.binding = binding;
  window.Y = Y;
  window.permanentUserData = permanentUserData;

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
    userData.name = user.name;
    userData.course = user.course;
    userData.id = user.id
  }
  yProvider.awareness.setLocalStateField('user', userData);
}
