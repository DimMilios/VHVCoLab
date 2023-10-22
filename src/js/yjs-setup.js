import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  awaranessUpdateHandler,
  commentsObserver,
  stateChangeHandler,
} from './collaboration/collab-extension.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';

import {
  baseUrl,
  wsBaseUrl,
  fetchRoom,
  getURLInfo,
  getURLParams,
} from './api/util.js';
import { loadFileFromURLParam } from './vhv-scripts/file-operations.js';
import { notify } from './collaboration/util-collab.js';

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

    const map = ydoc.getMap('actions');
    map.observe(event => {
      for (let [key, change] of event.changes.keys) {
        const btns = document.querySelector(`.action-buttons-${key}`);
        if (btns) {
          // Get previous undo/redo state for this action if it exists
          const undoActive = map.get(key)?.undoActive;

          // Update undo/redo buttons
          const undoBtn = btns.querySelector(".undo-btn");
          const redoBtn = btns.querySelector(".redo-btn");
          if (undoBtn?.disabled === undoActive) {
            undoBtn.disabled = !undoActive;
            redoBtn.disabled = undoActive;
          }

          const actionHeader = btns.closest(".action-entry-header");
          if (undoBtn?.disabled) {
            if (!actionHeader?.querySelector(".status-undo")) {
              const span = document.createElement('span');
              span.classList.add('status-undo', 'text-danger');
              span.textContent = "Action is not active";
              actionHeader.prepend(span);
            }
          } else {
            actionHeader?.querySelector(".status-undo")?.remove();
          }
        }
      }
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
      params: { username: user, file: filename, course: course ?? null, pathname: window.location.pathname },
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
        })
          .catch(() => {
            notify("Could not load file because your session to the MusiCoLab repository has expired. Please log in first!", "danger");
          });
      }
    });

    yProvider.awareness.on('change', stateChangeHandler);
    yProvider.awareness.on('update', awaranessUpdateHandler);

    yProvider.awareness.setLocalStateField('user', { name: user, course, id, color: userData.color, filename });
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

/**
 * Contains metadata such as previous/next value, undo/redo for actions that populate action history panel.
 * 
 * @returns {Y.Map<Object>}
 */
export function getActionsMap() {
  return ydoc.getMap('actions');
}

if (import.meta.env.DEV) {
  window.debugActionMap = () => {
    console.table(getActionsMap().toJSON()); 
  }
}