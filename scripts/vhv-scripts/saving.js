/* global saveAs */



//////////////////////////////
//
// saveEditorContents -- Save the editor contents to a file on the local disk.
//   Saves in UTF-8 format.
//
import { getFilenameBase, getFilenameExtension } from "./utility.js";
import { getTextFromEditor } from "./misc.js";

export function saveEditorContents() {
	var filebase = getFilenameBase();
	if (!filebase) {
		filebase = "data";
	}
	var filename = filebase;
	var extension = getFilenameExtension();
	if (extension) {
		filename += "." + extension;
	}
	// var size = window.EDITOR.session.getLength();
	// var matches;
	// var line;

	var text = getTextFromEditor();
	// var blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
	var blob = new Blob([text], {type: 'text/plain'});

	// Global from FileSave.js module
	saveAs(blob, filename);
}
