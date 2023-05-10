'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

/**
 * @typedef {Object} Errors utility for referencing the Perseus error taxonomy.
 */
const Errors = Object.freeze({
  /**
   * @property {ErrorKind} Unknown The kind of error is not known.
   */
  Unknown: "Unknown",
  /**
   * @property {ErrorKind} Internal The error is internal to the executing code.
   */
  Internal: "Internal",
  /**
   * @property {ErrorKind} InvalidInput There was a problem with the provided
   * input, such as the wrong format or a null value.
   */
  InvalidInput: "InvalidInput",
  /**
   * @property {ErrorKind} NotAllowed There was a problem due to the state of
   * the system not matching the requested operation or input. For example,
   * trying to create a username that is valid, but is already taken by
   * another user. Use {@link InvalidInput} instead when the input isn't
   * valid regardless of the state of the system. Use {@link NotFound} when
   * the failure is due to not being able to find a resource.
   */
  NotAllowed: "NotAllowed",
  /**
   * @property {ErrorKind} TransientService There was a problem when making a
   * request to a service.
   */
  TransientService: "TransientService",
  /**
   * @property {ErrorKind} Service There was a non-transient problem when
   * making a request to service.
   */
  Service: "Service"
});

/**
 * @type {ErrorKind} The kind of error being reported
 */

class PerseusError extends Error {
  constructor(message, kind, options) {
    super(message);
    _defineProperty(this, "kind", void 0);
    _defineProperty(this, "metadata", void 0);
    this.kind = kind;
    this.metadata = options === null || options === void 0 ? void 0 : options.metadata;
  }
}

exports.Errors = Errors;
exports.PerseusError = PerseusError;
//# sourceMappingURL=index.js.map
