import { noop, baseUrl } from './util.js';

const getByDocumentId = async (documentId, { onSuccess = noop, onError = noop }) => {
  let url = `${baseUrl}api/users?docId=${documentId}`;

  try {
    let response = await fetch(url, { credentials: 'include' });
  
    let json = await response.json();
    if (response.ok) {
      onSuccess(json);
      return json;
    }
  } catch(error) {
    onError(error);
  }
}

export {
  getByDocumentId
}