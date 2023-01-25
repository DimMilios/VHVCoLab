import { html } from 'lit-html';
import { yProvider } from '../yjs-setup.js';
import { getURLParams } from '../api/util.js';
import { commentsObserver } from '../collaboration/collab-extension.js';
import { CommentService } from '../api/CommentService.js';
import { COMMENTS_VISIBLE, toggleCommentsVisibility } from '../bootstrap.js';

export const handleCommentPost = async (event) => {
  event.preventDefault();

  let content = event.target.querySelector('input[name="comment-text"]');
  console.log('You sent:', content.value);

  let { docId: documentId } = getURLParams(['docId']);

  let localState = yProvider.awareness.getLocalState();
  let notes = localState?.multiSelect;
  if (Array.isArray(notes) && notes.length > 0) {
    const service = new CommentService();
    const addedComment = service.addComment({
      content: content.value,
      createdAt: new Date(),
      multiSelectElements: notes.join(','),
      documentId,
      clientId: yProvider.awareness.clientID,
      author: localState.user,
    });

    if (addedComment) {
      if (!COMMENTS_VISIBLE) {
        toggleCommentsVisibility(true);
      }
      commentsObserver({ [addedComment.id]: true });
    }
  }

  yProvider.awareness.setLocalStateField('multiSelect', null);
  content.value = '';
  $('#post-comment').modal('hide');
};

export let commentFormTemplate = (onSubmit) => {
  return html` <div class="modal-body">
    <form id="post-comment-form" @submit=${onSubmit}>
      <div class="form-group">
        <label for="comment-text" class="col-form-label">Comment:</label>
        <input
          type="text"
          class="form-control"
          id="comment-text"
          name="comment-text"
        />
      </div>
      <div class="form-group float-right">
        <button
          type="button"
          class="btn btn-secondary"
          role="button"
          data-dismiss="modal"
        >
          Close
        </button>
        <button type="submit" class="btn btn-primary" role="button">
          Post
        </button>
      </div>
    </form>
  </div>`;
};
