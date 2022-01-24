import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { setState, state } from '../state/comments.js';
import { layoutService } from '../state/layoutStateMachine.js';
import { yProvider } from '../yjs-setup.js';
import { updateHandler } from './collab-extension.js';
import { hexToRgbA, MULTI_SELECT_ALPHA, getCoordinatesWithOffset, calculateMultiSelectCoordsWithOffset, isOverlapping } from './util-collab.js';

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
                return c.highlight == null && typeof c?.multiSelectElements == 'string'
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


export let renderComments = (comments, overlaps = []) => {
  let container = document.querySelector('#comments-container');

  if (container) {
    layoutService.send('SHOW_COMMENTS_HIDE_TEXT');

    let commentsWithReplies = [];
    for (let c of comments) {
      if (!c?.parentCommentId ) {
        commentsWithReplies.push({ ...c, children: [] });
        continue;
      }

      let parent = commentsWithReplies.find(p => p.id == c.parentCommentId);
      if (!parent) continue;
      parent.children = [ ...parent.children, c ];
    }

    let width = container.offsetWidth;
    console.log('commentsWithReplies', commentsWithReplies);

    
    
    render(
      html`${commentsWithReplies.map(p => commentReplyContainerTemplate(p, width))}`,
      container
      );
    
    let commentElements = Array.from(document.querySelectorAll('.comment-with-replies'));
    let overlappingElements = [];
    for (let i = 0; i < commentElements.length; i++) {
      for (let j = i + 1; j < commentElements.length; j++) {
        let box1 = commentElements[i].getBoundingClientRect();
        let box2 = commentElements[j].getBoundingClientRect();
        
        // Calculations problematic in some browsers (way more "sensitive" on MS Edge)
        if (box2.y > box1.y && box2.y < box1.y + box1.height
          || box1.y > box2.y && box1.y < box2.y + box2.height) {
          // console.log('Overlapping elements', commentElements[i], commentElements[j]);
          let id1 = +commentElements[i].id.match(/(\d+)/)[0];
          let id2 = +commentElements[j].id.match(/(\d+)/)[0];

          let hasId1 = overlappingElements.find(arr => arr.includes(id1));
          let hasId2 = overlappingElements.find(arr => arr.includes(id2));
          
          if (hasId1) {
            // hasId1 = [...new Set([...hasId1, id2])]
            hasId1.push(id2);
          }
          else if (hasId2) {
            // hasId2 = [...new Set([...hasId2, id1])]
            hasId2.push(id1);
          } else {
            overlappingElements.push([ id1, id2 ]);
          }
        }
      }
    }
    // console.log(overlappingElements);

    if (overlappingElements.length > 0) {
      // renderComments(state.comments, overlappingElements.map(arr => [...new Set(arr)]));
      let overlaps = overlappingElements.map(arr => [...new Set(arr)]);
      let test = [];
      if (overlaps.length > 0) {
        overlaps.forEach(arr => {
          let groupById = commentsWithReplies.filter(cwr => arr.includes(cwr.id));
          console.log({a: groupById})

          for (let i = 1; i < groupById.length; i++) {
            let curr = groupById[i];
            let prev = groupById[i - 1];

            curr.highlight = { ...curr.highlight, top: prev.highlight.top + prev.highlight.height };
          }
          test.push(groupById);
        })
      }

      console.log('overlapping comments', test)
    }
  }
}

// Used to hold parent comments, their replies and a form to add a new reply
let commentReplyContainerTemplate = (parent, parentElemWidth) => {
  let collapseId = `reply-collapse-${parent.id}`;
  const handleClick = () => {
    $(`.collapse.reply-form-container:not(#${collapseId})`).collapse('hide');
    $(`#${collapseId}`).collapse('show');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    let content = new FormData(event.target).get('content');
    console.log({ content })
    let { docId: documentId } = getURLParams(['docId']);
    
    await commentService.create({
      data: {
        content,
        parentCommentId: parent.id,
        documentId,
        clientId: yProvider.awareness.clientID,
      },
      onSuccess: (createdComment) => {
        console.log('Added comment reply', createdComment);

        setState({
          comments: state.comments.concat(createdComment),
        });
        
        console.log('Comments after adding comment reply', state.comments);
        $(`#${collapseId}`).collapse('hide');
    
        renderComments(state.comments);
      }
    })
  }

  const handleCancel = () => $(`#${collapseId}`).collapse('hide');

  return html`
    <div id=${'comment-with-replies-' + parent.id} aria-expanded="false" aria-controls=${collapseId} style="width: 18rem; top: ${parent.highlight.top}px; left:${parentElemWidth / 2 - remToPixels(18) / 2}px; position: absolute;" class="card shadow comment-with-replies" @click=${handleClick}>

      <div class="card-body p-0">
        
        ${html`${commentTemplate(parent.id, parent.usersDocuments[0].user.email, parent.content)}`}
        
        ${parent.children.length > 0 ? 
          html`${parent.children
            .map(child => commentTemplate(child.id, child.usersDocuments[0].user.email, child.content, child.parentCommentId))}`
            : null
        }

        <div class="collapse p-2 reply-form-container" id=${collapseId}>
          <form class="reply-form" @submit=${handleSubmit}>
              <div class="form-group">
                <textarea class="form-control" placeholder="Reply" name="content"></textarea>
              </div>
              <div class="form-group m-0">
                <button class="btn btn-primary" type="submit">Reply</button>
                <button class="btn btn-light" type="button" @click=${handleCancel}>Cancel</button>
              </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Include a user profile icon (probably img URL) when we have persistence for users
let commentTemplate = (commentId, username, content, parentId) => {
  let user = yProvider.awareness.getLocalState().user;

  const findById = (highlights, id) => highlights.find(elem => elem.dataset.commentId == id);

  const handleClick = event => {
    // Don't focus on the highlight when we click the delete button
    if (event.target.nodeName == 'BUTTON') return;

    // Highlight the corresponding selection on the music score
    let highlights = Array.from(document.querySelectorAll('.highlight-area'));
    if (highlights.length != 0) {
      let toFocus = parentId ? findById(highlights, parentId) : findById(highlights, commentId);
      if (toFocus) {
        highlights.forEach(h => h.classList.remove('highlight-area-focus'));
        toFocus.classList.add('highlight-area-focus');
      }
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

      // style="width: 18rem; top: ${translateY}px; position: absolute;"
  return html`<div id=${'comment-' + commentId} @click=${handleClick} class="p-2 mb-2 border-bottom" data-parent-id=${parentId}>
    <div>
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