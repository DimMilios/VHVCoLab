import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { until } from 'lit-html/directives/until.js';
import { ActionResponse, ACTION_TYPES, getActions } from '../api/actions';
import { multiSelectCoords } from '../collaboration/templates';
import { timeSince } from '../collaboration/util-collab';
import { yProvider } from '../yjs-setup';

const queryParams = {
  actionType: 'null',
  pageSize: 20,
  lastActionId: null,
};

const actionHeaderFilters = () => {
  const handleChange = (e) => {
    let value = e.target.value;
    if (value) {
      queryParams.actionType = value;
      queryParams.lastActionId = null;
      actions.splice(0, actions.length);
      renderActions();
    }
  };

  return html`
    <form>
      <div class="form-group row align-items-center">
        <label for="action-type" class="col-sm-4 p-0 my-0 mr-0 ml-2"
          >Action Type:</label
        >
        <select
          name="action-type"
          required
          class="form-control col-sm-7"
          @change=${handleChange}
        >
          <option selected value="null">all</option>
          ${Object.values(ACTION_TYPES).map(
            (at) =>
              html`<option value=${at}>
                <div class="badge badge-primary">${at.replace('_', ' ')}</div>
              </option>`
          )}
        </select>
      </div>
    </form>
  `;
};

const actionPanelHeaderTemplate = () => {
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
        type="button"
        class="btn btn-lg"
        data-toggle="collapse"
        data-target="#header-collapse"
        aria-expanded="false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-down"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>
      <button
        class="btn btn-lg action-history-close font-weight-bold float-right"
        type="button"
        @click=${handleClose}
      >
        X
      </button>
    </div>
    <div
      id="header-collapse"
      class="collapse"
      aria-labelledby="heading-header-collapse"
    >
      <div class="card-body">${actionHeaderFilters()}</div>
    </div>
  </div>`;
};

/**
 *
 * @param {Date | null} date
 * @returns {string | null}
 */
function formatDate(date) {
  if (date === null) {
    return null;
  }
  let d = new Date(date).toString();
  if (d === 'Invalid Date') {
    return null;
  }

  let dMillis = Date.parse(d);
  let lessThanADay = Date.now() - dMillis > 1000 * 60 * 60 * 24;
  if (lessThanADay) {
    const parts = d.split(' ');
    return `${parts[1]} ${parts[2]} ${parts[3]}, ${parts[4]}`;
  }

  const time = timeSince(dMillis);
  return (time[0] === '1' ? time.slice(0, time.length - 1) : time) + ' ago';
}

/**
 *
 * @param {ActionResponse} action
 * @param {{ [username: string]: string }} userColorMapping
 */
const actionEntry = (action, userColorMapping) => {
  const defaultColor = '#dc3545';
  const badgeStyling = {
    'badge-success': action.type === 'connect',
    'badge-danger': action.type === 'disconnect',
    'badge-primary': action.type !== 'connect' && action.type !== 'disconnect',
  };

  const createdAt = formatDate(action.createdAt);
  const type = action.type.split('_').join(' ');

  const handleClick = () => {
    try {
      console.log({ content: action.content });
      const content = action.content;
      if (content === null) {
        console.log('Failed to parse action content from server');
        return;
      }

      switch (action.type) {
        case 'add_comment': {
          const elemIds = content.multiSelectElements
            ?.split(',')
            .map((id) => '#' + id);
          const elems = document.querySelectorAll(elemIds.join(','));
          const coords = multiSelectCoords(
            content.multiSelectElements.split(',')
          );
          console.log({ elems, coords });
          break;
        }
      }
    } catch (e) {
      console.error('Faile to parse action content from server', e);
    }
  };

  return html`
    <div class="card border-bottom border-top-0 border-right-0 border-left-0">
      <div class="card-header action-entry-header" id=${'heading' + action.id}>
        <h2 class="mb-0">
          <button
            class="action-history-btn btn text-left d-flex align-items-baseline"
            type="button"
            data-toggle="collapse"
            data-target=${'#collapse-action-' + action.id}
            aria-expanded="true"
            aria-controls=${'#collapse-action-' + action.id}
            data-action-id=${action.id}
            @click=${handleClick}
          >
            <div style="flex: 0 0 20ch;">
              <div style="font-size: 1.1rem;">
                <span
                  class="user-color-index mr-1"
                  style="background-color: ${userColorMapping[
                    action.username
                  ]};"
                ></span
                >${action.username}
              </div>
              <div class="text-muted">${createdAt}</div>
            </div>

            <div class="badge ${classMap(badgeStyling)}">${type}</div>
          </button>
        </h2>
      </div>

      <div
        id=${'collapse-action-' + action.id}
        class="collapse"
        aria-labelledby=${'heading' + action.id}
        data-parent="#action-history-accordion"
      >
        <div class="card-body">
          Some placeholder content for the first accordion panel. This panel is
          shown by default, thanks to the <code>.show</code> class.
          <div>${action.id}</div>
        </div>
      </div>
    </div>
  `;
};

let actions = [];

/**
 *
 * @param {{[username: string]: string}} userColorMapping
 */
const actionHistoryTemplate = (userColorMapping) => {
  const handleLoadMore = () => {
    renderActions();
    const scrollContainer = document.getElementById('action-history-container');
    const accordion = document.getElementById('action-history-accordion');
    scrollContainer.scrollBy(0, accordion.getBoundingClientRect().height);
  };

  const actionsTemplate = getActions(queryParams).then((fetchedActions) => {
    if (Array.isArray(fetchedActions) && fetchedActions.length > 0) {
      queryParams.lastActionId = fetchedActions[fetchedActions.length - 1].id;
      actions = actions.concat(fetchedActions);
      console.log({ queryParams, actions });
    }
    return html`${actions.map(
        (action) => html`${actionEntry(action, userColorMapping)}`
      )}
      <div>
        <button @click=${handleLoadMore} class="btn btn-primary w-100">
          <h5>Load more</h5>
          <div class="text-small">(${actions.length} loaded)</div>
        </button>
      </div>`;
  });

  const loader = html`
    <div class="d-flex justify-content-center mt-3">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `;

  return html`${until(actionsTemplate, loader)}`;
};

// Uncomment to use dummy data from JSON file (use ACTIONS variable on function renderActions below as well)
// import DUMMY_ACTIONS from '../collaboration/actions_dummy.json?raw';
// const ACTIONS = JSON.parse(DUMMY_ACTIONS)
//   .actions.slice(0, 20)
//   .map((action) => new ActionResponse(action));

export const renderActions = () => {
  const awStates = Array.from(yProvider.awareness.getStates().values());
  const userColorMapping = awStates
    .map((state) => state.user)
    .reduce((prev, curr) => {
      return curr.name in prev ? prev : { ...prev, [curr.name]: curr.color };
    }, {});

  const actionsContainer = document.getElementById('action-history-accordion');
  const actionsHeader = document.getElementById('action-history-header');
  if (actionsContainer) {
    render(actionPanelHeaderTemplate(), actionsHeader);
    render(actionHistoryTemplate(userColorMapping), actionsContainer);
  }
};
