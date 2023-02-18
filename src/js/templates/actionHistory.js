import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { ActionResponse } from '../api/actions';
import DUMMY_ACTIONS from '../collaboration/actions_dummy.json?raw';
import { yProvider } from '../yjs-setup';
const ACTIONS = JSON.parse(DUMMY_ACTIONS)
  .actions.slice(0, 20)
  .map((action) => new ActionResponse(action));

const closeBtn = () => {
  const handleClose = () => {
    document
      .getElementById('action-history-container')
      ?.classList.remove('open');
  };

  return html`<div
    class="card border-bottom border-top-0 border-right-0 border-left-0"
  >
    <div class="card-header py-0">
      <button
        class="btn btn-lg action-history-close font-weight-bold"
        type="button"
        @click=${handleClose}
      >
        X
      </button>
    </div>
  </div>`;
};

/**
 *
 * @param {ActionResponse} action
 * @param {string} userColor
 */
const actionEntry = (action, userColor = '#dc3545') => {
  const badgeStyling = {
    'badge-success': action.type === 'connect',
    'badge-danger': action.type === 'disconnect',
    'badge-primary': action.type !== 'connect' && action.type !== 'disconnect',
  };

  const date = new Date(action.createdAt).toString().split(' ');
  const createdAt = `${date[1]} ${date[2]} ${date[3]}, ${date[4]}`;

  const formatted = action.type.split('_').join(' ');
  const type = formatted[0].toUpperCase() + formatted.slice(1);
  return html`
    <div class="card border-bottom border-top-0 border-right-0 border-left-0">
      <div class="card-header action-entry-header" id=${'heading' + action.id}>
        <h2 class="mb-0">
          <button
            class="action-history-btn btn text-left d-flex align-items-baseline"
            type="button"
            data-toggle="collapse"
            data-target=${'#collapse-' + action.id}
            aria-expanded="true"
            aria-controls=${'#collapse-' + action.id}
          >
            <div style="flex: 0 0 20ch;">
              <div>${createdAt}</div>
              <div class="text-muted">
                <span
                  class="user-color-index mr-1"
                  style="background-color: ${userColor};"
                ></span
                >${action.username}
              </div>
            </div>

            <div class="badge ${classMap(badgeStyling)}">${type}</div>
          </button>
        </h2>
      </div>

      <div
        id=${'collapse-' + action.id}
        class="collapse"
        aria-labelledby=${'heading' + action.id}
        data-parent="#action-history-accordion"
      >
        <div class="card-body">
          Some placeholder content for the first accordion panel. This panel is
          shown by default, thanks to the <code>.show</code> class.
        </div>
      </div>
    </div>
  `;
};

/**
 *
 * @param {Array<{action: ActionResponse, color: string}>} actions
 */
const actionHistoryTemplate = (actions) => {
  return html`${closeBtn()}
  ${actions.map(({ action, color }) => {
    return html`${actionEntry(action, color)}`;
  })}`;
};

/**
 *
 * @param {ActionResponse[]} actions
 */
export const renderActions = (actions) => {
  const awStates = Array.from(yProvider.awareness.getStates().values());
  const userColorMapping = awStates
    .map((state) => state.user)
    .reduce((prev, curr) => {
      return curr.name in prev ? prev : { ...prev, [curr.name]: curr.color };
    }, {});

  const withColor = ACTIONS.map((action) => ({
    action,
    color: userColorMapping[action.username],
  }));
  const actionsContainer = document.getElementById('action-history-accordion');
  if (actionsContainer) {
    render(actionHistoryTemplate(withColor), actionsContainer);
  }
};
