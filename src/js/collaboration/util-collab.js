export const MULTI_SELECT_ALPHA = 0.3;

export function getCoordinates(target) {
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

export function getCoordinatesWithOffset(target, offsetElem) {
  const targetBounds = target.getBoundingClientRect();
  const closestStaffElem = target?.closest('.staff');

  let staffBounds = closestStaffElem?.getBoundingClientRect();

  let output = document.querySelector('#output');
  let scrollTop = output.closest('[class*=output-container]').scrollTop

  return {
    staffX: staffBounds.x ?? targetBounds.x,
    staffY: staffBounds.y ?? targetBounds.y,
    targetX: targetBounds.x - offsetElem.offsetWidth,
    targetY: targetBounds.y - offsetElem.offsetTop + scrollTop,
    targetBounds,
    staffBounds,
  };
}

// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export function hexToRgbA(hex, alpha) {
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

export function calculateMultiSelectCoords(selectedNotes) {
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

export function calculateMultiSelectCoordsWithOffset(selectedNotes, offsetElem, scrollTop = 0) {
  if (!selectedNotes || !Array.isArray(selectedNotes) || selectedNotes.length == 0) {
    console.error('Argument "selectedNotes" must be an array of elements');
    return;
  }
  
  if (!offsetElem || !(offsetElem instanceof HTMLElement)) {
    console.error('Argument "offsetElem" must be an HTMLElement');
    return;
  }
  
  if (typeof scrollTop != 'number') {
    console.error('Argument "scrollTop" must be a number');
    return;
  }

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
    { left: Infinity, top: Infinity, right: Number.NEGATIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY }
  );

  return {
    left: coords.left - offsetElem.offsetWidth,
    top: coords.top - offsetElem.offsetTop + scrollTop,
    width: coords.right - coords.left,
    height: coords.bottom - coords.top,
  };
}

/**
 * Provides the overlapping status between two elements
 * based on the passed in Element objects
 *
 * https://time2hack.com/checking-overlap-between-elements/
 * 
 * @param {Element, Element} Element object of DOM
 * @return {Boolean} overlap status or null if native object not received
 */
export const isOverlapping = (e1, e2) => {
  if (e1.length && e1.length > 1) {
    e1 = e1[0];
  }
  if (e2.length && e2.length > 1){
    e2 = e2[0];
  }
  const rect1 = e1 instanceof Element ? e1.getBoundingClientRect() : false;
  const rect2 = e2 instanceof Element ? e2.getBoundingClientRect() : false;
  
  let overlap = false;
 
  if (rect1 && rect2) {
    overlap = !(
      rect1.right < rect2.left || 
      rect1.left > rect2.right || 
      rect1.bottom < rect2.top || 
      rect1.top > rect2.bottom
    );
    return overlap;  
  }

  console.warn('Please provide valid HTMLElement object');
  return overlap;
}