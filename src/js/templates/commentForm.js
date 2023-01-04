import { html } from 'lit-html';
import { setState, state } from '../state/comments.js';
import { getCommentsList, yProvider } from '../yjs-setup.js';
import * as commentService from '../api/comments.js';
import { getURLParams } from '../api/util.js';
import { Comment } from '../collaboration/Comment.js';
import { multiSelectCoords } from '../collaboration/templates';
import { commentsObserver } from '../collaboration/collab-extension.js';

export const handleCommentPost = async (event) => {
  event.preventDefault();

  let content = event.target.querySelector('input[name="comment-text"]');
  console.log('You sent:', content.value);

  let { docId: documentId } = getURLParams(['docId']);

  let localState = yProvider.awareness.getLocalState();
  let notes = localState?.multiSelect;
  if (Array.isArray(notes) && notes.length > 0) {
    let comment = new Comment({
      content: content.value,
      createdAt: new Date(),
      multiSelectElements: notes.join(','),
      documentId,
      clientId: yProvider.awareness.clientID,
      author: localState.user,
    });

    let comments = getCommentsList();
    if (comments) {
      comments.push([comment.toJSON()]);
    }

    commentsObserver({ [comment.id]: true });

    // await commentService.create({
    //   data: {
    //     content: content.value,
    //     parentCommentId: null,
    //     documentId: documentId ? Number(documentId) : 1,
    //     clientId: yProvider.awareness.clientID,
    //     multiSelectElements: notes.join(','),
    //   },
    //   onSuccess: (createdComment) => {
    //     console.log('Added comment', createdComment);
    //     createdComment.highlight = Object.assign({}, coords);

    //     setState({
    //       comments: state.comments
    //         .map((c) => {
    //           return c.highlight == null &&
    //             typeof c?.multiSelectElements == 'string'
    //             ? {
    //                 ...c,
    //                 highlight: Object.assign(
    //                   {},
    //                   multiSelectCoords(c.multiSelectElements.split(','))
    //                 ),
    //               }
    //             : c;
    //         })
    //         .concat(createdComment),
    //     });

    //     console.log('Comments after calculating coords', state.comments);
    //   },
    // });
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
