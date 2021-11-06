/* global $ */

//
// menu.js -- functions to interface with the top menu.
// 
// vim: ts=3
//

window.MENU = { };
var MENUDATA = { };
window.LANGUAGE = "DEFAULT";
window.DICTIONARY = {};
var COMPILEFILTERAUTOMATIC = false;

function MenuInterface() { 
	this.contextualMenus = {};
}


function setInitialLanguage() {
	if (localStorage["LANGUAGE"]) {
		window.LANGUAGE = localStorage["LANGUAGE"];
	} else {
		var lang = navigator.language.replace(/-.*/, "").toUpperCase();
		if (lang.length == 2) {
			window.LANGUAGE = lang;
		}
	}
}

document.addEventListener("DOMContentLoaded", function() {
	setInitialLanguage();
	processMenuAton();
	window.MENU = new MenuInterface();
	window.MENU.initialize();
});

import { prepareBufferStates } from './vhv-scripts/buffer.js';
import { processInterfaceKeyCommand } from './vhv-scripts/listeners.js';
import { displayNotation } from './vhv-scripts/misc.js';


function processMenuAton() {
	var element = document.querySelector("script#aton-menu-data");
	if (!element) {
		console.log("Warning: cannot find element script#aton-menu-data");
		return;
	}
	var aton = new window.ATON();
	MENUDATA = aton.parse(element.textContent).MENU;
	adjustMenu(MENUDATA);
	
	window.DICTIONARY = {};
	var MD = MENUDATA.DICTIONARY.ENTRY;
	for (var i=0; i<MD.length; i++) {
			window.DICTIONARY[MD[i].DEFAULT] = MD[i];
	}

	// Use handlebars to generate HTML code for menu.

	var tsource = document.querySelector("#template-menu").textContent;
	var menuTemplate = window.Handlebars.compile(tsource);
	var output = menuTemplate(MENUDATA);
	var newmenuelement = document.querySelector("#menu-div");

	if (newmenuelement) {
		newmenuelement.innerHTML = output;
		prepareBufferStates();
		// if (HIDEINITIALTOOLBAR) {
		// 	toggleNavigationToolbar();
		// }
		// if (HIDEMENUANDTOOLBAR) {
		// 	toggleMenuAndToolbarDisplay();
		// }
		// if (window.HIDEMENU) {
		// 	toggleMenuDisplay();
		// }
		
	}


	// var tsource2 = document.querySelector("#template-toolbar").textContent;
	// var toolbarTemplate = window.Handlebars.compile(tsource2);
	// var output2 = toolbarTemplate("");
	// var toolbarelement = document.querySelector("#toolbar");

	// if (newmenuelement && toolbarelement) {
	// 	newmenuelement.innerHTML = output;
	// 	toolbarelement.innerHTML = output2;
	// 	prepareBufferStates();
	// 	if (HIDEINITIALTOOLBAR) {
	// 		toggleNavigationToolbar();
	// 	}
	// 	if (HIDEMENUANDTOOLBAR) {
	// 		toggleMenuAndToolbarDisplay();
	// 	}
	// 	if (window.HIDEMENU) {
	// 		toggleMenuDisplay();
	// 	}
	// 	if (!InputVisible) {
	// 		// Or do it all of the time.
	// 		matchToolbarVisibilityIconToState();
	// 	}
	// }
	// if (TOOLBAR) {
	// 	if (TOOLBAR.match(/save/i)) {
	// 		chooseToolbarMenu("save");
	// 	} else if (TOOLBAR.match(/load/i)) {
	// 		chooseToolbarMenu("load");
	// 	} else if (TOOLBAR.match(/search/i)) {
	// 		chooseToolbarMenu("search");
	// 	} else if (TOOLBAR.match(/filter/i)) {
	// 		chooseToolbarMenu("filter");
	// 	} else {
	// 		// toolbar menu 1 is otherwise the default
	// 		chooseToolbarMenu(1);
	// 	}
	// } else if (LASTTOOLBAR) {
	// 		// load toolbar from last visit
	// 		chooseToolbarMenu(LASTTOOLBAR);
	// }
	// fillSpreadsheetId();
}


//////////////////////////////
//
// fillSpreadsheetId --
//

function fillSpreadsheetScriptId() {
	if (!window.SPREADSHEETSCRIPTID) {
		return;
	}
	var element = document.querySelector("input#scriptid");
	if (!element) {
		return;
	}
	var value = window.SPREADSHEETSCRIPTID;
	if (window.SPREADSHEETID) {
		value += "|" + window.SPREADSHEETID;
	}
	element.value = value;
}

//////////////////////////////
//
// adjustMenu --
//

function adjustMenu (object) {
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			if (property === "RIGHT_TEXT") {
				if (!Array.isArray(object[property])) {
					object[property] = [ object[property] ];
				}
			} else if (typeof object[property] == "object") {
				adjustMenu(object[property]);
			}
		}
	}
}



MenuInterface.prototype.initialize = function () {
	this.contextualMenus = this.getContextualMenus();
}


MenuInterface.prototype.hideContextualMenus = function () {
	var keys = Object.keys(this.contextualMenus);
	for (var i=0; i<keys.length; i++) {
		this.contextualMenus[keys[i]].style.display = "none";
	}
}


MenuInterface.prototype.hideMenus = function (name) {
	this.hideContextualMenu();
}


MenuInterface.prototype.showMenu = function (name) {
	this.showContextualMenu(name);
}


MenuInterface.prototype.showContextualMenu = function (name) {
	var keys = Object.keys(this.contextualMenus);
	for (var i=0; i<keys.length; i++) {
		if (name === keys[i]) {
			this.contextualMenus[keys[i]].style.display = "block";
		} else {
			this.contextualMenus[keys[i]].style.display = "none";
		}
	}
}




MenuInterface.prototype.showCursorNoteMenu = function (element) {
	if (!element) {
		this.hideContextualMenus();
		return;
	}
	var id = element.id;
	if (!id) {
		this.hideContextualMenus();
		return;
	}
	var matches = id.match(/^([A-Z]+)-/i);
	if (!matches) {
		this.hideContextualMenus();
		return;
	}
	var name = matches[1];
	name = name.charAt(0).toUpperCase() + name.slice(1);
	this.showContextualMenu(name);
}



///////////////////////////////////////////////////////////////////////////
//
// Maintenance functions
//

MenuInterface.prototype.getContextualMenus = function () {
	var output = {};
	var element = document.querySelector("#navbarNavDropdown");
	if (!element) {
		return output;
	}
	var items = element.querySelectorAll("li.contextual");
	if (!items) {
		return output;
	}
	for (var i=0; i<items.length; i++) {
		var nameelement = items[i].querySelector(".menu-name");
		if (!nameelement) {
			continue;
		}
		var name = nameelement.textContent.trim();
		output[name] = items[i];
	}

	return output;
}



///////////////////////////////////////////////////////////////////////////
//
// Regular interface commnds (no graphical commands):
//


//////////////////////////////
//
// MenuInterface::toggleOriginalClefs --
//

MenuInterface.prototype.toggleOriginalClefs = function () {
	var event = {};
	event.code = OKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::displaySvgData --  This is now obsolete (the
//   SVG image will be saved to a file in the Downloads folder.
//

MenuInterface.prototype.displaySvgData = function () {
	var event = {};
	event.code = GKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::saveSvgData --
//

MenuInterface.prototype.saveSvgData = function () {
	var event = {};
	event.code = GKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::loadRepertory --
//
import { loadKernScoresFile } from './vhv-scripts/loading.js';

MenuInterface.prototype.loadRepertory = function (repertory, filter) {
	var options = {
			file: repertory,
			next: true,
			previous: true
		}
	if (filter) {
		options.filter = filter;
	}
	loadKernScoresFile(options);
}



//////////////////////////////
//
// MenuInterface::saveTextEditorContents --
//

MenuInterface.prototype.saveTextEditorContents = function () {
	var event = {};
	event.code = SKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::saveHtmlContents --
//

MenuInterface.prototype.saveHtmlContents = function () {
	// downloadEditorContentsInHtml();
}



//////////////////////////////
//
// MenuInterface::compileEmbeddedFilters --
//

MenuInterface.prototype.compileEmbeddedFilters = function () {
	var event = {};
	event.code = CKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::clearEditorContents --
//

MenuInterface.prototype.clearEditorContents = function () {
	var event = {};
	event.code = EKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::showSourceScan --
//

MenuInterface.prototype.showSourceScan = function () {
	var event = {};
	event.code = PKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::createPdf --
//

MenuInterface.prototype.createPdf = function () {
	var event = {};
	event.code = TKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::reloadFromSource --
//

MenuInterface.prototype.reloadFromSource = function () {
	var event = {};
	event.code = RKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::createPdfPage --
//

MenuInterface.prototype.createPdfPage = function () {
	var event = {};
	event.code = TKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::increaseNotationSpacing --
//

MenuInterface.prototype.increaseNotationSpacing = function () {
	var event = {};
	event.code = WKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::decreaseNotationSpacing --
//

MenuInterface.prototype.decreaseNotationSpacing = function () {
	var event = {};
	event.code = WKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::decreaseStaffSpacing --
//

MenuInterface.prototype.decreaseStaffSpacing = function () {
	window.SPACING_STAFF -= 1;
	if (window.SPACING_STAFF < 0) {
		window.SPACING_STAFF = 0;
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::increaseStaffSpacing --
//

MenuInterface.prototype.increaseStaffSpacing = function () {
	window.SPACING_STAFF += 1;
	if (window.SPACING_STAFF > 24) {
		window.SPACING_STAFF = 24;
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::decreaseSystemSpacing --
//

MenuInterface.prototype.decreaseSystemSpacing = function () {
	window.SPACING_SYSTEM -= 1;
	if (window.SPACING_SYSTEM < 0) {
		window.SPACING_SYSTEM = 0;
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::increaseSystemSpacing --
//

MenuInterface.prototype.increaseSystemSpacing = function () {
	window.SPACING_SYSTEM += 1;
	if (window.SPACING_SYSTEM > 12) {
		window.SPACING_SYSTEM = 12;
	}
	displayNotation();
}




//////////////////////////////
//
// MenuInterface::decreaseLyricSize --
//

MenuInterface.prototype.decreaseLyricSize = function () {
	window.LYRIC_SIZE -= 0.25;
	if (window.LYRIC_SIZE < 2.0) {
		window.LYRIC_SIZE = 2.0;
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::increaseLyricSize --
//

MenuInterface.prototype.increaseLyricSize = function () {
	window.LYRIC_SIZE += 0.25;
	if (window.LYRIC_SIZE > 8.0) {
		window.LYRIC_SIZE = 8.0;
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::useLeipzigFont --
//

MenuInterface.prototype.useLeipzigFont = function () {
	window.FONT = "Leipzig";
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::useLelandFont --
//

MenuInterface.prototype.useLelandFont = function () {
	window.FONT = "Leland";
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::usePetalumaFont --
//

MenuInterface.prototype.usePetalumaFont = function () {
	window.FONT = "Petaluma";
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::useBravuraFont --
//

MenuInterface.prototype.useBravuraFont = function () {
	window.FONT = "Bravura";
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::useGootvilleFont --
//

MenuInterface.prototype.useGootvilleFont = function () {
	window.FONT = "Gootville";
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::applyFilter --
//
import { humdrumToSvgOptions } from './vhv-scripts/verovio-options.js';

MenuInterface.prototype.applyFilter = function (filter, data, callback) {
	var contents = "";
	var editor = 0;
	if (!data) {
		contents = window.EDITOR.getValue().replace(/^\s+|\s+$/g, "");
		editor = 1;
	} else {
		contents = data.replace(/^\s+|\s+$/g, "");;
	}
	var options = humdrumToSvgOptions();
	var data = contents + "\n!!!filter: " + filter + "\n";
	window.vrvWorker.filterData(options, data, "humdrum")
	.then(function (newdata) {
		newdata = newdata.replace(/\s+$/m, "");
		var lines = newdata.match(/[^\r\n]+/g);
		for (var i=lines.length-1; i>=0; i--) {
			if (lines[i].match(/^!!!Xfilter:/)) {
				lines[i] = "";
				break;
			}
		}
		newdata = "";
		for (var i=0; i<lines.length; i++) {
			if (lines[i] === "") {
				continue;
			}
			newdata += lines[i] + "\n";
		}
		if (editor) {
			window.EDITOR.setValue(newdata, -1);
		}
		if (callback) {
			callback(newdata);
		}
	});
}



//////////////////////////////
//
// MenuInterface::insertLocalCommentLine --
//

MenuInterface.prototype.insertLocalCommentLine = function () {
	var event = {};
	event.code = LKey;
	event.shiftKey = true;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::insertNullDataLine --
//

MenuInterface.prototype.insertNullDataLine = function () {
	var event = {};
	event.code = DKey;
	event.shiftKey = true;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::insertInterpretationLine --
//

MenuInterface.prototype.insertInterpretationLine = function () {
	var event = {};
	event.code = IKey;
	event.shiftKey = true;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::insertBarline --
//

MenuInterface.prototype.insertBarline = function () {
	var event = {};
	event.code = BKey;
	event.shiftKey = true;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::toggleDataDisplay --
//

MenuInterface.prototype.toggleDataDisplay = function () {
	var event = {};
	event.code = YKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::toggleToolbarDisplay --
//

MenuInterface.prototype.toggleToolbarDisplay = function () {
	// toggleNavigationToolbar();
}



//////////////////////////////
//
// MenuInterface::toggleLogoDisplay --
//

MenuInterface.prototype.toggleLogoDisplay = function () {
	var event = {};
	event.code = BKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::toggleLayerHighlighting --
//

MenuInterface.prototype.toggleLayerHighlighting = function () {
	var event = {};
	event.code = LKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::increaseTabSize --
//

MenuInterface.prototype.increaseTabSize = function () {
	var event = {};
	event.code = DotKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::decreaseTabSize --
//

MenuInterface.prototype.decreaseTabSize = function () {
	var event = {};
	event.code = CommaKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}


//////////////////////////////
//
// MenuInterface::fitTabSizeToData -- Not perfect since not using an equal-sized character font.
//

MenuInterface.prototype.fitTabSizeToData = function () {
	var lines = window.EDITOR.getValue().match(/[^\r\n]+/g);
	var max = 4;
	for (var i=0; i<lines.length; i++) {
		if (lines[i].match(/^\s*$/)) {
			continue;
		}
		if (lines[i].match(/^!/)) {
			// not keeping track of local comments which can be long
			// due to embedded layout commands.
			continue;
		}
		var line = lines[i].split("\t");
		for (var j=0; j<line.length; j++) {
			if (line[j].length > 25) {
				// ignore very long tokens
				continue;
			}
			if (line[j].length > max) {
				max = line[j].length + 3;
			}
		}
	}
	// ignore strangely long cases:
	if (max > 25) {
		max = 25;
	}
	window.TABSIZE = max;
	window.EDITOR.getSession().setTabSize(window.TABSIZE);
}



//////////////////////////////
//
// MenuInterface::openURL -- opens in a new tab.
//

MenuInterface.prototype.openUrl = function (url, target) {
	if (!target) {
		target = "_blank";
	}
	window.open(url, target);
}



//////////////////////////////
//
// MenuInterface::dropdown menu funcionality:
//

$('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
  if (!$(this).next().hasClass('show')) {
    $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
  }
  var $subMenu = $(this).next(".dropdown-menu");
  $subMenu.toggleClass('show');


  $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
    $('.dropdown-submenu .show').removeClass("show");
  });

  return false;
});



//////////////////////////////
//
// MenuInterface::toggleCsvTsv --
//

MenuInterface.prototype.toggleCsvTsv = function () {
	toggleHumdrumCsvTsv();
}



//////////////////////////////
//
// MenuInterface::toggleVimPlainTextMode --
//

MenuInterface.prototype.toggleVimPlainTextMode = function () {
	var event = {};
	event.code = VKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}




//////////////////////////////
//
// MenuInterface::displayHumdrumData --
//

MenuInterface.prototype.displayHumdrumData = function () {
	var event = {};
	event.code = HKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::displayMeiData --
//

MenuInterface.prototype.displayMeiData = function () {
	var event = {};
	event.code = MKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::loadFromBuffer --
//

MenuInterface.prototype.loadFromBuffer = function (bufferNumber) {
	var event = {};
	switch (bufferNumber) {
		case 0: event.code = ZeroKey;  break;
		case 1: event.code = OneKey;   break;
		case 2: event.code = TwoKey;   break;
		case 3: event.code = ThreeKey; break;
		case 4: event.code = FourKey;  break;
		case 5: event.code = FiveKey;  break;
		case 6: event.code = SixKey;   break;
		case 7: event.code = SevenKey; break;
		case 8: event.code = EightKey; break;
		case 9: event.code = NineKey;  break;
		default:
			console.log("UNKNOWN BUFFER:", bufferNumber);
			return;
	}
	event.altKey = true;
	processInterfaceKeyCommand(event);

	event.code = RKey;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::saveToBuffer --
//

MenuInterface.prototype.saveToBuffer = function (bufferNumber) {
	var event = {};

	// First store the buffer number in the number register:
	switch (bufferNumber) {
		case 0: event.code = ZeroKey;  break;
		case 1: event.code = OneKey;   break;
		case 2: event.code = TwoKey;   break;
		case 3: event.code = ThreeKey; break;
		case 4: event.code = FourKey;  break;
		case 5: event.code = FiveKey;  break;
		case 6: event.code = SixKey;   break;
		case 7: event.code = SevenKey; break;
		case 8: event.code = EightKey; break;
		case 9: event.code = NineKey;  break;
		default:
			console.log("UNKNOWN BUFFER:", bufferNumber);
			return;
	}

	event.altKey = true;
	processInterfaceKeyCommand(event);

	// Now run the save buffer command:
	event.code = SKey;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goToLastPage --
//

MenuInterface.prototype.goToLastPage = function (event) {
	if (!event) {
		event = {};
	}
	event.code = EndKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goToFirstPage --
//

MenuInterface.prototype.goToFirstPage = function (event) {
	if (!event) {
		event = {};
	}
	event.code = HomeKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goPreviousWork --
//

MenuInterface.prototype.goToPreviousWork = function (event) {
	if (!event) {
		event = {};
	}
	event.code = LeftKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goToNextWork --
//

MenuInterface.prototype.goToNextWork = function () {
	var event = {};
	event.code = RightKey;
	event.altKey = true;
	event.shiftKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goToNextPage --
//

MenuInterface.prototype.goToNextPage = function (event) {
	if (!event) {
		event = {};
	}
	event.code = RightKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::goToPreviousPage --
//

MenuInterface.prototype.goToPreviousPage = function (event) {
	if (!event) {
		event = {};
	}
	event.code = LeftKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::toggleMidiPlayback --
//

MenuInterface.prototype.toggleMidiPlayback = function () {
	var event = {};
	event.code = SpaceKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}



//////////////////////////////
//
// MenuInterface::toggleNotationFreezing --
//

MenuInterface.prototype.toggleNotationFreezing = function () {
	var event = {};
	event.code = FKey;
	event.altKey = true;
	processInterfaceKeyCommand(event);
}


///////////////////////////////////////////////////////////////////////////
//
// Contextual Graphic editing functions
//


import { processNotationKey } from './vhv-scripts/editor.js';
//////////////////////////////
//
// MenuInterface::forceNoteStemUp --
//

MenuInterface.prototype.forceNoteStemUp = function () {
	processNotationKey("a", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::forceNoteStemDown --
//

MenuInterface.prototype.forceNoteStemDown = function () {
	processNotationKey("b", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::removeStemDirection --
//

MenuInterface.prototype.removeStemDirection = function () {
	processNotationKey("c", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleEditorialAccidental --
//

MenuInterface.prototype.toggleEditorialAccidental = function () {
	processNotationKey("i", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleNaturalAccidental --
//

MenuInterface.prototype.toggleNaturalAccidental = function () {
	processNotationKey("n", window.CursorNote);
}


//////////////////////////////
//
// MenuInterface::toggleSharpAccidental --
//

MenuInterface.prototype.toggleSharpAccidental = function () {
	processNotationKey("#", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleFlatAccidental --
//

MenuInterface.prototype.toggleFlatAccidental = function () {
	processNotationKey("-", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleForcedDisplay --
//

MenuInterface.prototype.toggleForcedDisplay = function () {
	processNotationKey("X", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleStaccato --
//

MenuInterface.prototype.toggleStaccato = function () {
	processNotationKey("'", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMinorLowerMordent --
//

MenuInterface.prototype.toggleMinorLowerMordent = function () {
	processNotationKey("m", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMajorLowerMordent --
//

MenuInterface.prototype.toggleMajorLowerMordent = function () {
	processNotationKey("M", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMinorUpperMordent --
//

MenuInterface.prototype.toggleMinorUpperMordent = function () {
	processNotationKey("w", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMajorUpperMordent --
//

MenuInterface.prototype.toggleMajorUpperMordent = function () {
	processNotationKey("W", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleFermata --
//

MenuInterface.prototype.toggleFermata = function () {
	processNotationKey(";", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleArpeggio --
//

MenuInterface.prototype.toggleArpeggio = function () {
	processNotationKey(":", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleAccent --
//

MenuInterface.prototype.toggleAccent = function () {
	processNotationKey("^", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMarcato --
//

MenuInterface.prototype.toggleMarcato = function () {
	processNotationKey("^^", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleStaccatissimo --
//

MenuInterface.prototype.toggleStaccatissimo = function () {
	processNotationKey("`", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleTenuto --
//

MenuInterface.prototype.toggleTenuto = function () {
	processNotationKey("~", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMajorTrill --
//

MenuInterface.prototype.toggleMajorTrill = function () {
	processNotationKey("T", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleMinorTrill --
//

MenuInterface.prototype.toggleMinorTrill = function () {
	processNotationKey("t", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::forceSlurAbove --
//

MenuInterface.prototype.forceSlurAbove = function () {
	processNotationKey("a", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::forceSlurBelow --
//

MenuInterface.prototype.forceSlurBelow = function () {
	processNotationKey("b", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::removeSlurOrientation --
//

MenuInterface.prototype.removeSlurOrientation = function () {
	processNotationKey("c", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::deleteSlur --
//

MenuInterface.prototype.deleteSlur = function () {
	processNotationKey("D", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::forceBeamAbove --
//

MenuInterface.prototype.forceBeamAbove = function () {
	processNotationKey("a", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::forceBeamBelow --
//

MenuInterface.prototype.forceBeamBelow = function () {
	processNotationKey("b", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::removeBeamOrientation --
//

MenuInterface.prototype.removeBeamOrientation = function () {
	processNotationKey("c", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::forceTieAbove --
//

MenuInterface.prototype.forceTieAbove = function () {
	processNotationKey("a", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::forceTieBelow --
//

MenuInterface.prototype.forceTieBelow = function () {
	processNotationKey("b", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::removeTieOrientation --
//

MenuInterface.prototype.removeTieOrientation = function () {
	processNotationKey("c", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::breakBeamAfterNote --
//

MenuInterface.prototype.breakBeamAfterNote = function () {
	processNotationKey("J", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::breakBeamBeforeNote --
//

MenuInterface.prototype.breakBeamBeforeNote = function () {
	processNotationKey("L", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::makeRestInvisible --
//

MenuInterface.prototype.makeRestInvisible = function () {
	processNotationKey("y", window.CursorNote);
}




//////////////////////////////
//
// MenuInterface::togglePedalDown --
//

MenuInterface.prototype.togglePedalDown = function () {
	processNotationKey("p", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::togglePedalUp --
//

MenuInterface.prototype.togglePedalUp = function () {
	processNotationKey("P", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::togglePedalUp --
//

MenuInterface.prototype.togglePedalUp = function () {
	processNotationKey("P", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleGraceNoteStyle --
//

MenuInterface.prototype.toggleGraceNoteStyle = function () {
	processNotationKey("q", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::toggleAtMark --
//

MenuInterface.prototype.toggleAtMark = function () {
	processNotationKey("@", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::addSlur --
//

MenuInterface.prototype.addSlur = function (number) {
	if ((number < 10) && (number > 1)) {
		var event = {};

		// First store the buffer number in the number register:
		switch (bufferNumber) {
			case 0: event.code = ZeroKey;  break;
			case 1: event.code = OneKey;   break;
			case 2: event.code = TwoKey;   break;
			case 3: event.code = ThreeKey; break;
			case 4: event.code = FourKey;  break;
			case 5: event.code = FiveKey;  break;
			case 6: event.code = SixKey;   break;
			case 7: event.code = SevenKey; break;
			case 8: event.code = EightKey; break;
			case 9: event.code = NineKey;  break;
			default:
				console.log("UNKNOWN BUFFER:", bufferNumber);
				return;
		}

		event.altKey = true;
		processInterfaceKeyCommand(event);
	}

	processNotationKey("s", window.CursorNote);
}

import { goUpHarmonically, goDownHarmonically, goToNextNoteOrRest, goToPreviousNoteOrRest } from './vhv-scripts/utility-svg.js';
//////////////////////////////
//
// MenuInterface::nextHarmonicNote --
//

MenuInterface.prototype.nextHarmonicNote = function () {
	goUpHarmonically(window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::previousHarmonicNote --
//

MenuInterface.prototype.previousHarmonicNote = function () {
	goDownHarmonically(window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::nextMelodicNote --
//

MenuInterface.prototype.nextMelodicNote = function () {
	goToNextNoteOrRest(window.CursorNote.id);
}



//////////////////////////////
//
// MenuInterface::previousMelodicNote --
//

MenuInterface.prototype.previousMelodicNote = function () {
	goToPreviousNoteOrRest(window.CursorNote.id);
}



//////////////////////////////
//
// MenuInterface::pitchDownStep --
//

MenuInterface.prototype.pitchDownStep = function (number) {
	if ((number < 10) && (number > 1)) {
		var event = {};

		// First store the buffer number in the number register:
		switch (bufferNumber) {
			case 0: event.code = ZeroKey;  break;
			case 1: event.code = OneKey;   break;
			case 2: event.code = TwoKey;   break;
			case 3: event.code = ThreeKey; break;
			case 4: event.code = FourKey;  break;
			case 5: event.code = FiveKey;  break;
			case 6: event.code = SixKey;   break;
			case 7: event.code = SevenKey; break;
			case 8: event.code = EightKey; break;
			case 9: event.code = NineKey;  break;
			default:
				console.log("UNKNOWN BUFFER:", bufferNumber);
				return;
		}

		event.altKey = true;
		processInterfaceKeyCommand(event);
	}
	processNotationKey("transpose-down-step", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::pitchUpStep --
//

MenuInterface.prototype.pitchUpStep = function (number) {
	if ((number < 10) && (number > 1)) {
		var event = {};

		// First store the buffer number in the number register:
		switch (bufferNumber) {
			case 0: event.code = ZeroKey;  break;
			case 1: event.code = OneKey;   break;
			case 2: event.code = TwoKey;   break;
			case 3: event.code = ThreeKey; break;
			case 4: event.code = FourKey;  break;
			case 5: event.code = FiveKey;  break;
			case 6: event.code = SixKey;   break;
			case 7: event.code = SevenKey; break;
			case 8: event.code = EightKey; break;
			case 9: event.code = NineKey;  break;
			default:
				console.log("UNKNOWN BUFFER:", bufferNumber);
				return;
		}

		event.altKey = true;
		processInterfaceKeyCommand(event);
	}
	processNotationKey("transpose-up-step", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::pitchUpOctave --
//

MenuInterface.prototype.pitchUpOctave = function (number) {
	if ((number < 10) && (number > 1)) {
		var event = {};

		// First store the buffer number in the number register:
		switch (bufferNumber) {
			case 0: event.code = ZeroKey;  break;
			case 1: event.code = OneKey;   break;
			case 2: event.code = TwoKey;   break;
			case 3: event.code = ThreeKey; break;
			case 4: event.code = FourKey;  break;
			case 5: event.code = FiveKey;  break;
			case 6: event.code = SixKey;   break;
			case 7: event.code = SevenKey; break;
			case 8: event.code = EightKey; break;
			case 9: event.code = NineKey;  break;
			default:
				console.log("UNKNOWN BUFFER:", bufferNumber);
				return;
		}

		event.altKey = true;
		processInterfaceKeyCommand(event);
	}
	processNotationKey("transpose-up-octave", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::pitchDownOctave --
//

MenuInterface.prototype.pitchDownOctave = function (number) {
	if ((number < 10) && (number > 1)) {
		var event = {};

		// First store the buffer number in the number register:
		switch (bufferNumber) {
			case 0: event.code = ZeroKey;  break;
			case 1: event.code = OneKey;   break;
			case 2: event.code = TwoKey;   break;
			case 3: event.code = ThreeKey; break;
			case 4: event.code = FourKey;  break;
			case 5: event.code = FiveKey;  break;
			case 6: event.code = SixKey;   break;
			case 7: event.code = SevenKey; break;
			case 8: event.code = EightKey; break;
			case 9: event.code = NineKey;  break;
			default:
				console.log("UNKNOWN BUFFER:", bufferNumber);
				return;
		}

		event.altKey = true;
		processInterfaceKeyCommand(event);
	}
	processNotationKey("transpose-down-octave", window.CursorNote);
}



//////////////////////////////
//
// MenuInterface::moveSlurStart --
//

MenuInterface.prototype.moveSlurStart = function (number) {
	if (number < 0) {
		if ((number < 10) && (number > 1)) {
			number = -number;
			var event = {};

			// First store the buffer number in the number register:
			switch (bufferNumber) {
				case 0: event.code = ZeroKey;  break;
				case 1: event.code = OneKey;   break;
				case 2: event.code = TwoKey;   break;
				case 3: event.code = ThreeKey; break;
				case 4: event.code = FourKey;  break;
				case 5: event.code = FiveKey;  break;
				case 6: event.code = SixKey;   break;
				case 7: event.code = SevenKey; break;
				case 8: event.code = EightKey; break;
				case 9: event.code = NineKey;  break;
				default:
					console.log("UNKNOWN BUFFER:", bufferNumber);
					return;
			}

			event.altKey = true;
			processInterfaceKeyCommand(event);
		}
		processNotationKey("leftEndMoveBack", window.CursorNote);
	} else {
		if ((number < 10) && (number > 1)) {
			var event = {};

			// First store the buffer number in the number register:
			switch (bufferNumber) {
				case 0: event.code = ZeroKey;  break;
				case 1: event.code = OneKey;   break;
				case 2: event.code = TwoKey;   break;
				case 3: event.code = ThreeKey; break;
				case 4: event.code = FourKey;  break;
				case 5: event.code = FiveKey;  break;
				case 6: event.code = SixKey;   break;
				case 7: event.code = SevenKey; break;
				case 8: event.code = EightKey; break;
				case 9: event.code = NineKey;  break;
				default:
					console.log("UNKNOWN BUFFER:", bufferNumber);
					return;
			}

			event.altKey = true;
			processInterfaceKeyCommand(event);
		}
		processNotationKey("leftEndMoveForward", window.CursorNote);
	}
}



//////////////////////////////
//
// MenuInterface::moveSlurEnd --
//

MenuInterface.prototype.moveSlurEnd = function (number) {
	if (number < 0) {
		number = -number;
		if ((number < 10) && (number > 1)) {
			var event = {};

			// First store the buffer number in the number register:
			switch (bufferNumber) {
				case 0: event.code = ZeroKey;  break;
				case 1: event.code = OneKey;   break;
				case 2: event.code = TwoKey;   break;
				case 3: event.code = ThreeKey; break;
				case 4: event.code = FourKey;  break;
				case 5: event.code = FiveKey;  break;
				case 6: event.code = SixKey;   break;
				case 7: event.code = SevenKey; break;
				case 8: event.code = EightKey; break;
				case 9: event.code = NineKey;  break;
				default:
					console.log("UNKNOWN BUFFER:", bufferNumber);
					return;
			}

			event.altKey = true;
			processInterfaceKeyCommand(event);
		}
		processNotationKey("rightEndMoveBack", window.CursorNote);
	} else {
		if ((number < 10) && (number > 1)) {
			var event = {};

			// First store the buffer number in the number register:
			switch (bufferNumber) {
				case 0: event.code = ZeroKey;  break;
				case 1: event.code = OneKey;   break;
				case 2: event.code = TwoKey;   break;
				case 3: event.code = ThreeKey; break;
				case 4: event.code = FourKey;  break;
				case 5: event.code = FiveKey;  break;
				case 6: event.code = SixKey;   break;
				case 7: event.code = SevenKey; break;
				case 8: event.code = EightKey; break;
				case 9: event.code = NineKey;  break;
				default:
					console.log("UNKNOWN BUFFER:", bufferNumber);
					return;
			}

			event.altKey = true;
			processInterfaceKeyCommand(event);
		}
		processNotationKey("rightEndMoveForward", window.CursorNote);
	}
}



//////////////////////////////
//
// MenuInterface::adjustNotationScale -- add or subtract the input value,
//     not going below 15 or above 500.
//

MenuInterface.prototype.adjustNotationScale = function (event, number) {
	if (event && event.shiftKey) {
		window.SCALE = 40;
	} else {
		window.SCALE = parseInt(window.SCALE * number + 0.5);
		if (window.SCALE < 15) {
			window.SCALE = 15;
		} else if (window.SCALE > 500) {
			window.SCALE = 500;
		}
	}
	localStorage.SCALE = window.SCALE;

	displayNotation();
}



//////////////////////////////
//
// MenuInterface::setLanguage --
//

MenuInterface.prototype.setLanguage = function (lang) {
	window.LANGUAGE = lang;

	// Use handlebars to generate HTML code for menu.
	var tsource = document.querySelector("#template-menu").textContent;
	var menuTemplate = window.Handlebars.compile(tsource);
	var output = menuTemplate(MENUDATA);
	var newmenuelement = document.querySelector("#menu-div");
	if (newmenuelement) {
		newmenuelement.innerHTML = output;
	}
}



//////////////////////////////
//
// MenuInterface::saveCurrentLanguagePreference --
//

MenuInterface.prototype.saveCurrentLanguagePreference = function () {
	localStorage["LANGUAGE"] = window.LANGUAGE;
}



//////////////////////////////
//
// MenuInterface::clearLanguagePreference --
//

MenuInterface.prototype.clearLanguagePreference = function () {
	delete localStorage["LANGUAGE"];
}



//////////////////////////////
//
// MenuInterface::increaseTextFontSize --
//

MenuInterface.prototype.increaseTextFontSize = function (event) {
	if (event.shiftKey) {
		window.INPUT_FONT_SIZE = 1.0;
	} else {
		window.INPUT_FONT_SIZE *= 1.05;
		if (window.INPUT_FONT_SIZE > 3.0) {
			window.INPUT_FONT_SIZE = 3.0;
		}
	}
	var element = document.querySelector("#input");
	if (!element) {
		return;
	}
	element.style.fontSize = window.INPUT_FONT_SIZE + "rem";
	localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
}



////////////////////
//
// MenuInterface::resetTextFontSize --
//

MenuInterface.prototype.resetTextFontSize = function (event) {
	window.INPUT_FONT_SIZE = 1.0;
	var element = document.querySelector("#input");
	if (!element) {
		return;
	}
	element.style.fontSize = window.INPUT_FONT_SIZE + "rem";
	localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
}


//////////////////////////////
//
// MenuInterface::decreaseTextFontSize --
//

MenuInterface.prototype.decreaseTextFontSize = function (event) {
	if (event.shiftKey) {
		window.INPUT_FONT_SIZE = 1.0;
	} else {
		window.INPUT_FONT_SIZE *= 0.95;
		if (window.INPUT_FONT_SIZE < 0.25) {
			window.INPUT_FONT_SIZE = 0.25;
		}
	}
	var element = document.querySelector("#input");
	if (!element) {
		return;
	}
	element.style.fontSize = window.INPUT_FONT_SIZE + "rem";
	localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
}



//////////////////////////////
//
// MenuInterface::lineBreaksOff --
//

MenuInterface.prototype.lineBreaksOff = function () {
	window.BREAKS = true;
	// toggleLineBreaks();
}



//////////////////////////////
//
// MenuInterface::lineBreaksOn --
//

MenuInterface.prototype.lineBreaksOn = function () {
	window.BREAKS = false;
	// toggleLineBreaks();
}



//////////////////////////////
//
// MenuInterface::singlePageView --
//

MenuInterface.prototype.singlePageView = function () {
	window.PAGED = false;
	var element = document.querySelector("#page-nav");
	if (element) {
		element.style.display = "none";
	}
	var element2 = document.querySelector("#multi-page");
	if (element2) {
		element2.style.display = "block";
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::multiPageView --
//

MenuInterface.prototype.multiPageView = function () {
	return; // disabled until fix for issue https://github.com/rism-digital/verovio/issues/2034
	window.PAGED = true;
	var element = document.querySelector("#page-nav");
	if (element) {
		element.style.display = "block";
	}
	var element2 = document.querySelector("#multi-page");
	if (element2) {
		element2.style.display = "none";
	}
	displayNotation();
}



//////////////////////////////
//
// MenuInterface::startSplit --
//

MenuInterface.prototype.startSplit = function (count) {
	if (!count) {
		count = 32;
	}
	MenuInterface.prototype.removeSplits();
	var lines = window.EDITOR.getValue().match(/[^\r\n]+/g);
	var position = window.EDITOR.getCursorPosition();
	var output;
	var counter = 0;
	var adjust = 0;
	var change = 0;
	var i;
	for (i=0; i<lines.length; i++) {
		if (lines[i].match(/^=/)) {
			counter++;
			if (counter == count) {
				lines[i] = "!!ignore\n" + lines[i];
				if (i > lines.row) {
					adjust++;
				}
				change = 1;
				break;
			}
		}
	}
	if (!change) {
		return;
	}
	var output = "";
	for (i=0; i<lines.length; i++) {
		output += lines[i] + "\n";
	}
	window.EDITOR.setValue(output, -1);
	position.row += adjust;
	window.EDITOR.moveCursorToPosition(position);
}



//////////////////////////////
//
// MenuInterface::nextSplit --
//

MenuInterface.prototype.nextSplit = function (count) {
	if (!count) {
		count = 32;
	}
	var lines = window.EDITOR.getValue().match(/[^\r\n]+/g);
	var position = window.EDITOR.getCursorPosition();
	if (lines.length == 0) {
		return;
	}
	var i;
	var adjust = 0;
	var changed = 0;
	var startpos = -1;
	var counter = 0;
	for (i=1; i<lines.length; i++) {
		if (lines[i] === "!!Xignore") {
			lines[i] = "XXX DELETE XXX";
			changed = 1;
			continue;
		} else if (lines[i] === "!!ignore") {
			lines[i] = "!!Xignore";
			changed = 1;
			startpos = i;
			break;
		}
	}
	if (!changed) {
		return;
	}
	// mark count measures later with !!ignore
	for (i=startpos + 1; i<lines.length; i++) {
		if (lines[i].match(/^=/)) {
			counter++;
			if (counter == count) {
				lines[i] = "!!ignore\n" + lines[i];
				if (i > lines.row) {
					adjust++;
				}
				// Was declared global
				var change = 1;
				break;
			}
		}
	}
	if (lines[0] !== "!!ignore") {
		lines[0] = "!!ignore\n" + lines[0];
		adjust++;
	}
	var output = "";
	for (i=0; i<lines.length; i++) {
		if (lines[i] === "XXX DELETE XXX") {
			continue;
		}
		output += lines[i] + "\n";
	}
	window.EDITOR.setValue(output, -1);
	position.row += adjust;
	window.EDITOR.moveCursorToPosition(position);
}



//////////////////////////////
//
// MenuInterface::previousSplit --
//

MenuInterface.prototype.previousSplit = function (count) {
	if (!count) {
		count = 32;
	}
	var lines = window.EDITOR.getValue().match(/[^\r\n]+/g);
	var position = window.EDITOR.getCursorPosition();
	if (lines.length == 0) {
		return;
	}
	var i;
	var adjust = 0;
	var changed = 0;
	var startpos = -1;
	var counter = 0;
	for (i=1; i<lines.length; i++) {
		if (lines[i] === "!!Xignore") {
			lines[i] = "!!ignore";
			changed = 1;
			startpos = i;
		} else if (lines[i] === "!!ignore") {
			lines[i] = "XXX DELETE XXX";
		}
	}
	if (!changed) {
		return;
	}

	// mark count measures later with !!ignore
	for (i=startpos - 2; i>0; i--) {
		if (lines[i].match(/^=/)) {
			counter++;
			if (counter == count - 1) {
				lines[i] = "!!Xignore\n" + lines[i];
				if (i > lines.row) {
					adjust++;
				}
				// Was declared global
				var change = 1;
				break;
			}
		}
	}
	if (lines[0] !== "!!ignore") {
		lines[0] = "!!ignore\n" + lines[0];
		adjust++;
	}
	var output = "";
	for (i=0; i<lines.length; i++) {
		if (lines[i] === "XXX DELETE XXX") {
			continue;
		}
		output += lines[i] + "\n";
	}
	window.EDITOR.setValue(output, -1);
	position.row += adjust;
	window.EDITOR.moveCursorToPosition(position);
}



//////////////////////////////
//
// MenuInterface::removeSplits --
//

MenuInterface.prototype.removeSplits = function () {
	var lines = window.EDITOR.getValue().match(/[^\r\n]+/g);
	var output = "";
	var position = window.EDITOR.getCursorPosition();
	var row = position.row;
	var col = position.column;
	var change = 0;
	for (var i=0; i<lines.length; i++) {
		if (lines[i] === "!!ignore") {
			if (i < row) {
				row--;
			}
			change++;
			continue;
		}
		if (lines[i] === "!!Xignore") {
			if (i < row) {
				row--;
			}
			change++;
			continue;
		}
		output += lines[i] + "\n";
	}
	if (change) {
		window.EDITOR.setValue(output, -1);
		position.row = row;
		window.EDITOR.moveCursorToPosition(position);
	}
}




//////////////////////////////
//
// MenuInterface::undo --
//

MenuInterface.prototype.undo = function () {
	window.EDITOR.undo();
}



//////////////////////////////
//
// MenuInterface::chooseToolbarMenu --
//

MenuInterface.prototype.chooseToolbarMenu = function () {
	// chooseToolbarMenu();
}

import { replaceEditorContentWithHumdrumFile } from './vhv-scripts/misc.js'

//////////////////////////////
//
// MenuInterface::convertToHumdrum --
//

MenuInterface.prototype.convertToHumdrum = function () {
	replaceEditorContentWithHumdrumFile();
}




//////////////////////////////
//
// MenuInterface::trimTabsInEditor --
//
import { trimTabsInEditor } from './vhv-scripts/utility.js';

MenuInterface.prototype.trimTabsInEditor = function () {
	trimTabsInEditor();
}


import { getTextFromEditorNoCsvProcessing } from './vhv-scripts/misc.js';
//////////////////////////////
//
// MenuInterface::mimeEncode --
//

MenuInterface.prototype.mimeEncode = function () {
	var text = getTextFromEditorNoCsvProcessing();
	var lines = btoa(text).match(/.{1,80}/g);
	var output = "";
	for (var i=0; i<lines.length; i++) {
		if (i < lines.length - 1) {
			output += lines[i] + "\n";
		} else {
			output += lines[i].replace(/=/g, "") + "\n";
		}
	}
	window.EDITOR.setValue(output, -1);
}



//////////////////////////////
//
// MenuInterface::mimeDecode --
//

MenuInterface.prototype.mimeDecode = function () {
	var text = getTextFromEditorNoCsvProcessing();
	// text is already decoded by getTextFromEditor().
	window.EDITOR.setValue(text, -1);
}


import { toggleHumdrumCsvTsv } from './vhv-scripts/misc.js'
//////////////////////////////
//
// MenuInterface::toggleCsvTsv --
//

MenuInterface.prototype.toggleCsvTsv = function () {
	toggleHumdrumCsvTsv();
}



//////////////////////////////
//
// MenuInterface::convertToMusicXmlAndSave --
//
import { convertToMusicXmlAndSave } from './vhv-scripts/convertToMusicXmlAndSave.js'

MenuInterface.prototype.convertToMusicXmlAndSave = function () {
	convertToMusicXmlAndSave();
}



