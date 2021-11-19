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

import { getAceEditor, setupAceEditor, setupSplitter} from './setup.js'
import { displayNotation, cleanFont, updateEditorMode, setTextInEditor } from './misc.js';
import { observeSvgContent } from './utility-svg.js';
import { HnpMarkup } from './highlight.js';

var PDFLISTINTERVAL = null;
window.HIDEMENU = false;

// var HIDEINITIALTOOLBAR = false;
// var HIDEMENUANDTOOLBAR = false;
// var TOOLBAR = null;  // used to select the toolbar from URL toolbar parameter.
// var LASTTOOLBAR = 1;
// if (localStorage.LASTTOOLBAR) {
// 	LASTTOOLBAR = parseInt(localStorage.LASTTOOLBAR);
// }
if (localStorage.FONT) {
window.FONT = cleanFont(localStorage.FONT);

}
// var PQUERY = "";
// var IQUERY = "";
// var RQUERY = "";
// The search toolbar is currently the 4th one.  This variable
// will need to be updated if that changes...
// var SEARCHTOOLBAR = 4;

//////////////////////////////
//
// highlighting options --
//

window.MARKUP = new HnpMarkup();


//////////////////////////////
//
// DomContentLoaded event listener -- Display the sample data.
//
import { setEditorMode } from './global-variables.js'
import { setEditorModeAndKeyboard } from './utility-ace.js'
import { getTextFromEditorRaw, dataIntoView } from './misc.js'
import { loadEditorFontSizes } from './verovio-options.js'
import { setupDropArea } from '../drop.js'
import { buildPdfIconListInMenu } from './menu.js'
import { inSvgImage } from './utility-svg.js'

document.addEventListener("DOMContentLoaded", function() {
	loadEditorFontSizes();
	var inputElement = document.querySelector("#input");
	if (inputElement) {
			inputElement.style.fontSize = window.INPUT_FONT_SIZE + "rem";
	}

	// EditorMode = "humdrum";
	setEditorMode("humdrum");
	// setEditorModeAndKeyboard();

	// The block of code below loads the edits to the Ace editor from the AUTOSAVE local buffer,
	// but it breaks Ace Editor

	var ctime = (new Date).getTime();
	var otime = localStorage.getItem("AUTOSAVE_DATE");
	var dur = ctime - otime;
	var encodedcontents = localStorage.getItem("AUTOSAVE");
	var autosave = decodeURIComponent(encodedcontents);
	if (!autosave) {
		autosave = "";
	}
	if ((!autosave.match(/^\s*$/)) && (dur < 60000)) {
		var input = document.querySelector("#input");
		if (input) {
			// input.textContent = autosave;
			setTextInEditor(autosave);
		}
	}

	// setupAceEditor("input");
	getAceEditor()._dispatchEvent('ready');
	setupDropArea();

	// let vrvCopy = Object.assign({}, window.vrvWorker);
	// console.log('Calling displayNotation with: ', vrvCopy)

	displayNotation();

	setupSplitter();

	// set init (default) state
	$("#input").data('x', $("#input").outerWidth());
	$("#input").data('y', $("#input").outerHeight());

	var body = document.querySelector("body");
	body.addEventListener("click", function(event) {
		// console.log("SINGLE CLICK", event);
		// turnOffAllHighlights();
		// var insvg = inSvgImage(event.target);
		if (inSvgImage(event.target)) {
		   dataIntoView(event);
		}
	});
	body.addEventListener("dblclick", function(event) {
		console.log("DOUBLE CLICK");
	});

	window.addEventListener("keydown", processNotationKeyCommand, true);
	window.addEventListener("keydown", processInterfaceKeyCommand);

	observeSvgContent();

	PDFLISTINTERVAL = setInterval(function() {
		buildPdfIconListInMenu();
	}, 3000);

});



//////////////////////////////
//
// keydown event listener -- Notation editor listener.
//

function processNotationKeyCommand(event) {
	if (!event.preventDefault) {
		event.preventDefault = function() { };
	}

	// only works outside of the editor.
	if (event.altKey || event.target.nodeName == "TEXTAREA") {
		return;
	}
	if (document.activeElement.nodeName == "INPUT") {
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
	};

	if (!window.CursorNote) {
		return;
	}
	if (!window.CursorNote.id) {
		return;
	}

	switch (event.code) {
		case AKey:
			processNotationKey("a",window.CursorNote);
			break;

		case BKey:
			processNotationKey("b",window.CursorNote);
			break;

		case CKey:
			processNotationKey("c",window.CursorNote);
			break;

		case DKey:
			if (event.shiftKey) {
				processNotationKey("D",window.CursorNote);
			}
			break;

		// case EKey:

		case FKey:
			processNotationKey("f",window.CursorNote);
			break;

		// case GKey:
		// case HKey:

		case IKey:
			processNotationKey("i",window.CursorNote);
			break;

		case JKey:
			if (event.shiftKey) {
				processNotationKey("J",window.CursorNote);
			}
			break;

		// case KKey:

		case LKey:
			if (event.shiftKey) {
				processNotationKey("L",window.CursorNote);
			}
			break;

		case MKey:
			if (event.shiftKey) {
				processNotationKey("M",window.CursorNote);
			} else {
				processNotationKey("m",window.CursorNote);
			}
			break;

		case NKey:
			processNotationKey("n",window.CursorNote);
			break;

		// case OKey:

		case PKey:
			if (event.shiftKey) {
				processNotationKey("P",window.CursorNote);
			} else {
				processNotationKey("p",window.CursorNote);
			}
			break;

		case QKey:
			processNotationKey("q",window.CursorNote);
			break;

		// case RKey:

		case SKey:
			processNotationKey("s",window.CursorNote);
			break;

		case TKey:
			if (event.shiftKey) {
				processNotationKey("T",window.CursorNote);
			} else {
				processNotationKey("t",window.CursorNote);
			}
			break;

		// case UKey:

		case VKey:
			if (window.CursorNote.id.match("note-")) {
				processNotationKey("^",window.CursorNote);
			}
			break;

		case WKey:
			if (event.shiftKey) {
				processNotationKey("W",window.CursorNote);
			} else {
				processNotationKey("w",window.CursorNote);
			}
			break;

		case XKey:
			processNotationKey("X",window.CursorNote);
			break;

		case YKey:
			processNotationKey("y",window.CursorNote);
			break;

		// case ZKey:

		case OneKey:
			processNotationKey("1",window.CursorNote);
			break;

		case TwoKey:
			if (event.shiftKey) {
				processNotationKey("@",window.CursorNote);
			} else {
				processNotationKey("2",window.CursorNote);
			}
			break;

		case ThreeKey:
			if (event.shiftKey) {
				processNotationKey("#",window.CursorNote);
			} else {
				processNotationKey("3",window.CursorNote);
			}
			break;

		case FourKey:
			processNotationKey("4",window.CursorNote);
			break;

		case FiveKey:
			processNotationKey("5",window.CursorNote);
			break;

		case SixKey:
			if (window.CursorNote.id.match("note-")) {
				if (event.shiftKey) {
					processNotationKey("^^",window.CursorNote);
				} else {
					processNotationKey("6",window.CursorNote);
				}
			} else {
				processNotationKey("6",window.CursorNote);
			}
			break;

		case SevenKey:
			processNotationKey("7",window.CursorNote);
			break;

		case EightKey:
			processNotationKey("8",window.CursorNote);
			break;

		case NineKey:
			processNotationKey("9",window.CursorNote);
			break;

		case MinusKey:
			processNotationKey("-",window.CursorNote);
			break;

		case SingleQuoteKey:
			processNotationKey("'",window.CursorNote);
			break;

		case SemiColonKey:
			if (event.shiftKey) {
				processNotationKey(":",window.CursorNote);
			} else {
				processNotationKey(";",window.CursorNote);
			}
			break;

		case BackQuoteKey:
			if (event.shiftKey) {
				processNotationKey("~",window.CursorNote);
			} else {
				processNotationKey("`",window.CursorNote);
			}
			break;

		case UpKey:
			if (event.shiftKey) {
				event.preventDefault();
				event.stopPropagation();
				if (window.CursorNote.id.match("note-")) {
					console.log('Shift + Up, Current note: ',window.CursorNote);
					processNotationKey("transpose-up-step",window.CursorNote);
				}
			} else if (event.ctrlKey) {
				event.preventDefault();
				event.stopPropagation();
				if (window.CursorNote.id.match("note-")) {
					processNotationKey("transpose-up-octave",window.CursorNote);
				}
			} else {
				event.preventDefault();
				event.stopPropagation();
				goUpHarmonically(window.CursorNote);
			}
			break;

		case DownKey:
			if (event.shiftKey) {
				event.preventDefault();
				event.stopPropagation();
				if (window.CursorNote.id.match("note-")) {
					processNotationKey("transpose-down-step",window.CursorNote);
				}
			} else if (event.ctrlKey) {
				event.preventDefault();
				event.stopPropagation();
				if (window.CursorNote.id.match("note-")) {
					processNotationKey("transpose-down-octave",window.CursorNote);
				}
			} else {
				event.preventDefault();
				event.stopPropagation();
				goDownHarmonically(window.CursorNote);
			}
			break;

		case DeleteKey:
		case BackKey:
			processNotationKey("delete",window.CursorNote);
			event.stopPropagation();
			break;

		case LeftKey:
			if (window.CursorNote.id.match("slur-")) {
				event.preventDefault();
				event.stopPropagation();
				if (event.shiftKey) {
					processNotationKey("rightEndMoveBack",window.CursorNote);
				} else {
					processNotationKey("leftEndMoveBack",window.CursorNote);
				}
			} else {
				// move one note to the left
				event.preventDefault();
				event.stopPropagation();
				goToPreviousNoteOrRest(window.CursorNote.id);
			}
			break;

		case RightKey:
			if (window.CursorNote.id.match("slur-")) {
				event.preventDefault();
				event.stopPropagation();
				if (event.shiftKey) {
					processNotationKey("rightEndMoveForward",window.CursorNote);
				} else {
					processNotationKey("leftEndMoveForward",window.CursorNote);
				}
			} else {
				// move one note to the right
				event.preventDefault();
				event.stopPropagation();
				goToNextNoteOrRest(window.CursorNote.id);
			}
			break;

		case EscKey:
			event.preventDefault();
			event.stopPropagation();
			processNotationKey("esc",window.CursorNote);
			break;

	}
}



//////////////////////////////
//
// keydown event listener -- Interface control listener.
//
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
  displayIndex,
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
	processNotationKey
} from './editor.js';
import {
  togglePlaceColoring,
  toggleAppoggiaturaColoring,
	toggleLayerColoring,
	goUpHarmonically,
	goDownHarmonically,
	goToNextNoteOrRest,
	goToPreviousNoteOrRest
} from './utility-svg.js';
import {
  saveSvgData,
  restoreEditorContentsLocally,
  saveEditorContentsLocally,
} from './buffer.js';
import { saveEditorContents } from './saving.js';
import { generatePdfFull, generatePdfSnapshot } from './pdf.js';
import { getMenu } from '../menu.js';

export function processInterfaceKeyCommand(event) {

	if (!event.preventDefault) {
		event.preventDefault = function() { };
	}

	if ((!event.altKey) && (event.target.nodeName == "TEXTAREA")) {
		// needed to prevent key commands when editing text
		return;
	}
	if ((!event.altKey) && (document.activeElement.nodeName == "INPUT")) {
		// needed to prevent key commands when running vim command
		return;
	}

	if (event.metaKey) {
		// usually ignore metaKey unless 0:
		if (event.code == ZeroKey) {
			getMenu().resetTextFontSize();
			// window.MENU.resetTextFontSize();
			window.SCALE = 40;
			localStorage.SCALE = window.SCALE;
			displayNotation();
			// not preventingDefault so that web browser can reset size as well.
		}
		return;
	}

	switch (event.code) {
		case AKey:          // UNUSED
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

		case DKey:          // Add null data line
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

		case EKey:          // erase text editor contents or Tooggle display of menu with shift key.
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

		case FKey:          // toogle notation update freezing
			if (event.altKey) {
				if (event.shiftKey) {
					displayNotation(false, true);
				} else {
					toggleFreeze();
				}
				event.preventDefault();
			}
			break;

		case GKey:          // save current view to SVG image
			if (event.altKey) {
				// displaySvg();
				saveSvgData();
				event.preventDefault();
			}
			break;

		case HKey:          // show Humdrum data in text editor
			if (event.altKey) {
				if (!window.ShowingIndex) {
					showBufferedHumdrumData();
					event.preventDefault();
				}
			}
			break;

		case IKey:          // Add null interpretation line
			if (event.altKey) {
				if (event.shiftKey) {
					addInterpretationLineAboveCurrentPosition();
					event.preventDefault();
				}
			}
			break;

		case JKey:          // UNUSED
			break;

		case KKey:          // UNUSED
			break;

		case LKey:          // toggle color of staff layers
			if (event.altKey) {
				if (event.shiftKey) {
					addLocalCommentLineAboveCurrentPosition();
				} else {
					toggleLayerColoring();
				}
				event.preventDefault();
			}
			break;

	 	case MKey:          // show MEI data in text editor
			if (event.altKey) {
				setEditorMode("xml");
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

	 	case NKey:          // toggle display of navigation toolbar
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

		case OKey:          // toggle display of *oclef data
			if (event.altKey) {
				window.OriginalClef = !window.OriginalClef;
				console.log("Original clef changed to:", window.OriginalClef);
				if (!window.ShowingIndex) {
					displayNotation();
				}
				event.preventDefault();
			}
			break;

		case PKey:          // show PDF in separate window
			if (event.altKey) {
				displayPdf();
				event.preventDefault();
			}
			break;

		case QKey:          // toggle coloring of appoggiaturas
			if (event.altKey) {
				if (event.shiftKey) {
					// do nothing
				} else {
					toggleAppoggiaturaColoring();
				}
				event.preventDefault();
			}
			break;

		case RKey:          // reload Humdrum data from server
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

		case SKey:          // save contents of text editor to file
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

		case TKey:          // save PDF file
			// Needed functions are defined in _includes/pdfkit.html
			if (event.altKey) {
				if (event.shiftKey) {
					if (typeof generatePdfFull === "function") {
						generatePdfSnapshot();
					}
				} else {
					if (typeof generatePdfSnapshot === "function") {
						generatePdfFull();
					}
				}
				event.preventDefault();
			}
			break;

		case UKey:              // toggle TSV/CSV display of Humdrum data
			if (event.shiftKey) {
				decreaseTab();
				event.preventDefault();
			} else {
				toggleHumdrumCsvTsv();
				event.preventDefault();
			}
			break;

	 	case WKey:          // adjust notation width parameter
			if (event.altKey) {
				if (event.shiftKey) {
					window.SPACINGADJUSTMENT -= 0.05;
				} else {
					window.SPACINGADJUSTMENT += 0.05;
				}
				if (window.SPACINGADJUSTMENT <= 0.0) {
					window.SPACINGADJUSTMENT = 0.0;
				}
				event.preventDefault();
				displayNotation();
			}
			break;

		case XKey:          // UNUSED
			break;

		case YKey:          // show/hide text editor
			if (event.altKey) {
				if (!window.ShowingIndex) {
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

		case ZeroKey:  window.InterfaceSingleNumber = 0; break;
		case OneKey:   window.InterfaceSingleNumber = 1; break;
		case TwoKey:   window.InterfaceSingleNumber = 2; break;
		case ThreeKey: window.InterfaceSingleNumber = 3; break;
		case FourKey:  window.InterfaceSingleNumber = 4; break;
		case FiveKey:  window.InterfaceSingleNumber = 5; break;
		case SixKey:   window.InterfaceSingleNumber = 6; break;
		case SevenKey: window.InterfaceSingleNumber = 7; break;
		case EightKey: window.InterfaceSingleNumber = 8; break;
		case NineKey:  window.InterfaceSingleNumber = 9; break;

		case SpaceKey:          // start/pause MIDI playback
			if (!window.PLAY) {
				if (window.PAUSE) {
					window.play();
					window.PLAY = true;
					window.PAUSE = false;
				} else {
					playCurrentMidi();
					window.PLAY = true;
					window.PAUSE = false;
				}
			} else {
				window.PLAY = false;
				window.PAUSE = true;
				window.pause();
			}
			event.preventDefault();
			break;

		case CommaKey:          // toggle TSV/CSV display of Humdrum data
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

		case DotKey:          // increase tab size in editor
			if (event.shiftKey) {
				increaseTab();
				event.preventDefault();
			}
			break;

		case UpKey:          // return to repertory index
			if (event.shiftKey) {
				if (window.FILEINFO["has-index"] == "true") {
					displayIndex(window.FILEINFO["location"]);
				}
			}
			event.preventDefault();
			break;

		case PgUpKey:          // shift: go to previous repertory work/movement
		case LeftKey:          // go to previous page
			if (event.shiftKey) {
				displayWork(window.FILEINFO["previous-work"]);
			} else {
				gotoPreviousPage();
			}
			event.preventDefault();
			break;

		case PgDnKey:          // shift: go to next repertory work/movement
		case RightKey:         // go to next page
			if (event.shiftKey) {
				displayWork(window.FILEINFO["next-work"]);
			} else {
				gotoNextPage();
			}
			event.preventDefault();
			break;

		case HomeKey:          // go to the first page
			gotoFirstPage();
			event.preventDefault();
			break;

		case EndKey:          // go to the last page
			gotoLastPage();
			event.preventDefault();
			break;

		case SlashKey:          // toggle menu display (to be implemented)
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

window.addEventListener("beforeunload", function (event) {
	var encodedcontents = encodeURIComponent(getTextFromEditorRaw());
	localStorage.setItem("AUTOSAVE", encodedcontents);
	localStorage.setItem("AUTOSAVE_DATE", (new Date).getTime());
	localStorage.setItem("FONT",window.FONT);
});



//////////////////////////////
//
// Autosave feature:  Save the contents of the editor every 60 seconds to
//   local storage ("SAVE0")  Which can be recalled by typing 0 shift-R
//   within one minute after reloading the VHV website.
//

setInterval(function() { 
	localStorage.setItem("SAVE0", encodeURIComponent(getTextFromEditorRaw())); 
}, 60000);


// needed for startup, but not afterwards, so adjust later:
setInterval(function() { updateEditorMode(); }, 1000);



//////////////////////////////
//
// verovioCallback -- Function that is run after SVG data is calcualted
//     by verovio.
//

export function verovioCallback(data) {
	console.log("SVG updated");
	if (window.GOTOTOPOFNOTATION) {
		window.GOTOTOPOFNOTATION = false;
		let scroller = document.querySelector("#output");
		if (scroller) {
			scroller.scrollTo(0, 0);
		}
	}
	window.MARKUP.loadSvg("svg");
}



