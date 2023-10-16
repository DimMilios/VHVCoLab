import { render } from "lit-html";

const modalHeader = document.getElementById('introModalLabel');
const modalBody = document.getElementById('introModalBody');
const modalContent = document.getElementById('introModalContent')

const fileMenu = document
    .getElementById('file__menu-item')
    .querySelector('ul.dropdown-menu');
const loadFromRepBtn = document
    .getElementById('load-from-repository__submenu-item');

const chordBtns = document
    .getElementById('show-edit-suggest-buttons');

const midiSection = document
    .getElementById('midi-section');

const highlightingDiv = document.createElement('div');
highlightingDiv.id = 'highlighting-intro'
highlightingDiv.style.backgroundColor = 'white';
highlightingDiv.style.opacity = '0.7';
highlightingDiv.style.position = 'fixed';

//adding highlighting div in the document
modalContent.appendChild(highlightingDiv);
//setting the initial values in intro modal
modalHeader.innerText = window.guideText.initial.title;
modalBody.innerText = window.guideText.initial.text;

export function proceedToImportingGuide () {
    window.currentIntroStep = 'importing';

    setIntroModalContent(window.currentIntroStep);
    //UI changes

    fileMenu.classList.add('show');
    fileMenu.style.zIndex = '1060';

    loadFromRepBtn.style.border = 'medium dashed black';
}

export function proceedToScoreEditGuide () {
    revertImportingGuideUIChanges();

    window.currentIntroStep = 'scoreEdit';
    setIntroModalContent(window.currentIntroStep);
}

export function proceedToNoteSelGuide () {
    window.currentIntroStep = 'noteSel';
    setIntroModalContent(window.currentIntroStep);
}

export function proceedToCommentsGuide () {
    window.currentIntroStep = 'comments';
    setIntroModalContent(window.currentIntroStep);
}

export function proceedToChordEditGuide () {
    window.currentIntroStep = 'chordEdit';
    setIntroModalContent(window.currentIntroStep);

    /*
    //UI changes
    chordBtns.style.visibility = 'visible';
    chordBtns.style.zIndex = '1060';

    const {x:modalX, y:modalY, width:modalWidth, height:modalHeight} = modalContent.getBoundingClientRect();
    const {x:btnsX, y:btnsY, width:btnsWidth, height:btnsHeight} = chordBtns.getBoundingClientRect();
    chordBtns.style.left = `${modalX - btnsWidth/2 + modalWidth/2}px`
    chordBtns.style.top = `${modalY + modalHeight + 100}px`

    chordBtns.style.backgroundColor = 'white';
    chordBtns.style.color = 'black';
    */
}

export function proceedToMidiGuide () {
    //revertChordEditGuideUIChanges();

    window.currentIntroStep = 'midi';
    setIntroModalContent(window.currentIntroStep);

    //UI changes
    midiSection.style.zIndex = '1060';
}

export function proceedToVideoCallGuide () {
    revertMidiGuideUIChanges();

    window.currentIntroStep = 'videoCall';
    setIntroModalContent(window.currentIntroStep);
}

export function proceedToRecGuide () {
    window.currentIntroStep = 'recording';
    setIntroModalContent(window.currentIntroStep);

}

export function proceedToCollabMenuGuide () {
    window.currentIntroStep = 'collabMenu';
    setIntroModalContent(window.currentIntroStep);

}

export function proceedToActionHistoryGuide () {
    window.currentIntroStep = 'actionHistory';
    setIntroModalContent(window.currentIntroStep);

}

function setIntroModalContent (introStage) {
    modalHeader.innerText = window.guideText[introStage].title;
    modalBody.innerText = window.guideText[introStage].text;
}

function setCurrentSectionCoords ({x, y, width, height}) {
    highlightingDiv.style.left = `${x}px`;
    highlightingDiv.style.top = `${y}px`;
    highlightingDiv.style.width = `${width}px`;
    highlightingDiv.style.height = `${height}px`;
}

export function revertImportingGuideUIChanges () {
    fileMenu.classList.remove('show');
    loadFromRepBtn.style.border = '';
}
/*
export function revertChordEditGuideUIChanges () {
        chordBtns.style.visibility = 'hidden';
        chordBtns.style.zIndex = '15';
}
*/
export function revertMidiGuideUIChanges () {
    midiSection.style.zIndex = '';
}