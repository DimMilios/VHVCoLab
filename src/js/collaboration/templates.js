import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { setState, state } from '../state/comments.js';
import { layoutService } from '../state/layoutStateMachine.js';
import { yProvider } from '../yjs-setup.js';
import { updateHandler } from './collab-extension.js';
import { hexToRgbA, MULTI_SELECT_ALPHA, getCoordinatesWithOffset, calculateMultiSelectCoordsWithOffset } from './util-collab.js';

import * as commentService from '../api/comments.js';
import userProfileImgUrl from '../../../images/user-profile.png';
import { getURLParams } from '../api/util.js';

export let uiCoords = {
  outputSVGHeight: 10,

  /**
   * @param {number|string} value
   */
  set svgHeight(value) {
    this.outputSVGHeight = typeof value == 'string' ? parseInt(value, 10) : value;
    render(commentSectionTemplate(this.outputSVGHeight), document.querySelector('.output-container'));
  },

  /**
   * @returns {number}
   */
  get svgHeight() {
    return this.outputSVGHeight;
  }
};

export let collabTemplate = (svgHeight, ...children) => {
  return html`<div id="collab-container" style="height: ${svgHeight}px">${children}</div>`;
}

export let userAwarenessTemplate = (clientId, elemRefId, name) => {
  let el = document.getElementById(elemRefId);
  if (!el)
    return html`<div class="users-div"></div>`;

  const { targetX, targetY } = getCoordinatesWithOffset(el, document.querySelector('#input'));
  return html`<div
    class="users-div"
    style="transform: translate(${targetX}px, ${targetY - 25}px)"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  >${name}</div>`;
};

export let singleSelectTemplate = (clientId, elemRefId, color) => {
  let el = document.getElementById(elemRefId);
  if (!el)
    return html`<div class="single-select"></div>`;

  const { staffY, targetX, targetY, targetBounds } = 
    getCoordinatesWithOffset(el, document.querySelector('#input'));

  return html`<div
    class="single-select"
    style="transform: translate(${targetX}px, ${targetY}px);
    width: ${Math.abs(targetBounds.x - targetBounds.right)}px;
    height: ${Math.abs(staffY - targetBounds.bottom)}px;
    background-color: ${color}"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  ></div>`;
};

export const multiSelectCoords = (selectedNotes) => {
  const selector = selectedNotes.map((id) => '#' + id).join(',');
  let output = document.querySelector('#output');

  return calculateMultiSelectCoordsWithOffset(
    Array.from(document.querySelectorAll(selector)),
    document.querySelector('#input'),
    output.closest('[class*=output-container]').scrollTop
  );
}

export let multiSelectTemplate = (clientId, isLocalUser = false, selectedNotes, color) => {
  const coords = multiSelectCoords(selectedNotes);

  return html`<div
    class="multi-select-area"
    style="transform: translate(${coords.left}px, ${coords.top}px); width: ${coords.width}px; height:${coords.height}px; background-color: ${hexToRgbA(
    color,
    MULTI_SELECT_ALPHA
  ) ?? 'rgba(0, 0, 255, 0.09)'};"
    data-client-id=${clientId}
  ></div>
  ${isLocalUser ? commentsButtonTemplate(coords, coords.top) : null}`;
};

export let selectAreaTemplate = (translateX, translateY, width, height, hidden = true) =>
  html`<div
    id="select-area"
    ?hidden=${hidden}
    style="transform: translate(${translateX}px, ${translateY}px);
    width: ${width}px; height: ${height}px;"
  ></div>`;

let commentSectionTemplate = (height) => {
  return html`
    <div
      id="comments-section"
      class="col-0 h-100"
      style="min-height: 95vh; max-height: 95vh; position: relative;"
    >
      <div
        id="comments-container"
        style="height: ${height}px; background-color: rgba(216, 215, 215, 0.8);"
      ></div>
    </div>
  `;
}

let commentFormTemplate = (translateY) => {
  const handleCommentPost = async event => {
    event.preventDefault();

    let content = event.target.querySelector('input[name="comment-text"]');
    console.log('You sent:', content.value);

    let { docId: documentId } = getURLParams(['docId']);
    
    let notes = yProvider.awareness.getLocalState()?.multiSelect;
    if (Array.isArray(notes) && notes.length > 0) {
      let coords = multiSelectCoords(notes);
      
      await commentService.create({
        data: {
          "content": content.value,
          "parentCommentId": null,
          "documentId": documentId ? Number(documentId) : 1,
          "clientId": yProvider.awareness.clientID,
          "multiSelectElements": notes.join(',')
        },
        onSuccess: (createdComment) => {
          console.log('Added comment', createdComment);
          createdComment.highlight = Object.assign({}, coords);

          setState({
            comments: state.comments
              .map((c) => {
                return c.highlight == null
                  ? {
                      ...c,
                      highlight: Object.assign(
                        {},
                        multiSelectCoords(c.multiSelectElements.split(','))
                      ),
                    }
                  : c;
              })
              .concat(createdComment),
          });
          
          console.log('Comments after calculating coords', state.comments);
      
          renderComments(state.comments);
        }
      })
    }
    
    yProvider.awareness.setLocalStateField('multiSelect', null);
    content.value = '';
    $('#post-comment').modal('hide');
  }

  return html` <div class="modal-body">
    <form id="post-comment-form" @submit=${handleCommentPost}>
      <div class="form-group">
        <label for="comment-text" class="col-form-label">Comment:</label>
        <input type="text" class="form-control" id="comment-text" name="comment-text" />
      </div>
      <div class="form-group float-right">
        <button type="button" class="btn btn-secondary" role="button" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary" role="button">Post</button>
      </div>
    </form>
  </div>`;
}

export let renderComments = (comments) => {
  let container = document.querySelector('#comments-container');

  if (container) {
    layoutService.send('SHOW_COMMENTS');

    render(
      html`${comments.map((c) => {
        let coords = multiSelectCoords(c.multiSelectElements.split(','));
        return commentTemplate(c.id, c.usersDocuments[0].user.email, c.content, coords.top)
      }
      )}`,
      container
    );
  }
}

let commentsButtonTemplate = (coords, translateY) => {
  let commentWidth = 2.5;
  let commentHeight = 2.5;

  const clickHandler = () => {
    render(commentFormTemplate(translateY), document.querySelector('#post-comment .modal-content'));
  }

  return html`<div
    style="transform: translate(${coords.left +
    coords.width -
    remToPixels(commentWidth)}px, ${coords.top -
    remToPixels(commentHeight)}px);
  width: ${commentWidth}rem; height: ${commentHeight}rem; cursor: pointer; position: absolute; pointer-events: all;"
    class="comment"
  >
  <button class="btn btn-outline-dark p-0" style="width: 100%; cursor: pointer;" data-toggle="modal" data-target="#post-comment" @click=${clickHandler}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-card-text btn-outline-dark" viewBox="0 0 16 16">
        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
        <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
      </svg>
    </button>
  </div>`;
}

function remToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// Include a user profile icon (probably img URL) when we have persistence for users
let commentTemplate = (commentId, username, content, translateY) => {
  let user = yProvider.awareness.getLocalState().user;

  const handleFocusHighlight = event => {
    // Don't focus on the highlight when we click the delete button
    if (event.target.nodeName == 'BUTTON') return;

    let highlights = Array.from(document.querySelectorAll('.highlight-area'));
    if (highlights.length != 0) {
      let focused = highlights.find(elem => elem.dataset.commentId == commentId);
      focused?.focus();
    }
  }

  let { docId: documentId } = getURLParams(['docId']);

  const handleDelete = async () => {
    await commentService.removeById(commentId, {
      data: { userId: user.id, documentId, clientId: yProvider.awareness.clientID },
      onSuccess: () => {
        console.log('Deleted comment with id: ', commentId);
        setState({
          comments: state.comments.filter(c => c.id != commentId)
        });
        renderComments(state.comments);
        updateHandler();
      }
    });
  }

  const deleteButton = () =>
    username === user.email
      ? html`<button class="btn btn-danger" @click=${handleDelete}>X</button>`
      : null;

  return html`<div id=${'comment-' + commentId} class="card ml-4 shadow comment" style="width: 18rem; top: ${translateY}px; position: absolute;" @click=${handleFocusHighlight}>
    <div class="p-3">
      ${deleteButton()}
      <div class="d-inline-flex justify-content-center">
        <div class="rounded-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"class="bi bi-person mr-auto" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
          </svg>
        </div>
        <h5 class="card-title ml-2 align-self-center">
          ${username}
        </h5>
      </div>
      <p class="card-text">${content}</p>
    </div>
  </div>`;
}

// Contains highlighted multi-selected areas referring to comments
export let highlightLayerTemplate = (height, ...children) => {
  return html`<div id="highlight-container" style="height: ${height}px">${children}</div>`;
}

export let highlightListTemplate = (clientId, state) => {
  return html`${state.map((h) => highlightTemplate(clientId, h))}`;
};

export let highlightTemplate = (commentId, state) => html`<div
  class="highlight-area highlight-color"
  style="left: ${state.left}px; top: ${state.top}px; width: ${state.width}px; height:${state.height}px;"
  data-comment-id=${commentId}
  tabindex="0"
></div>`;

export let userListTemplate = (users) => {
  // console.log('user profile image path', { userProfileImgUrl })
  return html`
    <ul class="users-online m-0 p-0 d-flex justify-content-between">
      ${users.map(user => onlineUserTemplate(userProfileImgUrl, user))}
    </ul>`;
}

let onlineUserTemplate = (url, user) => {
  let classes = { 'online-status': user.online, 'offline-status': !user.online };
  return html`<li class="">
    <span class="position-relative d-inline-flex">
      <div style="background-color: white; border-radius: 50%;">
        <img src=${url} alt="user profile icon" width="40" height="40" />
      </div>
      <span class=${classMap(classes)}></span>
    </span>
  </li>`;
}

export function userListDisplay(users) {
  if (!users || !Array.isArray(users)) return;
  let userList = document.querySelector('.user-list');
  const output = document.querySelector('#output');

  if (!userList) {
    userList = document.createElement('div');
    userList.classList.add('user-list');
    document.body.appendChild(userList);
  }

  userList.addEventListener('mouseenter', (e) => {
    e.target.innerHTML = `${users.join(',\n')}`;
    if (
      output.hasAttribute('style') &&
      !output.getAttribute('style').includes('transition')
    ) {
      // output.style.transition = 'opacity 0.4s ease-out';
    }
    // output.style.opacity = 0.1;
  });

  userList.addEventListener('mouseout', (e) => {
    e.target.innerHTML = userIcon + users.length + ' users';
    output.style.opacity = 1;
  });

  let userIcon = '👤 ';
  let userText = ' user';
  if (users.length > 1) {
    userIcon = '👥 ';
    userText = ' users';
  }
  userList.innerHTML = userIcon + users.length + userText;

  const menubar = document.getElementById('menubar');
  if (menubar) {
    const menuBox = menubar.getBoundingClientRect();
    userList.style.transform = `translate(${
      menuBox.right - userList.getBoundingClientRect().width * 1.1
    }px, ${menuBox.top * 3}px)`;
  }
}