let productionURL = new URL('http://test.com');
let baseUrl = import.meta.env.DEV ? new URL('http://localhost:3001/') : productionURL;

let noop = () => {};

const create = async ({ data, onSuccess = noop, onError = noop }) => {
  let url = baseUrl + 'api/comments';

  try {
    let response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  
    let json = await response.json();
    if (response.status >= 200 && response.status < 300) {
      onSuccess(json);
    }
  } catch(error) {
    onError(error);
  }
}

const removeById = async (id, { data, onSuccess = noop, onError = noop }) => {
  let url = `${baseUrl}api/comments/${id}`;

  try {
    let response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  
    let json = await response.json();
    if (response.status >= 200 && response.status < 300) {
      onSuccess(json);
    }
  } catch(error) {
    onError(error);
  }
}

export {
  create,
  removeById
}