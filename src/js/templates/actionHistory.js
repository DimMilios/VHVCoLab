import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { until } from 'lit-html/directives/until.js';
import { ActionResponse, ACTION_TYPES, getActions } from '../api/actions';
import { timeSince } from '../collaboration/util-collab';
import {
  getMusicalParameters,
  extractEditorPosition,
} from '../vhv-scripts/utility';
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
  let diff = Date.now() - dMillis;
  let moreThanADay = diff > 1000 * 60 * 60 * 24;
  if (moreThanADay) {
    const parts = d.split(' ');
    return `${parts[1]} ${parts[2]} ${parts[3]}, ${parts[4]}`;
  }

  const time = timeSince(dMillis);
  if (diff <= 1000 * 10) {
    return 'Now';
  }
  return (
    (time.slice(0, 2) === '1 ' ? time.slice(0, time.length - 1) : time) + ' ago'
  );
}

const TYPES_WITH_CONTENT = [
  ACTION_TYPES.add_comment,
  ACTION_TYPES.change_pitch,
  ACTION_TYPES.change_chord,
  ACTION_TYPES.export,
  ACTION_TYPES.transpose,
];
Object.freeze(TYPES_WITH_CONTENT);
const isTypeSupported = (type) => {
  return TYPES_WITH_CONTENT.includes(type);
};

const singleSelectValue = (oldest, newest) => (header, key) => {
  if (header === 'Hum. Old') {
    return oldest.oldValue;
  } else if (header === 'Hum. New') {
    return newest.newValue;
  }
  return oldest[key];
};

/**
 *
 * @param {ActionResponse} action
 */
const content = (action) => {
  switch (action.type) {
    case 'add_comment':
      return displayAddComment(action);
    case 'export':
      return action.content.file;
    case 'transpose':
      return action.content.text;
    case 'change_chord':
      return html`
        <div>
          <table class="table table-bordered table-sm m-0 text-center">
            <tbody>
              <tr>
                <th scope="row">From</th>
                <td>${action.content.prevValue}</td>
              </tr>
              <tr>
                <th scope="row">To</th>
                <td>${action.content.newValue}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    case 'change_pitch': {
      if (action.content.type === 'single') {
        if (!Array.isArray(action.content.changes)) {
          return null;
        }
        const oldest = action.content.changes[0];
        const newest =
          action.content.changes[action.content.changes.length - 1];
        return displaySingleSelectData(
          singleSelectValue(oldest, newest),
          SINGLE_ACTION_DATA
        );
      } else if (action.content.type === 'multi') {
        const changes = action.content.changes;
        if (!Array.isArray(changes)) {
          return null;
        }
        const multiChanges = {};
        for (let oldestChange of changes[0]) {
          multiChanges[oldestChange.id] = { oldest: oldestChange };
        }
        for (let newestChange of changes[changes.length - 1]) {
          multiChanges[newestChange.id].newest = newestChange;
        }
        const values = Object.values(multiChanges);
        console.table(values);
        return displayMultiSelectData(values);
      }
    }
  }
};

const SINGLE_ACTION_DATA = [
  { header: 'Measure', key: 'measureNo' },
  { header: 'Order', key: 'order' },
  { header: 'Staff', key: 'staff' },
  { header: 'Voice', key: 'voice' },
  { header: 'Hum. Old', key: 'oldValue' },
  { header: 'Hum. New', key: 'newValue' },
];

function displayAddComment(action) {
  const refElems = Array.from(
    document.querySelectorAll(
      action.content?.multiSelectElements
        ?.split(',')
        .map((id) => '#' + id)
        .join(',')
    )
  );
  const data = refElems
    .map((note) => ({
      ...extractEditorPosition(note),
      ...getMusicalParameters(note),
    }))
    .filter(Boolean);

  let selectData;
  if (data.length === 1) {
    selectData = html`${displaySingleSelectData(
      (_, k) => data[0][k] ?? '-',
      SINGLE_ACTION_DATA.slice(0, SINGLE_ACTION_DATA.length - 2)
    )}`;
  } else if (data.length > 1) {
    selectData = html`${displayMultiSelectData(
      data,
      MULTI_ACTION_DATA.slice(0, MULTI_ACTION_DATA.length - 2),
      (k, i) => html` <td>${data[i][k] ?? '-'}</td> `
    )}`;
  }
  return html` <h5>Comment</h5>
    <div>${action.content.content}</div>
    <h5 class="mt-4">Note information</h5>
    <div>${selectData}</div>`;
}

/**
 *
 * @param {(header: string, key: string) => any} dataFunc
 * @param {{ header: string, key: string}[]} headers
 */
function displaySingleSelectData(dataFunc, headers = SINGLE_ACTION_DATA) {
  return html`
    <div>
      <table class="table table-bordered table-sm m-0 text-center">
        <thead>
          <tr>
            <th
              style="width: ${Math.max(
                ...headers.map((d) => d.header.length)
              )}rem"
            >
              Single sel.
            </th>
            <th scope="col">Value</th>
          </tr>
        </thead>

        <tbody>
          ${headers.map(
            ({ header, key }) => html`
              <tr>
                <th scope="row">${header}</th>
                <td>${dataFunc(header, key)}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    </div>
  `;
}

const MULTI_ACTION_DATA = [
  { header: 'Measure', key: 'measureNo' },
  { header: 'Order', key: 'order' },
  { header: 'Staff', key: 'staff' },
  { header: 'Voice', key: 'voice' },
  { header: 'Hum. Old', key: 'oldToken' },
  { header: 'Hum. New', key: 'token' },
];

function displayMultiSelectData(
  multiSelectValues,
  headers = MULTI_ACTION_DATA,
  addCommentValueFunc
) {
  const changePitchValueFunc = (key, v) =>
    html` <td>${key === 'token' ? v.newest.token : v.oldest[key]}</td> `;

  return html`
    <div class="table-responsive">
      <table class="table table-bordered table-sm m-0 text-center">
        <thead>
          <tr>
            <th style="width: 3rem">Multi sel.</th>
            ${multiSelectValues.map(
              (_, idx) => html`<th scope="col">#${idx + 1}</th>`
            )}
          </tr>
        </thead>

        <tbody>
          ${headers.map(
            ({ header, key }) =>
              html`<tr>
                <th scope="row">${header}</th>
                ${multiSelectValues.map((v, idx) =>
                  addCommentValueFunc !== undefined
                    ? addCommentValueFunc(key, idx)
                    : changePitchValueFunc(key, v)
                )}
              </tr>`
          )}
        </tbody>
      </table>
    </div>
  `;
}

const extraInfo = (/** @type {ActionResponse} */ action) => {
  if (isTypeSupported(action.type)) {
    return html`
      <div
        id=${'collapse-action-' + action.id}
        class="collapse"
        aria-labelledby=${'heading' + action.id}
        data-parent="#action-history-accordion"
      >
        <div class="card-body">
          <div>${content(action)}</div>
        </div>
      </div>
    `;
  }
  return null;
};

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

  function handleView() {
    let collapse = $(`#collapse-action-${action.id}`);

    if (collapse[0] && $._data(collapse[0], 'events') === undefined) {
      collapse.on('show.bs.collapse', () => {
        yProvider.awareness.setLocalStateField('referenceAction', {
          actionId: action.id,
        });
      });

      collapse.on('hide.bs.collapse', () => {
        yProvider.awareness.setLocalStateField('referenceAction', {
          actionId: null,
        });
      });
    }

    collapse.collapse('toggle');
  }

  function handleReplay() {}

  return html`
    <div class="card border-bottom border-top-0 border-right-0 border-left-0">
      <div class="card-header action-entry-header" id=${'heading' + action.id}>
        <h2 class="mb-0 d-flex justify-content-between">
          <button
            class="action-history-btn btn text-left d-flex align-items-baseline"
            type="button"
            data-action-id=${action.id}
          >
            <div style="flex: 0 0 20ch;">
              <div style="font-size: 1.1rem;">
                <span ?hidden=${!import.meta.env.DEV}>${action.id}</span>
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
          <div class="d-flex align-self-end">
            <button
              class="btn"
              type="button"
              @click=${handleView}
              ?disabled=${!isTypeSupported(action.type)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-eye"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
                />
                <path
                  d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                />
              </svg>
            </button>
            <button class="btn" type="button" @click=${handleReplay}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-repeat"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                />
                <path
                  fill-rule="evenodd"
                  d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                />
              </svg>
            </button>
          </div>
        </h2>
      </div>

      ${extraInfo(action)}
    </div>
  `;
};

document.addEventListener('actions_fetch', (e) => {
  if (Array.isArray(e.detail.fetchedActions)) {
    actions = actions.concat(e.detail.fetchedActions);
    queryParams.lastActionId = e.detail.lastActionId;
  }
});

document.addEventListener('actions_reset', (e) => {
  console.log(`[${new Date().toISOString()}]: actions_reset event`);
  queryParams.lastActionId = null;
  actions.splice(0, actions.length);
  // prettier-ignore
  if (document.getElementById('action-history-container')?.classList.contains('open')) {
    renderActions();
  }
});

let actions = [];
export function getActionById(actionId) {
  return actions.find((a) => a.id === actionId);
}

/**
 *
 * @param {{[username: string]: string}} userColorMapping
 */
const actionHistoryTemplate = (userColorMapping) => {
  const handleLoadMore = () => {
    renderActions();
    // const scrollContainer = document.getElementById('action-history-container');
    // const accordion = document.getElementById('action-history-accordion');
    // scrollContainer.scrollBy(0, accordion.getBoundingClientRect().height);
  };

  const actionsTemplate = getActions(queryParams).then((fetchedActions) => {
    if (Array.isArray(fetchedActions) && fetchedActions.length > 0) {
      let lastActionId = fetchedActions[fetchedActions.length - 1].id;
      document.dispatchEvent(
        new CustomEvent('actions_fetch', {
          detail: { fetchedActions, lastActionId },
        })
      );
    }

    return html`${actions.map(
        (action) => html`${actionEntry(action, userColorMapping)}`
      )}
      <div ?hidden=${actions.length < queryParams.pageSize}>
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
