import { html } from 'lit-html';
import { setState, state } from '../state/comments.js';
import { yProvider } from '../yjs-setup.js';
import { stateChangeHandler } from '../collaboration/collab-extension.js';
import * as commentService from '../api/comments.js';
import { getURLParams } from '../api/util.js';
import { timeSince } from '../collaboration/util-collab.js';

// Include a user profile icon (probably img URL) when we have persistence for users
export let commentTemplate = (commentId, username, content, createdAt, imgUrl, parentId) => {
  let user = yProvider.awareness.getLocalState().user;

  const findById = (highlights, id) => highlights.find(elem => elem.dataset.commentId == id);

  const handleClick = event => {
    // Don't focus on the highlight when we click the delete button
    if (event.target.nodeName == 'BUTTON')
      return;

    // Highlight the corresponding selection on the music score
    let highlights = Array.from(document.querySelectorAll('.highlight-area'));
    if (highlights.length != 0) {
      let toFocus = parentId ? findById(highlights, parentId) : findById(highlights, commentId);
      if (toFocus) {
        highlights.forEach(h => h.classList.remove('highlight-area-focus'));
        toFocus.classList.add('highlight-area-focus');
      }
    }
  };
  let { docId: documentId } = getURLParams(['docId']);

  const handleDelete = async () => {
    await commentService.removeById(commentId, {
      data: { userId: user.id, documentId, clientId: yProvider.awareness.clientID },
      onSuccess: () => {
        console.log('Deleted comment with id: ', commentId);
        setState({
          comments: state.comments.filter(c => c.id != commentId)
        });
        stateChangeHandler();
      }
    });
  };

  const deleteButton = () => username === user.email
    ? html`<button type="button" class="btn btn-danger" @click=${handleDelete}>X</button>`
    : null;

  let time = timeSince(new Date(createdAt));

  return html`<div id=${'comment-' + commentId} @click=${handleClick} class="p-2 mb-2 border-bottom" data-parent-id=${parentId}>
    <div>
      <div class="d-inline-flex justify-content-between w-100 mb-3">
        <div class="d-flex">
          <div style="background-color: white; border-radius: 50%;">
            <img src=${imgUrl} alt="user profile icon" width="24" height="24" />
          </div>
          <div class="d-inline-flex flex-column ml-2">
            <h5 class="m-0">${username}</h5>
            <small class="text-muted font-italic">${time.charAt(0) === '0' ? 'Now' : time + ' ago'}</small>
          </div>
        </div>
        <div>${deleteButton()}</div>
      </div>
      <p class="card-text">${content}</p>
    </div>
  </div>`;
};
