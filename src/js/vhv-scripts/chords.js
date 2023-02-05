import { getAceEditor } from "./setup";
import { yProvider } from "../yjs-setup";

//defining variables and functions to be used
export let chordEditor = document.getElementById('chord-editor');
let chordBtns = document.getElementById('show-edit-suggest-buttons');
let suggestBtn = document.getElementById('suggest-btn');
let sendBtn = document.getElementById('send-chord-btn');

export let chord = {
  current: null,
  new: {
    root: null,
    accidental: null,
    variation: null
  },
  reharmonize: false
};
export let chordLocation = {};
export let chordSelected = {
  root:null,
  accidental:null,
  variation:null
}

export let isEditing;

let GJTurl = new URL('https://maxim.mus.auth.gr:6001/sending_kern');

export function showChordEditor () {
  chordBtns.style.visibility = 'hidden';
  chordEditor.style.display = 'block';
}

function setURLParams (chordEditInfo) {
  for ( let [key, value] of Object.entries(chordEditInfo) ) {
    if (typeof value === 'object' && value !== null)      setURLParams(value);
    else      GJTurl.searchParams.set(`${key}`, `${value}`);
  }
}

chordEditor.addEventListener('click', (event) => {
  const [selection, component] = [event.target, event.target.className];

  if (isCollab) {

  } else {
    let notSelected = document.
      querySelectorAll(`#${chordEditor.id} > .${component}`) //deb. ontws parent?

    //decolorizing not selected and colorizing selection
    for (let cell of notSelected)       cell.style.color = 'white';
    selection.style.color = 'tomato';

    //filling chord.new and chordSelected objects
    chord.new[component] = selection.innerText;
    chordSelected[component] = selection;

    //displaying edit and click btn
    if (chord.new.root && chord.new.variation) {
      sendBtn.style.display = 'block';
    }
  }
})

//back click. tsek
document.getElementById('back-btn').
  addEventListener('click', function (event) {
  //decolorizing selected chord tables' cells
  Object.keys(chordSelected).
    forEach( (component) => {
      chordSelected[component].style.color = 'white';
      chordSelected[component] = null;
    };
  //resetting chord object's keys and getting it ready for next use
  Object.keys(chord.new).
    forEach((component) => chord.new[component] = null);

  chordEditor.style.display = 'none';
  isEditing = false;
});

//edit click
chordBtns.addEventListener('click', (event) => {
  showChordEditor();
  isEditing = 'true'
  yProvider.awareness.setLocalStateField('chordEdit', { isDisplayed: true }); 
});

//suggest click
suggestBtn.addEventListener('click', (event) => {

  //current kern retrieval
  let edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined');
  }
  let kernfile = edtr.session.getValue();

  //setting the suggestion option true
  chord.reharmonize = true;

  //constructing json to be sent
  let jsonRequest = {
    kernfile,
    chordLocation,
    chord,
  };
  console.log(jsonRequest);
  //let jsonFile = JSON.stringify(jsonRequest);

  //setting the url to be used in xhttp request
  setURLParams(jsonRequest);
  console.log(GJTurl);

  //initializing, configuring and sending the request
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", GJTurl);
  //xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.responseType = 'json';
  //xhttp.withCredentials = true;
  xhttp.send();

  //defining response function
  xhttp.onload = function () {    
    //retrieveing json sent from GJT server
    let jsonResponse = xhttp.response;
    console.log(jsonResponse);
    edtr.setValue(jsonResponse.new);
  };

  //resetting chord object's keys and getting it ready for next use
  chord.reharmonize = false;
  sendBtn.style.display = 'none';
})

//send click
sendBtn.addEventListener('click', function (event) {

  //kern retrieval
  let edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined. Chord cannot be edited');
  }
  let kernfile = edtr.session.getValue();

  //constructing json to be sent
  let jsonRequest = {
    kernfile,
    chordLocation,
    chord,
  };
  //let jsonFile = JSON.stringify(jsonRequest);
  console.log(jsonRequest);

  //setting the url to be used in xhttp request
  setURLParams(jsonRequest);
  console.log(GJTurl);

  //initializing, configuring and sending the request
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", GJTurl);
  //xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.responseType = 'json';
  //xhttp.withCredentials = true;
  xhttp.send();

  //defining response function
  xhttp.onload = function () {    
    //retrieveing json sent from GJT server
    let jsonResponse = xhttp.response;
    console.log(jsonResponse);
    edtr.setValue(jsonResponse.new);
  };
  
  //decolorizing selected chord tables' cells
  chordSelected.root.style.color = 'white';
  if (chordSelected.accidental) chordSelected.accidental.style.color = 'white';
  chordSelected.variation.style.color = 'white';
  Object.keys(chordSelected).forEach((i) => (chordSelected[i] = null));
  
  //resetting chord object's keys and getting it ready for next use
  Object.keys(chord.new).forEach((i) => (chord.new[i] = null));

  //chord editor and send btn get hidden
  chordEditor.style.display = 'none';
  sendBtn.style.display = 'none';  
});