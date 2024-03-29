import { permanentUserData, yProvider } from '../yjs-setup.js';
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
import { isEditing, showChordEditor, backBtn, doneBtn } from '../vhv-scripts/chords.js';
import { renderCollabMenuSidebar } from '../templates/collabMenu.js';
import { sendGroupedChangePitchActionIfChanged } from './sendGroupedActions.js';
import { getActionById, renderActions } from '../templates/actionHistory.js';
import { crossReferenceMultiTemplate, crossReferenceSingleTemplate } from '../templates/crossReferencingActions.js';
import { freezeInterface } from '../vhv-scripts/utility-svg.js';
import { notify, setUserImageUrl } from './util-collab.js';
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
    setTimeout(
      () => yProvider.awareness.setLocalStateField('chordEdit', null),
      200
    );
    return;
  }

  backBtn.style.visibility = 'visible';
  doneBtn.style.visibility = 'visible';
  
  $('.collab-selected').css('color', 'white');
  $('.collab-selected').popover('dispose');
  $('.collab-selected').removeClass('collab-selected');
  $('#show-chord-editor').modal('hide');
}

function toggleChordEditor(allStates) {
  let isOn;
  //checking if any chordEdit status has been set true or false
  let editState = allStates.find(
    ([client, state]) => typeof state.chordEdit?.editorDisplayed == 'boolean'
  );

  if (!editState) return;
  else isOn = editState[1].chordEdit.editorDisplayed;

  if (!isOn) {
    wrapChordEdit();
  } else {
    if (!isEditing) {
      showChordEditor();
      return editState;
    }
  }
}

function toggleInterfaceFreeze (states) {
  if (isEditing)    return;
  
  const freezeState = states
    .find(
    ([client, state]) => state.chordEdit?.interfaceFreeze == true
  );
  const toBeFrozen = freezeState?.[1].chordEdit.interfaceFreeze;
  if (toBeFrozen) {
    freezeInterface('Chord edit');
  } else {
    $('#freeze-interface').hasClass('show')
      ? $('#freeze-interface').modal('hide')
      : null;
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
        state.user.color,
        state.user.name
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
  editInProgress
    ? shareChordEdit(editInProgress)
    : null;
  toggleInterfaceFreeze(awStates);
  
  const panelIsDiplayed = displayActionPanel(awStates);
  clearPrevSelections();
  const finalRefs = panelIsDiplayed ?
    selectActionsOnPanel(awStates) :
    null;
  const crossReferences = html`${ finalRefs?.map( mapCrossRefs ) }`;

  render(
    html`${collabLayer(
      multiSelects,
      singleSelects,
      crossReferences,
      userAwareness,

    )}`,
    collabContainer
  );

  actOnRecordStateChange(awStates);
  actOnTimeInRecordingStateChange(awStates);
  actOnTranscriptionStateChange(awStates);
  actOnRecordSyncStateChange(awStates);

  actOnReplayActionStateUpdate(awStates);

  renderCollabMenuSidebar(); //TODO: isws xreiazetai na kaleitai 1 fora kapou allou. outws i allws to user list ananewnetai me ton update handler

  sendGroupedChangePitchActionIfChanged(clients);
}
//alx
export function awaranessUpdateHandler() {
  const usersToRender = formatUserList();
  renderUserList(usersToRender);
}

function actOnReplayActionStateUpdate(awStates) {
  const myClientId = yProvider.awareness.clientID;
  const replayActionStateUpdates = awStates
    .filter( ([id, state]) => state.replayAction)
    .map( ([id, state]) => {
      return {
        clickerId: id,
        clickerName: state.user.name,
        id: state.replayAction.id,
        type: state.replayAction.type
    }});
  
  if (!replayActionStateUpdates.length)
    return;

  replayActionStateUpdates.forEach(state => {
    const meClicking = (state.clickerId === myClientId);

    //users' notification about action undoing
    const notifText = `${state.clickerId} has undone '${state.type}' action`
    const notifContext = 'info'
    notify(notifText, notifContext);

    //modifying actionPanel UI
    document
      .querySelector(`button[data-action-id="${state.id}"]`)
      .parentElement
      .classList.add('action-undone');
    
    if (meClicking) {
      setTimeout(
        () => yProvider?.awareness?.setLocalStateField('replayAction', null),
        100
      );
    }

  })
}

function actOnTranscriptionStateChange(awStates) {
  const myClientId = yProvider.awareness.clientID;
  const transcriptionStateUpdates = awStates
    .filter( ([id, state]) => state.transcription)
    .map( ([id, state]) => {
      return {
        transcriberId: id,
        status: state.transcription.status,
        transcriberName: state.user.name,
    }});
  
  if (!transcriptionStateUpdates.length)
    return;

  transcriptionStateUpdates.forEach(state => {
    const myStateUpdating = (state.transcriberId === myClientId);

    switch (state.status) {
      case 'requested': actOnRequestTranscription(myStateUpdating, state.transcriberName);
        break;
      case 'received': actOnReceiveTranscription(myStateUpdating, state.transcriberName);
        break;
      case 'inProgress': null //in case transcriptionState is re-sent after transcription has been requested started and before its received,...
        break; //...during triggering of awareness state change handler because of another awareness action (e.g. note selection), nothing happens
    }
  })
}

function actOnRequestTranscription(me, transcriberName) {
  //enter an 'inProgress' status so that 'requested' status events don t run multiply
  //e.g. in cases where transcription has been requested and before it is received, awareness state change handler is triggered by another awareness action (e.g. note selection)
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('transcription', {status: 'inProgress'}),
      100);
    return;
  }

  //notifying that a user has requested transcription
  const notifText = `${transcriberName} has requested recording transcription to score.`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //UI changes
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  const transcriptionInfoSpan = document.createElement('span');
  transcriptionInfoSpan.id = 'transcriptionInfo';
  transcriptionInfoSpan.innerText = `Loading new score...`
  recBtnsGUI.appendChild(transcriptionInfoSpan);

  const transcribeButton = document.getElementById("Transcribe"); 
  transcribeButton.setAttribute('disabled', true);
}

function actOnReceiveTranscription(me, recorderName, recDataURL, recordingName) {
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('transcription', null),
      100);
    return;
  }

  //notifying that user has received transcribed kern
  const notifText = `New score file has been received!`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //UI changes
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  const transcriptionInfoSpan = document.getElementById('transcriptionInfo');
  const transcribeButton = document.getElementById("Transcribe"); 

  recBtnsGUI.removeChild(transcriptionInfoSpan);  
  transcribeButton.removeAttribute('disabled');
}

function actOnRecordSyncStateChange(awStates) {
  const myClientId = yProvider.awareness.clientID;
  const recordSyncStateUpdates = awStates
    .filter( ([id, state]) => state.recordSync)
    .map( ([id, state]) => {
      return {
        clickerId: id,
        clickerName: state.user.name,
        status: state.recordSync
    }});
  
  if (!recordSyncStateUpdates.length)
    return;

  recordSyncStateUpdates.forEach(state => {
    const meClicking = (state.clickerId === myClientId);

    switch (state.status) {
      case 'clicked': actOnRecSyncClick(meClicking, state.clickerName);
        break;
      case 'completed': actOnRecSyncCompleted(meClicking)
        break; 
      case 'inProgress': null //in case recordSyncState is resent after rec has started and before its stopped,...
        break; //...during triggering of awareness state change handler because of another awareness action (e.g. note selection), nothing happens
    }
  })
}

function actOnRecSyncCompleted (me) {
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('recordSync', null),
      100);
    return;
  }

  //notifying that user has stopped the rcording
  const notifText = `Recording synchronization result ready. 'Go to Selection' button is now enabled.`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //restoring the recording controls' GUI and activating Go To Selection Button
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  const recInfoSpan = document.getElementById('recInfo');
  recBtnsGUI.removeChild(recInfoSpan);  
  [...recBtnsGUI.children]
    .forEach( e => {
      if (e.id != 'toggleMute')
        e.removeAttribute('hidden')
    });
  document.querySelector('#GotoSelectionButton')
    .removeAttribute('disabled');
}

function actOnRecSyncClick (me, clickerName) {
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('recordSync', {status: 'inProgress'}),
      100);
    return;
  }

  //notifying that user has clicked sync recording
  const notifText = `${clickerName} has clicked 'Recording Synchronize' button. Result pending...`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //modifying the recording controls' GUI and hiding current recording
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  [...recBtnsGUI.children]
    .forEach( e => e.setAttribute('hidden', true) );
  const recInfoSpan = document.createElement('span');
  recInfoSpan.id = 'recInfo';
  recInfoSpan.innerText = `${clickerName} has requested recording synchronization!`
  recBtnsGUI.appendChild(recInfoSpan);
}

function actOnRecordStateChange(awStates) {
  const myClientId = yProvider.awareness.clientID;
  const recordStateUpdates = awStates
    .filter( ([id, state]) => state.record)
    .map( ([id, state]) => {
      return {
        recorderId: id,
        status: state.record.status,
        recorderName: state.user.name,
        recDataURL: state.record.recDataURL,
        recordingName: state.record.name
    }});
  
  if (!recordStateUpdates.length)
    return;

  recordStateUpdates.forEach(state => {
    const myStateUpdating = (state.recorderId === myClientId);

    switch (state.status) {
      case 'started': actOnStartRecording(myStateUpdating, state.recorderName);
        break;
      case 'stopped': actOnStopRecording(myStateUpdating, state.recorderName);
        break; 
      case 'received': actOnReceiveRecording(myStateUpdating, state.recorderName, state.recDataURL, state.recordingName);
      case 'inProgress': null //in case recordState is re-sent after rec has started and before its stopped,...
        break; //...during triggering of awareness state change handler because of another awareness action (e.g. note selection), nothing happens
    }
  })
}

function actOnStartRecording(me, recorderName) {
  //enter an 'inProgress' status so that 'started' status events don t run multiply
  //e.g. in cases where rec has started and before it stops, awareness state change handler is triggeres by another awareness action (e.g. note selection)
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('record', {status: 'inProgress'}),
      100);
    return;
  }

  //notifying that a user has started recording
  const notifText = `${recorderName} has started recording. You cannot record at the same time.`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //modifying the recording controls' GUI and hiding current recording
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  [...recBtnsGUI.children]
    .forEach( e => e.setAttribute('hidden', true) );
  const recInfoSpan = document.createElement('span');
  recInfoSpan.id = 'recInfo';
  recInfoSpan.innerText = `${recorderName} is recording!`
  recBtnsGUI.appendChild(recInfoSpan);
  document.querySelector('#play_wave')
    .setAttribute('hidden', 'true');
  
  //configuring wavesurfer
  if (!window.wavesurfer) {
    window.setupWaveSurfer();
  }

}

function actOnStopRecording (me, recorderName) {
  if (me)
    return;

  //notifying that user has stopped the recording
  const notifText = `${recorderName} has stopped recording. Recording file will be received shortly.`
  const notifContext = 'info'
  notify(notifText, notifContext);

  const recInfoSpan = document.getElementById('recInfo');
  recInfoSpan.innerText = `Receiving recording file!`;
}

function actOnReceiveRecording(me, recorderName, recDataURL, recordingName) {
  if (me) {
    setTimeout(
      () => yProvider.awareness.setLocalStateField('record', null),
      100);
    return;
  }

  //notifying that user has stopped the recording
  const notifText = `Recording file has been received. You can now record at will!`
  const notifContext = 'info'
  notify(notifText, notifContext);

  //restoring the recording controls' GUI and activating Play/Pause, Rewind and Go To Selection Buttons
  const recBtnsGUI = document.querySelector('#control_section_buttons');
  const recInfoSpan = document.getElementById('recInfo');
  recBtnsGUI.removeChild(recInfoSpan);  
  [...recBtnsGUI.children]
    .forEach( e => {
      if (e.id != 'toggleMute')
        e.removeAttribute('hidden')
    });
  document.querySelector('#PlayPause')
    .removeAttribute('disabled');
  document.querySelector('#Stop')
    .removeAttribute('disabled');
  document.querySelector('#play_wave')
    .removeAttribute('hidden');
  
  //setting global collabRec (indicates if current recording comes from collaborator or not) parameter...
  //... as well as global recName and recUrl params (for use when downloading the recording)
  window.collabRec = true;
  window.collabRecName = recordingName;
  window.collabRecUrl = recDataURL;


  //clearing previous wavesurfer data and manifesting the (new) recording
  window.wavesurfer.load(recDataURL);
}

function actOnTimeInRecordingStateChange(awStates) {
  const myClientId = yProvider.awareness.clientID;
  const recTimeStateChange = awStates
    .filter( ([id, state]) => state.recTime)
    .map( ([id, state]) => {
      return {
        synchronizerId: id,
        time: state.recTime
    }});

  if (!recTimeStateChange.length)
    return;

  recTimeStateChange.forEach(state => {
    const myStateUpdating = (state.synchronizerId === myClientId);
    if (myStateUpdating) {
      setTimeout(
        () => yProvider.awareness.setLocalStateField('recTime', null),
        100
      );
      return;
    }
    window.wavesurfer.setCurrentTime(state.time);
  }) 
}

function mapCrossRefs ( [actionId, selectionInfo] ) {
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
          selectionInfo.names,
          action.content.changes[0]?.noteElementId,
          selectionInfo.color
        );
      } else if (action.content.type === 'multi') {
        return crossReferenceMultiTemplate(
          actionId,
          selectionInfo.names,
          action.content.changes[0].map((el) => el.id),
          selectionInfo.color
        );
      }
    }
    case 'change_chord':
      return crossReferenceSingleTemplate(
        actionId,
        selectionInfo.names,
        action.content.chordElementId,
        selectionInfo.color
      );
    case 'add_comment':
      return crossReferenceSingleTemplate(
        actionId,
        selectionInfo.names,
        action.content.id,
        selectionInfo.color,
        action.type
      )
  }
}
function selectActionsOnPanel(allStates) {
  const actionsContainer = document.getElementById(
    'action-history-container'
  );
  const actionsSelected = allStates
    .filter( ([_, state]) => state.referenceAction?.actionId != null )
    .map(
      el => {
        return {
          name : el[1].user.name,
          color: el[1].user.color,
          actionId : el[1].referenceAction.actionId,
      } 
    })
    .reduce((prev, curr) => {
      return curr.name in prev?
        prev:
        {...prev,
         [curr.name]: {actionId:curr.actionId, color: curr.color}
        }
      },
    {});
  let finalRefs = {};  
  for (const [user, selection] of Object.entries(actionsSelected)) {
    const cssSelector = `button[data-action-id="${selection.actionId}"]`;
    const actionEntry = document.querySelector(cssSelector);

    if(!actionEntry) return; //TODO: se auton pou den exei anoixei to panel, to function ekteleitai prin prolavei na ginei to renderActions kai stamataei edw. sti deuteri ektelesi(actionPanelDiaplyes:false) ekteleitai oli.

    const thisSelector = `${user}-${selection.color}`;
    (actionEntry.dataset.selectors=='null' || actionEntry.dataset.selectors===undefined) ?
      actionEntry.dataset.selectors = `${thisSelector}`:
      actionEntry.dataset.selectors += `, ${thisSelector}`;


    const allSelectors = actionEntry.dataset.selectors;
    const names = allSelectors
      .replace(/([^-]*)-[^,]*/g, '$1')
    const color = !names.includes(',') ?
      allSelectors.match(/#[^,]*/)?.[0] :
      'black';      

    actionEntry.classList.add('action-selected');
    actionEntry.dataset.content = names;
    actionEntry.closest('h2').style.border = `medium dashed ${color}`;
    $(cssSelector).popover({
      placement: 'top',
      container: actionsContainer,
    });
    $(cssSelector).popover('show');

    finalRefs[selection.actionId] = {names, color};
  }
  return [...Object.entries(finalRefs)];
}

export function clearPrevSelections() {
  let actionsSel = $('.action-selected');
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

  const actionsContainer = document.getElementById(
    'action-history-container'
  );
  const alreadyDisplayed = actionsContainer.classList.contains('open');
  if (panelDisplayStates && !alreadyDisplayed) {
    actionsContainer.classList.toggle('open', true);
    renderActions();
  }
  return actionsContainer.classList.contains('open');
}

function formatUserList() {
  const awStates = yProvider.awareness.getStates();
  let connectedUsers = [...awStates.entries()].map(
    (e) => (e = `user=${e[1].user.name} id=${e[1].user.id}`)
  );

  let disconnectedUsers = [...permanentUserData.clients.values()].filter(
    (entry) => !connectedUsers.includes(entry)
  );

  connectedUsers = [...new Set(connectedUsers)]
    .map((entry) => entry.concat(" status=online"))
    .map((entry) => {
      const data = entry.match(
        /user=(?<name>.+?) id=(?<id>\d+) status=(?<status>\w+)/
      )?.groups;
      return data;
    });
  connectedUsers.forEach((user) => {
    if (user !== null && user !== undefined) {
      user.imageSrc = setUserImageUrl(user.id);
    }
  });

  disconnectedUsers = [...new Set(disconnectedUsers)]
    .map((entry) => entry.concat(" status=offline"))
    .map((entry) => {
      const data = entry.match(
        /user=(?<name>.+?) id=(?<id>\d+) status=(?<status>\w+)/
      ).groups;
      return data;
    });
  disconnectedUsers.forEach(
    (user) => (user.imageSrc = setUserImageUrl(user.id))
  );

  return [ ...connectedUsers, ...disconnectedUsers ];
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
