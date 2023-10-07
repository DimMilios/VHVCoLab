const modalHeader = document.getElementById('introModalLabel');

const currentSection = document.createElement('div');
currentSection.style.backgroundColor = 'white';
currentSection.style.opacity = '0.7';

export function proceedToImportingGuide () {
    window.currentIntroStep = 'scoreEdit';
}

export function proceedToScoreEditGuide () {
    window.currentIntroStep = 'noteSel';
}

export function proceedToNoteSelGuide () {
    window.currentIntroStep = 'comments';
}

export function proceedToCommentsGuide () {
    window.currentIntroStep = 'chordEdit';
}

export function proceedToChordEditGuide () {
    window.currentIntroStep = 'midi';
}

export function proceedToMidiGuide () {
    window.currentIntroStep = 'videoCall';
}

export function proceedToVideoCallGuide () {
    window.currentIntroStep = 'recording';
}

export function proceedToRecGuide () {
    window.currentIntroStep = 'collabMenu';
}

export function proceedToCollabMenuGuide () {
    window.currentIntroStep = 'actionHistory';
}

export function proceedToActionHistoryGuide () {

}