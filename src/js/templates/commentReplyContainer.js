import { html } from 'lit-html';
import { setState, state } from '../state/comments.js';
import { yProvider } from '../yjs-setup.js';
import * as commentService from '../api/comments.js';
import personImgUrl from '../../../images/person.svg';
import { getURLParams } from '../api/util.js';
import { commentTemplate } from './comment';
import { remToPixels } from '../collaboration/templates';
import { unfocusCommentHighlights } from '../collaboration/util-collab.js';

// Used to hold parent comments, their replies and a form to add a new reply
export let commentReplyContainerTemplate = (parent, parentElemWidth) => {
  let collapseId = `reply-collapse-${parent.id}`;
  const handleClick = () => {
    $(`.collapse.reply-form-container:not(#${collapseId})`).collapse('hide');
    $(`#${collapseId}`).collapse('show');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let content = new FormData(event.target).get('content');
    console.log({ content });
    let { docId: documentId } = getURLParams(['docId']);

    await commentService.create({
      data: {
        content,
        parentCommentId: parent.id,
        documentId,
        clientId: yProvider.awareness.clientID,
      },
      onSuccess: (createdComment) => {
        console.log('Added comment reply', createdComment);

        setState({
          comments: state.comments.concat(createdComment),
        });

        console.log('Comments after adding comment reply', state.comments);
        $(`#${collapseId}`).collapse('hide');
        event.target.reset();
      }
    });
  };

  const handleCancel = () => { 
    unfocusCommentHighlights();
    return $(`#${collapseId}`).collapse('hide'); 
  }

  return html`
    <div id=${'comment-with-replies-' + parent.id} aria-expanded="false" aria-controls=${collapseId} style="width: 18rem; top: ${parent.highlight.top}px; left:${parentElemWidth / 2 - remToPixels(18) / 2}px; position: absolute;" class="card shadow comment-with-replies" @click=${handleClick}>

      <div class="card-body p-0">
        
        ${html`${commentTemplate(parent.id, parent.usersDocuments[0].user.email, parent.content, parent.createdAt, personImgUrl)}`}
        
        ${parent.children.length > 0 ?
      html`${parent.children
        .map(child => commentTemplate(child.id, child.usersDocuments[0].user.email, child.content, child.createdAt, personImgUrl, child.parentCommentId))}`
      : null}

        <div class="collapse p-2 reply-form-container" id=${collapseId}>
          <form class="reply-form" @submit=${handleSubmit}>
              <div class="form-group">
                <input class="form-control" placeholder="Reply" name="content" type="text" />
              </div>
              <div class="form-group m-0">
                <button class="btn btn-primary" type="submit">Reply</button>
                <button class="btn btn-light" type="button" @click=${handleCancel}>Cancel</button>
              </div>
          </form>
        </div>
      </div>
    </div>
  `;
};
