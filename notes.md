## Initial score loading
The initial `krn` file loaded from Verovio Humdrum Viewer is set in the `index.md` file located
in the project's root directory. The `splash` attribute is used to load the specified `krn` file.
Remove the attribute so that no initial humdrum file is loaded and the ace editor is empty.
Some 'krn' files can be found in the `./_includes/splash` directory.
```
---
layout: default
permalink: /index.html
splash: chopin-wiosna.krn
---
```

## Ace events debouncing
If there is performance issues we can enable `SVG` rendering after a short timeout instead of updating
the `SVG` on every local or remote editor update. The `change` event handler for Ace is currently added
in the `initializeVerovioToolkit` function located in `./_includes/vhv-scripts/misc.js/`.
Simply, enable notation update monitoring using `setTimeout`.
```javascript
setTimeout(() => {
  monitorNotationUpdating();
}, 5000);
```

## SVG Elements structure
The `g` note elements are given an ID constisting of the *line*, the *field* (column) and the *spine* (humdrum column) they can be found in the `Ace` editor. e.g For a note in **line 29** and **field 3** the generated ID would be: ```note-L29F3```.
</br> For three notes of a *chord* in **line 29** and **field 3** their IDs would be (lowest to highest pitch): 
```
note-L29F3S3
note-L29F3S2
note-L29F3S1
```
**Note**: Consider what happens to the *accidentals* of a note afterwards.

## Rendering cycle
**Important**: the way the app currently converts `Humdrum` to `SVG` is by updating the text content of the Ace Editor and then re-rendering
the whole `SVG` page so it displays the updated text contentusing the Verovio Web Worker by calling `displayNotation` in `_includes/vhv-scripts/misc.js`.

## Authentication for the WebSocket Provider
[System design consideration (websockets python library)](https://websockets.readthedocs.io/en/latest/topics/authentication.html)