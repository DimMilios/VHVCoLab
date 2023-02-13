import { getAceEditor } from "./setup";
import { yProvider } from "../yjs-setup";

//defining variables and functions to be used
const chordEditor = document.getElementById('chord-editor');
const chordBtns = document.getElementById('show-edit-suggest-buttons');
const editBtn = document.getElementById('edit-btn');
const suggestBtn = document.getElementById('suggest-btn');
const doneBtn = document.getElementById('done-btn');
const backBtn = document.getElementById('back-btn')

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

export let isEditing;

const GJTurl = new URL('https://maxim.mus.auth.gr:6001/sending_kern');

export function showChordEditor () {
  chordBtns.style.visibility = 'hidden';
  $('#show-chord-editor').modal('show');
  
  doneBtn.style.display = 'none';
  
  if (!isEditing)   backBtn.style.display = 'none';
}

function setURLParams (chordEditInfo) {
  for ( let [key, value] of Object.entries(chordEditInfo) ) {
    if (typeof value === 'object' && value !== null)      setURLParams(value);
    else      GJTurl.searchParams.set(`${key}`, `${value}`);
  }
}

function cleanUpSelections () {
  Object.values(chord.new).
    forEach((value) => value = null);

  decolorizeSelections();
}

export function select (selection, component) {
  selection.style.color = 'tomato';  
  chord.new[component] = selection.innerText;

  yProvider.awareness.
    setLocalStateField('chordEdit', { 
      isDisplayed: true,
      selection: {
        component,
        text: selection.innerText
    }})

  if (chord.new.root && chord.new.variation) {
    doneBtn.style.display = 'block';
  }    
}

export function decolorizeSelections (selectionComponent) {
  let selections;
  if (selectionComponent) {
    selections = document.querySelectorAll(`td.${selectionComponent}`);
  } else {
    selections = document.querySelectorAll(`#chord-editor td`);
  }

  for (let one of selections)    one.style.color = 'white';
}

function editChord () {
  //current kern retrieval
  let edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined');
  }
  let kernfile = edtr.session.getValue();

  //setting the suggestion option true
  if (this == suggestBtn)     chord.reharmonize = true;

  const chordEditInfo = {
    kernfile,
    chordLocation,
    chord,
  };
  console.log(chordEditInfo);
 
  //setting the url to be used in xhttp request
  setURLParams(chordEditInfo);
  console.log(GJTurl);

  //initializing, configuring and sending the request
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", GJTurl);
  xhttp.responseType = 'json';
  xhttp.send();

  //defining response function
  xhttp.onload = function () {    
    //retrieveing json sent from GJT server
    let jsonResponse = xhttp.response;
    console.log(jsonResponse);
    edtr.setValue(jsonResponse.new);
  };
  
  if (this == suggestBtn) {
    chord.reharmonize = false;
    chordBtns.style.display = 'none'; 
  } else if (this == doneBtn) {
    cleanUpSelections();

    yProvider.awareness.setLocalStateField('chordEdit', {
      isDisplayed: false,
      selection: null
    });
  } 
} 

chordEditor.addEventListener('click', (event) => {
  if(event.target.tagName !== 'TD' || !isEditing)   return;

  const [selection, component] = [event.target, event.target.className];
  
  decolorizeSelections(component);
  select(selection, component);

})

//back click
backBtn.addEventListener('click', function (event) {
  cleanUpSelections();
    
  if (event.isTrusted){
    yProvider.awareness.setLocalStateField('chordEdit', {
      isDisplayed: false,
      selection: null
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
    selection: null
   });
});

//suggest click
suggestBtn.addEventListener('click', editChord)

//done click
doneBtn.addEventListener('click', editChord);