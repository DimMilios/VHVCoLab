import { html } from 'lit-html';
import { formatUserElem } from '../collaboration/collab-extension.js';
import { getCoordinatesWithOffset } from '../collaboration/util-collab.js';
import { yProvider } from '../yjs-setup.js';

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
    } else {
      console.log('Element does not have id');
    }
  };
  const { targetX, targetY } = getCoordinatesWithOffset(
    el,
    document.querySelector('#input')
  );

  return clientId == yProvider.awareness.clientID
    ? html`
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
            class="dropdown-menu"
            aria-labelledby=${'dropdownMenuButton-' + elemRefId}
            @click=${handleClick}
          >
            <a
              class="dropdown-item"
              id=${'details-' + elemRefId}
              href="#"
              data-toggle="popover"
              >Element details</a
            >
            <a class="dropdown-item" href="#">Another action</a>
            <a class="dropdown-item" href="#">Something else here</a>
          </div>
        </div>
      `
    : html`<div
        class="users-div"
        style="transform: translate(${targetX}px, ${document.querySelector('.dropup.btn-group') ?targetY - 50 : targetY - 25}px)"
        data-client-id=${clientId}
        data-ref-id=${elemRefId}
      >
        ${name}
      </div> `;
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
