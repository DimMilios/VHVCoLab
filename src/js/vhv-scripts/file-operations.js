import { getAceEditor } from './setup.js';
import { getVrvWorker } from '../humdrum-notation-plugin-worker.js';
import { featureIsEnabled } from '../bootstrap.js';
import { yUndoManager } from '../yjs-setup.js';
import { getURLInfo } from '../api/util.js';

const ACCEPTED_FORMATS = '.xml,.musicxml,.mei,.krn';

export function openFileFromDisk() {
  let input = document.getElementById('file-input');
  if (!input) {
    input = document.createElement('input');
    input.setAttribute('id', 'file-input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.xml,.musicxml,.mei,.krn');
    input.style.display = 'none';

    input.addEventListener('change', (event) => {
      if (event.target.files.length == 0) return;
      let file = event.target.files[0];

      let extension = file.name.slice(file.name.lastIndexOf('.'));
      if (!ACCEPTED_FORMATS.split(',').includes(extension)) {
        console.error('The format of this file is not supported');
        return;
      }

      let reader = new FileReader();
      reader.addEventListener('load', (e) => {
        let fileContent = e.target.result.toString();
        getAceEditor().session.setValue(fileContent);
      });
      reader.readAsText(file);
    });
    document.body.appendChild(input);
  }

  input.click();
}

//kalohr
export async function saveContentAsMIDIUpload(chunks) {
  let base64Midi = await getVrvWorker().renderToMidi();
  //let song = 'data:audio/midi;base64,' + base64Midi;
  let song = base64Midi;
  let fd = new FormData();
  fd.append('action', 'synchronization');
  let midifile = new Blob([song], { type: 'audio/midi' });
  fd.append('file', midifile, 'themid');
  let audiofile = new Blob(chunks, { type: 'audio' });
  fd.append('blob', audiofile, 'blobname');
  var ajax = new XMLHttpRequest();
  ajax.open(
    'post',
    'https://musicolab.hmu.gr/apprepository/synchroniseScoreAudioResp.php',
    true
  );
  ajax.send(fd);
}

export async function saveContentAsMIDI() {
  let base64Midi = await getVrvWorker().renderToMidi();
  let song = 'data:audio/midi;base64,' + base64Midi;

  let element = document.createElement('a');
  element.setAttribute('download', 'data.mid');
  element.style.display = 'none';
  element.setAttribute('href', song);

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function exportKernToPrivateFiles() {
  const content = getAceEditor()?.session.getValue();
  if (content === undefined || content.length === 0) {
    console.error('Failed to export empty Kern content');
    return;
  }

  const { file: filenameFromURL } = getURLInfo();
  let scoreName = filenameFromURL;
  const scoreMeta = sessionStorage.getItem('score-metadata');
  if (scoreMeta === null) {
    console.warn('Could not find metadata for this score. Using URL filename as title.');
  } else {
    scoreName = JSON.parse(scoreMeta).title + '.krn';
    // scoreName = title.split(' ').join('_') + '.krn';
  }

  let fd = new FormData();
  let file = new File([content], scoreName);
  fd.append('f', file);
  fd.append('action', 'upload');
  fd.append('ufolder', 'private');

  const ajax = new XMLHttpRequest();
  ajax.addEventListener('load', () => {
    alert('File has been exported to your private files!');
  });
  ajax.addEventListener('error', () => {
    alert('Failed to export score to your private files');
  });

  ajax.open(
    'post',
    'https://musicolab.hmu.gr/apprepository/uploadFileResAjax.php',
    true
  );
  ajax.send(fd);
}

export async function loadFileFromURLParam() {
  let params = new URLSearchParams(window.location.search);
  if (!params.has('file')) {
    return;
  }

  let file;
  if (import.meta.env.DEV) {
    // Load file locally for development
    let module = await import(`../../${params.get('file')}?raw`);
    if (module) {
      file = module.default;
      console.log({ module, value: file });
    }
  } else {
    // Load file from remote repository
    file = await loadFileFromRepository(atob(params.get('file')));
  }

  if (file) {
    getAceEditor()?.session.setValue(file);
    if (featureIsEnabled('collaboration')) {
      // Reset collaborative undo stack for this initialization from file
      yUndoManager.clear();
    }
    return params.get('file');
  }
}

export async function promptForFile() {
  let params = new URLSearchParams(window.location.search);
  // Initialize with repository URL for kern file if present on the browser URL
  let defaultUrl = params.has('file') ? atob(params.get('file')) : '';

  let url = window.prompt('Enter the URL of a krn file:', defaultUrl);

  try {
    let fileContent = await loadFileFromRepository(url);
    if (fileContent.length > 0) {
      getAceEditor()?.session.setValue(fileContent);
    }
  } catch (err) {}
}

/**
 *
 * @param {string} url
 * @returns
 */
async function loadFileFromRepository(url) {
  if (!isValidHttpUrl(url) || !url.endsWith('.krn')) {
    return Promise.reject('Invalid repository URL');
  }

  try {
    let res = await fetch(url);
    return await res.text();
  } catch (err) {
    console.log(err);
  }
}

export function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
