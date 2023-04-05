import { global_cursor } from '../vhv-scripts/global-variables';
import { getAceEditor } from '../vhv-scripts/setup';
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
  let scrollTop = window.scrollY;

  return {
    staffX: staffBounds?.x ?? targetBounds.x,
    staffY: staffBounds?.y ?? targetBounds.y,
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

export function calculateMultiSelectCoordsWithOffset(
  selectedNotes,
  offsetElem
) {
  if (
    !selectedNotes ||
    !Array.isArray(selectedNotes) ||
    selectedNotes.length == 0
  ) {
    console.log(
      'Argument "selectedNotes" must be an array of elements',
      selectedNotes
    );
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
  let top =
    coords.top +
    window.scrollY -
    document.getElementById('topnav').getBoundingClientRect().height;

  const waveformCoords = document
    .getElementById('waveforms-display')
    ?.getBoundingClientRect();
  if (waveformCoords) {
    // Waveform is displayed, get its height into account when calculating multi select coordinates
    top -= waveformCoords.height;
  }

  return {
    left: coords.left - offsetElem.offsetWidth,
    top,
    width: coords.right - coords.left,
    height: coords.bottom - coords.top,
  };
}

export function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
}

export function unfocusCommentHighlights() {
  document
    .querySelectorAll('.highlight-area')
    .forEach((h) => h.classList.remove('highlight-area-focus'));
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

export function setEditorContents(line, field, token) {
  let editor = getAceEditor();

  var i;
  var linecontent = editor.session.getLine(line - 1);
  var range = new Range(line - 1, 0, line - 1, linecontent.length);

  var components = linecontent.split(/\t+/);
  components[field - 1] = token;

  // count tabs between fields
  var tabs = [];
  for (i = 0; i < components.length + 1; i++) {
    tabs[i] = '';
  }
  var pos = 0;
  if (linecontent[0] != '\t') {
    pos++;
  }
  for (i = 1; i < linecontent.length; i++) {
    if (linecontent[i] == '\t') {
      tabs[pos] += '\t';
    } else if (linecontent[i] != '\t' && linecontent[i - 1] == '\t') {
      pos++;
    }
  }

  var newlinecontent = '';
  for (i = 0; i < tabs.length; i++) {
    newlinecontent += tabs[i];
    if (components[i]) {
      newlinecontent += components[i];
    }
  }

  var column = 0;
  for (i = 0; i < field - 1; i++) {
    column += components[i].length;
    column += tabs[i].length;
  }

  editor.session.replace(range, newlinecontent);
  // displayNotation();
}

export function getEditorContents(line, field) {
  let editor = getAceEditor();
  var token = '';

  var linecontent = editor.session.getLine(line - 1);

  var col = 0;
  if (field > 1) {
    var tabcount = 0;
    for (let i = 0; i < linecontent.length; i++) {
      col++;
      if (linecontent[i] == '\t') {
        if (i > 0 && linecontent[i - 1] != '\t') {
          tabcount++;
        }
      }
      if (tabcount == field - 1) {
        break;
      }
    }
  }
  for (var c = col; c < linecontent.length; c++) {
    if (linecontent[c] == '\t') {
      break;
    }
    if (linecontent[c] == undefined) {
      console.log('undefined index', c);
      break;
    }
    token += linecontent[c];
  }

  return token;
}
