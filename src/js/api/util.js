export function getURLParams(keys = []) {
  let params = new URL(window.location.href).searchParams;

  return keys
    .map((key) => ({ [key]: params.get(key) }))
    .reduce((prev, curr) => Object.assign({}, prev, curr), {});
}

export let noop = () => {};

const isSecure = (protocol = 'https') => {
  return window.location.protocol.includes(protocol);
};

let productionOrigin = 'vhv-ws-server.herokuapp.com';
export let baseUrl = import.meta.env.DEV
  ? 'http://localhost:3001/'
  : `${isSecure() ? 'https' : 'http'}://${productionOrigin}`;

let wsProductionOrigin = 'vhv-ws-server.herokuapp.com';
export let wsBaseUrl = import.meta.env.DEV
  ? 'ws://localhost:3001'
  : `${isSecure() ? 'wss' : 'ws'}://${wsProductionOrigin}`;
