## Προαπαιτούμενα
Πρέπει να είναι εγκατεστημένα:
- `node.js` ([download](https://nodejs.dev/download))
- `npm` (Κατεβαίνει μαζί με το `node.js`)

## Λήψη του project από το Github
- Αν υπάρχει το `git` εγκατεστημένο:
  ```sh
  git clone https://github.com/DimMilios/vite-scaffold.git
  ```
- Διαφορετικά πατώντας `Code>Download ZIP` στη σελίδα του project στο Github.

## Εγκατάσταση dependencies και development
Μετά τη λήψη των αρχείων του project:
  - Εγκατάσταση βιβλιοθηκών
    ```sh
    npm install
    ```
  - Εκκίνηση της εφαρμογής στο `http://localhost:3000`
    ```sh
    npm run dev
    ```

## Αρχεία που ενδιαφέρουν

### MIDI Player
- `/public/scripts/midiplayer`
- `/src/js/midifunctions.js`

### Verovio toolkit
- `/public/scripts/local/humdrumValidator.js`
- `/public/scripts/local/verovio-calls.js`
- `/public/scripts/local/verovio-toolkit-wasm.js`

### Αρχεία του Verovio Humdrum Viewer
- `/src/js/vhv-scripts/*`