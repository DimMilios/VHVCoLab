import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { until } from 'lit-html/directives/until.js';
import { ActionResponse, ACTION_TYPES, getActions, sendAction, ActionPayload } from '../api/actions';
import {
  getEditorContents,
  notify,
  scoreTransposition,
  setEditorContents,
  timeSince,
} from '../collaboration/util-collab';
import {
  getMusicalParameters,
  extractEditorPosition,
} from '../vhv-scripts/utility';
import { yProvider, getActionsMap } from '../yjs-setup';
import { clearPrevSelections } from '../collaboration/collab-extension';
import { compareHexHashes, crc32, digestMessage } from '../vhv-scripts/hash';
import { getAceEditor } from '../vhv-scripts/setup';
import { editChord, mapChord } from '../vhv-scripts/chords';
import * as Y from 'yjs';
import { getURLInfo } from '../api/util';

/** @typedef {{ row: number, col: number, before: string, current: string, after: string, elemId: string }} Replay */

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
    console.log('closing');
    document
      .getElementById('action-history-container')
      ?.classList.remove('open');
    yProvider.awareness.setLocalStateField('referenceAction', {
      ActionPanelDisplayed: null,
      actionId: null,
    });
    //case where 'referenceAction' field properties are already null so an update is not emitted
    clearPrevSelections();
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

const TYPES = {
  WITH_CONTENT: [
    ACTION_TYPES.add_comment,
    ACTION_TYPES.change_pitch,
    ACTION_TYPES.change_chord,
    ACTION_TYPES.export,
    ACTION_TYPES.transpose,
    ACTION_TYPES.repository_import,
  ],
  REFERENCEABLE: [
    ACTION_TYPES.change_pitch,
    ACTION_TYPES.change_chord,
    ACTION_TYPES.add_comment,
  ],
};
Object.freeze(TYPES);
const isThereContent = (type) => {
  return TYPES.WITH_CONTENT.includes(type);
};
const isReferenceable = (type) => {
  return TYPES.REFERENCEABLE.includes(type);
};

const REPLAY_TYPES = [
  ACTION_TYPES.change_pitch,
  ACTION_TYPES.change_chord,
  ACTION_TYPES.transpose,
];
Object.freeze(REPLAY_TYPES);
const isTypeReplayable = (type) => {
  return REPLAY_TYPES.includes(type);
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
    case 'repository_import':
      if (!action.content.file || !action.content.type) {
        return null;
      }
      return html`
        <div>
          <table class="table table-bordered table-sm m-0 text-center">
            <tbody>
              <tr>
                <th>File</th>
                <th>File Type</th>
              </tr>
              <tr>
                <td>${action.content.file}</td>
                <td>${action.content.type}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
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
  if (isThereContent(action.type)) {
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

const replayMap = new Map();

function isUndoActiveFor(actionId) {
  const map = getActionsMap();
  const undoActive = map.has(actionId.toString()) && map.get(actionId.toString()).undoActive;
  return undoActive;
}


function updateSingleSelection(elemId, timeout) {
  let update = () => {
    const oldStateCopy = structuredClone(yProvider?.awareness?.getLocalState());
    yProvider?.awareness?.setLocalState(
      Object.assign(oldStateCopy, {
        singleSelect: { elemId },
        multiSelect: null,
      })
    );
  };

  if (timeout !== undefined) {
    return setTimeout(update, timeout);
  }

  update();
}

function updateMultiSelection(multiSelect, timeout) {
  let update = () => {
    let oldStateCopy = structuredClone(yProvider?.awareness?.getLocalState());
    yProvider?.awareness?.setLocalState(
      Object.assign(oldStateCopy, {
        singleSelect: null,
        multiSelect,
      })
    );
  };
  if (timeout !== undefined) {
    return setTimeout(update, timeout);
  }

  update();
}

function matchesSong(action) {
  const currentScoreTitle = JSON.parse(sessionStorage.getItem('score-metadata'))?.title;
  return currentScoreTitle === action.scoreTitle;
}

function canUndoRedo(actionScoreTitle, actionData) {
  const urlParams = getURLInfo();
  const currentScoreTitle = JSON.parse(sessionStorage.getItem('score-metadata'))?.title;
  return urlParams.file === `filename=${actionData.filename}&course=${actionData.course}`
    && currentScoreTitle === actionData.scoreMeta?.title
    && currentScoreTitle === actionScoreTitle
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

  let undoActive = getActionsMap().get(action.id.toString())?.undoActive ?? true;

  function handleView() {
    let collapse = $(`#collapse-action-${action.id}`);

    if (isReferenceable(action.type) && matchesSong(action)) {
      if (collapse[0] && $._data(collapse[0], 'events') === undefined) {
        collapse.on('show.bs.collapse', () => {
          yProvider.awareness.setLocalStateField('referenceAction', {
            ActionPanelDisplayed: true,
            actionId: action.id,
          });
        });

        setTimeout(
          () =>
            yProvider.awareness.setLocalStateField('referenceAction', {
              ActionPanelDisplayed: false,
              actionId: action.id,
            }),
          500
        );

        collapse.on('hide.bs.collapse', () => {
          yProvider.awareness.setLocalStateField('referenceAction', {
            ActionPanelDisplayed: null,
            actionId: null,
          });
        });
      }
    }

    if (matchesSong(action)) {
      collapse.collapse('toggle');
    } else {
      notify(`Action refers to a different song`, 'warning');
    }
  }

  async function handleReplay(event) {
    const actionMap = getActionsMap();

    switch (action.type) {
      case ACTION_TYPES.change_pitch: {
        if (
          !Array.isArray(action.content.changes) ||
          action.content.changes.length === 0
        ) {
          console.warn('Could not find changes for action %d', action.id);
          return;
        }
        if (action.content.type === 'single') {
          const actionData = createSingleReplay(action, actionMap, false);
          if (canUndoRedo(action.scoreTitle, actionData)) {
            actionMap.set(action.id.toString(), actionData);
            replaySingleSelect(actionData.replay);
          } else {
            displayError(event.target, actionData.scoreMeta.title);
          }
        } else if (action.content.type === 'multi') {
          const actionData = createMultiReplay(action, actionMap, false);
          if (canUndoRedo(action.scoreTitle, actionData)) {
            actionMap.set(action.id.toString(), actionData);
            replayMultiSelect(actionData.replay);
          } else {
            displayError(event.target, actionData.scoreMeta.title);
          }
        }
      }
        break;
      case ACTION_TYPES.transpose: {
        const actionData = await createTransposeReplay(action, actionMap, false);
        if (actionData?.replay && canUndoRedo(action.scoreTitle, actionData)) {
          scoreTransposition(actionData.replay.filter);
          actionMap.set(action.id.toString(), actionData);
        }
      }
        break;
      case ACTION_TYPES.change_chord: {
        const actionData = createChangeChordReplay(action, actionMap, false);
        if (actionData?.replay && canUndoRedo(action.scoreTitle, actionData)) {
          actionMap.set(action.id.toString(), actionData);
          replayChangeChord(action, actionData.replay);
        } else {
          displayError(event.target, actionData.scoreMeta.title);
        }
      }
        break;
    }

    //notifying users action has been undone
    yProvider?.awareness?.setLocalStateField('replayAction', {id: action.id, type: action.type});
    
    //updating server database
    //milios
  }

  function handleRollbackReplay(event) {
    const actionMap = getActionsMap();
    let actionData = actionMap.get(action.id.toString());
    let replay = actionData?.replay;

    // If no replay is found for this action, create a new one.
    // This can happen when this action was created in an older session.
    if (replay === undefined || replay === null) {
      console.log(`Could not find replay for action ${action.id}. Creating a new undo entry.`);
      if (action.content?.type === 'single') {
        const actionData = createSingleReplay(action, actionMap, false);
        if (canUndoRedo(action.scoreTitle, actionData)) {
          actionMap.set(action.id.toString(), actionData);
          handleRollbackReplay(event);
        } else {
          displayError(event.target, actionData.scoreMeta.title);
        }
      }
      if (action.content?.type === 'multi') {
        const actionData = createMultiReplay(action, actionMap, false);
        if (canUndoRedo(action.scoreTitle, actionData)) {
          actionMap.set(action.id.toString(), actionData);
          handleRollbackReplay(event);
        } else {
          displayError(event.target, actionData.scoreMeta.title);
        }
      }

      const actionData = createChangeChordReplay(action, actionMap, false);
      if (actionData?.replay && canUndoRedo(action.scoreTitle, actionData)) {
        actionMap.set(action.id.toString(), actionData);
        replayChangeChord(action, actionData.replay);
      } else {
        displayError(event.target, actionData.scoreMeta.title);
      }
      return;
    }

    if (action.type === ACTION_TYPES.transpose && replay?.reverseFilter) {
      scoreTransposition(replay.reverseFilter);
      actionData.replay = {
        filter: replay.reverseFilter,
        reverseFilter: replay.filter,
      }
      actionData.undoActive = !actionData.undoActive;
      actionMap.set(action.id.toString(), actionData);
    }

    if (action.content?.type === 'single') {
      replay.current = getEditorContents(replay.row, replay.col);

      actionData.undoActive = true;

      if (canUndoRedo(action.scoreTitle, actionData)) {
        actionMap.set(action.id.toString(), actionData);
        replaySingleSelect(replay, true);
      } else {
        displayError(event.target, actionData.scoreMeta.title);
      }

    } else if (action.content?.type === 'multi') {
      actionData.undoActive = true;

      if (canUndoRedo(action.scoreTitle, actionData)) {
        // Update current changes for replay
        for (let i = 0; i < replay.changes.length; i++) {
          const change = replay.changes[i];
          change.current = getEditorContents(change.line, change.field);
        }
        actionMap.set(action.id.toString(), actionData);
        replayMultiSelect(actionData.replay, true);
      } else {
        displayError(event.target, actionData.scoreMeta.title);
      }
    }

    if (action.type == ACTION_TYPES.change_chord) {
      const current = getEditorContents(replay.row, replay.col);
      if (replay.after == mapChord(current, 'display', false)) return;

      const rollbackReplayInfo = {
        location: {
          line: action.content.line,
          column: action.content.field
        },
        chord: {
          current,
          reharmonize: false,
          new: mapChord(replay.after, 'send', true)
            .match(/^(?<root>[A-G])((?<accidental>[+&])? (?<variation>.))?$/)
            .groups
        }
      };

      editChord(false, rollbackReplayInfo);
    }
  }

  return html`
    <div class="action-entry card border-bottom border-top-0 border-right-0 border-left-0">
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
                  style="background-color: ${userColorMapping[action.username]};"
                ></span
                >${action.username}
              </div>
              <div class="text-muted">${createdAt}</div>
            </div>

            <div class="badge ${classMap(badgeStyling)}">${type}</div>
          </button>
          <div class=${"d-flex align-self-end action-buttons-" + action.id}>
            <button
              class="btn"
              type="button"
              @click=${handleView}
              ?hidden=${!isThereContent(action.type)}
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
            <button
              class="btn undo-btn"
              type="button"
              @click=${handleReplay}
              ?hidden=${!isTypeReplayable(action.type)}
              ?disabled=${!undoActive}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-counterclockwise"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
                />
                <path
                  d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"
                />
              </svg>
            </button>

            <button
              class="btn redo-btn"
              type="button"
              @click=${handleRollbackReplay}
              ?hidden=${!isTypeReplayable(action.type)}
              ?disabled=${undoActive}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-clockwise"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                />
                <path
                  d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"
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

function determineSubstituteSingle(id, current, substitute) {
  const subfieldMatch = id
    .match(/S(?<subfield>\d+)/)
    ?.groups;

  let insertion;
  if (subfieldMatch) {
    const { subfield } = subfieldMatch;
    const index = parseInt(subfield) - 1
    const curTokens = current.split(' ');
    substitute.includes(' ')
      ? substitute = substitute.split(' ')[index]
      : null;
    curTokens[index] = substitute;
    insertion = curTokens.join(' ');
  } else {
    insertion = substitute;
  }
  return insertion;
}


/**
 * Creates a single replay based on the given action and undoActive flag.
 *
 * @param {ActionResponse} action - The action object.
 * @param {Y.Map<object>} actionMap - The map of action IDs to action data.
 * @param {boolean} undoActive - Flag indicating if undo is active.
 * @return {object} 
 */
function createSingleReplay(action, actionMap, undoActive) {
  const { user } = yProvider.awareness.getLocalState();

  const actionData = {
    filename: user.filename,
    course: user.course,
    undoActive,
    replay: {},
  };

  if (actionMap.has(action.id.toString())) {
    const existing = actionMap.get(action.id.toString());
    const currEditorValue = getEditorContents(
      existing.replay.row,
      existing.replay.col
    );

    actionData.undoActive = !existing.undoActive;
    actionData.replay = {
      ...existing.replay,
      current: currEditorValue,
    };
    actionData.scoreMeta = existing.scoreMeta;
    return actionData;
  }

  const oldestChange = action.content.changes[0];
  const newest = action.content.changes[action.content.changes.length - 1];

  const currEditorValue = getEditorContents(
    oldestChange.row + 1,
    oldestChange.col + 1
  );

  actionData.scoreMeta = JSON.parse(sessionStorage.getItem('score-metadata'));
  actionData.replay = {
    row: oldestChange.row + 1,
    col: oldestChange.col + 1,
    before: oldestChange.oldValue,
    current: currEditorValue,
    after: newest.newValue,
    elemId: oldestChange.noteElementId,
  };

  return actionData;
}

/**
 * @param {Replay} replay - The replay object containing information about the event.
 * @param {boolean} [forRedo=false] - Flag indicating if this is a replay after pressing redo.
 */
function replaySingleSelect(replay, forRedo = false) {
  const compareValue = forRedo ? replay.after : replay.before;

  if (replay.current === compareValue) {
    updateSingleSelection(replay.elemId, 400);
    return;
  }
  const insertion = determineSubstituteSingle(
    replay.elemId, replay.current, compareValue
  );
  setEditorContents(replay.row, replay.col, insertion);
  updateSingleSelection(replay.elemId, 400);
}

function createMultiReplay(action, actionMap, undoActive) {
  const { user } = yProvider.awareness.getLocalState();

  const actionData = {
    filename: user.filename,
    course: user.course,
    undoActive,
    replay: {},
    scoreMeta: JSON.parse(sessionStorage.getItem('score-metadata')),
  };

  if (actionMap.has(action.id.toString())) {
    const existing = actionMap.get(action.id.toString());

    // Update current changes for replay
    for (let i = 0; i < existing.replay.changes.length; i++) {
      const change = existing.replay.changes[i];
      change.current = getEditorContents(change.line, change.field);
    }

    actionData.undoActive = !existing.undoActive;
    actionData.replay = existing.replay;
    return actionData;
  }

  const changes = action.content.changes;
  const multiChanges = {};
  const multiSelectIds = [];
  for (let oldestChange of changes[0]) {
    multiChanges[oldestChange.id] = {
      oldest: oldestChange,
      current: {
        line: oldestChange.line,
        field: oldestChange.field,
        token: getEditorContents(oldestChange.line, oldestChange.field),
      },
    };
    multiSelectIds.push(oldestChange.id);
  }
  for (let newestChange of changes[changes.length - 1]) {
    multiChanges[newestChange.id].newest = newestChange;
  }

  const changesSorted = Object.entries(multiChanges).reduce(
    (prev, currEntry) => {
      const { key, subfield } = currEntry[0]
        .match(/(?<key>L\d+F\d+)S?(?<subfield>\d*)/)
        .groups;
      if (key in prev) {
        prev[key].oldest += ` ${currEntry[1].oldest.oldToken}`;
        prev[key].newest += ` ${currEntry[1].newest.token}`;
        prev[key].subfields += ` ${subfield}`;
      } else {
        prev[key] = {
          line: currEntry[1].current.line,
          field: currEntry[1].current.field,
          oldest: currEntry[1].oldest.oldToken,
          current: currEntry[1].current.token,
          newest: currEntry[1].newest.token,
          subfields: subfield ?? null
        }
      }
      return prev;
    },
    {}
  );

  actionData.replay = {
    multiSelect: multiSelectIds,
    changes: Object.values(changesSorted),
  };
  return actionData;
}

/**
 * Replays a multi-select action based on the provided replay object.
 *
 * @param {object} replay - The replay object containing the changes to be applied.
 * @param {boolean} [forRedo=false] - Determines whether the replay is for redo or not (default: false).
 */
function replayMultiSelect(replay, forRedo = false) {
  const changeProperty = forRedo ? 'newest' : 'oldest';

  // Compare Humdrum values before action is applied to current values in text editor
  let shouldApply = false;
  for (let ch of replay.changes) {
    if (!ch.current.includes(ch[changeProperty])) {
      shouldApply = true;
      break;
    }
  }

  if (shouldApply) {
    replay.changes.forEach(
      change => {
        let insertion = determineSubstituteMulti(
          change, change.current, change[changeProperty]
        );
        setEditorContents(change.line, change.field, insertion);
      }
    );
  }
  updateMultiSelection(replay.multiSelect, 400);
}

/**
 * Creates a transpose replay based on the given action.
 *
 * @param {object} action - The action object.
 * @param {Y.Map<object>} actionMap - The map of action IDs to action data.
 * @param {{text: string, checksum: number, hash: string}} action.content - Content of transpose action.
 */
async function createTransposeReplay(action, actionMap, undoActive) {
  const { user } = yProvider.awareness.getLocalState();

  const actionData = {
    filename: user.filename,
    course: user.course,
    undoActive,
    scoreMeta: JSON.parse(sessionStorage.getItem('score-metadata')),
  };

  if (actionMap.has(action.id.toString())) {
    const existing = actionMap.get(action.id.toString());
    actionData.undoActive = !existing.undoActive;
    actionData.scoreMeta = existing.scoreMeta;
    actionData.replay = {
      filter: existing.replay.reverseFilter,
      reverseFilter: existing.replay.filter,
    };
    return actionData;
  }

  const words = action.content.text.toLowerCase().split(' ');
  const elemId = words.join('-') + '__submenu-item';
  const oppositeId = words[0] === 'up' ? 'down' + elemId.slice(2) : elemId;
  const menuElem = document.getElementById(oppositeId);

  const filter = menuElem.querySelector('small')?.textContent?.trim();
  if (!filter?.includes('transpose')) return {};

  const editor = getAceEditor();
  if (!editor) return {};

  // const currChecksum = crc32(editor.session.getValue());
  // if (currChecksum === action.content.checksum) {
  //   const currHash = await digestMessage(editor.session.getValue());
  //   if (compareHexHashes(currHash, action.content.hash)) {
  //     actionData.replay = {
  //       reverseFilter: document
  //         .getElementById(elemId)
  //         .querySelector('small')
  //         ?.textContent?.trim(),
  //       filter,
  //     }
  //   }
  // }

  actionData.replay = {
    reverseFilter: document
      .getElementById(elemId)
      .querySelector('small')
      ?.textContent?.trim(),
    filter,
  }
  return actionData;
}

/**
 * Creates a change chord based on the given action and undoActive flag.
 *
 * @param {ActionResponse} action - The action object.
 * @param {Y.Map<object>} actionMap - The map of action IDs to action data.
 * @param {boolean} undoActive - Flag indicating if undo is active.
 * @return {object} 
 */
function createChangeChordReplay(action, actionMap, undoActive) {
  const { user } = yProvider.awareness.getLocalState();

  const actionData = {
    filename: user.filename,
    course: user.course,
    undoActive,
    replay: {},
  };

  if (actionMap.has(action.id.toString())) {
    const existing = actionMap.get(action.id.toString());
    const currEditorValue = getEditorContents(
      existing.replay.row,
      existing.replay.col
    );

    actionData.undoActive = !existing.undoActive;
    actionData.replay = {
      ...existing.replay,
      current: currEditorValue,
    };
    actionData.scoreMeta = existing.scoreMeta;
    return actionData;
  }

  actionData.scoreMeta = JSON.parse(sessionStorage.getItem('score-metadata'));
  actionData.replay = {
    row: action.content.line,
    col: action.content.field,
    before: action.content.prevValue,
    current: getEditorContents(action.content.line, action.content.field),
    after: action.content.newValue,
    elemId: action.content.chordElementId,
  };

  return actionData;
}

function updateReplayOld(action) {
  const existingReplay = replayMap.get(action.id);
  const currEditorValue = getEditorContents(
    existingReplay.row,
    existingReplay.col
  );

  let replay = {
    ...existingReplay,
    current: currEditorValue,
  };
  replayMap.set(action.id, replay);
  return replay;
}

function createChangeChordReplayOld(action) {
  if (replayMap.has(action.id)) {
    return updateReplayOld(action);
  }

  const row = action.content.line;
  const col = action.content.field;

  const replay = {
    row,
    col,
    before: action.content.prevValue,
    current: getEditorContents(row, col),
    after: action.content.newValue,
    elemId: action.content.chordElementId,
  };

  replayMap.set(action.id, replay);

  return replay;
}

function replayChangeChord(action, replay) {
  if (replay.before == mapChord(replay.current, 'display', false)) return;

  const replayInfo = {
    location: {
      line: action.content.line,
      column: action.content.field

    },
    chord: {
      current: replay.current,
      reharmonize: false,
      new: mapChord(replay.before, 'send', true)
        .match(/^(?<root>[A-G])((?<accidental>[+&])? (?<variation>.))?$/)
        .groups
    }
  };

  editChord(false, replayInfo);
}

document.addEventListener(
  'actions_fetch',
  (
    /** @type {CustomEvent<{ fetchedActions: ActionResponse[], lastActionId: number }>}} */ e
  ) => {
    if (Array.isArray(e.detail.fetchedActions)) {
      actions = actions.concat(e.detail.fetchedActions);
      queryParams.lastActionId = e.detail.lastActionId;
    }
  }
);

document.addEventListener('actions_reset', (e) => {
  console.log(`[${new Date().toISOString()}]: actions_reset event`);
  queryParams.lastActionId = null;
  actions.splice(0, actions.length);
  // prettier-ignore
  if (document.getElementById('action-history-container')?.classList.contains('open')) {
    renderActions();
  }
});

/** @type {ActionResponse[]} */
let actions = [];

function determineSubstituteMulti(change, current, substitute) {
  let insertion;
  let subfields = change.subfields
    ? change.subfields?.split(' ')
      ?.map(s => s = parseInt(s))
    : null;
  if (subfields) {
    const curTokens = current.split(' ');
    const substituteTokens = substitute.split(' ');
    subfields.forEach((s, i) => curTokens[s - 1] = substituteTokens[i]);
    insertion = curTokens.join(' ');
  } else {
    insertion = substitute;
  }
  return insertion;
}

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

function displayError(actionElem, oldSongTitle) {
  const header = actionElem?.closest('.action-entry-header');
  if (header?.querySelector('.alert')) return;

  const alert = document.createElement('div');
  alert.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');
  const error = `Cannot undo/redo this action because it was created for a different song`;
  alert.innerHTML = `${error}
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
  header?.prepend(alert);
  setTimeout(() => alert?.remove(), 5000);
}
