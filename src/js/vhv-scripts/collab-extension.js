import { getAceEditor } from './setup';
import { RubberBandSelection } from './util-collab';

const MULTI_SELECT_ALPHA = 0.09;

let DEBUG = false;
function log(text) {
  if (DEBUG) {
    console.log(`[${new Date().toLocaleTimeString()}] ${text}`);
  }
}

export function removeUnusedElements(clientIds) {
  const usersDivs = document.querySelectorAll('.users-div');
  const singleNoteSelects = document.querySelectorAll('.single-note-select');
  const multiSelects = document.querySelectorAll('.multi-select-area');

  Array.from(usersDivs).forEach((div) => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });

  Array.from(singleNoteSelects).forEach((div) => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });

  Array.from(multiSelects).forEach((div) => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });
}

function formatUserElem(elem) {
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

export function updateSingleSelect(clientId, target, options) {
  updateUsersDiv(clientId, target, options);

  updateSingleNoteSelect(clientId, target, options);
}

function updateUsersDiv(clientId, target, options) {
  let usersDivs = document.querySelectorAll('.users-div');

  // let usersDiv = [...usersDivs].find(div => div.dataset.noteId === target.id);
  let usersDiv = [...usersDivs].find((div) => div.dataset.clientId == clientId);

  if (!usersDiv) {
    usersDiv = document.createElement('div');
    usersDiv.setAttribute('class', 'users-div');
    usersDiv.addEventListener('click', handleSingleNoteSelectClick(usersDivs));
    document.body.appendChild(usersDiv);
  }
  usersDiv.dataset.noteId = target.id;
  usersDiv.dataset.clientId = clientId;

  const { staffY, targetX } = getCoordinates(target);

  usersDiv.style.transform = `translate(${
    targetX - usersDiv.offsetWidth / 4
  }px, ${staffY - 25}px)`;

  usersDiv.innerText = options.text;
}

function updateSingleNoteSelect(clientId, target, options) {
  const noteSelects = Array.from(
    document.querySelectorAll('.single-note-select')
  );
  // let select = noteSelects.find(s => s.dataset.noteId === target.id);
  let select = noteSelects.find((s) => s.dataset.clientId == clientId);
  if (!select) {
    select = document.createElement('div');
    select.setAttribute('class', 'single-note-select');
    select.addEventListener('click', handleSingleNoteSelectClick(noteSelects));
    document.body.appendChild(select);
  }
  select.dataset.noteId = target.id;
  select.dataset.clientId = clientId;

  const { staffY, targetX, targetBounds } = getCoordinates(target);
  select.style.transform = `translate(${targetX}px, ${staffY}px)`;

  select.style.width = `${Math.abs(targetX - targetBounds.right)}px`;
  select.style.height = `${Math.abs(staffY - targetBounds.bottom)}px`;
  select.style.backgroundColor = options.color;
}

function handleSingleNoteSelectClick(singleNoteSelects) {
  return (event) => {
    const elem = event.target;
    const noteInfo = document.querySelector('.note-info');

    if (elem.classList.contains('expanded') && noteInfo) {
      elem.classList.remove('expanded');
      document.body.removeChild(noteInfo);
      return;
    }

    singleNoteSelects.forEach((div) => div.classList.remove('expanded'));
    const noteElem = document.querySelector(`#${elem?.dataset?.noteId}`);

    if (!noteInfo) {
      const noteInfo = document.createElement('div');
      noteInfo.classList.add('note-info');
      const pre = document.createElement('pre');
      if (noteElem) {
        pre.textContent = formatUserElem(noteElem);
      }
      noteInfo.appendChild(pre);
      document.body.appendChild(noteInfo);
    } else {
      noteInfo.firstChild.textContent = formatUserElem(noteElem);
    }

    elem.classList.add('expanded');
  };
}

function getCoordinates(target) {
  const targetBounds = target.getBoundingClientRect();
  const closestStaffElem = target.parentNode?.parentNode;

  let staffBounds;
  if (closestStaffElem?.classList.contains('staff')) {
    staffBounds = closestStaffElem.getBoundingClientRect();
  }

  return {
    staffX: staffBounds?.x ?? targetBounds.x,
    staffY: staffBounds?.y ?? targetBounds.y,
    targetX: targetBounds.x,
    targetY: targetBounds.y,
    targetBounds,
    staffBounds,
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'multi-select-sheet';
  styleSheet.innerHTML = `
  .multi-select-area {
    position: absolute;
    z-index: var(--collab-layer-zIndex);
    background-color: blue;
    pointer-events: none;
  }
  `.trim();
  document.head.appendChild(styleSheet);

  // Use a MutationObserver to find out when the score output SVG
  // is added to the DOM and attach mouse event listeners to it.
  // Then, disconnect the observer.
  const mutationObserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.target.id === 'output') {
          if (
            !mutation.target.onmousedown &&
            !mutation.target.onmousemove &&
            !mutation.target.onmouseup
          ) {
            addListenersToOutput(mutation.target);
            observer.disconnect();
          }
        }
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
});

function addListenersToOutput(outputTarget) {
  let startTime, endTime;
  let shouldMultiSelect = false;

  const rbSelection = new RubberBandSelection();

  outputTarget?.addEventListener('mousedown', (event) => {
    startTime = performance.now();

    rbSelection.isSelecting = true;
    rbSelection.coords.left = event.clientX;
    rbSelection.coords.top = event.clientY;

    const selectedAreas = document.querySelectorAll('.multi-select-area');

    const selectToRemove = [...selectedAreas].find(
      (elem) => elem.dataset.clientId == window.provider.awareness.clientID
    );
    if (selectToRemove) {
      window.provider.awareness.setLocalStateField('multiSelect', null);
      selectToRemove?.remove();
    }
  });

  // TODO: Use requestAnimationFrame
  document.addEventListener('mousemove', (event) => {
    if (rbSelection.isSelecting) {
      endTime = performance.now();
      let timePassed = endTime - startTime;

      if (timePassed >= 300) {
        rbSelection.coords.right = event.clientX;
        rbSelection.coords.bottom = event.clientY;

        rbSelection.selectAreaElem.hidden = false;
        rbSelection.updateElemPosition();

        shouldMultiSelect = true;
      }
    }
  });

  document.addEventListener(
    'mouseup',
    handleMouseUp(window.provider.awareness, window.userData.color)
  );

  function handleMouseUp(awareness, color) {
    return () => {
      rbSelection.reCalculateCoords();
      rbSelection.isSelecting = false;

      if (shouldMultiSelect) {
        const selectedAreas = document.querySelectorAll('.multi-select-area');

        let selectedArea = [...selectedAreas].find(
          (elem) => elem.dataset.clientId == awareness?.clientID
        );

        // TODO: extremely inefficient, selecting every single note element
        const notes = Array.from(document.querySelectorAll('.note, .beam'));
        const selectedNotes = rbSelection.selectNoteElements(notes);
        const coords = calculateMultiSelectCoords(selectedNotes);

        if (!selectedArea) {
          selectedArea = document.createElement('div');
          selectedArea.dataset.clientId = awareness?.clientID;
          selectedArea.classList.add('multi-select-area');
          document.body.appendChild(selectedArea);
        }

        selectedArea.style.transform = `translate(${coords.left}px, ${coords.top}px)`;
        selectedArea.style.width = `${coords.width}px`;
        selectedArea.style.height = `${coords.height}px`;
        selectedArea.style.backgroundColor =
          hexToRgbA(color, MULTI_SELECT_ALPHA) ?? 'rgba(0, 0, 255, 0.09)';

        awareness?.setLocalStateField(
          'multiSelect',
          selectedNotes.map((note) => note.id).filter((id) => /^note/g.test(id))
        );

        shouldMultiSelect = false;
      }

      rbSelection.resetCoords();
      rbSelection.selectAreaElem.hidden = true;
      startTime = endTime = undefined;
    };
  }
}

// [
//   "note-L41F2S1",
//   "note-L41F2S2",
//   "note-L41F2S3",
//   "note-L46F2S1",
//   "note-L46F2S2",
//   "note-L46F2S3",
//   "note-L48F2S1",
//   "note-L48F2S2",
//   "note-L48F2S3",
//   "note-L49F2S1",
//   "note-L49F2S2",
//   "note-L49F2S3"
// ]
// Break down note ids to L, F, S parts
// L - line (row), F - field (column), S - subfield (same field but different column - chords)
// Find the min and max lines, same for the other values
export function updateMultiSelect(clientState, noteIds) {
  const selectedAreas = document.querySelectorAll('.multi-select-area');
  
  let selectedArea = [...selectedAreas].find(
    (elem) => elem.dataset.clientId == clientState.clientId
    );

    
  if (!noteIds || noteIds.length === 0) {
    selectedArea?.remove();
    return;
  }

  // const editor = getAceEditor();
  
  // const brokenDownIds = [];
  // for (const noteId of noteIds) {
  //   let id = noteId.slice(noteId.indexOf('-') + 1);
  //   const [, line, field, subfield] = /L(\d+)F(\d+)S?(\d*)/.exec(id);
  //   const obj = { line: parseInt(line, 10), field: parseInt(field, 10) };

  //   if (subfield?.length > 0) {
  //     obj.subfield = parseInt(subfield, 10);
  //   }
  //   brokenDownIds.push(obj);
  // }
  // console.log(brokenDownIds);

  // const minLine = Math.min(...brokenDownIds.map(b => b.line))
  // const maxLine = Math.max(...brokenDownIds.map(b => b.line))
  // const minField = Math.min(...brokenDownIds.map(b => b.field))
  // const maxField = Math.max(...brokenDownIds.map(b => b.field))

  // editor.session.addMarker(new Range(minLine, minField, maxLine, maxField), `selection-${window.provider.awareness.clientID}`, 'line');

  // doesn't work - makes the page re-render indefinitely
  // editor.session.selection.setSelectionRange(new Range(minLine, minField, maxLine, maxField));

  const selector = noteIds?.map((id) => '#' + id)?.join(',');
  if (selector) {
    const notes = Array.from(document.querySelectorAll(selector));
    if (notes.length === 0) {
      return;
    }
    const coords = calculateMultiSelectCoords(notes);

    if (!selectedArea) {
      selectedArea = document.createElement('div');
      selectedArea.dataset.clientId = clientState.clientId;
      selectedArea.classList.add('multi-select-area');
      document.body.appendChild(selectedArea);
    }

    selectedArea.style.transform = `translate(${coords.left}px, ${coords.top}px)`;
    selectedArea.style.width = `${coords.width}px`;
    selectedArea.style.height = `${coords.height}px`;
    // selectedArea.style.backgroundColor = clientState?.user?.color ?? 'blue';
    selectedArea.style.backgroundColor =
      `${hexToRgbA(clientState?.user?.color, MULTI_SELECT_ALPHA)}` ?? 'blue';
  }
}

// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex, alpha) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return (
      'rgba(' +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255, alpha ? alpha : '1'].join(
        ','
      ) +
      ')'
    );
  }
  throw new Error('Bad Hex');
}

function calculateMultiSelectCoords(selectedNotes) {
  const coords = selectedNotes.reduce(
    (oldBox, note) => {
      const box = note.getBoundingClientRect();
      return {
        left: Math.min(oldBox.left, box.left),
        top: Math.min(oldBox.top, box.top),
        right: Math.max(oldBox.right, box.right),
        bottom: Math.max(oldBox.bottom, box.bottom),
      };
    },
    { left: Infinity, top: Infinity, right: 0, bottom: 0 }
  );

  return {
    ...coords,
    width: coords.right - coords.left,
    height: coords.bottom - coords.top,
  };
}

export function userListDisplay(users) {
  if (!users || !Array.isArray(users)) return;
  let userList = document.querySelector('.user-list');
  const output = document.querySelector('#output');

  if (!userList) {
    userList = document.createElement('div');
    userList.classList.add('user-list');
    document.body.appendChild(userList);
  }

  userList.addEventListener('mouseenter', (e) => {
    e.target.innerHTML = `${users.join(',\n')}`;
    if (
      output.hasAttribute('style') &&
      !output.getAttribute('style').includes('transition')
    ) {
      output.style.transition = 'opacity 0.4s ease-out';
    }
    output.style.opacity = 0.1;
  });

  userList.addEventListener('mouseout', (e) => {
    e.target.innerHTML = userIcon + users.length + ' users';
    output.style.opacity = 1;
  });

  let userIcon = '👤 ';
  let userText = ' user';
  if (users.length > 1) {
    userIcon = '👥 ';
    userText = ' users';
  }
  userList.innerHTML = userIcon + users.length + userText;

  const menubar = document.getElementById('menubar');
  if (menubar) {
    const menuBox = menubar.getBoundingClientRect();
    userList.style.transform = `translate(${
      menuBox.right - userList.getBoundingClientRect().width * 1.1
    }px, ${menuBox.top * 3}px)`;
  }
}

// Alternatively, we can use an SVG 'use' element to copy the element we want:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
// function copySVGElement(elem) {
//   let clone = elem.cloneNode(true);

//   let copy = document.createElementNS('http://www.w3.org/2000/svg', clone.localName);
//   // Copy its attributes
//   for (const { nodeName, value } of clone.attributes) {
//     copy.setAttribute(nodeName, value);
//   }

//   // Copy its children
//   while (clone.hasChildNodes()) {
//     copy.appendChild(clone.removeChild(clone.firstChild));
//   }

//   return copy;
// }
