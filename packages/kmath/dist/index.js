'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _ = require('underscore');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

/**
 * Number Utils
 * A number is a js-number, e.g. 5.12
 */
const DEFAULT_TOLERANCE = 1e-9;

// TODO: Should this just be Number.Epsilon
const EPSILON = Math.pow(2, -42);
function is$2(x) {
  return ___default["default"].isNumber(x) && !___default["default"].isNaN(x);
}
function equal$4(x, y, tolerance) {
  // Checking for undefined makes this function behave nicely
  // with vectors of different lengths that are _.zip'd together
  if (x == null || y == null) {
    return x === y;
  }
  // We check === here so that +/-Infinity comparisons work correctly
  if (x === y) {
    return true;
  }
  if (tolerance == null) {
    tolerance = DEFAULT_TOLERANCE;
  }
  return Math.abs(x - y) < tolerance;
}
function sign(x, tolerance) /* Should be: 0 | 1 | -1 */{
  return equal$4(x, 0, tolerance) ? 0 : Math.abs(x) / x;
}
function isInteger(num, tolerance) {
  return equal$4(Math.round(num), num, tolerance);
}

// Round a number to a certain number of decimal places
function round$2(num, precision) {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

// Round num to the nearest multiple of increment
// i.e. roundTo(83, 5) -> 85
function roundTo$2(num, increment) {
  return Math.round(num / increment) * increment;
}
function floorTo$2(num, increment) {
  return Math.floor(num / increment) * increment;
}
function ceilTo$2(num, increment) {
  return Math.ceil(num / increment) * increment;
}

/**
 * toFraction
 *
 * Returns a [numerator, denominator] array rational representation
 * of `decimal`
 *
 * See http://en.wikipedia.org/wiki/Continued_fraction for implementation
 * details
 *
 * toFraction(4/8) => [1, 2]
 * toFraction(0.66) => [33, 50]
 * toFraction(0.66, 0.01) => [2/3]
 * toFraction(283 + 1/3) => [850, 3]
 */
function toFraction(decimal) {
  let tolerance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EPSILON;
  let maxDenominator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
  // Initialize everything to compute successive terms of
  // continued-fraction approximations via recurrence relation
  let n = [1, 0];
  let d = [0, 1];
  let a = Math.floor(decimal);
  let rem = decimal - a;
  while (d[0] <= maxDenominator) {
    if (equal$4(n[0] / d[0], decimal, tolerance)) {
      return [n[0], d[0]];
    }
    n = [a * n[0] + n[1], n[0]];
    d = [a * d[0] + d[1], d[0]];
    a = Math.floor(1 / rem);
    rem = 1 / rem - a;
  }

  // We failed to find a nice rational representation,
  // so return an irrational "fraction"
  return [decimal, 1];
}

var number = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DEFAULT_TOLERANCE: DEFAULT_TOLERANCE,
    EPSILON: EPSILON,
    is: is$2,
    equal: equal$4,
    sign: sign,
    isInteger: isInteger,
    round: round$2,
    roundTo: roundTo$2,
    floorTo: floorTo$2,
    ceilTo: ceilTo$2,
    toFraction: toFraction
});

/**
 * Vector Utils
 * A vector is an array of numbers e.g. [0, 3, 4].
 */
function arraySum(array) {
  return array.reduce((memo, arg) => memo + arg, 0);
}
function arrayProduct(array) {
  return array.reduce((memo, arg) => memo * arg, 1);
}

/**
 * Checks if the given vector contains only numbers and, optionally, is of the
 * right dimension (length).
 *
 * is([1, 2, 3]) -> true
 * is([1, "Hello", 3]) -> false
 * is([1, 2, 3], 1) -> false
 */
function is$1(vec, dimension) {
  if (!___default["default"].isArray(vec)) {
    return false;
  }
  if (dimension !== undefined && vec.length !== dimension) {
    return false;
  }
  return vec.every(is$2);
}

// Normalize to a unit vector
function normalize(v) {
  return scale(v, 1 / length(v));
}

// Length/magnitude of a vector
function length(v) {
  return Math.sqrt(dot(v, v));
}
// Dot product of two vectors
function dot(a, b) {
  const zipped = ___default["default"].zip(a, b);
  const multiplied = zipped.map(arrayProduct);
  return arraySum(multiplied);
}

/* vector-add multiple [x, y] coords/vectors
 *
 * add([1, 2], [3, 4]) -> [4, 6]
 */
function add() {
  const zipped = ___default["default"].zip(...arguments);
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return zipped.map(arraySum);
}
function subtract(v1, v2) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return ___default["default"].zip(v1, v2).map(dim => dim[0] - dim[1]);
}
function negate(v) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return v.map(x => {
    return -x;
  });
}

// Scale a vector
function scale(v1, scalar) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return v1.map(x => {
    return x * scalar;
  });
}
function equal$3(v1, v2, tolerance) {
  // _.zip will nicely deal with the lengths, going through
  // the length of the longest vector. knumber.equal then
  // returns false for any number compared to the undefined
  // passed in if one of the vectors is shorter.
  return ___default["default"].zip(v1, v2).every(pair => equal$4(pair[0], pair[1], tolerance));
}
function codirectional(v1, v2, tolerance) {
  // The origin is trivially codirectional with all other vectors.
  // This gives nice semantics for codirectionality between points when
  // comparing their difference vectors.
  if (equal$4(length(v1), 0, tolerance) || equal$4(length(v2), 0, tolerance)) {
    return true;
  }
  v1 = normalize(v1);
  v2 = normalize(v2);
  return equal$3(v1, v2, tolerance);
}
function collinear(v1, v2, tolerance) {
  return codirectional(v1, v2, tolerance) || codirectional(v1, negate(v2), tolerance);
}

// TODO(jeremy) These coordinate conversion functions really only handle 2D points (ie. [number, number])

// Convert a cartesian coordinate into a radian polar coordinate
function polarRadFromCart$1(v) {
  const radius = length(v);
  let theta = Math.atan2(v[1], v[0]);

  // Convert angle range from [-pi, pi] to [0, 2pi]
  if (theta < 0) {
    theta += 2 * Math.PI;
  }
  return [radius, theta];
}

// Converts a cartesian coordinate into a degree polar coordinate
function polarDegFromCart$1(v) /* TODO: convert to tuple/Point */{
  const polar = polarRadFromCart$1(v);
  return [polar[0], polar[1] * 180 / Math.PI];
}

/* Convert a polar coordinate into a cartesian coordinate
 *
 * Examples:
 * cartFromPolarRad(5, Math.PI)
 */
function cartFromPolarRad$1(radius) /* TODO: convert to tuple/Point */{
  let theta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return [radius * Math.cos(theta), radius * Math.sin(theta)];
}

/* Convert a polar coordinate into a cartesian coordinate
 *
 * Examples:
 * cartFromPolarDeg(5, 30)
 */
function cartFromPolarDeg$1(radius) {
  let theta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return cartFromPolarRad$1(radius, theta * Math.PI / 180);
}

// Rotate vector
function rotateRad$1(v, theta) {
  const polar = polarRadFromCart$1(v);
  const angle = polar[1] + theta;
  return cartFromPolarRad$1(polar[0], angle);
}
function rotateDeg$1(v, theta) {
  const polar = polarDegFromCart$1(v);
  const angle = polar[1] + theta;
  return cartFromPolarDeg$1(polar[0], angle);
}

// Angle between two vectors
function angleRad(v1, v2) {
  return Math.acos(dot(v1, v2) / (length(v1) * length(v2)));
}
function angleDeg(v1, v2) {
  return angleRad(v1, v2) * 180 / Math.PI;
}

// Vector projection of v1 onto v2
function projection(v1, v2) {
  const scalar = dot(v1, v2) / dot(v2, v2);
  return scale(v2, scalar);
}

// Round each number to a certain number of decimal places
function round$1(vec, precision) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return vec.map((elem, i) => round$2(elem, precision[i] || precision));
}

// Round each number to the nearest increment
function roundTo$1(vec, increment) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return vec.map((elem, i) => roundTo$2(elem, increment[i] || increment));
}
function floorTo$1(vec, increment) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return vec.map((elem, i) => floorTo$2(elem, increment[i] || increment));
}
function ceilTo$1(vec, increment) {
  // @ts-expect-error [FEI-5003] - TS2322 - Type 'number[]' is not assignable to type 'V'.
  return vec.map((elem, i) => ceilTo$2(elem, increment[i] || increment));
}

var vector = /*#__PURE__*/Object.freeze({
    __proto__: null,
    is: is$1,
    normalize: normalize,
    length: length,
    dot: dot,
    add: add,
    subtract: subtract,
    negate: negate,
    scale: scale,
    equal: equal$3,
    codirectional: codirectional,
    collinear: collinear,
    polarRadFromCart: polarRadFromCart$1,
    polarDegFromCart: polarDegFromCart$1,
    cartFromPolarRad: cartFromPolarRad$1,
    cartFromPolarDeg: cartFromPolarDeg$1,
    rotateRad: rotateRad$1,
    rotateDeg: rotateDeg$1,
    angleRad: angleRad,
    angleDeg: angleDeg,
    projection: projection,
    round: round$1,
    roundTo: roundTo$1,
    floorTo: floorTo$1,
    ceilTo: ceilTo$1
});

/**
 * Point Utils
 * A point is an array of two numbers e.g. [0, 0].
 */

// A point, in 2D, 3D, or nD space.

// Rotate point (around origin unless a center is specified)
function rotateRad(point, theta, center) {
  if (center === undefined) {
    return rotateRad$1(point, theta);
  } else {
    return add(center, rotateRad$1(subtract(point, center), theta));
  }
}
function rotateDeg(point, theta, center) {
  if (center === undefined) {
    return rotateDeg$1(point, theta);
  } else {
    return add(center, rotateDeg$1(subtract(point, center), theta));
  }
}

// Distance between two points
function distanceToPoint$1(point1, point2) {
  return length(subtract(point1, point2));
}

// Distance between point and line
function distanceToLine(point, line) {
  const lv = subtract(line[1], line[0]);
  const pv = subtract(point, line[0]);
  const projectedPv = projection(pv, lv);
  const distancePv = subtract(projectedPv, pv);
  return length(distancePv);
}

// Reflect point over line
function reflectOverLine(point, line) {
  const lv = subtract(line[1], line[0]);
  const pv = subtract(point, line[0]);
  const projectedPv = projection(pv, lv);
  const reflectedPv = subtract(scale(projectedPv, 2), pv);
  return add(line[0], reflectedPv);
}

/**
 * Compares two points, returning -1, 0, or 1, for use with
 * Array.prototype.sort
 *
 * Note: This technically doesn't satisfy the total-ordering
 * requirements of Array.prototype.sort unless equalityTolerance
 * is 0. In some cases very close points that compare within a
 * few equalityTolerances could appear in the wrong order.
 */
function compare(point1, point2, equalityTolerance) /* TODO: convert to -1 | 0 | 1 type */{
  if (point1.length !== point2.length) {
    return point1.length - point2.length;
  }
  for (let i = 0; i < point1.length; i++) {
    if (!equal$4(point1[i], point2[i], equalityTolerance)) {
      return point1[i] - point2[i];
    }
  }
  return 0;
}

// Check if a value is a point
const is = is$1;

// Add and subtract vector(s)
const addVector = add;
const addVectors = add;
const subtractVector = subtract;
const equal$2 = equal$3;

// Convert from cartesian to polar and back
const polarRadFromCart = polarRadFromCart$1;
const polarDegFromCart = polarDegFromCart$1;
const cartFromPolarRad = cartFromPolarRad$1;
const cartFromPolarDeg = cartFromPolarDeg$1;

// Rounding
const round = round$1;
const roundTo = roundTo$1;
const floorTo = floorTo$1;
const ceilTo = ceilTo$1;

var point = /*#__PURE__*/Object.freeze({
    __proto__: null,
    rotateRad: rotateRad,
    rotateDeg: rotateDeg,
    distanceToPoint: distanceToPoint$1,
    distanceToLine: distanceToLine,
    reflectOverLine: reflectOverLine,
    compare: compare,
    is: is,
    addVector: addVector,
    addVectors: addVectors,
    subtractVector: subtractVector,
    equal: equal$2,
    polarRadFromCart: polarRadFromCart,
    polarDegFromCart: polarDegFromCart,
    cartFromPolarRad: cartFromPolarRad,
    cartFromPolarDeg: cartFromPolarDeg,
    round: round,
    roundTo: roundTo,
    floorTo: floorTo,
    ceilTo: ceilTo
});

/**
 * Line Utils
 * A line is an array of two points e.g. [[-5, 0], [5, 0]].
 */
function distanceToPoint(line, point$1) {
  return distanceToLine(point$1, line);
}
function reflectPoint(line, point$1) {
  return reflectOverLine(point$1, line);
}
function midpoint(line) {
  return [(line[0][0] + line[1][0]) / 2, (line[0][1] + line[1][1]) / 2];
}
function equal$1(line1, line2, tolerance) {
  // TODO: A nicer implementation might just check collinearity of
  // vectors using underscore magick
  // Compare the directions of the lines
  const v1 = subtract(line1[1], line1[0]);
  const v2 = subtract(line2[1], line2[0]);
  if (!collinear(v1, v2, tolerance)) {
    return false;
  }
  // If the start point is the same for the two lines, then they are the same
  if (equal$2(line1[0], line2[0])) {
    return true;
  }
  // Make sure that the direction to get from line1 to
  // line2 is the same as the direction of the lines
  const line1ToLine2Vector = subtract(line2[0], line1[0]);
  return collinear(v1, line1ToLine2Vector, tolerance);
}

var line = /*#__PURE__*/Object.freeze({
    __proto__: null,
    distanceToPoint: distanceToPoint,
    reflectPoint: reflectPoint,
    midpoint: midpoint,
    equal: equal$1
});

/**
 * Ray Utils
 * A ray (→) is an array of an endpoint and another point along the ray.
 * For example, [[0, 0], [1, 0]] is the ray starting at the origin and
 * traveling along the positive x-axis.
 */
function equal(ray1, ray2, tolerance) {
  // Compare the directions of the rays
  const v1 = subtract(ray1[1], ray1[0]);
  const v2 = subtract(ray2[1], ray2[0]);
  const sameOrigin = equal$2(ray1[0], ray2[0]);
  const codirectional$1 = codirectional(v1, v2, tolerance);
  return sameOrigin && codirectional$1;
}

var ray = /*#__PURE__*/Object.freeze({
    __proto__: null,
    equal: equal
});

exports.line = line;
exports.number = number;
exports.point = point;
exports.ray = ray;
exports.vector = vector;
//# sourceMappingURL=index.js.map
