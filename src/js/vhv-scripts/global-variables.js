//
// _includes/vhv-scripts/global-variables.js
//
// This file is loaded from _includes/vhv-scripts/main.js and
// contains global variables used by VHV.
//

// CGI: lookup table of key/value pairs from URL parameters.
// window.CGI = {};

// OPTIONS: debugging parameter to see what options were used
// for the last call to the verovio toolkit.
// window.OPTIONS = {};
export let OPTIONS = {};
export function setOptions(options) {
  OPTIONS = options;
}

// var turl = "https://raw.githubusercontent.com/craigsapp/mozart-piano-sonatas/master/index.hmd";

// HMDINDEX: used to store a repertory index in the .hmd format.
// window.HMDINDEX = null;

// WKEY: window for displaying keyscape
// window.WKEY = null;

// window.GOTOTOPOFNOTATION = false;

////////////////////////////////////////////////////////////
//
// Verovio variables
//

// vrvWorker: interface to the verovio toolkit via the worker interface.  The worker
// interface allows rendering of notation to be done in a separate thread from the
// user interface, allowing the user interface to be more responsive.  This variable
// is configured in the setup.js file.
// window.vrvWorker = undefined;

//////////////////////////////
//
// verovio-related options: Primarily set in menu system and used in humdrumToSvgOptions().
//

// // SCALE: controls the size of the music notation using the verovio "scale" option.
// window.SCALE          = 40;

// // SPACING_STAFF: Set the minimum distance in diatonic steps between staves of music.
// window.SPACING_STAFF  = 12;

// // Need to add a variable SPACING_ADJUST_GROUP to add controls for spacing staff groups.

// // SPACING_SYSTEM: Set the minimum distance in diatonc steps between systems of music.
// // the verovio option justifyVertically may expand from this minimum distance, and
// // musical elements extending outside of this range will also push the systems further
// // apart.
// window.SPACING_SYSTEM = 18;

// // LYRIC_SIZE: control the relative size of lyrics in the rendered notation.  Units
// // are in terms of diatonic steps (1/2 of the space between staff lines).
// window.LYRIC_SIZE     = 4.5;

// // FONT: controls the musical font used by verovio to render notation.  This is also
// // the font variable used to generate PDF files.
// window.FONT           = "Leland";

// // BREAKS: controls whether or not verovio should use system/page breaks
// // encoded in the data or decide on its own line breaks.
// //     false means use "auto" breaking method for verovio "breaks" option.
// //     true means use "encoded" breaking method for verovio "breaks" option.
// window.BREAKS         = false;

///////////////////////////////////////////////////////////
//
// Repertory variables --

// ERASED_WORK_NAVIGATOR: HTML code for the navigator that can be restored
// if alt-e is pressed twice.
// window.ERASED_WORK_NAVIGATOR = "";

// ERASED_FILEINFO: data structure containing the currently displyed
// work from a repertory.
// window.ERASED_FILEINFO = {};

// window.PAGED = false;

// window.SPREADSHEETSCRIPTID = "";
// window.SPREADSHEETID = "";

// if (localStorage.SPREADSHEETSCRIPTID) {
// 	window.SPREADSHEETSCRIPTID = localStorage.SPREADSHEETSCRIPTID;
// }
// if (localStorage.SPREADSHEETID) {
// 	window.SPREADSHEETID = localStorage.SPREADSHEETID;
// }

//////////////////////////////
//
// menu interaction variables:
//

// window.INPUT_FONT_SIZE = 1.0;   // used to set font-size in #input (1.0rem is the default);

// window.FILEINFO = {};
export let FILEINFO = {};
export function setFileInfo(obj) {
  FILEINFO = obj;
}

//////////////////////////////
//
// MuseData variables --
//

// window.MuseDataBuffer = "";

//////////////////////////////
//
// Ace editor variables -- These are variables to control the Ace editor
//    (https://ace.c9.io), which is the text editor used by VHV.
//

//window.EDITOR: main interface to the ace editor.  This variable is configured in the
// setup.js file.
// window.EDITOR = undefined;
// window.dummyEDITOR;
// EditorModes: list the various setup for colorizing and editing for each of the
// known data format.  The first index is set with the EditorMode variable, and the
// second index is set with the KeyboardMode variable.
// window.EditorModes = {
//   humdrum: {
//     theme: 'ace/theme/humdrum_light',
//   },
//   xml: {
//     theme: 'ace/theme/solarized_light',
//   },
//   musedata: {
//     theme: 'ace/theme/solarized_light',
//   },
// };

// EditorMode: specifies what type of data is present in the text editor.
// Setting this will in turn control which colorizing rules to apply to the
// data.
// Values can be:
//     "humdrum"  for Humdrum data
//     "xml"      for XML data (MEI and MusicXML)
//     "musedata" for XML data (MEI and MusicXML)
//     "mime"     for mime-encoded data
let editorModeData = 'humdrum';
export const editorMode = () => editorModeData;
/**
 *
 * @param {"humdrum"|"xml"|"musedata"} mode
 * @returns {string}
 */
export const setEditorMode = (mode) => {
  if (!['humdrum', 'xml', 'musedata'].includes(mode)) {
    console.log('Invalid editor mode');
    return;
  }
  editorModeData = mode;
  return editorModeData;
};
// window.EditorMode = "humdrum";

//var EditorTheme = "ace/theme/solarized_light";
// window.EditorLine = -1;
// window.TABSIZE = 12;
// // window.DISPLAYTIME = 0;
// window.EDITINGID = null;
// window.SAVEFILENAME = "data.txt";
// window.SPACINGADJUSTMENT = 0.0;

// window.HIGHLIGHTQUERY = null;
// // used to highlight the current note at the location of the cursor.
// window.CursorNote = undefined;

// // RestoreCursorNote: Used to go back to a highlighted note after a redraw.
// // This is an ID string rather than an element.
// window.RestoreCursorNote = undefined;

// window.ERASED_DATA = "";

// window.Actiontime = 0;

// see https://github.com/ajaxorg/ace/wiki/Embedding-API
// Use EditSession instead of BufferedHumdrumFile:
// window.BufferedHumdrumFile = "";
window.Range = function () {
  console.log('Range is undefined');
};

// window.IDS   = [];
// window.ZOOM  = 0.4;
// window.PLAY  = false;
// window.PAUSE = false;

// State variables for interface:
// window.FirstInitialization = false;
// window.InputVisible        = true;
// window.LastInputWidth      = 0;
// window.OriginalClef        = false;
// window.UndoHide            = false;
// window.ApplyZoom           = false;
// window.ShowingIndex        = false;
// window.FreezeRendering     = false;
// window.VrvTitle            = true;

export const global_verovioOptions = {
  GOTOTOPOFNOTATION: false,
  // SCALE: controls the size of the music notation using the verovio "scale" option.
  SCALE: 40,
  // SPACING_STAFF: Set the minimum distance in diatonic steps between staves of music.
  SPACING_STAFF: 12,
  // Need to add a variable SPACING_ADJUST_GROUP to add controls for spacing staff groups.

  // SPACING_SYSTEM: Set the minimum distance in diatonc steps between systems of music.
  // the verovio option justifyVertically may expand from this minimum distance, and
  // musical elements extending outside of this range will also push the systems further
  // apart.
  SPACING_SYSTEM: 18,

  // LYRIC_SIZE: control the relative size of lyrics in the rendered notation.  Units
  // are in terms of diatonic steps (1/2 of the space between staff lines).
  LYRIC_SIZE: 4.5,

  // FONT: controls the musical font used by verovio to render notation.  This is also
  // the font variable used to generate PDF files.
  FONT: 'Leland',

  // BREAKS: controls whether or not verovio should use system/page breaks
  // encoded in the data or decide on its own line breaks.
  //     false means use "auto" breaking method for verovio "breaks" option.
  //     true means use "encoded" breaking method for verovio "breaks" option.
  BREAKS: false,

  ZOOM: 0.4,
};

export const global_editorOptions = {
  INPUT_FONT_SIZE: 1.0, // rem
  EditorLine: -1,
  TABSIZE: 12,
  EDITINGID: null,
  SAVEFILENAME: 'data.txt',
  SPACINGADJUSTMENT: 0.0,
};

export const global_cursor = {
  HIGHLIGHTQUERY: null,
  // used to highlight the current note at the location of the cursor.
  CursorNote: null,
  // RestoreCursorNote: Used to go back to a highlighted note after a redraw.
  // This is an ID string rather than an element.
  RestoreCursorNote: '',
};
window.global_cursor = global_cursor;

export const global_playerOptions = {
  PLAY: false,
  PAUSE: false,
  CURRENTBAR: null
};
window.global_playerOptions = global_playerOptions;

export const global_interface = {
  // State variables for interface:
  InputVisible: false,
  LastInputWidth: 0,
  OriginalClef: false,
  UndoHide: false,
  ApplyZoom: false,
  ShowingIndex: false,
  FreezeRendering: false,
};


//////////////////////////////
//
// Key-code variables for cases in listeners.js:
//
// See also:
//    https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
//    https://keycode.info
//    https://wangchujiang.com/hotkeys
//

// event:             .code           .keyCode   .key (US keyboard)
window.AKey = 'KeyA'; // 65      "A", "a"
window.BKey = 'KeyB'; // 66      "B", "b"
window.CKey = 'KeyC'; // 67      "C", "c"
window.DKey = 'KeyD'; // 68      "D", "d"
window.EKey = 'KeyE'; // 69      "E", "e"
window.FKey = 'KeyF'; // 70      "F", "f"
window.GKey = 'KeyG'; // 71      "G", "g"
window.HKey = 'KeyH'; // 72      "H", "h"
window.IKey = 'KeyI'; // 73      "I", "i"
window.JKey = 'KeyJ'; // 74      "J", "j"
window.KKey = 'KeyK'; // 75      "K", "k"
window.LKey = 'KeyL'; // 76      "L", "l"
window.MKey = 'KeyM'; // 77      "M", "m"
window.NKey = 'KeyN'; // 78      "N", "n"
window.OKey = 'KeyO'; // 79      "O", "o"
window.PKey = 'KeyP'; // 80      "P", "p"
window.QKey = 'KeyQ'; // 81      "Q", "q"
window.RKey = 'KeyR'; // 82      "R", "r"
window.SKey = 'KeyS'; // 83      "S", "s"
window.TKey = 'KeyT'; // 84      "T", "t"
window.UKey = 'KeyU'; // 85      "U", "u"
window.VKey = 'KeyV'; // 86      "V", "v"
window.WKey = 'KeyW'; // 87      "W", "w"
window.XKey = 'KeyX'; // 88      "X", "x"
window.YKey = 'KeyY'; // 89      "Y", "y"
window.ZKey = 'KeyZ'; // 90      "Z", "z"
window.ZeroKey = 'Digit0'; // 48      "0", "("
window.OneKey = 'Digit1'; // 49      "1", "@"
window.TwoKey = 'Digit2'; // 50      "2", "@"
window.ThreeKey = 'Digit3'; // 51      "3", "#"
window.FourKey = 'Digit4'; // 52      "4", "$"
window.FiveKey = 'Digit5'; // 53      "5", "%"
window.SixKey = 'Digit6'; // 54      "6", "^"
window.SevenKey = 'Digit7'; // 55      "7", "&"
window.EightKey = 'Digit8'; // 56      "8", "*"
window.NineKey = 'Digit9'; // 57      "9", "("
// Numpad keys: 0=96 .. 9=105

window.BackKey = 'Backspace'; // 8       "Backspace"
window.BackQuoteKey = 'Backquote'; // 192     "`", "~"
window.BackSlashKey = 'Backslash'; // 220     "\\"
window.CommaKey = 'Comma'; // 188     ",", "<"
window.DeleteKey = 'Delete'; // 46      "Delete"
window.DotKey = 'Period'; // 190     ".", ">"
window.EnterKey = 'Enter'; // 13      "Enter"
window.EscKey = 'Escape'; // 27      "Escape"
window.MinusKey = 'Minus'; // 189     "-", "_"
window.SemiColonKey = 'Semicolon'; // 186     ";", ":"
window.SingleQuoteKey = 'Quote'; // 222     "'", "\""
window.SlashKey = 'Slash'; // 191     "/"
window.SpaceKey = 'Space'; // 32      " "
window.TabKey = 'Tab'; // 9       "Tab"
window.BracketLeftKey = 'BracketLeft'; // 219     "[", "{"
window.BracketRightKey = 'BracketRight'; // 221     "]", "}"
window.EqualKey = 'Equal'; // 187     "=", "+"

window.ControlLeftKey = 'ControlLeft'; // 17      "Control"   event.ctrl
window.ControlRightKey = 'ControlRight'; // 17      "Control"   event.ctrl
window.ShiftLeftKey = 'ShiftLeft'; // 16      "Shift"     event.shift
window.ShiftRightKey = 'ShiftRight'; // 16      "Shift"     event.shift

window.LeftKey = 'ArrowLeft'; // 37      "ArrowLeft"
window.UpKey = 'ArrowUp'; // 38      "ArrowUp"
window.RightKey = 'ArrowRight'; // 39      "ArrowRight"
window.DownKey = 'ArrowDown'; // 40      "ArrowDown"

window.PgUpKey = 'PageUp'; // 33      "PageUp"
window.PgDnKey = 'PageDown'; // 34      "PageDown"
window.EndKey = 'End'; // 35      "End"
window.HomeKey = 'Home'; // 36      "Home"

window.F1Key = 'F1'; // 112     "F1"
window.F2Key = 'F2'; // 113     "F2"
window.F3Key = 'F3'; // 114     "F3"
window.F4Key = 'F4'; // 115     "F4"
window.F5Key = 'F5'; // 116     "F5"
window.F6Key = 'F6'; // 117     "F6"
window.F7Key = 'F7'; // 118     "F7"
window.F8Key = 'F8'; // 119     "F8"
window.F9Key = 'F9'; // 120     "F9"
window.F10Key = 'F10'; // 121     "F10"
window.F11Key = 'F11'; // 122     "F11"
window.F12Key = 'F12'; // 123     "F12"
// etc. to F32Key

//score alignment global variables
window.TEMPO = 200;
window.BEATSPERMEASURE;
window.MEASURENO;
window.PICKUPBEATS;

window.wholeKernTransposed = false;
