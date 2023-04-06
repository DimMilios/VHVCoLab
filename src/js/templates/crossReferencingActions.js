import { html } from 'lit-html';
import { multiSelectCoords } from '../collaboration/templates';

export let crossReferenceSingleTemplate = (actionId, userNames, elemRefId, color, actionType) => {
  const el = (actionType == 'add_comment') ?
    document.querySelector(`div.select-area-button[data-comment-id="${elemRefId}"]`) :
    document.getElementById(elemRefId);
  console.log(el);

  if (!el) return html`<div class="cross-reference-single"></div>`;

  const { targetBottom, targetTop, targetX, targetBounds } = getSelectionCoordsWithOffset(
    el,
    document.querySelector('#input')
  );
  return html`<div
    class="cross-reference-single"
    style="transform: translate(${targetX - 5}px, ${targetTop - 5}px);
      width: ${Math.abs(targetBounds.right - targetBounds.left + 10)}px;
      height: ${Math.abs(targetBounds.bottom - targetBounds.top +10)}px;
      background-color: transparent;
      border: medium dashed ${color}
    "
    data-users=${userNames}
    data-ref-id=${elemRefId}
    data-ref-action=${actionId}
  ></div>`;
};

export let crossReferenceMultiTemplate = (actionId, userNames, selectedNotes, color) => {
  const coords = multiSelectCoords(selectedNotes);

  return html`<div
      class="cross-reference-multi"
      style="transform: translate(${coords.left - 5}px, ${coords.top - 5}px);
        width: ${coords.width + 10}px;
        height: ${coords.height + 10}px;
        border: medium dashed ${color};
      "
      data-user-ids=${userNames}
      data-ref-action=${actionId}
    ></div>`;  
};

function getSelectionCoordsWithOffset(target, offsetElem) {
  const targetBounds = target.getBoundingClientRect();
  const scrollTop = window.scrollY;

  return {
    targetTop: targetBounds.top - offsetElem.offsetTop + scrollTop,
    targetX: targetBounds.x - offsetElem.offsetWidth,
    targetBounds,
  };
}
