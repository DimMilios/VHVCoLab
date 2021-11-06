/* global $, midiUpdate, midiStop, play_midi, basket */

//////////////////////////////
//
// displayNotation -- Convert Humdrum data in textarea to notation.
//  This function seems to be called twice in certain cases (editing).
//
import { setEditorModeAndKeyboard } from './utility-ace.js';
import { highlightIdInEditor, restoreSelectedSvgElement } from './utility-svg.js';
import { humdrumToSvgOptions, musicxmlToHumdrumOptions, musedataToHumdrumOptions, meiToHumdrumOptions, esacToHumdrumOptions } from './verovio-options.js';
import { verovioCallback } from './listeners.js';
import { convertDataToCsv, convertDataToTsv } from './utility.js';
import { loadIndexFile } from './loading.js';

export function displayNotation(page, force, restoreid) {
  // window.vrvWorker.checkInitialized();
  if (!window.vrvWorker.initialized || (window.FreezeRendering && !force)) {
    // console.log("Ignoring displayNotation request: not initialized or frozen");
    console.log("Ignoring displayNotation", {vrvWorker: window.vrvWorker, FreezeRendering: window.FreezeRendering, force})
    return;
  }

  // if input area is a <textarea>, then use .value to access contnets:
  // let inputarea = document.querySelector("#input");
  // let data = inputarea.value;

  let data = getTextFromEditor();
  if (!data) {
    // This could be a transient state of the text editor before
    // new contents is added.
    // console.log("Editor contents is empty");
    return;
  }
  if (data.match(/^\s*$/)) {
    console.log('Editor contents is empty (2)');
    return;
  }
  let options = humdrumToSvgOptions();
  if (data.match(/CUT[[]/)) {
    options.inputFrom = 'esac';
  }
  if (data.match(/Group memberships:/)) {
    options.inputFrom = 'musedata';
  }
 
  window.OPTIONS = options;
  // console.log('Calling window.vrvWorker.renderData with args:', {options, OPTIONS: window.OPTIONS, editorValue:window.EDITOR.getValue(), data, page, force, vrvWorker: window.vrvWorker})
  window.vrvWorker
    .renderData(options, data, page, force)
    .then(function (svg) {
      let ishumdrum = true;
      if (data.charAt(0) == '<') {
        ishumdrum = false;
      } else if (data.match(/CUT[[]/)) {
        ishumdrum = false;
      } else if (data.match(/Group memberships:/)) {
        ishumdrum = false;
      }

      let output = document.querySelector('#output');
      output.innerHTML = svg;
      if (ishumdrum) {
        if (restoreid) {
          restoreSelectedSvgElement(restoreid);
        } else if (window.RestoreCursorNote) {
          restoreSelectedSvgElement(window.RestoreCursorNote);
        }
        displayFileTitle(data);
        if (!force) document.querySelector('body').classList.remove('invalid');
      }
      verovioCallback(svg);
      return true;
    })
    .catch(function (message) {
      document.querySelector('body').classList.add('invalid');
      console.log('>>>>>>>>>> ERROR LOG:', message);
      return false;
    })
    .finally(function () {
      let indexelement = document.querySelector('#index');
      indexelement.style.visibility = 'invisibile';
      indexelement.style.display = 'none';
      if (window.UndoHide) {
        showInputArea(true);
        window.UndoHide = false;
      }
      if (window.ApplyZoom) {
        applyZoom();
        window.ApplyZoom = false;
      }
      if (window.ApplyZoom) {
        applyZoom();
        window.ApplyZoom = false;
      }
      window.ShowingIndex = false;
      $('html').css('cursor', 'auto');
      // these lines are needed to re-highlight the note when
      // the notation has been updated.
      //setCursorNote (null, "displayNotation");
      //highlightNoteInScore();

      // if (SEARCHFILTER) {
      //   // extract the filtered Humdrum data from verovio, and
      //   // pull out the match count from the data and report
      //   // search toolbar
      //   window.vrvWorker.getHumdrum().then(function (humdrumdata) {
      //     let data = humdrumdata.match(/[^\r\n]+/g);
      //     let count = 0;
      //     let matches;
      //     for (let i = data.length - 1; i > 0; i--) {
      //       matches = data[i].match(/^!!@MATCHES:\s*(\d+)/);
      //       if (matches) {
      //         count = parseInt(matches[1]);
      //         break;
      //       }
      //     }
      //     console.log('COUNT', count);
      //     let eresults = document.querySelector('#search-results');
      //     if (eresults) {
      //       let output = '';
      //       if (count == 0) {
      //         output = '0 matches';
      //       } else if (count == 1) {
      //         output = '1 match';
      //       } else {
      //         output = count + ' matches';
      //       }
      //       eresults.innerHTML = output;
      //       showSearchLinkIcon();
      //     }
      //   });
      // }
    });
}

window.displayNotation = displayNotation;

//////////////////////////////
//
// toggleFreeze --
//

export function toggleFreeze() {
  window.FreezeRendering = !window.FreezeRendering;
  document.querySelector('body').classList.toggle('frozen');
  if (!window.FreezeRendering) {
    displayNotation();
  }

  let felement = document.querySelector('#text-freeze-icon');
  let output = '';
  if (felement) {
    if (window.FreezeRendering) {
      // display is frozen so show lock icon
      output =
        "<div title='Unfreeze notation (alt-f)' class='nav-icon fas fa-lock'></div>";
    } else {
      // display is not frozen so show unlock icon
      output =
        "<div title='Freeze notation (alt-f)' class='nav-icon fas fa-unlock'></div>";
    }
    felement.innerHTML = output;
  }
}

//////////////////////////////
//
// toggleTextVisibility --
//

export function toggleTextVisibility(suppressZoom) {
  window.InputVisible = !window.InputVisible;
  let input = document.querySelector('#input');
  if (window.InputVisible) {
    if (window.LastInputWidth == 0) {
      window.LastInputWidth = 400;
    }
    window.Splitter.setPositionX(window.LastInputWidth);
  } else {
    window.LastInputWidth = parseInt(input.style.width);
    window.Splitter.setPositionX(0);
  }
  if (!suppressZoom) {
    displayNotation();
    // applyZoom();
  }
  window.EDITOR.resize();
  // matchToolbarVisibilityIconToState();
}

//////////////////////////////
//
// redrawInputArea --
//

export function redrawInputArea(suppressZoom) {
  let input = document.querySelector('#input');
  if (window.InputVisible) {
    if (window.LastInputWidth == 0) {
      window.LastInputWidth = 400;
    }
    window.Splitter.setPositionX(window.LastInputWidth);
  } else {
    window.LastInputWidth = parseInt(input.style.width);
    window.Splitter.setPositionX(0);
  }
  if (!suppressZoom) {
    applyZoom();
  }
 window.EDITOR.resize();
}

//////////////////////////////
//
// hideInputArea --
//

function hideInputArea(suppressZoom) {
  window.InputVisible = false;
  let input = document.querySelector('#input');
  window.LastInputWidth = parseInt(input.style.width);
  window.Splitter.setPositionX(0);
  if (!suppressZoom) {
    applyZoom();
  }
}

//////////////////////////////
//
// showInputArea --
//

function showInputArea(suppressZoom) {
  window.InputVisible = true;
  window.Splitter.setPositionX(window.LastInputWidth);
  if (!suppressZoom) {
    applyZoom();
  }
 window.EDITOR.resize();
}

//////////////////////////////
//
// toggleVhvTitle --
//

export function toggleVhvTitle() {
  window.VrvTitle = !window.VrvTitle;
  let area = document.querySelector('#vhv');
  if (window.VrvTitle) {
    area.style.visibility = 'visible';
    area.style.display = 'inline';
  } else {
    area.style.visibility = 'hidden';
    area.style.display = 'none';
  }
}

//////////////////////////////
//
// hideWorkNavigator --
//

function restoreWorkNavigator(selector) {
  if (!selector) {
    selector = '#work-navigator';
  }
  if (window.ERASED_WORK_NAVIGATOR.match(/^\s*$/)) {
    return;
  }
  window.FILEINFO = window.ERASED_FILEINFO;
  let element = document.querySelector(selector);
  element.innerHTML = window.ERASED_WORK_NAVIGATOR;
  window.ERASED_WORK_NAVIGATOR = '';
}

//////////////////////////////
//
// removeWorkNavigator --
//

function removeWorkNavigator(selector) {
  if (!selector) {
    selector = '#work-navigator';
  }
  let element = document.querySelector(selector);
  window.ERASED_WORK_NAVIGATOR = element.innerHTML;
  window.ERASED_FILEINFO = window.FILEINFO;
  element.innerHTML = '';
}

//////////////////////////////
//
// displayWorkNavigation --
//

function displayWorkNavigation(selector) {
  if (!selector) {
    selector = '#work-navigator';
  }
  let contents = '';
  const element = document.querySelector(selector);
  if (!element) {
    console.log('Error: cannot find work navigator');
    return;
  }

  if (window.FILEINFO['previous-work']) {
    contents += '<span style="cursor:pointer" onclick="displayWork(\'';
    contents += window.FILEINFO['previous-work'];
    contents += '\');"';
    contents += " title='previous work/movement (&#8679;+&#8592;)'";
    contents += '>';
    contents += "<span class='nav-icon fas fa-arrow-circle-left'></span>";
    contents += '</span>';
  }

  if (
    window.FILEINFO['previous-work'] &&
    window.FILEINFO['next-work'] &&
    window.FILEINFO['has-index'] == 'true'
  ) {
    contents += '&nbsp;';
  }

  if (window.FILEINFO['has-index'] == 'true') {
    contents += '<span style="cursor:pointer" onclick="displayIndex(\'';
    contents += window.FILEINFO['location'];
    contents += '\');"';
    contents += " title='repertory index (&#8679;+&#8593;)'";
    contents += '>';
    contents += "<span class='nav-icon fas fa-arrow-circle-up'></span>";
    contents += '</span>';
  }

  if (
    window.FILEINFO['previous-work'] &&
    window.FILEINFO['next-work'] &&
    window.FILEINFO['has-index'] == 'true'
  ) {
    contents += '&nbsp;';
  }

  if (
    window.FILEINFO['previous-work'] &&
    window.FILEINFO['next-work'] &&
    window.FILEINFO['has-index'] != 'true'
  ) {
    contents += '&nbsp;';
  }

  if (window.FILEINFO['next-work']) {
    contents += '<span style="cursor:pointer" onclick="displayWork(\'';
    contents += window.FILEINFO['next-work'];
    contents += '\');"';
    contents += " title='next work/movement (&#8679;+&#8594;)'";
    contents += '>';
    contents += "<span class='nav-icon fas fa-arrow-circle-right'></span>";
    contents += '</span>';
  }

  if (window.FILEINFO['file']) {
    contents +=
      '<span style="padding-left:3px; cursor:pointer" onclick="displayKeyscape();"';
    contents += " title='Keyscape'";
    contents += '>';
    contents += "<span class='nav-icon fa fa-key'></span>";
    contents += '</span>';
  }

  if (window.FILEINFO['has-index'] == 'true') {
    contents +=
      '<span style="padding-left:3px; cursor:pointer" onclick="copyRepertoryUrl(\'';
    contents += window.FILEINFO['location'];
    contents += '/';
    contents += window.FILEINFO['file'];
    contents += '\')"';
    contents += " title='copy link for work'";
    contents += '>';
    contents += "<span class='nav-icon fas fa-link'></span>";
    contents += '</span>';
  }

  if (window.FILEINFO['previous-work'] || window.FILEINFO['next-work']) {
    contents += '&nbsp;&nbsp;';
  }

  element.innerHTML = contents;
}

//////////////////////////////
//
// copyRepertoryUrl --
//

function copyRepertoryUrl(file) {
  if (!file) {
    if (window.FILEINFO) {
      file = window.FILEINFO.location;
      file += '/';
      file += window.FILEINFO.file;
    }
  }

  let url = 'https://verovio.humdrum.org';
  let initialized = 0;

  if (file) {
    url += '/?file=';
    url += file;
    initialized = 1;
  }

  let kstring = '';
  if (!window.InputVisible) {
    kstring += 'ey';
  }

  if (kstring.length > 0) {
    if (!initialized) {
      url += '/?';
      initialized = 1;
    } else {
      url += '&';
    }
    url += 'k=' + kstring;
  }
  
  // if (PQUERY && PQUERY.length > 0) {
  //   if (!initialized) {
  //     url += '/?';
  //     initialized = 1;
  //   } else {
  //     url += '&';
  //   }
  //   url += 'p=';
  //   url += encodeURIComponent(PQUERY);
  // }
  // if (RQUERY && RQUERY.length > 0) {
  //   if (!initialized) {
  //     url += '/?';
  //     initialized = 1;
  //   } else {
  //     url += '&';
  //   }
  //   url += 'r=';
  //   url += encodeURIComponent(RQUERY);
  // }
  // if (IQUERY && IQUERY.length > 0) {
  //   if (!initialized) {
  //     url += '/?';
  //     initialized = 1;
  //   } else {
  //     url += '&';
  //   }
  //   url += 'i=';
  //   url += encodeURIComponent(IQUERY);
  // }
  copyToClipboard(url);
}

//////////////////////////////
//
// displayFileTitle --
//
import { getReferenceRecords } from './utility-humdrum.js';

function displayFileTitle(contents) {
  let references = getReferenceRecords(contents);

  let lines = contents.split(/\r?\n/);
  let title = '';
  let number = '';
  let composer = '';
  let sct = '';
  let matches;

  if (references['title'] && !references['title'].match(/^\s*$/)) {
    title = references['title'];
  } else if (references['OTL'] && !references['OTL'].match(/^\s*$/)) {
    title = references['OTL'];
  }

  if (references['COM'] && !references['COM'].match(/^\s*$/)) {
    if ((matches = references['COM'].match(/^\s*([^,]+),/))) {
      composer = matches[1];
    } else {
      composer = references['COM'];
    }
  }

  title = title.replace(/-sharp/g, '&#9839;');
  title = title.replace(/-flat/g, '&#9837;');

  let tarea;
  tarea = document.querySelector('#title');
  if (tarea) {
    tarea.innerHTML = title;
  }

  tarea = document.querySelector('#composer');
  let pretitle = '';

  if (tarea && !composer.match(/^\s*$/)) {
    pretitle += composer + ', ';
  }
  tarea.innerHTML = pretitle;

  displayWorkNavigation('#work-navigator');
}

//////////////////////////////
//
// displayWork --
//
import { loadKernScoresFile } from './loading.js';

export function displayWork(file) {
  if (!file) {
    return;
  }
  moveToTopOfNotation();
  window.vrvWorker.page = 1;
  $('html').css('cursor', 'wait');
  // window.stop();
  loadKernScoresFile({
    file,
    previous: true,
    next: true,
  });
}

window.displayWork = displayWork;

//////////////////////////////
//
// displayIndex --
//

export function displayIndex(directory) {
  window.ShowingIndex = true;
  if (!directory) {
    return;
  }
  $('html').css('cursor', 'wait');
  loadIndexFile(directory);
}

//////////////////////////////
//
// replaceEditorContentWithHumdrumFile -- If the editor contents is
//    MusicXML, then convert to Humdrum and display in the editor.
//

export function replaceEditorContentWithHumdrumFile(text, page) {
  if (!text) {
    text = getTextFromEditor();
  }
  if (!text) {
    console.log('No content to convert to Humdrum');
    return;
  }

  window.vrvWorker.page = 1;
  page = page || window.vrvWorker.page;
  let options = null;
  let meiQ = false;

  let mode = getMode(text);

  if (text.slice(0, 1000).match(/<score-partwise/)) {
    // MusicXML data
    options = musicxmlToHumdrumOptions();
  } else if (text.slice(0, 2000).match(/Group memberships:/)) {
    // MuseData data
    options = musedataToHumdrumOptions();
  } else if (text.slice(0, 1000).match(/<mei/)) {
    // this is MEI data
    options = meiToHumdrumOptions();
    meiQ = true;
  } else if (text.slice(0, 1000).match(/CUT[[]/)) {
    // EsAC data
    options = esacToHumdrumOptions();
  } else {
    // don't know what it is, but probably Humdrum
    alert('Cannot convert data to Humdrum');
    return;
  }

  if (options) {
    if (
      options.inputFrom == 'musedata' ||
      options.inputFrom == 'musedata-hum'
    ) {
      window.vrvWorker.filterData(options, text, 'humdrum').then(showMei);
    } else if (
      options.inputFrom == 'musicxml' ||
      options.inputFrom == 'musicxml-hum'
    ) {
      window.vrvWorker.filterData(options, text, 'humdrum').then(showMei);
    } else {
      window.vrvWorker.filterData(options, text, 'humdrum').then(function (newtext) {
        let freezeBackup = window.FreezeRendering;
        if (window.FreezeRendering == false) {
          window.FreezeRendering = true;
        }
        setTextInEditor(newtext);
        window.FreezeRendering = freezeBackup;
        displayNotation(page);
      });
    }
  }
}

///////////////////////////////
//
// applyZoom --
//

function applyZoom() {
  // let measure = 0;

  let testing = document.querySelector('#output svg');
  if (!testing) {
    // console.log("NO OUTPUT SVG LOCATION");
    return;
  }

  // if (window.vrvWorker.page !== 1) {
  // 	measure = $("#output .measure").attr("id");
  // }

  let options = humdrumToSvgOptions();
  window.OPTIONS = options;
  stop();
  window.vrvWorker.HEIGHT = options.pageHeight;
  window.vrvWorker.WIDTH = options.pageWidth;

  window.vrvWorker.redoLayout(options, 1, window.vrvWorker.page).then(function () {
    loadPage(window.vrvWorker.page);
  });
}

//////////////////////////////
//
// loadPage --
//

export function loadPage(page) {
  page = page || window.vrvWorker.page;
  $('#overlay').hide().css('cursor', 'auto');
  $('#jump_text').val(page);
  window.vrvWorker.renderPage(page).then(function (svg) {
    $('#output').html(svg);
    verovioCallback(svg);
    // adjustPageHeight();
    // resizeImage();
  });
}

//////////////////////////////
//
// resizeImage -- Make all SVG images match the width of the new
//     width of the window.
//

function resizeImage(image) {
  return; /* not needed anymore */
  /*
	let ww = window.innerWidth;
	let tw = $("#input").outerWidth();

	// let newheight = (window.innerHeight - $("#navbar").outerHeight()) / ZOOM - 100;
	// let newwidth = (ww - tw) / ZOOM - 100;
	let newheight = (window.innerHeight - $("#navbar").outerHeight());
	let newwidth = (ww - tw);

	let image = document.querySelector("#output svg");
	//console.log("OLD IMAGE HEIGHT", $(image).height());
	console.log("OLD IMAGE WIDTH", $(image).width());
	if (!image) {
		return;
	}
	console.log("ZOOM", ZOOM);

return;

	$(image).width(newwidth);
	$(image).height(newheight);
	$(image.parentNode).height(newheight);
	$(image.parentNode).width(newwidth);
*/
}

//////////////////////////////
//
// gotoPreviousPage --
//

export function gotoPreviousPage() {
  window.vrvWorker.gotoPage(window.vrvWorker.page - 1).then(function () {
    loadPage(window.vrvWorker.page);
  });
}

//////////////////////////////
//
// gotoNextPage --
//

export function gotoNextPage() {
  window.vrvWorker.gotoPage(window.vrvWorker.page + 1).then(function () {
    loadPage(window.vrvWorker.page);
  });
}

//////////////////////////////
//
// gotoLastPage --
//

export function gotoLastPage() {
  window.vrvWorker.gotoPage(0).then(function () {
    loadPage(window.vrvWorker.page);
  });
}

//////////////////////////////
//
// gotoFirstPage --
//

export function gotoFirstPage() {
  window.vrvWorker.gotoPage(1).then(function () {
    loadPage(window.vrvWorker.page);
  });
}

//////////////////////////////
//
// showBufferedHumdrumData --
//
import { editorMode, setEditorMode } from './global-variables.js'

export function showBufferedHumdrumData() {
  // let oldmode = EditorMode;
  let oldmode = editorMode();
  if (oldmode == 'musedata') {
    setEditorMode('humdrum');
    // EditorMode = 'humdrum';
    setEditorModeAndKeyboard();
    displayHumdrum();
  } else {
    // EditorMode = 'humdrum';
    setEditorMode('humdrum');
    setEditorModeAndKeyboard();
    if (!window.BufferedHumdrumFile.match(/^\s*$/)) {
      let page = window.vrvWorker.page;
      displayScoreTextInEditor(window.BufferedHumdrumFile, window.vrvWorker.page);
      window.BufferedHumdrumFile = '';
    }
  }
}

//////////////////////////////
//
// displayHumdrum --
//

function displayHumdrum() {
  let options = humdrumToSvgOptions();
  window.vrvWorker
    .filterData(options, getTextFromEditor(), 'humdrum')
    .then(showHumdrum);
}

//////////////////////////////
//
// showHumdrum --
//

function showHumdrum(humdrumdata) {
  // if (EditorMode == 'musedata') {
  if (editorMode() == 'musedata') {
    // could implement a key to return to MuseData contents
    window.MuseDataBuffer = getTextFromEditor();
  }
  setTextInEditor(humdrumdata);
}

//////////////////////////////
//
// getTextFromEditor -- return the content of the text editor,
//    removing any leading space (which will cause confusion in
//    the verovio auto-format detection algorithm).  Trailing
//    space is not removed.
//
// Maybe use for UTF-8, but seems to be working without:
//     btoa(unescape(encodeURIComponent(str))))
//

export function getTextFromEditor() {
  let text =window.EDITOR.getValue();
  if (!text) {
    return '';
  }
  text = ensureTsv(text);
  if (text.length < 5) {
    // do not try to unmime if length less than 5 characters
    return text;
  }
  // if the first 100 charcters are only spaces or [A-Za-z0-9/+=], the assume
  // the text is MIME encoded, so decode before returning:
  let starting = text.substring(0, 100);
  if (starting.match(/^[\nA-Za-z0-9/+=]+$/)) {
    try {
      text = atob(text);
      text = ensureTsv(text);
    } catch (err) {
      // console.log("text is not mime", text);
      // It is still possible that the text is not
      // MIME data, but it will still be decodeable
      // into junk.
    }
  }
  return text;
}

//////////////////////////////
//
// getTextFromEditorRaw --
//

export function getTextFromEditorRaw() {
  return window.EDITOR.getValue();
}

//////////////////////////////
//
// getTextFromEditorNoCsvProcessing --
//

export function getTextFromEditorNoCsvProcessing() {
  let text =window.EDITOR.getValue();
  if (!text) {
    return '';
  }
  if (text.length < 5) {
    // do not try to unmime if length less than 5 characters
    return text;
  }
  // if the first 100 charcters are only spaces or [A-Za-z0-9/+=], the assume
  // the text is MIME encoded, so decode before returning:
  let starting = text.substring(0, 100);
  if (starting.match(/^[\nA-Za-z0-9/+=]+$/)) {
    try {
      text = atob(text);
    } catch (err) {
      // console.log("text is not mime", text);
      // It is still possible that the text is not
      // MIME data, but it will still be decodeable
      // into junk.
    }
  }
  return text;
}

//////////////////////////////
//
// ensureTsv -- convert to TSV if in CSV format.
//

function ensureTsv(text) {
  let lines = text.split('\n');
  let commacount = 0;
  let linecount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^!!/)) {
      continue;
    }
    linecount++;
    if (lines[i].match(/,/)) {
      commacount++;
    }
    if (linecount > 10) {
      break;
    }
  }
  if (linecount && linecount == commacount) {
    return convertDataToTsv(lines);
  } else {
    return text;
  }
}

//////////////////////////////
//
// setTextInEditor -- Sets the text in the editor, remving the last
//   newline in the file to prevent an empty line in the ace editor
//   (the ace editor will add an empty line if the last line of
//   data ends with a newline).  The cursor is moved to the start
//   of the data, but the view is not moved to the start (this is needed
//   for keeping a used filter in view when compiling filters, in
//   particular).  Also the selection of the entire copied data
//   is deselected.
//

export function setTextInEditor(text) {
  if (!text) {
   window.EDITOR.setValue('');
  } else if (text.charAt(text.length - 1) === '\n') {
    // Get rid of #@%! empty line at end of text editor:
   window.EDITOR.setValue(text.slice(0, -1), -1);
  } else {
   window.EDITOR.setValue(text, -1);
  }
 window.EDITOR.getSession().selection.clearSelection();
}

//////////////////////////////
//
// getTextFromEditorWithGlobalFilter -- Same as getTextFromEditor(),
//    but with global filter added.
//

function getTextFromEditorWithGlobalFilter(data) {
  if (!data) {
    data = getTextFromEditor();
  }
  // remove leading/trailing spaces:
  data = data.replace(/^\s+/, '').replace(/\s+$/, '');

  return data;
}

//////////////////////////////
//
// showMei --
//

function showMei(meidata) {
  if (window.ShowingIndex) {
    return;
  }
  setEditorMode('xml');
  // EditorMode = 'xml';
  setEditorModeAndKeyboard();
  if (window.BufferedHumdrumFile.match(/^\s*$/)) {
    window.BufferedHumdrumFile = getTextFromEditor();
  }
  displayScoreTextInEditor(meidata, window.vrvWorker.page);
}

//////////////////////////////
//
// displayMeiNoType --
//

export function displayMeiNoType() {
  let options = humdrumToSvgOptions();
  options.humType = 0;
  let text = getTextFromEditor();
  window.vrvWorker.filterData(options, text, 'mei').then(function (meidata) {
    showMei(meidata);
  });
}

//////////////////////////////
//
// displayMei --
//

export function displayMei() {
  window.vrvWorker.getMEI().then(function (meidata) {
    showMei(meidata);
  });
}

//////////////////////////////
//
// displaySvg --
//

function displaySvg() {
  if (window.ShowingIndex) {
    return;
  }
  window.vrvWorker.renderPage(window.vrvWorker.page).then(function (data) {
    let prefix =
      "<textarea style='spellcheck=false; width:100%; height:100%;'>";
    let postfix = '</textarea>';
    let w = window.open(
      'about:blank',
      'SVG transcoding',
      'width=600,height=800,resizeable,scrollabars,location=false'
    );
    w.document.write(prefix + data + postfix);
    w.document.close();

    // Set the title of the window.  It cannot be set immediately and must wait
    // until the content has been loaded.
    function checkTitle() {
      if (w.document) {
        w.document.title = 'SVG transcoding';
      } else {
        setTimeout(checkTitle, 40);
      }
    }
    checkTitle();

    verovioCallback(data);
  });
}

//////////////////////////////
//
// displayPdf --
//

export function displayPdf() {
  // If a humdrum file has a line starting with
  //     !!!URL-pdf: (https?://[^\s]*)
  // then load that file.
  let loaded = false;
  // if (EditorMode === 'humdrum') {
  if (editorMode() === 'humdrum') {
    let loaded = displayHumdrumPdf();
  }

  if (loaded) {
    return;
  }

  if (!window.FILEINFO['has-pdf']) {
    return;
  }
  if (window.FILEINFO['has-pdf'] != 'true') {
    return;
  }

  let url = 'https://kern.humdrum.org/data?l=' + window.FILEINFO['location'];
  url += '&file=' + window.FILEINFO['file'];
  url += '&format=pdf&#view=FitH';

  openPdfAtBottomThirdOfScreen(url);
}

//////////////////////////////
//
// displayKeyscape --
//

function displayKeyscape() {
  let fileinfo = window.FILEINFO;
  if (!fileinfo) {
    console.log('Error: no fileinfo');
    return;
  }
  if (typeof fileinfo.file === 'undefined') {
    console.log('Error: filename not found');
    return;
  }
  let file = fileinfo.file;
  if (!file) {
    console.log('Error: filename is empty');
    return;
  }
  if (typeof fileinfo.location === 'undefined') {
    console.log('Error: location not found');
    return;
  }
  let location = fileinfo.location;
  if (!location) {
    console.log('Error: location is empty');
    return;
  }

  let url = 'https://kern.humdrum.org/data?file=';
  url += encodeURIComponent(file);
  url += '&l=';
  url += encodeURIComponent(location);
  url += '&format=keyscape-html';
  console.log('Keyscape URL is', url);

  console.log('Loading Keyscape', url);
  if (window.WKEY) {
    window.WKEY.close();
    window.WKEY = null;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/open#window____features
  let features = '';
  // width and height are not the dimensions of the PNG image (600x461)
  // features += "width=950";
  // features += ", height=775";
  features += 'width=664';
  features += ', height=511';
  features += ', left=10';
  features += ', top=10';
  features += ', resizeable';
  features += ', scrollbars';
  features += ', toolbar=no';
  features += ', location=0';
  console.log('FEATURES', features);
  window.WKEY = window.open(url, '', features);
  window.WKEY.focus();
}

//////////////////////////////
//
// displayHumdrumPdf --
//
//         !!!URL-pdf: (https?://[^\s]*)
// If there is a number in the keyboard buffer:
//         !!!URL-pdf[1-9]: (https?://[^\s]*)
// Return value: false if not loaded from reference record
//
//

function displayHumdrumPdf() {
  let urllist = getPdfUrlList();

  let url = '';
  let i;
  if (window.InterfaceSingleNumber > 1) {
    for (i = 0; i < urllist.length; i++) {
      if (urllist[i].number == window.InterfaceSingleNumber) {
        url = urllist[i].url;
        break;
      }
    }
  } else {
    for (i = 0; i < urllist.length; i++) {
      if (urllist[i].number <= 1) {
        url = urllist[i].url;
        break;
      }
    }
  }

  // if the URL is empty but the urls array is not, then
  // select the last url (which is the first URL entry
  // in the file.
  // console.log("URLs:", urls);

  if (url) {
    openPdfAtBottomThirdOfScreen(url);
    return 1;
  } else {
    return 0;
  }
}

//////////////////////////////
//
// getPdfUrlList --
//

export function getPdfUrlList() {
  // if (EditorMode !== 'humdrum') {
  if (editorMode() !== 'humdrum') {
    // can't handle MEI mode yet
    return 0;
  }
  let predata = getTextFromEditor();
  if (!predata) {
    return [];
  }
  let data = predata.split(/\r?\n/);
  let refrecords = {};
  let output = [];
  let title = '';

  let query;
  query = '^!!!URL(\\d*)-pdf:\\s*((?:ftp|https?)://[^\\s]+)';
  query += '\\s+(.*)\\s*$';
  let rex = new RegExp(query);

  let references = [];

  let i;
  for (i = 0; i < data.length; i++) {
    let line = data[i];
    let matches = line.match(rex);
    if (matches) {
      let obj = {};
      if (!matches[1]) {
        obj.number = -1;
      } else {
        obj.number = parseInt(matches[1]);
      }
      obj.url = matches[2];
      obj.title = matches[3];
      output.push(obj);
    }

    matches = line.match(/^!!!([^:]+)\s*:\s*(.*)\s*$/);
    if (matches) {
      // Was declared global
      let obj = {};
      obj.key = matches[1];
      obj.value = matches[2];
      if (!refrecords[obj.key]) {
        refrecords[obj.key] = [];
      }
      refrecords[obj.key].push(obj);
    }
  }

  for (let i = 0; i < output.length; i++) {
    output[i].title = templateExpansion(output[i].title, refrecords);
  }

  return output;
}

//////////////////////////////
//
// templateExpansion --
//

function templateExpansion(title, records) {
  let matches = title.match(/@{(.*?)}/);
  if (!matches) {
    return title;
  }

  let replacement = getReferenceValue(matches[1], records);
  let rex = new RegExp('@{' + matches[1] + '}', 'g');
  title = title.replace(rex, replacement);

  matches = title.match(/@{(.*?)}/);
  while (matches) {
    replacement = getReferenceValue(matches[1], records);
    rex = new RegExp('@{' + matches[1] + '}', 'g');
    title = title.replace(rex, replacement);

    matches = title.match(/@{(.*?)}/);
  }

  return title;
}

//////////////////////////////
//
// getReferenceValue -- return the (first) reference record
//    value for the given key.
//

function getReferenceValue(key, records) {
  let entry = records[key];
  if (!entry) {
    return '';
  }

  return entry[0].value;
}

//////////////////////////////
//
// openPdfAtBottomThirdOfScreen --
//
// Reference: https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf
//

function openPdfAtBottomThirdOfScreen(url, keepfocus) {
  if (!url) {
    return;
  }

  console.log('Loading URL', url);
  let features = 'left=0';
  features += ',top=' + parseInt((screen.height * 2) / 3);
  features += ',width=' + screen.width;
  features += ',height=' + parseInt(screen.height / 3);
  features += ',resizeable';
  features += ',scrollbars';
  features += ',location=false';
  let wpdf = window.open(url, '', features);

  if (!keepfocus) {
    if (window.focus) {
      wpdf.focus();
    }
  }
}

//////////////////////////////
//
// reloadData -- Expand later to work with other input URIs.
//

export function reloadData() {
  // delete all sessionStorage keys starting with "basket-"
  for (let key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key) && /^basket-/.test(key)) {
      console.log('DELETING', key);
      delete sessionStorage[key];
    }
  }

  // if (CGI && CGI.file) {
  //   // Reload from URL file parameter if this method was used.
  //   // (Don't know if a different work was loaded differently, however).
  //   let basket = 'basket-' + CGI.file;
  //   if (CGI.mm) {
  //     basket += '&mm=' + CGI.mm;
  //   }
  //   sessionStorage.removeItem(basket);
  //   loadKernScoresFile(
  //     {
  //       file: CGI.file,
  //       measures: CGI.mm,
  //       previous: false,
  //       next: false,
  //     },
  //     true
  //   );
  // } else {
  //   // (assume) reload a repertory score
  //   console.log("Don't know what to reload");
  // }
}

//////////////////////////////
//
// initializeVerovioToolkit --
//

export function initializeVerovioToolkit() {
  // console.log("Verovio toolkit being initialized.");

  let inputarea = document.querySelector('#input');

  // now done with Ace editor callback:
  // inputarea.addEventListener("keyup", function() {
  //		displayNotation();
  //});
  if (window.EDITOR) {
   window.EDITOR.session.on('change', function (e) {
      // console.log("EDITOR content changed", e);
      monitorNotationUpdating();
    });
  } else {
    console.log('Warning: Editor not setup yet');
  }

  // $(window).resize(function() { applyZoom(); });
  $(window).resize(function () {
    displayNotation();
  });

  $('#input').mouseup(function () {
    let $this = $(this);
    if (
      $this.outerWidth() != $this.data('x') ||
      $this.outerHeight() != $this.data('y')
    ) {
      applyZoom();
    }
    $this.data('x', $this.outerWidth());
    $this.data('y', $this.outerHeight());
  });

  if (!window.ShowingIndex) {
    console.log('Score will be displayed after verovio has finished loading');
    displayNotation();
  }

  // downloadWildWebMidi('scripts/midiplayer/wildwebmidi.js');
  initializeWildWebMidi();
}

//////////////////////////////
//
// monitorNotationUpdating --
//

function monitorNotationUpdating() {
  updateEditorMode();
  displayNotation();
}

window.monitorNotationUpdating = monitorNotationUpdating;

//////////////////////////////
//
// downloadWildWebMidi --
//

function downloadWildWebMidi(url) {
  let url3 = 'scripts/midiplayer/midiplayer.js';

  basket
    .require(
      { url: url, expire: 26, unique: window.BasketVersion },
      { url: url3, expire: 17, unique: window.BasketVersion }
    )
    .then(
      function () {
        initializeWildWebMidi();
      },
      function () {
        console.log('There was an error loading script', url);
      }
    );
}

//////////////////////////////
//
// initializeWildWebMidi --
//

function initializeWildWebMidi() {
  $("#player").midiPlayer({
    color: null,
    // color: "#c00",
    onUnpdate: window.midiUpdate,
    onStop: window.midiStop,
    width: 250,
    locateFile: function () {
      return 'wildwebmidi.data';
    }
  });
  console.log('Initialized WildWebMidi', $("#player").midiPlayer)

  $('#input').keydown(function () {
    stop();
  });

  // window blur event listener -- Stop MIDI playback.  It is very computaionally
  //    expensive, and is not useful if the window is not in focus.
  window.addEventListener('blur', function () {
    window.pause();
  });
}

//////////////////////////////
//
// dataIntoView -- When clicking on a note (or other itmes in SVG images later),
//      go to the corresponding line in the editor.
//

export function dataIntoView(event) {
  // if (EditorMode == 'xml') {
  if (editorMode() == 'xml') {
    xmlDataIntoView(event);
  } else {
    humdrumDataIntoView(event);
  }
}

//////////////////////////////
//
// xmlDataIntoView -- When clicking on a note (or other itmes in SVG
//      images later), make the text line in the MEI data visible in
//      the text area.
//
// https://github.com/ajaxorg/ace/wiki/Embedding-API
//

export function xmlDataIntoView(event) {
  let target = event.target;
  let id = target.id;
  let matches;
  let regex;
  let range;
  let searchstring;

  while (target) {
    if (!target.id) {
      target = target.parentNode;
      continue;
    }
    let id = target.id;
    // if (!id.match(/-L\d+F\d+/)) {
    if (!id) {
      target = target.parentNode;
      continue;
    }
    if (!id.match(/-L\d+F\d+/)) {
      // find non-humdrum ID.
      searchstring = 'xml:id="' + target.id + '"';
      regex = new RegExp(searchstring);
      range =window.EDITOR.find(regex, {
        wrap: true,
        caseSensitive: true,
        wholeWord: true,
      });
      break;
    }
    // still need to verify if inside of svg element in the first place.
    searchstring = 'xml:id="' + target.id + '"';
    regex = new RegExp(searchstring);
    range =window.EDITOR.find(regex, {
      wrap: true,
      caseSensitive: true,
      wholeWord: true,
    });
    break; // assume that the first formatted id found is valid.
  }
}

//////////////////////////////
//
// humdrumDataIntoView -- When clicking on a note (or other items in
//      SVG images later), make the text line in the Humdrum data visible
//      in the text area.
//
export function humdrumDataIntoView(event) {
  let target;
  if (typeof event === 'string') {
    target = document.querySelector('#' + event);
  } else {
    target = event.target;
  }
  let matches;
  while (target) {
    if (!target.id) {
      target = target.parentNode;
      continue;
    }
    matches = target.id.match(/-[^-]*L(\d+)F(\d+)/);
    if (!matches) {
      target = target.parentNode;
      continue;
    }

   window.HIGHLIGHTQUERY = target.id;
    highlightIdInEditor(target.id, 'humdrumDataIntoView');
    break;
  }
}

//////////////////////////////
//
// displayScoreTextInEditor --
//

export function displayScoreTextInEditor(text, page) {
  let mode = getMode(text);

  // if (mode != EditorMode) {
  //   EditorMode = mode;
  //   setEditorModeAndKeyboard();
  // }
  
  if (mode != editorMode()) {
    // EditorMode = mode;
    setEditorMode(mode);
    setEditorModeAndKeyboard();
  }

  // -1 is to unselect added text, and move cursor to start
  setTextInEditor(text);

  // update the notation display
  displayNotation(page);
}

//////////////////////////////
//
// toggleHumdrumCsvTsv --
//

export function toggleHumdrumCsvTsv() {
  console.log('converting from CSV TO TSV');
  if (editorMode() == 'xml') {
    // not editing Humdrum data
    return;
  }
  // if (EditorMode == 'xml') {
  //   // not editing Humdrum data
  //   return;
  // }
  let data = getTextFromEditorNoCsvProcessing();
  let lines = data.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\*\*/)) {
      if (lines[i].match(/,/)) {
        console.log('CONVERTING TO TSV');
        setTextInEditor(convertDataToTsv(lines));
      } else {
        console.log('CONVERTING TO CSV');
        setTextInEditor(convertDataToCsv(lines));
      }
      break;
    }
  }
}

//////////////////////////////
//
// decreaseTab --
//

export function decreaseTab() {
  window.TABSIZE--;
  if (window.TABSIZE < 1) {
    window.TABSIZE = 1;
  }
 window.EDITOR.getSession().setTabSize(window.TABSIZE);
}

//////////////////////////////
//
// increaseTab --
//

export function increaseTab() {
  window.TABSIZE++;
  if (window.TABSIZE > 100) {
    window.TABSIZE = 100;
  }
 window.EDITOR.getSession().setTabSize(window.TABSIZE);
}

//////////////////////////////
//
// clearContent -- Used by the alt-e option or the erase button
// in the main toolbar.
//

export function clearContent() {
  let data = getTextFromEditorNoCsvProcessing();
  moveToTopOfNotation();
  if (data.match(/^\s*$/)) {
    // restore the text (which may have accidentally been erased)
    setTextInEditor(window.ERASED_DATA);
    displayFileTitle(window.ERASED_DATA);
    restoreWorkNavigator();
    // The left/right arrows are still active for navigating to
    // other works in the repertory.
  } else {
    // Erase the text, but store it in a buffer in case
    // the user wants to recall it if the editor is still empty.
    window.ERASED_DATA = data;
    let element;
    setTextInEditor('');
    let output = document.querySelector('#output');
    if (output) {
      output.innerHTML = '';
    }
    displayFileTitle('');
    removeWorkNavigator();
  }
 window.EDITOR.focus();
}

//////////////////////////////
//
// playCurrentMidi -- If a note is selected start playing from that note;
//     otherwise, start from the start of the music.
//
// document.querySelector('#play-button').addEventListener('click', () => {
//   console.log('Calling playCurrentMidi')
  
//   playCurrentMidi();
// })

import { play_midi } from '../midifunctions.js';
export function playCurrentMidi() {
  if (window.CursorNote && window.CursorNote.id) {
    let id = window.CursorNote.id;
    window.vrvWorker.getTimeForElement(id).then(function (time) {
      play_midi(time);
    });
  } else {
    play_midi();
  }
}

window.playCurrentMidi = playCurrentMidi;

//////////////////////////////
//
// setCursorNote --
//

export function setCursorNote(item, location) {
 window.CursorNote = item;
 window.MENU.showCursorNoteMenu(window.CursorNote);
}

//////////////////////////////
//
// hideRepertoryIndex --
//

export function hideRepertoryIndex() {
  let element = document.querySelector('#index');
  if (element && element.style.display != 'none') {
    element.style.display = 'none';
    // element.style.visibility = "hidden";
    let output = document.querySelector('#output');
    if (output) {
      console.log('FOCUSING ON OUTPUT');
      output.focus();
    }
    window.ShowingIndex = 0;
  }
}

//////////////////////////////
//
// updateEditorMode -- Automatically detect the type of data and change edit mode:
//
import { getMode } from './utility-ace.js';

export function updateEditorMode() {
  if (!window.EDITOR) {
    return;
  }
  let text = getTextFromEditorRaw();
  if (!text) {
    // This check is needed to prevent intermediate
    // states when the editor has been cleared in preparation
    // for new contents.
    // console.log("EDITOR IS EMPTY");
    return;
  }
  let shorttext = text.substring(0, 2000);
  let xmod = getMode(shorttext);
  if (xmod !== editorMode()) {
    setEditorMode(xmod);
    setEditorModeAndKeyboard();
    console.log('Changing to', xmod, 'mode.');
  }
  // if (xmod !== EditorMode) {
  //   EditorMode = xmod;
  //   setEditorModeAndKeyboard();
  //   console.log('Changing to', xmod, 'mode.');
  // }
}

//////////////////////////////
//
// nextPageClick -- this is a click event for the next page.  If the shift key is
//     pressed, go to the last page instead of the next page.
//

function nextPageClick(event) {
  if (!event) {
   window.MENU.goToNextPage(event);
  }
  if (event.shiftKey) {
   window.MENU.goToLastPage(event);
  } else {
   window.MENU.goToNextPage(event);
  }
}

//////////////////////////////
//
// previousPageClick -- this is a click event for the previous page.
//     If the shift key is pressed, go to the last page instead of
//     the next page.
//

function previousPageClick(event) {
  if (!event) {
   window.MENU.goToPreviousPage(event);
  }
  if (event.shiftKey) {
   window.MENU.goToFirstPage(event);
  } else {
   window.MENU.goToPreviousPage(event);
  }
}

//////////////////////////////
//
// copyToClipboard --
//

function copyToClipboard(string) {
  // console.log("Copying", string, "to clipboard");
  let element = document.createElement('textarea');
  element.value = string;
  document.body.appendChild(element);
  element.select();
  document.execCommand('copy');
  document.body.removeChild(element);
}

//////////////////////////////
//
// dataHasLineBreaks --
//

function dataHasLineBreaks(data) {
  if (!data) {
    data = getTextFromEditor();
  }
  // do something here ggg
}

//////////////////////////////
//
// removeLastLineInTextEditorIfMatches -- Remove the last non-empty line
//    in the text editor if it matches the given input string.  This function
//    is used by compileFilters() to remove the used GLOBALFILTER.
//

function removeLastLineInTextEditorIfMatches(line) {
  if (!line) {
    return;
  }
  let text = getTextFromEditor();
  if (!text) {
    return;
  }
  let lines = text.replace(/^\s+/, '').replace(/\s+$/, '').split(/\r?\n/);

  let deleteindex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^\s*$/)) {
      continue;
    }
    if (lines[i] === line) {
      deleteindex = i;
      // also delete #@%! empty lines before the delete line
      for (let j = deleteindex - 1; j <= 0; j--) {
        if (lines[j].match(/^\s*$/)) {
          deleteindex--;
          continue;
        }
        break;
      }
      break;
    }
    break;
  }

  if (deleteindex < 0) {
    return;
  }

  let newtext = '';
  for (let i = 0; i < deleteindex; i++) {
    newtext += lines[i] + '\n';
  }

  setTextInEditor(newtext);
}

//////////////////////////////
//
// moveToTopOfNotation --
//

function moveToTopOfNotation() {
  window.GOTOTOPOFNOTATION = true;
}

//////////////////////////////
//
// cleanFont --
//

export function cleanFont(font) {
  // Make sure that the font name is not corrupted:
  let found = 0;
  if (font.match(/bravura/i)) {
    font = 'Bravura';
    found = 1;
  } else if (font.match(/goo?tvil?e?/i)) {
    font = 'Gootville';
    found = 1;
  } else if (font.match(/leipzig/i)) {
    font = 'Leipzig';
    found = 1;
  } else if (font.match(/leland/i)) {
    font = 'Leland';
    found = 1;
  } else if (font.match(/petaluma/i)) {
    font = 'Petaluma';
    found = 1;
  }
  if (!found) {
    font = 'Leland';
  }
  return font;
}
