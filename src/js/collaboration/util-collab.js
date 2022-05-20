import { state } from "../state/comments";
import { layoutService } from "../state/layoutStateMachine";
import { global_cursor } from "../vhv-scripts/global-variables";
// import { handleCommentsMessage } from "../yjs-setup";

export const MULTI_SELECT_ALPHA = 0.3;
export const SELECT_OPACITY = 0.3;

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

export function calculateMultiSelectCoordsWithOffset(selectedNotes, offsetElem) {
  if (!selectedNotes || !Array.isArray(selectedNotes) || selectedNotes.length == 0) {
    console.log('Argument "selectedNotes" must be an array of elements', selectedNotes);
    return;
  }
  
  if (!offsetElem || !(offsetElem instanceof HTMLElement)) {
    console.log('Argument "offsetElem" must be an HTMLElement');
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
    {
      left: Infinity,
      top: Infinity,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
    }
  );

  return withScrollingAndOffset(coords, offsetElem);
}

function withScrollingAndOffset(coords, offsetElem) {
  return {
    left: coords.left - offsetElem.offsetWidth,
    top: coords.top + window.scrollY - document.getElementById('topnav').getBoundingClientRect().height,
    width: coords.right - coords.left,
    height: coords.bottom - coords.top,
  };
}

export function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export function unfocusCommentHighlights() {
  document.querySelectorAll('.highlight-area').forEach(h => h.classList.remove('highlight-area-focus'));
}

export function clearCursorHighlight() {
  if (global_cursor.CursorNote) {
    var classes = global_cursor.CursorNote.getAttribute('class');
    var classlist = classes.split(' ');
    var outclass = '';
    for (var i = 0; i < classlist.length; i++) {
      if (classlist[i] == 'highlight') {
        continue;
      }
      outclass += ' ' + classlist[i];
    }
    outclass = outclass.replace(/^\s+/, '');
    global_cursor.CursorNote.setAttribute('class', outclass);
    global_cursor.CursorNote = null;
  }
}

export function showCommentSection() {
  // Check if comment highlights are computed
  let highlightsComputed = state.comments.some(c => c.highlight == null);

  // if (highlightsComputed) {
  //   handleCommentsMessage(new MessageEvent('message', { data: JSON.stringify(state.comments) }));
  //   console.log('Comments after highlight', state.comments);
  // }

  layoutService.send('SHOW_COMMENTS_HIDE_TEXT');
}
export function hideCommentSection() {
  layoutService.send('HIDE_COMMENTS');
  layoutService.send('SHOW_TEXT');
}