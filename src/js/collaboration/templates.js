import { html, render } from 'lit-html';
import { getCoordinates, calculateMultiSelectCoords, hexToRgbA, MULTI_SELECT_ALPHA } from './util-collab.js';

export let collabTemplate = (...children) =>
  html`<div class="collab-container">${children}</div>`;

export let userAwarenessTemplate = (clientId, elemRefId, name) => {
  let el = document.getElementById(elemRefId);
  if (!el)
    return html`<div class="users-div"></div>`;

  const { staffY, targetX } = getCoordinates(el);
  return html`<div
    class="users-div"
    style="transform: translate(${targetX}px, ${staffY - 25}px)"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  >${name}</div>`;
};

export let singleSelectTemplate = (clientId, elemRefId, color) => {
  let el = document.getElementById(elemRefId);
  if (!el)
    return html`<div class="single-select"></div>`;

  const { staffY, targetX, targetBounds } = getCoordinates(el);
  return html`<div
    class="single-select"
    style="transform: translate(${targetX}px, ${staffY}px); width: ${Math.abs(
    targetX - targetBounds.right
  )}px; height: ${Math.abs(staffY - targetBounds.bottom)}px; background-color: ${color}"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  ></div>`;
};

// If clientId === provider.awareness.clientID
// include the comment button
export let multiSelectTemplate = (clientId, isLocalUser = false, selectedNotes, color) => {
  const selector = selectedNotes.map((id) => '#' + id).join(',');
  const coords = calculateMultiSelectCoords(
    Array.from(document.querySelectorAll(selector))
  );

  return html`<div
    class="multi-select-area"
    style="transform: translate(${coords.left}px, ${coords.top}px); width: ${coords.width}px; height:${coords.height}px; background-color: ${hexToRgbA(
    color,
    MULTI_SELECT_ALPHA
  ) ?? 'rgba(0, 0, 255, 0.09)'};"
    data-client-id=${clientId}
  ></div>
  ${isLocalUser ? commentTemplate(coords) : null}`;
};


let commentFormTemplate = () => {
  const handleSubmit = event => {
    event.preventDefault();
    console.log('You sent:', document.querySelector('#comment-text').value);

    document.querySelector('#comment-text').value = '';
    $('#post-comment').modal('hide');
  }

  return html` <div class="modal-body">
    <form id="post-comment-form">
      <div class="form-group">
        <label for="comment-text" class="col-form-label">Comment:</label>
        <textarea class="form-control" id="comment-text"></textarea>
      </div>
    </form>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary" @click=${handleSubmit}>Post</button>
  </div>`;
}

let commentTemplate = (coords) => {
  let commentWidth = 2.5;
  let commentHeight = 2.5;

  const clickHandler = () => {
    render(commentFormTemplate(), document.querySelector('#post-comment .modal-content'));
  }

  return html`<div
    style="transform: translate(${coords.left +
    coords.width -
    remToPixels(commentWidth)}px, ${coords.top -
    remToPixels(commentHeight)}px);
  width: ${commentWidth}rem; height: ${commentHeight}rem; cursor: pointer; position: fixed;"
    class="comment"
  >
  <button class="btn btn-outline-dark p-0" style="width: 100%;" data-toggle="modal" data-target="#post-comment" @click=${clickHandler}>
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