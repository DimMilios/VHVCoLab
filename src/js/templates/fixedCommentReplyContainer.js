import { html } from 'lit-html';
import { COMMENTS_VISIBLE } from '../bootstrap';
import { yProvider } from '../yjs-setup';
import { commentsObserver } from '../collaboration/collab-extension';
import { timeSince } from '../collaboration/util-collab';
import { CommentService } from '../api/CommentService';

export const fixedCommentReplyContainerTemplate = (commentsList) => {
  if (commentsList?.length == 0) {
    return null;
  }

  return html` <div
    id="comment-reply-container"
    class="comment-group-container new-comment-reply-container"
    ?hidden=${!COMMENTS_VISIBLE}
  >
    ${commentsList.map((comment) => {
      return singleComment(comment);
    })}
    ${commentsList?.length > 0 ? replyForm(commentsList) : null}
  </div>`;
};

const singleComment = (comment) => {
  const handleDelete = () => {
    const service = new CommentService();

    document
      .querySelector(`#comment-${comment.id}`)
      ?.classList.add('deleted-single-comment');
    setTimeout(() => {
      service.deleteCommentGroupById(comment);
      if (comment.parentCommentId) {
        commentsObserver({ [comment.parentCommentId]: true });
      }
    }, 200);
  };

  const { user } = yProvider.awareness.getLocalState();
  const deleteButton = () =>
    user.name === comment.author.name
      ? html`<div>
          <button type="button" class="btn btn-danger" @click=${handleDelete}>
            X
          </button>
        </div>`
      : null;

  let time = timeSince(new Date(comment.createdAt));

  return html`<div
    id=${'comment-' + comment.id}
    class="comment w-100 p-2 mb-2 border-bottom new-single-comment"
  >
    <div class="d-inline-flex justify-content-between w-100 mb-3">
      <div class="d-flex justify-content-between w-100">
        <div class="d-inline-flex flex-column ml-2">
          <h5 class="m-0">${comment.author.name}</h5>
          <small class="text-muted font-italic"
            >${time.charAt(0) === '0' ? 'Now' : time + ' ago'}</small
          >
        </div>
        ${deleteButton()}
      </div>
    </div>
    <p class="card-text px-2 mb-1">${comment.content}</p>
  </div>`;
};

const replyForm = (commentsList) => {
  const handleReplySubmit = (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));

    const inputElem = event.target['comment-reply'];

    const parentComment = commentsList.slice(0)[0];
    let { user } = yProvider.awareness.getLocalState();

    const service = new CommentService();
    service.addComment({
      content: formData['comment-reply'],
      createdAt: new Date(),
      parentCommentId: parentComment.id,
      multiSelectElements: parentComment.multiSelectElements,
      documentId: parentComment.documentId,
      clientId: parentComment.clientId,
      author: user,
    });

    inputElem.value = '';

    // Scroll to the bottom of the comment container
    document.getElementById('comment-reply-form')?.scrollIntoView();

    // Restore focus to comment highlight
    commentsObserver({ [parentComment.id]: true });
  };

  return html`
    <div>
      <form
        id="comment-reply-form"
        @submit=${handleReplySubmit}
        class="form-inline"
      >
        <div class="form-group">
          <input
            class="form-control"
            type="text"
            id="comment-reply"
            name="comment-reply"
          />
        </div>

        <button class="btn btn-primary ml-2">Reply</button>
      </form>
    </div>
  `;
};
