import { isValidHttpUrl } from '../vhv-scripts/file-operations';

export function getURLParams(keys = []) {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

export function getURLInfo() {
  let urlParams = getURLParams();
  let file = urlParams?.file;

  // Extract the file name for the file passed from URL
  // The file is stored in MusiCoLab's file repository
  if (file && isValidHttpUrl(file)) {
    file = Object.fromEntries(new URL(file).searchParams)?.f;
  }
  // console.log({ ...urlParams, file });

  return {
    ...urlParams,
    file,
  };
}

export async function fetchRoom(file, username) {
  try {
    // Get the shared document id for this WebSocket connection
    const response = await fetch(
      `${baseUrl}/api/documents/room-id?fileName=${file}&username=${username}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { documents, usersForCurrentDocument } = await response.json();
    if (documents?.length > 0 && documents[0]?.document_id) {
      return {
        documentId: documents[0].document_id,
        room: `docId=${documents[0].document_id.toString()}&fileName=${file}`,
        usersForCurrentDocument: usersForCurrentDocument ?? [],
      };
    }
  } catch (err) {
    console.log(err);
  }
}

export let noop = () => {};

const isSecure = (protocol = 'https') => {
  return window.location.protocol.includes(protocol);
};

// export let baseUrl = 'http://localhost:8080/';
// export let wsBaseUrl = 'ws://localhost:8080';

let productionOrigin = 'musicolab.hmu.gr:8080/';
// let productionOrigin = '147.95.40.74:8080';
export let baseUrl = import.meta.env.DEV
  ? 'http://localhost:8080/'
  : `${isSecure() ? 'https' : 'http'}://${productionOrigin}`;

export let wsBaseUrl = import.meta.env.DEV
  ? 'ws://localhost:8080'
  : `${isSecure() ? 'wss' : 'ws'}://${productionOrigin}`;

// const herokuWs = 'wss://vhv-ws-server.herokuapp.com';
// const flyIoWs = 'wss://vhv-api.fly.dev';
