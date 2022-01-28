import { html, render } from 'lit-html';
import { getURLParams } from '../api/util.js';
import { formatUserElem } from '../collaboration/collab-extension.js';
import {
  multiSelectCoords,
  renderComments,
} from '../collaboration/templates.js';
import { getCoordinatesWithOffset } from '../collaboration/util-collab.js';
import { yProvider } from '../yjs-setup.js';
import { commentFormTemplate } from './commentForm.js';
import * as commentService from '../api/comments.js';
import { cache } from 'lit-html/directives/cache.js';
import { setState, state } from '../state/comments.js';

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
            class="context-menu-dropdown-item text-decoration-none text-reset p-1"
            id=${'details-' + elemRefId}
            href="#"
            data-toggle="popover"
            >Element details</a
          >
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
    } else {
      console.log('Element does not have id');
    }
  };
  const { targetX, targetY } = getCoordinatesWithOffset(
    el,
    document.querySelector('#input')
  );

  return html`${cache(clientId == yProvider.awareness.clientID
    ? contextMenu(clientId, elemRefId, targetX, targetY, handleClick)
    : simpleIndicator(clientId, elemRefId, targetX, targetY, name))}`;
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
    await commentService.create({
      data: {
        content: content.value,
        parentCommentId: null,
        documentId: documentId ? Number(documentId) : 1,
        clientId: yProvider.awareness.clientID,
        multiSelectElements: notes.join(','),
      },
      onSuccess: (createdComment) => {
        createdComment.highlight = Object.assign({}, coords);
        console.log('Added comment', createdComment);

        setState({
          comments: state.comments
            .map((c) => {
              return c.highlight == null &&
                typeof c?.multiSelectElements == 'string'
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
      },
      onError: console.log
    });
  }

  yProvider.awareness.setLocalStateField('multiSelect', null);
  content.value = '';
  $('#post-comment').modal('hide');
};
