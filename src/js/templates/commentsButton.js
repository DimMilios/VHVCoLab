import { html, render } from 'lit-html';
import { commentFormTemplate, handleCommentPost } from './commentForm';
import { remToPixels } from '../collaboration/templates';

const svgButtonDict = {
  comment: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    id="comment-create-svg"
    width="28"
    height="28"
    fill="currentColor"
    class="bi bi-card-text"
    viewBox="0 0 16 16"
  >
    <path
      d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"
    />
    <path
      d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"
    />
  </svg>`,
  arrowExpand: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    class="bi bi-arrows-angle-expand"
    viewBox="0 0 16 16"
  >
    <path
      fill-rule="evenodd"
      d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"
    />
  </svg>`,
  arrowRetract: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="currentColor"
    class="bi bi-arrows-angle-contract"
    viewBox="0 0 16 16"
  >
    <path
      fill-rule="evenodd"
      d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"
    />
  </svg>`,
};

const svgButton = (name) => {
  return name in svgButtonDict ? svgButtonDict[name] : null;
};

export const commentButtonHandler = () => {
  render(
    commentFormTemplate(handleCommentPost),
    document.querySelector('#post-comment .modal-content')
  );
};

// export const highlightButtonHandler = (e) => {
//   console.log({ highlightButtonEvent: e });
//   const highlightArea = e.target.closest(
//     '.select-area-button'
//   )?.previousElementSibling;
//   if (highlightArea) {
//     console.log('Clicked on highlight button');
//     highlightArea.classList.add('highlight-area-focus');
//     console.log(highlightArea.classList);
//   }

//   // render(
//   //   commentFormTemplate(handleCommentPost),
//   //   document.querySelector('#post-comment .modal-content')
//   // );
// };

export const selectAreaButtonTemplate = (
  coords,
  svgIconName,
  clickHandler,
  commentId = null
) => {
  let commentWidth = 2.5;
  let commentHeight = 2.5;

  return html`<div
    style="transform: translate(${coords.left +
    coords.width -
    remToPixels(commentWidth)}px, ${coords.top - remToPixels(commentHeight)}px);
  width: ${commentWidth}rem; height: ${commentHeight}rem; cursor: pointer; position: absolute; pointer-events: all;"
    class="p-2 select-area-button"
    data-toggle="${svgIconName === 'comment' ? 'modal' : ''}"
    data-target="${svgIconName === 'comment' ? '#post-comment' : ''}"
    data-comment-id="${commentId != null ? commentId : ''}"
    @click=${clickHandler}
  >
    ${svgButton(svgIconName)}
  </div>`;
};
