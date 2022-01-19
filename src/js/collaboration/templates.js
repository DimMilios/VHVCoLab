import { html, render } from 'lit-html';
import { setState, state } from '../state/comments.js';
import { layoutService } from '../state/layoutStateMachine.js';
import { yProvider } from '../yjs-setup.js';
import { getCoordinates, calculateMultiSelectCoords, hexToRgbA, MULTI_SELECT_ALPHA, getCoordinatesWithOffset, calculateMultiSelectCoordsWithOffset } from './util-collab.js';

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

  // const { staffY, targetX } = getCoordinates(el);
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

  // const { staffY, targetX, targetBounds } = getCoordinates(el);
  const { staffY, targetX, targetY, targetBounds } = 
    getCoordinatesWithOffset(el, document.querySelector('#input'));

    // console.log({ staffY}, targetBounds)
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

// If clientId === provider.awareness.clientID
// include the comment button
export let multiSelectTemplate = (clientId, isLocalUser = false, selectedNotes, color) => {
  // const selector = selectedNotes.map((id) => '#' + id).join(',');
  // // const coords = calculateMultiSelectCoords(
  // //   Array.from(document.querySelectorAll(selector))
  // // );
  // let output = document.querySelector('#output');

  // const coords = calculateMultiSelectCoordsWithOffset(
  //   Array.from(document.querySelectorAll(selector)),
  //   document.querySelector('#input'),
  //   output.closest('[class*=output-container]').scrollTop
  // );
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

    let notes = yProvider.awareness.getLocalState()?.multiSelect;
    if (Array.isArray(notes) && notes.length > 0) {
      let coords = multiSelectCoords(notes);

      let params = (new URL(document.location)).searchParams;
      let documentId = params.get('docId');
  
      let response = await fetch('http://localhost:3001/api/comments', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          "content": content.value,
          "parentCommentId": null,
          "documentId": documentId ? Number(documentId) : 1,
          "clientId": yProvider.awareness.clientID,
          "multiSelectElements": notes.join(',')
        }),
        headers: { 'Content-Type': 'application/json' },
      })
        .catch(console.log)
  
        
      if (response.status === 201) {
        let createdComment = await response.json();
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
    }
    
    yProvider.awareness.setLocalStateField('multiSelect', null);
    content.value = '';
    $('#post-comment').modal('hide');
  }
  // const handleCommentPost = event => {
  //   event.preventDefault();

  //   let textBox = event.target.querySelector('input[name="comment-text"]');
  //   console.log('You sent:', textBox.value);

  //   let commentId = `comment-${Math.random().toString(16).substring(2, 8)}`;

  //   let notes = yProvider.awareness.getLocalState()?.multiSelect;
  //   if (Array.isArray(notes) && notes.length > 0) {
  //     let coords = multiSelectCoords(notes);
  //     let oldHighlights = yProvider.awareness.getLocalState()?.highlights ?? [];
  //     yProvider.awareness.setLocalStateField('highlights', oldHighlights.concat({
  //       commentId,
  //       ...coords,
  //     }));
  //     yProvider.awareness.setLocalStateField('multiSelect', null);
  //   }

  //   layoutService.send('SHOW_COMMENTS');

  //   comments.push({ commentId, value: textBox.value, translateY });
  //   localStorage.setItem('comments', JSON.stringify(comments));
    
  //   render(
  //     html`${comments.map((c) =>
  //       commentTemplate(c.commentId, 'Dimitris', c.value, c.translateY)
  //     )}`,
  //     document.querySelector('#comments-container')
  //   );

  //   textBox.value = '';
  //   $('#post-comment').modal('hide');
  // }

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
        return commentTemplate('comment-' + c.id, c.user.email, c.content, coords.top)
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

// A comment should have a reference (commentID) to a highlighted area that was multi selected
// and the user added a comment for

// Include a user profile icon (probably img URL) when we have persistence for users
let commentTemplate = (commentId, user, content, translateY) => {
  return html`<div id=${commentId} class="card ml-4" style="width: 18rem; transform: translateY(${translateY}px); position: absolute;">
    <div class="p-3">
      <div class="d-inline-flex justfy-content-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"class="bi bi-person mr-auto" viewBox="0 0 16 16">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
        </svg>
        <h5 class="card-title ml-2 align-self-end">
          ${user}
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

export let highlightTemplate = (user, commentId, state) => html`<div
  class="highlight-area"
  style="transform: translate(${state.left}px, ${state.top}px); width: ${state.width}px; height:${state.height}px; background-color: rgba(0, 0, 255, 0.09);"
  data-user-name=${user.name}
  data-user-email=${user.email}
  data-comment-id=${commentId}
></div>`;