import { yProvider } from '../yjs-setup.js';
import { RubberBandSelection } from './RubberBandSelection';
import { html, render } from 'lit-html';
import { collabTemplate, multiSelectCoords, uiCoords } from './templates.js';
import { multiSelectTemplate } from '../templates/multiSelect';
import {
  singleSelectTemplate,
  userAwarenessTemplate,
} from '../templates/userAwareness';
import { renderUserList } from '../templates/userList.js';
import {
  highlightLayerTemplate,
  highlightTemplate,
} from '../templates/highlights.js';
import { global_cursor } from '../vhv-scripts/global-variables.js';
import { fixedCommentReplyContainerTemplate } from '../templates/fixedCommentReplyContainer.js';
import { COMMENTS_VISIBLE } from '../bootstrap.js';
import { CommentService } from '../api/CommentService.js';
import { isEditing } from '../vhv-scripts/chords.js';
import { showChordEditor } from '../vhv-scripts/chords.js';
import { renderCollabMenuSidebar } from '../templates/collabMenu.js';
import { sendGroupedChangePitchActionIfChanged } from './sendGroupedActions.js';
import { getActionById, renderActions } from '../templates/actionHistory.js';
import { crossReferenceMultiTemplate, crossReferenceSingleTemplate } from '../templates/crossReferencingActions.js';

//alx
let prevStates;
let DEBUG = false;
function log(text) {
  if (DEBUG) {
    console.log(`[${new Date().toLocaleTimeString()}] ${text}`);
  }
}

export function formatUserElem(elem) {
  const [, qOn, qOff, pitchName, accidental, octave] = elem.classList;
  const formattedElem = {};
  // prettier-ignore
  formattedElem.attrs = formatAttributes({ qOn, qOff, pitchName, accidental, octave });
  // formattedElem.clientIds = Array.from(elem.clientIds);

  return JSON.stringify(formattedElem, null, 2);
}

function formatAttributes(attrs) {
  let qOn = parseQuarterTime(attrs.qOn);
  let qOff = parseQuarterTime(attrs.qOff);

  let duration = qOff - qOn;

  switch (duration) {
    case 0.25:
      duration = '1/4';
      break;
    case 0.5:
      duration = '1/2';
      break;
    case 1:
    case 2:
    case 4:
      duration = duration.toString();
      break;
    default:
      log('Uknown time duration value', duration);
      break;
  }

  let accidental = attrs.accidental.split('-')[1];
  switch (accidental) {
    case 'n':
      accidental = 'natural';
      break;
    case 's':
      accidental = 'sharp';
      break;
    case 'f':
      accidental = 'flat';
      break;
    case 'ff':
      accidental = 'double flat';
      break;
    case 'ss':
      accidental = 'double sharp';
      break;
    default:
      log('Uknown accidental value', accidental);
      break;
  }

  return {
    duration,
    pitch: attrs.pitchName.split('-')[1],
    accidental,
    octave: attrs.octave.split('-')[1],
  };
}

function parseQuarterTime(quarterTime) {
  let [qTimeValue, divisor] = quarterTime.split(/\D/).filter(Boolean);
  qTimeValue = parseInt(qTimeValue, 10);
  return quarterTime.includes('_') ? qTimeValue / divisor : qTimeValue;
}

function shareChordEdit(editInProgress) {
  const [
    ,
    {
      chordEdit: { selection },
      user: { color, name },
    },
  ] = editInProgress;
  if (!selection) return;

  const { component, text } = selection;
  if (!isEditing) {
    const allSelections = Array.from(
      document.querySelectorAll(`.${component}`)
    );
    const currentSelection = allSelections.find(
      (element) => element.innerText == text
    );
    const prevSelection = allSelections.find((element) =>
      element.classList.contains('collab-selected')
    );

    if (prevSelection) {
      $('.collab-selected').popover('dispose');
      prevSelection.classList.remove('collab-selected');
      prevSelection.style.color = 'white';
    }

    currentSelection.style.color = color;
    currentSelection.classList.add('collab-selected');
    $('.collab-selected').popover({
      placement: 'top',
      content: `${name}`,
    });
    $('.collab-selected').popover('show');
  }
}

function wrapChordEdit() {
  if (isEditing) {
    setTimeout(() => {
      yProvider.awareness.setLocalStateField('chordEdit', {
        isDisplayed: null,
        selection: null,
      });
    }, 1500);
  } else {
    $('.collab-selected').css('color', 'white');
    $('.collab-selected').popover('dispose');
    $('.collab-selected').removeClass('collab-selected');
    $('#show-chord-editor').modal('hide');
  }
}

function toggleChordEditor(allStates) {
  let isOn;
  //checking if any chordEdit status has been set true or false
  let editState = allStates.find(
    ([client, state]) => typeof state.chordEdit?.isDisplayed == 'boolean'
  );

  if (!editState) return;
  else isOn = editState[1].chordEdit.isDisplayed;

  if (!isOn) {
    wrapChordEdit();
  } else {
    if (!isEditing) {
      showChordEditor();
      return editState;
    }
  }
}

function defaultClients() {
  return {
    added: [],
    updated: [],
    removed: [],
  };
}

export function stateChangeHandler(clients = defaultClients()) {
  const awStates = Array.from(yProvider.awareness.getStates().entries());
  console.log({awStates});
  let collabContainer = document.querySelector('#output #collab');
  if (!collabContainer) {
    console.log(
      'Element div#collab is not found. Cannot render collaboration elements.'
    );
    collabContainer = document.createElement('div');
    collabContainer.id = 'collab';
    document.querySelector('#output')?.prepend(collabContainer);
  }

  // console.log('Updating awareness');

  let multiSelects = html`${awStates
    .filter(
      ([_, state]) => state.multiSelect != null && state?.user?.color != null
    )
    .map(([clientId, state]) =>
      multiSelectTemplate(
        clientId,
        clientId === yProvider.awareness.clientID,
        state.multiSelect,
        state.user.color
      )
    )}`;

  let singleSelects = html`${awStates
    .filter(
      ([_, state]) =>
        state?.singleSelect?.elemId != null && state?.user?.color != null
    )
    .map(([clientId, state]) =>
      singleSelectTemplate(
        clientId,
        state.singleSelect.elemId,
        state.user.color
      )
    )}`;

  let userAwareness = html`${awStates
    .filter(
      ([_, state]) =>
        state?.singleSelect?.elemId != null && state?.user?.name != null
    )
    .map(([clientId, state]) =>
      userAwarenessTemplate(
        clientId,
        state.singleSelect.elemId,
        state.user.name
      )
    )}`;

  // ${renderHighlightLayer(highlights, commentsGroup)} `,

  const editInProgress = toggleChordEditor(awStates);
  if (editInProgress) {
    shareChordEdit(editInProgress);
  }
      
  displayActionPanel(awStates);
  const finalRefs = selectActionsOnPanel(awStates);
  console.log({finalRefs});
  // Actions cross referencing
  const crossReferences = html`${finalRefs
    ?.map( ([actionId, selectionInfo]) => {

      const action = getActionById(+actionId);      
      if (
        action === undefined||
        action.content === undefined
      ) {
        return null;
      }
      
      switch (action.type) {
        case 'change_pitch': {
          if (action.content.type === 'single') {
            return crossReferenceSingleTemplate(
              actionId,
              selectionInfo.ids,
              action.content.changes[0]?.noteElementId,
              selectionInfo.color
            );
          } else if (action.content.type === 'multi') {
            return crossReferenceMultiTemplate(
              actionId,
              selectionInfo.ids,
              action.content.changes[0].map((el) => el.id),
              selectionInfo.color
            );
          }
        }
        case 'change_chord':
          return crossReferenceSingleTemplate(
            actionId,
            selectionInfo.ids,
            action.content.chordElementId,
            selectionInfo.color
          );
      }
    })}`;

  render(
    html`${collabLayer(
      multiSelects,
      singleSelects,
      crossReferences,
      userAwareness,

    )}`,
    collabContainer
  );

  renderCollabMenuSidebar(); //TODO: isws xreiazetai na kaleitai 1 fora kapou allou. outws i allws to user list ananewnetai me ton update handler

  sendGroupedChangePitchActionIfChanged(clients);
}
//alx
export function awaranessUpdateHandler() {
  const usersToRender = formatUserList();
  renderUserList(usersToRender);
}
function selectActionsOnPanel(allStates) {
  clearActionSelections();  
  //rendering current selections
  const actionsContainer = document.getElementById(
    'action-history-container'
  );
  const actionsSelected = allStates
    .filter( ([_, state]) => state.referenceAction?.actionId != null )
    .map(
      el => {
        return {
          id : el[1].user.id,
          name : el[1].user.name,
          color: el[1].user.color,
          actionId : el[1].referenceAction.actionId,
      } 
    })
    .reduce((prev, curr) => {
      return curr.id in prev?
        prev:
        {...prev,
         [curr.id]: {name:curr.name, actionId:curr.actionId, color: curr.color}
        }
      },
    {});
  console.log({actionsSelected});
  let finalRefs = {};  
  for (const [id, selection] of Object.entries(actionsSelected)) {
    const cssSelector = `button[data-action-id="${selection.actionId}"]`;
    const actionEntry = document.querySelector(cssSelector);
    console.log({actionEntry});

    if(!actionEntry) return; //TODO: se auton pou den exei anoixei to panel, to function ekteleitai prin prolavei na ginei to renderActions kai stamataei edw. sti deuteri ektelesi(actionPanelDiaplyes:false) ekteleitai oli.

    const thisSelector = `${id}-${selection.name}-${selection.color}`;
    (actionEntry.dataset.selectors=='null' || actionEntry.dataset.selectors===undefined) ?
      actionEntry.dataset.selectors = `${thisSelector}`:
      actionEntry.dataset.selectors += `, ${thisSelector}`;


    const allSelectors = actionEntry.dataset.selectors;
    const names = allSelectors
      .replace(/\d+-([^-]*)-[^,]*/g, '$1')
    const ids = allSelectors
      .replace(/(\d+)-[^-]*-[^,]*/g, '$1')
    const color = !names.includes(',') ?
      allSelectors.match(/#[^,]*/)?.[0] :
      'black';      
    console.log({color, ids, names});

    actionEntry.classList.add('action-selected');
    actionEntry.dataset.content = names;
    actionEntry.closest('h2').style.border = `medium dashed ${color}`;
    $(cssSelector).popover({
      placement: 'top',
      container: actionsContainer,
    });
    $(cssSelector).popover('show');

    finalRefs[selection.actionId] = {ids, color};
  }
  return [...Object.entries(finalRefs)];
}

export function clearActionSelections() {
  let actionsSel = $('.action-selected');
  console.log({actionsSel});
  console.log(document.querySelectorAll('.action-selected'));
  $('.action-selected').popover('dispose');
  document.querySelectorAll('.action-selected')
    .forEach(prevSelection => {
      prevSelection.classList.remove('action-selected');
      prevSelection.dataset.selectors = null;
      prevSelection.closest('h2').style.border = 'none';
    });
}

function displayActionPanel (allStates) {
  const panelDisplayStates = allStates
    .find( ([id, state]) => state.referenceAction?.ActionPanelDisplayed );
  console.log({panelDisplayStates});
  const actionsContainer = document.getElementById(
    'action-history-container'
  );
  console.log({actionsContainer});
  const alreadyDisplayed = actionsContainer.classList.contains('open');
  console.log({alreadyDisplayed});
  if (panelDisplayStates && !alreadyDisplayed) {
    console.log('open')
    actionsContainer.classList.toggle('open', true);
    renderActions();
  }
}

function formatUserList() {
  const currentStates = yProvider.awareness.getStates();

  const connectedUsers = [...currentStates.entries()].map(
    (e) => (e = e[1].user)
  );
  connectedUsers.forEach((user) => (user.online = true));

  if (!prevStates) {
    prevStates = [...currentStates];
    return connectedUsers;
  }

  const disconnectedUser = prevStates
    .filter((el) => !currentStates.has(el[0]))
    .map((e) => (e = e[1].user));
  disconnectedUser.forEach((user) => (user.online = false));

  prevStates = [...currentStates];
  return [...connectedUsers, ...disconnectedUser];
}

function collabLayer(...children) {
  let output = document.querySelector('#output');
  let renderBefore = document.querySelector('#output > svg');
  uiCoords.svgHeight = renderBefore?.height.baseVal.value ?? window.innerHeight;
  
  return collabTemplate(uiCoords.svgHeight, ...children);
}

export function commentsObserver(elementsInFocus = {}) {
  let commentsContainer = document.querySelector('#output #comments-layer');
  if (!commentsContainer) {
    commentsContainer = document.createElement('div');
    commentsContainer.id = 'comments-layer';
    document.querySelector('#output')?.prepend(commentsContainer);
  }

  const service = new CommentService();
  let commentsList = service.fromJSON();

  let highlights = html`${COMMENTS_VISIBLE
    ? commentsList
        .filter((c) => c.parentCommentId === null)
        .map((c) => ({
          comment: c,
          coords: multiSelectCoords(c.multiSelectElements.split(',')),
        }))
        .map((data) =>
          highlightTemplate(data.comment, data.coords, elementsInFocus)
        )
    : null}`;

  const comments = findCommentGroupForFocusedElement(
    elementsInFocus,
    commentsList
  );
  const commentsGroup =
    comments?.length > 0 ? fixedCommentReplyContainerTemplate(comments) : null;

  render(renderHighlightLayer(highlights, commentsGroup), commentsContainer);
}

function findCommentGroupForFocusedElement(elementsInFocus, commentsList) {
  if (typeof elementsInFocus != 'undefined') {
    const comment = commentsList.find(
      (comment) => comment.id === Object.keys(elementsInFocus)[0]
    );

    if (comment) {
      const replies = commentsList.filter(
        (reply) => reply.parentCommentId === comment.id
      );
      return [].concat(comment, replies);
    }
  }

  // Find focused element
  const focusedElement = document.querySelector('.highlight-area-focus');
  if (!focusedElement) return [];

  // Filter Y.Array comments by focused element comment id
  const comment = commentsList.find(
    (comment) => comment.id === focusedElement?.dataset.commentId
  );
  if (comment) {
    const replies = commentsList.filter(
      (reply) => reply.parentCommentId === comment.id
    );
    return [].concat(comment, replies);
  }
}

export function renderHighlightLayer(...children) {
  let output = document.querySelector('#output');
  let svg = document.querySelector('#output > svg');

  let collab = output.querySelector('#collab-container');
  let svgHeight = svg?.height.baseVal.value ?? window.innerHeight;

  return highlightLayerTemplate(svgHeight, ...children);
}

export function addListenersToOutput(outputTarget) {
  let startTime, endTime;
  let shouldMultiSelect = false;
  const rbSelection = new RubberBandSelection();

  console.log('>>>Adding listeners to output');

  document.addEventListener('mousedown', (event) => {
    // Start selecting only when there isn't a note element on the cursor
    if (event.target.nodeName != 'svg') return;

    startTime = performance.now();

    rbSelection.isSelecting = true;
    rbSelection.setUpperCoords(event);
    const selectedAreas = document.querySelectorAll('.multi-select-area');

    const selectToRemove = [...selectedAreas].find(
      (elem) => elem.dataset.clientId == yProvider.awareness.clientID
    );
    if (selectToRemove) {
      yProvider.awareness.setLocalStateField('multiSelect', null);
    }
  });

  // TODO: Use requestAnimationFrame
  document.addEventListener('mousemove', (event) => {
    if (rbSelection.isSelecting) {
      endTime = performance.now();
      let timePassed = endTime - startTime;

      if (timePassed >= 300) {
        rbSelection.setLowerCoords(event);

        rbSelection.show();

        shouldMultiSelect = true;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    rbSelection.reCalculateCoords();
    rbSelection.isSelecting = false;

    if (shouldMultiSelect) {
      // TODO: extremely inefficient, selecting every single note element
      const notes = Array.from(document.querySelectorAll('.note, .beam'));
      const selectedElements = rbSelection.selectNoteElements(notes);

      setNoteBounds(selectedElements);

      const multiSelectedNotes = selectedElements
        .map((note) => note.id)
        .filter((id) => /^note/g.test(id));

      if (multiSelectedNotes.length > 0) {
        let oldStateCopy = structuredClone(
          yProvider?.awareness?.getLocalState()
        );
        yProvider?.awareness?.setLocalState({
          ...oldStateCopy,
          singleSelect: null,
          multiSelect: multiSelectedNotes,
        });
      }

      shouldMultiSelect = false;
    }

    rbSelection.resetCoords();
    // rbSelection.selectAreaElem.hidden = true;
    rbSelection.hide();
    startTime = endTime = undefined;
  });
}

function createNoteBounds() {
  /** @type {HTMLElement | null} */ let leftMost = null;
  /** @type {HTMLElement | null} */ let rightMost = null;

  return {
    /**
     *
     * @param {HTMLElement | null} left
     * @param {HTMLElement | null} right
     */
    setBounds(left, right) {
      if (left) {
        leftMost = left;
      }

      if (right) {
        rightMost = right;
      }
    },
    /**
     *
     * @returns {{ leftMost: HTMLElement | null, rightMost: HTMLElement | null}}
     */
    getBounds() {
      return { leftMost, rightMost };
    },
  };
}

export let noteBounds = createNoteBounds();
/**
 *
 * @param {HTMLElement[]} selectedElements
 */
function setNoteBounds(selectedElements) {
  if (selectedElements.length > 0) {
    let selectedNotes = [...selectedElements].map((elem) => {
      return elem.classList.contains('beam')
        ? elem.querySelector('.note')
        : elem;
    });

    let { leftMost, rightMost } = findLeftMostAndRightMost(selectedNotes);
    if (leftMost && rightMost) {
      noteBounds.setBounds(leftMost, rightMost);
    }

    console.log({ leftMost, rightMost });
    if (leftMost) {
      global_cursor.CursorNote = leftMost;
    }
  }
}

function findLeftMostAndRightMost(selectedNotes) {
  let leftMost = selectedNotes[0];
  let rightMost = selectedNotes[0];
  for (let note of selectedNotes.slice(1)) {
    let noteBox = note.getBoundingClientRect();
    if (noteBox.left < leftMost?.getBoundingClientRect().left) {
      leftMost = note;
    }

    if (noteBox.left > rightMost?.getBoundingClientRect().left) {
      rightMost = note;
    }
  }
  return { leftMost, rightMost };
}
