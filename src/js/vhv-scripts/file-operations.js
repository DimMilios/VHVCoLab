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

    input.addEventListener('change', event => {
      if (event.target.files.length == 0)
        return;
      let file = event.target.files[0];

      let extension = file.name.slice(file.name.lastIndexOf('.'));
      if (!ACCEPTED_FORMATS.split(',').includes(extension)) {
        console.error('The format of this file is not supported');
        return;
      }

      let reader = new FileReader();
      reader.addEventListener('load', e => {
        let fileContent = e.target.result.toString();
        getAceEditor().session.setValue(fileContent);
      });
      reader.readAsText(file);
    });
    document.body.appendChild(input);
  }

  input.click();
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

export async function promptForFile() {
  let url = window.prompt("Enter the URL of a krn file:");

  let fileContent = await loadFileFromRepository(url);
  console.log(fileContent);
}
window.promptForFile = promptForFile;

/**
 * 
 * @param {string} url 
 * @returns 
 */
export async function loadFileFromRepository(url) {
  if (!isValidHttpUrl(url) || !url.endsWith('.krn')) {
    return Promise.reject('Invalid repository URL');
  }

  try {
    let res = await fetch(url);
    return await res.text();
  } catch(err) {
    console.log(err);
  }
}

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}