import { html, render } from 'lit-html';
import { calculateMultiSelectCoordsWithOffset } from './util-collab.js';

import { featureIsEnabled } from '../bootstrap.js';

export let uiCoords = {
  outputSVGHeight: 10,

  /**
   * @param {number|string} value
   */
  set svgHeight(value) {
    this.outputSVGHeight =
      typeof value == 'string' ? parseInt(value, 10) : value;
    render(
      commentSectionTemplate(this.outputSVGHeight),
      document.querySelector('.output-container')
    );
  },

  /**
   * @returns {number}
   */
  get svgHeight() {
    return this.outputSVGHeight;
  },
};

export let collabTemplate = (svgHeight, ...children) => {
  return html`<div id="collab-container" style="height: ${svgHeight}px">
    ${children}
  </div>`;
};

export const multiSelectCoords = (selectedNotes) => {
  // Get the height of Jitsi container
  let heightOffset = 0;
  if (featureIsEnabled('videoConference')) {
    let jitsiContainer = document.getElementById('jitsi-meeting-container');
    if (jitsiContainer) {
      heightOffset += jitsiContainer.getBoundingClientRect().height;
    }
  }

  const selector = selectedNotes?.map((id) => '#' + id).join(',');
  let coords = calculateMultiSelectCoordsWithOffset(
    Array.from(document.querySelectorAll(selector)),
    document.querySelector('#input')
  );

  if (coords?.top) {
    coords.top -= heightOffset;
  }
  return coords;
};

let commentSectionTemplate = (height) => {
  return html`
    <div
      id="comments-section"
      class="col-0 h-100"
      style="min-height: 95vh; max-height: 95vh; position: relative;"
    >
      <div
        id="comments-container"
        style="height: 100vh; background-color: rgba(216, 215, 215, 0.8);"
      ></div>
    </div>
  `;
};

export function remToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
