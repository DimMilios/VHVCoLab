import { getAceEditor } from './setup';
import { yProvider } from '../yjs-setup';
import { display_mapping, send_mapping, send_display_mapping } from './chord_mappings.js';
import { ActionPayload, sendAction } from '../api/actions';
import { global_cursor, global_interface } from './global-variables';
import { getMusicalParameters } from './utility';
import { freezeInterface } from './utility-svg';

//defining variables and functions to be used
const chordEditor = document.getElementById('chord-editor');
const chordBtns = document.getElementById('show-edit-suggest-buttons');
const editBtn = document.getElementById('edit-btn');
const suggestBtn = document.getElementById('suggest-btn');
export const doneBtn = document.getElementById('done-btn');
export const backBtn = document.getElementById('back-btn');

export let chord = {
  current: null,
  new: {
    root: null,
    accidental: null,
    variation: null,
  },
  reharmonize: false,
};
export let chordLocation = {};

export let isEditing;

const GJTBaseUrl = 'https://maxim.mus.auth.gr:6001/sending_kern';

export function showChordEditor() {
  chordBtns.style.visibility = 'hidden';

  $('#show-chord-editor').modal('show');

  doneBtn.style.visibility = 'hidden';

  !isEditing
    ? backBtn.style.visibility = 'hidden'
    : null ;
}

function setURLParams(reqURL, chordEditInfo) {
  for (let [key, value] of Object.entries(chordEditInfo)) {
    if (typeof value === 'object' && value !== null)
      setURLParams(reqURL, value);
    else reqURL.searchParams.set(`${key}`, `${value}`);
  }
}

function cleanUpSelections() {
  Object.keys(chord.new).forEach(
     key => chord.new[key] = null
  );
}

function select(selection, component) {
  selection.style.color = 'tomato';
  chord.new[component] = selection.innerText;

  yProvider?.awareness?.setLocalStateField('chordEdit', {
    editorDisplayed: true,
    selection: {
      component,
      text: selection.innerText,
    },
  });

  if (chord.new.root && chord.new.variation) {
    doneBtn.style.visibility = 'visible';
  }
}

function decolorizeSelections(selectionComponent) {
  let selections;
  if (selectionComponent) {
    selections = document.querySelectorAll(`td.${selectionComponent}`);
  } else {
    selections = document.querySelectorAll(`#chord-editor td`);
  }

  for (let one of selections) one.style.color = 'white';
}

export function mapChord(chordText, mapType, inversely = false) {
  const mapping = (mapType == 'display')
    ? display_mapping
    : send_mapping;

  const encodingsInc = inversely 
    ? [...Object.values(mapping)].filter((enc) =>
        chordText.includes(enc)
      )
    : [...Object.keys(mapping)].filter((enc) =>
        chordText.includes(enc)
      )
    ;
  inversely
    ? encodingsInc.forEach( enc => 
        chordText = chordText
          .replace(
            enc,
            `${Array.from( Object.keys(mapping) )
              .find(key => mapping[key] == enc)
            }`
          )
      )
    : encodingsInc.forEach(
      (enc) => (chordText = chordText.replace(enc, `${mapping[enc]}`))
    )
    ;

  return chordText;
}

function sendChordEditAction(chordClone) {
  const mapType = chordClone.reharmonize
    ? 'display'
    : 'send';

  const newValue = chordClone.new.root +
    mapChord(
      `${chordClone.new.accidental ?? ''}` + ' ' + chordClone.new.variation,
      mapType, false
    );
  const prevValue = mapChord(chordClone.current, 'display');

  const chordElementId = `harm-L${chordLocation.line}F${chordLocation.column}`;
  const {measureNo} = getMusicalParameters(
    global_cursor.CursorNote
  );

  sendAction(
    new ActionPayload({
      type: 'change_chord',
      content: JSON.stringify({
        prevValue,
        newValue,
        chordElementId,
        measureNo,
        line: parseInt(chordLocation.line),
        field: parseInt(chordLocation.column),
      }),
    })
  )
    .then(() => console.log(`change_chord action was sent.`))
    .catch(error => console.error(`Failed to send change_chord action. Error: ${error}`));
}

function requestChordEdit(reqURL, editor, chordClone, clickHandling) {
  //initializing, configuring and sending the request
  
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', reqURL);
  xhttp.responseType = 'json';
  xhttp.send();

  //defining response function
  xhttp.onload = function () {
    //retrieveing json sent from GJT server
    const jsonResponse = xhttp.response;
    console.log(jsonResponse);

    //getting the SUGGESTED chord
    if (clickHandling && chordClone.reharmonize) {
      chordClone.new = jsonResponse.newchord
        .match (/(?<root>\w)(?<accidental>\+|&)? (?<variation>\S)/)
        .groups;
    }

    //submitting change_chord action to server
    clickHandling
      ? sendChordEditAction(chordClone)
      : null;

    $('#freeze-interface').modal('hide')
    yProvider?.awareness?.setLocalStateField('chordEdit', {
      editorDisplayed: null,
      selection: null,
      interfaceFreeze: false,
    });

    editor.setValue(jsonResponse.new);
  };

  xhttp.onerror = () => {
    console.log('Chord edit failed!');
    $('#freeze-interface').modal('hide')

    yProvider?.awareness?.setLocalStateField('chordEdit', {
      editorDisplayed: null,
      selection: null,
      interfaceFreeze: false,
    });
  };
  
}

export function editChord(clickHandling = true, replayInfo = null) {
  //current kern retrieval
  const edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined');
  }

  const kernfile = edtr.session.getValue();
  let reqUrl = new URL(GJTBaseUrl);

  //setting the suggestion option true
  if (clickHandling) {
    this == suggestBtn
      ? chord.reharmonize = true
      : null;
  }

  //setting the url to be used and performing xhttp request
  const chordEditInfo = {
    kernfile,
    chordLocation: clickHandling ? chordLocation : replayInfo.location,  
    chord: clickHandling ? chord : replayInfo.chord,
  };
  setURLParams(reqUrl, chordEditInfo);

  const chordClone = clickHandling 
    ? structuredClone(chord)
    : replayInfo.chord 
  requestChordEdit( reqUrl, edtr, chordClone, clickHandling );
  freezeInterface('Chord edit');

  if (clickHandling && this == suggestBtn) {
    yProvider?.awareness?.setLocalStateField('chordEdit', {
      editorDisplayed: null,
      selection: null,
      interfaceFreeze: true,
    });
    chord.reharmonize = false;
    chordBtns.style.visibility = 'hidden';

  } else if (clickHandling && this == doneBtn) {
    decolorizeSelections();
    yProvider?.awareness?.setLocalStateField('chordEdit', {
      editorDisplayed: false,
      selection: null,
      interfaceFreeze: true
    });
    isEditing = false;
  }

  clickHandling
    ? cleanUpSelections()
    : null;
}

chordEditor.addEventListener('click', (event) => {
  if (event.target.tagName !== 'TD' || !isEditing) return;

  const [selection, component] = [event.target, event.target.className];

  decolorizeSelections(component);
  select(selection, component);
});

//back click
backBtn.addEventListener('click', function (event) {
  cleanUpSelections();
  decolorizeSelections();

  if (event.isTrusted) {
    yProvider?.awareness?.setLocalStateField('chordEdit', {
      editorDisplayed: false,
      selection: null,
    });
  }

  isEditing = false;
});

//edit click
editBtn.addEventListener('click', (event) => {
  isEditing = true;
  showChordEditor();
  yProvider?.awareness?.setLocalStateField('chordEdit', {
    editorDisplayed: true,
    selection: null,
  });
});
//suggest click
suggestBtn.addEventListener('click', () => editChord.bind(suggestBtn, true, null)());
//done click
doneBtn.addEventListener('click', () => editChord.bind(doneBtn, true, null)());