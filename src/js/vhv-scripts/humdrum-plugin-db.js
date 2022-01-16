//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/HumdrumNotationPluginEntry.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains the HumdrumNotationPluginEntry class for
// the Humdrum notation plugin.  This class is the used to store
// options and elements for each notation example on a webpage.
//

//////////////////////////////
//
// HumdrumNotationPluginEntry::initializer --
//

function HumdrumNotationPluginEntry(baseid, opts) {
  this.baseId = baseid;
  if (opts instanceof Object) {
    this.options = cloneObject(opts);
  } else {
    this.options = {}; // storage for options (both HNP and Verovio);
  }

  // Primary HTML elements related to entry:
  this.container = null; // container element for notation
  this.humdrum = null; // storage for Humdrum data
  this.svg = null; // storage for SVG image
  this.humdrumOutput = null; // storage for Humdrum after filtering to create SVG image
  this.pages = []; // storage buffer for SVG of each page (multi-page examples)

  return this;
}

//////////////////////////////
//
// HumdrumNotationPluginEntry::convertFunctionNamesToRealFunctions --
//

HumdrumNotationPluginEntry.prototype.convertFunctionNamesToRealFunctions =
  function () {
    if (!this.options) {
      console.log('Error: options not defined in entry:', this);
      return;
    }
    if (this.options.postFunction) {
      if (typeof this.options.postFunction === 'string') {
        if (
          {}.toString.call(this.options.postFunction) === '[object Function]'
        ) {
          this.options.postFunction = functionName(this.options.postFunction);
        }
      }
    }
  };

//////////////////////////////
//
// HumdruNotationPluginEntry::createContainer -- Create a target location
//     for the Humdrum notation content.  First check if there is an element
//     with the given ID, and return that element if it exists.  If it does not
//     exist, then create a div element with the given containerid used as the
//     ID for the div.

HumdrumNotationPluginEntry.prototype.createContainer = function () {
  if (this.container) {
    console.log('Error: container already initialize:', this.container);
  }
  var container = document.querySelector('#' + this.baseId + '-container');
  if (container) {
    // Recycle this container for use with the plugin.  Typically the
    // container is predefined to reserve vertical space for the notation
    // that will be placed inside of it.
    this.container = container;
  } else {
    // the container needs to be created, and it will be placed
    // just above the source script.

    var target = document.querySelector('#' + this.baseId);
    if (!target) {
      console.log(
        'Error: need a target to place container before:',
        this.baseId
      );
      return null;
    }
    this.container = document.createElement('div');
    this.container.id = this.baseId + '-container';
    target.parentNode.insertBefore(this.container, target);
  }
  this.container.className = 'humdrum-notation-plugin';
  return this.container;
};

//////////////////////////////
//
// HumdrumNotationPluginEntry::copyContentToContainer --
//

HumdrumNotationPluginEntry.prototype.copyContentToContainer = function () {
  if (!this.options) {
    console.log('Error: options required for entry:', this);
    return;
  }
  if (!this.options.source) {
    console.log('Error: Source property required for options:', this.options);
    return;
  }

  if (!this.humdrum) {
    console.log('Error: Humdrum container target not initialized:', this);
    return;
  }

  var source = document.querySelector('#' + this.options.source);

  if (!source) {
    console.log('Error: No Humdrum source for', this.baseId);

    console.log('ID that is empty:', this.options.source);

    return;
  }
  if (!this.container) {
    console.log('Error: No container for storing data from ID', this.baseId);
    return;
  }
  var content = source.textContent.trim();

  var initial = content.substr(0, 600);
  // Probably use the real plugin options here later:
  var poptions = {};
  var options;
  /*
	if (initial.match(/^\s*</)) {
		// some sort of XML junk, so convert to Humdrum
		var ctype = "unknown";
		if (initial.match(/<mei /)) {
			ctype = "mei";
		} else if (initial.match(/<mei>/)) {
			ctype = "mei";
		} else if (initial.match(/<music>/)) {
			ctype = "mei";
		} else if (initial.match(/<music /)) {
			ctype = "mei";
		} else if (initial.match(/<pages>/)) {
			ctype = "mei";
		} else if (initial.match(/<pages /)) {
			ctype = "mei";
		} else if (initial.match(/<score-partwise>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-timewise>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<opus>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-partwise /)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-timewise /)) {
			ctype = "musicxml";
		} else if (initial.match(/<opus /)) {
			ctype = "musicxml";
		}
		if (ctype === "musicxml") {
			// convert MusicXML data into Humdrum data
			options = {
				inputFrom: "musicxml-hum"
			};
			
			convertMusicXmlToHumdrum(this.humdrum, content, options, poptions);
			
		} else if (ctype === "mei") {
			// convert MEI data into Humdrum data
			options = {
				inputFrom: "mei-hum"
			};
			
			convertMeiToHumdrum(this.humdrum, content, options, poptions);
			
		} else {
			console.log("Warning: given some strange XML data:", content);
		}
*/

  //	} else {
  this.humdrum.textContent = content;
  //	}
};

//////////////////////////////
//
// HumdrumNotationPluginEntry::initializeContainer --  Generate contents for
//      the main humdrum-plugin div that is used to hold the verovio options,
//      the input humdrum text and the output verovio SVG image.
//
// The main container is a div element with an ID that matches the ID of the
// source Humdrum data script followed by an optional variant tag and then
// the string "-container".
//
// Inside the main target div there are two elements of interest:
//    (1) a div element with an similar ID that ends in "-options" rather
//        than "-container".
//    (2) a table element that contains the potentially visible Humdrum text
//        that create the SVG image in one cell, and another cell that contains
//        the SVG rendering of the Humdrum data.
//
//        The Humdrum data is stored within a pre element (may be changed later)
//        that has an ID in the form of the container div, but with "-humdrum" as
//        the extension for the ID.
//
//        The SVG image is stored in a div that has an ID that is similar to the
//        containing element, but has "-svg" as an extension rather than "-container".
//
// How the humdrum and svg containers are stored in the table will be dependend on how
// the layout of the two elements are set, with the Humdrum data either above, below,
// to the left or two the right of the SVG image.
//
// So a typical organization of the resulting code from this function might be:
//
// <div class="humdrum-plugin" id="bach-container">
//    <div id="bach-options">[Options for rendering with verovio]</div>
//    <table class="humdrum-verovio">
//       <tbody>
//       <tr>
//          <td>
//          <div>
//             <script type="text/x-humdrum" class="humdrum-notation-plugin" id="bach-humdrum">[Humdrum contents]</text>
//          </div>
//          </td>
//          <td>
//             <div class="verovio-svg" id="bach-svg">[SVG image of music notation]</div>
//          </td>
//       </tr>
//       </tbody>
//    </table>
// </div>
//
// Also notice the class names which can be used for styling the notation or humdrum text:
//    humdrum-plugin  == The main div container for the musical example.
//    humdrum-verovio == The class name of the table that contains the humdrum and rendered svg.
//    humdrum-text    == The potentially visible Humdrum text for the example.
//    verovio-svg     == The div container that holes the verovio-generated SVG image.
//

HumdrumNotationPluginEntry.prototype.initializeContainer = function () {
  if (!this.container) {
    console.log('Error: Container must first be created:', this);
    return;
  }

  var output = '';
  var hvisible = false;
  if (
    this.options['humdrumVisible'] === 'true' ||
    this.options['humdrumVisible'] === true ||
    this.options['humdrumVisible'] === 1
  ) {
    hvisible = true;
  }

  output += "<table class='humdrum-verovio'";
  output += " style='border:0; border-collapse:collapse;'";
  output += '>\n';
  output += '   <tbody>\n';
  output += "   <tr style='border:0' valign='top'>\n";
  if (hvisible) {
    output += '<td';
    if (this.options['humdrumMinWidth']) {
      output +=
        " style='border:0; min-width: " +
        this.options['humdrumMinWidth'] +
        ";'";
    } else {
      output += " style='border:0;'";
    }
    output += '>\n';
  } else {
    output += "<td style='border:0; display:none;'>\n";
  }

  output += '<div>\n';
  output +=
    "<script type='text/x-humdrum' style='display:none;' class='humdrum-text'";
  output += " contenteditable='true' id='";
  output += this.baseId + "-humdrum'></script>\n";
  output += '</div>\n';
  output += '</td>\n';

  output += "<td style='border:0;'>\n";
  output += "<div class='verovio-svg'";
  output += " id='" + this.baseId + "-svg'></div>\n";
  output += '</td>\n';
  output += '</tr>\n';
  output += '</tbody>\n';
  output += '</table>\n';

  var oldcontent = this.container.innerHTML;
  this.container.innerHTML = output;

  this.humdrum = this.container.querySelector('#' + this.baseId + '-humdrum');
  this.svg = this.container.querySelector('#' + this.baseId + '-svg');
  // Move any previous content to the svg container.  This may contain
  // a pre-image that needs to be preserved a little longer so that the
  // final SVG image can be calculated.
  this.svg.innerHTML = oldcontent;
};

//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/HumdrumNotationPluginDatabase.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains the HumdrumNotationPluginDatabase class for
// the Humdrum notation plugin.  This class is the main database for
// keeping track of options and locations of examples on a webpage.
//

//////////////////////////////
//
// HumdrumNotationPluginDatabase::prepareOptions --
//

HumdrumNotationPluginDatabase.prototype.prepareOptions = function () {
  var list = this.verovioOptions.OPTION;
  for (var i = 0; i < list.length; i++) {
    if (list[i].CLI_ONLY) {
      continue;
    }
    this.verovioOptions[list[i].NAME] = list[i];
  }
};

HumdrumNotationPluginDatabase.prototype.verovioOptions = {
  OPTION: [
    {
      NAME: 'help',
      ABBR: '?',
      INFO: 'Display help message.',
      ARG: 'boolean',
      CLI_ONLY: 'true',
    },
    {
      NAME: 'allPages',
      ABBR: 'a',
      INFO: 'Output all pages.',
      ARG: 'boolean',
      CLI_ONLY: 'true?',
    },
    {
      NAME: 'inputFrom',
      ABBR: 'f',
      INFO: 'Select input data type.',
      ARG: 'string',
      DEF: 'mei',
      ALT: ['auto', 'darms', 'pae', 'xml', 'humdrum', 'humdrum-xml'],
      CLI_ONLY: 'true?',
    },
    {
      NAME: 'outfile',
      ABBR: 'o',
      INFO: 'Output file name (use "-" for standard output).',
      ARG: 'string',
      CLI_ONLY: 'true',
    },
    {
      NAME: 'page',
      ABBR: 'p',
      INFO: 'Select the page to engrave.',
      ARG: 'integer',
      DEF: '1',
      MIN: '1',
      CLI_ONLY: 'true',
    },
    {
      NAME: 'resources',
      ABBR: 'r',
      INFO: 'Path to SVG resources.',
      ARG: 'string',
      DEF: '/usr/local/share/verovio',
      CLI_ONLY: 'true',
    },
    {
      NAME: 'scale',
      ABBR: 's',
      INFO: 'Scale percentage',
      ARG: 'integer',
      DEF: '100',
      MIN: '1',
    },
    {
      NAME: 'minLastJustification',
      INFO: 'Minimum length of last system which can be stretched to 100% width of page.',
      ARG: 'float',
      DEF: '0.8',
      MIN: '0.0',
      MAX: '1.0',
    },
    {
      NAME: 'outputTo',
      ABBR: 't',
      INFO: 'Select output data format',
      ARG: 'string',
      DEF: 'svg',
      ALT: ['mei', 'midi'],
    },
    {
      NAME: 'version',
      ABBR: 'v',
      INFO: 'Display verovio version number.',
      ARG: 'boolean',
      CLI_ONLY: 'true',
    },
    {
      NAME: 'xmlIdSeed',
      ABBR: 'x',
      INFO: 'Seed the random number generator for XML IDs.',
      ARG: 'integer',
    },
    {
      NAME: 'adjustPageHeight',
      CAT: 'Input and page layout options',
      INFO: 'Crop the page height to the actual height of the content.',
      ARG: 'boolean',
    },
    {
      NAME: 'adjustPageWidth',
      CAT: 'Input and page layout options.',
      INFO: 'Crop the page width to the actual width of the content.',
      ARG: 'boolean',
    },
    {
      NAME: 'breaks',
      CAT: 'Input and page layout options',
      INFO: 'Define page and system breaks layout.',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['none', 'line', 'smart', 'encoded'],
    },
    {
      NAME: 'breaksSmartSb',
      CAT: 'Input and page layout options',
      INFO: 'In smart breaks mode, the portion of the system width usage\n\tat which an encoded system break will be used.',
      ARG: 'float',
      DEF: '0.66',
      MIN: '0.00',
      MAX: '1.00',
    },
    {
      NAME: 'condense',
      CAT: 'Input and page layout options',
      INFO: 'Control condensed score layout.',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['none', 'encoded'],
    },
    {
      NAME: 'condenseFirstPage',
      CAT: 'Input and page layout options',
      INFO: 'When condensing a score, also condense the first page.',
      ARG: 'boolean',
    },
    {
      NAME: 'condenseTempoPages',
      CAT: 'Input and page layout options',
      INFO: 'When condensing a score, also condense pages with a tempo.',
      ARG: 'boolean',
    },
    {
      NAME: 'evenNoteSpacing',
      CAT: 'Input and page layout options',
      INFO: 'Specify the linear spacing factor.  This is useful for mensural notation display.',
      ARG: 'boolean',
    },
    {
      NAME: 'expand',
      CAT: 'Input and page layout options',
      INFO: 'Expand all referenced elements in the expanion.  Input is an xml:id of the expansion list.',
      ARG: 'string',
    },
    {
      NAME: 'humType',
      CAT: 'Input and page layout options',
      INFO: 'Include type attributes when importing rom Humdrum',
      ARG: 'boolean',
    },
    {
      NAME: 'justifyVertically',
      CAT: 'Input and page layout options',
      INFO: 'Justify spacing veritcally to fill a page.',
      ARG: 'boolean',
    },
    {
      NAME: 'landscape',
      CAT: 'Input and page layout options',
      INFO: 'The landscape paper orientation flag.',
      ARG: 'boolean',
    },
    {
      NAME: 'mensuralToMeasure',
      CAT: 'Input and page layout options',
      INFO: 'Convert mensural sections to measure-based MEI.',
      ARG: 'boolean',
    },
    {
      NAME: 'mmOutput',
      CAT: 'Input and page layout options',
      INFO: 'Specify that the output in the SVG is given in mm (default is px).',
      ARG: 'boolean',
    },
    {
      NAME: 'footer',
      CAT: 'Input and page layout options',
      INFO: 'Do not add any footer, add a footer, use automatic footer.',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['none', 'encoded', 'always'],
    },
    {
      NAME: 'header',
      CAT: 'Input and page layout options',
      INFO: 'Do not add any header, add a header, use automatic header.',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['none', 'encoded'],
    },
    {
      NAME: 'noJustification',
      CAT: 'Input and page layout options',
      INFO: 'Do not justify the system.',
      ARG: 'boolean',
    },
    {
      NAME: 'openControlEvents',
      CAT: 'Input and page layout options',
      INFO: 'Render open control events.',
      ARG: 'boolean',
    },
    {
      NAME: 'outputIndent',
      CAT: 'Input and page layout options',
      INFO: 'Output indent value for MEI and SVG.',
      ARG: 'integer',
      DEF: '3',
      MIN: '1',
      MAX: '10',
    },
    {
      NAME: 'outputFormatRaw',
      CAT: 'Input and page layout options',
      INFO: 'Output MEI with no line indents or non-content newlines. See svgFormatRaw.',
      ARG: 'boolean',
    },
    {
      NAME: 'outputIndentTab',
      CAT: 'Input and page layout options',
      INFO: 'Use tabs rather than spaces for indenting XML output.',
      ARG: 'boolean',
    },
    {
      NAME: 'outputSmuflXmlEntities',
      CAT: 'Input and page layout options',
      INFO: 'Output SMuFL characters as XML entities instead of hex byte codes.',
      ARG: 'boolean',
    },
    {
      NAME: 'pageHeight',
      CAT: 'Input and page layout options',
      INFO: 'The page height.',
      ARG: 'integer',
      DEF: '2970',
      MIN: '100',
      MAX: '60000',
    },
    {
      NAME: 'pageMarginBottom',
      CAT: 'Input and page layout options',
      INFO: 'Bottom margin of pages.',
      ARG: 'integer',
      DEF: '50',
      MIN: '0',
      MAX: '500',
    },
    {
      NAME: 'pageMarginLeft',
      CAT: 'Input and page layout options',
      INFO: 'Left margin of pages.',
      ARG: 'integer',
      DEF: '50',
      MIN: '0',
      MAX: '500',
    },
    {
      NAME: 'pageMarginRight',
      CAT: 'Input and page layout options',
      INFO: 'Right margin of pages.',
      ARG: 'integer',
      DEF: '50',
      MIN: '0',
      MAX: '500',
    },
    {
      NAME: 'pageMarginTop',
      CAT: 'Input and page layout options',
      INFO: 'Top margin of pages.',
      ARG: 'integer',
      DEF: '50',
      MIN: '0',
      MAX: '500',
    },
    {
      NAME: 'pageWidth',
      CAT: 'Input and page layout options',
      INFO: 'Page width.',
      ARG: 'integer',
      DEF: '2100',
      MIN: '100',
      MAX: '60000',
    },
    {
      NAME: 'preserveAnalyticalMarkup',
      CAT: 'Input and page layout options',
      INFO: 'Preserves the analytical markup in MEI.',
      ARG: 'boolean',
    },
    {
      NAME: 'removeIDs',
      CAT: 'Input and page layout options',
      INFO: 'Remove XML IDs in the MEI output when not referenced.',
      ARG: 'boolean',
    },
    {
      NAME: 'shrinkToFit',
      CAT: 'Input and page layout options',
      INFO: 'Scale down page content to fit the page height if needed.',
      ARG: 'boolean',
    },
    {
      NAME: 'svgBoundingBoxes',
      CAT: 'Input and page layout options',
      INFO: 'Include bounding boxes in SVG output.',
      ARG: 'boolean',
    },
    {
      NAME: 'svgViewBox',
      CAT: 'Input and page layout options',
      INFO: 'Use viewbox on SVG root element for easy scaling of document.',
      ARG: 'boolean',
    },
    {
      NAME: 'svgHtml5',
      CAT: 'Input and page layout options',
      INFO: 'Write data-id and data-class attributes for JS usage and ID clash avoidance.',
      ARG: 'boolean',
    },
    {
      NAME: 'svgFormatRaw',
      CAT: 'Input and page layout options',
      INFO: 'Writes SVG with no line indenting or non-content newlines. See outputFormatRaw.',
      ARG: 'boolean',
    },
    {
      NAME: 'svgRemoveXlink',
      CAT: 'Input and page layout options',
      INFO: 'Removes the "xlink:" prefix from href attributes for compatibility with some newer browsers.',
      ARG: 'boolean',
    },
    {
      NAME: 'unit',
      CAT: 'Input and page layout options',
      INFO: 'The MEI unit (1/2 of the distance between the staff lines).',
      ARG: 'integer',
      DEF: '9',
      MIN: '6',
      MAX: '20',
    },
    {
      NAME: 'useBraceGlyph',
      CAT: 'Input and page layout options',
      INFO: 'Use brace glyph from current font.',
      ARG: 'boolean',
    },
    {
      NAME: 'useFacsimile',
      CAT: 'Input and page layout options',
      INFO: 'Use information in the facsimile element to control the layout.',
      ARG: 'boolean',
    },
    {
      NAME: 'usePgFooterForAll',
      CAT: 'Input and page layout options',
      INFO: 'Use the pgFooter element for all pages.',
      ARG: 'boolean',
    },
    {
      NAME: 'usePgHeaderForAll',
      CAT: 'Input and page layout options',
      INFO: 'Use the pgHeader element for all pages.',
      ARG: 'boolean',
    },
    {
      NAME: 'clefChangeFactor',
      CAT: 'Input and page layout options',
      INFO: 'Set the size ratio of normal clefs to changing clefs.',
      ARG: 'float',
      DEF: '0.66',
      MIN: '0.25;',
      MAX: '1.00;',
    },
    {
      NAME: 'midiTempoAdjustment',
      CAT: 'General layout',
      INFO: 'MIDI tempo adjustment factor.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.20',
      MAX: '4.00',
    },
    {
      NAME: 'barLineSeparation',
      CAT: 'General layout',
      INFO: 'Default distance between multiple barlines when locked together.',
      ARG: 'float',
      DEF: '0.80',
      MIN: '0.50',
      MAX: '2.00',
    },
    {
      NAME: 'barLineWidth',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'The width of a barline.',
      DEF: '0.30',
      MIN: '0.10',
      MAX: '0.80',
    },
    {
      NAME: 'beamMaxSlope',
      INFO: 'The maximum beam slope.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '10',
      MIN: '1',
      MAX: '20',
    },
    {
      NAME: 'beamMinSlope',
      INFO: 'The minimum beam slope.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '0',
      MIN: '0',
      MAX: '0',
    },
    {
      NAME: 'bracketThickness',
      INFO: 'Thickness of the system bracket.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '1.0',
      MIN: '0.5',
      MAX: '2.0',
    },
    {
      NAME: 'dynamDist',
      INFO: 'Default distance from staff to dynamic marks.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.50',
      MAX: '16.00',
    },
    {
      NAME: 'engravingDefaults',
      INFO: 'JSON describing defaults for engraving SMuFL elements.',
      CAT: 'General layout',
      ARG: 'string',
    },
    {
      NAME: 'engravingDefaultsFile',
      INFO: 'Path to JSON file describing defaults for engraving SMuFL elements.',
      CAT: 'General layout',
      ARG: 'string',
    },
    {
      NAME: 'font',
      INFO: 'Set the music font.',
      CAT: 'General layout',
      ARG: 'string',
      DEF: 'Leipzig',
      ALT: ['Bravura', 'Gootville', 'Leland'],
    },
    {
      NAME: 'graceFactor',
      INFO: 'The grace size ratio numerator.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.75',
      MIN: '0.50',
      MAX: '1.00',
    },
    {
      NAME: 'graceRhythmAlign',
      INFO: 'Align grace notes rhythmically with all staves.',
      CAT: 'General layout',
      ARG: 'boolean',
    },
    {
      NAME: 'graceRightAlign',
      INFO: 'Align the right position of a grace group with all staves.',
      CAT: 'General layout',
      ARG: 'boolean',
    },
    {
      NAME: 'hairpinSize',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Size of hairpins (crescendo lines).',
      DEF: '3.00',
      MIN: '1.00',
      MAX: '8.00',
    },
    {
      NAME: 'hairpinThickness',
      CAT: 'General layout',
      INFO: 'Hairpin thickness (crescendo lines).',
      ARG: 'float',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '0.80',
    },
    {
      NAME: 'harmDist',
      CAT: 'General layout',
      INFO: 'Default distance from haromonic labels to the staff.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.50',
      MAX: '16.00',
    },
    {
      NAME: 'justificationStaff',
      CAT: 'General layout',
      INFO: 'Staff justification.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'justificationSystem',
      CAT: 'General layout',
      INFO: 'Vertical system spacing justification.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'justificationBracketGroup',
      CAT: 'General layout',
      INFO: 'Space between staves inside a bracket group justification.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'justificationBraceGroup',
      CAT: 'General layout',
      INFO: 'Space between staves inside a brace group justification.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'ledgerLineThickness',
      CAT: 'General layout',
      INFO: 'Thickness of ledger lines.',
      ARG: 'float',
      DEF: '0.25',
      MIN: '0.10',
      MAX: '0.50',
    },
    {
      NAME: 'ledgerLineExtension',
      CAT: 'General layout',
      INFO: 'Amount by which ledger lines should extend on either side of a notehead.',
      ARG: 'float',
      DEF: '0.54',
      MIN: '0.20',
      MAX: '1.00',
    },
    {
      NAME: 'lyricSize',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Size of lyric text.',
      DEF: '4.50',
      MIN: '2.00',
      MAX: '8.00',
    },
    {
      NAME: 'lyricHyphenLength',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Lyric hyphen and dash lengths.',
      DEF: '1.20',
      MIN: '0.50',
      MAX: '3.00',
    },
    {
      NAME: 'lyricLineThickness',
      CAT: 'General layout',
      INFO: 'Lyric extender line thicknesses.',
      ARG: 'float',
      DEF: '0.25',
      MIN: '0.10',
      MAX: '0.50',
    },
    {
      NAME: 'lyricNoStartHyphen',
      CAT: 'General layout',
      INFO: 'Do not show hyphens at system beginnings.',
      ARG: 'boolean',
    },
    {
      NAME: 'lyricTopMinMargin',
      CAT: 'General layout',
      INFO: 'The minmal margin above the lyrics',
      ARG: 'float',
      DEF: '3.00',
      MIN: '3.00',
      MAX: '8.00',
    },
    {
      NAME: 'lyricWordSpace',
      CAT: 'General layout',
      INFO: 'Minimum width of spaces separating lyric text.',
      ARG: 'float',
      DEF: '1.20',
      MIN: '0.50',
      MAX: '3.00',
    },
    {
      NAME: 'minMeasureWidth',
      INFO: 'The minimal measure width.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '15',
      MIN: '1',
      MAX: '30',
    },
    {
      NAME: 'mnumInterval',
      INFO: 'Repeat measure numbers at the given cycle size.',
      CAT: 'General layout',
      ARG: 'integer',
    },
    {
      NAME: 'multiRestStyle',
      INFO: 'Rendering style of multiple measure rests.',
      CAT: 'General layout',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['default', 'block', 'symbols'],
    },
    {
      NAME: 'repeatBarLineDotSeparation',
      INFO: 'Default horizontal distance between dots and inner repeat barline.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.30',
      MIN: '0.10',
      MAX: '1.00',
    },
    {
      NAME: 'repeatEndingLineThickness',
      INFO: 'Repeat and endling line thickness.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.15',
      MIN: '0.10',
      MAX: '2.00',
    },
    {
      NAME: 'slurControlPoints',
      INFO: 'Slur control points.  Higher values mean more curvature at endpoints.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '5',
      MIN: '1',
      MAX: '10',
    },
    {
      NAME: 'slurHeightFactor',
      INFO: 'Slur height factor.  Higher values mean flatter slurs.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '5',
      MIN: '1',
      MAX: '100',
    },
    {
      NAME: 'slurMinHeight',
      INFO: 'Minimum slur height.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '1.20',
      MIN: '0.30',
      MAX: '2.00',
    },
    {
      NAME: 'slurMaxHeight',
      INFO: 'Maximum slur height.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '3.00',
      MIN: '2.00',
      MAX: '6.00',
    },
    {
      NAME: 'slurMaxSlope',
      INFO: 'Maximum slur slope in degrees.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '20',
      MIN: '0',
      MAX: '60',
    },
    {
      NAME: 'slurEndpointThickness',
      INFO: 'Slur endpoint thickness.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.10',
      MIN: '0.05',
      MAX: '0.25',
    },
    {
      NAME: 'slurMidpointThickness',
      INFO: 'Slur midpoint thickness.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.60',
      MIN: '0.20',
      MAX: '1.20',
    },
    {
      NAME: 'spacingBraceGroup',
      INFO: 'Minimum space between staves inside of a braced group.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '12',
      MIN: '0',
      MAX: '48',
    },
    {
      NAME: 'spacingBracketGroup',
      INFO: 'Minimum space between staves inside a bracketed group.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '12',
      MIN: '0',
      MAX: '48',
    },
    {
      NAME: 'spacingDurDetection',
      INFO: 'Detect long duration for adjusting spacing.',
      CAT: 'General layout',
      ARG: 'boolean',
    },
    {
      NAME: 'slurCurveFactor',
      INFO: 'Slur curve factor.  Higher values mean rounder slurs.',
      CAT: 'General layout',
      ARG: 'integer',
      DEF: '10',
      MIN: '1',
      MAX: '100',
    },
    {
      NAME: 'octaveAlternativeSymbols',
      INFO: 'Use alternative symbols for displaying octaves.',
      CAT: 'General layout',
      ARG: 'boolean',
    },
    {
      NAME: 'octaveLineThickness',
      INFO: 'Octave line thickness.',
      CAT: 'General layout',
      ARG: 'float',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '1.00',
    },
    {
      NAME: 'spacingLinear',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Specify the linear spacing factor',
      DEF: '0.25',
      MIN: '0.00',
      MAX: '1.00',
    },
    {
      NAME: 'spacingNonLinear',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Specify the non-linear spacing factor.',
      DEF: '0.60',
      MIN: '0.00',
      MAX: '1.00',
    },
    {
      NAME: 'spacingStaff',
      ARG: 'integer',
      INFO: 'The staff minimal spacing',
      CAT: 'General layout',
      DEF: '12',
      MIN: '0',
      MAX: '48',
    },
    {
      NAME: 'spacingSystem',
      ARG: 'integer',
      INFO: 'The system minimal spacing',
      CAT: 'General layout',
      DEF: '12',
      MIN: '0',
      MAX: '48',
    },
    {
      NAME: 'staffLineWidth',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'The staff line width in unit',
      DEF: '0.15',
      MIN: '0.10',
      MAX: '0.30',
    },
    {
      NAME: 'stemWidth',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'The stem width',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '0.50',
    },
    {
      NAME: 'subBracketThickness',
      CAT: 'General layout',
      ARG: 'float',
      INFO: 'Thickness of system sub-brackets.',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '2.00',
    },
    {
      NAME: 'systemDivider',
      CAT: 'General layout',
      INFO: 'Display style of system dividers',
      ARG: 'string',
      DEF: 'auto',
      ALT: ['none', 'left', 'left-right'],
    },
    {
      NAME: 'systemMaxPerPage',
      CAT: 'General layout',
      INFO: 'Maximum number of systems per page',
      ARG: 'integer',
    },
    {
      NAME: 'textEnclosureThickness',
      CAT: 'General layout',
      INFO: 'Thickness of text-enclosing boxes.',
      ARG: 'float',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '0.80',
    },
    {
      NAME: 'thickBarlineThickness',
      CAT: 'General layout',
      INFO: 'Thickness of thick barlines.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.50',
      MAX: '2.00',
    },
    {
      NAME: 'tieEndpointThickness',
      CAT: 'General layout',
      INFO: 'Endpoint tie thickenesses',
      ARG: 'float',
      DEF: '0.10',
      MIN: '0.05',
      MAX: '0.25',
    },
    {
      NAME: 'tieMidpointThickness',
      CAT: 'General layout',
      INFO: 'Tie midpoint thickenesses',
      ARG: 'float',
      DEF: '0.50',
      MIN: '0.20',
      MAX: '1.00',
    },
    {
      NAME: 'tupletBracketThickness',
      CAT: 'General layout',
      INFO: 'Tuplet bracket thicknesses.',
      ARG: 'float',
      DEF: '0.20',
      MIN: '0.10',
      MAX: '0.80',
    },
    {
      NAME: 'tupletNumHead',
      CAT: 'General layout',
      INFO: 'Placement of tuplet number on the notehead-side.',
      ARG: 'boolean',
    },
    {
      NAME: 'defaultBottomMargin',
      CAT: 'element margins',
      INFO: 'Default bottom margin',
      ARG: 'float',
      DEF: '0.50',
      MIN: '0.00',
      MAX: '5.00',
    },
    {
      NAME: 'defaultLeftMargin',
      CAT: 'element margins',
      INFO: 'Default left margin.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'defaultRightMargin',
      CAT: 'element margins',
      INFO: 'The default right margin',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'defaultTopMargin',
      CAT: 'element margins',
      INFO: 'The default top margin',
      ARG: 'float',
      DEF: '0.50',
      MIN: '0.00',
      MAX: '6.00',
    },
    {
      NAME: 'leftMarginAccid',
      CAT: 'element margins',
      INFO: 'The margin for accid',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'bottomMarginArtic',
      CAT: 'element margins',
      INFO: 'Bottom margin for articulations.',
      ARG: 'float',
      DEF: '0.75',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'bottomMarginHarm',
      CAT: 'element margins',
      INFO: 'Bottom margin for harmony labels.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'bottomMarginHeader',
      CAT: 'element margins',
      INFO: 'Bottom margin for page headers.',
      ARG: 'float',
      DEF: '8.00',
      MIN: '0.00',
      MAX: '24.00',
    },
    {
      NAME: 'leftMarginBarLine',
      CAT: 'element margins',
      INFO: 'Left margin for barLines.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginBeatRpt',
      CAT: 'element margins',
      INFO: 'Left margin for beatRpt.',
      ARG: 'float',
      DEF: '2.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginChord',
      CAT: 'element margins',
      INFO: 'Left margin for chords.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginClef',
      CAT: 'element margins',
      INFO: 'Left margin for clefs.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginKeySig',
      CAT: 'element margins',
      INFO: 'Left margin for key signatures.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginLeftBarLine',
      CAT: 'element margins',
      INFO: 'Left margin for left barLines.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMensur',
      CAT: 'element margins',
      INFO: 'Left margin for mensur.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMeterSig',
      CAT: 'element margins',
      INFO: 'Left margin for meterSig.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMRest',
      CAT: 'element margins',
      INFO: 'Left margin for mRest.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMRpt2',
      CAT: 'element margins',
      INFO: 'Left margin for mRpt2.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMultiRest',
      CAT: 'element margins',
      INFO: 'Left margin for multiRest.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginMultiRpt',
      CAT: 'element margins',
      INFO: 'Left  margin for multiRpt.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginNote',
      CAT: 'element margins',
      INFO: 'Right margin for note.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginRest',
      CAT: 'element margins',
      INFO: 'Left margin for rest.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginRightBarLine',
      CAT: 'element margins',
      INFO: 'Margin for right barLine.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'leftMarginTabDurSym',
      CAT: 'element margins',
      INFO: 'Margin for tabDurSym.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginAccid',
      CAT: 'element margins',
      INFO: 'Right margin for accid.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginBarLine',
      CAT: 'element margins',
      INFO: 'Right margin for barLine.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginBeatRpt',
      CAT: 'element margins',
      INFO: 'Right margin for beatRpt.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginChord',
      CAT: 'element margins',
      INFO: 'Right margin for chord.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginClef',
      CAT: 'element margins',
      INFO: 'Right margin for clef.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginKeySig',
      CAT: 'element margins',
      INFO: 'Right margin for keySig.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginLeftBarLine',
      CAT: 'element margins',
      INFO: 'Right margin for left barLine.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMensur',
      CAT: 'element margins',
      INFO: 'Right margin for mensur.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMeterSig',
      CAT: 'element margins',
      INFO: 'Right margin for meterSig.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMRest',
      CAT: 'element margins',
      INFO: 'Right margin for mRest.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMRpt2',
      CAT: 'element margins',
      INFO: 'Right margin for mRpt2.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMultiRest',
      CAT: 'element margins',
      INFO: 'Right margin for multiRest.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginMultiRpt',
      CAT: 'element margins',
      INFO: 'Right margin for multiRpt.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginNote',
      CAT: 'element margins',
      INFO: 'The right margin for note.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginRest',
      CAT: 'element margins',
      INFO: 'The right margin for rest.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginRightBarLine',
      CAT: 'element margins',
      ARG: 'float',
      INFO: 'The right margin for right barLine.',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'rightMarginTabDurSym',
      CAT: 'element margins',
      INFO: 'Right margin for tabDurSym.',
      ARG: 'float',
      DEF: '0.00',
      MIN: '0.00',
      MAX: '2.00',
    },
    {
      NAME: 'topMarginArtic',
      CAT: 'element margins',
      INFO: 'Top margin for articulations.',
      ARG: 'float',
      DEF: '0.75',
      MIN: '0.00',
      MAX: '10.00',
    },
    {
      NAME: 'topMarginHarm',
      CAT: 'element margins',
      INFO: 'Top margin for harmony labels.',
      ARG: 'float',
      DEF: '1.00',
      MIN: '0.00',
      MAX: '10.00',
    },
  ],
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::initializer --
//

function HumdrumNotationPluginDatabase() {
  this.entries = {}; // Hash of notation ids and their related information.
  this.mutex = 0;
  this.waiting = []; // Notation entries to process after verovio has loaded.
  this.ready = 0; // Set to 1 when verovio toolkit is loaded
  HumdrumNotationPluginDatabase.prototype.prepareOptions();
  return this;
}

// var HNP = new HumdrumNotationPluginDatabase();

///////////////////////////////////////////////////////////////////////////

function getContainer(baseid) {
  var entry = HNP.entries[baseid];
  if (!entry) {
    return null;
  }
  return entry.container;
}

///////////////////////////////////////////////////////////////////////////

//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayWaiting --
//

HumdrumNotationPluginDatabase.prototype.displayWaiting = function () {
  // maybe check to see if document is ready (otherwise maybe infinite loop).
  for (var i = 0; i < this.waiting.length; i++) {
    (function (that, j, obj) {
      setTimeout(function () {
        that.displayHumdrumNow(obj);
      }, j * 250);
    })(this, i, this.waiting[i]);
  }
  this.waiting = [];
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::setErrorScore --
//

HumdrumNotationPluginDatabase.prototype.setErrorScore = function (baseid) {
  var element = document.querySelector('#' + baseid);
  if (!element) {
    console.log('Warning: Cannot find error score for ID', baseid);
    return;
  }
  var text = element.textContent.trim();
  this.errorScore = text;
  return this;
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::createEntry --
//

HumdrumNotationPluginDatabase.prototype.createEntry = function (
  baseid,
  options
) {
  if (typeof baseid !== 'string' && !(baseid instanceof String)) {
    console.log('Error: baseid must be a string, but it is:', baseid);
    return null;
  }
  if (!(options instanceof Object)) {
    console.log('Error: options must be an object:', options);
    return null;
  }
  if (!baseid) {
    console.log('Error: baseid cannot be empty');
    return null;
  }
  var entry = this.entries[baseid];
  if (entry) {
    console.log('Error: entry already exists:', entry);
    return entry;
  }
  var entry = new HumdrumNotationPluginEntry(baseid, options);
  this.entries[baseid] = entry;
  entry.convertFunctionNamesToRealFunctions();
  entry.createContainer();
  entry.initializeContainer();
  return entry;
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayHumdrumNow -- Don't wait, presumably since
//     the page has finished loading.
//

HumdrumNotationPluginDatabase.prototype.displayHumdrumNow = function (opts) {
  if (opts instanceof Element) {
    // Currently not allowed, but maybe allow the container element, and then
    // extract the options from the container (from the *-options element).
    return;
  }

  var entry = null;

  if (typeof opts === 'string' || opts instanceof String) {
    // This is a base ID for a Humdrum example to display.
    entry = this.entries[opts];
    if (!entry) {
      console.log('Error: trying to create notation for an uninitialized ID');
      return;
    }
  } else if (opts instanceof Object) {
    var id = opts.target;
    if (!id) {
      id = opts.source;
    }
    if (!id) {
      console.log('Error: source ID for Humdrum element required in options');
      return;
    }
    entry = this.entries[id];
    if (!entry) {
      entry = this.createEntry(id, opts);
    }
    // copy input options into existing entry's option (in case of updates in
    // options).  This is only adding options, but there should probably be a way
    // of removing unwanted options as well...
    for (property in opts) {
      entry.options[property] = opts[property];
    }
  }

  if (!entry) {
    console.log('Error: cannot create notation for', opts);
  }

  var sourceid = entry.options['source'];
  if (!sourceid) {
    console.log(
      'Error: Missing Humdrum data source ID:',
      sourceid,
      'in options',
      opts
    );
    return;
  }
  var source = document.querySelector('#' + sourceid);
  if (!source) {
    console.log(
      'Error: Humdrum source location ' + sourceid + ' cannot be found.'
    );
    return;
  }

  if (entry.options.hasOwnProperty('uri')) {
    this.downloadUriAndDisplay(entry.baseId);
  } else if (entry.options.hasOwnProperty('url')) {
    this.downloadUrlAndDisplay(entry.baseId);
  } else {
    if (entry._timer) {
      clearTimeout(entry._timer);
    }
    entry._timer = setTimeout(function () {
      entry.copyContentToContainer();
      HNP.displayHumdrumSvg(entry.baseId);
    }, 100);
  }
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::downloadUriAndDisplay --
//

HumdrumNotationPluginDatabase.prototype.downloadUriAndDisplay = function (
  baseid
) {
  var entry = this.entries[baseid];
  if (!entry) {
    console.log('Error: Cannot find entry for URI download:', baseid);
    return;
  }

  if (entry.options.uri) {
    entry.options.processedUri = entry.options.uri;
    delete entry.options.uri;
  } else {
    console.log(
      'Warning: No URL to download data from, presuming already downloaded',
      entry
    );
    displayHumdrumNow(entry.baseId);
    return;
  }

  var uri = entry.options.processedUri;
  var url = '';
  if (uri.match(/^(g|gh|github):\/\//i)) {
    url = this.makeUrlGithub(uri);
  } else if (uri.match(/^(h|hum|humdrum):\/\//i)) {
    url = this.makeUrlHumdrum(uri);
  } else if (uri.match(/^(j|jrp):\/\//i)) {
    url = this.makeUrlJrp(uri);
  } else if (uri.match(/^(nifc):\/\//i)) {
    url = this.makeUrlNifc(uri);
  } else if (uri.match(/^(https?):\/\//i)) {
    url = uri;
  } else {
    // Assume local file URL:
    url = uri;
  }
  if (url) {
    entry.options.url = url;
    this.downloadUrlAndDisplay(baseid);
  } else {
    console.log('Warning: No URL for URI:', uri);
  }
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::downloadUrlAndDisplay --
//

HumdrumNotationPluginDatabase.prototype.downloadUrlAndDisplay = function (
  baseid
) {
  var entry = this.entries[baseid];
  if (!entry) {
    console.log('Error: Cannot find entry for URL download:', baseid);
    return;
  }

  if (entry.options.url) {
    entry.options.processedUrl = entry.options.url;
    delete entry.options.url;
  } else {
    console.log(
      'Warning: No URL to download data from, presuming already downloaded',
      entry
    );
    displayHumdrumNow(entry.baseId);
    return;
  }

  var source = document.querySelector('#' + baseid);
  if (!source) {
    console.log('Error: no element for ID', baseid);
    return;
  }

  // download from url, otherwise try urlFallback:
  downloadHumdrumUrlData(source, entry.options);
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::getEmbeddedOptions --
//

HumdrumNotationPluginDatabase.prototype.getEmbeddedOptions = function (
  humdrumfile
) {
  var lines = humdrumfile.match(/[^\r\n]+/g);
  var output = {};
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i].match(/^!!!/)) {
      continue;
    }
    var matches = lines[i].match(
      /^!!!hnp-option\s*:\s*([^\s:]+)\s*:\s*(.*)\s*$/
    );
    if (matches) {
      var option = matches[1];
      var value = matches[2];
      output[option] = value;
    }
  }
  return output;
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayHumdrumSvg -- Add default settings to
//     options and then render and show the Humdrum data as an SVG image on the page.
//

HumdrumNotationPluginDatabase.prototype.displayHumdrumSvg = function (baseid) {
  var that2 = this;
  var entry = this.entries[baseid];
  if (!entry) {
    console.log('Error: Notation entry is not defined for ID:', baseid);
    return;
  }

  if (!entry.toolkit) {
    // search for the verovio toolkit if not explicitly specified

    if (typeof vrvWorker !== 'undefined') {
      entry.toolkit = vrvWorker;
    }
  }
  var toolkit = entry.toolkit;
  var sourcetext = entry.humdrum.textContent.trim();
  if (sourcetext.match(/^\s*$/)) {
    if (entry.options.errorScore) {
      var errorscore = document.querySelector('#' + entry.options.errorScore);
      if (errorscore) {
        sourcetext = errorscore.textContent.trim();
      } else {
        console.log('Error: No humdrum content in', entry.humdrum);
        console.log('For ID', baseid, 'ENTRY:', entry);
        return;
      }
    } else if (this.errorScore) {
      sourcetext = this.errorScore;
      console.log('Error: No humdrum content in', entry.humdrum);
      console.log('For ID', baseid, 'ENTRY:', entry);
    }
  }

  // Cannot display an empty score, since this will cause verovio to display the
  // previously prepared score.
  if (sourcetext.match(/^\s*$/)) {
    //console.log("Error: No humdrum content in", entry.humdrum);
    //console.log("For ID", baseid, "ENTRY:", entry);
    // Sleep for a while and try again.
    // This is now necessary since verovio
    // is in a separate thread, and data being
    // converted from MusicXML or MEI may not
    // yet be ready (it will be converted into Humdrum
    // data which this function is waiting for).
    // Maybe later change this function to be called
    // after the MusicXML/MEI data has been converted.
    // Maybe have a counter to limit the waiting time.
    var that = this;
    setTimeout(function () {
      that.displayHumdrumSvg(baseid);
    }, 100);

    return;
  }

  var preventRendering = false;
  if (entry.options.suppressSvg) {
    preventRendering = true;
    // Maybe set entry.options.suppressSvg to false here.

    entry.container.style.display = 'none';
    entry.options._processedSuppressSvg = entry.options.suppressSvg;
    delete entry.options.suppressSvg;
    entry.container.style.display = 'none';
    return;
  } else {
    entry.container.style.display = 'block';
  }

  var pluginOptions = this.getEmbeddedOptions(sourcetext);
  for (var property in entry.options) {
    if (!entry.options.hasOwnProperty(property)) {
      // not a real property of object
      continue;
    }
    pluginOptions[property] = entry.options[property];
  }

  var vrvOptions = this.extractVerovioOptions(baseid, pluginOptions);
  vrvOptions = this.insertDefaultOptions(baseid, vrvOptions);

  sourcetext += '\n' + getFilters(pluginOptions);

  if (pluginOptions.appendText) {
    var text = pluginOptions.appendText;
    if (Array.isArray(text)) {
      for (var i = 0; i < text.length; i++) {
        if (typeof text[i] === 'string' || text[i] instanceof String) {
          sourcetext += '\n' + text.trim();
        }
      }
    } else if (typeof text === 'string' || text instanceof String) {
      sourcetext += '\n' + text.trim();
    }
  }

  if (pluginOptions.prepareData) {
    try {
      sourcetext = pluginOptions.prepareData(baseid, sourcetext);
    } catch (error) {
      sourcetext = executeFunctionByName(pluginOptions.prepareData, window, [
        baseid,
        sourcetext,
      ]);
    }
  }

  console.log('humdrum-notation-plugin vrvWorker.renderData', {
    vrvOptions,
    sourcetext,
  });
  vrvWorker
    .renderData(vrvOptions, sourcetext)
    .then(function (svg) {
      entry.svg.innerHTML = svg;
      // clear the height styling which may have been given as a placeholder:
      entry.container.style.height = '';

      if (pluginOptions.postFunction) {
        // Need to run a function after the image has been created or redrawn
        try {
          pluginOptions.postFunction(baseid, that2);
        } catch (error) {
          executeFunctionByName(pluginOptions.postFunction, window, [
            baseid,
            that2,
          ]);
        }
        pluginOptions._processedPostFunction = pluginOptions.postFunction;
        delete pluginOptions.postFunction;
      }
      pluginOptions._currentPageWidth = vrvOptions.pageWidth;

      // Update stored options
      var autoresize =
        pluginOptions.autoResize === 'true' ||
        pluginOptions.autoResize === true ||
        pluginOptions.autoResize === 1;

      if (autoresize && !pluginOptions._autoResizeInitialize) {
        // need to inialize a resize callback for this image.
        pluginOptions._autoResizeInitialize = true;
        var aridelement = entry.container.parentNode;

        if (aridelement && (!entry._resizeObserver || entry._resizeCallback)) {
          try {
            var _debounce = function (ms, fn) {
              return function () {
                if (entry._timer) {
                  clearTimeout(entry._timer);
                }
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                entry._timer = setTimeout(fn.bind.apply(fn, args), ms);
              };
            };

            entry._resizeObserver = new ResizeObserver(
              _debounce(500, function (event) {
                (function (bid) {
                  displayHumdrum(bid);
                })(baseid);
              })
            );
            entry._resizeObserver.observe(aridelement);
          } catch (error) {
            // ResizeObserver is not present for this browser, use setInterval instead.
            var refreshRate = 250; // milliseconds
            entry._resizeCallback = setInterval(function () {
              (function (bid) {
                checkParentResize(bid);
              })(baseid);
            }, refreshRate);
          }
        } else if (!aridelement) {
          window.addEventListener('resize', function (event) {
            (function (bid) {
              displayHumdrum(bid);
            })(baseid);
          });
        }
      }
    })
    .catch((message) => {
      console.log(
        'PROBLEM RENDERING DATA WITH VEROVIO WORKER, ERROR:',
        message
      );
    })
    .then(function () {
      vrvWorker.getHumdrum().then(function (humdrumdata) {
        this.humdrumOutput;
        entry.humdrumOutput = humdrumdata;
        if (pluginOptions.postFunctionHumdrum) {
          // Need to run a function after the image has been created or redrawn
          try {
            pluginOptions.postFunctionHumdrum(
              entry.humdrumOutput,
              baseid,
              that2
            );
          } catch (error) {
            executeFunctionByName(pluginOptions.postFunctionHumdrum, window, [
              entry.humdrumOutput,
              baseid,
              that2,
            ]);
          }
          pluginOptions._processedPostFunction =
            pluginOptions.postFunctionHumdrum;
          delete pluginOptions.postFunctionHumdrum;
        }
      });
    });
};

//////////////////////////////
//
// HumdrumNotationPluginEntry::insertDefaultOptions --
//

HumdrumNotationPluginDatabase.prototype.insertDefaultOptions = function (
  baseid,
  vrvOptions
) {
  var entry = this.entries[baseid];
  if (!entry) {
    console.log('Error: need an entry for baseid:', baseid);
    return vrvOptions;
  }
  if (
    entry.options.header === 'true' ||
    entry.options.header === true ||
    entry.options.header === 1
  ) {
    vrvOptions.header = 'encoded';
  }

  if (!vrvOptions.hasOwnProperty('scale')) {
    // scale must be set before automatic pageWidth calculations
    vrvOptions.scale = 40;
  }

  if (!vrvOptions.hasOwnProperty('pageMarginTop')) {
    vrvOptions.pageMarginTop = 100;
  }

  if (!vrvOptions.hasOwnProperty('justifyVertically')) {
    vrvOptions.justifyVertically = 0;
  }

  if (!vrvOptions.pageWidth) {
    // set the width of the notation automatically to the width of the parent element
    var style = window.getComputedStyle(entry.container, null);
    var width = parseInt(style.getPropertyValue('width'));
    vrvOptions.pageWidth = width;
    if (vrvOptions.scale) {
      vrvOptions.pageWidth /= parseInt(vrvOptions.scale) / 100.0;
    }
  }

  if (!vrvOptions.hasOwnProperty('pageHeight')) {
    vrvOptions.pageHeight = 60000;
  }
  if (
    entry.options.incipit === 'true' ||
    entry.options.incipit === 1 ||
    entry.options.incipit === true
  ) {
    vrvOptions.pageHeight = 100;
  }

  if (!vrvOptions.hasOwnProperty('staffLineWidth')) {
    vrvOptions.staffLineWidth = 0.12;
  }
  if (!vrvOptions.hasOwnProperty('barLineWidth')) {
    vrvOptions.barLineWidth = 0.12;
  }
  if (!vrvOptions.hasOwnProperty('Inputfrom')) {
    vrvOptions.inputFrom = 'auto';
  }
  if (!vrvOptions.hasOwnProperty('Inputfrom')) {
    vrvOptions.inputFrom = 'auto';
  }
  if (vrvOptions.hasOwnProperty('from')) {
    vrvOptions.inputFrom = vrvOptions.from;
    delete vrvOptions.from;
  }

  // Need to superimpose default options since verovio will keep old
  // options persistent from previously generated examples.
  if (this.verovioOptions) {
    for (var i = 0; i < this.verovioOptions.OPTION.length; i++) {
      var option = this.verovioOptions.OPTION[i];
      var name = option.NAME;
      if (
        option.CLI_ONLY === 'true' ||
        option.CLI_ONLY === true ||
        option.CLI_ONLY === 1
      ) {
        continue;
      }
      if (vrvOptions.hasOwnProperty(name)) {
        // Option is already set, so do not give a default.
        // Probably check if it is in valid range here, though.
        continue;
      }
      // Ignore previously dealt-with options:
      if (name === 'scale') {
        continue;
      }
      if (name === 'pageWidth') {
        continue;
      }
      if (name === 'pageHeight') {
        continue;
      }
      if (name === 'staffLineWidth') {
        continue;
      }
      if (name === 'barLineWidth') {
        continue;
      }
      if (name === 'inputFrom') {
        continue;
      }
      if (name === 'from') {
        continue;
      }

      // Fill in default values for parameters that are not set:
      if (option.ARG === 'integer' && typeof option.DEF !== 'undefined') {
        vrvOptions[name] = parseInt(option.DEF);
      } else if (option.ARG === 'float' && typeof option.DEF !== 'undefined') {
        vrvOptions[name] = parseFloat(option.DEF);
      }
      // Maybe add string and boolean options here.
    }
  }

  // Deal with default options for boolean and string cases:
  if (!vrvOptions.hasOwnProperty('adjustPageHeight')) {
    vrvOptions.adjustPageHeight = 1;
  }
  if (!vrvOptions.hasOwnProperty('breaks')) {
    vrvOptions.breaks = 'auto';
  }
  if (!vrvOptions.hasOwnProperty('font')) {
    vrvOptions.font = 'Leipzig';
  }
  if (!vrvOptions.hasOwnProperty('humType')) {
    vrvOptions.humType = 1;
  }
  if (!vrvOptions.hasOwnProperty('footer')) {
    vrvOptions.footer = 'none';
  }
  if (!vrvOptions.hasOwnProperty('header')) {
    vrvOptions.header = 'none';
  }

  return vrvOptions;
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::extractVerovioOptions -- Extract all of the verovio options
//   from the Humdrum plugin options object.
//

HumdrumNotationPluginDatabase.prototype.extractVerovioOptions = function (
  baseid,
  opts
) {
  var entry = this.entries[baseid];
  if (!entry) {
    console.log('Error: Need entry for creating verovio options:', baseid);
    return;
  }

  var output = {};

  if (!opts) {
    opts = entry.options;
  }

  if (opts.scale) {
    var scale = parseFloat(opts.scale);
    if (scale < 0.0) {
      scale = -scale;
    }
    if (scale <= 1.0) {
      scale = 100.0 * scale;
    }
    output.scale = scale;
  }

  for (var property in opts) {
    if (property === 'scale') {
      // scale option handled above
      continue;
    }
    if (typeof this.verovioOptions[property] === 'undefined') {
      // not a verovio option
      continue;
    }
    // Do error-checking of prameters here.
    output[property] = opts[property];
  }

  return output;
};

//////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlGithub --
//

HumdrumNotationPluginDatabase.prototype.makeUrlGithub = function (uri, opts) {
  var url = uri;
  var matches = uri.match(/^(g|gh|github):\/\/([^\/]+)\/([^\/]+)\/(.*)\s*$/);
  if (matches) {
    var account = matches[2];
    var repo = matches[3];
    var file = matches[4];
    var variant;
    if (
      opts &&
      opts.commitHash &&
      (typeof opts.commitHash === 'string' || text instanceof String)
    ) {
      variant = opts.commitHash;
    } else {
      variant = 'master';
    }
    url =
      'https://raw.githubusercontent.com/' +
      account +
      '/' +
      repo +
      '/' +
      variant +
      '/' +
      file;
  }
  return url;
};

///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlHumdrum -- Convert a (kernScores) Humdrum URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlHumdrum = function (uri, opts) {
  var url = uri;
  var matches = uri.match(/^(h|hum|humdrum):\/\/(.*)\s*$/);
  if (matches) {
    url = 'https://kern.humdrum.org/data?s=' + matches[2];
  }
  return url;
};

///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlJrp -- Convert a (kernScores) JRP URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlJrp = function (uri, opts) {
  var url = uri;
  var composerid;
  var jrpid;
  var filename;
  var composerid;
  var matches = uri.match(/^(j|jrp):\/\/([a-z]{3})(\d{4}[a-z]*)-?(.*)$\s*$/i);
  if (matches) {
    composerid = matches[2].toLowerCase();
    composerid = composerid.charAt(0).toUpperCase() + composerid.substr(1);
    jrpid = composerid + matches[3].toLowerCase();
    filename = matches[4];
    if (filename) {
      jrpid += '-' + filename;
    }
    url = 'https://jrp.ccarh.org/cgi-bin/jrp?a=humdrum&f=' + jrpid;
  }
  return url;
};

///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlNifc -- Convert a NIFC URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlNifc = function (uri, opts) {
  var url = uri;
  var matches = uri.match(/^(?:nifc):\/\/(.*)$/i);
  if (matches) {
    var filename = matches[1];
    url = 'https://humdrum.nifc.pl/' + filename;
  }
  return url;
};

//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/ReferenceRecords.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This file contains the ReferenceRecord class for
// the Humdrum notation plugin.  This class is used by
// the ReferenceRecords class to store a particular
// reference record.
//

//////////////////////////////
//
// ReferenceRecords::initializer --
//

function ReferenceRecord(lineindex, linetext) {
  clear();
  setLineIndex(lineindex);
  setLineText(linetext);
  return this;
}

//////////////////////////////
//
// ReferenceRecords::clear --
//

ReferenceRecord.prototype.clear = function () {
  this.line = -1; // line index: offset from 0 for first line in file.
  this.text = '';
  clearParsedData();
  return this;
};

//////////////////////////////
//
// ReferenceRecords::clearParsedData --
//

ReferenceRecord.prototype.clearParsedData = function () {
  this.key = '';
  this.keyBase = '';
  this.keyAt = '';
  this.keyVariant = '';
  this.keyCount = '';
  this.value = '';
  return this;
};

//////////////////////////////
//
// ReferenceRecords::setLineIndex --
//
ReferenceRecord.prototype.setLineIndex = function (lineindex) {
  try {
    this.line = parseInt(lineindex);
  } catch (error) {
    this.line = -1;
  }
  return this;
};

//////////////////////////////
//
// ReferenceRecords::setLineText --
//

ReferenceRecord.prototype.setLineText = function (linetext) {
  if (typeof linetext === 'string' || linetext instanceof String) {
    this.text = linetext;
    parseTextLine();
  } else {
    clear();
  }
  return this;
};

//////////////////////////////
//
// ReferenceRecords::parseTextLine --
//

ReferenceRecord.prototype.parseTextLine = function () {
  // this.key          = The complete reference key.
  // this.keyBase      = The reference key without langauge, count or variant qualifiers.
  // this.keyAt        = The language qualification, including the @ signs.
  // this.keyVariant = The variant qualification (a dash followed by text).
  // this.keyCount     = A Number following a keyBase, before keyAt or keyQual.
  clearParsedData();
  var matches = text.match(/^!!![^!:]+\s*:\s*(.*)\s*$/);
  if (matches) {
    this.keyBase = matches[1];
    this.key = matches[1];
    this.value = matches[2];
  }
  matches = this.keyBase.match(/^([^@]+)(@+.*)$/);
  if (matches) {
    this.keyBase = matches[1];
    this.keyAt = matches[2];
  }
  matches = this.keyBase.match(/^([^-]+)-(.+)$/);
  if (matches) {
    this.keyBase = matches[1];
    this.keyVariant = matches[2];
  }
  // order of language and variant is not defined (so allow either to be first).
  matches = this.keyAt.match(/^([^-]+)-(.+)$/);
  if (matches) {
    this.keyAt = matches[1];
    this.keyVariant = matches[2];
  }
  return this;
};

//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/ReferenceRecords.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This file contains the ReferenceRecords class for
// the Humdrum notation plugin.  This class is used to access
// the reference records in a Humdrum file.
//

//////////////////////////////
//
// ReferenceRecords::initializer --
//

function ReferenceRecords(humdrumfile) {
  this.sequence = []; // The order that the Humdrum records are found in the file
  this.database = {}; // Hash of the records by ReferenceRecord::keyBase
  parseReferenceRecords(humdrumfile);
  return this;
}

//////////////////////////////
//
// ReferenceRecords::parseReferenceRecords --
//

ReferenceRecords.prototype.parseReferenceRecords = function (humdrumfile) {
  var lines = [];
  if (typeof linetext === 'string' || linetext instanceof String) {
    lines = humdrumfile.match(/[^\r\n]+/g);
  } else if (Object.prototype.toString.call(humdrumfile) === '[object Array]') {
    if (humdrumfile[0] === 'string' || humdrumfile[0] instanceof String) {
      line = humdrumfile;
    }
  } else {
    // check if an HTML element and load text from there.
    var ishtml = false;
    try {
      ishtml = obj instanceof HTMLElement ? true : false;
    } catch (e) {
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have (works on IE7)
      if (
        typeof obj === 'object' &&
        obj.nodeType === 1 &&
        typeof obj.style === 'object' &&
        typeof obj.ownerDocument === 'object'
      ) {
        ishtml = true;
      }
    }
    if (ishtml) {
      lines = humdrumfile.innerHTML.match(/[^\r\n]+/g);
    }
  }
  for (i = 0; i < lines.length; i++) {
    if (!lines[i].match(/^!!![^!:]/)) {
      var record = new HumdrumRecord(i, lines[i]);
      this.sequence.push(record);
      var key = record.keyBase;
      if (!this.database[key]) {
        this.database[key] = [record];
      } else {
        this.database[key].push(record);
      }
    }
  }
  return this;
};

//////////////////////////////
//
// ReferenceRecords::getReferenceFirst -- Get the first reference record
//    which matches the given key.  This function will ignore qualifiers,
//    counts or variants on the key (KEY2 will map to KEY, KEY@@LANG will map
//    to KEY, KEY-variant will map to KEY).
//

ReferenceRecords.prototype.getReferenceFirst = function (keyBase) {
  // return the first keyBase record
  var items = this.database[keyBase];
  if (!items) {
    return '';
  } else if (items.length > 0) {
    return items[0];
  } else {
    return '';
  }
};

//////////////////////////////
//
// ReferenceRecords::getReferenceAll -- Get all reference records that match to key.
//

ReferenceRecords.prototype.getReferenceAll = function (keyBase) {
  // if keyBase is empty, then return all records:
  if (!keyBase) {
    return this.sequence;
  }
  // return all keyBase records
  var items = this.database[keyBase];
  if (!items) {
    return [];
  } else if (items.length > 0) {
    return items[0];
  } else {
    return [];
  }
};

//////////////////////////////
//
// ReferenceRecords::getReferenceFirstExact --
//

ReferenceRecords.prototype.getReferenceFirstExact = function (key) {
  // return first matching key record
  var list = getReferenceAll(key);
  for (var i = 0; i < list.length; i++) {
    if (list[i].key === key) {
      return list[i];
    }
  }
  return '';
};

//////////////////////////////
//
// ReferenceRecords::getReferenceAllExact --
//

ReferenceRecords.prototype.getReferenceAllExact = function (key) {
  // return all matching key record
  var list = getReferenceAll(key);
  var output = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].key === key) {
      output.push(list[i]);
    }
  }
  return output;
};
