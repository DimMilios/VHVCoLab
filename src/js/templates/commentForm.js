import { html } from 'lit-html';
import { setState, state } from '../state/comments.js';
import { yProvider } from '../yjs-setup.js';
import * as commentService from '../api/comments.js';
import { getURLParams } from '../api/util.js';
import { multiSelectCoords, renderComments } from '../collaboration/templates';

export const handleCommentPost = async (event) => {
  event.preventDefault();

  let content = event.target.querySelector('input[name="comment-text"]');
  console.log('You sent:', content.value);

  let { docId: documentId } = getURLParams(['docId']);

  let notes = yProvider.awareness.getLocalState()?.multiSelect;
  if (Array.isArray(notes) && notes.length > 0) {
    let coords = multiSelectCoords(notes);

    await commentService.create({
      data: {
        "content": content.value,
        "parentCommentId": null,
        "documentId": documentId ? Number(documentId) : 1,
        "clientId": yProvider.awareness.clientID,
        "multiSelectElements": notes.join(',')
      },
      onSuccess: (createdComment) => {
        console.log('Added comment', createdComment);
        createdComment.highlight = Object.assign({}, coords);

        setState({
          comments: state.comments
            .map((c) => {
              return c.highlight == null && typeof c?.multiSelectElements == 'string'
                ? {
                  ...c,
                  highlight: Object.assign(
                    {},
                    multiSelectCoords(c.multiSelectElements.split(','))
                  ),
                }
                : c;
            })
            .concat(createdComment),
        });

        console.log('Comments after calculating coords', state.comments);

        renderComments(state.comments);
      }
    });
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
        <input type="text" class="form-control" id="comment-text" name="comment-text" />
      </div>
      <div class="form-group float-right">
        <button type="button" class="btn btn-secondary" role="button" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary" role="button">Post</button>
      </div>
    </form>
  </div>`;
};
