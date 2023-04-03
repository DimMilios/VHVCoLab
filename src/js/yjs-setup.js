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

import { baseUrl, wsBaseUrl, fetchRoom, getURLInfo, getURLParams } from './api/util.js';
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

function setUserImageUrl () {
  const {id} = getURLParams();
  //TODO: replace baseUrl in base.
  //baseUrl cannot be accessed before initialization. pws fortwnontai ta js? stin html de deixnei.
  const base = "https://musicolab.hmu.gr";
  const path = id? 
    `moodle/user/pix.php/${id}/f1.jpg`:
    'apprepository/vhvWs/defaultUser.svg'
  return new URL(path, base).toString();
}

const oneOf = (array) => array[Math.floor(Math.random() * array.length)];
let name = oneOf(names);
let userData = {
  name,
  color: oneOf(colors),
  image: setUserImageUrl(),
  id: getURLParams().id
 };
 console.log(userData)

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

    let searchParams = new URLSearchParams(file);
    let room = file ?? 'test-room';
    if (searchParams.has('f')) {
      room = searchParams.get('f');
    }
    // let roomData;
    /*
  if (file && user) {
    roomData = await fetchRoom(file, user);
    room = roomData?.room ?? room;
  }
  */
    permanentUserData = new Y.PermanentUserData(ydoc);
    permanentUserData.setUserMapping(ydoc, ydoc.clientID, user);

    yProvider = new WebsocketProvider(wsBaseUrl, room, ydoc, {
	    params: { username: user, file: room, course: course ?? null },
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

    setUserAwarenessData(user, course);
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

function setUserAwarenessData(user, course) {
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
    userData.course = course;
  }
  yProvider.awareness.setLocalStateField('user', userData);
}
