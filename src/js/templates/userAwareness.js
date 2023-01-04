import { html, render } from 'lit-html';
import { getURLParams } from '../api/util.js';
import { formatUserElem } from '../collaboration/collab-extension.js';
import { multiSelectCoords } from '../collaboration/templates.js';
import { getCoordinatesWithOffset } from '../collaboration/util-collab.js';
import { getCommentsList, yProvider } from '../yjs-setup.js';
import { commentFormTemplate } from './commentForm.js';
import { getAceEditor } from '../vhv-scripts/setup.js';
import { Comment } from '../collaboration/Comment.js';

let contextMenu = (clientId, elemRefId, targetX, targetY, handleClick) =>
  html`
    <div class="dropup btn-group" style="pointer-events: bounding-box">
      <div
        id=${'dropdownMenuButton-' + elemRefId}
        class="users-div btn dropdown-toggle p-0"
        data-toggle="dropdown"
        aria-expanded="false"
        style="transform: translate(${targetX}px, ${targetY - 30}px)"
        data-client-id=${clientId}
        data-ref-id=${elemRefId}
      >
        You
      </div>

      <div
        class="dropdown-menu p-0 border border-rounded shadow"
        aria-labelledby=${'dropdownMenuButton-' + elemRefId}
        @click=${handleClick}
      >
        <div class="w-100 d-flex flex-column">
          <a
            id=${'add-comment-' + elemRefId}
            class="context-menu-dropdown-item text-decoration-none text-reset p-1 border-bottom border-secondary"
            href="#"
            data-toggle="modal"
            data-target="#post-comment"
            >Add Comment</a
          >
          <a
            class="context-menu-dropdown-item text-decoration-none text-reset p-1 border-bottom border-secondary"
            id=${'details-' + elemRefId}
            href="#"
            data-toggle="popover"
            >Element details</a
          >
          <!-- <a
            class="context-menu-dropdown-item text-decoration-none text-reset p-1"
            id=${'history-' + elemRefId}
            href="#"
            data-toggle="popover"
            >History</a
          > -->
        </div>
      </div>
    </div>
  `;
let simpleIndicator = (clientId, elemRefId, targetX, targetY, name) =>
  html`<div
    class="users-div"
    style="transform: translate(${targetX}px, ${document.querySelector(
      '.dropup.btn-group'
    )
      ? targetY - 50
      : targetY - 25}px)"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  >
    ${name}
  </div> `;

export let userAwarenessTemplate = (clientId, elemRefId, name) => {
  let el = document.getElementById(elemRefId);
  if (!el) return html`<div class="users-div"></div>`;

  let details;

  const handleClick = (event) => {
    console.log('click', { target: event.target });
    let id = event.target.id;
    if (/^details/.test(id)) {
      if (!details) {
        details = formatUserElem(el);
        $(`#${id}`).popover({
          container: 'body',
          placement: 'auto',
          content: () =>
            Object.entries(JSON.parse(details).attrs)
              .map(([key, val]) => `<div>${key}: ${val}</div>`)
              .join('\n'),
          html: true,
        });
        $(`#${id}`).popover('show');
        console.log({ details: JSON.parse(details) });
      }
    } else if (/^add-comment/.test(id)) {
      const coords = multiSelectCoords([elemRefId]);
      console.log(coords);
      render(
        commentFormTemplate(handleSingleComment([elemRefId], coords)),
        document.querySelector('#post-comment .modal-content')
      );
    } else if (/^history/.test(id)) {
      let editor = getAceEditor();
      let undoManager = editor.getSession().getUndoManager();

      console.log(undoManager.$undoStack);
      console.log({ elemRefId });
      let [, line, field, subfield] = elemRefId.match(
        /-.*L(\d+)F(\d+)S?(\d+)?/
      );

      line = parseInt(line, 10) - 1;

      for (let item of undoManager.$undoStack) {
        if (item[0].start.row == line && item[0].end.row == line) {
          console.log('change for element line', item);
          // editor.getSession().redoChanges(item, true);
        }
      }
    } else {
      console.log('Element does not have id');
    }
  };
  const { targetX, targetY } = getCoordinatesWithOffset(
    el,
    document.querySelector('#input')
  );

  return html`${clientId == yProvider.awareness.clientID
    ? contextMenu(clientId, elemRefId, targetX, targetY, handleClick)
    : simpleIndicator(clientId, elemRefId, targetX, targetY, name)}`;
};

export let singleSelectTemplate = (clientId, elemRefId, color) => {
  let el = document.getElementById(elemRefId);
  if (!el) return html`<div class="single-select"></div>`;

  const { staffY, targetX, targetY, targetBounds } = getCoordinatesWithOffset(
    el,
    document.querySelector('#input')
  );

  return html`<div
    class="single-select"
    style="transform: translate(${targetX}px, ${targetY}px);
    width: ${Math.abs(targetBounds.x - targetBounds.right)}px;
    height: ${Math.abs(staffY - targetBounds.bottom)}px;
    background-color: ${color}"
    data-client-id=${clientId}
    data-ref-id=${elemRefId}
  ></div>`;
};

export const handleSingleComment = (notes, coords) => async (event) => {
  event.preventDefault();

  let content = event.target.querySelector('input[name="comment-text"]');
  console.log('You sent:', content.value);

  let { docId: documentId } = getURLParams(['docId']);

  if (Array.isArray(notes) && notes.length > 0) {
    // await commentService.create({
    //   data: {
    //     content: content.value,
    //     parentCommentId: null,
    //     documentId: documentId ? Number(documentId) : 1,
    //     clientId: yProvider.awareness.clientID,
    //     multiSelectElements: notes.join(','),
    //   },
    //   onSuccess: (createdComment) => {
    //     createdComment.highlight = Object.assign({}, coords);
    //     console.log('Added comment', createdComment);

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
    //   onError: console.log
    // });
    let { user } = yProvider.awareness.getLocalState();

    let comment = new Comment({
      content: content.value,
      createdAt: new Date(),
      multiSelectElements: notes.join(','),
      documentId,
      clientId: yProvider.awareness.clientID,
      author: user,
    });

    let comments = getCommentsList();
    if (comments) {
      comments.push([comment.toJSON()]);
    }
  }

  yProvider.awareness.setLocalStateField('multiSelect', null);
  content.value = '';
  $('#post-comment').modal('hide');
};
