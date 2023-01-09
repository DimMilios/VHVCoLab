import { html } from 'lit-html';
import { hexToRgbA, MULTI_SELECT_ALPHA } from '../collaboration/util-collab.js';
import { commentsButtonTemplate } from './commentsButton';
import { multiSelectCoords } from '../collaboration/templates';

export let multiSelectTemplate = (
  clientId,
  isLocalUser = false,
  selectedNotes,
  color
) => {
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

export let selectAreaTemplate = (
  translateX,
  translateY,
  width,
  height,
  hidden = true
) => html`<div
  id="select-area"
  ?hidden=${hidden}
  style="transform: translate(${translateX}px, ${translateY}px);
    width: ${width}px; height: ${height}px;"
></div>`;
