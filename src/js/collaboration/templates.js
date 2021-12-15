import { html } from 'lit-html';
import { getCoordinates, calculateMultiSelectCoords, hexToRgbA, MULTI_SELECT_ALPHA } from './util-collab.js';

export let collabTemplate = (...children) => html`<div class="collab-container">${children}</div>`;

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

export let multiSelectTemplate = (clientId, selectedNotes, color) => {
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
  ></div>`;
};
