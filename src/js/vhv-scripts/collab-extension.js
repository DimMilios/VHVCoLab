const MULTI_SELECT_ALPHA = 0.09;

function sendTarget(target) {
  if (!target) return null;
  const selectedElemAttrs = `#${target.id}.${[...target.classList].join('.')}`;
  // sendToServer({
  //   type: 'note-select',
  //   attrs: selectedElemAttrs,
  // });
}

// const socket = new WebSocket('ws://localhost:8080');
// const socket = new WebSocket('ws://vhv-ws-server.herokuapp.com');

let DEBUG = false;
function log(text) {
  if (DEBUG) {
    console.log(`[${new Date().toLocaleTimeString()}] ${text}`);
  }
}

function sendToServer(msg) {
  let msgJSON = JSON.stringify(msg);

  log(`Sending ${msg.type} message: ${msgJSON}`);
  socket.send(msgJSON);
}

const colors = [
  { value: '#e6194b', used: false },
  { value: '#3cb44b', used: false },
  { value: '#ffe119', used: false },
  { value: '#4363d8', used: false },
  { value: '#f58231', used: false },
  { value: '#911eb4', used: false },
  { value: '#46f0f0', used: false },
  { value: '#f032e6', used: false },
  { value: '#bcf60c', used: false },
  { value: '#fabebe', used: false },
  { value: '#008080', used: false },
  { value: '#e6beff', used: false },
  { value: '#9a6324', used: false },
  { value: '#800000', used: false },
  { value: '#aaffc3', used: false },
  { value: '#808000', used: false },
  { value: '#ffd8b1', used: false },
  { value: '#000075', used: false },
  { value: '#808080', used: false },
];

function getRandomColor() {
  let color;
  while (colors.some(c => c.used == false)) {
    color = colors[Math.floor(Math.random() * colors.length)];
    if (!color.used) {
      color.used = true;
      return color.value;
    }
  }
}

// function removeUnusedElements() {
//   const usersDivs = document.querySelectorAll('.users-div');
//   const singleNoteSelects = document.querySelectorAll('.single-note-select');
//   const multiNoteSelects = document.querySelectorAll('.multi-select-area');

//   // Remove all users divs when no user is selecting the note element they represent
//   [...usersDivs].forEach(div => {
//     if (!(div.dataset.noteId in userElemMap)) {
//       div.remove();
//     }
//   });

//   [...singleNoteSelects].forEach(select => {
//     if (!(select.dataset.noteId in userElemMap)) {
//       select.remove();
//     }
//   });

//   [...multiNoteSelects].forEach(select => {
//     if (!(select.dataset.clientId in userMultiSelectMap)) {
//       select.remove();
//     }
//   });

//   document.querySelector('.note-info')?.remove();

//   colors.forEach(c => {
//     if (!Object.values(userColorMap).includes(c.value)) {
//       c.used = false;
//     }
//   })
// }
export function removeUnusedElements(clientIds) {
  const usersDivs = document.querySelectorAll('.users-div');
  const singleNoteSelects = document.querySelectorAll('.single-note-select');
  const multiSelects = document.querySelectorAll('.multi-select-area');

  Array.from(usersDivs).forEach(div => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });
  
  Array.from(singleNoteSelects).forEach(div => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });
  
  Array.from(multiSelects).forEach(div => {
    if (!clientIds.includes(+div.dataset.clientId)) {
      div.remove();
    }
  });
}
// function removeUnusedElements(itemIds) {
//   const usersDivs = document.querySelectorAll('.users-div');
//   const singleNoteSelects = document.querySelectorAll('.single-note-select');

//   Array.from(usersDivs).forEach(div => {
//     if (!itemIds.includes(div.dataset.noteId)) {
//       div.remove();
//     }
//   });
  
//   Array.from(singleNoteSelects).forEach(div => {
//     if (!itemIds.includes(div.dataset.noteId)) {
//       div.remove();
//     }
//   });
// }

let userMap = {};

let userColorMap = {};
let userElemMap = {};
// socket?.addEventListener('message', event => {
//   const msg = JSON.parse(event.data);
//   log(`Message from server: ${JSON.stringify(msg, null, 2)}`);

//   switch (msg.type) {
//     case 'connected':
//       socket.self = msg.self ?? socket.self;

//       if (!(socket.self in userColorMap)) {
//         userColorMap[socket.self] = getRandomColor();
//       }
//       break;
//     case 'note-select':
//       handleNoteSelect(msg);
//       break;
//     case 'client-list':
//       handleClientListUpdate(msg);
//       break;
//     case 'note-multi-select':
//       handleNoteMultiSelect(msg);
//       break;
//     default:
//       log('Uknown message type');
//       return;
//   }
// });

function handleNoteSelect(msg) {
  // Choose a random color for each other user
  msg.clientList?.forEach(client => {
    // prettier-ignore
    if (client.clientId !== socket.self && !(client.clientId in userColorMap)) {
      userColorMap[client.clientId] = getRandomColor();
    }
  });

  /*
  "note-4343": {
    attrs: "#note-4343.bla.bla",
    count: 2,
    clientIds: Set{'client1', 'client2'}
  }
  */
  userElemMap = msg.clientList?.reduce((prevClients, client) => {
    if (typeof client.attrs == 'undefined') {
      return prevClients;
    }

    const id = client.attrs.match(/^#.*?(?=\.)/g)[0].slice(1);

    return {
      ...prevClients,
      [id]: {
        count: id in prevClients ? prevClients[id].count + 1 : 1,
        attrs: client.attrs,
        clientIds:
          typeof prevClients[id]?.clientIds != 'undefined'
            ? prevClients[id].clientIds.add(client.clientId)
            : new Set([client.clientId]),
      },
    };
  }, {});

  removeUnusedElements();

  Object.entries(userElemMap).forEach(([key, values]) => {
    const options = {
      color: userColorMap[Array.from(values?.clientIds)[0]],
      // text: values?.clientIds?.size,
      text: Array.from(userElemMap[key]?.clientIds)
        .map(id => id.split('-')[0].slice(0, 5))
        .join('\n'),
    };
    updateSingleSelect(document.querySelector(`#${key}`), options);
  });
}

function handleClientListUpdate(msg) {
  const clientIds = msg.clientList?.map(c => c.clientId);

  // Delete disconnected client information
  Object.entries(userElemMap).forEach(([id, values]) => {
    for (const clientId of Array.from(values.clientIds)) {
      if (!clientIds?.includes(clientId)) {
        userElemMap[id].clientIds.delete(clientId);
        userElemMap[id].count = userElemMap[id].clientIds.size;
        let elem = document.querySelector(`[data-note-id=${id}]`);
        elem.textContent = userElemMap[id].count;
      }
    }

    if (userElemMap[id].clientIds.size === 0) {
      delete userElemMap[id];
    }
  });

  Object.entries(userColorMap).forEach(([id, _]) => {
    if (!clientIds?.includes(id)) {
      delete userColorMap[id];
    }
  });

  Object.entries(userMultiSelectMap).forEach(([id, _]) => {
    if (!clientIds?.includes(id)) {
      delete userMultiSelectMap[id];
    }
  });

  removeUnusedElements();
}

// function formatUserElem(elem) {
//   const formattedElem = { ...elem };
//   console.log(elem);
//   // #note-L34F5.note.qon-5_2.qoff-3.pname-d.acc-n.oct-5.b40c-8.b12c-2
//   const [, , qOn, qOff, pitchName, accidental, octave] =
//      formattedElem.attrs.split('.');

//   // prettier-ignore
//   formattedElem.attrs = formatAttributes({ qOn, qOff, pitchName, accidental, octave });
//   formattedElem.clientIds = Array.from(elem.clientIds);

//   return JSON.stringify(formattedElem, null, 2);
// }

function formatUserElem(elem) {
  const [, qOn, qOff, pitchName, accidental, octave] = elem?.classList;

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
  let usersDiv = [...usersDivs].find(div => div.dataset.clientId == clientId);

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
  let select = noteSelects.find(s => s.dataset.clientId == clientId);
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
  return event => {
    const elem = event.target;
    const noteInfo = document.querySelector('.note-info');

    if (elem.classList.contains('expanded') && noteInfo) {
      elem.classList.remove('expanded');
      document.body.removeChild(noteInfo);
      return;
    }

    singleNoteSelects.forEach(div => div.classList.remove('expanded'));
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

function styleSelectedElem(
  elem,
  options = { color: '', classesToAdd: [], classesToRemove: [] }
) {
  if (typeof options.classesToAdd != 'undefined') {
    elem.classList.add(...options.classesToAdd);
  }
  if (typeof options.classesToRemove != 'undefined') {
    elem.classList.remove(...options.classesToRemove);
  }
  elem.style.color = options.color;
  elem.style.stroke = options.color;
  elem.style.fill = options.color;
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

let selectArea = document.querySelector('#select-area');

window.addEventListener('DOMContentLoaded', () => {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'multi-select-sheet';
  styleSheet.innerHTML = `
  .multi-select-area {
    position: absolute;
    z-index: 20000;
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

class RubberBandSelection {
  coords = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };

  isSelecting = false;

  selectAreaElem = document.querySelector('#select-area');

  constructor(coords) {
    this.coords = coords ?? this.coords;

    if (!this.selectAreaElem) {
      this.selectAreaElem = document.createElement('div');
      this.selectAreaElem.id = 'select-area';
      document.body.appendChild(this.selectAreaElem);
    }
  }

  set isSelecting(value) {
    this.isSelecting = Boolean(value);
  }

  /**
   * Update the position new position of the selection area DOM element
   *
   * @returns {{ left: number, top: number, right: number, bottom: number }} The new coordinates of the DOM element
   */
  updateElemPosition() {
    let { left, top, right, bottom } = this.coords;
    let minX = Math.min(left, right);
    let maxX = Math.max(left, right);
    let minY = Math.min(top, bottom);
    let maxY = Math.max(top, bottom);

    this.selectAreaElem.style.transform = `translate(${minX}px, ${minY}px)`;
    this.selectAreaElem.style.width = maxX - minX + 'px';
    this.selectAreaElem.style.height = maxY - minY + 'px';

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
    };
  }

  /**
   * Update the internal coordinates state of the object with
   * the position of the selection area DOM element
   *
   * @returns {{ left: number, top: number, right: number, bottom: number }} The new coordinates of the current object
   */
  reCalculateCoords() {
    return (this.coords = this.updateElemPosition());
  }

  resetCoords() {
    this.coords = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
    this.updateElemPosition();
  }

  /**
   * Find every element of the array that is within the bounds of the selection
   * area DOM element
   *
   * @param {Element[]} elements
   * @returns {Element[]}
   */
  selectNoteElements(elements) {
    return elements.filter(elem => {
      const box = elem.getBoundingClientRect();

      return (
        this.coords.left <= box.left &&
        this.coords.top <= box.top &&
        this.coords.right >= box.right &&
        this.coords.bottom >= box.bottom
      );
    });
  }
}

function addListenersToOutput(outputTarget) {
  let startTime, endTime;
  let shouldMultiSelect = false;

  const rbSelection = new RubberBandSelection();

  outputTarget?.addEventListener('mousedown', event => {
    startTime = performance.now();

    rbSelection.isSelecting = true;
    rbSelection.coords.left = event.clientX;
    rbSelection.coords.top = event.clientY;

    const selectedAreas = document.querySelectorAll('.multi-select-area');
  
    const selectToRemove = [...selectedAreas].find(
      elem => elem.dataset.clientId == window.provider.awareness.clientID
    );
    if (selectToRemove) {
      provider.awareness.setLocalStateField('multiSelect', null);
      selectToRemove?.remove();
    }
  });

  // TODO: Use requestAnimationFrame
  document.addEventListener('mousemove', event => {
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

  document.addEventListener('mouseup', handleMouseUp(window.provider.awareness, window.userData.color));
  
  function handleMouseUp(awareness, color) {
    return event => {
      rbSelection.reCalculateCoords();
      rbSelection.isSelecting = false;
  
      if (shouldMultiSelect) {
        const selectedAreas = document.querySelectorAll('.multi-select-area');
  
        let selectedArea = [...selectedAreas].find(
          elem => elem.dataset.clientId == awareness?.clientID
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
        selectedArea.style.backgroundColor = hexToRgbA(color, MULTI_SELECT_ALPHA) ?? 'blue';
  
        awareness?.setLocalStateField('multiSelect', selectedNotes
            .map(note => note.id)
            .filter(id => /^note/g.test(id)));
  
        shouldMultiSelect = false;
      }
  
      rbSelection.resetCoords();
      rbSelection.selectAreaElem.hidden = true;
      startTime = endTime = undefined;
    }
  }
}

export function updateMultiSelect(clientState, noteIds) {
  const selectedAreas = document.querySelectorAll('.multi-select-area');

  let selectedArea = [...selectedAreas].find(
    elem => elem.dataset.clientId == clientState.clientId
  );

  if (!noteIds || noteIds.length === 0) {
    selectedArea?.remove();
    return;
  }

  const selector = noteIds?.map(id => '#' + id)?.join(',');
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
    selectedArea.style.backgroundColor = `${hexToRgbA(clientState?.user?.color, MULTI_SELECT_ALPHA)}` ?? 'blue';
  }
}

// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex, alpha) {
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255, alpha ? alpha : '1'].join(',')+')';
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

  userList.addEventListener('mouseenter', e => {
    e.target.innerHTML = `${users.join(',\n')}`;
    if (output.hasAttribute('style') && !output.getAttribute('style').includes('transition')) {
      output.style.transition = 'opacity 0.4s ease-out';
    }
    output.style.opacity = 0.1;
  })
  
  userList.addEventListener('mouseout', e => {
    e.target.innerHTML = userIcon + users.length + ' users';
    output.style.opacity = 1;
  })
  
  let userIcon = '👤 ';
  let userText = ' user'
  if(users.length > 1){
    userIcon = '👥 ';
    userText = ' users';
  }
  userList.innerHTML = userIcon + users.length + userText;

  const menubar = document.getElementById('menubar');
  if (menubar) {
    const menuBox = menubar.getBoundingClientRect();
    userList.style.transform = `translate(${menuBox.right - userList.getBoundingClientRect().width * 1.1}px, ${menuBox.top * 3}px)`
  }
}

// Alternatively, we can use an SVG 'use' element to copy the element we want:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
function copySVGElement(elem) {
  let clone = elem.cloneNode(true);
  
  let copy = document.createElementNS('http://www.w3.org/2000/svg', clone.localName);
  // Copy its attributes
  for (const { nodeName, value } of clone.attributes) {
    copy.setAttribute(nodeName, value);
  }

  // Copy its children
  while (clone.hasChildNodes()) {
    copy.appendChild(clone.removeChild(clone.firstChild));
  }

  return copy;
}