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
} from './vhv-scripts/misc.js';
import { loadKernScoresFile } from './vhv-scripts/loading.js';

import { humdrumToSvgOptions } from './vhv-scripts/verovio-options.js';
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

window.MENU = {};

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

  saveTextEditorContents() {
    var event = {};
    event.code = SKey;
    event.altKey = true;
    processInterfaceKeyCommand(event);
  }

  saveHtmlContents() {
    // downloadEditorContentsInHtml();
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
    window.SPACING_STAFF -= 1;
    if (window.SPACING_STAFF < 0) {
      window.SPACING_STAFF = 0;
    }
    displayNotation();
  }

  increaseStaffSpacing() {
    window.SPACING_STAFF += 1;
    if (window.SPACING_STAFF > 24) {
      window.SPACING_STAFF = 24;
    }
    displayNotation();
  }

  decreaseSystemSpacing() {
    window.SPACING_SYSTEM -= 1;
    if (window.SPACING_SYSTEM < 0) {
      window.SPACING_SYSTEM = 0;
    }
    displayNotation();
  }

  increaseSystemSpacing() {
    window.SPACING_SYSTEM += 1;
    if (window.SPACING_SYSTEM > 12) {
      window.SPACING_SYSTEM = 12;
    }
    displayNotation();
  }

  decreaseLyricSize() {
    window.LYRIC_SIZE -= 0.25;
    if (window.LYRIC_SIZE < 2.0) {
      window.LYRIC_SIZE = 2.0;
    }
    displayNotation();
  }

  increaseLyricSize() {
    window.LYRIC_SIZE += 0.25;
    if (window.LYRIC_SIZE > 8.0) {
      window.LYRIC_SIZE = 8.0;
    }
    displayNotation();
  }

  useLeipzigFont() {
    window.FONT = 'Leipzig';
    displayNotation();
  }

  useLelandFont() {
    window.FONT = 'Leland';
    displayNotation();
  }

  usePetalumaFont() {
    window.FONT = 'Petaluma';
    displayNotation();
  }

  useBravuraFont() {
    window.FONT = 'Bravura';
    displayNotation();
  }

  useGootvilleFont() {
    window.FONT = 'Gootville';
    displayNotation();
  }

  applyFilter(filter, data, callback) {
    var contents = '';
    if (!data) {
      contents = editor.getValue().replace(/^\s+|\s+$/g, '');
    } else {
      contents = data.replace(/^\s+|\s+$/g, '');
    }
    var options = humdrumToSvgOptions();
    var data = contents + '\n!!!filter: ' + filter + '\n';
    // window.vrvWorker.filterData(options, data, "humdrum")
    vrvWorker.filterData(options, data, 'humdrum').then(function (newdata) {
      newdata = newdata.replace(/\s+$/m, '');
      var lines = newdata.match(/[^\r\n]+/g);
      for (var i = lines.length - 1; i >= 0; i--) {
        if (lines[i].match(/^!!!Xfilter:/)) {
          lines[i] = '';
          break;
        }
      }
      newdata = '';
      for (var i = 0; i < lines.length; i++) {
        if (lines[i] === '') {
          continue;
        }
        newdata += lines[i] + '\n';
      }
      editor.setValue(newdata, -1);
      if (callback) {
        callback(newdata);
      }
    });
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
    window.TABSIZE = max;
    editor.getSession().setTabSize(window.TABSIZE);
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
    processNotationKey('a', window.CursorNote);
  }

  forceNoteStemDown() {
    processNotationKey('b', window.CursorNote);
  }

  removeStemDirection() {
    processNotationKey('c', window.CursorNote);
  }

  toggleEditorialAccidental() {
    processNotationKey('i', window.CursorNote);
  }

  toggleNaturalAccidental() {
    processNotationKey('n', window.CursorNote);
  }

  toggleSharpAccidental() {
    processNotationKey('#', window.CursorNote);
  }

  toggleFlatAccidental() {
    processNotationKey('-', window.CursorNote);
  }

  toggleForcedDisplay() {
    processNotationKey('X', window.CursorNote);
  }

  toggleStaccato() {
    processNotationKey("'", window.CursorNote);
  }

  toggleMinorLowerMordent() {
    processNotationKey('m', window.CursorNote);
  }

  toggleMajorLowerMordent() {
    processNotationKey('M', window.CursorNote);
  }

  toggleMinorUpperMordent() {
    processNotationKey('w', window.CursorNote);
  }

  toggleMajorUpperMordent() {
    processNotationKey('W', window.CursorNote);
  }

  toggleFermata() {
    processNotationKey(';', window.CursorNote);
  }

  toggleArpeggio() {
    processNotationKey(':', window.CursorNote);
  }

  toggleAccent() {
    processNotationKey('^', window.CursorNote);
  }

  toggleMarcato() {
    processNotationKey('^^', window.CursorNote);
  }

  toggleStaccatissimo() {
    processNotationKey('`', window.CursorNote);
  }

  toggleTenuto() {
    processNotationKey('~', window.CursorNote);
  }

  toggleMajorTrill() {
    processNotationKey('T', window.CursorNote);
  }

  toggleMinorTrill() {
    processNotationKey('t', window.CursorNote);
  }

  forceSlurAbove() {
    processNotationKey('a', window.CursorNote);
  }

  forceSlurBelow() {
    processNotationKey('b', window.CursorNote);
  }

  removeSlurOrientation() {
    processNotationKey('c', window.CursorNote);
  }

  deleteSlur() {
    processNotationKey('D', window.CursorNote);
  }

  forceBeamAbove() {
    processNotationKey('a', window.CursorNote);
  }

  forceBeamBelow() {
    processNotationKey('b', window.CursorNote);
  }

  removeBeamOrientation() {
    processNotationKey('c', window.CursorNote);
  }

  forceTieAbove() {
    processNotationKey('a', window.CursorNote);
  }

  forceTieBelow() {
    processNotationKey('b', window.CursorNote);
  }

  removeTieOrientation() {
    processNotationKey('c', window.CursorNote);
  }

  breakBeamAfterNote() {
    processNotationKey('J', window.CursorNote);
  }

  breakBeamBeforeNote() {
    processNotationKey('L', window.CursorNote);
  }

  makeRestInvisible() {
    processNotationKey('y', window.CursorNote);
  }

  togglePedalDown() {
    processNotationKey('p', window.CursorNote);
  }

  togglePedalUp() {
    processNotationKey('P', window.CursorNote);
  }

  toggleGraceNoteStyle() {
    processNotationKey('q', window.CursorNote);
  }

  toggleAtMark() {
    processNotationKey('@', window.CursorNote);
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

    processNotationKey('s', window.CursorNote);
  }

  nextHarmonicNote() {
    goUpHarmonically(window.CursorNote);
  }

  previousHarmonicNote() {
    goDownHarmonically(window.CursorNote);
  }

  nextMelodicNote() {
    goToNextNoteOrRest(window.CursorNote.id);
  }

  previousMelodicNote() {
    goToPreviousNoteOrRest(window.CursorNote.id);
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
    processNotationKey('transpose-down-step', window.CursorNote);
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
    processNotationKey('transpose-up-step', window.CursorNote);
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
    processNotationKey('transpose-up-octave', window.CursorNote);
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
    processNotationKey('transpose-down-octave', window.CursorNote);
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
      processNotationKey('leftEndMoveBack', window.CursorNote);
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
      processNotationKey('leftEndMoveForward', window.CursorNote);
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
      processNotationKey('rightEndMoveBack', window.CursorNote);
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
      processNotationKey('rightEndMoveForward', window.CursorNote);
    }
  }
  //////////////////////////////
  //
  // MenuInterface::adjustNotationScale -- add or subtract the input value,
  //     not going below 15 or above 500.
  //
  adjustNotationScale(event, number) {
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
      window.INPUT_FONT_SIZE = 1.0;
    } else {
      window.INPUT_FONT_SIZE *= 1.05;
      if (window.INPUT_FONT_SIZE > 3.0) {
        window.INPUT_FONT_SIZE = 3.0;
      }
    }
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = window.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
  }

  resetTextFontSize(event) {
    window.INPUT_FONT_SIZE = 1.0;
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = window.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
  }

  decreaseTextFontSize(event) {
    if (event.shiftKey) {
      window.INPUT_FONT_SIZE = 1.0;
    } else {
      window.INPUT_FONT_SIZE *= 0.95;
      if (window.INPUT_FONT_SIZE < 0.25) {
        window.INPUT_FONT_SIZE = 0.25;
      }
    }
    var element = document.querySelector('#input');
    if (!element) {
      return;
    }
    element.style.fontSize = window.INPUT_FONT_SIZE + 'rem';
    localStorage.INPUT_FONT_SIZE = window.INPUT_FONT_SIZE;
  }

  lineBreaksOff() {
    window.BREAKS = true;
    // toggleLineBreaks();
  }

  lineBreaksOn() {
    window.BREAKS = false;
    // toggleLineBreaks();
  }

  singlePageView() {
    window.PAGED = false;
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

document.addEventListener('DOMContentLoaded', function () {
  window.MENU = new MenuInterface();
  window.MENU.initialize();
});

// function processMenuAton() {
// 	var element = document.querySelector("script#aton-menu-data");
// 	if (!element) {
// 		console.log("Warning: cannot find element script#aton-menu-data");
// 		return;
// 	}
// 	var aton = new window.ATON();
// 	MENUDATA = aton.parse(element.textContent).MENU;
// 	adjustMenu(MENUDATA);

// 	window.DICTIONARY = {};
// 	var MD = MENUDATA.DICTIONARY.ENTRY;
// 	for (var i=0; i<MD.length; i++) {
// 			window.DICTIONARY[MD[i].DEFAULT] = MD[i];
// 	}

// 	// Use handlebars to generate HTML code for menu.

// 	var tsource = document.querySelector("#template-menu").textContent;
// 	var menuTemplate = window.Handlebars.compile(tsource);
// 	var output = menuTemplate(MENUDATA);
// 	var newmenuelement = document.querySelector("#menu-div");

// 	if (newmenuelement) {
// 		newmenuelement.innerHTML = output;
// 		prepareBufferStates();
// 		// if (HIDEINITIALTOOLBAR) {
// 		// 	toggleNavigationToolbar();
// 		// }
// 		// if (HIDEMENUANDTOOLBAR) {
// 		// 	toggleMenuAndToolbarDisplay();
// 		// }
// 		// if (window.HIDEMENU) {
// 		// 	toggleMenuDisplay();
// 		// }

// 	}

// 	// var tsource2 = document.querySelector("#template-toolbar").textContent;
// 	// var toolbarTemplate = window.Handlebars.compile(tsource2);
// 	// var output2 = toolbarTemplate("");
// 	// var toolbarelement = document.querySelector("#toolbar");

// 	// if (newmenuelement && toolbarelement) {
// 	// 	newmenuelement.innerHTML = output;
// 	// 	toolbarelement.innerHTML = output2;
// 	// 	prepareBufferStates();
// 	// 	if (HIDEINITIALTOOLBAR) {
// 	// 		toggleNavigationToolbar();
// 	// 	}
// 	// 	if (HIDEMENUANDTOOLBAR) {
// 	// 		toggleMenuAndToolbarDisplay();
// 	// 	}
// 	// 	if (window.HIDEMENU) {
// 	// 		toggleMenuDisplay();
// 	// 	}
// 	// 	if (!InputVisible) {
// 	// 		// Or do it all of the time.
// 	// 		matchToolbarVisibilityIconToState();
// 	// 	}
// 	// }
// 	// if (TOOLBAR) {
// 	// 	if (TOOLBAR.match(/save/i)) {
// 	// 		chooseToolbarMenu("save");
// 	// 	} else if (TOOLBAR.match(/load/i)) {
// 	// 		chooseToolbarMenu("load");
// 	// 	} else if (TOOLBAR.match(/search/i)) {
// 	// 		chooseToolbarMenu("search");
// 	// 	} else if (TOOLBAR.match(/filter/i)) {
// 	// 		chooseToolbarMenu("filter");
// 	// 	} else {
// 	// 		// toolbar menu 1 is otherwise the default
// 	// 		chooseToolbarMenu(1);
// 	// 	}
// 	// } else if (LASTTOOLBAR) {
// 	// 		// load toolbar from last visit
// 	// 		chooseToolbarMenu(LASTTOOLBAR);
// 	// }
// 	// fillSpreadsheetId();
// }

// function fillSpreadsheetScriptId() {
// 	if (!window.SPREADSHEETSCRIPTID) {
// 		return;
// 	}
// 	var element = document.querySelector("input#scriptid");
// 	if (!element) {
// 		return;
// 	}
// 	var value = window.SPREADSHEETSCRIPTID;
// 	if (window.SPREADSHEETID) {
// 		value += "|" + window.SPREADSHEETID;
// 	}
// 	element.value = value;
// }

// function adjustMenu (object) {
// 	for (var property in object) {
// 		if (object.hasOwnProperty(property)) {
// 			if (property === "RIGHT_TEXT") {
// 				if (!Array.isArray(object[property])) {
// 					object[property] = [ object[property] ];
// 				}
// 			} else if (typeof object[property] == "object") {
// 				adjustMenu(object[property]);
// 			}
// 		}
// 	}
// }

let vrvWorker = getVrvWorker();
if (!vrvWorker) {
  throw new Error('Verovio worker is undefined');
}

let editor = getAceEditor();
if (!editor) {
  throw new Error('Ace Editor is undefined');
}

// $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
//   if (!$(this).next().hasClass('show')) {
//     $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
//   }
//   var $subMenu = $(this).next(".dropdown-menu");
//   $subMenu.toggleClass('show');

//   $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
//     $('.dropdown-submenu .show').removeClass("show");
//   });

//   return false;
// });
