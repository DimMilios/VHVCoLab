import { html } from 'lit-html';
import { COMMENTS_VISIBLE } from '../vhv-scripts/global-variables';

export const fixedCommentReplyContainerTemplate = (commentsList) => html`<div
  id="comment-reply-container"
  class="comment-group-container"
  ?hidden=${!COMMENTS_VISIBLE}
>
  ${commentsList.map((comment) => {
    return singleComment(comment);
  })}
</div>`;

const singleComment = (comment) => {
  return html`<div
    id=${'comment-' + comment.id}
    class="comment w-100 p-2 mb-2 border-bottom"
  >
    <div>
      <div class="d-inline-flex justify-content-between w-100 mb-3">
        <div class="d-flex">
          <div class="d-inline-flex flex-column ml-2">
            <h5 class="m-0">${comment.author.name}</h5>
          </div>
        </div>
      </div>
      <p class="card-text">${comment.content}</p>
    </div>
  </div>`;
};
