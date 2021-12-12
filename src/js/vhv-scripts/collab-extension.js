import { userData, yProvider } from '../yjs-setup.js';
import { getAceEditor } from './setup.js';
import { RubberBandSelection } from './util-collab.js';
import { transposeNote } from './editor.js';
import { global_cursor } from './global-variables.js';

const MULTI_SELECT_ALPHA = 0.3;

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

export function clearSingleSelect() {
  const aw = yProvider.awareness;
  const localState = aw.getLocalState();
  aw.setLocalStateField('cursor', { ...localState.cursor, itemId: null });
  clearSingleSelectDOM(aw.clientID);
  
  const editor = getAceEditor();
  editor?.session?.selection?.moveCursorFileStart();
}

export function clearSingleSelectDOM(clientId) {
  let usersDivs = document.querySelectorAll('.users-div');
  let usersDiv = [...usersDivs].find((div) => div.dataset.clientId == clientId);
  usersDiv?.remove();

  const noteSelects = [...document.querySelectorAll('.single-note-select')];
  let select = noteSelects.find((s) => s.dataset.clientId == clientId);
  select?.remove();
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
  let select = noteSelects.find((s) => s.dataset.clientId == clientId);
  if (!select) {
    select = document.createElement('div');
    select.setAttribute('class', 'single-note-select');
    // select.addEventListener('click', handleSingleNoteSelectClick(noteSelects));
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

  outputTarget.addEventListener('mousedown', (event) => {
    // Start selecting only when there isn't a note element on the cursor
    if (event.target.nodeName != 'svg') return;

    startTime = performance.now();

    rbSelection.isSelecting = true;
    rbSelection.coords.left = event.clientX;
    rbSelection.coords.top = event.clientY;

    const selectedAreas = document.querySelectorAll('.multi-select-area');

    const selectToRemove = [...selectedAreas].find(
      (elem) => elem.dataset.clientId == yProvider.awareness.clientID
    );
    if (selectToRemove) {
      yProvider.awareness.setLocalStateField('multiSelect', null);
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
    handleMouseUp(yProvider.awareness, userData.color)
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

        const multiSelectedNotes = selectedNotes.map((note) => note.id).filter((id) => /^note/g.test(id))

        if (multiSelectedNotes.length > 0) {
          awareness?.setLocalStateField('multiSelect', multiSelectedNotes);
        }

        shouldMultiSelect = false;
      }

      rbSelection.resetCoords();
      rbSelection.selectAreaElem.hidden = true;
      startTime = endTime = undefined;
    };
  }
}

export function updateMultiSelect(clientState, noteIds) {
  const selectedAreas = document.querySelectorAll('.multi-select-area');
  
  let selectedArea = [...selectedAreas].find(
    (elem) => elem.dataset.clientId == clientState.clientId
    );

  if (!noteIds || noteIds.length === 0) {
    selectedArea?.remove();
    return;
  }

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
      // output.style.transition = 'opacity 0.4s ease-out';
    }
    // output.style.opacity = 0.1;
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
function copySVGElement(elem, deep = false) {
  let clone = elem.cloneNode(deep);

  let copy = document.createElementNS('http://www.w3.org/2000/svg', clone.localName);
  // Copy its attributes
  for (const { nodeName, value } of clone.attributes) {
    if (nodeName === 'id') {
      copy.dataset.refElem = value;
      continue;
    }
    copy.setAttribute(nodeName, value);
  }

  // Copy its children
  while (clone.hasChildNodes()) {
    let child = clone.removeChild(clone.firstChild);
    
    // console.log('Copying child:', child);
    clearAttributes(child, ['id']);
    
    // Ignore elements with lyrics
    // if (!child?.classList?.contains('verse')) {
    //   copy.appendChild(child);
    // }
    copy.appendChild(child);
  }

  return copy;
}

function clearAttributes(elem, attrs) {
  if (elem.removeAttribute) {
    attrs.forEach(attr => {
      // if (attr === 'id') {
      //   elem.dataset.refElem = elem.id;
      // }
      elem.removeAttribute(attr)
    });
  }

  if (elem.hasChildNodes()) {
    elem.childNodes.forEach(c => clearAttributes(c, attrs));
  }
}

function fromSVGRect(svgRect) {
  return { x: svgRect.x, y: svgRect.y, width: svgRect.width, height: svgRect.height };
}

/**
 * 
 * @param {HTMLElement | undefined} parentElem 
 */
function createSVGCollabLayer(parentElem) {
  if (!parentElem) return;
  
  const defScale = document.querySelector('.definition-scale');
  const viewBox = defScale?.viewBox;
  
  // We need to set the viewBox property of the parent SVG element.
  // SVG transforms can be then applied to the CHILDREN elements.
  // Consider adding another SVG element inside the container created below that
  // can be styled and transformed when needed.

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  if (viewBox) {
    svg.setAttributeNS(null, 'viewBox', `${Object.values(fromSVGRect(viewBox.baseVal)).join(' ')}`);
  }
 
  svg.id = 'collab-container';
  svg.setAttribute('fill', 'blue');
 
  // const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const container = copySVGElement(defScale.firstElementChild);
  container.classList.add('draggable-group-svg');
  svg.appendChild(container);
  
  return parentElem.firstElementChild.appendChild(svg);
}

function bootstrap() {
  const collabLayer = createSVGCollabLayer(document.getElementById('output'));
  // collabLayer.firstElementChild.appendChild(copySVGElement(global_cursor.CursorNote, true));
  collabLayer.firstElementChild.appendChild(copySVGElement(document.querySelector('#output > svg g.note'), true));
  makeDraggable(collabLayer);

  // const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  // rect.setAttributeNS(null, 'width', '100');
  // rect.setAttributeNS(null, 'height', '100');
  // rect.setAttributeNS(null, 'fill', 'green');
  // rect.classList.add('draggable-svg');
  // clc.appendChild(rect);
}

// https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function makeDraggable(svgElem) {
  svgElem.addEventListener('mousedown', startDrag);
  svgElem.addEventListener('mousemove', drag);
  svgElem.addEventListener('mouseup', endDrag);
  svgElem.addEventListener('mouseleave', endDrag);
  svgElem.addEventListener('touchstart', startDrag);
  svgElem.addEventListener('touchmove', drag);
  svgElem.addEventListener('touchend', endDrag);
  svgElem.addEventListener('touchleave', endDrag);
  svgElem.addEventListener('touchcancel', endDrag);

  function getMousePosition(event) {
    const CTM = svgElem.getScreenCTM();
    if (event.touches) { event = event.touches[0]; }
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    }
  }

  let selectedElem = null;
  let offset, transform;

  function initialiseDragging(event) {
    offset = getMousePosition(event);
    // Make sure the first transform on the element is a translate transform
    const transforms = selectedElem.transform.baseVal;
    if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      // Create an transform that translates by (0, 0)
      const translate = svgElem.createSVGTransform();
      translate.setTranslate(0, 0);
      selectedElem.transform.baseVal.insertItemBefore(translate, 0);
    }
    // Get initial translation
    transform = transforms.getItem(0);
    offset.x -= transform.matrix.e;
    offset.y -= transform.matrix.f;
  }

  function startDrag(event) {
    if (event.target.classList.contains('draggable-svg')) {
      selectedElem = event.target;
      initialiseDragging(event);
    } else if (!!event.target.closest('.draggable-group-svg')) {
      selectedElem = event.target.closest('.draggable-group-svg');
      // console.log('Draggable group set:', selectedElem)
      initialiseDragging(event);

      transposeAmount = 0;
    }
  }

  let prevPositionY;
  let movementY;
  let transposeAmount;
  let position = {};

  // TODO: use requestAnimationFrame
  function drag(event) {
    if (selectedElem) {
      event.preventDefault();

      const coords = getMousePosition(event);
      // transform.setTranslate(coords.x - offset.x, coords.y - offset.y);

      movementY = coords.y - offset.y;

      const noteElem = selectedElem?.querySelector('.note');
      if (noteElem) {
        position = extractEditorPosition(noteElem);
        if (prevPositionY > movementY) {
          transposeAmount += 0.3;
        } else if (prevPositionY < movementY) {
          transposeAmount -= 0.3;
        }
        // console.log(position, {transposeAmount});
        document.querySelector(`#${noteElem.dataset.refElem}`).style.opacity = 0;
      }
      
      // Allow vertical movement only
      transform.setTranslate(transform.matrix.e, movementY);
      prevPositionY = movementY;
    }
  }
  
  // Highest note: cccc
  // Lowest note: AAAA
  function endDrag(event) {
    if (transposeAmount != 0) {
      console.log(position, {transposeAmount});
      // All notes for a piano: 88
      // module the transposition amount with 44 (factor in negative values -
      // moving below the note's current position)
      transposeNote(position.id, position.line, position.field, position.subfield, Math.floor(transposeAmount) % 44);
    }
    selectedElem = null;
  }
}

function extractEditorPosition(element) {
  let noteElem = document.querySelector(`#${element.dataset.refElem}`);
  var id = noteElem.id;
  var matches;

  if ((matches = id.match(/L(\d+)/))) {
    var line = parseInt(matches[1]);
  } else {
    return; // required
  }

  if ((matches = id.match(/F(\d+)/))) {
    var field = parseInt(matches[1]);
  } else {
    return; // required
  }

  if ((matches = id.match(/S(\d+)/))) {
    var subfield = parseInt(matches[1]);
  } else {
    subfield = null;
  }

  if ((matches = id.match(/N(\d+)/))) {
    var number = parseInt(matches[1]);
  } else {
    number = 1;
  }

  if ((matches = id.match(/^([a-z]+)-/))) {
    var name = matches[1];
  } else {
    return; // required
  }

  if (line < 1 || field < 1) {
    return;
  }

  return { id, line, field, subfield };
}

window.collabLayer = {
  createSVGCollabLayer,
  copySVGElement,
  bootstrap
}