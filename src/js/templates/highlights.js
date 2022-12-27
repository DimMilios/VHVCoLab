import { element } from 'lib0/dom';
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { commentsObserver } from '../collaboration/collab-extension';
import { COMMENTS_VISIBLE } from '../vhv-scripts/global-variables';
import { selectAreaButtonTemplate } from './commentsButton';

// Contains highlighted multi-selected areas referring to comments

export let highlightLayerTemplate = (height, ...children) => {
  return html`<div id="highlight-container" style="height: ${height}px">
    ${children}
  </div>`;
};

let focused = false;

export function highlightTemplate(
  { id, left, top, width, height },
  inFocus = false
) {
  const coords = { top, left, width, height };
  const clsMap = {
    'highlight-area-focus': inFocus,
  };

  const highlightButtonHandler = () => {
    // focused = !focused;
    // Highlight the corresponding selection on the music score
    let highlights = Array.from(document.querySelectorAll('.highlight-area'));
    if (highlights.length != 0) {
      const elementsInFocus = {};
      let toFocus = highlights.find((elem) => elem.dataset.commentId == id);
      if (toFocus) {
        elementsInFocus[id] = true;
        // highlights.forEach((h) => h.classList.remove('highlight-area-focus'));
        // toFocus.classList.toggle('highlight-area-focus');
        console.log({ toFocus, inFocus, elementsInFocus });
        // commentsObserver(elementsInFocus);
      }
    }
  };

  // class="highlight-area highlight-color ${classMap(clsMap)}"

  return html`
    <div
      class="highlight-area highlight-color ${classMap(clsMap)}"
      style="left: ${left}px; top: ${top}px; width: ${width}px; height:${height}px;"
      data-comment-id=${id}
      tabindex="0"
    ></div>
    ${selectAreaButtonTemplate(
      coords,
      inFocus ? 'arrowRetract' : 'arrowExpand',
      highlightButtonHandler,
      id
    )}
  `;
}

// export let highlightTemplate = (commentId, state) => html`<div
//   class="highlight-area highlight-color"
//   style="left: ${state.left}px; top: ${state.top}px; width: ${state.width}px; height:${state.height}px;"
//   data-comment-id=${commentId}
//   tabindex="0"
// ></div>`;
