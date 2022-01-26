import { html } from 'lit-html';

// Contains highlighted multi-selected areas referring to comments

export let highlightLayerTemplate = (height, ...children) => {
  return html`<div id="highlight-container" style="height: ${height}px">${children}</div>`;
};


export let highlightTemplate = (commentId, state) => html`<div
  class="highlight-area highlight-color"
  style="left: ${state.left}px; top: ${state.top}px; width: ${state.width}px; height:${state.height}px;"
  data-comment-id=${commentId}
  tabindex="0"
></div>`;
