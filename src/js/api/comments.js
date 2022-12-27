import { noop, baseUrl } from './util.js';

const create = async ({ data, onSuccess = noop, onError = noop }) => {
  let url = baseUrl + 'api/comments';

  try {
    let response = await fetch(url, {
      method: 'POST',
      // credentials: 'include',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    let json = await response.json();
    if (response.ok) {
      onSuccess(json);
    }
  } catch (error) {
    onError(error);
  }
};

const removeById = async (id, { data, onSuccess = noop, onError = noop }) => {
  let url = `${baseUrl}api/comments/${id}`;

  try {
    let response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    let json = await response.json();
    if (response.ok) {
      onSuccess(json);
    }
  } catch (error) {
    onError(error);
  }
};

const removeByDocumentId = async (
  documentId,
  { data, onSuccess = noop, onError = noop }
) => {
  let url = `${baseUrl}api/comments`;

  try {
    let response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify({ ...data, documentId }),
      headers: { 'Content-Type': 'application/json' },
    });

    let json = await response.json();
    if (response.ok) {
      onSuccess(json);
    }
  } catch (error) {
    onError(error);
  }
};

export { create, removeById, removeByDocumentId };
