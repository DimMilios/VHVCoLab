import { html } from 'lit-html';

export let crossReferenceSingleTemplate = (clientId, elemRefId, color) => {
  let el = document.getElementById(elemRefId);
  if (!el) return html`<div class="cross-reference-single"></div>`;

  const { staffBottom, targetX, targetBounds } = getStaffCoordinatesWithOffset(
    el,
    document.querySelector('#input')
  );

  return html`<div
    class="cross-reference-single"
    style="transform: translate(${targetX * 0.99}px, ${staffBottom}px);
    width: ${Math.abs(targetBounds.x - targetBounds.right) * 2}px;
    height: 5px;
    background-color: ${color}"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  ></div>`;
};

function getStaffCoordinatesWithOffset(target, offsetElem) {
  const targetBounds = target.getBoundingClientRect();
  const closestStaffElem = target?.closest('.staff');
  const staffBounds = closestStaffElem?.getBoundingClientRect();
  const scrollTop = window.scrollY;

  return {
    staffX: staffBounds?.x - offsetElem.offsetWidth,
    staffBottom: staffBounds?.bottom - offsetElem.offsetTop + scrollTop,
    targetX: targetBounds.x - offsetElem.offsetWidth,
    targetBounds,
  };
}
