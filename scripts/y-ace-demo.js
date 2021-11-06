(function () {
  'use strict';

  /**
   * Utility module to work with key-value stores.
   *
   * @module map
   */

  /**
   * Creates a new Map instance.
   *
   * @function
   * @return {Map<any, any>}
   *
   * @function
   */
  const create = () => new Map();

  /**
   * Copy a Map object into a fresh Map object.
   *
   * @function
   * @template X,Y
   * @param {Map<X,Y>} m
   * @return {Map<X,Y>}
   */
  const copy = m => {
    const r = create();
    m.forEach((v, k) => { r.set(k, v); });
    return r
  };

  /**
   * Get map property. Create T if property is undefined and set T on map.
   *
   * ```js
   * const listeners = map.setIfUndefined(events, 'eventName', set.create)
   * listeners.add(listener)
   * ```
   *
   * @function
   * @template T,K
   * @param {Map<K, T>} map
   * @param {K} key
   * @param {function():T} createT
   * @return {T}
   */
  const setIfUndefined = (map, key, createT) => {
    let set = map.get(key);
    if (set === undefined) {
      map.set(key, set = createT());
    }
    return set
  };

  /**
   * Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
   *
   * @function
   * @template K
   * @template V
   * @template R
   * @param {Map<K,V>} m
   * @param {function(V,K):R} f
   * @return {Array<R>}
   */
  const map = (m, f) => {
    const res = [];
    for (const [key, value] of m) {
      res.push(f(value, key));
    }
    return res
  };

  /**
   * Tests whether any key-value pairs pass the test implemented by `f(value, key)`.
   *
   * @todo should rename to some - similarly to Array.some
   *
   * @function
   * @template K
   * @template V
   * @param {Map<K,V>} m
   * @param {function(V,K):boolean} f
   * @return {boolean}
   */
  const any = (m, f) => {
    for (const [key, value] of m) {
      if (f(value, key)) {
        return true
      }
    }
    return false
  };

  /**
   * Utility module to work with sets.
   *
   * @module set
   */

  const create$1 = () => new Set();

  /**
   * Utility module to work with Arrays.
   *
   * @module array
   */

  /**
   * Return the last element of an array. The element must exist
   *
   * @template L
   * @param {Array<L>} arr
   * @return {L}
   */
  const last = arr => arr[arr.length - 1];

  /**
   * Transforms something array-like to an actual Array.
   *
   * @function
   * @template T
   * @param {ArrayLike<T>|Iterable<T>} arraylike
   * @return {T}
   */
  const from = Array.from;

  /**
   * Observable class prototype.
   *
   * @module observable
   */

  /**
   * Handles named events.
   *
   * @template N
   */
  class Observable {
    constructor () {
      /**
       * Some desc.
       * @type {Map<N, any>}
       */
      this._observers = create();
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    on (name, f) {
      setIfUndefined(this._observers, name, create$1).add(f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    once (name, f) {
      /**
       * @param  {...any} args
       */
      const _f = (...args) => {
        this.off(name, _f);
        f(...args);
      };
      this.on(name, _f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    off (name, f) {
      const observers = this._observers.get(name);
      if (observers !== undefined) {
        observers.delete(f);
        if (observers.size === 0) {
          this._observers.delete(name);
        }
      }
    }

    /**
     * Emit a named event. All registered event listeners that listen to the
     * specified name will receive the event.
     *
     * @todo This should catch exceptions
     *
     * @param {N} name The event name.
     * @param {Array<any>} args The arguments that are applied to the event listener.
     */
    emit (name, args) {
      // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
      return from((this._observers.get(name) || create()).values()).forEach(f => f(...args))
    }

    destroy () {
      this._observers = create();
    }
  }

  /**
   * Common Math expressions.
   *
   * @module math
   */

  const floor = Math.floor;
  const abs = Math.abs;
  const log10 = Math.log10;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The smaller element of a and b
   */
  const min = (a, b) => a < b ? a : b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The bigger element of a and b
   */
  const max = (a, b) => a > b ? a : b;

  /**
   * @param {number} n
   * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
   */
  const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0;

  /**
   * Utility module to work with strings.
   *
   * @module string
   */

  const fromCharCode = String.fromCharCode;

  /**
   * @param {string} s
   * @return {string}
   */
  const toLowerCase = s => s.toLowerCase();

  const trimLeftRegex = /^\s*/g;

  /**
   * @param {string} s
   * @return {string}
   */
  const trimLeft = s => s.replace(trimLeftRegex, '');

  const fromCamelCaseRegex = /([A-Z])/g;

  /**
   * @param {string} s
   * @param {string} separator
   * @return {string}
   */
  const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  const _encodeUtf8Polyfill = str => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = /** @type {number} */ (encodedString.codePointAt(i));
    }
    return buf
  };

  /* istanbul ignore next */
  const utf8TextEncoder = /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null);

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  const _encodeUtf8Native = str => utf8TextEncoder.encode(str);

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  /* istanbul ignore next */
  const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;

  /* istanbul ignore next */
  let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

  /* istanbul ignore next */
  if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
    // Safari doesn't handle BOM correctly.
    // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
    // Another issue is that from then on no BOM chars are recognized anymore
    /* istanbul ignore next */
    utf8TextDecoder = null;
  }

  /**
   * Often used conditions.
   *
   * @module conditions
   */

  /**
   * @template T
   * @param {T|null|undefined} v
   * @return {T|null}
   */
  /* istanbul ignore next */
  const undefinedToNull = v => v === undefined ? null : v;

  /* global localStorage */

  /**
   * Isomorphic variable storage.
   *
   * Uses LocalStorage in the browser and falls back to in-memory storage.
   *
   * @module storage
   */

  /* istanbul ignore next */
  class VarStoragePolyfill {
    constructor () {
      this.map = new Map();
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    setItem (key, value) {
      this.map.set(key, value);
    }

    /**
     * @param {string} key
     */
    getItem (key) {
      return this.map.get(key)
    }
  }

  /* istanbul ignore next */
  /**
   * @type {any}
   */
  let _localStorage = new VarStoragePolyfill();

  try {
    // if the same-origin rule is violated, accessing localStorage might thrown an error
    /* istanbul ignore next */
    if (typeof localStorage !== 'undefined') {
      _localStorage = localStorage;
    }
  } catch (e) { }

  /* istanbul ignore next */
  /**
   * This is basically localStorage in browser, or a polyfill in nodejs
   */
  const varStorage = _localStorage;

  /**
   * Isomorphic module to work access the environment (query params, env variables).
   *
   * @module map
   */

  /* istanbul ignore next */
  // @ts-ignore
  const isNode = typeof process !== 'undefined' && process.release && /node|io\.js/.test(process.release.name);
  /* istanbul ignore next */
  const isBrowser = typeof window !== 'undefined' && !isNode;
  /* istanbul ignore next */
  const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

  /**
   * @type {Map<string,string>}
   */
  let params;

  /* istanbul ignore next */
  const computeParams = () => {
    if (params === undefined) {
      if (isNode) {
        params = create();
        const pargs = process.argv;
        let currParamName = null;
        /* istanbul ignore next */
        for (let i = 0; i < pargs.length; i++) {
          const parg = pargs[i];
          if (parg[0] === '-') {
            if (currParamName !== null) {
              params.set(currParamName, '');
            }
            currParamName = parg;
          } else {
            if (currParamName !== null) {
              params.set(currParamName, parg);
              currParamName = null;
            }
          }
        }
        if (currParamName !== null) {
          params.set(currParamName, '');
        }
      // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
      } else if (typeof location === 'object') {
        params = create()
        // eslint-disable-next-line no-undef
        ;(location.search || '?').slice(1).split('&').forEach(kv => {
          if (kv.length !== 0) {
            const [key, value] = kv.split('=');
            params.set(`--${fromCamelCase(key, '-')}`, value);
            params.set(`-${fromCamelCase(key, '-')}`, value);
          }
        });
      } else {
        params = create();
      }
    }
    return params
  };

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* istanbul ignore next */
  const hasParam = name => computeParams().has(name);
  // export const getArgs = name => computeParams() && args

  /**
   * @param {string} name
   * @return {string|null}
   */
  /* istanbul ignore next */
  const getVariable = name => isNode ? undefinedToNull(process.env[name.toUpperCase()]) : undefinedToNull(varStorage.getItem(name));

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* istanbul ignore next */
  const hasConf = name => hasParam('--' + name) || getVariable(name) !== null;

  /* istanbul ignore next */
  const production = hasConf('production');

  /* eslint-env browser */

  /**
   * Binary data constants.
   *
   * @module binary
   */

  /**
   * n-th bit activated.
   *
   * @type {number}
   */
  const BIT1 = 1;
  const BIT2 = 2;
  const BIT3 = 4;
  const BIT4 = 8;
  const BIT6 = 32;
  const BIT7 = 64;
  const BIT8 = 128;
  const BITS5 = 31;
  const BITS6 = 63;
  const BITS7 = 127;
  /**
   * @type {number}
   */
  const BITS31 = 0x7FFFFFFF;

  /**
   * Efficient schema-less binary decoding with support for variable length encoding.
   *
   * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module decoding
   */

  /**
   * A Decoder handles the decoding of an Uint8Array.
   */
  class Decoder {
    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array) {
      /**
       * Decoding target.
       *
       * @type {Uint8Array}
       */
      this.arr = uint8Array;
      /**
       * Current decoding position.
       *
       * @type {number}
       */
      this.pos = 0;
    }
  }

  /**
   * @function
   * @param {Uint8Array} uint8Array
   * @return {Decoder}
   */
  const createDecoder = uint8Array => new Decoder(uint8Array);

  /**
   * @function
   * @param {Decoder} decoder
   * @return {boolean}
   */
  const hasContent = decoder => decoder.pos !== decoder.arr.length;

  /**
   * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder The decoder instance
   * @param {number} len The length of bytes to read
   * @return {Uint8Array}
   */
  const readUint8Array = (decoder, len) => {
    const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
    decoder.pos += len;
    return view
  };

  /**
   * Read variable length Uint8Array.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder
   * @return {Uint8Array}
   */
  const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

  /**
   * Read one byte as unsigned integer.
   * @function
   * @param {Decoder} decoder The decoder instance
   * @return {number} Unsigned 8-bit integer
   */
  const readUint8 = decoder => decoder.arr[decoder.pos++];

  /**
   * Read unsigned integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarUint = decoder => {
    let num = 0;
    let len = 0;
    while (true) {
      const r = decoder.arr[decoder.pos++];
      num = num | ((r & BITS7) << len);
      len += 7;
      if (r < BIT8) {
        return num >>> 0 // return unsigned number!
      }
      /* istanbul ignore if */
      if (len > 35) {
        throw new Error('Integer out of range!')
      }
    }
  };

  /**
   * Read signed integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   * @todo This should probably create the inverse ~num if unmber is negative - but this would be a breaking change.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarInt = decoder => {
    let r = decoder.arr[decoder.pos++];
    let num = r & BITS6;
    let len = 6;
    const sign = (r & BIT7) > 0 ? -1 : 1;
    if ((r & BIT8) === 0) {
      // don't continue reading
      return sign * num
    }
    while (true) {
      r = decoder.arr[decoder.pos++];
      num = num | ((r & BITS7) << len);
      len += 7;
      if (r < BIT8) {
        return sign * (num >>> 0)
      }
      /* istanbul ignore if */
      if (len > 41) {
        throw new Error('Integer out of range!')
      }
    }
  };

  /**
   * Read string of variable length
   * * varUint is used to store the length of the string
   *
   * Transforming utf8 to a string is pretty expensive. The code performs 10x better
   * when String.fromCodePoint is fed with all characters as arguments.
   * But most environments have a maximum number of arguments per functions.
   * For effiency reasons we apply a maximum of 10000 characters at once.
   *
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String.
   */
  const readVarString = decoder => {
    let remainingLen = readVarUint(decoder);
    if (remainingLen === 0) {
      return ''
    } else {
      let encodedString = String.fromCodePoint(readUint8(decoder)); // remember to decrease remainingLen
      if (--remainingLen < 100) { // do not create a Uint8Array for small strings
        while (remainingLen--) {
          encodedString += String.fromCodePoint(readUint8(decoder));
        }
      } else {
        while (remainingLen > 0) {
          const nextLen = remainingLen < 10000 ? remainingLen : 10000;
          // this is dangerous, we create a fresh array view from the existing buffer
          const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
          decoder.pos += nextLen;
          // Starting with ES5.1 we can supply a generic array-like object as arguments
          encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
          remainingLen -= nextLen;
        }
      }
      return decodeURIComponent(escape(encodedString))
    }
  };

  /**
   * @param {Decoder} decoder
   * @param {number} len
   * @return {DataView}
   */
  const readFromDataView = (decoder, len) => {
    const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
    decoder.pos += len;
    return dv
  };

  /**
   * @param {Decoder} decoder
   */
  const readFloat32 = decoder => readFromDataView(decoder, 4).getFloat32(0);

  /**
   * @param {Decoder} decoder
   */
  const readFloat64 = decoder => readFromDataView(decoder, 8).getFloat64(0);

  /**
   * @param {Decoder} decoder
   */
  const readBigInt64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0);

  /**
   * @type {Array<function(Decoder):any>}
   */
  const readAnyLookupTable = [
    decoder => undefined, // CASE 127: undefined
    decoder => null, // CASE 126: null
    readVarInt, // CASE 125: integer
    readFloat32, // CASE 124: float32
    readFloat64, // CASE 123: float64
    readBigInt64, // CASE 122: bigint
    decoder => false, // CASE 121: boolean (false)
    decoder => true, // CASE 120: boolean (true)
    readVarString, // CASE 119: string
    decoder => { // CASE 118: object<string,any>
      const len = readVarUint(decoder);
      /**
       * @type {Object<string,any>}
       */
      const obj = {};
      for (let i = 0; i < len; i++) {
        const key = readVarString(decoder);
        obj[key] = readAny(decoder);
      }
      return obj
    },
    decoder => { // CASE 117: array<any>
      const len = readVarUint(decoder);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(readAny(decoder));
      }
      return arr
    },
    readVarUint8Array // CASE 116: Uint8Array
  ];

  /**
   * @param {Decoder} decoder
   */
  const readAny = decoder => readAnyLookupTable[127 - readUint8(decoder)](decoder);

  /**
   * T must not be null.
   *
   * @template T
   */
  class RleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     * @param {function(Decoder):T} reader
     */
    constructor (uint8Array, reader) {
      super(uint8Array);
      /**
       * The reader
       */
      this.reader = reader;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = this.reader(this);
        if (hasContent(this)) {
          this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
        } else {
          this.count = -1; // read the current value forever
        }
      }
      this.count--;
      return /** @type {T} */ (this.s)
    }
  }

  class UintOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = readVarInt(this);
        // if the sign is negative, we read the count too, otherwise count is 1
        const isNegative = isNegativeZero(this.s);
        this.count = 1;
        if (isNegative) {
          this.s = -this.s;
          this.count = readVarUint(this) + 2;
        }
      }
      this.count--;
      return /** @type {number} */ (this.s)
    }
  }

  class IntDiffOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @return {number}
     */
    read () {
      if (this.count === 0) {
        const diff = readVarInt(this);
        // if the first bit is set, we read more data
        const hasCount = diff & 1;
        this.diff = diff >> 1;
        this.count = 1;
        if (hasCount) {
          this.count = readVarUint(this) + 2;
        }
      }
      this.s += this.diff;
      this.count--;
      return this.s
    }
  }

  class StringDecoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      this.decoder = new UintOptRleDecoder(uint8Array);
      this.str = readVarString(this.decoder);
      /**
       * @type {number}
       */
      this.spos = 0;
    }

    /**
     * @return {string}
     */
    read () {
      const end = this.spos + this.decoder.read();
      const res = this.str.slice(this.spos, end);
      this.spos = end;
      return res
    }
  }

  /**
   * Utility functions to work with buffers (Uint8Array).
   *
   * @module buffer
   */

  /**
   * @param {number} len
   */
  const createUint8ArrayFromLen = len => new Uint8Array(len);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   * @param {number} byteOffset
   * @param {number} length
   */
  const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   */
  const createUint8ArrayFromArrayBuffer = buffer => new Uint8Array(buffer);

  /* istanbul ignore next */
  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Browser = bytes => {
    let s = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      s += fromCharCode(bytes[i]);
    }
    // eslint-disable-next-line no-undef
    return btoa(s)
  };

  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');

  /* istanbul ignore next */
  /**
   * @param {string} s
   * @return {Uint8Array}
   */
  const fromBase64Browser = s => {
    // eslint-disable-next-line no-undef
    const a = atob(s);
    const bytes = createUint8ArrayFromLen(a.length);
    for (let i = 0; i < a.length; i++) {
      bytes[i] = a.charCodeAt(i);
    }
    return bytes
  };

  /**
   * @param {string} s
   */
  const fromBase64Node = s => {
    const buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  };

  /* istanbul ignore next */
  const toBase64 = isBrowser ? toBase64Browser : toBase64Node;

  /* istanbul ignore next */
  const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;

  /**
   * Copy the content of an Uint8Array view to a new ArrayBuffer.
   *
   * @param {Uint8Array} uint8Array
   * @return {Uint8Array}
   */
  const copyUint8Array = uint8Array => {
    const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
    newBuf.set(uint8Array);
    return newBuf
  };

  /**
   * Utility helpers for working with numbers.
   *
   * @module number
   */

  /**
   * @module number
   */

  /* istanbul ignore next */
  const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && floor(num) === num);

  /**
   * Efficient schema-less binary encoding with support for variable length encoding.
   *
   * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module encoding
   */

  /**
   * A BinaryEncoder handles the encoding to an Uint8Array.
   */
  class Encoder {
    constructor () {
      this.cpos = 0;
      this.cbuf = new Uint8Array(100);
      /**
       * @type {Array<Uint8Array>}
       */
      this.bufs = [];
    }
  }

  /**
   * @function
   * @return {Encoder}
   */
  const createEncoder = () => new Encoder();

  /**
   * The current length of the encoded data.
   *
   * @function
   * @param {Encoder} encoder
   * @return {number}
   */
  const length = encoder => {
    let len = encoder.cpos;
    for (let i = 0; i < encoder.bufs.length; i++) {
      len += encoder.bufs[i].length;
    }
    return len
  };

  /**
   * Transform to Uint8Array.
   *
   * @function
   * @param {Encoder} encoder
   * @return {Uint8Array} The created ArrayBuffer.
   */
  const toUint8Array = encoder => {
    const uint8arr = new Uint8Array(length(encoder));
    let curPos = 0;
    for (let i = 0; i < encoder.bufs.length; i++) {
      const d = encoder.bufs[i];
      uint8arr.set(d, curPos);
      curPos += d.length;
    }
    uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
    return uint8arr
  };

  /**
   * Verify that it is possible to write `len` bytes wtihout checking. If
   * necessary, a new Buffer with the required length is attached.
   *
   * @param {Encoder} encoder
   * @param {number} len
   */
  const verifyLen = (encoder, len) => {
    const bufferLen = encoder.cbuf.length;
    if (bufferLen - encoder.cpos < len) {
      encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
      encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
      encoder.cpos = 0;
    }
  };

  /**
   * Write one byte to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The byte that is to be encoded.
   */
  const write = (encoder, num) => {
    const bufferLen = encoder.cbuf.length;
    if (encoder.cpos === bufferLen) {
      encoder.bufs.push(encoder.cbuf);
      encoder.cbuf = new Uint8Array(bufferLen * 2);
      encoder.cpos = 0;
    }
    encoder.cbuf[encoder.cpos++] = num;
  };

  /**
   * Write one byte as an unsigned integer.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint8 = write;

  /**
   * Write a variable length unsigned integer.
   *
   * Encodes integers in the range from [0, 4294967295] / [0, 0xffffffff]. (max 32 bit unsigned integer)
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarUint = (encoder, num) => {
    while (num > BITS7) {
      write(encoder, BIT8 | (BITS7 & num));
      num >>>= 7;
    }
    write(encoder, BITS7 & num);
  };

  /**
   * Write a variable length integer.
   *
   * Encodes integers in the range from [-2147483648, -2147483647].
   *
   * We don't use zig-zag encoding because we want to keep the option open
   * to use the same function for BigInt and 53bit integers (doubles).
   *
   * We use the 7th bit instead for signaling that this is a negative number.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarInt = (encoder, num) => {
    const isNegative = isNegativeZero(num);
    if (isNegative) {
      num = -num;
    }
    //             |- whether to continue reading         |- whether is negative     |- number
    write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num));
    num >>>= 6;
    // We don't need to consider the case of num === 0 so we can use a different
    // pattern here than above.
    while (num > 0) {
      write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num));
      num >>>= 7;
    }
  };

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  const writeVarString = (encoder, str) => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      write(encoder, /** @type {number} */ (encodedString.codePointAt(i)));
    }
  };

  /**
   * Append fixed-length Uint8Array to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeUint8Array = (encoder, uint8Array) => {
    const bufferLen = encoder.cbuf.length;
    const cpos = encoder.cpos;
    const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
    const rightCopyLen = uint8Array.length - leftCopyLen;
    encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
    encoder.cpos += leftCopyLen;
    if (rightCopyLen > 0) {
      // Still something to write, write right half..
      // Append new buffer
      encoder.bufs.push(encoder.cbuf);
      // must have at least size of remaining buffer
      encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
      // copy array
      encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
      encoder.cpos = rightCopyLen;
    }
  };

  /**
   * Append an Uint8Array to Encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeVarUint8Array = (encoder, uint8Array) => {
    writeVarUint(encoder, uint8Array.byteLength);
    writeUint8Array(encoder, uint8Array);
  };

  /**
   * Create an DataView of the next `len` bytes. Use it to write data after
   * calling this function.
   *
   * ```js
   * // write float32 using DataView
   * const dv = writeOnDataView(encoder, 4)
   * dv.setFloat32(0, 1.1)
   * // read float32 using DataView
   * const dv = readFromDataView(encoder, 4)
   * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
   * ```
   *
   * @param {Encoder} encoder
   * @param {number} len
   * @return {DataView}
   */
  const writeOnDataView = (encoder, len) => {
    verifyLen(encoder, len);
    const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
    encoder.cpos += len;
    return dview
  };

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num);

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num);

  /**
   * @param {Encoder} encoder
   * @param {bigint} num
   */
  const writeBigInt64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigInt64(0, num);

  const floatTestBed = new DataView(new ArrayBuffer(4));
  /**
   * Check if a number can be encoded as a 32 bit float.
   *
   * @param {number} num
   * @return {boolean}
   */
  const isFloat32 = num => {
    floatTestBed.setFloat32(0, num);
    return floatTestBed.getFloat32(0) === num
  };

  /**
   * Encode data with efficient binary format.
   *
   * Differences to JSON:
   * • Transforms data to a binary format (not to a string)
   * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
   * • Numbers are efficiently encoded either as a variable length integer, as a
   *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
   *
   * Encoding table:
   *
   * | Data Type           | Prefix   | Encoding Method    | Comment |
   * | ------------------- | -------- | ------------------ | ------- |
   * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
   * | null                | 126      |                    | |
   * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
   * | float32             | 124      | writeFloat32       | |
   * | float64             | 123      | writeFloat64       | |
   * | bigint              | 122      | writeBigInt64      | |
   * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
   * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
   * | string              | 119      | writeVarString     | |
   * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
   * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
   * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
   *
   * Reasons for the decreasing prefix:
   * We need the first bit for extendability (later we may want to encode the
   * prefix with writeVarUint). The remaining 7 bits are divided as follows:
   * [0-30]   the beginning of the data range is used for custom purposes
   *          (defined by the function that uses this library)
   * [31-127] the end of the data range is used for data encoding by
   *          lib0/encoding.js
   *
   * @param {Encoder} encoder
   * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
   */
  const writeAny = (encoder, data) => {
    switch (typeof data) {
      case 'string':
        // TYPE 119: STRING
        write(encoder, 119);
        writeVarString(encoder, data);
        break
      case 'number':
        if (isInteger(data) && data <= BITS31) {
          // TYPE 125: INTEGER
          write(encoder, 125);
          writeVarInt(encoder, data);
        } else if (isFloat32(data)) {
          // TYPE 124: FLOAT32
          write(encoder, 124);
          writeFloat32(encoder, data);
        } else {
          // TYPE 123: FLOAT64
          write(encoder, 123);
          writeFloat64(encoder, data);
        }
        break
      case 'bigint':
        // TYPE 122: BigInt
        write(encoder, 122);
        writeBigInt64(encoder, data);
        break
      case 'object':
        if (data === null) {
          // TYPE 126: null
          write(encoder, 126);
        } else if (data instanceof Array) {
          // TYPE 117: Array
          write(encoder, 117);
          writeVarUint(encoder, data.length);
          for (let i = 0; i < data.length; i++) {
            writeAny(encoder, data[i]);
          }
        } else if (data instanceof Uint8Array) {
          // TYPE 116: ArrayBuffer
          write(encoder, 116);
          writeVarUint8Array(encoder, data);
        } else {
          // TYPE 118: Object
          write(encoder, 118);
          const keys = Object.keys(data);
          writeVarUint(encoder, keys.length);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            writeVarString(encoder, key);
            writeAny(encoder, data[key]);
          }
        }
        break
      case 'boolean':
        // TYPE 120/121: boolean (true/false)
        write(encoder, data ? 120 : 121);
        break
      default:
        // TYPE 127: undefined
        write(encoder, 127);
    }
  };

  /**
   * Now come a few stateful encoder that have their own classes.
   */

  /**
   * Basic Run Length Encoder - a basic compression implementation.
   *
   * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
   *
   * It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
   *
   * @note T must not be null!
   *
   * @template T
   */
  class RleEncoder extends Encoder {
    /**
     * @param {function(Encoder, T):void} writer
     */
    constructor (writer) {
      super();
      /**
       * The writer
       */
      this.w = writer;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    /**
     * @param {T} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        if (this.count > 0) {
          // flush counter, unless this is the first value (count = 0)
          writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
        }
        this.count = 1;
        // write first value
        this.w(this, v);
        this.s = v;
      }
    }
  }

  /**
   * @param {UintOptRleEncoder} encoder
   */
  const flushUintOptRleEncoder = encoder => {
    if (encoder.count > 0) {
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set sign to positive
      // case 2: write several values. set sign to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
   *
   * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
   * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
   *
   * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
   */
  class UintOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        flushUintOptRleEncoder(this);
        this.count = 1;
        this.s = v;
      }
    }

    toUint8Array () {
      flushUintOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * @param {IntDiffOptRleEncoder} encoder
   */
  const flushIntDiffOptRleEncoder = encoder => {
    if (encoder.count > 0) {
      //          31 bit making up the diff | wether to write the counter
      const encodedDiff = encoder.diff << 1 | (encoder.count === 1 ? 0 : 1);
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set first bit to positive
      // case 2: write several values. set first bit to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encodedDiff);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * A combination of the IntDiffEncoder and the UintOptRleEncoder.
   *
   * The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
   * in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
   *
   * Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
   *
   * Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
   * * 1 bit that denotes whether the next value is a count (LSB)
   * * 1 bit that denotes whether this value is negative (MSB - 1)
   * * 1 bit that denotes whether to continue reading the variable length integer (MSB)
   *
   * Therefore, only five bits remain to encode diff ranges.
   *
   * Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
   */
  class IntDiffOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.diff === v - this.s) {
        this.s = v;
        this.count++;
      } else {
        flushIntDiffOptRleEncoder(this);
        this.count = 1;
        this.diff = v - this.s;
        this.s = v;
      }
    }

    toUint8Array () {
      flushIntDiffOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * Optimized String Encoder.
   *
   * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
   * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
   *
   * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
   *
   * The lengths are encoded using a UintOptRleEncoder.
   */
  class StringEncoder {
    constructor () {
      /**
       * @type {Array<string>}
       */
      this.sarr = [];
      this.s = '';
      this.lensE = new UintOptRleEncoder();
    }

    /**
     * @param {string} string
     */
    write (string) {
      this.s += string;
      if (this.s.length > 19) {
        this.sarr.push(this.s);
        this.s = '';
      }
      this.lensE.write(string.length);
    }

    toUint8Array () {
      const encoder = new Encoder();
      this.sarr.push(this.s);
      this.s = '';
      writeVarString(encoder, this.sarr.join(''));
      writeUint8Array(encoder, this.lensE.toUint8Array());
      return toUint8Array(encoder)
    }
  }

  /* eslint-env browser */
  const perf = typeof performance === 'undefined' ? null : performance;

  const isoCrypto = typeof crypto === 'undefined' ? null : crypto;

  /**
   * @type {function(number):ArrayBuffer}
   */
  const cryptoRandomBuffer = isoCrypto !== null
    ? len => {
      // browser
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      isoCrypto.getRandomValues(arr);
      return buf
    }
    : len => {
      // polyfill
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      for (let i = 0; i < len; i++) {
        arr[i] = Math.ceil((Math.random() * 0xFFFFFFFF) >>> 0);
      }
      return buf
    };

  var performance_1 = perf;
  var cryptoRandomBuffer_1 = cryptoRandomBuffer;

  var isoBrowser = {
  	performance: performance_1,
  	cryptoRandomBuffer: cryptoRandomBuffer_1
  };

  /**
   * Isomorphic library exports from isomorphic.js.
   *
   * @module isomorphic
   */
  const cryptoRandomBuffer$1 = /** @type {any} */ (isoBrowser.cryptoRandomBuffer);

  const rand = Math.random;

  /* istanbul ignore next */
  const uint32 = () => new Uint32Array(cryptoRandomBuffer$1(4))[0];

  // @ts-ignore
  const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
  const uuidv4 = () => uuidv4Template.replace(/[018]/g, /** @param {number} c */ c =>
    (c ^ uint32() & 15 >> c / 4).toString(16)
  );

  /**
   * Error helpers.
   *
   * @module error
   */

  /**
   * @param {string} s
   * @return {Error}
   */
  /* istanbul ignore next */
  const create$2 = s => new Error(s);

  /**
   * @throws {Error}
   * @return {never}
   */
  /* istanbul ignore next */
  const methodUnimplemented = () => {
    throw create$2('Method unimplemented')
  };

  /**
   * @throws {Error}
   * @return {never}
   */
  /* istanbul ignore next */
  const unexpectedCase = () => {
    throw create$2('Unexpected case')
  };

  /**
   * Utility functions for working with EcmaScript objects.
   *
   * @module object
   */

  /**
   * @param {Object<string,any>} obj
   */
  const keys = Object.keys;

  /**
   * @param {Object<string,any>} obj
   * @return {number}
   */
  const length$1 = obj => keys(obj).length;

  /**
   * @param {Object<string,any>} obj
   * @param {function(any,string):boolean} f
   * @return {boolean}
   */
  const every = (obj, f) => {
    for (const key in obj) {
      if (!f(obj[key], key)) {
        return false
      }
    }
    return true
  };

  /**
   * Calls `Object.prototype.hasOwnProperty`.
   *
   * @param {any} obj
   * @param {string|symbol} key
   * @return {boolean}
   */
  const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  /**
   * @param {Object<string,any>} a
   * @param {Object<string,any>} b
   * @return {boolean}
   */
  const equalFlat = (a, b) => a === b || (length$1(a) === length$1(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val));

  /**
   * Common functions and function call helpers.
   *
   * @module function
   */

  /**
   * Calls all functions in `fs` with args. Only throws after all functions were called.
   *
   * @param {Array<function>} fs
   * @param {Array<any>} args
   */
  const callAll = (fs, args, i = 0) => {
    try {
      for (; i < fs.length; i++) {
        fs[i](...args);
      }
    } finally {
      if (i < fs.length) {
        callAll(fs, args, i + 1);
      }
    }
  };

  const nop = () => {};

  /**
   * @template T
   *
   * @param {T} a
   * @param {T} b
   * @return {boolean}
   */
  const equalityStrict = (a, b) => a === b;

  /**
   * @param {any} a
   * @param {any} b
   * @return {boolean}
   */
  const equalityDeep = (a, b) => {
    if (a == null || b == null) {
      return equalityStrict(a, b)
    }
    if (a.constructor !== b.constructor) {
      return false
    }
    if (a === b) {
      return true
    }
    switch (a.constructor) {
      case ArrayBuffer:
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // eslint-disable-next-line no-fallthrough
      case Uint8Array: {
        if (a.byteLength !== b.byteLength) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
            return false
          }
        }
        break
      }
      case Set: {
        if (a.size !== b.size) {
          return false
        }
        for (const value of a) {
          if (!b.has(value)) {
            return false
          }
        }
        break
      }
      case Map: {
        if (a.size !== b.size) {
          return false
        }
        for (const key of a.keys()) {
          if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
            return false
          }
        }
        break
      }
      case Object:
        if (length$1(a) !== length$1(b)) {
          return false
        }
        for (const key in a) {
          if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
            return false
          }
        }
        break
      case Array:
        if (a.length !== b.length) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (!equalityDeep(a[i], b[i])) {
            return false
          }
        }
        break
      default:
        return false
    }
    return true
  };

  /**
   * Utility module to work with EcmaScript Symbols.
   *
   * @module symbol
   */

  /**
   * Return fresh symbol.
   *
   * @return {Symbol}
   */
  const create$3 = Symbol;

  /**
   * Working with value pairs.
   *
   * @module pair
   */

  /**
   * @template L,R
   */
  class Pair {
    /**
     * @param {L} left
     * @param {R} right
     */
    constructor (left, right) {
      this.left = left;
      this.right = right;
    }
  }

  /**
   * @template L,R
   * @param {L} left
   * @param {R} right
   * @return {Pair<L,R>}
   */
  const create$4 = (left, right) => new Pair(left, right);

  /* eslint-env browser */

  /* istanbul ignore next */
  const domParser = /** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

  /**
   * @param {Map<string,string>} m
   * @return {string}
   */
  /* istanbul ignore next */
  const mapToStyleString = m => map(m, (value, key) => `${key}:${value};`).join('');

  /**
   * Utility module to work with time.
   *
   * @module time
   */

  /**
   * Return current unix time.
   *
   * @return {number}
   */
  const getUnixTime = Date.now;

  /**
   * Isomorphic logging module with support for colors!
   *
   * @module logging
   */

  const BOLD = create$3();
  const UNBOLD = create$3();
  const BLUE = create$3();
  const GREY = create$3();
  const GREEN = create$3();
  const RED = create$3();
  const PURPLE = create$3();
  const ORANGE = create$3();
  const UNCOLOR = create$3();

  /**
   * @type {Object<Symbol,pair.Pair<string,string>>}
   */
  const _browserStyleMap = {
    [BOLD]: create$4('font-weight', 'bold'),
    [UNBOLD]: create$4('font-weight', 'normal'),
    [BLUE]: create$4('color', 'blue'),
    [GREEN]: create$4('color', 'green'),
    [GREY]: create$4('color', 'grey'),
    [RED]: create$4('color', 'red'),
    [PURPLE]: create$4('color', 'purple'),
    [ORANGE]: create$4('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
    [UNCOLOR]: create$4('color', 'black')
  };

  const _nodeStyleMap = {
    [BOLD]: '\u001b[1m',
    [UNBOLD]: '\u001b[2m',
    [BLUE]: '\x1b[34m',
    [GREEN]: '\x1b[32m',
    [GREY]: '\u001b[37m',
    [RED]: '\x1b[31m',
    [PURPLE]: '\x1b[35m',
    [ORANGE]: '\x1b[38;5;208m',
    [UNCOLOR]: '\x1b[0m'
  };

  /* istanbul ignore next */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeBrowserLoggingArgs = args => {
    const strBuilder = [];
    const styles = [];
    const currentStyle = create();
    /**
     * @type {Array<string|Object|number>}
     */
    let logArgs = [];
    // try with formatting until we find something unsupported
    let i = 0;

    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _browserStyleMap[arg];
      if (style !== undefined) {
        currentStyle.set(style.left, style.right);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          const style = mapToStyleString(currentStyle);
          if (i > 0 || style.length > 0) {
            strBuilder.push('%c' + arg);
            styles.push(style);
          } else {
            strBuilder.push(arg);
          }
        } else {
          break
        }
      }
    }

    if (i > 0) {
      // create logArgs with what we have so far
      logArgs = styles;
      logArgs.unshift(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeNodeLoggingArgs = args => {
    const strBuilder = [];
    const logArgs = [];

    // try with formatting until we find something unsupported
    let i = 0;

    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _nodeStyleMap[arg];
      if (style !== undefined) {
        strBuilder.push(style);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          strBuilder.push(arg);
        } else {
          break
        }
      }
    }
    if (i > 0) {
      // create logArgs with what we have so far
      strBuilder.push('\x1b[0m');
      logArgs.push(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      /* istanbul ignore else */
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };

  /* istanbul ignore next */
  const computeLoggingArgs = isNode ? computeNodeLoggingArgs : computeBrowserLoggingArgs;

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const print = (...args) => {
    console.log(...computeLoggingArgs(args));
    /* istanbul ignore next */
    vconsoles.forEach(vc => vc.print(args));
  };

  const vconsoles = new Set();

  const loggingColors = [GREEN, PURPLE, ORANGE, BLUE];
  let nextColor = 0;
  let lastLoggingTime = getUnixTime();

  /**
   * @param {string} moduleName
   * @return {function(...any)}
   */
  const createModuleLogger = moduleName => {
    const color = loggingColors[nextColor];
    const debugRegexVar = getVariable('log');
    const doLogging = debugRegexVar !== null && (debugRegexVar === '*' || debugRegexVar === 'true' || new RegExp(debugRegexVar, 'gi').test(moduleName));
    nextColor = (nextColor + 1) % loggingColors.length;
    moduleName += ': ';

    return !doLogging ? nop : (...args) => {
      const timeNow = getUnixTime();
      const timeDiff = timeNow - lastLoggingTime;
      lastLoggingTime = timeNow;
      print(color, moduleName, UNCOLOR, ...args.map(arg => (typeof arg === 'string' || typeof arg === 'symbol') ? arg : JSON.stringify(arg)), color, ' +' + timeDiff + 'ms');
    }
  };

  /**
   * Utility module to create and manipulate Iterators.
   *
   * @module iterator
   */

  /**
   * @template T
   * @param {function():IteratorResult<T>} next
   * @return {IterableIterator<T>}
   */
  const createIterator = next => ({
    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this
    },
    // @ts-ignore
    next
  });

  /**
   * @template T
   * @param {Iterator<T>} iterator
   * @param {function(T):boolean} filter
   */
  const iteratorFilter = (iterator, filter) => createIterator(() => {
    let res;
    do {
      res = iterator.next();
    } while (!res.done && !filter(res.value))
    return res
  });

  /**
   * @template T,M
   * @param {Iterator<T>} iterator
   * @param {function(T):M} fmap
   */
  const iteratorMap = (iterator, fmap) => createIterator(() => {
    const { done, value } = iterator.next();
    return { done, value: done ? undefined : fmap(value) }
  });

  class DeleteItem {
    /**
     * @param {number} clock
     * @param {number} len
     */
    constructor (clock, len) {
      /**
       * @type {number}
       */
      this.clock = clock;
      /**
       * @type {number}
       */
      this.len = len;
    }
  }

  /**
   * We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
   * - When created in a transaction, it must only be accessed after sorting, and merging
   *   - This DeleteSet is send to other clients
   * - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
   * - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
   */
  class DeleteSet {
    constructor () {
      /**
       * @type {Map<number,Array<DeleteItem>>}
       */
      this.clients = new Map();
    }
  }

  /**
   * Iterate over all structs that the DeleteSet gc's.
   *
   * @param {Transaction} transaction
   * @param {DeleteSet} ds
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateDeletedStructs = (transaction, ds, f) =>
    ds.clients.forEach((deletes, clientid) => {
      const structs = /** @type {Array<GC|Item>} */ (transaction.doc.store.clients.get(clientid));
      for (let i = 0; i < deletes.length; i++) {
        const del = deletes[i];
        iterateStructs(transaction, structs, del.clock, del.len, f);
      }
    });

  /**
   * @param {Array<DeleteItem>} dis
   * @param {number} clock
   * @return {number|null}
   *
   * @private
   * @function
   */
  const findIndexDS = (dis, clock) => {
    let left = 0;
    let right = dis.length - 1;
    while (left <= right) {
      const midindex = floor((left + right) / 2);
      const mid = dis[midindex];
      const midclock = mid.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.len) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
    }
    return null
  };

  /**
   * @param {DeleteSet} ds
   * @param {ID} id
   * @return {boolean}
   *
   * @private
   * @function
   */
  const isDeleted = (ds, id) => {
    const dis = ds.clients.get(id.client);
    return dis !== undefined && findIndexDS(dis, id.clock) !== null
  };

  /**
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const sortAndMergeDeleteSet = ds => {
    ds.clients.forEach(dels => {
      dels.sort((a, b) => a.clock - b.clock);
      // merge items without filtering or splicing the array
      // i is the current pointer
      // j refers to the current insert position for the pointed item
      // try to merge dels[i] into dels[j-1] or set dels[j]=dels[i]
      let i, j;
      for (i = 1, j = 1; i < dels.length; i++) {
        const left = dels[j - 1];
        const right = dels[i];
        if (left.clock + left.len === right.clock) {
          left.len += right.len;
        } else {
          if (j < i) {
            dels[j] = right;
          }
          j++;
        }
      }
      dels.length = j;
    });
  };

  /**
   * @param {DeleteSet} ds
   * @param {number} client
   * @param {number} clock
   * @param {number} length
   *
   * @private
   * @function
   */
  const addToDeleteSet = (ds, client, clock, length) => {
    setIfUndefined(ds.clients, client, () => []).push(new DeleteItem(clock, length));
  };

  const createDeleteSet = () => new DeleteSet();

  /**
   * @param {StructStore} ss
   * @return {DeleteSet} Merged and sorted DeleteSet
   *
   * @private
   * @function
   */
  const createDeleteSetFromStructStore = ss => {
    const ds = createDeleteSet();
    ss.clients.forEach((structs, client) => {
      /**
       * @type {Array<DeleteItem>}
       */
      const dsitems = [];
      for (let i = 0; i < structs.length; i++) {
        const struct = structs[i];
        if (struct.deleted) {
          const clock = struct.id.clock;
          let len = struct.length;
          if (i + 1 < structs.length) {
            for (let next = structs[i + 1]; i + 1 < structs.length && next.id.clock === clock + len && next.deleted; next = structs[++i + 1]) {
              len += next.length;
            }
          }
          dsitems.push(new DeleteItem(clock, len));
        }
      }
      if (dsitems.length > 0) {
        ds.clients.set(client, dsitems);
      }
    });
    return ds
  };

  /**
   * @param {AbstractDSEncoder} encoder
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const writeDeleteSet = (encoder, ds) => {
    writeVarUint(encoder.restEncoder, ds.clients.size);
    ds.clients.forEach((dsitems, client) => {
      encoder.resetDsCurVal();
      writeVarUint(encoder.restEncoder, client);
      const len = dsitems.length;
      writeVarUint(encoder.restEncoder, len);
      for (let i = 0; i < len; i++) {
        const item = dsitems[i];
        encoder.writeDsClock(item.clock);
        encoder.writeDsLen(item.len);
      }
    });
  };

  /**
   * @todo YDecoder also contains references to String and other Decoders. Would make sense to exchange YDecoder.toUint8Array for YDecoder.DsToUint8Array()..
   */

  /**
   * @param {AbstractDSDecoder} decoder
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const readAndApplyDeleteSet = (decoder, transaction, store) => {
    const unappliedDS = new DeleteSet();
    const numClients = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numClients; i++) {
      decoder.resetDsCurVal();
      const client = readVarUint(decoder.restDecoder);
      const numberOfDeletes = readVarUint(decoder.restDecoder);
      const structs = store.clients.get(client) || [];
      const state = getState(store, client);
      for (let i = 0; i < numberOfDeletes; i++) {
        const clock = decoder.readDsClock();
        const clockEnd = clock + decoder.readDsLen();
        if (clock < state) {
          if (state < clockEnd) {
            addToDeleteSet(unappliedDS, client, state, clockEnd - state);
          }
          let index = findIndexSS(structs, clock);
          /**
           * We can ignore the case of GC and Delete structs, because we are going to skip them
           * @type {Item}
           */
          // @ts-ignore
          let struct = structs[index];
          // split the first item if necessary
          if (!struct.deleted && struct.id.clock < clock) {
            structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
            index++; // increase we now want to use the next struct
          }
          while (index < structs.length) {
            // @ts-ignore
            struct = structs[index++];
            if (struct.id.clock < clockEnd) {
              if (!struct.deleted) {
                if (clockEnd < struct.id.clock + struct.length) {
                  structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
                }
                struct.delete(transaction);
              }
            } else {
              break
            }
          }
        } else {
          addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
        }
      }
    }
    if (unappliedDS.clients.size > 0) {
      // TODO: no need for encoding+decoding ds anymore
      const unappliedDSEncoder = new DSEncoderV2();
      writeDeleteSet(unappliedDSEncoder, unappliedDS);
      store.pendingDeleteReaders.push(new DSDecoderV2(createDecoder((unappliedDSEncoder.toUint8Array()))));
    }
  };

  /**
   * @module Y
   */

  const generateNewClientId = uint32;

  /**
   * @typedef {Object} DocOpts
   * @property {boolean} [DocOpts.gc=true] Disable garbage collection (default: gc=true)
   * @property {function(Item):boolean} [DocOpts.gcFilter] Will be called before an Item is garbage collected. Return false to keep the Item.
   * @property {string} [DocOpts.guid] Define a globally unique identifier for this document
   * @property {any} [DocOpts.meta] Any kind of meta information you want to associate with this document. If this is a subdocument, remote peers will store the meta information as well.
   * @property {boolean} [DocOpts.autoLoad] If a subdocument, automatically load document. If this is a subdocument, remote peers will load the document as well automatically.
   */

  /**
   * A Yjs instance handles the state of shared data.
   * @extends Observable<string>
   */
  class Doc extends Observable {
    /**
     * @param {DocOpts} [opts] configuration
     */
    constructor ({ guid = uuidv4(), gc = true, gcFilter = () => true, meta = null, autoLoad = false } = {}) {
      super();
      this.gc = gc;
      this.gcFilter = gcFilter;
      this.clientID = generateNewClientId();
      this.guid = guid;
      /**
       * @type {Map<string, AbstractType<YEvent>>}
       */
      this.share = new Map();
      this.store = new StructStore();
      /**
       * @type {Transaction | null}
       */
      this._transaction = null;
      /**
       * @type {Array<Transaction>}
       */
      this._transactionCleanups = [];
      /**
       * @type {Set<Doc>}
       */
      this.subdocs = new Set();
      /**
       * If this document is a subdocument - a document integrated into another document - then _item is defined.
       * @type {Item?}
       */
      this._item = null;
      this.shouldLoad = autoLoad;
      this.autoLoad = autoLoad;
      this.meta = meta;
    }

    /**
     * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
     *
     * `load()` might be used in the future to request any provider to load the most current data.
     *
     * It is safe to call `load()` multiple times.
     */
    load () {
      const item = this._item;
      if (item !== null && !this.shouldLoad) {
        transact(/** @type {any} */ (item.parent).doc, transaction => {
          transaction.subdocsLoaded.add(this);
        }, null, true);
      }
      this.shouldLoad = true;
    }

    getSubdocs () {
      return this.subdocs
    }

    getSubdocGuids () {
      return new Set(Array.from(this.subdocs).map(doc => doc.guid))
    }

    /**
     * Changes that happen inside of a transaction are bundled. This means that
     * the observer fires _after_ the transaction is finished and that all changes
     * that happened inside of the transaction are sent as one message to the
     * other peers.
     *
     * @param {function(Transaction):void} f The function that should be executed as a transaction
     * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
     *
     * @public
     */
    transact (f, origin = null) {
      transact(this, f, origin);
    }

    /**
     * Define a shared data type.
     *
     * Multiple calls of `y.get(name, TypeConstructor)` yield the same result
     * and do not overwrite each other. I.e.
     * `y.define(name, Y.Array) === y.define(name, Y.Array)`
     *
     * After this method is called, the type is also available on `y.share.get(name)`.
     *
     * *Best Practices:*
     * Define all types right after the Yjs instance is created and store them in a separate object.
     * Also use the typed methods `getText(name)`, `getArray(name)`, ..
     *
     * @example
     *   const y = new Y(..)
     *   const appState = {
     *     document: y.getText('document')
     *     comments: y.getArray('comments')
     *   }
     *
     * @param {string} name
     * @param {Function} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
     * @return {AbstractType<any>} The created type. Constructed with TypeConstructor
     *
     * @public
     */
    get (name, TypeConstructor = AbstractType) {
      const type = setIfUndefined(this.share, name, () => {
        // @ts-ignore
        const t = new TypeConstructor();
        t._integrate(this, null);
        return t
      });
      const Constr = type.constructor;
      if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
        if (Constr === AbstractType) {
          // @ts-ignore
          const t = new TypeConstructor();
          t._map = type._map;
          type._map.forEach(/** @param {Item?} n */ n => {
            for (; n !== null; n = n.left) {
              // @ts-ignore
              n.parent = t;
            }
          });
          t._start = type._start;
          for (let n = t._start; n !== null; n = n.right) {
            n.parent = t;
          }
          t._length = type._length;
          this.share.set(name, t);
          t._integrate(this, null);
          return t
        } else {
          throw new Error(`Type with the name ${name} has already been defined with a different constructor`)
        }
      }
      return type
    }

    /**
     * @template T
     * @param {string} [name]
     * @return {YArray<T>}
     *
     * @public
     */
    getArray (name = '') {
      // @ts-ignore
      return this.get(name, YArray)
    }

    /**
     * @param {string} [name]
     * @return {YText}
     *
     * @public
     */
    getText (name = '') {
      // @ts-ignore
      return this.get(name, YText)
    }

    /**
     * @param {string} [name]
     * @return {YMap<any>}
     *
     * @public
     */
    getMap (name = '') {
      // @ts-ignore
      return this.get(name, YMap)
    }

    /**
     * @param {string} [name]
     * @return {YXmlFragment}
     *
     * @public
     */
    getXmlFragment (name = '') {
      // @ts-ignore
      return this.get(name, YXmlFragment)
    }

    /**
     * Converts the entire document into a js object, recursively traversing each yjs type
     * Doesn't log types that have not been defined (using ydoc.getType(..)).
     *
     * @deprecated Do not use this method and rather call toJSON directly on the shared types.
     *
     * @return {Object<string, any>}
     */
    toJSON () {
      /**
       * @type {Object<string, any>}
       */
      const doc = {};

      this.share.forEach((value, key) => {
        doc[key] = value.toJSON();
      });

      return doc
    }

    /**
     * Emit `destroy` event and unregister all event handlers.
     */
    destroy () {
      from(this.subdocs).forEach(subdoc => subdoc.destroy());
      const item = this._item;
      if (item !== null) {
        this._item = null;
        const content = /** @type {ContentDoc} */ (item.content);
        if (item.deleted) {
          // @ts-ignore
          content.doc = null;
        } else {
          content.doc = new Doc({ guid: this.guid, ...content.opts });
          content.doc._item = item;
        }
        transact(/** @type {any} */ (item).parent.doc, transaction => {
          if (!item.deleted) {
            transaction.subdocsAdded.add(content.doc);
          }
          transaction.subdocsRemoved.add(this);
        }, null, true);
      }
      this.emit('destroyed', [true]);
      this.emit('destroy', [this]);
      super.destroy();
    }

    /**
     * @param {string} eventName
     * @param {function(...any):any} f
     */
    on (eventName, f) {
      super.on(eventName, f);
    }

    /**
     * @param {string} eventName
     * @param {function} f
     */
    off (eventName, f) {
      super.off(eventName, f);
    }
  }

  class DSDecoderV1 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      this.restDecoder = decoder;
    }

    resetDsCurVal () {
      // nop
    }

    /**
     * @return {number}
     */
    readDsClock () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {number}
     */
    readDsLen () {
      return readVarUint(this.restDecoder)
    }
  }

  class UpdateDecoderV1 extends DSDecoderV1 {
    /**
     * @return {ID}
     */
    readLeftID () {
      return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder))
    }

    /**
     * @return {ID}
     */
    readRightID () {
      return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder))
    }

    /**
     * Read the next client id.
     * Use this in favor of readID whenever possible to reduce the number of objects created.
     */
    readClient () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readInfo () {
      return readUint8(this.restDecoder)
    }

    /**
     * @return {string}
     */
    readString () {
      return readVarString(this.restDecoder)
    }

    /**
     * @return {boolean} isKey
     */
    readParentInfo () {
      return readVarUint(this.restDecoder) === 1
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readTypeRef () {
      return readVarUint(this.restDecoder)
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @return {number} len
     */
    readLen () {
      return readVarUint(this.restDecoder)
    }

    /**
     * @return {any}
     */
    readAny () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {Uint8Array}
     */
    readBuf () {
      return copyUint8Array(readVarUint8Array(this.restDecoder))
    }

    /**
     * Legacy implementation uses JSON parse. We use any-decoding in v2.
     *
     * @return {any}
     */
    readJSON () {
      return JSON.parse(readVarString(this.restDecoder))
    }

    /**
     * @return {string}
     */
    readKey () {
      return readVarString(this.restDecoder)
    }
  }

  class DSDecoderV2 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      this.dsCurrVal = 0;
      this.restDecoder = decoder;
    }

    resetDsCurVal () {
      this.dsCurrVal = 0;
    }

    readDsClock () {
      this.dsCurrVal += readVarUint(this.restDecoder);
      return this.dsCurrVal
    }

    readDsLen () {
      const diff = readVarUint(this.restDecoder) + 1;
      this.dsCurrVal += diff;
      return diff
    }
  }

  class UpdateDecoderV2 extends DSDecoderV2 {
    /**
     * @param {decoding.Decoder} decoder
     */
    constructor (decoder) {
      super(decoder);
      /**
       * List of cached keys. If the keys[id] does not exist, we read a new key
       * from stringEncoder and push it to keys.
       *
       * @type {Array<string>}
       */
      this.keys = [];
      readUint8(decoder); // read feature flag - currently unused
      this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
      this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
      this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
      this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
      this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
      this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
      this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    }

    /**
     * @return {ID}
     */
    readLeftID () {
      return new ID(this.clientDecoder.read(), this.leftClockDecoder.read())
    }

    /**
     * @return {ID}
     */
    readRightID () {
      return new ID(this.clientDecoder.read(), this.rightClockDecoder.read())
    }

    /**
     * Read the next client id.
     * Use this in favor of readID whenever possible to reduce the number of objects created.
     */
    readClient () {
      return this.clientDecoder.read()
    }

    /**
     * @return {number} info An unsigned 8-bit integer
     */
    readInfo () {
      return /** @type {number} */ (this.infoDecoder.read())
    }

    /**
     * @return {string}
     */
    readString () {
      return this.stringDecoder.read()
    }

    /**
     * @return {boolean}
     */
    readParentInfo () {
      return this.parentInfoDecoder.read() === 1
    }

    /**
     * @return {number} An unsigned 8-bit integer
     */
    readTypeRef () {
      return this.typeRefDecoder.read()
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @return {number}
     */
    readLen () {
      return this.lenDecoder.read()
    }

    /**
     * @return {any}
     */
    readAny () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {Uint8Array}
     */
    readBuf () {
      return readVarUint8Array(this.restDecoder)
    }

    /**
     * This is mainly here for legacy purposes.
     *
     * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
     *
     * @return {any}
     */
    readJSON () {
      return readAny(this.restDecoder)
    }

    /**
     * @return {string}
     */
    readKey () {
      const keyClock = this.keyClockDecoder.read();
      if (keyClock < this.keys.length) {
        return this.keys[keyClock]
      } else {
        const key = this.stringDecoder.read();
        this.keys.push(key);
        return key
      }
    }
  }

  class DSEncoderV1 {
    constructor () {
      this.restEncoder = new Encoder();
    }

    toUint8Array () {
      return toUint8Array(this.restEncoder)
    }

    resetDsCurVal () {
      // nop
    }

    /**
     * @param {number} clock
     */
    writeDsClock (clock) {
      writeVarUint(this.restEncoder, clock);
    }

    /**
     * @param {number} len
     */
    writeDsLen (len) {
      writeVarUint(this.restEncoder, len);
    }
  }

  class UpdateEncoderV1 extends DSEncoderV1 {
    /**
     * @param {ID} id
     */
    writeLeftID (id) {
      writeVarUint(this.restEncoder, id.client);
      writeVarUint(this.restEncoder, id.clock);
    }

    /**
     * @param {ID} id
     */
    writeRightID (id) {
      writeVarUint(this.restEncoder, id.client);
      writeVarUint(this.restEncoder, id.clock);
    }

    /**
     * Use writeClient and writeClock instead of writeID if possible.
     * @param {number} client
     */
    writeClient (client) {
      writeVarUint(this.restEncoder, client);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeInfo (info) {
      writeUint8(this.restEncoder, info);
    }

    /**
     * @param {string} s
     */
    writeString (s) {
      writeVarString(this.restEncoder, s);
    }

    /**
     * @param {boolean} isYKey
     */
    writeParentInfo (isYKey) {
      writeVarUint(this.restEncoder, isYKey ? 1 : 0);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeTypeRef (info) {
      writeVarUint(this.restEncoder, info);
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @param {number} len
     */
    writeLen (len) {
      writeVarUint(this.restEncoder, len);
    }

    /**
     * @param {any} any
     */
    writeAny (any) {
      writeAny(this.restEncoder, any);
    }

    /**
     * @param {Uint8Array} buf
     */
    writeBuf (buf) {
      writeVarUint8Array(this.restEncoder, buf);
    }

    /**
     * @param {any} embed
     */
    writeJSON (embed) {
      writeVarString(this.restEncoder, JSON.stringify(embed));
    }

    /**
     * @param {string} key
     */
    writeKey (key) {
      writeVarString(this.restEncoder, key);
    }
  }

  class DSEncoderV2 {
    constructor () {
      this.restEncoder = new Encoder(); // encodes all the rest / non-optimized
      this.dsCurrVal = 0;
    }

    toUint8Array () {
      return toUint8Array(this.restEncoder)
    }

    resetDsCurVal () {
      this.dsCurrVal = 0;
    }

    /**
     * @param {number} clock
     */
    writeDsClock (clock) {
      const diff = clock - this.dsCurrVal;
      this.dsCurrVal = clock;
      writeVarUint(this.restEncoder, diff);
    }

    /**
     * @param {number} len
     */
    writeDsLen (len) {
      if (len === 0) {
        unexpectedCase();
      }
      writeVarUint(this.restEncoder, len - 1);
      this.dsCurrVal += len;
    }
  }

  class UpdateEncoderV2 extends DSEncoderV2 {
    constructor () {
      super();
      /**
       * @type {Map<string,number>}
       */
      this.keyMap = new Map();
      /**
       * Refers to the next uniqe key-identifier to me used.
       * See writeKey method for more information.
       *
       * @type {number}
       */
      this.keyClock = 0;
      this.keyClockEncoder = new IntDiffOptRleEncoder();
      this.clientEncoder = new UintOptRleEncoder();
      this.leftClockEncoder = new IntDiffOptRleEncoder();
      this.rightClockEncoder = new IntDiffOptRleEncoder();
      this.infoEncoder = new RleEncoder(writeUint8);
      this.stringEncoder = new StringEncoder();
      this.parentInfoEncoder = new RleEncoder(writeUint8);
      this.typeRefEncoder = new UintOptRleEncoder();
      this.lenEncoder = new UintOptRleEncoder();
    }

    toUint8Array () {
      const encoder = createEncoder();
      writeUint8(encoder, 0); // this is a feature flag that we might use in the future
      writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
      writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
      writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
      writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
      writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
      writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
      // @note The rest encoder is appended! (note the missing var)
      writeUint8Array(encoder, toUint8Array(this.restEncoder));
      return toUint8Array(encoder)
    }

    /**
     * @param {ID} id
     */
    writeLeftID (id) {
      this.clientEncoder.write(id.client);
      this.leftClockEncoder.write(id.clock);
    }

    /**
     * @param {ID} id
     */
    writeRightID (id) {
      this.clientEncoder.write(id.client);
      this.rightClockEncoder.write(id.clock);
    }

    /**
     * @param {number} client
     */
    writeClient (client) {
      this.clientEncoder.write(client);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeInfo (info) {
      this.infoEncoder.write(info);
    }

    /**
     * @param {string} s
     */
    writeString (s) {
      this.stringEncoder.write(s);
    }

    /**
     * @param {boolean} isYKey
     */
    writeParentInfo (isYKey) {
      this.parentInfoEncoder.write(isYKey ? 1 : 0);
    }

    /**
     * @param {number} info An unsigned 8-bit integer
     */
    writeTypeRef (info) {
      this.typeRefEncoder.write(info);
    }

    /**
     * Write len of a struct - well suited for Opt RLE encoder.
     *
     * @param {number} len
     */
    writeLen (len) {
      this.lenEncoder.write(len);
    }

    /**
     * @param {any} any
     */
    writeAny (any) {
      writeAny(this.restEncoder, any);
    }

    /**
     * @param {Uint8Array} buf
     */
    writeBuf (buf) {
      writeVarUint8Array(this.restEncoder, buf);
    }

    /**
     * This is mainly here for legacy purposes.
     *
     * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
     *
     * @param {any} embed
     */
    writeJSON (embed) {
      writeAny(this.restEncoder, embed);
    }

    /**
     * Property keys are often reused. For example, in y-prosemirror the key `bold` might
     * occur very often. For a 3d application, the key `position` might occur very often.
     *
     * We cache these keys in a Map and refer to them via a unique number.
     *
     * @param {string} key
     */
    writeKey (key) {
      const clock = this.keyMap.get(key);
      if (clock === undefined) {
        this.keyClockEncoder.write(this.keyClock++);
        this.stringEncoder.write(key);
      } else {
        this.keyClockEncoder.write(this.keyClock++);
      }
    }
  }

  let DefaultDSEncoder = DSEncoderV1;
  let DefaultDSDecoder = DSDecoderV1;
  let DefaultUpdateEncoder = UpdateEncoderV1;
  let DefaultUpdateDecoder = UpdateDecoderV1;

  /**
   * @param {AbstractUpdateEncoder} encoder
   * @param {Array<GC|Item>} structs All structs by `client`
   * @param {number} client
   * @param {number} clock write structs starting with `ID(client,clock)`
   *
   * @function
   */
  const writeStructs = (encoder, structs, client, clock) => {
    // write first id
    const startNewStructs = findIndexSS(structs, clock);
    // write # encoded structs
    writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
    encoder.writeClient(client);
    writeVarUint(encoder.restEncoder, clock);
    const firstStruct = structs[startNewStructs];
    // write first struct with an offset
    firstStruct.write(encoder, clock - firstStruct.id.clock);
    for (let i = startNewStructs + 1; i < structs.length; i++) {
      structs[i].write(encoder, 0);
    }
  };

  /**
   * @param {AbstractUpdateEncoder} encoder
   * @param {StructStore} store
   * @param {Map<number,number>} _sm
   *
   * @private
   * @function
   */
  const writeClientsStructs = (encoder, store, _sm) => {
    // we filter all valid _sm entries into sm
    const sm = new Map();
    _sm.forEach((clock, client) => {
      // only write if new structs are available
      if (getState(store, client) > clock) {
        sm.set(client, clock);
      }
    });
    getStateVector(store).forEach((clock, client) => {
      if (!_sm.has(client)) {
        sm.set(client, 0);
      }
    });
    // write # states that were updated
    writeVarUint(encoder.restEncoder, sm.size);
    // Write items with higher client ids first
    // This heavily improves the conflict algorithm.
    Array.from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
      // @ts-ignore
      writeStructs(encoder, store.clients.get(client), client, clock);
    });
  };

  /**
   * @param {AbstractUpdateDecoder} decoder The decoder object to read data from.
   * @param {Map<number,Array<GC|Item>>} clientRefs
   * @param {Doc} doc
   * @return {Map<number,Array<GC|Item>>}
   *
   * @private
   * @function
   */
  const readClientsStructRefs = (decoder, clientRefs, doc) => {
    const numOfStateUpdates = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numOfStateUpdates; i++) {
      const numberOfStructs = readVarUint(decoder.restDecoder);
      /**
       * @type {Array<GC|Item>}
       */
      const refs = new Array(numberOfStructs);
      const client = decoder.readClient();
      let clock = readVarUint(decoder.restDecoder);
      // const start = performance.now()
      clientRefs.set(client, refs);
      for (let i = 0; i < numberOfStructs; i++) {
        const info = decoder.readInfo();
        if ((BITS5 & info) !== 0) {
          /**
           * The optimized implementation doesn't use any variables because inlining variables is faster.
           * Below a non-optimized version is shown that implements the basic algorithm with
           * a few comments
           */
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
          // and we read the next string as parentYKey.
          // It indicates how we store/retrieve parent from `y.share`
          // @type {string|null}
          const struct = new Item(
            createID(client, clock),
            null, // leftd
            (info & BIT8) === BIT8 ? decoder.readLeftID() : null, // origin
            null, // right
            (info & BIT7) === BIT7 ? decoder.readRightID() : null, // right origin
            cantCopyParentInfo ? (decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID()) : null, // parent
            cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, // parentSub
            readItemContent(decoder, info) // item content
          );
          /* A non-optimized implementation of the above algorithm:

          // The item that was originally to the left of this item.
          const origin = (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null
          // The item that was originally to the right of this item.
          const rightOrigin = (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null
          const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0
          const hasParentYKey = cantCopyParentInfo ? decoder.readParentInfo() : false
          // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
          // and we read the next string as parentYKey.
          // It indicates how we store/retrieve parent from `y.share`
          // @type {string|null}
          const parentYKey = cantCopyParentInfo && hasParentYKey ? decoder.readString() : null

          const struct = new Item(
            createID(client, clock),
            null, // leftd
            origin, // origin
            null, // right
            rightOrigin, // right origin
            cantCopyParentInfo && !hasParentYKey ? decoder.readLeftID() : (parentYKey !== null ? doc.get(parentYKey) : null), // parent
            cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
            readItemContent(decoder, info) // item content
          )
          */
          refs[i] = struct;
          clock += struct.length;
        } else {
          const len = decoder.readLen();
          refs[i] = new GC(createID(client, clock), len);
          clock += len;
        }
      }
      // console.log('time to read: ', performance.now() - start) // @todo remove
    }
    return clientRefs
  };

  /**
   * Resume computing structs generated by struct readers.
   *
   * While there is something to do, we integrate structs in this order
   * 1. top element on stack, if stack is not empty
   * 2. next element from current struct reader (if empty, use next struct reader)
   *
   * If struct causally depends on another struct (ref.missing), we put next reader of
   * `ref.id.client` on top of stack.
   *
   * At some point we find a struct that has no causal dependencies,
   * then we start emptying the stack.
   *
   * It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
   * depends on struct3 (from client1). Therefore the max stack size is eqaul to `structReaders.length`.
   *
   * This method is implemented in a way so that we can resume computation if this update
   * causally depends on another update.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const resumeStructIntegration = (transaction, store) => {
    const stack = store.pendingStack; // @todo don't forget to append stackhead at the end
    const clientsStructRefs = store.pendingClientsStructRefs;
    // sort them so that we take the higher id first, in case of conflicts the lower id will probably not conflict with the id from the higher user.
    const clientsStructRefsIds = Array.from(clientsStructRefs.keys()).sort((a, b) => a - b);
    if (clientsStructRefsIds.length === 0) {
      return
    }
    const getNextStructTarget = () => {
      let nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */ (clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]));
      while (nextStructsTarget.refs.length === nextStructsTarget.i) {
        clientsStructRefsIds.pop();
        if (clientsStructRefsIds.length > 0) {
          nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */ (clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]));
        } else {
          store.pendingClientsStructRefs.clear();
          return null
        }
      }
      return nextStructsTarget
    };
    let curStructsTarget = getNextStructTarget();
    if (curStructsTarget === null && stack.length === 0) {
      return
    }
    /**
     * @type {GC|Item}
     */
    let stackHead = stack.length > 0
      ? /** @type {GC|Item} */ (stack.pop())
      : /** @type {any} */ (curStructsTarget).refs[/** @type {any} */ (curStructsTarget).i++];
    // caching the state because it is used very often
    const state = new Map();
    // iterate over all struct readers until we are done
    while (true) {
      const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
      const offset = stackHead.id.clock < localClock ? localClock - stackHead.id.clock : 0;
      if (stackHead.id.clock + offset !== localClock) {
        // A previous message from this client is missing
        // check if there is a pending structRef with a smaller clock and switch them
        /**
         * @type {{ refs: Array<GC|Item>, i: number }}
         */
        const structRefs = clientsStructRefs.get(stackHead.id.client) || { refs: [], i: 0 };
        if (structRefs.refs.length !== structRefs.i) {
          const r = structRefs.refs[structRefs.i];
          if (r.id.clock < stackHead.id.clock) {
            // put ref with smaller clock on stack instead and continue
            structRefs.refs[structRefs.i] = stackHead;
            stackHead = r;
            // sort the set because this approach might bring the list out of order
            structRefs.refs = structRefs.refs.slice(structRefs.i).sort((r1, r2) => r1.id.clock - r2.id.clock);
            structRefs.i = 0;
            continue
          }
        }
        // wait until missing struct is available
        stack.push(stackHead);
        return
      }
      const missing = stackHead.getMissing(transaction, store);
      if (missing === null) {
        if (offset === 0 || offset < stackHead.length) {
          stackHead.integrate(transaction, offset);
          state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
        }
        // iterate to next stackHead
        if (stack.length > 0) {
          stackHead = /** @type {GC|Item} */ (stack.pop());
        } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
          stackHead = /** @type {GC|Item} */ (curStructsTarget.refs[curStructsTarget.i++]);
        } else {
          curStructsTarget = getNextStructTarget();
          if (curStructsTarget === null) {
            // we are done!
            break
          } else {
            stackHead = /** @type {GC|Item} */ (curStructsTarget.refs[curStructsTarget.i++]);
          }
        }
      } else {
        // get the struct reader that has the missing struct
        /**
         * @type {{ refs: Array<GC|Item>, i: number }}
         */
        const structRefs = clientsStructRefs.get(missing) || { refs: [], i: 0 };
        if (structRefs.refs.length === structRefs.i) {
          // This update message causally depends on another update message.
          stack.push(stackHead);
          return
        }
        stack.push(stackHead);
        stackHead = structRefs.refs[structRefs.i++];
      }
    }
    store.pendingClientsStructRefs.clear();
  };

  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const tryResumePendingDeleteReaders = (transaction, store) => {
    const pendingReaders = store.pendingDeleteReaders;
    store.pendingDeleteReaders = [];
    for (let i = 0; i < pendingReaders.length; i++) {
      readAndApplyDeleteSet(pendingReaders[i], transaction, store);
    }
  };

  /**
   * @param {AbstractUpdateEncoder} encoder
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);

  /**
   * @param {StructStore} store
   * @param {Map<number, Array<GC|Item>>} clientsStructsRefs
   *
   * @private
   * @function
   */
  const mergeReadStructsIntoPendingReads = (store, clientsStructsRefs) => {
    const pendingClientsStructRefs = store.pendingClientsStructRefs;
    clientsStructsRefs.forEach((structRefs, client) => {
      const pendingStructRefs = pendingClientsStructRefs.get(client);
      if (pendingStructRefs === undefined) {
        pendingClientsStructRefs.set(client, { refs: structRefs, i: 0 });
      } else {
        // merge into existing structRefs
        const merged = pendingStructRefs.i > 0 ? pendingStructRefs.refs.slice(pendingStructRefs.i) : pendingStructRefs.refs;
        for (let i = 0; i < structRefs.length; i++) {
          merged.push(structRefs[i]);
        }
        pendingStructRefs.i = 0;
        pendingStructRefs.refs = merged.sort((r1, r2) => r1.id.clock - r2.id.clock);
      }
    });
  };

  /**
   * @param {Map<number,{refs:Array<GC|Item>,i:number}>} pendingClientsStructRefs
   */
  const cleanupPendingStructs = pendingClientsStructRefs => {
    // cleanup pendingClientsStructs if not fully finished
    pendingClientsStructRefs.forEach((refs, client) => {
      if (refs.i === refs.refs.length) {
        pendingClientsStructRefs.delete(client);
      } else {
        refs.refs.splice(0, refs.i);
        refs.i = 0;
      }
    });
  };

  /**
   * Read the next Item in a Decoder and fill this Item with the read data.
   *
   * This is called when data is received from a remote peer.
   *
   * @param {AbstractUpdateDecoder} decoder The decoder object to read data from.
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const readStructs = (decoder, transaction, store) => {
    const clientsStructRefs = new Map();
    // let start = performance.now()
    readClientsStructRefs(decoder, clientsStructRefs, transaction.doc);
    // console.log('time to read structs: ', performance.now() - start) // @todo remove
    // start = performance.now()
    mergeReadStructsIntoPendingReads(store, clientsStructRefs);
    // console.log('time to merge: ', performance.now() - start) // @todo remove
    // start = performance.now()
    resumeStructIntegration(transaction, store);
    // console.log('time to integrate: ', performance.now() - start) // @todo remove
    // start = performance.now()
    cleanupPendingStructs(store.pendingClientsStructRefs);
    // console.log('time to cleanup: ', performance.now() - start) // @todo remove
    // start = performance.now()
    tryResumePendingDeleteReaders(transaction, store);
    // console.log('time to resume delete readers: ', performance.now() - start) // @todo remove
    // start = performance.now()
  };

  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {AbstractUpdateDecoder} [structDecoder]
   *
   * @function
   */
  const readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) =>
    transact(ydoc, transaction => {
      readStructs(structDecoder, transaction, ydoc.store);
      readAndApplyDeleteSet(structDecoder, transaction, ydoc.store);
    }, transactionOrigin, false);

  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   *
   * @function
   */
  const applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
    const decoder = createDecoder(update);
    readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
  };

  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, DefaultUpdateDecoder);

  /**
   * Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
   * only write the operations that are missing.
   *
   * @param {AbstractUpdateEncoder} encoder
   * @param {Doc} doc
   * @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   *
   * @function
   */
  const writeStateAsUpdate = (encoder, doc, targetStateVector = new Map()) => {
    writeClientsStructs(encoder, doc.store, targetStateVector);
    writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
  };

  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @param {AbstractUpdateEncoder} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdateV2 = (doc, encodedTargetStateVector, encoder = new UpdateEncoderV2()) => {
    const targetStateVector = encodedTargetStateVector == null ? new Map() : decodeStateVector(encodedTargetStateVector);
    writeStateAsUpdate(encoder, doc, targetStateVector);
    return encoder.toUint8Array()
  };

  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new DefaultUpdateEncoder());

  /**
   * Read state vector from Decoder and return as Map
   *
   * @param {AbstractDSDecoder} decoder
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const readStateVector = decoder => {
    const ss = new Map();
    const ssLength = readVarUint(decoder.restDecoder);
    for (let i = 0; i < ssLength; i++) {
      const client = readVarUint(decoder.restDecoder);
      const clock = readVarUint(decoder.restDecoder);
      ss.set(client, clock);
    }
    return ss
  };

  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const decodeStateVector = decodedState => readStateVector(new DefaultDSDecoder(createDecoder(decodedState)));

  /**
   * @param {AbstractDSEncoder} encoder
   * @param {Map<number,number>} sv
   * @function
   */
  const writeStateVector = (encoder, sv) => {
    writeVarUint(encoder.restEncoder, sv.size);
    sv.forEach((clock, client) => {
      writeVarUint(encoder.restEncoder, client); // @todo use a special client decoder that is based on mapping
      writeVarUint(encoder.restEncoder, clock);
    });
    return encoder
  };

  /**
   * @param {AbstractDSEncoder} encoder
   * @param {Doc} doc
   *
   * @function
   */
  const writeDocumentStateVector = (encoder, doc) => writeStateVector(encoder, getStateVector(doc.store));

  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc} doc
   * @param {AbstractDSEncoder} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVectorV2 = (doc, encoder = new DSEncoderV2()) => {
    writeDocumentStateVector(encoder, doc);
    return encoder.toUint8Array()
  };

  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc} doc
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVector = doc => encodeStateVectorV2(doc, new DefaultDSEncoder());

  /**
   * General event handler implementation.
   *
   * @template ARG0, ARG1
   *
   * @private
   */
  class EventHandler {
    constructor () {
      /**
       * @type {Array<function(ARG0, ARG1):void>}
       */
      this.l = [];
    }
  }

  /**
   * @template ARG0,ARG1
   * @returns {EventHandler<ARG0,ARG1>}
   *
   * @private
   * @function
   */
  const createEventHandler = () => new EventHandler();

  /**
   * Adds an event listener that is called when
   * {@link EventHandler#callEventListeners} is called.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler.
   *
   * @private
   * @function
   */
  const addEventHandlerListener = (eventHandler, f) =>
    eventHandler.l.push(f);

  /**
   * Removes an event listener.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler that was added with
   *                     {@link EventHandler#addEventListener}
   *
   * @private
   * @function
   */
  const removeEventHandlerListener = (eventHandler, f) => {
    const l = eventHandler.l;
    const len = l.length;
    eventHandler.l = l.filter(g => f !== g);
    if (len === eventHandler.l.length) {
      console.error('[yjs] Tried to remove event handler that doesn\'t exist.');
    }
  };

  /**
   * Call all event listeners that were added via
   * {@link EventHandler#addEventListener}.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {ARG0} arg0
   * @param {ARG1} arg1
   *
   * @private
   * @function
   */
  const callEventHandlerListeners = (eventHandler, arg0, arg1) =>
    callAll(eventHandler.l, [arg0, arg1]);

  class ID {
    /**
     * @param {number} client client id
     * @param {number} clock unique per client id, continuous number
     */
    constructor (client, clock) {
      /**
       * Client id
       * @type {number}
       */
      this.client = client;
      /**
       * unique per client id, continuous number
       * @type {number}
       */
      this.clock = clock;
    }
  }

  /**
   * @param {ID | null} a
   * @param {ID | null} b
   * @return {boolean}
   *
   * @function
   */
  const compareIDs = (a, b) => a === b || (a !== null && b !== null && a.client === b.client && a.clock === b.clock);

  /**
   * @param {number} client
   * @param {number} clock
   *
   * @private
   * @function
   */
  const createID = (client, clock) => new ID(client, clock);

  /**
   * The top types are mapped from y.share.get(keyname) => type.
   * `type` does not store any information about the `keyname`.
   * This function finds the correct `keyname` for `type` and throws otherwise.
   *
   * @param {AbstractType<any>} type
   * @return {string}
   *
   * @private
   * @function
   */
  const findRootTypeKey = type => {
    // @ts-ignore _y must be defined, otherwise unexpected case
    for (const [key, value] of type.doc.share.entries()) {
      if (value === type) {
        return key
      }
    }
    throw unexpectedCase()
  };

  /**
   * @param {Item} item
   * @param {Snapshot|undefined} snapshot
   *
   * @protected
   * @function
   */
  const isVisible = (item, snapshot) => snapshot === undefined ? !item.deleted : (
    snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id)
  );

  /**
   * @param {Transaction} transaction
   * @param {Snapshot} snapshot
   */
  const splitSnapshotAffectedStructs = (transaction, snapshot) => {
    const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create$1);
    const store = transaction.doc.store;
    // check if we already split for this snapshot
    if (!meta.has(snapshot)) {
      snapshot.sv.forEach((clock, client) => {
        if (clock < getState(store, client)) {
          getItemCleanStart(transaction, createID(client, clock));
        }
      });
      iterateDeletedStructs(transaction, snapshot.ds, item => {});
      meta.add(snapshot);
    }
  };

  class StructStore {
    constructor () {
      /**
       * @type {Map<number,Array<GC|Item>>}
       */
      this.clients = new Map();
      /**
       * Store incompleted struct reads here
       * `i` denotes to the next read operation
       * We could shift the array of refs instead, but shift is incredible
       * slow in Chrome for arrays with more than 100k elements
       * @see tryResumePendingStructRefs
       * @type {Map<number,{i:number,refs:Array<GC|Item>}>}
       */
      this.pendingClientsStructRefs = new Map();
      /**
       * Stack of pending structs waiting for struct dependencies
       * Maximum length of stack is structReaders.size
       * @type {Array<GC|Item>}
       */
      this.pendingStack = [];
      /**
       * @type {Array<DSDecoderV2>}
       */
      this.pendingDeleteReaders = [];
    }
  }

  /**
   * Return the states as a Map<client,clock>.
   * Note that clock refers to the next expected clock id.
   *
   * @param {StructStore} store
   * @return {Map<number,number>}
   *
   * @public
   * @function
   */
  const getStateVector = store => {
    const sm = new Map();
    store.clients.forEach((structs, client) => {
      const struct = structs[structs.length - 1];
      sm.set(client, struct.id.clock + struct.length);
    });
    return sm
  };

  /**
   * @param {StructStore} store
   * @param {number} client
   * @return {number}
   *
   * @public
   * @function
   */
  const getState = (store, client) => {
    const structs = store.clients.get(client);
    if (structs === undefined) {
      return 0
    }
    const lastStruct = structs[structs.length - 1];
    return lastStruct.id.clock + lastStruct.length
  };

  /**
   * @param {StructStore} store
   * @param {GC|Item} struct
   *
   * @private
   * @function
   */
  const addStruct = (store, struct) => {
    let structs = store.clients.get(struct.id.client);
    if (structs === undefined) {
      structs = [];
      store.clients.set(struct.id.client, structs);
    } else {
      const lastStruct = structs[structs.length - 1];
      if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
        throw unexpectedCase()
      }
    }
    structs.push(struct);
  };

  /**
   * Perform a binary search on a sorted array
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   * @return {number}
   *
   * @private
   * @function
   */
  const findIndexSS = (structs, clock) => {
    let left = 0;
    let right = structs.length - 1;
    let mid = structs[right];
    let midclock = mid.id.clock;
    if (midclock === clock) {
      return right
    }
    // @todo does it even make sense to pivot the search?
    // If a good split misses, it might actually increase the time to find the correct item.
    // Currently, the only advantage is that search with pivoting might find the item on the first try.
    let midindex = floor((clock / (midclock + mid.length - 1)) * right); // pivoting the search
    while (left <= right) {
      mid = structs[midindex];
      midclock = mid.id.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.length) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
      midindex = floor((left + right) / 2);
    }
    // Always check state before looking for a struct in StructStore
    // Therefore the case of not finding a struct is unexpected
    throw unexpectedCase()
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {GC|Item}
   *
   * @private
   * @function
   */
  const find = (store, id) => {
    /**
     * @type {Array<GC|Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    return structs[findIndexSS(structs, id.clock)]
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   * @private
   * @function
   */
  const getItem = /** @type {function(StructStore,ID):Item} */ (find);

  /**
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   */
  const findIndexCleanStart = (transaction, structs, clock) => {
    const index = findIndexSS(structs, clock);
    const struct = structs[index];
    if (struct.id.clock < clock && struct instanceof Item) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
      return index + 1
    }
    return index
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanStart = (transaction, id) => {
    const structs = /** @type {Array<Item>} */ (transaction.doc.store.clients.get(id.client));
    return structs[findIndexCleanStart(transaction, structs, id.clock)]
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanEnd = (transaction, store, id) => {
    /**
     * @type {Array<Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    const index = findIndexSS(structs, id.clock);
    const struct = structs[index];
    if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, id.clock - struct.id.clock + 1));
    }
    return struct
  };

  /**
   * Replace `item` with `newitem` in store
   * @param {StructStore} store
   * @param {GC|Item} struct
   * @param {GC|Item} newStruct
   *
   * @private
   * @function
   */
  const replaceStruct = (store, struct, newStruct) => {
    const structs = /** @type {Array<GC|Item>} */ (store.clients.get(struct.id.client));
    structs[findIndexSS(structs, struct.id.clock)] = newStruct;
  };

  /**
   * Iterate over a range of structs
   *
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clockStart Inclusive start
   * @param {number} len
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateStructs = (transaction, structs, clockStart, len, f) => {
    if (len === 0) {
      return
    }
    const clockEnd = clockStart + len;
    let index = findIndexCleanStart(transaction, structs, clockStart);
    let struct;
    do {
      struct = structs[index++];
      if (clockEnd < struct.id.clock + struct.length) {
        findIndexCleanStart(transaction, structs, clockEnd);
      }
      f(struct);
    } while (index < structs.length && structs[index].id.clock < clockEnd)
  };

  /**
   * A transaction is created for every change on the Yjs model. It is possible
   * to bundle changes on the Yjs model in a single transaction to
   * minimize the number on messages sent and the number of observer calls.
   * If possible the user of this library should bundle as many changes as
   * possible. Here is an example to illustrate the advantages of bundling:
   *
   * @example
   * const map = y.define('map', YMap)
   * // Log content when change is triggered
   * map.observe(() => {
   *   console.log('change triggered')
   * })
   * // Each change on the map type triggers a log message:
   * map.set('a', 0) // => "change triggered"
   * map.set('b', 0) // => "change triggered"
   * // When put in a transaction, it will trigger the log after the transaction:
   * y.transact(() => {
   *   map.set('a', 1)
   *   map.set('b', 1)
   * }) // => "change triggered"
   *
   * @public
   */
  class Transaction {
    /**
     * @param {Doc} doc
     * @param {any} origin
     * @param {boolean} local
     */
    constructor (doc, origin, local) {
      /**
       * The Yjs instance.
       * @type {Doc}
       */
      this.doc = doc;
      /**
       * Describes the set of deleted items by ids
       * @type {DeleteSet}
       */
      this.deleteSet = new DeleteSet();
      /**
       * Holds the state before the transaction started.
       * @type {Map<Number,Number>}
       */
      this.beforeState = getStateVector(doc.store);
      /**
       * Holds the state after the transaction.
       * @type {Map<Number,Number>}
       */
      this.afterState = new Map();
      /**
       * All types that were directly modified (property added or child
       * inserted/deleted). New types are not included in this Set.
       * Maps from type to parentSubs (`item.parentSub = null` for YArray)
       * @type {Map<AbstractType<YEvent>,Set<String|null>>}
       */
      this.changed = new Map();
      /**
       * Stores the events for the types that observe also child elements.
       * It is mainly used by `observeDeep`.
       * @type {Map<AbstractType<YEvent>,Array<YEvent>>}
       */
      this.changedParentTypes = new Map();
      /**
       * @type {Array<AbstractStruct>}
       */
      this._mergeStructs = [];
      /**
       * @type {any}
       */
      this.origin = origin;
      /**
       * Stores meta information on the transaction
       * @type {Map<any,any>}
       */
      this.meta = new Map();
      /**
       * Whether this change originates from this doc.
       * @type {boolean}
       */
      this.local = local;
      /**
       * @type {Set<Doc>}
       */
      this.subdocsAdded = new Set();
      /**
       * @type {Set<Doc>}
       */
      this.subdocsRemoved = new Set();
      /**
       * @type {Set<Doc>}
       */
      this.subdocsLoaded = new Set();
    }
  }

  /**
   * @param {AbstractUpdateEncoder} encoder
   * @param {Transaction} transaction
   * @return {boolean} Whether data was written.
   */
  const writeUpdateMessageFromTransaction = (encoder, transaction) => {
    if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
      return false
    }
    sortAndMergeDeleteSet(transaction.deleteSet);
    writeStructsFromTransaction(encoder, transaction);
    writeDeleteSet(encoder, transaction.deleteSet);
    return true
  };

  /**
   * If `type.parent` was added in current transaction, `type` technically
   * did not change, it was just added and we should not fire events for `type`.
   *
   * @param {Transaction} transaction
   * @param {AbstractType<YEvent>} type
   * @param {string|null} parentSub
   */
  const addChangedTypeToTransaction = (transaction, type, parentSub) => {
    const item = type._item;
    if (item === null || (item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted)) {
      setIfUndefined(transaction.changed, type, create$1).add(parentSub);
    }
  };

  /**
   * @param {Array<AbstractStruct>} structs
   * @param {number} pos
   */
  const tryToMergeWithLeft = (structs, pos) => {
    const left = structs[pos - 1];
    const right = structs[pos];
    if (left.deleted === right.deleted && left.constructor === right.constructor) {
      if (left.mergeWith(right)) {
        structs.splice(pos, 1);
        if (right instanceof Item && right.parentSub !== null && /** @type {AbstractType<any>} */ (right.parent)._map.get(right.parentSub) === right) {
          /** @type {AbstractType<any>} */ (right.parent)._map.set(right.parentSub, /** @type {Item} */ (left));
        }
      }
    }
  };

  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(Item):boolean} gcFilter
   */
  const tryGcDeleteSet = (ds, store, gcFilter) => {
    for (const [client, deleteItems] of ds.clients.entries()) {
      const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
      for (let di = deleteItems.length - 1; di >= 0; di--) {
        const deleteItem = deleteItems[di];
        const endDeleteItemClock = deleteItem.clock + deleteItem.len;
        for (
          let si = findIndexSS(structs, deleteItem.clock), struct = structs[si];
          si < structs.length && struct.id.clock < endDeleteItemClock;
          struct = structs[++si]
        ) {
          const struct = structs[si];
          if (deleteItem.clock + deleteItem.len <= struct.id.clock) {
            break
          }
          if (struct instanceof Item && struct.deleted && !struct.keep && gcFilter(struct)) {
            struct.gc(store, false);
          }
        }
      }
    }
  };

  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   */
  const tryMergeDeleteSet = (ds, store) => {
    // try to merge deleted / gc'd items
    // merge from right to left for better efficiecy and so we don't miss any merge targets
    ds.clients.forEach((deleteItems, client) => {
      const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
      for (let di = deleteItems.length - 1; di >= 0; di--) {
        const deleteItem = deleteItems[di];
        // start with merging the item next to the last deleted item
        const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
        for (
          let si = mostRightIndexToCheck, struct = structs[si];
          si > 0 && struct.id.clock >= deleteItem.clock;
          struct = structs[--si]
        ) {
          tryToMergeWithLeft(structs, si);
        }
      }
    });
  };

  /**
   * @param {Array<Transaction>} transactionCleanups
   * @param {number} i
   */
  const cleanupTransactions = (transactionCleanups, i) => {
    if (i < transactionCleanups.length) {
      const transaction = transactionCleanups[i];
      const doc = transaction.doc;
      const store = doc.store;
      const ds = transaction.deleteSet;
      const mergeStructs = transaction._mergeStructs;
      try {
        sortAndMergeDeleteSet(ds);
        transaction.afterState = getStateVector(transaction.doc.store);
        doc._transaction = null;
        doc.emit('beforeObserverCalls', [transaction, doc]);
        /**
         * An array of event callbacks.
         *
         * Each callback is called even if the other ones throw errors.
         *
         * @type {Array<function():void>}
         */
        const fs = [];
        // observe events on changed types
        transaction.changed.forEach((subs, itemtype) =>
          fs.push(() => {
            if (itemtype._item === null || !itemtype._item.deleted) {
              itemtype._callObserver(transaction, subs);
            }
          })
        );
        fs.push(() => {
          // deep observe events
          transaction.changedParentTypes.forEach((events, type) =>
            fs.push(() => {
              // We need to think about the possibility that the user transforms the
              // Y.Doc in the event.
              if (type._item === null || !type._item.deleted) {
                events = events
                  .filter(event =>
                    event.target._item === null || !event.target._item.deleted
                  );
                events
                  .forEach(event => {
                    event.currentTarget = type;
                  });
                // sort events by path length so that top-level events are fired first.
                events
                  .sort((event1, event2) => event1.path.length - event2.path.length);
                // We don't need to check for events.length
                // because we know it has at least one element
                callEventHandlerListeners(type._dEH, events, transaction);
              }
            })
          );
          fs.push(() => doc.emit('afterTransaction', [transaction, doc]));
        });
        callAll(fs, []);
      } finally {
        // Replace deleted items with ItemDeleted / GC.
        // This is where content is actually remove from the Yjs Doc.
        if (doc.gc) {
          tryGcDeleteSet(ds, store, doc.gcFilter);
        }
        tryMergeDeleteSet(ds, store);

        // on all affected store.clients props, try to merge
        transaction.afterState.forEach((clock, client) => {
          const beforeClock = transaction.beforeState.get(client) || 0;
          if (beforeClock !== clock) {
            const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
            // we iterate from right to left so we can safely remove entries
            const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
            for (let i = structs.length - 1; i >= firstChangePos; i--) {
              tryToMergeWithLeft(structs, i);
            }
          }
        });
        // try to merge mergeStructs
        // @todo: it makes more sense to transform mergeStructs to a DS, sort it, and merge from right to left
        //        but at the moment DS does not handle duplicates
        for (let i = 0; i < mergeStructs.length; i++) {
          const { client, clock } = mergeStructs[i].id;
          const structs = /** @type {Array<GC|Item>} */ (store.clients.get(client));
          const replacedStructPos = findIndexSS(structs, clock);
          if (replacedStructPos + 1 < structs.length) {
            tryToMergeWithLeft(structs, replacedStructPos + 1);
          }
          if (replacedStructPos > 0) {
            tryToMergeWithLeft(structs, replacedStructPos);
          }
        }
        if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
          doc.clientID = generateNewClientId();
          print(ORANGE, BOLD, '[yjs] ', UNBOLD, RED, 'Changed the client-id because another client seems to be using it.');
        }
        // @todo Merge all the transactions into one and provide send the data as a single update message
        doc.emit('afterTransactionCleanup', [transaction, doc]);
        if (doc._observers.has('update')) {
          const encoder = new DefaultUpdateEncoder();
          const hasContent = writeUpdateMessageFromTransaction(encoder, transaction);
          if (hasContent) {
            doc.emit('update', [encoder.toUint8Array(), transaction.origin, doc]);
          }
        }
        if (doc._observers.has('updateV2')) {
          const encoder = new UpdateEncoderV2();
          const hasContent = writeUpdateMessageFromTransaction(encoder, transaction);
          if (hasContent) {
            doc.emit('updateV2', [encoder.toUint8Array(), transaction.origin, doc]);
          }
        }
        transaction.subdocsAdded.forEach(subdoc => doc.subdocs.add(subdoc));
        transaction.subdocsRemoved.forEach(subdoc => doc.subdocs.delete(subdoc));

        doc.emit('subdocs', [{ loaded: transaction.subdocsLoaded, added: transaction.subdocsAdded, removed: transaction.subdocsRemoved }]);
        transaction.subdocsRemoved.forEach(subdoc => subdoc.destroy());

        if (transactionCleanups.length <= i + 1) {
          doc._transactionCleanups = [];
          doc.emit('afterAllTransactions', [doc, transactionCleanups]);
        } else {
          cleanupTransactions(transactionCleanups, i + 1);
        }
      }
    }
  };

  /**
   * Implements the functionality of `y.transact(()=>{..})`
   *
   * @param {Doc} doc
   * @param {function(Transaction):void} f
   * @param {any} [origin=true]
   *
   * @function
   */
  const transact = (doc, f, origin = null, local = true) => {
    const transactionCleanups = doc._transactionCleanups;
    let initialCall = false;
    if (doc._transaction === null) {
      initialCall = true;
      doc._transaction = new Transaction(doc, origin, local);
      transactionCleanups.push(doc._transaction);
      if (transactionCleanups.length === 1) {
        doc.emit('beforeAllTransactions', [doc]);
      }
      doc.emit('beforeTransaction', [doc._transaction, doc]);
    }
    try {
      f(doc._transaction);
    } finally {
      if (initialCall && transactionCleanups[0] === doc._transaction) {
        // The first transaction ended, now process observer calls.
        // Observer call may create new transactions for which we need to call the observers and do cleanup.
        // We don't want to nest these calls, so we execute these calls one after
        // another.
        // Also we need to ensure that all cleanups are called, even if the
        // observes throw errors.
        // This file is full of hacky try {} finally {} blocks to ensure that an
        // event can throw errors and also that the cleanup is called.
        cleanupTransactions(transactionCleanups, 0);
      }
    }
  };

  /**
   * YEvent describes the changes on a YType.
   */
  class YEvent {
    /**
     * @param {AbstractType<any>} target The changed type.
     * @param {Transaction} transaction
     */
    constructor (target, transaction) {
      /**
       * The type on which this event was created on.
       * @type {AbstractType<any>}
       */
      this.target = target;
      /**
       * The current target on which the observe callback is called.
       * @type {AbstractType<any>}
       */
      this.currentTarget = target;
      /**
       * The transaction that triggered this event.
       * @type {Transaction}
       */
      this.transaction = transaction;
      /**
       * @type {Object|null}
       */
      this._changes = null;
    }

    /**
     * Computes the path from `y` to the changed type.
     *
     * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
     *
     * The following property holds:
     * @example
     *   let type = y
     *   event.path.forEach(dir => {
     *     type = type.get(dir)
     *   })
     *   type === event.target // => true
     */
    get path () {
      // @ts-ignore _item is defined because target is integrated
      return getPathTo(this.currentTarget, this.target)
    }

    /**
     * Check if a struct is deleted by this event.
     *
     * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    deletes (struct) {
      return isDeleted(this.transaction.deleteSet, struct.id)
    }

    /**
     * Check if a struct is added by this event.
     *
     * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    adds (struct) {
      return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0)
    }

    /**
     * @return {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert:Array<any>}|{delete:number}|{retain:number}>}}
     */
    get changes () {
      let changes = this._changes;
      if (changes === null) {
        const target = this.target;
        const added = create$1();
        const deleted = create$1();
        /**
         * @type {Array<{insert:Array<any>}|{delete:number}|{retain:number}>}
         */
        const delta = [];
        /**
         * @type {Map<string,{ action: 'add' | 'update' | 'delete', oldValue: any}>}
         */
        const keys = new Map();
        changes = {
          added, deleted, delta, keys
        };
        const changed = /** @type Set<string|null> */ (this.transaction.changed.get(target));
        if (changed.has(null)) {
          /**
           * @type {any}
           */
          let lastOp = null;
          const packOp = () => {
            if (lastOp) {
              delta.push(lastOp);
            }
          };
          for (let item = target._start; item !== null; item = item.right) {
            if (item.deleted) {
              if (this.deletes(item) && !this.adds(item)) {
                if (lastOp === null || lastOp.delete === undefined) {
                  packOp();
                  lastOp = { delete: 0 };
                }
                lastOp.delete += item.length;
                deleted.add(item);
              } // else nop
            } else {
              if (this.adds(item)) {
                if (lastOp === null || lastOp.insert === undefined) {
                  packOp();
                  lastOp = { insert: [] };
                }
                lastOp.insert = lastOp.insert.concat(item.content.getContent());
                added.add(item);
              } else {
                if (lastOp === null || lastOp.retain === undefined) {
                  packOp();
                  lastOp = { retain: 0 };
                }
                lastOp.retain += item.length;
              }
            }
          }
          if (lastOp !== null && lastOp.retain === undefined) {
            packOp();
          }
        }
        changed.forEach(key => {
          if (key !== null) {
            const item = /** @type {Item} */ (target._map.get(key));
            /**
             * @type {'delete' | 'add' | 'update'}
             */
            let action;
            let oldValue;
            if (this.adds(item)) {
              let prev = item.left;
              while (prev !== null && this.adds(prev)) {
                prev = prev.left;
              }
              if (this.deletes(item)) {
                if (prev !== null && this.deletes(prev)) {
                  action = 'delete';
                  oldValue = last(prev.content.getContent());
                } else {
                  return
                }
              } else {
                if (prev !== null && this.deletes(prev)) {
                  action = 'update';
                  oldValue = last(prev.content.getContent());
                } else {
                  action = 'add';
                  oldValue = undefined;
                }
              }
            } else {
              if (this.deletes(item)) {
                action = 'delete';
                oldValue = last(/** @type {Item} */ item.content.getContent());
              } else {
                return // nop
              }
            }
            keys.set(key, { action, oldValue });
          }
        });
        this._changes = changes;
      }
      return /** @type {any} */ (changes)
    }
  }

  /**
   * Compute the path from this type to the specified target.
   *
   * @example
   *   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
   *   const path = type.getPathTo(child)
   *   // assuming `type instanceof YArray`
   *   console.log(path) // might look like => [2, 'key1']
   *   child === type.get(path[0]).get(path[1])
   *
   * @param {AbstractType<any>} parent
   * @param {AbstractType<any>} child target
   * @return {Array<string|number>} Path to the target
   *
   * @private
   * @function
   */
  const getPathTo = (parent, child) => {
    const path = [];
    while (child._item !== null && child !== parent) {
      if (child._item.parentSub !== null) {
        // parent is map-ish
        path.unshift(child._item.parentSub);
      } else {
        // parent is array-ish
        let i = 0;
        let c = /** @type {AbstractType<any>} */ (child._item.parent)._start;
        while (c !== child._item && c !== null) {
          if (!c.deleted) {
            i++;
          }
          c = c.right;
        }
        path.unshift(i);
      }
      child = /** @type {AbstractType<any>} */ (child._item.parent);
    }
    return path
  };

  const maxSearchMarker = 80;

  /**
   * A unique timestamp that identifies each marker.
   *
   * Time is relative,.. this is more like an ever-increasing clock.
   *
   * @type {number}
   */
  let globalSearchMarkerTimestamp = 0;

  class ArraySearchMarker {
    /**
     * @param {Item} p
     * @param {number} index
     */
    constructor (p, index) {
      p.marker = true;
      this.p = p;
      this.index = index;
      this.timestamp = globalSearchMarkerTimestamp++;
    }
  }

  /**
   * @param {ArraySearchMarker} marker
   */
  const refreshMarkerTimestamp = marker => { marker.timestamp = globalSearchMarkerTimestamp++; };

  /**
   * This is rather complex so this function is the only thing that should overwrite a marker
   *
   * @param {ArraySearchMarker} marker
   * @param {Item} p
   * @param {number} index
   */
  const overwriteMarker = (marker, p, index) => {
    marker.p.marker = false;
    marker.p = p;
    p.marker = true;
    marker.index = index;
    marker.timestamp = globalSearchMarkerTimestamp++;
  };

  /**
   * @param {Array<ArraySearchMarker>} searchMarker
   * @param {Item} p
   * @param {number} index
   */
  const markPosition = (searchMarker, p, index) => {
    if (searchMarker.length >= maxSearchMarker) {
      // override oldest marker (we don't want to create more objects)
      const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
      overwriteMarker(marker, p, index);
      return marker
    } else {
      // create new marker
      const pm = new ArraySearchMarker(p, index);
      searchMarker.push(pm);
      return pm
    }
  };

  /**
   * Search marker help us to find positions in the associative array faster.
   *
   * They speed up the process of finding a position without much bookkeeping.
   *
   * A maximum of `maxSearchMarker` objects are created.
   *
   * This function always returns a refreshed marker (updated timestamp)
   *
   * @param {AbstractType<any>} yarray
   * @param {number} index
   */
  const findMarker = (yarray, index) => {
    if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
      return null
    }
    const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
    let p = yarray._start;
    let pindex = 0;
    if (marker !== null) {
      p = marker.p;
      pindex = marker.index;
      refreshMarkerTimestamp(marker); // we used it, we might need to use it again
    }
    // iterate to right if possible
    while (p.right !== null && pindex < index) {
      if (!p.deleted && p.countable) {
        if (index < pindex + p.length) {
          break
        }
        pindex += p.length;
      }
      p = p.right;
    }
    // iterate to left if necessary (might be that pindex > index)
    while (p.left !== null && pindex > index) {
      p = p.left;
      if (!p.deleted && p.countable) {
        pindex -= p.length;
      }
    }
    // we want to make sure that p can't be merged with left, because that would screw up everything
    // in that cas just return what we have (it is most likely the best marker anyway)
    // iterate to left until p can't be merged with left
    while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
      p = p.left;
      if (!p.deleted && p.countable) {
        pindex -= p.length;
      }
    }

    // @todo remove!
    // assure position
    // {
    //   let start = yarray._start
    //   let pos = 0
    //   while (start !== p) {
    //     if (!start.deleted && start.countable) {
    //       pos += start.length
    //     }
    //     start = /** @type {Item} */ (start.right)
    //   }
    //   if (pos !== pindex) {
    //     debugger
    //     throw new Error('Gotcha position fail!')
    //   }
    // }
    // if (marker) {
    //   if (window.lengthes == null) {
    //     window.lengthes = []
    //     window.getLengthes = () => window.lengthes.sort((a, b) => a - b)
    //   }
    //   window.lengthes.push(marker.index - pindex)
    //   console.log('distance', marker.index - pindex, 'len', p && p.parent.length)
    // }
    if (marker !== null && abs(marker.index - pindex) < /** @type {YText|YArray<any>} */ (p.parent).length / maxSearchMarker) {
      // adjust existing marker
      overwriteMarker(marker, p, pindex);
      return marker
    } else {
      // create new marker
      return markPosition(yarray._searchMarker, p, pindex)
    }
  };

  /**
   * Update markers when a change happened.
   *
   * This should be called before doing a deletion!
   *
   * @param {Array<ArraySearchMarker>} searchMarker
   * @param {number} index
   * @param {number} len If insertion, len is positive. If deletion, len is negative.
   */
  const updateMarkerChanges = (searchMarker, index, len) => {
    for (let i = searchMarker.length - 1; i >= 0; i--) {
      const m = searchMarker[i];
      if (len > 0) {
        /**
         * @type {Item|null}
         */
        let p = m.p;
        p.marker = false;
        // Ideally we just want to do a simple position comparison, but this will only work if
        // search markers don't point to deleted items for formats.
        // Iterate marker to prev undeleted countable position so we know what to do when updating a position
        while (p && (p.deleted || !p.countable)) {
          p = p.left;
          if (p && !p.deleted && p.countable) {
            // adjust position. the loop should break now
            m.index -= p.length;
          }
        }
        if (p === null || p.marker === true) {
          // remove search marker if updated position is null or if position is already marked
          searchMarker.splice(i, 1);
          continue
        }
        m.p = p;
        p.marker = true;
      }
      if (index < m.index || (len > 0 && index === m.index)) { // a simple index <= m.index check would actually suffice
        m.index = max(index, m.index + len);
      }
    }
  };

  /**
   * Call event listeners with an event. This will also add an event to all
   * parents (for `.observeDeep` handlers).
   *
   * @template EventType
   * @param {AbstractType<EventType>} type
   * @param {Transaction} transaction
   * @param {EventType} event
   */
  const callTypeObservers = (type, transaction, event) => {
    const changedType = type;
    const changedParentTypes = transaction.changedParentTypes;
    while (true) {
      // @ts-ignore
      setIfUndefined(changedParentTypes, type, () => []).push(event);
      if (type._item === null) {
        break
      }
      type = /** @type {AbstractType<any>} */ (type._item.parent);
    }
    callEventHandlerListeners(changedType._eH, event, transaction);
  };

  /**
   * @template EventType
   * Abstract Yjs Type class
   */
  class AbstractType {
    constructor () {
      /**
       * @type {Item|null}
       */
      this._item = null;
      /**
       * @type {Map<string,Item>}
       */
      this._map = new Map();
      /**
       * @type {Item|null}
       */
      this._start = null;
      /**
       * @type {Doc|null}
       */
      this.doc = null;
      this._length = 0;
      /**
       * Event handlers
       * @type {EventHandler<EventType,Transaction>}
       */
      this._eH = createEventHandler();
      /**
       * Deep event handlers
       * @type {EventHandler<Array<YEvent>,Transaction>}
       */
      this._dEH = createEventHandler();
      /**
       * @type {null | Array<ArraySearchMarker>}
       */
      this._searchMarker = null;
    }

    /**
     * @return {AbstractType<any>|null}
     */
    get parent () {
      return this._item ? /** @type {AbstractType<any>} */ (this._item.parent) : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item|null} item
     */
    _integrate (y, item) {
      this.doc = y;
      this._item = item;
    }

    /**
     * @return {AbstractType<EventType>}
     */
    _copy () {
      throw methodUnimplemented()
    }

    /**
     * @return {AbstractType<EventType>}
     */
    clone () {
      throw methodUnimplemented()
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     */
    _write (encoder) { }

    /**
     * The first non-deleted item
     */
    get _first () {
      let n = this._start;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Creates YEvent and calls all type observers.
     * Must be implemented by each type.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      if (!transaction.local && this._searchMarker) {
        this._searchMarker.length = 0;
      }
    }

    /**
     * Observe all events that are created on this type.
     *
     * @param {function(EventType, Transaction):void} f Observer function
     */
    observe (f) {
      addEventHandlerListener(this._eH, f);
    }

    /**
     * Observe all events that are created by this type and its children.
     *
     * @param {function(Array<YEvent>,Transaction):void} f Observer function
     */
    observeDeep (f) {
      addEventHandlerListener(this._dEH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(EventType,Transaction):void} f Observer function
     */
    unobserve (f) {
      removeEventHandlerListener(this._eH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(Array<YEvent>,Transaction):void} f Observer function
     */
    unobserveDeep (f) {
      removeEventHandlerListener(this._dEH, f);
    }

    /**
     * @abstract
     * @return {any}
     */
    toJSON () {}
  }

  /**
   * @param {AbstractType<any>} type
   * @param {number} start
   * @param {number} end
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListSlice = (type, start, end) => {
    if (start < 0) {
      start = type._length + start;
    }
    if (end < 0) {
      end = type._length + end;
    }
    let len = end - start;
    const cs = [];
    let n = type._start;
    while (n !== null && len > 0) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        if (c.length <= start) {
          start -= c.length;
        } else {
          for (let i = start; i < c.length && len > 0; i++) {
            cs.push(c[i]);
            len--;
          }
          start = 0;
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * @param {AbstractType<any>} type
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListToArray = type => {
    const cs = [];
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          cs.push(c[i]);
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * Executes a provided function on once on overy element of this YArray.
   *
   * @param {AbstractType<any>} type
   * @param {function(any,number,any):void} f A function to execute on every element of this YArray.
   *
   * @private
   * @function
   */
  const typeListForEach = (type, f) => {
    let index = 0;
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          f(c[i], index++, type);
        }
      }
      n = n.right;
    }
  };

  /**
   * @template C,R
   * @param {AbstractType<any>} type
   * @param {function(C,number,AbstractType<any>):R} f
   * @return {Array<R>}
   *
   * @private
   * @function
   */
  const typeListMap = (type, f) => {
    /**
     * @type {Array<any>}
     */
    const result = [];
    typeListForEach(type, (c, i) => {
      result.push(f(c, i, type));
    });
    return result
  };

  /**
   * @param {AbstractType<any>} type
   * @return {IterableIterator<any>}
   *
   * @private
   * @function
   */
  const typeListCreateIterator = type => {
    let n = type._start;
    /**
     * @type {Array<any>|null}
     */
    let currentContent = null;
    let currentContentIndex = 0;
    return {
      [Symbol.iterator] () {
        return this
      },
      next: () => {
        // find some content
        if (currentContent === null) {
          while (n !== null && n.deleted) {
            n = n.right;
          }
          // check if we reached the end, no need to check currentContent, because it does not exist
          if (n === null) {
            return {
              done: true,
              value: undefined
            }
          }
          // we found n, so we can set currentContent
          currentContent = n.content.getContent();
          currentContentIndex = 0;
          n = n.right; // we used the content of n, now iterate to next
        }
        const value = currentContent[currentContentIndex++];
        // check if we need to empty currentContent
        if (currentContent.length <= currentContentIndex) {
          currentContent = null;
        }
        return {
          done: false,
          value
        }
      }
    }
  };

  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @return {any}
   *
   * @private
   * @function
   */
  const typeListGet = (type, index) => {
    const marker = findMarker(type, index);
    let n = type._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
    }
    for (; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          return n.content.getContent()[index]
        }
        index -= n.length;
      }
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item?} referenceItem
   * @param {Array<Object<string,any>|Array<any>|boolean|number|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
    let left = referenceItem;
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    const store = doc.store;
    const right = referenceItem === null ? parent._start : referenceItem.right;
    /**
     * @type {Array<Object|Array<any>|number>}
     */
    let jsonContent = [];
    const packJsonContent = () => {
      if (jsonContent.length > 0) {
        left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
        left.integrate(transaction, 0);
        jsonContent = [];
      }
    };
    content.forEach(c => {
      switch (c.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          jsonContent.push(c);
          break
        default:
          packJsonContent();
          switch (c.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(/** @type {Uint8Array} */ (c))));
              left.integrate(transaction, 0);
              break
            case Doc:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(/** @type {Doc} */ (c)));
              left.integrate(transaction, 0);
              break
            default:
              if (c instanceof AbstractType) {
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                left.integrate(transaction, 0);
              } else {
                throw new Error('Unexpected content type in insert operation')
              }
          }
      }
    });
    packJsonContent();
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {Array<Object<string,any>|Array<any>|number|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenerics = (transaction, parent, index, content) => {
    if (index === 0) {
      if (parent._searchMarker) {
        updateMarkerChanges(parent._searchMarker, index, content.length);
      }
      return typeListInsertGenericsAfter(transaction, parent, null, content)
    }
    const startIndex = index;
    const marker = findMarker(parent, index);
    let n = parent._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
      // we need to iterate one to the left so that the algorithm works
      if (index === 0) {
        // @todo refactor this as it actually doesn't consider formats
        n = n.prev; // important! get the left undeleted item so that we can actually decrease index
        index += (n && n.countable && !n.deleted) ? n.length : 0;
      }
    }
    for (; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index <= n.length) {
          if (index < n.length) {
            // insert in-between
            getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
          }
          break
        }
        index -= n.length;
      }
    }
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, startIndex, content.length);
    }
    return typeListInsertGenericsAfter(transaction, parent, n, content)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {number} length
   *
   * @private
   * @function
   */
  const typeListDelete = (transaction, parent, index, length) => {
    if (length === 0) { return }
    const startIndex = index;
    const startLength = length;
    const marker = findMarker(parent, index);
    let n = parent._start;
    if (marker !== null) {
      n = marker.p;
      index -= marker.index;
    }
    // compute the first item to be deleted
    for (; n !== null && index > 0; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
        }
        index -= n.length;
      }
    }
    // delete all items until done
    while (length > 0 && n !== null) {
      if (!n.deleted) {
        if (length < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length));
        }
        n.delete(transaction);
        length -= n.length;
      }
      n = n.right;
    }
    if (length > 0) {
      throw create$2('array length exceeded')
    }
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, startIndex, -startLength + length /* in case we remove the above exception */);
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   *
   * @private
   * @function
   */
  const typeMapDelete = (transaction, parent, key) => {
    const c = parent._map.get(key);
    if (c !== undefined) {
      c.delete(transaction);
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @param {Object|number|Array<any>|string|Uint8Array|AbstractType<any>} value
   *
   * @private
   * @function
   */
  const typeMapSet = (transaction, parent, key, value) => {
    const left = parent._map.get(key) || null;
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    let content;
    if (value == null) {
      content = new ContentAny([value]);
    } else {
      switch (value.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          content = new ContentAny([value]);
          break
        case Uint8Array:
          content = new ContentBinary(/** @type {Uint8Array} */ (value));
          break
        case Doc:
          content = new ContentDoc(/** @type {Doc} */ (value));
          break
        default:
          if (value instanceof AbstractType) {
            content = new ContentType(value);
          } else {
            throw new Error('Unexpected content type')
          }
      }
    }
    new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {Object<string,any>|number|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
   *
   * @private
   * @function
   */
  const typeMapGet = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted ? val.content.getContent()[val.length - 1] : undefined
  };

  /**
   * @param {AbstractType<any>} parent
   * @return {Object<string,Object<string,any>|number|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
   *
   * @private
   * @function
   */
  const typeMapGetAll = (parent) => {
    /**
     * @type {Object<string,any>}
     */
    const res = {};
    parent._map.forEach((value, key) => {
      if (!value.deleted) {
        res[key] = value.content.getContent()[value.length - 1];
      }
    });
    return res
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {boolean}
   *
   * @private
   * @function
   */
  const typeMapHas = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted
  };

  /**
   * @param {Map<string,Item>} map
   * @return {IterableIterator<Array<any>>}
   *
   * @private
   * @function
   */
  const createMapIterator = map => iteratorFilter(map.entries(), /** @param {any} entry */ entry => !entry[1].deleted);

  /**
   * @module YArray
   */

  /**
   * Event that describes the changes on a YArray
   * @template T
   */
  class YArrayEvent extends YEvent {
    /**
     * @param {YArray<T>} yarray The changed type
     * @param {Transaction} transaction The transaction object
     */
    constructor (yarray, transaction) {
      super(yarray, transaction);
      this._transaction = transaction;
    }
  }

  /**
   * A shared Array implementation.
   * @template T
   * @extends AbstractType<YArrayEvent<T>>
   * @implements {Iterable<T>}
   */
  class YArray extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>?}
       * @private
       */
      this._prelimContent = [];
      /**
       * @type {Array<ArraySearchMarker>}
       */
      this._searchMarker = [];
    }

    /**
     * Construct a new YArray containing the specified items.
     * @template T
     * @param {Array<T>} items
     * @return {YArray<T>}
     */
    static from (items) {
      const a = new YArray();
      a.push(items);
      return a
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array<any>} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YArray()
    }

    /**
     * @return {YArray<T>}
     */
    clone () {
      const arr = new YArray();
      arr.insert(0, this.toArray().map(el =>
        el instanceof AbstractType ? el.clone() : el
      ));
      return arr
    }

    get length () {
      return this._prelimContent === null ? this._length : this._prelimContent.length
    }

    /**
     * Creates YArrayEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      super._callObserver(transaction, parentSubs);
      callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
    }

    /**
     * Inserts new content at an index.
     *
     * Important: This function expects an array of content. Not just a content
     * object. The reason for this "weirdness" is that inserting several elements
     * is very efficient when it is done as a single operation.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  yarray.insert(0, ['a'])
     *  // Insert numbers 1, 2 at position 1
     *  yarray.insert(1, [1, 2])
     *
     * @param {number} index The index to insert content at.
     * @param {Array<T>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        /** @type {Array<any>} */ (this._prelimContent).splice(index, 0, ...content);
      }
    }

    /**
     * Appends content to this YArray.
     *
     * @param {Array<T>} content Array of content to append.
     */
    push (content) {
      this.insert(this.length, content);
    }

    /**
     * Preppends content to this YArray.
     *
     * @param {Array<T>} content Array of content to preppend.
     */
    unshift (content) {
      this.insert(0, content);
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} length The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        /** @type {Array<any>} */ (this._prelimContent).splice(index, length);
      }
    }

    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {T}
     */
    get (index) {
      return typeListGet(this, index)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<T>}
     */
    toArray () {
      return typeListToArray(this)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @param {number} [start]
     * @param {number} [end]
     * @return {Array<T>}
     */
    slice (start = 0, end = this.length) {
      return typeListSlice(this, start, end)
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Array<any>}
     */
    toJSON () {
      return this.map(c => c instanceof AbstractType ? c.toJSON() : c)
    }

    /**
     * Returns an Array with the result of calling a provided function on every
     * element of this YArray.
     *
     * @template T,M
     * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
     * @return {Array<M>} A new array with each element being the result of the
     *                 callback function
     */
    map (f) {
      return typeListMap(this, /** @type {any} */ (f))
    }

    /**
     * Executes a provided function on once on overy element of this YArray.
     *
     * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      typeListForEach(this, f);
    }

    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return typeListCreateIterator(this)
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YArrayRefID);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   *
   * @private
   * @function
   */
  const readYArray = decoder => new YArray();

  /**
   * @template T
   * Event that describes the changes on a YMap.
   */
  class YMapEvent extends YEvent {
    /**
     * @param {YMap<T>} ymap The YArray that changed.
     * @param {Transaction} transaction
     * @param {Set<any>} subs The keys that changed.
     */
    constructor (ymap, transaction, subs) {
      super(ymap, transaction);
      this.keysChanged = subs;
    }
  }

  /**
   * @template T number|string|Object|Array|Uint8Array
   * A shared Map implementation.
   *
   * @extends AbstractType<YMapEvent<T>>
   * @implements {Iterable<T>}
   */
  class YMap extends AbstractType {
    /**
     *
     * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
     */
    constructor (entries) {
      super();
      /**
       * @type {Map<string,any>?}
       * @private
       */
      this._prelimContent = null;

      if (entries === undefined) {
        this._prelimContent = new Map();
      } else {
        this._prelimContent = new Map(entries);
      }
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item)
      ;/** @type {Map<string, any>} */ (this._prelimContent).forEach((value, key) => {
        this.set(key, value);
      });
      this._prelimContent = null;
    }

    _copy () {
      return new YMap()
    }

    /**
     * @return {YMap<T>}
     */
    clone () {
      const map = new YMap();
      this.forEach((value, key) => {
        map.set(key, value instanceof AbstractType ? value.clone() : value);
      });
      return map
    }

    /**
     * Creates YMapEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Object<string,T>}
     */
    toJSON () {
      /**
       * @type {Object<string,T>}
       */
      const map = {};
      this._map.forEach((item, key) => {
        if (!item.deleted) {
          const v = item.content.getContent()[item.length - 1];
          map[key] = v instanceof AbstractType ? v.toJSON() : v;
        }
      });
      return map
    }

    /**
     * Returns the size of the YMap (count of key/value pairs)
     *
     * @return {number}
     */
    get size () {
      return [...createMapIterator(this._map)].length
    }

    /**
     * Returns the keys for each element in the YMap Type.
     *
     * @return {IterableIterator<string>}
     */
    keys () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[0])
    }

    /**
     * Returns the values for each element in the YMap Type.
     *
     * @return {IterableIterator<any>}
     */
    values () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[1].content.getContent()[v[1].length - 1])
    }

    /**
     * Returns an Iterator of [key, value] pairs
     *
     * @return {IterableIterator<any>}
     */
    entries () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => [v[0], v[1].content.getContent()[v[1].length - 1]])
    }

    /**
     * Executes a provided function on once on every key-value pair.
     *
     * @param {function(T,string,YMap<T>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      /**
       * @type {Object<string,T>}
       */
      const map = {};
      this._map.forEach((item, key) => {
        if (!item.deleted) {
          f(item.content.getContent()[item.length - 1], key, this);
        }
      });
      return map
    }

    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this.entries()
    }

    /**
     * Remove a specified element from this YMap.
     *
     * @param {string} key The key of the element to remove.
     */
    delete (key) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, key);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).delete(key);
      }
    }

    /**
     * Adds or updates an element with a specified key and value.
     *
     * @param {string} key The key of the element to add to this YMap
     * @param {T} value The value of the element to add
     */
    set (key, value) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, key, value);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).set(key, value);
      }
      return value
    }

    /**
     * Returns a specified element from this YMap.
     *
     * @param {string} key
     * @return {T|undefined}
     */
    get (key) {
      return /** @type {any} */ (typeMapGet(this, key))
    }

    /**
     * Returns a boolean indicating whether the specified key exists or not.
     *
     * @param {string} key The key to test.
     * @return {boolean}
     */
    has (key) {
      return typeMapHas(this, key)
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YMapRefID);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   *
   * @private
   * @function
   */
  const readYMap = decoder => new YMap();

  /**
   * @param {any} a
   * @param {any} b
   * @return {boolean}
   */
  const equalAttrs = (a, b) => a === b || (typeof a === 'object' && typeof b === 'object' && a && b && equalFlat(a, b));

  class ItemTextListPosition {
    /**
     * @param {Item|null} left
     * @param {Item|null} right
     * @param {number} index
     * @param {Map<string,any>} currentAttributes
     */
    constructor (left, right, index, currentAttributes) {
      this.left = left;
      this.right = right;
      this.index = index;
      this.currentAttributes = currentAttributes;
    }

    /**
     * Only call this if you know that this.right is defined
     */
    forward () {
      if (this.right === null) {
        unexpectedCase();
      }
      switch (this.right.content.constructor) {
        case ContentEmbed:
        case ContentString:
          if (!this.right.deleted) {
            this.index += this.right.length;
          }
          break
        case ContentFormat:
          if (!this.right.deleted) {
            updateCurrentAttributes(this.currentAttributes, /** @type {ContentFormat} */ (this.right.content));
          }
          break
      }
      this.left = this.right;
      this.right = this.right.right;
    }
  }

  /**
   * @param {Transaction} transaction
   * @param {ItemTextListPosition} pos
   * @param {number} count steps to move forward
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findNextPosition = (transaction, pos, count) => {
    while (pos.right !== null && count > 0) {
      switch (pos.right.content.constructor) {
        case ContentEmbed:
        case ContentString:
          if (!pos.right.deleted) {
            if (count < pos.right.length) {
              // split right
              getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
            }
            pos.index += pos.right.length;
            count -= pos.right.length;
          }
          break
        case ContentFormat:
          if (!pos.right.deleted) {
            updateCurrentAttributes(pos.currentAttributes, /** @type {ContentFormat} */ (pos.right.content));
          }
          break
      }
      pos.left = pos.right;
      pos.right = pos.right.right;
      // pos.forward() - we don't forward because that would halve the performance because we already do the checks above
    }
    return pos
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findPosition = (transaction, parent, index) => {
    const currentAttributes = new Map();
    const marker = findMarker(parent, index);
    if (marker) {
      const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
      return findNextPosition(transaction, pos, index - marker.index)
    } else {
      const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
      return findNextPosition(transaction, pos, index)
    }
  };

  /**
   * Negate applied formats
   *
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {Map<string,any>} negatedAttributes
   *
   * @private
   * @function
   */
  const insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
    // check if we really need to remove attributes
    while (
      currPos.right !== null && (
        currPos.right.deleted === true || (
          currPos.right.content.constructor === ContentFormat &&
          equalAttrs(negatedAttributes.get(/** @type {ContentFormat} */ (currPos.right.content).key), /** @type {ContentFormat} */ (currPos.right.content).value)
        )
      )
    ) {
      if (!currPos.right.deleted) {
        negatedAttributes.delete(/** @type {ContentFormat} */ (currPos.right.content).key);
      }
      currPos.forward();
    }
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    let left = currPos.left;
    const right = currPos.right;
    negatedAttributes.forEach((val, key) => {
      left = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
      left.integrate(transaction, 0);
      currPos.currentAttributes.set(key, val);
      updateCurrentAttributes(currPos.currentAttributes, /** @type {ContentFormat} */ (left.content));
    });
  };

  /**
   * @param {Map<string,any>} currentAttributes
   * @param {ContentFormat} format
   *
   * @private
   * @function
   */
  const updateCurrentAttributes = (currentAttributes, format) => {
    const { key, value } = format;
    if (value === null) {
      currentAttributes.delete(key);
    } else {
      currentAttributes.set(key, value);
    }
  };

  /**
   * @param {ItemTextListPosition} currPos
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   */
  const minimizeAttributeChanges = (currPos, attributes) => {
    // go right while attributes[right.key] === right.value (or right is deleted)
    while (true) {
      if (currPos.right === null) {
        break
      } else if (currPos.right.deleted || (currPos.right.content.constructor === ContentFormat && equalAttrs(attributes[(/** @type {ContentFormat} */ (currPos.right.content)).key] || null, /** @type {ContentFormat} */ (currPos.right.content).value))) ; else {
        break
      }
      currPos.forward();
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {Object<string,any>} attributes
   * @return {Map<string,any>}
   *
   * @private
   * @function
   **/
  const insertAttributes = (transaction, parent, currPos, attributes) => {
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    const negatedAttributes = new Map();
    // insert format-start items
    for (const key in attributes) {
      const val = attributes[key];
      const currentVal = currPos.currentAttributes.get(key) || null;
      if (!equalAttrs(currentVal, val)) {
        // save negated attribute (set null if currentVal undefined)
        negatedAttributes.set(key, currentVal);
        const { left, right } = currPos;
        currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
        currPos.right.integrate(transaction, 0);
        currPos.forward();
      }
    }
    return negatedAttributes
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {string|object} text
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   **/
  const insertText = (transaction, parent, currPos, text, attributes) => {
    currPos.currentAttributes.forEach((val, key) => {
      if (attributes[key] === undefined) {
        attributes[key] = null;
      }
    });
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    minimizeAttributeChanges(currPos, attributes);
    const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
    // insert content
    const content = text.constructor === String ? new ContentString(/** @type {string} */ (text)) : new ContentEmbed(text);
    let { left, right, index } = currPos;
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
    }
    right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
    right.integrate(transaction, 0);
    currPos.right = right;
    currPos.index = index;
    currPos.forward();
    insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {ItemTextListPosition} currPos
   * @param {number} length
   * @param {Object<string,any>} attributes
   *
   * @private
   * @function
   */
  const formatText = (transaction, parent, currPos, length, attributes) => {
    const doc = transaction.doc;
    const ownClientId = doc.clientID;
    minimizeAttributeChanges(currPos, attributes);
    const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
    // iterate until first non-format or null is found
    // delete all formats with attributes[format.key] != null
    while (length > 0 && currPos.right !== null) {
      if (!currPos.right.deleted) {
        switch (currPos.right.content.constructor) {
          case ContentFormat: {
            const { key, value } = /** @type {ContentFormat} */ (currPos.right.content);
            const attr = attributes[key];
            if (attr !== undefined) {
              if (equalAttrs(attr, value)) {
                negatedAttributes.delete(key);
              } else {
                negatedAttributes.set(key, value);
              }
              currPos.right.delete(transaction);
            }
            break
          }
          case ContentEmbed:
          case ContentString:
            if (length < currPos.right.length) {
              getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
            }
            length -= currPos.right.length;
            break
        }
      }
      currPos.forward();
    }
    // Quill just assumes that the editor starts with a newline and that it always
    // ends with a newline. We only insert that newline when a new newline is
    // inserted - i.e when length is bigger than type.length
    if (length > 0) {
      let newlines = '';
      for (; length > 0; length--) {
        newlines += '\n';
      }
      currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
      currPos.right.integrate(transaction, 0);
      currPos.forward();
    }
    insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };

  /**
   * Call this function after string content has been deleted in order to
   * clean up formatting Items.
   *
   * @param {Transaction} transaction
   * @param {Item} start
   * @param {Item|null} end exclusive end, automatically iterates to the next Content Item
   * @param {Map<string,any>} startAttributes
   * @param {Map<string,any>} endAttributes This attribute is modified!
   * @return {number} The amount of formatting Items deleted.
   *
   * @function
   */
  const cleanupFormattingGap = (transaction, start, end, startAttributes, endAttributes) => {
    while (end && end.content.constructor !== ContentString && end.content.constructor !== ContentEmbed) {
      if (!end.deleted && end.content.constructor === ContentFormat) {
        updateCurrentAttributes(endAttributes, /** @type {ContentFormat} */ (end.content));
      }
      end = end.right;
    }
    let cleanups = 0;
    while (start !== end) {
      if (!start.deleted) {
        const content = start.content;
        switch (content.constructor) {
          case ContentFormat: {
            const { key, value } = /** @type {ContentFormat} */ (content);
            if ((endAttributes.get(key) || null) !== value || (startAttributes.get(key) || null) === value) {
              // Either this format is overwritten or it is not necessary because the attribute already existed.
              start.delete(transaction);
              cleanups++;
            }
            break
          }
        }
      }
      start = /** @type {Item} */ (start.right);
    }
    return cleanups
  };

  /**
   * @param {Transaction} transaction
   * @param {Item | null} item
   */
  const cleanupContextlessFormattingGap = (transaction, item) => {
    // iterate until item.right is null or content
    while (item && item.right && (item.right.deleted || (item.right.content.constructor !== ContentString && item.right.content.constructor !== ContentEmbed))) {
      item = item.right;
    }
    const attrs = new Set();
    // iterate back until a content item is found
    while (item && (item.deleted || (item.content.constructor !== ContentString && item.content.constructor !== ContentEmbed))) {
      if (!item.deleted && item.content.constructor === ContentFormat) {
        const key = /** @type {ContentFormat} */ (item.content).key;
        if (attrs.has(key)) {
          item.delete(transaction);
        } else {
          attrs.add(key);
        }
      }
      item = item.left;
    }
  };

  /**
   * This function is experimental and subject to change / be removed.
   *
   * Ideally, we don't need this function at all. Formatting attributes should be cleaned up
   * automatically after each change. This function iterates twice over the complete YText type
   * and removes unnecessary formatting attributes. This is also helpful for testing.
   *
   * This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
   *
   * @param {YText} type
   * @return {number} How many formatting attributes have been cleaned up.
   */
  const cleanupYTextFormatting = type => {
    let res = 0;
    transact(/** @type {Doc} */ (type.doc), transaction => {
      let start = /** @type {Item} */ (type._start);
      let end = type._start;
      let startAttributes = create();
      const currentAttributes = copy(startAttributes);
      while (end) {
        if (end.deleted === false) {
          switch (end.content.constructor) {
            case ContentFormat:
              updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (end.content));
              break
            case ContentEmbed:
            case ContentString:
              res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
              startAttributes = copy(currentAttributes);
              start = end;
              break
          }
        }
        end = end.right;
      }
    });
    return res
  };

  /**
   * @param {Transaction} transaction
   * @param {ItemTextListPosition} currPos
   * @param {number} length
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const deleteText = (transaction, currPos, length) => {
    const startLength = length;
    const startAttrs = copy(currPos.currentAttributes);
    const start = currPos.right;
    while (length > 0 && currPos.right !== null) {
      if (currPos.right.deleted === false) {
        switch (currPos.right.content.constructor) {
          case ContentEmbed:
          case ContentString:
            if (length < currPos.right.length) {
              getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
            }
            length -= currPos.right.length;
            currPos.right.delete(transaction);
            break
        }
      }
      currPos.forward();
    }
    if (start) {
      cleanupFormattingGap(transaction, start, currPos.right, startAttrs, copy(currPos.currentAttributes));
    }
    console.log('\n\n\n>>>currPos', currPos, '\n\n\n')
    const parent = /** @type {AbstractType<any>} */ (/** @type {Item} */ (currPos.left || currPos.right).parent);
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length);
    }
    return currPos
  };

  /**
   * The Quill Delta format represents changes on a text document with
   * formatting information. For mor information visit {@link https://quilljs.com/docs/delta/|Quill Delta}
   *
   * @example
   *   {
   *     ops: [
   *       { insert: 'Gandalf', attributes: { bold: true } },
   *       { insert: ' the ' },
   *       { insert: 'Grey', attributes: { color: '#cccccc' } }
   *     ]
   *   }
   *
   */

  /**
    * Attributes that can be assigned to a selection of text.
    *
    * @example
    *   {
    *     bold: true,
    *     font-size: '40px'
    *   }
    *
    * @typedef {Object} TextAttributes
    */

  /**
   * @typedef {Object} DeltaItem
   * @property {number|undefined} DeltaItem.delete
   * @property {number|undefined} DeltaItem.retain
   * @property {string|undefined} DeltaItem.insert
   * @property {Object<string,any>} DeltaItem.attributes
   */

  /**
   * Event that describes the changes on a YText type.
   */
  class YTextEvent extends YEvent {
    /**
     * @param {YText} ytext
     * @param {Transaction} transaction
     * @param {Set<any>} subs The keys that changed
     */
    constructor (ytext, transaction, subs) {
      super(ytext, transaction);
      /**
       * @type {Array<DeltaItem>|null}
       */
      this._delta = null;
      /**
       * Whether the children changed.
       * @type {Boolean}
       * @private
       */
      this.childListChanged = false;
      /**
       * Set of all changed attributes.
       * @type {Set<string>}
       */
      this.keysChanged = new Set();
      subs.forEach((sub) => {
        if (sub === null) {
          this.childListChanged = true;
        } else {
          this.keysChanged.add(sub);
        }
      });
    }

    /**
     * Compute the changes in the delta format.
     * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
     *
     * @type {Array<DeltaItem>}
     *
     * @public
     */
    get delta () {
      if (this._delta === null) {
        const y = /** @type {Doc} */ (this.target.doc);
        this._delta = [];
        transact(y, transaction => {
          const delta = /** @type {Array<DeltaItem>} */ (this._delta);
          const currentAttributes = new Map(); // saves all current attributes for insert
          const oldAttributes = new Map();
          let item = this.target._start;
          /**
           * @type {string?}
           */
          let action = null;
          /**
           * @type {Object<string,any>}
           */
          const attributes = {}; // counts added or removed new attributes for retain
          /**
           * @type {string|object}
           */
          let insert = '';
          let retain = 0;
          let deleteLen = 0;
          const addOp = () => {
            if (action !== null) {
              /**
               * @type {any}
               */
              let op;
              switch (action) {
                case 'delete':
                  op = { delete: deleteLen };
                  deleteLen = 0;
                  break
                case 'insert':
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    currentAttributes.forEach((value, key) => {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    });
                  }
                  insert = '';
                  break
                case 'retain':
                  op = { retain };
                  if (Object.keys(attributes).length > 0) {
                    op.attributes = {};
                    for (const key in attributes) {
                      op.attributes[key] = attributes[key];
                    }
                  }
                  retain = 0;
                  break
              }
              delta.push(op);
              action = null;
            }
          };
          while (item !== null) {
            switch (item.content.constructor) {
              case ContentEmbed:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    addOp();
                    action = 'insert';
                    insert = /** @type {ContentEmbed} */ (item.content).embed;
                    addOp();
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += 1;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += 1;
                }
                break
              case ContentString:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    if (action !== 'insert') {
                      addOp();
                      action = 'insert';
                    }
                    insert += /** @type {ContentString} */ (item.content).str;
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += item.length;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += item.length;
                }
                break
              case ContentFormat: {
                const { key, value } = /** @type {ContentFormat} */ (item.content);
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    const curVal = currentAttributes.get(key) || null;
                    if (!equalAttrs(curVal, value)) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (equalAttrs(value, (oldAttributes.get(key) || null))) {
                        delete attributes[key];
                      } else {
                        attributes[key] = value;
                      }
                    } else {
                      item.delete(transaction);
                    }
                  }
                } else if (this.deletes(item)) {
                  oldAttributes.set(key, value);
                  const curVal = currentAttributes.get(key) || null;
                  if (!equalAttrs(curVal, value)) {
                    if (action === 'retain') {
                      addOp();
                    }
                    attributes[key] = curVal;
                  }
                } else if (!item.deleted) {
                  oldAttributes.set(key, value);
                  const attr = attributes[key];
                  if (attr !== undefined) {
                    if (!equalAttrs(attr, value)) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (value === null) {
                        attributes[key] = value;
                      } else {
                        delete attributes[key];
                      }
                    } else {
                      item.delete(transaction);
                    }
                  }
                }
                if (!item.deleted) {
                  if (action === 'insert') {
                    addOp();
                  }
                  updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (item.content));
                }
                break
              }
            }
            item = item.right;
          }
          addOp();
          while (delta.length > 0) {
            const lastOp = delta[delta.length - 1];
            if (lastOp.retain !== undefined && lastOp.attributes === undefined) {
              // retain delta's if they don't assign attributes
              delta.pop();
            } else {
              break
            }
          }
        });
      }
      return this._delta
    }
  }

  /**
   * Type that represents text with formatting information.
   *
   * This type replaces y-richtext as this implementation is able to handle
   * block formats (format information on a paragraph), embeds (complex elements
   * like pictures and videos), and text formats (**bold**, *italic*).
   *
   * @extends AbstractType<YTextEvent>
   */
  class YText extends AbstractType {
    /**
     * @param {String} [string] The initial value of the YText.
     */
    constructor (string) {
      super();
      /**
       * Array of pending operations on this type
       * @type {Array<function():void>?}
       */
      this._pending = string !== undefined ? [() => this.insert(0, string)] : [];
      /**
       * @type {Array<ArraySearchMarker>}
       */
      this._searchMarker = [];
    }

    /**
     * Number of characters of this text type.
     *
     * @type {number}
     */
    get length () {
      return this._length
    }

    /**
     * @param {Doc} y
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      try {
        /** @type {Array<function>} */ (this._pending).forEach(f => f());
      } catch (e) {
        console.error(e);
      }
      this._pending = null;
    }

    _copy () {
      return new YText()
    }

    /**
     * @return {YText}
     */
    clone () {
      const text = new YText();
      text.applyDelta(this.toDelta());
      return text
    }

    /**
     * Creates YTextEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      super._callObserver(transaction, parentSubs);
      const event = new YTextEvent(this, transaction, parentSubs);
      const doc = transaction.doc;
      // If a remote change happened, we try to cleanup potential formatting duplicates.
      if (!transaction.local) {
        // check if another formatting item was inserted
        let foundFormattingItem = false;
        for (const [client, afterClock] of transaction.afterState.entries()) {
          const clock = transaction.beforeState.get(client) || 0;
          if (afterClock === clock) {
            continue
          }
          iterateStructs(transaction, /** @type {Array<Item|GC>} */ (doc.store.clients.get(client)), clock, afterClock, item => {
            if (!item.deleted && /** @type {Item} */ (item).content.constructor === ContentFormat) {
              foundFormattingItem = true;
            }
          });
          if (foundFormattingItem) {
            break
          }
        }
        if (!foundFormattingItem) {
          iterateDeletedStructs(transaction, transaction.deleteSet, item => {
            if (item instanceof GC || foundFormattingItem) {
              return
            }
            if (item.parent === this && item.content.constructor === ContentFormat) {
              foundFormattingItem = true;
            }
          });
        }
        transact(doc, (t) => {
          if (foundFormattingItem) {
            // If a formatting item was inserted, we simply clean the whole type.
            // We need to compute currentAttributes for the current position anyway.
            cleanupYTextFormatting(this);
          } else {
            // If no formatting attribute was inserted, we can make due with contextless
            // formatting cleanups.
            // Contextless: it is not necessary to compute currentAttributes for the affected position.
            iterateDeletedStructs(t, t.deleteSet, item => {
              if (item instanceof GC) {
                return
              }
              if (item.parent === this) {
                cleanupContextlessFormattingGap(t, item);
              }
            });
          }
        });
      }
      callTypeObservers(this, transaction, event);
    }

    /**
     * Returns the unformatted string representation of this YText type.
     *
     * @public
     */
    toString () {
      let str = '';
      /**
       * @type {Item|null}
       */
      let n = this._start;
      while (n !== null) {
        if (!n.deleted && n.countable && n.content.constructor === ContentString) {
          str += /** @type {ContentString} */ (n.content).str;
        }
        n = n.right;
      }
      return str
    }

    /**
     * Returns the unformatted string representation of this YText type.
     *
     * @return {string}
     * @public
     */
    toJSON () {
      return this.toString()
    }

    /**
     * Apply a {@link Delta} on this shared YText type.
     *
     * @param {any} delta The changes to apply on this element.
     * @param {object}  [opts]
     * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
     *
     *
     * @public
     */
    applyDelta (delta, { sanitize = true } = {}) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          const currPos = new ItemTextListPosition(null, this._start, 0, new Map());
          for (let i = 0; i < delta.length; i++) {
            const op = delta[i];
            if (op.insert !== undefined) {
              // Quill assumes that the content starts with an empty paragraph.
              // Yjs/Y.Text assumes that it starts empty. We always hide that
              // there is a newline at the end of the content.
              // If we omit this step, clients will see a different number of
              // paragraphs, but nothing bad will happen.
              const ins = (!sanitize && typeof op.insert === 'string' && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === '\n') ? op.insert.slice(0, -1) : op.insert;
              if (typeof ins !== 'string' || ins.length > 0) {
                insertText(transaction, this, currPos, ins, op.attributes || {});
              }
            } else if (op.retain !== undefined) {
              formatText(transaction, this, currPos, op.retain, op.attributes || {});
            } else if (op.delete !== undefined) {
              deleteText(transaction, currPos, op.delete);
            }
          }
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.applyDelta(delta));
      }
    }

    /**
     * Returns the Delta representation of this YText type.
     *
     * @param {Snapshot} [snapshot]
     * @param {Snapshot} [prevSnapshot]
     * @param {function('removed' | 'added', ID):any} [computeYChange]
     * @return {any} The Delta representation of this type.
     *
     * @public
     */
    toDelta (snapshot, prevSnapshot, computeYChange) {
      /**
       * @type{Array<any>}
       */
      const ops = [];
      const currentAttributes = new Map();
      const doc = /** @type {Doc} */ (this.doc);
      let str = '';
      let n = this._start;
      function packStr () {
        if (str.length > 0) {
          // pack str with attributes to ops
          /**
           * @type {Object<string,any>}
           */
          const attributes = {};
          let addAttributes = false;
          currentAttributes.forEach((value, key) => {
            addAttributes = true;
            attributes[key] = value;
          });
          /**
           * @type {Object<string,any>}
           */
          const op = { insert: str };
          if (addAttributes) {
            op.attributes = attributes;
          }
          ops.push(op);
          str = '';
        }
      }
      // snapshots are merged again after the transaction, so we need to keep the
      // transalive until we are done
      transact(doc, transaction => {
        if (snapshot) {
          splitSnapshotAffectedStructs(transaction, snapshot);
        }
        if (prevSnapshot) {
          splitSnapshotAffectedStructs(transaction, prevSnapshot);
        }
        while (n !== null) {
          if (isVisible(n, snapshot) || (prevSnapshot !== undefined && isVisible(n, prevSnapshot))) {
            switch (n.content.constructor) {
              case ContentString: {
                const cur = currentAttributes.get('ychange');
                if (snapshot !== undefined && !isVisible(n, snapshot)) {
                  if (cur === undefined || cur.user !== n.id.client || cur.state !== 'removed') {
                    packStr();
                    currentAttributes.set('ychange', computeYChange ? computeYChange('removed', n.id) : { type: 'removed' });
                  }
                } else if (prevSnapshot !== undefined && !isVisible(n, prevSnapshot)) {
                  if (cur === undefined || cur.user !== n.id.client || cur.state !== 'added') {
                    packStr();
                    currentAttributes.set('ychange', computeYChange ? computeYChange('added', n.id) : { type: 'added' });
                  }
                } else if (cur !== undefined) {
                  packStr();
                  currentAttributes.delete('ychange');
                }
                str += /** @type {ContentString} */ (n.content).str;
                break
              }
              case ContentEmbed: {
                packStr();
                /**
                 * @type {Object<string,any>}
                 */
                const op = {
                  insert: /** @type {ContentEmbed} */ (n.content).embed
                };
                if (currentAttributes.size > 0) {
                  const attrs = /** @type {Object<string,any>} */ ({});
                  op.attributes = attrs;
                  currentAttributes.forEach((value, key) => {
                    attrs[key] = value;
                  });
                }
                ops.push(op);
                break
              }
              case ContentFormat:
                if (isVisible(n, snapshot)) {
                  packStr();
                  updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (n.content));
                }
                break
            }
          }
          n = n.right;
        }
        packStr();
      }, splitSnapshotAffectedStructs);
      return ops
    }

    /**
     * Insert text at a given index.
     *
     * @param {number} index The index at which to start inserting.
     * @param {String} text The text to insert at the specified position.
     * @param {TextAttributes} [attributes] Optionally define some formatting
     *                                    information to apply on the inserted
     *                                    Text.
     * @public
     */
    insert (index, text, attributes) {
      if (text.length <= 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          if (!attributes) {
            attributes = {};
            // @ts-ignore
            pos.currentAttributes.forEach((v, k) => { attributes[k] = v; });
          }
          insertText(transaction, this, pos, text, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insert(index, text, attributes));
      }
    }

    /**
     * Inserts an embed at a index.
     *
     * @param {number} index The index to insert the embed at.
     * @param {Object} embed The Object that represents the embed.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    embed
     *
     * @public
     */
    insertEmbed (index, embed, attributes = {}) {
      if (embed.constructor !== Object) {
        throw new Error('Embed must be an Object')
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          insertText(transaction, this, pos, embed, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insertEmbed(index, embed, attributes));
      }
    }

    /**
     * Deletes text starting from an index.
     *
     * @param {number} index Index at which to start deleting.
     * @param {number} length The number of characters to remove. Defaults to 1.
     *
     * @public
     */
    delete (index, length) {
      if (length === 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          deleteText(transaction, findPosition(transaction, this, index), length);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.delete(index, length));
      }
    }

    /**
     * Assigns properties to a range of text.
     *
     * @param {number} index The position where to start formatting.
     * @param {number} length The amount of characters to assign properties to.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    text.
     *
     * @public
     */
    format (index, length, attributes) {
      if (length === 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const pos = findPosition(transaction, this, index);
          if (pos.right === null) {
            return
          }
          formatText(transaction, this, pos, length, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.format(index, length, attributes));
      }
    }

    /**
     * Removes an attribute.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that is to be removed.
     *
     * @public
     */
    removeAttribute (attributeName) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, attributeName);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.removeAttribute(attributeName));
      }
    }

    /**
     * Sets or updates an attribute.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that is to be set.
     * @param {any} attributeValue The attribute value that is to be set.
     *
     * @public
     */
    setAttribute (attributeName, attributeValue) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, attributeName, attributeValue);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.setAttribute(attributeName, attributeValue));
      }
    }

    /**
     * Returns an attribute value that belongs to the attribute name.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {String} attributeName The attribute name that identifies the
     *                               queried value.
     * @return {any} The queried attribute value.
     *
     * @public
     */
    getAttribute (attributeName) {
      return /** @type {any} */ (typeMapGet(this, attributeName))
    }

    /**
     * Returns all attribute name/value pairs in a JSON Object.
     *
     * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
     *
     * @param {Snapshot} [snapshot]
     * @return {Object<string, any>} A JSON Object that describes the attributes.
     *
     * @public
     */
    getAttributes (snapshot) {
      return typeMapGetAll(this)
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YTextRefID);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {YText}
   *
   * @private
   * @function
   */
  const readYText = decoder => new YText();

  /**
   * @module YXml
   */

  /**
   * Define the elements to which a set of CSS queries apply.
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
   *
   * @example
   *   query = '.classSelector'
   *   query = 'nodeSelector'
   *   query = '#idSelector'
   *
   * @typedef {string} CSS_Selector
   */

  /**
   * Dom filter function.
   *
   * @callback domFilter
   * @param {string} nodeName The nodeName of the element
   * @param {Map} attributes The map of attributes.
   * @return {boolean} Whether to include the Dom node in the YXmlElement.
   */

  /**
   * Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
   * position within them.
   *
   * Can be created with {@link YXmlFragment#createTreeWalker}
   *
   * @public
   * @implements {Iterable<YXmlElement|YXmlText|YXmlElement|YXmlHook>}
   */
  class YXmlTreeWalker {
    /**
     * @param {YXmlFragment | YXmlElement} root
     * @param {function(AbstractType<any>):boolean} [f]
     */
    constructor (root, f = () => true) {
      this._filter = f;
      this._root = root;
      /**
       * @type {Item}
       */
      this._currentNode = /** @type {Item} */ (root._start);
      this._firstCall = true;
    }

    [Symbol.iterator] () {
      return this
    }

    /**
     * Get the next node.
     *
     * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
     *
     * @public
     */
    next () {
      /**
       * @type {Item|null}
       */
      let n = this._currentNode;
      let type = /** @type {any} */ (n.content).type;
      if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) { // if first call, we check if we can use the first item
        do {
          type = /** @type {any} */ (n.content).type;
          if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
            // walk down in the tree
            n = type._start;
          } else {
            // walk right or up in the tree
            while (n !== null) {
              if (n.right !== null) {
                n = n.right;
                break
              } else if (n.parent === this._root) {
                n = null;
              } else {
                n = /** @type {AbstractType<any>} */ (n.parent)._item;
              }
            }
          }
        } while (n !== null && (n.deleted || !this._filter(/** @type {ContentType} */ (n.content).type)))
      }
      this._firstCall = false;
      if (n === null) {
        // @ts-ignore
        return { value: undefined, done: true }
      }
      this._currentNode = n;
      return { value: /** @type {any} */ (n.content).type, done: false }
    }
  }

  /**
   * Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
   * A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
   * nodeName and it does not have attributes. Though it can be bound to a DOM
   * element - in this case the attributes and the nodeName are not shared.
   *
   * @public
   * @extends AbstractType<YXmlEvent>
   */
  class YXmlFragment extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>|null}
       */
      this._prelimContent = [];
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get firstChild () {
      const first = this._first;
      return first ? first.content.getContent()[0] : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array<any>} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YXmlFragment()
    }

    /**
     * @return {YXmlFragment}
     */
    clone () {
      const el = new YXmlFragment();
      // @ts-ignore
      el.insert(0, el.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
      return el
    }

    get length () {
      return this._prelimContent === null ? this._length : this._prelimContent.length
    }

    /**
     * Create a subtree of childNodes.
     *
     * @example
     * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
     * for (let node in walker) {
     *   // `node` is a div node
     *   nop(node)
     * }
     *
     * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
     *                          returns a Boolean indicating whether the child
     *                          is to be included in the subtree.
     * @return {YXmlTreeWalker} A subtree and a position within it.
     *
     * @public
     */
    createTreeWalker (filter) {
      return new YXmlTreeWalker(this, filter)
    }

    /**
     * Returns the first YXmlElement that matches the query.
     * Similar to DOM's {@link querySelector}.
     *
     * Query support:
     *   - tagname
     * TODO:
     *   - id
     *   - attribute
     *
     * @param {CSS_Selector} query The query on the children.
     * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
     *
     * @public
     */
    querySelector (query) {
      query = query.toUpperCase();
      // @ts-ignore
      const iterator = new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query);
      const next = iterator.next();
      if (next.done) {
        return null
      } else {
        return next.value
      }
    }

    /**
     * Returns all YXmlElements that match the query.
     * Similar to Dom's {@link querySelectorAll}.
     *
     * @todo Does not yet support all queries. Currently only query by tagName.
     *
     * @param {CSS_Selector} query The query on the children
     * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
     *
     * @public
     */
    querySelectorAll (query) {
      query = query.toUpperCase();
      // @ts-ignore
      return Array.from(new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query))
    }

    /**
     * Creates YXmlEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
    }

    /**
     * Get the string representation of all the children of this YXmlFragment.
     *
     * @return {string} The string representation of all children.
     */
    toString () {
      return typeListMap(this, xml => xml.toString()).join('')
    }

    /**
     * @return {string}
     */
    toJSON () {
      return this.toString()
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const fragment = _document.createDocumentFragment();
      if (binding !== undefined) {
        binding._createAssociation(fragment, this);
      }
      typeListForEach(this, xmlType => {
        fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
      });
      return fragment
    }

    /**
     * Inserts new content at an index.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  xml.insert(0, [new Y.XmlText('text')])
     *
     * @param {number} index The index to insert content at
     * @param {Array<YXmlElement|YXmlText>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, 0, ...content);
      }
    }

    /**
     * Inserts new content at an index.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  xml.insert(0, [new Y.XmlText('text')])
     *
     * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
     * @param {Array<YXmlElement|YXmlText>} content The array of content
     */
    insertAfter (ref, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          const refItem = (ref && ref instanceof AbstractType) ? ref._item : ref;
          typeListInsertGenericsAfter(transaction, this, refItem, content);
        });
      } else {
        const pc = /** @type {Array<any>} */ (this._prelimContent);
        const index = ref === null ? 0 : pc.findIndex(el => el === ref) + 1;
        if (index === 0 && ref !== null) {
          throw create$2('Reference item not found')
        }
        pc.splice(index, 0, ...content);
      }
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} [length=1] The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, length);
      }
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<YXmlElement|YXmlText|YXmlHook>}
     */
    toArray () {
      return typeListToArray(this)
    }

    /**
     * Appends content to this YArray.
     *
     * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
     */
    push (content) {
      this.insert(this.length, content);
    }

    /**
     * Preppends content to this YArray.
     *
     * @param {Array<YXmlElement|YXmlText>} content Array of content to preppend.
     */
    unshift (content) {
      this.insert(0, content);
    }

    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {YXmlElement|YXmlText}
     */
    get (index) {
      return typeListGet(this, index)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @param {number} [start]
     * @param {number} [end]
     * @return {Array<YXmlElement|YXmlText>}
     */
    slice (start = 0, end = this.length) {
      return typeListSlice(this, start, end)
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {AbstractUpdateEncoder} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlFragmentRefID);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {YXmlFragment}
   *
   * @private
   * @function
   */
  const readYXmlFragment = decoder => new YXmlFragment();

  /**
   * An YXmlElement imitates the behavior of a
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}.
   *
   * * An YXmlElement has attributes (key value pairs)
   * * An YXmlElement has childElements that must inherit from YXmlElement
   */
  class YXmlElement extends YXmlFragment {
    constructor (nodeName = 'UNDEFINED') {
      super();
      this.nodeName = nodeName;
      /**
       * @type {Map<string, any>|null}
       */
      this._prelimAttrs = new Map();
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get nextSibling () {
      const n = this._item ? this._item.next : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get prevSibling () {
      const n = this._item ? this._item.prev : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     */
    _integrate (y, item) {
      super._integrate(y, item)
      ;(/** @type {Map<string, any>} */ (this._prelimAttrs)).forEach((value, key) => {
        this.setAttribute(key, value);
      });
      this._prelimAttrs = null;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     *
     * @return {YXmlElement}
     */
    _copy () {
      return new YXmlElement(this.nodeName)
    }

    /**
     * @return {YXmlElement}
     */
    clone () {
      const el = new YXmlElement(this.nodeName);
      const attrs = this.getAttributes();
      for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
      // @ts-ignore
      el.insert(0, el.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
      return el
    }

    /**
     * Returns the XML serialization of this YXmlElement.
     * The attributes are ordered by attribute-name, so you can easily use this
     * method to compare YXmlElements
     *
     * @return {string} The string representation of this type.
     *
     * @public
     */
    toString () {
      const attrs = this.getAttributes();
      const stringBuilder = [];
      const keys = [];
      for (const key in attrs) {
        keys.push(key);
      }
      keys.sort();
      const keysLen = keys.length;
      for (let i = 0; i < keysLen; i++) {
        const key = keys[i];
        stringBuilder.push(key + '="' + attrs[key] + '"');
      }
      const nodeName = this.nodeName.toLocaleLowerCase();
      const attrsString = stringBuilder.length > 0 ? ' ' + stringBuilder.join(' ') : '';
      return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`
    }

    /**
     * Removes an attribute from this YXmlElement.
     *
     * @param {String} attributeName The attribute name that is to be removed.
     *
     * @public
     */
    removeAttribute (attributeName) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, attributeName);
        });
      } else {
        /** @type {Map<string,any>} */ (this._prelimAttrs).delete(attributeName);
      }
    }

    /**
     * Sets or updates an attribute.
     *
     * @param {String} attributeName The attribute name that is to be set.
     * @param {String} attributeValue The attribute value that is to be set.
     *
     * @public
     */
    setAttribute (attributeName, attributeValue) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, attributeName, attributeValue);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimAttrs).set(attributeName, attributeValue);
      }
    }

    /**
     * Returns an attribute value that belongs to the attribute name.
     *
     * @param {String} attributeName The attribute name that identifies the
     *                               queried value.
     * @return {String} The queried attribute value.
     *
     * @public
     */
    getAttribute (attributeName) {
      return /** @type {any} */ (typeMapGet(this, attributeName))
    }

    /**
     * Returns all attribute name/value pairs in a JSON Object.
     *
     * @param {Snapshot} [snapshot]
     * @return {Object<string, any>} A JSON Object that describes the attributes.
     *
     * @public
     */
    getAttributes (snapshot) {
      return typeMapGetAll(this)
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const dom = _document.createElement(this.nodeName);
      const attrs = this.getAttributes();
      for (const key in attrs) {
        dom.setAttribute(key, attrs[key]);
      }
      typeListForEach(this, yxml => {
        dom.appendChild(yxml.toDOM(_document, hooks, binding));
      });
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {AbstractUpdateEncoder} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlElementRefID);
      encoder.writeKey(this.nodeName);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {YXmlElement}
   *
   * @function
   */
  const readYXmlElement = decoder => new YXmlElement(decoder.readKey());

  /**
   * An Event that describes changes on a YXml Element or Yxml Fragment
   */
  class YXmlEvent extends YEvent {
    /**
     * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
     * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
     *                   child list changed.
     * @param {Transaction} transaction The transaction instance with wich the
     *                                  change was created.
     */
    constructor (target, subs, transaction) {
      super(target, transaction);
      /**
       * Whether the children changed.
       * @type {Boolean}
       * @private
       */
      this.childListChanged = false;
      /**
       * Set of all changed attributes.
       * @type {Set<string>}
       */
      this.attributesChanged = new Set();
      subs.forEach((sub) => {
        if (sub === null) {
          this.childListChanged = true;
        } else {
          this.attributesChanged.add(sub);
        }
      });
    }
  }

  /**
   * You can manage binding to a custom type with YXmlHook.
   *
   * @extends {YMap<any>}
   */
  class YXmlHook extends YMap {
    /**
     * @param {string} hookName nodeName of the Dom Node.
     */
    constructor (hookName) {
      super();
      /**
       * @type {string}
       */
      this.hookName = hookName;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     */
    _copy () {
      return new YXmlHook(this.hookName)
    }

    /**
     * @return {YXmlHook}
     */
    clone () {
      const el = new YXmlHook(this.hookName);
      this.forEach((value, key) => {
        el.set(key, value);
      });
      return el
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type
     * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const hook = hooks[this.hookName];
      let dom;
      if (hook !== undefined) {
        dom = hook.createDom(this);
      } else {
        dom = document.createElement(this.hookName);
      }
      dom.setAttribute('data-yjs-hook', this.hookName);
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {AbstractUpdateEncoder} encoder The encoder to write data to.
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlHookRefID);
      encoder.writeKey(this.hookName);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {YXmlHook}
   *
   * @private
   * @function
   */
  const readYXmlHook = decoder =>
    new YXmlHook(decoder.readKey());

  /**
   * Represents text in a Dom Element. In the future this type will also handle
   * simple formatting information like bold and italic.
   */
  class YXmlText extends YText {
    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get nextSibling () {
      const n = this._item ? this._item.next : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    /**
     * @type {YXmlElement|YXmlText|null}
     */
    get prevSibling () {
      const n = this._item ? this._item.prev : null;
      return n ? /** @type {YXmlElement|YXmlText} */ (/** @type {ContentType} */ (n.content).type) : null
    }

    _copy () {
      return new YXmlText()
    }

    /**
     * @return {YXmlText}
     */
    clone () {
      const text = new YXmlText();
      text.applyDelta(this.toDelta());
      return text
    }

    /**
     * Creates a Dom Element that mirrors this YXmlText.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks, binding) {
      const dom = _document.createTextNode(this.toString());
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    toString () {
      // @ts-ignore
      return this.toDelta().map(delta => {
        const nestedNodes = [];
        for (const nodeName in delta.attributes) {
          const attrs = [];
          for (const key in delta.attributes[nodeName]) {
            attrs.push({ key, value: delta.attributes[nodeName][key] });
          }
          // sort attributes to get a unique order
          attrs.sort((a, b) => a.key < b.key ? -1 : 1);
          nestedNodes.push({ nodeName, attrs });
        }
        // sort node order to get a unique order
        nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
        // now convert to dom string
        let str = '';
        for (let i = 0; i < nestedNodes.length; i++) {
          const node = nestedNodes[i];
          str += `<${node.nodeName}`;
          for (let j = 0; j < node.attrs.length; j++) {
            const attr = node.attrs[j];
            str += ` ${attr.key}="${attr.value}"`;
          }
          str += '>';
        }
        str += delta.insert;
        for (let i = nestedNodes.length - 1; i >= 0; i--) {
          str += `</${nestedNodes[i].nodeName}>`;
        }
        return str
      }).join('')
    }

    /**
     * @return {string}
     */
    toJSON () {
      return this.toString()
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     */
    _write (encoder) {
      encoder.writeTypeRef(YXmlTextRefID);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {YXmlText}
   *
   * @private
   * @function
   */
  const readYXmlText = decoder => new YXmlText();

  class AbstractStruct {
    /**
     * @param {ID} id
     * @param {number} length
     */
    constructor (id, length) {
      this.id = id;
      this.length = length;
    }

    /**
     * @type {boolean}
     */
    get deleted () {
      throw methodUnimplemented()
    }

    /**
     * Merge this struct with the item to the right.
     * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
     * Also this method does *not* remove right from StructStore!
     * @param {AbstractStruct} right
     * @return {boolean} wether this merged with right
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {AbstractUpdateEncoder} encoder The encoder to write data to.
     * @param {number} offset
     * @param {number} encodingRef
     */
    write (encoder, offset, encodingRef) {
      throw methodUnimplemented()
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      throw methodUnimplemented()
    }
  }

  const structGCRefNumber = 0;

  /**
   * @private
   */
  class GC extends AbstractStruct {
    get deleted () {
      return true
    }

    delete () {}

    /**
     * @param {GC} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.length += right.length;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      if (offset > 0) {
        this.id.clock += offset;
        this.length -= offset;
      }
      addStruct(transaction.doc.store, this);
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeInfo(structGCRefNumber);
      encoder.writeLen(this.length - offset);
    }

    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing (transaction, store) {
      return null
    }
  }

  class ContentBinary {
    /**
     * @param {Uint8Array} content
     */
    constructor (content) {
      this.content = content;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.content]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentBinary}
     */
    copy () {
      return new ContentBinary(this.content)
    }

    /**
     * @param {number} offset
     * @return {ContentBinary}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentBinary} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeBuf(this.content);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 3
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentBinary}
   */
  const readContentBinary = decoder => new ContentBinary(decoder.readBuf());

  class ContentDeleted {
    /**
     * @param {number} len
     */
    constructor (len) {
      this.len = len;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.len
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }

    /**
     * @return {ContentDeleted}
     */
    copy () {
      return new ContentDeleted(this.len)
    }

    /**
     * @param {number} offset
     * @return {ContentDeleted}
     */
    splice (offset) {
      const right = new ContentDeleted(this.len - offset);
      this.len = offset;
      return right
    }

    /**
     * @param {ContentDeleted} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.len += right.len;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
      item.markDeleted();
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeLen(this.len - offset);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 1
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentDeleted}
   */
  const readContentDeleted = decoder => new ContentDeleted(decoder.readLen());

  /**
   * @private
   */
  class ContentDoc {
    /**
     * @param {Doc} doc
     */
    constructor (doc) {
      if (doc._item) {
        console.error('This document was already integrated as a sub-document. You should create a second instance instead with the same guid.');
      }
      /**
       * @type {Doc}
       */
      this.doc = doc;
      /**
       * @type {any}
       */
      const opts = {};
      this.opts = opts;
      if (!doc.gc) {
        opts.gc = false;
      }
      if (doc.autoLoad) {
        opts.autoLoad = true;
      }
      if (doc.meta !== null) {
        opts.meta = doc.meta;
      }
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.doc]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentDoc}
     */
    copy () {
      return new ContentDoc(this.doc)
    }

    /**
     * @param {number} offset
     * @return {ContentDoc}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentDoc} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      // this needs to be reflected in doc.destroy as well
      this.doc._item = item;
      transaction.subdocsAdded.add(this.doc);
      if (this.doc.shouldLoad) {
        transaction.subdocsLoaded.add(this.doc);
      }
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {
      if (transaction.subdocsAdded.has(this.doc)) {
        transaction.subdocsAdded.delete(this.doc);
      } else {
        transaction.subdocsRemoved.add(this.doc);
      }
    }

    /**
     * @param {StructStore} store
     */
    gc (store) { }

    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeString(this.doc.guid);
      encoder.writeAny(this.opts);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 9
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentDoc}
   */
  const readContentDoc = decoder => new ContentDoc(new Doc({ guid: decoder.readString(), ...decoder.readAny() }));

  /**
   * @private
   */
  class ContentEmbed {
    /**
     * @param {Object} embed
     */
    constructor (embed) {
      this.embed = embed;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.embed]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentEmbed}
     */
    copy () {
      return new ContentEmbed(this.embed)
    }

    /**
     * @param {number} offset
     * @return {ContentEmbed}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentEmbed} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeJSON(this.embed);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 5
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentEmbed}
   */
  const readContentEmbed = decoder => new ContentEmbed(decoder.readJSON());

  /**
   * @private
   */
  class ContentFormat {
    /**
     * @param {string} key
     * @param {Object} value
     */
    constructor (key, value) {
      this.key = key;
      this.value = value;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }

    /**
     * @return {ContentFormat}
     */
    copy () {
      return new ContentFormat(this.key, this.value)
    }

    /**
     * @param {number} offset
     * @return {ContentFormat}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentFormat} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      // @todo searchmarker are currently unsupported for rich text documents
      /** @type {AbstractType<any>} */ (item.parent)._searchMarker = null;
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeKey(this.key);
      encoder.writeJSON(this.value);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 6
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentFormat}
   */
  const readContentFormat = decoder => new ContentFormat(decoder.readString(), decoder.readJSON());

  /**
   * @private
   */
  class ContentJSON {
    /**
     * @param {Array<any>} arr
     */
    constructor (arr) {
      /**
       * @type {Array<any>}
       */
      this.arr = arr;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.arr.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.arr
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentJSON}
     */
    copy () {
      return new ContentJSON(this.arr)
    }

    /**
     * @param {number} offset
     * @return {ContentJSON}
     */
    splice (offset) {
      const right = new ContentJSON(this.arr.slice(offset));
      this.arr = this.arr.slice(0, offset);
      return right
    }

    /**
     * @param {ContentJSON} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.arr = this.arr.concat(right.arr);
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      const len = this.arr.length;
      encoder.writeLen(len - offset);
      for (let i = offset; i < len; i++) {
        const c = this.arr[i];
        encoder.writeString(c === undefined ? 'undefined' : JSON.stringify(c));
      }
    }

    /**
     * @return {number}
     */
    getRef () {
      return 2
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentJSON}
   */
  const readContentJSON = decoder => {
    const len = decoder.readLen();
    const cs = [];
    for (let i = 0; i < len; i++) {
      const c = decoder.readString();
      if (c === 'undefined') {
        cs.push(undefined);
      } else {
        cs.push(JSON.parse(c));
      }
    }
    return new ContentJSON(cs)
  };

  class ContentAny {
    /**
     * @param {Array<any>} arr
     */
    constructor (arr) {
      /**
       * @type {Array<any>}
       */
      this.arr = arr;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.arr.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.arr
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentAny}
     */
    copy () {
      return new ContentAny(this.arr)
    }

    /**
     * @param {number} offset
     * @return {ContentAny}
     */
    splice (offset) {
      const right = new ContentAny(this.arr.slice(offset));
      this.arr = this.arr.slice(0, offset);
      return right
    }

    /**
     * @param {ContentAny} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.arr = this.arr.concat(right.arr);
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      const len = this.arr.length;
      encoder.writeLen(len - offset);
      for (let i = offset; i < len; i++) {
        const c = this.arr[i];
        encoder.writeAny(c);
      }
    }

    /**
     * @return {number}
     */
    getRef () {
      return 8
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentAny}
   */
  const readContentAny = decoder => {
    const len = decoder.readLen();
    const cs = [];
    for (let i = 0; i < len; i++) {
      cs.push(decoder.readAny());
    }
    return new ContentAny(cs)
  };

  /**
   * @private
   */
  class ContentString {
    /**
     * @param {string} str
     */
    constructor (str) {
      /**
       * @type {string}
       */
      this.str = str;
    }

    /**
     * @return {number}
     */
    getLength () {
      return this.str.length
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.str.split('')
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentString}
     */
    copy () {
      return new ContentString(this.str)
    }

    /**
     * @param {number} offset
     * @return {ContentString}
     */
    splice (offset) {
      const right = new ContentString(this.str.slice(offset));
      this.str = this.str.slice(0, offset);

      // Prevent encoding invalid documents because of splitting of surrogate pairs: https://github.com/yjs/yjs/issues/248
      const firstCharCode = this.str.charCodeAt(offset - 1);
      if (firstCharCode >= 0xD800 && firstCharCode <= 0xDBFF) {
        // Last character of the left split is the start of a surrogate utf16/ucs2 pair.
        // We don't support splitting of surrogate pairs because this may lead to invalid documents.
        // Replace the invalid character with a unicode replacement character (� / U+FFFD)
        this.str = this.str.slice(0, offset - 1) + '�';
        // replace right as well
        right.str = '�' + right.str.slice(1);
      }
      return right
    }

    /**
     * @param {ContentString} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.str += right.str;
      return true
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
    }

    /**
     * @return {number}
     */
    getRef () {
      return 4
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentString}
   */
  const readContentString = decoder => new ContentString(decoder.readString());

  /**
   * @type {Array<function(AbstractUpdateDecoder):AbstractType<any>>}
   * @private
   */
  const typeRefs = [
    readYArray,
    readYMap,
    readYText,
    readYXmlElement,
    readYXmlFragment,
    readYXmlHook,
    readYXmlText
  ];

  const YArrayRefID = 0;
  const YMapRefID = 1;
  const YTextRefID = 2;
  const YXmlElementRefID = 3;
  const YXmlFragmentRefID = 4;
  const YXmlHookRefID = 5;
  const YXmlTextRefID = 6;

  /**
   * @private
   */
  class ContentType {
    /**
     * @param {AbstractType<YEvent>} type
     */
    constructor (type) {
      /**
       * @type {AbstractType<any>}
       */
      this.type = type;
    }

    /**
     * @return {number}
     */
    getLength () {
      return 1
    }

    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.type]
    }

    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }

    /**
     * @return {ContentType}
     */
    copy () {
      return new ContentType(this.type._copy())
    }

    /**
     * @param {number} offset
     * @return {ContentType}
     */
    splice (offset) {
      throw methodUnimplemented()
    }

    /**
     * @param {ContentType} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }

    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      this.type._integrate(transaction.doc, item);
    }

    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {
      let item = this.type._start;
      while (item !== null) {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // Whis will be gc'd later and we want to merge it if possible
          // We try to merge all deleted items after each transaction,
          // but we have no knowledge about that this needs to be merged
          // since it is not in transaction.ds. Hence we add it to transaction._mergeStructs
          transaction._mergeStructs.push(item);
        }
        item = item.right;
      }
      this.type._map.forEach(item => {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // same as above
          transaction._mergeStructs.push(item);
        }
      });
      transaction.changed.delete(this.type);
    }

    /**
     * @param {StructStore} store
     */
    gc (store) {
      let item = this.type._start;
      while (item !== null) {
        item.gc(store, true);
        item = item.right;
      }
      this.type._start = null;
      this.type._map.forEach(/** @param {Item | null} item */ (item) => {
        while (item !== null) {
          item.gc(store, true);
          item = item.left;
        }
      });
      this.type._map = new Map();
    }

    /**
     * @param {AbstractUpdateEncoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      this.type._write(encoder);
    }

    /**
     * @return {number}
     */
    getRef () {
      return 7
    }
  }

  /**
   * @private
   *
   * @param {AbstractUpdateDecoder} decoder
   * @return {ContentType}
   */
  const readContentType = decoder => new ContentType(typeRefs[decoder.readTypeRef()](decoder));

  /**
   * Split leftItem into two items
   * @param {Transaction} transaction
   * @param {Item} leftItem
   * @param {number} diff
   * @return {Item}
   *
   * @function
   * @private
   */
  const splitItem = (transaction, leftItem, diff) => {
    // create rightItem
    const { client, clock } = leftItem.id;
    const rightItem = new Item(
      createID(client, clock + diff),
      leftItem,
      createID(client, clock + diff - 1),
      leftItem.right,
      leftItem.rightOrigin,
      leftItem.parent,
      leftItem.parentSub,
      leftItem.content.splice(diff)
    );
    if (leftItem.deleted) {
      rightItem.markDeleted();
    }
    if (leftItem.keep) {
      rightItem.keep = true;
    }
    if (leftItem.redone !== null) {
      rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
    }
    // update left (do not set leftItem.rightOrigin as it will lead to problems when syncing)
    leftItem.right = rightItem;
    // update right
    if (rightItem.right !== null) {
      rightItem.right.left = rightItem;
    }
    // right is more specific.
    transaction._mergeStructs.push(rightItem);
    // update parent._map
    if (rightItem.parentSub !== null && rightItem.right === null) {
      /** @type {AbstractType<any>} */ (rightItem.parent)._map.set(rightItem.parentSub, rightItem);
    }
    leftItem.length = diff;
    return rightItem
  };

  /**
   * Abstract class that represents any content.
   */
  class Item extends AbstractStruct {
    /**
     * @param {ID} id
     * @param {Item | null} left
     * @param {ID | null} origin
     * @param {Item | null} right
     * @param {ID | null} rightOrigin
     * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
     * @param {string | null} parentSub
     * @param {AbstractContent} content
     */
    constructor (id, left, origin, right, rightOrigin, parent, parentSub, content) {
      super(id, content.getLength());
      /**
       * The item that was originally to the left of this item.
       * @type {ID | null}
       */
      this.origin = origin;
      /**
       * The item that is currently to the left of this item.
       * @type {Item | null}
       */
      this.left = left;
      /**
       * The item that is currently to the right of this item.
       * @type {Item | null}
       */
      this.right = right;
      /**
       * The item that was originally to the right of this item.
       * @type {ID | null}
       */
      this.rightOrigin = rightOrigin;
      /**
       * @type {AbstractType<any>|ID|null}
       */
      this.parent = parent;
      /**
       * If the parent refers to this item with some kind of key (e.g. YMap, the
       * key is specified here. The key is then used to refer to the list in which
       * to insert this item. If `parentSub = null` type._start is the list in
       * which to insert to. Otherwise it is `parent._map`.
       * @type {String | null}
       */
      this.parentSub = parentSub;
      /**
       * If this type's effect is reundone this type refers to the type that undid
       * this operation.
       * @type {ID | null}
       */
      this.redone = null;
      /**
       * @type {AbstractContent}
       */
      this.content = content;
      /**
       * bit1: keep
       * bit2: countable
       * bit3: deleted
       * bit4: mark - mark node as fast-search-marker
       * @type {number} byte
       */
      this.info = this.content.isCountable() ? BIT2 : 0;
    }

    /**
     * This is used to mark the item as an indexed fast-search marker
     *
     * @type {boolean}
     */
    set marker (isMarked) {
      if (((this.info & BIT4) > 0) !== isMarked) {
        this.info ^= BIT4;
      }
    }

    get marker () {
      return (this.info & BIT4) > 0
    }

    /**
     * If true, do not garbage collect this Item.
     */
    get keep () {
      return (this.info & BIT1) > 0
    }

    set keep (doKeep) {
      if (this.keep !== doKeep) {
        this.info ^= BIT1;
      }
    }

    get countable () {
      return (this.info & BIT2) > 0
    }

    /**
     * Whether this item was deleted or not.
     * @type {Boolean}
     */
    get deleted () {
      return (this.info & BIT3) > 0
    }

    set deleted (doDelete) {
      if (this.deleted !== doDelete) {
        this.info ^= BIT3;
      }
    }

    markDeleted () {
      this.info |= BIT3;
    }

    /**
     * Return the creator clientID of the missing op or define missing items and return null.
     *
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing (transaction, store) {
      if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
        return this.origin.client
      }
      if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
        return this.rightOrigin.client
      }
      if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
        return this.parent.client
      }

      // We have all missing ids, now find the items

      if (this.origin) {
        this.left = getItemCleanEnd(transaction, store, this.origin);
        this.origin = this.left.lastId;
      }
      if (this.rightOrigin) {
        this.right = getItemCleanStart(transaction, this.rightOrigin);
        this.rightOrigin = this.right.id;
      }
      if ((this.left && this.left.constructor === GC) || (this.right && this.right.constructor === GC)) {
        this.parent = null;
      }
      // only set parent if this shouldn't be garbage collected
      if (!this.parent) {
        if (this.left && this.left.constructor === Item) {
          this.parent = this.left.parent;
          this.parentSub = this.left.parentSub;
        }
        if (this.right && this.right.constructor === Item) {
          this.parent = this.right.parent;
          this.parentSub = this.right.parentSub;
        }
      } else if (this.parent.constructor === ID) {
        const parentItem = getItem(store, this.parent);
        if (parentItem.constructor === GC) {
          this.parent = null;
        } else {
          this.parent = /** @type {ContentType} */ (parentItem.content).type;
        }
      }
      return null
    }

    /**
     * @param {Transaction} transaction
     * @param {number} offset
     */
    integrate (transaction, offset) {
      if (offset > 0) {
        this.id.clock += offset;
        this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
        this.origin = this.left.lastId;
        this.content = this.content.splice(offset);
        this.length -= offset;
      }

      if (this.parent) {
        if ((!this.left && (!this.right || this.right.left !== null)) || (this.left && this.left.right !== this.right)) {
          /**
           * @type {Item|null}
           */
          let left = this.left;

          /**
           * @type {Item|null}
           */
          let o;
          // set o to the first conflicting item
          if (left !== null) {
            o = left.right;
          } else if (this.parentSub !== null) {
            o = /** @type {AbstractType<any>} */ (this.parent)._map.get(this.parentSub) || null;
            while (o !== null && o.left !== null) {
              o = o.left;
            }
          } else {
            o = /** @type {AbstractType<any>} */ (this.parent)._start;
          }
          // TODO: use something like DeleteSet here (a tree implementation would be best)
          // @todo use global set definitions
          /**
           * @type {Set<Item>}
           */
          const conflictingItems = new Set();
          /**
           * @type {Set<Item>}
           */
          const itemsBeforeOrigin = new Set();
          // Let c in conflictingItems, b in itemsBeforeOrigin
          // ***{origin}bbbb{this}{c,b}{c,b}{o}***
          // Note that conflictingItems is a subset of itemsBeforeOrigin
          while (o !== null && o !== this.right) {
            itemsBeforeOrigin.add(o);
            conflictingItems.add(o);
            if (compareIDs(this.origin, o.origin)) {
              // case 1
              if (o.id.client < this.id.client) {
                left = o;
                conflictingItems.clear();
              } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
                // this and o are conflicting and point to the same integration points. The id decides which item comes first.
                // Since this is to the left of o, we can break here
                break
              } // else, o might be integrated before an item that this conflicts with. If so, we will find it in the next iterations
            } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) { // use getItem instead of getItemCleanEnd because we don't want / need to split items.
              // case 2
              if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
                left = o;
                conflictingItems.clear();
              }
            } else {
              break
            }
            o = o.right;
          }
          this.left = left;
        }
        // reconnect left/right + update parent map/start if necessary
        if (this.left !== null) {
          const right = this.left.right;
          this.right = right;
          this.left.right = this;
        } else {
          let r;
          if (this.parentSub !== null) {
            r = /** @type {AbstractType<any>} */ (this.parent)._map.get(this.parentSub) || null;
            while (r !== null && r.left !== null) {
              r = r.left;
            }
          } else {
            r = /** @type {AbstractType<any>} */ (this.parent)._start
            ;/** @type {AbstractType<any>} */ (this.parent)._start = this;
          }
          this.right = r;
        }
        if (this.right !== null) {
          this.right.left = this;
        } else if (this.parentSub !== null) {
          // set as current parent value if right === null and this is parentSub
          /** @type {AbstractType<any>} */ (this.parent)._map.set(this.parentSub, this);
          if (this.left !== null) {
            // this is the current attribute value of parent. delete right
            this.left.delete(transaction);
          }
        }
        // adjust length of parent
        if (this.parentSub === null && this.countable && !this.deleted) {
          /** @type {AbstractType<any>} */ (this.parent)._length += this.length;
        }
        addStruct(transaction.doc.store, this);
        this.content.integrate(transaction, this);
        // add parent to transaction.changed
        addChangedTypeToTransaction(transaction, /** @type {AbstractType<any>} */ (this.parent), this.parentSub);
        if ((/** @type {AbstractType<any>} */ (this.parent)._item !== null && /** @type {AbstractType<any>} */ (this.parent)._item.deleted) || (this.parentSub !== null && this.right !== null)) {
          // delete if parent is deleted or if this is not the current attribute value of parent
          this.delete(transaction);
        }
      } else {
        // parent is not defined. Integrate GC struct instead
        new GC(this.id, this.length).integrate(transaction, 0);
      }
    }

    /**
     * Returns the next non-deleted item
     */
    get next () {
      let n = this.right;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Returns the previous non-deleted item
     */
    get prev () {
      let n = this.left;
      while (n !== null && n.deleted) {
        n = n.left;
      }
      return n
    }

    /**
     * Computes the last content address of this Item.
     */
    get lastId () {
      // allocating ids is pretty costly because of the amount of ids created, so we try to reuse whenever possible
      return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1)
    }

    /**
     * Try to merge two items
     *
     * @param {Item} right
     * @return {boolean}
     */
    mergeWith (right) {
      if (
        compareIDs(right.origin, this.lastId) &&
        this.right === right &&
        compareIDs(this.rightOrigin, right.rightOrigin) &&
        this.id.client === right.id.client &&
        this.id.clock + this.length === right.id.clock &&
        this.deleted === right.deleted &&
        this.redone === null &&
        right.redone === null &&
        this.content.constructor === right.content.constructor &&
        this.content.mergeWith(right.content)
      ) {
        if (right.keep) {
          this.keep = true;
        }
        this.right = right.right;
        if (this.right !== null) {
          this.right.left = this;
        }
        this.length += right.length;
        return true
      }
      return false
    }

    /**
     * Mark this Item as deleted.
     *
     * @param {Transaction} transaction
     */
    delete (transaction) {
      if (!this.deleted) {
        const parent = /** @type {AbstractType<any>} */ (this.parent);
        // adjust the length of parent
        if (this.countable && this.parentSub === null) {
          parent._length -= this.length;
        }
        this.markDeleted();
        addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
        addChangedTypeToTransaction(transaction, parent, this.parentSub);
        this.content.delete(transaction);
      }
    }

    /**
     * @param {StructStore} store
     * @param {boolean} parentGCd
     */
    gc (store, parentGCd) {
      if (!this.deleted) {
        throw unexpectedCase()
      }
      this.content.gc(store);
      if (parentGCd) {
        replaceStruct(store, this, new GC(this.id, this.length));
      } else {
        this.content = new ContentDeleted(this.length);
      }
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {AbstractUpdateEncoder} encoder The encoder to write data to.
     * @param {number} offset
     */
    write (encoder, offset) {
      const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
      const rightOrigin = this.rightOrigin;
      const parentSub = this.parentSub;
      const info = (this.content.getRef() & BITS5) |
        (origin === null ? 0 : BIT8) | // origin is defined
        (rightOrigin === null ? 0 : BIT7) | // right origin is defined
        (parentSub === null ? 0 : BIT6); // parentSub is non-null
      encoder.writeInfo(info);
      if (origin !== null) {
        encoder.writeLeftID(origin);
      }
      if (rightOrigin !== null) {
        encoder.writeRightID(rightOrigin);
      }
      if (origin === null && rightOrigin === null) {
        const parent = /** @type {AbstractType<any>} */ (this.parent);
        const parentItem = parent._item;
        if (parentItem === null) {
          // parent type on y._map
          // find the correct key
          const ykey = findRootTypeKey(parent);
          encoder.writeParentInfo(true); // write parentYKey
          encoder.writeString(ykey);
        } else {
          encoder.writeParentInfo(false); // write parent id
          encoder.writeLeftID(parentItem.id);
        }
        if (parentSub !== null) {
          encoder.writeString(parentSub);
        }
      }
      this.content.write(encoder, offset);
    }
  }

  /**
   * @param {AbstractUpdateDecoder} decoder
   * @param {number} info
   */
  const readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);

  /**
   * A lookup map for reading Item content.
   *
   * @type {Array<function(AbstractUpdateDecoder):AbstractContent>}
   */
  const contentRefs = [
    () => { throw unexpectedCase() }, // GC is not ItemContent
    readContentDeleted, // 1
    readContentJSON, // 2
    readContentBinary, // 3
    readContentString, // 4
    readContentEmbed, // 5
    readContentFormat, // 6
    readContentType, // 7
    readContentAny, // 8
    readContentDoc // 9
  ];

  /* eslint-env browser */

  const reconnectTimeoutBase = 1200;
  const maxReconnectTimeout = 2500;
  // @todo - this should depend on awareness.outdatedTime
  const messageReconnectTimeout = 30000;

  /**
   * @param {WebsocketProvider} provider
   */
   const setupWS = provider => {
    if (provider.shouldConnect && provider.ws === null) {
      const websocket = new provider._WS(provider.url);
      websocket.binaryType = 'arraybuffer';
      provider.ws = websocket;
      provider.wsconnecting = true;
      provider.wsconnected = false;
      provider.synced = false;

      websocket.onmessage = event => {
        provider.wsLastMessageReceived = getUnixTime();
        const encoder = readMessage(provider, new Uint8Array(event.data), true);
        if (length(encoder) > 1) {
          websocket.send(toUint8Array(encoder));
        }
      };
      websocket.onclose = () => {
        provider.ws = null;
        provider.wsconnecting = false;
        if (provider.wsconnected) {
          provider.wsconnected = false;
          provider.synced = false;
          // update awareness (all users except local left)
          removeAwarenessStates(provider.awareness, Array.from(provider.awareness.getStates().keys()).filter(client => client !== provider.doc.clientID), provider);
          provider.emit('status', [{
            status: 'disconnected'
          }]);
        } else {
          provider.wsUnsuccessfulReconnects++;
        }
        // Start with no reconnect timeout and increase timeout by
        // log10(wsUnsuccessfulReconnects).
        // The idea is to increase reconnect timeout slowly and have no reconnect
        // timeout at the beginning (log(1) = 0)
        setTimeout(setupWS, min(log10(provider.wsUnsuccessfulReconnects + 1) * reconnectTimeoutBase, maxReconnectTimeout), provider);
      };
      websocket.onopen = () => {
        provider.wsLastMessageReceived = getUnixTime();
        provider.wsconnecting = false;
        provider.wsconnected = true;
        provider.wsUnsuccessfulReconnects = 0;
        provider.emit('status', [{
          status: 'connected'
        }]);
        // always send sync step 1 when connected
        const encoder = createEncoder();
        writeVarUint(encoder, messageSync);
        writeSyncStep1(encoder, provider.doc);
        websocket.send(toUint8Array(encoder));
        // broadcast local awareness state
        if (provider.awareness.getLocalState() !== null) {
          const encoderAwarenessState = createEncoder();
          writeVarUint(encoderAwarenessState, messageAwareness);
          writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(provider.awareness, [provider.doc.clientID]));
          websocket.send(toUint8Array(encoderAwarenessState));
        }
      };

      provider.emit('status', [{
        status: 'connecting'
      }]);
    }
  };

  /**
   * @extends Observable<string>
   */
  class WebsocketClient extends Observable {
    /**
     * @param {string} url
     * @param {object} [opts]
     * @param {'arraybuffer' | 'blob' | null} [opts.binaryType] Set `ws.binaryType`
     */
    constructor (url, { binaryType } = {}) {
      super();
      this.url = url;
      /**
       * @type {WebSocket?}
       */
      this.ws = null;
      this.binaryType = binaryType || null;
      this.connected = false;
      this.connecting = false;
      this.unsuccessfulReconnects = 0;
      this.lastMessageReceived = 0;
      /**
       * Whether to connect to other peers or not
       * @type {boolean}
       */
      this.shouldConnect = true;
      this._checkInterval = setInterval(() => {
        if (this.connected && messageReconnectTimeout < getUnixTime() - this.lastMessageReceived) {
          // no message received in a long time - not even your own awareness
          // updates (which are updated every 15 seconds)
          /** @type {WebSocket} */ (this.ws).close();
        }
      }, messageReconnectTimeout / 2);
      setupWS(this);
    }

    /**
     * @param {any} message
     */
    send (message) {
      if (this.ws) {
        this.ws.send(JSON.stringify(message));
      }
    }

    destroy () {
      clearInterval(this._checkInterval);
      this.disconnect();
      super.destroy();
    }

    disconnect () {
      this.shouldConnect = false;
      if (this.ws !== null) {
        this.ws.close();
      }
    }

    connect () {
      this.shouldConnect = true;
      if (!this.connected && this.ws === null) {
        setupWS(this);
      }
    }
  }

  /**
   * Utility helpers to work with promises.
   *
   * @module promise
   */

  /**
   * @param {Error} [reason]
   * @return {Promise<never>}
   */
  const reject = reason => Promise.reject(reason);

  /**
   * @template T
   * @param {T|void} res
   * @return {Promise<T|void>}
   */
  const resolve = res => Promise.resolve(res);

  /* eslint-env browser */

  /**
   * @typedef {Object} Channel
   * @property {Set<Function>} Channel.subs
   * @property {any} Channel.bc
   */

  /**
   * @type {Map<string, Channel>}
   */
  const channels = new Map();

  class LocalStoragePolyfill {
    /**
     * @param {string} room
     */
    constructor (room) {
      this.room = room;
      /**
       * @type {null|function({data:ArrayBuffer}):void}
       */
      this.onmessage = null;
      addEventListener('storage', e => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || '') }));
    }

    /**
     * @param {ArrayBuffer} buf
     */
    postMessage (buf) {
      varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
    }
  }

  // Use BroadcastChannel or Polyfill
  const BC = typeof BroadcastChannel === 'undefined' ? LocalStoragePolyfill : BroadcastChannel;

  /**
   * @param {string} room
   * @return {Channel}
   */
  const getChannel = room =>
    setIfUndefined(channels, room, () => {
      const subs = new Set();
      const bc = new BC(room);
      /**
       * @param {{data:ArrayBuffer}} e
       */
      bc.onmessage = e => subs.forEach(sub => sub(e.data));
      return {
        bc, subs
      }
    });

  /**
   * Subscribe to global `publish` events.
   *
   * @function
   * @param {string} room
   * @param {function(any):any} f
   */
  const subscribe = (room, f) => getChannel(room).subs.add(f);

  /**
   * Unsubscribe from `publish` global events.
   *
   * @function
   * @param {string} room
   * @param {function(any):any} f
   */
  const unsubscribe = (room, f) => getChannel(room).subs.delete(f);

  /**
   * Publish data to all subscribers (including subscribers on this tab)
   *
   * @function
   * @param {string} room
   * @param {any} data
   */
  const publish = (room, data) => {
    const c = getChannel(room);
    c.bc.postMessage(data);
    c.subs.forEach(sub => sub(data));
  };

  /**
   * Mutual exclude for JavaScript.
   *
   * @module mutex
   */

  /**
   * @callback mutex
   * @param {function():void} cb Only executed when this mutex is not in the current stack
   * @param {function():void} [elseCb] Executed when this mutex is in the current stack
   */

  /**
   * Creates a mutual exclude function with the following property:
   *
   * ```js
   * const mutex = createMutex()
   * mutex(() => {
   *   // This function is immediately executed
   *   mutex(() => {
   *     // This function is not executed, as the mutex is already active.
   *   })
   * })
   * ```
   *
   * @return {mutex} A mutual exclude function
   * @public
   */
  const createMutex = () => {
    let token = true;
    return (f, g) => {
      if (token) {
        token = false;
        try {
          f();
        } finally {
          token = true;
        }
      } else if (g !== undefined) {
        g();
      }
    }
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  function commonjsRequire (target) {
  	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
  }

  var simplepeer_min = createCommonjsModule(function (module, exports) {
  (function(e){module.exports=e();})(function(){var t=Math.floor,n=Math.abs,r=Math.pow;return function(){function d(s,e,n){function t(o,i){if(!e[o]){if(!s[o]){var l="function"==typeof commonjsRequire&&commonjsRequire;if(!i&&l)return l(o,!0);if(r)return r(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var a=e[o]={exports:{}};s[o][0].call(a.exports,function(e){var r=s[o][1][e];return t(r||e)},a,a.exports,d,s,e,n);}return e[o].exports}for(var r="function"==typeof commonjsRequire&&commonjsRequire,a=0;a<n.length;a++)t(n[a]);return t}return d}()({1:[function(e,t,n){function r(e){var t=e.length;if(0<t%4)throw new Error("Invalid string. Length must be a multiple of 4");var n=e.indexOf("=");-1===n&&(n=t);var r=n===t?0:4-n%4;return [n,r]}function a(e,t,n){return 3*(t+n)/4-n}function o(e){var t,n,o=r(e),d=o[0],s=o[1],l=new p(a(e,d,s)),c=0,f=0<s?d-4:d;for(n=0;n<f;n+=4)t=u[e.charCodeAt(n)]<<18|u[e.charCodeAt(n+1)]<<12|u[e.charCodeAt(n+2)]<<6|u[e.charCodeAt(n+3)],l[c++]=255&t>>16,l[c++]=255&t>>8,l[c++]=255&t;return 2===s&&(t=u[e.charCodeAt(n)]<<2|u[e.charCodeAt(n+1)]>>4,l[c++]=255&t),1===s&&(t=u[e.charCodeAt(n)]<<10|u[e.charCodeAt(n+1)]<<4|u[e.charCodeAt(n+2)]>>2,l[c++]=255&t>>8,l[c++]=255&t),l}function d(e){return c[63&e>>18]+c[63&e>>12]+c[63&e>>6]+c[63&e]}function s(e,t,n){for(var r,a=[],o=t;o<n;o+=3)r=(16711680&e[o]<<16)+(65280&e[o+1]<<8)+(255&e[o+2]),a.push(d(r));return a.join("")}function l(e){for(var t,n=e.length,r=n%3,a=[],o=16383,d=0,l=n-r;d<l;d+=o)a.push(s(e,d,d+o>l?l:d+o));return 1===r?(t=e[n-1],a.push(c[t>>2]+c[63&t<<4]+"==")):2===r&&(t=(e[n-2]<<8)+e[n-1],a.push(c[t>>10]+c[63&t>>4]+c[63&t<<2]+"=")),a.join("")}n.byteLength=function(e){var t=r(e),n=t[0],a=t[1];return 3*(n+a)/4-a},n.toByteArray=o,n.fromByteArray=l;for(var c=[],u=[],p="undefined"==typeof Uint8Array?Array:Uint8Array,f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",g=0,h=f.length;g<h;++g)c[g]=f[g],u[f.charCodeAt(g)]=g;u[45]=62,u[95]=63;},{}],2:[function(){},{}],3:[function(e,t,n){(function(){(function(){var z=String.fromCharCode,K=Math.min;function t(e){if(2147483647<e)throw new RangeError("The value \""+e+"\" is invalid for option \"size\"");var t=new Uint8Array(e);return t.__proto__=o.prototype,t}function o(e,t,n){if("number"==typeof e){if("string"==typeof t)throw new TypeError("The \"string\" argument must be of type string. Received type number");return l(e)}return i(e,t,n)}function i(e,t,n){if("string"==typeof e)return c(e,t);if(ArrayBuffer.isView(e))return u(e);if(null==e)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e);if(G(e,ArrayBuffer)||e&&G(e.buffer,ArrayBuffer))return p(e,t,n);if("number"==typeof e)throw new TypeError("The \"value\" argument must not be of type number. Received type number");var r=e.valueOf&&e.valueOf();if(null!=r&&r!==e)return o.from(r,t,n);var a=f(e);if(a)return a;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof e[Symbol.toPrimitive])return o.from(e[Symbol.toPrimitive]("string"),t,n);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e)}function d(e){if("number"!=typeof e)throw new TypeError("\"size\" argument must be of type number");else if(0>e)throw new RangeError("The value \""+e+"\" is invalid for option \"size\"")}function s(e,n,r){return d(e),0>=e?t(e):void 0===n?t(e):"string"==typeof r?t(e).fill(n,r):t(e).fill(n)}function l(e){return d(e),t(0>e?0:0|g(e))}function c(e,n){if(("string"!=typeof n||""===n)&&(n="utf8"),!o.isEncoding(n))throw new TypeError("Unknown encoding: "+n);var r=0|h(e,n),a=t(r),i=a.write(e,n);return i!==r&&(a=a.slice(0,i)),a}function u(e){for(var n=0>e.length?0:0|g(e.length),r=t(n),a=0;a<n;a+=1)r[a]=255&e[a];return r}function p(e,t,n){if(0>t||e.byteLength<t)throw new RangeError("\"offset\" is outside of buffer bounds");if(e.byteLength<t+(n||0))throw new RangeError("\"length\" is outside of buffer bounds");var r;return r=void 0===t&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,t):new Uint8Array(e,t,n),r.__proto__=o.prototype,r}function f(e){if(o.isBuffer(e)){var n=0|g(e.length),r=t(n);return 0===r.length?r:(e.copy(r,0,0,n),r)}return void 0===e.length?"Buffer"===e.type&&Array.isArray(e.data)?u(e.data):void 0:"number"!=typeof e.length||Y(e.length)?t(0):u(e)}function g(e){if(e>=2147483647)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+2147483647 .toString(16)+" bytes");return 0|e}function h(e,t){if(o.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||G(e,ArrayBuffer))return e.byteLength;if("string"!=typeof e)throw new TypeError("The \"string\" argument must be one of type string, Buffer, or ArrayBuffer. Received type "+typeof e);var n=e.length,r=2<arguments.length&&!0===arguments[2];if(!r&&0===n)return 0;for(var a=!1;;)switch(t){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":return j(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return H(e).length;default:if(a)return r?-1:j(e).length;t=(""+t).toLowerCase(),a=!0;}}function _(e,t,n){var r=!1;if((void 0===t||0>t)&&(t=0),t>this.length)return "";if((void 0===n||n>this.length)&&(n=this.length),0>=n)return "";if(n>>>=0,t>>>=0,n<=t)return "";for(e||(e="utf8");;)switch(e){case"hex":return N(this,t,n);case"utf8":case"utf-8":return v(this,t,n);case"ascii":return A(this,t,n);case"latin1":case"binary":return x(this,t,n);case"base64":return T(this,t,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return I(this,t,n);default:if(r)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),r=!0;}}function m(e,t,n){var r=e[t];e[t]=e[n],e[n]=r;}function b(e,t,n,r,a){if(0===e.length)return -1;if("string"==typeof n?(r=n,n=0):2147483647<n?n=2147483647:-2147483648>n&&(n=-2147483648),n=+n,Y(n)&&(n=a?0:e.length-1),0>n&&(n=e.length+n),n>=e.length){if(a)return -1;n=e.length-1;}else if(0>n)if(a)n=0;else return -1;if("string"==typeof t&&(t=o.from(t,r)),o.isBuffer(t))return 0===t.length?-1:y(e,t,n,r,a);if("number"==typeof t)return t&=255,"function"==typeof Uint8Array.prototype.indexOf?a?Uint8Array.prototype.indexOf.call(e,t,n):Uint8Array.prototype.lastIndexOf.call(e,t,n):y(e,[t],n,r,a);throw new TypeError("val must be string, number or Buffer")}function y(e,t,n,r,a){function o(e,t){return 1===d?e[t]:e.readUInt16BE(t*d)}var d=1,s=e.length,l=t.length;if(void 0!==r&&(r=(r+"").toLowerCase(),"ucs2"===r||"ucs-2"===r||"utf16le"===r||"utf-16le"===r)){if(2>e.length||2>t.length)return -1;d=2,s/=2,l/=2,n/=2;}var c;if(a){var u=-1;for(c=n;c<s;c++)if(o(e,c)!==o(t,-1===u?0:c-u))-1!==u&&(c-=c-u),u=-1;else if(-1===u&&(u=c),c-u+1===l)return u*d}else for(n+l>s&&(n=s-l),c=n;0<=c;c--){for(var p=!0,f=0;f<l;f++)if(o(e,c+f)!==o(t,f)){p=!1;break}if(p)return c}return -1}function C(e,t,n,r){n=+n||0;var a=e.length-n;r?(r=+r,r>a&&(r=a)):r=a;var o=t.length;r>o/2&&(r=o/2);for(var d,s=0;s<r;++s){if(d=parseInt(t.substr(2*s,2),16),Y(d))return s;e[n+s]=d;}return s}function w(e,t,n,r){return V(j(t,e.length-n),e,n,r)}function R(e,t,n,r){return V(q(t),e,n,r)}function E(e,t,n,r){return R(e,t,n,r)}function S(e,t,n,r){return V(H(t),e,n,r)}function k(e,t,n,r){return V(W(t,e.length-n),e,n,r)}function T(e,t,n){return 0===t&&n===e.length?X.fromByteArray(e):X.fromByteArray(e.slice(t,n))}function v(e,t,n){n=K(e.length,n);for(var r=[],a=t;a<n;){var o=e[a],d=null,s=239<o?4:223<o?3:191<o?2:1;if(a+s<=n){var l,c,u,p;1===s?128>o&&(d=o):2===s?(l=e[a+1],128==(192&l)&&(p=(31&o)<<6|63&l,127<p&&(d=p))):3===s?(l=e[a+1],c=e[a+2],128==(192&l)&&128==(192&c)&&(p=(15&o)<<12|(63&l)<<6|63&c,2047<p&&(55296>p||57343<p)&&(d=p))):4===s?(l=e[a+1],c=e[a+2],u=e[a+3],128==(192&l)&&128==(192&c)&&128==(192&u)&&(p=(15&o)<<18|(63&l)<<12|(63&c)<<6|63&u,65535<p&&1114112>p&&(d=p))):void 0;}null===d?(d=65533,s=1):65535<d&&(d-=65536,r.push(55296|1023&d>>>10),d=56320|1023&d),r.push(d),a+=s;}return L(r)}function L(e){var t=e.length;if(t<=4096)return z.apply(String,e);for(var n="",r=0;r<t;)n+=z.apply(String,e.slice(r,r+=4096));return n}function A(e,t,n){var r="";n=K(e.length,n);for(var a=t;a<n;++a)r+=z(127&e[a]);return r}function x(e,t,n){var r="";n=K(e.length,n);for(var a=t;a<n;++a)r+=z(e[a]);return r}function N(e,t,n){var r=e.length;(!t||0>t)&&(t=0),(!n||0>n||n>r)&&(n=r);for(var a="",o=t;o<n;++o)a+=U(e[o]);return a}function I(e,t,n){for(var r=e.slice(t,n),a="",o=0;o<r.length;o+=2)a+=z(r[o]+256*r[o+1]);return a}function P(e,t,n){if(0!=e%1||0>e)throw new RangeError("offset is not uint");if(e+t>n)throw new RangeError("Trying to access beyond buffer length")}function M(e,t,n,r,a,i){if(!o.isBuffer(e))throw new TypeError("\"buffer\" argument must be a Buffer instance");if(t>a||t<i)throw new RangeError("\"value\" argument is out of bounds");if(n+r>e.length)throw new RangeError("Index out of range")}function D(e,t,n,r){if(n+r>e.length)throw new RangeError("Index out of range");if(0>n)throw new RangeError("Index out of range")}function F(e,t,n,r,a){return t=+t,n>>>=0,a||D(e,t,n,4),$.write(e,t,n,r,23,4),n+4}function O(e,t,n,r,a){return t=+t,n>>>=0,a||D(e,t,n,8),$.write(e,t,n,r,52,8),n+8}function B(e){if(e=e.split("=")[0],e=e.trim().replace(J,""),2>e.length)return "";for(;0!=e.length%4;)e+="=";return e}function U(e){return 16>e?"0"+e.toString(16):e.toString(16)}function j(e,t){t=t||1/0;for(var n,r=e.length,a=null,o=[],d=0;d<r;++d){if(n=e.charCodeAt(d),55295<n&&57344>n){if(!a){if(56319<n){-1<(t-=3)&&o.push(239,191,189);continue}else if(d+1===r){-1<(t-=3)&&o.push(239,191,189);continue}a=n;continue}if(56320>n){-1<(t-=3)&&o.push(239,191,189),a=n;continue}n=(a-55296<<10|n-56320)+65536;}else a&&-1<(t-=3)&&o.push(239,191,189);if(a=null,128>n){if(0>(t-=1))break;o.push(n);}else if(2048>n){if(0>(t-=2))break;o.push(192|n>>6,128|63&n);}else if(65536>n){if(0>(t-=3))break;o.push(224|n>>12,128|63&n>>6,128|63&n);}else if(1114112>n){if(0>(t-=4))break;o.push(240|n>>18,128|63&n>>12,128|63&n>>6,128|63&n);}else throw new Error("Invalid code point")}return o}function q(e){for(var t=[],n=0;n<e.length;++n)t.push(255&e.charCodeAt(n));return t}function W(e,t){for(var n,r,a,o=[],d=0;d<e.length&&!(0>(t-=2));++d)n=e.charCodeAt(d),r=n>>8,a=n%256,o.push(a),o.push(r);return o}function H(e){return X.toByteArray(B(e))}function V(e,t,n,r){for(var a=0;a<r&&!(a+n>=t.length||a>=e.length);++a)t[a+n]=e[a];return a}function G(e,t){return e instanceof t||null!=e&&null!=e.constructor&&null!=e.constructor.name&&e.constructor.name===t.name}function Y(e){return e!==e}var X=e("base64-js"),$=e("ieee754");n.Buffer=o,n.SlowBuffer=function(e){return +e!=e&&(e=0),o.alloc(+e)},n.INSPECT_MAX_BYTES=50;n.kMaxLength=2147483647,o.TYPED_ARRAY_SUPPORT=function(){try{var e=new Uint8Array(1);return e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===e.foo()}catch(t){return !1}}(),o.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(o.prototype,"parent",{enumerable:!0,get:function(){return o.isBuffer(this)?this.buffer:void 0}}),Object.defineProperty(o.prototype,"offset",{enumerable:!0,get:function(){return o.isBuffer(this)?this.byteOffset:void 0}}),"undefined"!=typeof Symbol&&null!=Symbol.species&&o[Symbol.species]===o&&Object.defineProperty(o,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}),o.poolSize=8192,o.from=function(e,t,n){return i(e,t,n)},o.prototype.__proto__=Uint8Array.prototype,o.__proto__=Uint8Array,o.alloc=function(e,t,n){return s(e,t,n)},o.allocUnsafe=function(e){return l(e)},o.allocUnsafeSlow=function(e){return l(e)},o.isBuffer=function(e){return null!=e&&!0===e._isBuffer&&e!==o.prototype},o.compare=function(e,t){if(G(e,Uint8Array)&&(e=o.from(e,e.offset,e.byteLength)),G(t,Uint8Array)&&(t=o.from(t,t.offset,t.byteLength)),!o.isBuffer(e)||!o.isBuffer(t))throw new TypeError("The \"buf1\", \"buf2\" arguments must be one of type Buffer or Uint8Array");if(e===t)return 0;for(var n=e.length,r=t.length,d=0,s=K(n,r);d<s;++d)if(e[d]!==t[d]){n=e[d],r=t[d];break}return n<r?-1:r<n?1:0},o.isEncoding=function(e){switch((e+"").toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1;}},o.concat=function(e,t){if(!Array.isArray(e))throw new TypeError("\"list\" argument must be an Array of Buffers");if(0===e.length)return o.alloc(0);var n;if(t===void 0)for(t=0,n=0;n<e.length;++n)t+=e[n].length;var r=o.allocUnsafe(t),a=0;for(n=0;n<e.length;++n){var d=e[n];if(G(d,Uint8Array)&&(d=o.from(d)),!o.isBuffer(d))throw new TypeError("\"list\" argument must be an Array of Buffers");d.copy(r,a),a+=d.length;}return r},o.byteLength=h,o.prototype._isBuffer=!0,o.prototype.swap16=function(){var e=this.length;if(0!=e%2)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)m(this,t,t+1);return this},o.prototype.swap32=function(){var e=this.length;if(0!=e%4)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)m(this,t,t+3),m(this,t+1,t+2);return this},o.prototype.swap64=function(){var e=this.length;if(0!=e%8)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)m(this,t,t+7),m(this,t+1,t+6),m(this,t+2,t+5),m(this,t+3,t+4);return this},o.prototype.toString=function(){var e=this.length;return 0===e?"":0===arguments.length?v(this,0,e):_.apply(this,arguments)},o.prototype.toLocaleString=o.prototype.toString,o.prototype.equals=function(e){if(!o.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===o.compare(this,e)},o.prototype.inspect=function(){var e="",t=n.INSPECT_MAX_BYTES;return e=this.toString("hex",0,t).replace(/(.{2})/g,"$1 ").trim(),this.length>t&&(e+=" ... "),"<Buffer "+e+">"},o.prototype.compare=function(e,t,n,r,a){if(G(e,Uint8Array)&&(e=o.from(e,e.offset,e.byteLength)),!o.isBuffer(e))throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. Received type "+typeof e);if(void 0===t&&(t=0),void 0===n&&(n=e?e.length:0),void 0===r&&(r=0),void 0===a&&(a=this.length),0>t||n>e.length||0>r||a>this.length)throw new RangeError("out of range index");if(r>=a&&t>=n)return 0;if(r>=a)return -1;if(t>=n)return 1;if(t>>>=0,n>>>=0,r>>>=0,a>>>=0,this===e)return 0;for(var d=a-r,s=n-t,l=K(d,s),c=this.slice(r,a),u=e.slice(t,n),p=0;p<l;++p)if(c[p]!==u[p]){d=c[p],s=u[p];break}return d<s?-1:s<d?1:0},o.prototype.includes=function(e,t,n){return -1!==this.indexOf(e,t,n)},o.prototype.indexOf=function(e,t,n){return b(this,e,t,n,!0)},o.prototype.lastIndexOf=function(e,t,n){return b(this,e,t,n,!1)},o.prototype.write=function(e,t,n,r){if(void 0===t)r="utf8",n=this.length,t=0;else if(void 0===n&&"string"==typeof t)r=t,n=this.length,t=0;else if(isFinite(t))t>>>=0,isFinite(n)?(n>>>=0,void 0===r&&(r="utf8")):(r=n,n=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var a=this.length-t;if((void 0===n||n>a)&&(n=a),0<e.length&&(0>n||0>t)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");r||(r="utf8");for(var o=!1;;)switch(r){case"hex":return C(this,e,t,n);case"utf8":case"utf-8":return w(this,e,t,n);case"ascii":return R(this,e,t,n);case"latin1":case"binary":return E(this,e,t,n);case"base64":return S(this,e,t,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return k(this,e,t,n);default:if(o)throw new TypeError("Unknown encoding: "+r);r=(""+r).toLowerCase(),o=!0;}},o.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};o.prototype.slice=function(e,t){var n=this.length;e=~~e,t=void 0===t?n:~~t,0>e?(e+=n,0>e&&(e=0)):e>n&&(e=n),0>t?(t+=n,0>t&&(t=0)):t>n&&(t=n),t<e&&(t=e);var r=this.subarray(e,t);return r.__proto__=o.prototype,r},o.prototype.readUIntLE=function(e,t,n){e>>>=0,t>>>=0,n||P(e,t,this.length);for(var r=this[e],a=1,o=0;++o<t&&(a*=256);)r+=this[e+o]*a;return r},o.prototype.readUIntBE=function(e,t,n){e>>>=0,t>>>=0,n||P(e,t,this.length);for(var r=this[e+--t],a=1;0<t&&(a*=256);)r+=this[e+--t]*a;return r},o.prototype.readUInt8=function(e,t){return e>>>=0,t||P(e,1,this.length),this[e]},o.prototype.readUInt16LE=function(e,t){return e>>>=0,t||P(e,2,this.length),this[e]|this[e+1]<<8},o.prototype.readUInt16BE=function(e,t){return e>>>=0,t||P(e,2,this.length),this[e]<<8|this[e+1]},o.prototype.readUInt32LE=function(e,t){return e>>>=0,t||P(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},o.prototype.readUInt32BE=function(e,t){return e>>>=0,t||P(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},o.prototype.readIntLE=function(e,t,n){e>>>=0,t>>>=0,n||P(e,t,this.length);for(var a=this[e],o=1,d=0;++d<t&&(o*=256);)a+=this[e+d]*o;return o*=128,a>=o&&(a-=r(2,8*t)),a},o.prototype.readIntBE=function(e,t,n){e>>>=0,t>>>=0,n||P(e,t,this.length);for(var a=t,o=1,d=this[e+--a];0<a&&(o*=256);)d+=this[e+--a]*o;return o*=128,d>=o&&(d-=r(2,8*t)),d},o.prototype.readInt8=function(e,t){return e>>>=0,t||P(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},o.prototype.readInt16LE=function(e,t){e>>>=0,t||P(e,2,this.length);var n=this[e]|this[e+1]<<8;return 32768&n?4294901760|n:n},o.prototype.readInt16BE=function(e,t){e>>>=0,t||P(e,2,this.length);var n=this[e+1]|this[e]<<8;return 32768&n?4294901760|n:n},o.prototype.readInt32LE=function(e,t){return e>>>=0,t||P(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},o.prototype.readInt32BE=function(e,t){return e>>>=0,t||P(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},o.prototype.readFloatLE=function(e,t){return e>>>=0,t||P(e,4,this.length),$.read(this,e,!0,23,4)},o.prototype.readFloatBE=function(e,t){return e>>>=0,t||P(e,4,this.length),$.read(this,e,!1,23,4)},o.prototype.readDoubleLE=function(e,t){return e>>>=0,t||P(e,8,this.length),$.read(this,e,!0,52,8)},o.prototype.readDoubleBE=function(e,t){return e>>>=0,t||P(e,8,this.length),$.read(this,e,!1,52,8)},o.prototype.writeUIntLE=function(e,t,n,a){if(e=+e,t>>>=0,n>>>=0,!a){var o=r(2,8*n)-1;M(this,e,t,n,o,0);}var d=1,s=0;for(this[t]=255&e;++s<n&&(d*=256);)this[t+s]=255&e/d;return t+n},o.prototype.writeUIntBE=function(e,t,n,a){if(e=+e,t>>>=0,n>>>=0,!a){var o=r(2,8*n)-1;M(this,e,t,n,o,0);}var d=n-1,s=1;for(this[t+d]=255&e;0<=--d&&(s*=256);)this[t+d]=255&e/s;return t+n},o.prototype.writeUInt8=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,1,255,0),this[t]=255&e,t+1},o.prototype.writeUInt16LE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,2,65535,0),this[t]=255&e,this[t+1]=e>>>8,t+2},o.prototype.writeUInt16BE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=255&e,t+2},o.prototype.writeUInt32LE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,4,4294967295,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e,t+4},o.prototype.writeUInt32BE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,4,4294967295,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},o.prototype.writeIntLE=function(e,t,n,a){if(e=+e,t>>>=0,!a){var o=r(2,8*n-1);M(this,e,t,n,o-1,-o);}var d=0,s=1,l=0;for(this[t]=255&e;++d<n&&(s*=256);)0>e&&0===l&&0!==this[t+d-1]&&(l=1),this[t+d]=255&(e/s>>0)-l;return t+n},o.prototype.writeIntBE=function(e,t,n,a){if(e=+e,t>>>=0,!a){var o=r(2,8*n-1);M(this,e,t,n,o-1,-o);}var d=n-1,s=1,l=0;for(this[t+d]=255&e;0<=--d&&(s*=256);)0>e&&0===l&&0!==this[t+d+1]&&(l=1),this[t+d]=255&(e/s>>0)-l;return t+n},o.prototype.writeInt8=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,1,127,-128),0>e&&(e=255+e+1),this[t]=255&e,t+1},o.prototype.writeInt16LE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,2,32767,-32768),this[t]=255&e,this[t+1]=e>>>8,t+2},o.prototype.writeInt16BE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=255&e,t+2},o.prototype.writeInt32LE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,4,2147483647,-2147483648),this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},o.prototype.writeInt32BE=function(e,t,n){return e=+e,t>>>=0,n||M(this,e,t,4,2147483647,-2147483648),0>e&&(e=4294967295+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},o.prototype.writeFloatLE=function(e,t,n){return F(this,e,t,!0,n)},o.prototype.writeFloatBE=function(e,t,n){return F(this,e,t,!1,n)},o.prototype.writeDoubleLE=function(e,t,n){return O(this,e,t,!0,n)},o.prototype.writeDoubleBE=function(e,t,n){return O(this,e,t,!1,n)},o.prototype.copy=function(e,t,n,r){if(!o.isBuffer(e))throw new TypeError("argument should be a Buffer");if(n||(n=0),r||0===r||(r=this.length),t>=e.length&&(t=e.length),t||(t=0),0<r&&r<n&&(r=n),r===n)return 0;if(0===e.length||0===this.length)return 0;if(0>t)throw new RangeError("targetStart out of bounds");if(0>n||n>=this.length)throw new RangeError("Index out of range");if(0>r)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);var a=r-n;if(this===e&&"function"==typeof Uint8Array.prototype.copyWithin)this.copyWithin(t,n,r);else if(this===e&&n<t&&t<r)for(var d=a-1;0<=d;--d)e[d+t]=this[d+n];else Uint8Array.prototype.set.call(e,this.subarray(n,r),t);return a},o.prototype.fill=function(e,t,n,r){if("string"==typeof e){if("string"==typeof t?(r=t,t=0,n=this.length):"string"==typeof n&&(r=n,n=this.length),void 0!==r&&"string"!=typeof r)throw new TypeError("encoding must be a string");if("string"==typeof r&&!o.isEncoding(r))throw new TypeError("Unknown encoding: "+r);if(1===e.length){var a=e.charCodeAt(0);("utf8"===r&&128>a||"latin1"===r)&&(e=a);}}else "number"==typeof e&&(e&=255);if(0>t||this.length<t||this.length<n)throw new RangeError("Out of range index");if(n<=t)return this;t>>>=0,n=n===void 0?this.length:n>>>0,e||(e=0);var d;if("number"==typeof e)for(d=t;d<n;++d)this[d]=e;else {var s=o.isBuffer(e)?e:o.from(e,r),l=s.length;if(0===l)throw new TypeError("The value \""+e+"\" is invalid for argument \"value\"");for(d=0;d<n-t;++d)this[d+t]=s[d%l];}return this};var J=/[^+/0-9A-Za-z-_]/g;}).call(this);}).call(this,e("buffer").Buffer);},{"base64-js":1,buffer:3,ieee754:9}],4:[function(e,t){function n(e){console&&console.warn&&console.warn(e);}function r(){r.init.call(this);}function a(e){if("function"!=typeof e)throw new TypeError("The \"listener\" argument must be of type Function. Received type "+typeof e)}function o(e){return void 0===e._maxListeners?r.defaultMaxListeners:e._maxListeners}function i(e,t,r,i){var d,s,l;if(a(r),s=e._events,void 0===s?(s=e._events=Object.create(null),e._eventsCount=0):(void 0!==s.newListener&&(e.emit("newListener",t,r.listener?r.listener:r),s=e._events),l=s[t]),void 0===l)l=s[t]=r,++e._eventsCount;else if("function"==typeof l?l=s[t]=i?[r,l]:[l,r]:i?l.unshift(r):l.push(r),d=o(e),0<d&&l.length>d&&!l.warned){l.warned=!0;var c=new Error("Possible EventEmitter memory leak detected. "+l.length+" "+(t+" listeners added. Use emitter.setMaxListeners() to increase limit"));c.name="MaxListenersExceededWarning",c.emitter=e,c.type=t,c.count=l.length,n(c);}return e}function d(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function s(e,t,n){var r={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},a=d.bind(r);return a.listener=n,r.wrapFn=a,a}function l(e,t,n){var r=e._events;if(r===void 0)return [];var a=r[t];return void 0===a?[]:"function"==typeof a?n?[a.listener||a]:[a]:n?f(a):u(a,a.length)}function c(e){var t=this._events;if(t!==void 0){var n=t[e];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function u(e,t){for(var n=Array(t),r=0;r<t;++r)n[r]=e[r];return n}function p(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop();}function f(e){for(var t=Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}var g,h="object"==typeof Reflect?Reflect:null,_=h&&"function"==typeof h.apply?h.apply:function(e,t,n){return Function.prototype.apply.call(e,t,n)};g=h&&"function"==typeof h.ownKeys?h.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var m=Number.isNaN||function(e){return e!==e};t.exports=r,t.exports.once=function(e,t){return new Promise(function(n,r){function a(){o!==void 0&&e.removeListener("error",o),n([].slice.call(arguments));}var o;"error"!==t&&(o=function(n){e.removeListener(t,a),r(n);},e.once("error",o)),e.once(t,a);})},r.EventEmitter=r,r.prototype._events=void 0,r.prototype._eventsCount=0,r.prototype._maxListeners=void 0;var b=10;Object.defineProperty(r,"defaultMaxListeners",{enumerable:!0,get:function(){return b},set:function(e){if("number"!=typeof e||0>e||m(e))throw new RangeError("The value of \"defaultMaxListeners\" is out of range. It must be a non-negative number. Received "+e+".");b=e;}}),r.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0;},r.prototype.setMaxListeners=function(e){if("number"!=typeof e||0>e||m(e))throw new RangeError("The value of \"n\" is out of range. It must be a non-negative number. Received "+e+".");return this._maxListeners=e,this},r.prototype.getMaxListeners=function(){return o(this)},r.prototype.emit=function(e){for(var t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);var r="error"===e,a=this._events;if(a!==void 0)r=r&&a.error===void 0;else if(!r)return !1;if(r){var o;if(0<t.length&&(o=t[0]),o instanceof Error)throw o;var d=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw d.context=o,d}var s=a[e];if(s===void 0)return !1;if("function"==typeof s)_(s,this,t);else for(var l=s.length,c=u(s,l),n=0;n<l;++n)_(c[n],this,t);return !0},r.prototype.addListener=function(e,t){return i(this,e,t,!1)},r.prototype.on=r.prototype.addListener,r.prototype.prependListener=function(e,t){return i(this,e,t,!0)},r.prototype.once=function(e,t){return a(t),this.on(e,s(this,e,t)),this},r.prototype.prependOnceListener=function(e,t){return a(t),this.prependListener(e,s(this,e,t)),this},r.prototype.removeListener=function(e,t){var n,r,o,d,s;if(a(t),r=this._events,void 0===r)return this;if(n=r[e],void 0===n)return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete r[e],r.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(o=-1,d=n.length-1;0<=d;d--)if(n[d]===t||n[d].listener===t){s=n[d].listener,o=d;break}if(0>o)return this;0===o?n.shift():p(n,o),1===n.length&&(r[e]=n[0]),void 0!==r.removeListener&&this.emit("removeListener",e,s||t);}return this},r.prototype.off=r.prototype.removeListener,r.prototype.removeAllListeners=function(e){var t,n,r;if(n=this._events,void 0===n)return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]),this;if(0===arguments.length){var a,o=Object.keys(n);for(r=0;r<o.length;++r)a=o[r],"removeListener"===a||this.removeAllListeners(a);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(t=n[e],"function"==typeof t)this.removeListener(e,t);else if(void 0!==t)for(r=t.length-1;0<=r;r--)this.removeListener(e,t[r]);return this},r.prototype.listeners=function(e){return l(this,e,!0)},r.prototype.rawListeners=function(e){return l(this,e,!1)},r.listenerCount=function(e,t){return "function"==typeof e.listenerCount?e.listenerCount(t):c.call(e,t)},r.prototype.listenerCount=c,r.prototype.eventNames=function(){return 0<this._eventsCount?g(this._events):[]};},{}],5:[function(e,t,n){(function(a){(function(){function r(){let e;try{e=n.storage.getItem("debug");}catch(e){}return !e&&"undefined"!=typeof a&&"env"in a&&(e=a.env.DEBUG),e}n.formatArgs=function(e){if(e[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+e[0]+(this.useColors?"%c ":" ")+"+"+t.exports.humanize(this.diff),!this.useColors)return;const n="color: "+this.color;e.splice(1,0,n,"color: inherit");let r=0,a=0;e[0].replace(/%[a-zA-Z%]/g,e=>{"%%"===e||(r++,"%c"===e&&(a=r));}),e.splice(a,0,n);},n.save=function(e){try{e?n.storage.setItem("debug",e):n.storage.removeItem("debug");}catch(e){}},n.load=r,n.useColors=function(){return !!("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))||!("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))&&("undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&31<=parseInt(RegExp.$1,10)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))},n.storage=function(){try{return localStorage}catch(e){}}(),n.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],n.log=console.debug||console.log||(()=>{}),t.exports=e("./common")(n);const{formatters:o}=t.exports;o.j=function(e){try{return JSON.stringify(e)}catch(e){return "[UnexpectedJSONParseError]: "+e.message}};}).call(this);}).call(this,e("_process"));},{"./common":6,_process:12}],6:[function(e,t){t.exports=function(t){function r(e){function t(...e){if(!t.enabled)return;const a=t,o=+new Date,i=o-(n||o);a.diff=i,a.prev=n,a.curr=o,n=o,e[0]=r.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let d=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,(t,n)=>{if("%%"===t)return t;d++;const o=r.formatters[n];if("function"==typeof o){const n=e[d];t=o.call(a,n),e.splice(d,1),d--;}return t}),r.formatArgs.call(a,e);const s=a.log||r.log;s.apply(a,e);}let n;return t.namespace=e,t.enabled=r.enabled(e),t.useColors=r.useColors(),t.color=r.selectColor(e),t.destroy=a,t.extend=o,"function"==typeof r.init&&r.init(t),r.instances.push(t),t}function a(){const e=r.instances.indexOf(this);return -1!==e&&(r.instances.splice(e,1),!0)}function o(e,t){const n=r(this.namespace+("undefined"==typeof t?":":t)+e);return n.log=this.log,n}function i(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return r.debug=r,r.default=r,r.coerce=function(e){return e instanceof Error?e.stack||e.message:e},r.disable=function(){const e=[...r.names.map(i),...r.skips.map(i).map(e=>"-"+e)].join(",");return r.enable(""),e},r.enable=function(e){r.save(e),r.names=[],r.skips=[];let t;const n=("string"==typeof e?e:"").split(/[\s,]+/),a=n.length;for(t=0;t<a;t++)n[t]&&(e=n[t].replace(/\*/g,".*?"),"-"===e[0]?r.skips.push(new RegExp("^"+e.substr(1)+"$")):r.names.push(new RegExp("^"+e+"$")));for(t=0;t<r.instances.length;t++){const e=r.instances[t];e.enabled=r.enabled(e.namespace);}},r.enabled=function(e){if("*"===e[e.length-1])return !0;let t,n;for(t=0,n=r.skips.length;t<n;t++)if(r.skips[t].test(e))return !1;for(t=0,n=r.names.length;t<n;t++)if(r.names[t].test(e))return !0;return !1},r.humanize=e("ms"),Object.keys(t).forEach(e=>{r[e]=t[e];}),r.instances=[],r.names=[],r.skips=[],r.formatters={},r.selectColor=function(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return r.colors[n(t)%r.colors.length]},r.enable(r.load()),r};},{ms:11}],7:[function(e,t){function n(e,t){for(const n in t)Object.defineProperty(e,n,{value:t[n],enumerable:!0,configurable:!0});return e}t.exports=function(e,t,r){if(!e||"string"==typeof e)throw new TypeError("Please pass an Error to err-code");r||(r={}),"object"==typeof t&&(r=t,t=void 0),null!=t&&(r.code=t);try{return n(e,r)}catch(t){r.message=e.message,r.stack=e.stack;const a=function(){};return a.prototype=Object.create(Object.getPrototypeOf(e)),n(new a,r)}};},{}],8:[function(e,t){t.exports=function(){if("undefined"==typeof window)return null;var e={RTCPeerConnection:window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection,RTCSessionDescription:window.RTCSessionDescription||window.mozRTCSessionDescription||window.webkitRTCSessionDescription,RTCIceCandidate:window.RTCIceCandidate||window.mozRTCIceCandidate||window.webkitRTCIceCandidate};return e.RTCPeerConnection?e:null};},{}],9:[function(e,a,o){/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */o.read=function(t,n,a,o,l){var c,u,p=8*l-o-1,f=(1<<p)-1,g=f>>1,h=-7,_=a?l-1:0,b=a?-1:1,d=t[n+_];for(_+=b,c=d&(1<<-h)-1,d>>=-h,h+=p;0<h;c=256*c+t[n+_],_+=b,h-=8);for(u=c&(1<<-h)-1,c>>=-h,h+=o;0<h;u=256*u+t[n+_],_+=b,h-=8);if(0===c)c=1-g;else {if(c===f)return u?NaN:(d?-1:1)*(1/0);u+=r(2,o),c-=g;}return (d?-1:1)*u*r(2,c-o)},o.write=function(a,o,l,u,p,f){var _,b,y,g=Math.LN2,h=Math.log,C=8*f-p-1,w=(1<<C)-1,R=w>>1,E=23===p?r(2,-24)-r(2,-77):0,S=u?0:f-1,k=u?1:-1,d=0>o||0===o&&0>1/o?1:0;for(o=n(o),isNaN(o)||o===1/0?(b=isNaN(o)?1:0,_=w):(_=t(h(o)/g),1>o*(y=r(2,-_))&&(_--,y*=2),o+=1<=_+R?E/y:E*r(2,1-R),2<=o*y&&(_++,y/=2),_+R>=w?(b=0,_=w):1<=_+R?(b=(o*y-1)*r(2,p),_+=R):(b=o*r(2,R-1)*r(2,p),_=0));8<=p;a[l+S]=255&b,S+=k,b/=256,p-=8);for(_=_<<p|b,C+=p;0<C;a[l+S]=255&_,S+=k,_/=256,C-=8);a[l+S-k]|=128*d;};},{}],10:[function(e,t){t.exports="function"==typeof Object.create?function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}));}:function(e,t){if(t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e;}};},{}],11:[function(e,t){var s=Math.round;function r(e){if(e+="",!(100<e.length)){var t=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(t){var r=parseFloat(t[1]),n=(t[2]||"ms").toLowerCase();return "years"===n||"year"===n||"yrs"===n||"yr"===n||"y"===n?31557600000*r:"weeks"===n||"week"===n||"w"===n?604800000*r:"days"===n||"day"===n||"d"===n?86400000*r:"hours"===n||"hour"===n||"hrs"===n||"hr"===n||"h"===n?3600000*r:"minutes"===n||"minute"===n||"mins"===n||"min"===n||"m"===n?60000*r:"seconds"===n||"second"===n||"secs"===n||"sec"===n||"s"===n?1000*r:"milliseconds"===n||"millisecond"===n||"msecs"===n||"msec"===n||"ms"===n?r:void 0}}}function a(e){var t=n(e);return 86400000<=t?s(e/86400000)+"d":3600000<=t?s(e/3600000)+"h":60000<=t?s(e/60000)+"m":1000<=t?s(e/1000)+"s":e+"ms"}function o(e){var t=n(e);return 86400000<=t?i(e,t,86400000,"day"):3600000<=t?i(e,t,3600000,"hour"):60000<=t?i(e,t,60000,"minute"):1000<=t?i(e,t,1000,"second"):e+" ms"}function i(e,t,r,n){return s(e/r)+" "+n+(t>=1.5*r?"s":"")}t.exports=function(e,t){t=t||{};var n=typeof e;if("string"==n&&0<e.length)return r(e);if("number"===n&&isFinite(e))return t.long?o(e):a(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))};},{}],12:[function(e,t){function n(){throw new Error("setTimeout has not been defined")}function r(){throw new Error("clearTimeout has not been defined")}function a(t){if(c===setTimeout)return setTimeout(t,0);if((c===n||!c)&&setTimeout)return c=setTimeout,setTimeout(t,0);try{return c(t,0)}catch(n){try{return c.call(null,t,0)}catch(n){return c.call(this,t,0)}}}function o(t){if(u===clearTimeout)return clearTimeout(t);if((u===r||!u)&&clearTimeout)return u=clearTimeout,clearTimeout(t);try{return u(t)}catch(n){try{return u.call(null,t)}catch(n){return u.call(this,t)}}}function i(){h&&f&&(h=!1,f.length?g=f.concat(g):_=-1,g.length&&d());}function d(){if(!h){var e=a(i);h=!0;for(var t=g.length;t;){for(f=g,g=[];++_<t;)f&&f[_].run();_=-1,t=g.length;}f=null,h=!1,o(e);}}function s(e,t){this.fun=e,this.array=t;}function l(){}var c,u,p=t.exports={};(function(){try{c="function"==typeof setTimeout?setTimeout:n;}catch(t){c=n;}try{u="function"==typeof clearTimeout?clearTimeout:r;}catch(t){u=r;}})();var f,g=[],h=!1,_=-1;p.nextTick=function(e){var t=Array(arguments.length-1);if(1<arguments.length)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];g.push(new s(e,t)),1!==g.length||h||a(d);},s.prototype.run=function(){this.fun.apply(null,this.array);},p.title="browser",p.browser=!0,p.env={},p.argv=[],p.version="",p.versions={},p.on=l,p.addListener=l,p.once=l,p.off=l,p.removeListener=l,p.removeAllListeners=l,p.emit=l,p.prependListener=l,p.prependOnceListener=l,p.listeners=function(){return []},p.binding=function(){throw new Error("process.binding is not supported")},p.cwd=function(){return "/"},p.chdir=function(){throw new Error("process.chdir is not supported")},p.umask=function(){return 0};},{}],13:[function(e,t){/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */let n;t.exports="function"==typeof queueMicrotask?queueMicrotask.bind(globalThis):e=>(n||(n=Promise.resolve())).then(e).catch(e=>setTimeout(()=>{throw e},0));},{}],14:[function(e,t){(function(n,r){(function(){var a=e("safe-buffer").Buffer,o=r.crypto||r.msCrypto;t.exports=o&&o.getRandomValues?function(e,t){if(e>4294967295)throw new RangeError("requested too many random bytes");var r=a.allocUnsafe(e);if(0<e)if(65536<e)for(var i=0;i<e;i+=65536)o.getRandomValues(r.slice(i,i+65536));else o.getRandomValues(r);return "function"==typeof t?n.nextTick(function(){t(null,r);}):r}:function(){throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11")};}).call(this);}).call(this,e("_process"),"undefined"==typeof commonjsGlobal?"undefined"==typeof self?"undefined"==typeof window?{}:window:self:commonjsGlobal);},{_process:12,"safe-buffer":30}],15:[function(e,t){function n(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t;}function r(e,t,r){function a(e,n,r){return "string"==typeof t?t:t(e,n,r)}r||(r=Error);var o=function(e){function t(t,n,r){return e.call(this,a(t,n,r))||this}return n(t,e),t}(r);o.prototype.name=r.name,o.prototype.code=e,s[e]=o;}function a(e,t){if(Array.isArray(e)){var n=e.length;return e=e.map(function(e){return e+""}),2<n?"one of ".concat(t," ").concat(e.slice(0,n-1).join(", "),", or ")+e[n-1]:2===n?"one of ".concat(t," ").concat(e[0]," or ").concat(e[1]):"of ".concat(t," ").concat(e[0])}return "of ".concat(t," ").concat(e+"")}function o(e,t,n){return e.substr(!n||0>n?0:+n,t.length)===t}function i(e,t,n){return (void 0===n||n>e.length)&&(n=e.length),e.substring(n-t.length,n)===t}function d(e,t,n){return "number"!=typeof n&&(n=0),!(n+t.length>e.length)&&-1!==e.indexOf(t,n)}var s={};r("ERR_INVALID_OPT_VALUE",function(e,t){return "The value \""+t+"\" is invalid for option \""+e+"\""},TypeError),r("ERR_INVALID_ARG_TYPE",function(e,t,n){var r;"string"==typeof t&&o(t,"not ")?(r="must not be",t=t.replace(/^not /,"")):r="must be";var s;if(i(e," argument"))s="The ".concat(e," ").concat(r," ").concat(a(t,"type"));else {var l=d(e,".")?"property":"argument";s="The \"".concat(e,"\" ").concat(l," ").concat(r," ").concat(a(t,"type"));}return s+=". Received type ".concat(typeof n),s},TypeError),r("ERR_STREAM_PUSH_AFTER_EOF","stream.push() after EOF"),r("ERR_METHOD_NOT_IMPLEMENTED",function(e){return "The "+e+" method is not implemented"}),r("ERR_STREAM_PREMATURE_CLOSE","Premature close"),r("ERR_STREAM_DESTROYED",function(e){return "Cannot call "+e+" after a stream was destroyed"}),r("ERR_MULTIPLE_CALLBACK","Callback called multiple times"),r("ERR_STREAM_CANNOT_PIPE","Cannot pipe, not readable"),r("ERR_STREAM_WRITE_AFTER_END","write after end"),r("ERR_STREAM_NULL_VALUES","May not write null values to stream",TypeError),r("ERR_UNKNOWN_ENCODING",function(e){return "Unknown encoding: "+e},TypeError),r("ERR_STREAM_UNSHIFT_AFTER_END_EVENT","stream.unshift() after end event"),t.exports.codes=s;},{}],16:[function(e,t){(function(n){(function(){function r(e){return this instanceof r?void(d.call(this,e),s.call(this,e),this.allowHalfOpen=!0,e&&(!1===e.readable&&(this.readable=!1),!1===e.writable&&(this.writable=!1),!1===e.allowHalfOpen&&(this.allowHalfOpen=!1,this.once("end",a)))):new r(e)}function a(){this._writableState.ended||n.nextTick(o,this);}function o(e){e.end();}var i=Object.keys||function(e){var t=[];for(var n in e)t.push(n);return t};t.exports=r;var d=e("./_stream_readable"),s=e("./_stream_writable");e("inherits")(r,d);for(var l,c=i(s.prototype),u=0;u<c.length;u++)l=c[u],r.prototype[l]||(r.prototype[l]=s.prototype[l]);Object.defineProperty(r.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(r.prototype,"writableBuffer",{enumerable:!1,get:function(){return this._writableState&&this._writableState.getBuffer()}}),Object.defineProperty(r.prototype,"writableLength",{enumerable:!1,get:function(){return this._writableState.length}}),Object.defineProperty(r.prototype,"destroyed",{enumerable:!1,get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&this._readableState.destroyed&&this._writableState.destroyed},set:function(e){void 0===this._readableState||void 0===this._writableState||(this._readableState.destroyed=e,this._writableState.destroyed=e);}});}).call(this);}).call(this,e("_process"));},{"./_stream_readable":18,"./_stream_writable":20,_process:12,inherits:10}],17:[function(e,t){function n(e){return this instanceof n?void r.call(this,e):new n(e)}t.exports=n;var r=e("./_stream_transform");e("inherits")(n,r),n.prototype._transform=function(e,t,n){n(null,e);};},{"./_stream_transform":19,inherits:10}],18:[function(e,t){(function(n,r){(function(){function a(e){return M.from(e)}function o(e){return M.isBuffer(e)||e instanceof D}function i(e,t,n){return "function"==typeof e.prependListener?e.prependListener(t,n):void(e._events&&e._events[t]?Array.isArray(e._events[t])?e._events[t].unshift(n):e._events[t]=[n,e._events[t]]:e.on(t,n))}function d(t,n,r){A=A||e("./_stream_duplex"),t=t||{},"boolean"!=typeof r&&(r=n instanceof A),this.objectMode=!!t.objectMode,r&&(this.objectMode=this.objectMode||!!t.readableObjectMode),this.highWaterMark=H(this,t,"readableHighWaterMark",r),this.buffer=new j,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.paused=!0,this.emitClose=!1!==t.emitClose,this.autoDestroy=!!t.autoDestroy,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(!O&&(O=e("string_decoder/").StringDecoder),this.decoder=new O(t.encoding),this.encoding=t.encoding);}function s(t){if(A=A||e("./_stream_duplex"),!(this instanceof s))return new s(t);var n=this instanceof A;this._readableState=new d(t,this,n),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),P.call(this);}function l(e,t,n,r,o){x("readableAddChunk",t);var i=e._readableState;if(null===t)i.reading=!1,g(e,i);else {var d;if(o||(d=u(i,t)),d)X(e,d);else if(!(i.objectMode||t&&0<t.length))r||(i.reading=!1,m(e,i));else if("string"==typeof t||i.objectMode||Object.getPrototypeOf(t)===M.prototype||(t=a(t)),r)i.endEmitted?X(e,new K):c(e,i,t,!0);else if(i.ended)X(e,new Y);else {if(i.destroyed)return !1;i.reading=!1,i.decoder&&!n?(t=i.decoder.write(t),i.objectMode||0!==t.length?c(e,i,t,!1):m(e,i)):c(e,i,t,!1);}}return !i.ended&&(i.length<i.highWaterMark||0===i.length)}function c(e,t,n,r){t.flowing&&0===t.length&&!t.sync?(t.awaitDrain=0,e.emit("data",n)):(t.length+=t.objectMode?1:n.length,r?t.buffer.unshift(n):t.buffer.push(n),t.needReadable&&h(e)),m(e,t);}function u(e,t){var n;return o(t)||"string"==typeof t||void 0===t||e.objectMode||(n=new G("chunk",["string","Buffer","Uint8Array"],t)),n}function p(e){return 1073741824<=e?e=1073741824:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}function f(e,t){return 0>=e||0===t.length&&t.ended?0:t.objectMode?1:e===e?(e>t.highWaterMark&&(t.highWaterMark=p(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0)):t.flowing&&t.length?t.buffer.head.data.length:t.length}function g(e,t){if(x("onEofChunk"),!t.ended){if(t.decoder){var n=t.decoder.end();n&&n.length&&(t.buffer.push(n),t.length+=t.objectMode?1:n.length);}t.ended=!0,t.sync?h(e):(t.needReadable=!1,!t.emittedReadable&&(t.emittedReadable=!0,_(e)));}}function h(e){var t=e._readableState;x("emitReadable",t.needReadable,t.emittedReadable),t.needReadable=!1,t.emittedReadable||(x("emitReadable",t.flowing),t.emittedReadable=!0,n.nextTick(_,e));}function _(e){var t=e._readableState;x("emitReadable_",t.destroyed,t.length,t.ended),!t.destroyed&&(t.length||t.ended)&&(e.emit("readable"),t.emittedReadable=!1),t.needReadable=!t.flowing&&!t.ended&&t.length<=t.highWaterMark,S(e);}function m(e,t){t.readingMore||(t.readingMore=!0,n.nextTick(b,e,t));}function b(e,t){for(;!t.reading&&!t.ended&&(t.length<t.highWaterMark||t.flowing&&0===t.length);){var n=t.length;if(x("maybeReadMore read 0"),e.read(0),n===t.length)break}t.readingMore=!1;}function y(e){return function(){var t=e._readableState;x("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&I(e,"data")&&(t.flowing=!0,S(e));}}function C(e){var t=e._readableState;t.readableListening=0<e.listenerCount("readable"),t.resumeScheduled&&!t.paused?t.flowing=!0:0<e.listenerCount("data")&&e.resume();}function w(e){x("readable nexttick read 0"),e.read(0);}function R(e,t){t.resumeScheduled||(t.resumeScheduled=!0,n.nextTick(E,e,t));}function E(e,t){x("resume",t.reading),t.reading||e.read(0),t.resumeScheduled=!1,e.emit("resume"),S(e),t.flowing&&!t.reading&&e.read(0);}function S(e){var t=e._readableState;for(x("flow",t.flowing);t.flowing&&null!==e.read(););}function k(e,t){if(0===t.length)return null;var n;return t.objectMode?n=t.buffer.shift():!e||e>=t.length?(n=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.first():t.buffer.concat(t.length),t.buffer.clear()):n=t.buffer.consume(e,t.decoder),n}function T(e){var t=e._readableState;x("endReadable",t.endEmitted),t.endEmitted||(t.ended=!0,n.nextTick(v,t,e));}function v(e,t){if(x("endReadableNT",e.endEmitted,e.length),!e.endEmitted&&0===e.length&&(e.endEmitted=!0,t.readable=!1,t.emit("end"),e.autoDestroy)){var n=t._writableState;(!n||n.autoDestroy&&n.finished)&&t.destroy();}}function L(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1}t.exports=s;var A;s.ReadableState=d;var x,N=e("events").EventEmitter,I=function(e,t){return e.listeners(t).length},P=e("./internal/streams/stream"),M=e("buffer").Buffer,D=r.Uint8Array||function(){},F=e("util");x=F&&F.debuglog?F.debuglog("stream"):function(){};var O,B,U,j=e("./internal/streams/buffer_list"),q=e("./internal/streams/destroy"),W=e("./internal/streams/state"),H=W.getHighWaterMark,V=e("../errors").codes,G=V.ERR_INVALID_ARG_TYPE,Y=V.ERR_STREAM_PUSH_AFTER_EOF,z=V.ERR_METHOD_NOT_IMPLEMENTED,K=V.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;e("inherits")(s,P);var X=q.errorOrDestroy,$=["error","close","destroy","pause","resume"];Object.defineProperty(s.prototype,"destroyed",{enumerable:!1,get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e);}}),s.prototype.destroy=q.destroy,s.prototype._undestroy=q.undestroy,s.prototype._destroy=function(e,t){t(e);},s.prototype.push=function(e,t){var n,r=this._readableState;return r.objectMode?n=!0:"string"==typeof e&&(t=t||r.defaultEncoding,t!==r.encoding&&(e=M.from(e,t),t=""),n=!0),l(this,e,t,!1,n)},s.prototype.unshift=function(e){return l(this,e,null,!0,!1)},s.prototype.isPaused=function(){return !1===this._readableState.flowing},s.prototype.setEncoding=function(t){O||(O=e("string_decoder/").StringDecoder);var n=new O(t);this._readableState.decoder=n,this._readableState.encoding=this._readableState.decoder.encoding;for(var r=this._readableState.buffer.head,a="";null!==r;)a+=n.write(r.data),r=r.next;return this._readableState.buffer.clear(),""!==a&&this._readableState.buffer.push(a),this._readableState.length=a.length,this};s.prototype.read=function(e){x("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&((0===t.highWaterMark?0<t.length:t.length>=t.highWaterMark)||t.ended))return x("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?T(this):h(this),null;if(e=f(e,t),0===e&&t.ended)return 0===t.length&&T(this),null;var a=t.needReadable;x("need readable",a),(0===t.length||t.length-e<t.highWaterMark)&&(a=!0,x("length less than watermark",a)),t.ended||t.reading?(a=!1,x("reading or ended",a)):a&&(x("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,!t.reading&&(e=f(r,t)));var o;return o=0<e?k(e,t):null,null===o?(t.needReadable=t.length<=t.highWaterMark,e=0):(t.length-=e,t.awaitDrain=0),0===t.length&&(!t.ended&&(t.needReadable=!0),r!==e&&t.ended&&T(this)),null!==o&&this.emit("data",o),o},s.prototype._read=function(){X(this,new z("_read()"));},s.prototype.pipe=function(e,t){function r(e,t){x("onunpipe"),e===p&&t&&!1===t.hasUnpiped&&(t.hasUnpiped=!0,o());}function a(){x("onend"),e.end();}function o(){x("cleanup"),e.removeListener("close",l),e.removeListener("finish",c),e.removeListener("drain",_),e.removeListener("error",s),e.removeListener("unpipe",r),p.removeListener("end",a),p.removeListener("end",u),p.removeListener("data",d),m=!0,f.awaitDrain&&(!e._writableState||e._writableState.needDrain)&&_();}function d(t){x("ondata");var n=e.write(t);x("dest.write",n),!1===n&&((1===f.pipesCount&&f.pipes===e||1<f.pipesCount&&-1!==L(f.pipes,e))&&!m&&(x("false write response, pause",f.awaitDrain),f.awaitDrain++),p.pause());}function s(t){x("onerror",t),u(),e.removeListener("error",s),0===I(e,"error")&&X(e,t);}function l(){e.removeListener("finish",c),u();}function c(){x("onfinish"),e.removeListener("close",l),u();}function u(){x("unpipe"),p.unpipe(e);}var p=this,f=this._readableState;switch(f.pipesCount){case 0:f.pipes=e;break;case 1:f.pipes=[f.pipes,e];break;default:f.pipes.push(e);}f.pipesCount+=1,x("pipe count=%d opts=%j",f.pipesCount,t);var g=(!t||!1!==t.end)&&e!==n.stdout&&e!==n.stderr,h=g?a:u;f.endEmitted?n.nextTick(h):p.once("end",h),e.on("unpipe",r);var _=y(p);e.on("drain",_);var m=!1;return p.on("data",d),i(e,"error",s),e.once("close",l),e.once("finish",c),e.emit("pipe",p),f.flowing||(x("pipe resume"),p.resume()),e},s.prototype.unpipe=function(e){var t=this._readableState,n={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes?this:(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,n),this);if(!e){var r=t.pipes,a=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var o=0;o<a;o++)r[o].emit("unpipe",this,{hasUnpiped:!1});return this}var d=L(t.pipes,e);return -1===d?this:(t.pipes.splice(d,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,n),this)},s.prototype.on=function(e,t){var r=P.prototype.on.call(this,e,t),a=this._readableState;return "data"===e?(a.readableListening=0<this.listenerCount("readable"),!1!==a.flowing&&this.resume()):"readable"==e&&!a.endEmitted&&!a.readableListening&&(a.readableListening=a.needReadable=!0,a.flowing=!1,a.emittedReadable=!1,x("on readable",a.length,a.reading),a.length?h(this):!a.reading&&n.nextTick(w,this)),r},s.prototype.addListener=s.prototype.on,s.prototype.removeListener=function(e,t){var r=P.prototype.removeListener.call(this,e,t);return "readable"===e&&n.nextTick(C,this),r},s.prototype.removeAllListeners=function(e){var t=P.prototype.removeAllListeners.apply(this,arguments);return ("readable"===e||void 0===e)&&n.nextTick(C,this),t},s.prototype.resume=function(){var e=this._readableState;return e.flowing||(x("resume"),e.flowing=!e.readableListening,R(this,e)),e.paused=!1,this},s.prototype.pause=function(){return x("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(x("pause"),this._readableState.flowing=!1,this.emit("pause")),this._readableState.paused=!0,this},s.prototype.wrap=function(e){var t=this,r=this._readableState,a=!1;for(var o in e.on("end",function(){if(x("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e);}t.push(null);}),e.on("data",function(n){if((x("wrapped data"),r.decoder&&(n=r.decoder.write(n)),!(r.objectMode&&(null===n||void 0===n)))&&(r.objectMode||n&&n.length)){var o=t.push(n);o||(a=!0,e.pause());}}),e)void 0===this[o]&&"function"==typeof e[o]&&(this[o]=function(t){return function(){return e[t].apply(e,arguments)}}(o));for(var i=0;i<$.length;i++)e.on($[i],this.emit.bind(this,$[i]));return this._read=function(t){x("wrapped _read",t),a&&(a=!1,e.resume());},this},"function"==typeof Symbol&&(s.prototype[Symbol.asyncIterator]=function(){return void 0===B&&(B=e("./internal/streams/async_iterator")),B(this)}),Object.defineProperty(s.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),Object.defineProperty(s.prototype,"readableBuffer",{enumerable:!1,get:function(){return this._readableState&&this._readableState.buffer}}),Object.defineProperty(s.prototype,"readableFlowing",{enumerable:!1,get:function(){return this._readableState.flowing},set:function(e){this._readableState&&(this._readableState.flowing=e);}}),s._fromList=k,Object.defineProperty(s.prototype,"readableLength",{enumerable:!1,get:function(){return this._readableState.length}}),"function"==typeof Symbol&&(s.from=function(t,n){return void 0===U&&(U=e("./internal/streams/from")),U(s,t,n)});}).call(this);}).call(this,e("_process"),"undefined"==typeof commonjsGlobal?"undefined"==typeof self?"undefined"==typeof window?{}:window:self:commonjsGlobal);},{"../errors":15,"./_stream_duplex":16,"./internal/streams/async_iterator":21,"./internal/streams/buffer_list":22,"./internal/streams/destroy":23,"./internal/streams/from":25,"./internal/streams/state":27,"./internal/streams/stream":28,_process:12,buffer:3,events:4,inherits:10,"string_decoder/":31,util:2}],19:[function(e,t){function n(e,t){var n=this._transformState;n.transforming=!1;var r=n.writecb;if(null===r)return this.emit("error",new s);n.writechunk=null,n.writecb=null,null!=t&&this.push(t),r(e);var a=this._readableState;a.reading=!1,(a.needReadable||a.length<a.highWaterMark)&&this._read(a.highWaterMark);}function r(e){return this instanceof r?void(u.call(this,e),this._transformState={afterTransform:n.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",a)):new r(e)}function a(){var e=this;"function"!=typeof this._flush||this._readableState.destroyed?o(this,null,null):this._flush(function(t,n){o(e,t,n);});}function o(e,t,n){if(t)return e.emit("error",t);if(null!=n&&e.push(n),e._writableState.length)throw new c;if(e._transformState.transforming)throw new l;return e.push(null)}t.exports=r;var i=e("../errors").codes,d=i.ERR_METHOD_NOT_IMPLEMENTED,s=i.ERR_MULTIPLE_CALLBACK,l=i.ERR_TRANSFORM_ALREADY_TRANSFORMING,c=i.ERR_TRANSFORM_WITH_LENGTH_0,u=e("./_stream_duplex");e("inherits")(r,u),r.prototype.push=function(e,t){return this._transformState.needTransform=!1,u.prototype.push.call(this,e,t)},r.prototype._transform=function(e,t,n){n(new d("_transform()"));},r.prototype._write=function(e,t,n){var r=this._transformState;if(r.writecb=n,r.writechunk=e,r.writeencoding=t,!r.transforming){var a=this._readableState;(r.needTransform||a.needReadable||a.length<a.highWaterMark)&&this._read(a.highWaterMark);}},r.prototype._read=function(){var e=this._transformState;null===e.writechunk||e.transforming?e.needTransform=!0:(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform));},r.prototype._destroy=function(e,t){u.prototype._destroy.call(this,e,function(e){t(e);});};},{"../errors":15,"./_stream_duplex":16,inherits:10}],20:[function(e,t){(function(n,r){(function(){function a(e){var t=this;this.next=null,this.entry=null,this.finish=function(){T(t,e);};}function o(e){return x.from(e)}function i(e){return x.isBuffer(e)||e instanceof N}function d(){}function s(t,n,r){v=v||e("./_stream_duplex"),t=t||{},"boolean"!=typeof r&&(r=n instanceof v),this.objectMode=!!t.objectMode,r&&(this.objectMode=this.objectMode||!!t.writableObjectMode),this.highWaterMark=M(this,t,"writableHighWaterMark",r),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var o=!1===t.decodeStrings;this.decodeStrings=!o,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){m(n,e);},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.emitClose=!1!==t.emitClose,this.autoDestroy=!!t.autoDestroy,this.bufferedRequestCount=0,this.corkedRequestsFree=new a(this);}function l(t){v=v||e("./_stream_duplex");var n=this instanceof v;return n||G.call(l,this)?void(this._writableState=new s(t,this,n),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),A.call(this)):new l(t)}function c(e,t){var r=new W;V(e,r),n.nextTick(t,r);}function u(e,t,r,a){var o;return null===r?o=new q:"string"!=typeof r&&!t.objectMode&&(o=new F("chunk",["string","Buffer"],r)),!o||(V(e,o),n.nextTick(a,o),!1)}function p(e,t,n){return e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=x.from(t,n)),t}function f(e,t,n,r,a,o){if(!n){var i=p(t,r,a);r!==i&&(n=!0,a="buffer",r=i);}var d=t.objectMode?1:r.length;t.length+=d;var s=t.length<t.highWaterMark;if(s||(t.needDrain=!0),t.writing||t.corked){var l=t.lastBufferedRequest;t.lastBufferedRequest={chunk:r,encoding:a,isBuf:n,callback:o,next:null},l?l.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1;}else g(e,t,!1,d,r,a,o);return s}function g(e,t,n,r,a,o,i){t.writelen=r,t.writecb=i,t.writing=!0,t.sync=!0,t.destroyed?t.onwrite(new j("write")):n?e._writev(a,t.onwrite):e._write(a,o,t.onwrite),t.sync=!1;}function h(e,t,r,a,o){--t.pendingcb,r?(n.nextTick(o,a),n.nextTick(S,e,t),e._writableState.errorEmitted=!0,V(e,a)):(o(a),e._writableState.errorEmitted=!0,V(e,a),S(e,t));}function _(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0;}function m(e,t){var r=e._writableState,a=r.sync,o=r.writecb;if("function"!=typeof o)throw new B;if(_(r),t)h(e,r,a,t,o);else {var i=w(r)||e.destroyed;i||r.corked||r.bufferProcessing||!r.bufferedRequest||C(e,r),a?n.nextTick(b,e,r,i,o):b(e,r,i,o);}}function b(e,t,n,r){n||y(e,t),t.pendingcb--,r(),S(e,t);}function y(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"));}function C(e,t){t.bufferProcessing=!0;var n=t.bufferedRequest;if(e._writev&&n&&n.next){var r=t.bufferedRequestCount,o=Array(r),i=t.corkedRequestsFree;i.entry=n;for(var d=0,s=!0;n;)o[d]=n,n.isBuf||(s=!1),n=n.next,d+=1;o.allBuffers=s,g(e,t,!0,t.length,o,"",i.finish),t.pendingcb++,t.lastBufferedRequest=null,i.next?(t.corkedRequestsFree=i.next,i.next=null):t.corkedRequestsFree=new a(t),t.bufferedRequestCount=0;}else {for(;n;){var l=n.chunk,c=n.encoding,u=n.callback,p=t.objectMode?1:l.length;if(g(e,t,!1,p,l,c,u),n=n.next,t.bufferedRequestCount--,t.writing)break}null===n&&(t.lastBufferedRequest=null);}t.bufferedRequest=n,t.bufferProcessing=!1;}function w(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function R(e,t){e._final(function(n){t.pendingcb--,n&&V(e,n),t.prefinished=!0,e.emit("prefinish"),S(e,t);});}function E(e,t){t.prefinished||t.finalCalled||("function"!=typeof e._final||t.destroyed?(t.prefinished=!0,e.emit("prefinish")):(t.pendingcb++,t.finalCalled=!0,n.nextTick(R,e,t)));}function S(e,t){var n=w(t);if(n&&(E(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"),t.autoDestroy))){var r=e._readableState;(!r||r.autoDestroy&&r.endEmitted)&&e.destroy();}return n}function k(e,t,r){t.ending=!0,S(e,t),r&&(t.finished?n.nextTick(r):e.once("finish",r)),t.ended=!0,e.writable=!1;}function T(e,t,n){var r=e.entry;for(e.entry=null;r;){var a=r.callback;t.pendingcb--,a(n),r=r.next;}t.corkedRequestsFree.next=e;}t.exports=l;var v;l.WritableState=s;var L={deprecate:e("util-deprecate")},A=e("./internal/streams/stream"),x=e("buffer").Buffer,N=r.Uint8Array||function(){},I=e("./internal/streams/destroy"),P=e("./internal/streams/state"),M=P.getHighWaterMark,D=e("../errors").codes,F=D.ERR_INVALID_ARG_TYPE,O=D.ERR_METHOD_NOT_IMPLEMENTED,B=D.ERR_MULTIPLE_CALLBACK,U=D.ERR_STREAM_CANNOT_PIPE,j=D.ERR_STREAM_DESTROYED,q=D.ERR_STREAM_NULL_VALUES,W=D.ERR_STREAM_WRITE_AFTER_END,H=D.ERR_UNKNOWN_ENCODING,V=I.errorOrDestroy;e("inherits")(l,A),s.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(s.prototype,"buffer",{get:L.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")});}catch(e){}}();var G;"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(G=Function.prototype[Symbol.hasInstance],Object.defineProperty(l,Symbol.hasInstance,{value:function(e){return !!G.call(this,e)||!(this!==l)&&e&&e._writableState instanceof s}})):G=function(e){return e instanceof this},l.prototype.pipe=function(){V(this,new U);},l.prototype.write=function(e,t,n){var r=this._writableState,a=!1,s=!r.objectMode&&i(e);return s&&!x.isBuffer(e)&&(e=o(e)),"function"==typeof t&&(n=t,t=null),s?t="buffer":!t&&(t=r.defaultEncoding),"function"!=typeof n&&(n=d),r.ending?c(this,n):(s||u(this,r,e,n))&&(r.pendingcb++,a=f(this,r,s,e,t,n)),a},l.prototype.cork=function(){this._writableState.corked++;},l.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,!e.writing&&!e.corked&&!e.bufferProcessing&&e.bufferedRequest&&C(this,e));},l.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(-1<["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())))throw new H(e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(l.prototype,"writableBuffer",{enumerable:!1,get:function(){return this._writableState&&this._writableState.getBuffer()}}),Object.defineProperty(l.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),l.prototype._write=function(e,t,n){n(new O("_write()"));},l.prototype._writev=null,l.prototype.end=function(e,t,n){var r=this._writableState;return "function"==typeof e?(n=e,e=null,t=null):"function"==typeof t&&(n=t,t=null),null!==e&&void 0!==e&&this.write(e,t),r.corked&&(r.corked=1,this.uncork()),r.ending||k(this,r,n),this},Object.defineProperty(l.prototype,"writableLength",{enumerable:!1,get:function(){return this._writableState.length}}),Object.defineProperty(l.prototype,"destroyed",{enumerable:!1,get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e);}}),l.prototype.destroy=I.destroy,l.prototype._undestroy=I.undestroy,l.prototype._destroy=function(e,t){t(e);};}).call(this);}).call(this,e("_process"),"undefined"==typeof commonjsGlobal?"undefined"==typeof self?"undefined"==typeof window?{}:window:self:commonjsGlobal);},{"../errors":15,"./_stream_duplex":16,"./internal/streams/destroy":23,"./internal/streams/state":27,"./internal/streams/stream":28,_process:12,buffer:3,inherits:10,"util-deprecate":32}],21:[function(e,t){(function(n){(function(){function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){return {value:e,done:t}}function o(e){var t=e[c];if(null!==t){var n=e[_].read();null!==n&&(e[g]=null,e[c]=null,e[u]=null,t(a(n,!1)));}}function i(e){n.nextTick(o,e);}function d(e,t){return function(n,r){e.then(function(){return t[f]?void n(a(void 0,!0)):void t[h](n,r)},r);}}var s,l=e("./end-of-stream"),c=Symbol("lastResolve"),u=Symbol("lastReject"),p=Symbol("error"),f=Symbol("ended"),g=Symbol("lastPromise"),h=Symbol("handlePromise"),_=Symbol("stream"),m=Object.getPrototypeOf(function(){}),b=Object.setPrototypeOf((s={get stream(){return this[_]},next:function(){var e=this,t=this[p];if(null!==t)return Promise.reject(t);if(this[f])return Promise.resolve(a(void 0,!0));if(this[_].destroyed)return new Promise(function(t,r){n.nextTick(function(){e[p]?r(e[p]):t(a(void 0,!0));});});var r,o=this[g];if(o)r=new Promise(d(o,this));else {var i=this[_].read();if(null!==i)return Promise.resolve(a(i,!1));r=new Promise(this[h]);}return this[g]=r,r}},r(s,Symbol.asyncIterator,function(){return this}),r(s,"return",function(){var e=this;return new Promise(function(t,n){e[_].destroy(null,function(e){return e?void n(e):void t(a(void 0,!0))});})}),s),m);t.exports=function(e){var t,n=Object.create(b,(t={},r(t,_,{value:e,writable:!0}),r(t,c,{value:null,writable:!0}),r(t,u,{value:null,writable:!0}),r(t,p,{value:null,writable:!0}),r(t,f,{value:e._readableState.endEmitted,writable:!0}),r(t,h,{value:function(e,t){var r=n[_].read();r?(n[g]=null,n[c]=null,n[u]=null,e(a(r,!1))):(n[c]=e,n[u]=t);},writable:!0}),t));return n[g]=null,l(e,function(e){if(e&&"ERR_STREAM_PREMATURE_CLOSE"!==e.code){var t=n[u];return null!==t&&(n[g]=null,n[c]=null,n[u]=null,t(e)),void(n[p]=e)}var r=n[c];null!==r&&(n[g]=null,n[c]=null,n[u]=null,r(a(void 0,!0))),n[f]=!0;}),e.on("readable",i.bind(null,n)),n};}).call(this);}).call(this,e("_process"));},{"./end-of-stream":24,_process:12}],22:[function(e,t){function n(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r);}return n}function r(e){for(var t,r=1;r<arguments.length;r++)t=null==arguments[r]?{}:arguments[r],r%2?n(Object(t),!0).forEach(function(n){a(e,n,t[n]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):n(Object(t)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n));});return e}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var n,r=0;r<t.length;r++)n=t[r],n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}function d(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}function s(e,t,n){u.prototype.copy.call(e,t,n);}var l=e("buffer"),u=l.Buffer,p=e("util"),f=p.inspect,g=f&&f.custom||"inspect";t.exports=function(){function e(){o(this,e),this.head=null,this.tail=null,this.length=0;}return d(e,[{key:"push",value:function(e){var t={data:e,next:null};0<this.length?this.tail.next=t:this.head=t,this.tail=t,++this.length;}},{key:"unshift",value:function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length;}},{key:"shift",value:function(){if(0!==this.length){var e=this.head.data;return this.head=1===this.length?this.tail=null:this.head.next,--this.length,e}}},{key:"clear",value:function(){this.head=this.tail=null,this.length=0;}},{key:"join",value:function(e){if(0===this.length)return "";for(var t=this.head,n=""+t.data;t=t.next;)n+=e+t.data;return n}},{key:"concat",value:function(e){if(0===this.length)return u.alloc(0);for(var t=u.allocUnsafe(e>>>0),n=this.head,r=0;n;)s(n.data,t,r),r+=n.data.length,n=n.next;return t}},{key:"consume",value:function(e,t){var n;return e<this.head.data.length?(n=this.head.data.slice(0,e),this.head.data=this.head.data.slice(e)):e===this.head.data.length?n=this.shift():n=t?this._getString(e):this._getBuffer(e),n}},{key:"first",value:function(){return this.head.data}},{key:"_getString",value:function(e){var t=this.head,r=1,a=t.data;for(e-=a.length;t=t.next;){var o=t.data,i=e>o.length?o.length:e;if(a+=i===o.length?o:o.slice(0,e),e-=i,0===e){i===o.length?(++r,this.head=t.next?t.next:this.tail=null):(this.head=t,t.data=o.slice(i));break}++r;}return this.length-=r,a}},{key:"_getBuffer",value:function(e){var t=u.allocUnsafe(e),r=this.head,a=1;for(r.data.copy(t),e-=r.data.length;r=r.next;){var o=r.data,i=e>o.length?o.length:e;if(o.copy(t,t.length-e,0,i),e-=i,0===e){i===o.length?(++a,this.head=r.next?r.next:this.tail=null):(this.head=r,r.data=o.slice(i));break}++a;}return this.length-=a,t}},{key:g,value:function(e,t){return f(this,r({},t,{depth:0,customInspect:!1}))}}]),e}();},{buffer:3,util:2}],23:[function(e,t){(function(e){(function(){function n(e,t){a(e,t),r(e);}function r(e){e._writableState&&!e._writableState.emitClose||e._readableState&&!e._readableState.emitClose||e.emit("close");}function a(e,t){e.emit("error",t);}t.exports={destroy:function(t,o){var i=this,d=this._readableState&&this._readableState.destroyed,s=this._writableState&&this._writableState.destroyed;return d||s?(o?o(t):t&&(this._writableState?!this._writableState.errorEmitted&&(this._writableState.errorEmitted=!0,e.nextTick(a,this,t)):e.nextTick(a,this,t)),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(t||null,function(t){!o&&t?i._writableState?i._writableState.errorEmitted?e.nextTick(r,i):(i._writableState.errorEmitted=!0,e.nextTick(n,i,t)):e.nextTick(n,i,t):o?(e.nextTick(r,i),o(t)):e.nextTick(r,i);}),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finalCalled=!1,this._writableState.prefinished=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1);},errorOrDestroy:function(e,t){var n=e._readableState,r=e._writableState;n&&n.autoDestroy||r&&r.autoDestroy?e.destroy(t):e.emit("error",t);}};}).call(this);}).call(this,e("_process"));},{_process:12}],24:[function(e,t){function n(e){var t=!1;return function(){if(!t){t=!0;for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];e.apply(this,r);}}}function r(){}function a(e){return e.setHeader&&"function"==typeof e.abort}function o(e,t,d){if("function"==typeof t)return o(e,null,t);t||(t={}),d=n(d||r);var s=t.readable||!1!==t.readable&&e.readable,l=t.writable||!1!==t.writable&&e.writable,c=function(){e.writable||p();},u=e._writableState&&e._writableState.finished,p=function(){l=!1,u=!0,s||d.call(e);},f=e._readableState&&e._readableState.endEmitted,g=function(){s=!1,f=!0,l||d.call(e);},h=function(t){d.call(e,t);},_=function(){var t;return s&&!f?(e._readableState&&e._readableState.ended||(t=new i),d.call(e,t)):l&&!u?(e._writableState&&e._writableState.ended||(t=new i),d.call(e,t)):void 0},m=function(){e.req.on("finish",p);};return a(e)?(e.on("complete",p),e.on("abort",_),e.req?m():e.on("request",m)):l&&!e._writableState&&(e.on("end",c),e.on("close",c)),e.on("end",g),e.on("finish",p),!1!==t.error&&e.on("error",h),e.on("close",_),function(){e.removeListener("complete",p),e.removeListener("abort",_),e.removeListener("request",m),e.req&&e.req.removeListener("finish",p),e.removeListener("end",c),e.removeListener("close",c),e.removeListener("finish",p),e.removeListener("end",g),e.removeListener("error",h),e.removeListener("close",_);}}var i=e("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;t.exports=o;},{"../../../errors":15}],25:[function(e,t){t.exports=function(){throw new Error("Readable.from is not available in the browser")};},{}],26:[function(e,t){function n(e){var t=!1;return function(){t||(t=!0,e.apply(void 0,arguments));}}function r(e){if(e)throw e}function a(e){return e.setHeader&&"function"==typeof e.abort}function o(t,r,o,i){i=n(i);var d=!1;t.on("close",function(){d=!0;}),l===void 0&&(l=e("./end-of-stream")),l(t,{readable:r,writable:o},function(e){return e?i(e):void(d=!0,i())});var s=!1;return function(e){if(!d)return s?void 0:(s=!0,a(t)?t.abort():"function"==typeof t.destroy?t.destroy():void i(e||new p("pipe")))}}function i(e){e();}function d(e,t){return e.pipe(t)}function s(e){return e.length?"function"==typeof e[e.length-1]?e.pop():r:r}var l,c=e("../../../errors").codes,u=c.ERR_MISSING_ARGS,p=c.ERR_STREAM_DESTROYED;t.exports=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];var r=s(t);if(Array.isArray(t[0])&&(t=t[0]),2>t.length)throw new u("streams");var a,l=t.map(function(e,n){var d=n<t.length-1;return o(e,d,0<n,function(e){a||(a=e),e&&l.forEach(i),d||(l.forEach(i),r(a));})});return t.reduce(d)};},{"../../../errors":15,"./end-of-stream":24}],27:[function(e,n){function r(e,t,n){return null==e.highWaterMark?t?e[n]:null:e.highWaterMark}var a=e("../../../errors").codes.ERR_INVALID_OPT_VALUE;n.exports={getHighWaterMark:function(e,n,o,i){var d=r(n,i,o);if(null!=d){if(!(isFinite(d)&&t(d)===d)||0>d){var s=i?o:"highWaterMark";throw new a(s,d)}return t(d)}return e.objectMode?16:16384}};},{"../../../errors":15}],28:[function(e,t){t.exports=e("events").EventEmitter;},{events:4}],29:[function(e,t,n){n=t.exports=e("./lib/_stream_readable.js"),n.Stream=n,n.Readable=n,n.Writable=e("./lib/_stream_writable.js"),n.Duplex=e("./lib/_stream_duplex.js"),n.Transform=e("./lib/_stream_transform.js"),n.PassThrough=e("./lib/_stream_passthrough.js"),n.finished=e("./lib/internal/streams/end-of-stream.js"),n.pipeline=e("./lib/internal/streams/pipeline.js");},{"./lib/_stream_duplex.js":16,"./lib/_stream_passthrough.js":17,"./lib/_stream_readable.js":18,"./lib/_stream_transform.js":19,"./lib/_stream_writable.js":20,"./lib/internal/streams/end-of-stream.js":24,"./lib/internal/streams/pipeline.js":26}],30:[function(e,t,n){function r(e,t){for(var n in e)t[n]=e[n];}function a(e,t,n){return i(e,t,n)}/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */var o=e("buffer"),i=o.Buffer;i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?t.exports=o:(r(o,n),n.Buffer=a),a.prototype=Object.create(i.prototype),r(i,a),a.from=function(e,t,n){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,n)},a.alloc=function(e,t,n){if("number"!=typeof e)throw new TypeError("Argument must be a number");var r=i(e);return void 0===t?r.fill(0):"string"==typeof n?r.fill(t,n):r.fill(t),r},a.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},a.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return o.SlowBuffer(e)};},{buffer:3}],31:[function(e,t,n){function r(e){if(!e)return "utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return "utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return "utf16le";case"latin1":case"binary":return "latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0;}}function a(e){var t=r(e);if("string"!=typeof t&&(m.isEncoding===b||!b(e)))throw new Error("Unknown encoding: "+e);return t||e}function o(e){this.encoding=a(e);var t;switch(this.encoding){case"utf16le":this.text=u,this.end=p,t=4;break;case"utf8":this.fillLast=c,t=4;break;case"base64":this.text=f,this.end=g,t=3;break;default:return this.write=h,void(this.end=_);}this.lastNeed=0,this.lastTotal=0,this.lastChar=m.allocUnsafe(t);}function d(e){if(127>=e)return 0;return 6==e>>5?2:14==e>>4?3:30==e>>3?4:2==e>>6?-1:-2}function s(e,t,n){var r=t.length-1;if(r<n)return 0;var a=d(t[r]);return 0<=a?(0<a&&(e.lastNeed=a-1),a):--r<n||-2===a?0:(a=d(t[r]),0<=a)?(0<a&&(e.lastNeed=a-2),a):--r<n||-2===a?0:(a=d(t[r]),0<=a?(0<a&&(2===a?a=0:e.lastNeed=a-3),a):0)}function l(e,t){if(128!=(192&t[0]))return e.lastNeed=0,"\uFFFD";if(1<e.lastNeed&&1<t.length){if(128!=(192&t[1]))return e.lastNeed=1,"\uFFFD";if(2<e.lastNeed&&2<t.length&&128!=(192&t[2]))return e.lastNeed=2,"\uFFFD"}}function c(e){var t=this.lastTotal-this.lastNeed,n=l(this,e);return void 0===n?this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):void(e.copy(this.lastChar,t,0,e.length),this.lastNeed-=e.length):n}function u(e,t){if(0==(e.length-t)%2){var n=e.toString("utf16le",t);if(n){var r=n.charCodeAt(n.length-1);if(55296<=r&&56319>=r)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],n.slice(0,-1)}return n}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function p(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var n=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,n)}return t}function f(e,t){var r=(e.length-t)%3;return 0==r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1==r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function g(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function h(e){return e.toString(this.encoding)}function _(e){return e&&e.length?this.write(e):""}var m=e("safe-buffer").Buffer,b=m.isEncoding||function(e){switch(e=""+e,e&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return !0;default:return !1;}};n.StringDecoder=o,o.prototype.write=function(e){if(0===e.length)return "";var t,n;if(this.lastNeed){if(t=this.fillLast(e),void 0===t)return "";n=this.lastNeed,this.lastNeed=0;}else n=0;return n<e.length?t?t+this.text(e,n):this.text(e,n):t||""},o.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"\uFFFD":t},o.prototype.text=function(e,t){var n=s(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=n;var r=e.length-(n-this.lastNeed);return e.copy(this.lastChar,0,r),e.toString("utf8",t,r)},o.prototype.fillLast=function(e){return this.lastNeed<=e.length?(e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):void(e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length)};},{"safe-buffer":30}],32:[function(e,t){(function(e){(function(){function n(t){try{if(!e.localStorage)return !1}catch(e){return !1}var n=e.localStorage[t];return null!=n&&"true"===(n+"").toLowerCase()}t.exports=function(e,t){function r(){if(!a){if(n("throwDeprecation"))throw new Error(t);else n("traceDeprecation")?console.trace(t):console.warn(t);a=!0;}return e.apply(this,arguments)}if(n("noDeprecation"))return e;var a=!1;return r};}).call(this);}).call(this,"undefined"==typeof commonjsGlobal?"undefined"==typeof self?"undefined"==typeof window?{}:window:self:commonjsGlobal);},{}],"/":[function(e,t){function n(e){return e.replace(/a=ice-options:trickle\s\n/g,"")}function r(e){console.warn(e);}/*! simple-peer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */const a=e("debug")("simple-peer"),o=e("get-browser-rtc"),i=e("randombytes"),d=e("readable-stream"),s=e("queue-microtask"),l=e("err-code"),{Buffer:c}=e("buffer"),u=65536;class p extends d.Duplex{constructor(e){if(e=Object.assign({allowHalfOpen:!1},e),super(e),this._id=i(4).toString("hex").slice(0,7),this._debug("new peer %o",e),this.channelName=e.initiator?e.channelName||i(20).toString("hex"):null,this.initiator=e.initiator||!1,this.channelConfig=e.channelConfig||p.channelConfig,this.channelNegotiated=this.channelConfig.negotiated,this.config=Object.assign({},p.config,e.config),this.offerOptions=e.offerOptions||{},this.answerOptions=e.answerOptions||{},this.sdpTransform=e.sdpTransform||(e=>e),this.streams=e.streams||(e.stream?[e.stream]:[]),this.trickle=void 0===e.trickle||e.trickle,this.allowHalfTrickle=void 0!==e.allowHalfTrickle&&e.allowHalfTrickle,this.iceCompleteTimeout=e.iceCompleteTimeout||5000,this.destroyed=!1,this.destroying=!1,this._connected=!1,this.remoteAddress=void 0,this.remoteFamily=void 0,this.remotePort=void 0,this.localAddress=void 0,this.localFamily=void 0,this.localPort=void 0,this._wrtc=e.wrtc&&"object"==typeof e.wrtc?e.wrtc:o(),!this._wrtc)if("undefined"==typeof window)throw l(new Error("No WebRTC support: Specify `opts.wrtc` option in this environment"),"ERR_WEBRTC_SUPPORT");else throw l(new Error("No WebRTC support: Not a supported browser"),"ERR_WEBRTC_SUPPORT");this._pcReady=!1,this._channelReady=!1,this._iceComplete=!1,this._iceCompleteTimer=null,this._channel=null,this._pendingCandidates=[],this._isNegotiating=!1,this._firstNegotiation=!0,this._batchedNegotiation=!1,this._queuedNegotiation=!1,this._sendersAwaitingStable=[],this._senderMap=new Map,this._closingInterval=null,this._remoteTracks=[],this._remoteStreams=[],this._chunk=null,this._cb=null,this._interval=null;try{this._pc=new this._wrtc.RTCPeerConnection(this.config);}catch(e){return void s(()=>this.destroy(l(e,"ERR_PC_CONSTRUCTOR")))}this._isReactNativeWebrtc="number"==typeof this._pc._peerConnectionId,this._pc.oniceconnectionstatechange=()=>{this._onIceStateChange();},this._pc.onicegatheringstatechange=()=>{this._onIceStateChange();},this._pc.onconnectionstatechange=()=>{this._onConnectionStateChange();},this._pc.onsignalingstatechange=()=>{this._onSignalingStateChange();},this._pc.onicecandidate=e=>{this._onIceCandidate(e);},this.initiator||this.channelNegotiated?this._setupData({channel:this._pc.createDataChannel(this.channelName,this.channelConfig)}):this._pc.ondatachannel=e=>{this._setupData(e);},this.streams&&this.streams.forEach(e=>{this.addStream(e);}),this._pc.ontrack=e=>{this._onTrack(e);},this._debug("initial negotiation"),this._needsNegotiation(),this._onFinishBound=()=>{this._onFinish();},this.once("finish",this._onFinishBound);}get bufferSize(){return this._channel&&this._channel.bufferedAmount||0}get connected(){return this._connected&&"open"===this._channel.readyState}address(){return {port:this.localPort,family:this.localFamily,address:this.localAddress}}signal(e){if(this.destroyed)throw l(new Error("cannot signal after peer is destroyed"),"ERR_SIGNALING");if("string"==typeof e)try{e=JSON.parse(e);}catch(t){e={};}this._debug("signal()"),e.renegotiate&&this.initiator&&(this._debug("got request to renegotiate"),this._needsNegotiation()),e.transceiverRequest&&this.initiator&&(this._debug("got request for transceiver"),this.addTransceiver(e.transceiverRequest.kind,e.transceiverRequest.init)),e.candidate&&(this._pc.remoteDescription&&this._pc.remoteDescription.type?this._addIceCandidate(e.candidate):this._pendingCandidates.push(e.candidate)),e.sdp&&this._pc.setRemoteDescription(new this._wrtc.RTCSessionDescription(e)).then(()=>{this.destroyed||(this._pendingCandidates.forEach(e=>{this._addIceCandidate(e);}),this._pendingCandidates=[],"offer"===this._pc.remoteDescription.type&&this._createAnswer());}).catch(e=>{this.destroy(l(e,"ERR_SET_REMOTE_DESCRIPTION"));}),e.sdp||e.candidate||e.renegotiate||e.transceiverRequest||this.destroy(l(new Error("signal() called with invalid signal data"),"ERR_SIGNALING"));}_addIceCandidate(e){const t=new this._wrtc.RTCIceCandidate(e);this._pc.addIceCandidate(t).catch(e=>{!t.address||t.address.endsWith(".local")?r("Ignoring unsupported ICE candidate."):this.destroy(l(e,"ERR_ADD_ICE_CANDIDATE"));});}send(e){this._channel.send(e);}addTransceiver(e,t){if(this._debug("addTransceiver()"),this.initiator)try{this._pc.addTransceiver(e,t),this._needsNegotiation();}catch(e){this.destroy(l(e,"ERR_ADD_TRANSCEIVER"));}else this.emit("signal",{type:"transceiverRequest",transceiverRequest:{kind:e,init:t}});}addStream(e){this._debug("addStream()"),e.getTracks().forEach(t=>{this.addTrack(t,e);});}addTrack(e,t){this._debug("addTrack()");const n=this._senderMap.get(e)||new Map;let r=n.get(t);if(!r)r=this._pc.addTrack(e,t),n.set(t,r),this._senderMap.set(e,n),this._needsNegotiation();else if(r.removed)throw l(new Error("Track has been removed. You should enable/disable tracks that you want to re-add."),"ERR_SENDER_REMOVED");else throw l(new Error("Track has already been added to that stream."),"ERR_SENDER_ALREADY_ADDED")}replaceTrack(e,t,n){this._debug("replaceTrack()");const r=this._senderMap.get(e),a=r?r.get(n):null;if(!a)throw l(new Error("Cannot replace track that was never added."),"ERR_TRACK_NOT_ADDED");t&&this._senderMap.set(t,r),null==a.replaceTrack?this.destroy(l(new Error("replaceTrack is not supported in this browser"),"ERR_UNSUPPORTED_REPLACETRACK")):a.replaceTrack(t);}removeTrack(e,t){this._debug("removeSender()");const n=this._senderMap.get(e),r=n?n.get(t):null;if(!r)throw l(new Error("Cannot remove track that was never added."),"ERR_TRACK_NOT_ADDED");try{r.removed=!0,this._pc.removeTrack(r);}catch(e){"NS_ERROR_UNEXPECTED"===e.name?this._sendersAwaitingStable.push(r):this.destroy(l(e,"ERR_REMOVE_TRACK"));}this._needsNegotiation();}removeStream(e){this._debug("removeSenders()"),e.getTracks().forEach(t=>{this.removeTrack(t,e);});}_needsNegotiation(){this._debug("_needsNegotiation"),this._batchedNegotiation||(this._batchedNegotiation=!0,s(()=>{this._batchedNegotiation=!1,this.initiator||!this._firstNegotiation?(this._debug("starting batched negotiation"),this.negotiate()):this._debug("non-initiator initial negotiation request discarded"),this._firstNegotiation=!1;}));}negotiate(){this.initiator?this._isNegotiating?(this._queuedNegotiation=!0,this._debug("already negotiating, queueing")):(this._debug("start negotiation"),setTimeout(()=>{this._createOffer();},0)):this._isNegotiating?(this._queuedNegotiation=!0,this._debug("already negotiating, queueing")):(this._debug("requesting negotiation from initiator"),this.emit("signal",{type:"renegotiate",renegotiate:!0})),this._isNegotiating=!0;}destroy(e){this._destroy(e,()=>{});}_destroy(e,t){this.destroyed||this.destroying||(this.destroying=!0,this._debug("destroying (error: %s)",e&&(e.message||e)),s(()=>{if(this.destroyed=!0,this.destroying=!1,this._debug("destroy (error: %s)",e&&(e.message||e)),this.readable=this.writable=!1,this._readableState.ended||this.push(null),this._writableState.finished||this.end(),this._connected=!1,this._pcReady=!1,this._channelReady=!1,this._remoteTracks=null,this._remoteStreams=null,this._senderMap=null,clearInterval(this._closingInterval),this._closingInterval=null,clearInterval(this._interval),this._interval=null,this._chunk=null,this._cb=null,this._onFinishBound&&this.removeListener("finish",this._onFinishBound),this._onFinishBound=null,this._channel){try{this._channel.close();}catch(e){}this._channel.onmessage=null,this._channel.onopen=null,this._channel.onclose=null,this._channel.onerror=null;}if(this._pc){try{this._pc.close();}catch(e){}this._pc.oniceconnectionstatechange=null,this._pc.onicegatheringstatechange=null,this._pc.onsignalingstatechange=null,this._pc.onicecandidate=null,this._pc.ontrack=null,this._pc.ondatachannel=null;}this._pc=null,this._channel=null,e&&this.emit("error",e),this.emit("close"),t();}));}_setupData(e){if(!e.channel)return this.destroy(l(new Error("Data channel event is missing `channel` property"),"ERR_DATA_CHANNEL"));this._channel=e.channel,this._channel.binaryType="arraybuffer","number"==typeof this._channel.bufferedAmountLowThreshold&&(this._channel.bufferedAmountLowThreshold=u),this.channelName=this._channel.label,this._channel.onmessage=e=>{this._onChannelMessage(e);},this._channel.onbufferedamountlow=()=>{this._onChannelBufferedAmountLow();},this._channel.onopen=()=>{this._onChannelOpen();},this._channel.onclose=()=>{this._onChannelClose();},this._channel.onerror=e=>{this.destroy(l(e,"ERR_DATA_CHANNEL"));};let t=!1;this._closingInterval=setInterval(()=>{this._channel&&"closing"===this._channel.readyState?(t&&this._onChannelClose(),t=!0):t=!1;},5000);}_read(){}_write(e,t,n){if(this.destroyed)return n(l(new Error("cannot write after peer is destroyed"),"ERR_DATA_CHANNEL"));if(this._connected){try{this.send(e);}catch(e){return this.destroy(l(e,"ERR_DATA_CHANNEL"))}this._channel.bufferedAmount>u?(this._debug("start backpressure: bufferedAmount %d",this._channel.bufferedAmount),this._cb=n):n(null);}else this._debug("write before connect"),this._chunk=e,this._cb=n;}_onFinish(){if(!this.destroyed){const e=()=>{setTimeout(()=>this.destroy(),1e3);};this._connected?e():this.once("connect",e);}}_startIceCompleteTimeout(){this.destroyed||this._iceCompleteTimer||(this._debug("started iceComplete timeout"),this._iceCompleteTimer=setTimeout(()=>{this._iceComplete||(this._iceComplete=!0,this._debug("iceComplete timeout completed"),this.emit("iceTimeout"),this.emit("_iceComplete"));},this.iceCompleteTimeout));}_createOffer(){this.destroyed||this._pc.createOffer(this.offerOptions).then(e=>{if(this.destroyed)return;this.trickle||this.allowHalfTrickle||(e.sdp=n(e.sdp)),e.sdp=this.sdpTransform(e.sdp);const t=()=>{if(!this.destroyed){const t=this._pc.localDescription||e;this._debug("signal"),this.emit("signal",{type:t.type,sdp:t.sdp});}};this._pc.setLocalDescription(e).then(()=>{this._debug("createOffer success"),this.destroyed||(this.trickle||this._iceComplete?t():this.once("_iceComplete",t));}).catch(e=>{this.destroy(l(e,"ERR_SET_LOCAL_DESCRIPTION"));});}).catch(e=>{this.destroy(l(e,"ERR_CREATE_OFFER"));});}_requestMissingTransceivers(){this._pc.getTransceivers&&this._pc.getTransceivers().forEach(e=>{e.mid||!e.sender.track||e.requested||(e.requested=!0,this.addTransceiver(e.sender.track.kind));});}_createAnswer(){this.destroyed||this._pc.createAnswer(this.answerOptions).then(e=>{if(this.destroyed)return;this.trickle||this.allowHalfTrickle||(e.sdp=n(e.sdp)),e.sdp=this.sdpTransform(e.sdp);const t=()=>{if(!this.destroyed){const t=this._pc.localDescription||e;this._debug("signal"),this.emit("signal",{type:t.type,sdp:t.sdp}),this.initiator||this._requestMissingTransceivers();}};this._pc.setLocalDescription(e).then(()=>{this.destroyed||(this.trickle||this._iceComplete?t():this.once("_iceComplete",t));}).catch(e=>{this.destroy(l(e,"ERR_SET_LOCAL_DESCRIPTION"));});}).catch(e=>{this.destroy(l(e,"ERR_CREATE_ANSWER"));});}_onConnectionStateChange(){this.destroyed||"failed"===this._pc.connectionState&&this.destroy(l(new Error("Connection failed."),"ERR_CONNECTION_FAILURE"));}_onIceStateChange(){if(this.destroyed)return;const e=this._pc.iceConnectionState,t=this._pc.iceGatheringState;this._debug("iceStateChange (connection: %s) (gathering: %s)",e,t),this.emit("iceStateChange",e,t),("connected"===e||"completed"===e)&&(this._pcReady=!0,this._maybeReady()),"failed"===e&&this.destroy(l(new Error("Ice connection failed."),"ERR_ICE_CONNECTION_FAILURE")),"closed"===e&&this.destroy(l(new Error("Ice connection closed."),"ERR_ICE_CONNECTION_CLOSED"));}getStats(e){const t=e=>("[object Array]"===Object.prototype.toString.call(e.values)&&e.values.forEach(t=>{Object.assign(e,t);}),e);0===this._pc.getStats.length||this._isReactNativeWebrtc?this._pc.getStats().then(n=>{const r=[];n.forEach(e=>{r.push(t(e));}),e(null,r);},t=>e(t)):0<this._pc.getStats.length?this._pc.getStats(n=>{if(this.destroyed)return;const r=[];n.result().forEach(e=>{const n={};e.names().forEach(t=>{n[t]=e.stat(t);}),n.id=e.id,n.type=e.type,n.timestamp=e.timestamp,r.push(t(n));}),e(null,r);},t=>e(t)):e(null,[]);}_maybeReady(){if(this._debug("maybeReady pc %s channel %s",this._pcReady,this._channelReady),this._connected||this._connecting||!this._pcReady||!this._channelReady)return;this._connecting=!0;const e=()=>{this.destroyed||this.getStats((t,n)=>{if(this.destroyed)return;t&&(n=[]);const r={},a={},o={};let i=!1;n.forEach(e=>{("remotecandidate"===e.type||"remote-candidate"===e.type)&&(r[e.id]=e),("localcandidate"===e.type||"local-candidate"===e.type)&&(a[e.id]=e),("candidatepair"===e.type||"candidate-pair"===e.type)&&(o[e.id]=e);});const d=e=>{i=!0;let t=a[e.localCandidateId];t&&(t.ip||t.address)?(this.localAddress=t.ip||t.address,this.localPort=+t.port):t&&t.ipAddress?(this.localAddress=t.ipAddress,this.localPort=+t.portNumber):"string"==typeof e.googLocalAddress&&(t=e.googLocalAddress.split(":"),this.localAddress=t[0],this.localPort=+t[1]),this.localAddress&&(this.localFamily=this.localAddress.includes(":")?"IPv6":"IPv4");let n=r[e.remoteCandidateId];n&&(n.ip||n.address)?(this.remoteAddress=n.ip||n.address,this.remotePort=+n.port):n&&n.ipAddress?(this.remoteAddress=n.ipAddress,this.remotePort=+n.portNumber):"string"==typeof e.googRemoteAddress&&(n=e.googRemoteAddress.split(":"),this.remoteAddress=n[0],this.remotePort=+n[1]),this.remoteAddress&&(this.remoteFamily=this.remoteAddress.includes(":")?"IPv6":"IPv4"),this._debug("connect local: %s:%s remote: %s:%s",this.localAddress,this.localPort,this.remoteAddress,this.remotePort);};if(n.forEach(e=>{"transport"===e.type&&e.selectedCandidatePairId&&d(o[e.selectedCandidatePairId]),("googCandidatePair"===e.type&&"true"===e.googActiveConnection||("candidatepair"===e.type||"candidate-pair"===e.type)&&e.selected)&&d(e);}),!i&&(!Object.keys(o).length||Object.keys(a).length))return void setTimeout(e,100);if(this._connecting=!1,this._connected=!0,this._chunk){try{this.send(this._chunk);}catch(e){return this.destroy(l(e,"ERR_DATA_CHANNEL"))}this._chunk=null,this._debug("sent chunk from \"write before connect\"");const e=this._cb;this._cb=null,e(null);}"number"!=typeof this._channel.bufferedAmountLowThreshold&&(this._interval=setInterval(()=>this._onInterval(),150),this._interval.unref&&this._interval.unref()),this._debug("connect"),this.emit("connect");});};e();}_onInterval(){this._cb&&this._channel&&!(this._channel.bufferedAmount>u)&&this._onChannelBufferedAmountLow();}_onSignalingStateChange(){this.destroyed||("stable"===this._pc.signalingState&&(this._isNegotiating=!1,this._debug("flushing sender queue",this._sendersAwaitingStable),this._sendersAwaitingStable.forEach(e=>{this._pc.removeTrack(e),this._queuedNegotiation=!0;}),this._sendersAwaitingStable=[],this._queuedNegotiation?(this._debug("flushing negotiation queue"),this._queuedNegotiation=!1,this._needsNegotiation()):(this._debug("negotiated"),this.emit("negotiated"))),this._debug("signalingStateChange %s",this._pc.signalingState),this.emit("signalingStateChange",this._pc.signalingState));}_onIceCandidate(e){this.destroyed||(e.candidate&&this.trickle?this.emit("signal",{type:"candidate",candidate:{candidate:e.candidate.candidate,sdpMLineIndex:e.candidate.sdpMLineIndex,sdpMid:e.candidate.sdpMid}}):!e.candidate&&!this._iceComplete&&(this._iceComplete=!0,this.emit("_iceComplete")),e.candidate&&this._startIceCompleteTimeout());}_onChannelMessage(e){if(this.destroyed)return;let t=e.data;t instanceof ArrayBuffer&&(t=c.from(t)),this.push(t);}_onChannelBufferedAmountLow(){if(!this.destroyed&&this._cb){this._debug("ending backpressure: bufferedAmount %d",this._channel.bufferedAmount);const e=this._cb;this._cb=null,e(null);}}_onChannelOpen(){this._connected||this.destroyed||(this._debug("on channel open"),this._channelReady=!0,this._maybeReady());}_onChannelClose(){this.destroyed||(this._debug("on channel close"),this.destroy());}_onTrack(e){this.destroyed||e.streams.forEach(t=>{this._debug("on track"),this.emit("track",e.track,t),this._remoteTracks.push({track:e.track,stream:t}),this._remoteStreams.some(e=>e.id===t.id)||(this._remoteStreams.push(t),s(()=>{this._debug("on stream"),this.emit("stream",t);}));});}_debug(){const e=[].slice.call(arguments);e[0]="["+this._id+"] "+e[0],a.apply(null,e);}}p.WEBRTC_SUPPORT=!!o(),p.config={iceServers:[{urls:["stun:stun.l.google.com:19302","stun:global.stun.twilio.com:3478"]}],sdpSemantics:"unified-plan"},p.channelConfig={},t.exports=p;},{buffer:3,debug:5,"err-code":7,"get-browser-rtc":8,"queue-microtask":13,randombytes:14,"readable-stream":29}]},{},[])("/")});
  });

  /**
   * @module sync-protocol
   */

  /**
   * @typedef {Map<number, number>} StateMap
   */

  /**
   * Core Yjs defines two message types:
   * • YjsSyncStep1: Includes the State Set of the sending client. When received, the client should reply with YjsSyncStep2.
   * • YjsSyncStep2: Includes all missing structs and the complete delete set. When received, the client is assured that it
   *   received all information from the remote client.
   *
   * In a peer-to-peer network, you may want to introduce a SyncDone message type. Both parties should initiate the connection
   * with SyncStep1. When a client received SyncStep2, it should reply with SyncDone. When the local client received both
   * SyncStep2 and SyncDone, it is assured that it is synced to the remote client.
   *
   * In a client-server model, you want to handle this differently: The client should initiate the connection with SyncStep1.
   * When the server receives SyncStep1, it should reply with SyncStep2 immediately followed by SyncStep1. The client replies
   * with SyncStep2 when it receives SyncStep1. Optionally the server may send a SyncDone after it received SyncStep2, so the
   * client knows that the sync is finished.  There are two reasons for this more elaborated sync model: 1. This protocol can
   * easily be implemented on top of http and websockets. 2. The server shoul only reply to requests, and not initiate them.
   * Therefore it is necesarry that the client initiates the sync.
   *
   * Construction of a message:
   * [messageType : varUint, message definition..]
   *
   * Note: A message does not include information about the room name. This must to be handled by the upper layer protocol!
   *
   * stringify[messageType] stringifies a message definition (messageType is already read from the bufffer)
   */

  const messageYjsSyncStep1 = 0;
  const messageYjsSyncStep2 = 1;
  const messageYjsUpdate = 2;

  /**
   * Create a sync step 1 message based on the state of the current shared document.
   *
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   */
  const writeSyncStep1 = (encoder, doc) => {
    writeVarUint(encoder, messageYjsSyncStep1);
    const sv = encodeStateVector(doc);
    writeVarUint8Array(encoder, sv);
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   * @param {Uint8Array} [encodedStateVector]
   */
  const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
    writeVarUint(encoder, messageYjsSyncStep2);
    writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
  };

  /**
   * Read SyncStep1 message and reply with SyncStep2.
   *
   * @param {decoding.Decoder} decoder The reply to the received message
   * @param {encoding.Encoder} encoder The received message
   * @param {Y.Doc} doc
   */
  const readSyncStep1 = (decoder, encoder, doc) =>
    writeSyncStep2(encoder, doc, readVarUint8Array(decoder));

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncStep2 = (decoder, doc, transactionOrigin) => {
    try {
      applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
    } catch (error) {
      // This catches errors that are thrown by event handlers
      console.error('Caught error while handling a Yjs update', error);
    }
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Uint8Array} update
   */
  const writeUpdate = (encoder, update) => {
    writeVarUint(encoder, messageYjsUpdate);
    writeVarUint8Array(encoder, update);
  };

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readUpdate = readSyncStep2;

  /**
   * @param {decoding.Decoder} decoder A message received from another client
   * @param {encoding.Encoder} encoder The reply message. Will not be sent if empty.
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncMessage = (decoder, encoder, doc, transactionOrigin) => {
    const messageType = readVarUint(decoder);
    switch (messageType) {
      case messageYjsSyncStep1:
        readSyncStep1(decoder, encoder, doc);
        break
      case messageYjsSyncStep2:
        readSyncStep2(decoder, doc, transactionOrigin);
        break
      case messageYjsUpdate:
        readUpdate(decoder, doc, transactionOrigin);
        break
      default:
        throw new Error('Unknown message type')
    }
    return messageType
  };

  /**
   * @module awareness-protocol
   */

  const outdatedTimeout = 30000;

  /**
   * @typedef {Object} MetaClientState
   * @property {number} MetaClientState.clock
   * @property {number} MetaClientState.lastUpdated unix timestamp
   */

  /**
   * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
   * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
   * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
   *
   * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
   * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
   * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
   * a remote client is offline, it may propagate a message with
   * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
   * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
   *
   * Before a client disconnects, it should propagate a `null` state with an updated clock.
   *
   * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
   *
   * @extends {Observable<string>}
   */
  class Awareness extends Observable {
    /**
     * @param {Y.Doc} doc
     */
    constructor (doc) {
      super();
      this.doc = doc;
      /**
       * @type {number}
       */
      this.clientID = doc.clientID;
      /**
       * Maps from client id to client state
       * @type {Map<number, Object<string, any>>}
       */
      this.states = new Map();
      /**
       * @type {Map<number, MetaClientState>}
       */
      this.meta = new Map();
      this._checkInterval = /** @type {any} */ (setInterval(() => {
        const now = getUnixTime();
        if (this.getLocalState() !== null && (outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */ (this.meta.get(this.clientID)).lastUpdated)) {
          // renew local clock
          this.setLocalState(this.getLocalState());
        }
        /**
         * @type {Array<number>}
         */
        const remove = [];
        this.meta.forEach((meta, clientid) => {
          if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
            remove.push(clientid);
          }
        });
        if (remove.length > 0) {
          removeAwarenessStates(this, remove, 'timeout');
        }
      }, floor(outdatedTimeout / 10)));
      doc.on('destroy', () => {
        this.destroy();
      });
      this.setLocalState({});
    }

    destroy () {
      this.emit('destroy', [this]);
      this.setLocalState(null);
      super.destroy();
      clearInterval(this._checkInterval);
    }

    /**
     * @return {Object<string,any>|null}
     */
    getLocalState () {
      return this.states.get(this.clientID) || null
    }

    /**
     * @param {Object<string,any>|null} state
     */
    setLocalState (state) {
      const clientID = this.clientID;
      const currLocalMeta = this.meta.get(clientID);
      const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
      const prevState = this.states.get(clientID);
      if (state === null) {
        this.states.delete(clientID);
      } else {
        this.states.set(clientID, state);
      }
      this.meta.set(clientID, {
        clock,
        lastUpdated: getUnixTime()
      });
      const added = [];
      const updated = [];
      const filteredUpdated = [];
      const removed = [];
      if (state === null) {
        removed.push(clientID);
      } else if (prevState == null) {
        if (state != null) {
          added.push(clientID);
        }
      } else {
        updated.push(clientID);
        if (!equalityDeep(prevState, state)) {
          filteredUpdated.push(clientID);
        }
      }
      if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
        this.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
      }
      this.emit('update', [{ added, updated, removed }, 'local']);
    }

    /**
     * @param {string} field
     * @param {any} value
     */
    setLocalStateField (field, value) {
      const state = this.getLocalState();
      if (state !== null) {
        state[field] = value;
        this.setLocalState(state);
      }
    }

    /**
     * @return {Map<number,Object<string,any>>}
     */
    getStates () {
      return this.states
    }
  }

  /**
   * Mark (remote) clients as inactive and remove them from the list of active peers.
   * This change will be propagated to remote clients.
   *
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @param {any} origin
   */
  const removeAwarenessStates = (awareness, clients, origin) => {
    const removed = [];
    for (let i = 0; i < clients.length; i++) {
      const clientID = clients[i];
      if (awareness.states.has(clientID)) {
        awareness.states.delete(clientID);
        if (clientID === awareness.clientID) {
          const curMeta = /** @type {MetaClientState} */ (awareness.meta.get(clientID));
          awareness.meta.set(clientID, {
            clock: curMeta.clock + 1,
            lastUpdated: getUnixTime()
          });
        }
        removed.push(clientID);
      }
    }
    if (removed.length > 0) {
      awareness.emit('change', [{ added: [], updated: [], removed }, origin]);
      awareness.emit('update', [{ added: [], updated: [], removed }, origin]);
    }
  };

  /**
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @return {Uint8Array}
   */
  const encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
    const len = clients.length;
    const encoder = createEncoder();
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      const clientID = clients[i];
      const state = states.get(clientID) || null;
      const clock = /** @type {MetaClientState} */ (awareness.meta.get(clientID)).clock;
      writeVarUint(encoder, clientID);
      writeVarUint(encoder, clock);
      writeVarString(encoder, JSON.stringify(state));
    }
    return toUint8Array(encoder)
  };

  /**
   * @param {Awareness} awareness
   * @param {Uint8Array} update
   * @param {any} origin This will be added to the emitted change event
   */
  const applyAwarenessUpdate = (awareness, update, origin) => {
    const decoder = createDecoder(update);
    const timestamp = getUnixTime();
    const added = [];
    const updated = [];
    const filteredUpdated = [];
    const removed = [];
    const len = readVarUint(decoder);
    for (let i = 0; i < len; i++) {
      const clientID = readVarUint(decoder);
      let clock = readVarUint(decoder);
      const state = JSON.parse(readVarString(decoder));
      const clientMeta = awareness.meta.get(clientID);
      const prevState = awareness.states.get(clientID);
      const currClock = clientMeta === undefined ? 0 : clientMeta.clock;
      if (currClock < clock || (currClock === clock && state === null && awareness.states.has(clientID))) {
        if (state === null) {
          // never let a remote client remove this local state
          if (clientID === awareness.clientID && awareness.getLocalState() != null) {
            // remote client removed the local state. Do not remote state. Broadcast a message indicating
            // that this client still exists by increasing the clock
            clock++;
          } else {
            awareness.states.delete(clientID);
          }
        } else {
          awareness.states.set(clientID, state);
        }
        awareness.meta.set(clientID, {
          clock,
          lastUpdated: timestamp
        });
        if (clientMeta === undefined && state !== null) {
          added.push(clientID);
        } else if (clientMeta !== undefined && state === null) {
          removed.push(clientID);
        } else if (state !== null) {
          if (!equalityDeep(state, prevState)) {
            filteredUpdated.push(clientID);
          }
          updated.push(clientID);
        }
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      awareness.emit('change', [{
        added, updated: filteredUpdated, removed
      }, origin]);
    }
    if (added.length > 0 || updated.length > 0 || removed.length > 0) {
      awareness.emit('update', [{
        added, updated, removed
      }, origin]);
    }
  };

  /* eslint-env browser */

  /**
   * @param {string} secret
   * @param {string} roomName
   * @return {PromiseLike<CryptoKey>}
   */
  const deriveKey = (secret, roomName) => {
    const secretBuffer = encodeUtf8(secret).buffer;
    const salt = encodeUtf8(roomName).buffer;
    return crypto.subtle.importKey(
      'raw',
      secretBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    ).then(keyMaterial =>
      crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      )
    )
  };

  /**
   * @param {Uint8Array} data data to be encrypted
   * @param {CryptoKey?} key
   * @return {PromiseLike<Uint8Array>} encrypted, base64 encoded message
   */
  const encrypt = (data, key) => {
    if (!key) {
      return /** @type {PromiseLike<Uint8Array>} */ (resolve(data))
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    ).then(cipher => {
      const encryptedDataEncoder = createEncoder();
      writeVarString(encryptedDataEncoder, 'AES-GCM');
      writeVarUint8Array(encryptedDataEncoder, iv);
      writeVarUint8Array(encryptedDataEncoder, new Uint8Array(cipher));
      return toUint8Array(encryptedDataEncoder)
    })
  };

  /**
   * @param {Object} data data to be encrypted
   * @param {CryptoKey?} key
   * @return {PromiseLike<Uint8Array>} encrypted data, if key is provided
   */
  const encryptJson = (data, key) => {
    const dataEncoder = createEncoder();
    writeAny(dataEncoder, data);
    return encrypt(toUint8Array(dataEncoder), key)
  };

  /**
   * @param {Uint8Array} data
   * @param {CryptoKey?} key
   * @return {PromiseLike<Uint8Array>} decrypted buffer
   */
  const decrypt = (data, key) => {
    if (!key) {
      return /** @type {PromiseLike<Uint8Array>} */ (resolve(data))
    }
    const dataDecoder = createDecoder(data);
    const algorithm = readVarString(dataDecoder);
    if (algorithm !== 'AES-GCM') {
      reject(create$2('Unknown encryption algorithm'));
    }
    const iv = readVarUint8Array(dataDecoder);
    const cipher = readVarUint8Array(dataDecoder);
    return crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      cipher
    ).then(data => new Uint8Array(data))
  };

  /**
   * @param {Uint8Array} data
   * @param {CryptoKey?} key
   * @return {PromiseLike<Object>} decrypted object
   */
  const decryptJson = (data, key) =>
    decrypt(data, key).then(decryptedValue =>
      readAny(createDecoder(new Uint8Array(decryptedValue)))
    );

  const log = createModuleLogger('y-webrtc');

  const messageSync = 0;
  const messageQueryAwareness = 3;
  const messageAwareness = 1;
  const messageBcPeerId = 4;

  /**
   * @type {Map<string, SignalingConn>}
   */
  const signalingConns = new Map();

  /**
   * @type {Map<string,Room>}
   */
  const rooms = new Map();

  /**
   * @param {Room} room
   */
  const checkIsSynced = room => {
    let synced = true;
    room.webrtcConns.forEach(peer => {
      if (!peer.synced) {
        synced = false;
      }
    });
    if ((!synced && room.synced) || (synced && !room.synced)) {
      room.synced = synced;
      room.provider.emit('synced', [{ synced }]);
      log('synced ', BOLD, room.name, UNBOLD, ' with all peers');
    }
  };

  /**
   * @param {WebsocketProvider} provider
   * @param {Uint8Array} buf
   * @param {boolean} emitSynced
   * @return {encoding.Encoder}
   */
   const readMessage = (provider, buf, emitSynced) => {
    const decoder = createDecoder(buf);
    const encoder = createEncoder();
    const messageType = readVarUint(decoder);
    const messageHandler = provider.messageHandlers[messageType];
    if (/** @type {any} */ (messageHandler)) {
      messageHandler(encoder, decoder, provider, emitSynced, messageType);
    } else {
      console.error('Unable to compute message');
    }
    return encoder
  };

  /**
   * @param {WebrtcConn} peerConn
   * @param {Uint8Array} buf
   * @return {encoding.Encoder?}
   */
  const readPeerMessage = (peerConn, buf) => {
    const room = peerConn.room;
    log('received message from ', BOLD, peerConn.remotePeerId, GREY, ' (', room.name, ')', UNBOLD, UNCOLOR);
    return readMessage(room, buf, () => {
      peerConn.synced = true;
      log('synced ', BOLD, room.name, UNBOLD, ' with ', BOLD, peerConn.remotePeerId);
      checkIsSynced(room);
    })
  };

  /**
   * @param {WebrtcConn} webrtcConn
   * @param {encoding.Encoder} encoder
   */
  const sendWebrtcConn = (webrtcConn, encoder) => {
    log('send message to ', BOLD, webrtcConn.remotePeerId, UNBOLD, GREY, ' (', webrtcConn.room.name, ')', UNCOLOR);
    try {
      webrtcConn.peer.send(toUint8Array(encoder));
    } catch (e) {}
  };

  /**
   * @param {Room} room
   * @param {Uint8Array} m
   */
  const broadcastWebrtcConn = (room, m) => {
    log('broadcast message in ', BOLD, room.name, UNBOLD);
    room.webrtcConns.forEach(conn => {
      try {
        conn.peer.send(m);
      } catch (e) {}
    });
  };

  class WebrtcConn {
    /**
     * @param {SignalingConn} signalingConn
     * @param {boolean} initiator
     * @param {string} remotePeerId
     * @param {Room} room
     */
    constructor (signalingConn, initiator, remotePeerId, room) {
      log('establishing connection to ', BOLD, remotePeerId);
      this.room = room;
      this.remotePeerId = remotePeerId;
      this.closed = false;
      this.connected = false;
      this.synced = false;
      /**
       * @type {any}
       */
      this.peer = new simplepeer_min({ initiator, ...room.provider.peerOpts });
      this.peer.on('signal', signal => {
        publishSignalingMessage(signalingConn, room, { to: remotePeerId, from: room.peerId, type: 'signal', signal });
      });
      this.peer.on('connect', () => {
        log('connected to ', BOLD, remotePeerId);
        this.connected = true;
        // send sync step 1
        const provider = room.provider;
        const doc = provider.doc;
        const awareness = room.awareness;
        const encoder = createEncoder();
        writeVarUint(encoder, messageSync);
        writeSyncStep1(encoder, doc);
        sendWebrtcConn(this, encoder);
        const awarenessStates = awareness.getStates();
        if (awarenessStates.size > 0) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageAwareness);
          writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())));
          sendWebrtcConn(this, encoder);
        }
      });
      this.peer.on('close', () => {
        this.connected = false;
        this.closed = true;
        if (room.webrtcConns.has(this.remotePeerId)) {
          room.webrtcConns.delete(this.remotePeerId);
          room.provider.emit('peers', [{
            removed: [this.remotePeerId],
            added: [],
            webrtcPeers: Array.from(room.webrtcConns.keys()),
            bcPeers: Array.from(room.bcConns)
          }]);
        }
        checkIsSynced(room);
        this.peer.destroy();
        log('closed connection to ', BOLD, remotePeerId);
        announceSignalingInfo(room);
      });
      this.peer.on('error', err => {
        log('Error in connection to ', BOLD, remotePeerId, ': ', err);
        announceSignalingInfo(room);
      });
      this.peer.on('data', data => {
        const answer = readPeerMessage(this, data);
        if (answer !== null) {
          sendWebrtcConn(this, answer);
        }
      });
    }

    destroy () {
      this.peer.destroy();
    }
  }

  /**
   * @param {Room} room
   * @param {Uint8Array} m
   */
  const broadcastBcMessage = (room, m) => encrypt(m, room.key).then(data =>
    room.mux(() =>
      publish(room.name, data)
    )
  );

  /**
   * @param {Room} room
   * @param {Uint8Array} m
   */
  const broadcastRoomMessage = (room, m) => {
    if (room.bcconnected) {
      broadcastBcMessage(room, m);
    }
    broadcastWebrtcConn(room, m);
  };

  /**
   * @param {Room} room
   */
  const announceSignalingInfo = room => {
    signalingConns.forEach(conn => {
      // only subcribe if connection is established, otherwise the conn automatically subscribes to all rooms
      if (conn.connected) {
        conn.send({ type: 'subscribe', topics: [room.name] });
        if (room.webrtcConns.size < room.provider.maxConns) {
          publishSignalingMessage(conn, room, { type: 'announce', from: room.peerId });
        }
      }
    });
  };

  /**
   * @param {Room} room
   */
  const broadcastBcPeerId = room => {
    if (room.provider.filterBcConns) {
      // broadcast peerId via broadcastchannel
      const encoderPeerIdBc = createEncoder();
      writeVarUint(encoderPeerIdBc, messageBcPeerId);
      writeUint8(encoderPeerIdBc, 1);
      writeVarString(encoderPeerIdBc, room.peerId);
      broadcastBcMessage(room, toUint8Array(encoderPeerIdBc));
    }
  };

  class Room {
    /**
     * @param {Y.Doc} doc
     * @param {WebrtcProvider} provider
     * @param {string} name
     * @param {CryptoKey|null} key
     */
    constructor (doc, provider, name, key) {
      /**
       * Do not assume that peerId is unique. This is only meant for sending signaling messages.
       *
       * @type {string}
       */
      this.peerId = uuidv4();
      this.doc = doc;
      /**
       * @type {awarenessProtocol.Awareness}
       */
      this.awareness = provider.awareness;
      this.provider = provider;
      this.synced = false;
      this.name = name;
      // @todo make key secret by scoping
      this.key = key;
      /**
       * @type {Map<string, WebrtcConn>}
       */
      this.webrtcConns = new Map();
      /**
       * @type {Set<string>}
       */
      this.bcConns = new Set();
      this.mux = createMutex();
      this.bcconnected = false;
      /**
       * @param {ArrayBuffer} data
       */
      this._bcSubscriber = data =>
        decrypt(new Uint8Array(data), key).then(m =>
          this.mux(() => {
            const reply = readMessage(this, m, () => {});
            if (reply) {
              broadcastBcMessage(this, toUint8Array(reply));
            }
          })
        );
      /**
       * Listens to Yjs updates and sends them to remote peers
       *
       * @param {Uint8Array} update
       * @param {any} origin
       */
      this._docUpdateHandler = (update, origin) => {
        const encoder = createEncoder();
        writeVarUint(encoder, messageSync);
        writeUpdate(encoder, update);
        broadcastRoomMessage(this, toUint8Array(encoder));
      };
      /**
       * Listens to Awareness updates and sends them to remote peers
       *
       * @param {any} changed
       * @param {any} origin
       */
      this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
        const changedClients = added.concat(updated).concat(removed);
        const encoderAwareness = createEncoder();
        writeVarUint(encoderAwareness, messageAwareness);
        writeVarUint8Array(encoderAwareness, encodeAwarenessUpdate(this.awareness, changedClients));
        broadcastRoomMessage(this, toUint8Array(encoderAwareness));
      };
      this.doc.on('update', this._docUpdateHandler);
      this.awareness.on('update', this._awarenessUpdateHandler);
      window.addEventListener('beforeunload', () => {
        removeAwarenessStates(this.awareness, [doc.clientID], 'window unload');
        rooms.forEach(room => {
          room.disconnect();
        });
      });
    }

    connect () {
      // signal through all available signaling connections
      announceSignalingInfo(this);
      const roomName = this.name;
      subscribe(roomName, this._bcSubscriber);
      this.bcconnected = true;
      // broadcast peerId via broadcastchannel
      broadcastBcPeerId(this);
      // write sync step 1
      const encoderSync = createEncoder();
      writeVarUint(encoderSync, messageSync);
      writeSyncStep1(encoderSync, this.doc);
      broadcastBcMessage(this, toUint8Array(encoderSync));
      // broadcast local state
      const encoderState = createEncoder();
      writeVarUint(encoderState, messageSync);
      writeSyncStep2(encoderState, this.doc);
      broadcastBcMessage(this, toUint8Array(encoderState));
      // write queryAwareness
      const encoderAwarenessQuery = createEncoder();
      writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
      broadcastBcMessage(this, toUint8Array(encoderAwarenessQuery));
      // broadcast local awareness state
      const encoderAwarenessState = createEncoder();
      writeVarUint(encoderAwarenessState, messageAwareness);
      writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
      broadcastBcMessage(this, toUint8Array(encoderAwarenessState));
    }

    disconnect () {
      // signal through all available signaling connections
      signalingConns.forEach(conn => {
        if (conn.connected) {
          conn.send({ type: 'unsubscribe', topics: [this.name] });
        }
      });
      removeAwarenessStates(this.awareness, [this.doc.clientID], 'disconnect');
      // broadcast peerId removal via broadcastchannel
      const encoderPeerIdBc = createEncoder();
      writeVarUint(encoderPeerIdBc, messageBcPeerId);
      writeUint8(encoderPeerIdBc, 0); // remove peerId from other bc peers
      writeVarString(encoderPeerIdBc, this.peerId);
      broadcastBcMessage(this, toUint8Array(encoderPeerIdBc));

      unsubscribe(this.name, this._bcSubscriber);
      this.bcconnected = false;
      this.doc.off('update', this._docUpdateHandler);
      this.awareness.off('update', this._awarenessUpdateHandler);
      this.webrtcConns.forEach(conn => conn.destroy());
    }

    destroy () {
      this.disconnect();
    }
  }

  /**
   * @param {Y.Doc} doc
   * @param {WebrtcProvider} provider
   * @param {string} name
   * @param {CryptoKey|null} key
   * @return {Room}
   */
  const openRoom = (doc, provider, name, key) => {
    // there must only be one room
    if (rooms.has(name)) {
      throw create$2(`A Yjs Doc connected to room "${name}" already exists!`)
    }
    const room = new Room(doc, provider, name, key);
    rooms.set(name, /** @type {Room} */ (room));
    return room
  };

  /**
   * @param {SignalingConn} conn
   * @param {Room} room
   * @param {any} data
   */
  const publishSignalingMessage = (conn, room, data) => {
    if (room.key) {
      encryptJson(data, room.key).then(data => {
        conn.send({ type: 'publish', topic: room.name, data: toBase64(data) });
      });
    } else {
      conn.send({ type: 'publish', topic: room.name, data });
    }
  };

  class SignalingConn extends WebsocketClient {
    constructor (url) {
      super(url);
      /**
       * @type {Set<WebrtcProvider>}
       */
      this.providers = new Set();
      this.on('connect', () => {
        log(`connected (${url})`);
        const topics = Array.from(rooms.keys());
        this.send({ type: 'subscribe', topics });
        rooms.forEach(room =>
          publishSignalingMessage(this, room, { type: 'announce', from: room.peerId })
        );
      });
      this.on('message', m => {
        switch (m.type) {
          case 'publish': {
            const roomName = m.topic;
            const room = rooms.get(roomName);
            if (room == null || typeof roomName !== 'string') {
              return
            }
            const execMessage = data => {
              const webrtcConns = room.webrtcConns;
              const peerId = room.peerId;
              if (data == null || data.from === peerId || (data.to !== undefined && data.to !== peerId) || room.bcConns.has(data.from)) {
                // ignore messages that are not addressed to this conn, or from clients that are connected via broadcastchannel
                return
              }
              const emitPeerChange = webrtcConns.has(data.from) ? () => {} : () =>
                room.provider.emit('peers', [{
                  removed: [],
                  added: [data.from],
                  webrtcPeers: Array.from(room.webrtcConns.keys()),
                  bcPeers: Array.from(room.bcConns)
                }]);
              switch (data.type) {
                case 'announce':
                  if (webrtcConns.size < room.provider.maxConns) {
                    setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this, true, data.from, room));
                    emitPeerChange();
                  }
                  break
                case 'signal':
                  if (data.to === peerId) {
                    setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this, false, data.from, room)).peer.signal(data.signal);
                    emitPeerChange();
                  }
                  break
              }
            };
            if (room.key) {
              if (typeof m.data === 'string') {
                decryptJson(fromBase64(m.data), room.key).then(execMessage);
              }
            } else {
              execMessage(m.data);
            }
          }
        }
      });
      this.on('disconnect', () => log(`disconnect (${url})`));
    }
  }

  /**
   * @extends Observable<string>
   */
  class WebrtcProvider extends Observable {
    /**
     * @param {string} roomName
     * @param {Y.Doc} doc
     * @param {Object} [opts]
     * @param {Array<string>} [opts.signaling]
     * @param {string?} [opts.password]
     * @param {awarenessProtocol.Awareness} [opts.awareness]
     * @param {number} [opts.maxConns]
     * @param {boolean} [opts.filterBcConns]
     * @param {any} [opts.peerOpts]
     */
    constructor (
      roomName,
      doc,
      {
        signaling = ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
        password = null,
        awareness = new Awareness(doc),
        maxConns = 20 + floor(rand() * 15), // the random factor reduces the chance that n clients form a cluster
        filterBcConns = true,
        peerOpts = {} // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
      } = {}
    ) {
      super();
      this.roomName = roomName;
      this.doc = doc;
      this.filterBcConns = filterBcConns;
      /**
       * @type {awarenessProtocol.Awareness}
       */
      this.awareness = awareness;
      this.shouldConnect = false;
      this.signalingUrls = signaling;
      this.signalingConns = [];
      this.maxConns = maxConns;
      this.peerOpts = peerOpts;
      /**
       * @type {PromiseLike<CryptoKey | null>}
       */
      this.key = password ? deriveKey(password, roomName) : /** @type {PromiseLike<null>} */ (resolve(null));
      /**
       * @type {Room|null}
       */
      this.room = null;
      this.key.then(key => {
        this.room = openRoom(doc, this, roomName, key);
        if (this.shouldConnect) {
          this.room.connect();
        } else {
          this.room.disconnect();
        }
      });
      this.connect();
      this.destroy = this.destroy.bind(this);
      doc.on('destroy', this.destroy);
    }

    /**
     * @type {boolean}
     */
    get connected () {
      return this.room !== null && this.shouldConnect
    }

    connect () {
      this.shouldConnect = true;
      this.signalingUrls.forEach(url => {
        const signalingConn = setIfUndefined(signalingConns, url, () => new SignalingConn(url));
        this.signalingConns.push(signalingConn);
        signalingConn.providers.add(this);
      });
      if (this.room) {
        this.room.connect();
      }
    }

    disconnect () {
      this.shouldConnect = false;
      this.signalingConns.forEach(conn => {
        conn.providers.delete(this);
        if (conn.providers.size === 0) {
          conn.destroy();
          signalingConns.delete(conn.url);
        }
      });
      if (this.room) {
        this.room.disconnect();
      }
    }

    destroy () {
      this.doc.off('destroy', this.destroy);
      // need to wait for key before deleting room
      this.key.then(() => {
        /** @type {Room} */ (this.room).destroy();
        rooms.delete(this.roomName);
      });
      super.destroy();
    }
  }
  const messagePermissionDenied = 0;

  /**
   * @callback PermissionDeniedHandler
   * @param {any} y
   * @param {string} reason
   */

  /**
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} y
   * @param {PermissionDeniedHandler} permissionDeniedHandler
   */
  const readAuthMessage = (decoder, y, permissionDeniedHandler) => {
    switch (readVarUint(decoder)) {
      case messagePermissionDenied: permissionDeniedHandler(y, readVarString(decoder));
    }
  };

  /**
   * Utility module to work with urls.
   *
   * @module url
   */

  /**
   * @param {Object<string,string>} params
   * @return {string}
   */
  const encodeQueryParams = params =>
    map$1(params, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');

 /**
   * @template R
   * @param {Object<string,any>} obj
   * @param {function(any,string):R} f
   * @return {Array<R>}
   */
  const map$1 = (obj, f) => {
    const results = [];
    for (const key in obj) {
      results.push(f(obj[key], key));
    }
    return results
  };
  const messageAuth = 2;

  /**
   *                       encoder,          decoder,          provider,          emitSynced, messageType
   * @type {Array<function(encoding.Encoder, decoding.Decoder, WebsocketProvider, boolean,    number):void>}
   */
  const messageHandlers = [];

  messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, messageType) => {
    writeVarUint(encoder, messageSync);
    const syncMessageType = readSyncMessage(decoder, encoder, provider.doc, provider);
    if (emitSynced && syncMessageType === messageYjsSyncStep2 && !provider.synced) {
      provider.synced = true;
    }
  };

  messageHandlers[messageQueryAwareness] = (encoder, decoder, provider, emitSynced, messageType) => {
    writeVarUint(encoder, messageAwareness);
    writeVarUint8Array(encoder, encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys())));
  };

  messageHandlers[messageAwareness] = (encoder, decoder, provider, emitSynced, messageType) => {
    applyAwarenessUpdate(provider.awareness, readVarUint8Array(decoder), provider);
  };

  messageHandlers[messageAuth] = (encoder, decoder, provider, emitSynced, messageType) => {
    readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
  };

  /**
   * @param {WebsocketProvider} provider
   * @param {string} reason
   */
  const permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.\n${reason}`);


  /**
   * @param {WebsocketProvider} provider
   * @param {ArrayBuffer} buf
   */
  const broadcastMessage = (provider, buf) => {
    if (provider.wsconnected) {
      // @ts-ignore We know that wsconnected = true
      provider.ws.send(buf);
    }
    if (provider.bcconnected) {
      provider.mux(() => {
        publish(provider.bcChannel, buf);
      });
    }
  };

  /**
   * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
   * The document name is attached to the provided url. I.e. the following example
   * creates a websocket connection to http://localhost:1234/my-document-name
   *
   * @example
   *   import * as Y from 'yjs'
   *   import { WebsocketProvider } from 'y-websocket'
   *   const doc = new Y.Doc()
   *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
   *
   * @extends {Observable<string>}
   */
   class WebsocketProvider extends Observable {
    /**
     * @param {string} serverUrl
     * @param {string} roomname
     * @param {Y.Doc} doc
     * @param {object} [opts]
     * @param {boolean} [opts.connect]
     * @param {awarenessProtocol.Awareness} [opts.awareness]
     * @param {Object<string,string>} [opts.params]
     * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
     * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
     */
    constructor (serverUrl, roomname, doc, { connect = true, awareness = new Awareness(doc), params = {}, WebSocketPolyfill = WebSocket, resyncInterval = -1 } = {}) {
      super();
      // ensure that url is always ends with /
      while (serverUrl[serverUrl.length - 1] === '/') {
        serverUrl = serverUrl.slice(0, serverUrl.length - 1);
      }
      const encodedParams = encodeQueryParams(params);
      this.bcChannel = serverUrl + '/' + roomname;
      this.url = serverUrl + '/' + roomname + (encodedParams.length === 0 ? '' : '?' + encodedParams);
      this.roomname = roomname;
      this.doc = doc;
      this._WS = WebSocketPolyfill;
      this.awareness = awareness;
      this.wsconnected = false;
      this.wsconnecting = false;
      this.bcconnected = false;
      this.wsUnsuccessfulReconnects = 0;
      this.messageHandlers = messageHandlers.slice();
      this.mux = createMutex();
      /**
       * @type {boolean}
       */
      this._synced = false;
      /**
       * @type {WebSocket?}
       */
      this.ws = null;
      this.wsLastMessageReceived = 0;
      /**
       * Whether to connect to other peers or not
       * @type {boolean}
       */
      this.shouldConnect = connect;

      /**
       * @type {number}
       */
      this._resyncInterval = 0;
      if (resyncInterval > 0) {
        this._resyncInterval = /** @type {any} */ (setInterval(() => {
          if (this.ws) {
            // resend sync step 1
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync);
            writeSyncStep1(encoder, doc);
            this.ws.send(toUint8Array(encoder));
          }
        }, resyncInterval));
      }

      /**
       * @param {ArrayBuffer} data
       */
      this._bcSubscriber = data => {
        this.mux(() => {
          const encoder = readMessage(this, new Uint8Array(data), false);
          if (length(encoder) > 1) {
            publish(this.bcChannel, toUint8Array(encoder));
          }
        });
      };
      /**
       * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
       * @param {Uint8Array} update
       * @param {any} origin
       */
      this._updateHandler = (update, origin) => {
        if (origin !== this || origin === null) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageSync);
          writeUpdate(encoder, update);
          broadcastMessage(this, toUint8Array(encoder));
        }
      };
      this.doc.on('update', this._updateHandler);
      /**
       * @param {any} changed
       * @param {any} origin
       */
      this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
        const changedClients = added.concat(updated).concat(removed);
        const encoder = createEncoder();
        writeVarUint(encoder, messageAwareness);
        writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, changedClients));
        broadcastMessage(this, toUint8Array(encoder));
      };
      window.addEventListener('beforeunload', () => {
        removeAwarenessStates(this.awareness, [doc.clientID], 'window unload');
      });
      awareness.on('update', this._awarenessUpdateHandler);
      this._checkInterval = /** @type {any} */ (setInterval(() => {
        if (this.wsconnected && messageReconnectTimeout < getUnixTime() - this.wsLastMessageReceived) {
          // no message received in a long time - not even your own awareness
          // updates (which are updated every 15 seconds)
          /** @type {WebSocket} */ (this.ws).close();
        }
      }, messageReconnectTimeout / 10));
      if (connect) {
        this.connect();
      }
    }

    /**
     * @type {boolean}
     */
    get synced () {
      return this._synced
    }

    set synced (state) {
      if (this._synced !== state) {
        this._synced = state;
        this.emit('synced', [state]);
        this.emit('sync', [state]);
      }
    }

    destroy () {
      if (this._resyncInterval !== 0) {
        clearInterval(this._resyncInterval);
      }
      clearInterval(this._checkInterval);
      this.disconnect();
      this.awareness.off('update', this._awarenessUpdateHandler);
      this.doc.off('update', this._updateHandler);
      super.destroy();
    }

    connectBc () {
      if (!this.bcconnected) {
        subscribe(this.bcChannel, this._bcSubscriber);
        this.bcconnected = true;
      }
      // send sync step1 to bc
      this.mux(() => {
        // write sync step 1
        const encoderSync = createEncoder();
        writeVarUint(encoderSync, messageSync);
        writeSyncStep1(encoderSync, this.doc);
        publish(this.bcChannel, toUint8Array(encoderSync));
        // broadcast local state
        const encoderState = createEncoder();
        writeVarUint(encoderState, messageSync);
        writeSyncStep2(encoderState, this.doc);
        publish(this.bcChannel, toUint8Array(encoderState));
        // write queryAwareness
        const encoderAwarenessQuery = createEncoder();
        writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
        publish(this.bcChannel, toUint8Array(encoderAwarenessQuery));
        // broadcast local awareness state
        const encoderAwarenessState = createEncoder();
        writeVarUint(encoderAwarenessState, messageAwareness);
        writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
        publish(this.bcChannel, toUint8Array(encoderAwarenessState));
      });
    }

    disconnectBc () {
      // broadcast message with local awareness state set to null (indicating disconnect)
      const encoder = createEncoder();
      writeVarUint(encoder, messageAwareness);
      writeVarUint8Array(encoder, encodeAwarenessUpdate(this.awareness, [this.doc.clientID], new Map()));
      broadcastMessage(this, toUint8Array(encoder));
      if (this.bcconnected) {
        unsubscribe(this.bcChannel, this._bcSubscriber);
        this.bcconnected = false;
      }
    }

    disconnect () {
      this.shouldConnect = false;
      this.disconnectBc();
      if (this.ws !== null) {
        this.ws.close();
      }
    }

    connect () {
      this.shouldConnect = true;
      if (!this.wsconnected && this.ws === null) {
        setupWS(this);
        this.connectBc();
      }
    }
  }

  var ace_1 = createCommonjsModule(function (module, exports) {
  (function(){function o(n){var i=e;n&&(e[n]||(e[n]={}),i=e[n]);if(!i.define||!i.define.packaged)t.original=i.define,i.define=t,i.define.packaged=!0;if(!i.require||!i.require.packaged)r.original=i.require,i.require=r,i.require.packaged=!0;}var ACE_NAMESPACE = "ace",e=function(){return this}();!e&&typeof window!="undefined"&&(e=window);var t=function(e,n,r){if(typeof e!="string"){t.original?t.original.apply(this,arguments):(console.error("dropping module because define wasn't a string."),console.trace());return}arguments.length==2&&(r=n),t.modules[e]||(t.payloads[e]=r,t.modules[e]=null);};t.modules={},t.payloads={};var n=function(e,t,n){if(typeof t=="string"){var i=s(e,t);if(i!=undefined)return n&&n(),i}else if(Object.prototype.toString.call(t)==="[object Array]"){var o=[];for(var u=0,a=t.length;u<a;++u){var f=s(e,t[u]);if(f==undefined&&r.original)return;o.push(f);}return n&&n.apply(null,o)||!0}},r=function(e,t){var i=n("",e,t);return i==undefined&&r.original?r.original.apply(this,arguments):i},i=function(e,t){if(t.indexOf("!")!==-1){var n=t.split("!");return i(e,n[0])+"!"+i(e,n[1])}if(t.charAt(0)=="."){var r=e.split("/").slice(0,-1).join("/");t=r+"/"+t;while(t.indexOf(".")!==-1&&s!=t){var s=t;t=t.replace(/\/\.\//,"/").replace(/[^\/]+\/\.\.\//,"");}}return t},s=function(e,r){r=i(e,r);var s=t.modules[r];if(!s){s=t.payloads[r];if(typeof s=="function"){var o={},u={id:r,uri:"",exports:o,packaged:!0},a=function(e,t){return n(r,e,t)},f=s(a,o,u);o=f||u.exports,t.modules[r]=o,delete t.payloads[r];}s=t.modules[r]=o||s;}return s};o(ACE_NAMESPACE);})(),ace.define("ace/lib/fixoldbrowsers",["require","exports","module"],function(e,t,n){typeof Element!="undefined"&&!Element.prototype.remove&&Object.defineProperty(Element.prototype,"remove",{enumerable:!1,writable:!0,configurable:!0,value:function(){this.parentNode&&this.parentNode.removeChild(this);}});}),ace.define("ace/lib/useragent",["require","exports","module"],function(e,t,n){t.OS={LINUX:"LINUX",MAC:"MAC",WINDOWS:"WINDOWS"},t.getOS=function(){return t.isMac?t.OS.MAC:t.isLinux?t.OS.LINUX:t.OS.WINDOWS};var r=typeof navigator=="object"?navigator:{},i=(/mac|win|linux/i.exec(r.platform)||["other"])[0].toLowerCase(),s=r.userAgent||"",o=r.appName||"";t.isWin=i=="win",t.isMac=i=="mac",t.isLinux=i=="linux",t.isIE=o=="Microsoft Internet Explorer"||o.indexOf("MSAppHost")>=0?parseFloat((s.match(/(?:MSIE |Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]):parseFloat((s.match(/(?:Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]),t.isOldIE=t.isIE&&t.isIE<9,t.isGecko=t.isMozilla=s.match(/ Gecko\/\d+/),t.isOpera=typeof opera=="object"&&Object.prototype.toString.call(window.opera)=="[object Opera]",t.isWebKit=parseFloat(s.split("WebKit/")[1])||undefined,t.isChrome=parseFloat(s.split(" Chrome/")[1])||undefined,t.isEdge=parseFloat(s.split(" Edge/")[1])||undefined,t.isAIR=s.indexOf("AdobeAIR")>=0,t.isAndroid=s.indexOf("Android")>=0,t.isChromeOS=s.indexOf(" CrOS ")>=0,t.isIOS=/iPad|iPhone|iPod/.test(s)&&!window.MSStream,t.isIOS&&(t.isMac=!0),t.isMobile=t.isIOS||t.isAndroid;}),ace.define("ace/lib/dom",["require","exports","module","ace/lib/useragent"],function(e,t,n){var r=e("./useragent"),i="http://www.w3.org/1999/xhtml";t.buildDom=function o(e,t,n){if(typeof e=="string"&&e){var r=document.createTextNode(e);return t&&t.appendChild(r),r}if(!Array.isArray(e))return e&&e.appendChild&&t&&t.appendChild(e),e;if(typeof e[0]!="string"||!e[0]){var i=[];for(var s=0;s<e.length;s++){var u=o(e[s],t,n);u&&i.push(u);}return i}var a=document.createElement(e[0]),f=e[1],l=1;f&&typeof f=="object"&&!Array.isArray(f)&&(l=2);for(var s=l;s<e.length;s++)o(e[s],a,n);return l==2&&Object.keys(f).forEach(function(e){var t=f[e];e==="class"?a.className=Array.isArray(t)?t.join(" "):t:typeof t=="function"||e=="value"||e[0]=="$"?a[e]=t:e==="ref"?n&&(n[t]=a):t!=null&&a.setAttribute(e,t);}),t&&t.appendChild(a),a},t.getDocumentHead=function(e){return e||(e=document),e.head||e.getElementsByTagName("head")[0]||e.documentElement},t.createElement=function(e,t){return document.createElementNS?document.createElementNS(t||i,e):document.createElement(e)},t.removeChildren=function(e){e.innerHTML="";},t.createTextNode=function(e,t){var n=t?t.ownerDocument:document;return n.createTextNode(e)},t.createFragment=function(e){var t=e?e.ownerDocument:document;return t.createDocumentFragment()},t.hasCssClass=function(e,t){var n=(e.className+"").split(/\s+/g);return n.indexOf(t)!==-1},t.addCssClass=function(e,n){t.hasCssClass(e,n)||(e.className+=" "+n);},t.removeCssClass=function(e,t){var n=e.className.split(/\s+/g);for(;;){var r=n.indexOf(t);if(r==-1)break;n.splice(r,1);}e.className=n.join(" ");},t.toggleCssClass=function(e,t){var n=e.className.split(/\s+/g),r=!0;for(;;){var i=n.indexOf(t);if(i==-1)break;r=!1,n.splice(i,1);}return r&&n.push(t),e.className=n.join(" "),r},t.setCssClass=function(e,n,r){r?t.addCssClass(e,n):t.removeCssClass(e,n);},t.hasCssString=function(e,t){var n=0,r;t=t||document;if(r=t.querySelectorAll("style"))while(n<r.length)if(r[n++].id===e)return !0},t.importCssString=function(n,r,i){var s=i;if(!i||!i.getRootNode)s=document;else {s=i.getRootNode();if(!s||s==i)s=document;}var o=s.ownerDocument||s;if(r&&t.hasCssString(r,s))return null;r&&(n+="\n/*# sourceURL=ace/css/"+r+" */");var u=t.createElement("style");u.appendChild(o.createTextNode(n)),r&&(u.id=r),s==o&&(s=t.getDocumentHead(o)),s.insertBefore(u,s.firstChild);},t.importCssStylsheet=function(e,n){t.buildDom(["link",{rel:"stylesheet",href:e}],t.getDocumentHead(n));},t.scrollbarWidth=function(e){var n=t.createElement("ace_inner");n.style.width="100%",n.style.minWidth="0px",n.style.height="200px",n.style.display="block";var r=t.createElement("ace_outer"),i=r.style;i.position="absolute",i.left="-10000px",i.overflow="hidden",i.width="200px",i.minWidth="0px",i.height="150px",i.display="block",r.appendChild(n);var s=e.documentElement;s.appendChild(r);var o=n.offsetWidth;i.overflow="scroll";var u=n.offsetWidth;return o==u&&(u=r.clientWidth),s.removeChild(r),o-u},typeof document=="undefined"&&(t.importCssString=function(){}),t.computedStyle=function(e,t){return window.getComputedStyle(e,"")||{}},t.setStyle=function(e,t,n){e[t]!==n&&(e[t]=n);},t.HAS_CSS_ANIMATION=!1,t.HAS_CSS_TRANSFORMS=!1,t.HI_DPI=r.isWin?typeof window!="undefined"&&window.devicePixelRatio>=1.5:!0;if(typeof document!="undefined"){var s=document.createElement("div");t.HI_DPI&&s.style.transform!==undefined&&(t.HAS_CSS_TRANSFORMS=!0),!r.isEdge&&typeof s.style.animationName!="undefined"&&(t.HAS_CSS_ANIMATION=!0),s=null;}t.HAS_CSS_TRANSFORMS?t.translate=function(e,t,n){e.style.transform="translate("+Math.round(t)+"px, "+Math.round(n)+"px)";}:t.translate=function(e,t,n){e.style.top=Math.round(n)+"px",e.style.left=Math.round(t)+"px";};}),ace.define("ace/lib/oop",["require","exports","module"],function(e,t,n){t.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}});},t.mixin=function(e,t){for(var n in t)e[n]=t[n];return e},t.implement=function(e,n){t.mixin(e,n);};}),ace.define("ace/lib/keys",["require","exports","module","ace/lib/oop"],function(e,t,n){var r=e("./oop"),i=function(){var e={MODIFIER_KEYS:{16:"Shift",17:"Ctrl",18:"Alt",224:"Meta",91:"MetaLeft",92:"MetaRight",93:"ContextMenu"},KEY_MODS:{ctrl:1,alt:2,option:2,shift:4,"super":8,meta:8,command:8,cmd:8,control:1},FUNCTION_KEYS:{8:"Backspace",9:"Tab",13:"Return",19:"Pause",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"Print",45:"Insert",46:"Delete",96:"Numpad0",97:"Numpad1",98:"Numpad2",99:"Numpad3",100:"Numpad4",101:"Numpad5",102:"Numpad6",103:"Numpad7",104:"Numpad8",105:"Numpad9","-13":"NumpadEnter",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Numlock",145:"Scrolllock"},PRINTABLE_KEYS:{32:" ",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",107:"+",109:"-",110:".",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",111:"/",106:"*"}},t,n;for(n in e.FUNCTION_KEYS)t=e.FUNCTION_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);for(n in e.PRINTABLE_KEYS)t=e.PRINTABLE_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);return r.mixin(e,e.MODIFIER_KEYS),r.mixin(e,e.PRINTABLE_KEYS),r.mixin(e,e.FUNCTION_KEYS),e.enter=e["return"],e.escape=e.esc,e.del=e["delete"],e[173]="-",function(){var t=["cmd","ctrl","alt","shift"];for(var n=Math.pow(2,t.length);n--;)e.KEY_MODS[n]=t.filter(function(t){return n&e.KEY_MODS[t]}).join("-")+"-";}(),e.KEY_MODS[0]="",e.KEY_MODS[-1]="input-",e}();r.mixin(t,i),t.keyCodeToString=function(e){var t=i[e];return typeof t!="string"&&(t=String.fromCharCode(e)),t.toLowerCase()};}),ace.define("ace/lib/event",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){function a(){u=!1;try{document.createComment("").addEventListener("test",function(){},{get passive(){u={passive:!1};}});}catch(e){}}function f(){return u==undefined&&a(),u}function l(e,t,n){this.elem=e,this.type=t,this.callback=n;}function d(e,t,n){var u=p(t);if(!i.isMac&&s){t.getModifierState&&(t.getModifierState("OS")||t.getModifierState("Win"))&&(u|=8);if(s.altGr){if((3&u)==3)return;s.altGr=0;}if(n===18||n===17){var a="location"in t?t.location:t.keyLocation;if(n===17&&a===1)s[n]==1&&(o=t.timeStamp);else if(n===18&&u===3&&a===2){var f=t.timeStamp-o;f<50&&(s.altGr=!0);}}}n in r.MODIFIER_KEYS&&(n=-1);if(!u&&n===13){var a="location"in t?t.location:t.keyLocation;if(a===3){e(t,u,-n);if(t.defaultPrevented)return}}if(i.isChromeOS&&u&8){e(t,u,n);if(t.defaultPrevented)return;u&=-9;}return !!u||n in r.FUNCTION_KEYS||n in r.PRINTABLE_KEYS?e(t,u,n):!1}function v(){s=Object.create(null);}var r=e("./keys"),i=e("./useragent"),s=null,o=0,u;l.prototype.destroy=function(){h(this.elem,this.type,this.callback),this.elem=this.type=this.callback=undefined;};var c=t.addListener=function(e,t,n,r){e.addEventListener(t,n,f()),r&&r.$toDestroy.push(new l(e,t,n));},h=t.removeListener=function(e,t,n){e.removeEventListener(t,n,f());};t.stopEvent=function(e){return t.stopPropagation(e),t.preventDefault(e),!1},t.stopPropagation=function(e){e.stopPropagation&&e.stopPropagation();},t.preventDefault=function(e){e.preventDefault&&e.preventDefault();},t.getButton=function(e){return e.type=="dblclick"?0:e.type=="contextmenu"||i.isMac&&e.ctrlKey&&!e.altKey&&!e.shiftKey?2:e.button},t.capture=function(e,t,n){function i(e){t&&t(e),n&&n(e),h(r,"mousemove",t),h(r,"mouseup",i),h(r,"dragstart",i);}var r=e&&e.ownerDocument||document;return c(r,"mousemove",t),c(r,"mouseup",i),c(r,"dragstart",i),i},t.addMouseWheelListener=function(e,t,n){"onmousewheel"in e?c(e,"mousewheel",function(e){var n=8;e.wheelDeltaX!==undefined?(e.wheelX=-e.wheelDeltaX/n,e.wheelY=-e.wheelDeltaY/n):(e.wheelX=0,e.wheelY=-e.wheelDelta/n),t(e);},n):"onwheel"in e?c(e,"wheel",function(e){var n=.35;switch(e.deltaMode){case e.DOM_DELTA_PIXEL:e.wheelX=e.deltaX*n||0,e.wheelY=e.deltaY*n||0;break;case e.DOM_DELTA_LINE:case e.DOM_DELTA_PAGE:e.wheelX=(e.deltaX||0)*5,e.wheelY=(e.deltaY||0)*5;}t(e);},n):c(e,"DOMMouseScroll",function(e){e.axis&&e.axis==e.HORIZONTAL_AXIS?(e.wheelX=(e.detail||0)*5,e.wheelY=0):(e.wheelX=0,e.wheelY=(e.detail||0)*5),t(e);},n);},t.addMultiMouseDownListener=function(e,n,r,s,o){function p(e){t.getButton(e)!==0?u=0:e.detail>1?(u++,u>4&&(u=1)):u=1;if(i.isIE){var o=Math.abs(e.clientX-a)>5||Math.abs(e.clientY-f)>5;if(!l||o)u=1;l&&clearTimeout(l),l=setTimeout(function(){l=null;},n[u-1]||600),u==1&&(a=e.clientX,f=e.clientY);}e._clicks=u,r[s]("mousedown",e);if(u>4)u=0;else if(u>1)return r[s](h[u],e)}var u=0,a,f,l,h={2:"dblclick",3:"tripleclick",4:"quadclick"};Array.isArray(e)||(e=[e]),e.forEach(function(e){c(e,"mousedown",p,o);});};var p=function(e){return 0|(e.ctrlKey?1:0)|(e.altKey?2:0)|(e.shiftKey?4:0)|(e.metaKey?8:0)};t.getModifierString=function(e){return r.KEY_MODS[p(e)]},t.addCommandKeyListener=function(e,n,r){if(i.isOldGecko||i.isOpera&&!("KeyboardEvent"in window)){var o=null;c(e,"keydown",function(e){o=e.keyCode;},r),c(e,"keypress",function(e){return d(n,e,o)},r);}else {var u=null;c(e,"keydown",function(e){s[e.keyCode]=(s[e.keyCode]||0)+1;var t=d(n,e,e.keyCode);return u=e.defaultPrevented,t},r),c(e,"keypress",function(e){u&&(e.ctrlKey||e.altKey||e.shiftKey||e.metaKey)&&(t.stopEvent(e),u=null);},r),c(e,"keyup",function(e){s[e.keyCode]=null;},r),s||(v(),c(window,"focus",v));}};if(typeof window=="object"&&window.postMessage&&!i.isOldIE){var m=1;t.nextTick=function(e,n){n=n||window;var r="zero-timeout-message-"+m++,i=function(s){s.data==r&&(t.stopPropagation(s),h(n,"message",i),e());};c(n,"message",i),n.postMessage(r,"*");};}t.$idleBlocked=!1,t.onIdle=function(e,n){return setTimeout(function r(){t.$idleBlocked?setTimeout(r,100):e();},n)},t.$idleBlockId=null,t.blockIdle=function(e){t.$idleBlockId&&clearTimeout(t.$idleBlockId),t.$idleBlocked=!0,t.$idleBlockId=setTimeout(function(){t.$idleBlocked=!1;},e||100);},t.nextFrame=typeof window=="object"&&(window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame),t.nextFrame?t.nextFrame=t.nextFrame.bind(window):t.nextFrame=function(e){setTimeout(e,17);};}),ace.define("ace/range",["require","exports","module"],function(e,t,n){var r=function(e,t){return e.row-t.row||e.column-t.column},i=function(e,t,n,r){this.start={row:e,column:t},this.end={row:n,column:r};};(function(){this.isEqual=function(e){return this.start.row===e.start.row&&this.end.row===e.end.row&&this.start.column===e.start.column&&this.end.column===e.end.column},this.toString=function(){return "Range: ["+this.start.row+"/"+this.start.column+"] -> ["+this.end.row+"/"+this.end.column+"]"},this.contains=function(e,t){return this.compare(e,t)==0},this.compareRange=function(e){var t,n=e.end,r=e.start;return t=this.compare(n.row,n.column),t==1?(t=this.compare(r.row,r.column),t==1?2:t==0?1:0):t==-1?-2:(t=this.compare(r.row,r.column),t==-1?-1:t==1?42:0)},this.comparePoint=function(e){return this.compare(e.row,e.column)},this.containsRange=function(e){return this.comparePoint(e.start)==0&&this.comparePoint(e.end)==0},this.intersects=function(e){var t=this.compareRange(e);return t==-1||t==0||t==1},this.isEnd=function(e,t){return this.end.row==e&&this.end.column==t},this.isStart=function(e,t){return this.start.row==e&&this.start.column==t},this.setStart=function(e,t){typeof e=="object"?(this.start.column=e.column,this.start.row=e.row):(this.start.row=e,this.start.column=t);},this.setEnd=function(e,t){typeof e=="object"?(this.end.column=e.column,this.end.row=e.row):(this.end.row=e,this.end.column=t);},this.inside=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)||this.isStart(e,t)?!1:!0:!1},this.insideStart=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)?!1:!0:!1},this.insideEnd=function(e,t){return this.compare(e,t)==0?this.isStart(e,t)?!1:!0:!1},this.compare=function(e,t){return !this.isMultiLine()&&e===this.start.row?t<this.start.column?-1:t>this.end.column?1:0:e<this.start.row?-1:e>this.end.row?1:this.start.row===e?t>=this.start.column?0:-1:this.end.row===e?t<=this.end.column?0:1:0},this.compareStart=function(e,t){return this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.compareEnd=function(e,t){return this.end.row==e&&this.end.column==t?1:this.compare(e,t)},this.compareInside=function(e,t){return this.end.row==e&&this.end.column==t?1:this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.clipRows=function(e,t){if(this.end.row>t)var n={row:t+1,column:0};else if(this.end.row<e)var n={row:e,column:0};if(this.start.row>t)var r={row:t+1,column:0};else if(this.start.row<e)var r={row:e,column:0};return i.fromPoints(r||this.start,n||this.end)},this.extend=function(e,t){var n=this.compare(e,t);if(n==0)return this;if(n==-1)var r={row:e,column:t};else var s={row:e,column:t};return i.fromPoints(r||this.start,s||this.end)},this.isEmpty=function(){return this.start.row===this.end.row&&this.start.column===this.end.column},this.isMultiLine=function(){return this.start.row!==this.end.row},this.clone=function(){return i.fromPoints(this.start,this.end)},this.collapseRows=function(){return this.end.column==0?new i(this.start.row,0,Math.max(this.start.row,this.end.row-1),0):new i(this.start.row,0,this.end.row,0)},this.toScreenRange=function(e){var t=e.documentToScreenPosition(this.start),n=e.documentToScreenPosition(this.end);return new i(t.row,t.column,n.row,n.column)},this.moveBy=function(e,t){this.start.row+=e,this.start.column+=t,this.end.row+=e,this.end.column+=t;};}).call(i.prototype),i.fromPoints=function(e,t){return new i(e.row,e.column,t.row,t.column)},i.comparePoints=r,i.comparePoints=function(e,t){return e.row-t.row||e.column-t.column},t.Range=i;}),ace.define("ace/lib/lang",["require","exports","module"],function(e,t,n){t.last=function(e){return e[e.length-1]},t.stringReverse=function(e){return e.split("").reverse().join("")},t.stringRepeat=function(e,t){var n="";while(t>0){t&1&&(n+=e);if(t>>=1)e+=e;}return n};var r=/^\s\s*/,i=/\s\s*$/;t.stringTrimLeft=function(e){return e.replace(r,"")},t.stringTrimRight=function(e){return e.replace(i,"")},t.copyObject=function(e){var t={};for(var n in e)t[n]=e[n];return t},t.copyArray=function(e){var t=[];for(var n=0,r=e.length;n<r;n++)e[n]&&typeof e[n]=="object"?t[n]=this.copyObject(e[n]):t[n]=e[n];return t},t.deepCopy=function s(e){if(typeof e!="object"||!e)return e;var t;if(Array.isArray(e)){t=[];for(var n=0;n<e.length;n++)t[n]=s(e[n]);return t}if(Object.prototype.toString.call(e)!=="[object Object]")return e;t={};for(var n in e)t[n]=s(e[n]);return t},t.arrayToMap=function(e){var t={};for(var n=0;n<e.length;n++)t[e[n]]=1;return t},t.createMap=function(e){var t=Object.create(null);for(var n in e)t[n]=e[n];return t},t.arrayRemove=function(e,t){for(var n=0;n<=e.length;n++)t===e[n]&&e.splice(n,1);},t.escapeRegExp=function(e){return e.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")},t.escapeHTML=function(e){return (""+e).replace(/&/g,"&#38;").replace(/"/g,"&#34;").replace(/'/g,"&#39;").replace(/</g,"&#60;")},t.getMatchOffsets=function(e,t){var n=[];return e.replace(t,function(e){n.push({offset:arguments[arguments.length-2],length:e.length});}),n},t.deferredCall=function(e){var t=null,n=function(){t=null,e();},r=function(e){return r.cancel(),t=setTimeout(n,e||0),r};return r.schedule=r,r.call=function(){return this.cancel(),e(),r},r.cancel=function(){return clearTimeout(t),t=null,r},r.isPending=function(){return t},r},t.delayedCall=function(e,t){var n=null,r=function(){n=null,e();},i=function(e){n==null&&(n=setTimeout(r,e||t));};return i.delay=function(e){n&&clearTimeout(n),n=setTimeout(r,e||t);},i.schedule=i,i.call=function(){this.cancel(),e();},i.cancel=function(){n&&clearTimeout(n),n=null;},i.isPending=function(){return n},i};}),ace.define("ace/clipboard",["require","exports","module"],function(e,t,n){var r;n.exports={lineMode:!1,pasteCancelled:function(){return r&&r>Date.now()-50?!0:r=!1},cancel:function(){r=Date.now();}};}),ace.define("ace/keyboard/textinput",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/lib/dom","ace/lib/lang","ace/clipboard","ace/lib/keys"],function(e,t,n){var r=e("../lib/event"),i=e("../lib/useragent"),s=e("../lib/dom"),o=e("../lib/lang"),u=e("../clipboard"),a=i.isChrome<18,f=i.isIE,l=i.isChrome>63,c=400,h=e("../lib/keys"),p=h.KEY_MODS,d=i.isIOS,v=d?/\s/:/\n/,m=i.isMobile,g=function(e,t){function X(){x=!0,n.blur(),n.focus(),x=!1;}function $(e){e.keyCode==27&&n.value.length<n.selectionStart&&(b||(T=n.value),N=C=-1,O()),V();}function K(){clearTimeout(J),J=setTimeout(function(){E&&(n.style.cssText=E,E=""),t.renderer.$isMousePressed=!1,t.renderer.$keepTextAreaAtCursor&&t.renderer.$moveTextAreaToCursor();},0);}function G(e,t,n){var r=null,i=!1;n.addEventListener("keydown",function(e){r&&clearTimeout(r),i=!0;},!0),n.addEventListener("keyup",function(e){r=setTimeout(function(){i=!1;},100);},!0);var s=function(e){if(document.activeElement!==n)return;if(i||b||t.$mouseHandler.isMousePressed)return;if(g)return;var r=n.selectionStart,s=n.selectionEnd,o=null,u=0;if(r==0)o=h.up;else if(r==1)o=h.home;else if(s>C&&T[s]=="\n")o=h.end;else if(r<N&&T[r-1]==" ")o=h.left,u=p.option;else if(r<N||r==N&&C!=N&&r==s)o=h.left;else if(s>C&&T.slice(0,s).split("\n").length>2)o=h.down;else if(s>C&&T[s-1]==" ")o=h.right,u=p.option;else if(s>C||s==C&&C!=N&&r==s)o=h.right;r!==s&&(u|=p.shift);if(o){var a=t.onCommandKey({},u,o);if(!a&&t.commands){o=h.keyCodeToString(o);var f=t.commands.findKeyCommand(u,o);f&&t.execCommand(f);}N=r,C=s,O("");}};document.addEventListener("selectionchange",s),t.on("destroy",function(){document.removeEventListener("selectionchange",s);});}var n=s.createElement("textarea");n.className="ace_text-input",n.setAttribute("wrap","off"),n.setAttribute("autocorrect","off"),n.setAttribute("autocapitalize","off"),n.setAttribute("spellcheck",!1),n.style.opacity="0",e.insertBefore(n,e.firstChild);var g=!1,y=!1,b=!1,w=!1,E="";m||(n.style.fontSize="1px");var S=!1,x=!1,T="",N=0,C=0,k=0;try{var L=document.activeElement===n;}catch(A){}r.addListener(n,"blur",function(e){if(x)return;t.onBlur(e),L=!1;},t),r.addListener(n,"focus",function(e){if(x)return;L=!0;if(i.isEdge)try{if(!document.hasFocus())return}catch(e){}t.onFocus(e),i.isEdge?setTimeout(O):O();},t),this.$focusScroll=!1,this.focus=function(){if(E||l||this.$focusScroll=="browser")return n.focus({preventScroll:!0});var e=n.style.top;n.style.position="fixed",n.style.top="0px";try{var t=n.getBoundingClientRect().top!=0;}catch(r){return}var i=[];if(t){var s=n.parentElement;while(s&&s.nodeType==1)i.push(s),s.setAttribute("ace_nocontext",!0),!s.parentElement&&s.getRootNode?s=s.getRootNode().host:s=s.parentElement;}n.focus({preventScroll:!0}),t&&i.forEach(function(e){e.removeAttribute("ace_nocontext");}),setTimeout(function(){n.style.position="",n.style.top=="0px"&&(n.style.top=e);},0);},this.blur=function(){n.blur();},this.isFocused=function(){return L},t.on("beforeEndOperation",function(){var e=t.curOp,r=e&&e.command&&e.command.name;if(r=="insertstring")return;var i=r&&(e.docChanged||e.selectionChanged);b&&i&&(T=n.value="",W()),O();});var O=d?function(e){if(!L||g&&!e||w)return;e||(e="");var r="\n ab"+e+"cde fg\n";r!=n.value&&(n.value=T=r);var i=4,s=4+(e.length||(t.selection.isEmpty()?0:1));(N!=i||C!=s)&&n.setSelectionRange(i,s),N=i,C=s;}:function(){if(b||w)return;if(!L&&!P)return;b=!0;var e=0,r=0,i="";if(t.session){var s=t.selection,o=s.getRange(),u=s.cursor.row;e=o.start.column,r=o.end.column,i=t.session.getLine(u);if(o.start.row!=u){var a=t.session.getLine(u-1);e=o.start.row<u-1?0:e,r+=a.length+1,i=a+"\n"+i;}else if(o.end.row!=u){var f=t.session.getLine(u+1);r=o.end.row>u+1?f.length:r,r+=i.length+1,i=i+"\n"+f;}else m&&u>0&&(i="\n"+i,r+=1,e+=1);i.length>c&&(e<c&&r<c?i=i.slice(0,c):(i="\n",e==r?e=r=0:(e=0,r=1)));}var l=i+"\n\n";l!=T&&(n.value=T=l,N=C=l.length),P&&(N=n.selectionStart,C=n.selectionEnd);if(C!=r||N!=e||n.selectionEnd!=C)try{n.setSelectionRange(e,r),N=e,C=r;}catch(h){}b=!1;};this.resetSelection=O,L&&t.onFocus();var M=function(e){return e.selectionStart===0&&e.selectionEnd>=T.length&&e.value===T&&T&&e.selectionEnd!==C},_=function(e){if(b)return;g?g=!1:M(n)?(t.selectAll(),O()):m&&n.selectionStart!=N&&O();},D=null;this.setInputHandler=function(e){D=e;},this.getInputHandler=function(){return D};var P=!1,H=function(e,r){P&&(P=!1);if(y)return O(),e&&t.onPaste(e),y=!1,"";var s=n.selectionStart,o=n.selectionEnd,u=N,a=T.length-C,f=e,l=e.length-s,c=e.length-o,h=0;while(u>0&&T[h]==e[h])h++,u--;f=f.slice(h),h=1;while(a>0&&T.length-h>N-1&&T[T.length-h]==e[e.length-h])h++,a--;l-=h-1,c-=h-1;var p=f.length-h+1;p<0&&(u=-p,p=0),f=f.slice(0,p);if(!r&&!f&&!l&&!u&&!a&&!c)return "";w=!0;var d=!1;return i.isAndroid&&f==". "&&(f="  ",d=!0),f&&!u&&!a&&!l&&!c||S?t.onTextInput(f):t.onTextInput(f,{extendLeft:u,extendRight:a,restoreStart:l,restoreEnd:c}),w=!1,T=e,N=s,C=o,k=c,d?"\n":f},B=function(e){if(b)return z();if(e&&e.inputType){if(e.inputType=="historyUndo")return t.execCommand("undo");if(e.inputType=="historyRedo")return t.execCommand("redo")}var r=n.value,i=H(r,!0);(r.length>c+100||v.test(i)||m&&N<1&&N==C)&&O();},j=function(e,t,n){var r=e.clipboardData||window.clipboardData;if(!r||a)return;var i=f||n?"Text":"text/plain";try{return t?r.setData(i,t)!==!1:r.getData(i)}catch(e){if(!n)return j(e,t,!0)}},F=function(e,i){var s=t.getCopyText();if(!s)return r.preventDefault(e);j(e,s)?(d&&(O(s),g=s,setTimeout(function(){g=!1;},10)),i?t.onCut():t.onCopy(),r.preventDefault(e)):(g=!0,n.value=s,n.select(),setTimeout(function(){g=!1,O(),i?t.onCut():t.onCopy();}));},I=function(e){F(e,!0);},q=function(e){F(e,!1);},R=function(e){var s=j(e);if(u.pasteCancelled())return;typeof s=="string"?(s&&t.onPaste(s,e),i.isIE&&setTimeout(O),r.preventDefault(e)):(n.value="",y=!0);};r.addCommandKeyListener(n,t.onCommandKey.bind(t),t),r.addListener(n,"select",_,t),r.addListener(n,"input",B,t),r.addListener(n,"cut",I,t),r.addListener(n,"copy",q,t),r.addListener(n,"paste",R,t),(!("oncut"in n)||!("oncopy"in n)||!("onpaste"in n))&&r.addListener(e,"keydown",function(e){if(i.isMac&&!e.metaKey||!e.ctrlKey)return;switch(e.keyCode){case 67:q(e);break;case 86:R(e);break;case 88:I(e);}},t);var U=function(e){if(b||!t.onCompositionStart||t.$readOnly)return;b={};if(S)return;e.data&&(b.useTextareaForIME=!1),setTimeout(z,0),t._signal("compositionStart"),t.on("mousedown",X);var r=t.getSelectionRange();r.end.row=r.start.row,r.end.column=r.start.column,b.markerRange=r,b.selectionStart=N,t.onCompositionStart(b),b.useTextareaForIME?(T=n.value="",N=0,C=0):(n.msGetInputContext&&(b.context=n.msGetInputContext()),n.getInputContext&&(b.context=n.getInputContext()));},z=function(){if(!b||!t.onCompositionUpdate||t.$readOnly)return;if(S)return X();if(b.useTextareaForIME)t.onCompositionUpdate(n.value);else {var e=n.value;H(e),b.markerRange&&(b.context&&(b.markerRange.start.column=b.selectionStart=b.context.compositionStartOffset),b.markerRange.end.column=b.markerRange.start.column+C-b.selectionStart+k);}},W=function(e){if(!t.onCompositionEnd||t.$readOnly)return;b=!1,t.onCompositionEnd(),t.off("mousedown",X),e&&B();},V=o.delayedCall(z,50).schedule.bind(null,null);r.addListener(n,"compositionstart",U,t),r.addListener(n,"compositionupdate",z,t),r.addListener(n,"keyup",$,t),r.addListener(n,"keydown",V,t),r.addListener(n,"compositionend",W,t),this.getElement=function(){return n},this.setCommandMode=function(e){S=e,n.readOnly=!1;},this.setReadOnly=function(e){S||(n.readOnly=e);},this.setCopyWithEmptySelection=function(e){},this.onContextMenu=function(e){P=!0,O(),t._emit("nativecontextmenu",{target:t,domEvent:e}),this.moveToMouse(e,!0);},this.moveToMouse=function(e,o){E||(E=n.style.cssText),n.style.cssText=(o?"z-index:100000;":"")+(i.isIE?"opacity:0.1;":"")+"text-indent: -"+(N+C)*t.renderer.characterWidth*.5+"px;";var u=t.container.getBoundingClientRect(),a=s.computedStyle(t.container),f=u.top+(parseInt(a.borderTopWidth)||0),l=u.left+(parseInt(u.borderLeftWidth)||0),c=u.bottom-f-n.clientHeight-2,h=function(e){s.translate(n,e.clientX-l-2,Math.min(e.clientY-f-2,c));};h(e);if(e.type!="mousedown")return;t.renderer.$isMousePressed=!0,clearTimeout(J),i.isWin&&r.capture(t.container,h,K);},this.onContextMenuClose=K;var J,Q=function(e){t.textInput.onContextMenu(e),K();};r.addListener(n,"mouseup",Q,t),r.addListener(n,"mousedown",function(e){e.preventDefault(),K();},t),r.addListener(t.renderer.scroller,"contextmenu",Q,t),r.addListener(n,"contextmenu",Q,t),d&&G(e,t,n);};t.TextInput=g,t.$setUserAgentForTests=function(e,t){m=e,d=t;};}),ace.define("ace/mouse/default_handlers",["require","exports","module","ace/lib/useragent"],function(e,t,n){function o(e){e.$clickSelection=null;var t=e.editor;t.setDefaultHandler("mousedown",this.onMouseDown.bind(e)),t.setDefaultHandler("dblclick",this.onDoubleClick.bind(e)),t.setDefaultHandler("tripleclick",this.onTripleClick.bind(e)),t.setDefaultHandler("quadclick",this.onQuadClick.bind(e)),t.setDefaultHandler("mousewheel",this.onMouseWheel.bind(e));var n=["select","startSelect","selectEnd","selectAllEnd","selectByWordsEnd","selectByLinesEnd","dragWait","dragWaitEnd","focusWait"];n.forEach(function(t){e[t]=this[t];},this),e.selectByLines=this.extendSelectionBy.bind(e,"getLineRange"),e.selectByWords=this.extendSelectionBy.bind(e,"getWordRange");}function u(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}function a(e,t){if(e.start.row==e.end.row)var n=2*t.column-e.start.column-e.end.column;else if(e.start.row==e.end.row-1&&!e.start.column&&!e.end.column)var n=t.column-4;else var n=2*t.row-e.start.row-e.end.row;return n<0?{cursor:e.start,anchor:e.end}:{cursor:e.end,anchor:e.start}}var r=e("../lib/useragent"),i=0,s=550;(function(){this.onMouseDown=function(e){var t=e.inSelection(),n=e.getDocumentPosition();this.mousedownEvent=e;var i=this.editor,s=e.getButton();if(s!==0){var o=i.getSelectionRange(),u=o.isEmpty();(u||s==1)&&i.selection.moveToPosition(n),s==2&&(i.textInput.onContextMenu(e.domEvent),r.isMozilla||e.preventDefault());return}this.mousedownEvent.time=Date.now();if(t&&!i.isFocused()){i.focus();if(this.$focusTimeout&&!this.$clickSelection&&!i.inMultiSelectMode){this.setState("focusWait"),this.captureMouse(e);return}}return this.captureMouse(e),this.startSelect(n,e.domEvent._clicks>1),e.preventDefault()},this.startSelect=function(e,t){e=e||this.editor.renderer.screenToTextCoordinates(this.x,this.y);var n=this.editor;if(!this.mousedownEvent)return;this.mousedownEvent.getShiftKey()?n.selection.selectToPosition(e):t||n.selection.moveToPosition(e),t||this.select(),n.renderer.scroller.setCapture&&n.renderer.scroller.setCapture(),n.setStyle("ace_selecting"),this.setState("select");},this.select=function(){var e,t=this.editor,n=t.renderer.screenToTextCoordinates(this.x,this.y);if(this.$clickSelection){var r=this.$clickSelection.comparePoint(n);if(r==-1)e=this.$clickSelection.end;else if(r==1)e=this.$clickSelection.start;else {var i=a(this.$clickSelection,n);n=i.cursor,e=i.anchor;}t.selection.setSelectionAnchor(e.row,e.column);}t.selection.selectToPosition(n),t.renderer.scrollCursorIntoView();},this.extendSelectionBy=function(e){var t,n=this.editor,r=n.renderer.screenToTextCoordinates(this.x,this.y),i=n.selection[e](r.row,r.column);if(this.$clickSelection){var s=this.$clickSelection.comparePoint(i.start),o=this.$clickSelection.comparePoint(i.end);if(s==-1&&o<=0){t=this.$clickSelection.end;if(i.end.row!=r.row||i.end.column!=r.column)r=i.start;}else if(o==1&&s>=0){t=this.$clickSelection.start;if(i.start.row!=r.row||i.start.column!=r.column)r=i.end;}else if(s==-1&&o==1)r=i.end,t=i.start;else {var u=a(this.$clickSelection,r);r=u.cursor,t=u.anchor;}n.selection.setSelectionAnchor(t.row,t.column);}n.selection.selectToPosition(r),n.renderer.scrollCursorIntoView();},this.selectEnd=this.selectAllEnd=this.selectByWordsEnd=this.selectByLinesEnd=function(){this.$clickSelection=null,this.editor.unsetStyle("ace_selecting"),this.editor.renderer.scroller.releaseCapture&&this.editor.renderer.scroller.releaseCapture();},this.focusWait=function(){var e=u(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y),t=Date.now();(e>i||t-this.mousedownEvent.time>this.$focusTimeout)&&this.startSelect(this.mousedownEvent.getDocumentPosition());},this.onDoubleClick=function(e){var t=e.getDocumentPosition(),n=this.editor,r=n.session,i=r.getBracketRange(t);i?(i.isEmpty()&&(i.start.column--,i.end.column++),this.setState("select")):(i=n.selection.getWordRange(t.row,t.column),this.setState("selectByWords")),this.$clickSelection=i,this.select();},this.onTripleClick=function(e){var t=e.getDocumentPosition(),n=this.editor;this.setState("selectByLines");var r=n.getSelectionRange();r.isMultiLine()&&r.contains(t.row,t.column)?(this.$clickSelection=n.selection.getLineRange(r.start.row),this.$clickSelection.end=n.selection.getLineRange(r.end.row).end):this.$clickSelection=n.selection.getLineRange(t.row),this.select();},this.onQuadClick=function(e){var t=this.editor;t.selectAll(),this.$clickSelection=t.getSelectionRange(),this.setState("selectAll");},this.onMouseWheel=function(e){if(e.getAccelKey())return;e.getShiftKey()&&e.wheelY&&!e.wheelX&&(e.wheelX=e.wheelY,e.wheelY=0);var t=this.editor;this.$lastScroll||(this.$lastScroll={t:0,vx:0,vy:0,allowed:0});var n=this.$lastScroll,r=e.domEvent.timeStamp,i=r-n.t,o=i?e.wheelX/i:n.vx,u=i?e.wheelY/i:n.vy;i<s&&(o=(o+n.vx)/2,u=(u+n.vy)/2);var a=Math.abs(o/u),f=!1;a>=1&&t.renderer.isScrollableBy(e.wheelX*e.speed,0)&&(f=!0),a<=1&&t.renderer.isScrollableBy(0,e.wheelY*e.speed)&&(f=!0);if(f)n.allowed=r;else if(r-n.allowed<s){var l=Math.abs(o)<=1.5*Math.abs(n.vx)&&Math.abs(u)<=1.5*Math.abs(n.vy);l?(f=!0,n.allowed=r):n.allowed=0;}n.t=r,n.vx=o,n.vy=u;if(f)return t.renderer.scrollBy(e.wheelX*e.speed,e.wheelY*e.speed),e.stop()};}).call(o.prototype),t.DefaultHandlers=o;}),ace.define("ace/tooltip",["require","exports","module","ace/lib/oop","ace/lib/dom"],function(e,t,n){function s(e){this.isOpen=!1,this.$element=null,this.$parentNode=e;}var r=e("./lib/oop"),i=e("./lib/dom");(function(){this.$init=function(){return this.$element=i.createElement("div"),this.$element.className="ace_tooltip",this.$element.style.display="none",this.$parentNode.appendChild(this.$element),this.$element},this.getElement=function(){return this.$element||this.$init()},this.setText=function(e){this.getElement().textContent=e;},this.setHtml=function(e){this.getElement().innerHTML=e;},this.setPosition=function(e,t){this.getElement().style.left=e+"px",this.getElement().style.top=t+"px";},this.setClassName=function(e){i.addCssClass(this.getElement(),e);},this.show=function(e,t,n){e!=null&&this.setText(e),t!=null&&n!=null&&this.setPosition(t,n),this.isOpen||(this.getElement().style.display="block",this.isOpen=!0);},this.hide=function(){this.isOpen&&(this.getElement().style.display="none",this.isOpen=!1);},this.getHeight=function(){return this.getElement().offsetHeight},this.getWidth=function(){return this.getElement().offsetWidth},this.destroy=function(){this.isOpen=!1,this.$element&&this.$element.parentNode&&this.$element.parentNode.removeChild(this.$element);};}).call(s.prototype),t.Tooltip=s;}),ace.define("ace/mouse/default_gutter_handler",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/tooltip"],function(e,t,n){function u(e){function l(){var r=u.getDocumentPosition().row,s=n.$annotations[r];if(!s)return c();var o=t.session.getLength();if(r==o){var a=t.renderer.pixelToScreenCoordinates(0,u.y).row,l=u.$pos;if(a>t.session.documentToScreenRow(l.row,l.column))return c()}if(f==s)return;f=s.text.join("<br/>"),i.setHtml(f),i.show(),t._signal("showGutterTooltip",i),t.on("mousewheel",c);if(e.$tooltipFollowsMouse)h(u);else {var p=u.domEvent.target,d=p.getBoundingClientRect(),v=i.getElement().style;v.left=d.right+"px",v.top=d.bottom+"px";}}function c(){o&&(o=clearTimeout(o)),f&&(i.hide(),f=null,t._signal("hideGutterTooltip",i),t.off("mousewheel",c));}function h(e){i.setPosition(e.x,e.y);}var t=e.editor,n=t.renderer.$gutterLayer,i=new a(t.container);e.editor.setDefaultHandler("guttermousedown",function(r){if(!t.isFocused()||r.getButton()!=0)return;var i=n.getRegion(r);if(i=="foldWidgets")return;var s=r.getDocumentPosition().row,o=t.session.selection;if(r.getShiftKey())o.selectTo(s,0);else {if(r.domEvent.detail==2)return t.selectAll(),r.preventDefault();e.$clickSelection=t.selection.getLineRange(s);}return e.setState("selectByLines"),e.captureMouse(r),r.preventDefault()});var o,u,f;e.editor.setDefaultHandler("guttermousemove",function(t){var n=t.domEvent.target||t.domEvent.srcElement;if(r.hasCssClass(n,"ace_fold-widget"))return c();f&&e.$tooltipFollowsMouse&&h(t),u=t;if(o)return;o=setTimeout(function(){o=null,u&&!e.isMousePressed?l():c();},50);}),s.addListener(t.renderer.$gutter,"mouseout",function(e){u=null;if(!f||o)return;o=setTimeout(function(){o=null,c();},50);},t),t.on("changeSession",c);}function a(e){o.call(this,e);}var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/event"),o=e("../tooltip").Tooltip;i.inherits(a,o),function(){this.setPosition=function(e,t){var n=window.innerWidth||document.documentElement.clientWidth,r=window.innerHeight||document.documentElement.clientHeight,i=this.getWidth(),s=this.getHeight();e+=15,t+=15,e+i>n&&(e-=e+i-n),t+s>r&&(t-=20+s),o.prototype.setPosition.call(this,e,t);};}.call(a.prototype),t.GutterHandler=u;}),ace.define("ace/mouse/mouse_event",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){var r=e("../lib/event"),i=e("../lib/useragent"),s=t.MouseEvent=function(e,t){this.domEvent=e,this.editor=t,this.x=this.clientX=e.clientX,this.y=this.clientY=e.clientY,this.$pos=null,this.$inSelection=null,this.propagationStopped=!1,this.defaultPrevented=!1;};(function(){this.stopPropagation=function(){r.stopPropagation(this.domEvent),this.propagationStopped=!0;},this.preventDefault=function(){r.preventDefault(this.domEvent),this.defaultPrevented=!0;},this.stop=function(){this.stopPropagation(),this.preventDefault();},this.getDocumentPosition=function(){return this.$pos?this.$pos:(this.$pos=this.editor.renderer.screenToTextCoordinates(this.clientX,this.clientY),this.$pos)},this.inSelection=function(){if(this.$inSelection!==null)return this.$inSelection;var e=this.editor,t=e.getSelectionRange();if(t.isEmpty())this.$inSelection=!1;else {var n=this.getDocumentPosition();this.$inSelection=t.contains(n.row,n.column);}return this.$inSelection},this.getButton=function(){return r.getButton(this.domEvent)},this.getShiftKey=function(){return this.domEvent.shiftKey},this.getAccelKey=i.isMac?function(){return this.domEvent.metaKey}:function(){return this.domEvent.ctrlKey};}).call(s.prototype);}),ace.define("ace/mouse/dragdrop_handler",["require","exports","module","ace/lib/dom","ace/lib/event","ace/lib/useragent"],function(e,t,n){function f(e){function T(e,n){var r=Date.now(),i=!n||e.row!=n.row,s=!n||e.column!=n.column;if(!S||i||s)t.moveCursorToPosition(e),S=r,x={x:p,y:d};else {var o=l(x.x,x.y,p,d);o>a?S=null:r-S>=u&&(t.renderer.scrollCursorIntoView(),S=null);}}function N(e,n){var r=Date.now(),i=t.renderer.layerConfig.lineHeight,s=t.renderer.layerConfig.characterWidth,u=t.renderer.scroller.getBoundingClientRect(),a={x:{left:p-u.left,right:u.right-p},y:{top:d-u.top,bottom:u.bottom-d}},f=Math.min(a.x.left,a.x.right),l=Math.min(a.y.top,a.y.bottom),c={row:e.row,column:e.column};f/s<=2&&(c.column+=a.x.left<a.x.right?-3:2),l/i<=1&&(c.row+=a.y.top<a.y.bottom?-1:1);var h=e.row!=c.row,v=e.column!=c.column,m=!n||e.row!=n.row;h||v&&!m?E?r-E>=o&&t.renderer.scrollCursorIntoView(c):E=r:E=null;}function C(){var e=g;g=t.renderer.screenToTextCoordinates(p,d),T(g,e),N(g,e);}function k(){m=t.selection.toOrientedRange(),h=t.session.addMarker(m,"ace_selection",t.getSelectionStyle()),t.clearSelection(),t.isFocused()&&t.renderer.$cursorLayer.setBlinking(!1),clearInterval(v),C(),v=setInterval(C,20),y=0,i.addListener(document,"mousemove",O);}function L(){clearInterval(v),t.session.removeMarker(h),h=null,t.selection.fromOrientedRange(m),t.isFocused()&&!w&&t.$resetCursorStyle(),m=null,g=null,y=0,E=null,S=null,i.removeListener(document,"mousemove",O);}function O(){A==null&&(A=setTimeout(function(){A!=null&&h&&L();},20));}function M(e){var t=e.types;return !t||Array.prototype.some.call(t,function(e){return e=="text/plain"||e=="Text"})}function _(e){var t=["copy","copymove","all","uninitialized"],n=["move","copymove","linkmove","all","uninitialized"],r=s.isMac?e.altKey:e.ctrlKey,i="uninitialized";try{i=e.dataTransfer.effectAllowed.toLowerCase();}catch(e){}var o="none";return r&&t.indexOf(i)>=0?o="copy":n.indexOf(i)>=0?o="move":t.indexOf(i)>=0&&(o="copy"),o}var t=e.editor,n=r.createElement("img");n.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",s.isOpera&&(n.style.cssText="width:1px;height:1px;position:fixed;top:0;left:0;z-index:2147483647;opacity:0;");var f=["dragWait","dragWaitEnd","startDrag","dragReadyEnd","onMouseDrag"];f.forEach(function(t){e[t]=this[t];},this),t.on("mousedown",this.onMouseDown.bind(e));var c=t.container,h,p,d,v,m,g,y=0,b,w,E,S,x;this.onDragStart=function(e){if(this.cancelDrag||!c.draggable){var r=this;return setTimeout(function(){r.startSelect(),r.captureMouse(e);},0),e.preventDefault()}m=t.getSelectionRange();var i=e.dataTransfer;i.effectAllowed=t.getReadOnly()?"copy":"copyMove",s.isOpera&&(t.container.appendChild(n),n.scrollTop=0),i.setDragImage&&i.setDragImage(n,0,0),s.isOpera&&t.container.removeChild(n),i.clearData(),i.setData("Text",t.session.getTextRange()),w=!0,this.setState("drag");},this.onDragEnd=function(e){c.draggable=!1,w=!1,this.setState(null);if(!t.getReadOnly()){var n=e.dataTransfer.dropEffect;!b&&n=="move"&&t.session.remove(t.getSelectionRange()),t.$resetCursorStyle();}this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle("");},this.onDragEnter=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||k(),y++,e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragOver=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||(k(),y++),A!==null&&(A=null),e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragLeave=function(e){y--;if(y<=0&&h)return L(),b=null,i.preventDefault(e)},this.onDrop=function(e){if(!g)return;var n=e.dataTransfer;if(w)switch(b){case"move":m.contains(g.row,g.column)?m={start:g,end:g}:m=t.moveText(m,g);break;case"copy":m=t.moveText(m,g,!0);}else {var r=n.getData("Text");m={start:g,end:t.session.insert(g,r)},t.focus(),b=null;}return L(),i.preventDefault(e)},i.addListener(c,"dragstart",this.onDragStart.bind(e),t),i.addListener(c,"dragend",this.onDragEnd.bind(e),t),i.addListener(c,"dragenter",this.onDragEnter.bind(e),t),i.addListener(c,"dragover",this.onDragOver.bind(e),t),i.addListener(c,"dragleave",this.onDragLeave.bind(e),t),i.addListener(c,"drop",this.onDrop.bind(e),t);var A=null;}function l(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}var r=e("../lib/dom"),i=e("../lib/event"),s=e("../lib/useragent"),o=200,u=200,a=5;(function(){this.dragWait=function(){var e=Date.now()-this.mousedownEvent.time;e>this.editor.getDragDelay()&&this.startDrag();},this.dragWaitEnd=function(){var e=this.editor.container;e.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()),this.selectEnd();},this.dragReadyEnd=function(e){this.editor.$resetCursorStyle(),this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle(""),this.dragWaitEnd();},this.startDrag=function(){this.cancelDrag=!1;var e=this.editor,t=e.container;t.draggable=!0,e.renderer.$cursorLayer.setBlinking(!1),e.setStyle("ace_dragging");var n=s.isWin?"default":"move";e.renderer.setCursorStyle(n),this.setState("dragReady");},this.onMouseDrag=function(e){var t=this.editor.container;if(s.isIE&&this.state=="dragReady"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>3&&t.dragDrop();}if(this.state==="dragWait"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>0&&(t.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()));}},this.onMouseDown=function(e){if(!this.$dragEnabled)return;this.mousedownEvent=e;var t=this.editor,n=e.inSelection(),r=e.getButton(),i=e.domEvent.detail||1;if(i===1&&r===0&&n){if(e.editor.inMultiSelectMode&&(e.getAccelKey()||e.getShiftKey()))return;this.mousedownEvent.time=Date.now();var o=e.domEvent.target||e.domEvent.srcElement;"unselectable"in o&&(o.unselectable="on");if(t.getDragDelay()){if(s.isWebKit){this.cancelDrag=!0;var u=t.container;u.draggable=!0;}this.setState("dragWait");}else this.startDrag();this.captureMouse(e,this.onMouseDrag.bind(this)),e.defaultPrevented=!0;}};}).call(f.prototype),t.DragdropHandler=f;}),ace.define("ace/mouse/touch_handler",["require","exports","module","ace/mouse/mouse_event","ace/lib/event","ace/lib/dom"],function(e,t,n){var r=e("./mouse_event").MouseEvent,i=e("../lib/event"),s=e("../lib/dom");t.addTouchListeners=function(e,t){function b(){var e=window.navigator&&window.navigator.clipboard,r=!1,i=function(){var n=t.getCopyText(),i=t.session.getUndoManager().hasUndo();y.replaceChild(s.buildDom(r?["span",!n&&["span",{"class":"ace_mobile-button",action:"selectall"},"Select All"],n&&["span",{"class":"ace_mobile-button",action:"copy"},"Copy"],n&&["span",{"class":"ace_mobile-button",action:"cut"},"Cut"],e&&["span",{"class":"ace_mobile-button",action:"paste"},"Paste"],i&&["span",{"class":"ace_mobile-button",action:"undo"},"Undo"],["span",{"class":"ace_mobile-button",action:"find"},"Find"],["span",{"class":"ace_mobile-button",action:"openCommandPallete"},"Pallete"]]:["span"]),y.firstChild);},o=function(n){var s=n.target.getAttribute("action");if(s=="more"||!r)return r=!r,i();if(s=="paste")e.readText().then(function(e){t.execCommand(s,e);});else if(s){if(s=="cut"||s=="copy")e?e.writeText(t.getCopyText()):document.execCommand("copy");t.execCommand(s);}y.firstChild.style.display="none",r=!1,s!="openCommandPallete"&&t.focus();};y=s.buildDom(["div",{"class":"ace_mobile-menu",ontouchstart:function(e){n="menu",e.stopPropagation(),e.preventDefault(),t.textInput.focus();},ontouchend:function(e){e.stopPropagation(),e.preventDefault(),o(e);},onclick:o},["span"],["span",{"class":"ace_mobile-button",action:"more"},"..."]],t.container);}function w(){y||b();var e=t.selection.cursor,n=t.renderer.textToScreenCoordinates(e.row,e.column),r=t.renderer.textToScreenCoordinates(0,0).pageX,i=t.renderer.scrollLeft,s=t.container.getBoundingClientRect();y.style.top=n.pageY-s.top-3+"px",n.pageX-s.left<s.width-70?(y.style.left="",y.style.right="10px"):(y.style.right="",y.style.left=r+i-s.left+"px"),y.style.display="",y.firstChild.style.display="none",t.on("input",E);}function E(e){y&&(y.style.display="none"),t.off("input",E);}function S(){l=null,clearTimeout(l);var e=t.selection.getRange(),r=e.contains(p.row,p.column);if(e.isEmpty()||!r)t.selection.moveToPosition(p),t.selection.selectWord();n="wait",w();}function x(){l=null,clearTimeout(l),t.selection.moveToPosition(p);var e=d>=2?t.selection.getLineRange(p.row):t.session.getBracketRange(p);e&&!e.isEmpty()?t.selection.setRange(e):t.selection.selectWord(),n="wait";}function T(){h+=60,c=setInterval(function(){h--<=0&&(clearInterval(c),c=null),Math.abs(v)<.01&&(v=0),Math.abs(m)<.01&&(m=0),h<20&&(v=.9*v),h<20&&(m=.9*m);var e=t.session.getScrollTop();t.renderer.scrollBy(10*v,10*m),e==t.session.getScrollTop()&&(h=0);},10);}var n="scroll",o,u,a,f,l,c,h=0,p,d=0,v=0,m=0,g,y;i.addListener(e,"contextmenu",function(e){if(!g)return;var n=t.textInput.getElement();n.focus();},t),i.addListener(e,"touchstart",function(e){var i=e.touches;if(l||i.length>1){clearTimeout(l),l=null,a=-1,n="zoom";return}g=t.$mouseHandler.isMousePressed=!0;var s=t.renderer.layerConfig.lineHeight,c=t.renderer.layerConfig.lineHeight,y=e.timeStamp;f=y;var b=i[0],w=b.clientX,E=b.clientY;Math.abs(o-w)+Math.abs(u-E)>s&&(a=-1),o=e.clientX=w,u=e.clientY=E,v=m=0;var T=new r(e,t);p=T.getDocumentPosition();if(y-a<500&&i.length==1&&!h)d++,e.preventDefault(),e.button=0,x();else {d=0;var N=t.selection.cursor,C=t.selection.isEmpty()?N:t.selection.anchor,k=t.renderer.$cursorLayer.getPixelPosition(N,!0),L=t.renderer.$cursorLayer.getPixelPosition(C,!0),A=t.renderer.scroller.getBoundingClientRect(),O=t.renderer.layerConfig.offset,M=t.renderer.scrollLeft,_=function(e,t){return e/=c,t=t/s-.75,e*e+t*t};if(e.clientX<A.left){n="zoom";return}var D=_(e.clientX-A.left-k.left+M,e.clientY-A.top-k.top+O),P=_(e.clientX-A.left-L.left+M,e.clientY-A.top-L.top+O);D<3.5&&P<3.5&&(n=D>P?"cursor":"anchor"),P<3.5?n="anchor":D<3.5?n="cursor":n="scroll",l=setTimeout(S,450);}a=y;},t),i.addListener(e,"touchend",function(e){g=t.$mouseHandler.isMousePressed=!1,c&&clearInterval(c),n=="zoom"?(n="",h=0):l?(t.selection.moveToPosition(p),h=0,w()):n=="scroll"?(T(),E()):w(),clearTimeout(l),l=null;},t),i.addListener(e,"touchmove",function(e){l&&(clearTimeout(l),l=null);var i=e.touches;if(i.length>1||n=="zoom")return;var s=i[0],a=o-s.clientX,c=u-s.clientY;if(n=="wait"){if(!(a*a+c*c>4))return e.preventDefault();n="cursor";}o=s.clientX,u=s.clientY,e.clientX=s.clientX,e.clientY=s.clientY;var h=e.timeStamp,p=h-f;f=h;if(n=="scroll"){var d=new r(e,t);d.speed=1,d.wheelX=a,d.wheelY=c,10*Math.abs(a)<Math.abs(c)&&(a=0),10*Math.abs(c)<Math.abs(a)&&(c=0),p!=0&&(v=a/p,m=c/p),t._emit("mousewheel",d),d.propagationStopped||(v=m=0);}else {var g=new r(e,t),y=g.getDocumentPosition();n=="cursor"?t.selection.moveCursorToPosition(y):n=="anchor"&&t.selection.setSelectionAnchor(y.row,y.column),t.renderer.scrollCursorIntoView(y),e.preventDefault();}},t);};}),ace.define("ace/lib/net",["require","exports","module","ace/lib/dom"],function(e,t,n){var r=e("./dom");t.get=function(e,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.onreadystatechange=function(){n.readyState===4&&t(n.responseText);},n.send(null);},t.loadScript=function(e,t){var n=r.getDocumentHead(),i=document.createElement("script");i.src=e,n.appendChild(i),i.onload=i.onreadystatechange=function(e,n){if(n||!i.readyState||i.readyState=="loaded"||i.readyState=="complete")i=i.onload=i.onreadystatechange=null,n||t();};},t.qualifyURL=function(e){var t=document.createElement("a");return t.href=e,t.href};}),ace.define("ace/lib/event_emitter",["require","exports","module"],function(e,t,n){var r={},i=function(){this.propagationStopped=!0;},s=function(){this.defaultPrevented=!0;};r._emit=r._dispatchEvent=function(e,t){this._eventRegistry||(this._eventRegistry={}),this._defaultHandlers||(this._defaultHandlers={});var n=this._eventRegistry[e]||[],r=this._defaultHandlers[e];if(!n.length&&!r)return;if(typeof t!="object"||!t)t={};t.type||(t.type=e),t.stopPropagation||(t.stopPropagation=i),t.preventDefault||(t.preventDefault=s),n=n.slice();for(var o=0;o<n.length;o++){n[o](t,this);if(t.propagationStopped)break}if(r&&!t.defaultPrevented)return r(t,this)},r._signal=function(e,t){var n=(this._eventRegistry||{})[e];if(!n)return;n=n.slice();for(var r=0;r<n.length;r++)n[r](t,this);},r.once=function(e,t){var n=this;this.on(e,function r(){n.off(e,r),t.apply(null,arguments);});if(!t)return new Promise(function(e){t=e;})},r.setDefaultHandler=function(e,t){var n=this._defaultHandlers;n||(n=this._defaultHandlers={_disabled_:{}});if(n[e]){var r=n[e],i=n._disabled_[e];i||(n._disabled_[e]=i=[]),i.push(r);var s=i.indexOf(t);s!=-1&&i.splice(s,1);}n[e]=t;},r.removeDefaultHandler=function(e,t){var n=this._defaultHandlers;if(!n)return;var r=n._disabled_[e];if(n[e]==t)r&&this.setDefaultHandler(e,r.pop());else if(r){var i=r.indexOf(t);i!=-1&&r.splice(i,1);}},r.on=r.addEventListener=function(e,t,n){this._eventRegistry=this._eventRegistry||{};var r=this._eventRegistry[e];return r||(r=this._eventRegistry[e]=[]),r.indexOf(t)==-1&&r[n?"unshift":"push"](t),t},r.off=r.removeListener=r.removeEventListener=function(e,t){this._eventRegistry=this._eventRegistry||{};var n=this._eventRegistry[e];if(!n)return;var r=n.indexOf(t);r!==-1&&n.splice(r,1);},r.removeAllListeners=function(e){e||(this._eventRegistry=this._defaultHandlers=undefined),this._eventRegistry&&(this._eventRegistry[e]=undefined),this._defaultHandlers&&(this._defaultHandlers[e]=undefined);},t.EventEmitter=r;}),ace.define("ace/lib/app_config",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"no use strict";function o(e){typeof console!="undefined"&&console.warn&&console.warn.apply(console,arguments);}function u(e,t){var n=new Error(e);n.data=t,typeof console=="object"&&console.error&&console.error(n),setTimeout(function(){throw n});}var r=e("./oop"),i=e("./event_emitter").EventEmitter,s={setOptions:function(e){Object.keys(e).forEach(function(t){this.setOption(t,e[t]);},this);},getOptions:function(e){var t={};if(!e){var n=this.$options;e=Object.keys(n).filter(function(e){return !n[e].hidden});}else Array.isArray(e)||(t=e,e=Object.keys(t));return e.forEach(function(e){t[e]=this.getOption(e);},this),t},setOption:function(e,t){if(this["$"+e]===t)return;var n=this.$options[e];if(!n)return o('misspelled option "'+e+'"');if(n.forwardTo)return this[n.forwardTo]&&this[n.forwardTo].setOption(e,t);n.handlesSet||(this["$"+e]=t),n&&n.set&&n.set.call(this,t);},getOption:function(e){var t=this.$options[e];return t?t.forwardTo?this[t.forwardTo]&&this[t.forwardTo].getOption(e):t&&t.get?t.get.call(this):this["$"+e]:o('misspelled option "'+e+'"')}},a=function(){this.$defaultOptions={};};(function(){r.implement(this,i),this.defineOptions=function(e,t,n){return e.$options||(this.$defaultOptions[t]=e.$options={}),Object.keys(n).forEach(function(t){var r=n[t];typeof r=="string"&&(r={forwardTo:r}),r.name||(r.name=t),e.$options[r.name]=r,"initialValue"in r&&(e["$"+r.name]=r.initialValue);}),r.implement(e,s),this},this.resetOptions=function(e){Object.keys(e.$options).forEach(function(t){var n=e.$options[t];"value"in n&&e.setOption(t,n.value);});},this.setDefaultValue=function(e,t,n){if(!e){for(e in this.$defaultOptions)if(this.$defaultOptions[e][t])break;if(!this.$defaultOptions[e][t])return !1}var r=this.$defaultOptions[e]||(this.$defaultOptions[e]={});r[t]&&(r.forwardTo?this.setDefaultValue(r.forwardTo,t,n):r[t].value=n);},this.setDefaultValues=function(e,t){Object.keys(t).forEach(function(n){this.setDefaultValue(e,n,t[n]);},this);},this.warn=o,this.reportError=u;}).call(a.prototype),t.AppConfig=a;}),ace.define("ace/config",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/lib/net","ace/lib/app_config"],function(e,t,n){"no use strict";function l(r){if(!u||!u.document)return;a.packaged=r||e.packaged||n.packaged||u.define&&undefined.packaged;var i={},s="",o=document.currentScript||document._currentScript,f=o&&o.ownerDocument||document,l=f.getElementsByTagName("script");for(var h=0;h<l.length;h++){var p=l[h],d=p.src||p.getAttribute("src");if(!d)continue;var v=p.attributes;for(var m=0,g=v.length;m<g;m++){var y=v[m];y.name.indexOf("data-ace-")===0&&(i[c(y.name.replace(/^data-ace-/,""))]=y.value);}var b=d.match(/^(.*)\/ace(\-\w+)?\.js(\?|$)/);b&&(s=b[1]);}s&&(i.base=i.base||s,i.packaged=!0),i.basePath=i.base,i.workerPath=i.workerPath||i.base,i.modePath=i.modePath||i.base,i.themePath=i.themePath||i.base,delete i.base;for(var w in i)typeof i[w]!="undefined"&&t.set(w,i[w]);}function c(e){return e.replace(/-(.)/g,function(e,t){return t.toUpperCase()})}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./lib/net"),o=e("./lib/app_config").AppConfig;n.exports=t=new o;var u=function(){return this||typeof window!="undefined"&&window}(),a={packaged:!1,workerPath:null,modePath:null,themePath:null,basePath:"",suffix:".js",$moduleUrls:{},loadWorkerFromBlob:!0,sharedPopups:!1};t.get=function(e){if(!a.hasOwnProperty(e))throw new Error("Unknown config key: "+e);return a[e]},t.set=function(e,t){if(a.hasOwnProperty(e))a[e]=t;else if(this.setDefaultValue("",e,t)==0)throw new Error("Unknown config key: "+e)},t.all=function(){return r.copyObject(a)},t.$modes={},t.moduleUrl=function(e,t){if(a.$moduleUrls[e])return a.$moduleUrls[e];var n=e.split("/");t=t||n[n.length-2]||"";var r=t=="snippets"?"/":"-",i=n[n.length-1];if(t=="worker"&&r=="-"){var s=new RegExp("^"+t+"[\\-_]|[\\-_]"+t+"$","g");i=i.replace(s,"");}(!i||i==t)&&n.length>1&&(i=n[n.length-2]);var o=a[t+"Path"];return o==null?o=a.basePath:r=="/"&&(t=r=""),o&&o.slice(-1)!="/"&&(o+="/"),o+t+r+i+this.get("suffix")},t.setModuleUrl=function(e,t){return a.$moduleUrls[e]=t},t.$loading={},t.loadModule=function(n,r){var i,o;Array.isArray(n)&&(o=n[0],n=n[1]);try{i=e(n);}catch(u){}if(i&&!t.$loading[n])return r&&r(i);t.$loading[n]||(t.$loading[n]=[]),t.$loading[n].push(r);if(t.$loading[n].length>1)return;var a=function(){e([n],function(e){t._emit("load.module",{name:n,module:e});var r=t.$loading[n];t.$loading[n]=null,r.forEach(function(t){t&&t(e);});});};if(!t.get("packaged"))return a();s.loadScript(t.moduleUrl(n,o),a),f();};var f=function(){!a.basePath&&!a.workerPath&&!a.modePath&&!a.themePath&&!Object.keys(a.$moduleUrls).length&&(console.error("Unable to infer path to ace from script src,","use ace.config.set('basePath', 'path') to enable dynamic loading of modes and themes","or with webpack use ace/webpack-resolver"),f=function(){});};t.init=l,t.version="1.4.12";}),ace.define("ace/mouse/mouse_handler",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/mouse/default_handlers","ace/mouse/default_gutter_handler","ace/mouse/mouse_event","ace/mouse/dragdrop_handler","ace/mouse/touch_handler","ace/config"],function(e,t,n){var r=e("../lib/event"),i=e("../lib/useragent"),s=e("./default_handlers").DefaultHandlers,o=e("./default_gutter_handler").GutterHandler,u=e("./mouse_event").MouseEvent,a=e("./dragdrop_handler").DragdropHandler,f=e("./touch_handler").addTouchListeners,l=e("../config"),c=function(e){var t=this;this.editor=e,new s(this),new o(this),new a(this);var n=function(t){var n=!document.hasFocus||!document.hasFocus()||!e.isFocused()&&document.activeElement==(e.textInput&&e.textInput.getElement());n&&window.focus(),e.focus();},u=e.renderer.getMouseEventTarget();r.addListener(u,"click",this.onMouseEvent.bind(this,"click"),e),r.addListener(u,"mousemove",this.onMouseMove.bind(this,"mousemove"),e),r.addMultiMouseDownListener([u,e.renderer.scrollBarV&&e.renderer.scrollBarV.inner,e.renderer.scrollBarH&&e.renderer.scrollBarH.inner,e.textInput&&e.textInput.getElement()].filter(Boolean),[400,300,250],this,"onMouseEvent",e),r.addMouseWheelListener(e.container,this.onMouseWheel.bind(this,"mousewheel"),e),f(e.container,e);var l=e.renderer.$gutter;r.addListener(l,"mousedown",this.onMouseEvent.bind(this,"guttermousedown"),e),r.addListener(l,"click",this.onMouseEvent.bind(this,"gutterclick"),e),r.addListener(l,"dblclick",this.onMouseEvent.bind(this,"gutterdblclick"),e),r.addListener(l,"mousemove",this.onMouseEvent.bind(this,"guttermousemove"),e),r.addListener(u,"mousedown",n,e),r.addListener(l,"mousedown",n,e),i.isIE&&e.renderer.scrollBarV&&(r.addListener(e.renderer.scrollBarV.element,"mousedown",n,e),r.addListener(e.renderer.scrollBarH.element,"mousedown",n,e)),e.on("mousemove",function(n){if(t.state||t.$dragDelay||!t.$dragEnabled)return;var r=e.renderer.screenToTextCoordinates(n.x,n.y),i=e.session.selection.getRange(),s=e.renderer;!i.isEmpty()&&i.insideStart(r.row,r.column)?s.setCursorStyle("default"):s.setCursorStyle("");},e);};(function(){this.onMouseEvent=function(e,t){this.editor._emit(e,new u(t,this.editor));},this.onMouseMove=function(e,t){var n=this.editor._eventRegistry&&this.editor._eventRegistry.mousemove;if(!n||!n.length)return;this.editor._emit(e,new u(t,this.editor));},this.onMouseWheel=function(e,t){var n=new u(t,this.editor);n.speed=this.$scrollSpeed*2,n.wheelX=t.wheelX,n.wheelY=t.wheelY,this.editor._emit(e,n);},this.setState=function(e){this.state=e;},this.captureMouse=function(e,t){this.x=e.x,this.y=e.y,this.isMousePressed=!0;var n=this.editor,s=this.editor.renderer;s.$isMousePressed=!0;var o=this,a=function(e){if(!e)return;if(i.isWebKit&&!e.which&&o.releaseMouse)return o.releaseMouse();o.x=e.clientX,o.y=e.clientY,t&&t(e),o.mouseEvent=new u(e,o.editor),o.$mouseMoved=!0;},f=function(e){n.off("beforeEndOperation",c),clearInterval(h),l(),o[o.state+"End"]&&o[o.state+"End"](e),o.state="",o.isMousePressed=s.$isMousePressed=!1,s.$keepTextAreaAtCursor&&s.$moveTextAreaToCursor(),o.$onCaptureMouseMove=o.releaseMouse=null,e&&o.onMouseEvent("mouseup",e),n.endOperation();},l=function(){o[o.state]&&o[o.state](),o.$mouseMoved=!1;};if(i.isOldIE&&e.domEvent.type=="dblclick")return setTimeout(function(){f(e);});var c=function(e){if(!o.releaseMouse)return;n.curOp.command.name&&n.curOp.selectionChanged&&(o[o.state+"End"]&&o[o.state+"End"](),o.state="",o.releaseMouse());};n.on("beforeEndOperation",c),n.startOperation({command:{name:"mouse"}}),o.$onCaptureMouseMove=a,o.releaseMouse=r.capture(this.editor.container,a,f);var h=setInterval(l,20);},this.releaseMouse=null,this.cancelContextMenu=function(){var e=function(t){if(t&&t.domEvent&&t.domEvent.type!="contextmenu")return;this.editor.off("nativecontextmenu",e),t&&t.domEvent&&r.stopEvent(t.domEvent);}.bind(this);setTimeout(e,10),this.editor.on("nativecontextmenu",e);},this.destroy=function(){this.releaseMouse&&this.releaseMouse();};}).call(c.prototype),l.defineOptions(c.prototype,"mouseHandler",{scrollSpeed:{initialValue:2},dragDelay:{initialValue:i.isMac?150:0},dragEnabled:{initialValue:!0},focusTimeout:{initialValue:0},tooltipFollowsMouse:{initialValue:!0}}),t.MouseHandler=c;}),ace.define("ace/mouse/fold_handler",["require","exports","module","ace/lib/dom"],function(e,t,n){function i(e){e.on("click",function(t){var n=t.getDocumentPosition(),i=e.session,s=i.getFoldAt(n.row,n.column,1);s&&(t.getAccelKey()?i.removeFold(s):i.expandFold(s),t.stop());var o=t.domEvent&&t.domEvent.target;o&&r.hasCssClass(o,"ace_inline_button")&&r.hasCssClass(o,"ace_toggle_wrap")&&(i.setOption("wrap",!i.getUseWrapMode()),e.renderer.scrollCursorIntoView());}),e.on("gutterclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session;i.foldWidgets&&i.foldWidgets[r]&&e.session.onFoldWidgetClick(r,t),e.isFocused()||e.focus(),t.stop();}}),e.on("gutterdblclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session,s=i.getParentFoldRangeData(r,!0),o=s.range||s.firstRange;if(o){r=o.start.row;var u=i.getFoldAt(r,i.getLine(r).length,1);u?i.removeFold(u):(i.addFold("...",o),e.renderer.scrollCursorIntoView({row:o.start.row,column:0}));}t.stop();}});}var r=e("../lib/dom");t.FoldHandler=i;}),ace.define("ace/keyboard/keybinding",["require","exports","module","ace/lib/keys","ace/lib/event"],function(e,t,n){var r=e("../lib/keys"),i=e("../lib/event"),s=function(e){this.$editor=e,this.$data={editor:e},this.$handlers=[],this.setDefaultHandler(e.commands);};(function(){this.setDefaultHandler=function(e){this.removeKeyboardHandler(this.$defaultHandler),this.$defaultHandler=e,this.addKeyboardHandler(e,0);},this.setKeyboardHandler=function(e){var t=this.$handlers;if(t[t.length-1]==e)return;while(t[t.length-1]&&t[t.length-1]!=this.$defaultHandler)this.removeKeyboardHandler(t[t.length-1]);this.addKeyboardHandler(e,1);},this.addKeyboardHandler=function(e,t){if(!e)return;typeof e=="function"&&!e.handleKeyboard&&(e.handleKeyboard=e);var n=this.$handlers.indexOf(e);n!=-1&&this.$handlers.splice(n,1),t==undefined?this.$handlers.push(e):this.$handlers.splice(t,0,e),n==-1&&e.attach&&e.attach(this.$editor);},this.removeKeyboardHandler=function(e){var t=this.$handlers.indexOf(e);return t==-1?!1:(this.$handlers.splice(t,1),e.detach&&e.detach(this.$editor),!0)},this.getKeyboardHandler=function(){return this.$handlers[this.$handlers.length-1]},this.getStatusText=function(){var e=this.$data,t=e.editor;return this.$handlers.map(function(n){return n.getStatusText&&n.getStatusText(t,e)||""}).filter(Boolean).join(" ")},this.$callKeyboardHandlers=function(e,t,n,r){var s,o=!1,u=this.$editor.commands;for(var a=this.$handlers.length;a--;){s=this.$handlers[a].handleKeyboard(this.$data,e,t,n,r);if(!s||!s.command)continue;s.command=="null"?o=!0:o=u.exec(s.command,this.$editor,s.args,r),o&&r&&e!=-1&&s.passEvent!=1&&s.command.passEvent!=1&&i.stopEvent(r);if(o)break}return !o&&e==-1&&(s={command:"insertstring"},o=u.exec("insertstring",this.$editor,t)),o&&this.$editor._signal&&this.$editor._signal("keyboardActivity",s),o},this.onCommandKey=function(e,t,n){var i=r.keyCodeToString(n);return this.$callKeyboardHandlers(t,i,n,e)},this.onTextInput=function(e){return this.$callKeyboardHandlers(-1,e)};}).call(s.prototype),t.KeyBinding=s;}),ace.define("ace/lib/bidiutil",["require","exports","module"],function(e,t,n){function F(e,t,n,r){var i=s?d:p,c=null,h=null,v=null,m=0,g=null,y=null,b=-1,w=null,E=null,T=[];if(!r)for(w=0,r=[];w<n;w++)r[w]=R(e[w]);o=s,u=!1,f=!1,l=!1;for(E=0;E<n;E++){c=m,T[E]=h=q(e,r,T,E),m=i[c][h],g=m&240,m&=15,t[E]=v=i[m][5];if(g>0)if(g==16){for(w=b;w<E;w++)t[w]=1;b=-1;}else b=-1;y=i[m][6];if(y)b==-1&&(b=E);else if(b>-1){for(w=b;w<E;w++)t[w]=v;b=-1;}r[E]==S&&(t[E]=0),o|=v;}if(l)for(w=0;w<n;w++)if(r[w]==x){t[w]=s;for(var C=w-1;C>=0;C--){if(r[C]!=N)break;t[C]=s;}}}function I(e,t,n){if(o<e)return;if(e==1&&s==m&&!f){n.reverse();return}var r=n.length,i=0,u,a,l,c;while(i<r){if(t[i]>=e){u=i+1;while(u<r&&t[u]>=e)u++;for(a=i,l=u-1;a<l;a++,l--)c=n[a],n[a]=n[l],n[l]=c;i=u;}i++;}}function q(e,t,n,r){var i=t[r],o,c,h,p;switch(i){case g:case y:u=!1;case E:case w:return i;case b:return u?w:b;case T:return u=!0,y;case N:return E;case C:if(r<1||r+1>=t.length||(o=n[r-1])!=b&&o!=w||(c=t[r+1])!=b&&c!=w)return E;return u&&(c=w),c==o?c:E;case k:o=r>0?n[r-1]:S;if(o==b&&r+1<t.length&&t[r+1]==b)return b;return E;case L:if(r>0&&n[r-1]==b)return b;if(u)return E;p=r+1,h=t.length;while(p<h&&t[p]==L)p++;if(p<h&&t[p]==b)return b;return E;case A:h=t.length,p=r+1;while(p<h&&t[p]==A)p++;if(p<h){var d=e[r],v=d>=1425&&d<=2303||d==64286;o=t[p];if(v&&(o==y||o==T))return y}if(r<1||(o=t[r-1])==S)return E;return n[r-1];case S:return u=!1,f=!0,s;case x:return l=!0,E;case O:case M:case D:case P:case _:u=!1;case H:return E}}function R(e){var t=e.charCodeAt(0),n=t>>8;return n==0?t>191?g:B[t]:n==5?/[\u0591-\u05f4]/.test(e)?y:g:n==6?/[\u0610-\u061a\u064b-\u065f\u06d6-\u06e4\u06e7-\u06ed]/.test(e)?A:/[\u0660-\u0669\u066b-\u066c]/.test(e)?w:t==1642?L:/[\u06f0-\u06f9]/.test(e)?b:T:n==32&&t<=8287?j[t&255]:n==254?t>=65136?T:E:E}var s=0,o=0,u=!1,f=!1,l=!1,p=[[0,3,0,1,0,0,0],[0,3,0,1,2,2,0],[0,3,0,17,2,0,1],[0,3,5,5,4,1,0],[0,3,21,21,4,0,1],[0,3,5,5,4,2,0]],d=[[2,0,1,1,0,1,0],[2,0,1,1,0,2,0],[2,0,2,1,3,2,0],[2,0,2,33,3,1,1]],v=0,m=1,g=0,y=1,b=2,w=3,E=4,S=5,x=6,T=7,N=8,C=9,k=10,L=11,A=12,O=13,M=14,_=15,D=16,P=17,H=18,B=[H,H,H,H,H,H,H,H,H,x,S,x,N,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,S,S,S,x,N,E,E,L,L,L,E,E,E,E,E,k,C,k,C,C,b,b,b,b,b,b,b,b,b,b,C,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,H,H,H,H,H,H,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,C,E,L,L,L,L,E,E,E,E,g,E,E,H,E,E,L,L,b,b,E,g,E,E,E,b,g,E,E,E,E,E],j=[N,N,N,N,N,N,N,N,N,N,N,H,H,H,g,y,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N,S,O,M,_,D,P,C,L,L,L,L,L,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,C,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N];t.L=g,t.R=y,t.EN=b,t.ON_R=3,t.AN=4,t.R_H=5,t.B=6,t.RLE=7,t.DOT="\u00b7",t.doBidiReorder=function(e,n,r){if(e.length<2)return {};var i=e.split(""),o=new Array(i.length),u=new Array(i.length),a=[];s=r?m:v,F(i,a,i.length,n);for(var f=0;f<o.length;o[f]=f,f++);I(2,a,o),I(1,a,o);for(var f=0;f<o.length-1;f++)n[f]===w?a[f]=t.AN:a[f]===y&&(n[f]>T&&n[f]<O||n[f]===E||n[f]===H)?a[f]=t.ON_R:f>0&&i[f-1]==="\u0644"&&/\u0622|\u0623|\u0625|\u0627/.test(i[f])&&(a[f-1]=a[f]=t.R_H,f++);i[i.length-1]===t.DOT&&(a[i.length-1]=t.B),i[0]==="\u202b"&&(a[0]=t.RLE);for(var f=0;f<o.length;f++)u[f]=a[o[f]];return {logicalFromVisual:o,bidiLevels:u}},t.hasBidiCharacters=function(e,t){var n=!1;for(var r=0;r<e.length;r++)t[r]=R(e.charAt(r)),!n&&(t[r]==y||t[r]==T||t[r]==w)&&(n=!0);return n},t.getVisualFromLogicalIdx=function(e,t){for(var n=0;n<t.logicalFromVisual.length;n++)if(t.logicalFromVisual[n]==e)return n;return 0};}),ace.define("ace/bidihandler",["require","exports","module","ace/lib/bidiutil","ace/lib/lang"],function(e,t,n){var r=e("./lib/bidiutil"),i=e("./lib/lang"),s=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\u202B]/,o=function(e){this.session=e,this.bidiMap={},this.currentRow=null,this.bidiUtil=r,this.charWidths=[],this.EOL="\u00ac",this.showInvisibles=!0,this.isRtlDir=!1,this.$isRtl=!1,this.line="",this.wrapIndent=0,this.EOF="\u00b6",this.RLE="\u202b",this.contentWidth=0,this.fontMetrics=null,this.rtlLineOffset=0,this.wrapOffset=0,this.isMoveLeftOperation=!1,this.seenBidi=s.test(e.getValue());};(function(){this.isBidiRow=function(e,t,n){return this.seenBidi?(e!==this.currentRow&&(this.currentRow=e,this.updateRowLine(t,n),this.updateBidiMap()),this.bidiMap.bidiLevels):!1},this.onChange=function(e){this.seenBidi?this.currentRow=null:e.action=="insert"&&s.test(e.lines.join("\n"))&&(this.seenBidi=!0,this.currentRow=null);},this.getDocumentRow=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n=this.session.$getRowCacheIndex(t,this.currentRow);n>=0&&(e=this.session.$docRowCache[n]);}return e},this.getSplitIndex=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n,r=this.session.$getRowCacheIndex(t,this.currentRow);while(this.currentRow-e>0){n=this.session.$getRowCacheIndex(t,this.currentRow-e-1);if(n!==r)break;r=n,e++;}}else e=this.currentRow;return e},this.updateRowLine=function(e,t){e===undefined&&(e=this.getDocumentRow());var n=e===this.session.getLength()-1,s=n?this.EOF:this.EOL;this.wrapIndent=0,this.line=this.session.getLine(e),this.isRtlDir=this.$isRtl||this.line.charAt(0)===this.RLE;if(this.session.$useWrapMode){var o=this.session.$wrapData[e];o&&(t===undefined&&(t=this.getSplitIndex()),t>0&&o.length?(this.wrapIndent=o.indent,this.wrapOffset=this.wrapIndent*this.charWidths[r.L],this.line=t<o.length?this.line.substring(o[t-1],o[t]):this.line.substring(o[o.length-1])):this.line=this.line.substring(0,o[t])),t==o.length&&(this.line+=this.showInvisibles?s:r.DOT);}else this.line+=this.showInvisibles?s:r.DOT;var u=this.session,a=0,f;this.line=this.line.replace(/\t|[\u1100-\u2029, \u202F-\uFFE6]/g,function(e,t){return e==="	"||u.isFullWidth(e.charCodeAt(0))?(f=e==="	"?u.getScreenTabSize(t+a):2,a+=f-1,i.stringRepeat(r.DOT,f)):e}),this.isRtlDir&&(this.fontMetrics.$main.textContent=this.line.charAt(this.line.length-1)==r.DOT?this.line.substr(0,this.line.length-1):this.line,this.rtlLineOffset=this.contentWidth-this.fontMetrics.$main.getBoundingClientRect().width);},this.updateBidiMap=function(){var e=[];r.hasBidiCharacters(this.line,e)||this.isRtlDir?this.bidiMap=r.doBidiReorder(this.line,e,this.isRtlDir):this.bidiMap={};},this.markAsDirty=function(){this.currentRow=null;},this.updateCharacterWidths=function(e){if(this.characterWidth===e.$characterSize.width)return;this.fontMetrics=e;var t=this.characterWidth=e.$characterSize.width,n=e.$measureCharWidth("\u05d4");this.charWidths[r.L]=this.charWidths[r.EN]=this.charWidths[r.ON_R]=t,this.charWidths[r.R]=this.charWidths[r.AN]=n,this.charWidths[r.R_H]=n*.45,this.charWidths[r.B]=this.charWidths[r.RLE]=0,this.currentRow=null;},this.setShowInvisibles=function(e){this.showInvisibles=e,this.currentRow=null;},this.setEolChar=function(e){this.EOL=e;},this.setContentWidth=function(e){this.contentWidth=e;},this.isRtlLine=function(e){return this.$isRtl?!0:e!=undefined?this.session.getLine(e).charAt(0)==this.RLE:this.isRtlDir},this.setRtlDirection=function(e,t){var n=e.getCursorPosition();for(var r=e.selection.getSelectionAnchor().row;r<=n.row;r++)!t&&e.session.getLine(r).charAt(0)===e.session.$bidiHandler.RLE?e.session.doc.removeInLine(r,0,1):t&&e.session.getLine(r).charAt(0)!==e.session.$bidiHandler.RLE&&e.session.doc.insert({column:0,row:r},e.session.$bidiHandler.RLE);},this.getPosLeft=function(e){e-=this.wrapIndent;var t=this.line.charAt(0)===this.RLE?1:0,n=e>t?this.session.getOverwrite()?e:e-1:t,i=r.getVisualFromLogicalIdx(n,this.bidiMap),s=this.bidiMap.bidiLevels,o=0;!this.session.getOverwrite()&&e<=t&&s[i]%2!==0&&i++;for(var u=0;u<i;u++)o+=this.charWidths[s[u]];return !this.session.getOverwrite()&&e>t&&s[i]%2===0&&(o+=this.charWidths[s[i]]),this.wrapIndent&&(o+=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset),this.isRtlDir&&(o+=this.rtlLineOffset),o},this.getSelections=function(e,t){var n=this.bidiMap,r=n.bidiLevels,i,s=[],o=0,u=Math.min(e,t)-this.wrapIndent,a=Math.max(e,t)-this.wrapIndent,f=!1,l=!1,c=0;this.wrapIndent&&(o+=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset);for(var h,p=0;p<r.length;p++)h=n.logicalFromVisual[p],i=r[p],f=h>=u&&h<a,f&&!l?c=o:!f&&l&&s.push({left:c,width:o-c}),o+=this.charWidths[i],l=f;f&&p===r.length&&s.push({left:c,width:o-c});if(this.isRtlDir)for(var d=0;d<s.length;d++)s[d].left+=this.rtlLineOffset;return s},this.offsetToCol=function(e){this.isRtlDir&&(e-=this.rtlLineOffset);var t=0,e=Math.max(e,0),n=0,r=0,i=this.bidiMap.bidiLevels,s=this.charWidths[i[r]];this.wrapIndent&&(e-=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset);while(e>n+s/2){n+=s;if(r===i.length-1){s=0;break}s=this.charWidths[i[++r]];}return r>0&&i[r-1]%2!==0&&i[r]%2===0?(e<n&&r--,t=this.bidiMap.logicalFromVisual[r]):r>0&&i[r-1]%2===0&&i[r]%2!==0?t=1+(e>n?this.bidiMap.logicalFromVisual[r]:this.bidiMap.logicalFromVisual[r-1]):this.isRtlDir&&r===i.length-1&&s===0&&i[r-1]%2===0||!this.isRtlDir&&r===0&&i[r]%2!==0?t=1+this.bidiMap.logicalFromVisual[r]:(r>0&&i[r-1]%2!==0&&s!==0&&r--,t=this.bidiMap.logicalFromVisual[r]),t===0&&this.isRtlDir&&t++,t+this.wrapIndent};}).call(o.prototype),t.BidiHandler=o;}),ace.define("ace/selection",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/range"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=function(e){this.session=e,this.doc=e.getDocument(),this.clearSelection(),this.cursor=this.lead=this.doc.createAnchor(0,0),this.anchor=this.doc.createAnchor(0,0),this.$silent=!1;var t=this;this.cursor.on("change",function(e){t.$cursorChanged=!0,t.$silent||t._emit("changeCursor"),!t.$isEmpty&&!t.$silent&&t._emit("changeSelection"),!t.$keepDesiredColumnOnChange&&e.old.column!=e.value.column&&(t.$desiredColumn=null);}),this.anchor.on("change",function(){t.$anchorChanged=!0,!t.$isEmpty&&!t.$silent&&t._emit("changeSelection");});};(function(){r.implement(this,s),this.isEmpty=function(){return this.$isEmpty||this.anchor.row==this.lead.row&&this.anchor.column==this.lead.column},this.isMultiLine=function(){return !this.$isEmpty&&this.anchor.row!=this.cursor.row},this.getCursor=function(){return this.lead.getPosition()},this.setSelectionAnchor=function(e,t){this.$isEmpty=!1,this.anchor.setPosition(e,t);},this.getAnchor=this.getSelectionAnchor=function(){return this.$isEmpty?this.getSelectionLead():this.anchor.getPosition()},this.getSelectionLead=function(){return this.lead.getPosition()},this.isBackwards=function(){var e=this.anchor,t=this.lead;return e.row>t.row||e.row==t.row&&e.column>t.column},this.getRange=function(){var e=this.anchor,t=this.lead;return this.$isEmpty?o.fromPoints(t,t):this.isBackwards()?o.fromPoints(t,e):o.fromPoints(e,t)},this.clearSelection=function(){this.$isEmpty||(this.$isEmpty=!0,this._emit("changeSelection"));},this.selectAll=function(){this.$setSelection(0,0,Number.MAX_VALUE,Number.MAX_VALUE);},this.setRange=this.setSelectionRange=function(e,t){var n=t?e.end:e.start,r=t?e.start:e.end;this.$setSelection(n.row,n.column,r.row,r.column);},this.$setSelection=function(e,t,n,r){if(this.$silent)return;var i=this.$isEmpty,s=this.inMultiSelectMode;this.$silent=!0,this.$cursorChanged=this.$anchorChanged=!1,this.anchor.setPosition(e,t),this.cursor.setPosition(n,r),this.$isEmpty=!o.comparePoints(this.anchor,this.cursor),this.$silent=!1,this.$cursorChanged&&this._emit("changeCursor"),(this.$cursorChanged||this.$anchorChanged||i!=this.$isEmpty||s)&&this._emit("changeSelection");},this.$moveSelection=function(e){var t=this.lead;this.$isEmpty&&this.setSelectionAnchor(t.row,t.column),e.call(this);},this.selectTo=function(e,t){this.$moveSelection(function(){this.moveCursorTo(e,t);});},this.selectToPosition=function(e){this.$moveSelection(function(){this.moveCursorToPosition(e);});},this.moveTo=function(e,t){this.clearSelection(),this.moveCursorTo(e,t);},this.moveToPosition=function(e){this.clearSelection(),this.moveCursorToPosition(e);},this.selectUp=function(){this.$moveSelection(this.moveCursorUp);},this.selectDown=function(){this.$moveSelection(this.moveCursorDown);},this.selectRight=function(){this.$moveSelection(this.moveCursorRight);},this.selectLeft=function(){this.$moveSelection(this.moveCursorLeft);},this.selectLineStart=function(){this.$moveSelection(this.moveCursorLineStart);},this.selectLineEnd=function(){this.$moveSelection(this.moveCursorLineEnd);},this.selectFileEnd=function(){this.$moveSelection(this.moveCursorFileEnd);},this.selectFileStart=function(){this.$moveSelection(this.moveCursorFileStart);},this.selectWordRight=function(){this.$moveSelection(this.moveCursorWordRight);},this.selectWordLeft=function(){this.$moveSelection(this.moveCursorWordLeft);},this.getWordRange=function(e,t){if(typeof t=="undefined"){var n=e||this.lead;e=n.row,t=n.column;}return this.session.getWordRange(e,t)},this.selectWord=function(){this.setSelectionRange(this.getWordRange());},this.selectAWord=function(){var e=this.getCursor(),t=this.session.getAWordRange(e.row,e.column);this.setSelectionRange(t);},this.getLineRange=function(e,t){var n=typeof e=="number"?e:this.lead.row,r,i=this.session.getFoldLine(n);return i?(n=i.start.row,r=i.end.row):r=n,t===!0?new o(n,0,r,this.session.getLine(r).length):new o(n,0,r+1,0)},this.selectLine=function(){this.setSelectionRange(this.getLineRange());},this.moveCursorUp=function(){this.moveCursorBy(-1,0);},this.moveCursorDown=function(){this.moveCursorBy(1,0);},this.wouldMoveIntoSoftTab=function(e,t,n){var r=e.column,i=e.column+t;return n<0&&(r=e.column-t,i=e.column),this.session.isTabStop(e)&&this.doc.getLine(e.row).slice(r,i).split(" ").length-1==t},this.moveCursorLeft=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,-1))this.moveCursorTo(t.start.row,t.start.column);else if(e.column===0)e.row>0&&this.moveCursorTo(e.row-1,this.doc.getLine(e.row-1).length);else {var n=this.session.getTabSize();this.wouldMoveIntoSoftTab(e,n,-1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,-n):this.moveCursorBy(0,-1);}},this.moveCursorRight=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,1))this.moveCursorTo(t.end.row,t.end.column);else if(this.lead.column==this.doc.getLine(this.lead.row).length)this.lead.row<this.doc.getLength()-1&&this.moveCursorTo(this.lead.row+1,0);else {var n=this.session.getTabSize(),e=this.lead;this.wouldMoveIntoSoftTab(e,n,1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,n):this.moveCursorBy(0,1);}},this.moveCursorLineStart=function(){var e=this.lead.row,t=this.lead.column,n=this.session.documentToScreenRow(e,t),r=this.session.screenToDocumentPosition(n,0),i=this.session.getDisplayLine(e,null,r.row,r.column),s=i.match(/^\s*/);s[0].length!=t&&!this.session.$useEmacsStyleLineStart&&(r.column+=s[0].length),this.moveCursorToPosition(r);},this.moveCursorLineEnd=function(){var e=this.lead,t=this.session.getDocumentLastRowColumnPosition(e.row,e.column);if(this.lead.column==t.column){var n=this.session.getLine(t.row);if(t.column==n.length){var r=n.search(/\s+$/);r>0&&(t.column=r);}}this.moveCursorTo(t.row,t.column);},this.moveCursorFileEnd=function(){var e=this.doc.getLength()-1,t=this.doc.getLine(e).length;this.moveCursorTo(e,t);},this.moveCursorFileStart=function(){this.moveCursorTo(0,0);},this.moveCursorLongWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t);this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0;var i=this.session.getFoldAt(e,t,1);if(i){this.moveCursorTo(i.end.row,i.end.column);return}this.session.nonTokenRe.exec(r)&&(t+=this.session.nonTokenRe.lastIndex,this.session.nonTokenRe.lastIndex=0,r=n.substring(t));if(t>=n.length){this.moveCursorTo(e,n.length),this.moveCursorRight(),e<this.doc.getLength()-1&&this.moveCursorWordRight();return}this.session.tokenRe.exec(r)&&(t+=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0),this.moveCursorTo(e,t);},this.moveCursorLongWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1)){this.moveCursorTo(n.start.row,n.start.column);return}var r=this.session.getFoldStringAt(e,t,-1);r==null&&(r=this.doc.getLine(e).substring(0,t));var s=i.stringReverse(r);this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0,this.session.nonTokenRe.exec(s)&&(t-=this.session.nonTokenRe.lastIndex,s=s.slice(this.session.nonTokenRe.lastIndex),this.session.nonTokenRe.lastIndex=0);if(t<=0){this.moveCursorTo(e,0),this.moveCursorLeft(),e>0&&this.moveCursorWordLeft();return}this.session.tokenRe.exec(s)&&(t-=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0),this.moveCursorTo(e,t);},this.$shortWordEndIndex=function(e){var t=0,n,r=/\s/,i=this.session.tokenRe;i.lastIndex=0;if(this.session.tokenRe.exec(e))t=this.session.tokenRe.lastIndex;else {while((n=e[t])&&r.test(n))t++;if(t<1){i.lastIndex=0;while((n=e[t])&&!i.test(n)){i.lastIndex=0,t++;if(r.test(n)){if(t>2){t--;break}while((n=e[t])&&r.test(n))t++;if(t>2)break}}}}return i.lastIndex=0,t},this.moveCursorShortWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t),i=this.session.getFoldAt(e,t,1);if(i)return this.moveCursorTo(i.end.row,i.end.column);if(t==n.length){var s=this.doc.getLength();do e++,r=this.doc.getLine(e);while(e<s&&/^\s*$/.test(r));/^\s+/.test(r)||(r=""),t=0;}var o=this.$shortWordEndIndex(r);this.moveCursorTo(e,t+o);},this.moveCursorShortWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1))return this.moveCursorTo(n.start.row,n.start.column);var r=this.session.getLine(e).substring(0,t);if(t===0){do e--,r=this.doc.getLine(e);while(e>0&&/^\s*$/.test(r));t=r.length,/\s+$/.test(r)||(r="");}var s=i.stringReverse(r),o=this.$shortWordEndIndex(s);return this.moveCursorTo(e,t-o)},this.moveCursorWordRight=function(){this.session.$selectLongWords?this.moveCursorLongWordRight():this.moveCursorShortWordRight();},this.moveCursorWordLeft=function(){this.session.$selectLongWords?this.moveCursorLongWordLeft():this.moveCursorShortWordLeft();},this.moveCursorBy=function(e,t){var n=this.session.documentToScreenPosition(this.lead.row,this.lead.column),r;t===0&&(e!==0&&(this.session.$bidiHandler.isBidiRow(n.row,this.lead.row)?(r=this.session.$bidiHandler.getPosLeft(n.column),n.column=Math.round(r/this.session.$bidiHandler.charWidths[0])):r=n.column*this.session.$bidiHandler.charWidths[0]),this.$desiredColumn?n.column=this.$desiredColumn:this.$desiredColumn=n.column);if(e!=0&&this.session.lineWidgets&&this.session.lineWidgets[this.lead.row]){var i=this.session.lineWidgets[this.lead.row];e<0?e-=i.rowsAbove||0:e>0&&(e+=i.rowCount-(i.rowsAbove||0));}var s=this.session.screenToDocumentPosition(n.row+e,n.column,r);e!==0&&t===0&&s.row===this.lead.row&&s.column===this.lead.column,this.moveCursorTo(s.row,s.column+t,t===0);},this.moveCursorToPosition=function(e){this.moveCursorTo(e.row,e.column);},this.moveCursorTo=function(e,t,n){var r=this.session.getFoldAt(e,t,1);r&&(e=r.start.row,t=r.start.column),this.$keepDesiredColumnOnChange=!0;var i=this.session.getLine(e);/[\uDC00-\uDFFF]/.test(i.charAt(t))&&i.charAt(t-1)&&(this.lead.row==e&&this.lead.column==t+1?t-=1:t+=1),this.lead.setPosition(e,t),this.$keepDesiredColumnOnChange=!1,n||(this.$desiredColumn=null);},this.moveCursorToScreen=function(e,t,n){var r=this.session.screenToDocumentPosition(e,t);this.moveCursorTo(r.row,r.column,n);},this.detach=function(){this.lead.detach(),this.anchor.detach(),this.session=this.doc=null;},this.fromOrientedRange=function(e){this.setSelectionRange(e,e.cursor==e.start),this.$desiredColumn=e.desiredColumn||this.$desiredColumn;},this.toOrientedRange=function(e){var t=this.getRange();return e?(e.start.column=t.start.column,e.start.row=t.start.row,e.end.column=t.end.column,e.end.row=t.end.row):e=t,e.cursor=this.isBackwards()?e.start:e.end,e.desiredColumn=this.$desiredColumn,e},this.getRangeOfMovements=function(e){var t=this.getCursor();try{e(this);var n=this.getCursor();return o.fromPoints(t,n)}catch(r){return o.fromPoints(t,t)}finally{this.moveCursorToPosition(t);}},this.toJSON=function(){if(this.rangeCount)var e=this.ranges.map(function(e){var t=e.clone();return t.isBackwards=e.cursor==e.start,t});else {var e=this.getRange();e.isBackwards=this.isBackwards();}return e},this.fromJSON=function(e){if(e.start==undefined){if(this.rangeList&&e.length>1){this.toSingleRange(e[0]);for(var t=e.length;t--;){var n=o.fromPoints(e[t].start,e[t].end);e[t].isBackwards&&(n.cursor=n.start),this.addRange(n,!0);}return}e=e[0];}this.rangeList&&this.toSingleRange(e),this.setSelectionRange(e,e.isBackwards);},this.isEqual=function(e){if((e.length||this.rangeCount)&&e.length!=this.rangeCount)return !1;if(!e.length||!this.ranges)return this.getRange().isEqual(e);for(var t=this.ranges.length;t--;)if(!this.ranges[t].isEqual(e[t]))return !1;return !0};}).call(u.prototype),t.Selection=u;}),ace.define("ace/tokenizer",["require","exports","module","ace/config"],function(e,t,n){var r=e("./config"),i=2e3,s=function(e){this.states=e,this.regExps={},this.matchMappings={};for(var t in this.states){var n=this.states[t],r=[],i=0,s=this.matchMappings[t]={defaultToken:"text"},o="g",u=[];for(var a=0;a<n.length;a++){var f=n[a];f.defaultToken&&(s.defaultToken=f.defaultToken),f.caseInsensitive&&(o="gi");if(f.regex==null)continue;f.regex instanceof RegExp&&(f.regex=f.regex.toString().slice(1,-1));var l=f.regex,c=(new RegExp("(?:("+l+")|(.))")).exec("a").length-2;Array.isArray(f.token)?f.token.length==1||c==1?f.token=f.token[0]:c-1!=f.token.length?(this.reportError("number of classes and regexp groups doesn't match",{rule:f,groupCount:c-1}),f.token=f.token[0]):(f.tokenArray=f.token,f.token=null,f.onMatch=this.$arrayTokens):typeof f.token=="function"&&!f.onMatch&&(c>1?f.onMatch=this.$applyToken:f.onMatch=f.token),c>1&&(/\\\d/.test(f.regex)?l=f.regex.replace(/\\([0-9]+)/g,function(e,t){return "\\"+(parseInt(t,10)+i+1)}):(c=1,l=this.removeCapturingGroups(f.regex)),!f.splitRegex&&typeof f.token!="string"&&u.push(f)),s[i]=a,i+=c,r.push(l),f.onMatch||(f.onMatch=null);}r.length||(s[0]=0,r.push("$")),u.forEach(function(e){e.splitRegex=this.createSplitterRegexp(e.regex,o);},this),this.regExps[t]=new RegExp("("+r.join(")|(")+")|($)",o);}};(function(){this.$setMaxTokenCount=function(e){i=e|0;},this.$applyToken=function(e){var t=this.splitRegex.exec(e).slice(1),n=this.token.apply(this,t);if(typeof n=="string")return [{type:n,value:e}];var r=[];for(var i=0,s=n.length;i<s;i++)t[i]&&(r[r.length]={type:n[i],value:t[i]});return r},this.$arrayTokens=function(e){if(!e)return [];var t=this.splitRegex.exec(e);if(!t)return "text";var n=[],r=this.tokenArray;for(var i=0,s=r.length;i<s;i++)t[i+1]&&(n[n.length]={type:r[i],value:t[i+1]});return n},this.removeCapturingGroups=function(e){var t=e.replace(/\\.|\[(?:\\.|[^\\\]])*|\(\?[:=!]|(\()/g,function(e,t){return t?"(?:":e});return t},this.createSplitterRegexp=function(e,t){if(e.indexOf("(?=")!=-1){var n=0,r=!1,i={};e.replace(/(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g,function(e,t,s,o,u,a){return r?r=u!="]":u?r=!0:o?(n==i.stack&&(i.end=a+1,i.stack=-1),n--):s&&(n++,s.length!=1&&(i.stack=n,i.start=a)),e}),i.end!=null&&/^\)*$/.test(e.substr(i.end))&&(e=e.substring(0,i.start)+e.substr(i.end));}return e.charAt(0)!="^"&&(e="^"+e),e.charAt(e.length-1)!="$"&&(e+="$"),new RegExp(e,(t||"").replace("g",""))},this.getLineTokens=function(e,t){if(t&&typeof t!="string"){var n=t.slice(0);t=n[0],t==="#tmp"&&(n.shift(),t=n.shift());}else var n=[];var r=t||"start",s=this.states[r];s||(r="start",s=this.states[r]);var o=this.matchMappings[r],u=this.regExps[r];u.lastIndex=0;var a,f=[],l=0,c=0,h={type:null,value:""};while(a=u.exec(e)){var p=o.defaultToken,d=null,v=a[0],m=u.lastIndex;if(m-v.length>l){var g=e.substring(l,m-v.length);h.type==p?h.value+=g:(h.type&&f.push(h),h={type:p,value:g});}for(var y=0;y<a.length-2;y++){if(a[y+1]===undefined)continue;d=s[o[y]],d.onMatch?p=d.onMatch(v,r,n,e):p=d.token,d.next&&(typeof d.next=="string"?r=d.next:r=d.next(r,n),s=this.states[r],s||(this.reportError("state doesn't exist",r),r="start",s=this.states[r]),o=this.matchMappings[r],l=m,u=this.regExps[r],u.lastIndex=m),d.consumeLineEnd&&(l=m);break}if(v)if(typeof p=="string")!!d&&d.merge===!1||h.type!==p?(h.type&&f.push(h),h={type:p,value:v}):h.value+=v;else if(p){h.type&&f.push(h),h={type:null,value:""};for(var y=0;y<p.length;y++)f.push(p[y]);}if(l==e.length)break;l=m;if(c++>i){c>2*e.length&&this.reportError("infinite loop with in ace tokenizer",{startState:t,line:e});while(l<e.length)h.type&&f.push(h),h={value:e.substring(l,l+=500),type:"overflow"};r="start",n=[];break}}return h.type&&f.push(h),n.length>1&&n[0]!==r&&n.unshift("#tmp",r),{tokens:f,state:n.length?n:r}},this.reportError=r.reportError;}).call(s.prototype),t.Tokenizer=s;}),ace.define("ace/mode/text_highlight_rules",["require","exports","module","ace/lib/lang"],function(e,t,n){var r=e("../lib/lang"),i=function(){this.$rules={start:[{token:"empty_line",regex:"^$"},{defaultToken:"text"}]};};(function(){this.addRules=function(e,t){if(!t){for(var n in e)this.$rules[n]=e[n];return}for(var n in e){var r=e[n];for(var i=0;i<r.length;i++){var s=r[i];if(s.next||s.onMatch)typeof s.next=="string"&&s.next.indexOf(t)!==0&&(s.next=t+s.next),s.nextState&&s.nextState.indexOf(t)!==0&&(s.nextState=t+s.nextState);}this.$rules[t+n]=r;}},this.getRules=function(){return this.$rules},this.embedRules=function(e,t,n,i,s){var o=typeof e=="function"?(new e).getRules():e;if(i)for(var u=0;u<i.length;u++)i[u]=t+i[u];else {i=[];for(var a in o)i.push(t+a);}this.addRules(o,t);if(n){var f=Array.prototype[s?"push":"unshift"];for(var u=0;u<i.length;u++)f.apply(this.$rules[i[u]],r.deepCopy(n));}this.$embeds||(this.$embeds=[]),this.$embeds.push(t);},this.getEmbeds=function(){return this.$embeds};var e=function(e,t){return (e!="start"||t.length)&&t.unshift(this.nextState,e),this.nextState},t=function(e,t){return t.shift(),t.shift()||"start"};this.normalizeRules=function(){function i(s){var o=r[s];o.processed=!0;for(var u=0;u<o.length;u++){var a=o[u],f=null;Array.isArray(a)&&(f=a,a={}),!a.regex&&a.start&&(a.regex=a.start,a.next||(a.next=[]),a.next.push({defaultToken:a.token},{token:a.token+".end",regex:a.end||a.start,next:"pop"}),a.token=a.token+".start",a.push=!0);var l=a.next||a.push;if(l&&Array.isArray(l)){var c=a.stateName;c||(c=a.token,typeof c!="string"&&(c=c[0]||""),r[c]&&(c+=n++)),r[c]=l,a.next=c,i(c);}else l=="pop"&&(a.next=t);a.push&&(a.nextState=a.next||a.push,a.next=e,delete a.push);if(a.rules)for(var h in a.rules)r[h]?r[h].push&&r[h].push.apply(r[h],a.rules[h]):r[h]=a.rules[h];var p=typeof a=="string"?a:a.include;p&&(Array.isArray(p)?f=p.map(function(e){return r[e]}):f=r[p]);if(f){var d=[u,1].concat(f);a.noEscape&&(d=d.filter(function(e){return !e.next})),o.splice.apply(o,d),u--;}a.keywordMap&&(a.token=this.createKeywordMapper(a.keywordMap,a.defaultToken||"text",a.caseInsensitive),delete a.defaultToken);}}var n=0,r=this.$rules;Object.keys(r).forEach(i,this);},this.createKeywordMapper=function(e,t,n,r){var i=Object.create(null);return this.$keywordList=[],Object.keys(e).forEach(function(t){var s=e[t],o=s.split(r||"|");for(var u=o.length;u--;){var a=o[u];this.$keywordList.push(a),n&&(a=a.toLowerCase()),i[a]=t;}},this),e=null,n?function(e){return i[e.toLowerCase()]||t}:function(e){return i[e]||t}},this.getKeywords=function(){return this.$keywords};}).call(i.prototype),t.TextHighlightRules=i;}),ace.define("ace/mode/behaviour",["require","exports","module"],function(e,t,n){var r=function(){this.$behaviours={};};(function(){this.add=function(e,t,n){switch(undefined){case this.$behaviours:this.$behaviours={};case this.$behaviours[e]:this.$behaviours[e]={};}this.$behaviours[e][t]=n;},this.addBehaviours=function(e){for(var t in e)for(var n in e[t])this.add(t,n,e[t][n]);},this.remove=function(e){this.$behaviours&&this.$behaviours[e]&&delete this.$behaviours[e];},this.inherit=function(e,t){if(typeof e=="function")var n=(new e).getBehaviours(t);else var n=e.getBehaviours(t);this.addBehaviours(n);},this.getBehaviours=function(e){if(!e)return this.$behaviours;var t={};for(var n=0;n<e.length;n++)this.$behaviours[e[n]]&&(t[e[n]]=this.$behaviours[e[n]]);return t};}).call(r.prototype),t.Behaviour=r;}),ace.define("ace/token_iterator",["require","exports","module","ace/range"],function(e,t,n){var r=e("./range").Range,i=function(e,t,n){this.$session=e,this.$row=t,this.$rowTokens=e.getTokens(t);var r=e.getTokenAt(t,n);this.$tokenIndex=r?r.index:-1;};(function(){this.stepBackward=function(){this.$tokenIndex-=1;while(this.$tokenIndex<0){this.$row-=1;if(this.$row<0)return this.$row=0,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=this.$rowTokens.length-1;}return this.$rowTokens[this.$tokenIndex]},this.stepForward=function(){this.$tokenIndex+=1;var e;while(this.$tokenIndex>=this.$rowTokens.length){this.$row+=1,e||(e=this.$session.getLength());if(this.$row>=e)return this.$row=e-1,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=0;}return this.$rowTokens[this.$tokenIndex]},this.getCurrentToken=function(){return this.$rowTokens[this.$tokenIndex]},this.getCurrentTokenRow=function(){return this.$row},this.getCurrentTokenColumn=function(){var e=this.$rowTokens,t=this.$tokenIndex,n=e[t].start;if(n!==undefined)return n;n=0;while(t>0)t-=1,n+=e[t].value.length;return n},this.getCurrentTokenPosition=function(){return {row:this.$row,column:this.getCurrentTokenColumn()}},this.getCurrentTokenRange=function(){var e=this.$rowTokens[this.$tokenIndex],t=this.getCurrentTokenColumn();return new r(this.$row,t,this.$row,t+e.value.length)};}).call(i.prototype),t.TokenIterator=i;}),ace.define("ace/mode/behaviour/cstyle",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(e,t,n){var r=e("../../lib/oop"),i=e("../behaviour").Behaviour,s=e("../../token_iterator").TokenIterator,o=e("../../lib/lang"),u=["text","paren.rparen","rparen","paren","punctuation.operator"],a=["text","paren.rparen","rparen","paren","punctuation.operator","comment"],f,l={},c={'"':'"',"'":"'"},h=function(e){var t=-1;e.multiSelect&&(t=e.selection.index,l.rangeCount!=e.multiSelect.rangeCount&&(l={rangeCount:e.multiSelect.rangeCount}));if(l[t])return f=l[t];f=l[t]={autoInsertedBrackets:0,autoInsertedRow:-1,autoInsertedLineEnd:"",maybeInsertedBrackets:0,maybeInsertedRow:-1,maybeInsertedLineStart:"",maybeInsertedLineEnd:""};},p=function(e,t,n,r){var i=e.end.row-e.start.row;return {text:n+t+r,selection:[0,e.start.column+1,i,e.end.column+(i?0:1)]}},d=function(e){this.add("braces","insertion",function(t,n,r,i,s){var u=r.getCursorPosition(),a=i.doc.getLine(u.row);if(s=="{"){h(r);var l=r.getSelectionRange(),c=i.doc.getTextRange(l);if(c!==""&&c!=="{"&&r.getWrapBehavioursEnabled())return p(l,c,"{","}");if(d.isSaneInsertion(r,i))return /[\]\}\)]/.test(a[u.column])||r.inMultiSelectMode||e&&e.braces?(d.recordAutoInsert(r,i,"}"),{text:"{}",selection:[1,1]}):(d.recordMaybeInsert(r,i,"{"),{text:"{",selection:[1,1]})}else if(s=="}"){h(r);var v=a.substring(u.column,u.column+1);if(v=="}"){var m=i.$findOpeningBracket("}",{column:u.column+1,row:u.row});if(m!==null&&d.isAutoInsertedClosing(u,a,s))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}else {if(s=="\n"||s=="\r\n"){h(r);var g="";d.isMaybeInsertedClosing(u,a)&&(g=o.stringRepeat("}",f.maybeInsertedBrackets),d.clearMaybeInsertedClosing());var v=a.substring(u.column,u.column+1);if(v==="}"){var y=i.findMatchingBracket({row:u.row,column:u.column+1},"}");if(!y)return null;var b=this.$getIndent(i.getLine(y.row));}else {if(!g){d.clearMaybeInsertedClosing();return}var b=this.$getIndent(a);}var w=b+i.getTabString();return {text:"\n"+w+"\n"+b+g,selection:[1,w.length,1,w.length]}}d.clearMaybeInsertedClosing();}}),this.add("braces","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="{"){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.end.column,i.end.column+1);if(u=="}")return i.end.column++,i;f.maybeInsertedBrackets--;}}),this.add("parens","insertion",function(e,t,n,r,i){if(i=="("){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"(",")");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,")"),{text:"()",selection:[1,1]}}else if(i==")"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f==")"){var l=r.$findOpeningBracket(")",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("parens","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="("){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u==")")return i.end.column++,i}}),this.add("brackets","insertion",function(e,t,n,r,i){if(i=="["){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"[","]");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,"]"),{text:"[]",selection:[1,1]}}else if(i=="]"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f=="]"){var l=r.$findOpeningBracket("]",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("brackets","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="["){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u=="]")return i.end.column++,i}}),this.add("string_dquotes","insertion",function(e,t,n,r,i){var s=r.$mode.$quotes||c;if(i.length==1&&s[i]){if(this.lineCommentStart&&this.lineCommentStart.indexOf(i)!=-1)return;h(n);var o=i,u=n.getSelectionRange(),a=r.doc.getTextRange(u);if(a!==""&&(a.length!=1||!s[a])&&n.getWrapBehavioursEnabled())return p(u,a,o,o);if(!a){var f=n.getCursorPosition(),l=r.doc.getLine(f.row),d=l.substring(f.column-1,f.column),v=l.substring(f.column,f.column+1),m=r.getTokenAt(f.row,f.column),g=r.getTokenAt(f.row,f.column+1);if(d=="\\"&&m&&/escape/.test(m.type))return null;var y=m&&/string|escape/.test(m.type),b=!g||/string|escape/.test(g.type),w;if(v==o)w=y!==b,w&&/string\.end/.test(g.type)&&(w=!1);else {if(y&&!b)return null;if(y&&b)return null;var E=r.$mode.tokenRe;E.lastIndex=0;var S=E.test(d);E.lastIndex=0;var x=E.test(d);if(S||x)return null;if(v&&!/[\s;,.})\]\\]/.test(v))return null;var T=l[f.column-2];if(!(d!=o||T!=o&&!E.test(T)))return null;w=!0;}return {text:w?o+o:"",selection:[1,1]}}}}),this.add("string_dquotes","deletion",function(e,t,n,r,i){var s=r.$mode.$quotes||c,o=r.doc.getTextRange(i);if(!i.isMultiLine()&&s.hasOwnProperty(o)){h(n);var u=r.doc.getLine(i.start.row),a=u.substring(i.start.column+1,i.start.column+2);if(a==o)return i.end.column++,i}});};d.isSaneInsertion=function(e,t){var n=e.getCursorPosition(),r=new s(t,n.row,n.column);if(!this.$matchTokenType(r.getCurrentToken()||"text",u)){if(/[)}\]]/.test(e.session.getLine(n.row)[n.column]))return !0;var i=new s(t,n.row,n.column+1);if(!this.$matchTokenType(i.getCurrentToken()||"text",u))return !1}return r.stepForward(),r.getCurrentTokenRow()!==n.row||this.$matchTokenType(r.getCurrentToken()||"text",a)},d.$matchTokenType=function(e,t){return t.indexOf(e.type||e)>-1},d.recordAutoInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isAutoInsertedClosing(r,i,f.autoInsertedLineEnd[0])||(f.autoInsertedBrackets=0),f.autoInsertedRow=r.row,f.autoInsertedLineEnd=n+i.substr(r.column),f.autoInsertedBrackets++;},d.recordMaybeInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isMaybeInsertedClosing(r,i)||(f.maybeInsertedBrackets=0),f.maybeInsertedRow=r.row,f.maybeInsertedLineStart=i.substr(0,r.column)+n,f.maybeInsertedLineEnd=i.substr(r.column),f.maybeInsertedBrackets++;},d.isAutoInsertedClosing=function(e,t,n){return f.autoInsertedBrackets>0&&e.row===f.autoInsertedRow&&n===f.autoInsertedLineEnd[0]&&t.substr(e.column)===f.autoInsertedLineEnd},d.isMaybeInsertedClosing=function(e,t){return f.maybeInsertedBrackets>0&&e.row===f.maybeInsertedRow&&t.substr(e.column)===f.maybeInsertedLineEnd&&t.substr(0,e.column)==f.maybeInsertedLineStart},d.popAutoInsertedClosing=function(){f.autoInsertedLineEnd=f.autoInsertedLineEnd.substr(1),f.autoInsertedBrackets--;},d.clearMaybeInsertedClosing=function(){f&&(f.maybeInsertedBrackets=0,f.maybeInsertedRow=-1);},r.inherits(d,i),t.CstyleBehaviour=d;}),ace.define("ace/unicode",["require","exports","module"],function(e,t,n){var r=[48,9,8,25,5,0,2,25,48,0,11,0,5,0,6,22,2,30,2,457,5,11,15,4,8,0,2,0,18,116,2,1,3,3,9,0,2,2,2,0,2,19,2,82,2,138,2,4,3,155,12,37,3,0,8,38,10,44,2,0,2,1,2,1,2,0,9,26,6,2,30,10,7,61,2,9,5,101,2,7,3,9,2,18,3,0,17,58,3,100,15,53,5,0,6,45,211,57,3,18,2,5,3,11,3,9,2,1,7,6,2,2,2,7,3,1,3,21,2,6,2,0,4,3,3,8,3,1,3,3,9,0,5,1,2,4,3,11,16,2,2,5,5,1,3,21,2,6,2,1,2,1,2,1,3,0,2,4,5,1,3,2,4,0,8,3,2,0,8,15,12,2,2,8,2,2,2,21,2,6,2,1,2,4,3,9,2,2,2,2,3,0,16,3,3,9,18,2,2,7,3,1,3,21,2,6,2,1,2,4,3,8,3,1,3,2,9,1,5,1,2,4,3,9,2,0,17,1,2,5,4,2,2,3,4,1,2,0,2,1,4,1,4,2,4,11,5,4,4,2,2,3,3,0,7,0,15,9,18,2,2,7,2,2,2,22,2,9,2,4,4,7,2,2,2,3,8,1,2,1,7,3,3,9,19,1,2,7,2,2,2,22,2,9,2,4,3,8,2,2,2,3,8,1,8,0,2,3,3,9,19,1,2,7,2,2,2,22,2,15,4,7,2,2,2,3,10,0,9,3,3,9,11,5,3,1,2,17,4,23,2,8,2,0,3,6,4,0,5,5,2,0,2,7,19,1,14,57,6,14,2,9,40,1,2,0,3,1,2,0,3,0,7,3,2,6,2,2,2,0,2,0,3,1,2,12,2,2,3,4,2,0,2,5,3,9,3,1,35,0,24,1,7,9,12,0,2,0,2,0,5,9,2,35,5,19,2,5,5,7,2,35,10,0,58,73,7,77,3,37,11,42,2,0,4,328,2,3,3,6,2,0,2,3,3,40,2,3,3,32,2,3,3,6,2,0,2,3,3,14,2,56,2,3,3,66,5,0,33,15,17,84,13,619,3,16,2,25,6,74,22,12,2,6,12,20,12,19,13,12,2,2,2,1,13,51,3,29,4,0,5,1,3,9,34,2,3,9,7,87,9,42,6,69,11,28,4,11,5,11,11,39,3,4,12,43,5,25,7,10,38,27,5,62,2,28,3,10,7,9,14,0,89,75,5,9,18,8,13,42,4,11,71,55,9,9,4,48,83,2,2,30,14,230,23,280,3,5,3,37,3,5,3,7,2,0,2,0,2,0,2,30,3,52,2,6,2,0,4,2,2,6,4,3,3,5,5,12,6,2,2,6,67,1,20,0,29,0,14,0,17,4,60,12,5,0,4,11,18,0,5,0,3,9,2,0,4,4,7,0,2,0,2,0,2,3,2,10,3,3,6,4,5,0,53,1,2684,46,2,46,2,132,7,6,15,37,11,53,10,0,17,22,10,6,2,6,2,6,2,6,2,6,2,6,2,6,2,6,2,31,48,0,470,1,36,5,2,4,6,1,5,85,3,1,3,2,2,89,2,3,6,40,4,93,18,23,57,15,513,6581,75,20939,53,1164,68,45,3,268,4,27,21,31,3,13,13,1,2,24,9,69,11,1,38,8,3,102,3,1,111,44,25,51,13,68,12,9,7,23,4,0,5,45,3,35,13,28,4,64,15,10,39,54,10,13,3,9,7,22,4,1,5,66,25,2,227,42,2,1,3,9,7,11171,13,22,5,48,8453,301,3,61,3,105,39,6,13,4,6,11,2,12,2,4,2,0,2,1,2,1,2,107,34,362,19,63,3,53,41,11,5,15,17,6,13,1,25,2,33,4,2,134,20,9,8,25,5,0,2,25,12,88,4,5,3,5,3,5,3,2],i=0,s=[];for(var o=0;o<r.length;o+=2)s.push(i+=r[o]),r[o+1]&&s.push(45,i+=r[o+1]);t.wordChars=String.fromCharCode.apply(null,s);}),ace.define("ace/mode/text",["require","exports","module","ace/config","ace/tokenizer","ace/mode/text_highlight_rules","ace/mode/behaviour/cstyle","ace/unicode","ace/lib/lang","ace/token_iterator","ace/range"],function(e,t,n){var r=e("../config"),i=e("../tokenizer").Tokenizer,s=e("./text_highlight_rules").TextHighlightRules,o=e("./behaviour/cstyle").CstyleBehaviour,u=e("../unicode"),a=e("../lib/lang"),f=e("../token_iterator").TokenIterator,l=e("../range").Range,c=function(){this.HighlightRules=s;};(function(){this.$defaultBehaviour=new o,this.tokenRe=new RegExp("^["+u.wordChars+"\\$_]+","g"),this.nonTokenRe=new RegExp("^(?:[^"+u.wordChars+"\\$_]|\\s])+","g"),this.getTokenizer=function(){return this.$tokenizer||(this.$highlightRules=this.$highlightRules||new this.HighlightRules(this.$highlightRuleConfig),this.$tokenizer=new i(this.$highlightRules.getRules())),this.$tokenizer},this.lineCommentStart="",this.blockComment="",this.toggleCommentLines=function(e,t,n,r){function w(e){for(var t=n;t<=r;t++)e(i.getLine(t),t);}var i=t.doc,s=!0,o=!0,u=Infinity,f=t.getTabSize(),l=!1;if(!this.lineCommentStart){if(!this.blockComment)return !1;var c=this.blockComment.start,h=this.blockComment.end,p=new RegExp("^(\\s*)(?:"+a.escapeRegExp(c)+")"),d=new RegExp("(?:"+a.escapeRegExp(h)+")\\s*$"),v=function(e,t){if(g(e,t))return;if(!s||/\S/.test(e))i.insertInLine({row:t,column:e.length},h),i.insertInLine({row:t,column:u},c);},m=function(e,t){var n;(n=e.match(d))&&i.removeInLine(t,e.length-n[0].length,e.length),(n=e.match(p))&&i.removeInLine(t,n[1].length,n[0].length);},g=function(e,n){if(p.test(e))return !0;var r=t.getTokens(n);for(var i=0;i<r.length;i++)if(r[i].type==="comment")return !0};}else {if(Array.isArray(this.lineCommentStart))var p=this.lineCommentStart.map(a.escapeRegExp).join("|"),c=this.lineCommentStart[0];else var p=a.escapeRegExp(this.lineCommentStart),c=this.lineCommentStart;p=new RegExp("^(\\s*)(?:"+p+") ?"),l=t.getUseSoftTabs();var m=function(e,t){var n=e.match(p);if(!n)return;var r=n[1].length,s=n[0].length;!b(e,r,s)&&n[0][s-1]==" "&&s--,i.removeInLine(t,r,s);},y=c+" ",v=function(e,t){if(!s||/\S/.test(e))b(e,u,u)?i.insertInLine({row:t,column:u},y):i.insertInLine({row:t,column:u},c);},g=function(e,t){return p.test(e)},b=function(e,t,n){var r=0;while(t--&&e.charAt(t)==" ")r++;if(r%f!=0)return !1;var r=0;while(e.charAt(n++)==" ")r++;return f>2?r%f!=f-1:r%f==0};}var E=Infinity;w(function(e,t){var n=e.search(/\S/);n!==-1?(n<u&&(u=n),o&&!g(e,t)&&(o=!1)):E>e.length&&(E=e.length);}),u==Infinity&&(u=E,s=!1,o=!1),l&&u%f!=0&&(u=Math.floor(u/f)*f),w(o?m:v);},this.toggleBlockComment=function(e,t,n,r){var i=this.blockComment;if(!i)return;!i.start&&i[0]&&(i=i[0]);var s=new f(t,r.row,r.column),o=s.getCurrentToken(),u=t.selection,a=t.selection.toOrientedRange(),c,h;if(o&&/comment/.test(o.type)){var p,d;while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.start);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;p=new l(m,g,m,g+i.start.length);break}o=s.stepBackward();}var s=new f(t,r.row,r.column),o=s.getCurrentToken();while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.end);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;d=new l(m,g,m,g+i.end.length);break}o=s.stepForward();}d&&t.remove(d),p&&(t.remove(p),c=p.start.row,h=-i.start.length);}else h=i.start.length,c=n.start.row,t.insert(n.end,i.end),t.insert(n.start,i.start);a.start.row==c&&(a.start.column+=h),a.end.row==c&&(a.end.column+=h),t.selection.fromOrientedRange(a);},this.getNextLineIndent=function(e,t,n){return this.$getIndent(t)},this.checkOutdent=function(e,t,n){return !1},this.autoOutdent=function(e,t,n){},this.$getIndent=function(e){return e.match(/^\s*/)[0]},this.createWorker=function(e){return null},this.createModeDelegates=function(e){this.$embeds=[],this.$modes={};for(var t in e)if(e[t]){var n=e[t],i=n.prototype.$id,s=r.$modes[i];s||(r.$modes[i]=s=new n),r.$modes[t]||(r.$modes[t]=s),this.$embeds.push(t),this.$modes[t]=s;}var o=["toggleBlockComment","toggleCommentLines","getNextLineIndent","checkOutdent","autoOutdent","transformAction","getCompletions"];for(var t=0;t<o.length;t++)(function(e){var n=o[t],r=e[n];e[o[t]]=function(){return this.$delegator(n,arguments,r)};})(this);},this.$delegator=function(e,t,n){var r=t[0]||"start";if(typeof r!="string"){if(Array.isArray(r[2])){var i=r[2][r[2].length-1],s=this.$modes[i];if(s)return s[e].apply(s,[r[1]].concat([].slice.call(t,1)))}r=r[0]||"start";}for(var o=0;o<this.$embeds.length;o++){if(!this.$modes[this.$embeds[o]])continue;var u=r.split(this.$embeds[o]);if(!u[0]&&u[1]){t[0]=u[1];var s=this.$modes[this.$embeds[o]];return s[e].apply(s,t)}}var a=n.apply(this,t);return n?a:undefined},this.transformAction=function(e,t,n,r,i){if(this.$behaviour){var s=this.$behaviour.getBehaviours();for(var o in s)if(s[o][t]){var u=s[o][t].apply(this,arguments);if(u)return u}}},this.getKeywords=function(e){if(!this.completionKeywords){var t=this.$tokenizer.rules,n=[];for(var r in t){var i=t[r];for(var s=0,o=i.length;s<o;s++)if(typeof i[s].token=="string")/keyword|support|storage/.test(i[s].token)&&n.push(i[s].regex);else if(typeof i[s].token=="object")for(var u=0,a=i[s].token.length;u<a;u++)if(/keyword|support|storage/.test(i[s].token[u])){var r=i[s].regex.match(/\(.+?\)/g)[u];n.push(r.substr(1,r.length-2));}}this.completionKeywords=n;}return e?n.concat(this.$keywordList||[]):this.$keywordList},this.$createKeywordList=function(){return this.$highlightRules||this.getTokenizer(),this.$keywordList=this.$highlightRules.$keywordList||[]},this.getCompletions=function(e,t,n,r){var i=this.$keywordList||this.$createKeywordList();return i.map(function(e){return {name:e,value:e,score:0,meta:"keyword"}})},this.$id="ace/mode/text";}).call(c.prototype),t.Mode=c;}),ace.define("ace/apply_delta",["require","exports","module"],function(e,t,n){t.applyDelta=function(e,t,n){var r=t.start.row,i=t.start.column,s=e[r]||"";switch(t.action){case"insert":var o=t.lines;if(o.length===1)e[r]=s.substring(0,i)+t.lines[0]+s.substring(i);else {var u=[r,1].concat(t.lines);e.splice.apply(e,u),e[r]=s.substring(0,i)+e[r],e[r+t.lines.length-1]+=s.substring(i);}break;case"remove":var a=t.end.column,f=t.end.row;r===f?e[r]=s.substring(0,i)+s.substring(a):e.splice(r,f-r+1,s.substring(0,i)+e[f].substring(a));}};}),ace.define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=t.Anchor=function(e,t,n){this.$onChange=this.onChange.bind(this),this.attach(e),typeof n=="undefined"?this.setPosition(t.row,t.column):this.setPosition(t,n);};(function(){function e(e,t,n){var r=n?e.column<=t.column:e.column<t.column;return e.row<t.row||e.row==t.row&&r}function t(t,n,r){var i=t.action=="insert",s=(i?1:-1)*(t.end.row-t.start.row),o=(i?1:-1)*(t.end.column-t.start.column),u=t.start,a=i?u:t.end;return e(n,u,r)?{row:n.row,column:n.column}:e(a,n,!r)?{row:n.row+s,column:n.column+(n.row==a.row?o:0)}:{row:u.row,column:u.column}}r.implement(this,i),this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column)},this.getDocument=function(){return this.document},this.$insertRight=!1,this.onChange=function(e){if(e.start.row==e.end.row&&e.start.row!=this.row)return;if(e.start.row>this.row)return;var n=t(e,{row:this.row,column:this.column},this.$insertRight);this.setPosition(n.row,n.column,!0);},this.setPosition=function(e,t,n){var r;n?r={row:e,column:t}:r=this.$clipPositionToDocument(e,t);if(this.row==r.row&&this.column==r.column)return;var i={row:this.row,column:this.column};this.row=r.row,this.column=r.column,this._signal("change",{old:i,value:r});},this.detach=function(){this.document.off("change",this.$onChange);},this.attach=function(e){this.document=e||this.document,this.document.on("change",this.$onChange);},this.$clipPositionToDocument=function(e,t){var n={};return e>=this.document.getLength()?(n.row=Math.max(0,this.document.getLength()-1),n.column=this.document.getLine(n.row).length):e<0?(n.row=0,n.column=0):(n.row=e,n.column=Math.min(this.document.getLine(n.row).length,Math.max(0,t))),t<0&&(n.column=0),n};}).call(s.prototype);}),ace.define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"],function(e,t,n){var r=e("./lib/oop"),i=e("./apply_delta").applyDelta,s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=e("./anchor").Anchor,a=function(e){this.$lines=[""],e.length===0?this.$lines=[""]:Array.isArray(e)?this.insertMergedLines({row:0,column:0},e):this.insert({row:0,column:0},e);};(function(){r.implement(this,s),this.setValue=function(e){var t=this.getLength()-1;this.remove(new o(0,0,t,this.getLine(t).length)),this.insert({row:0,column:0},e);},this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter())},this.createAnchor=function(e,t){return new u(this,e,t)},"aaa".split(/a/).length===0?this.$split=function(e){return e.replace(/\r\n|\r/g,"\n").split("\n")}:this.$split=function(e){return e.split(/\r\n|\r|\n/)},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r\n|\r|\n)/m);this.$autoNewLine=t?t[1]:"\n",this._signal("changeNewLineMode");},this.getNewLineCharacter=function(){switch(this.$newLineMode){case"windows":return "\r\n";case"unix":return "\n";default:return this.$autoNewLine||"\n"}},this.$autoNewLine="",this.$newLineMode="auto",this.setNewLineMode=function(e){if(this.$newLineMode===e)return;this.$newLineMode=e,this._signal("changeNewLineMode");},this.getNewLineMode=function(){return this.$newLineMode},this.isNewLine=function(e){return e=="\r\n"||e=="\r"||e=="\n"},this.getLine=function(e){return this.$lines[e]||""},this.getLines=function(e,t){return this.$lines.slice(e,t+1)},this.getAllLines=function(){return this.getLines(0,this.getLength())},this.getLength=function(){return this.$lines.length},this.getTextRange=function(e){return this.getLinesForRange(e).join(this.getNewLineCharacter())},this.getLinesForRange=function(e){var t;if(e.start.row===e.end.row)t=[this.getLine(e.start.row).substring(e.start.column,e.end.column)];else {t=this.getLines(e.start.row,e.end.row),t[0]=(t[0]||"").substring(e.start.column);var n=t.length-1;e.end.row-e.start.row==n&&(t[n]=t[n].substring(0,e.end.column));}return t},this.insertLines=function(e,t){return console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead."),this.insertFullLines(e,t)},this.removeLines=function(e,t){return console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead."),this.removeFullLines(e,t)},this.insertNewLine=function(e){return console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead."),this.insertMergedLines(e,["",""])},this.insert=function(e,t){return this.getLength()<=1&&this.$detectNewLine(t),this.insertMergedLines(e,this.$split(t))},this.insertInLine=function(e,t){var n=this.clippedPos(e.row,e.column),r=this.pos(e.row,e.column+t.length);return this.applyDelta({start:n,end:r,action:"insert",lines:[t]},!0),this.clonePos(r)},this.clippedPos=function(e,t){var n=this.getLength();e===undefined?e=n:e<0?e=0:e>=n&&(e=n-1,t=undefined);var r=this.getLine(e);return t==undefined&&(t=r.length),t=Math.min(Math.max(t,0),r.length),{row:e,column:t}},this.clonePos=function(e){return {row:e.row,column:e.column}},this.pos=function(e,t){return {row:e,column:t}},this.$clipPosition=function(e){var t=this.getLength();return e.row>=t?(e.row=Math.max(0,t-1),e.column=this.getLine(t-1).length):(e.row=Math.max(0,e.row),e.column=Math.min(Math.max(e.column,0),this.getLine(e.row).length)),e},this.insertFullLines=function(e,t){e=Math.min(Math.max(e,0),this.getLength());var n=0;e<this.getLength()?(t=t.concat([""]),n=0):(t=[""].concat(t),e--,n=this.$lines[e].length),this.insertMergedLines({row:e,column:n},t);},this.insertMergedLines=function(e,t){var n=this.clippedPos(e.row,e.column),r={row:n.row+t.length-1,column:(t.length==1?n.column:0)+t[t.length-1].length};return this.applyDelta({start:n,end:r,action:"insert",lines:t}),this.clonePos(r)},this.remove=function(e){var t=this.clippedPos(e.start.row,e.start.column),n=this.clippedPos(e.end.row,e.end.column);return this.applyDelta({start:t,end:n,action:"remove",lines:this.getLinesForRange({start:t,end:n})}),this.clonePos(t)},this.removeInLine=function(e,t,n){var r=this.clippedPos(e,t),i=this.clippedPos(e,n);return this.applyDelta({start:r,end:i,action:"remove",lines:this.getLinesForRange({start:r,end:i})},!0),this.clonePos(r)},this.removeFullLines=function(e,t){e=Math.min(Math.max(0,e),this.getLength()-1),t=Math.min(Math.max(0,t),this.getLength()-1);var n=t==this.getLength()-1&&e>0,r=t<this.getLength()-1,i=n?e-1:e,s=n?this.getLine(i).length:0,u=r?t+1:t,a=r?0:this.getLine(u).length,f=new o(i,s,u,a),l=this.$lines.slice(e,t+1);return this.applyDelta({start:f.start,end:f.end,action:"remove",lines:this.getLinesForRange(f)}),l},this.removeNewLine=function(e){e<this.getLength()-1&&e>=0&&this.applyDelta({start:this.pos(e,this.getLine(e).length),end:this.pos(e+1,0),action:"remove",lines:["",""]});},this.replace=function(e,t){e instanceof o||(e=o.fromPoints(e.start,e.end));if(t.length===0&&e.isEmpty())return e.start;if(t==this.getTextRange(e))return e.end;this.remove(e);var n;return t?n=this.insert(e.start,t):n=e.start,n},this.applyDeltas=function(e){for(var t=0;t<e.length;t++)this.applyDelta(e[t]);},this.revertDeltas=function(e){for(var t=e.length-1;t>=0;t--)this.revertDelta(e[t]);},this.applyDelta=function(e,t){var n=e.action=="insert";if(n?e.lines.length<=1&&!e.lines[0]:!o.comparePoints(e.start,e.end))return;n&&e.lines.length>2e4?this.$splitAndapplyLargeDelta(e,2e4):(i(this.$lines,e,t),this._signal("change",e));},this.$safeApplyDelta=function(e){var t=this.$lines.length;(e.action=="remove"&&e.start.row<t&&e.end.row<t||e.action=="insert"&&e.start.row<=t)&&this.applyDelta(e);},this.$splitAndapplyLargeDelta=function(e,t){var n=e.lines,r=n.length-t+1,i=e.start.row,s=e.start.column;for(var o=0,u=0;o<r;o=u){u+=t-1;var a=n.slice(o,u);a.push(""),this.applyDelta({start:this.pos(i+o,s),end:this.pos(i+u,s=0),action:e.action,lines:a},!0);}e.lines=n.slice(o),e.start.row=i+o,e.start.column=s,this.applyDelta(e,!0);},this.revertDelta=function(e){this.$safeApplyDelta({start:this.clonePos(e.start),end:this.clonePos(e.end),action:e.action=="insert"?"remove":"insert",lines:e.lines.slice()});},this.indexToPosition=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length;for(var i=t||0,s=n.length;i<s;i++){e-=n[i].length+r;if(e<0)return {row:i,column:e+n[i].length+r}}return {row:s-1,column:e+n[s-1].length+r}},this.positionToIndex=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length,i=0,s=Math.min(e.row,n.length);for(var o=t||0;o<s;++o)i+=n[o].length+r;return i+e.column};}).call(a.prototype),t.Document=a;}),ace.define("ace/background_tokenizer",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=function(e,t){this.running=!1,this.lines=[],this.states=[],this.currentLine=0,this.tokenizer=e;var n=this;this.$worker=function(){if(!n.running)return;var e=new Date,t=n.currentLine,r=-1,i=n.doc,s=t;while(n.lines[t])t++;var o=i.getLength(),u=0;n.running=!1;while(t<o){n.$tokenizeRow(t),r=t;do t++;while(n.lines[t]);u++;if(u%5===0&&new Date-e>20){n.running=setTimeout(n.$worker,20);break}}n.currentLine=t,r==-1&&(r=t),s<=r&&n.fireUpdateEvent(s,r);};};(function(){r.implement(this,i),this.setTokenizer=function(e){this.tokenizer=e,this.lines=[],this.states=[],this.start(0);},this.setDocument=function(e){this.doc=e,this.lines=[],this.states=[],this.stop();},this.fireUpdateEvent=function(e,t){var n={first:e,last:t};this._signal("update",{data:n});},this.start=function(e){this.currentLine=Math.min(e||0,this.currentLine,this.doc.getLength()),this.lines.splice(this.currentLine,this.lines.length),this.states.splice(this.currentLine,this.states.length),this.stop(),this.running=setTimeout(this.$worker,700);},this.scheduleStart=function(){this.running||(this.running=setTimeout(this.$worker,700));},this.$updateOnChange=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.lines[t]=null;else if(e.action=="remove")this.lines.splice(t,n+1,null),this.states.splice(t,n+1,null);else {var r=Array(n+1);r.unshift(t,1),this.lines.splice.apply(this.lines,r),this.states.splice.apply(this.states,r);}this.currentLine=Math.min(t,this.currentLine,this.doc.getLength()),this.stop();},this.stop=function(){this.running&&clearTimeout(this.running),this.running=!1;},this.getTokens=function(e){return this.lines[e]||this.$tokenizeRow(e)},this.getState=function(e){return this.currentLine==e&&this.$tokenizeRow(e),this.states[e]||"start"},this.$tokenizeRow=function(e){var t=this.doc.getLine(e),n=this.states[e-1],r=this.tokenizer.getLineTokens(t,n,e);return this.states[e]+""!=r.state+""?(this.states[e]=r.state,this.lines[e+1]=null,this.currentLine>e+1&&(this.currentLine=e+1)):this.currentLine==e&&(this.currentLine=e+1),this.lines[e]=r.tokens};}).call(s.prototype),t.BackgroundTokenizer=s;}),ace.define("ace/search_highlight",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(e,t,n){this.setRegexp(e),this.clazz=t,this.type=n||"text";};(function(){this.MAX_RANGES=500,this.setRegexp=function(e){if(this.regExp+""==e+"")return;this.regExp=e,this.cache=[];},this.update=function(e,t,n,i){if(!this.regExp)return;var o=i.firstRow,u=i.lastRow;for(var a=o;a<=u;a++){var f=this.cache[a];f==null&&(f=r.getMatchOffsets(n.getLine(a),this.regExp),f.length>this.MAX_RANGES&&(f=f.slice(0,this.MAX_RANGES)),f=f.map(function(e){return new s(a,e.offset,a,e.offset+e.length)}),this.cache[a]=f.length?f:"");for(var l=f.length;l--;)t.drawSingleLineMarker(e,f[l].toScreenRange(n),this.clazz,i);}};}).call(o.prototype),t.SearchHighlight=o;}),ace.define("ace/edit_session/fold_line",["require","exports","module","ace/range"],function(e,t,n){function i(e,t){this.foldData=e,Array.isArray(t)?this.folds=t:t=this.folds=[t];var n=t[t.length-1];this.range=new r(t[0].start.row,t[0].start.column,n.end.row,n.end.column),this.start=this.range.start,this.end=this.range.end,this.folds.forEach(function(e){e.setFoldLine(this);},this);}var r=e("../range").Range;(function(){this.shiftRow=function(e){this.start.row+=e,this.end.row+=e,this.folds.forEach(function(t){t.start.row+=e,t.end.row+=e;});},this.addFold=function(e){if(e.sameRow){if(e.start.row<this.startRow||e.endRow>this.endRow)throw new Error("Can't add a fold to this FoldLine as it has no connection");this.folds.push(e),this.folds.sort(function(e,t){return -e.range.compareEnd(t.start.row,t.start.column)}),this.range.compareEnd(e.start.row,e.start.column)>0?(this.end.row=e.end.row,this.end.column=e.end.column):this.range.compareStart(e.end.row,e.end.column)<0&&(this.start.row=e.start.row,this.start.column=e.start.column);}else if(e.start.row==this.end.row)this.folds.push(e),this.end.row=e.end.row,this.end.column=e.end.column;else {if(e.end.row!=this.start.row)throw new Error("Trying to add fold to FoldRow that doesn't have a matching row");this.folds.unshift(e),this.start.row=e.start.row,this.start.column=e.start.column;}e.foldLine=this;},this.containsRow=function(e){return e>=this.start.row&&e<=this.end.row},this.walk=function(e,t,n){var r=0,i=this.folds,s,o,u,a=!0;t==null&&(t=this.end.row,n=this.end.column);for(var f=0;f<i.length;f++){s=i[f],o=s.range.compareStart(t,n);if(o==-1){e(null,t,n,r,a);return}u=e(null,s.start.row,s.start.column,r,a),u=!u&&e(s.placeholder,s.start.row,s.start.column,r);if(u||o===0)return;a=!s.sameRow,r=s.end.column;}e(null,t,n,r,a);},this.getNextFoldTo=function(e,t){var n,r;for(var i=0;i<this.folds.length;i++){n=this.folds[i],r=n.range.compareEnd(e,t);if(r==-1)return {fold:n,kind:"after"};if(r===0)return {fold:n,kind:"inside"}}return null},this.addRemoveChars=function(e,t,n){var r=this.getNextFoldTo(e,t),i,s;if(r){i=r.fold;if(r.kind=="inside"&&i.start.column!=t&&i.start.row!=e)window.console&&window.console.log(e,t,i);else if(i.start.row==e){s=this.folds;var o=s.indexOf(i);o===0&&(this.start.column+=n);for(o;o<s.length;o++){i=s[o],i.start.column+=n;if(!i.sameRow)return;i.end.column+=n;}this.end.column+=n;}}},this.split=function(e,t){var n=this.getNextFoldTo(e,t);if(!n||n.kind=="inside")return null;var r=n.fold,s=this.folds,o=this.foldData,u=s.indexOf(r),a=s[u-1];this.end.row=a.end.row,this.end.column=a.end.column,s=s.splice(u,s.length-u);var f=new i(o,s);return o.splice(o.indexOf(this)+1,0,f),f},this.merge=function(e){var t=e.folds;for(var n=0;n<t.length;n++)this.addFold(t[n]);var r=this.foldData;r.splice(r.indexOf(e),1);},this.toString=function(){var e=[this.range.toString()+": ["];return this.folds.forEach(function(t){e.push("  "+t.toString());}),e.push("]"),e.join("\n")},this.idxToPosition=function(e){var t=0;for(var n=0;n<this.folds.length;n++){var r=this.folds[n];e-=r.start.column-t;if(e<0)return {row:r.start.row,column:r.start.column+e};e-=r.placeholder.length;if(e<0)return r.start;t=r.end.column;}return {row:this.end.row,column:this.end.column+e}};}).call(i.prototype),t.FoldLine=i;}),ace.define("ace/range_list",["require","exports","module","ace/range"],function(e,t,n){var r=e("./range").Range,i=r.comparePoints,s=function(){this.ranges=[],this.$bias=1;};(function(){this.comparePoints=i,this.pointIndex=function(e,t,n){var r=this.ranges;for(var s=n||0;s<r.length;s++){var o=r[s],u=i(e,o.end);if(u>0)continue;var a=i(e,o.start);return u===0?t&&a!==0?-s-2:s:a>0||a===0&&!t?s:-s-1}return -s-1},this.add=function(e){var t=!e.isEmpty(),n=this.pointIndex(e.start,t);n<0&&(n=-n-1);var r=this.pointIndex(e.end,t,n);return r<0?r=-r-1:r++,this.ranges.splice(n,r-n,e)},this.addList=function(e){var t=[];for(var n=e.length;n--;)t.push.apply(t,this.add(e[n]));return t},this.substractPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges.splice(t,1)},this.merge=function(){var e=[],t=this.ranges;t=t.sort(function(e,t){return i(e.start,t.start)});var n=t[0],r;for(var s=1;s<t.length;s++){r=n,n=t[s];var o=i(r.end,n.start);if(o<0)continue;if(o==0&&!r.isEmpty()&&!n.isEmpty())continue;i(r.end,n.end)<0&&(r.end.row=n.end.row,r.end.column=n.end.column),t.splice(s,1),e.push(n),n=r,s--;}return this.ranges=t,e},this.contains=function(e,t){return this.pointIndex({row:e,column:t})>=0},this.containsPoint=function(e){return this.pointIndex(e)>=0},this.rangeAtPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges[t]},this.clipRows=function(e,t){var n=this.ranges;if(n[0].start.row>t||n[n.length-1].start.row<e)return [];var r=this.pointIndex({row:e,column:0});r<0&&(r=-r-1);var i=this.pointIndex({row:t,column:0},r);i<0&&(i=-i-1);var s=[];for(var o=r;o<i;o++)s.push(n[o]);return s},this.removeAll=function(){return this.ranges.splice(0,this.ranges.length)},this.attach=function(e){this.session&&this.detach(),this.session=e,this.onChange=this.$onChange.bind(this),this.session.on("change",this.onChange);},this.detach=function(){if(!this.session)return;this.session.removeListener("change",this.onChange),this.session=null;},this.$onChange=function(e){var t=e.start,n=e.end,r=t.row,i=n.row,s=this.ranges;for(var o=0,u=s.length;o<u;o++){var a=s[o];if(a.end.row>=r)break}if(e.action=="insert"){var f=i-r,l=-t.column+n.column;for(;o<u;o++){var a=s[o];if(a.start.row>r)break;a.start.row==r&&a.start.column>=t.column&&(a.start.column==t.column&&this.$bias<=0||(a.start.column+=l,a.start.row+=f));if(a.end.row==r&&a.end.column>=t.column){if(a.end.column==t.column&&this.$bias<0)continue;a.end.column==t.column&&l>0&&o<u-1&&a.end.column>a.start.column&&a.end.column==s[o+1].start.column&&(a.end.column-=l),a.end.column+=l,a.end.row+=f;}}}else {var f=r-i,l=t.column-n.column;for(;o<u;o++){var a=s[o];if(a.start.row>i)break;if(a.end.row<i&&(r<a.end.row||r==a.end.row&&t.column<a.end.column))a.end.row=r,a.end.column=t.column;else if(a.end.row==i)if(a.end.column<=n.column){if(f||a.end.column>t.column)a.end.column=t.column,a.end.row=t.row;}else a.end.column+=l,a.end.row+=f;else a.end.row>i&&(a.end.row+=f);if(a.start.row<i&&(r<a.start.row||r==a.start.row&&t.column<a.start.column))a.start.row=r,a.start.column=t.column;else if(a.start.row==i)if(a.start.column<=n.column){if(f||a.start.column>t.column)a.start.column=t.column,a.start.row=t.row;}else a.start.column+=l,a.start.row+=f;else a.start.row>i&&(a.start.row+=f);}}if(f!=0&&o<u)for(;o<u;o++){var a=s[o];a.start.row+=f,a.end.row+=f;}};}).call(s.prototype),t.RangeList=s;}),ace.define("ace/edit_session/fold",["require","exports","module","ace/range_list","ace/lib/oop"],function(e,t,n){function o(e,t){e.row-=t.row,e.row==0&&(e.column-=t.column);}function u(e,t){o(e.start,t),o(e.end,t);}function a(e,t){e.row==0&&(e.column+=t.column),e.row+=t.row;}function f(e,t){a(e.start,t),a(e.end,t);}var r=e("../range_list").RangeList,i=e("../lib/oop"),s=t.Fold=function(e,t){this.foldLine=null,this.placeholder=t,this.range=e,this.start=e.start,this.end=e.end,this.sameRow=e.start.row==e.end.row,this.subFolds=this.ranges=[];};i.inherits(s,r),function(){this.toString=function(){return '"'+this.placeholder+'" '+this.range.toString()},this.setFoldLine=function(e){this.foldLine=e,this.subFolds.forEach(function(t){t.setFoldLine(e);});},this.clone=function(){var e=this.range.clone(),t=new s(e,this.placeholder);return this.subFolds.forEach(function(e){t.subFolds.push(e.clone());}),t.collapseChildren=this.collapseChildren,t},this.addSubFold=function(e){if(this.range.isEqual(e))return;u(e,this.start);var t=e.start.row,n=e.start.column;for(var r=0,i=-1;r<this.subFolds.length;r++){i=this.subFolds[r].range.compare(t,n);if(i!=1)break}var s=this.subFolds[r],o=0;if(i==0){if(s.range.containsRange(e))return s.addSubFold(e);o=1;}var t=e.range.end.row,n=e.range.end.column;for(var a=r,i=-1;a<this.subFolds.length;a++){i=this.subFolds[a].range.compare(t,n);if(i!=1)break}i==0&&a++;var f=this.subFolds.splice(r,a-r,e),l=i==0?f.length-1:f.length;for(var c=o;c<l;c++)e.addSubFold(f[c]);return e.setFoldLine(this.foldLine),e},this.restoreRange=function(e){return f(e,this.start)};}.call(s.prototype);}),ace.define("ace/edit_session/folding",["require","exports","module","ace/range","ace/edit_session/fold_line","ace/edit_session/fold","ace/token_iterator"],function(e,t,n){function u(){this.getFoldAt=function(e,t,n){var r=this.getFoldLine(e);if(!r)return null;var i=r.folds;for(var s=0;s<i.length;s++){var o=i[s].range;if(o.contains(e,t)){if(n==1&&o.isEnd(e,t)&&!o.isEmpty())continue;if(n==-1&&o.isStart(e,t)&&!o.isEmpty())continue;return i[s]}}},this.getFoldsInRange=function(e){var t=e.start,n=e.end,r=this.$foldData,i=[];t.column+=1,n.column-=1;for(var s=0;s<r.length;s++){var o=r[s].range.compareRange(e);if(o==2)continue;if(o==-2)break;var u=r[s].folds;for(var a=0;a<u.length;a++){var f=u[a];o=f.range.compareRange(e);if(o==-2)break;if(o==2)continue;if(o==42)break;i.push(f);}}return t.column-=1,n.column+=1,i},this.getFoldsInRangeList=function(e){if(Array.isArray(e)){var t=[];e.forEach(function(e){t=t.concat(this.getFoldsInRange(e));},this);}else var t=this.getFoldsInRange(e);return t},this.getAllFolds=function(){var e=[],t=this.$foldData;for(var n=0;n<t.length;n++)for(var r=0;r<t[n].folds.length;r++)e.push(t[n].folds[r]);return e},this.getFoldStringAt=function(e,t,n,r){r=r||this.getFoldLine(e);if(!r)return null;var i={end:{column:0}},s,o;for(var u=0;u<r.folds.length;u++){o=r.folds[u];var a=o.range.compareEnd(e,t);if(a==-1){s=this.getLine(o.start.row).substring(i.end.column,o.start.column);break}if(a===0)return null;i=o;}return s||(s=this.getLine(o.start.row).substring(i.end.column)),n==-1?s.substring(0,t-i.end.column):n==1?s.substring(t-i.end.column):s},this.getFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.start.row<=e&&i.end.row>=e)return i;if(i.end.row>e)return null}return null},this.getNextFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.end.row>=e)return i}return null},this.getFoldedRowCount=function(e,t){var n=this.$foldData,r=t-e+1;for(var i=0;i<n.length;i++){var s=n[i],o=s.end.row,u=s.start.row;if(o>=t){u<t&&(u>=e?r-=t-u:r=0);break}o>=e&&(u>=e?r-=o-u:r-=o-e+1);}return r},this.$addFoldLine=function(e){return this.$foldData.push(e),this.$foldData.sort(function(e,t){return e.start.row-t.start.row}),e},this.addFold=function(e,t){var n=this.$foldData,r=!1,o;e instanceof s?o=e:(o=new s(t,e),o.collapseChildren=t.collapseChildren),this.$clipRangeToDocument(o.range);var u=o.start.row,a=o.start.column,f=o.end.row,l=o.end.column,c=this.getFoldAt(u,a,1),h=this.getFoldAt(f,l,-1);if(c&&h==c)return c.addSubFold(o);c&&!c.range.isStart(u,a)&&this.removeFold(c),h&&!h.range.isEnd(f,l)&&this.removeFold(h);var p=this.getFoldsInRange(o.range);p.length>0&&(this.removeFolds(p),o.collapseChildren||p.forEach(function(e){o.addSubFold(e);}));for(var d=0;d<n.length;d++){var v=n[d];if(f==v.start.row){v.addFold(o),r=!0;break}if(u==v.end.row){v.addFold(o),r=!0;if(!o.sameRow){var m=n[d+1];if(m&&m.start.row==f){v.merge(m);break}}break}if(f<=v.start.row)break}return r||(v=this.$addFoldLine(new i(this.$foldData,o))),this.$useWrapMode?this.$updateWrapData(v.start.row,v.start.row):this.$updateRowLengthCache(v.start.row,v.start.row),this.$modified=!0,this._signal("changeFold",{data:o,action:"add"}),o},this.addFolds=function(e){e.forEach(function(e){this.addFold(e);},this);},this.removeFold=function(e){var t=e.foldLine,n=t.start.row,r=t.end.row,i=this.$foldData,s=t.folds;if(s.length==1)i.splice(i.indexOf(t),1);else if(t.range.isEnd(e.end.row,e.end.column))s.pop(),t.end.row=s[s.length-1].end.row,t.end.column=s[s.length-1].end.column;else if(t.range.isStart(e.start.row,e.start.column))s.shift(),t.start.row=s[0].start.row,t.start.column=s[0].start.column;else if(e.sameRow)s.splice(s.indexOf(e),1);else {var o=t.split(e.start.row,e.start.column);s=o.folds,s.shift(),o.start.row=s[0].start.row,o.start.column=s[0].start.column;}this.$updating||(this.$useWrapMode?this.$updateWrapData(n,r):this.$updateRowLengthCache(n,r)),this.$modified=!0,this._signal("changeFold",{data:e,action:"remove"});},this.removeFolds=function(e){var t=[];for(var n=0;n<e.length;n++)t.push(e[n]);t.forEach(function(e){this.removeFold(e);},this),this.$modified=!0;},this.expandFold=function(e){this.removeFold(e),e.subFolds.forEach(function(t){e.restoreRange(t),this.addFold(t);},this),e.collapseChildren>0&&this.foldAll(e.start.row+1,e.end.row,e.collapseChildren-1),e.subFolds=[];},this.expandFolds=function(e){e.forEach(function(e){this.expandFold(e);},this);},this.unfold=function(e,t){var n,i;e==null?(n=new r(0,0,this.getLength(),0),t==null&&(t=!0)):typeof e=="number"?n=new r(e,0,e,this.getLine(e).length):"row"in e?n=r.fromPoints(e,e):n=e,i=this.getFoldsInRangeList(n),t!=0?this.removeFolds(i):this.expandFolds(i);if(i.length)return i},this.isRowFolded=function(e,t){return !!this.getFoldLine(e,t)},this.getRowFoldEnd=function(e,t){var n=this.getFoldLine(e,t);return n?n.end.row:e},this.getRowFoldStart=function(e,t){var n=this.getFoldLine(e,t);return n?n.start.row:e},this.getFoldDisplayLine=function(e,t,n,r,i){r==null&&(r=e.start.row),i==null&&(i=0),t==null&&(t=e.end.row),n==null&&(n=this.getLine(t).length);var s=this.doc,o="";return e.walk(function(e,t,n,u){if(t<r)return;if(t==r){if(n<i)return;u=Math.max(i,u);}e!=null?o+=e:o+=s.getLine(t).substring(u,n);},t,n),o},this.getDisplayLine=function(e,t,n,r){var i=this.getFoldLine(e);if(!i){var s;return s=this.doc.getLine(e),s.substring(r||0,t||s.length)}return this.getFoldDisplayLine(i,e,t,n,r)},this.$cloneFoldData=function(){var e=[];return e=this.$foldData.map(function(t){var n=t.folds.map(function(e){return e.clone()});return new i(e,n)}),e},this.toggleFold=function(e){var t=this.selection,n=t.getRange(),r,i;if(n.isEmpty()){var s=n.start;r=this.getFoldAt(s.row,s.column);if(r){this.expandFold(r);return}(i=this.findMatchingBracket(s))?n.comparePoint(i)==1?n.end=i:(n.start=i,n.start.column++,n.end.column--):(i=this.findMatchingBracket({row:s.row,column:s.column+1}))?(n.comparePoint(i)==1?n.end=i:n.start=i,n.start.column++):n=this.getCommentFoldRange(s.row,s.column)||n;}else {var o=this.getFoldsInRange(n);if(e&&o.length){this.expandFolds(o);return}o.length==1&&(r=o[0]);}r||(r=this.getFoldAt(n.start.row,n.start.column));if(r&&r.range.toString()==n.toString()){this.expandFold(r);return}var u="...";if(!n.isMultiLine()){u=this.getTextRange(n);if(u.length<4)return;u=u.trim().substring(0,2)+"..";}this.addFold(u,n);},this.getCommentFoldRange=function(e,t,n){var i=new o(this,e,t),s=i.getCurrentToken(),u=s&&s.type;if(s&&/^comment|string/.test(u)){u=u.match(/comment|string/)[0],u=="comment"&&(u+="|doc-start");var a=new RegExp(u),f=new r;if(n!=1){do s=i.stepBackward();while(s&&a.test(s.type));i.stepForward();}f.start.row=i.getCurrentTokenRow(),f.start.column=i.getCurrentTokenColumn()+2,i=new o(this,e,t);if(n!=-1){var l=-1;do{s=i.stepForward();if(l==-1){var c=this.getState(i.$row);a.test(c)||(l=i.$row);}else if(i.$row>l)break}while(s&&a.test(s.type));s=i.stepBackward();}else s=i.getCurrentToken();return f.end.row=i.getCurrentTokenRow(),f.end.column=i.getCurrentTokenColumn()+s.value.length-2,f}},this.foldAll=function(e,t,n,r){n==undefined&&(n=1e5);var i=this.foldWidgets;if(!i)return;t=t||this.getLength(),e=e||0;for(var s=e;s<t;s++){i[s]==null&&(i[s]=this.getFoldWidget(s));if(i[s]!="start")continue;if(r&&!r(s))continue;var o=this.getFoldWidgetRange(s);o&&o.isMultiLine()&&o.end.row<=t&&o.start.row>=e&&(s=o.end.row,o.collapseChildren=n,this.addFold("...",o));}},this.foldToLevel=function(e){this.foldAll();while(e-->0)this.unfold(null,!1);},this.foldAllComments=function(){var e=this;this.foldAll(null,null,null,function(t){var n=e.getTokens(t);for(var r=0;r<n.length;r++){var i=n[r];if(i.type=="text"&&/^\s+$/.test(i.value))continue;return /comment/.test(i.type)?!0:!1}});},this.$foldStyles={manual:1,markbegin:1,markbeginend:1},this.$foldStyle="markbegin",this.setFoldStyle=function(e){if(!this.$foldStyles[e])throw new Error("invalid fold style: "+e+"["+Object.keys(this.$foldStyles).join(", ")+"]");if(this.$foldStyle==e)return;this.$foldStyle=e,e=="manual"&&this.unfold();var t=this.$foldMode;this.$setFolding(null),this.$setFolding(t);},this.$setFolding=function(e){if(this.$foldMode==e)return;this.$foldMode=e,this.off("change",this.$updateFoldWidgets),this.off("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets),this._signal("changeAnnotation");if(!e||this.$foldStyle=="manual"){this.foldWidgets=null;return}this.foldWidgets=[],this.getFoldWidget=e.getFoldWidget.bind(e,this,this.$foldStyle),this.getFoldWidgetRange=e.getFoldWidgetRange.bind(e,this,this.$foldStyle),this.$updateFoldWidgets=this.updateFoldWidgets.bind(this),this.$tokenizerUpdateFoldWidgets=this.tokenizerUpdateFoldWidgets.bind(this),this.on("change",this.$updateFoldWidgets),this.on("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets);},this.getParentFoldRangeData=function(e,t){var n=this.foldWidgets;if(!n||t&&n[e])return {};var r=e-1,i;while(r>=0){var s=n[r];s==null&&(s=n[r]=this.getFoldWidget(r));if(s=="start"){var o=this.getFoldWidgetRange(r);i||(i=o);if(o&&o.end.row>=e)break}r--;}return {range:r!==-1&&o,firstRange:i}},this.onFoldWidgetClick=function(e,t){t=t.domEvent;var n={children:t.shiftKey,all:t.ctrlKey||t.metaKey,siblings:t.altKey},r=this.$toggleFoldWidget(e,n);if(!r){var i=t.target||t.srcElement;i&&/ace_fold-widget/.test(i.className)&&(i.className+=" ace_invalid");}},this.$toggleFoldWidget=function(e,t){if(!this.getFoldWidget)return;var n=this.getFoldWidget(e),r=this.getLine(e),i=n==="end"?-1:1,s=this.getFoldAt(e,i===-1?0:r.length,i);if(s)return t.children||t.all?this.removeFold(s):this.expandFold(s),s;var o=this.getFoldWidgetRange(e,!0);if(o&&!o.isMultiLine()){s=this.getFoldAt(o.start.row,o.start.column,1);if(s&&o.isEqual(s.range))return this.removeFold(s),s}if(t.siblings){var u=this.getParentFoldRangeData(e);if(u.range)var a=u.range.start.row+1,f=u.range.end.row;this.foldAll(a,f,t.all?1e4:0);}else t.children?(f=o?o.end.row:this.getLength(),this.foldAll(e+1,f,t.all?1e4:0)):o&&(t.all&&(o.collapseChildren=1e4),this.addFold("...",o));return o},this.toggleFoldWidget=function(e){var t=this.selection.getCursor().row;t=this.getRowFoldStart(t);var n=this.$toggleFoldWidget(t,{});if(n)return;var r=this.getParentFoldRangeData(t,!0);n=r.range||r.firstRange;if(n){t=n.start.row;var i=this.getFoldAt(t,this.getLine(t).length,1);i?this.removeFold(i):this.addFold("...",n);}},this.updateFoldWidgets=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.foldWidgets[t]=null;else if(e.action=="remove")this.foldWidgets.splice(t,n+1,null);else {var r=Array(n+1);r.unshift(t,1),this.foldWidgets.splice.apply(this.foldWidgets,r);}},this.tokenizerUpdateFoldWidgets=function(e){var t=e.data;t.first!=t.last&&this.foldWidgets.length>t.first&&this.foldWidgets.splice(t.first,this.foldWidgets.length);};}var r=e("../range").Range,i=e("./fold_line").FoldLine,s=e("./fold").Fold,o=e("../token_iterator").TokenIterator;t.Folding=u;}),ace.define("ace/edit_session/bracket_match",["require","exports","module","ace/token_iterator","ace/range"],function(e,t,n){function s(){this.findMatchingBracket=function(e,t){if(e.column==0)return null;var n=t||this.getLine(e.row).charAt(e.column-1);if(n=="")return null;var r=n.match(/([\(\[\{])|([\)\]\}])/);return r?r[1]?this.$findClosingBracket(r[1],e):this.$findOpeningBracket(r[2],e):null},this.getBracketRange=function(e){var t=this.getLine(e.row),n=!0,r,s=t.charAt(e.column-1),o=s&&s.match(/([\(\[\{])|([\)\]\}])/);o||(s=t.charAt(e.column),e={row:e.row,column:e.column+1},o=s&&s.match(/([\(\[\{])|([\)\]\}])/),n=!1);if(!o)return null;if(o[1]){var u=this.$findClosingBracket(o[1],e);if(!u)return null;r=i.fromPoints(e,u),n||(r.end.column++,r.start.column--),r.cursor=r.end;}else {var u=this.$findOpeningBracket(o[2],e);if(!u)return null;r=i.fromPoints(u,e),n||(r.start.column++,r.end.column--),r.cursor=r.start;}return r},this.getMatchingBracketRanges=function(e){var t=this.getLine(e.row),n=t.charAt(e.column-1),r=n&&n.match(/([\(\[\{])|([\)\]\}])/);r||(n=t.charAt(e.column),e={row:e.row,column:e.column+1},r=n&&n.match(/([\(\[\{])|([\)\]\}])/));if(!r)return null;var s=new i(e.row,e.column-1,e.row,e.column),o=r[1]?this.$findClosingBracket(r[1],e):this.$findOpeningBracket(r[2],e);if(!o)return [s];var u=new i(o.row,o.column,o.row,o.column+1);return [s,u]},this.$brackets={")":"(","(":")","]":"[","[":"]","{":"}","}":"{","<":">",">":"<"},this.$findOpeningBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("rparen",".paren").replace(/\b(?:end)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn()-2,f=u.value;for(;;){while(a>=0){var l=f.charAt(a);if(l==i){s-=1;if(s==0)return {row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else l==e&&(s+=1);a-=1;}do u=o.stepBackward();while(u&&!n.test(u.type));if(u==null)break;f=u.value,a=f.length-1;}return null},this.$findClosingBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("lparen",".paren").replace(/\b(?:start|begin)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn();for(;;){var f=u.value,l=f.length;while(a<l){var c=f.charAt(a);if(c==i){s-=1;if(s==0)return {row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else c==e&&(s+=1);a+=1;}do u=o.stepForward();while(u&&!n.test(u.type));if(u==null)break;a=0;}return null};}var r=e("../token_iterator").TokenIterator,i=e("../range").Range;t.BracketMatch=s;}),ace.define("ace/edit_session",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/bidihandler","ace/config","ace/lib/event_emitter","ace/selection","ace/mode/text","ace/range","ace/document","ace/background_tokenizer","ace/search_highlight","ace/edit_session/folding","ace/edit_session/bracket_match"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./bidihandler").BidiHandler,o=e("./config"),u=e("./lib/event_emitter").EventEmitter,a=e("./selection").Selection,f=e("./mode/text").Mode,l=e("./range").Range,c=e("./document").Document,h=e("./background_tokenizer").BackgroundTokenizer,p=e("./search_highlight").SearchHighlight,d=function(e,t){this.$breakpoints=[],this.$decorations=[],this.$frontMarkers={},this.$backMarkers={},this.$markerId=1,this.$undoSelect=!0,this.$foldData=[],this.id="session"+ ++d.$uid,this.$foldData.toString=function(){return this.join("\n")},this.on("changeFold",this.onChangeFold.bind(this)),this.$onChange=this.onChange.bind(this);if(typeof e!="object"||!e.getLine)e=new c(e);this.setDocument(e),this.selection=new a(this),this.$bidiHandler=new s(this),o.resetOptions(this),this.setMode(t),o._signal("session",this);};d.$uid=0,function(){function m(e){return e<4352?!1:e>=4352&&e<=4447||e>=4515&&e<=4519||e>=4602&&e<=4607||e>=9001&&e<=9002||e>=11904&&e<=11929||e>=11931&&e<=12019||e>=12032&&e<=12245||e>=12272&&e<=12283||e>=12288&&e<=12350||e>=12353&&e<=12438||e>=12441&&e<=12543||e>=12549&&e<=12589||e>=12593&&e<=12686||e>=12688&&e<=12730||e>=12736&&e<=12771||e>=12784&&e<=12830||e>=12832&&e<=12871||e>=12880&&e<=13054||e>=13056&&e<=19903||e>=19968&&e<=42124||e>=42128&&e<=42182||e>=43360&&e<=43388||e>=44032&&e<=55203||e>=55216&&e<=55238||e>=55243&&e<=55291||e>=63744&&e<=64255||e>=65040&&e<=65049||e>=65072&&e<=65106||e>=65108&&e<=65126||e>=65128&&e<=65131||e>=65281&&e<=65376||e>=65504&&e<=65510}r.implement(this,u),this.setDocument=function(e){this.doc&&this.doc.removeListener("change",this.$onChange),this.doc=e,e.on("change",this.$onChange),this.bgTokenizer&&this.bgTokenizer.setDocument(this.getDocument()),this.resetCaches();},this.getDocument=function(){return this.doc},this.$resetRowCache=function(e){if(!e){this.$docRowCache=[],this.$screenRowCache=[];return}var t=this.$docRowCache.length,n=this.$getRowCacheIndex(this.$docRowCache,e)+1;t>n&&(this.$docRowCache.splice(n,t),this.$screenRowCache.splice(n,t));},this.$getRowCacheIndex=function(e,t){var n=0,r=e.length-1;while(n<=r){var i=n+r>>1,s=e[i];if(t>s)n=i+1;else {if(!(t<s))return i;r=i-1;}}return n-1},this.resetCaches=function(){this.$modified=!0,this.$wrapData=[],this.$rowLengthCache=[],this.$resetRowCache(0),this.bgTokenizer&&this.bgTokenizer.start(0);},this.onChangeFold=function(e){var t=e.data;this.$resetRowCache(t.start.row);},this.onChange=function(e){this.$modified=!0,this.$bidiHandler.onChange(e),this.$resetRowCache(e.start.row);var t=this.$updateInternalDataOnChange(e);!this.$fromUndo&&this.$undoManager&&(t&&t.length&&(this.$undoManager.add({action:"removeFolds",folds:t},this.mergeUndoDeltas),this.mergeUndoDeltas=!0),this.$undoManager.add(e,this.mergeUndoDeltas),this.mergeUndoDeltas=!0,this.$informUndoManager.schedule()),this.bgTokenizer&&this.bgTokenizer.$updateOnChange(e),this._signal("change",e);},this.setValue=function(e){this.doc.setValue(e),this.selection.moveTo(0,0),this.$resetRowCache(0),this.setUndoManager(this.$undoManager),this.getUndoManager().reset();},this.getValue=this.toString=function(){return this.doc.getValue()},this.getSelection=function(){return this.selection},this.getState=function(e){return this.bgTokenizer.getState(e)},this.getTokens=function(e){return this.bgTokenizer.getTokens(e)},this.getTokenAt=function(e,t){var n=this.bgTokenizer.getTokens(e),r,i=0;if(t==null){var s=n.length-1;i=this.getLine(e).length;}else for(var s=0;s<n.length;s++){i+=n[s].value.length;if(i>=t)break}return r=n[s],r?(r.index=s,r.start=i-r.value.length,r):null},this.setUndoManager=function(e){this.$undoManager=e,this.$informUndoManager&&this.$informUndoManager.cancel();if(e){var t=this;e.addSession(this),this.$syncInformUndoManager=function(){t.$informUndoManager.cancel(),t.mergeUndoDeltas=!1;},this.$informUndoManager=i.delayedCall(this.$syncInformUndoManager);}else this.$syncInformUndoManager=function(){};},this.markUndoGroup=function(){this.$syncInformUndoManager&&this.$syncInformUndoManager();},this.$defaultUndoManager={undo:function(){},redo:function(){},hasUndo:function(){},hasRedo:function(){},reset:function(){},add:function(){},addSelection:function(){},startNewGroup:function(){},addSession:function(){}},this.getUndoManager=function(){return this.$undoManager||this.$defaultUndoManager},this.getTabString=function(){return this.getUseSoftTabs()?i.stringRepeat(" ",this.getTabSize()):"	"},this.setUseSoftTabs=function(e){this.setOption("useSoftTabs",e);},this.getUseSoftTabs=function(){return this.$useSoftTabs&&!this.$mode.$indentWithTabs},this.setTabSize=function(e){this.setOption("tabSize",e);},this.getTabSize=function(){return this.$tabSize},this.isTabStop=function(e){return this.$useSoftTabs&&e.column%this.$tabSize===0},this.setNavigateWithinSoftTabs=function(e){this.setOption("navigateWithinSoftTabs",e);},this.getNavigateWithinSoftTabs=function(){return this.$navigateWithinSoftTabs},this.$overwrite=!1,this.setOverwrite=function(e){this.setOption("overwrite",e);},this.getOverwrite=function(){return this.$overwrite},this.toggleOverwrite=function(){this.setOverwrite(!this.$overwrite);},this.addGutterDecoration=function(e,t){this.$decorations[e]||(this.$decorations[e]=""),this.$decorations[e]+=" "+t,this._signal("changeBreakpoint",{});},this.removeGutterDecoration=function(e,t){this.$decorations[e]=(this.$decorations[e]||"").replace(" "+t,""),this._signal("changeBreakpoint",{});},this.getBreakpoints=function(){return this.$breakpoints},this.setBreakpoints=function(e){this.$breakpoints=[];for(var t=0;t<e.length;t++)this.$breakpoints[e[t]]="ace_breakpoint";this._signal("changeBreakpoint",{});},this.clearBreakpoints=function(){this.$breakpoints=[],this._signal("changeBreakpoint",{});},this.setBreakpoint=function(e,t){t===undefined&&(t="ace_breakpoint"),t?this.$breakpoints[e]=t:delete this.$breakpoints[e],this._signal("changeBreakpoint",{});},this.clearBreakpoint=function(e){delete this.$breakpoints[e],this._signal("changeBreakpoint",{});},this.addMarker=function(e,t,n,r){var i=this.$markerId++,s={range:e,type:n||"line",renderer:typeof n=="function"?n:null,clazz:t,inFront:!!r,id:i};return r?(this.$frontMarkers[i]=s,this._signal("changeFrontMarker")):(this.$backMarkers[i]=s,this._signal("changeBackMarker")),i},this.addDynamicMarker=function(e,t){if(!e.update)return;var n=this.$markerId++;return e.id=n,e.inFront=!!t,t?(this.$frontMarkers[n]=e,this._signal("changeFrontMarker")):(this.$backMarkers[n]=e,this._signal("changeBackMarker")),e},this.removeMarker=function(e){var t=this.$frontMarkers[e]||this.$backMarkers[e];if(!t)return;var n=t.inFront?this.$frontMarkers:this.$backMarkers;delete n[e],this._signal(t.inFront?"changeFrontMarker":"changeBackMarker");},this.getMarkers=function(e){return e?this.$frontMarkers:this.$backMarkers},this.highlight=function(e){if(!this.$searchHighlight){var t=new p(null,"ace_selected-word","text");this.$searchHighlight=this.addDynamicMarker(t);}this.$searchHighlight.setRegexp(e);},this.highlightLines=function(e,t,n,r){typeof t!="number"&&(n=t,t=e),n||(n="ace_step");var i=new l(e,0,t,Infinity);return i.id=this.addMarker(i,n,"fullLine",r),i},this.setAnnotations=function(e){this.$annotations=e,this._signal("changeAnnotation",{});},this.getAnnotations=function(){return this.$annotations||[]},this.clearAnnotations=function(){this.setAnnotations([]);},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r?\n)/m);t?this.$autoNewLine=t[1]:this.$autoNewLine="\n";},this.getWordRange=function(e,t){var n=this.getLine(e),r=!1;t>0&&(r=!!n.charAt(t-1).match(this.tokenRe)),r||(r=!!n.charAt(t).match(this.tokenRe));if(r)var i=this.tokenRe;else if(/^\s+$/.test(n.slice(t-1,t+1)))var i=/\s/;else var i=this.nonTokenRe;var s=t;if(s>0){do s--;while(s>=0&&n.charAt(s).match(i));s++;}var o=t;while(o<n.length&&n.charAt(o).match(i))o++;return new l(e,s,e,o)},this.getAWordRange=function(e,t){var n=this.getWordRange(e,t),r=this.getLine(n.end.row);while(r.charAt(n.end.column).match(/[ \t]/))n.end.column+=1;return n},this.setNewLineMode=function(e){this.doc.setNewLineMode(e);},this.getNewLineMode=function(){return this.doc.getNewLineMode()},this.setUseWorker=function(e){this.setOption("useWorker",e);},this.getUseWorker=function(){return this.$useWorker},this.onReloadTokenizer=function(e){var t=e.data;this.bgTokenizer.start(t.first),this._signal("tokenizerUpdate",e);},this.$modes=o.$modes,this.$mode=null,this.$modeId=null,this.setMode=function(e,t){if(e&&typeof e=="object"){if(e.getTokenizer)return this.$onChangeMode(e);var n=e,r=n.path;}else r=e||"ace/mode/text";this.$modes["ace/mode/text"]||(this.$modes["ace/mode/text"]=new f);if(this.$modes[r]&&!n){this.$onChangeMode(this.$modes[r]),t&&t();return}this.$modeId=r,o.loadModule(["mode",r],function(e){if(this.$modeId!==r)return t&&t();this.$modes[r]&&!n?this.$onChangeMode(this.$modes[r]):e&&e.Mode&&(e=new e.Mode(n),n||(this.$modes[r]=e,e.$id=r),this.$onChangeMode(e)),t&&t();}.bind(this)),this.$mode||this.$onChangeMode(this.$modes["ace/mode/text"],!0);},this.$onChangeMode=function(e,t){t||(this.$modeId=e.$id);if(this.$mode===e)return;var n=this.$mode;this.$mode=e,this.$stopWorker(),this.$useWorker&&this.$startWorker();var r=e.getTokenizer();if(r.on!==undefined){var i=this.onReloadTokenizer.bind(this);r.on("update",i);}if(!this.bgTokenizer){this.bgTokenizer=new h(r);var s=this;this.bgTokenizer.on("update",function(e){s._signal("tokenizerUpdate",e);});}else this.bgTokenizer.setTokenizer(r);this.bgTokenizer.setDocument(this.getDocument()),this.tokenRe=e.tokenRe,this.nonTokenRe=e.nonTokenRe,t||(e.attachToSession&&e.attachToSession(this),this.$options.wrapMethod.set.call(this,this.$wrapMethod),this.$setFolding(e.foldingRules),this.bgTokenizer.start(0),this._emit("changeMode",{oldMode:n,mode:e}));},this.$stopWorker=function(){this.$worker&&(this.$worker.terminate(),this.$worker=null);},this.$startWorker=function(){try{this.$worker=this.$mode.createWorker(this);}catch(e){o.warn("Could not load worker",e),this.$worker=null;}},this.getMode=function(){return this.$mode},this.$scrollTop=0,this.setScrollTop=function(e){if(this.$scrollTop===e||isNaN(e))return;this.$scrollTop=e,this._signal("changeScrollTop",e);},this.getScrollTop=function(){return this.$scrollTop},this.$scrollLeft=0,this.setScrollLeft=function(e){if(this.$scrollLeft===e||isNaN(e))return;this.$scrollLeft=e,this._signal("changeScrollLeft",e);},this.getScrollLeft=function(){return this.$scrollLeft},this.getScreenWidth=function(){return this.$computeWidth(),this.lineWidgets?Math.max(this.getLineWidgetMaxWidth(),this.screenWidth):this.screenWidth},this.getLineWidgetMaxWidth=function(){if(this.lineWidgetsWidth!=null)return this.lineWidgetsWidth;var e=0;return this.lineWidgets.forEach(function(t){t&&t.screenWidth>e&&(e=t.screenWidth);}),this.lineWidgetWidth=e},this.$computeWidth=function(e){if(this.$modified||e){this.$modified=!1;if(this.$useWrapMode)return this.screenWidth=this.$wrapLimit;var t=this.doc.getAllLines(),n=this.$rowLengthCache,r=0,i=0,s=this.$foldData[i],o=s?s.start.row:Infinity,u=t.length;for(var a=0;a<u;a++){if(a>o){a=s.end.row+1;if(a>=u)break;s=this.$foldData[i++],o=s?s.start.row:Infinity;}n[a]==null&&(n[a]=this.$getStringScreenWidth(t[a])[0]),n[a]>r&&(r=n[a]);}this.screenWidth=r;}},this.getLine=function(e){return this.doc.getLine(e)},this.getLines=function(e,t){return this.doc.getLines(e,t)},this.getLength=function(){return this.doc.getLength()},this.getTextRange=function(e){return this.doc.getTextRange(e||this.selection.getRange())},this.insert=function(e,t){return this.doc.insert(e,t)},this.remove=function(e){return this.doc.remove(e)},this.removeFullLines=function(e,t){return this.doc.removeFullLines(e,t)},this.undoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;for(var n=e.length-1;n!=-1;n--){var r=e[n];r.action=="insert"||r.action=="remove"?this.doc.revertDelta(r):r.folds&&this.addFolds(r.folds);}!t&&this.$undoSelect&&(e.selectionBefore?this.selection.fromJSON(e.selectionBefore):this.selection.setRange(this.$getUndoSelection(e,!0))),this.$fromUndo=!1;},this.redoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;for(var n=0;n<e.length;n++){var r=e[n];(r.action=="insert"||r.action=="remove")&&this.doc.$safeApplyDelta(r);}!t&&this.$undoSelect&&(e.selectionAfter?this.selection.fromJSON(e.selectionAfter):this.selection.setRange(this.$getUndoSelection(e,!1))),this.$fromUndo=!1;},this.setUndoSelect=function(e){this.$undoSelect=e;},this.$getUndoSelection=function(e,t){function n(e){return t?e.action!=="insert":e.action==="insert"}var r,i;for(var s=0;s<e.length;s++){var o=e[s];if(!o.start)continue;if(!r){n(o)?r=l.fromPoints(o.start,o.end):r=l.fromPoints(o.start,o.start);continue}n(o)?(i=o.start,r.compare(i.row,i.column)==-1&&r.setStart(i),i=o.end,r.compare(i.row,i.column)==1&&r.setEnd(i)):(i=o.start,r.compare(i.row,i.column)==-1&&(r=l.fromPoints(o.start,o.start)));}return r},this.replace=function(e,t){return this.doc.replace(e,t)},this.moveText=function(e,t,n){var r=this.getTextRange(e),i=this.getFoldsInRange(e),s=l.fromPoints(t,t);if(!n){this.remove(e);var o=e.start.row-e.end.row,u=o?-e.end.column:e.start.column-e.end.column;u&&(s.start.row==e.end.row&&s.start.column>e.end.column&&(s.start.column+=u),s.end.row==e.end.row&&s.end.column>e.end.column&&(s.end.column+=u)),o&&s.start.row>=e.end.row&&(s.start.row+=o,s.end.row+=o);}s.end=this.insert(s.start,r);if(i.length){var a=e.start,f=s.start,o=f.row-a.row,u=f.column-a.column;this.addFolds(i.map(function(e){return e=e.clone(),e.start.row==a.row&&(e.start.column+=u),e.end.row==a.row&&(e.end.column+=u),e.start.row+=o,e.end.row+=o,e}));}return s},this.indentRows=function(e,t,n){n=n.replace(/\t/g,this.getTabString());for(var r=e;r<=t;r++)this.doc.insertInLine({row:r,column:0},n);},this.outdentRows=function(e){var t=e.collapseRows(),n=new l(0,0,0,0),r=this.getTabSize();for(var i=t.start.row;i<=t.end.row;++i){var s=this.getLine(i);n.start.row=i,n.end.row=i;for(var o=0;o<r;++o)if(s.charAt(o)!=" ")break;o<r&&s.charAt(o)=="	"?(n.start.column=o,n.end.column=o+1):(n.start.column=0,n.end.column=o),this.remove(n);}},this.$moveLines=function(e,t,n){e=this.getRowFoldStart(e),t=this.getRowFoldEnd(t);if(n<0){var r=this.getRowFoldStart(e+n);if(r<0)return 0;var i=r-e;}else if(n>0){var r=this.getRowFoldEnd(t+n);if(r>this.doc.getLength()-1)return 0;var i=r-t;}else {e=this.$clipRowToDocument(e),t=this.$clipRowToDocument(t);var i=t-e+1;}var s=new l(e,0,t,Number.MAX_VALUE),o=this.getFoldsInRange(s).map(function(e){return e=e.clone(),e.start.row+=i,e.end.row+=i,e}),u=n==0?this.doc.getLines(e,t):this.doc.removeFullLines(e,t);return this.doc.insertFullLines(e+i,u),o.length&&this.addFolds(o),i},this.moveLinesUp=function(e,t){return this.$moveLines(e,t,-1)},this.moveLinesDown=function(e,t){return this.$moveLines(e,t,1)},this.duplicateLines=function(e,t){return this.$moveLines(e,t,0)},this.$clipRowToDocument=function(e){return Math.max(0,Math.min(e,this.doc.getLength()-1))},this.$clipColumnToRow=function(e,t){return t<0?0:Math.min(this.doc.getLine(e).length,t)},this.$clipPositionToDocument=function(e,t){t=Math.max(0,t);if(e<0)e=0,t=0;else {var n=this.doc.getLength();e>=n?(e=n-1,t=this.doc.getLine(n-1).length):t=Math.min(this.doc.getLine(e).length,t);}return {row:e,column:t}},this.$clipRangeToDocument=function(e){e.start.row<0?(e.start.row=0,e.start.column=0):e.start.column=this.$clipColumnToRow(e.start.row,e.start.column);var t=this.doc.getLength()-1;return e.end.row>t?(e.end.row=t,e.end.column=this.doc.getLine(t).length):e.end.column=this.$clipColumnToRow(e.end.row,e.end.column),e},this.$wrapLimit=80,this.$useWrapMode=!1,this.$wrapLimitRange={min:null,max:null},this.setUseWrapMode=function(e){if(e!=this.$useWrapMode){this.$useWrapMode=e,this.$modified=!0,this.$resetRowCache(0);if(e){var t=this.getLength();this.$wrapData=Array(t),this.$updateWrapData(0,t-1);}this._signal("changeWrapMode");}},this.getUseWrapMode=function(){return this.$useWrapMode},this.setWrapLimitRange=function(e,t){if(this.$wrapLimitRange.min!==e||this.$wrapLimitRange.max!==t)this.$wrapLimitRange={min:e,max:t},this.$modified=!0,this.$bidiHandler.markAsDirty(),this.$useWrapMode&&this._signal("changeWrapMode");},this.adjustWrapLimit=function(e,t){var n=this.$wrapLimitRange;n.max<0&&(n={min:t,max:t});var r=this.$constrainWrapLimit(e,n.min,n.max);return r!=this.$wrapLimit&&r>1?(this.$wrapLimit=r,this.$modified=!0,this.$useWrapMode&&(this.$updateWrapData(0,this.getLength()-1),this.$resetRowCache(0),this._signal("changeWrapLimit")),!0):!1},this.$constrainWrapLimit=function(e,t,n){return t&&(e=Math.max(t,e)),n&&(e=Math.min(n,e)),e},this.getWrapLimit=function(){return this.$wrapLimit},this.setWrapLimit=function(e){this.setWrapLimitRange(e,e);},this.getWrapLimitRange=function(){return {min:this.$wrapLimitRange.min,max:this.$wrapLimitRange.max}},this.$updateInternalDataOnChange=function(e){var t=this.$useWrapMode,n=e.action,r=e.start,i=e.end,s=r.row,o=i.row,u=o-s,a=null;this.$updating=!0;if(u!=0)if(n==="remove"){this[t?"$wrapData":"$rowLengthCache"].splice(s,u);var f=this.$foldData;a=this.getFoldsInRange(e),this.removeFolds(a);var l=this.getFoldLine(i.row),c=0;if(l){l.addRemoveChars(i.row,i.column,r.column-i.column),l.shiftRow(-u);var h=this.getFoldLine(s);h&&h!==l&&(h.merge(l),l=h),c=f.indexOf(l)+1;}for(c;c<f.length;c++){var l=f[c];l.start.row>=i.row&&l.shiftRow(-u);}o=s;}else {var p=Array(u);p.unshift(s,0);var d=t?this.$wrapData:this.$rowLengthCache;d.splice.apply(d,p);var f=this.$foldData,l=this.getFoldLine(s),c=0;if(l){var v=l.range.compareInside(r.row,r.column);v==0?(l=l.split(r.row,r.column),l&&(l.shiftRow(u),l.addRemoveChars(o,0,i.column-r.column))):v==-1&&(l.addRemoveChars(s,0,i.column-r.column),l.shiftRow(u)),c=f.indexOf(l)+1;}for(c;c<f.length;c++){var l=f[c];l.start.row>=s&&l.shiftRow(u);}}else {u=Math.abs(e.start.column-e.end.column),n==="remove"&&(a=this.getFoldsInRange(e),this.removeFolds(a),u=-u);var l=this.getFoldLine(s);l&&l.addRemoveChars(s,r.column,u);}return t&&this.$wrapData.length!=this.doc.getLength()&&console.error("doc.getLength() and $wrapData.length have to be the same!"),this.$updating=!1,t?this.$updateWrapData(s,o):this.$updateRowLengthCache(s,o),a},this.$updateRowLengthCache=function(e,t,n){this.$rowLengthCache[e]=null,this.$rowLengthCache[t]=null;},this.$updateWrapData=function(e,t){var r=this.doc.getAllLines(),i=this.getTabSize(),o=this.$wrapData,u=this.$wrapLimit,a,f,l=e;t=Math.min(t,r.length-1);while(l<=t)f=this.getFoldLine(l,f),f?(a=[],f.walk(function(e,t,i,o){var u;if(e!=null){u=this.$getDisplayTokens(e,a.length),u[0]=n;for(var f=1;f<u.length;f++)u[f]=s;}else u=this.$getDisplayTokens(r[t].substring(o,i),a.length);a=a.concat(u);}.bind(this),f.end.row,r[f.end.row].length+1),o[f.start.row]=this.$computeWrapSplits(a,u,i),l=f.end.row+1):(a=this.$getDisplayTokens(r[l]),o[l]=this.$computeWrapSplits(a,u,i),l++);};var e=1,t=2,n=3,s=4,a=9,c=10,d=11,v=12;this.$computeWrapSplits=function(e,r,i){function g(){var t=0;if(m===0)return t;if(p)for(var n=0;n<e.length;n++){var r=e[n];if(r==c)t+=1;else {if(r!=d){if(r==v)continue;break}t+=i;}}return h&&p!==!1&&(t+=i),Math.min(t,m)}function y(t){var n=t-f;for(var r=f;r<t;r++){var i=e[r];if(i===12||i===2)n-=1;}o.length||(b=g(),o.indent=b),l+=n,o.push(l),f=t;}if(e.length==0)return [];var o=[],u=e.length,f=0,l=0,h=this.$wrapAsCode,p=this.$indentedSoftWrap,m=r<=Math.max(2*i,8)||p===!1?0:Math.floor(r/2),b=0;while(u-f>r-b){var w=f+r-b;if(e[w-1]>=c&&e[w]>=c){y(w);continue}if(e[w]==n||e[w]==s){for(w;w!=f-1;w--)if(e[w]==n)break;if(w>f){y(w);continue}w=f+r;for(w;w<e.length;w++)if(e[w]!=s)break;if(w==e.length)break;y(w);continue}var E=Math.max(w-(r-(r>>2)),f-1);while(w>E&&e[w]<n)w--;if(h){while(w>E&&e[w]<n)w--;while(w>E&&e[w]==a)w--;}else while(w>E&&e[w]<c)w--;if(w>E){y(++w);continue}w=f+r,e[w]==t&&w--,y(w-b);}return o},this.$getDisplayTokens=function(n,r){var i=[],s;r=r||0;for(var o=0;o<n.length;o++){var u=n.charCodeAt(o);if(u==9){s=this.getScreenTabSize(i.length+r),i.push(d);for(var f=1;f<s;f++)i.push(v);}else u==32?i.push(c):u>39&&u<48||u>57&&u<64?i.push(a):u>=4352&&m(u)?i.push(e,t):i.push(e);}return i},this.$getStringScreenWidth=function(e,t,n){if(t==0)return [0,0];t==null&&(t=Infinity),n=n||0;var r,i;for(i=0;i<e.length;i++){r=e.charCodeAt(i),r==9?n+=this.getScreenTabSize(n):r>=4352&&m(r)?n+=2:n+=1;if(n>t)break}return [n,i]},this.lineWidgets=null,this.getRowLength=function(e){var t=1;return this.lineWidgets&&(t+=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0),!this.$useWrapMode||!this.$wrapData[e]?t:this.$wrapData[e].length+t},this.getRowLineCount=function(e){return !this.$useWrapMode||!this.$wrapData[e]?1:this.$wrapData[e].length+1},this.getRowWrapIndent=function(e){if(this.$useWrapMode){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE),n=this.$wrapData[t.row];return n.length&&n[0]<t.column?n.indent:0}return 0},this.getScreenLastRowColumn=function(e){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE);return this.documentToScreenColumn(t.row,t.column)},this.getDocumentLastRowColumn=function(e,t){var n=this.documentToScreenRow(e,t);return this.getScreenLastRowColumn(n)},this.getDocumentLastRowColumnPosition=function(e,t){var n=this.documentToScreenRow(e,t);return this.screenToDocumentPosition(n,Number.MAX_VALUE/10)},this.getRowSplitData=function(e){return this.$useWrapMode?this.$wrapData[e]:undefined},this.getScreenTabSize=function(e){return this.$tabSize-(e%this.$tabSize|0)},this.screenToDocumentRow=function(e,t){return this.screenToDocumentPosition(e,t).row},this.screenToDocumentColumn=function(e,t){return this.screenToDocumentPosition(e,t).column},this.screenToDocumentPosition=function(e,t,n){if(e<0)return {row:0,column:0};var r,i=0,s=0,o,u=0,a=0,f=this.$screenRowCache,l=this.$getRowCacheIndex(f,e),c=f.length;if(c&&l>=0)var u=f[l],i=this.$docRowCache[l],h=e>f[c-1];else var h=!c;var p=this.getLength()-1,d=this.getNextFoldLine(i),v=d?d.start.row:Infinity;while(u<=e){a=this.getRowLength(i);if(u+a>e||i>=p)break;u+=a,i++,i>v&&(i=d.end.row+1,d=this.getNextFoldLine(i,d),v=d?d.start.row:Infinity),h&&(this.$docRowCache.push(i),this.$screenRowCache.push(u));}if(d&&d.start.row<=i)r=this.getFoldDisplayLine(d),i=d.start.row;else {if(u+a<=e||i>p)return {row:p,column:this.getLine(p).length};r=this.getLine(i),d=null;}var m=0,g=Math.floor(e-u);if(this.$useWrapMode){var y=this.$wrapData[i];y&&(o=y[g],g>0&&y.length&&(m=y.indent,s=y[g-1]||y[y.length-1],r=r.substring(s)));}return n!==undefined&&this.$bidiHandler.isBidiRow(u+g,i,g)&&(t=this.$bidiHandler.offsetToCol(n)),s+=this.$getStringScreenWidth(r,t-m)[1],this.$useWrapMode&&s>=o&&(s=o-1),d?d.idxToPosition(s):{row:i,column:s}},this.documentToScreenPosition=function(e,t){if(typeof t=="undefined")var n=this.$clipPositionToDocument(e.row,e.column);else n=this.$clipPositionToDocument(e,t);e=n.row,t=n.column;var r=0,i=null,s=null;s=this.getFoldAt(e,t,1),s&&(e=s.start.row,t=s.start.column);var o,u=0,a=this.$docRowCache,f=this.$getRowCacheIndex(a,e),l=a.length;if(l&&f>=0)var u=a[f],r=this.$screenRowCache[f],c=e>a[l-1];else var c=!l;var h=this.getNextFoldLine(u),p=h?h.start.row:Infinity;while(u<e){if(u>=p){o=h.end.row+1;if(o>e)break;h=this.getNextFoldLine(o,h),p=h?h.start.row:Infinity;}else o=u+1;r+=this.getRowLength(u),u=o,c&&(this.$docRowCache.push(u),this.$screenRowCache.push(r));}var d="";h&&u>=p?(d=this.getFoldDisplayLine(h,e,t),i=h.start.row):(d=this.getLine(e).substring(0,t),i=e);var v=0;if(this.$useWrapMode){var m=this.$wrapData[i];if(m){var g=0;while(d.length>=m[g])r++,g++;d=d.substring(m[g-1]||0,d.length),v=g>0?m.indent:0;}}return this.lineWidgets&&this.lineWidgets[u]&&this.lineWidgets[u].rowsAbove&&(r+=this.lineWidgets[u].rowsAbove),{row:r,column:v+this.$getStringScreenWidth(d)[0]}},this.documentToScreenColumn=function(e,t){return this.documentToScreenPosition(e,t).column},this.documentToScreenRow=function(e,t){return this.documentToScreenPosition(e,t).row},this.getScreenLength=function(){var e=0,t=null;if(!this.$useWrapMode){e=this.getLength();var n=this.$foldData;for(var r=0;r<n.length;r++)t=n[r],e-=t.end.row-t.start.row;}else {var i=this.$wrapData.length,s=0,r=0,t=this.$foldData[r++],o=t?t.start.row:Infinity;while(s<i){var u=this.$wrapData[s];e+=u?u.length+1:1,s++,s>o&&(s=t.end.row+1,t=this.$foldData[r++],o=t?t.start.row:Infinity);}}return this.lineWidgets&&(e+=this.$getWidgetScreenLength()),e},this.$setFontMetrics=function(e){if(!this.$enableVarChar)return;this.$getStringScreenWidth=function(t,n,r){if(n===0)return [0,0];n||(n=Infinity),r=r||0;var i,s;for(s=0;s<t.length;s++){i=t.charAt(s),i==="	"?r+=this.getScreenTabSize(r):r+=e.getCharacterWidth(i);if(r>n)break}return [r,s]};},this.destroy=function(){this.bgTokenizer&&(this.bgTokenizer.setDocument(null),this.bgTokenizer=null),this.$stopWorker(),this.removeAllListeners(),this.selection.detach();},this.isFullWidth=m;}.call(d.prototype),e("./edit_session/folding").Folding.call(d.prototype),e("./edit_session/bracket_match").BracketMatch.call(d.prototype),o.defineOptions(d.prototype,"session",{wrap:{set:function(e){!e||e=="off"?e=!1:e=="free"?e=!0:e=="printMargin"?e=-1:typeof e=="string"&&(e=parseInt(e,10)||!1);if(this.$wrap==e)return;this.$wrap=e;if(!e)this.setUseWrapMode(!1);else {var t=typeof e=="number"?e:null;this.setWrapLimitRange(t,t),this.setUseWrapMode(!0);}},get:function(){return this.getUseWrapMode()?this.$wrap==-1?"printMargin":this.getWrapLimitRange().min?this.$wrap:"free":"off"},handlesSet:!0},wrapMethod:{set:function(e){e=e=="auto"?this.$mode.type!="text":e!="text",e!=this.$wrapAsCode&&(this.$wrapAsCode=e,this.$useWrapMode&&(this.$useWrapMode=!1,this.setUseWrapMode(!0)));},initialValue:"auto"},indentedSoftWrap:{set:function(){this.$useWrapMode&&(this.$useWrapMode=!1,this.setUseWrapMode(!0));},initialValue:!0},firstLineNumber:{set:function(){this._signal("changeBreakpoint");},initialValue:1},useWorker:{set:function(e){this.$useWorker=e,this.$stopWorker(),e&&this.$startWorker();},initialValue:!0},useSoftTabs:{initialValue:!0},tabSize:{set:function(e){e=parseInt(e),e>0&&this.$tabSize!==e&&(this.$modified=!0,this.$rowLengthCache=[],this.$tabSize=e,this._signal("changeTabSize"));},initialValue:4,handlesSet:!0},navigateWithinSoftTabs:{initialValue:!1},foldStyle:{set:function(e){this.setFoldStyle(e);},handlesSet:!0},overwrite:{set:function(e){this._signal("changeOverwrite");},initialValue:!1},newLineMode:{set:function(e){this.doc.setNewLineMode(e);},get:function(){return this.doc.getNewLineMode()},handlesSet:!0},mode:{set:function(e){this.setMode(e);},get:function(){return this.$modeId},handlesSet:!0}}),t.EditSession=d;}),ace.define("ace/search",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){function u(e,t){function n(e){return /\w/.test(e)||t.regExp?"\\b":""}return n(e[0])+e+n(e[e.length-1])}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(){this.$options={};};(function(){this.set=function(e){return i.mixin(this.$options,e),this},this.getOptions=function(){return r.copyObject(this.$options)},this.setOptions=function(e){this.$options=e;},this.find=function(e){var t=this.$options,n=this.$matchIterator(e,t);if(!n)return !1;var r=null;return n.forEach(function(e,n,i,o){return r=new s(e,n,i,o),n==o&&t.start&&t.start.start&&t.skipCurrent!=0&&r.isEqual(t.start)?(r=null,!1):!0}),r},this.findAll=function(e){var t=this.$options;if(!t.needle)return [];this.$assembleRegExp(t);var n=t.range,i=n?e.getLines(n.start.row,n.end.row):e.doc.getAllLines(),o=[],u=t.re;if(t.$isMultiLine){var a=u.length,f=i.length-a,l;e:for(var c=u.offset||0;c<=f;c++){for(var h=0;h<a;h++)if(i[c+h].search(u[h])==-1)continue e;var p=i[c],d=i[c+a-1],v=p.length-p.match(u[0])[0].length,m=d.match(u[a-1])[0].length;if(l&&l.end.row===c&&l.end.column>v)continue;o.push(l=new s(c,v,c+a-1,m)),a>2&&(c=c+a-2);}}else for(var g=0;g<i.length;g++){var y=r.getMatchOffsets(i[g],u);for(var h=0;h<y.length;h++){var b=y[h];o.push(new s(g,b.offset,g,b.offset+b.length));}}if(n){var w=n.start.column,E=n.start.column,g=0,h=o.length-1;while(g<h&&o[g].start.column<w&&o[g].start.row==n.start.row)g++;while(g<h&&o[h].end.column>E&&o[h].end.row==n.end.row)h--;o=o.slice(g,h+1);for(g=0,h=o.length;g<h;g++)o[g].start.row+=n.start.row,o[g].end.row+=n.start.row;}return o},this.replace=function(e,t){var n=this.$options,r=this.$assembleRegExp(n);if(n.$isMultiLine)return t;if(!r)return;var i=r.exec(e);if(!i||i[0].length!=e.length)return null;t=e.replace(r,t);if(n.preserveCase){t=t.split("");for(var s=Math.min(e.length,e.length);s--;){var o=e[s];o&&o.toLowerCase()!=o?t[s]=t[s].toUpperCase():t[s]=t[s].toLowerCase();}t=t.join("");}return t},this.$assembleRegExp=function(e,t){if(e.needle instanceof RegExp)return e.re=e.needle;var n=e.needle;if(!e.needle)return e.re=!1;e.regExp||(n=r.escapeRegExp(n)),e.wholeWord&&(n=u(n,e));var i=e.caseSensitive?"gm":"gmi";e.$isMultiLine=!t&&/[\n\r]/.test(n);if(e.$isMultiLine)return e.re=this.$assembleMultilineRegExp(n,i);try{var s=new RegExp(n,i);}catch(o){s=!1;}return e.re=s},this.$assembleMultilineRegExp=function(e,t){var n=e.replace(/\r\n|\r|\n/g,"$\n^").split("\n"),r=[];for(var i=0;i<n.length;i++)try{r.push(new RegExp(n[i],t));}catch(s){return !1}return r},this.$matchIterator=function(e,t){var n=this.$assembleRegExp(t);if(!n)return !1;var r=t.backwards==1,i=t.skipCurrent!=0,s=t.range,o=t.start;o||(o=s?s[r?"end":"start"]:e.selection.getRange()),o.start&&(o=o[i!=r?"end":"start"]);var u=s?s.start.row:0,a=s?s.end.row:e.getLength()-1;if(r)var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n--;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return;if(t.wrap==0)return;for(n=a,u=o.row;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return};else var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n+=1;n<=a;n++)if(c(n,0,e))return;if(t.wrap==0)return;for(n=u,a=o.row;n<=a;n++)if(c(n,0,e))return};if(t.$isMultiLine)var l=n.length,c=function(t,i,s){var o=r?t-l+1:t;if(o<0)return;var u=e.getLine(o),a=u.search(n[0]);if(!r&&a<i||a===-1)return;for(var f=1;f<l;f++){u=e.getLine(o+f);if(u.search(n[f])==-1)return}var c=u.match(n[l-1])[0].length;if(r&&c>i)return;if(s(o,a,o+l-1,c))return !0};else if(r)var c=function(t,r,i){var s=e.getLine(t),o=[],u,a=0;n.lastIndex=0;while(u=n.exec(s)){var f=u[0].length;a=u.index;if(!f){if(a>=s.length)break;n.lastIndex=a+=1;}if(u.index+f>r)break;o.push(u.index,f);}for(var l=o.length-1;l>=0;l-=2){var c=o[l-1],f=o[l];if(i(t,c,t,c+f))return !0}};else var c=function(t,r,i){var s=e.getLine(t),o,u;n.lastIndex=r;while(u=n.exec(s)){var a=u[0].length;o=u.index;if(i(t,o,t,o+a))return !0;if(!a){n.lastIndex=o+=1;if(o>=s.length)return !1}}};return {forEach:f}};}).call(o.prototype),t.Search=o;}),ace.define("ace/keyboard/hash_handler",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){function o(e,t){this.platform=t||(i.isMac?"mac":"win"),this.commands={},this.commandKeyBinding={},this.addCommands(e),this.$singleCommand=!0;}function u(e,t){o.call(this,e,t),this.$singleCommand=!1;}var r=e("../lib/keys"),i=e("../lib/useragent"),s=r.KEY_MODS;u.prototype=o.prototype,function(){function e(e){return typeof e=="object"&&e.bindKey&&e.bindKey.position||(e.isDefault?-100:0)}this.addCommand=function(e){this.commands[e.name]&&this.removeCommand(e),this.commands[e.name]=e,e.bindKey&&this._buildKeyHash(e);},this.removeCommand=function(e,t){var n=e&&(typeof e=="string"?e:e.name);e=this.commands[n],t||delete this.commands[n];var r=this.commandKeyBinding;for(var i in r){var s=r[i];if(s==e)delete r[i];else if(Array.isArray(s)){var o=s.indexOf(e);o!=-1&&(s.splice(o,1),s.length==1&&(r[i]=s[0]));}}},this.bindKey=function(e,t,n){typeof e=="object"&&e&&(n==undefined&&(n=e.position),e=e[this.platform]);if(!e)return;if(typeof t=="function")return this.addCommand({exec:t,bindKey:e,name:t.name||e});e.split("|").forEach(function(e){var r="";if(e.indexOf(" ")!=-1){var i=e.split(/\s+/);e=i.pop(),i.forEach(function(e){var t=this.parseKeys(e),n=s[t.hashId]+t.key;r+=(r?" ":"")+n,this._addCommandToBinding(r,"chainKeys");},this),r+=" ";}var o=this.parseKeys(e),u=s[o.hashId]+o.key;this._addCommandToBinding(r+u,t,n);},this);},this._addCommandToBinding=function(t,n,r){var i=this.commandKeyBinding,s;if(!n)delete i[t];else if(!i[t]||this.$singleCommand)i[t]=n;else {Array.isArray(i[t])?(s=i[t].indexOf(n))!=-1&&i[t].splice(s,1):i[t]=[i[t]],typeof r!="number"&&(r=e(n));var o=i[t];for(s=0;s<o.length;s++){var u=o[s],a=e(u);if(a>r)break}o.splice(s,0,n);}},this.addCommands=function(e){e&&Object.keys(e).forEach(function(t){var n=e[t];if(!n)return;if(typeof n=="string")return this.bindKey(n,t);typeof n=="function"&&(n={exec:n});if(typeof n!="object")return;n.name||(n.name=t),this.addCommand(n);},this);},this.removeCommands=function(e){Object.keys(e).forEach(function(t){this.removeCommand(e[t]);},this);},this.bindKeys=function(e){Object.keys(e).forEach(function(t){this.bindKey(t,e[t]);},this);},this._buildKeyHash=function(e){this.bindKey(e.bindKey,e);},this.parseKeys=function(e){var t=e.toLowerCase().split(/[\-\+]([\-\+])?/).filter(function(e){return e}),n=t.pop(),i=r[n];if(r.FUNCTION_KEYS[i])n=r.FUNCTION_KEYS[i].toLowerCase();else {if(!t.length)return {key:n,hashId:-1};if(t.length==1&&t[0]=="shift")return {key:n.toUpperCase(),hashId:-1}}var s=0;for(var o=t.length;o--;){var u=r.KEY_MODS[t[o]];if(u==null)return typeof console!="undefined"&&console.error("invalid modifier "+t[o]+" in "+e),!1;s|=u;}return {key:n,hashId:s}},this.findKeyCommand=function(t,n){var r=s[t]+n;return this.commandKeyBinding[r]},this.handleKeyboard=function(e,t,n,r){if(r<0)return;var i=s[t]+n,o=this.commandKeyBinding[i];e.$keyChain&&(e.$keyChain+=" "+i,o=this.commandKeyBinding[e.$keyChain]||o);if(o)if(o=="chainKeys"||o[o.length-1]=="chainKeys")return e.$keyChain=e.$keyChain||i,{command:"null"};if(e.$keyChain)if(!!t&&t!=4||n.length!=1){if(t==-1||r>0)e.$keyChain="";}else e.$keyChain=e.$keyChain.slice(0,-i.length-1);return {command:o}},this.getStatusText=function(e,t){return t.$keyChain||""};}.call(o.prototype),t.HashHandler=o,t.MultiHashHandler=u;}),ace.define("ace/commands/command_manager",["require","exports","module","ace/lib/oop","ace/keyboard/hash_handler","ace/lib/event_emitter"],function(e,t,n){var r=e("../lib/oop"),i=e("../keyboard/hash_handler").MultiHashHandler,s=e("../lib/event_emitter").EventEmitter,o=function(e,t){i.call(this,t,e),this.byName=this.commands,this.setDefaultHandler("exec",function(e){return e.command.exec(e.editor,e.args||{})});};r.inherits(o,i),function(){r.implement(this,s),this.exec=function(e,t,n){if(Array.isArray(e)){for(var r=e.length;r--;)if(this.exec(e[r],t,n))return !0;return !1}typeof e=="string"&&(e=this.commands[e]);if(!e)return !1;if(t&&t.$readOnly&&!e.readOnly)return !1;if(this.$checkCommandState!=0&&e.isAvailable&&!e.isAvailable(t))return !1;var i={editor:t,command:e,args:n};return i.returnValue=this._emit("exec",i),this._signal("afterExec",i),i.returnValue===!1?!1:!0},this.toggleRecording=function(e){if(this.$inReplay)return;return e&&e._emit("changeStatus"),this.recording?(this.macro.pop(),this.off("exec",this.$addCommandToMacro),this.macro.length||(this.macro=this.oldMacro),this.recording=!1):(this.$addCommandToMacro||(this.$addCommandToMacro=function(e){this.macro.push([e.command,e.args]);}.bind(this)),this.oldMacro=this.macro,this.macro=[],this.on("exec",this.$addCommandToMacro),this.recording=!0)},this.replay=function(e){if(this.$inReplay||!this.macro)return;if(this.recording)return this.toggleRecording(e);try{this.$inReplay=!0,this.macro.forEach(function(t){typeof t=="string"?this.exec(t,e):this.exec(t[0],e,t[1]);},this);}finally{this.$inReplay=!1;}},this.trimMacro=function(e){return e.map(function(e){return typeof e[0]!="string"&&(e[0]=e[0].name),e[1]||(e=e[0]),e})};}.call(o.prototype),t.CommandManager=o;}),ace.define("ace/commands/default_commands",["require","exports","module","ace/lib/lang","ace/config","ace/range"],function(e,t,n){function o(e,t){return {win:e,mac:t}}var r=e("../lib/lang"),i=e("../config"),s=e("../range").Range;t.commands=[{name:"showSettingsMenu",bindKey:o("Ctrl-,","Command-,"),exec:function(e){i.loadModule("ace/ext/settings_menu",function(t){t.init(e),e.showSettingsMenu();});},readOnly:!0},{name:"goToNextError",bindKey:o("Alt-E","F4"),exec:function(e){i.loadModule("./ext/error_marker",function(t){t.showErrorMarker(e,1);});},scrollIntoView:"animate",readOnly:!0},{name:"goToPreviousError",bindKey:o("Alt-Shift-E","Shift-F4"),exec:function(e){i.loadModule("./ext/error_marker",function(t){t.showErrorMarker(e,-1);});},scrollIntoView:"animate",readOnly:!0},{name:"selectall",description:"Select all",bindKey:o("Ctrl-A","Command-A"),exec:function(e){e.selectAll();},readOnly:!0},{name:"centerselection",description:"Center selection",bindKey:o(null,"Ctrl-L"),exec:function(e){e.centerSelection();},readOnly:!0},{name:"gotoline",description:"Go to line...",bindKey:o("Ctrl-L","Command-L"),exec:function(e,t){typeof t=="number"&&!isNaN(t)&&e.gotoLine(t),e.prompt({$type:"gotoLine"});},readOnly:!0},{name:"fold",bindKey:o("Alt-L|Ctrl-F1","Command-Alt-L|Command-F1"),exec:function(e){e.session.toggleFold(!1);},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"unfold",bindKey:o("Alt-Shift-L|Ctrl-Shift-F1","Command-Alt-Shift-L|Command-Shift-F1"),exec:function(e){e.session.toggleFold(!0);},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleFoldWidget",bindKey:o("F2","F2"),exec:function(e){e.session.toggleFoldWidget();},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleParentFoldWidget",bindKey:o("Alt-F2","Alt-F2"),exec:function(e){e.session.toggleFoldWidget(!0);},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"foldall",description:"Fold all",bindKey:o(null,"Ctrl-Command-Option-0"),exec:function(e){e.session.foldAll();},scrollIntoView:"center",readOnly:!0},{name:"foldAllComments",description:"Fold all comments",bindKey:o(null,"Ctrl-Command-Option-0"),exec:function(e){e.session.foldAllComments();},scrollIntoView:"center",readOnly:!0},{name:"foldOther",description:"Fold other",bindKey:o("Alt-0","Command-Option-0"),exec:function(e){e.session.foldAll(),e.session.unfold(e.selection.getAllRanges());},scrollIntoView:"center",readOnly:!0},{name:"unfoldall",description:"Unfold all",bindKey:o("Alt-Shift-0","Command-Option-Shift-0"),exec:function(e){e.session.unfold();},scrollIntoView:"center",readOnly:!0},{name:"findnext",description:"Find next",bindKey:o("Ctrl-K","Command-G"),exec:function(e){e.findNext();},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"findprevious",description:"Find previous",bindKey:o("Ctrl-Shift-K","Command-Shift-G"),exec:function(e){e.findPrevious();},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"selectOrFindNext",description:"Select or find next",bindKey:o("Alt-K","Ctrl-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findNext();},readOnly:!0},{name:"selectOrFindPrevious",description:"Select or find previous",bindKey:o("Alt-Shift-K","Ctrl-Shift-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findPrevious();},readOnly:!0},{name:"find",description:"Find",bindKey:o("Ctrl-F","Command-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e);});},readOnly:!0},{name:"overwrite",description:"Overwrite",bindKey:"Insert",exec:function(e){e.toggleOverwrite();},readOnly:!0},{name:"selecttostart",description:"Select to start",bindKey:o("Ctrl-Shift-Home","Command-Shift-Home|Command-Shift-Up"),exec:function(e){e.getSelection().selectFileStart();},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotostart",description:"Go to start",bindKey:o("Ctrl-Home","Command-Home|Command-Up"),exec:function(e){e.navigateFileStart();},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectup",description:"Select up",bindKey:o("Shift-Up","Shift-Up|Ctrl-Shift-P"),exec:function(e){e.getSelection().selectUp();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golineup",description:"Go line up",bindKey:o("Up","Up|Ctrl-P"),exec:function(e,t){e.navigateUp(t.times);},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttoend",description:"Select to end",bindKey:o("Ctrl-Shift-End","Command-Shift-End|Command-Shift-Down"),exec:function(e){e.getSelection().selectFileEnd();},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotoend",description:"Go to end",bindKey:o("Ctrl-End","Command-End|Command-Down"),exec:function(e){e.navigateFileEnd();},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectdown",description:"Select down",bindKey:o("Shift-Down","Shift-Down|Ctrl-Shift-N"),exec:function(e){e.getSelection().selectDown();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golinedown",description:"Go line down",bindKey:o("Down","Down|Ctrl-N"),exec:function(e,t){e.navigateDown(t.times);},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordleft",description:"Select word left",bindKey:o("Ctrl-Shift-Left","Option-Shift-Left"),exec:function(e){e.getSelection().selectWordLeft();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordleft",description:"Go to word left",bindKey:o("Ctrl-Left","Option-Left"),exec:function(e){e.navigateWordLeft();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolinestart",description:"Select to line start",bindKey:o("Alt-Shift-Left","Command-Shift-Left|Ctrl-Shift-A"),exec:function(e){e.getSelection().selectLineStart();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolinestart",description:"Go to line start",bindKey:o("Alt-Left|Home","Command-Left|Home|Ctrl-A"),exec:function(e){e.navigateLineStart();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectleft",description:"Select left",bindKey:o("Shift-Left","Shift-Left|Ctrl-Shift-B"),exec:function(e){e.getSelection().selectLeft();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoleft",description:"Go to left",bindKey:o("Left","Left|Ctrl-B"),exec:function(e,t){e.navigateLeft(t.times);},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordright",description:"Select word right",bindKey:o("Ctrl-Shift-Right","Option-Shift-Right"),exec:function(e){e.getSelection().selectWordRight();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordright",description:"Go to word right",bindKey:o("Ctrl-Right","Option-Right"),exec:function(e){e.navigateWordRight();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolineend",description:"Select to line end",bindKey:o("Alt-Shift-Right","Command-Shift-Right|Shift-End|Ctrl-Shift-E"),exec:function(e){e.getSelection().selectLineEnd();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolineend",description:"Go to line end",bindKey:o("Alt-Right|End","Command-Right|End|Ctrl-E"),exec:function(e){e.navigateLineEnd();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectright",description:"Select right",bindKey:o("Shift-Right","Shift-Right"),exec:function(e){e.getSelection().selectRight();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoright",description:"Go to right",bindKey:o("Right","Right|Ctrl-F"),exec:function(e,t){e.navigateRight(t.times);},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectpagedown",description:"Select page down",bindKey:"Shift-PageDown",exec:function(e){e.selectPageDown();},readOnly:!0},{name:"pagedown",description:"Page down",bindKey:o(null,"Option-PageDown"),exec:function(e){e.scrollPageDown();},readOnly:!0},{name:"gotopagedown",description:"Go to page down",bindKey:o("PageDown","PageDown|Ctrl-V"),exec:function(e){e.gotoPageDown();},readOnly:!0},{name:"selectpageup",description:"Select page up",bindKey:"Shift-PageUp",exec:function(e){e.selectPageUp();},readOnly:!0},{name:"pageup",description:"Page up",bindKey:o(null,"Option-PageUp"),exec:function(e){e.scrollPageUp();},readOnly:!0},{name:"gotopageup",description:"Go to page up",bindKey:"PageUp",exec:function(e){e.gotoPageUp();},readOnly:!0},{name:"scrollup",description:"Scroll up",bindKey:o("Ctrl-Up",null),exec:function(e){e.renderer.scrollBy(0,-2*e.renderer.layerConfig.lineHeight);},readOnly:!0},{name:"scrolldown",description:"Scroll down",bindKey:o("Ctrl-Down",null),exec:function(e){e.renderer.scrollBy(0,2*e.renderer.layerConfig.lineHeight);},readOnly:!0},{name:"selectlinestart",description:"Select line start",bindKey:"Shift-Home",exec:function(e){e.getSelection().selectLineStart();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectlineend",description:"Select line end",bindKey:"Shift-End",exec:function(e){e.getSelection().selectLineEnd();},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"togglerecording",description:"Toggle recording",bindKey:o("Ctrl-Alt-E","Command-Option-E"),exec:function(e){e.commands.toggleRecording(e);},readOnly:!0},{name:"replaymacro",description:"Replay macro",bindKey:o("Ctrl-Shift-E","Command-Shift-E"),exec:function(e){e.commands.replay(e);},readOnly:!0},{name:"jumptomatching",description:"Jump to matching",bindKey:o("Ctrl-\\|Ctrl-P","Command-\\"),exec:function(e){e.jumpToMatching();},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"selecttomatching",description:"Select to matching",bindKey:o("Ctrl-Shift-\\|Ctrl-Shift-P","Command-Shift-\\"),exec:function(e){e.jumpToMatching(!0);},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"expandToMatching",description:"Expand to matching",bindKey:o("Ctrl-Shift-M","Ctrl-Shift-M"),exec:function(e){e.jumpToMatching(!0,!0);},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"passKeysToBrowser",description:"Pass keys to browser",bindKey:o(null,null),exec:function(){},passEvent:!0,readOnly:!0},{name:"copy",description:"Copy",exec:function(e){},readOnly:!0},{name:"cut",description:"Cut",exec:function(e){var t=e.$copyWithEmptySelection&&e.selection.isEmpty(),n=t?e.selection.getLineRange():e.selection.getRange();e._emit("cut",n),n.isEmpty()||e.session.remove(n),e.clearSelection();},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"paste",description:"Paste",exec:function(e,t){e.$handlePaste(t);},scrollIntoView:"cursor"},{name:"removeline",description:"Remove line",bindKey:o("Ctrl-D","Command-D"),exec:function(e){e.removeLines();},scrollIntoView:"cursor",multiSelectAction:"forEachLine"},{name:"duplicateSelection",description:"Duplicate selection",bindKey:o("Ctrl-Shift-D","Command-Shift-D"),exec:function(e){e.duplicateSelection();},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"sortlines",description:"Sort lines",bindKey:o("Ctrl-Alt-S","Command-Alt-S"),exec:function(e){e.sortLines();},scrollIntoView:"selection",multiSelectAction:"forEachLine"},{name:"togglecomment",description:"Toggle comment",bindKey:o("Ctrl-/","Command-/"),exec:function(e){e.toggleCommentLines();},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"toggleBlockComment",description:"Toggle block comment",bindKey:o("Ctrl-Shift-/","Command-Shift-/"),exec:function(e){e.toggleBlockComment();},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"modifyNumberUp",description:"Modify number up",bindKey:o("Ctrl-Shift-Up","Alt-Shift-Up"),exec:function(e){e.modifyNumber(1);},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"modifyNumberDown",description:"Modify number down",bindKey:o("Ctrl-Shift-Down","Alt-Shift-Down"),exec:function(e){e.modifyNumber(-1);},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"replace",description:"Replace",bindKey:o("Ctrl-H","Command-Option-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e,!0);});}},{name:"undo",description:"Undo",bindKey:o("Ctrl-Z","Command-Z"),exec:function(e){e.undo();}},{name:"redo",description:"Redo",bindKey:o("Ctrl-Shift-Z|Ctrl-Y","Command-Shift-Z|Command-Y"),exec:function(e){e.redo();}},{name:"copylinesup",description:"Copy lines up",bindKey:o("Alt-Shift-Up","Command-Option-Up"),exec:function(e){e.copyLinesUp();},scrollIntoView:"cursor"},{name:"movelinesup",description:"Move lines up",bindKey:o("Alt-Up","Option-Up"),exec:function(e){e.moveLinesUp();},scrollIntoView:"cursor"},{name:"copylinesdown",description:"Copy lines down",bindKey:o("Alt-Shift-Down","Command-Option-Down"),exec:function(e){e.copyLinesDown();},scrollIntoView:"cursor"},{name:"movelinesdown",description:"Move lines down",bindKey:o("Alt-Down","Option-Down"),exec:function(e){e.moveLinesDown();},scrollIntoView:"cursor"},{name:"del",description:"Delete",bindKey:o("Delete","Delete|Ctrl-D|Shift-Delete"),exec:function(e){e.remove("right");},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"backspace",description:"Backspace",bindKey:o("Shift-Backspace|Backspace","Ctrl-Backspace|Shift-Backspace|Backspace|Ctrl-H"),exec:function(e){e.remove("left");},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"cut_or_delete",description:"Cut or delete",bindKey:o("Shift-Delete",null),exec:function(e){if(!e.selection.isEmpty())return !1;e.remove("left");},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestart",description:"Remove to line start",bindKey:o("Alt-Backspace","Command-Backspace"),exec:function(e){e.removeToLineStart();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineend",description:"Remove to line end",bindKey:o("Alt-Delete","Ctrl-K|Command-Delete"),exec:function(e){e.removeToLineEnd();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestarthard",description:"Remove to line start hard",bindKey:o("Ctrl-Shift-Backspace",null),exec:function(e){var t=e.selection.getRange();t.start.column=0,e.session.remove(t);},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineendhard",description:"Remove to line end hard",bindKey:o("Ctrl-Shift-Delete",null),exec:function(e){var t=e.selection.getRange();t.end.column=Number.MAX_VALUE,e.session.remove(t);},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordleft",description:"Remove word left",bindKey:o("Ctrl-Backspace","Alt-Backspace|Ctrl-Alt-Backspace"),exec:function(e){e.removeWordLeft();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordright",description:"Remove word right",bindKey:o("Ctrl-Delete","Alt-Delete"),exec:function(e){e.removeWordRight();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"outdent",description:"Outdent",bindKey:o("Shift-Tab","Shift-Tab"),exec:function(e){e.blockOutdent();},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"indent",description:"Indent",bindKey:o("Tab","Tab"),exec:function(e){e.indent();},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"blockoutdent",description:"Block outdent",bindKey:o("Ctrl-[","Ctrl-["),exec:function(e){e.blockOutdent();},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"blockindent",description:"Block indent",bindKey:o("Ctrl-]","Ctrl-]"),exec:function(e){e.blockIndent();},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"insertstring",description:"Insert string",exec:function(e,t){e.insert(t);},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"inserttext",description:"Insert text",exec:function(e,t){e.insert(r.stringRepeat(t.text||"",t.times||1));},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"splitline",description:"Split line",bindKey:o(null,"Ctrl-O"),exec:function(e){e.splitLine();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"transposeletters",description:"Transpose letters",bindKey:o("Alt-Shift-X","Ctrl-T"),exec:function(e){e.transposeLetters();},multiSelectAction:function(e){e.transposeSelections(1);},scrollIntoView:"cursor"},{name:"touppercase",description:"To uppercase",bindKey:o("Ctrl-U","Ctrl-U"),exec:function(e){e.toUpperCase();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"tolowercase",description:"To lowercase",bindKey:o("Ctrl-Shift-U","Ctrl-Shift-U"),exec:function(e){e.toLowerCase();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"autoindent",description:"Auto Indent",bindKey:o(null,null),exec:function(e){e.autoIndent();},multiSelectAction:"forEachLine",scrollIntoView:"animate"},{name:"expandtoline",description:"Expand to line",bindKey:o("Ctrl-Shift-L","Command-Shift-L"),exec:function(e){var t=e.selection.getRange();t.start.column=t.end.column=0,t.end.row++,e.selection.setRange(t,!1);},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"joinlines",description:"Join lines",bindKey:o(null,null),exec:function(e){var t=e.selection.isBackwards(),n=t?e.selection.getSelectionLead():e.selection.getSelectionAnchor(),i=t?e.selection.getSelectionAnchor():e.selection.getSelectionLead(),o=e.session.doc.getLine(n.row).length,u=e.session.doc.getTextRange(e.selection.getRange()),a=u.replace(/\n\s*/," ").length,f=e.session.doc.getLine(n.row);for(var l=n.row+1;l<=i.row+1;l++){var c=r.stringTrimLeft(r.stringTrimRight(e.session.doc.getLine(l)));c.length!==0&&(c=" "+c),f+=c;}i.row+1<e.session.doc.getLength()-1&&(f+=e.session.doc.getNewLineCharacter()),e.clearSelection(),e.session.doc.replace(new s(n.row,0,i.row+2,0),f),a>0?(e.selection.moveCursorTo(n.row,n.column),e.selection.selectTo(n.row,n.column+a)):(o=e.session.doc.getLine(n.row).length>o?o+1:o,e.selection.moveCursorTo(n.row,o));},multiSelectAction:"forEach",readOnly:!0},{name:"invertSelection",description:"Invert selection",bindKey:o(null,null),exec:function(e){var t=e.session.doc.getLength()-1,n=e.session.doc.getLine(t).length,r=e.selection.rangeList.ranges,i=[];r.length<1&&(r=[e.selection.getRange()]);for(var o=0;o<r.length;o++)o==r.length-1&&(r[o].end.row!==t||r[o].end.column!==n)&&i.push(new s(r[o].end.row,r[o].end.column,t,n)),o===0?(r[o].start.row!==0||r[o].start.column!==0)&&i.push(new s(0,0,r[o].start.row,r[o].start.column)):i.push(new s(r[o-1].end.row,r[o-1].end.column,r[o].start.row,r[o].start.column));e.exitMultiSelectMode(),e.clearSelection();for(var o=0;o<i.length;o++)e.selection.addRange(i[o],!1);},readOnly:!0,scrollIntoView:"none"},{name:"addLineAfter",exec:function(e){e.selection.clearSelection(),e.navigateLineEnd(),e.insert("\n");},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"addLineBefore",exec:function(e){e.selection.clearSelection();var t=e.getCursorPosition();e.selection.moveTo(t.row-1,Number.MAX_VALUE),e.insert("\n"),t.row===0&&e.navigateUp();},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"openCommandPallete",description:"Open command pallete",bindKey:o("F1","F1"),exec:function(e){e.prompt({$type:"commands"});},readOnly:!0},{name:"modeSelect",description:"Change language mode...",bindKey:o(null,null),exec:function(e){e.prompt({$type:"modes"});},readOnly:!0}];for(var u=1;u<9;u++)t.commands.push({name:"foldToLevel"+u,description:"Fold To Level "+u,level:u,exec:function(e){e.session.foldToLevel(this.level);},scrollIntoView:"center",readOnly:!0});}),ace.define("ace/editor",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/useragent","ace/keyboard/textinput","ace/mouse/mouse_handler","ace/mouse/fold_handler","ace/keyboard/keybinding","ace/edit_session","ace/search","ace/range","ace/lib/event_emitter","ace/commands/command_manager","ace/commands/default_commands","ace/config","ace/token_iterator","ace/clipboard"],function(e,t,n){e("./lib/fixoldbrowsers");var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/lang"),o=e("./lib/useragent"),u=e("./keyboard/textinput").TextInput,a=e("./mouse/mouse_handler").MouseHandler,f=e("./mouse/fold_handler").FoldHandler,l=e("./keyboard/keybinding").KeyBinding,c=e("./edit_session").EditSession,h=e("./search").Search,p=e("./range").Range,d=e("./lib/event_emitter").EventEmitter,v=e("./commands/command_manager").CommandManager,m=e("./commands/default_commands").commands,g=e("./config"),y=e("./token_iterator").TokenIterator,b=e("./clipboard"),w=function(e,t,n){this.$toDestroy=[];var r=e.getContainerElement();this.container=r,this.renderer=e,this.id="editor"+ ++w.$uid,this.commands=new v(o.isMac?"mac":"win",m),typeof document=="object"&&(this.textInput=new u(e.getTextAreaContainer(),this),this.renderer.textarea=this.textInput.getElement(),this.$mouseHandler=new a(this),new f(this)),this.keyBinding=new l(this),this.$search=(new h).set({wrap:!0}),this.$historyTracker=this.$historyTracker.bind(this),this.commands.on("exec",this.$historyTracker),this.$initOperationListeners(),this._$emitInputEvent=s.delayedCall(function(){this._signal("input",{}),this.session&&this.session.bgTokenizer&&this.session.bgTokenizer.scheduleStart();}.bind(this)),this.on("change",function(e,t){t._$emitInputEvent.schedule(31);}),this.setSession(t||n&&n.session||new c("")),g.resetOptions(this),n&&this.setOptions(n),g._signal("editor",this);};w.$uid=0,function(){r.implement(this,d),this.$initOperationListeners=function(){this.commands.on("exec",this.startOperation.bind(this),!0),this.commands.on("afterExec",this.endOperation.bind(this),!0),this.$opResetTimer=s.delayedCall(this.endOperation.bind(this,!0)),this.on("change",function(){this.curOp||(this.startOperation(),this.curOp.selectionBefore=this.$lastSel),this.curOp.docChanged=!0;}.bind(this),!0),this.on("changeSelection",function(){this.curOp||(this.startOperation(),this.curOp.selectionBefore=this.$lastSel),this.curOp.selectionChanged=!0;}.bind(this),!0);},this.curOp=null,this.prevOp={},this.startOperation=function(e){if(this.curOp){if(!e||this.curOp.command)return;this.prevOp=this.curOp;}e||(this.previousCommand=null,e={}),this.$opResetTimer.schedule(),this.curOp=this.session.curOp={command:e.command||{},args:e.args,scrollTop:this.renderer.scrollTop},this.curOp.selectionBefore=this.selection.toJSON();},this.endOperation=function(e){if(this.curOp&&this.session){if(e&&e.returnValue===!1||!this.session)return this.curOp=null;if(e==1&&this.curOp.command&&this.curOp.command.name=="mouse")return;this._signal("beforeEndOperation");if(!this.curOp)return;var t=this.curOp.command,n=t&&t.scrollIntoView;if(n){switch(n){case"center-animate":n="animate";case"center":this.renderer.scrollCursorIntoView(null,.5);break;case"animate":case"cursor":this.renderer.scrollCursorIntoView();break;case"selectionPart":var r=this.selection.getRange(),i=this.renderer.layerConfig;(r.start.row>=i.lastRow||r.end.row<=i.firstRow)&&this.renderer.scrollSelectionIntoView(this.selection.anchor,this.selection.lead);break;}n=="animate"&&this.renderer.animateScrolling(this.curOp.scrollTop);}var s=this.selection.toJSON();this.curOp.selectionAfter=s,this.$lastSel=this.selection.toJSON(),this.session.getUndoManager().addSelection(s),this.prevOp=this.curOp,this.curOp=null;}},this.$mergeableCommands=["backspace","del","insertstring"],this.$historyTracker=function(e){if(!this.$mergeUndoDeltas)return;var t=this.prevOp,n=this.$mergeableCommands,r=t.command&&e.command.name==t.command.name;if(e.command.name=="insertstring"){var i=e.args;this.mergeNextCommand===undefined&&(this.mergeNextCommand=!0),r=r&&this.mergeNextCommand&&(!/\s/.test(i)||/\s/.test(t.args)),this.mergeNextCommand=!0;}else r=r&&n.indexOf(e.command.name)!==-1;this.$mergeUndoDeltas!="always"&&Date.now()-this.sequenceStartTime>2e3&&(r=!1),r?this.session.mergeUndoDeltas=!0:n.indexOf(e.command.name)!==-1&&(this.sequenceStartTime=Date.now());},this.setKeyboardHandler=function(e,t){if(e&&typeof e=="string"&&e!="ace"){this.$keybindingId=e;var n=this;g.loadModule(["keybinding",e],function(r){n.$keybindingId==e&&n.keyBinding.setKeyboardHandler(r&&r.handler),t&&t();});}else this.$keybindingId=null,this.keyBinding.setKeyboardHandler(e),t&&t();},this.getKeyboardHandler=function(){return this.keyBinding.getKeyboardHandler()},this.setSession=function(e){if(this.session==e)return;this.curOp&&this.endOperation(),this.curOp={};var t=this.session;if(t){this.session.off("change",this.$onDocumentChange),this.session.off("changeMode",this.$onChangeMode),this.session.off("tokenizerUpdate",this.$onTokenizerUpdate),this.session.off("changeTabSize",this.$onChangeTabSize),this.session.off("changeWrapLimit",this.$onChangeWrapLimit),this.session.off("changeWrapMode",this.$onChangeWrapMode),this.session.off("changeFold",this.$onChangeFold),this.session.off("changeFrontMarker",this.$onChangeFrontMarker),this.session.off("changeBackMarker",this.$onChangeBackMarker),this.session.off("changeBreakpoint",this.$onChangeBreakpoint),this.session.off("changeAnnotation",this.$onChangeAnnotation),this.session.off("changeOverwrite",this.$onCursorChange),this.session.off("changeScrollTop",this.$onScrollTopChange),this.session.off("changeScrollLeft",this.$onScrollLeftChange);var n=this.session.getSelection();n.off("changeCursor",this.$onCursorChange),n.off("changeSelection",this.$onSelectionChange);}this.session=e,e?(this.$onDocumentChange=this.onDocumentChange.bind(this),e.on("change",this.$onDocumentChange),this.renderer.setSession(e),this.$onChangeMode=this.onChangeMode.bind(this),e.on("changeMode",this.$onChangeMode),this.$onTokenizerUpdate=this.onTokenizerUpdate.bind(this),e.on("tokenizerUpdate",this.$onTokenizerUpdate),this.$onChangeTabSize=this.renderer.onChangeTabSize.bind(this.renderer),e.on("changeTabSize",this.$onChangeTabSize),this.$onChangeWrapLimit=this.onChangeWrapLimit.bind(this),e.on("changeWrapLimit",this.$onChangeWrapLimit),this.$onChangeWrapMode=this.onChangeWrapMode.bind(this),e.on("changeWrapMode",this.$onChangeWrapMode),this.$onChangeFold=this.onChangeFold.bind(this),e.on("changeFold",this.$onChangeFold),this.$onChangeFrontMarker=this.onChangeFrontMarker.bind(this),this.session.on("changeFrontMarker",this.$onChangeFrontMarker),this.$onChangeBackMarker=this.onChangeBackMarker.bind(this),this.session.on("changeBackMarker",this.$onChangeBackMarker),this.$onChangeBreakpoint=this.onChangeBreakpoint.bind(this),this.session.on("changeBreakpoint",this.$onChangeBreakpoint),this.$onChangeAnnotation=this.onChangeAnnotation.bind(this),this.session.on("changeAnnotation",this.$onChangeAnnotation),this.$onCursorChange=this.onCursorChange.bind(this),this.session.on("changeOverwrite",this.$onCursorChange),this.$onScrollTopChange=this.onScrollTopChange.bind(this),this.session.on("changeScrollTop",this.$onScrollTopChange),this.$onScrollLeftChange=this.onScrollLeftChange.bind(this),this.session.on("changeScrollLeft",this.$onScrollLeftChange),this.selection=e.getSelection(),this.selection.on("changeCursor",this.$onCursorChange),this.$onSelectionChange=this.onSelectionChange.bind(this),this.selection.on("changeSelection",this.$onSelectionChange),this.onChangeMode(),this.onCursorChange(),this.onScrollTopChange(),this.onScrollLeftChange(),this.onSelectionChange(),this.onChangeFrontMarker(),this.onChangeBackMarker(),this.onChangeBreakpoint(),this.onChangeAnnotation(),this.session.getUseWrapMode()&&this.renderer.adjustWrapLimit(),this.renderer.updateFull()):(this.selection=null,this.renderer.setSession(e)),this._signal("changeSession",{session:e,oldSession:t}),this.curOp=null,t&&t._signal("changeEditor",{oldEditor:this}),e&&e._signal("changeEditor",{editor:this}),e&&e.bgTokenizer&&e.bgTokenizer.scheduleStart();},this.getSession=function(){return this.session},this.setValue=function(e,t){return this.session.doc.setValue(e),t?t==1?this.navigateFileEnd():t==-1&&this.navigateFileStart():this.selectAll(),e},this.getValue=function(){return this.session.getValue()},this.getSelection=function(){return this.selection},this.resize=function(e){this.renderer.onResize(e);},this.setTheme=function(e,t){this.renderer.setTheme(e,t);},this.getTheme=function(){return this.renderer.getTheme()},this.setStyle=function(e){this.renderer.setStyle(e);},this.unsetStyle=function(e){this.renderer.unsetStyle(e);},this.getFontSize=function(){return this.getOption("fontSize")||i.computedStyle(this.container).fontSize},this.setFontSize=function(e){this.setOption("fontSize",e);},this.$highlightBrackets=function(){if(this.$highlightPending)return;var e=this;this.$highlightPending=!0,setTimeout(function(){e.$highlightPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;t.$bracketHighlight&&(t.$bracketHighlight.markerIds.forEach(function(e){t.removeMarker(e);}),t.$bracketHighlight=null);var n=t.getMatchingBracketRanges(e.getCursorPosition());!n&&t.$mode.getMatching&&(n=t.$mode.getMatching(e.session));if(!n)return;var r="ace_bracket";Array.isArray(n)?n.length==1&&(r="ace_error_bracket"):n=[n],n.length==2&&(p.comparePoints(n[0].end,n[1].start)==0?n=[p.fromPoints(n[0].start,n[1].end)]:p.comparePoints(n[0].start,n[1].end)==0&&(n=[p.fromPoints(n[1].start,n[0].end)])),t.$bracketHighlight={ranges:n,markerIds:n.map(function(e){return t.addMarker(e,r,"text")})};},50);},this.$highlightTags=function(){if(this.$highlightTagPending)return;var e=this;this.$highlightTagPending=!0,setTimeout(function(){e.$highlightTagPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;var n=e.getCursorPosition(),r=new y(e.session,n.row,n.column),i=r.getCurrentToken();if(!i||!/\b(?:tag-open|tag-name)/.test(i.type)){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}if(i.type.indexOf("tag-open")!==-1){i=r.stepForward();if(!i)return}var s=i.value,o=i.value,u=0,a=r.stepBackward();if(a.value==="<"){do a=i,i=r.stepForward(),i&&(i.type.indexOf("tag-name")!==-1?(o=i.value,s===o&&(a.value==="<"?u++:a.value==="</"&&u--)):s===o&&i.value==="/>"&&u--);while(i&&u>=0)}else {do{i=a,a=r.stepBackward();if(i)if(i.type.indexOf("tag-name")!==-1)s===i.value&&(a.value==="<"?u++:a.value==="</"&&u--);else if(i.value==="/>"){var f=0,l=a;while(l){if(l.type.indexOf("tag-name")!==-1&&l.value===s){u--;break}if(l.value==="<")break;l=r.stepBackward(),f++;}for(var c=0;c<f;c++)r.stepForward();}}while(a&&u<=0);r.stepForward();}if(!i){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}var h=r.getCurrentTokenRow(),d=r.getCurrentTokenColumn(),v=new p(h,d,h,d+i.value.length),m=t.$backMarkers[t.$tagHighlight];t.$tagHighlight&&m!=undefined&&v.compareRange(m.range)!==0&&(t.removeMarker(t.$tagHighlight),t.$tagHighlight=null),t.$tagHighlight||(t.$tagHighlight=t.addMarker(v,"ace_bracket","text"));},50);},this.focus=function(){var e=this;setTimeout(function(){e.isFocused()||e.textInput.focus();}),this.textInput.focus();},this.isFocused=function(){return this.textInput.isFocused()},this.blur=function(){this.textInput.blur();},this.onFocus=function(e){if(this.$isFocused)return;this.$isFocused=!0,this.renderer.showCursor(),this.renderer.visualizeFocus(),this._emit("focus",e);},this.onBlur=function(e){if(!this.$isFocused)return;this.$isFocused=!1,this.renderer.hideCursor(),this.renderer.visualizeBlur(),this._emit("blur",e);},this.$cursorChange=function(){this.renderer.updateCursor(),this.$highlightBrackets(),this.$highlightTags(),this.$updateHighlightActiveLine();},this.onDocumentChange=function(e){var t=this.session.$useWrapMode,n=e.start.row==e.end.row?e.end.row:Infinity;this.renderer.updateLines(e.start.row,n,t),this._signal("change",e),this.$cursorChange();},this.onTokenizerUpdate=function(e){var t=e.data;this.renderer.updateLines(t.first,t.last);},this.onScrollTopChange=function(){this.renderer.scrollToY(this.session.getScrollTop());},this.onScrollLeftChange=function(){this.renderer.scrollToX(this.session.getScrollLeft());},this.onCursorChange=function(){this.$cursorChange(),this._signal("changeSelection");},this.$updateHighlightActiveLine=function(){var e=this.getSession(),t;if(this.$highlightActiveLine){if(this.$selectionStyle!="line"||!this.selection.isMultiLine())t=this.getCursorPosition();this.renderer.theme&&this.renderer.theme.$selectionColorConflict&&!this.selection.isEmpty()&&(t=!1),this.renderer.$maxLines&&this.session.getLength()===1&&!(this.renderer.$minLines>1)&&(t=!1);}if(e.$highlightLineMarker&&!t)e.removeMarker(e.$highlightLineMarker.id),e.$highlightLineMarker=null;else if(!e.$highlightLineMarker&&t){var n=new p(t.row,t.column,t.row,Infinity);n.id=e.addMarker(n,"ace_active-line","screenLine"),e.$highlightLineMarker=n;}else t&&(e.$highlightLineMarker.start.row=t.row,e.$highlightLineMarker.end.row=t.row,e.$highlightLineMarker.start.column=t.column,e._signal("changeBackMarker"));},this.onSelectionChange=function(e){var t=this.session;t.$selectionMarker&&t.removeMarker(t.$selectionMarker),t.$selectionMarker=null;if(!this.selection.isEmpty()){var n=this.selection.getRange(),r=this.getSelectionStyle();t.$selectionMarker=t.addMarker(n,"ace_selection",r);}else this.$updateHighlightActiveLine();var i=this.$highlightSelectedWord&&this.$getSelectionHighLightRegexp();this.session.highlight(i),this._signal("changeSelection");},this.$getSelectionHighLightRegexp=function(){var e=this.session,t=this.getSelectionRange();if(t.isEmpty()||t.isMultiLine())return;var n=t.start.column,r=t.end.column,i=e.getLine(t.start.row),s=i.substring(n,r);if(s.length>5e3||!/[\w\d]/.test(s))return;var o=this.$search.$assembleRegExp({wholeWord:!0,caseSensitive:!0,needle:s}),u=i.substring(n-1,r+1);if(!o.test(u))return;return o},this.onChangeFrontMarker=function(){this.renderer.updateFrontMarkers();},this.onChangeBackMarker=function(){this.renderer.updateBackMarkers();},this.onChangeBreakpoint=function(){this.renderer.updateBreakpoints();},this.onChangeAnnotation=function(){this.renderer.setAnnotations(this.session.getAnnotations());},this.onChangeMode=function(e){this.renderer.updateText(),this._emit("changeMode",e);},this.onChangeWrapLimit=function(){this.renderer.updateFull();},this.onChangeWrapMode=function(){this.renderer.onResize(!0);},this.onChangeFold=function(){this.$updateHighlightActiveLine(),this.renderer.updateFull();},this.getSelectedText=function(){return this.session.getTextRange(this.getSelectionRange())},this.getCopyText=function(){var e=this.getSelectedText(),t=this.session.doc.getNewLineCharacter(),n=!1;if(!e&&this.$copyWithEmptySelection){n=!0;var r=this.selection.getAllRanges();for(var i=0;i<r.length;i++){var s=r[i];if(i&&r[i-1].start.row==s.start.row)continue;e+=this.session.getLine(s.start.row)+t;}}var o={text:e};return this._signal("copy",o),b.lineMode=n?o.text:"",o.text},this.onCopy=function(){this.commands.exec("copy",this);},this.onCut=function(){this.commands.exec("cut",this);},this.onPaste=function(e,t){var n={text:e,event:t};this.commands.exec("paste",this,n);},this.$handlePaste=function(e){typeof e=="string"&&(e={text:e}),this._signal("paste",e);var t=e.text,n=t==b.lineMode,r=this.session;if(!this.inMultiSelectMode||this.inVirtualSelectionMode)n?r.insert({row:this.selection.lead.row,column:0},t):this.insert(t);else if(n)this.selection.rangeList.ranges.forEach(function(e){r.insert({row:e.start.row,column:0},t);});else {var i=t.split(/\r\n|\r|\n/),s=this.selection.rangeList.ranges,o=i.length==2&&(!i[0]||!i[1]);if(i.length!=s.length||o)return this.commands.exec("insertstring",this,t);for(var u=s.length;u--;){var a=s[u];a.isEmpty()||r.remove(a),r.insert(a.start,i[u]);}}},this.execCommand=function(e,t){return this.commands.exec(e,this,t)},this.insert=function(e,t){var n=this.session,r=n.getMode(),i=this.getCursorPosition();if(this.getBehavioursEnabled()&&!t){var s=r.transformAction(n.getState(i.row),"insertion",this,n,e);s&&(e!==s.text&&(this.inVirtualSelectionMode||(this.session.mergeUndoDeltas=!1,this.mergeNextCommand=!1)),e=s.text);}e=="	"&&(e=this.session.getTabString());if(!this.selection.isEmpty()){var o=this.getSelectionRange();i=this.session.remove(o),this.clearSelection();}else if(this.session.getOverwrite()&&e.indexOf("\n")==-1){var o=new p.fromPoints(i,i);o.end.column+=e.length,this.session.remove(o);}if(e=="\n"||e=="\r\n"){var u=n.getLine(i.row);if(i.column>u.search(/\S|$/)){var a=u.substr(i.column).search(/\S|$/);n.doc.removeInLine(i.row,i.column,i.column+a);}}this.clearSelection();var f=i.column,l=n.getState(i.row),u=n.getLine(i.row),c=r.checkOutdent(l,u,e);n.insert(i,e),s&&s.selection&&(s.selection.length==2?this.selection.setSelectionRange(new p(i.row,f+s.selection[0],i.row,f+s.selection[1])):this.selection.setSelectionRange(new p(i.row+s.selection[0],s.selection[1],i.row+s.selection[2],s.selection[3])));if(this.$enableAutoIndent){if(n.getDocument().isNewLine(e)){var h=r.getNextLineIndent(l,u.slice(0,i.column),n.getTabString());n.insert({row:i.row+1,column:0},h);}c&&r.autoOutdent(l,n,i.row);}},this.autoIndent=function(){var e=this.session,t=e.getMode(),n,r;if(this.selection.isEmpty())n=0,r=e.doc.getLength()-1;else {var i=this.getSelectionRange();n=i.start.row,r=i.end.row;}var s="",o="",u="",a,f,l,c=e.getTabString();for(var h=n;h<=r;h++)h>0&&(s=e.getState(h-1),o=e.getLine(h-1),u=t.getNextLineIndent(s,o,c)),a=e.getLine(h),f=t.$getIndent(a),u!==f&&(f.length>0&&(l=new p(h,0,h,f.length),e.remove(l)),u.length>0&&e.insert({row:h,column:0},u)),t.autoOutdent(s,e,h);},this.onTextInput=function(e,t){if(!t)return this.keyBinding.onTextInput(e);this.startOperation({command:{name:"insertstring"}});var n=this.applyComposition.bind(this,e,t);this.selection.rangeCount?this.forEachSelection(n):n(),this.endOperation();},this.applyComposition=function(e,t){if(t.extendLeft||t.extendRight){var n=this.selection.getRange();n.start.column-=t.extendLeft,n.end.column+=t.extendRight,n.start.column<0&&(n.start.row--,n.start.column+=this.session.getLine(n.start.row).length+1),this.selection.setRange(n),!e&&!n.isEmpty()&&this.remove();}(e||!this.selection.isEmpty())&&this.insert(e,!0);if(t.restoreStart||t.restoreEnd){var n=this.selection.getRange();n.start.column-=t.restoreStart,n.end.column-=t.restoreEnd,this.selection.setRange(n);}},this.onCommandKey=function(e,t,n){return this.keyBinding.onCommandKey(e,t,n)},this.setOverwrite=function(e){this.session.setOverwrite(e);},this.getOverwrite=function(){return this.session.getOverwrite()},this.toggleOverwrite=function(){this.session.toggleOverwrite();},this.setScrollSpeed=function(e){this.setOption("scrollSpeed",e);},this.getScrollSpeed=function(){return this.getOption("scrollSpeed")},this.setDragDelay=function(e){this.setOption("dragDelay",e);},this.getDragDelay=function(){return this.getOption("dragDelay")},this.setSelectionStyle=function(e){this.setOption("selectionStyle",e);},this.getSelectionStyle=function(){return this.getOption("selectionStyle")},this.setHighlightActiveLine=function(e){this.setOption("highlightActiveLine",e);},this.getHighlightActiveLine=function(){return this.getOption("highlightActiveLine")},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e);},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.setHighlightSelectedWord=function(e){this.setOption("highlightSelectedWord",e);},this.getHighlightSelectedWord=function(){return this.$highlightSelectedWord},this.setAnimatedScroll=function(e){this.renderer.setAnimatedScroll(e);},this.getAnimatedScroll=function(){return this.renderer.getAnimatedScroll()},this.setShowInvisibles=function(e){this.renderer.setShowInvisibles(e);},this.getShowInvisibles=function(){return this.renderer.getShowInvisibles()},this.setDisplayIndentGuides=function(e){this.renderer.setDisplayIndentGuides(e);},this.getDisplayIndentGuides=function(){return this.renderer.getDisplayIndentGuides()},this.setShowPrintMargin=function(e){this.renderer.setShowPrintMargin(e);},this.getShowPrintMargin=function(){return this.renderer.getShowPrintMargin()},this.setPrintMarginColumn=function(e){this.renderer.setPrintMarginColumn(e);},this.getPrintMarginColumn=function(){return this.renderer.getPrintMarginColumn()},this.setReadOnly=function(e){this.setOption("readOnly",e);},this.getReadOnly=function(){return this.getOption("readOnly")},this.setBehavioursEnabled=function(e){this.setOption("behavioursEnabled",e);},this.getBehavioursEnabled=function(){return this.getOption("behavioursEnabled")},this.setWrapBehavioursEnabled=function(e){this.setOption("wrapBehavioursEnabled",e);},this.getWrapBehavioursEnabled=function(){return this.getOption("wrapBehavioursEnabled")},this.setShowFoldWidgets=function(e){this.setOption("showFoldWidgets",e);},this.getShowFoldWidgets=function(){return this.getOption("showFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e);},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.remove=function(e){this.selection.isEmpty()&&(e=="left"?this.selection.selectLeft():this.selection.selectRight());var t=this.getSelectionRange();if(this.getBehavioursEnabled()){var n=this.session,r=n.getState(t.start.row),i=n.getMode().transformAction(r,"deletion",this,n,t);if(t.end.column===0){var s=n.getTextRange(t);if(s[s.length-1]=="\n"){var o=n.getLine(t.end.row);/^\s+$/.test(o)&&(t.end.column=o.length);}}i&&(t=i);}this.session.remove(t),this.clearSelection();},this.removeWordRight=function(){this.selection.isEmpty()&&this.selection.selectWordRight(),this.session.remove(this.getSelectionRange()),this.clearSelection();},this.removeWordLeft=function(){this.selection.isEmpty()&&this.selection.selectWordLeft(),this.session.remove(this.getSelectionRange()),this.clearSelection();},this.removeToLineStart=function(){this.selection.isEmpty()&&this.selection.selectLineStart(),this.selection.isEmpty()&&this.selection.selectLeft(),this.session.remove(this.getSelectionRange()),this.clearSelection();},this.removeToLineEnd=function(){this.selection.isEmpty()&&this.selection.selectLineEnd();var e=this.getSelectionRange();e.start.column==e.end.column&&e.start.row==e.end.row&&(e.end.column=0,e.end.row++),this.session.remove(e),this.clearSelection();},this.splitLine=function(){this.selection.isEmpty()||(this.session.remove(this.getSelectionRange()),this.clearSelection());var e=this.getCursorPosition();this.insert("\n"),this.moveCursorToPosition(e);},this.transposeLetters=function(){if(!this.selection.isEmpty())return;var e=this.getCursorPosition(),t=e.column;if(t===0)return;var n=this.session.getLine(e.row),r,i;t<n.length?(r=n.charAt(t)+n.charAt(t-1),i=new p(e.row,t-1,e.row,t+1)):(r=n.charAt(t-1)+n.charAt(t-2),i=new p(e.row,t-2,e.row,t)),this.session.replace(i,r),this.session.selection.moveToPosition(i.end);},this.toLowerCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toLowerCase()),this.selection.setSelectionRange(e);},this.toUpperCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toUpperCase()),this.selection.setSelectionRange(e);},this.indent=function(){var e=this.session,t=this.getSelectionRange();if(t.start.row<t.end.row){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}if(t.start.column<t.end.column){var r=e.getTextRange(t);if(!/^\s+$/.test(r)){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}}var i=e.getLine(t.start.row),o=t.start,u=e.getTabSize(),a=e.documentToScreenColumn(o.row,o.column);if(this.session.getUseSoftTabs())var f=u-a%u,l=s.stringRepeat(" ",f);else {var f=a%u;while(i[t.start.column-1]==" "&&f)t.start.column--,f--;this.selection.setSelectionRange(t),l="	";}return this.insert(l)},this.blockIndent=function(){var e=this.$getSelectedRows();this.session.indentRows(e.first,e.last,"	");},this.blockOutdent=function(){var e=this.session.getSelection();this.session.outdentRows(e.getRange());},this.sortLines=function(){var e=this.$getSelectedRows(),t=this.session,n=[];for(var r=e.first;r<=e.last;r++)n.push(t.getLine(r));n.sort(function(e,t){return e.toLowerCase()<t.toLowerCase()?-1:e.toLowerCase()>t.toLowerCase()?1:0});var i=new p(0,0,0,0);for(var r=e.first;r<=e.last;r++){var s=t.getLine(r);i.start.row=r,i.end.row=r,i.end.column=s.length,t.replace(i,n[r-e.first]);}},this.toggleCommentLines=function(){var e=this.session.getState(this.getCursorPosition().row),t=this.$getSelectedRows();this.session.getMode().toggleCommentLines(e,this.session,t.first,t.last);},this.toggleBlockComment=function(){var e=this.getCursorPosition(),t=this.session.getState(e.row),n=this.getSelectionRange();this.session.getMode().toggleBlockComment(t,this.session,n,e);},this.getNumberAt=function(e,t){var n=/[\-]?[0-9]+(?:\.[0-9]+)?/g;n.lastIndex=0;var r=this.session.getLine(e);while(n.lastIndex<t){var i=n.exec(r);if(i.index<=t&&i.index+i[0].length>=t){var s={value:i[0],start:i.index,end:i.index+i[0].length};return s}}return null},this.modifyNumber=function(e){var t=this.selection.getCursor().row,n=this.selection.getCursor().column,r=new p(t,n-1,t,n),i=this.session.getTextRange(r);if(!isNaN(parseFloat(i))&&isFinite(i)){var s=this.getNumberAt(t,n);if(s){var o=s.value.indexOf(".")>=0?s.start+s.value.indexOf(".")+1:s.end,u=s.start+s.value.length-o,a=parseFloat(s.value);a*=Math.pow(10,u),o!==s.end&&n<o?e*=Math.pow(10,s.end-n-1):e*=Math.pow(10,s.end-n),a+=e,a/=Math.pow(10,u);var f=a.toFixed(u),l=new p(t,s.start,t,s.end);this.session.replace(l,f),this.moveCursorTo(t,Math.max(s.start+1,n+f.length-s.value.length));}}else this.toggleWord();},this.$toggleWordPairs=[["first","last"],["true","false"],["yes","no"],["width","height"],["top","bottom"],["right","left"],["on","off"],["x","y"],["get","set"],["max","min"],["horizontal","vertical"],["show","hide"],["add","remove"],["up","down"],["before","after"],["even","odd"],["in","out"],["inside","outside"],["next","previous"],["increase","decrease"],["attach","detach"],["&&","||"],["==","!="]],this.toggleWord=function(){var e=this.selection.getCursor().row,t=this.selection.getCursor().column;this.selection.selectWord();var n=this.getSelectedText(),r=this.selection.getWordRange().start.column,i=n.replace(/([a-z]+|[A-Z]+)(?=[A-Z_]|$)/g,"$1 ").split(/\s/),o=t-r-1;o<0&&(o=0);var u=0,a=0,f=this;n.match(/[A-Za-z0-9_]+/)&&i.forEach(function(t,i){a=u+t.length,o>=u&&o<=a&&(n=t,f.selection.clearSelection(),f.moveCursorTo(e,u+r),f.selection.selectTo(e,a+r)),u=a;});var l=this.$toggleWordPairs,c;for(var h=0;h<l.length;h++){var p=l[h];for(var d=0;d<=1;d++){var v=+!d,m=n.match(new RegExp("^\\s?_?("+s.escapeRegExp(p[d])+")\\s?$","i"));if(m){var g=n.match(new RegExp("([_]|^|\\s)("+s.escapeRegExp(m[1])+")($|\\s)","g"));g&&(c=n.replace(new RegExp(s.escapeRegExp(p[d]),"i"),function(e){var t=p[v];return e.toUpperCase()==e?t=t.toUpperCase():e.charAt(0).toUpperCase()==e.charAt(0)&&(t=t.substr(0,0)+p[v].charAt(0).toUpperCase()+t.substr(1)),t}),this.insert(c),c="");}}}},this.removeLines=function(){var e=this.$getSelectedRows();this.session.removeFullLines(e.first,e.last),this.clearSelection();},this.duplicateSelection=function(){var e=this.selection,t=this.session,n=e.getRange(),r=e.isBackwards();if(n.isEmpty()){var i=n.start.row;t.duplicateLines(i,i);}else {var s=r?n.start:n.end,o=t.insert(s,t.getTextRange(n),!1);n.start=s,n.end=o,e.setSelectionRange(n,r);}},this.moveLinesDown=function(){this.$moveLines(1,!1);},this.moveLinesUp=function(){this.$moveLines(-1,!1);},this.moveText=function(e,t,n){return this.session.moveText(e,t,n)},this.copyLinesUp=function(){this.$moveLines(-1,!0);},this.copyLinesDown=function(){this.$moveLines(1,!0);},this.$moveLines=function(e,t){var n,r,i=this.selection;if(!i.inMultiSelectMode||this.inVirtualSelectionMode){var s=i.toOrientedRange();n=this.$getSelectedRows(s),r=this.session.$moveLines(n.first,n.last,t?0:e),t&&e==-1&&(r=0),s.moveBy(r,0),i.fromOrientedRange(s);}else {var o=i.rangeList.ranges;i.rangeList.detach(this.session),this.inVirtualSelectionMode=!0;var u=0,a=0,f=o.length;for(var l=0;l<f;l++){var c=l;o[l].moveBy(u,0),n=this.$getSelectedRows(o[l]);var h=n.first,p=n.last;while(++l<f){a&&o[l].moveBy(a,0);var d=this.$getSelectedRows(o[l]);if(t&&d.first!=p)break;if(!t&&d.first>p+1)break;p=d.last;}l--,u=this.session.$moveLines(h,p,t?0:e),t&&e==-1&&(c=l+1);while(c<=l)o[c].moveBy(u,0),c++;t||(u=0),a+=u;}i.fromOrientedRange(i.ranges[0]),i.rangeList.attach(this.session),this.inVirtualSelectionMode=!1;}},this.$getSelectedRows=function(e){return e=(e||this.getSelectionRange()).collapseRows(),{first:this.session.getRowFoldStart(e.start.row),last:this.session.getRowFoldEnd(e.end.row)}},this.onCompositionStart=function(e){this.renderer.showComposition(e);},this.onCompositionUpdate=function(e){this.renderer.setCompositionText(e);},this.onCompositionEnd=function(){this.renderer.hideComposition();},this.getFirstVisibleRow=function(){return this.renderer.getFirstVisibleRow()},this.getLastVisibleRow=function(){return this.renderer.getLastVisibleRow()},this.isRowVisible=function(e){return e>=this.getFirstVisibleRow()&&e<=this.getLastVisibleRow()},this.isRowFullyVisible=function(e){return e>=this.renderer.getFirstFullyVisibleRow()&&e<=this.renderer.getLastFullyVisibleRow()},this.$getVisibleRowCount=function(){return this.renderer.getScrollBottomRow()-this.renderer.getScrollTopRow()+1},this.$moveByPage=function(e,t){var n=this.renderer,r=this.renderer.layerConfig,i=e*Math.floor(r.height/r.lineHeight);t===!0?this.selection.$moveSelection(function(){this.moveCursorBy(i,0);}):t===!1&&(this.selection.moveCursorBy(i,0),this.selection.clearSelection());var s=n.scrollTop;n.scrollBy(0,i*r.lineHeight),t!=null&&n.scrollCursorIntoView(null,.5),n.animateScrolling(s);},this.selectPageDown=function(){this.$moveByPage(1,!0);},this.selectPageUp=function(){this.$moveByPage(-1,!0);},this.gotoPageDown=function(){this.$moveByPage(1,!1);},this.gotoPageUp=function(){this.$moveByPage(-1,!1);},this.scrollPageDown=function(){this.$moveByPage(1);},this.scrollPageUp=function(){this.$moveByPage(-1);},this.scrollToRow=function(e){this.renderer.scrollToRow(e);},this.scrollToLine=function(e,t,n,r){this.renderer.scrollToLine(e,t,n,r);},this.centerSelection=function(){var e=this.getSelectionRange(),t={row:Math.floor(e.start.row+(e.end.row-e.start.row)/2),column:Math.floor(e.start.column+(e.end.column-e.start.column)/2)};this.renderer.alignCursor(t,.5);},this.getCursorPosition=function(){return this.selection.getCursor()},this.getCursorPositionScreen=function(){return this.session.documentToScreenPosition(this.getCursorPosition())},this.getSelectionRange=function(){return this.selection.getRange()},this.selectAll=function(){this.selection.selectAll();},this.clearSelection=function(){this.selection.clearSelection();},this.moveCursorTo=function(e,t){this.selection.moveCursorTo(e,t);},this.moveCursorToPosition=function(e){this.selection.moveCursorToPosition(e);},this.jumpToMatching=function(e,t){var n=this.getCursorPosition(),r=new y(this.session,n.row,n.column),i=r.getCurrentToken(),s=i||r.stepForward();if(!s)return;var o,u=!1,a={},f=n.column-s.start,l,c={")":"(","(":"(","]":"[","[":"[","{":"{","}":"{"};do{if(s.value.match(/[{}()\[\]]/g))for(;f<s.value.length&&!u;f++){if(!c[s.value[f]])continue;l=c[s.value[f]]+"."+s.type.replace("rparen","lparen"),isNaN(a[l])&&(a[l]=0);switch(s.value[f]){case"(":case"[":case"{":a[l]++;break;case")":case"]":case"}":a[l]--,a[l]===-1&&(o="bracket",u=!0);}}else s.type.indexOf("tag-name")!==-1&&(isNaN(a[s.value])&&(a[s.value]=0),i.value==="<"?a[s.value]++:i.value==="</"&&a[s.value]--,a[s.value]===-1&&(o="tag",u=!0));u||(i=s,s=r.stepForward(),f=0);}while(s&&!u);if(!o)return;var h,d;if(o==="bracket"){h=this.session.getBracketRange(n);if(!h){h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1,r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1),d=h.start;if(t||d.row===n.row&&Math.abs(d.column-n.column)<2)h=this.session.getBracketRange(d);}}else if(o==="tag"){if(!s||s.type.indexOf("tag-name")===-1)return;var v=s.value;h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2,r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2);if(h.compare(n.row,n.column)===0){u=!1;do s=i,i=r.stepBackward(),i&&(i.type.indexOf("tag-close")!==-1&&h.setEnd(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+1),s.value===v&&s.type.indexOf("tag-name")!==-1&&(i.value==="<"?a[v]++:i.value==="</"&&a[v]--,a[v]===0&&(u=!0)));while(i&&!u)}s&&s.type.indexOf("tag-name")&&(d=h.start,d.row==n.row&&Math.abs(d.column-n.column)<2&&(d=h.end));}d=h&&h.cursor||d,d&&(e?h&&t?this.selection.setRange(h):h&&h.isEqual(this.getSelectionRange())?this.clearSelection():this.selection.selectTo(d.row,d.column):this.selection.moveTo(d.row,d.column));},this.gotoLine=function(e,t,n){this.selection.clearSelection(),this.session.unfold({row:e-1,column:t||0}),this.exitMultiSelectMode&&this.exitMultiSelectMode(),this.moveCursorTo(e-1,t||0),this.isRowFullyVisible(e-1)||this.scrollToLine(e-1,!0,n);},this.navigateTo=function(e,t){this.selection.moveTo(e,t);},this.navigateUp=function(e){if(this.selection.isMultiLine()&&!this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(-e||-1,0);},this.navigateDown=function(e){if(this.selection.isMultiLine()&&this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(e||1,0);},this.navigateLeft=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().start;this.moveCursorToPosition(t);}else {e=e||1;while(e--)this.selection.moveCursorLeft();}this.clearSelection();},this.navigateRight=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().end;this.moveCursorToPosition(t);}else {e=e||1;while(e--)this.selection.moveCursorRight();}this.clearSelection();},this.navigateLineStart=function(){this.selection.moveCursorLineStart(),this.clearSelection();},this.navigateLineEnd=function(){this.selection.moveCursorLineEnd(),this.clearSelection();},this.navigateFileEnd=function(){this.selection.moveCursorFileEnd(),this.clearSelection();},this.navigateFileStart=function(){this.selection.moveCursorFileStart(),this.clearSelection();},this.navigateWordRight=function(){this.selection.moveCursorWordRight(),this.clearSelection();},this.navigateWordLeft=function(){this.selection.moveCursorWordLeft(),this.clearSelection();},this.replace=function(e,t){t&&this.$search.set(t);var n=this.$search.find(this.session),r=0;return n?(this.$tryReplace(n,e)&&(r=1),this.selection.setSelectionRange(n),this.renderer.scrollSelectionIntoView(n.start,n.end),r):r},this.replaceAll=function(e,t){t&&this.$search.set(t);var n=this.$search.findAll(this.session),r=0;if(!n.length)return r;var i=this.getSelectionRange();this.selection.moveTo(0,0);for(var s=n.length-1;s>=0;--s)this.$tryReplace(n[s],e)&&r++;return this.selection.setSelectionRange(i),r},this.$tryReplace=function(e,t){var n=this.session.getTextRange(e);return t=this.$search.replace(n,t),t!==null?(e.end=this.session.replace(e,t),e):null},this.getLastSearchOptions=function(){return this.$search.getOptions()},this.find=function(e,t,n){t||(t={}),typeof e=="string"||e instanceof RegExp?t.needle=e:typeof e=="object"&&r.mixin(t,e);var i=this.selection.getRange();t.needle==null&&(e=this.session.getTextRange(i)||this.$search.$options.needle,e||(i=this.session.getWordRange(i.start.row,i.start.column),e=this.session.getTextRange(i)),this.$search.set({needle:e})),this.$search.set(t),t.start||this.$search.set({start:i});var s=this.$search.find(this.session);if(t.preventScroll)return s;if(s)return this.revealRange(s,n),s;t.backwards?i.start=i.end:i.end=i.start,this.selection.setRange(i);},this.findNext=function(e,t){this.find({skipCurrent:!0,backwards:!1},e,t);},this.findPrevious=function(e,t){this.find(e,{skipCurrent:!0,backwards:!0},t);},this.revealRange=function(e,t){this.session.unfold(e),this.selection.setSelectionRange(e);var n=this.renderer.scrollTop;this.renderer.scrollSelectionIntoView(e.start,e.end,.5),t!==!1&&this.renderer.animateScrolling(n);},this.undo=function(){this.session.getUndoManager().undo(this.session),this.renderer.scrollCursorIntoView(null,.5);},this.redo=function(){this.session.getUndoManager().redo(this.session),this.renderer.scrollCursorIntoView(null,.5);},this.destroy=function(){this.$toDestroy&&(this.$toDestroy.forEach(function(e){e.destroy();}),this.$toDestroy=null),this.$mouseHandler&&this.$mouseHandler.destroy(),this.renderer.destroy(),this._signal("destroy",this),this.session&&this.session.destroy(),this._$emitInputEvent&&this._$emitInputEvent.cancel(),this.removeAllListeners();},this.setAutoScrollEditorIntoView=function(e){if(!e)return;var t,n=this,r=!1;this.$scrollAnchor||(this.$scrollAnchor=document.createElement("div"));var i=this.$scrollAnchor;i.style.cssText="position:absolute",this.container.insertBefore(i,this.container.firstChild);var s=this.on("changeSelection",function(){r=!0;}),o=this.renderer.on("beforeRender",function(){r&&(t=n.renderer.container.getBoundingClientRect());}),u=this.renderer.on("afterRender",function(){if(r&&t&&(n.isFocused()||n.searchBox&&n.searchBox.isFocused())){var e=n.renderer,s=e.$cursorLayer.$pixelPos,o=e.layerConfig,u=s.top-o.offset;s.top>=0&&u+t.top<0?r=!0:s.top<o.height&&s.top+t.top+o.lineHeight>window.innerHeight?r=!1:r=null,r!=null&&(i.style.top=u+"px",i.style.left=s.left+"px",i.style.height=o.lineHeight+"px",i.scrollIntoView(r)),r=t=null;}});this.setAutoScrollEditorIntoView=function(e){if(e)return;delete this.setAutoScrollEditorIntoView,this.off("changeSelection",s),this.renderer.off("afterRender",u),this.renderer.off("beforeRender",o);};},this.$resetCursorStyle=function(){var e=this.$cursorStyle||"ace",t=this.renderer.$cursorLayer;if(!t)return;t.setSmoothBlinking(/smooth/.test(e)),t.isBlinking=!this.$readOnly&&e!="wide",i.setCssClass(t.element,"ace_slim-cursors",/slim/.test(e));},this.prompt=function(e,t,n){var r=this;g.loadModule("./ext/prompt",function(i){i.prompt(r,e,t,n);});};}.call(w.prototype),g.defineOptions(w.prototype,"editor",{selectionStyle:{set:function(e){this.onSelectionChange(),this._signal("changeSelectionStyle",{data:e});},initialValue:"line"},highlightActiveLine:{set:function(){this.$updateHighlightActiveLine();},initialValue:!0},highlightSelectedWord:{set:function(e){this.$onSelectionChange();},initialValue:!0},readOnly:{set:function(e){this.textInput.setReadOnly(e),this.$resetCursorStyle();},initialValue:!1},copyWithEmptySelection:{set:function(e){this.textInput.setCopyWithEmptySelection(e);},initialValue:!1},cursorStyle:{set:function(e){this.$resetCursorStyle();},values:["ace","slim","smooth","wide"],initialValue:"ace"},mergeUndoDeltas:{values:[!1,!0,"always"],initialValue:!0},behavioursEnabled:{initialValue:!0},wrapBehavioursEnabled:{initialValue:!0},enableAutoIndent:{initialValue:!0},autoScrollEditorIntoView:{set:function(e){this.setAutoScrollEditorIntoView(e);}},keyboardHandler:{set:function(e){this.setKeyboardHandler(e);},get:function(){return this.$keybindingId},handlesSet:!0},value:{set:function(e){this.session.setValue(e);},get:function(){return this.getValue()},handlesSet:!0,hidden:!0},session:{set:function(e){this.setSession(e);},get:function(){return this.session},handlesSet:!0,hidden:!0},showLineNumbers:{set:function(e){this.renderer.$gutterLayer.setShowLineNumbers(e),this.renderer.$loop.schedule(this.renderer.CHANGE_GUTTER),e&&this.$relativeLineNumbers?E.attach(this):E.detach(this);},initialValue:!0},relativeLineNumbers:{set:function(e){this.$showLineNumbers&&e?E.attach(this):E.detach(this);}},placeholder:{set:function(e){this.$updatePlaceholder||(this.$updatePlaceholder=function(){var e=this.session&&(this.renderer.$composition||this.getValue());if(e&&this.renderer.placeholderNode)this.renderer.off("afterRender",this.$updatePlaceholder),i.removeCssClass(this.container,"ace_hasPlaceholder"),this.renderer.placeholderNode.remove(),this.renderer.placeholderNode=null;else if(!e&&!this.renderer.placeholderNode){this.renderer.on("afterRender",this.$updatePlaceholder),i.addCssClass(this.container,"ace_hasPlaceholder");var t=i.createElement("div");t.className="ace_placeholder",t.textContent=this.$placeholder||"",this.renderer.placeholderNode=t,this.renderer.content.appendChild(this.renderer.placeholderNode);}else !e&&this.renderer.placeholderNode&&(this.renderer.placeholderNode.textContent=this.$placeholder||"");}.bind(this),this.on("input",this.$updatePlaceholder)),this.$updatePlaceholder();}},hScrollBarAlwaysVisible:"renderer",vScrollBarAlwaysVisible:"renderer",highlightGutterLine:"renderer",animatedScroll:"renderer",showInvisibles:"renderer",showPrintMargin:"renderer",printMarginColumn:"renderer",printMargin:"renderer",fadeFoldWidgets:"renderer",showFoldWidgets:"renderer",displayIndentGuides:"renderer",showGutter:"renderer",fontSize:"renderer",fontFamily:"renderer",maxLines:"renderer",minLines:"renderer",scrollPastEnd:"renderer",fixedWidthGutter:"renderer",theme:"renderer",hasCssTransforms:"renderer",maxPixelHeight:"renderer",useTextareaForIME:"renderer",scrollSpeed:"$mouseHandler",dragDelay:"$mouseHandler",dragEnabled:"$mouseHandler",focusTimeout:"$mouseHandler",tooltipFollowsMouse:"$mouseHandler",firstLineNumber:"session",overwrite:"session",newLineMode:"session",useWorker:"session",useSoftTabs:"session",navigateWithinSoftTabs:"session",tabSize:"session",wrap:"session",indentedSoftWrap:"session",foldStyle:"session",mode:"session"});var E={getText:function(e,t){return (Math.abs(e.selection.lead.row-t)||t+1+(t<9?"\u00b7":""))+""},getWidth:function(e,t,n){return Math.max(t.toString().length,(n.lastRow+1).toString().length,2)*n.characterWidth},update:function(e,t){t.renderer.$loop.schedule(t.renderer.CHANGE_GUTTER);},attach:function(e){e.renderer.$gutterLayer.$renderer=this,e.on("changeSelection",this.update),this.update(null,e);},detach:function(e){e.renderer.$gutterLayer.$renderer==this&&(e.renderer.$gutterLayer.$renderer=null),e.off("changeSelection",this.update),this.update(null,e);}};t.Editor=w;}),ace.define("ace/undomanager",["require","exports","module","ace/range"],function(e,t,n){function i(e,t){for(var n=t;n--;){var r=e[n];if(r&&!r[0].ignore){while(n<t-1){var i=d(e[n],e[n+1]);e[n]=i[0],e[n+1]=i[1],n++;}return !0}}}function f(e){return {row:e.row,column:e.column}}function l(e){return {start:f(e.start),end:f(e.end),action:e.action,lines:e.lines.slice()}}function c(e){e=e||this;if(Array.isArray(e))return e.map(c).join("\n");var t="";e.action?(t=e.action=="insert"?"+":"-",t+="["+e.lines+"]"):e.value&&(Array.isArray(e.value)?t=e.value.map(h).join("\n"):t=h(e.value)),e.start&&(t+=h(e));if(e.id||e.rev)t+="	("+(e.id||e.rev)+")";return t}function h(e){return e.start.row+":"+e.start.column+"=>"+e.end.row+":"+e.end.column}function p(e,t){var n=e.action=="insert",r=t.action=="insert";if(n&&r)if(o(t.start,e.end)>=0)m(t,e,-1);else {if(!(o(t.start,e.start)<=0))return null;m(e,t,1);}else if(n&&!r)if(o(t.start,e.end)>=0)m(t,e,-1);else {if(!(o(t.end,e.start)<=0))return null;m(e,t,-1);}else if(!n&&r)if(o(t.start,e.start)>=0)m(t,e,1);else {if(!(o(t.start,e.start)<=0))return null;m(e,t,1);}else if(!n&&!r)if(o(t.start,e.start)>=0)m(t,e,1);else {if(!(o(t.end,e.start)<=0))return null;m(e,t,-1);}return [t,e]}function d(e,t){for(var n=e.length;n--;)for(var r=0;r<t.length;r++)if(!p(e[n],t[r])){while(n<e.length){while(r--)p(t[r],e[n]);r=t.length,n++;}return [e,t]}return e.selectionBefore=t.selectionBefore=e.selectionAfter=t.selectionAfter=null,[t,e]}function v(e,t){var n=e.action=="insert",r=t.action=="insert";if(n&&r)o(e.start,t.start)<0?m(t,e,1):m(e,t,1);else if(n&&!r)o(e.start,t.end)>=0?m(e,t,-1):o(e.start,t.start)<=0?m(t,e,1):(m(e,s.fromPoints(t.start,e.start),-1),m(t,e,1));else if(!n&&r)o(t.start,e.end)>=0?m(t,e,-1):o(t.start,e.start)<=0?m(e,t,1):(m(t,s.fromPoints(e.start,t.start),-1),m(e,t,1));else if(!n&&!r)if(o(t.start,e.end)>=0)m(t,e,-1);else {if(!(o(t.end,e.start)<=0)){var i,u;return o(e.start,t.start)<0&&(i=e,e=y(e,t.start)),o(e.end,t.end)>0&&(u=y(e,t.end)),g(t.end,e.start,e.end,-1),u&&!i&&(e.lines=u.lines,e.start=u.start,e.end=u.end,u=e),[t,i,u].filter(Boolean)}m(e,t,-1);}return [t,e]}function m(e,t,n){g(e.start,t.start,t.end,n),g(e.end,t.start,t.end,n);}function g(e,t,n,r){e.row==(r==1?t:n).row&&(e.column+=r*(n.column-t.column)),e.row+=r*(n.row-t.row);}function y(e,t){var n=e.lines,r=e.end;e.end=f(t);var i=e.end.row-e.start.row,s=n.splice(i,n.length),o=i?t.column:t.column-e.start.column;n.push(s[0].substring(0,o)),s[0]=s[0].substr(o);var u={start:f(t),end:r,lines:s,action:e.action};return u}function b(e,t){t=l(t);for(var n=e.length;n--;){var r=e[n];for(var i=0;i<r.length;i++){var s=r[i],o=v(s,t);t=o[0],o.length!=2&&(o[2]?(r.splice(i+1,1,o[1],o[2]),i++):o[1]||(r.splice(i,1),i--));}r.length||e.splice(n,1);}return e}function w(e,t){for(var n=0;n<t.length;n++){var r=t[n];for(var i=0;i<r.length;i++)b(e,r[i]);}}var r=function(){this.$maxRev=0,this.$fromUndo=!1,this.reset();};(function(){this.addSession=function(e){this.$session=e;},this.add=function(e,t,n){if(this.$fromUndo)return;if(e==this.$lastDelta)return;this.$keepRedoStack||(this.$redoStack.length=0);if(t===!1||!this.lastDeltas)this.lastDeltas=[],this.$undoStack.push(this.lastDeltas),e.id=this.$rev=++this.$maxRev;if(e.action=="remove"||e.action=="insert")this.$lastDelta=e;this.lastDeltas.push(e);},this.addSelection=function(e,t){this.selections.push({value:e,rev:t||this.$rev});},this.startNewGroup=function(){return this.lastDeltas=null,this.$rev},this.markIgnored=function(e,t){t==null&&(t=this.$rev+1);var n=this.$undoStack;for(var r=n.length;r--;){var i=n[r][0];if(i.id<=e)break;i.id<t&&(i.ignore=!0);}this.lastDeltas=null;},this.getSelection=function(e,t){var n=this.selections;for(var r=n.length;r--;){var i=n[r];if(i.rev<e)return t&&(i=n[r+1]),i}},this.getRevision=function(){return this.$rev},this.getDeltas=function(e,t){t==null&&(t=this.$rev+1);var n=this.$undoStack,r=null,i=0;for(var s=n.length;s--;){var o=n[s][0];o.id<t&&!r&&(r=s+1);if(o.id<=e){i=s+1;break}}return n.slice(i,r)},this.getChangedRanges=function(e,t){t==null&&(t=this.$rev+1);},this.getChangedLines=function(e,t){t==null&&(t=this.$rev+1);},this.undo=function(e,t){this.lastDeltas=null;var n=this.$undoStack;if(!i(n,n.length))return;e||(e=this.$session),this.$redoStackBaseRev!==this.$rev&&this.$redoStack.length&&(this.$redoStack=[]),this.$fromUndo=!0;var r=n.pop(),s=null;return r&&(s=e.undoChanges(r,t),this.$redoStack.push(r),this.$syncRev()),this.$fromUndo=!1,s},this.redo=function(e,t){this.lastDeltas=null,e||(e=this.$session),this.$fromUndo=!0;if(this.$redoStackBaseRev!=this.$rev){var n=this.getDeltas(this.$redoStackBaseRev,this.$rev+1);w(this.$redoStack,n),this.$redoStackBaseRev=this.$rev,this.$redoStack.forEach(function(e){e[0].id=++this.$maxRev;},this);}var r=this.$redoStack.pop(),i=null;return r&&(i=e.redoChanges(r,t),this.$undoStack.push(r),this.$syncRev()),this.$fromUndo=!1,i},this.$syncRev=function(){var e=this.$undoStack,t=e[e.length-1],n=t&&t[0].id||0;this.$redoStackBaseRev=n,this.$rev=n;},this.reset=function(){this.lastDeltas=null,this.$lastDelta=null,this.$undoStack=[],this.$redoStack=[],this.$rev=0,this.mark=0,this.$redoStackBaseRev=this.$rev,this.selections=[];},this.canUndo=function(){return this.$undoStack.length>0},this.canRedo=function(){return this.$redoStack.length>0},this.bookmark=function(e){e==undefined&&(e=this.$rev),this.mark=e;},this.isAtBookmark=function(){return this.$rev===this.mark},this.toJSON=function(){},this.fromJSON=function(){},this.hasUndo=this.canUndo,this.hasRedo=this.canRedo,this.isClean=this.isAtBookmark,this.markClean=this.bookmark,this.$prettyPrint=function(e){return e?c(e):c(this.$undoStack)+"\n---\n"+c(this.$redoStack)};}).call(r.prototype);var s=e("./range").Range,o=s.comparePoints,u=s.comparePoints;t.UndoManager=r;}),ace.define("ace/layer/lines",["require","exports","module","ace/lib/dom"],function(e,t,n){var r=e("../lib/dom"),i=function(e,t){this.element=e,this.canvasHeight=t||5e5,this.element.style.height=this.canvasHeight*2+"px",this.cells=[],this.cellCache=[],this.$offsetCoefficient=0;};(function(){this.moveContainer=function(e){r.translate(this.element,0,-(e.firstRowScreen*e.lineHeight%this.canvasHeight)-e.offset*this.$offsetCoefficient);},this.pageChanged=function(e,t){return Math.floor(e.firstRowScreen*e.lineHeight/this.canvasHeight)!==Math.floor(t.firstRowScreen*t.lineHeight/this.canvasHeight)},this.computeLineTop=function(e,t,n){var r=t.firstRowScreen*t.lineHeight,i=Math.floor(r/this.canvasHeight),s=n.documentToScreenRow(e,0)*t.lineHeight;return s-i*this.canvasHeight},this.computeLineHeight=function(e,t,n){return t.lineHeight*n.getRowLineCount(e)},this.getLength=function(){return this.cells.length},this.get=function(e){return this.cells[e]},this.shift=function(){this.$cacheCell(this.cells.shift());},this.pop=function(){this.$cacheCell(this.cells.pop());},this.push=function(e){if(Array.isArray(e)){this.cells.push.apply(this.cells,e);var t=r.createFragment(this.element);for(var n=0;n<e.length;n++)t.appendChild(e[n].element);this.element.appendChild(t);}else this.cells.push(e),this.element.appendChild(e.element);},this.unshift=function(e){if(Array.isArray(e)){this.cells.unshift.apply(this.cells,e);var t=r.createFragment(this.element);for(var n=0;n<e.length;n++)t.appendChild(e[n].element);this.element.firstChild?this.element.insertBefore(t,this.element.firstChild):this.element.appendChild(t);}else this.cells.unshift(e),this.element.insertAdjacentElement("afterbegin",e.element);},this.last=function(){return this.cells.length?this.cells[this.cells.length-1]:null},this.$cacheCell=function(e){if(!e)return;e.element.remove(),this.cellCache.push(e);},this.createCell=function(e,t,n,i){var s=this.cellCache.pop();if(!s){var o=r.createElement("div");i&&i(o),this.element.appendChild(o),s={element:o,text:"",row:e};}return s.row=e,s};}).call(i.prototype),t.Lines=i;}),ace.define("ace/layer/gutter",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/layer/lines"],function(e,t,n){function f(e){var t=document.createTextNode("");e.appendChild(t);var n=r.createElement("span");return e.appendChild(n),e}var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/lang"),o=e("../lib/event_emitter").EventEmitter,u=e("./lines").Lines,a=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_gutter-layer",e.appendChild(this.element),this.setShowFoldWidgets(this.$showFoldWidgets),this.gutterWidth=0,this.$annotations=[],this.$updateAnnotations=this.$updateAnnotations.bind(this),this.$lines=new u(this.element),this.$lines.$offsetCoefficient=1;};(function(){i.implement(this,o),this.setSession=function(e){this.session&&this.session.off("change",this.$updateAnnotations),this.session=e,e&&e.on("change",this.$updateAnnotations);},this.addGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.addGutterDecoration"),this.session.addGutterDecoration(e,t);},this.removeGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.removeGutterDecoration"),this.session.removeGutterDecoration(e,t);},this.setAnnotations=function(e){this.$annotations=[];for(var t=0;t<e.length;t++){var n=e[t],r=n.row,i=this.$annotations[r];i||(i=this.$annotations[r]={text:[]});var o=n.text;o=o?s.escapeHTML(o):n.html||"",i.text.indexOf(o)===-1&&i.text.push(o);var u=n.type;u=="error"?i.className=" ace_error":u=="warning"&&i.className!=" ace_error"?i.className=" ace_warning":u=="info"&&!i.className&&(i.className=" ace_info");}},this.$updateAnnotations=function(e){if(!this.$annotations.length)return;var t=e.start.row,n=e.end.row-t;if(n!==0)if(e.action=="remove")this.$annotations.splice(t,n+1,null);else {var r=new Array(n+1);r.unshift(t,1),this.$annotations.splice.apply(this.$annotations,r);}},this.update=function(e){this.config=e;var t=this.session,n=e.firstRow,r=Math.min(e.lastRow+e.gutterOffset,t.getLength()-1);this.oldLastRow=r,this.config=e,this.$lines.moveContainer(e),this.$updateCursorRow();var i=t.getNextFoldLine(n),s=i?i.start.row:Infinity,o=null,u=-1,a=n;for(;;){a>s&&(a=i.end.row+1,i=t.getNextFoldLine(a,i),s=i?i.start.row:Infinity);if(a>r){while(this.$lines.getLength()>u+1)this.$lines.pop();break}o=this.$lines.get(++u),o?o.row=a:(o=this.$lines.createCell(a,e,this.session,f),this.$lines.push(o)),this.$renderCell(o,e,i,a),a++;}this._signal("afterRender"),this.$updateGutterWidth(e);},this.$updateGutterWidth=function(e){var t=this.session,n=t.gutterRenderer||this.$renderer,r=t.$firstLineNumber,i=this.$lines.last()?this.$lines.last().text:"";if(this.$fixedWidth||t.$useWrapMode)i=t.getLength()+r-1;var s=n?n.getWidth(t,i,e):i.toString().length*e.characterWidth,o=this.$padding||this.$computePadding();s+=o.left+o.right,s!==this.gutterWidth&&!isNaN(s)&&(this.gutterWidth=s,this.element.parentNode.style.width=this.element.style.width=Math.ceil(this.gutterWidth)+"px",this._signal("changeGutterWidth",s));},this.$updateCursorRow=function(){if(!this.$highlightGutterLine)return;var e=this.session.selection.getCursor();if(this.$cursorRow===e.row)return;this.$cursorRow=e.row;},this.updateLineHighlight=function(){if(!this.$highlightGutterLine)return;var e=this.session.selection.cursor.row;this.$cursorRow=e;if(this.$cursorCell&&this.$cursorCell.row==e)return;this.$cursorCell&&(this.$cursorCell.element.className=this.$cursorCell.element.className.replace("ace_gutter-active-line ",""));var t=this.$lines.cells;this.$cursorCell=null;for(var n=0;n<t.length;n++){var r=t[n];if(r.row>=this.$cursorRow){if(r.row>this.$cursorRow){var i=this.session.getFoldLine(this.$cursorRow);if(!(n>0&&i&&i.start.row==t[n-1].row))break;r=t[n-1];}r.element.className="ace_gutter-active-line "+r.element.className,this.$cursorCell=r;break}}},this.scrollLines=function(e){var t=this.config;this.config=e,this.$updateCursorRow();if(this.$lines.pageChanged(t,e))return this.update(e);this.$lines.moveContainer(e);var n=Math.min(e.lastRow+e.gutterOffset,this.session.getLength()-1),r=this.oldLastRow;this.oldLastRow=n;if(!t||r<e.firstRow)return this.update(e);if(n<t.firstRow)return this.update(e);if(t.firstRow<e.firstRow)for(var i=this.session.getFoldedRowCount(t.firstRow,e.firstRow-1);i>0;i--)this.$lines.shift();if(r>n)for(var i=this.session.getFoldedRowCount(n+1,r);i>0;i--)this.$lines.pop();e.firstRow<t.firstRow&&this.$lines.unshift(this.$renderLines(e,e.firstRow,t.firstRow-1)),n>r&&this.$lines.push(this.$renderLines(e,r+1,n)),this.updateLineHighlight(),this._signal("afterRender"),this.$updateGutterWidth(e);},this.$renderLines=function(e,t,n){var r=[],i=t,s=this.session.getNextFoldLine(i),o=s?s.start.row:Infinity;for(;;){i>o&&(i=s.end.row+1,s=this.session.getNextFoldLine(i,s),o=s?s.start.row:Infinity);if(i>n)break;var u=this.$lines.createCell(i,e,this.session,f);this.$renderCell(u,e,s,i),r.push(u),i++;}return r},this.$renderCell=function(e,t,n,i){var s=e.element,o=this.session,u=s.childNodes[0],a=s.childNodes[1],f=o.$firstLineNumber,l=o.$breakpoints,c=o.$decorations,h=o.gutterRenderer||this.$renderer,p=this.$showFoldWidgets&&o.foldWidgets,d=n?n.start.row:Number.MAX_VALUE,v="ace_gutter-cell ";this.$highlightGutterLine&&(i==this.$cursorRow||n&&i<this.$cursorRow&&i>=d&&this.$cursorRow<=n.end.row)&&(v+="ace_gutter-active-line ",this.$cursorCell!=e&&(this.$cursorCell&&(this.$cursorCell.element.className=this.$cursorCell.element.className.replace("ace_gutter-active-line ","")),this.$cursorCell=e)),l[i]&&(v+=l[i]),c[i]&&(v+=c[i]),this.$annotations[i]&&(v+=this.$annotations[i].className),s.className!=v&&(s.className=v);if(p){var m=p[i];m==null&&(m=p[i]=o.getFoldWidget(i));}if(m){var v="ace_fold-widget ace_"+m;m=="start"&&i==d&&i<n.end.row?v+=" ace_closed":v+=" ace_open",a.className!=v&&(a.className=v);var g=t.lineHeight+"px";r.setStyle(a.style,"height",g),r.setStyle(a.style,"display","inline-block");}else a&&r.setStyle(a.style,"display","none");var y=(h?h.getText(o,i):i+f).toString();return y!==u.data&&(u.data=y),r.setStyle(e.element.style,"height",this.$lines.computeLineHeight(i,t,o)+"px"),r.setStyle(e.element.style,"top",this.$lines.computeLineTop(i,t,o)+"px"),e.text=y,e},this.$fixedWidth=!1,this.$highlightGutterLine=!0,this.$renderer="",this.setHighlightGutterLine=function(e){this.$highlightGutterLine=e;},this.$showLineNumbers=!0,this.$renderer="",this.setShowLineNumbers=function(e){this.$renderer=!e&&{getWidth:function(){return 0},getText:function(){return ""}};},this.getShowLineNumbers=function(){return this.$showLineNumbers},this.$showFoldWidgets=!0,this.setShowFoldWidgets=function(e){e?r.addCssClass(this.element,"ace_folding-enabled"):r.removeCssClass(this.element,"ace_folding-enabled"),this.$showFoldWidgets=e,this.$padding=null;},this.getShowFoldWidgets=function(){return this.$showFoldWidgets},this.$computePadding=function(){if(!this.element.firstChild)return {left:0,right:0};var e=r.computedStyle(this.element.firstChild);return this.$padding={},this.$padding.left=(parseInt(e.borderLeftWidth)||0)+(parseInt(e.paddingLeft)||0)+1,this.$padding.right=(parseInt(e.borderRightWidth)||0)+(parseInt(e.paddingRight)||0),this.$padding},this.getRegion=function(e){var t=this.$padding||this.$computePadding(),n=this.element.getBoundingClientRect();if(e.x<t.left+n.left)return "markers";if(this.$showFoldWidgets&&e.x>n.right-t.right)return "foldWidgets"};}).call(a.prototype),t.Gutter=a;}),ace.define("ace/layer/marker",["require","exports","module","ace/range","ace/lib/dom"],function(e,t,n){var r=e("../range").Range,i=e("../lib/dom"),s=function(e){this.element=i.createElement("div"),this.element.className="ace_layer ace_marker-layer",e.appendChild(this.element);};(function(){function e(e,t,n,r){return (e?1:0)|(t?2:0)|(n?4:0)|(r?8:0)}this.$padding=0,this.setPadding=function(e){this.$padding=e;},this.setSession=function(e){this.session=e;},this.setMarkers=function(e){this.markers=e;},this.elt=function(e,t){var n=this.i!=-1&&this.element.childNodes[this.i];n?this.i++:(n=document.createElement("div"),this.element.appendChild(n),this.i=-1),n.style.cssText=t,n.className=e;},this.update=function(e){if(!e)return;this.config=e,this.i=0;var t;for(var n in this.markers){var r=this.markers[n];if(!r.range){r.update(t,this,this.session,e);continue}var i=r.range.clipRows(e.firstRow,e.lastRow);if(i.isEmpty())continue;i=i.toScreenRange(this.session);if(r.renderer){var s=this.$getTop(i.start.row,e),o=this.$padding+i.start.column*e.characterWidth;r.renderer(t,i,o,s,e);}else r.type=="fullLine"?this.drawFullLineMarker(t,i,r.clazz,e):r.type=="screenLine"?this.drawScreenLineMarker(t,i,r.clazz,e):i.isMultiLine()?r.type=="text"?this.drawTextMarker(t,i,r.clazz,e):this.drawMultiLineMarker(t,i,r.clazz,e):this.drawSingleLineMarker(t,i,r.clazz+" ace_start"+" ace_br15",e);}if(this.i!=-1)while(this.i<this.element.childElementCount)this.element.removeChild(this.element.lastChild);},this.$getTop=function(e,t){return (e-t.firstRowScreen)*t.lineHeight},this.drawTextMarker=function(t,n,i,s,o){var u=this.session,a=n.start.row,f=n.end.row,l=a,c=0,h=0,p=u.getScreenLastRowColumn(l),d=new r(l,n.start.column,l,h);for(;l<=f;l++)d.start.row=d.end.row=l,d.start.column=l==a?n.start.column:u.getRowWrapIndent(l),d.end.column=p,c=h,h=p,p=l+1<f?u.getScreenLastRowColumn(l+1):l==f?0:n.end.column,this.drawSingleLineMarker(t,d,i+(l==a?" ace_start":"")+" ace_br"+e(l==a||l==a+1&&n.start.column,c<h,h>p,l==f),s,l==f?0:1,o);},this.drawMultiLineMarker=function(e,t,n,r,i){var s=this.$padding,o=r.lineHeight,u=this.$getTop(t.start.row,r),a=s+t.start.column*r.characterWidth;i=i||"";if(this.session.$bidiHandler.isBidiRow(t.start.row)){var f=t.clone();f.end.row=f.start.row,f.end.column=this.session.getLine(f.start.row).length,this.drawBidiSingleLineMarker(e,f,n+" ace_br1 ace_start",r,null,i);}else this.elt(n+" ace_br1 ace_start","height:"+o+"px;"+"right:0;"+"top:"+u+"px;left:"+a+"px;"+(i||""));if(this.session.$bidiHandler.isBidiRow(t.end.row)){var f=t.clone();f.start.row=f.end.row,f.start.column=0,this.drawBidiSingleLineMarker(e,f,n+" ace_br12",r,null,i);}else {u=this.$getTop(t.end.row,r);var l=t.end.column*r.characterWidth;this.elt(n+" ace_br12","height:"+o+"px;"+"width:"+l+"px;"+"top:"+u+"px;"+"left:"+s+"px;"+(i||""));}o=(t.end.row-t.start.row-1)*r.lineHeight;if(o<=0)return;u=this.$getTop(t.start.row+1,r);var c=(t.start.column?1:0)|(t.end.column?0:8);this.elt(n+(c?" ace_br"+c:""),"height:"+o+"px;"+"right:0;"+"top:"+u+"px;"+"left:"+s+"px;"+(i||""));},this.drawSingleLineMarker=function(e,t,n,r,i,s){if(this.session.$bidiHandler.isBidiRow(t.start.row))return this.drawBidiSingleLineMarker(e,t,n,r,i,s);var o=r.lineHeight,u=(t.end.column+(i||0)-t.start.column)*r.characterWidth,a=this.$getTop(t.start.row,r),f=this.$padding+t.start.column*r.characterWidth;this.elt(n,"height:"+o+"px;"+"width:"+u+"px;"+"top:"+a+"px;"+"left:"+f+"px;"+(s||""));},this.drawBidiSingleLineMarker=function(e,t,n,r,i,s){var o=r.lineHeight,u=this.$getTop(t.start.row,r),a=this.$padding,f=this.session.$bidiHandler.getSelections(t.start.column,t.end.column);f.forEach(function(e){this.elt(n,"height:"+o+"px;"+"width:"+e.width+(i||0)+"px;"+"top:"+u+"px;"+"left:"+(a+e.left)+"px;"+(s||""));},this);},this.drawFullLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;t.start.row!=t.end.row&&(o+=this.$getTop(t.end.row,r)-s),this.elt(n,"height:"+o+"px;"+"top:"+s+"px;"+"left:0;right:0;"+(i||""));},this.drawScreenLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;this.elt(n,"height:"+o+"px;"+"top:"+s+"px;"+"left:0;right:0;"+(i||""));};}).call(s.prototype),t.Marker=s;}),ace.define("ace/layer/text",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/layer/lines","ace/lib/event_emitter"],function(e,t,n){var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("./lines").Lines,u=e("../lib/event_emitter").EventEmitter,a=function(e){this.dom=i,this.element=this.dom.createElement("div"),this.element.className="ace_layer ace_text-layer",e.appendChild(this.element),this.$updateEolChar=this.$updateEolChar.bind(this),this.$lines=new o(this.element);};(function(){r.implement(this,u),this.EOF_CHAR="\u00b6",this.EOL_CHAR_LF="\u00ac",this.EOL_CHAR_CRLF="\u00a4",this.EOL_CHAR=this.EOL_CHAR_LF,this.TAB_CHAR="\u2014",this.SPACE_CHAR="\u00b7",this.$padding=0,this.MAX_LINE_LENGTH=1e4,this.$updateEolChar=function(){var e=this.session.doc,t=e.getNewLineCharacter()=="\n"&&e.getNewLineMode()!="windows",n=t?this.EOL_CHAR_LF:this.EOL_CHAR_CRLF;if(this.EOL_CHAR!=n)return this.EOL_CHAR=n,!0},this.setPadding=function(e){this.$padding=e,this.element.style.margin="0 "+e+"px";},this.getLineHeight=function(){return this.$fontMetrics.$characterSize.height||0},this.getCharacterWidth=function(){return this.$fontMetrics.$characterSize.width||0},this.$setFontMetrics=function(e){this.$fontMetrics=e,this.$fontMetrics.on("changeCharacterSize",function(e){this._signal("changeCharacterSize",e);}.bind(this)),this.$pollSizeChanges();},this.checkForSizeChanges=function(){this.$fontMetrics.checkForSizeChanges();},this.$pollSizeChanges=function(){return this.$pollSizeChangesTimer=this.$fontMetrics.$pollSizeChanges()},this.setSession=function(e){this.session=e,e&&this.$computeTabString();},this.showInvisibles=!1,this.showSpaces=!1,this.showTabs=!1,this.showEOL=!1,this.setShowInvisibles=function(e){return this.showInvisibles==e?!1:(this.showInvisibles=e,typeof e=="string"?(this.showSpaces=/tab/i.test(e),this.showTabs=/space/i.test(e),this.showEOL=/eol/i.test(e)):this.showSpaces=this.showTabs=this.showEOL=e,this.$computeTabString(),!0)},this.displayIndentGuides=!0,this.setDisplayIndentGuides=function(e){return this.displayIndentGuides==e?!1:(this.displayIndentGuides=e,this.$computeTabString(),!0)},this.$tabStrings=[],this.onChangeTabSize=this.$computeTabString=function(){var e=this.session.getTabSize();this.tabSize=e;var t=this.$tabStrings=[0];for(var n=1;n<e+1;n++)if(this.showTabs){var r=this.dom.createElement("span");r.className="ace_invisible ace_invisible_tab",r.textContent=s.stringRepeat(this.TAB_CHAR,n),t.push(r);}else t.push(this.dom.createTextNode(s.stringRepeat(" ",n),this.element));if(this.displayIndentGuides){this.$indentGuideRe=/\s\S| \t|\t |\s$/;var i="ace_indent-guide",o=this.showSpaces?" ace_invisible ace_invisible_space":"",u=this.showSpaces?s.stringRepeat(this.SPACE_CHAR,this.tabSize):s.stringRepeat(" ",this.tabSize),a=this.showTabs?" ace_invisible ace_invisible_tab":"",f=this.showTabs?s.stringRepeat(this.TAB_CHAR,this.tabSize):u,r=this.dom.createElement("span");r.className=i+o,r.textContent=u,this.$tabStrings[" "]=r;var r=this.dom.createElement("span");r.className=i+a,r.textContent=f,this.$tabStrings["	"]=r;}},this.updateLines=function(e,t,n){if(this.config.lastRow!=e.lastRow||this.config.firstRow!=e.firstRow)return this.update(e);this.config=e;var r=Math.max(t,e.firstRow),i=Math.min(n,e.lastRow),s=this.element.childNodes,o=0;for(var u=e.firstRow;u<r;u++){var a=this.session.getFoldLine(u);if(a){if(a.containsRow(r)){r=a.start.row;break}u=a.end.row;}o++;}var f=!1,u=r,a=this.session.getNextFoldLine(u),l=a?a.start.row:Infinity;for(;;){u>l&&(u=a.end.row+1,a=this.session.getNextFoldLine(u,a),l=a?a.start.row:Infinity);if(u>i)break;var c=s[o++];if(c){this.dom.removeChildren(c),this.$renderLine(c,u,u==l?a:!1),f&&(c.style.top=this.$lines.computeLineTop(u,e,this.session)+"px");var h=e.lineHeight*this.session.getRowLength(u)+"px";c.style.height!=h&&(f=!0,c.style.height=h);}u++;}if(f)while(o<this.$lines.cells.length){var p=this.$lines.cells[o++];p.element.style.top=this.$lines.computeLineTop(p.row,e,this.session)+"px";}},this.scrollLines=function(e){var t=this.config;this.config=e;if(this.$lines.pageChanged(t,e))return this.update(e);this.$lines.moveContainer(e);var n=e.lastRow,r=t?t.lastRow:-1;if(!t||r<e.firstRow)return this.update(e);if(n<t.firstRow)return this.update(e);if(!t||t.lastRow<e.firstRow)return this.update(e);if(e.lastRow<t.firstRow)return this.update(e);if(t.firstRow<e.firstRow)for(var i=this.session.getFoldedRowCount(t.firstRow,e.firstRow-1);i>0;i--)this.$lines.shift();if(t.lastRow>e.lastRow)for(var i=this.session.getFoldedRowCount(e.lastRow+1,t.lastRow);i>0;i--)this.$lines.pop();e.firstRow<t.firstRow&&this.$lines.unshift(this.$renderLinesFragment(e,e.firstRow,t.firstRow-1)),e.lastRow>t.lastRow&&this.$lines.push(this.$renderLinesFragment(e,t.lastRow+1,e.lastRow));},this.$renderLinesFragment=function(e,t,n){var r=[],s=t,o=this.session.getNextFoldLine(s),u=o?o.start.row:Infinity;for(;;){s>u&&(s=o.end.row+1,o=this.session.getNextFoldLine(s,o),u=o?o.start.row:Infinity);if(s>n)break;var a=this.$lines.createCell(s,e,this.session),f=a.element;this.dom.removeChildren(f),i.setStyle(f.style,"height",this.$lines.computeLineHeight(s,e,this.session)+"px"),i.setStyle(f.style,"top",this.$lines.computeLineTop(s,e,this.session)+"px"),this.$renderLine(f,s,s==u?o:!1),this.$useLineGroups()?f.className="ace_line_group":f.className="ace_line",r.push(a),s++;}return r},this.update=function(e){this.$lines.moveContainer(e),this.config=e;var t=e.firstRow,n=e.lastRow,r=this.$lines;while(r.getLength())r.pop();r.push(this.$renderLinesFragment(e,t,n));},this.$textToken={text:!0,rparen:!0,lparen:!0},this.$renderToken=function(e,t,n,r){var i=this,o=/(\t)|( +)|([\x00-\x1f\x80-\xa0\xad\u1680\u180E\u2000-\u200f\u2028\u2029\u202F\u205F\uFEFF\uFFF9-\uFFFC]+)|(\u3000)|([\u1100-\u115F\u11A3-\u11A7\u11FA-\u11FF\u2329-\u232A\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3001-\u303E\u3041-\u3096\u3099-\u30FF\u3105-\u312D\u3131-\u318E\u3190-\u31BA\u31C0-\u31E3\u31F0-\u321E\u3220-\u3247\u3250-\u32FE\u3300-\u4DBF\u4E00-\uA48C\uA490-\uA4C6\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g,u=this.dom.createFragment(this.element),a,f=0;while(a=o.exec(r)){var l=a[1],c=a[2],h=a[3],p=a[4],d=a[5];if(!i.showSpaces&&c)continue;var v=f!=a.index?r.slice(f,a.index):"";f=a.index+a[0].length,v&&u.appendChild(this.dom.createTextNode(v,this.element));if(l){var m=i.session.getScreenTabSize(t+a.index);u.appendChild(i.$tabStrings[m].cloneNode(!0)),t+=m-1;}else if(c)if(i.showSpaces){var g=this.dom.createElement("span");g.className="ace_invisible ace_invisible_space",g.textContent=s.stringRepeat(i.SPACE_CHAR,c.length),u.appendChild(g);}else u.appendChild(this.com.createTextNode(c,this.element));else if(h){var g=this.dom.createElement("span");g.className="ace_invisible ace_invisible_space ace_invalid",g.textContent=s.stringRepeat(i.SPACE_CHAR,h.length),u.appendChild(g);}else if(p){t+=1;var g=this.dom.createElement("span");g.style.width=i.config.characterWidth*2+"px",g.className=i.showSpaces?"ace_cjk ace_invisible ace_invisible_space":"ace_cjk",g.textContent=i.showSpaces?i.SPACE_CHAR:p,u.appendChild(g);}else if(d){t+=1;var g=this.dom.createElement("span");g.style.width=i.config.characterWidth*2+"px",g.className="ace_cjk",g.textContent=d,u.appendChild(g);}}u.appendChild(this.dom.createTextNode(f?r.slice(f):r,this.element));if(!this.$textToken[n.type]){var y="ace_"+n.type.replace(/\./g," ace_"),g=this.dom.createElement("span");n.type=="fold"&&(g.style.width=n.value.length*this.config.characterWidth+"px"),g.className=y,g.appendChild(u),e.appendChild(g);}else e.appendChild(u);return t+r.length},this.renderIndentGuide=function(e,t,n){var r=t.search(this.$indentGuideRe);if(r<=0||r>=n)return t;if(t[0]==" "){r-=r%this.tabSize;var i=r/this.tabSize;for(var s=0;s<i;s++)e.appendChild(this.$tabStrings[" "].cloneNode(!0));return t.substr(r)}if(t[0]=="	"){for(var s=0;s<r;s++)e.appendChild(this.$tabStrings["	"].cloneNode(!0));return t.substr(r)}return t},this.$createLineElement=function(e){var t=this.dom.createElement("div");return t.className="ace_line",t.style.height=this.config.lineHeight+"px",t},this.$renderWrappedLine=function(e,t,n){var r=0,i=0,o=n[0],u=0,a=this.$createLineElement();e.appendChild(a);for(var f=0;f<t.length;f++){var l=t[f],c=l.value;if(f==0&&this.displayIndentGuides){r=c.length,c=this.renderIndentGuide(a,c,o);if(!c)continue;r-=c.length;}if(r+c.length<o)u=this.$renderToken(a,u,l,c),r+=c.length;else {while(r+c.length>=o)u=this.$renderToken(a,u,l,c.substring(0,o-r)),c=c.substring(o-r),r=o,a=this.$createLineElement(),e.appendChild(a),a.appendChild(this.dom.createTextNode(s.stringRepeat("\u00a0",n.indent),this.element)),i++,u=0,o=n[i]||Number.MAX_VALUE;c.length!=0&&(r+=c.length,u=this.$renderToken(a,u,l,c));}}n[n.length-1]>this.MAX_LINE_LENGTH&&this.$renderOverflowMessage(a,u,null,"",!0);},this.$renderSimpleLine=function(e,t){var n=0,r=t[0],i=r.value;this.displayIndentGuides&&(i=this.renderIndentGuide(e,i)),i&&(n=this.$renderToken(e,n,r,i));for(var s=1;s<t.length;s++){r=t[s],i=r.value;if(n+i.length>this.MAX_LINE_LENGTH)return this.$renderOverflowMessage(e,n,r,i);n=this.$renderToken(e,n,r,i);}},this.$renderOverflowMessage=function(e,t,n,r,i){n&&this.$renderToken(e,t,n,r.slice(0,this.MAX_LINE_LENGTH-t));var s=this.dom.createElement("span");s.className="ace_inline_button ace_keyword ace_toggle_wrap",s.textContent=i?"<hide>":"<click to see more...>",e.appendChild(s);},this.$renderLine=function(e,t,n){!n&&n!=0&&(n=this.session.getFoldLine(t));if(n)var r=this.$getFoldLineTokens(t,n);else var r=this.session.getTokens(t);var i=e;if(r.length){var s=this.session.getRowSplitData(t);if(s&&s.length){this.$renderWrappedLine(e,r,s);var i=e.lastChild;}else {var i=e;this.$useLineGroups()&&(i=this.$createLineElement(),e.appendChild(i)),this.$renderSimpleLine(i,r);}}else this.$useLineGroups()&&(i=this.$createLineElement(),e.appendChild(i));if(this.showEOL&&i){n&&(t=n.end.row);var o=this.dom.createElement("span");o.className="ace_invisible ace_invisible_eol",o.textContent=t==this.session.getLength()-1?this.EOF_CHAR:this.EOL_CHAR,i.appendChild(o);}},this.$getFoldLineTokens=function(e,t){function i(e,t,n){var i=0,s=0;while(s+e[i].value.length<t){s+=e[i].value.length,i++;if(i==e.length)return}if(s!=t){var o=e[i].value.substring(t-s);o.length>n-t&&(o=o.substring(0,n-t)),r.push({type:e[i].type,value:o}),s=t+o.length,i+=1;}while(s<n&&i<e.length){var o=e[i].value;o.length+s>n?r.push({type:e[i].type,value:o.substring(0,n-s)}):r.push(e[i]),s+=o.length,i+=1;}}var n=this.session,r=[],s=n.getTokens(e);return t.walk(function(e,t,o,u,a){e!=null?r.push({type:"fold",value:e}):(a&&(s=n.getTokens(t)),s.length&&i(s,u,o));},t.end.row,this.session.getLine(t.end.row).length),r},this.$useLineGroups=function(){return this.session.getUseWrapMode()},this.destroy=function(){};}).call(a.prototype),t.Text=a;}),ace.define("ace/layer/cursor",["require","exports","module","ace/lib/dom"],function(e,t,n){var r=e("../lib/dom"),i=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_cursor-layer",e.appendChild(this.element),this.isVisible=!1,this.isBlinking=!0,this.blinkInterval=1e3,this.smoothBlinking=!1,this.cursors=[],this.cursor=this.addCursor(),r.addCssClass(this.element,"ace_hidden-cursors"),this.$updateCursors=this.$updateOpacity.bind(this);};(function(){this.$updateOpacity=function(e){var t=this.cursors;for(var n=t.length;n--;)r.setStyle(t[n].style,"opacity",e?"":"0");},this.$startCssAnimation=function(){var e=this.cursors;for(var t=e.length;t--;)e[t].style.animationDuration=this.blinkInterval+"ms";setTimeout(function(){r.addCssClass(this.element,"ace_animate-blinking");}.bind(this));},this.$stopCssAnimation=function(){r.removeCssClass(this.element,"ace_animate-blinking");},this.$padding=0,this.setPadding=function(e){this.$padding=e;},this.setSession=function(e){this.session=e;},this.setBlinking=function(e){e!=this.isBlinking&&(this.isBlinking=e,this.restartTimer());},this.setBlinkInterval=function(e){e!=this.blinkInterval&&(this.blinkInterval=e,this.restartTimer());},this.setSmoothBlinking=function(e){e!=this.smoothBlinking&&(this.smoothBlinking=e,r.setCssClass(this.element,"ace_smooth-blinking",e),this.$updateCursors(!0),this.restartTimer());},this.addCursor=function(){var e=r.createElement("div");return e.className="ace_cursor",this.element.appendChild(e),this.cursors.push(e),e},this.removeCursor=function(){if(this.cursors.length>1){var e=this.cursors.pop();return e.parentNode.removeChild(e),e}},this.hideCursor=function(){this.isVisible=!1,r.addCssClass(this.element,"ace_hidden-cursors"),this.restartTimer();},this.showCursor=function(){this.isVisible=!0,r.removeCssClass(this.element,"ace_hidden-cursors"),this.restartTimer();},this.restartTimer=function(){var e=this.$updateCursors;clearInterval(this.intervalId),clearTimeout(this.timeoutId),this.$stopCssAnimation(),this.smoothBlinking&&r.removeCssClass(this.element,"ace_smooth-blinking"),e(!0);if(!this.isBlinking||!this.blinkInterval||!this.isVisible){this.$stopCssAnimation();return}this.smoothBlinking&&setTimeout(function(){r.addCssClass(this.element,"ace_smooth-blinking");}.bind(this));if(r.HAS_CSS_ANIMATION)this.$startCssAnimation();else {var t=function(){this.timeoutId=setTimeout(function(){e(!1);},.6*this.blinkInterval);}.bind(this);this.intervalId=setInterval(function(){e(!0),t();},this.blinkInterval),t();}},this.getPixelPosition=function(e,t){if(!this.config||!this.session)return {left:0,top:0};e||(e=this.session.selection.getCursor());var n=this.session.documentToScreenPosition(e),r=this.$padding+(this.session.$bidiHandler.isBidiRow(n.row,e.row)?this.session.$bidiHandler.getPosLeft(n.column):n.column*this.config.characterWidth),i=(n.row-(t?this.config.firstRowScreen:0))*this.config.lineHeight;return {left:r,top:i}},this.isCursorInView=function(e,t){return e.top>=0&&e.top<t.maxHeight},this.update=function(e){this.config=e;var t=this.session.$selectionMarkers,n=0,i=0;if(t===undefined||t.length===0)t=[{cursor:null}];for(var n=0,s=t.length;n<s;n++){var o=this.getPixelPosition(t[n].cursor,!0);if((o.top>e.height+e.offset||o.top<0)&&n>1)continue;var u=this.cursors[i++]||this.addCursor(),a=u.style;this.drawCursor?this.drawCursor(u,o,e,t[n],this.session):this.isCursorInView(o,e)?(r.setStyle(a,"display","block"),r.translate(u,o.left,o.top),r.setStyle(a,"width",Math.round(e.characterWidth)+"px"),r.setStyle(a,"height",e.lineHeight+"px")):r.setStyle(a,"display","none");}while(this.cursors.length>i)this.removeCursor();var f=this.session.getOverwrite();this.$setOverwrite(f),this.$pixelPos=o,this.restartTimer();},this.drawCursor=null,this.$setOverwrite=function(e){e!=this.overwrite&&(this.overwrite=e,e?r.addCssClass(this.element,"ace_overwrite-cursors"):r.removeCssClass(this.element,"ace_overwrite-cursors"));},this.destroy=function(){clearInterval(this.intervalId),clearTimeout(this.timeoutId);};}).call(i.prototype),t.Cursor=i;}),ace.define("ace/scrollbar",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/event","ace/lib/event_emitter"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/event"),o=e("./lib/event_emitter").EventEmitter,u=32768,a=function(e){this.element=i.createElement("div"),this.element.className="ace_scrollbar ace_scrollbar"+this.classSuffix,this.inner=i.createElement("div"),this.inner.className="ace_scrollbar-inner",this.inner.textContent="\u00a0",this.element.appendChild(this.inner),e.appendChild(this.element),this.setVisible(!1),this.skipEvent=!1,s.addListener(this.element,"scroll",this.onScroll.bind(this)),s.addListener(this.element,"mousedown",s.preventDefault);};(function(){r.implement(this,o),this.setVisible=function(e){this.element.style.display=e?"":"none",this.isVisible=e,this.coeff=1;};}).call(a.prototype);var f=function(e,t){a.call(this,e),this.scrollTop=0,this.scrollHeight=0,t.$scrollbarWidth=this.width=i.scrollbarWidth(e.ownerDocument),this.inner.style.width=this.element.style.width=(this.width||15)+5+"px",this.$minWidth=0;};r.inherits(f,a),function(){this.classSuffix="-v",this.onScroll=function(){if(!this.skipEvent){this.scrollTop=this.element.scrollTop;if(this.coeff!=1){var e=this.element.clientHeight/this.scrollHeight;this.scrollTop=this.scrollTop*(1-e)/(this.coeff-e);}this._emit("scroll",{data:this.scrollTop});}this.skipEvent=!1;},this.getWidth=function(){return Math.max(this.isVisible?this.width:0,this.$minWidth||0)},this.setHeight=function(e){this.element.style.height=e+"px";},this.setInnerHeight=this.setScrollHeight=function(e){this.scrollHeight=e,e>u?(this.coeff=u/e,e=u):this.coeff!=1&&(this.coeff=1),this.inner.style.height=e+"px";},this.setScrollTop=function(e){this.scrollTop!=e&&(this.skipEvent=!0,this.scrollTop=e,this.element.scrollTop=e*this.coeff);};}.call(f.prototype);var l=function(e,t){a.call(this,e),this.scrollLeft=0,this.height=t.$scrollbarWidth,this.inner.style.height=this.element.style.height=(this.height||15)+5+"px";};r.inherits(l,a),function(){this.classSuffix="-h",this.onScroll=function(){this.skipEvent||(this.scrollLeft=this.element.scrollLeft,this._emit("scroll",{data:this.scrollLeft})),this.skipEvent=!1;},this.getHeight=function(){return this.isVisible?this.height:0},this.setWidth=function(e){this.element.style.width=e+"px";},this.setInnerWidth=function(e){this.inner.style.width=e+"px";},this.setScrollWidth=function(e){this.inner.style.width=e+"px";},this.setScrollLeft=function(e){this.scrollLeft!=e&&(this.skipEvent=!0,this.scrollLeft=this.element.scrollLeft=e);};}.call(l.prototype),t.ScrollBar=f,t.ScrollBarV=f,t.ScrollBarH=l,t.VScrollBar=f,t.HScrollBar=l;}),ace.define("ace/renderloop",["require","exports","module","ace/lib/event"],function(e,t,n){var r=e("./lib/event"),i=function(e,t){this.onRender=e,this.pending=!1,this.changes=0,this.$recursionLimit=2,this.window=t||window;var n=this;this._flush=function(e){n.pending=!1;var t=n.changes;t&&(r.blockIdle(100),n.changes=0,n.onRender(t));if(n.changes){if(n.$recursionLimit--<0)return;n.schedule();}else n.$recursionLimit=2;};};(function(){this.schedule=function(e){this.changes=this.changes|e,this.changes&&!this.pending&&(r.nextFrame(this._flush),this.pending=!0);},this.clear=function(e){var t=this.changes;return this.changes=0,t};}).call(i.prototype),t.RenderLoop=i;}),ace.define("ace/layer/font_metrics",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/event","ace/lib/useragent","ace/lib/event_emitter"],function(e,t,n){var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("../lib/event"),u=e("../lib/useragent"),a=e("../lib/event_emitter").EventEmitter,f=256,l=typeof ResizeObserver=="function",c=200,h=t.FontMetrics=function(e){this.el=i.createElement("div"),this.$setMeasureNodeStyles(this.el.style,!0),this.$main=i.createElement("div"),this.$setMeasureNodeStyles(this.$main.style),this.$measureNode=i.createElement("div"),this.$setMeasureNodeStyles(this.$measureNode.style),this.el.appendChild(this.$main),this.el.appendChild(this.$measureNode),e.appendChild(this.el),this.$measureNode.textContent=s.stringRepeat("X",f),this.$characterSize={width:0,height:0},l?this.$addObserver():this.checkForSizeChanges();};(function(){r.implement(this,a),this.$characterSize={width:0,height:0},this.$setMeasureNodeStyles=function(e,t){e.width=e.height="auto",e.left=e.top="0px",e.visibility="hidden",e.position="absolute",e.whiteSpace="pre",u.isIE<8?e["font-family"]="inherit":e.font="inherit",e.overflow=t?"hidden":"visible";},this.checkForSizeChanges=function(e){e===undefined&&(e=this.$measureSizes());if(e&&(this.$characterSize.width!==e.width||this.$characterSize.height!==e.height)){this.$measureNode.style.fontWeight="bold";var t=this.$measureSizes();this.$measureNode.style.fontWeight="",this.$characterSize=e,this.charSizes=Object.create(null),this.allowBoldFonts=t&&t.width===e.width&&t.height===e.height,this._emit("changeCharacterSize",{data:e});}},this.$addObserver=function(){var e=this;this.$observer=new window.ResizeObserver(function(t){e.checkForSizeChanges();}),this.$observer.observe(this.$measureNode);},this.$pollSizeChanges=function(){if(this.$pollSizeChangesTimer||this.$observer)return this.$pollSizeChangesTimer;var e=this;return this.$pollSizeChangesTimer=o.onIdle(function t(){e.checkForSizeChanges(),o.onIdle(t,500);},500)},this.setPolling=function(e){e?this.$pollSizeChanges():this.$pollSizeChangesTimer&&(clearInterval(this.$pollSizeChangesTimer),this.$pollSizeChangesTimer=0);},this.$measureSizes=function(e){var t={height:(e||this.$measureNode).clientHeight,width:(e||this.$measureNode).clientWidth/f};return t.width===0||t.height===0?null:t},this.$measureCharWidth=function(e){this.$main.textContent=s.stringRepeat(e,f);var t=this.$main.getBoundingClientRect();return t.width/f},this.getCharacterWidth=function(e){var t=this.charSizes[e];return t===undefined&&(t=this.charSizes[e]=this.$measureCharWidth(e)/this.$characterSize.width),t},this.destroy=function(){clearInterval(this.$pollSizeChangesTimer),this.$observer&&this.$observer.disconnect(),this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el);},this.$getZoom=function e(t){return !t||!t.parentElement?1:(window.getComputedStyle(t).zoom||1)*e(t.parentElement)},this.$initTransformMeasureNodes=function(){var e=function(e,t){return ["div",{style:"position: absolute;top:"+e+"px;left:"+t+"px;"}]};this.els=i.buildDom([e(0,0),e(c,0),e(0,c),e(c,c)],this.el);},this.transformCoordinates=function(e,t){function r(e,t,n){var r=e[1]*t[0]-e[0]*t[1];return [(-t[1]*n[0]+t[0]*n[1])/r,(+e[1]*n[0]-e[0]*n[1])/r]}function i(e,t){return [e[0]-t[0],e[1]-t[1]]}function s(e,t){return [e[0]+t[0],e[1]+t[1]]}function o(e,t){return [e*t[0],e*t[1]]}function u(e){var t=e.getBoundingClientRect();return [t.left,t.top]}if(e){var n=this.$getZoom(this.el);e=o(1/n,e);}this.els||this.$initTransformMeasureNodes();var a=u(this.els[0]),f=u(this.els[1]),l=u(this.els[2]),h=u(this.els[3]),p=r(i(h,f),i(h,l),i(s(f,l),s(h,a))),d=o(1+p[0],i(f,a)),v=o(1+p[1],i(l,a));if(t){var m=t,g=p[0]*m[0]/c+p[1]*m[1]/c+1,y=s(o(m[0],d),o(m[1],v));return s(o(1/g/c,y),a)}var b=i(e,a),w=r(i(d,o(p[0],b)),i(v,o(p[1],b)),b);return o(c,w)};}).call(h.prototype);}),ace.define("ace/virtual_renderer",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/config","ace/layer/gutter","ace/layer/marker","ace/layer/text","ace/layer/cursor","ace/scrollbar","ace/scrollbar","ace/renderloop","ace/layer/font_metrics","ace/lib/event_emitter","ace/lib/useragent"],function(e,t,n){var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./config"),o=e("./layer/gutter").Gutter,u=e("./layer/marker").Marker,a=e("./layer/text").Text,f=e("./layer/cursor").Cursor,l=e("./scrollbar").HScrollBar,c=e("./scrollbar").VScrollBar,h=e("./renderloop").RenderLoop,p=e("./layer/font_metrics").FontMetrics,d=e("./lib/event_emitter").EventEmitter,v='.ace_br1 {border-top-left-radius    : 3px;}.ace_br2 {border-top-right-radius   : 3px;}.ace_br3 {border-top-left-radius    : 3px; border-top-right-radius:    3px;}.ace_br4 {border-bottom-right-radius: 3px;}.ace_br5 {border-top-left-radius    : 3px; border-bottom-right-radius: 3px;}.ace_br6 {border-top-right-radius   : 3px; border-bottom-right-radius: 3px;}.ace_br7 {border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px;}.ace_br8 {border-bottom-left-radius : 3px;}.ace_br9 {border-top-left-radius    : 3px; border-bottom-left-radius:  3px;}.ace_br10{border-top-right-radius   : 3px; border-bottom-left-radius:  3px;}.ace_br11{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-left-radius:  3px;}.ace_br12{border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br13{border-top-left-radius    : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br14{border-top-right-radius   : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br15{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px;}.ace_editor {position: relative;overflow: hidden;padding: 0;font: 12px/normal \'Monaco\', \'Menlo\', \'Ubuntu Mono\', \'Consolas\', \'source-code-pro\', monospace;direction: ltr;text-align: left;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}.ace_scroller {position: absolute;overflow: hidden;top: 0;bottom: 0;background-color: inherit;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;cursor: text;}.ace_content {position: absolute;box-sizing: border-box;min-width: 100%;contain: style size layout;font-variant-ligatures: no-common-ligatures;}.ace_dragging .ace_scroller:before{position: absolute;top: 0;left: 0;right: 0;bottom: 0;content: \'\';background: rgba(250, 250, 250, 0.01);z-index: 1000;}.ace_dragging.ace_dark .ace_scroller:before{background: rgba(0, 0, 0, 0.01);}.ace_selecting, .ace_selecting * {cursor: text !important;}.ace_gutter {position: absolute;overflow : hidden;width: auto;top: 0;bottom: 0;left: 0;cursor: default;z-index: 4;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;contain: style size layout;}.ace_gutter-active-line {position: absolute;left: 0;right: 0;}.ace_scroller.ace_scroll-left {box-shadow: 17px 0 16px -16px rgba(0, 0, 0, 0.4) inset;}.ace_gutter-cell {position: absolute;top: 0;left: 0;right: 0;padding-left: 19px;padding-right: 6px;background-repeat: no-repeat;}.ace_gutter-cell.ace_error {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABOFBMVEX/////////QRswFAb/Ui4wFAYwFAYwFAaWGAfDRymzOSH/PxswFAb/SiUwFAYwFAbUPRvjQiDllog5HhHdRybsTi3/Tyv9Tir+Syj/UC3////XurebMBIwFAb/RSHbPx/gUzfdwL3kzMivKBAwFAbbvbnhPx66NhowFAYwFAaZJg8wFAaxKBDZurf/RB6mMxb/SCMwFAYwFAbxQB3+RB4wFAb/Qhy4Oh+4QifbNRcwFAYwFAYwFAb/QRzdNhgwFAYwFAbav7v/Uy7oaE68MBK5LxLewr/r2NXewLswFAaxJw4wFAbkPRy2PyYwFAaxKhLm1tMwFAazPiQwFAaUGAb/QBrfOx3bvrv/VC/maE4wFAbRPBq6MRO8Qynew8Dp2tjfwb0wFAbx6eju5+by6uns4uH9/f36+vr/GkHjAAAAYnRSTlMAGt+64rnWu/bo8eAA4InH3+DwoN7j4eLi4xP99Nfg4+b+/u9B/eDs1MD1mO7+4PHg2MXa347g7vDizMLN4eG+Pv7i5evs/v79yu7S3/DV7/498Yv24eH+4ufQ3Ozu/v7+y13sRqwAAADLSURBVHjaZc/XDsFgGIBhtDrshlitmk2IrbHFqL2pvXf/+78DPokj7+Fz9qpU/9UXJIlhmPaTaQ6QPaz0mm+5gwkgovcV6GZzd5JtCQwgsxoHOvJO15kleRLAnMgHFIESUEPmawB9ngmelTtipwwfASilxOLyiV5UVUyVAfbG0cCPHig+GBkzAENHS0AstVF6bacZIOzgLmxsHbt2OecNgJC83JERmePUYq8ARGkJx6XtFsdddBQgZE2nPR6CICZhawjA4Fb/chv+399kfR+MMMDGOQAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: 2px center;}.ace_gutter-cell.ace_warning {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAmVBMVEX///8AAAD///8AAAAAAABPSzb/5sAAAAB/blH/73z/ulkAAAAAAAD85pkAAAAAAAACAgP/vGz/rkDerGbGrV7/pkQICAf////e0IsAAAD/oED/qTvhrnUAAAD/yHD/njcAAADuv2r/nz//oTj/p064oGf/zHAAAAA9Nir/tFIAAAD/tlTiuWf/tkIAAACynXEAAAAAAAAtIRW7zBpBAAAAM3RSTlMAABR1m7RXO8Ln31Z36zT+neXe5OzooRDfn+TZ4p3h2hTf4t3k3ucyrN1K5+Xaks52Sfs9CXgrAAAAjklEQVR42o3PbQ+CIBQFYEwboPhSYgoYunIqqLn6/z8uYdH8Vmdnu9vz4WwXgN/xTPRD2+sgOcZjsge/whXZgUaYYvT8QnuJaUrjrHUQreGczuEafQCO/SJTufTbroWsPgsllVhq3wJEk2jUSzX3CUEDJC84707djRc5MTAQxoLgupWRwW6UB5fS++NV8AbOZgnsC7BpEAAAAABJRU5ErkJggg==");background-position: 2px center;}.ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAJ0Uk5TAAB2k804AAAAPklEQVQY02NgIB68QuO3tiLznjAwpKTgNyDbMegwisCHZUETUZV0ZqOquBpXj2rtnpSJT1AEnnRmL2OgGgAAIKkRQap2htgAAAAASUVORK5CYII=");background-position: 2px center;}.ace_dark .ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUAAAChoaGAgIAqKiq+vr6tra1ZWVmUlJSbm5s8PDxubm56enrdgzg3AAAAAXRSTlMAQObYZgAAAClJREFUeNpjYMAPdsMYHegyJZFQBlsUlMFVCWUYKkAZMxZAGdxlDMQBAG+TBP4B6RyJAAAAAElFTkSuQmCC");}.ace_scrollbar {contain: strict;position: absolute;right: 0;bottom: 0;z-index: 6;}.ace_scrollbar-inner {position: absolute;cursor: text;left: 0;top: 0;}.ace_scrollbar-v{overflow-x: hidden;overflow-y: scroll;top: 0;}.ace_scrollbar-h {overflow-x: scroll;overflow-y: hidden;left: 0;}.ace_print-margin {position: absolute;height: 100%;}.ace_text-input {position: absolute;z-index: 0;width: 0.5em;height: 1em;opacity: 0;background: transparent;-moz-appearance: none;appearance: none;border: none;resize: none;outline: none;overflow: hidden;font: inherit;padding: 0 1px;margin: 0 -1px;contain: strict;-ms-user-select: text;-moz-user-select: text;-webkit-user-select: text;user-select: text;white-space: pre!important;}.ace_text-input.ace_composition {background: transparent;color: inherit;z-index: 1000;opacity: 1;}.ace_composition_placeholder { color: transparent }.ace_composition_marker { border-bottom: 1px solid;position: absolute;border-radius: 0;margin-top: 1px;}[ace_nocontext=true] {transform: none!important;filter: none!important;clip-path: none!important;mask : none!important;contain: none!important;perspective: none!important;mix-blend-mode: initial!important;z-index: auto;}.ace_layer {z-index: 1;position: absolute;overflow: hidden;word-wrap: normal;white-space: pre;height: 100%;width: 100%;box-sizing: border-box;pointer-events: none;}.ace_gutter-layer {position: relative;width: auto;text-align: right;pointer-events: auto;height: 1000000px;contain: style size layout;}.ace_text-layer {font: inherit !important;position: absolute;height: 1000000px;width: 1000000px;contain: style size layout;}.ace_text-layer > .ace_line, .ace_text-layer > .ace_line_group {contain: style size layout;position: absolute;top: 0;left: 0;right: 0;}.ace_hidpi .ace_text-layer,.ace_hidpi .ace_gutter-layer,.ace_hidpi .ace_content,.ace_hidpi .ace_gutter {contain: strict;will-change: transform;}.ace_hidpi .ace_text-layer > .ace_line, .ace_hidpi .ace_text-layer > .ace_line_group {contain: strict;}.ace_cjk {display: inline-block;text-align: center;}.ace_cursor-layer {z-index: 4;}.ace_cursor {z-index: 4;position: absolute;box-sizing: border-box;border-left: 2px solid;transform: translatez(0);}.ace_multiselect .ace_cursor {border-left-width: 1px;}.ace_slim-cursors .ace_cursor {border-left-width: 1px;}.ace_overwrite-cursors .ace_cursor {border-left-width: 0;border-bottom: 1px solid;}.ace_hidden-cursors .ace_cursor {opacity: 0.2;}.ace_hasPlaceholder .ace_hidden-cursors .ace_cursor {opacity: 0;}.ace_smooth-blinking .ace_cursor {transition: opacity 0.18s;}.ace_animate-blinking .ace_cursor {animation-duration: 1000ms;animation-timing-function: step-end;animation-name: blink-ace-animate;animation-iteration-count: infinite;}.ace_animate-blinking.ace_smooth-blinking .ace_cursor {animation-duration: 1000ms;animation-timing-function: ease-in-out;animation-name: blink-ace-animate-smooth;}@keyframes blink-ace-animate {from, to { opacity: 1; }60% { opacity: 0; }}@keyframes blink-ace-animate-smooth {from, to { opacity: 1; }45% { opacity: 1; }60% { opacity: 0; }85% { opacity: 0; }}.ace_marker-layer .ace_step, .ace_marker-layer .ace_stack {position: absolute;z-index: 3;}.ace_marker-layer .ace_selection {position: absolute;z-index: 5;}.ace_marker-layer .ace_bracket {position: absolute;z-index: 6;}.ace_marker-layer .ace_error_bracket {position: absolute;border-bottom: 1px solid #DE5555;border-radius: 0;}.ace_marker-layer .ace_active-line {position: absolute;z-index: 2;}.ace_marker-layer .ace_selected-word {position: absolute;z-index: 4;box-sizing: border-box;}.ace_line .ace_fold {box-sizing: border-box;display: inline-block;height: 11px;margin-top: -2px;vertical-align: middle;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACJJREFUeNpi+P//fxgTAwPDBxDxD078RSX+YeEyDFMCIMAAI3INmXiwf2YAAAAASUVORK5CYII=");background-repeat: no-repeat, repeat-x;background-position: center center, top left;color: transparent;border: 1px solid black;border-radius: 2px;cursor: pointer;pointer-events: auto;}.ace_dark .ace_fold {}.ace_fold:hover{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACBJREFUeNpi+P//fz4TAwPDZxDxD5X4i5fLMEwJgAADAEPVDbjNw87ZAAAAAElFTkSuQmCC");}.ace_tooltip {background-color: #FFF;background-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));border: 1px solid gray;border-radius: 1px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);color: black;max-width: 100%;padding: 3px 4px;position: fixed;z-index: 999999;box-sizing: border-box;cursor: default;white-space: pre;word-wrap: break-word;line-height: normal;font-style: normal;font-weight: normal;letter-spacing: normal;pointer-events: none;}.ace_folding-enabled > .ace_gutter-cell {padding-right: 13px;}.ace_fold-widget {box-sizing: border-box;margin: 0 -12px 0 1px;display: none;width: 11px;vertical-align: top;background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42mWKsQ0AMAzC8ixLlrzQjzmBiEjp0A6WwBCSPgKAXoLkqSot7nN3yMwR7pZ32NzpKkVoDBUxKAAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: center;border-radius: 3px;border: 1px solid transparent;cursor: pointer;}.ace_folding-enabled .ace_fold-widget {display: inline-block;   }.ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42m3HwQkAMAhD0YzsRchFKI7sAikeWkrxwScEB0nh5e7KTPWimZki4tYfVbX+MNl4pyZXejUO1QAAAABJRU5ErkJggg==");}.ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAGCAYAAAAG5SQMAAAAOUlEQVR42jXKwQkAMAgDwKwqKD4EwQ26sSOkVWjgIIHAzPiCgaqiqnJHZnKICBERHN194O5b9vbLuAVRL+l0YWnZAAAAAElFTkSuQmCCXA==");}.ace_fold-widget:hover {border: 1px solid rgba(0, 0, 0, 0.3);background-color: rgba(255, 255, 255, 0.2);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);}.ace_fold-widget:active {border: 1px solid rgba(0, 0, 0, 0.4);background-color: rgba(0, 0, 0, 0.05);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);}.ace_dark .ace_fold-widget {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHklEQVQIW2P4//8/AzoGEQ7oGCaLLAhWiSwB146BAQCSTPYocqT0AAAAAElFTkSuQmCC");}.ace_dark .ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH0lEQVQIW2P4//8/AxQ7wNjIAjDMgC4AxjCVKBirIAAF0kz2rlhxpAAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAFCAYAAACAcVaiAAAAHElEQVQIW2P4//+/AxAzgDADlOOAznHAKgPWAwARji8UIDTfQQAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget:hover {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);background-color: rgba(255, 255, 255, 0.1);}.ace_dark .ace_fold-widget:active {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);}.ace_inline_button {border: 1px solid lightgray;display: inline-block;margin: -1px 8px;padding: 0 5px;pointer-events: auto;cursor: pointer;}.ace_inline_button:hover {border-color: gray;background: rgba(200,200,200,0.2);display: inline-block;pointer-events: auto;}.ace_fold-widget.ace_invalid {background-color: #FFB4B4;border-color: #DE5555;}.ace_fade-fold-widgets .ace_fold-widget {transition: opacity 0.4s ease 0.05s;opacity: 0;}.ace_fade-fold-widgets:hover .ace_fold-widget {transition: opacity 0.05s ease 0.05s;opacity:1;}.ace_underline {text-decoration: underline;}.ace_bold {font-weight: bold;}.ace_nobold .ace_bold {font-weight: normal;}.ace_italic {font-style: italic;}.ace_error-marker {background-color: rgba(255, 0, 0,0.2);position: absolute;z-index: 9;}.ace_highlight-marker {background-color: rgba(255, 255, 0,0.2);position: absolute;z-index: 8;}.ace_mobile-menu {position: absolute;line-height: 1.5;border-radius: 4px;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;background: white;box-shadow: 1px 3px 2px grey;border: 1px solid #dcdcdc;color: black;}.ace_dark > .ace_mobile-menu {background: #333;color: #ccc;box-shadow: 1px 3px 2px grey;border: 1px solid #444;}.ace_mobile-button {padding: 2px;cursor: pointer;overflow: hidden;}.ace_mobile-button:hover {background-color: #eee;opacity:1;}.ace_mobile-button:active {background-color: #ddd;}.ace_placeholder {font-family: arial;transform: scale(0.9);transform-origin: left;white-space: pre;opacity: 0.7;margin: 0 10px;}',m=e("./lib/useragent"),g=m.isIE;i.importCssString(v,"ace_editor.css");var y=function(e,t){var n=this;this.container=e||i.createElement("div"),i.addCssClass(this.container,"ace_editor"),i.HI_DPI&&i.addCssClass(this.container,"ace_hidpi"),this.setTheme(t),this.$gutter=i.createElement("div"),this.$gutter.className="ace_gutter",this.container.appendChild(this.$gutter),this.$gutter.setAttribute("aria-hidden",!0),this.scroller=i.createElement("div"),this.scroller.className="ace_scroller",this.container.appendChild(this.scroller),this.content=i.createElement("div"),this.content.className="ace_content",this.scroller.appendChild(this.content),this.$gutterLayer=new o(this.$gutter),this.$gutterLayer.on("changeGutterWidth",this.onGutterResize.bind(this)),this.$markerBack=new u(this.content);var r=this.$textLayer=new a(this.content);this.canvas=r.element,this.$markerFront=new u(this.content),this.$cursorLayer=new f(this.content),this.$horizScroll=!1,this.$vScroll=!1,this.scrollBar=this.scrollBarV=new c(this.container,this),this.scrollBarH=new l(this.container,this),this.scrollBarV.on("scroll",function(e){n.$scrollAnimation||n.session.setScrollTop(e.data-n.scrollMargin.top);}),this.scrollBarH.on("scroll",function(e){n.$scrollAnimation||n.session.setScrollLeft(e.data-n.scrollMargin.left);}),this.scrollTop=0,this.scrollLeft=0,this.cursorPos={row:0,column:0},this.$fontMetrics=new p(this.container),this.$textLayer.$setFontMetrics(this.$fontMetrics),this.$textLayer.on("changeCharacterSize",function(e){n.updateCharacterSize(),n.onResize(!0,n.gutterWidth,n.$size.width,n.$size.height),n._signal("changeCharacterSize",e);}),this.$size={width:0,height:0,scrollerHeight:0,scrollerWidth:0,$dirty:!0},this.layerConfig={width:1,padding:0,firstRow:0,firstRowScreen:0,lastRow:0,lineHeight:0,characterWidth:0,minHeight:1,maxHeight:1,offset:0,height:1,gutterOffset:1},this.scrollMargin={left:0,right:0,top:0,bottom:0,v:0,h:0},this.margin={left:0,right:0,top:0,bottom:0,v:0,h:0},this.$keepTextAreaAtCursor=!m.isIOS,this.$loop=new h(this.$renderChanges.bind(this),this.container.ownerDocument.defaultView),this.$loop.schedule(this.CHANGE_FULL),this.updateCharacterSize(),this.setPadding(4),s.resetOptions(this),s._signal("renderer",this);};(function(){this.CHANGE_CURSOR=1,this.CHANGE_MARKER=2,this.CHANGE_GUTTER=4,this.CHANGE_SCROLL=8,this.CHANGE_LINES=16,this.CHANGE_TEXT=32,this.CHANGE_SIZE=64,this.CHANGE_MARKER_BACK=128,this.CHANGE_MARKER_FRONT=256,this.CHANGE_FULL=512,this.CHANGE_H_SCROLL=1024,r.implement(this,d),this.updateCharacterSize=function(){this.$textLayer.allowBoldFonts!=this.$allowBoldFonts&&(this.$allowBoldFonts=this.$textLayer.allowBoldFonts,this.setStyle("ace_nobold",!this.$allowBoldFonts)),this.layerConfig.characterWidth=this.characterWidth=this.$textLayer.getCharacterWidth(),this.layerConfig.lineHeight=this.lineHeight=this.$textLayer.getLineHeight(),this.$updatePrintMargin(),i.setStyle(this.scroller.style,"line-height",this.lineHeight+"px");},this.setSession=function(e){this.session&&this.session.doc.off("changeNewLineMode",this.onChangeNewLineMode),this.session=e,e&&this.scrollMargin.top&&e.getScrollTop()<=0&&e.setScrollTop(-this.scrollMargin.top),this.$cursorLayer.setSession(e),this.$markerBack.setSession(e),this.$markerFront.setSession(e),this.$gutterLayer.setSession(e),this.$textLayer.setSession(e);if(!e)return;this.$loop.schedule(this.CHANGE_FULL),this.session.$setFontMetrics(this.$fontMetrics),this.scrollBarH.scrollLeft=this.scrollBarV.scrollTop=null,this.onChangeNewLineMode=this.onChangeNewLineMode.bind(this),this.onChangeNewLineMode(),this.session.doc.on("changeNewLineMode",this.onChangeNewLineMode);},this.updateLines=function(e,t,n){t===undefined&&(t=Infinity),this.$changedLines?(this.$changedLines.firstRow>e&&(this.$changedLines.firstRow=e),this.$changedLines.lastRow<t&&(this.$changedLines.lastRow=t)):this.$changedLines={firstRow:e,lastRow:t};if(this.$changedLines.lastRow<this.layerConfig.firstRow){if(!n)return;this.$changedLines.lastRow=this.layerConfig.lastRow;}if(this.$changedLines.firstRow>this.layerConfig.lastRow)return;this.$loop.schedule(this.CHANGE_LINES);},this.onChangeNewLineMode=function(){this.$loop.schedule(this.CHANGE_TEXT),this.$textLayer.$updateEolChar(),this.session.$bidiHandler.setEolChar(this.$textLayer.EOL_CHAR);},this.onChangeTabSize=function(){this.$loop.schedule(this.CHANGE_TEXT|this.CHANGE_MARKER),this.$textLayer.onChangeTabSize();},this.updateText=function(){this.$loop.schedule(this.CHANGE_TEXT);},this.updateFull=function(e){e?this.$renderChanges(this.CHANGE_FULL,!0):this.$loop.schedule(this.CHANGE_FULL);},this.updateFontSize=function(){this.$textLayer.checkForSizeChanges();},this.$changes=0,this.$updateSizeAsync=function(){this.$loop.pending?this.$size.$dirty=!0:this.onResize();},this.onResize=function(e,t,n,r){if(this.resizing>2)return;this.resizing>0?this.resizing++:this.resizing=e?1:0;var i=this.container;r||(r=i.clientHeight||i.scrollHeight),n||(n=i.clientWidth||i.scrollWidth);var s=this.$updateCachedSize(e,t,n,r);if(!this.$size.scrollerHeight||!n&&!r)return this.resizing=0;e&&(this.$gutterLayer.$padding=null),e?this.$renderChanges(s|this.$changes,!0):this.$loop.schedule(s|this.$changes),this.resizing&&(this.resizing=0),this.scrollBarV.scrollLeft=this.scrollBarV.scrollTop=null;},this.$updateCachedSize=function(e,t,n,r){r-=this.$extraHeight||0;var s=0,o=this.$size,u={width:o.width,height:o.height,scrollerHeight:o.scrollerHeight,scrollerWidth:o.scrollerWidth};r&&(e||o.height!=r)&&(o.height=r,s|=this.CHANGE_SIZE,o.scrollerHeight=o.height,this.$horizScroll&&(o.scrollerHeight-=this.scrollBarH.getHeight()),this.scrollBarV.element.style.bottom=this.scrollBarH.getHeight()+"px",s|=this.CHANGE_SCROLL);if(n&&(e||o.width!=n)){s|=this.CHANGE_SIZE,o.width=n,t==null&&(t=this.$showGutter?this.$gutter.offsetWidth:0),this.gutterWidth=t,i.setStyle(this.scrollBarH.element.style,"left",t+"px"),i.setStyle(this.scroller.style,"left",t+this.margin.left+"px"),o.scrollerWidth=Math.max(0,n-t-this.scrollBarV.getWidth()-this.margin.h),i.setStyle(this.$gutter.style,"left",this.margin.left+"px");var a=this.scrollBarV.getWidth()+"px";i.setStyle(this.scrollBarH.element.style,"right",a),i.setStyle(this.scroller.style,"right",a),i.setStyle(this.scroller.style,"bottom",this.scrollBarH.getHeight());if(this.session&&this.session.getUseWrapMode()&&this.adjustWrapLimit()||e)s|=this.CHANGE_FULL;}return o.$dirty=!n||!r,s&&this._signal("resize",u),s},this.onGutterResize=function(e){var t=this.$showGutter?e:0;t!=this.gutterWidth&&(this.$changes|=this.$updateCachedSize(!0,t,this.$size.width,this.$size.height)),this.session.getUseWrapMode()&&this.adjustWrapLimit()?this.$loop.schedule(this.CHANGE_FULL):this.$size.$dirty?this.$loop.schedule(this.CHANGE_FULL):this.$computeLayerConfig();},this.adjustWrapLimit=function(){var e=this.$size.scrollerWidth-this.$padding*2,t=Math.floor(e/this.characterWidth);return this.session.adjustWrapLimit(t,this.$showPrintMargin&&this.$printMarginColumn)},this.setAnimatedScroll=function(e){this.setOption("animatedScroll",e);},this.getAnimatedScroll=function(){return this.$animatedScroll},this.setShowInvisibles=function(e){this.setOption("showInvisibles",e),this.session.$bidiHandler.setShowInvisibles(e);},this.getShowInvisibles=function(){return this.getOption("showInvisibles")},this.getDisplayIndentGuides=function(){return this.getOption("displayIndentGuides")},this.setDisplayIndentGuides=function(e){this.setOption("displayIndentGuides",e);},this.setShowPrintMargin=function(e){this.setOption("showPrintMargin",e);},this.getShowPrintMargin=function(){return this.getOption("showPrintMargin")},this.setPrintMarginColumn=function(e){this.setOption("printMarginColumn",e);},this.getPrintMarginColumn=function(){return this.getOption("printMarginColumn")},this.getShowGutter=function(){return this.getOption("showGutter")},this.setShowGutter=function(e){return this.setOption("showGutter",e)},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e);},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e);},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.$updatePrintMargin=function(){if(!this.$showPrintMargin&&!this.$printMarginEl)return;if(!this.$printMarginEl){var e=i.createElement("div");e.className="ace_layer ace_print-margin-layer",this.$printMarginEl=i.createElement("div"),this.$printMarginEl.className="ace_print-margin",e.appendChild(this.$printMarginEl),this.content.insertBefore(e,this.content.firstChild);}var t=this.$printMarginEl.style;t.left=Math.round(this.characterWidth*this.$printMarginColumn+this.$padding)+"px",t.visibility=this.$showPrintMargin?"visible":"hidden",this.session&&this.session.$wrap==-1&&this.adjustWrapLimit();},this.getContainerElement=function(){return this.container},this.getMouseEventTarget=function(){return this.scroller},this.getTextAreaContainer=function(){return this.container},this.$moveTextAreaToCursor=function(){if(this.$isMousePressed)return;var e=this.textarea.style,t=this.$composition;if(!this.$keepTextAreaAtCursor&&!t){i.translate(this.textarea,-100,0);return}var n=this.$cursorLayer.$pixelPos;if(!n)return;t&&t.markerRange&&(n=this.$cursorLayer.getPixelPosition(t.markerRange.start,!0));var r=this.layerConfig,s=n.top,o=n.left;s-=r.offset;var u=t&&t.useTextareaForIME?this.lineHeight:g?0:1;if(s<0||s>r.height-u){i.translate(this.textarea,0,0);return}var a=1,f=this.$size.height-u;if(!t)s+=this.lineHeight;else if(t.useTextareaForIME){var l=this.textarea.value;a=this.characterWidth*this.session.$getStringScreenWidth(l)[0];}else s+=this.lineHeight+2;o-=this.scrollLeft,o>this.$size.scrollerWidth-a&&(o=this.$size.scrollerWidth-a),o+=this.gutterWidth+this.margin.left,i.setStyle(e,"height",u+"px"),i.setStyle(e,"width",a+"px"),i.translate(this.textarea,Math.min(o,this.$size.scrollerWidth-a),Math.min(s,f));},this.getFirstVisibleRow=function(){return this.layerConfig.firstRow},this.getFirstFullyVisibleRow=function(){return this.layerConfig.firstRow+(this.layerConfig.offset===0?0:1)},this.getLastFullyVisibleRow=function(){var e=this.layerConfig,t=e.lastRow,n=this.session.documentToScreenRow(t,0)*e.lineHeight;return n-this.session.getScrollTop()>e.height-e.lineHeight?t-1:t},this.getLastVisibleRow=function(){return this.layerConfig.lastRow},this.$padding=null,this.setPadding=function(e){this.$padding=e,this.$textLayer.setPadding(e),this.$cursorLayer.setPadding(e),this.$markerFront.setPadding(e),this.$markerBack.setPadding(e),this.$loop.schedule(this.CHANGE_FULL),this.$updatePrintMargin();},this.setScrollMargin=function(e,t,n,r){var i=this.scrollMargin;i.top=e|0,i.bottom=t|0,i.right=r|0,i.left=n|0,i.v=i.top+i.bottom,i.h=i.left+i.right,i.top&&this.scrollTop<=0&&this.session&&this.session.setScrollTop(-i.top),this.updateFull();},this.setMargin=function(e,t,n,r){var i=this.margin;i.top=e|0,i.bottom=t|0,i.right=r|0,i.left=n|0,i.v=i.top+i.bottom,i.h=i.left+i.right,this.$updateCachedSize(!0,this.gutterWidth,this.$size.width,this.$size.height),this.updateFull();},this.getHScrollBarAlwaysVisible=function(){return this.$hScrollBarAlwaysVisible},this.setHScrollBarAlwaysVisible=function(e){this.setOption("hScrollBarAlwaysVisible",e);},this.getVScrollBarAlwaysVisible=function(){return this.$vScrollBarAlwaysVisible},this.setVScrollBarAlwaysVisible=function(e){this.setOption("vScrollBarAlwaysVisible",e);},this.$updateScrollBarV=function(){var e=this.layerConfig.maxHeight,t=this.$size.scrollerHeight;!this.$maxLines&&this.$scrollPastEnd&&(e-=(t-this.lineHeight)*this.$scrollPastEnd,this.scrollTop>e-t&&(e=this.scrollTop+t,this.scrollBarV.scrollTop=null)),this.scrollBarV.setScrollHeight(e+this.scrollMargin.v),this.scrollBarV.setScrollTop(this.scrollTop+this.scrollMargin.top);},this.$updateScrollBarH=function(){this.scrollBarH.setScrollWidth(this.layerConfig.width+2*this.$padding+this.scrollMargin.h),this.scrollBarH.setScrollLeft(this.scrollLeft+this.scrollMargin.left);},this.$frozen=!1,this.freeze=function(){this.$frozen=!0;},this.unfreeze=function(){this.$frozen=!1;},this.$renderChanges=function(e,t){this.$changes&&(e|=this.$changes,this.$changes=0);if(!this.session||!this.container.offsetWidth||this.$frozen||!e&&!t){this.$changes|=e;return}if(this.$size.$dirty)return this.$changes|=e,this.onResize(!0);this.lineHeight||this.$textLayer.checkForSizeChanges(),this._signal("beforeRender",e),this.session&&this.session.$bidiHandler&&this.session.$bidiHandler.updateCharacterWidths(this.$fontMetrics);var n=this.layerConfig;if(e&this.CHANGE_FULL||e&this.CHANGE_SIZE||e&this.CHANGE_TEXT||e&this.CHANGE_LINES||e&this.CHANGE_SCROLL||e&this.CHANGE_H_SCROLL){e|=this.$computeLayerConfig()|this.$loop.clear();if(n.firstRow!=this.layerConfig.firstRow&&n.firstRowScreen==this.layerConfig.firstRowScreen){var r=this.scrollTop+(n.firstRow-this.layerConfig.firstRow)*this.lineHeight;r>0&&(this.scrollTop=r,e|=this.CHANGE_SCROLL,e|=this.$computeLayerConfig()|this.$loop.clear());}n=this.layerConfig,this.$updateScrollBarV(),e&this.CHANGE_H_SCROLL&&this.$updateScrollBarH(),i.translate(this.content,-this.scrollLeft,-n.offset);var s=n.width+2*this.$padding+"px",o=n.minHeight+"px";i.setStyle(this.content.style,"width",s),i.setStyle(this.content.style,"height",o);}e&this.CHANGE_H_SCROLL&&(i.translate(this.content,-this.scrollLeft,-n.offset),this.scroller.className=this.scrollLeft<=0?"ace_scroller":"ace_scroller ace_scroll-left");if(e&this.CHANGE_FULL){this.$changedLines=null,this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this._signal("afterRender",e);return}if(e&this.CHANGE_SCROLL){this.$changedLines=null,e&this.CHANGE_TEXT||e&this.CHANGE_LINES?this.$textLayer.update(n):this.$textLayer.scrollLines(n),this.$showGutter&&(e&this.CHANGE_GUTTER||e&this.CHANGE_LINES?this.$gutterLayer.update(n):this.$gutterLayer.scrollLines(n)),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this._signal("afterRender",e);return}e&this.CHANGE_TEXT?(this.$changedLines=null,this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n)):e&this.CHANGE_LINES?(this.$updateLines()||e&this.CHANGE_GUTTER&&this.$showGutter)&&this.$gutterLayer.update(n):e&this.CHANGE_TEXT||e&this.CHANGE_GUTTER?this.$showGutter&&this.$gutterLayer.update(n):e&this.CHANGE_CURSOR&&this.$highlightGutterLine&&this.$gutterLayer.updateLineHighlight(n),e&this.CHANGE_CURSOR&&(this.$cursorLayer.update(n),this.$moveTextAreaToCursor()),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_FRONT)&&this.$markerFront.update(n),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_BACK)&&this.$markerBack.update(n),this._signal("afterRender",e);},this.$autosize=function(){var e=this.session.getScreenLength()*this.lineHeight,t=this.$maxLines*this.lineHeight,n=Math.min(t,Math.max((this.$minLines||1)*this.lineHeight,e))+this.scrollMargin.v+(this.$extraHeight||0);this.$horizScroll&&(n+=this.scrollBarH.getHeight()),this.$maxPixelHeight&&n>this.$maxPixelHeight&&(n=this.$maxPixelHeight);var r=n<=2*this.lineHeight,i=!r&&e>t;if(n!=this.desiredHeight||this.$size.height!=this.desiredHeight||i!=this.$vScroll){i!=this.$vScroll&&(this.$vScroll=i,this.scrollBarV.setVisible(i));var s=this.container.clientWidth;this.container.style.height=n+"px",this.$updateCachedSize(!0,this.$gutterWidth,s,n),this.desiredHeight=n,this._signal("autosize");}},this.$computeLayerConfig=function(){var e=this.session,t=this.$size,n=t.height<=2*this.lineHeight,r=this.session.getScreenLength(),i=r*this.lineHeight,s=this.$getLongestLine(),o=!n&&(this.$hScrollBarAlwaysVisible||t.scrollerWidth-s-2*this.$padding<0),u=this.$horizScroll!==o;u&&(this.$horizScroll=o,this.scrollBarH.setVisible(o));var a=this.$vScroll;this.$maxLines&&this.lineHeight>1&&this.$autosize();var f=t.scrollerHeight+this.lineHeight,l=!this.$maxLines&&this.$scrollPastEnd?(t.scrollerHeight-this.lineHeight)*this.$scrollPastEnd:0;i+=l;var c=this.scrollMargin;this.session.setScrollTop(Math.max(-c.top,Math.min(this.scrollTop,i-t.scrollerHeight+c.bottom))),this.session.setScrollLeft(Math.max(-c.left,Math.min(this.scrollLeft,s+2*this.$padding-t.scrollerWidth+c.right)));var h=!n&&(this.$vScrollBarAlwaysVisible||t.scrollerHeight-i+l<0||this.scrollTop>c.top),p=a!==h;p&&(this.$vScroll=h,this.scrollBarV.setVisible(h));var d=this.scrollTop%this.lineHeight,v=Math.ceil(f/this.lineHeight)-1,m=Math.max(0,Math.round((this.scrollTop-d)/this.lineHeight)),g=m+v,y,b,w=this.lineHeight;m=e.screenToDocumentRow(m,0);var E=e.getFoldLine(m);E&&(m=E.start.row),y=e.documentToScreenRow(m,0),b=e.getRowLength(m)*w,g=Math.min(e.screenToDocumentRow(g,0),e.getLength()-1),f=t.scrollerHeight+e.getRowLength(g)*w+b,d=this.scrollTop-y*w;var S=0;if(this.layerConfig.width!=s||u)S=this.CHANGE_H_SCROLL;if(u||p)S|=this.$updateCachedSize(!0,this.gutterWidth,t.width,t.height),this._signal("scrollbarVisibilityChanged"),p&&(s=this.$getLongestLine());return this.layerConfig={width:s,padding:this.$padding,firstRow:m,firstRowScreen:y,lastRow:g,lineHeight:w,characterWidth:this.characterWidth,minHeight:f,maxHeight:i,offset:d,gutterOffset:w?Math.max(0,Math.ceil((d+t.height-t.scrollerHeight)/w)):0,height:this.$size.scrollerHeight},this.session.$bidiHandler&&this.session.$bidiHandler.setContentWidth(s-this.$padding),S},this.$updateLines=function(){if(!this.$changedLines)return;var e=this.$changedLines.firstRow,t=this.$changedLines.lastRow;this.$changedLines=null;var n=this.layerConfig;if(e>n.lastRow+1)return;if(t<n.firstRow)return;if(t===Infinity){this.$showGutter&&this.$gutterLayer.update(n),this.$textLayer.update(n);return}return this.$textLayer.updateLines(n,e,t),!0},this.$getLongestLine=function(){var e=this.session.getScreenWidth();return this.showInvisibles&&!this.session.$useWrapMode&&(e+=1),this.$textLayer&&e>this.$textLayer.MAX_LINE_LENGTH&&(e=this.$textLayer.MAX_LINE_LENGTH+30),Math.max(this.$size.scrollerWidth-2*this.$padding,Math.round(e*this.characterWidth))},this.updateFrontMarkers=function(){this.$markerFront.setMarkers(this.session.getMarkers(!0)),this.$loop.schedule(this.CHANGE_MARKER_FRONT);},this.updateBackMarkers=function(){this.$markerBack.setMarkers(this.session.getMarkers()),this.$loop.schedule(this.CHANGE_MARKER_BACK);},this.addGutterDecoration=function(e,t){this.$gutterLayer.addGutterDecoration(e,t);},this.removeGutterDecoration=function(e,t){this.$gutterLayer.removeGutterDecoration(e,t);},this.updateBreakpoints=function(e){this.$loop.schedule(this.CHANGE_GUTTER);},this.setAnnotations=function(e){this.$gutterLayer.setAnnotations(e),this.$loop.schedule(this.CHANGE_GUTTER);},this.updateCursor=function(){this.$loop.schedule(this.CHANGE_CURSOR);},this.hideCursor=function(){this.$cursorLayer.hideCursor();},this.showCursor=function(){this.$cursorLayer.showCursor();},this.scrollSelectionIntoView=function(e,t,n){this.scrollCursorIntoView(e,n),this.scrollCursorIntoView(t,n);},this.scrollCursorIntoView=function(e,t,n){if(this.$size.scrollerHeight===0)return;var r=this.$cursorLayer.getPixelPosition(e),i=r.left,s=r.top,o=n&&n.top||0,u=n&&n.bottom||0,a=this.$scrollAnimation?this.session.getScrollTop():this.scrollTop;a+o>s?(t&&a+o>s+this.lineHeight&&(s-=t*this.$size.scrollerHeight),s===0&&(s=-this.scrollMargin.top),this.session.setScrollTop(s)):a+this.$size.scrollerHeight-u<s+this.lineHeight&&(t&&a+this.$size.scrollerHeight-u<s-this.lineHeight&&(s+=t*this.$size.scrollerHeight),this.session.setScrollTop(s+this.lineHeight+u-this.$size.scrollerHeight));var f=this.scrollLeft;f>i?(i<this.$padding+2*this.layerConfig.characterWidth&&(i=-this.scrollMargin.left),this.session.setScrollLeft(i)):f+this.$size.scrollerWidth<i+this.characterWidth?this.session.setScrollLeft(Math.round(i+this.characterWidth-this.$size.scrollerWidth)):f<=this.$padding&&i-f<this.characterWidth&&this.session.setScrollLeft(0);},this.getScrollTop=function(){return this.session.getScrollTop()},this.getScrollLeft=function(){return this.session.getScrollLeft()},this.getScrollTopRow=function(){return this.scrollTop/this.lineHeight},this.getScrollBottomRow=function(){return Math.max(0,Math.floor((this.scrollTop+this.$size.scrollerHeight)/this.lineHeight)-1)},this.scrollToRow=function(e){this.session.setScrollTop(e*this.lineHeight);},this.alignCursor=function(e,t){typeof e=="number"&&(e={row:e,column:0});var n=this.$cursorLayer.getPixelPosition(e),r=this.$size.scrollerHeight-this.lineHeight,i=n.top-r*(t||0);return this.session.setScrollTop(i),i},this.STEPS=8,this.$calcSteps=function(e,t){var n=0,r=this.STEPS,i=[],s=function(e,t,n){return n*(Math.pow(e-1,3)+1)+t};for(n=0;n<r;++n)i.push(s(n/this.STEPS,e,t-e));return i},this.scrollToLine=function(e,t,n,r){var i=this.$cursorLayer.getPixelPosition({row:e,column:0}),s=i.top;t&&(s-=this.$size.scrollerHeight/2);var o=this.scrollTop;this.session.setScrollTop(s),n!==!1&&this.animateScrolling(o,r);},this.animateScrolling=function(e,t){var n=this.scrollTop;if(!this.$animatedScroll)return;var r=this;if(e==n)return;if(this.$scrollAnimation){var i=this.$scrollAnimation.steps;if(i.length){e=i[0];if(e==n)return}}var s=r.$calcSteps(e,n);this.$scrollAnimation={from:e,to:n,steps:s},clearInterval(this.$timer),r.session.setScrollTop(s.shift()),r.session.$scrollTop=n,this.$timer=setInterval(function(){if(!r.session)return clearInterval(r.$timer);s.length?(r.session.setScrollTop(s.shift()),r.session.$scrollTop=n):n!=null?(r.session.$scrollTop=-1,r.session.setScrollTop(n),n=null):(r.$timer=clearInterval(r.$timer),r.$scrollAnimation=null,t&&t());},10);},this.scrollToY=function(e){this.scrollTop!==e&&(this.$loop.schedule(this.CHANGE_SCROLL),this.scrollTop=e);},this.scrollToX=function(e){this.scrollLeft!==e&&(this.scrollLeft=e),this.$loop.schedule(this.CHANGE_H_SCROLL);},this.scrollTo=function(e,t){this.session.setScrollTop(t),this.session.setScrollLeft(t);},this.scrollBy=function(e,t){t&&this.session.setScrollTop(this.session.getScrollTop()+t),e&&this.session.setScrollLeft(this.session.getScrollLeft()+e);},this.isScrollableBy=function(e,t){if(t<0&&this.session.getScrollTop()>=1-this.scrollMargin.top)return !0;if(t>0&&this.session.getScrollTop()+this.$size.scrollerHeight-this.layerConfig.maxHeight<-1+this.scrollMargin.bottom)return !0;if(e<0&&this.session.getScrollLeft()>=1-this.scrollMargin.left)return !0;if(e>0&&this.session.getScrollLeft()+this.$size.scrollerWidth-this.layerConfig.width<-1+this.scrollMargin.right)return !0},this.pixelToScreenCoordinates=function(e,t){var n;if(this.$hasCssTransforms){n={top:0,left:0};var r=this.$fontMetrics.transformCoordinates([e,t]);e=r[1]-this.gutterWidth-this.margin.left,t=r[0];}else n=this.scroller.getBoundingClientRect();var i=e+this.scrollLeft-n.left-this.$padding,s=i/this.characterWidth,o=Math.floor((t+this.scrollTop-n.top)/this.lineHeight),u=this.$blockCursor?Math.floor(s):Math.round(s);return {row:o,column:u,side:s-u>0?1:-1,offsetX:i}},this.screenToTextCoordinates=function(e,t){var n;if(this.$hasCssTransforms){n={top:0,left:0};var r=this.$fontMetrics.transformCoordinates([e,t]);e=r[1]-this.gutterWidth-this.margin.left,t=r[0];}else n=this.scroller.getBoundingClientRect();var i=e+this.scrollLeft-n.left-this.$padding,s=i/this.characterWidth,o=this.$blockCursor?Math.floor(s):Math.round(s),u=Math.floor((t+this.scrollTop-n.top)/this.lineHeight);return this.session.screenToDocumentPosition(u,Math.max(o,0),i)},this.textToScreenCoordinates=function(e,t){var n=this.scroller.getBoundingClientRect(),r=this.session.documentToScreenPosition(e,t),i=this.$padding+(this.session.$bidiHandler.isBidiRow(r.row,e)?this.session.$bidiHandler.getPosLeft(r.column):Math.round(r.column*this.characterWidth)),s=r.row*this.lineHeight;return {pageX:n.left+i-this.scrollLeft,pageY:n.top+s-this.scrollTop}},this.visualizeFocus=function(){i.addCssClass(this.container,"ace_focus");},this.visualizeBlur=function(){i.removeCssClass(this.container,"ace_focus");},this.showComposition=function(e){this.$composition=e,e.cssText||(e.cssText=this.textarea.style.cssText),e.useTextareaForIME==undefined&&(e.useTextareaForIME=this.$useTextareaForIME),this.$useTextareaForIME?(i.addCssClass(this.textarea,"ace_composition"),this.textarea.style.cssText="",this.$moveTextAreaToCursor(),this.$cursorLayer.element.style.display="none"):e.markerId=this.session.addMarker(e.markerRange,"ace_composition_marker","text");},this.setCompositionText=function(e){var t=this.session.selection.cursor;this.addToken(e,"composition_placeholder",t.row,t.column),this.$moveTextAreaToCursor();},this.hideComposition=function(){if(!this.$composition)return;this.$composition.markerId&&this.session.removeMarker(this.$composition.markerId),i.removeCssClass(this.textarea,"ace_composition"),this.textarea.style.cssText=this.$composition.cssText;var e=this.session.selection.cursor;this.removeExtraToken(e.row,e.column),this.$composition=null,this.$cursorLayer.element.style.display="";},this.addToken=function(e,t,n,r){var i=this.session;i.bgTokenizer.lines[n]=null;var s={type:t,value:e},o=i.getTokens(n);if(r==null)o.push(s);else {var u=0;for(var a=0;a<o.length;a++){var f=o[a];u+=f.value.length;if(r<=u){var l=f.value.length-(u-r),c=f.value.slice(0,l),h=f.value.slice(l);o.splice(a,1,{type:f.type,value:c},s,{type:f.type,value:h});break}}}this.updateLines(n,n);},this.removeExtraToken=function(e,t){this.updateLines(e,e);},this.setTheme=function(e,t){function o(r){if(n.$themeId!=e)return t&&t();if(!r||!r.cssClass)throw new Error("couldn't load module "+e+" or it didn't call define");r.$id&&(n.$themeId=r.$id),i.importCssString(r.cssText,r.cssClass,n.container),n.theme&&i.removeCssClass(n.container,n.theme.cssClass);var s="padding"in r?r.padding:"padding"in(n.theme||{})?4:n.$padding;n.$padding&&s!=n.$padding&&n.setPadding(s),n.$theme=r.cssClass,n.theme=r,i.addCssClass(n.container,r.cssClass),i.setCssClass(n.container,"ace_dark",r.isDark),n.$size&&(n.$size.width=0,n.$updateSizeAsync()),n._dispatchEvent("themeLoaded",{theme:r}),t&&t();}var n=this;this.$themeId=e,n._dispatchEvent("themeChange",{theme:e});if(!e||typeof e=="string"){var r=e||this.$options.theme.initialValue;s.loadModule(["theme",r],o);}else o(e);},this.getTheme=function(){return this.$themeId},this.setStyle=function(e,t){i.setCssClass(this.container,e,t!==!1);},this.unsetStyle=function(e){i.removeCssClass(this.container,e);},this.setCursorStyle=function(e){i.setStyle(this.scroller.style,"cursor",e);},this.setMouseCursor=function(e){i.setStyle(this.scroller.style,"cursor",e);},this.attachToShadowRoot=function(){i.importCssString(v,"ace_editor.css",this.container);},this.destroy=function(){this.freeze(),this.$fontMetrics.destroy(),this.$cursorLayer.destroy(),this.removeAllListeners(),this.container.textContent="";};}).call(y.prototype),s.defineOptions(y.prototype,"renderer",{animatedScroll:{initialValue:!1},showInvisibles:{set:function(e){this.$textLayer.setShowInvisibles(e)&&this.$loop.schedule(this.CHANGE_TEXT);},initialValue:!1},showPrintMargin:{set:function(){this.$updatePrintMargin();},initialValue:!0},printMarginColumn:{set:function(){this.$updatePrintMargin();},initialValue:80},printMargin:{set:function(e){typeof e=="number"&&(this.$printMarginColumn=e),this.$showPrintMargin=!!e,this.$updatePrintMargin();},get:function(){return this.$showPrintMargin&&this.$printMarginColumn}},showGutter:{set:function(e){this.$gutter.style.display=e?"block":"none",this.$loop.schedule(this.CHANGE_FULL),this.onGutterResize();},initialValue:!0},fadeFoldWidgets:{set:function(e){i.setCssClass(this.$gutter,"ace_fade-fold-widgets",e);},initialValue:!1},showFoldWidgets:{set:function(e){this.$gutterLayer.setShowFoldWidgets(e),this.$loop.schedule(this.CHANGE_GUTTER);},initialValue:!0},displayIndentGuides:{set:function(e){this.$textLayer.setDisplayIndentGuides(e)&&this.$loop.schedule(this.CHANGE_TEXT);},initialValue:!0},highlightGutterLine:{set:function(e){this.$gutterLayer.setHighlightGutterLine(e),this.$loop.schedule(this.CHANGE_GUTTER);},initialValue:!0},hScrollBarAlwaysVisible:{set:function(e){(!this.$hScrollBarAlwaysVisible||!this.$horizScroll)&&this.$loop.schedule(this.CHANGE_SCROLL);},initialValue:!1},vScrollBarAlwaysVisible:{set:function(e){(!this.$vScrollBarAlwaysVisible||!this.$vScroll)&&this.$loop.schedule(this.CHANGE_SCROLL);},initialValue:!1},fontSize:{set:function(e){typeof e=="number"&&(e+="px"),this.container.style.fontSize=e,this.updateFontSize();},initialValue:12},fontFamily:{set:function(e){this.container.style.fontFamily=e,this.updateFontSize();}},maxLines:{set:function(e){this.updateFull();}},minLines:{set:function(e){this.$minLines<562949953421311||(this.$minLines=0),this.updateFull();}},maxPixelHeight:{set:function(e){this.updateFull();},initialValue:0},scrollPastEnd:{set:function(e){e=+e||0;if(this.$scrollPastEnd==e)return;this.$scrollPastEnd=e,this.$loop.schedule(this.CHANGE_SCROLL);},initialValue:0,handlesSet:!0},fixedWidthGutter:{set:function(e){this.$gutterLayer.$fixedWidth=!!e,this.$loop.schedule(this.CHANGE_GUTTER);}},theme:{set:function(e){this.setTheme(e);},get:function(){return this.$themeId||this.theme},initialValue:"./theme/textmate",handlesSet:!0},hasCssTransforms:{},useTextareaForIME:{initialValue:!m.isMobile&&!m.isIE}}),t.VirtualRenderer=y;}),ace.define("ace/worker/worker_client",["require","exports","module","ace/lib/oop","ace/lib/net","ace/lib/event_emitter","ace/config"],function(e,t,n){function u(e){var t="importScripts('"+i.qualifyURL(e)+"');";try{return new Blob([t],{type:"application/javascript"})}catch(n){var r=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder,s=new r;return s.append(t),s.getBlob("application/javascript")}}function a(e){if(typeof Worker=="undefined")return {postMessage:function(){},terminate:function(){}};if(o.get("loadWorkerFromBlob")){var t=u(e),n=window.URL||window.webkitURL,r=n.createObjectURL(t);return new Worker(r)}return new Worker(e)}var r=e("../lib/oop"),i=e("../lib/net"),s=e("../lib/event_emitter").EventEmitter,o=e("../config"),f=function(e){e.postMessage||(e=this.$createWorkerFromOldConfig.apply(this,arguments)),this.$worker=e,this.$sendDeltaQueue=this.$sendDeltaQueue.bind(this),this.changeListener=this.changeListener.bind(this),this.onMessage=this.onMessage.bind(this),this.callbackId=1,this.callbacks={},this.$worker.onmessage=this.onMessage;};(function(){r.implement(this,s),this.$createWorkerFromOldConfig=function(t,n,r,i,s){e.nameToUrl&&!e.toUrl&&(e.toUrl=e.nameToUrl);if(o.get("packaged")||!e.toUrl)i=i||o.moduleUrl(n,"worker");else {var u=this.$normalizePath;i=i||u(e.toUrl("ace/worker/worker.js",null,"_"));var f={};t.forEach(function(t){f[t]=u(e.toUrl(t,null,"_").replace(/(\.js)?(\?.*)?$/,""));});}return this.$worker=a(i),s&&this.send("importScripts",s),this.$worker.postMessage({init:!0,tlns:f,module:n,classname:r}),this.$worker},this.onMessage=function(e){var t=e.data;switch(t.type){case"event":this._signal(t.name,{data:t.data});break;case"call":var n=this.callbacks[t.id];n&&(n(t.data),delete this.callbacks[t.id]);break;case"error":this.reportError(t.data);break;case"log":window.console&&console.log&&console.log.apply(console,t.data);}},this.reportError=function(e){window.console&&console.error&&console.error(e);},this.$normalizePath=function(e){return i.qualifyURL(e)},this.terminate=function(){this._signal("terminate",{}),this.deltaQueue=null,this.$worker.terminate(),this.$worker=null,this.$doc&&this.$doc.off("change",this.changeListener),this.$doc=null;},this.send=function(e,t){this.$worker.postMessage({command:e,args:t});},this.call=function(e,t,n){if(n){var r=this.callbackId++;this.callbacks[r]=n,t.push(r);}this.send(e,t);},this.emit=function(e,t){try{t.data&&t.data.err&&(t.data.err={message:t.data.err.message,stack:t.data.err.stack,code:t.data.err.code}),this.$worker.postMessage({event:e,data:{data:t.data}});}catch(n){console.error(n.stack);}},this.attachToDocument=function(e){this.$doc&&this.terminate(),this.$doc=e,this.call("setValue",[e.getValue()]),e.on("change",this.changeListener);},this.changeListener=function(e){this.deltaQueue||(this.deltaQueue=[],setTimeout(this.$sendDeltaQueue,0)),e.action=="insert"?this.deltaQueue.push(e.start,e.lines):this.deltaQueue.push(e.start,e.end);},this.$sendDeltaQueue=function(){var e=this.deltaQueue;if(!e)return;this.deltaQueue=null,e.length>50&&e.length>this.$doc.getLength()>>1?this.call("setValue",[this.$doc.getValue()]):this.emit("change",{data:e});};}).call(f.prototype);var l=function(e,t,n){var r=null,i=!1,u=Object.create(s),a=[],l=new f({messageBuffer:a,terminate:function(){},postMessage:function(e){a.push(e);if(!r)return;i?setTimeout(c):c();}});l.setEmitSync=function(e){i=e;};var c=function(){var e=a.shift();e.command?r[e.command].apply(r,e.args):e.event&&u._signal(e.event,e.data);};return u.postMessage=function(e){l.onMessage({data:e});},u.callback=function(e,t){this.postMessage({type:"call",id:t,data:e});},u.emit=function(e,t){this.postMessage({type:"event",name:e,data:t});},o.loadModule(["worker",t],function(e){r=new e[n](u);while(a.length)c();}),l};t.UIWorkerClient=l,t.WorkerClient=f,t.createWorker=a;}),ace.define("ace/placeholder",["require","exports","module","ace/range","ace/lib/event_emitter","ace/lib/oop"],function(e,t,n){var r=e("./range").Range,i=e("./lib/event_emitter").EventEmitter,s=e("./lib/oop"),o=function(e,t,n,r,i,s){var o=this;this.length=t,this.session=e,this.doc=e.getDocument(),this.mainClass=i,this.othersClass=s,this.$onUpdate=this.onUpdate.bind(this),this.doc.on("change",this.$onUpdate),this.$others=r,this.$onCursorChange=function(){setTimeout(function(){o.onCursorChange();});},this.$pos=n;var u=e.getUndoManager().$undoStack||e.getUndoManager().$undostack||{length:-1};this.$undoStackDepth=u.length,this.setup(),e.selection.on("changeCursor",this.$onCursorChange);};(function(){s.implement(this,i),this.setup=function(){var e=this,t=this.doc,n=this.session;this.selectionBefore=n.selection.toJSON(),n.selection.inMultiSelectMode&&n.selection.toSingleRange(),this.pos=t.createAnchor(this.$pos.row,this.$pos.column);var i=this.pos;i.$insertRight=!0,i.detach(),i.markerId=n.addMarker(new r(i.row,i.column,i.row,i.column+this.length),this.mainClass,null,!1),this.others=[],this.$others.forEach(function(n){var r=t.createAnchor(n.row,n.column);r.$insertRight=!0,r.detach(),e.others.push(r);}),n.setUndoSelect(!1);},this.showOtherMarkers=function(){if(this.othersActive)return;var e=this.session,t=this;this.othersActive=!0,this.others.forEach(function(n){n.markerId=e.addMarker(new r(n.row,n.column,n.row,n.column+t.length),t.othersClass,null,!1);});},this.hideOtherMarkers=function(){if(!this.othersActive)return;this.othersActive=!1;for(var e=0;e<this.others.length;e++)this.session.removeMarker(this.others[e].markerId);},this.onUpdate=function(e){if(this.$updating)return this.updateAnchors(e);var t=e;if(t.start.row!==t.end.row)return;if(t.start.row!==this.pos.row)return;this.$updating=!0;var n=e.action==="insert"?t.end.column-t.start.column:t.start.column-t.end.column,i=t.start.column>=this.pos.column&&t.start.column<=this.pos.column+this.length+1,s=t.start.column-this.pos.column;this.updateAnchors(e),i&&(this.length+=n);if(i&&!this.session.$fromUndo)if(e.action==="insert")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.insertMergedLines(a,e.lines);}else if(e.action==="remove")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.remove(new r(a.row,a.column,a.row,a.column-n));}this.$updating=!1,this.updateMarkers();},this.updateAnchors=function(e){this.pos.onChange(e);for(var t=this.others.length;t--;)this.others[t].onChange(e);this.updateMarkers();},this.updateMarkers=function(){if(this.$updating)return;var e=this,t=this.session,n=function(n,i){t.removeMarker(n.markerId),n.markerId=t.addMarker(new r(n.row,n.column,n.row,n.column+e.length),i,null,!1);};n(this.pos,this.mainClass);for(var i=this.others.length;i--;)n(this.others[i],this.othersClass);},this.onCursorChange=function(e){if(this.$updating||!this.session)return;var t=this.session.selection.getCursor();t.row===this.pos.row&&t.column>=this.pos.column&&t.column<=this.pos.column+this.length?(this.showOtherMarkers(),this._emit("cursorEnter",e)):(this.hideOtherMarkers(),this._emit("cursorLeave",e));},this.detach=function(){this.session.removeMarker(this.pos&&this.pos.markerId),this.hideOtherMarkers(),this.doc.off("change",this.$onUpdate),this.session.selection.off("changeCursor",this.$onCursorChange),this.session.setUndoSelect(!0),this.session=null;},this.cancel=function(){if(this.$undoStackDepth===-1)return;var e=this.session.getUndoManager(),t=(e.$undoStack||e.$undostack).length-this.$undoStackDepth;for(var n=0;n<t;n++)e.undo(this.session,!0);this.selectionBefore&&this.session.selection.fromJSON(this.selectionBefore);};}).call(o.prototype),t.PlaceHolder=o;}),ace.define("ace/mouse/multi_select_handler",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){function s(e,t){return e.row==t.row&&e.column==t.column}function o(e){var t=e.domEvent,n=t.altKey,o=t.shiftKey,u=t.ctrlKey,a=e.getAccelKey(),f=e.getButton();u&&i.isMac&&(f=t.button);if(e.editor.inMultiSelectMode&&f==2){e.editor.textInput.onContextMenu(e.domEvent);return}if(!u&&!n&&!a){f===0&&e.editor.inMultiSelectMode&&e.editor.exitMultiSelectMode();return}if(f!==0)return;var l=e.editor,c=l.selection,h=l.inMultiSelectMode,p=e.getDocumentPosition(),d=c.getCursor(),v=e.inSelection()||c.isEmpty()&&s(p,d),m=e.x,g=e.y,y=function(e){m=e.clientX,g=e.clientY;},b=l.session,w=l.renderer.pixelToScreenCoordinates(m,g),E=w,S;if(l.$mouseHandler.$enableJumpToDef)u&&n||a&&n?S=o?"block":"add":n&&l.$blockSelectEnabled&&(S="block");else if(a&&!n){S="add";if(!h&&o)return}else n&&l.$blockSelectEnabled&&(S="block");S&&i.isMac&&t.ctrlKey&&l.$mouseHandler.cancelContextMenu();if(S=="add"){if(!h&&v)return;if(!h){var x=c.toOrientedRange();l.addSelectionMarker(x);}var T=c.rangeList.rangeAtPoint(p);l.inVirtualSelectionMode=!0,o&&(T=null,x=c.ranges[0]||x,l.removeSelectionMarker(x)),l.once("mouseup",function(){var e=c.toOrientedRange();T&&e.isEmpty()&&s(T.cursor,e.cursor)?c.substractPoint(e.cursor):(o?c.substractPoint(x.cursor):x&&(l.removeSelectionMarker(x),c.addRange(x)),c.addRange(e)),l.inVirtualSelectionMode=!1;});}else if(S=="block"){e.stop(),l.inVirtualSelectionMode=!0;var N,C=[],k=function(){var e=l.renderer.pixelToScreenCoordinates(m,g),t=b.screenToDocumentPosition(e.row,e.column,e.offsetX);if(s(E,e)&&s(t,c.lead))return;E=e,l.selection.moveToPosition(t),l.renderer.scrollCursorIntoView(),l.removeSelectionMarkers(C),C=c.rectangularRangeBlock(E,w),l.$mouseHandler.$clickSelection&&C.length==1&&C[0].isEmpty()&&(C[0]=l.$mouseHandler.$clickSelection.clone()),C.forEach(l.addSelectionMarker,l),l.updateSelectionMarkers();};h&&!a?c.toSingleRange():!h&&a&&(N=c.toOrientedRange(),l.addSelectionMarker(N)),o?w=b.documentToScreenPosition(c.lead):c.moveToPosition(p),E={row:-1,column:-1};var L=function(e){k(),clearInterval(O),l.removeSelectionMarkers(C),C.length||(C=[c.toOrientedRange()]),N&&(l.removeSelectionMarker(N),c.toSingleRange(N));for(var t=0;t<C.length;t++)c.addRange(C[t]);l.inVirtualSelectionMode=!1,l.$mouseHandler.$clickSelection=null;},A=k;r.capture(l.container,y,L);var O=setInterval(function(){A();},20);return e.preventDefault()}}var r=e("../lib/event"),i=e("../lib/useragent");t.onMouseDown=o;}),ace.define("ace/commands/multi_select_commands",["require","exports","module","ace/keyboard/hash_handler"],function(e,t,n){t.defaultCommands=[{name:"addCursorAbove",description:"Add cursor above",exec:function(e){e.selectMoreLines(-1);},bindKey:{win:"Ctrl-Alt-Up",mac:"Ctrl-Alt-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelow",description:"Add cursor below",exec:function(e){e.selectMoreLines(1);},bindKey:{win:"Ctrl-Alt-Down",mac:"Ctrl-Alt-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorAboveSkipCurrent",description:"Add cursor above (skip current)",exec:function(e){e.selectMoreLines(-1,!0);},bindKey:{win:"Ctrl-Alt-Shift-Up",mac:"Ctrl-Alt-Shift-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelowSkipCurrent",description:"Add cursor below (skip current)",exec:function(e){e.selectMoreLines(1,!0);},bindKey:{win:"Ctrl-Alt-Shift-Down",mac:"Ctrl-Alt-Shift-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreBefore",description:"Select more before",exec:function(e){e.selectMore(-1);},bindKey:{win:"Ctrl-Alt-Left",mac:"Ctrl-Alt-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreAfter",description:"Select more after",exec:function(e){e.selectMore(1);},bindKey:{win:"Ctrl-Alt-Right",mac:"Ctrl-Alt-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextBefore",description:"Select next before",exec:function(e){e.selectMore(-1,!0);},bindKey:{win:"Ctrl-Alt-Shift-Left",mac:"Ctrl-Alt-Shift-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextAfter",description:"Select next after",exec:function(e){e.selectMore(1,!0);},bindKey:{win:"Ctrl-Alt-Shift-Right",mac:"Ctrl-Alt-Shift-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"toggleSplitSelectionIntoLines",description:"Split into lines",exec:function(e){e.multiSelect.rangeCount>1?e.multiSelect.joinSelections():e.multiSelect.splitIntoLines();},bindKey:{win:"Ctrl-Alt-L",mac:"Ctrl-Alt-L"},readOnly:!0},{name:"splitSelectionIntoLines",description:"Split into lines",exec:function(e){e.multiSelect.splitIntoLines();},readOnly:!0},{name:"alignCursors",description:"Align cursors",exec:function(e){e.alignCursors();},bindKey:{win:"Ctrl-Alt-A",mac:"Ctrl-Alt-A"},scrollIntoView:"cursor"},{name:"findAll",description:"Find all",exec:function(e){e.findAll();},bindKey:{win:"Ctrl-Alt-K",mac:"Ctrl-Alt-G"},scrollIntoView:"cursor",readOnly:!0}],t.multiSelectCommands=[{name:"singleSelection",description:"Single selection",bindKey:"esc",exec:function(e){e.exitMultiSelectMode();},scrollIntoView:"cursor",readOnly:!0,isAvailable:function(e){return e&&e.inMultiSelectMode}}];var r=e("../keyboard/hash_handler").HashHandler;t.keyboardHandler=new r(t.multiSelectCommands);}),ace.define("ace/multi_select",["require","exports","module","ace/range_list","ace/range","ace/selection","ace/mouse/multi_select_handler","ace/lib/event","ace/lib/lang","ace/commands/multi_select_commands","ace/search","ace/edit_session","ace/editor","ace/config"],function(e,t,n){function h(e,t,n){return c.$options.wrap=!0,c.$options.needle=t,c.$options.backwards=n==-1,c.find(e)}function v(e,t){return e.row==t.row&&e.column==t.column}function m(e){if(e.$multiselectOnSessionChange)return;e.$onAddRange=e.$onAddRange.bind(e),e.$onRemoveRange=e.$onRemoveRange.bind(e),e.$onMultiSelect=e.$onMultiSelect.bind(e),e.$onSingleSelect=e.$onSingleSelect.bind(e),e.$multiselectOnSessionChange=t.onSessionChange.bind(e),e.$checkMultiselectChange=e.$checkMultiselectChange.bind(e),e.$multiselectOnSessionChange(e),e.on("changeSession",e.$multiselectOnSessionChange),e.on("mousedown",o),e.commands.addCommands(f.defaultCommands),g(e);}function g(e){function r(t){n&&(e.renderer.setMouseCursor(""),n=!1);}if(!e.textInput)return;var t=e.textInput.getElement(),n=!1;u.addListener(t,"keydown",function(t){var i=t.keyCode==18&&!(t.ctrlKey||t.shiftKey||t.metaKey);e.$blockSelectEnabled&&i?n||(e.renderer.setMouseCursor("crosshair"),n=!0):n&&r();},e),u.addListener(t,"keyup",r,e),u.addListener(t,"blur",r,e);}var r=e("./range_list").RangeList,i=e("./range").Range,s=e("./selection").Selection,o=e("./mouse/multi_select_handler").onMouseDown,u=e("./lib/event"),a=e("./lib/lang"),f=e("./commands/multi_select_commands");t.commands=f.defaultCommands.concat(f.multiSelectCommands);var l=e("./search").Search,c=new l,p=e("./edit_session").EditSession;(function(){this.getSelectionMarkers=function(){return this.$selectionMarkers};}).call(p.prototype),function(){this.ranges=null,this.rangeList=null,this.addRange=function(e,t){if(!e)return;if(!this.inMultiSelectMode&&this.rangeCount===0){var n=this.toOrientedRange();this.rangeList.add(n),this.rangeList.add(e);if(this.rangeList.ranges.length!=2)return this.rangeList.removeAll(),t||this.fromOrientedRange(e);this.rangeList.removeAll(),this.rangeList.add(n),this.$onAddRange(n);}e.cursor||(e.cursor=e.end);var r=this.rangeList.add(e);return this.$onAddRange(e),r.length&&this.$onRemoveRange(r),this.rangeCount>1&&!this.inMultiSelectMode&&(this._signal("multiSelect"),this.inMultiSelectMode=!0,this.session.$undoSelect=!1,this.rangeList.attach(this.session)),t||this.fromOrientedRange(e)},this.toSingleRange=function(e){e=e||this.ranges[0];var t=this.rangeList.removeAll();t.length&&this.$onRemoveRange(t),e&&this.fromOrientedRange(e);},this.substractPoint=function(e){var t=this.rangeList.substractPoint(e);if(t)return this.$onRemoveRange(t),t[0]},this.mergeOverlappingRanges=function(){var e=this.rangeList.merge();e.length&&this.$onRemoveRange(e);},this.$onAddRange=function(e){this.rangeCount=this.rangeList.ranges.length,this.ranges.unshift(e),this._signal("addRange",{range:e});},this.$onRemoveRange=function(e){this.rangeCount=this.rangeList.ranges.length;if(this.rangeCount==1&&this.inMultiSelectMode){var t=this.rangeList.ranges.pop();e.push(t),this.rangeCount=0;}for(var n=e.length;n--;){var r=this.ranges.indexOf(e[n]);this.ranges.splice(r,1);}this._signal("removeRange",{ranges:e}),this.rangeCount===0&&this.inMultiSelectMode&&(this.inMultiSelectMode=!1,this._signal("singleSelect"),this.session.$undoSelect=!0,this.rangeList.detach(this.session)),t=t||this.ranges[0],t&&!t.isEqual(this.getRange())&&this.fromOrientedRange(t);},this.$initRangeList=function(){if(this.rangeList)return;this.rangeList=new r,this.ranges=[],this.rangeCount=0;},this.getAllRanges=function(){return this.rangeCount?this.rangeList.ranges.concat():[this.getRange()]},this.splitIntoLines=function(){var e=this.ranges.length?this.ranges:[this.getRange()],t=[];for(var n=0;n<e.length;n++){var r=e[n],s=r.start.row,o=r.end.row;if(s===o)t.push(r.clone());else {t.push(new i(s,r.start.column,s,this.session.getLine(s).length));while(++s<o)t.push(this.getLineRange(s,!0));t.push(new i(o,0,o,r.end.column));}n==0&&!this.isBackwards()&&(t=t.reverse());}this.toSingleRange();for(var n=t.length;n--;)this.addRange(t[n]);},this.joinSelections=function(){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start);},this.toggleBlockSelection=function(){if(this.rangeCount>1){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start);}else {var r=this.session.documentToScreenPosition(this.cursor),s=this.session.documentToScreenPosition(this.anchor),o=this.rectangularRangeBlock(r,s);o.forEach(this.addRange,this);}},this.rectangularRangeBlock=function(e,t,n){var r=[],s=e.column<t.column;if(s)var o=e.column,u=t.column,a=e.offsetX,f=t.offsetX;else var o=t.column,u=e.column,a=t.offsetX,f=e.offsetX;var l=e.row<t.row;if(l)var c=e.row,h=t.row;else var c=t.row,h=e.row;o<0&&(o=0),c<0&&(c=0),c==h&&(n=!0);var p;for(var d=c;d<=h;d++){var m=i.fromPoints(this.session.screenToDocumentPosition(d,o,a),this.session.screenToDocumentPosition(d,u,f));if(m.isEmpty()){if(p&&v(m.end,p))break;p=m.end;}m.cursor=s?m.start:m.end,r.push(m);}l&&r.reverse();if(!n){var g=r.length-1;while(r[g].isEmpty()&&g>0)g--;if(g>0){var y=0;while(r[y].isEmpty())y++;}for(var b=g;b>=y;b--)r[b].isEmpty()&&r.splice(b,1);}return r};}.call(s.prototype);var d=e("./editor").Editor;(function(){this.updateSelectionMarkers=function(){this.renderer.updateCursor(),this.renderer.updateBackMarkers();},this.addSelectionMarker=function(e){e.cursor||(e.cursor=e.end);var t=this.getSelectionStyle();return e.marker=this.session.addMarker(e,"ace_selection",t),this.session.$selectionMarkers.push(e),this.session.selectionMarkerCount=this.session.$selectionMarkers.length,e},this.removeSelectionMarker=function(e){if(!e.marker)return;this.session.removeMarker(e.marker);var t=this.session.$selectionMarkers.indexOf(e);t!=-1&&this.session.$selectionMarkers.splice(t,1),this.session.selectionMarkerCount=this.session.$selectionMarkers.length;},this.removeSelectionMarkers=function(e){var t=this.session.$selectionMarkers;for(var n=e.length;n--;){var r=e[n];if(!r.marker)continue;this.session.removeMarker(r.marker);var i=t.indexOf(r);i!=-1&&t.splice(i,1);}this.session.selectionMarkerCount=t.length;},this.$onAddRange=function(e){this.addSelectionMarker(e.range),this.renderer.updateCursor(),this.renderer.updateBackMarkers();},this.$onRemoveRange=function(e){this.removeSelectionMarkers(e.ranges),this.renderer.updateCursor(),this.renderer.updateBackMarkers();},this.$onMultiSelect=function(e){if(this.inMultiSelectMode)return;this.inMultiSelectMode=!0,this.setStyle("ace_multiselect"),this.keyBinding.addKeyboardHandler(f.keyboardHandler),this.commands.setDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers();},this.$onSingleSelect=function(e){if(this.session.multiSelect.inVirtualMode)return;this.inMultiSelectMode=!1,this.unsetStyle("ace_multiselect"),this.keyBinding.removeKeyboardHandler(f.keyboardHandler),this.commands.removeDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers(),this._emit("changeSelection");},this.$onMultiSelectExec=function(e){var t=e.command,n=e.editor;if(!n.multiSelect)return;if(!t.multiSelectAction){var r=t.exec(n,e.args||{});n.multiSelect.addRange(n.multiSelect.toOrientedRange()),n.multiSelect.mergeOverlappingRanges();}else t.multiSelectAction=="forEach"?r=n.forEachSelection(t,e.args):t.multiSelectAction=="forEachLine"?r=n.forEachSelection(t,e.args,!0):t.multiSelectAction=="single"?(n.exitMultiSelectMode(),r=t.exec(n,e.args||{})):r=t.multiSelectAction(n,e.args||{});return r},this.forEachSelection=function(e,t,n){if(this.inVirtualSelectionMode)return;var r=n&&n.keepOrder,i=n==1||n&&n.$byLines,o=this.session,u=this.selection,a=u.rangeList,f=(r?u:a).ranges,l;if(!f.length)return e.exec?e.exec(this,t||{}):e(this,t||{});var c=u._eventRegistry;u._eventRegistry={};var h=new s(o);this.inVirtualSelectionMode=!0;for(var p=f.length;p--;){if(i)while(p>0&&f[p].start.row==f[p-1].end.row)p--;h.fromOrientedRange(f[p]),h.index=p,this.selection=o.selection=h;var d=e.exec?e.exec(this,t||{}):e(this,t||{});!l&&d!==undefined&&(l=d),h.toOrientedRange(f[p]);}h.detach(),this.selection=o.selection=u,this.inVirtualSelectionMode=!1,u._eventRegistry=c,u.mergeOverlappingRanges(),u.ranges[0]&&u.fromOrientedRange(u.ranges[0]);var v=this.renderer.$scrollAnimation;return this.onCursorChange(),this.onSelectionChange(),v&&v.from==v.to&&this.renderer.animateScrolling(v.from),l},this.exitMultiSelectMode=function(){if(!this.inMultiSelectMode||this.inVirtualSelectionMode)return;this.multiSelect.toSingleRange();},this.getSelectedText=function(){var e="";if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var t=this.multiSelect.rangeList.ranges,n=[];for(var r=0;r<t.length;r++)n.push(this.session.getTextRange(t[r]));var i=this.session.getDocument().getNewLineCharacter();e=n.join(i),e.length==(n.length-1)*i.length&&(e="");}else this.selection.isEmpty()||(e=this.session.getTextRange(this.getSelectionRange()));return e},this.$checkMultiselectChange=function(e,t){if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var n=this.multiSelect.ranges[0];if(this.multiSelect.isEmpty()&&t==this.multiSelect.anchor)return;var r=t==this.multiSelect.anchor?n.cursor==n.start?n.end:n.start:n.cursor;r.row!=t.row||this.session.$clipPositionToDocument(r.row,r.column).column!=t.column?this.multiSelect.toSingleRange(this.multiSelect.toOrientedRange()):this.multiSelect.mergeOverlappingRanges();}},this.findAll=function(e,t,n){t=t||{},t.needle=e||t.needle;if(t.needle==undefined){var r=this.selection.isEmpty()?this.selection.getWordRange():this.selection.getRange();t.needle=this.session.getTextRange(r);}this.$search.set(t);var i=this.$search.findAll(this.session);if(!i.length)return 0;var s=this.multiSelect;n||s.toSingleRange(i[0]);for(var o=i.length;o--;)s.addRange(i[o],!0);return r&&s.rangeList.rangeAtPoint(r.start)&&s.addRange(r,!0),i.length},this.selectMoreLines=function(e,t){var n=this.selection.toOrientedRange(),r=n.cursor==n.end,s=this.session.documentToScreenPosition(n.cursor);this.selection.$desiredColumn&&(s.column=this.selection.$desiredColumn);var o=this.session.screenToDocumentPosition(s.row+e,s.column);if(!n.isEmpty())var u=this.session.documentToScreenPosition(r?n.end:n.start),a=this.session.screenToDocumentPosition(u.row+e,u.column);else var a=o;if(r){var f=i.fromPoints(o,a);f.cursor=f.start;}else {var f=i.fromPoints(a,o);f.cursor=f.end;}f.desiredColumn=s.column;if(!this.selection.inMultiSelectMode)this.selection.addRange(n);else if(t)var l=n.cursor;this.selection.addRange(f),l&&this.selection.substractPoint(l);},this.transposeSelections=function(e){var t=this.session,n=t.multiSelect,r=n.ranges;for(var i=r.length;i--;){var s=r[i];if(s.isEmpty()){var o=t.getWordRange(s.start.row,s.start.column);s.start.row=o.start.row,s.start.column=o.start.column,s.end.row=o.end.row,s.end.column=o.end.column;}}n.mergeOverlappingRanges();var u=[];for(var i=r.length;i--;){var s=r[i];u.unshift(t.getTextRange(s));}e<0?u.unshift(u.pop()):u.push(u.shift());for(var i=r.length;i--;){var s=r[i],o=s.clone();t.replace(s,u[i]),s.start.row=o.start.row,s.start.column=o.start.column;}n.fromOrientedRange(n.ranges[0]);},this.selectMore=function(e,t,n){var r=this.session,i=r.multiSelect,s=i.toOrientedRange();if(s.isEmpty()){s=r.getWordRange(s.start.row,s.start.column),s.cursor=e==-1?s.start:s.end,this.multiSelect.addRange(s);if(n)return}var o=r.getTextRange(s),u=h(r,o,e);u&&(u.cursor=e==-1?u.start:u.end,this.session.unfold(u),this.multiSelect.addRange(u),this.renderer.scrollCursorIntoView(null,.5)),t&&this.multiSelect.substractPoint(s.cursor);},this.alignCursors=function(){var e=this.session,t=e.multiSelect,n=t.ranges,r=-1,s=n.filter(function(e){if(e.cursor.row==r)return !0;r=e.cursor.row;});if(!n.length||s.length==n.length-1){var o=this.selection.getRange(),u=o.start.row,f=o.end.row,l=u==f;if(l){var c=this.session.getLength(),h;do h=this.session.getLine(f);while(/[=:]/.test(h)&&++f<c);do h=this.session.getLine(u);while(/[=:]/.test(h)&&--u>0);u<0&&(u=0),f>=c&&(f=c-1);}var p=this.session.removeFullLines(u,f);p=this.$reAlignText(p,l),this.session.insert({row:u,column:0},p.join("\n")+"\n"),l||(o.start.column=0,o.end.column=p[p.length-1].length),this.selection.setRange(o);}else {s.forEach(function(e){t.substractPoint(e.cursor);});var d=0,v=Infinity,m=n.map(function(t){var n=t.cursor,r=e.getLine(n.row),i=r.substr(n.column).search(/\S/g);return i==-1&&(i=0),n.column>d&&(d=n.column),i<v&&(v=i),i});n.forEach(function(t,n){var r=t.cursor,s=d-r.column,o=m[n]-v;s>o?e.insert(r,a.stringRepeat(" ",s-o)):e.remove(new i(r.row,r.column,r.row,r.column-s+o)),t.start.column=t.end.column=d,t.start.row=t.end.row=r.row,t.cursor=t.end;}),t.fromOrientedRange(n[0]),this.renderer.updateCursor(),this.renderer.updateBackMarkers();}},this.$reAlignText=function(e,t){function u(e){return a.stringRepeat(" ",e)}function f(e){return e[2]?u(i)+e[2]+u(s-e[2].length+o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function l(e){return e[2]?u(i+s-e[2].length)+e[2]+u(o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function c(e){return e[2]?u(i)+e[2]+u(o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}var n=!0,r=!0,i,s,o;return e.map(function(e){var t=e.match(/(\s*)(.*?)(\s*)([=:].*)/);return t?i==null?(i=t[1].length,s=t[2].length,o=t[3].length,t):(i+s+o!=t[1].length+t[2].length+t[3].length&&(r=!1),i!=t[1].length&&(n=!1),i>t[1].length&&(i=t[1].length),s<t[2].length&&(s=t[2].length),o>t[3].length&&(o=t[3].length),t):[e]}).map(t?f:n?r?l:f:c)};}).call(d.prototype),t.onSessionChange=function(e){var t=e.session;t&&!t.multiSelect&&(t.$selectionMarkers=[],t.selection.$initRangeList(),t.multiSelect=t.selection),this.multiSelect=t&&t.multiSelect;var n=e.oldSession;n&&(n.multiSelect.off("addRange",this.$onAddRange),n.multiSelect.off("removeRange",this.$onRemoveRange),n.multiSelect.off("multiSelect",this.$onMultiSelect),n.multiSelect.off("singleSelect",this.$onSingleSelect),n.multiSelect.lead.off("change",this.$checkMultiselectChange),n.multiSelect.anchor.off("change",this.$checkMultiselectChange)),t&&(t.multiSelect.on("addRange",this.$onAddRange),t.multiSelect.on("removeRange",this.$onRemoveRange),t.multiSelect.on("multiSelect",this.$onMultiSelect),t.multiSelect.on("singleSelect",this.$onSingleSelect),t.multiSelect.lead.on("change",this.$checkMultiselectChange),t.multiSelect.anchor.on("change",this.$checkMultiselectChange)),t&&this.inMultiSelectMode!=t.selection.inMultiSelectMode&&(t.selection.inMultiSelectMode?this.$onMultiSelect():this.$onSingleSelect());},t.MultiSelect=m,e("./config").defineOptions(d.prototype,"editor",{enableMultiselect:{set:function(e){m(this),e?(this.on("changeSession",this.$multiselectOnSessionChange),this.on("mousedown",o)):(this.off("changeSession",this.$multiselectOnSessionChange),this.off("mousedown",o));},value:!0},enableBlockSelect:{set:function(e){this.$blockSelectEnabled=e;},value:!0}});}),ace.define("ace/mode/folding/fold_mode",["require","exports","module","ace/range"],function(e,t,n){var r=e("../../range").Range,i=t.FoldMode=function(){};(function(){this.foldingStartMarker=null,this.foldingStopMarker=null,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);return this.foldingStartMarker.test(r)?"start":t=="markbeginend"&&this.foldingStopMarker&&this.foldingStopMarker.test(r)?"end":""},this.getFoldWidgetRange=function(e,t,n){return null},this.indentationBlock=function(e,t,n){var i=/\S/,s=e.getLine(t),o=s.search(i);if(o==-1)return;var u=n||s.length,a=e.getLength(),f=t,l=t;while(++t<a){var c=e.getLine(t).search(i);if(c==-1)continue;if(c<=o){var h=e.getTokenAt(t,0);if(!h||h.type!=="string")break}l=t;}if(l>f){var p=e.getLine(l).length;return new r(f,u,l,p)}},this.openingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i+1},u=e.$findClosingBracket(t,o,s);if(!u)return;var a=e.foldWidgets[u.row];return a==null&&(a=e.getFoldWidget(u.row)),a=="start"&&u.row>o.row&&(u.row--,u.column=e.getLine(u.row).length),r.fromPoints(o,u)},this.closingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i},u=e.$findOpeningBracket(t,o);if(!u)return;return u.column++,o.column--,r.fromPoints(u,o)};}).call(i.prototype);}),ace.define("ace/theme/textmate",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!1,t.cssClass="ace-tm",t.cssText='.ace-tm .ace_gutter {background: #f0f0f0;color: #333;}.ace-tm .ace_print-margin {width: 1px;background: #e8e8e8;}.ace-tm .ace_fold {background-color: #6B72E6;}.ace-tm {background-color: #FFFFFF;color: black;}.ace-tm .ace_cursor {color: black;}.ace-tm .ace_invisible {color: rgb(191, 191, 191);}.ace-tm .ace_storage,.ace-tm .ace_keyword {color: blue;}.ace-tm .ace_constant {color: rgb(197, 6, 11);}.ace-tm .ace_constant.ace_buildin {color: rgb(88, 72, 246);}.ace-tm .ace_constant.ace_language {color: rgb(88, 92, 246);}.ace-tm .ace_constant.ace_library {color: rgb(6, 150, 14);}.ace-tm .ace_invalid {background-color: rgba(255, 0, 0, 0.1);color: red;}.ace-tm .ace_support.ace_function {color: rgb(60, 76, 114);}.ace-tm .ace_support.ace_constant {color: rgb(6, 150, 14);}.ace-tm .ace_support.ace_type,.ace-tm .ace_support.ace_class {color: rgb(109, 121, 222);}.ace-tm .ace_keyword.ace_operator {color: rgb(104, 118, 135);}.ace-tm .ace_string {color: rgb(3, 106, 7);}.ace-tm .ace_comment {color: rgb(76, 136, 107);}.ace-tm .ace_comment.ace_doc {color: rgb(0, 102, 255);}.ace-tm .ace_comment.ace_doc.ace_tag {color: rgb(128, 159, 191);}.ace-tm .ace_constant.ace_numeric {color: rgb(0, 0, 205);}.ace-tm .ace_variable {color: rgb(49, 132, 149);}.ace-tm .ace_xml-pe {color: rgb(104, 104, 91);}.ace-tm .ace_entity.ace_name.ace_function {color: #0000A2;}.ace-tm .ace_heading {color: rgb(12, 7, 255);}.ace-tm .ace_list {color:rgb(185, 6, 144);}.ace-tm .ace_meta.ace_tag {color:rgb(0, 22, 142);}.ace-tm .ace_string.ace_regex {color: rgb(255, 0, 0)}.ace-tm .ace_marker-layer .ace_selection {background: rgb(181, 213, 255);}.ace-tm.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px white;}.ace-tm .ace_marker-layer .ace_step {background: rgb(252, 255, 0);}.ace-tm .ace_marker-layer .ace_stack {background: rgb(164, 229, 101);}.ace-tm .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgb(192, 192, 192);}.ace-tm .ace_marker-layer .ace_active-line {background: rgba(0, 0, 0, 0.07);}.ace-tm .ace_gutter-active-line {background-color : #dcdcdc;}.ace-tm .ace_marker-layer .ace_selected-word {background: rgb(250, 250, 255);border: 1px solid rgb(200, 200, 250);}.ace-tm .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;}',t.$id="ace/theme/textmate";var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass);}),ace.define("ace/line_widgets",["require","exports","module","ace/lib/dom"],function(e,t,n){function i(e){this.session=e,this.session.widgetManager=this,this.session.getRowLength=this.getRowLength,this.session.$getWidgetScreenLength=this.$getWidgetScreenLength,this.updateOnChange=this.updateOnChange.bind(this),this.renderWidgets=this.renderWidgets.bind(this),this.measureWidgets=this.measureWidgets.bind(this),this.session._changedWidgets=[],this.$onChangeEditor=this.$onChangeEditor.bind(this),this.session.on("change",this.updateOnChange),this.session.on("changeFold",this.updateOnFold),this.session.on("changeEditor",this.$onChangeEditor);}var r=e("./lib/dom");(function(){this.getRowLength=function(e){var t;return this.lineWidgets?t=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0:t=0,!this.$useWrapMode||!this.$wrapData[e]?1+t:this.$wrapData[e].length+1+t},this.$getWidgetScreenLength=function(){var e=0;return this.lineWidgets.forEach(function(t){t&&t.rowCount&&!t.hidden&&(e+=t.rowCount);}),e},this.$onChangeEditor=function(e){this.attach(e.editor);},this.attach=function(e){e&&e.widgetManager&&e.widgetManager!=this&&e.widgetManager.detach();if(this.editor==e)return;this.detach(),this.editor=e,e&&(e.widgetManager=this,e.renderer.on("beforeRender",this.measureWidgets),e.renderer.on("afterRender",this.renderWidgets));},this.detach=function(e){var t=this.editor;if(!t)return;this.editor=null,t.widgetManager=null,t.renderer.off("beforeRender",this.measureWidgets),t.renderer.off("afterRender",this.renderWidgets);var n=this.session.lineWidgets;n&&n.forEach(function(e){e&&e.el&&e.el.parentNode&&(e._inDocument=!1,e.el.parentNode.removeChild(e.el));});},this.updateOnFold=function(e,t){var n=t.lineWidgets;if(!n||!e.action)return;var r=e.data,i=r.start.row,s=r.end.row,o=e.action=="add";for(var u=i+1;u<s;u++)n[u]&&(n[u].hidden=o);n[s]&&(o?n[i]?n[s].hidden=o:n[i]=n[s]:(n[i]==n[s]&&(n[i]=undefined),n[s].hidden=o));},this.updateOnChange=function(e){var t=this.session.lineWidgets;if(!t)return;var n=e.start.row,r=e.end.row-n;if(r!==0)if(e.action=="remove"){var i=t.splice(n+1,r);!t[n]&&i[i.length-1]&&(t[n]=i.pop()),i.forEach(function(e){e&&this.removeLineWidget(e);},this),this.$updateRows();}else {var s=new Array(r);t[n]&&t[n].column!=null&&e.start.column>t[n].column&&n++,s.unshift(n,0),t.splice.apply(t,s),this.$updateRows();}},this.$updateRows=function(){var e=this.session.lineWidgets;if(!e)return;var t=!0;e.forEach(function(e,n){if(e){t=!1,e.row=n;while(e.$oldWidget)e.$oldWidget.row=n,e=e.$oldWidget;}}),t&&(this.session.lineWidgets=null);},this.$registerLineWidget=function(e){this.session.lineWidgets||(this.session.lineWidgets=new Array(this.session.getLength()));var t=this.session.lineWidgets[e.row];return t&&(e.$oldWidget=t,t.el&&t.el.parentNode&&(t.el.parentNode.removeChild(t.el),t._inDocument=!1)),this.session.lineWidgets[e.row]=e,e},this.addLineWidget=function(e){this.$registerLineWidget(e),e.session=this.session;if(!this.editor)return e;var t=this.editor.renderer;e.html&&!e.el&&(e.el=r.createElement("div"),e.el.innerHTML=e.html),e.el&&(r.addCssClass(e.el,"ace_lineWidgetContainer"),e.el.style.position="absolute",e.el.style.zIndex=5,t.container.appendChild(e.el),e._inDocument=!0,e.coverGutter||(e.el.style.zIndex=3),e.pixelHeight==null&&(e.pixelHeight=e.el.offsetHeight)),e.rowCount==null&&(e.rowCount=e.pixelHeight/t.layerConfig.lineHeight);var n=this.session.getFoldAt(e.row,0);e.$fold=n;if(n){var i=this.session.lineWidgets;e.row==n.end.row&&!i[n.start.row]?i[n.start.row]=e:e.hidden=!0;}return this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows(),this.renderWidgets(null,t),this.onWidgetChanged(e),e},this.removeLineWidget=function(e){e._inDocument=!1,e.session=null,e.el&&e.el.parentNode&&e.el.parentNode.removeChild(e.el);if(e.editor&&e.editor.destroy)try{e.editor.destroy();}catch(t){}if(this.session.lineWidgets){var n=this.session.lineWidgets[e.row];if(n==e)this.session.lineWidgets[e.row]=e.$oldWidget,e.$oldWidget&&this.onWidgetChanged(e.$oldWidget);else while(n){if(n.$oldWidget==e){n.$oldWidget=e.$oldWidget;break}n=n.$oldWidget;}}this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows();},this.getWidgetsAtRow=function(e){var t=this.session.lineWidgets,n=t&&t[e],r=[];while(n)r.push(n),n=n.$oldWidget;return r},this.onWidgetChanged=function(e){this.session._changedWidgets.push(e),this.editor&&this.editor.renderer.updateFull();},this.measureWidgets=function(e,t){var n=this.session._changedWidgets,r=t.layerConfig;if(!n||!n.length)return;var i=Infinity;for(var s=0;s<n.length;s++){var o=n[s];if(!o||!o.el)continue;if(o.session!=this.session)continue;if(!o._inDocument){if(this.session.lineWidgets[o.row]!=o)continue;o._inDocument=!0,t.container.appendChild(o.el);}o.h=o.el.offsetHeight,o.fixedWidth||(o.w=o.el.offsetWidth,o.screenWidth=Math.ceil(o.w/r.characterWidth));var u=o.h/r.lineHeight;o.coverLine&&(u-=this.session.getRowLineCount(o.row),u<0&&(u=0)),o.rowCount!=u&&(o.rowCount=u,o.row<i&&(i=o.row));}i!=Infinity&&(this.session._emit("changeFold",{data:{start:{row:i}}}),this.session.lineWidgetWidth=null),this.session._changedWidgets=[];},this.renderWidgets=function(e,t){var n=t.layerConfig,r=this.session.lineWidgets;if(!r)return;var i=Math.min(this.firstRow,n.firstRow),s=Math.max(this.lastRow,n.lastRow,r.length);while(i>0&&!r[i])i--;this.firstRow=n.firstRow,this.lastRow=n.lastRow,t.$cursorLayer.config=n;for(var o=i;o<=s;o++){var u=r[o];if(!u||!u.el)continue;if(u.hidden){u.el.style.top=-100-(u.pixelHeight||0)+"px";continue}u._inDocument||(u._inDocument=!0,t.container.appendChild(u.el));var a=t.$cursorLayer.getPixelPosition({row:o,column:0},!0).top;u.coverLine||(a+=n.lineHeight*this.session.getRowLineCount(u.row)),u.el.style.top=a-n.offset+"px";var f=u.coverGutter?0:t.gutterWidth;u.fixedWidth||(f-=t.scrollLeft),u.el.style.left=f+"px",u.fullWidth&&u.screenWidth&&(u.el.style.minWidth=n.width+2*n.padding+"px"),u.fixedWidth?u.el.style.right=t.scrollBar.getWidth()+"px":u.el.style.right="";}};}).call(i.prototype),t.LineWidgets=i;}),ace.define("ace/ext/error_marker",["require","exports","module","ace/line_widgets","ace/lib/dom","ace/range"],function(e,t,n){function o(e,t,n){var r=0,i=e.length-1;while(r<=i){var s=r+i>>1,o=n(t,e[s]);if(o>0)r=s+1;else {if(!(o<0))return s;i=s-1;}}return -(r+1)}function u(e,t,n){var r=e.getAnnotations().sort(s.comparePoints);if(!r.length)return;var i=o(r,{row:t,column:-1},s.comparePoints);i<0&&(i=-i-1),i>=r.length?i=n>0?0:r.length-1:i===0&&n<0&&(i=r.length-1);var u=r[i];if(!u||!n)return;if(u.row===t){do u=r[i+=n];while(u&&u.row===t);if(!u)return r.slice()}var a=[];t=u.row;do a[n<0?"unshift":"push"](u),u=r[i+=n];while(u&&u.row==t);return a.length&&a}var r=e("../line_widgets").LineWidgets,i=e("../lib/dom"),s=e("../range").Range;t.showErrorMarker=function(e,t){var n=e.session;n.widgetManager||(n.widgetManager=new r(n),n.widgetManager.attach(e));var s=e.getCursorPosition(),o=s.row,a=n.widgetManager.getWidgetsAtRow(o).filter(function(e){return e.type=="errorMarker"})[0];a?a.destroy():o-=t;var f=u(n,o,t),l;if(f){var c=f[0];s.column=(c.pos&&typeof c.column!="number"?c.pos.sc:c.column)||0,s.row=c.row,l=e.renderer.$gutterLayer.$annotations[s.row];}else {if(a)return;l={text:["Looks good!"],className:"ace_ok"};}e.session.unfold(s.row),e.selection.moveToPosition(s);var h={row:s.row,fixedWidth:!0,coverGutter:!0,el:i.createElement("div"),type:"errorMarker"},p=h.el.appendChild(i.createElement("div")),d=h.el.appendChild(i.createElement("div"));d.className="error_widget_arrow "+l.className;var v=e.renderer.$cursorLayer.getPixelPosition(s).left;d.style.left=v+e.renderer.gutterWidth-5+"px",h.el.className="error_widget_wrapper",p.className="error_widget "+l.className,p.innerHTML=l.text.join("<br>"),p.appendChild(i.createElement("div"));var m=function(e,t,n){if(t===0&&(n==="esc"||n==="return"))return h.destroy(),{command:"null"}};h.destroy=function(){if(e.$mouseHandler.isMousePressed)return;e.keyBinding.removeKeyboardHandler(m),n.widgetManager.removeLineWidget(h),e.off("changeSelection",h.destroy),e.off("changeSession",h.destroy),e.off("mouseup",h.destroy),e.off("change",h.destroy);},e.keyBinding.addKeyboardHandler(m),e.on("changeSelection",h.destroy),e.on("changeSession",h.destroy),e.on("mouseup",h.destroy),e.on("change",h.destroy),e.session.widgetManager.addLineWidget(h),h.el.onmousedown=e.focus.bind(e),e.renderer.scrollCursorIntoView(null,.5,{bottom:h.el.offsetHeight});},i.importCssString("    .error_widget_wrapper {        background: inherit;        color: inherit;        border:none    }    .error_widget {        border-top: solid 2px;        border-bottom: solid 2px;        margin: 5px 0;        padding: 10px 40px;        white-space: pre-wrap;    }    .error_widget.ace_error, .error_widget_arrow.ace_error{        border-color: #ff5a5a    }    .error_widget.ace_warning, .error_widget_arrow.ace_warning{        border-color: #F1D817    }    .error_widget.ace_info, .error_widget_arrow.ace_info{        border-color: #5a5a5a    }    .error_widget.ace_ok, .error_widget_arrow.ace_ok{        border-color: #5aaa5a    }    .error_widget_arrow {        position: absolute;        border: solid 5px;        border-top-color: transparent!important;        border-right-color: transparent!important;        border-left-color: transparent!important;        top: -5px;    }","");}),ace.define("ace/ace",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/dom","ace/lib/event","ace/range","ace/editor","ace/edit_session","ace/undomanager","ace/virtual_renderer","ace/worker/worker_client","ace/keyboard/hash_handler","ace/placeholder","ace/multi_select","ace/mode/folding/fold_mode","ace/theme/textmate","ace/ext/error_marker","ace/config"],function(e,t,n){e("./lib/fixoldbrowsers");var r=e("./lib/dom"),i=e("./lib/event"),s=e("./range").Range,o=e("./editor").Editor,u=e("./edit_session").EditSession,a=e("./undomanager").UndoManager,f=e("./virtual_renderer").VirtualRenderer;e("./worker/worker_client"),e("./keyboard/hash_handler"),e("./placeholder"),e("./multi_select"),e("./mode/folding/fold_mode"),e("./theme/textmate"),e("./ext/error_marker"),t.config=e("./config"),t.require=e,t.edit=function(e,n){if(typeof e=="string"){var s=e;e=document.getElementById(s);if(!e)throw new Error("ace.edit can't find div #"+s)}if(e&&e.env&&e.env.editor instanceof o)return e.env.editor;var u="";if(e&&/input|textarea/i.test(e.tagName)){var a=e;u=a.value,e=r.createElement("pre"),a.parentNode.replaceChild(e,a);}else e&&(u=e.textContent,e.innerHTML="");var l=t.createEditSession(u),c=new o(new f(e),l,n),h={document:l,editor:c,onResize:c.resize.bind(c,null)};return a&&(h.textarea=a),i.addListener(window,"resize",h.onResize),c.on("destroy",function(){i.removeListener(window,"resize",h.onResize),h.editor.container.env=null;}),c.container.env=c.env=h,c},t.createEditSession=function(e,t){var n=new u(e,t);return n.setUndoManager(new a),n},t.Range=s,t.Editor=o,t.EditSession=u,t.UndoManager=a,t.VirtualRenderer=f,t.version=t.config.version;});            (function() {
                  ace.require(["ace/ace"], function(a) {
                      if (a) {
                          a.config.init(true);
                          a.define = ace.define;
                      }
                      if (!window.ace)
                          window.ace = a;
                      for (var key in a) if (a.hasOwnProperty(key))
                          window.ace[key] = a[key];
                      window.ace["default"] = window.ace;
                      if ( module) {
                          module.exports = window.ace;
                      }
                  });
              })();
  });

  /**
   * @module bindings/ace
   */
  const Range = ace_1.require('ace/range').Range;

  /**
 * A SimpleDiff describes a change on a String.
 *
 * ```js
 * console.log(a) // the old value
 * console.log(b) // the updated value
 * // Apply changes of diff (pseudocode)
 * a.remove(diff.index, diff.remove) // Remove `diff.remove` characters
 * a.insert(diff.index, diff.insert) // Insert `diff.insert`
 * a === b // values match
 * ```
 *
 * @typedef {Object} SimpleDiff
 * @property {Number} index The index where changes were applied
 * @property {Number} remove The number of characters to delete starting
 *                                  at `index`.
 * @property {T} insert The new text to insert at `index` after applying
 *                           `delete`
 *
 * @template T
 */

/**
 * Create a diff between two strings. This diff implementation is highly
 * efficient, but not very sophisticated.
 *
 * @function
 *
 * @param {string} a The old version of the string
 * @param {string} b The updated version of the string
 * @return {SimpleDiff<string>} The diff description.
 */
const simpleDiffString = (a, b) => {
  let left = 0 // number of same characters counting from left
  let right = 0 // number of same characters counting from right
  while (left < a.length && left < b.length && a[left] === b[left]) {
    left++
  }
  if (left !== a.length || left !== b.length) {
    // Only check right if a !== b
    while (right + left < a.length && right + left < b.length && a[a.length - right - 1] === b[b.length - right - 1]) {
      right++
    }
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right)
  }
}

/**
 * @todo Remove in favor of simpleDiffString
 * @deprecated
 */
const simpleDiff = simpleDiffString

/**
 * Create a diff between two arrays. This diff implementation is highly
 * efficient, but not very sophisticated.
 *
 * Note: This is basically the same function as above. Another function was created so that the runtime
 * can better optimize these function calls.
 *
 * @function
 * @template T
 *
 * @param {Array<T>} a The old version of the array
 * @param {Array<T>} b The updated version of the array
 * @param {function(T, T):boolean} [compare]
 * @return {SimpleDiff<Array<T>>} The diff description.
 */
const simpleDiffArray = (a, b, compare = equalityStrict) => {
  let left = 0 // number of same characters counting from left
  let right = 0 // number of same characters counting from right
  while (left < a.length && left < b.length && compare(a[left], b[left])) {
    left++
  }
  if (left !== a.length || left !== b.length) {
    // Only check right if a !== b
    while (right + left < a.length && right + left < b.length && compare(a[a.length - right - 1], b[b.length - right - 1])) {
      right++
    }
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right)
  }
}

  /*
    AceCursors // cc teddavis.org 2021
    Small class for tracking cursors/selection in Ace Editor
   */
  class AceCursors{
    constructor(ace){
      this.ace = ace;
      this.marker = {};
      this.marker.self = this;
      this.markerID = {};
      this.marker.cursors = [];
      this.aceID = this.ace.container.id;

      this.marker.update = function(html, markerLayer, session, config) {
        let start = config.firstRow, end = config.lastRow;
        let cursors = this.cursors;

        for (let i = 0; i < cursors.length; i++) {
          let pos = this.cursors[i];
          if (pos.row < start) {
            continue
          } else if (pos.row > end) {
            break
          } else {
            // compute cursor position on screen
            // this code is based on ace/layer/marker.js
            let screenPos = session.documentToScreenPosition(pos.row, pos.column);
            let aceGutter = document.getElementsByClassName('ace_gutter')[0].offsetWidth;
            let height = config.lineHeight;
            let width = config.characterWidth;
            let top = markerLayer.$getTop(screenPos.row, config);
            let left = markerLayer.$padding + aceGutter + screenPos.column * width;

            // draw cursor and flag
            let el = document.getElementById(this.self.aceID + '_cursor_' + pos.id);
            if(el == undefined){
              el = document.createElement('div');
              el.id = this.self.aceID + '_cursor_' + pos.id;
              el.className = 'cursor';
              el.style.position = 'absolute';
              el.innerHTML = '<div class="cursor-label" style="background: '+pos.color+';top: -1.8em;white-space: nowrap;">'+pos.name+'</div>';
              this.self.ace.container.appendChild(el);
            }else {
              el.style.height = height + 'px';
              el.style.width = width + 'px';
              el.style.top = top + 'px';
              el.style.left = left + 'px';
              el.style.borderLeft = '2px solid ' + pos.color;
              el.style.zIndex = 100;
              el.style.color = '#000';
              el.style.cursor = 'help';
            }
          }
        }

      };

      this.marker.redraw = function() {
        this.session._signal('changeFrontMarker');
      };

      this.marker.session = this.ace.getSession();
      this.marker.session.addDynamicMarker(this.marker, true);
    }

    updateCursors(cur, cid){
      if(cur !== undefined && cur.hasOwnProperty('cursor')){
        let c = cur.cursor;
        let pos = this.ace.getSession().doc.indexToPosition(c.pos);

        let curCursor = {row:pos.row, column:pos.column, color:c.color, id:c.id, name:c.name};

         // handle selection
         if(c.sel){
          if(this.markerID[c.id] !== undefined && this.markerID[c.id].hasOwnProperty('sel') && this.markerID[c.id].sel !== undefined){
            this.ace.session.removeMarker(this.markerID[c.id].sel);
            this.markerID[c.id].sel = undefined;
          }

          let anchor = this.ace.getSession().doc.indexToPosition(c.anchor);
          let head = this.ace.getSession().doc.indexToPosition(c.head);

          let customStyle = document.getElementById('style_' + c.id);
          if(customStyle){
            customStyle.innerHTML = '.selection-' + c.id + ' { position: absolute; z-index: 20; opacity: 0.5; background: '+c.color+'; }';
          }else {
            let style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'style_' + c.id;
            document.getElementsByTagName('head')[0].appendChild(style);
          }

          this.markerID[c.id] = {id:c.id, sel:this.ace.session.addMarker(new Range(anchor.row, anchor.column, head.row, head.column), 'selection-' + c.id, 'text')};
        }else {
          if(this.markerID[c.id] !== undefined && this.markerID[c.id].hasOwnProperty('sel') && this.markerID[c.id].sel !== undefined){
            this.ace.session.removeMarker(this.markerID[c.id].sel);
            this.markerID[c.id].sel = undefined;
          }
        }

        this.marker.cursors.push(curCursor);
      }else {
        let el = document.getElementById(this.aceID + '_cursor_'+cid);
        if(el){
          el.parentNode.removeChild(el);
          if(this.markerID[cid] !== undefined && this.markerID[cid].hasOwnProperty('sel') && this.markerID[cid].sel !== undefined){
            this.ace.session.removeMarker(this.markerID[cid].sel);
            this.markerID[cid].sel = undefined;
          }
        }
      }
    }
  }


  class AceBinding {
    /**
     * @param {Y.Text} type
     * @param {any} ace
     * @param {Awareness} [awareness]
     * @param {{ yUndoManager?: Y.UndoManager }} [options]
     */
    constructor (type, ace, awareness, { yUndoManager = null} = {}) {
      const mux = createMutex();
      const doc = /** @type {Y.Doc} */ (type.doc);
      this.mux = mux;
      this.type = type;
      this.doc = doc;
      this.ace = ace;
      this.ace.session.getUndoManager().reset();
      this.aceCursors = new AceCursors(this.ace);

      
    this.yUndoManager = yUndoManager
    if (yUndoManager) {
      yUndoManager.trackedOrigins.add(this) // track changes performed by this editor binding
      const editorUndo = () => {
        yUndoManager.undo()
      }
      const editorRedo = () => {
        yUndoManager.redo()
      }

      this.ace.commands.addCommand({
        name: 'undo',
        bindKey: {win: 'Ctrl-Z', mac: 'Command-Z'},
        exec: editorUndo
      })
      this.ace.commands.addCommand({
        name: 'redo',
        bindKey: {win: 'Ctrl-Y', mac: 'Command-Y'},
        exec: editorRedo
      })
      
      yUndoManager.on('stack-item-added', this._onStackItemAdded)
      yUndoManager.on('stack-item-popped', this._onStackItemPopped)
    }

      this.awareness = awareness;
      this._awarenessChange = ({ added, removed, updated }) => {
        this.aceCursors.marker.cursors = [];
        const states = /** @type {Awareness} */ (this.awareness).getStates();
        added.forEach(id => {
          // console.log('added: ' + id)
          this.aceCursors.updateCursors(states.get(id), id);
        });
        updated.forEach(id => {
          // console.log('updated: ' + id)
          this.aceCursors.updateCursors(states.get(id), id);
        });
        removed.forEach(id => {
          // console.log('removed: ' + id)
          this.aceCursors.updateCursors(states.get(id), id);
        });

        this.aceCursors.marker.redraw();
      };

      this._typeObserver = event => {
        const aceDocument = this.ace.getSession().getDocument();
        // console.log('>>Yjs: type event', event)
        mux(() => {
          const delta = event.delta;
          let currentPos = 0;
          for (const op of delta) {
            if (op.retain) {
              currentPos += op.retain;
            } else if (op.insert) {
              const start = aceDocument.indexToPosition(currentPos, 0);
              aceDocument.insert(start, op.insert);
              currentPos += op.insert.length;
              // console.log('>>>Yjs: inserting at position:', start)
              // console.log('>>>Yjs: inserting text:', op.insert)
            } else if (op.delete) {
              const start = aceDocument.indexToPosition(currentPos, 0);
              const end = aceDocument.indexToPosition(currentPos + op.delete, 0);
              const range = new Range(start.row, start.column, end.row, end.column);
              aceDocument.remove(range);
              // console.log('>>>Yjs: removing at', start, end)
            }
          }
          this._cursorObserver();
        });
      };
      type.observe(this._typeObserver);

      this._aceObserver = (eventType, delta) => {
        const aceDocument = this.ace.getSession().getDocument();
          mux(() => {
            this.type.doc.transact(() => {
              if (eventType.lines.length > 1) {
                // If there are several consecutive changes, we can't reliably compute the positions anymore.
                // Instead, we will compute the diff and apply the changes
                const d = simpleDiffString(this.type.toString(), aceDocument.getValue())
                console.log('>>>Ace Observer: diff', {diff: d})
                this.type.delete(d.index, d.remove)
                this.type.insert(d.index, d.insert)
              } else {
                if (eventType.action === 'insert') {
                  const start = aceDocument.positionToIndex(eventType.start, 0);
                  // console.log('>>>Ace: inserting at index: ', start);
    
                  if (window.navigator.userAgent.indexOf('Win') != -1) {
                    eventType.lines.forEach(line => line.replaceAll('\r', ''))
                  }
                  // console.log('>>>Ace: Event lines:', eventType.lines)
                  type.insert(start, eventType.lines.join('\n'));
                } else if (eventType.action === 'remove') {
                  const start = aceDocument.positionToIndex(eventType.start, 0);
                  // console.log('>>>Ace: Deleting at index: ', start);
                  if (window.navigator.userAgent.indexOf('Win') != -1) {
                    eventType.lines.forEach(line => line.replaceAll('\r', ''))
                  }
                  const length = eventType.lines.join('\n').length;
                  type.delete(start, length);
                }
              }
              type.applyDelta(eventType);
              this._cursorObserver();
            }, this)
          });
      };
      this.ace.on('change', this._aceObserver);

      this._cursorObserver = () => {
        let user = this.awareness.getLocalState().user;
        let curSel = this.ace.getSession().selection;
        let cursor = {id:doc.clientID, name:user.name, sel:true, color:user.color};

        let indexAnchor = this.ace.getSession().doc.positionToIndex(curSel.getSelectionAnchor());
        let indexHead = this.ace.getSession().doc.positionToIndex(curSel.getSelectionLead());
        cursor.anchor = indexAnchor;
        cursor.head = indexHead;

        // flip if selected right to left
        if(indexAnchor  > indexHead){
          cursor.anchor = indexHead;
          cursor.head = indexAnchor;
        }

        cursor.pos = cursor.head;

        if(cursor.anchor === cursor.head){
          cursor.sel = false;
        }

        const aw = /** @type {any} */ (this.awareness.getLocalState());
        if (curSel === null) {
          if (this.awareness.getLocalState() !== null) {
            this.awareness.setLocalStateField('cursor', /** @type {any} */ (null));
          }
        } else {
          if (!aw || !aw.cursor || cursor.anchor !== aw.cursor.anchor || cursor.head  !== aw.cursor.head) {
            this.awareness.setLocalStateField('cursor', cursor);

            // const { row, column} = EDITOR.selection.getCursor();
            // const item = humdrumDataNoteIntoView(row, column);
            // if (item) {
            //   markItem(item);
            //   updateSingleSelect(item, { text: user.name, color: user.color });

            //   // const { user, cursor } = this.awareness.getLocalState();
            //   this.awareness.setLocalStateField('cursor', { itemId: item.id, ...cursor });
            // } 
            // else { 
            //   this.awareness.setLocalStateField('cursor', cursor);
            // }
          }
        }
      };

      // update cursors
      this.ace.getSession().selection.on('changeCursor', ()=>this._cursorObserver());

      if (this.awareness) {
        this.awareness.on('change', this._awarenessChange);
      }
    }

    destroy () {
      console.log('destroyed');
      this.type.unobserve(this._typeObserver);
      this.ace.off('change', this._aceObserver);
      if (this.awareness) {
        this.awareness.off('change', this._awarenessChange);
      }
      if (this.yUndoManager) {
        this.yUndoManager.off('stack-item-added', this._onStackItemAdded)
        this.yUndoManager.off('stack-item-popped', this._onStackItemPopped)
        this.yUndoManager.trackedOrigins.delete(this)
      }
    }
  }



  var modeJavascript = createCommonjsModule(function (module, exports) {
  ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){this.$rules={start:[{token:"comment.doc.tag",regex:"@[\\w\\d_]+"},s.getTagRule(),{defaultToken:"comment.doc",caseInsensitive:!0}]};};r.inherits(s,i),s.getTagRule=function(e){return {token:"comment.doc.tag.storage.type",regex:"\\b(?:TODO|FIXME|XXX|HACK)\\b"}},s.getStartRule=function(e){return {token:"comment.doc",regex:"\\/\\*(?=\\*)",next:e}},s.getEndRule=function(e){return {token:"comment.doc",regex:"\\*\\/",next:e}},t.DocCommentHighlightRules=s;}),ace.define("ace/mode/javascript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"],function(e,t,n){function a(){var e=o.replace("\\d","\\d\\-"),t={onMatch:function(e,t,n){var r=e.charAt(1)=="/"?2:1;if(r==1)t!=this.nextState?n.unshift(this.next,this.nextState,0):n.unshift(this.next),n[2]++;else if(r==2&&t==this.nextState){n[1]--;if(!n[1]||n[1]<0)n.shift(),n.shift();}return [{type:"meta.tag.punctuation."+(r==1?"":"end-")+"tag-open.xml",value:e.slice(0,r)},{type:"meta.tag.tag-name.xml",value:e.substr(r)}]},regex:"</?"+e+"",next:"jsxAttributes",nextState:"jsx"};this.$rules.start.unshift(t);var n={regex:"{",token:"paren.quasi.start",push:"start"};this.$rules.jsx=[n,t,{include:"reference"},{defaultToken:"string"}],this.$rules.jsxAttributes=[{token:"meta.tag.punctuation.tag-close.xml",regex:"/?>",onMatch:function(e,t,n){return t==n[0]&&n.shift(),e.length==2&&(n[0]==this.nextState&&n[1]--,(!n[1]||n[1]<0)&&n.splice(0,2)),this.next=n[0]||"start",[{type:this.token,value:e}]},nextState:"jsx"},n,f("jsxAttributes"),{token:"entity.other.attribute-name.xml",regex:e},{token:"keyword.operator.attribute-equals.xml",regex:"="},{token:"text.tag-whitespace.xml",regex:"\\s+"},{token:"string.attribute-value.xml",regex:"'",stateName:"jsx_attr_q",push:[{token:"string.attribute-value.xml",regex:"'",next:"pop"},{include:"reference"},{defaultToken:"string.attribute-value.xml"}]},{token:"string.attribute-value.xml",regex:'"',stateName:"jsx_attr_qq",push:[{token:"string.attribute-value.xml",regex:'"',next:"pop"},{include:"reference"},{defaultToken:"string.attribute-value.xml"}]},t],this.$rules.reference=[{token:"constant.language.escape.reference.xml",regex:"(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"}];}function f(e){return [{token:"comment",regex:/\/\*/,next:[i.getTagRule(),{token:"comment",regex:"\\*\\/",next:e||"pop"},{defaultToken:"comment",caseInsensitive:!0}]},{token:"comment",regex:"\\/\\/",next:[i.getTagRule(),{token:"comment",regex:"$|^",next:e||"pop"},{defaultToken:"comment",caseInsensitive:!0}]}]}var r=e("../lib/oop"),i=e("./doc_comment_highlight_rules").DocCommentHighlightRules,s=e("./text_highlight_rules").TextHighlightRules,o="[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*",u=function(e){var t=this.createKeywordMapper({"variable.language":"Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|Namespace|QName|XML|XMLList|ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|SyntaxError|TypeError|URIError|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|isNaN|parseFloat|parseInt|JSON|Math|this|arguments|prototype|window|document",keyword:"const|yield|import|get|set|async|await|break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|__parent__|__count__|escape|unescape|with|__proto__|class|enum|extends|super|export|implements|private|public|interface|package|protected|static","storage.type":"const|let|var|function","constant.language":"null|Infinity|NaN|undefined","support.function":"alert","constant.language.boolean":"true|false"},"identifier"),n="case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void",r="\\\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|u{[0-9a-fA-F]{1,6}}|[0-2][0-7]{0,2}|3[0-7][0-7]?|[4-7][0-7]?|.)";this.$rules={no_regex:[i.getStartRule("doc-start"),f("no_regex"),{token:"string",regex:"'(?=.)",next:"qstring"},{token:"string",regex:'"(?=.)',next:"qqstring"},{token:"constant.numeric",regex:/0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/},{token:"constant.numeric",regex:/(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/},{token:["storage.type","punctuation.operator","support.function","punctuation.operator","entity.name.function","text","keyword.operator"],regex:"("+o+")(\\.)(prototype)(\\.)("+o+")(\\s*)(=)",next:"function_arguments"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","paren.lparen"],regex:"("+o+")(\\.)("+o+")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["entity.name.function","text","keyword.operator","text","storage.type","text","paren.lparen"],regex:"("+o+")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","entity.name.function","text","paren.lparen"],regex:"("+o+")(\\.)("+o+")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",next:"function_arguments"},{token:["storage.type","text","entity.name.function","text","paren.lparen"],regex:"(function)(\\s+)("+o+")(\\s*)(\\()",next:"function_arguments"},{token:["entity.name.function","text","punctuation.operator","text","storage.type","text","paren.lparen"],regex:"("+o+")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:["text","text","storage.type","text","paren.lparen"],regex:"(:)(\\s*)(function)(\\s*)(\\()",next:"function_arguments"},{token:"keyword",regex:"from(?=\\s*('|\"))"},{token:"keyword",regex:"(?:"+n+")\\b",next:"start"},{token:["support.constant"],regex:/that\b/},{token:["storage.type","punctuation.operator","support.function.firebug"],regex:/(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/},{token:t,regex:o},{token:"punctuation.operator",regex:/[.](?![.])/,next:"property"},{token:"storage.type",regex:/=>/,next:"start"},{token:"keyword.operator",regex:/--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,next:"start"},{token:"punctuation.operator",regex:/[?:,;.]/,next:"start"},{token:"paren.lparen",regex:/[\[({]/,next:"start"},{token:"paren.rparen",regex:/[\])}]/},{token:"comment",regex:/^#!.*$/}],property:[{token:"text",regex:"\\s+"},{token:["storage.type","punctuation.operator","entity.name.function","text","keyword.operator","text","storage.type","text","entity.name.function","text","paren.lparen"],regex:"("+o+")(\\.)("+o+")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",next:"function_arguments"},{token:"punctuation.operator",regex:/[.](?![.])/},{token:"support.function",regex:/(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/},{token:"support.function.dom",regex:/(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/},{token:"support.constant",regex:/(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/},{token:"identifier",regex:o},{regex:"",token:"empty",next:"no_regex"}],start:[i.getStartRule("doc-start"),f("start"),{token:"string.regexp",regex:"\\/",next:"regex"},{token:"text",regex:"\\s+|^$",next:"start"},{token:"empty",regex:"",next:"no_regex"}],regex:[{token:"regexp.keyword.operator",regex:"\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"},{token:"string.regexp",regex:"/[sxngimy]*",next:"no_regex"},{token:"invalid",regex:/\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/},{token:"constant.language.escape",regex:/\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/},{token:"constant.language.delimiter",regex:/\|/},{token:"constant.language.escape",regex:/\[\^?/,next:"regex_character_class"},{token:"empty",regex:"$",next:"no_regex"},{defaultToken:"string.regexp"}],regex_character_class:[{token:"regexp.charclass.keyword.operator",regex:"\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"},{token:"constant.language.escape",regex:"]",next:"regex"},{token:"constant.language.escape",regex:"-"},{token:"empty",regex:"$",next:"no_regex"},{defaultToken:"string.regexp.charachterclass"}],function_arguments:[{token:"variable.parameter",regex:o},{token:"punctuation.operator",regex:"[, ]+"},{token:"punctuation.operator",regex:"$"},{token:"empty",regex:"",next:"no_regex"}],qqstring:[{token:"constant.language.escape",regex:r},{token:"string",regex:"\\\\$",consumeLineEnd:!0},{token:"string",regex:'"|$',next:"no_regex"},{defaultToken:"string"}],qstring:[{token:"constant.language.escape",regex:r},{token:"string",regex:"\\\\$",consumeLineEnd:!0},{token:"string",regex:"'|$",next:"no_regex"},{defaultToken:"string"}]};if(!e||!e.noES6)this.$rules.no_regex.unshift({regex:"[{}]",onMatch:function(e,t,n){this.next=e=="{"?this.nextState:"";if(e=="{"&&n.length)n.unshift("start",t);else if(e=="}"&&n.length){n.shift(),this.next=n.shift();if(this.next.indexOf("string")!=-1||this.next.indexOf("jsx")!=-1)return "paren.quasi.end"}return e=="{"?"paren.lparen":"paren.rparen"},nextState:"start"},{token:"string.quasi.start",regex:/`/,push:[{token:"constant.language.escape",regex:r},{token:"paren.quasi.start",regex:/\${/,push:"start"},{token:"string.quasi.end",regex:/`/,next:"pop"},{defaultToken:"string.quasi"}]}),(!e||e.jsx!=0)&&a.call(this);this.embedRules(i,"doc-",[i.getEndRule("no_regex")]),this.normalizeRules();};r.inherits(u,s),t.JavaScriptHighlightRules=u;}),ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"],function(e,t,n){var r=e("../range").Range,i=function(){};(function(){this.checkOutdent=function(e,t){return /^\s+$/.test(e)?/^\s*\}/.test(t):!1},this.autoOutdent=function(e,t){var n=e.getLine(t),i=n.match(/^(\s*\})/);if(!i)return 0;var s=i[1].length,o=e.findMatchingBracket({row:t,column:s});if(!o||o.row==t)return 0;var u=this.$getIndent(e.getLine(o.row));e.replace(new r(t,0,t,s-1),u);},this.$getIndent=function(e){return e.match(/^\s*/)[0]};}).call(i.prototype),t.MatchingBraceOutdent=i;}),ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){var r=e("../../lib/oop"),i=e("../../range").Range,s=e("./fold_mode").FoldMode,o=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)));};r.inherits(o,s),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);if(this.singleLineBlockCommentRe.test(r)&&!this.startRegionRe.test(r)&&!this.tripleStarBlockCommentRe.test(r))return "";var i=this._getFoldWidgetBase(e,t,n);return !i&&this.startRegionRe.test(r)?"start":i},this.getFoldWidgetRange=function(e,t,n,r){var i=e.getLine(n);if(this.startRegionRe.test(i))return this.getCommentRegionBlock(e,i,n);var s=i.match(this.foldingStartMarker);if(s){var o=s.index;if(s[1])return this.openingBracketBlock(e,s[1],n,o);var u=e.getCommentFoldRange(n,o+s[0].length,1);return u&&!u.isMultiLine()&&(r?u=this.getSectionRange(e,n):t!="all"&&(u=null)),u}if(t==="markbegin")return;var s=i.match(this.foldingStopMarker);if(s){var o=s.index+s[0].length;return s[1]?this.closingBracketBlock(e,s[1],n,o):e.getCommentFoldRange(n,o,-1)}},this.getSectionRange=function(e,t){var n=e.getLine(t),r=n.search(/\S/),s=t,o=n.length;t+=1;var u=t,a=e.getLength();while(++t<a){n=e.getLine(t);var f=n.search(/\S/);if(f===-1)continue;if(r>f)break;var l=this.getFoldWidgetRange(e,"all",t);if(l){if(l.start.row<=s)break;if(l.isMultiLine())t=l.end.row;else if(r==f)break}u=t;}return new i(s,o,u,e.getLine(u).length)},this.getCommentRegionBlock=function(e,t,n){var r=t.search(/\s*$/),s=e.getLength(),o=n,u=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,a=1;while(++n<s){t=e.getLine(n);var f=u.exec(t);if(!f)continue;f[1]?a--:a++;if(!a)break}var l=n;if(l>o)return new i(o,r,l,t.length)};}.call(o.prototype);}),ace.define("ace/mode/javascript",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/javascript_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"],function(e,t,n){var r=e("../lib/oop"),i=e("./text").Mode,s=e("./javascript_highlight_rules").JavaScriptHighlightRules,o=e("./matching_brace_outdent").MatchingBraceOutdent,u=e("../worker/worker_client").WorkerClient,a=e("./behaviour/cstyle").CstyleBehaviour,f=e("./folding/cstyle").FoldMode,l=function(){this.HighlightRules=s,this.$outdent=new o,this.$behaviour=new a,this.foldingRules=new f;};r.inherits(l,i),function(){this.lineCommentStart="//",this.blockComment={start:"/*",end:"*/"},this.$quotes={'"':'"',"'":"'","`":"`"},this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t),i=this.getTokenizer().getLineTokens(t,e),s=i.tokens,o=i.state;if(s.length&&s[s.length-1].type=="comment")return r;if(e=="start"||e=="no_regex"){var u=t.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);u&&(r+=n);}else if(e=="doc-start"){if(o=="start"||o=="no_regex")return "";var u=t.match(/^\s*(\/?)\*/);u&&(u[1]&&(r+=" "),r+="* ");}return r},this.checkOutdent=function(e,t,n){return this.$outdent.checkOutdent(t,n)},this.autoOutdent=function(e,t,n){this.$outdent.autoOutdent(t,n);},this.createWorker=function(e){var t=new u(["ace"],"ace/mode/javascript_worker","JavaScriptWorker");return t.attachToDocument(e.getDocument()),t.on("annotate",function(t){e.setAnnotations(t.data);}),t.on("terminate",function(){e.clearAnnotations();}),t},this.$id="ace/mode/javascript",this.snippetFileId="ace/snippets/javascript";}.call(l.prototype),t.Mode=l;});                (function() {
                      ace.require(["ace/mode/javascript"], function(m) {
                          if ( module) {
                              module.exports = m;
                          }
                      });
                  })();
  });

  var themeMonokai = createCommonjsModule(function (module, exports) {
  ace.define("ace/theme/monokai",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!0,t.cssClass="ace-monokai",t.cssText=".ace-monokai .ace_gutter {background: #2F3129;color: #8F908A}.ace-monokai .ace_print-margin {width: 1px;background: #555651}.ace-monokai {background-color: #272822;color: #F8F8F2}.ace-monokai .ace_cursor {color: #F8F8F0}.ace-monokai .ace_marker-layer .ace_selection {background: #49483E}.ace-monokai.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px #272822;}.ace-monokai .ace_marker-layer .ace_step {background: rgb(102, 82, 0)}.ace-monokai .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid #49483E}.ace-monokai .ace_marker-layer .ace_active-line {background: #202020}.ace-monokai .ace_gutter-active-line {background-color: #272727}.ace-monokai .ace_marker-layer .ace_selected-word {border: 1px solid #49483E}.ace-monokai .ace_invisible {color: #52524d}.ace-monokai .ace_entity.ace_name.ace_tag,.ace-monokai .ace_keyword,.ace-monokai .ace_meta.ace_tag,.ace-monokai .ace_storage {color: #F92672}.ace-monokai .ace_punctuation,.ace-monokai .ace_punctuation.ace_tag {color: #fff}.ace-monokai .ace_constant.ace_character,.ace-monokai .ace_constant.ace_language,.ace-monokai .ace_constant.ace_numeric,.ace-monokai .ace_constant.ace_other {color: #AE81FF}.ace-monokai .ace_invalid {color: #F8F8F0;background-color: #F92672}.ace-monokai .ace_invalid.ace_deprecated {color: #F8F8F0;background-color: #AE81FF}.ace-monokai .ace_support.ace_constant,.ace-monokai .ace_support.ace_function {color: #66D9EF}.ace-monokai .ace_fold {background-color: #A6E22E;border-color: #F8F8F2}.ace-monokai .ace_storage.ace_type,.ace-monokai .ace_support.ace_class,.ace-monokai .ace_support.ace_type {font-style: italic;color: #66D9EF}.ace-monokai .ace_entity.ace_name.ace_function,.ace-monokai .ace_entity.ace_other,.ace-monokai .ace_entity.ace_other.ace_attribute-name,.ace-monokai .ace_variable {color: #A6E22E}.ace-monokai .ace_variable.ace_parameter {font-style: italic;color: #FD971F}.ace-monokai .ace_string {color: #E6DB74}.ace-monokai .ace_comment {color: #75715E}.ace-monokai .ace_indent-guide {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y}";var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass);});                (function() {
                      ace.require(["ace/theme/monokai"], function(m) {
                          if ( module) {
                              module.exports = m;
                          }
                      });
                  })();
  });

  /* eslint-env browser */

  window.addEventListener('load', () => {
    const ydoc = new Doc();
    // const provider = new WebrtcProvider('yjs-ace', ydoc);

    const provider = new WebsocketProvider('ws://localhost:9000', 'ace-demo', ydoc) // local
    provider.on('status', event => {
      console.log(event.status) // websocket logs "connected" or "disconnected"
    })
    window.provider = provider;
    
    const type = ydoc.getText('ace');
    
    // const binding = new Y.AceBinding(ace, type)
    const binding = new AceBinding(type, EDITOR, provider.awareness);
    // const binding = new AceBinding(type, editor, provider.awareness);
    
    let userData = {
      name: Math.random().toString(36).substring(7),
      color: '#'+Math.floor(Math.random()*16777215).toString(16)
    };
    window.userData = userData;
    
    // Define user name and user name
    provider.awareness.setLocalStateField('user', userData);

    // EDITOR.session.getDocument().on('change', (e) => {
    //   console.log('EDITOR CHANGE', e);
    // })

    EDITOR.getSession().selection.on("changeCursor", function(event) {
      const { row, column} = EDITOR.selection.getCursor();
      const item = humdrumDataNoteIntoView(row, column);
      if (item) {
        markItem(item);
        updateSingleSelect(provider.awareness.clientID, item, { text: userData.name, color: userData.color });
        
        const { user, cursor } = provider.awareness.getLocalState();
        provider.awareness.setLocalStateField('cursor', { itemId: item.id, ...cursor });
      }
    });

    provider.awareness.on('change', function({ added, updated, removed }) {
      const awarenessState = provider.awareness.getStates();
      removeUnusedElements(Array.from(awarenessState.keys()));
      console.log(`[${new Date().toLocaleTimeString()}]`, awarenessState);
      
      const f = clientId => {
        if (clientId === provider.awareness.clientID) return;

        const aw = awarenessState.get(clientId);
        if (aw) {
          updateMultiSelect({ clientId, ...aw }, aw?.multiSelect);

          const item = document.querySelector(`#${aw?.cursor?.itemId}`);
          if (item) {
            const usersDiv = document.querySelector(`.users-div[data-note-id=${item.id}]`);
            if (usersDiv) {
              let text = usersDiv.innerText;
              text = !text.includes(aw?.user.name) ? text + '\n' + aw.user.name : aw.user.name;
              updateSingleSelect(clientId, item, { text, color: aw.user.color });
            } else {
              updateSingleSelect(clientId, item, { text: aw.user.name, color: aw.user.color });
            }
          }
        }
      }

      added.forEach(f);
      updated.forEach(f);
      removed.forEach(f);
    });

  });

}());