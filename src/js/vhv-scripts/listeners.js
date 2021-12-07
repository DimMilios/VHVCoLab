/* global $ */

//
// Programmer:     Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date:  Sun Apr 17 17:21:46 PDT 2016
// Last Modified:  Thu Aug 18 21:03:35 CEST 2016
// Filename:       listeners.js
// Web Address:    https://verovio.humdrum.org/listeners.js
// Syntax:         JavaScript 1.8/ECMAScript 5
// vim:            ts=3: ft=javascript
//
// Description:   Event listeners and related code for index.html.
//

import {
  FILEINFO,
  global_cursor,
  global_editorOptions,
  global_interface,
  global_playerOptions,
  global_verovioOptions,
} from './global-variables.js';
import { getAceEditor, setupSplitter } from './setup.js';
import {
  displayNotation,
  cleanFont,
  updateEditorMode,
  setTextInEditor,
} from './misc.js';
import { observeSvgContent } from './utility-svg.js';
import { HnpMarkup } from './highlight.js';

import {
  clearContent,
  toggleFreeze,
  showBufferedHumdrumData,
  displayMei,
  displayMeiNoType,
  displayPdf,
  reloadData,
  decreaseTab,
  increaseTab,
  toggleHumdrumCsvTsv,
  toggleTextVisibility,
  playCurrentMidi,
  displayWork,
  gotoPreviousPage,
  gotoNextPage,
  gotoFirstPage,
  gotoLastPage,
  hideRepertoryIndex,
} from './misc.js';
import {
  addBarlineAboveCurrentPosition,
  addDataLineAboveCurrentPosition,
  addInterpretationLineAboveCurrentPosition,
  addLocalCommentLineAboveCurrentPosition,
  processNotationKey,
  setEditorContentsMany,
  setInterfaceSingleNumber,
  transposeNotes,
} from './editor.js';
import {
  togglePlaceColoring,
  toggleAppoggiaturaColoring,
  toggleLayerColoring,
  goUpHarmonically,
  goDownHarmonically,
  goToNextNoteOrRest,
  goToPreviousNoteOrRest,
} from './utility-svg.js';
import {
  saveSvgData,
  restoreEditorContentsLocally,
  saveEditorContentsLocally,
} from './buffer.js';
import { saveEditorContents } from './saving.js';
import { generatePdfFull, generatePdfSnapshot } from './pdf.js';
import { getMenu } from '../menu.js';
import { yProvider } from '../yjs-setup.js';
import { clearSingleSelect } from './collab-extension.js';

// window.HIDEMENU = false;
var PDFLISTINTERVAL = null;

document
  .getElementById('play-button')
  ?.addEventListener('click', () => playCurrentMidi());

if (localStorage.FONT) {
  global_verovioOptions.FONT = cleanFont(localStorage.FONT);
}

//////////////////////////////
//
// highlighting options --
//

const markup = new HnpMarkup();

//////////////////////////////
//
// DomContentLoaded event listener -- Display the sample data.
//
import { setEditorMode } from './global-variables.js';
import { getTextFromEditorRaw, dataIntoView } from './misc.js';
import { loadEditorFontSizes } from './verovio-options.js';
import { setupDropArea } from '../drop.js';
import { buildPdfIconListInMenu } from './menu.js';
import { inSvgImage } from './utility-svg.js';

document.addEventListener('DOMContentLoaded', function () {
  loadEditorFontSizes();
  var inputElement = document.querySelector('#input');
  if (inputElement) {
    inputElement.style.fontSize = global_editorOptions.INPUT_FONT_SIZE + 'rem';
  }

  setEditorMode('humdrum');

  // The block of code below loads the edits to the Ace editor from the AUTOSAVE local buffer,
  // but it breaks Ace Editor

  var ctime = new Date().getTime();
  var otime = localStorage.getItem('AUTOSAVE_DATE');
  var dur = ctime - otime;
  var encodedcontents = localStorage.getItem('AUTOSAVE');
  var autosave = decodeURIComponent(encodedcontents);
  if (!autosave) {
    autosave = '';
  }
  if (!autosave.match(/^\s*$/) && dur < 60000) {
    var input = document.querySelector('#input');
    if (input) {
      // input.textContent = autosave;
      // HERE WE RESTORE THE UPDATED EDITOR STATE FROM LOCAL STORAGE
      // setTextInEditor(autosave);
    }
  }

  getAceEditor()._dispatchEvent('ready');
  setupDropArea();

  displayNotation();

  setupSplitter();

  // set init (default) state
  $('#input').data('x', $('#input').outerWidth());
  $('#input').data('y', $('#input').outerHeight());

  var body = document.querySelector('body');
  body.addEventListener('click', function (event) {
    // console.log("SINGLE CLICK", event);
    // turnOffAllHighlights();
    // var insvg = inSvgImage(event.target);
    if (inSvgImage(event.target)) {
      dataIntoView(event);
    }
  });
  body.addEventListener('dblclick', function (event) {
    console.log('DOUBLE CLICK');
  });

  window.addEventListener('keydown', processNotationKeyCommand, true);
  window.addEventListener('keydown', processInterfaceKeyCommand);

  observeSvgContent();

  PDFLISTINTERVAL = setInterval(function () {
    buildPdfIconListInMenu();
  }, 3000);
});

function extractEditorPosition(element) {
  var id = element.id;
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

function transposeMultiSelect(state, amount) {
  const notes = Array.from(
    document.querySelectorAll(
      state.multiSelect.map((el) => '#' + el).join(',')
    )
  )
    .map((note) => extractEditorPosition(note))
    .filter(Boolean)
    .map((note) => ({ ...note, amount }));

  const transposedNotes = transposeNotes(notes);
  setEditorContentsMany(transposedNotes);
  return transposedNotes;
}

//////////////////////////////
//
// keydown event listener -- Notation editor listener.
//

function processNotationKeyCommand(event) {
  if (!event.preventDefault) {
    event.preventDefault = function () {};
  }

  // only works outside of the editor.
  if (event.altKey || event.target.nodeName == 'TEXTAREA') {
    return;
  }
  if (document.activeElement.nodeName == 'INPUT') {
    // needed to suppress key commands when running vim command
    return;
  }

  //undo doesn't need CursorNote
  if (event.code === ZKey && (event.ctrlKey || event.metaKey)) {
    const editor = getAceEditor();
    if (!editor) {
      throw new Error('Ace Editor is undefined');
    }
    editor.undo();
    return;
  }

  const localState = yProvider.awareness.getLocalState();
  if (localState.multiSelect) {
    // Transposition for multi selected notes
    // FIX: If the global CursorNote is defined, and we then try to transpose a multi-selected area
    // the CursorNote is re-assigned to one of the multi-selected note elements
    if (event.code === UpKey && event.shiftKey) {
      transposeMultiSelect(localState, 1);
      return;
    } else if (event.code === DownKey && event.shiftKey) {
      transposeMultiSelect(localState, -1);
      return;
    } else if (event.code === UpKey && event.ctrlKey) {
      transposeMultiSelect(localState, 7);
      return;
    } else if (event.code === DownKey && event.ctrlKey) {
      transposeMultiSelect(localState, -7);
      return;
    }
  }

  if (!global_cursor.CursorNote) {
    return;
  }
  if (!global_cursor.CursorNote.id) {
    return;
  }

  switch (event.code) {
    case AKey:
      processNotationKey('a', global_cursor.CursorNote);
      break;

    case BKey:
      processNotationKey('b', global_cursor.CursorNote);
      break;

    case CKey:
      processNotationKey('c', global_cursor.CursorNote);
      break;

    case DKey:
      if (event.shiftKey) {
        processNotationKey('D', global_cursor.CursorNote);
      }
      break;

    // case EKey:

    case FKey:
      processNotationKey('f', global_cursor.CursorNote);
      break;

    // case GKey:
    // case HKey:

    case IKey:
      processNotationKey('i', global_cursor.CursorNote);
      break;

    case JKey:
      if (event.shiftKey) {
        processNotationKey('J', global_cursor.CursorNote);
      }
      break;

    // case KKey:

    case LKey:
      if (event.shiftKey) {
        processNotationKey('L', global_cursor.CursorNote);
      }
      break;

    case MKey:
      if (event.shiftKey) {
        processNotationKey('M', global_cursor.CursorNote);
      } else {
        processNotationKey('m', global_cursor.CursorNote);
      }
      break;

    case NKey:
      processNotationKey('n', global_cursor.CursorNote);
      break;

    // case OKey:

    case PKey:
      if (event.shiftKey) {
        processNotationKey('P', global_cursor.CursorNote);
      } else {
        processNotationKey('p', global_cursor.CursorNote);
      }
      break;

    case QKey:
      processNotationKey('q', global_cursor.CursorNote);
      break;

    // case RKey:

    case SKey:
      processNotationKey('s', global_cursor.CursorNote);
      break;

    case TKey:
      if (event.shiftKey) {
        processNotationKey('T', global_cursor.CursorNote);
      } else {
        processNotationKey('t', global_cursor.CursorNote);
      }
      break;

    // case UKey:

    case VKey:
      if (global_cursor.CursorNote.id.match('note-')) {
        processNotationKey('^', global_cursor.CursorNote);
      }
      break;

    case WKey:
      if (event.shiftKey) {
        processNotationKey('W', global_cursor.CursorNote);
      } else {
        processNotationKey('w', global_cursor.CursorNote);
      }
      break;

    case XKey:
      processNotationKey('X', global_cursor.CursorNote);
      break;

    case YKey:
      processNotationKey('y', global_cursor.CursorNote);
      break;

    // case ZKey:

    case OneKey:
      processNotationKey('1', global_cursor.CursorNote);
      break;

    case TwoKey:
      if (event.shiftKey) {
        processNotationKey('@', global_cursor.CursorNote);
      } else {
        processNotationKey('2', global_cursor.CursorNote);
      }
      break;

    case ThreeKey:
      if (event.shiftKey) {
        processNotationKey('#', global_cursor.CursorNote);
      } else {
        processNotationKey('3', global_cursor.CursorNote);
      }
      break;

    case FourKey:
      processNotationKey('4', global_cursor.CursorNote);
      break;

    case FiveKey:
      processNotationKey('5', global_cursor.CursorNote);
      break;

    case SixKey:
      if (global_cursor.CursorNote.id.match('note-')) {
        if (event.shiftKey) {
          processNotationKey('^^', global_cursor.CursorNote);
        } else {
          processNotationKey('6', global_cursor.CursorNote);
        }
      } else {
        processNotationKey('6', global_cursor.CursorNote);
      }
      break;

    case SevenKey:
      processNotationKey('7', global_cursor.CursorNote);
      break;

    case EightKey:
      processNotationKey('8', global_cursor.CursorNote);
      break;

    case NineKey:
      processNotationKey('9', global_cursor.CursorNote);
      break;

    case MinusKey:
      processNotationKey('-', global_cursor.CursorNote);
      break;

    case SingleQuoteKey:
      processNotationKey("'", global_cursor.CursorNote);
      break;

    case SemiColonKey:
      if (event.shiftKey) {
        processNotationKey(':', global_cursor.CursorNote);
      } else {
        processNotationKey(';', global_cursor.CursorNote);
      }
      break;

    case BackQuoteKey:
      if (event.shiftKey) {
        processNotationKey('~', global_cursor.CursorNote);
      } else {
        processNotationKey('`', global_cursor.CursorNote);
      }
      break;

    case UpKey:
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        if (global_cursor.CursorNote.id.match('note-')) {
          console.log('Shift + Up, Current note: ', global_cursor.CursorNote);
          processNotationKey('transpose-up-step', global_cursor.CursorNote);
        }
      } else if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        if (global_cursor.CursorNote.id.match('note-')) {
          processNotationKey('transpose-up-octave', global_cursor.CursorNote);
        }
      } else {
        event.preventDefault();
        event.stopPropagation();
        goUpHarmonically(global_cursor.CursorNote);
      }
      break;

    case DownKey:
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        if (global_cursor.CursorNote.id.match('note-')) {
          processNotationKey('transpose-down-step', global_cursor.CursorNote);
        }
      } else if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        if (global_cursor.CursorNote.id.match('note-')) {
          processNotationKey('transpose-down-octave', global_cursor.CursorNote);
        }
      } else {
        event.preventDefault();
        event.stopPropagation();
        goDownHarmonically(global_cursor.CursorNote);
      }
      break;

    case DeleteKey:
    case BackKey:
      processNotationKey('delete', global_cursor.CursorNote);
      event.stopPropagation();
      break;

    case LeftKey:
      if (global_cursor.CursorNote.id.match('slur-')) {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          processNotationKey('rightEndMoveBack', global_cursor.CursorNote);
        } else {
          processNotationKey('leftEndMoveBack', global_cursor.CursorNote);
        }
      } else {
        // move one note to the left
        event.preventDefault();
        event.stopPropagation();
        goToPreviousNoteOrRest(global_cursor.CursorNote.id);
      }
      break;

    case RightKey:
      if (global_cursor.CursorNote.id.match('slur-')) {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          processNotationKey('rightEndMoveForward', global_cursor.CursorNote);
        } else {
          processNotationKey('leftEndMoveForward', global_cursor.CursorNote);
        }
      } else {
        // move one note to the right
        event.preventDefault();
        event.stopPropagation();
        goToNextNoteOrRest(global_cursor.CursorNote.id);
      }
      break;

    case EscKey:
      event.preventDefault();
      event.stopPropagation();

      clearSingleSelect();

      processNotationKey('esc', global_cursor.CursorNote);
      break;
  }
}

//////////////////////////////
//
// keydown event listener -- Interface control listener.
//

export function processInterfaceKeyCommand(event) {
  if (!event.preventDefault) {
    event.preventDefault = function () {};
  }

  if (!event.altKey && event.target.nodeName == 'TEXTAREA') {
    // needed to prevent key commands when editing text
    return;
  }
  if (!event.altKey && document.activeElement.nodeName == 'INPUT') {
    // needed to prevent key commands when running vim command
    return;
  }

  if (event.metaKey) {
    // usually ignore metaKey unless 0:
    if (event.code == ZeroKey) {
      getMenu().resetTextFontSize();
      // window.MENU.resetTextFontSize();
      global_verovioOptions.SCALE = 40;
      localStorage.SCALE = global_verovioOptions.SCALE;
      displayNotation();
      // not preventingDefault so that web browser can reset size as well.
    }
    return;
  }

  switch (event.code) {
    case AKey: // UNUSED
      // if (event.altKey) {
      // 	if (event.shiftKey) {
      // 		// toggle display of toolbar
      // 		// toggleNavigationToolbar();
      // 	} else {
      // 		// toggle display of banner
      // 		toggleVhvTitle();
      // 	}
      // 	event.preventDefault();
      // }
      break;

    case BKey:
      if (event.altKey) {
        if (event.shiftKey) {
          addBarlineAboveCurrentPosition();
          event.preventDefault();
        }
      }
      break;

    case CKey:
      if (event.altKey) {
        if (event.shiftKey) {
          togglePlaceColoring();
        }
        event.preventDefault();
      }
      break;

    case DKey: // Add null data line
      if (event.altKey) {
        if (event.shiftKey) {
          addDataLineAboveCurrentPosition();
        }
        // else {
        // 	toggleMenuDisplay();
        // }
        event.preventDefault();
      }
      break;

    case EKey: // erase text editor contents or Tooggle display of menu with shift key.
      if (event.altKey) {
        // if (event.shiftKey) {
        // 	toggleMenuAndToolbarDisplay();
        // } else {
        // 	clearContent();
        // }
        clearContent();
        event.preventDefault();
      }
      break;

    case FKey: // toogle notation update freezing
      if (event.altKey) {
        if (event.shiftKey) {
          displayNotation(false, true);
        } else {
          toggleFreeze();
        }
        event.preventDefault();
      }
      break;

    case GKey: // save current view to SVG image
      if (event.altKey) {
        // displaySvg();
        saveSvgData();
        event.preventDefault();
      }
      break;

    case HKey: // show Humdrum data in text editor
      if (event.altKey) {
        if (!global_interface.ShowingIndex) {
          showBufferedHumdrumData();
          event.preventDefault();
        }
      }
      break;

    case IKey: // Add null interpretation line
      if (event.altKey) {
        if (event.shiftKey) {
          addInterpretationLineAboveCurrentPosition();
          event.preventDefault();
        }
      }
      break;

    case JKey: // UNUSED
      break;

    case KKey: // UNUSED
      break;

    case LKey: // toggle color of staff layers
      if (event.altKey) {
        if (event.shiftKey) {
          addLocalCommentLineAboveCurrentPosition();
        } else {
          toggleLayerColoring();
        }
        event.preventDefault();
      }
      break;

    case MKey: // show MEI data in text editor
      if (event.altKey) {
        setEditorMode('xml');
        // EditorMode = "xml";
        if (event.shiftKey) {
          // display with @type data
          displayMei();
        } else {
          // display without @type data
          displayMeiNoType();
        }
        event.preventDefault();
      }
      break;

    case NKey: // toggle display of navigation toolbar
      // if (event.altKey) {
      // 	if (event.shiftKey) {
      // 		// toggleNavigationToolbar();
      // 		gotoPrevToolbarDelta();
      // 	} else {
      // 		chooseToolbarMenu();
      // 	}
      // 	event.preventDefault();
      // }
      break;

    case OKey: // toggle display of *oclef data
      if (event.altKey) {
        global_interface.OriginalClef = !global_interface.OriginalClef;
        console.log('Original clef changed to:', global_interface.OriginalClef);
        if (!global_interface.ShowingIndex) {
          displayNotation();
        }
        event.preventDefault();
      }
      break;

    case PKey: // show PDF in separate window
      if (event.altKey) {
        displayPdf();
        event.preventDefault();
      }
      break;

    case QKey: // toggle coloring of appoggiaturas
      if (event.altKey) {
        if (event.shiftKey) {
          // do nothing
        } else {
          toggleAppoggiaturaColoring();
        }
        event.preventDefault();
      }
      break;

    case RKey: // reload Humdrum data from server
      if (event.altKey) {
        if (event.shiftKey) {
          restoreEditorContentsLocally();
          event.preventDefault();
        } else {
          reloadData();
          event.preventDefault();
        }
      }
      break;

    case SKey: // save contents of text editor to file
      if (event.altKey) {
        if (event.shiftKey) {
          saveEditorContentsLocally();
          event.preventDefault();
        } else {
          saveEditorContents();
          event.preventDefault();
        }
      }
      break;

    case TKey: // save PDF file
      // Needed functions are defined in _includes/pdfkit.html
      if (event.altKey) {
        if (event.shiftKey) {
          if (typeof generatePdfFull === 'function') {
            generatePdfSnapshot();
          }
        } else {
          if (typeof generatePdfSnapshot === 'function') {
            generatePdfFull();
          }
        }
        event.preventDefault();
      }
      break;

    case UKey: // toggle TSV/CSV display of Humdrum data
      if (event.shiftKey) {
        decreaseTab();
        event.preventDefault();
      } else {
        toggleHumdrumCsvTsv();
        event.preventDefault();
      }
      break;

    case WKey: // adjust notation width parameter
      if (event.altKey) {
        if (event.shiftKey) {
          global_editorOptions.SPACINGADJUSTMENT -= 0.05;
        } else {
          global_editorOptions.SPACINGADJUSTMENT += 0.05;
        }
        if (global_editorOptions.SPACINGADJUSTMENT <= 0.0) {
          global_editorOptions.SPACINGADJUSTMENT = 0.0;
        }
        event.preventDefault();
        displayNotation();
      }
      break;

    case XKey: // UNUSED
      break;

    case YKey: // show/hide text editor
      if (event.altKey) {
        if (!global_interface.ShowingIndex) {
          toggleTextVisibility();
        }
        event.preventDefault();
      }
      break;

    /*		case ZKey:  // use undo key from OS/browser
			if (event.ctrlKey || event.metaKey) {
			window.EDITOR.undo();
			};
			break;
*/

    case ZeroKey:
      setInterfaceSingleNumber(0);
      break;
    case OneKey:
      setInterfaceSingleNumber(1);
      break;
    case TwoKey:
      setInterfaceSingleNumber(2);
      break;
    case ThreeKey:
      setInterfaceSingleNumber(3);
      break;
    case FourKey:
      setInterfaceSingleNumber(4);
      break;
    case FiveKey:
      setInterfaceSingleNumber(5);
      break;
    case SixKey:
      setInterfaceSingleNumber(6);
      break;
    case SevenKey:
      setInterfaceSingleNumber(7);
      break;
    case EightKey:
      setInterfaceSingleNumber(8);
      break;
    case NineKey:
      setInterfaceSingleNumber(9);
      break;

    case SpaceKey: // start/pause MIDI playback
      if (!global_playerOptions.PLAY) {
        if (global_playerOptions.PAUSE) {
          window.play();
          global_playerOptions.PLAY = true;
          global_playerOptions.PAUSE = false;
        } else {
          playCurrentMidi();
          global_playerOptions.PLAY = true;
          global_playerOptions.PAUSE = false;
        }
      } else {
        global_playerOptions.PLAY = false;
        global_playerOptions.PAUSE = true;
        window.pause();
      }
      event.preventDefault();
      break;

    case CommaKey: // toggle TSV/CSV display of Humdrum data
      // decrease tab size in editor
      // See UKey for relocation of comma-command for
      // (related to non-US keyboard layout)
      if (event.shiftKey) {
        decreaseTab();
        event.preventDefault();
      } else {
        //toggleHumdrumCsvTsv();
        //event.preventDefault();
      }
      break;

    case DotKey: // increase tab size in editor
      if (event.shiftKey) {
        increaseTab();
        event.preventDefault();
      }
      break;

    case UpKey: // return to repertory index
      // if (event.shiftKey) {
      //   if (FILEINFO['has-index'] == 'true') {
      //     displayIndex(FILEINFO['location']);
      //   }
      // }
      // event.preventDefault();
      break;

    case PgUpKey: // shift: go to previous repertory work/movement
    case LeftKey: // go to previous page
      if (event.shiftKey) {
        displayWork(FILEINFO['previous-work']);
      } else {
        gotoPreviousPage();
      }
      event.preventDefault();
      break;

    case PgDnKey: // shift: go to next repertory work/movement
    case RightKey: // go to next page
      if (event.shiftKey) {
        displayWork(FILEINFO['next-work']);
      } else {
        gotoNextPage();
      }
      event.preventDefault();
      break;

    case HomeKey: // go to the first page
      gotoFirstPage();
      event.preventDefault();
      break;

    case EndKey: // go to the last page
      gotoLastPage();
      event.preventDefault();
      break;

    case SlashKey: // toggle menu display (to be implemented)
      if (event.shiftKey) {
        event.preventDefault();
      }
      break;

    case EscKey:
      hideRepertoryIndex();
      event.preventDefault();
      break;
  }
}

//////////////////////////////
//
// beforeunload event -- save the text editor's content when exiting the window.
//     This is useful if the window is left by accident, and allows the user
//     to recover their data by loading VHV again within 24 hours.
//

window.addEventListener('beforeunload', function (event) {
  var encodedcontents = encodeURIComponent(getTextFromEditorRaw());
  localStorage.setItem('AUTOSAVE', encodedcontents);
  localStorage.setItem('AUTOSAVE_DATE', new Date().getTime());
  localStorage.setItem('FONT', global_verovioOptions.FONT);
});

//////////////////////////////
//
// Autosave feature:  Save the contents of the editor every 60 seconds to
//   local storage ("SAVE0")  Which can be recalled by typing 0 shift-R
//   within one minute after reloading the VHV website.
//

setInterval(function () {
  localStorage.setItem('SAVE0', encodeURIComponent(getTextFromEditorRaw()));
}, 60000);

// needed for startup, but not afterwards, so adjust later:
setInterval(function () {
  updateEditorMode();
}, 1000);

//////////////////////////////
//
// verovioCallback -- Function that is run after SVG data is calcualted
//     by verovio.
//

export function verovioCallback(data) {
  console.log('SVG updated');
  if (global_verovioOptions.GOTOTOPOFNOTATION) {
    global_verovioOptions.GOTOTOPOFNOTATION = false;
    let scroller = document.querySelector('#output');
    if (scroller) {
      scroller.scrollTo(0, 0);
    }
  }
  markup.loadSvg('svg');
}
