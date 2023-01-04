import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { commentsObserver } from '../collaboration/collab-extension';
import { selectAreaButtonTemplate } from './commentsButton';

// Contains highlighted multi-selected areas referring to comments

export let highlightLayerTemplate = (height, ...children) => {
  return html`<div id="highlight-container" style="height: ${height}px">
    ${children}
  </div>`;
};

export function highlightTemplate(
  comment,
  { left, top, width, height },
  elementsInFocus = {}
) {
  let inFocus = comment.id in elementsInFocus && elementsInFocus[comment.id];
  const clsMap = {
    'highlight-area-focus': inFocus,
  };

  const highlightButtonHandler = () => {
    // Highlight the corresponding selection on the music score
    let highlights = Array.from(document.querySelectorAll('.highlight-area'));
    if (highlights?.length != 0) {
      highlights
        .filter((h) => h.dataset.commentId != comment.id)
        .forEach((h) => h.classList.remove('highlight-area-focus'));

      let toFocus = highlights.find(
        (elem) => elem.dataset.commentId == comment.id
      );
      if (toFocus) {
        inFocus = toFocus.classList.toggle('highlight-area-focus');
        const focused = inFocus ? { [comment.id]: true } : {};
        commentsObserver(focused);
      }
    }
  };

  return html`
    <div
      class="highlight-area highlight-color ${classMap(clsMap)}"
      style="left: ${left}px; top: ${top}px; width: ${width}px; height:${height}px;"
      data-comment-id=${comment.id}
      tabindex="0"
    ></div>
    ${selectAreaButtonTemplate(
      { top, left, width, height },
      inFocus ? 'arrowRetract' : 'arrowExpand',
      highlightButtonHandler,
      comment.id
    )}
  `;
}
