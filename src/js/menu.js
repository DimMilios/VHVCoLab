/* global $ */

//
// menu.js -- functions to interface with the top menu.
//
// vim: ts=3
//

// import { prepareBufferStates } from './vhv-scripts/buffer.js';
import { processInterfaceKeyCommand } from './vhv-scripts/listeners.js';
import {
  displayNotation,
  replaceEditorContentWithHumdrumFile,
  getTextFromEditorNoCsvProcessing,
  toggleHumdrumCsvTsv,
  applyFilterToKern,
} from './vhv-scripts/misc.js';
import { loadKernScoresFile } from './vhv-scripts/loading.js';

import { getVrvWorker } from './humdrum-notation-plugin-worker.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import {
  goDownHarmonically,
  goToNextNoteOrRest,
  goToPreviousNoteOrRest,
  goUpHarmonically,
} from './vhv-scripts/utility-svg.js';

import { trimTabsInEditor } from './vhv-scripts/utility.js';

import { convertToMusicXmlAndSave } from './vhv-scripts/convertToMusicXmlAndSave.js';
import { processNotationKey } from './vhv-scripts/editor.js';
import {
  global_cursor,
  global_editorOptions,
  global_verovioOptions,
} from './vhv-scripts/global-variables.js';
import {
  exportKernToPrivateFiles,
  promptForFile,
  saveContentAsMIDI,
} from './vhv-scripts/file-operations.js';
import { toggleCommentsVisibility } from './bootstrap.js';

class MenuInterface {
  constructor() {
    this.contextualMenus = {};
  }
  initialize() {
    this.contextualMenus = this.getContextualMenus();
  }
  hideContextualMenus() {
    var keys = Object.keys(this.contextualMenus);
    for (var i = 0; i < keys.length; i++) {
      this.contextualMenus[keys[i]].style.display = 'none';
    }
  }
  hideMenus(name) {
    this.hideContextualMenu();
  }
  showMenu(name) {
    this.showContextualMenu(name);
  }
  showContextualMenu(name) {
    var keys = Object.keys(this.contextualMenus);
    for (var i = 0; i < keys.length; i++) {
      if (name === keys[i]) {
        this.contextualMenus[keys[i]].style.display = 'block';
      } else {
        this.contextualMenus[keys[i]].style.display = 'none';
      }
    }
  }
  showCursorNoteMenu(element) {
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

  showComments() {
    // showCommentSection();
    toggleCommentsVisibility(true);
    // updateHandler();
  }

  hideComments() {
    // hideCommentSection();
    toggleCommentsVisibility(false);
    // updateHandler();
  }

  getContextualMenus() {
    var output = {};
    var element = document.querySelector('#navbarNavDropdown');
    if (!element) {
      return output;
    }
    var items = element.querySelectorAll('li.contextual');
    if (!items) {
      return output;
    }
    for (var i = 0; i < items.length; i++) {
      var nameelement = items[i].querySelector('.menu-name');
      if (!nameelement) {
        continue;
      }
      var name = nameelement.textContent.trim();
      output[name] = items[i];
    }

    return output;
  }

  toggleOriginalClefs() {
    var event = {};
    event.code = OKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  displaySvgData() {
    var event = {};
    event.code = GKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  saveSvgData() {
    var event = {};
    event.code = GKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  loadRepertory(repertory, filter) {
    var options = {
      file: repertory,
      next: true,
      previous: true,
    };
    if (filter) {
      options.filter = filter;
    }
    loadKernScoresFile(options);
  }

  loadFromRepository() {
    promptForFile();
  }

  exportToPrivateFiles() {
    exportKernToPrivateFiles();
  }

  openScoreFileFromDisk() {
    var event = {};
    event.code = OKey;
    event.ctrlKey = true;
    processInterfaceKeyCommand(event);
  }

  saveAsMIDI() {
    saveContentAsMIDI();
  }

  saveTextEditorContents() {
    var event = {};
    event.code = SKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  compileEmbeddedFilters() {
    var event = {};
    event.code = CKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  clearEditorContents() {
    var event = {};
    event.code = EKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  showSourceScan() {
    var event = {};
    event.code = PKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  createPdf() {
    var event = {};
    event.code = TKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  reloadFromSource() {
    var event = {};
    event.code = RKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  createPdfPage() {
    var event = {};
    event.code = TKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  increaseNotationSpacing() {
    var event = {};
    event.code = WKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  decreaseNotationSpacing() {
    var event = {};
    event.code = WKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  decreaseStaffSpacing() {
    global_verovioOptions.SPACING_STAFF -= 1;
    if (global_verovioOptions.SPACING_STAFF < 0) {
      global_verovioOptions.SPACING_STAFF = 0;
    }
    displayNotation();
  }

  increaseStaffSpacing() {
    global_verovioOptions.SPACING_STAFF += 1;
    if (global_verovioOptions.SPACING_STAFF > 24) {
      global_verovioOptions.SPACING_STAFF = 24;
    }
    displayNotation();
  }

  decreaseSystemSpacing() {
    global_verovioOptions.SPACING_SYSTEM -= 1;
    if (global_verovioOptions.SPACING_SYSTEM < 0) {
      global_verovioOptions.SPACING_SYSTEM = 0;
    }
    displayNotation();
  }

  increaseSystemSpacing() {
    global_verovioOptions.SPACING_SYSTEM += 1;
    if (global_verovioOptions.SPACING_SYSTEM > 12) {
      global_verovioOptions.SPACING_SYSTEM = 12;
    }
    displayNotation();
  }

  decreaseLyricSize() {
    global_verovioOptions.LYRIC_SIZE -= 0.25;
    if (global_verovioOptions.LYRIC_SIZE < 2.0) {
      global_verovioOptions.LYRIC_SIZE = 2.0;
    }
    displayNotation();
  }

  increaseLyricSize() {
    global_verovioOptions.LYRIC_SIZE += 0.25;
    if (global_verovioOptions.LYRIC_SIZE > 8.0) {
      global_verovioOptions.LYRIC_SIZE = 8.0;
    }
    displayNotation();
  }

  useLeipzigFont() {
    global_verovioOptions.FONT = 'Leipzig';
    displayNotation();
  }

  useLelandFont() {
    global_verovioOptions.FONT = 'Leland';
    displayNotation();
  }

  usePetalumaFont() {
    global_verovioOptions.FONT = 'Petaluma';
    displayNotation();
  }

  useBravuraFont() {
    global_verovioOptions.FONT = 'Bravura';
    displayNotation();
  }

  useGootvilleFont() {
    global_verovioOptions.FONT = 'Gootville';
    displayNotation();
  }

  applyFilter(filter, data, callback, label) {
    applyFilterToKern(filter, data, callback, label);
  }

  insertLocalCommentLine() {
    var event = {};
    event.code = LKey;
    event.shiftKey = true;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  insertNullDataLine() {
    var event = {};
    event.code = DKey;
    event.shiftKey = true;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  insertInterpretationLine() {
    var event = {};
    event.code = IKey;
    event.shiftKey = true;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  insertBarline() {
    var event = {};
    event.code = BKey;
    event.shiftKey = true;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  toggleDataDisplay() {
    var event = {};
    event.code = YKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  toggleToolbarDisplay() {
    // toggleNavigationToolbar();
  }

  toggleLogoDisplay() {
    var event = {};
    event.code = BKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  toggleLayerHighlighting() {
    var event = {};
    event.code = LKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  increaseTabSize() {
    var event = {};
    event.code = DotKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  decreaseTabSize() {
    var event = {};
    event.code = CommaKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  fitTabSizeToData() {
    var lines = editor.getValue().match(/[^\r\n]+/g);
    var max = 4;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\s*$/)) {
        continue;
      }
      if (lines[i].match(/^!/)) {
        // not keeping track of local comments which can be long
        // due to embedded layout commands.
        continue;
      }
      var line = lines[i].split('\t');
      for (var j = 0; j < line.length; j++) {
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
    global_editorOptions.TABSIZE = max;
    editor.getSession().setTabSize(global_editorOptions.TABSIZE);
  }

  openUrl(url, target) {
    if (!target) {
      target = '_blank';
    }
    window.open(url, target);
  }

  toggleCsvTsv() {
    toggleHumdrumCsvTsv();
  }

  toggleVimPlainTextMode() {
    var event = {};
    event.code = VKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  displayHumdrumData() {
    var event = {};
    event.code = HKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  displayMeiData() {
    var event = {};
    event.code = MKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  loadFromBuffer(bufferNumber) {
    var event = {};
    switch (bufferNumber) {
      case 0:
        event.code = ZeroKey;
        break;
      case 1:
        event.code = OneKey;
        break;
      case 2:
        event.code = TwoKey;
        break;
      case 3:
        event.code = ThreeKey;
        break;
      case 4:
        event.code = FourKey;
        break;
      case 5:
        event.code = FiveKey;
        break;
      case 6:
        event.code = SixKey;
        break;
      case 7:
        event.code = SevenKey;
        break;
      case 8:
        event.code = EightKey;
        break;
      case 9:
        event.code = NineKey;
        break;
      default:
        console.log('UNKNOWN BUFFER:', bufferNumber);
        return;
    }
    event.altKey = true;
    processInterfaceKeyCommand(event);

    event.code = RKey;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  saveToBuffer(bufferNumber) {
    var event = {};

    // First store the buffer number in the number register:
    switch (bufferNumber) {
      case 0:
        event.code = ZeroKey;
        break;
      case 1:
        event.code = OneKey;
        break;
      case 2:
        event.code = TwoKey;
        break;
      case 3:
        event.code = ThreeKey;
        break;
      case 4:
        event.code = FourKey;
        break;
      case 5:
        event.code = FiveKey;
        break;
      case 6:
        event.code = SixKey;
        break;
      case 7:
        event.code = SevenKey;
        break;
      case 8:
        event.code = EightKey;
        break;
      case 9:
        event.code = NineKey;
        break;
      default:
        console.log('UNKNOWN BUFFER:', bufferNumber);
        return;
    }

    event.altKey = true;
    processInterfaceKeyCommand(event);

    // Now run the save buffer command:
    event.code = SKey;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  goToLastPage(event) {
    if (!event) {
      event = {};
    }
    event.code = EndKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  goToFirstPage(event) {
    if (!event) {
      event = {};
    }
    event.code = HomeKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  goToPreviousWork(event) {
    if (!event) {
      event = {};
    }
    event.code = LeftKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  goToNextWork() {
    var event = {};
    event.code = RightKey;
    event.altKey = true;
    event.shiftKey = true;
    processInterfaceKeyCommand(event);
  }

  goToNextPage(event) {
    if (!event) {
      event = {};
    }
    event.code = RightKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  goToPreviousPage(event) {
    if (!event) {
      event = {};
    }
    event.code = LeftKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  toggleMidiPlayback() {
    var event = {};
    event.code = SpaceKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  toggleNotationFreezing() {
    var event = {};
    event.code = FKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  forceNoteStemUp() {
    processNotationKey('a', global_cursor.CursorNote);
  }

  forceNoteStemDown() {
    processNotationKey('b', global_cursor.CursorNote);
  }

  removeStemDirection() {
    processNotationKey('c', global_cursor.CursorNote);
  }

  toggleEditorialAccidental() {
    processNotationKey('i', global_cursor.CursorNote);
  }

  toggleNaturalAccidental() {
    processNotationKey('n', global_cursor.CursorNote);
  }

  toggleSharpAccidental() {
    processNotationKey('#', global_cursor.CursorNote);
  }

  toggleFlatAccidental() {
    processNotationKey('-', global_cursor.CursorNote);
  }

  toggleForcedDisplay() {
    processNotationKey('X', global_cursor.CursorNote);
  }

  toggleStaccato() {
    processNotationKey("'", global_cursor.CursorNote);
  }

  toggleMinorLowerMordent() {
    processNotationKey('m', global_cursor.CursorNote);
  }

  toggleMajorLowerMordent() {
    processNotationKey('M', global_cursor.CursorNote);
  }

  toggleMinorUpperMordent() {
    processNotationKey('w', global_cursor.CursorNote);
  }

  toggleMajorUpperMordent() {
    processNotationKey('W', global_cursor.CursorNote);
  }

  toggleFermata() {
    processNotationKey(';', global_cursor.CursorNote);
  }

  toggleArpeggio() {
    processNotationKey(':', global_cursor.CursorNote);
  }

  toggleAccent() {
    processNotationKey('^', global_cursor.CursorNote);
  }

  toggleMarcato() {
    processNotationKey('^^', global_cursor.CursorNote);
  }

  toggleStaccatissimo() {
    processNotationKey('`', global_cursor.CursorNote);
  }

  toggleTenuto() {
    processNotationKey('~', global_cursor.CursorNote);
  }

  toggleMajorTrill() {
    processNotationKey('T', global_cursor.CursorNote);
  }

  toggleMinorTrill() {
    processNotationKey('t', global_cursor.CursorNote);
  }

  forceSlurAbove() {
    processNotationKey('a', global_cursor.CursorNote);
  }

  forceSlurBelow() {
    processNotationKey('b', global_cursor.CursorNote);
  }

  removeSlurOrientation() {
    processNotationKey('c', global_cursor.CursorNote);
  }

  deleteSlur() {
    processNotationKey('D', global_cursor.CursorNote);
  }

  forceBeamAbove() {
    processNotationKey('a', global_cursor.CursorNote);
  }

  forceBeamBelow() {
    processNotationKey('b', global_cursor.CursorNote);
  }

  removeBeamOrientation() {
    processNotationKey('c', global_cursor.CursorNote);
  }

  forceTieAbove() {
    processNotationKey('a', global_cursor.CursorNote);
  }

  forceTieBelow() {
    processNotationKey('b', global_cursor.CursorNote);
  }

  removeTieOrientation() {
    processNotationKey('c', global_cursor.CursorNote);
  }

  breakBeamAfterNote() {
    processNotationKey('J', global_cursor.CursorNote);
  }

  breakBeamBeforeNote() {
    processNotationKey('L', global_cursor.CursorNote);
  }

  makeRestInvisible() {
    processNotationKey('y', global_cursor.CursorNote);
  }

  togglePedalDown() {
    processNotationKey('p', global_cursor.CursorNote);
  }

  togglePedalUp() {
    processNotationKey('P', global_cursor.CursorNote);
  }

  toggleGraceNoteStyle() {
    processNotationKey('q', global_cursor.CursorNote);
  }

  toggleAtMark() {
    processNotationKey('@', global_cursor.CursorNote);
  }

  addSlur(number) {
    if (number < 10 && number > 1) {
      var event = {};

      // First store the buffer number in the number register:
      switch (bufferNumber) {
        case 0:
          event.code = ZeroKey;
          break;
        case 1:
          event.code = OneKey;
          break;
        case 2:
          event.code = TwoKey;
          break;
        case 3:
          event.code = ThreeKey;
          break;
        case 4:
          event.code = FourKey;
          break;
        case 5:
          event.code = FiveKey;
          break;
        case 6:
          event.code = SixKey;
          break;
        case 7:
          event.code = SevenKey;
          break;
        case 8:
          event.code = EightKey;
          break;
        case 9:
          event.code = NineKey;
          break;
        default:
          console.log('UNKNOWN BUFFER:', bufferNumber);
          return;
      }

      event.altKey = true;
      processInterfaceKeyCommand(event);
    }

    processNotationKey('s', global_cursor.CursorNote);
  }

  nextHarmonicNote() {
    goUpHarmonically(global_cursor.CursorNote);
  }

  previousHarmonicNote() {
    goDownHarmonically(global_cursor.CursorNote);
  }

  nextMelodicNote() {
    goToNextNoteOrRest(global_cursor.CursorNote.id);
  }

  previousMelodicNote() {
    goToPreviousNoteOrRest(global_cursor.CursorNote.id);
  }

  pitchDownStep(number) {
    if (number < 10 && number > 1) {
      var event = {};

      // First store the buffer number in the number register:
      switch (bufferNumber) {
        case 0:
          event.code = ZeroKey;
          break;
        case 1:
          event.code = OneKey;
          break;
        case 2:
          event.code = TwoKey;
          break;
        case 3:
          event.code = ThreeKey;
          break;
        case 4:
          event.code = FourKey;
          break;
        case 5:
          event.code = FiveKey;
          break;
        case 6:
          event.code = SixKey;
          break;
        case 7:
          event.code = SevenKey;
          break;
        case 8:
          event.code = EightKey;
          break;
        case 9:
          event.code = NineKey;
          break;
        default:
          console.log('UNKNOWN BUFFER:', bufferNumber);
          return;
      }

      event.altKey = true;
      processInterfaceKeyCommand(event);
    }
    processNotationKey('transpose-down-step', global_cursor.CursorNote);
  }

  pitchUpStep(number) {
    if (number < 10 && number > 1) {
      var event = {};

      // First store the buffer number in the number register:
      switch (bufferNumber) {
        case 0:
          event.code = ZeroKey;
          break;
        case 1:
          event.code = OneKey;
          break;
        case 2:
          event.code = TwoKey;
          break;
        case 3:
          event.code = ThreeKey;
          break;
        case 4:
          event.code = FourKey;
          break;
        case 5:
          event.code = FiveKey;
          break;
        case 6:
          event.code = SixKey;
          break;
        case 7:
          event.code = SevenKey;
          break;
        case 8:
          event.code = EightKey;
          break;
        case 9:
          event.code = NineKey;
          break;
        default:
          console.log('UNKNOWN BUFFER:', bufferNumber);
          return;
      }

      event.altKey = true;
      processInterfaceKeyCommand(event);
    }
    processNotationKey('transpose-up-step', global_cursor.CursorNote);
  }

  pitchUpOctave(number) {
    if (number < 10 && number > 1) {
      var event = {};

      // First store the buffer number in the number register:
      switch (bufferNumber) {
        case 0:
          event.code = ZeroKey;
          break;
        case 1:
          event.code = OneKey;
          break;
        case 2:
          event.code = TwoKey;
          break;
        case 3:
          event.code = ThreeKey;
          break;
        case 4:
          event.code = FourKey;
          break;
        case 5:
          event.code = FiveKey;
          break;
        case 6:
          event.code = SixKey;
          break;
        case 7:
          event.code = SevenKey;
          break;
        case 8:
          event.code = EightKey;
          break;
        case 9:
          event.code = NineKey;
          break;
        default:
          console.log('UNKNOWN BUFFER:', bufferNumber);
          return;
      }

      event.altKey = true;
      processInterfaceKeyCommand(event);
    }
    processNotationKey('transpose-up-octave', global_cursor.CursorNote);
  }

  pitchDownOctave(number) {
    if (number < 10 && number > 1) {
      var event = {};

      // First store the buffer number in the number register:
      switch (bufferNumber) {
        case 0:
          event.code = ZeroKey;
          break;
        case 1:
          event.code = OneKey;
          break;
        case 2:
          event.code = TwoKey;
          break;
        case 3:
          event.code = ThreeKey;
          break;
        case 4:
          event.code = FourKey;
          break;
        case 5:
          event.code = FiveKey;
          break;
        case 6:
          event.code = SixKey;
          break;
        case 7:
          event.code = SevenKey;
          break;
        case 8:
          event.code = EightKey;
          break;
        case 9:
          event.code = NineKey;
          break;
        default:
          console.log('UNKNOWN BUFFER:', bufferNumber);
          return;
      }

      event.altKey = true;
      processInterfaceKeyCommand(event);
    }
    processNotationKey('transpose-down-octave', global_cursor.CursorNote);
  }

  moveSlurStart(number) {
    if (number < 0) {
      if (number < 10 && number > 1) {
        number = -number;
        var event = {};

        // First store the buffer number in the number register:
        switch (bufferNumber) {
          case 0:
            event.code = ZeroKey;
            break;
          case 1:
            event.code = OneKey;
            break;
          case 2:
            event.code = TwoKey;
            break;
          case 3:
            event.code = ThreeKey;
            break;
          case 4:
            event.code = FourKey;
            break;
          case 5:
            event.code = FiveKey;
            break;
          case 6:
            event.code = SixKey;
            break;
          case 7:
            event.code = SevenKey;
            break;
          case 8:
            event.code = EightKey;
            break;
          case 9:
            event.code = NineKey;
            break;
          default:
            console.log('UNKNOWN BUFFER:', bufferNumber);
            return;
        }

        event.altKey = true;
        processInterfaceKeyCommand(event);
      }
      processNotationKey('leftEndMoveBack', global_cursor.CursorNote);
    } else {
      if (number < 10 && number > 1) {
        var event = {};

        // First store the buffer number in the number register:
        switch (bufferNumber) {
          case 0:
            event.code = ZeroKey;
            break;
          case 1:
            event.code = OneKey;
            break;
          case 2:
            event.code = TwoKey;
            break;
          case 3:
            event.code = ThreeKey;
            break;
          case 4:
            event.code = FourKey;
            break;
          case 5:
            event.code = FiveKey;
            break;
          case 6:
            event.code = SixKey;
            break;
          case 7:
            event.code = SevenKey;
            break;
          case 8:
            event.code = EightKey;
            break;
          case 9:
            event.code = NineKey;
            break;
          default:
            console.log('UNKNOWN BUFFER:', bufferNumber);
            return;
        }

        event.altKey = true;
        processInterfaceKeyCommand(event);
      }
      processNotationKey('leftEndMoveForward', global_cursor.CursorNote);
    }
  }

  moveSlurEnd(number) {
    if (number < 0) {
      number = -number;
      if (number < 10 && number > 1) {
        var event = {};

        // First store the buffer number in the number register:
        switch (bufferNumber) {
          case 0:
            event.code = ZeroKey;
            break;
          case 1:
            event.code = OneKey;
            break;
          case 2:
            event.code = TwoKey;
            break;
          case 3:
            event.code = ThreeKey;
            break;
          case 4:
            event.code = FourKey;
            break;
          case 5:
            event.code = FiveKey;
            break;
          case 6:
            event.code = SixKey;
            break;
          case 7:
            event.code = SevenKey;
            break;
          case 8:
            event.code = EightKey;
            break;
          case 9:
            event.code = NineKey;
            break;
          default:
            console.log('UNKNOWN BUFFER:', bufferNumber);
            return;
        }

        event.altKey = true;
        processInterfaceKeyCommand(event);
      }
      processNotationKey('rightEndMoveBack', global_cursor.CursorNote);
    } else {
      if (number < 10 && number > 1) {
        var event = {};

        // First store the buffer number in the number register:
        switch (bufferNumber) {
          case 0:
            event.code = ZeroKey;
            break;
          case 1:
            event.code = OneKey;
            break;
          case 2:
            event.code = TwoKey;
            break;
          case 3:
            event.code = ThreeKey;
            break;
          case 4:
            event.code = FourKey;
            break;
          case 5:
            event.code = FiveKey;
            break;
          case 6:
            event.code = SixKey;
            break;
          case 7:
            event.code = SevenKey;
            break;
          case 8:
            event.code = EightKey;
            break;
          case 9:
            event.code = NineKey;
            break;
          default:
            console.log('UNKNOWN BUFFER:', bufferNumber);
            return;
        }

        event.altKey = true;
        processInterfaceKeyCommand(event);
      }
      processNotationKey('rightEndMoveForward', global_cursor.CursorNote);
    }
  }
  //////////////////////////////
  //
  // MenuInterface::adjustNotationScale -- add or subtract the input value,
  //     not going below 15 or above 500.
  //
  adjustNotationScale(event, number) {
    if (event && event.shiftKey) {
      global_verovioOptions.SCALE = 40;
    } else {
      global_verovioOptions.SCALE = parseInt(
        global_verovioOptions.SCALE * number + 0.5
      );
      if (global_verovioOptions.SCALE < 15) {
        global_verovioOptions.SCALE = 15;
      } else if (global_verovioOptions.SCALE > 500) {
        global_verovioOptions.SCALE = 500;
      }
    }
    localStorage.SCALE = global_verovioOptions.SCALE;

    displayNotation();
  }

  // setLanguage(lang) {
  // 	window.LANGUAGE = lang;

  // 	// Use handlebars to generate HTML code for menu.
  // 	var tsource = document.querySelector("#template-menu").textContent;
  // 	var menuTemplate = window.Handlebars.compile(tsource);
  // 	var output = menuTemplate(MENUDATA);
  // 	var newmenuelement = document.querySelector("#menu-div");
  // 	if (newmenuelement) {
  // 		newmenuelement.innerHTML = output;
  // 	}
  // }

  increaseTextFontSize(event) {
    if (event.shiftKey) {
      global_editorOptions.INPUT_FONT_SIZE = 1.0;
    } else {
      global_editorOptions.INPUT_FONT_SIZE *= 1.05;
      if (global_editorOptions.INPUT_FONT_SIZE > 3.0) {
        global_editorOptions.INPUT_FONT_SIZE = 3.0;
      }
    }
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = global_editorOptions.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = global_editorOptions.INPUT_FONT_SIZE;
  }

  resetTextFontSize(event) {
    global_editorOptions.INPUT_FONT_SIZE = 1.0;
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = global_editorOptions.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = global_editorOptions.INPUT_FONT_SIZE;
  }

  decreaseTextFontSize(event) {
    if (event.shiftKey) {
      global_editorOptions.INPUT_FONT_SIZE = 1.0;
    } else {
      global_editorOptions.INPUT_FONT_SIZE *= 0.95;
      if (global_editorOptions.INPUT_FONT_SIZE < 0.25) {
        global_editorOptions.INPUT_FONT_SIZE = 0.25;
      }
    }
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = global_editorOptions.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = global_editorOptions.INPUT_FONT_SIZE;
  }

  lineBreaksOff() {
    global_verovioOptions.BREAKS = true;
    // toggleLineBreaks();
  }

  lineBreaksOn() {
    global_verovioOptions.BREAKS = false;
    // toggleLineBreaks();
  }

  singlePageView() {
    var element = document.querySelector('#page-nav');
    if (element) {
      element.style.display = 'none';
    }
    var element2 = document.querySelector('#multi-page');
    if (element2) {
      element2.style.display = 'block';
    }
    displayNotation();
  }

  multiPageView() {
    return; // disabled until fix for issue https://github.com/rism-digital/verovio/issues/2034
    window.PAGED = true;
    var element = document.querySelector('#page-nav');
    if (element) {
      element.style.display = 'block';
    }
    var element2 = document.querySelector('#multi-page');
    if (element2) {
      element2.style.display = 'none';
    }
    displayNotation();
  }

  startSplit(count) {
    if (!count) {
      count = 32;
    }
    MenuInterface.prototype.removeSplits();
    var lines = editor.getValue().match(/[^\r\n]+/g);
    var position = editor.getCursorPosition();
    var output;
    var counter = 0;
    var adjust = 0;
    var change = 0;
    var i;
    for (i = 0; i < lines.length; i++) {
      if (lines[i].match(/^=/)) {
        counter++;
        if (counter == count) {
          lines[i] = '!!ignore\n' + lines[i];
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
    var output = '';
    for (i = 0; i < lines.length; i++) {
      output += lines[i] + '\n';
    }
    editor.setValue(output, -1);
    position.row += adjust;
    editor.moveCursorToPosition(position);
  }

  nextSplit(count) {
    if (!count) {
      count = 32;
    }
    var lines = editor.getValue().match(/[^\r\n]+/g);
    var position = editor.getCursorPosition();
    if (lines.length == 0) {
      return;
    }
    var i;
    var adjust = 0;
    var changed = 0;
    var startpos = -1;
    var counter = 0;
    for (i = 1; i < lines.length; i++) {
      if (lines[i] === '!!Xignore') {
        lines[i] = 'XXX DELETE XXX';
        changed = 1;
        continue;
      } else if (lines[i] === '!!ignore') {
        lines[i] = '!!Xignore';
        changed = 1;
        startpos = i;
        break;
      }
    }
    if (!changed) {
      return;
    }
    // mark count measures later with !!ignore
    for (i = startpos + 1; i < lines.length; i++) {
      if (lines[i].match(/^=/)) {
        counter++;
        if (counter == count) {
          lines[i] = '!!ignore\n' + lines[i];
          if (i > lines.row) {
            adjust++;
          }
          // Was declared global
          var change = 1;
          break;
        }
      }
    }
    if (lines[0] !== '!!ignore') {
      lines[0] = '!!ignore\n' + lines[0];
      adjust++;
    }
    var output = '';
    for (i = 0; i < lines.length; i++) {
      if (lines[i] === 'XXX DELETE XXX') {
        continue;
      }
      output += lines[i] + '\n';
    }
    editor.setValue(output, -1);
    position.row += adjust;
    editor.moveCursorToPosition(position);
  }

  previousSplit(count) {
    if (!count) {
      count = 32;
    }
    var lines = editor.getValue().match(/[^\r\n]+/g);
    var position = editor.getCursorPosition();
    if (lines.length == 0) {
      return;
    }
    var i;
    var adjust = 0;
    var changed = 0;
    var startpos = -1;
    var counter = 0;
    for (i = 1; i < lines.length; i++) {
      if (lines[i] === '!!Xignore') {
        lines[i] = '!!ignore';
        changed = 1;
        startpos = i;
      } else if (lines[i] === '!!ignore') {
        lines[i] = 'XXX DELETE XXX';
      }
    }
    if (!changed) {
      return;
    }

    // mark count measures later with !!ignore
    for (i = startpos - 2; i > 0; i--) {
      if (lines[i].match(/^=/)) {
        counter++;
        if (counter == count - 1) {
          lines[i] = '!!Xignore\n' + lines[i];
          if (i > lines.row) {
            adjust++;
          }
          // Was declared global
          var change = 1;
          break;
        }
      }
    }
    if (lines[0] !== '!!ignore') {
      lines[0] = '!!ignore\n' + lines[0];
      adjust++;
    }
    var output = '';
    for (i = 0; i < lines.length; i++) {
      if (lines[i] === 'XXX DELETE XXX') {
        continue;
      }
      output += lines[i] + '\n';
    }
    editor.setValue(output, -1);
    position.row += adjust;
    editor.moveCursorToPosition(position);
  }

  removeSplits() {
    var lines = editor.getValue().match(/[^\r\n]+/g);
    var output = '';
    var position = editor.getCursorPosition();
    var row = position.row;
    var col = position.column;
    var change = 0;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] === '!!ignore') {
        if (i < row) {
          row--;
        }
        change++;
        continue;
      }
      if (lines[i] === '!!Xignore') {
        if (i < row) {
          row--;
        }
        change++;
        continue;
      }
      output += lines[i] + '\n';
    }
    if (change) {
      editor.setValue(output, -1);
      position.row = row;
      editor.moveCursorToPosition(position);
    }
  }

  undo() {
    editor.undo();
  }

  convertToHumdrum() {
    replaceEditorContentWithHumdrumFile();
  }

  trimTabsInEditor() {
    trimTabsInEditor();
  }

  mimeEncode() {
    var text = getTextFromEditorNoCsvProcessing();
    var lines = btoa(text).match(/.{1,80}/g);
    var output = '';
    for (var i = 0; i < lines.length; i++) {
      if (i < lines.length - 1) {
        output += lines[i] + '\n';
      } else {
        output += lines[i].replace(/=/g, '') + '\n';
      }
    }
    editor.setValue(output, -1);
  }

  mimeDecode() {
    var text = getTextFromEditorNoCsvProcessing();
    // text is already decoded by getTextFromEditor().
    editor.setValue(text, -1);
  }

  convertToMusicXmlAndSave() {
    convertToMusicXmlAndSave();
  }
}

let menuInterface;
export function getMenu() {
  if (typeof menuInterface === 'undefined') {
    menuInterface = new MenuInterface();
    menuInterface.initialize();
  }

  return menuInterface;
}

let vrvWorker = getVrvWorker();
if (!vrvWorker) {
  throw new Error('Verovio worker is undefined');
}

let editor = getAceEditor();
if (!editor) {
  throw new Error('Ace Editor is undefined');
}
