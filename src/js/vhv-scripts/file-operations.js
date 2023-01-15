import { getAceEditor } from './setup.js';
import { getVrvWorker } from '../humdrum-notation-plugin-worker.js';

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
    file = await loadFileFromRepository(params.get('file'));
  }

  // if (file) {
  getAceEditor()?.session.setValue(file);
  return params.get('file');
  // }
}

export async function promptForFile() {
  let url = window.prompt('Enter the URL of a krn file:');

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
