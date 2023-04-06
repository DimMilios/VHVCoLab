let crcTable = [];
function makeCRCTable() {
  let c;
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

/**
 * Convert the given string to a CRC-32 checksum.
 * @link https://stackoverflow.com/questions/18638900/javascript-crc32
 *
 * @param {string} str
 * @returns number
 */
export function crc32(str) {
  if (crcTable.length === 0) {
    crcTable = makeCRCTable();
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

let encoder;
function getEncoder() {
  if (!('TextEncoder' in window)) {
    console.error('This browser does not support TextEncoder');
    return;
  }
  if (encoder === undefined) encoder = new TextEncoder();

  return encoder;
}

/**
 * Convert the given string to a SHA-1 digest.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 *
 * @param {string} message
 * @returns {Promise<string>} sha1 digest
 */
export async function digestMessage(message) {
  if (!('crypto' in window)) {
    console.error('This browser does not support crypto API');
    return;
  }

  try {
    const encoded = getEncoder().encode(message);
    const digest = await crypto.subtle.digest('SHA-1', encoded); // hash the message
    const hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''); // convert bytes to hex string
    return hashHex;
  } catch (error) {
    console.error(error);
    return Promise.reject('unable to create digest');
  }
}

/**
 * Compare two SHA-1 hashes.
 *
 * @param {string} hash1
 * @param {string} hash2
 */
export function compareHexHashes(hash1, hash2) {
  if (hash1.length !== hash2.length) return false;
  return hash1 === hash2;
}
