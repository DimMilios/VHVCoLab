import { getAceEditor } from './setup';
import { yProvider } from '../yjs-setup';
import { display_mapping, send_mapping } from './chord_mappings.js';
import { ActionPayload, sendAction } from '../api/actions';

//defining variables and functions to be used
const chordEditor = document.getElementById('chord-editor');
const chordBtns = document.getElementById('show-edit-suggest-buttons');
const editBtn = document.getElementById('edit-btn');
const suggestBtn = document.getElementById('suggest-btn');
const doneBtn = document.getElementById('done-btn');
const backBtn = document.getElementById('back-btn');

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

  doneBtn.style.display = 'none';

  if (!isEditing) backBtn.style.display = 'none';
}

function setURLParams(reqURL, chordEditInfo) {
  for (let [key, value] of Object.entries(chordEditInfo)) {
    if (typeof value === 'object' && value !== null)
      setURLParams(reqURL, value);
    else reqURL.searchParams.set(`${key}`, `${value}`);
  }
}

function cleanUpSelections() {
  Object.values(chord.new).forEach((value) => (value = null));

  decolorizeSelections();
}

function select(selection, component) {
  selection.style.color = 'tomato';
  chord.new[component] = selection.innerText;

  yProvider.awareness.setLocalStateField('chordEdit', {
    isDisplayed: true,
    selection: {
      component,
      text: selection.innerText,
    },
  });

  if (chord.new.root && chord.new.variation) {
    doneBtn.style.display = 'block';
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

function mapChord(chordText, mapType) {
  let mapping;
  if (mapType == 'display') {
    mapping = display_mapping;
  } else {
    mapping = send_mapping;
  }

  const encodingsInc = [...Object.keys(mapping)].filter((enc) =>
    chordText.includes(enc)
  );
  encodingsInc.forEach(
    (enc) => (chordText = chordText.replace(enc, `${mapping[enc]}`))
  );

  return chordText;
}

function requestChordEdit(reqURL, editor) {
  //initializing, configuring and sending the request
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', reqURL);
  xhttp.responseType = 'json';
  xhttp.send();

  //defining response function
  xhttp.onload = function () {
    //retrieveing json sent from GJT server
    let jsonResponse = xhttp.response;
    console.log(jsonResponse);

    //submitting change_chord action to server. TODO: suggest
    const prevValue = mapChord(chord.current, 'display');
    const newValue =
      chord.new.root +
      mapChord(
        `${chord.new.accidental ?? ''}` + ' ' + chord.new.variation,
        'send'
      );
    const chordElementId = `L${chordLocation.line}F${chordLocation.column}`;

    sendAction(
      new ActionPayload({
        type: 'change_chord',
        content: JSON.stringify({
          prevValue,
          newValue,
          chordElementId
        }),
      })
    )
      .then(() => console.log(`change_chord action was sent.`))
      .catch(() => console.error(`Failed to send change_chord action`));

    editor.setValue(jsonResponse.new);
  };
}

function editChord() {
  //current kern retrieval
  const edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined');
  }

  const kernfile = edtr.session.getValue();
  let reqUrl = new URL(GJTBaseUrl);

  //setting the suggestion option true
  if (this == suggestBtn) chord.reharmonize = true;

  const chordEditInfo = {
    kernfile,
    chordLocation,
    chord,
  };
  //setting the url to be used and performing xhttp request
  setURLParams(reqUrl, chordEditInfo);
  requestChordEdit(reqUrl, edtr);

  if (this == suggestBtn) {
    chord.reharmonize = false;
    chordBtns.style.display = 'none';
  } else if (this == doneBtn) {
    cleanUpSelections();

    yProvider.awareness.setLocalStateField('chordEdit', {
      isDisplayed: false,
      selection: null,
    });
  }
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

  if (event.isTrusted) {
    yProvider.awareness.setLocalStateField('chordEdit', {
      isDisplayed: false,
      selection: null,
    });
  }

  isEditing = false;
});

//edit click
editBtn.addEventListener('click', (event) => {
  isEditing = true;
  showChordEditor();
  yProvider.awareness.setLocalStateField('chordEdit', {
    isDisplayed: true,
    selection: null,
  });
});

//suggest click
suggestBtn.addEventListener('click', editChord);

//done click
doneBtn.addEventListener('click', editChord);
