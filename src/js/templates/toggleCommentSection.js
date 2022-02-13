import { html } from "lit-html";
import { layoutService } from "../state/layoutStateMachine";

export function toggleCommentsShow(text = '', ...children) {
  
  const handleToggle = () => {
    let commentsVisible = layoutService.state
      .toStrings()
      .some((name) => name.toLowerCase().includes('comment'));
    
    if (commentsVisible) {
      layoutService.send('HIDE_COMMENTS');
      layoutService.send('SHOW_TEXT');
    } else {
      layoutService.send('SHOW_COMMENTS_HIDE_TEXT');
    }

    $('#comments-notification').tooltip('hide');
  }

  return html`
    <div class="toggle-comments" style="top: 20px; right: 15px;">
      <button id="comments-notification" @click=${handleToggle} type="button" class="badge badge-primary" data-toggle="tooltip" data-placement="bottom" data-trigget="hover" title="New comments!">
        ${text || 4}
      </button>
    </div>
  `;
}