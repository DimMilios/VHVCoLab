import { getAceEditor } from "./setup";

let chordEditor = document.getElementById('chord-editor');
let editBtn = document.getElementById('edit');
let sendBtn = document.getElementById('send');

export let chord = {
  current: null,
  new: {
    root: null,
    accidental: null,
    variation: null
  }
};
export let chordLocation = {};
export let chordSelected = {
  root:null,
  accidental:null,
  variation:null
}

//coloring selection and decoloring previous selections
for (let td of document.querySelectorAll('.Chords td')) {
  if (td.closest('#chord-editor')) {
    td.addEventListener('click', function (event) {
      event.target.style.color = 'tomato';

      let otherCells = document.getElementsByClassName(event.target.className);
      for (let other of otherCells) {
        if (other !== event.target) other.style.color = 'white';
      }

      switch (event.target.className) {
        case 'root':
          chord.new.root = event.target.innerText;
          chordSelected.root = event.target;
          console.log({ chord, chordSelected })
          break;
        case 'accidental':
          chord.new.accidental = event.target.innerText;
          chordSelected.accidental = event.target;
          break;
        case 'variation':
          chord.new.variation = event.target.innerText;
          chordSelected.variation = event.target;
          break;
      }

      if (chord.new.root && chord.new.variation) {
        sendBtn.style.display = 'block';
      }
    });
  }
}

//back click
document.getElementById('back').addEventListener('click', function (event) {
  if (chordSelected.root) chordSelected.root.style.color = 'white';
  if (chordSelected.accidental)
    chordSelected.accidental.style.color = 'white';
  if (chordSelected.variation) chordSelected.variation.style.color = 'white';

  Object.keys(chordSelected).forEach((i) => (chordSelected[i] = null));
  Object.keys(chord.new).forEach((i) => (chord.new[i] = null));

  chordEditor.style.display = 'none';
  // document.getElementById('cover').style.visibility = 'hidden';
});

//edit click
editBtn.addEventListener('click', (event) => {
  chordEditor.style.display = 'block';
  editBtn.style.visibility = 'hidden';
});

//edit hidden when scrolling
document.querySelector('#output').parentElement.addEventListener('scroll', function () {
  editBtn.style.visibility = 'hidden';
});

//send click
sendBtn.addEventListener('click', function (event) {
  chordEditor.style.display = 'none';
  // document.getElementById('cover').style.visibility = 'hidden';

  chordSelected.root.style.color = 'white';
  if (chordSelected.accidental) chordSelected.accidental.style.color = 'white';
  chordSelected.variation.style.color = 'white';
  Object.keys(chordSelected).forEach((i) => (chordSelected[i] = null));

  let edtr = getAceEditor();
  if (!edtr) {
    throw new Error('Ace Editor is undefined');
  }
  let kernfile = edtr.session.getValue();

  let jsonRequest = {
    kernfile,
    chordLocation,
    chord,
  };

  console.log(jsonRequest);

  let xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    let jsonResponse = JSON.parse(xhttp.response); //to response einai json?mporei kai sketo string
    let newKern = jsonResponse[0];
    edtr.setValue(newKern);
  };
  //xhttp.open("POST", url)
  //xhttp.setRequestHeader('Content-Type', 'application/json');
  //xhttp.send(jsonRequest);
  Object.keys(chord.new).forEach((i) => (chord.new[i] = null));
  sendBtn.style.display = 'none';
});