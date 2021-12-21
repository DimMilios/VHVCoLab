import { html, render } from 'lit-html';
import { getCoordinates, calculateMultiSelectCoords, hexToRgbA, MULTI_SELECT_ALPHA, getCoordinatesWithOffset, calculateMultiSelectCoordsWithOffset } from './util-collab.js';

export let collabTemplate = (svgHeight, ...children) =>
  html`<div class="collab-container" style="height: ${svgHeight}px">${children}</div>`;

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

// If clientId === provider.awareness.clientID
// include the comment button
export let multiSelectTemplate = (clientId, isLocalUser = false, selectedNotes, color) => {
  const selector = selectedNotes.map((id) => '#' + id).join(',');
  // const coords = calculateMultiSelectCoords(
  //   Array.from(document.querySelectorAll(selector))
  // );
  let output = document.querySelector('#output');

  const coords = calculateMultiSelectCoordsWithOffset(
    Array.from(document.querySelectorAll(selector)),
    document.querySelector('#input'),
    output.scrollTop
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

export let selectAreaTemplate = (translateX, translateY, width, height, hidden = true) =>
  html`<div
    id="select-area"
    ?hidden=${hidden}
    style="transform: translate(${translateX}px, ${translateY}px);
    width: ${width}px; height: ${height}px;"
  ></div>`;

let commentFormTemplate = () => {
  const handleCommentPost = event => {
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
    <button type="button" class="btn btn-primary" @click=${handleCommentPost}>Post</button>
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