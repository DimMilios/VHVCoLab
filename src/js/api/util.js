export function getURLParams(keys = []) {
  let params = new URL(document.location).searchParams;

  return keys
    .map((key) => ({ [key]: params.get(key) }))
    .reduce((prev, curr) => Object.assign({}, prev, curr), {});
}

export let noop = () => {};

let productionURL = new URL('http://localhost:3001/'); // Replace when we have a server
export let baseUrl = import.meta.env.DEV
  ? new URL('http://localhost:3001/')
  : productionURL;
