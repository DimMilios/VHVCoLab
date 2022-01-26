import { html } from 'lit-html';
import { getCoordinatesWithOffset } from '../collaboration/util-collab.js';


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

  const { staffY, targetX, targetY, targetBounds } = getCoordinatesWithOffset(el, document.querySelector('#input'));

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
