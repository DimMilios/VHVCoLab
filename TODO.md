# Todos

## Svg Interaction
- Click listener interaction:
  - A `click` eventListener is added on body in the `_includes/vhv-scripts/listeners.js` file.
  - If the element clicked is found in the SVG the function `dataIntoView` found in: `_includes/vhv-scripts/misc.js` is called by passing it the DOM event.
  - Depending on the editor mode (`XML`/`Humdrum`), the `xmlDataIntoView` or `humdrumDataIntoView` function is called by passing it the DOM event, respectively.
  - `humdrumDataIntoView` calls the editor function `highlightIdInEditor` to jump to the corresponding `XML`/`Humdrum` selected SVG note.

### SVG Collaborative addition
- First step should be to add the number displaying functionality when clicking on a note (simply show `1` when clicking on a note).
- Inject code for collaborative interaction in the `humdrumDataIntoView` function, which checks the existence of the element in the editor and calculates note data and the DOM or MEI element ID.
- The clients would be implemented using the `Websocket` protocol, so that each client connected could display the number of connected clients having the same note selected. Those clients would be `synced` by connecting to a server implementing the `Websocket` protocol and being updated in close to real-time.

## Important
### Multi Note Selection
- [x] Add the ability for a user to select multiple note elements (e.g a whole measure, two measures or "incomplete" selection (one note of measure 1 and three notes from measure 2 etc.))
- [x] Select multiple notes using `Rubber banding`. Select notes by click on the Left Mouse button and dragging it so it includes the note elements.
- Vanilla `JavaScript` implementation to check: https://codepen.io/ArtBIT/pen/KOdvjM
- Currently, the multi selection process is:
  - Find the leftmost, rightmost, topmost and bottommost note element.
  - The width of the multi select area is the max right (furthest) value minus the min left value (`right - left`)
  - The height of the multi select area is the max bottom (furthest on Y-axis) value minus the min top value (`bottom - top`)

### TODOs
  - The `SVG` music score elements are nested like:
    ```yml
    g.system
      g.measure
        g.staff
          g.layer
            g.note
    ```
- [x] Draw a username (maybe part of the `uuid`) above a note instead of the currently connected users selecting on that note number.
- [] The elements displaying note element position information for users isn't being updated when scrolling, since they are positioned with: `position: absolute`.

### Bugs
- **FIXED** Calling `event.preventDefault()` on the `mousedown` eventListener was causing this issue.
  - Swapping between the `ace` editor and `SVG` contexts broke when selecting notes.
  Selecting on a note through the `Humdrum` notation and then clicking on a note from the `SVG` no longer gives focus back to the `SVG` panel. Thus, keyboard listeners (moving to the previous/next note with *arrow* keys no longer works).

## Secondary
### Handle User note editing
- Consider if a note should be editable by every user or just the creator of the note.
- **Interim feedback**: When a user is trying to edit a note display what the next state of that note after the users action would be.
  - Keep a reference to the old note state. The authorized user (could be the note creator or authorized some other way) can then either *accept* or *deny* the proposed note state.
  - Start by injecting code in the key listeners for music score editing like `shift up`, `shift down` etc.
  - Example of transposing notes up/down (`CSS` class values)
    ```
    old:            pname-f oct-5 b40c-19 b12c-5
    shift + up:     pname-g oct-5 b40c-25 b12c-7
    ctrl + down:    pname-g oct-4 b40c-25 b12c-7
    2x ctrl + down: pname-g oct-3 b40c-25 b12c-7
    ```
  - An idea that came to mind: when transposing notes keep the old note in the `Humdrum` text content and add the next position of the note to form a chord.
  </br> Simply include both notes by separating them with space, e.g ```16a 16b```
    - Issues:
      - Not sure if we can produce scenarios where the `MIDI` output renders either one of the notes (they 'll be both played, treated as normal chord). In case we would want to play the two different versions of that note.
      - It's hard to differentiate between some notes, since they are so close in pitch. e.g ```16a 16b```. The user would have to zoom in to be able to inspect the note elements for differences.

- Is a "session" mechanism required?
  - If so, how is *floor control* (currently active user) handled? Should *floor control* even exist?
  - [MusicNet Video with Feature display](https://youtu.be/GyUu_L8t7rs?t=472)

### TODOs
- [x] Drop `userMap` and `userColorMap` objects in favor of `awareness` local state objects. Construct application state from `awareness` objects received from its event listeners.
- [x] Add stack based undo from https://github.com/yjs/y-codemirror/blob/main/src/y-codemirror.js

## WebsocketProvider
Run a `Websocket` server locally
```bash
cd ~/web/express-session-parse
```
Run the server (environment variables can be omitted)
```bash
HOST=127.0.0.1 PORT 9000 node bin/server.js
```
OR
```bash
Run the pre-defined server from y-websocket listening at `localhost:9000`
```
```bash
HOST=localhost PORT 9000 npx y-websocket-server
```

## Refactoring
The `timemap` module found in `_includes/vhv-scripts/` isn't currently used.

### Next steps for refactoring
- [x] Start moving project over to `NPM` with `Vite` + `Rollup` for bundling.
- [] Remove the `.aton` menu files and the `ATON` parser needed (`scripts/aton.js`). We don't really need to worry about Internationalization and if we do we can parse the `.aton` files to `JSON` and use them.
- [] Consider removing `basket`/`basket-session` and its dependencies (`rsvp`). What is `basket` used for anymore? The `MIDI` scripts were saved to `localStorage` using `basket` (Why???). Now they will be loaded as `JavaScript` scripts or `ES6` modules. `rsvp` is literally the `Promise` api so we don't really need it.
- [] Consider removing the dependency on `handlebars`. It is only used for the menu bar.
- [] Remove unused buttons from the menu (`Analysis`, `languages`). Plus unused menu options.
#### Global Variables
We still expose many global variables to make the app functional. This creates a problem when building the app since the NPM scripts that are bundled get minified, hashed, etc. which means that scripts located in the `public/scripts` folder no longer know the names of the global variables exposed.
#### Scripts to turn into `ES6` modules:
  - [] `scripts/local/humdrum-notation-plugin-worker-copy.js`: intializes the `Web Worker` running `Verovio` toolkit functions and contains functions for the `Humdrum` notation plugin
  - [] `scripts/midiplayer/midiplayer.js`: `MIDI` player by the `Verovio` team. Not sure how possible it is to turn this script into an `ES6` module, since it uses `jQuery` and changes its prototype. Also, it depends on the `MidiModule` found in `scripts/midiplayer/wildwebmidi.js` which is generated by `EMScripten`.
#### Scripts that can be found in npm:
  - [x] `Ace-builds`: replace the way the `Ace` editor is being loaded. (Currently from the scripts in `scripts/ace`) [NPM](https://www.npmjs.com/package/ace-builds)
  - [x] `Yjs`: All of the scripts related to `Yjs` can be found on NPM.
  - [] `pdfkit`: can be found on [NPM](https://www.npmjs.com/package/pdfkit)
  - [] `scripts/FileSave.js`: The project has evolved into being an NPM package [Github repo](https://github.com/eligrey/FileSaver.js)

## Dependencies
The wasm verovio toolkit script `scripts/local/verovio-toolkit-wasm.js` has to be downloaded locally since it is in `.gitignore` cause it's a big file (8.6MB)

### Issues with pdfkit
`pdfkit` has a dependency `fontkit` which uses decorators in its codebase. `Vite` and more specifically `esbuild` doesn't know how to handle decorators when trying to prebundle the npm dependencies so it breaks. A workaround suggested [here](https://github.com/vitejs/vite/issues/2349) recommends renaming the files using decorators from `.js` to `.ts`. Files to rename:
- `src/TTFFont.js`
- `src/CmapProcessor.js`
- `src/glyph/Glyph.js`
- `src/aat/AATMorxProcessor.js`
- `src/aat/AATLookupTable.js`