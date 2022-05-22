## Change Log

### 2022/05/22
- Implemented open file from disk functionality for supported file formats (`.krn`, `.xml`, `.musicxml`, `.mei`).
- Implemented save current song as MIDI functionality
- Enable parsing of URL filter parameters (e.g. starting VHV by specifying a `.krn` file hosted in a remote repository, `?file=file_name_from_github.krn`)

### 2022/05/20
- Fix scrolling issue when rendering scores that are larger than viewport

### 2022/05/19
- Cleaned up useless files
- Relocated `CSS` stylesheet from `public` directory to `src/css` so that **Vite** has access to them,
includes them in the `CSS` bundle and its configuration can be applied to these stylesheets
- Load production Verovio worker scripts from *JSDelivr*
- Add GitHub Pages deployment script

### 2022/05/18
- Move note bound variables calculated after a note multi selection to a more appropriate store
- Use elements of this store to stop the MIDI player when it reaches the right most note bound

### 2022/05/17
- `Git` now tracks `dist` directory to handle deployment of the app's static version
- Rename toggling options about the feature previously named `WaveSurfer` to `Sound Editor`
- Starting multi selecting via **Rubber Banding** no longer resets the global `CursorNote` element
  - `src/js/vhv-scripts/listeners.js`, line 220
- Work in progress: GitHub [Issue](https://github.com/DimMilios/vite-scaffold/issues/5)
    - GitHub branch: (https://github.com/DimMilios/vite-scaffold/tree/multi-select-playback)
