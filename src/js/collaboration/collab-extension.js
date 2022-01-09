import { yProvider } from '../yjs-setup.js';
import { RubberBandSelection } from "./RubberBandSelection";
import { html, render } from 'lit-html';
import { multiSelectTemplate, singleSelectTemplate, userAwarenessTemplate, collabTemplate, uiCoords, highlightListTemplate, highlightLayerTemplate, multiSelectCoords } from './templates.js';

window.ui = uiCoords;

let DEBUG = false;
function log(text) {
  if (DEBUG) {
    console.log(`[${new Date().toLocaleTimeString()}] ${text}`);
  }
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

export function updateHandler({ added, updated, removed }) {
  // console.log(yProvider.awareness.getStates());

  let multiSelects = html`${Array.from(yProvider.awareness.getStates().entries())
    .filter(([_, state]) => state.multiSelect != null && state?.user?.color != null)
    .map(([clientId, state]) => multiSelectTemplate(clientId, clientId === yProvider.awareness.clientID, state.multiSelect, state.user.color))
  }`;

  let singleSelects = html`${Array.from(yProvider.awareness.getStates().entries())
    .filter(([_, state]) => state?.singleSelect?.elemId != null && state?.user?.color != null)
    .map(([clientId, state]) =>
      singleSelectTemplate(clientId, state.singleSelect.elemId, state.user.color)
    )}`;
  
  let userAwareness = html`${Array.from(yProvider.awareness.getStates().entries())
    .filter(([_, state]) => state?.singleSelect?.elemId != null && state?.user?.name != null)
    .map(([clientId, state]) =>
      userAwarenessTemplate(clientId, state.singleSelect.elemId, state.user.name)
    )}`;

  
  let highlights = html`${Array.from(yProvider.awareness.getStates().entries())
    .filter(([_, state]) => state?.highlights != null)
    .map(([clientId, state]) => highlightListTemplate(clientId, state.highlights))
  }`;

  render(
    html`${collabLayer(multiSelects, singleSelects, userAwareness)}
    ${renderHighlightLayer(highlights)}`,
    document.querySelector('#output')
  );
}

window.addEventListener('DOMContentLoaded', () => {
  // const styleSheet = document.createElement('style');
  // styleSheet.id = 'multi-select-sheet';
  // styleSheet.innerHTML = `
  // .multi-select-area {
  //   position: absolute;
  //   z-index: var(--collab-layer-zIndex);
  //   background-color: blue;
  //   pointer-events: none;
  // }
  // `.trim();
  // document.head.appendChild(styleSheet);

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
          // renderHighlightLayer();
        }
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
});

function collabLayer(...children) {
  let output = document.querySelector('#output');
  let renderBefore = document.querySelector('#output > svg');
  uiCoords.svgHeight = renderBefore?.height.baseVal.value ?? window.innerHeight;

  return collabTemplate(uiCoords.svgHeight, ...children);
}

// function renderCollabLayer(...children) {
//   let output = document.querySelector('#output');
//   let renderBefore = document.querySelector('#output > svg');
//   uiCoords.svgHeight = renderBefore?.height.baseVal.value ?? window.innerHeight;

//   render(
//     collabTemplate(uiCoords.svgHeight, ...children),
//     output,
//     { renderBefore }
//   );
// }

export function renderHighlightLayer(...children) {
  let output = document.querySelector('#output');
  let svg = document.querySelector('#output > svg');

  let collab = output.querySelector('.collab-container');
  let renderBefore = collab != null ? collab : svg;
  let svgHeight = svg?.height.baseVal.value ?? window.innerHeight;

  // console.log('Rendering highlight layer', {svgHeight, output, renderBefore});

  return highlightLayerTemplate(svgHeight, ...children)
  // render(
  //   highlightLayerTemplate(svgHeight, ...children),
  //   output,
  //   { renderBefore }
  // );
}

function addListenersToOutput(outputTarget) {
  let startTime, endTime;
  let shouldMultiSelect = false;
  const rbSelection = new RubberBandSelection();

  document.addEventListener('mousedown', (event) => {
    // Start selecting only when there isn't a note element on the cursor
    if (event.target.nodeName != 'svg') return;

    if (!document.querySelector('.collab-container')) {
      collabLayer();
    }
    
    startTime = performance.now();

    rbSelection.isSelecting = true;
    rbSelection.setUpperCoords(event);
    // rbSelection.coords.left = event.clientX;
    // rbSelection.coords.top = event.clientY;

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
        // rbSelection.coords.right = event.clientX;
        // rbSelection.coords.bottom = event.clientY;
        rbSelection.setLowerCoords(event);

        // rbSelection.selectAreaElem.hidden = false;
        rbSelection.show();
        // rbSelection.updateElemPosition();

        shouldMultiSelect = true;
      }
    }
  });

  document.addEventListener('mouseup', handleMouseUp(yProvider.awareness));

  function handleMouseUp(awareness) {
    return () => {
      rbSelection.reCalculateCoords();
      rbSelection.isSelecting = false;

      if (shouldMultiSelect) {
        // TODO: extremely inefficient, selecting every single note element
        const notes = Array.from(document.querySelectorAll('.note, .beam'));
        const selectedNotes = rbSelection.selectNoteElements(notes);

        const multiSelectedNotes = selectedNotes.map((note) => note.id).filter((id) => /^note/g.test(id))

        if (multiSelectedNotes.length > 0) {
          awareness?.setLocalStateField('multiSelect', multiSelectedNotes);
        }

        shouldMultiSelect = false;
      }

      rbSelection.resetCoords();
      // rbSelection.selectAreaElem.hidden = true;
      rbSelection.hide();
      startTime = endTime = undefined;
    };
  }
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

