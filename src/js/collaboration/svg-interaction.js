import { number } from 'lib0';
import { transposeNote } from '../vhv-scripts/editor.js';
import { configureAceEditor, getAceEditor } from '../vhv-scripts/setup.js';
import { SELECT_OPACITY } from './util-collab.js';

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
      if (attr === 'id') {
        elem.dataset.refElem = elem.id;
      }
      elem.removeAttribute(attr);
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
  if (!parentElem)
    return;

  const defScale = document.querySelector('.definition-scale');
  const viewBox = defScale?.viewBox;

  let svg = document.querySelector('#collab-container-svg');

  if (!svg) {
    // We need to set the viewBox property of the parent SVG element.
    // SVG transforms can be then applied to the CHILDREN elements.
    // Consider adding another SVG element inside the container created below that
    // can be styled and transformed when needed.
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (viewBox) {
      svg.setAttributeNS(null, 'viewBox', `${Object.values(fromSVGRect(viewBox.baseVal)).join(' ')}`);
    }
    svg.id = 'collab-container-svg';
    // svg.setAttribute('fill', 'blue');
  }

  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  const container = copySVGElement(defScale.firstElementChild);
  container.classList.add('draggable-group-svg');
  svg.appendChild(container);
  
  // return parentElem.firstElementChild.appendChild(svg);
  return parentElem.querySelector('svg').appendChild(svg);
}

let editor;
let oldSession;
/**
 * 
 * @param {{ item: Element, row: number, column: number }} sessionOptions
 */
export function createNewEditorSession ({ item, row, column }) {
  editor =  getAceEditor();
  oldSession = editor.getSession();

  let newSession = ace.createEditSession(oldSession.getValue(), 'ace/mode/humdrum');

  // editor.setSession(newSession);
  // configureAceEditor();
}

export function createDraggableContainer(noteElem) {

  // noteElem = document.querySelector('#note-L25F4');
  console.log('Creating draggable container for', {id: noteElem.id});
  const collabLayer = createSVGCollabLayer(document.getElementById('output'));

  // collabLayer.firstElementChild.appendChild(copySVGElement(noteElem, true));
  let noteCopy = copySVGElement(noteElem, true);
  
  // Copy parent layer instead
  let layer = noteElem.closest('.layer');
  if (layer) {
    console.log(`Parent layer for: ${noteElem.id} is ${layer.id}`);
    collabLayer.firstElementChild.appendChild(copySVGElement(layer, true));
  }
  
  makeDraggable(collabLayer, noteCopy);
}

// https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
// if an element has attributes of (x,y),
// then it will have coordinates on screen of (ax + e, dy + f)
function makeDraggable(svgElem, noteElem) {
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
    };
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

    for(let div of document.querySelectorAll(`.users-div[data-ref-id="${noteElem.dataset.refElem}"], .single-select[data-ref-id="${noteElem.dataset.refElem}"]`)) {
      div.style.opacity = 0;
    }

  }

  let prevPositionY;
  let movementY;
  let transposeAmount;
  /** @type {{ id: string, line: number, field: number, subfield: number } | {}} */
  let editorPosition = {};

  function drag(event) {
    if (selectedElem) {
      event.preventDefault();
      // if (timePassed >= 200) {
        const coords = getMousePosition(event);
        // transform.setTranslate(coords.x - offset.x, coords.y - offset.y);
        movementY = coords.y - offset.y;
  
        if (prevPositionY > movementY) {
          transposeAmount += 0.3;
        } else if (prevPositionY < movementY) {
          transposeAmount -= 0.3;
        }
        // const noteElem = selectedElem?.querySelector('.note');
        if (noteElem) {
          editorPosition = extractEditorPosition(noteElem);
          // console.log(position, {transposeAmount});
          // document.querySelector(`#${noteElem.dataset.refElem}`).style.opacity = 0;
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
      // console.log(editorPosition, { transposeAmount });
      // All notes for a piano: 88
      // module the transposition amount with 44 (factor in negative values -
      // moving below the note's current position)
      transposeNote(editorPosition.id, editorPosition.line, editorPosition.field, editorPosition.subfield, Math.floor(transposeAmount) % 44);
    }
    selectedElem = null;

    let usersDiv = document.querySelector(`.users-div[data-ref-id="${noteElem.dataset.refElem}"]`)
    let singleSelect = document.querySelector(`.single-select[data-ref-id="${noteElem.dataset.refElem}"]`);

    if (usersDiv) {
      usersDiv.style.opacity = 1;
    }

    if (singleSelect) {
      singleSelect.style.opacity = SELECT_OPACITY;
    }

  }
}

/**
 * 
 * @param {*} element 
 * @returns {{ id: string, line: number, field: number, subfield: number }}
 */
function extractEditorPosition(element) {
  // console.log('Element passed to extractEditorPosition', element);
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

window.svgCollab = {
  makeDraggable,
  createDraggableContainer
}