/* global RSVP, $, PDFDocument, blobStream, saveAs, SVGtoPDF */
//
//	Functions for saving SVG images to a PDF file.
//	See demo at:
//		http://pdfkit.org/demo/browser.html
//
//	vim: ts=3:ft=javascript
//
//
//These external scripts are also needed to create PDF files (found
//in the _include/head/main.html file:
//
//<xscript src="/scripts/pdfkit/blobstream.js" type="text/javascript"></xscript>
//<xscript src="/scripts/pdfkit/pdfkit.js" type="text/javascript"></xscript>
//<xscript src="/scripts/pdfkit/source.js" type="text/javascript"></xscript>
//
//Verovio text font not needed anymore (loaded as a base-64 string):
//<xscript src="scripts/pdfkit/vrv-ttf.js" type="text/javascript"></xscript>
//
//
//	The saving process also needs FileSaver.js:
//		https://github.com/eligrey/FileSaver.js
//	but this is already included for saving editor contents.
//
import { getFilenameBase } from './utility.js';
import { getStaffCount } from './utility-humdrum.js';

import { getVrvWorker } from '../humdrum-notation-plugin-worker.js';
import { getAceEditor } from './setup.js';
import { global_verovioOptions } from './global-variables.js';

let vrvWorker = getVrvWorker();
if (!vrvWorker) {
  throw new Error('Verovio worker is undefined');
}

//////////////////////////////
//
// loadPdfFonts -- load all default fonts used by Verovio
//

function loadPdfFonts(pdf) {
  return RSVP.all([
    loadFontResource(pdf, 'Times', '/scripts/pdfkit/EBGaramond-Regular.ttf'),
    loadFontResource(
      pdf,
      'TimesItalic',
      '/scripts/pdfkit/EBGaramond-Italic.ttf'
    ),
    loadFontResource(pdf, 'TimesBold', '/scripts/pdfkit/EBGaramond-Bold.ttf'),
    loadFontResource(
      pdf,
      'TimesBoldItalic',
      '/scripts/pdfkit/EBGaramond-BoldItalic.ttf'
    ),
    loadFontResource(pdf, 'VerovioText', '/scripts/pdfkit/VerovioText-1.0.ttf'),
  ]);
}

//////////////////////////////
//
// loadFontResource -- use font from file in pdf, returns promise
//

function loadFontResource(pdf, name, path) {
  var promise = new RSVP.Promise(function (resolve, reject) {
    var client = new XMLHttpRequest();
    client.open('GET', path);
    client.responseType = 'arraybuffer';

    client.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(this);
        }
      }
    };

    client.send(null);
  });

  return promise.then(function (data) {
    pdf.registerFont(name, data);
    return true;
  });
}

//////////////////////////////
//
// svgFontCallback -- substitute svg fonts with pdf fonts
//

function svgFontCallback(family, bold, italic, options) {
  if (family == 'VerovioText') {
    return family;
  }
  if (family.match(/(?:^|,)\s*sans-serif\s*$/) || true) {
    if (bold) {
      return italic ? 'TimesBoldItalic' : 'TimesBold';
    } else {
      return italic ? 'TimesItalic' : 'Times';
    }
  }
}

//////////////////////////////
//
// generatePdfShapshot -- Write a PDF file containing the currently displayed SVG.
//

export function generatePdfSnapshot(format, orientation) {
  $('html').css('cursor', 'wait');

  var svg = document.querySelector('#output svg');
  var svgwidth = svg.getAttribute('width');
  var svgheight = svg.getAttribute('height');
  svgwidth = parseInt(svgwidth);
  svgheight = parseInt(svgheight);
  var aspect = svgheight / svgwidth;

  var format = format ? format : 'letter';

  var pagewidth = 2159;
  var pageheight = 2794;
  if (format === 'A4') {
    pagewidth = 2100;
    pageheight = 2970;
  } else if (format === 'B3') {
    pagewidth = 2500;
    pageheight = 3530;
  }

  if (!orientation) {
    if (svgwidth > svgheight) {
      orientation = 'landscape';
    }
  }
  var orientation = orientation ? orientation : 'portrait';
  if (orientation === 'landscape') {
    pagewidth = [pageheight, (pageheight = pagewidth)][0];
  }

  var pageaspect = pageheight / pagewidth;
  var scaling = 0.99;
  var mmwidth;
  var mmheight;

  if (aspect < pageaspect) {
    mmwidth = (pagewidth / 10) * scaling;
    mmheight = (pagewidth / 10) * aspect * scaling;
  } else {
    mmheight = (pageheight / 10) * scaling;
    mmwidth = (pageheight / 10 / aspect) * scaling;
  }

  var pagewidthmm = pagewidth / 10.0;
  var pageheightmm = pageheight / 10.0;

  // pdf page offset (units are in mm?)
  var x = 0;
  var y = 0;

  if (mmwidth < pagewidthmm) {
    x = pagewidthmm - mmwidth;
  }
  x += 1;

  var newspan = document.createElement('span');
  newspan.innerHTML = svg.outerHTML;
  var newsvg = newspan.querySelector('svg');

  newsvg.setAttribute('width', mmwidth + 'mm');
  newsvg.setAttribute('height', mmheight + 'mm');

  var pdfOptions = {};
  pdfOptions.fontCallback = svgFontCallback;
  var pdf = new PDFDocument({
    useCSS: true,
    compress: true,
    autoFirstPage: false,
    layout: orientation,
  });

  var stream = pdf.pipe(blobStream());
  stream.on('finish', function () {
    var blob = stream.toBlob('application/pdf');
    var pdfFilebase = getFilenameBase();
    var pdfFilename = pdfFilebase;
    //if (SAVEFILENAME) {
    //	pdfFilename = SAVEFILENAME.replace(/\.[^.]*$/, "") + "-snapshot.pdf";
    //} else {
    //	pdfFilename = "snapshot.pdf";
    //}
    if (pdfFilename) {
      pdfFilename += '-snapshot.pdf';
    } else {
      pdfFilename = 'snapshot.pdf';
    }
    saveAs(blob, pdfFilename);
    $('html').css('cursor', 'auto');
  });

  loadPdfFonts(pdf).then(function () {
    pdf.addPage({ size: format, layout: orientation });
    SVGtoPDF(pdf, newsvg, x, y, pdfOptions);
    pdf.end();
  });
}

//////////////////////////////
//
// generatePdfFull -- Write a multi-page PDF of the full score in the text editor.
//

export function generatePdfFull(format, orientation) {
  var oldOptions = vrvWorker.options;
  // need to explicitly disable mmOutput = 1 set by the printing process.
  oldOptions.mmOutput = 0;

  $('html').css('cursor', 'wait');
  var format = format ? format : 'letter';
  var orientation = orientation ? orientation : 'portrait';

  var width = 2159;
  // var height = 2794;
  var height = 2920;

  if (format === 'A4') {
    width = 2100;
    height = 2970;
  } else if (format === 'B3') {
    width = 2500;
    height = 3530;
  }
  if (orientation === 'landscape') {
    width = [height, (height = width)][0];
  }

  var pdfOptions = {};
  pdfOptions.fontCallback = svgFontCallback;

  var pdf = new PDFDocument({
    useCSS: true,
    compress: true,
    autoFirstPage: false,
    layout: orientation,
  });
  var stream = pdf.pipe(blobStream());
  stream.on('finish', function () {
    var blob = stream.toBlob('application/pdf');
    var pdfFilebase = getFilenameBase();
    var pdfFilename = pdfFilebase;
    if (pdfFilename) {
      pdfFilename += '.pdf';
    } else {
      pdfFilename = 'data.pdf';
    }
    saveAs(blob, pdfFilename);

    $('html').css('cursor', 'auto');
  });

  var scale = 95;
  height /= scale / 100;
  width /= scale / 100;

  // var spacingBraceGroup   = 12;
  // var spacingBracketGroup = 12;
  var spacingStaff = 10;
  var spacingSystem = 14;
  var pageMarginTop = 100;
  var pageMarginBottom = 100;
  var pageMarginLeft = 50;
  var pageMarginRight = 50;

  var vrvOptions = {
    pageHeight: height - pageMarginTop,
    pageWidth: width,
    pageMarginLeft: pageMarginLeft,
    pageMarginRight: pageMarginRight,
    pageMarginTop: pageMarginTop,
    pageMarginBottom: pageMarginBottom,
    spacingSystem: spacingSystem,
    spacingStaff: spacingStaff,
    scale: scale,
    adjustPageHeight: 0,
    justifyVertically: 1,
    breaks: global_verovioOptions.BREAKS ? 'encoded' : 'auto',
    mmOutput: 1,
    // justifyIncludeLastPage : 1, // no longer a verovio option?
    // justifySystemOnly   : 1, // no longer a verovio option?
    // justifySystemsOnly  : 1, // no longer a verovio option?
    header: 'auto',
    footer: 'encoded',
    usePgFooterForAll: 1,
    barLineWidth: 0.12,
    staffLineWidth: 0.12,
    font: global_verovioOptions.FONT,
  };

  var scoredata = getAceEditor().getValue().replace(/^\s+/, '');

  var staffcount = getStaffCount(scoredata);
  if (staffcount == 2) {
    //vrvOptions.justifySystemsOnly = 1;
    //vrvOptions.justifyIncludeLastPage = 1;
  }

  vrvOptions = cleanOptions2(scoredata, vrvOptions);
  console.log('PRINTING OPTIONS', vrvOptions);

  RSVP.hash({
    fonts: loadPdfFonts(pdf),
    svglist: vrvWorker.renderAllPages(scoredata, vrvOptions),
  })
    .then(function (data) {
      for (var i = 0; i < data.svglist.length; i++) {
        pdf.addPage({ size: format, layout: orientation });
        var x = 0;
        var y = 0;
        SVGtoPDF(pdf, data.svglist[i], x, y, pdfOptions);
      }
      pdf.end();
      return true;
    })
    .finally(function () {
      // restore the old layout for the VHV  webpage:
      var force = false;
      var page = vrvWorker.page;
      var cleanoldoptions = cleanOptions2(scoredata, oldOptions);
      vrvWorker.redoLayout(oldOptions, true);
      vrvWorker.options = oldOptions;
    });
}

//////////////////////////////
//
// cleanOptions2 -- Remove options that will be processed interally from the data.
//

function cleanOptions2(content, options) {
  var lines = content.match(/[^\r\n]+/g);
  var output = options;
  var setlist = [''];
  var optionsets = {};
  optionsets[''] = {};
  var i;

  for (i = 0; i < lines.length; i++) {
    var matches = lines[i].match(/^!!!verovio([^\s]*):\s*(.*)\s*$/);
    if (!matches) {
      continue;
    }
    if (matches[1] == '-parameter-group') {
      setlist.push(matches[2]);
      continue;
    }
    var mm = matches[2].match(/^\s*([^\s]+)\s+(.*)\s*$/);
    if (!mm) {
      continue;
    }
    var m = matches[1].match(/^-([^\s]+)\s*$/);
    var set = '';
    if (m) {
      set = m[1];
    }
    if (typeof optionsets[set] === 'undefined') {
      optionsets[set] = {};
    }
    optionsets[set][mm[1]] = mm[2];
  }

  for (i = 0; i < setlist.length; i++) {
    if (!optionsets[setlist[i]]) {
      continue;
    }
    var keys = Object.keys(optionsets[setlist[i]]);
    var j;
    var key;
    for (j = 0; j < keys.length; j++) {
      if (typeof output[keys[j]] !== 'undefined') {
        delete output[keys[j]];
      }
    }
  }

  return output;
}
