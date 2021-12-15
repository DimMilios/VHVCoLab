import { transposeNote } from '../vhv-scripts/editor.js';

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
      console.log(position, { transposeAmount });
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
};
