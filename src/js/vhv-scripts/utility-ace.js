import { editorMode } from './global-variables.js';
import { getFieldAndSubtoken } from './utility-humdrum.js';
import { getAceEditor } from './setup.js';

let editor = getAceEditor();
if (!editor) {
	throw new Error('Ace Editor is undefined');
}

//////////////////////////////
//
// centerCursorHorizontallyInEditor --
//

export function centerCursorHorizontallyInEditor() {
	// Center the cursort horizontally:
	// Get distance between cursor and left side of textarea in pixels:
	let cursorLeft = getAceEditor().renderer.$cursorLayer.getPixelPosition(0).left;

	// Get width of visible text area
	let scrollerWidth = editor.renderer.$size.scrollerWidth;

	// Move scroller so that left side at same point as cursor minus half width of visible area:
	if (cursorLeft > scrollerWidth / 2) {
		editor.renderer.scrollToX(cursorLeft - scrollerWidth/2);
	}
}

const editorModes = {
  humdrum: {
    theme: 'ace/theme/humdrum_light',
  },
  xml: {
    theme: 'ace/theme/solarized_light',
  },
  musedata: {
    theme: 'ace/theme/solarized_light',
  },
}

//////////////////////////////
//
// setEditorModeAndKeyboard --
//

export function setEditorModeAndKeyboard() {
	if (editor) {
		const mode = editorMode();
		editor.setTheme(editorModes[mode].theme);
		editor.getSession().setMode("ace/mode/" + mode);
		console.log('Set ace mode: ace/mode/', mode);
		// editor.setTheme(window.EditorModes[EditorMode][window.KeyboardMode].theme);
		// editor.getSession().setMode("ace/mode/" + EditorMode);
		// null to reset to default (ace) mode
		// editor.setKeyboardHandler(window.KeyboardMode === "ace" ? null : "ace/keyboard/" + window.KeyboardMode);
	}
};



//////////////////////////////
//
// toggleEditorMode -- Switch between plain text editing and vim editing.
//     This is used by the alt-v keyboard shortcut.
//

export function toggleEditorMode() {
	// if (window.KeyboardMode == "ace") {
	// 	window.KeyboardMode  = "vim";
	// } else {
	// 	window.KeyboardMode  = "ace";
	// };
	setEditorModeAndKeyboard();
};



//////////////////////////////
//
// showIdInEditor -- Highlight the current line of data being played,
//     and center it.  But only do this if Humdrum data is being shown
//     in the editor (MEI data is not time-ordered by notes, only by
//     measure).
//

export function showIdInEditor(id) {
	if (editorMode() == "xml") {
		return;
	}
	// if (EditorMode == "xml") {
	// 	return;
	// }
	var matches = id.match(/-[^-]*L(\d+)/);
	if (!matches) {
		return;
	}
	var row = parseInt(matches[1]);
	editor.gotoLine(row, 0);
	editor.centerSelection();
	// console.log("PLAYING ROW", row);
}



//////////////////////////////
//
// getMode -- return the Ace editor mode to display the data in:
//    ace/mode/humdrum  == for Humdrum
//    ace/mode/xml   == for XML data (i.e., MEI, or SVG)
//

export function getMode(text) {
	if (!text) {
		return "humdrum";
	}
	if (text.match(/^\s*</)) {
		return "xml";
	} else if (text.substring(0, 2000).match(/Group memberships:/)) {
		return "musedata";
	} else if (text.substring(0, 2000).match(/^[A-Za-z0-9+\/\s]+$/)) {
		return "mime";
	} else {
		return "humdrum";
	}
}



//////////////////////////////
//
// highlightNoteInScore -- Called when the cursor has changed position
//     int the editor.
//

function highlightNoteInScore(event) {
	if (editorMode() == "xml") {
		xmlDataNoteIntoView(event);
	} else {
		humdrumDataNoteIntoView(event);
	}
	// if (EditorMode == "xml") {
	// 	xmlDataNoteIntoView(event);
	// } else {
	// 	humdrumDataNoteIntoView(event);
	// }
}

//////////////////////////////
//
// xmlDataNoteIntoView --
//
import { markItem } from './utility-svg.js';

function xmlDataNoteIntoView(event) {
	var location = editor.selection.getCursor();
	var line = location.row;
	if (window.EditorLine == line) {
		// already highlighted (or close enough)
		return;
	}
	// var column = location.column;
	var text = editor.session.getLine(line);
	var matches = text.match(/xml:id="([^"]+)"/);
	if (!matches) {
		markItem(null, line);
		return;
	}
	var id = matches[1];
	var item;
	if (window.Splitter.rightContent) {
		// see: https://www.w3.org/TR/selectors
		var item = window.Splitter.rightContent.querySelector("#" + id);
		// console.log("ITEM", item);
	}
	markItem(item, line);
}



//////////////////////////////
//
// humdrumDataNoteIntoView --
//

export function humdrumDataNoteIntoView(row, column) {
	if (!row || !column) {
		var location = editor.selection.getCursor();
		var line = location.row;
		column = location.column;
	}
	var line = row;
	var text = editor.session.getLine(line);
	var fys = getFieldAndSubtoken(text, column);
	var field = fys.field;
	var subspine = fys.subspine;
	var query = window.HIGHLIGHTQUERY;
	window.HIGHLIGHTQUERY = "";
	// the following code causes problems with note highlighting
	// after another note was edited.
	//	if (!query) {
	//		query = EDITINGID;
	//		HIGHLLIGHTQUERY = EDITINGID;
	//		// EDITINGID = null;
	//	}
	if (!query) {
		var query = "L" + (line+1) + "F" + field;
		if (subspine > 0) {
			query += "S" + subspine;
		}
	}
	var item = 0;
	if (window.Splitter.rightContent) {
		// see: https://www.w3.org/TR/selectors
		var items = window.Splitter.rightContent.querySelectorAll("g[id$='" +
			query + "']");
		if (items.length == 0) {
			// cannot find (hidden rest for example)
			return;
		}
		// give priority to items that possess qon/qoff classes.
		for (var i=0; i<items.length; i++) {
			if (items[i].className.baseVal.match(/qon/)) {
				item = items[i];
				break;
			}
		}
		if (!item) {
			item = items[items.length-1];
		}
		if (item.id.match(/^accid/)) {
			item = items[items.length-2];
		}
	}
	// markItem(item);
	return item;
	// sendTarget(item);
}


