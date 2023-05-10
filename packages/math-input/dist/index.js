'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Color = require('@khanacademy/wonder-blocks-color');
var i18n = require('@khanacademy/wonder-blocks-i18n');
var wonderStuffCore = require('@khanacademy/wonder-stuff-core');
var aphrodite = require('aphrodite');
var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var MathQuill = require('mathquill');
var PropTypes = require('prop-types');
var reactRedux = require('react-redux');
var Redux = require('redux');
var katex = require('katex');
var reactTransitionGroup = require('react-transition-group');
var wonderBlocksCore = require('@khanacademy/wonder-blocks-core');
var Clickable = require('@khanacademy/wonder-blocks-clickable');
var now = require('performance-now');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var Color__default = /*#__PURE__*/_interopDefaultLegacy(Color);
var i18n__namespace = /*#__PURE__*/_interopNamespace(i18n);
var React__namespace = /*#__PURE__*/_interopNamespace(React);
var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);
var $__default = /*#__PURE__*/_interopDefaultLegacy($);
var MathQuill__default = /*#__PURE__*/_interopDefaultLegacy(MathQuill);
var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);
var Redux__namespace = /*#__PURE__*/_interopNamespace(Redux);
var katex__default = /*#__PURE__*/_interopDefaultLegacy(katex);
var Clickable__default = /*#__PURE__*/_interopDefaultLegacy(Clickable);
var now__default = /*#__PURE__*/_interopDefaultLegacy(now);

/**
 * Enum that defines the various contexts in which a cursor can exist. The
 * active context is determined first by looking at the cursor's siblings (e.g.,
 * for the `BEFORE_FRACTION` context), and then at its direct parent. Though a
 * cursor could in theory be nested in multiple contexts, we only care about the
 * immediate context.
 *
 * TODO(charlie): Add a context to represent being inside of a radical. Right
 * now, we show the dismiss button rather than allowing the user to jump out of
 * the radical.
 */

let CursorContext = /*#__PURE__*/function (CursorContext) {
  CursorContext["NONE"] = "NONE";
  CursorContext["IN_PARENS"] = "IN_PARENS";
  CursorContext["IN_SUPER_SCRIPT"] = "IN_SUPER_SCRIPT";
  CursorContext["IN_SUB_SCRIPT"] = "IN_SUB_SCRIPT";
  CursorContext["IN_NUMERATOR"] = "IN_NUMERATOR";
  CursorContext["IN_DENOMINATOR"] = "IN_DENOMINATOR";
  CursorContext["BEFORE_FRACTION"] = "BEFORE_FRACTION";
  return CursorContext;
}({});

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
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
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
 * This file contains constants for keypad buttons that aren't single
 * alphanumeric characters.
 */
// TODO(charlie): There's duplication between this file and key-configs.js.
// We should clean it up by removing this file and requiring clients to use the
// `id` field on the key configurations.
var Keys = /*#__PURE__*/function (Keys) {
  Keys["PLUS"] = "PLUS";
  Keys["MINUS"] = "MINUS";
  Keys["NEGATIVE"] = "NEGATIVE";
  Keys["TIMES"] = "TIMES";
  Keys["DIVIDE"] = "DIVIDE";
  Keys["DECIMAL"] = "DECIMAL";
  Keys["PERIOD"] = "PERIOD";
  Keys["PERCENT"] = "PERCENT";
  Keys["CDOT"] = "CDOT";
  Keys["EQUAL"] = "EQUAL";
  Keys["NEQ"] = "NEQ";
  Keys["GT"] = "GT";
  Keys["LT"] = "LT";
  Keys["GEQ"] = "GEQ";
  Keys["LEQ"] = "LEQ";
  Keys["FRAC_INCLUSIVE"] = "FRAC_INCLUSIVE";
  Keys["FRAC_EXCLUSIVE"] = "FRAC_EXCLUSIVE";
  Keys["FRAC"] = "FRAC";
  Keys["EXP"] = "EXP";
  Keys["EXP_2"] = "EXP_2";
  Keys["EXP_3"] = "EXP_3";
  Keys["SQRT"] = "SQRT";
  Keys["CUBE_ROOT"] = "CUBE_ROOT";
  Keys["RADICAL"] = "RADICAL";
  Keys["LEFT_PAREN"] = "LEFT_PAREN";
  Keys["RIGHT_PAREN"] = "RIGHT_PAREN";
  Keys["LN"] = "LN";
  Keys["LOG"] = "LOG";
  Keys["LOG_N"] = "LOG_N";
  Keys["SIN"] = "SIN";
  Keys["COS"] = "COS";
  Keys["TAN"] = "TAN";
  Keys["PI"] = "PI";
  Keys["THETA"] = "THETA";
  Keys["UP"] = "UP";
  Keys["RIGHT"] = "RIGHT";
  Keys["DOWN"] = "DOWN";
  Keys["LEFT"] = "LEFT";
  Keys["BACKSPACE"] = "BACKSPACE";
  Keys["DISMISS"] = "DISMISS";
  Keys["JUMP_OUT_PARENTHESES"] = "JUMP_OUT_PARENTHESES";
  Keys["JUMP_OUT_EXPONENT"] = "JUMP_OUT_EXPONENT";
  Keys["JUMP_OUT_BASE"] = "JUMP_OUT_BASE";
  Keys["JUMP_INTO_NUMERATOR"] = "JUMP_INTO_NUMERATOR";
  Keys["JUMP_OUT_NUMERATOR"] = "JUMP_OUT_NUMERATOR";
  Keys["JUMP_OUT_DENOMINATOR"] = "JUMP_OUT_DENOMINATOR";
  Keys["NOOP"] = "NOOP";
  return Keys;
}(Keys || {}); // mobile native only

class Text extends React__namespace.Component {
  render() {
    const {
      numberOfLines,
      style
    } = this.props;
    const className = aphrodite.css(styles$f.initial, ...(Array.isArray(style) ? style : [style]), numberOfLines === 1 && styles$f.singleLineStyle);
    return /*#__PURE__*/React__namespace.createElement("span", {
      className: className,
      style: this.props.dynamicStyle
    }, this.props.children);
  }
}

// https://github.com/necolas/react-native-web/blob/master/src/components/Text/index.js
const styles$f = aphrodite.StyleSheet.create({
  initial: {
    color: "inherit",
    display: "inline",
    font: "inherit",
    margin: 0,
    padding: 0,
    textDecorationLine: "none",
    wordWrap: "break-word"
  },
  singleLineStyle: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }
});

class View extends React__namespace.Component {
  render() {
    const className = aphrodite.css(View.styles.initial, ...(Array.isArray(this.props.style) ? this.props.style : [this.props.style])) + (this.props.extraClassName ? " ".concat(this.props.extraClassName) : "");
    return /*#__PURE__*/React__namespace.createElement("div", {
      className: className,
      style: this.props.dynamicStyle,
      onClick: this.props.onClick,
      onTouchCancel: this.props.onTouchCancel,
      onTouchEnd: this.props.onTouchEnd,
      onTouchMove: this.props.onTouchMove,
      onTouchStart: this.props.onTouchStart,
      "aria-label": this.props.ariaLabel,
      role: this.props.role
    }, this.props.children);
  }
}
_defineProperty(View, "styles", aphrodite.StyleSheet.create({
  // From: https://github.com/necolas/react-native-web/blob/master/src/components/View/index.js
  // eslint-disable-next-line react-native/no-unused-styles
  initial: {
    alignItems: "stretch",
    borderWidth: 0,
    borderStyle: "solid",
    boxSizing: "border-box",
    display: "flex",
    flexBasis: "auto",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    position: "relative",
    // button and anchor reset
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "inherit",
    textDecorationLine: "none",
    // list reset
    listStyle: "none",
    // fix flexbox bugs
    maxWidth: "100%",
    minHeight: 0,
    minWidth: 0
  }
}));

/**
 * Common parameters used to style components.
 */
const wonderBlocksBlue = Color__default["default"].blue;
const offBlack = Color__default["default"].offBlack;
Color__default["default"].offBlack32;
const offBlack16 = Color__default["default"].offBlack16;
Color__default["default"].offBlack8;
const iconSizeHeightPx = 48;
const iconSizeWidthPx = 48;
const compactKeypadBorderRadiusPx = 4;
const cursorHandleRadiusPx = 11;

// The amount to multiply the radius by to get the distance from the
// center to the tip of the cursor handle.  The cursor is a circle with
// one quadrant replace with a square.  The hypotenuse of the square is
// 1.045 times the radius of the circle.
const cursorHandleDistanceMultiplier = 1.045;

// Keypad button colors
const valueGrey = "#FFF";
const operatorGrey = "#FAFAFA";
const controlGrey = "#F6F7F7";
const emptyGrey = "#F0F1F2";

// Constants defining any borders between elements in the keypad.
const innerBorderColor = offBlack16;
const innerBorderStyle = "solid";
const innerBorderWidthPx = 1;

// The width at which a device is classified as a "tablet" for the purposes
// of the keypad layout.
const tabletCutoffPx = 600;

// The dimensions that define various components in the tree, which may be
// needed outside of those components in order to determine various layout
// parameters.
const pageIndicatorHeightPx = 16;
const navigationPadWidthPx = 192;
// HACK(charlie): This should be injected by webapp somehow.
// TODO(charlie): Add a link to the webapp location as soon as the footer
// has settled down.
const toolbarHeightPx = 60;

const touchTargetRadiusPx = 2 * cursorHandleRadiusPx;
const touchTargetHeightPx = 2 * touchTargetRadiusPx;
const touchTargetWidthPx = 2 * touchTargetRadiusPx;
const cursorRadiusPx = cursorHandleRadiusPx;
const cursorHeightPx = cursorHandleDistanceMultiplier * (cursorRadiusPx * 4);
const cursorWidthPx = 4 * cursorRadiusPx;
class CursorHandle extends React__namespace.Component {
  render() {
    const {
      x,
      y,
      animateIntoPosition
    } = this.props;
    const animationStyle = animateIntoPosition ? {
      transitionDuration: "100ms",
      transitionProperty: "transform"
    } : {};
    const transformString = "translate(".concat(x, "px, ").concat(y, "px)");
    const outerStyle = {
      position: "absolute",
      // This is essentially webapp's interactiveComponent + 1.
      // TODO(charlie): Pull in those styles somehow to avoid breakages.
      zIndex: 4,
      left: -touchTargetWidthPx / 2,
      top: 0,
      transform: transformString,
      width: touchTargetWidthPx,
      height: touchTargetHeightPx,
      // Touch events that start on the cursor shouldn't be allowed to
      // produce page scrolls.
      touchAction: "none",
      ...animationStyle
    };
    return /*#__PURE__*/React__namespace.createElement("span", {
      style: outerStyle,
      onTouchStart: this.props.onTouchStart,
      onTouchMove: this.props.onTouchMove,
      onTouchEnd: this.props.onTouchEnd,
      onTouchCancel: this.props.onTouchCancel
    }, /*#__PURE__*/React__namespace.createElement("svg", {
      fill: "none",
      width: cursorWidthPx,
      height: cursorHeightPx,
      viewBox: "0 0 ".concat(cursorWidthPx, " ").concat(cursorHeightPx)
    }, /*#__PURE__*/React__namespace.createElement("filter", {
      id: "math-input_cursor",
      colorInterpolationFilters: "sRGB",
      filterUnits: "userSpaceOnUse",
      height: cursorHeightPx * 0.87 // ~40
      ,
      width: cursorWidthPx * 0.82 // ~36
      ,
      x: "4",
      y: "0"
    }, /*#__PURE__*/React__namespace.createElement("feFlood", {
      floodOpacity: "0",
      result: "BackgroundImageFix"
    }), /*#__PURE__*/React__namespace.createElement("feColorMatrix", {
      in: "SourceAlpha",
      type: "matrix",
      values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
    }), /*#__PURE__*/React__namespace.createElement("feOffset", {
      dy: "4"
    }), /*#__PURE__*/React__namespace.createElement("feGaussianBlur", {
      stdDeviation: "4"
    }), /*#__PURE__*/React__namespace.createElement("feColorMatrix", {
      type: "matrix",
      values: "0 0 0 0 0.129412 0 0 0 0 0.141176 0 0 0 0 0.172549 0 0 0 0.08 0"
    }), /*#__PURE__*/React__namespace.createElement("feBlend", {
      in2: "BackgroundImageFix",
      mode: "normal",
      result: "effect1_dropShadow"
    }), /*#__PURE__*/React__namespace.createElement("feBlend", {
      in: "SourceGraphic",
      in2: "effect1_dropShadow",
      mode: "normal",
      result: "shape"
    })), /*#__PURE__*/React__namespace.createElement("g", {
      filter: "url(#math-input_cursor)"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      d: "m22 4-7.07 7.0284c-1.3988 1.3901-2.3515 3.1615-2.7376 5.09-.3861 1.9284-.1883 3.9274.5685 5.7441s2.0385 3.3694 3.6831 4.4619c1.6445 1.0925 3.5781 1.6756 5.556 1.6756s3.9115-.5831 5.556-1.6756c1.6446-1.0925 2.9263-2.6452 3.6831-4.4619s.9546-3.8157.5685-5.7441c-.3861-1.9285-1.3388-3.6999-2.7376-5.09z",
      fill: "#1865f2"
    })), /*#__PURE__*/React__namespace.createElement("path", {
      d: "m14.9301 10.4841 7.0699-7.06989 7.0699 7.06989.0001.0001c1.3988 1.3984 2.3515 3.1802 2.7376 5.1201s.1883 3.9507-.5685 5.7782c-.7568 1.8274-2.0385 3.3894-3.6831 4.4883-1.6445 1.099-3.5781 1.6855-5.556 1.6855s-3.9115-.5865-5.556-1.6855c-1.6446-1.0989-2.9263-2.6609-3.6831-4.4883-.7568-1.8275-.9546-3.8383-.5685-5.7782s1.3388-3.7217 2.7376-5.1201z",
      stroke: "#fff",
      strokeWidth: "2"
    })));
  }
}
_defineProperty(CursorHandle, "defaultProps", {
  animateIntoPosition: false,
  visible: false,
  x: 0,
  y: 0
});

/**
 * A gesture recognizer that detects 'drags', crudely defined as either scrolls
 * or touches that move a sufficient distance.
 */

// The 'slop' factor, after which we consider the use to be dragging. The value
// is taken from the Android SDK. It won't be robust to page zoom and the like,
// but it should be good enough for our purposes.
const touchSlopPx = 8;
class DragListener {
  constructor(onDrag, initialEvent) {
    _defineProperty(this, "_scrollListener", void 0);
    _defineProperty(this, "_moveListener", void 0);
    _defineProperty(this, "_endAndCancelListener", void 0);
    // We detect drags in two ways. First, by listening for the window
    // scroll event (we consider any legitimate scroll to be a drag).
    this._scrollListener = () => {
      onDrag();
    };

    // And second, by listening for touch moves and tracking the each
    // finger's displacement. This allows us to track, e.g., when the user
    // scrolls within an individual view.
    const touchLocationsById = {};
    for (let i = 0; i < initialEvent.changedTouches.length; i++) {
      const touch = initialEvent.changedTouches[i];
      touchLocationsById[touch.identifier] = [touch.clientX, touch.clientY];
    }
    this._moveListener = evt => {
      for (let i = 0; i < evt.changedTouches.length; i++) {
        const touch = evt.changedTouches[i];
        const initialTouchLocation = touchLocationsById[touch.identifier];
        if (initialTouchLocation) {
          const touchLocation = [touch.clientX, touch.clientY];
          const dx = touchLocation[0] - initialTouchLocation[0];
          const dy = touchLocation[1] - initialTouchLocation[1];
          const squaredDist = dx * dx + dy * dy;
          const squaredTouchSlop = touchSlopPx * touchSlopPx;
          if (squaredDist > squaredTouchSlop) {
            onDrag();
          }
        }
      }
    };

    // Clean-up any terminated gestures, since some browsers reuse
    // identifiers.
    this._endAndCancelListener = evt => {
      for (let i = 0; i < evt.changedTouches.length; i++) {
        delete touchLocationsById[evt.changedTouches[i].identifier];
      }
    };
  }
  attach() {
    window.addEventListener("scroll", this._scrollListener);
    window.addEventListener("touchmove", this._moveListener);
    window.addEventListener("touchend", this._endAndCancelListener);
    window.addEventListener("touchcancel", this._endAndCancelListener);
  }
  detach() {
    window.removeEventListener("scroll", this._scrollListener);
    window.removeEventListener("touchmove", this._moveListener);
    window.removeEventListener("touchend", this._endAndCancelListener);
    window.removeEventListener("touchcancel", this._endAndCancelListener);
  }
}

/**
 * Constants that are shared between multiple files.
 */

let KeypadType = /*#__PURE__*/function (KeypadType) {
  KeypadType["FRACTION"] = "FRACTION";
  KeypadType["EXPRESSION"] = "EXPRESSION";
  return KeypadType;
}({});
let KeyType = /*#__PURE__*/function (KeyType) {
  KeyType["EMPTY"] = "EMPTY";
  KeyType["VALUE"] = "VALUE";
  KeyType["OPERATOR"] = "OPERATOR";
  KeyType["INPUT_NAVIGATION"] = "INPUT_NAVIGATION";
  KeyType["KEYPAD_NAVIGATION"] = "KEYPAD_NAVIGATION";
  KeyType["MANY"] = "MANY";
  KeyType["ECHO"] = "ECHO";
  return KeyType;
}({});
let DeviceOrientation = /*#__PURE__*/function (DeviceOrientation) {
  DeviceOrientation["LANDSCAPE"] = "LANDSCAPE";
  DeviceOrientation["PORTRAIT"] = "PORTRAIT";
  return DeviceOrientation;
}({});
let DeviceType = /*#__PURE__*/function (DeviceType) {
  DeviceType["PHONE"] = "PHONE";
  DeviceType["TABLET"] = "TABLET";
  return DeviceType;
}({});
let LayoutMode = /*#__PURE__*/function (LayoutMode) {
  LayoutMode["FULLSCREEN"] = "FULLSCREEN";
  LayoutMode["COMPACT"] = "COMPACT";
  return LayoutMode;
}({});
let BorderDirection = /*#__PURE__*/function (BorderDirection) {
  BorderDirection["LEFT"] = "LEFT";
  BorderDirection["BOTTOM"] = "BOTTOM";
  return BorderDirection;
}({});
const BorderStyles = {
  LEFT: [BorderDirection.LEFT],
  BOTTOM: [BorderDirection.BOTTOM],
  ALL: [BorderDirection.LEFT, BorderDirection.BOTTOM],
  NONE: []
};
let IconType = /*#__PURE__*/function (IconType) {
  IconType["MATH"] = "MATH";
  IconType["SVG"] = "SVG";
  IconType["TEXT"] = "TEXT";
  return IconType;
}({});
let DecimalSeparator = /*#__PURE__*/function (DecimalSeparator) {
  DecimalSeparator["COMMA"] = "COMMA";
  DecimalSeparator["PERIOD"] = "PERIOD";
  return DecimalSeparator;
}({});
let EchoAnimationType = /*#__PURE__*/function (EchoAnimationType) {
  EchoAnimationType["SLIDE_AND_FADE"] = "SLIDE_AND_FADE";
  EchoAnimationType["FADE_ONLY"] = "FADE_ONLY";
  EchoAnimationType["LONG_FADE_ONLY"] = "LONG_FADE_ONLY";
  return EchoAnimationType;
}({});

// NOTES(kevinb):
// - In order to get the correct decimal separator for the current locale,
//   the locale must bet set using `setLocale(kaLocale)` which can be
//   imported from wonder-blocks-i18n.
// - Some languages/locales use different decimal separators than the ones
//   listed here.  Much of the Arab world uses U+066C.
const decimalSeparator = i18n.getDecimalSeparator() === "," ? DecimalSeparator.COMMA : DecimalSeparator.PERIOD;

// Keeping `window` in place for test suite and GitHub Pages.
// If it does not exist, fall back to CommonJS require. - jsatk

const decimalSymbol = decimalSeparator === DecimalSeparator.COMMA ? "," : ".";
var ActionType = /*#__PURE__*/function (ActionType) {
  ActionType["WRITE"] = "write";
  ActionType["CMD"] = "cmd";
  ActionType["KEYSTROKE"] = "keystroke";
  ActionType[ActionType["MQ_END"] = 0] = "MQ_END";
  return ActionType;
}(ActionType || {}); // A mapping from keys that can be pressed on a keypad to the way in which
// MathQuill should modify its input in response to that key-press. Any keys
// that do not provide explicit actions (like the numeral keys) will merely
// write their contents to MathQuill.
const KeyActions = {
  [Keys.PLUS]: {
    str: "+",
    fn: ActionType.WRITE
  },
  [Keys.MINUS]: {
    str: "-",
    fn: ActionType.WRITE
  },
  [Keys.NEGATIVE]: {
    str: "-",
    fn: ActionType.WRITE
  },
  [Keys.TIMES]: {
    str: "\\times",
    fn: ActionType.WRITE
  },
  [Keys.DIVIDE]: {
    str: "\\div",
    fn: ActionType.WRITE
  },
  [Keys.DECIMAL]: {
    str: decimalSymbol,
    fn: ActionType.WRITE
  },
  [Keys.EQUAL]: {
    str: "=",
    fn: ActionType.WRITE
  },
  [Keys.NEQ]: {
    str: "\\neq",
    fn: ActionType.WRITE
  },
  [Keys.CDOT]: {
    str: "\\cdot",
    fn: ActionType.WRITE
  },
  [Keys.PERCENT]: {
    str: "%",
    fn: ActionType.WRITE
  },
  [Keys.LEFT_PAREN]: {
    str: "(",
    fn: ActionType.CMD
  },
  [Keys.RIGHT_PAREN]: {
    str: ")",
    fn: ActionType.CMD
  },
  [Keys.SQRT]: {
    str: "sqrt",
    fn: ActionType.CMD
  },
  [Keys.PI]: {
    str: "pi",
    fn: ActionType.CMD
  },
  [Keys.THETA]: {
    str: "theta",
    fn: ActionType.CMD
  },
  [Keys.RADICAL]: {
    str: "nthroot",
    fn: ActionType.CMD
  },
  [Keys.LT]: {
    str: "<",
    fn: ActionType.WRITE
  },
  [Keys.LEQ]: {
    str: "\\leq",
    fn: ActionType.WRITE
  },
  [Keys.GT]: {
    str: ">",
    fn: ActionType.WRITE
  },
  [Keys.GEQ]: {
    str: "\\geq",
    fn: ActionType.WRITE
  },
  [Keys.UP]: {
    str: "Up",
    fn: ActionType.KEYSTROKE
  },
  [Keys.DOWN]: {
    str: "Down",
    fn: ActionType.KEYSTROKE
  },
  // The `FRAC_EXCLUSIVE` variant is handled manually, since we may need to do
  // some additional navigation depending on the cursor position.
  [Keys.FRAC_INCLUSIVE]: {
    str: "/",
    fn: ActionType.CMD
  }
};
const NormalCommands = {
  [Keys.LOG]: "log",
  [Keys.LN]: "ln",
  [Keys.SIN]: "sin",
  [Keys.COS]: "cos",
  [Keys.TAN]: "tan"
};
const ArithmeticOperators = ["+", "-", "\\cdot", "\\times", "\\div"];
const EqualityOperators = ["=", "\\neq", "<", "\\leq", ">", "\\geq"];
const Numerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const GreekLetters = ["\\theta", "\\pi"];
const Letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

// We only consider numerals, variables, and Greek Letters to be proper
// leaf nodes.
const ValidLeaves = [...Numerals, ...GreekLetters, ...Letters.map(letter => letter.toLowerCase()), ...Letters.map(letter => letter.toUpperCase())];
const KeysForJumpContext = {
  [CursorContext.IN_PARENS]: Keys.JUMP_OUT_PARENTHESES,
  [CursorContext.IN_SUPER_SCRIPT]: Keys.JUMP_OUT_EXPONENT,
  [CursorContext.IN_SUB_SCRIPT]: Keys.JUMP_OUT_BASE,
  [CursorContext.BEFORE_FRACTION]: Keys.JUMP_INTO_NUMERATOR,
  [CursorContext.IN_NUMERATOR]: Keys.JUMP_OUT_NUMERATOR,
  [CursorContext.IN_DENOMINATOR]: Keys.JUMP_OUT_DENOMINATOR
};
class MathWrapper {
  // MathQuill interface
  // MathQuill input

  constructor(element) {
    let callbacks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _defineProperty(this, "MQ", void 0);
    _defineProperty(this, "mathField", void 0);
    _defineProperty(this, "callbacks", void 0);
    this.MQ = MathQuill__default["default"].getInterface(2);
    this.mathField = this.MQ.MathField(element, {
      // use a span instead of a textarea so that we don't bring up the
      // native keyboard on mobile when selecting the input
      substituteTextarea: function () {
        return document.createElement("span");
      }
    });
    this.callbacks = callbacks;
  }
  focus() {
    // HACK(charlie): We shouldn't reaching into MathQuill internals like
    // this, but it's the easiest way to allow us to manage the focus state
    // ourselves.
    const controller = this.mathField.__controller;
    controller.cursor.show();

    // Set MathQuill's internal state to reflect the focus, otherwise it
    // will consistently try to hide the cursor on key-press and introduce
    // layout jank.
    controller.blurred = false;
  }
  blur() {
    const controller = this.mathField.__controller;
    controller.cursor.hide();
    controller.blurred = true;
  }
  _writeNormalFunction(name) {
    this.mathField.write("\\".concat(name, "\\left(\\right)"));
    this.mathField.keystroke("Left");
  }

  /**
   * Handle a key press and return the resulting cursor state.
   *
   * @param {Key} key - an enum representing the key that was pressed
   * @returns {object} a cursor object, consisting of a cursor context
   */
  pressKey(key) {
    const cursor = this.mathField.__controller.cursor;
    if (key in KeyActions) {
      const {
        str,
        fn
      } = KeyActions[key];
      if (str && fn) {
        this.mathField[fn](str);
      }
    } else if (Object.keys(NormalCommands).includes(key)) {
      this._writeNormalFunction(NormalCommands[key]);
    } else if (key === Keys.FRAC_EXCLUSIVE) {
      // If there's nothing to the left of the cursor, then we want to
      // leave the cursor to the left of the fraction after creating it.
      const shouldNavigateLeft = cursor[this.MQ.L] === ActionType.MQ_END;
      this.mathField.cmd("\\frac");
      if (shouldNavigateLeft) {
        this.mathField.keystroke("Left");
      }
    } else if (key === Keys.FRAC) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cursor[this.MQ.L] === ActionType.MQ_END;
      this.mathField.cmd("\\frac");
    } else if (key === Keys.LOG_N) {
      this.mathField.write("log_{ }\\left(\\right)");
      this.mathField.keystroke("Left"); // into parentheses
      this.mathField.keystroke("Left"); // out of parentheses
      this.mathField.keystroke("Left"); // into index
    } else if (key === Keys.CUBE_ROOT) {
      this.mathField.write("\\sqrt[3]{}");
      this.mathField.keystroke("Left"); // under the root
    } else if (key === Keys.EXP || key === Keys.EXP_2 || key === Keys.EXP_3) {
      this._handleExponent(cursor, key);
    } else if (key === Keys.JUMP_OUT_PARENTHESES || key === Keys.JUMP_OUT_EXPONENT || key === Keys.JUMP_OUT_BASE || key === Keys.JUMP_INTO_NUMERATOR || key === Keys.JUMP_OUT_NUMERATOR || key === Keys.JUMP_OUT_DENOMINATOR) {
      this._handleJumpOut(cursor, key);
    } else if (key === Keys.BACKSPACE) {
      this._handleBackspace(cursor);
    } else if (key === Keys.LEFT) {
      this._handleLeftArrow(cursor);
    } else if (key === Keys.RIGHT) {
      this._handleRightArrow(cursor);
    } else if (/^[a-zA-Z]$/.test(key)) {
      this.mathField[ActionType.WRITE](key);
    } else if (/^NUM_\d/.test(key)) {
      this.mathField[ActionType.WRITE](key[4]);
    }
    if (!cursor.selection) {
      // don't show the cursor for selections
      cursor.show();
    }
    if (this.callbacks.onSelectionChanged) {
      this.callbacks.onSelectionChanged(cursor.selection);
    }

    // NOTE(charlie): It's insufficient to do this as an `edited` handler
    // on the MathField, as that handler isn't triggered on navigation
    // events.
    return {
      context: this.contextForCursor(cursor)
    };
  }

  /**
   * Place the cursor beside the node located at the given coordinates.
   *
   * @param {number} x - the x coordinate in the viewport
   * @param {number} y - the y coordinate in the viewport
   * @param {Node} hitNode - the node next to which the cursor should be
   *                         placed; if provided, the coordinates will be used
   *                         to determine on which side of the node the cursor
   *                         should be placed
   */
  setCursorPosition(x, y, hitNode) {
    const el = hitNode || document.elementFromPoint(x, y);
    if (el) {
      const cursor = this.getCursor();
      if (el.hasAttribute("mq-root-block")) {
        // If we're in the empty area place the cursor at the right
        // end of the expression.
        cursor.insAtRightEnd(this.mathField.__controller.root);
      } else {
        // Otherwise place beside the element at x, y.
        const controller = this.mathField.__controller;
        const pageX = x - document.body.scrollLeft;
        const pageY = y - document.body.scrollTop;
        controller.seek($__default["default"](el), pageX, pageY).cursor.startSelection();

        // Unless that would leave us mid-command, in which case, we
        // need to adjust and place the cursor inside the parens
        // following the command.
        const command = this._maybeFindCommand(cursor[this.MQ.L]);
        if (command && command.endNode) {
          // NOTE(charlie): endNode should definitely be \left(.
          cursor.insLeftOf(command.endNode);
          this.mathField.keystroke("Right");
        }
      }
      if (this.callbacks.onCursorMove) {
        this.callbacks.onCursorMove({
          context: this.contextForCursor(cursor)
        });
      }
    }
  }
  getCursor() {
    return this.mathField.__controller.cursor;
  }
  getSelection() {
    return this.getCursor().selection;
  }
  getContent() {
    return this.mathField.latex();
  }
  setContent(latex) {
    this.mathField.latex(latex);
  }
  isEmpty() {
    const cursor = this.getCursor();
    return cursor.parent.id === 1 && cursor[1] === 0 && cursor[-1] === 0;
  }

  // Notes about MathQuill
  //
  // MathQuill's stores its layout as nested linked lists.  Each node in the
  // list has this.MQ.L '-1' and this.MQ.R '1' properties that define links to
  // the left and right nodes respectively.  They also have
  //
  // ctrlSeq: contains the latex code snippet that defines that node.
  // jQ: jQuery object for the DOM node(s) for this MathQuill node.
  // ends: pointers to the nodes at the ends of the container.
  // parent: parent node.
  // blocks: an array containing one or more nodes that make up the node.
  // sub?: subscript node if there is one as is the case in log_n
  //
  // All of the code below is super fragile.  Please be especially careful
  // when upgrading MathQuill.

  _handleBackspaceInNthRoot(cursor) {
    const isAtLeftEnd = cursor[this.MQ.L] === ActionType.MQ_END;
    const isRootEmpty = this._isInsideEmptyNode(cursor.parent.parent.blocks[0].ends);
    if (isAtLeftEnd) {
      this._selectNode(cursor.parent.parent, cursor);
      if (isRootEmpty) {
        this.mathField.keystroke("Backspace");
      }
    } else {
      this.mathField.keystroke("Backspace");
    }
  }

  /**
   * Advances the cursor to the next logical position.
   *
   * @param {cursor} cursor
   * @private
   */
  _handleJumpOut(cursor, key) {
    const context = this.contextForCursor(cursor);

    // Validate that the current cursor context matches the key's intent.
    if (KeysForJumpContext[context] !== key) {
      // If we don't have a valid cursor context, yet the user was able
      // to trigger a jump-out key, that's a broken invariant. Rather
      // than throw an error (which would kick the user out of the
      // exercise), we do nothing, as a fallback strategy. The user can
      // still move the cursor manually.
      return;
    }
    switch (context) {
      case CursorContext.IN_PARENS:
        // Insert at the end of the parentheses, and then navigate right
        // once more to get 'beyond' the parentheses.
        cursor.insRightOf(cursor.parent.parent);
        break;
      case CursorContext.BEFORE_FRACTION:
        // Find the nearest fraction to the right of the cursor.
        let fractionNode;
        let visitor = cursor;
        while (visitor[this.MQ.R] !== ActionType.MQ_END) {
          if (this._isFraction(visitor[this.MQ.R])) {
            fractionNode = visitor[this.MQ.R];
          }
          visitor = visitor[this.MQ.R];
        }

        // Jump into it!
        cursor.insLeftOf(fractionNode);
        this.mathField.keystroke("Right");
        break;
      case CursorContext.IN_NUMERATOR:
        // HACK(charlie): I can't find a better way to do this. The goal
        // is to place the cursor at the start of the matching
        // denominator. So, we identify the appropriate node, and
        // continue rightwards until we find ourselves inside of it.
        // It's possible that there are cases in which we don't reach
        // the denominator, though I can't think of any.
        const siblingDenominator = cursor.parent.parent.blocks[1];
        while (cursor.parent !== siblingDenominator) {
          this.mathField.keystroke("Right");
        }
        break;
      case CursorContext.IN_DENOMINATOR:
        cursor.insRightOf(cursor.parent.parent);
        break;
      case CursorContext.IN_SUB_SCRIPT:
        // Insert just beyond the superscript.
        cursor.insRightOf(cursor.parent.parent);

        // Navigate right once more, if we're right before parens. This
        // is to handle the standard case in which the subscript is the
        // base of a custom log.
        if (this._isParens(cursor[this.MQ.R])) {
          this.mathField.keystroke("Right");
        }
        break;
      case CursorContext.IN_SUPER_SCRIPT:
        // Insert just beyond the superscript.
        cursor.insRightOf(cursor.parent.parent);
        break;
      default:
        throw new Error("Attempted to 'Jump Out' from node, but found no " + "appropriate cursor context: ".concat(context));
    }
  }

  /**
   * Selects and deletes part of the expression based on the cursor location.
   * See inline comments for precise behavior of different cases.
   *
   * @param {cursor} cursor
   * @private
   */
  _handleBackspace(cursor) {
    if (!cursor.selection) {
      const parent = cursor.parent;
      const grandparent = parent.parent;
      const leftNode = cursor[this.MQ.L];
      if (this._isFraction(leftNode)) {
        this._selectNode(leftNode, cursor);
      } else if (this._isSquareRoot(leftNode)) {
        this._selectNode(leftNode, cursor);
      } else if (this._isNthRoot(leftNode)) {
        this._selectNode(leftNode, cursor);
      } else if (this._isNthRootIndex(parent)) {
        this._handleBackspaceInRootIndex(cursor);
      } else if (leftNode.ctrlSeq === "\\left(") {
        this._handleBackspaceOutsideParens(cursor);
      } else if (grandparent.ctrlSeq === "\\left(") {
        this._handleBackspaceInsideParens(cursor);
      } else if (this._isInsideLogIndex(cursor)) {
        this._handleBackspaceInLogIndex(cursor);
      } else if (leftNode.ctrlSeq === "\\ge " || leftNode.ctrlSeq === "\\le ") {
        this._handleBackspaceAfterLigaturedSymbol(cursor);
      } else if (this._isNthRoot(grandparent) && leftNode === ActionType.MQ_END) {
        this._handleBackspaceInNthRoot(cursor);
      } else {
        this.mathField.keystroke("Backspace");
      }
    } else {
      this.mathField.keystroke("Backspace");
    }
  }
  _handleLeftArrow(cursor) {
    // If we're inside a function, and just after the left parentheses, we
    // need to skip the entire function name, rather than move the cursor
    // inside of it. For example, when hitting left from within the
    // parentheses in `cos()`, we want to place the cursor to the left of
    // the entire expression, rather than between the `s` and the left
    // parenthesis.
    // From the cursor's perspective, this requires that our left node is
    // the ActionType.MQ_END node, that our grandparent is the left parenthesis, and
    // the nodes to the left of our grandparent comprise a valid function
    // name.
    if (cursor[this.MQ.L] === ActionType.MQ_END) {
      const parent = cursor.parent;
      const grandparent = parent.parent;
      if (grandparent.ctrlSeq === "\\left(") {
        const command = this._maybeFindCommandBeforeParens(grandparent);
        if (command) {
          cursor.insLeftOf(command.startNode);
          return;
        }
      }
    }

    // Otherwise, we default to the standard MathQull left behavior.
    this.mathField.keystroke("Left");
  }
  _handleRightArrow(cursor) {
    const command = this._maybeFindCommand(cursor[this.MQ.R]);
    if (command) {
      // Similarly, if a function is to our right, then we need to place
      // the cursor at the start of its parenthetical content, which is
      // done by putting it to the left of ites parentheses and then
      // moving right once.
      cursor.insLeftOf(command.endNode);
      this.mathField.keystroke("Right");
    } else {
      // Otherwise, we default to the standard MathQull right behavior.
      this.mathField.keystroke("Right");
    }
  }
  _handleExponent(cursor, key) {
    // If there's an invalid operator preceding the cursor (anything that
    // knowingly cannot be raised to a power), add an empty set of
    // parentheses and apply the exponent to that.
    const invalidPrefixes = [...ArithmeticOperators, ...EqualityOperators];
    const precedingNode = cursor[this.MQ.L];
    const shouldPrefixWithParens = precedingNode === ActionType.MQ_END || invalidPrefixes.includes(precedingNode.ctrlSeq.trim());
    if (shouldPrefixWithParens) {
      this.mathField.write("\\left(\\right)");
    }

    // Insert the appropriate exponent operator.
    switch (key) {
      case Keys.EXP:
        this.mathField.cmd("^");
        break;
      case Keys.EXP_2:
      case Keys.EXP_3:
        this.mathField.write("^".concat(key === Keys.EXP_2 ? 2 : 3));

        // If we enter a square or a cube, we should leave the cursor
        // within the newly inserted parens, if they exist. This takes
        // exactly four left strokes, since the cursor by default would
        // end up to the right of the exponent.
        if (shouldPrefixWithParens) {
          this.mathField.keystroke("Left");
          this.mathField.keystroke("Left");
          this.mathField.keystroke("Left");
          this.mathField.keystroke("Left");
        }
        break;
      default:
        throw new Error("Invalid exponent key: ".concat(key));
    }
  }

  /**
   * Return the start node, end node, and full name of the command of which
   * the initial node is a part, or `null` if the node is not part of a
   * command.
   *
   * @param {node} initialNode - the node to included as part of the command
   * @returns {null|object} - `null` or an object containing the start node
   *                          (`startNode`), end node (`endNode`), and full
   *                          name (`name`) of the command
   * @private
   */
  _maybeFindCommand(initialNode) {
    if (!initialNode) {
      return null;
    }

    // MathQuill stores commands as separate characters so that
    // users can delete commands one character at a time.  We iterate over
    // the nodes from right to left until we hit a sequence starting with a
    // '\\', which signifies the start of a command; then we iterate from
    // left to right until we hit a '\\left(', which signifies the end of a
    // command.  If we encounter any character that doesn't belong in a
    // command, we return null.  We match a single character at a time.
    // Ex) ['\\l', 'o', 'g ', '\\left(', ...]
    const commandCharRegex = /^[a-z]$/;
    const commandStartRegex = /^\\[a-z]$/;
    const commandEndSeq = "\\left(";

    // Note: We allowlist the set of valid commands, since relying solely on
    // a command being prefixed with a backslash leads to undesired
    // behavior. For example, Greek symbols, left parentheses, and square
    // roots all get treated as commands.
    const validCommands = ["\\log", "\\ln", "\\cos", "\\sin", "\\tan"];
    let name = "";
    let startNode;
    let endNode;

    // Collect the portion of the command from the current node, leftwards
    // until the start of the command.
    let node = initialNode;
    while (node !== 0) {
      const ctrlSeq = node.ctrlSeq.trim();
      if (commandCharRegex.test(ctrlSeq)) {
        name = ctrlSeq + name;
      } else if (commandStartRegex.test(ctrlSeq)) {
        name = ctrlSeq + name;
        startNode = node;
        break;
      } else {
        break;
      }
      node = node[this.MQ.L];
    }

    // If we hit the start of a command, then grab the rest of it by
    // iterating rightwards to compute the full name of the command, along
    // with its terminal node.
    if (startNode) {
      // Next, iterate from the start to the right.
      node = initialNode[this.MQ.R];
      while (node !== 0) {
        const ctrlSeq = node.ctrlSeq.trim();
        if (commandCharRegex.test(ctrlSeq)) {
          // If we have a single character, add it to the command
          // name.
          name = name + ctrlSeq;
        } else if (ctrlSeq === commandEndSeq) {
          // If we hit the command end delimiter (the left
          // parentheses surrounding its arguments), stop.
          endNode = node;
          break;
        }
        node = node[this.MQ.R];
      }
      if (validCommands.includes(name)) {
        return {
          name,
          startNode,
          endNode
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Return the start node, end node, and full name of the command to the left
   * of `\\left(`, or `null` if there is no command.
   *
   * @param {node} leftParenNode - node where .ctrlSeq == `\\left(`
   * @returns {null|object} - `null` or an object containing the start node
   *                          (`startNode`), end node (`endNode`), and full
   *                          name (`name`) of the command
   * @private
   */
  _maybeFindCommandBeforeParens(leftParenNode) {
    return this._maybeFindCommand(leftParenNode[this.MQ.L]);
  }
  _selectNode(node, cursor) {
    cursor.insLeftOf(node);
    cursor.startSelection();
    cursor.insRightOf(node);
    cursor.select();
    cursor.endSelection();
  }
  _isFraction(node) {
    return node.jQ && node.jQ.hasClass("mq-fraction");
  }
  _isNumerator(node) {
    return node.jQ && node.jQ.hasClass("mq-numerator");
  }
  _isDenominator(node) {
    return node.jQ && node.jQ.hasClass("mq-denominator");
  }
  _isSubScript(node) {
    // NOTE(charlie): MyScript has a structure whereby its superscripts seem
    // to be represented as a parent node with 'mq-sup-only' containing a
    // single child with 'mq-sup'.
    return node.jQ && (node.jQ.hasClass("mq-sub-only") || node.jQ.hasClass("mq-sub"));
  }
  _isSuperScript(node) {
    // NOTE(charlie): MyScript has a structure whereby its superscripts seem
    // to be represented as a parent node with 'mq-sup-only' containing a
    // single child with 'mq-sup'.
    return node.jQ && (node.jQ.hasClass("mq-sup-only") || node.jQ.hasClass("mq-sup"));
  }
  _isParens(node) {
    return node && node.ctrlSeq === "\\left(";
  }
  _isLeaf(node) {
    return node && node.ctrlSeq && ValidLeaves.includes(node.ctrlSeq.trim());
  }
  _isSquareRoot(node) {
    return node.blocks && node.blocks[0].jQ && node.blocks[0].jQ.hasClass("mq-sqrt-stem");
  }
  _isNthRoot(node) {
    return node.blocks && node.blocks[0].jQ && node.blocks[0].jQ.hasClass("mq-nthroot");
  }
  _isNthRootIndex(node) {
    return node.jQ && node.jQ.hasClass("mq-nthroot");
  }
  _isInsideLogIndex(cursor) {
    const grandparent = cursor.parent.parent;
    if (grandparent && grandparent.jQ.hasClass("mq-supsub")) {
      const command = this._maybeFindCommandBeforeParens(grandparent);
      if (command && command.name === "\\log") {
        return true;
      }
    }
    return false;
  }
  _isInsideEmptyNode(cursor) {
    return cursor[this.MQ.L] === ActionType.MQ_END && cursor[this.MQ.R] === ActionType.MQ_END;
  }
  _handleBackspaceInRootIndex(cursor) {
    if (this._isInsideEmptyNode(cursor)) {
      // When deleting the index in a nthroot, we change from the nthroot
      // to a sqrt, e.g. \sqrt[|]{35x-5} => |\sqrt{35x-5}.  If there's no
      // content under the root, then we delete the whole thing.

      const grandparent = cursor.parent.parent;
      const latex = grandparent.latex();
      const reinsertionPoint = grandparent[this.MQ.L];
      this._selectNode(grandparent, cursor);
      const rootIsEmpty = grandparent.blocks[1].jQ.text() === "";
      if (rootIsEmpty) {
        // If there is not content under the root then simply delete
        // the whole thing.
        this.mathField.keystroke("Backspace");
      } else {
        // Replace the nthroot with a sqrt if there was content under
        // the root.

        // Start by deleting the selection.
        this.mathField.keystroke("Backspace");

        // Replace the nth-root with a sqrt.
        this.mathField.write(latex.replace(/^\\sqrt\[\]/, "\\sqrt"));

        // Adjust the cursor to be to the left the sqrt.
        if (reinsertionPoint === ActionType.MQ_END) {
          this.mathField.moveToDirEnd(this.MQ.L);
        } else {
          cursor.insRightOf(reinsertionPoint);
        }
      }
    } else {
      if (cursor[this.MQ.L] !== ActionType.MQ_END) {
        // If the cursor is not at the leftmost position inside the
        // root's index, delete a character.
        this.mathField.keystroke("Backspace");
      }
    }
  }
  _handleBackspaceInLogIndex(cursor) {
    if (this._isInsideEmptyNode(cursor)) {
      const grandparent = cursor.parent.parent;
      const command = this._maybeFindCommandBeforeParens(grandparent);
      cursor.insLeftOf(command === null || command === void 0 ? void 0 : command.startNode);
      cursor.startSelection();
      if (grandparent[this.MQ.R] !== ActionType.MQ_END) {
        cursor.insRightOf(grandparent[this.MQ.R]);
      } else {
        cursor.insRightOf(grandparent);
      }
      cursor.select();
      cursor.endSelection();
      const isLogBodyEmpty = grandparent[this.MQ.R].contentjQ.text() === "";
      if (isLogBodyEmpty) {
        // If there's no content inside the log's parens then delete the
        // whole thing.
        this.mathField.keystroke("Backspace");
      }
    } else {
      this.mathField.keystroke("Backspace");
    }
  }
  _handleBackspaceOutsideParens(cursor) {
    // In this case the node with '\\left(' for its ctrlSeq
    // is the parent of the expression contained within the
    // parentheses.
    //
    // Handle selecting an expression before deleting:
    // (x+1)| => |(x+1)|
    // \log(x+1)| => |\log(x+1)|

    const leftNode = cursor[this.MQ.L];
    const rightNode = cursor[this.MQ.R];
    const command = this._maybeFindCommandBeforeParens(leftNode);
    if (command && command.startNode) {
      // There's a command before the parens so we select it as well as
      // the parens.
      cursor.insLeftOf(command.startNode);
      cursor.startSelection();
      if (rightNode === ActionType.MQ_END) {
        cursor.insAtRightEnd(cursor.parent);
      } else {
        cursor.insLeftOf(rightNode);
      }
      cursor.select();
      cursor.endSelection();
    } else {
      cursor.startSelection();
      cursor.insLeftOf(leftNode); // left of \\left(
      cursor.select();
      cursor.endSelection();
    }
  }
  _handleBackspaceInsideParens(cursor) {
    // Handle situations when the cursor is inside parens or a
    // command that uses parens, e.g. \log() or \tan()
    //
    // MathQuill represents log(x+1) in roughly the following way
    // [l, o, g, \\left[parent:[x, +, 1]]]
    //
    // If the cursor is inside the parentheses it's next to one of:
    // x, +, or 1.  This makes sub_sub_expr its parent and sub_expr
    // it's parent.
    //
    // Interestingly parent doesn't have any nodes to the left or
    // right of it (even though the corresponding DOM node has
    // ( and ) characters on either side.
    //
    // The grandparent's ctrlSeq is `\\left(`. The `\\right)` isn't
    // stored anywhere.  NOTE(kevinb): I believe this is because
    // MathQuill knows what the close paren should be and does the
    // right thing at render time.
    //
    // This conditional branch handles the following cases:
    // - \log(x+1|) => \log(x+|)
    // - \log(|x+1) => |\log(x+1)|
    // - \log(|) => |

    if (cursor[this.MQ.L] !== ActionType.MQ_END) {
      // This command contains math and there's some math to
      // the left of the cursor that we should delete normally
      // before doing anything special.
      this.mathField.keystroke("Backspace");
      return;
    }
    const grandparent = cursor.parent.parent;

    // If the cursors is inside the parens at the start but the command
    // has a subscript as is the case in log_n then move the cursor into
    // the subscript, e.g. \log_{5}(|x+1) => \log_{5|}(x+1)

    if (grandparent[this.MQ.L].sub) {
      // if there is a subscript
      if (grandparent[this.MQ.L].sub.jQ.text()) {
        // and it contains text
        // move the cursor to the right end of the subscript
        cursor.insAtRightEnd(grandparent[this.MQ.L].sub);
        return;
      }
    }

    // Determine if the parens are empty before we modify the
    // cursor's position.
    const isEmpty = this._isInsideEmptyNode(cursor);

    // Insert the cursor to the left of the command if there is one
    // or before the '\\left(` if there isn't
    const command = this._maybeFindCommandBeforeParens(grandparent);
    cursor.insLeftOf(command && command.startNode || grandparent);
    cursor.startSelection();
    cursor.insRightOf(grandparent);
    cursor.select();
    cursor.endSelection();

    // Delete the selection, but only if the parens were empty to
    // begin with.
    if (isEmpty) {
      this.mathField.keystroke("Backspace");
    }
  }
  _handleBackspaceAfterLigaturedSymbol(cursor) {
    this.mathField.keystroke("Backspace");
    this.mathField.keystroke("Backspace");
  }
  contextForCursor(cursor) {
    // First, try to find any fraction to the right, unimpeded.
    let visitor = cursor;
    while (visitor[this.MQ.R] !== ActionType.MQ_END) {
      if (this._isFraction(visitor[this.MQ.R])) {
        return CursorContext.BEFORE_FRACTION;
      } else if (!this._isLeaf(visitor[this.MQ.R])) {
        break;
      }
      visitor = visitor[this.MQ.R];
    }

    // If that didn't work, check if the parent or grandparent is a special
    // context, so that we can jump outwards.
    if (this._isParens(cursor.parent && cursor.parent.parent)) {
      return CursorContext.IN_PARENS;
    } else if (this._isNumerator(cursor.parent)) {
      return CursorContext.IN_NUMERATOR;
    } else if (this._isDenominator(cursor.parent)) {
      return CursorContext.IN_DENOMINATOR;
    } else if (this._isSubScript(cursor.parent)) {
      return CursorContext.IN_SUB_SCRIPT;
    } else if (this._isSuperScript(cursor.parent)) {
      return CursorContext.IN_SUPER_SCRIPT;
    } else {
      return CursorContext.NONE;
    }
  }
  _isAtTopLevel(cursor) {
    return !cursor.parent.parent;
  }
}

/**
 * A single function used to scroll a DOM node into view, optionally taking into
 * account that it may be obscured by the custom keypad. The logic makes the
 * strong assumption that the keypad will be anchored to the bottom of the page
 * in calculating its height, as this method may be called before the keypad has
 * animated into view.
 *
 * TODO(charlie): Move this scroll logic out of our components and into a higher
 * level in the component tree--perhaps even into webapp, beyond Perseus.
 */
const scrollIntoView = (containerNode, keypadNode) => {
  // TODO(charlie): There's no need for us to be reading the keypad bounds
  // here, since they're pre-determined by logic in the store. We should
  // instead pass around an object that knows the bounds.
  const containerBounds = containerNode.getBoundingClientRect();
  const containerBottomPx = containerBounds.bottom;
  const containerTopPx = containerBounds.top;

  // Get the element that scrolls the document.
  const scrollNode = document.scrollingElement;
  const desiredMarginPx = 16;
  if (keypadNode) {
    // NOTE(charlie): We can't use the bounding rect of the keypad,
    // as it is likely in the process of animating in. Instead, to
    // calculate its top, we make the strong assumption that the
    // keypad will end up anchored at the bottom of the page, but above the
    // toolbar, and use its height, which is known at this point. Note that,
    // in the native apps (where the toolbar is rendered natively), this
    // will result in us leaving excess space between the input and the
    // keypad, but that seems okay.
    const pageHeightPx = window.innerHeight;
    const keypadHeightPx = keypadNode.clientHeight;
    const keypadTopPx = pageHeightPx - (keypadHeightPx + toolbarHeightPx);
    if (containerBottomPx > keypadTopPx) {
      // If the input would be obscured by the keypad, scroll such that
      // the bottom of the input is just above the top of the keypad,
      // taking care not to scroll the input out of view.
      const scrollOffset = Math.min(containerBottomPx - keypadTopPx + desiredMarginPx, containerTopPx);
      if (scrollNode) {
        scrollNode.scrollTop += scrollOffset;
      }
      return;
    }
  }

  // Alternatively, if the input is out of the viewport or nearly out
  // of the viewport, scroll it into view. We can do this regardless
  // of whether the keypad has been provided.
  if (scrollNode && containerTopPx < desiredMarginPx) {
    scrollNode.scrollTop -= containerBounds.height + desiredMarginPx;
  }
};

const constrainingFrictionFactor = 0.8;
// eslint-disable-next-line react/no-unsafe
class MathInput extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "didTouchOutside", void 0);
    _defineProperty(this, "didScroll", void 0);
    _defineProperty(this, "mathField", void 0);
    _defineProperty(this, "recordTouchStartOutside", void 0);
    _defineProperty(this, "blurOnTouchEndOutside", void 0);
    _defineProperty(this, "dragListener", void 0);
    _defineProperty(this, "inputRef", void 0);
    _defineProperty(this, "_isMounted", void 0);
    _defineProperty(this, "_mathContainer", void 0);
    _defineProperty(this, "_container", void 0);
    _defineProperty(this, "_root", void 0);
    _defineProperty(this, "_containerBounds", void 0);
    _defineProperty(this, "_keypadBounds", void 0);
    _defineProperty(this, "state", {
      focused: false,
      handle: {
        animateIntoPosition: false,
        visible: false,
        x: 0,
        y: 0
      }
    });
    _defineProperty(this, "_clearKeypadBoundsCache", () => {
      this._keypadBounds = null;
    });
    _defineProperty(this, "_cacheKeypadBounds", keypadNode => {
      this._keypadBounds = keypadNode.getBoundingClientRect();
    });
    _defineProperty(this, "_updateInputPadding", () => {
      this._container = ReactDOM__default["default"].findDOMNode(this);
      this._root = this._container.querySelector(".mq-root-block");
      const padding = this.getInputInnerPadding();
      // NOTE(diedra): This overrides the default 2px padding from Mathquil.
      this._root.style.padding = "".concat(padding.paddingTop, "px ").concat(padding.paddingRight, "px") + " ".concat(padding.paddingBottom, "px ").concat(padding.paddingLeft, "px");
      this._root.style.fontSize = "".concat(fontSizePt, "pt");
    });
    _defineProperty(this, "_getKeypadBounds", () => {
      if (!this._keypadBounds) {
        const node = this.props.keypadElement.getDOMNode();
        this._cacheKeypadBounds(node);
      }
      return this._keypadBounds;
    });
    _defineProperty(this, "_updateCursorHandle", animateIntoPosition => {
      const containerBounds = this._container.getBoundingClientRect();
      const cursor = this._container.querySelector(".mq-cursor");
      const cursorBounds = cursor.getBoundingClientRect();
      const cursorWidth = cursorBounds.width;
      const gapBelowCursor = 2;
      const inputInnerPadding = this.getInputInnerPadding();

      // The cursor should never be further right or left than the edge of the
      // container's values.
      const furthestRightCursorBound = containerBounds.right - cursorWidth - inputInnerPadding.paddingRight;
      const furthestLeftCursorBound = containerBounds.left + cursorWidth + inputInnerPadding.paddingLeft;
      let cursorBoundsLeft = cursorBounds.left;
      if (cursorBounds.left > furthestRightCursorBound) {
        cursorBoundsLeft = furthestRightCursorBound;
      } else if (cursorBounds.left < furthestLeftCursorBound) {
        cursorBoundsLeft = furthestLeftCursorBound;
      }
      this.setState({
        handle: {
          visible: true,
          animateIntoPosition,
          // We subtract containerBounds' left/top to correct for the
          // position of the container within the page.
          x: cursorBoundsLeft + cursorWidth / 2 - containerBounds.left,
          y: cursorBounds.bottom + gapBelowCursor - containerBounds.top
        }
      });
    });
    _defineProperty(this, "_hideCursorHandle", () => {
      this.setState({
        handle: {
          visible: false,
          x: 0,
          y: 0
        }
      });
    });
    _defineProperty(this, "_handleScroll", () => {
      // If animateIntoPosition is false, the user is currently manually positioning
      // the cursor. This is important because the user can scroll the input field
      // with the curor handle, and we don't want to override that ability.
      // But we do want to hide the handle is the user is just scrolling the input field
      // normally, because the handle will not move with the scroll.
      if (this.state.handle.animateIntoPosition !== false) {
        this._hideCursorHandle();
      }
    });
    _defineProperty(this, "blur", () => {
      this.mathField.blur();
      this.props.onBlur && this.props.onBlur();
      this.setState({
        focused: false,
        handle: {
          visible: false
        }
      });
    });
    _defineProperty(this, "focus", () => {
      // Pass this component's handleKey method to the keypad so it can call
      // it whenever it needs to trigger a keypress action.
      this.props.keypadElement.setKeyHandler(key => {
        const cursor = this.mathField.pressKey(key);

        // Trigger an `onChange` if the value in the input changed, and hide
        // the cursor handle whenever the user types a key. If the value
        // changed as a result of a keypress, we need to be careful not to
        // call `setState` until after `onChange` has resolved.
        const hideCursor = () => {
          this.setState({
            handle: {
              visible: false
            }
          });
        };
        const value = this.mathField.getContent();
        if (this.props.value !== value) {
          this.props.onChange(value, hideCursor);
        } else {
          hideCursor();
        }
        return cursor;
      });
      this.mathField.focus();
      this.props.onFocus && this.props.onFocus();
      this.setState({
        focused: true
      }, () => {
        // NOTE(charlie): We use `setTimeout` to allow for a layout pass to
        // occur. Otherwise, the keypad is measured incorrectly. Ideally,
        // we'd use requestAnimationFrame here, but it's unsupported on
        // Android Browser 4.3.
        setTimeout(() => {
          if (this._isMounted) {
            // TODO(benkomalo): the keypad is animating at this point,
            // so we can't call _cacheKeypadBounds(), even though
            // it'd be nice to do so. It should probably be the case
            // that the higher level controller tells us when the
            // keypad is settled (then scrollIntoView wouldn't have
            // to make assumptions about that either).
            const maybeKeypadNode = this.props.keypadElement && this.props.keypadElement.getDOMNode();
            scrollIntoView(this._container, maybeKeypadNode);
          }
        });
      });
    });
    _defineProperty(this, "_findHitNode", (containerBounds, x, y, dx, dy) => {
      while (y >= containerBounds.top && y <= containerBounds.bottom) {
        y += dy;
        const points = [[x - dx, y], [x, y], [x + dx, y]];
        const elements = points
        // @ts-expect-error [FEI-5003] - TS2556 - A spread argument must either have a tuple type or be passed to a rest parameter.
        .map(point => document.elementFromPoint(...point))
        // We exclude the root container itself and any nodes marked
        // as non-leaf which are fractions, parens, and roots.  The
        // children of those nodes are included in the list because
        // those are the items we care about placing the cursor next
        // to.
        //
        // MathQuill's mq-non-leaf is not applied to all non-leaf nodes
        // so the naming is a bit confusing.  Although fractions are
        // included, neither mq-numerator nor mq-denominator nodes are
        // and neither are subscripts or superscripts.
        .filter(element => element && this._root.contains(element) && (!element.classList.contains("mq-root-block") && !element.classList.contains("mq-non-leaf") || element.classList.contains("mq-empty") || element.classList.contains("mq-hasCursor")));
        let hitNode = null;

        // Contains only DOMNodes with child elements.
        const nonLeafElements = [];
        let max = 0;
        const counts = {};
        const elementsById = {};
        for (const element of elements) {
          // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
          const id = element.getAttribute("mathquill-command-id");
          if (id != null) {
            counts[id] = (counts[id] || 0) + 1;
            elementsById[id] = element;
          } else {
            // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'Element | null' is not assignable to parameter of type 'HTMLElement | null'.
            nonLeafElements.push(element);
          }
        }

        // When determining which DOMNode to place the cursor beside, we
        // prefer leaf nodes.  Hitting a leaf node is a good sign that the
        // cursor is really close to some piece of math that has been
        // rendered because leaf nodes contain text.  Non-leaf nodes may
        // contain a lot of whitespace so the cursor may be further away
        // from actual text within the expression.
        //
        // Since we're doing three hit tests per loop it's possible that
        // we hit multiple leaf nodes at the same time.  In this case we
        // we prefer the DOMNode with the most hits.
        // TODO(kevinb) consider preferring nodes hit by [x, y].
        for (const [id, count] of wonderStuffCore.entries(counts)) {
          if (count > max) {
            max = count;
            hitNode = elementsById[id];
          }
        }

        // It's possible that two non-leaf nodes are right beside each
        // other.  We don't bother counting the number of hits for each,
        // b/c this seems like an unlikely situation.  Also, ignoring the
        // hit count in the situation should not have serious effects on
        // the overall accuracy of the algorithm.
        if (hitNode == null && nonLeafElements.length > 0) {
          // @ts-expect-error [FEI-5003] - TS2322 - Type 'HTMLElement | null' is not assignable to type 'null'.
          hitNode = nonLeafElements[0];
        }
        if (hitNode !== null) {
          this.mathField.setCursorPosition(x, y, hitNode);
          return true;
        }
      }
      return false;
    });
    _defineProperty(this, "_insertCursorAtClosestNode", (x, y) => {
      const cursor = this.mathField.getCursor();

      // Pre-emptively check if the input has any child nodes; if not, the
      // input is empty, so we throw the cursor at the start.
      if (!this._root.hasChildNodes()) {
        cursor.insAtLeftEnd(this.mathField.mathField.__controller.root);
        return;
      }

      // NOTE(diedra): The adding and subtracting of 10 or 15 pixels here accounts
      // for the padding that surrounds the input values.
      if (y > this._containerBounds.bottom) {
        y = this._containerBounds.bottom - 10;
      } else if (y < this._containerBounds.top) {
        y = this._containerBounds.top + 10;
      }
      if (x > this._containerBounds.right) {
        x = this._containerBounds.right - 15;
      } else if (x < this._containerBounds.left) {
        x = this._containerBounds.left + 15;
      }
      let dy;

      // Vertical spacing between hit tests
      // dy is negative because we're moving upwards.
      dy = -8;

      // Horizontal spacing between hit tests
      // Note: This value depends on the font size.  If the gap is too small
      // we end up placing the cursor at the end of the expression when we
      // shouldn't.
      const dx = 5;
      if (this._findHitNode(this._containerBounds, x, y, dx, dy)) {
        return;
      }

      // If we haven't found anything start from the top.
      y = this._containerBounds.top;

      // dy is positive b/c we're going downwards.
      dy = 8;
      if (this._findHitNode(this._containerBounds, x, y, dx, dy)) {
        return;
      }
      const firstChildBounds = this._root.firstChild.getBoundingClientRect();
      const lastChildBounds = this._root.lastChild.getBoundingClientRect();
      const left = firstChildBounds.left;
      const right = lastChildBounds.right;

      // We've exhausted all of the options. We're likely either to the right
      // or left of all of the math, so we place the cursor at the end to
      // which it's closest.
      if (Math.abs(x - right) < Math.abs(x - left)) {
        cursor.insAtRightEnd(this.mathField.mathField.__controller.root);
      } else {
        cursor.insAtLeftEnd(this.mathField.mathField.__controller.root);
      }
      // In that event, we need to update the cursor context ourselves.
      this.props.keypadElement && this.props.keypadElement.setCursor({
        context: this.mathField.contextForCursor(cursor)
      });
    });
    _defineProperty(this, "handleTouchStart", e => {
      e.stopPropagation();

      // Hide the cursor handle on touch start, if the handle itself isn't
      // handling the touch event.
      this._hideCursorHandle();

      // Cache the container bounds, so as to avoid re-computing. If we don't
      // have any content, then it's not necessary, since the cursor can't be
      // moved anyway.
      if (this.mathField.getContent() !== "") {
        this._containerBounds = this._container.getBoundingClientRect();

        // Make the cursor visible and set the handle-less cursor's
        // location.
        const touch = e.changedTouches[0];
        this._insertCursorAtClosestNode(touch.clientX, touch.clientY);
      }

      // Trigger a focus event, if we're not already focused.
      if (!this.state.focused) {
        this.focus();
      }
    });
    _defineProperty(this, "handleTouchMove", e => {
      e.stopPropagation();

      // Update the handle-less cursor's location on move, if there's any
      // content in the box. Note that if the user touched outside the keypad
      // (e.g., with a different finger) during this touch interaction, we
      // may have blurred, in which case we should ignore the touch (since
      // the cursor is no longer visible and the input is no longer
      // highlighted).
      if (this.mathField.getContent() !== "" && this.state.focused) {
        const touch = e.changedTouches[0];
        this._insertCursorAtClosestNode(touch.clientX, touch.clientY);
      }
    });
    _defineProperty(this, "handleTouchEnd", e => {
      e.stopPropagation();

      // And on touch-end, reveal the cursor, unless the input is empty. Note
      // that if the user touched outside the keypad (e.g., with a different
      // finger) during this touch interaction, we may have blurred, in which
      // case we should ignore the touch (since the cursor is no longer
      // visible and the input is no longer highlighted).
      if (this.mathField.getContent() !== "" && this.state.focused) {
        this._updateCursorHandle();
      }
    });
    _defineProperty(this, "onCursorHandleTouchStart", e => {
      // NOTE(charlie): The cursor handle is a child of this view, so whenever
      // it receives a touch event, that event would also typically be bubbled
      // up to our own handlers. However, we want the cursor to handle its own
      // touch events, and for this view to only handle touch events that
      // don't affect the cursor. As such, we `stopPropagation` on any touch
      // events that are being handled by the cursor, so as to avoid handling
      // them in our own touch handlers.
      e.stopPropagation();
      e.preventDefault();

      // Cache the container bounds, so as to avoid re-computing.
      this._containerBounds = this._container.getBoundingClientRect();
    });
    _defineProperty(this, "_constrainToBound", (value, min, max, friction) => {
      if (value < min) {
        return min + (value - min) * friction;
      } else if (value > max) {
        return max + (value - max) * friction;
      } else {
        return value;
      }
    });
    _defineProperty(this, "onCursorHandleTouchMove", e => {
      e.stopPropagation();
      const x = e.changedTouches[0].clientX;
      const y = e.changedTouches[0].clientY;
      const relativeX = x - this._containerBounds.left;
      const relativeY = y - 2 * cursorHandleRadiusPx * cursorHandleDistanceMultiplier - this._containerBounds.top;

      // We subtract the containerBounds left/top to correct for the
      // MathInput's position on the page. On top of that, we subtract an
      // additional 2 x {height of the cursor} so that the bottom of the
      // cursor tracks the user's finger, to make it visible under their
      // touch.
      this.setState({
        handle: {
          animateIntoPosition: false,
          visible: true,
          // TODO(charlie): Use clientX and clientY to avoid the need for
          // scroll offsets. This likely also means that the cursor
          // detection doesn't work when scrolled, since we're not
          // offsetting those values.
          x: this._constrainToBound(relativeX, 0, this._containerBounds.width, constrainingFrictionFactor),
          y: this._constrainToBound(relativeY, 0, this._containerBounds.height, constrainingFrictionFactor)
        }
      });

      // Use a y-coordinate that's just above where the user is actually
      // touching because they're dragging the handle which is a little
      // below where the cursor actually is.
      const distanceAboveFingerToTrySelecting = 22;
      const adjustedY = y - distanceAboveFingerToTrySelecting;
      this._insertCursorAtClosestNode(x, adjustedY);
    });
    _defineProperty(this, "onCursorHandleTouchEnd", e => {
      e.stopPropagation();
      this._updateCursorHandle(true);
    });
    _defineProperty(this, "onCursorHandleTouchCancel", e => {
      e.stopPropagation();
      this._updateCursorHandle(true);
    });
    _defineProperty(this, "domKeyToMathQuillKey", key => {
      const keyMap = {
        "+": Keys.PLUS,
        "-": Keys.MINUS,
        "*": Keys.TIMES,
        "/": Keys.DIVIDE,
        ".": Keys.DECIMAL,
        "%": Keys.PERCENT,
        "=": Keys.EQUAL,
        ">": Keys.GT,
        "<": Keys.LT,
        "^": Keys.EXP
      };

      // Numbers
      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) {
        return "NUM_".concat(key);
      }

      // Movement keys
      else if (key === "Backspace") {
        return Keys.BACKSPACE;
      }

      // Operators
      else if (key in keyMap) {
        return keyMap[key];
      }

      // The key pressed doesn't map to any of the math input operators
      return null;
    });
    _defineProperty(this, "handleKeyUp", event => {
      const mathQuillKey = this.domKeyToMathQuillKey(event.key);
      if (mathQuillKey) {
        this.mathField.pressKey(mathQuillKey);

        // TODO(diedra): If the new value being added is off-screen to the right
        // due to the max-width of the text box, scroll the box to show the newest
        // value
        const value = this.mathField.getContent();
        if (this.props.value !== value) {
          this.mathField.setContent(this.props.value);
          this.props.onChange(value, false);
          this._hideCursorHandle();
        }
      }
    });
    _defineProperty(this, "getBorderWidthPx", () => {
      // TODO(diedra): Move these to the common style package.
      const normalBorderWidthPx = 1;
      const focusedBorderWidthPx = 2;
      return this.state.focused ? focusedBorderWidthPx : normalBorderWidthPx;
    });
    _defineProperty(this, "getInputInnerPadding", () => {
      const paddingInset = totalDesiredPadding - this.getBorderWidthPx();

      // Now, translate that to the appropriate padding for each direction.
      // The complication here is that we want numerals to be centered within
      // the input. However, Symbola (MathQuill's font of choice) renders
      // numerals with approximately 3px of padding below and 1px of padding
      // above (to make room for ascenders and descenders). So we ignore those
      // padding values for the vertical directions.
      const symbolaPaddingBottom = 3;
      const symbolaPaddingTop = 1;
      const padding = {
        paddingTop: paddingInset - symbolaPaddingTop,
        paddingRight: paddingInset,
        paddingBottom: paddingInset - symbolaPaddingBottom,
        paddingLeft: paddingInset
      };
      return padding;
    });
  }
  componentDidMount() {
    this._isMounted = true;
    this.mathField = new MathWrapper(this._mathContainer, {}, {
      onCursorMove: cursor => {
        // TODO(charlie): It's not great that there is so much coupling
        // between this keypad and the input behavior. We should wrap
        // this `MathInput` component in an intermediary component
        // that translates accesses on the keypad into vanilla props,
        // to make this input keypad-agnostic.
        this.props.keypadElement && this.props.keypadElement.setCursor(cursor);
      }
    });

    // NOTE(charlie): MathQuill binds this handler to manage its
    // drag-to-select behavior. For reasons that I can't explain, the event
    // itself gets triggered even if you tap slightly outside of the
    // bound container (maybe 5px outside of any boundary). As a result, the
    // cursor appears when tapping at those locations, even though the input
    // itself doesn't receive any touch start or mouse down event and, as
    // such, doesn't focus itself. This makes for a confusing UX, as the
    // cursor appears, but the keypad does not and the input otherwise
    // treats itself as unfocused. Thankfully, we don't need this behavior--
    // we manage all of the cursor interactions ourselves--so we can safely
    // unbind the handler.
    this.mathField.mathField.__controller.container.unbind("mousedown.mathquill");
    this.mathField.setContent(this.props.value);
    this._updateInputPadding();
    this._container = ReactDOM__default["default"].findDOMNode(this);
    this._root = this._container.querySelector(".mq-root-block");
    this._root.addEventListener("scroll", this._handleScroll);

    // Record the initial scroll displacement on touch start. This allows
    // us to detect whether a touch event was a scroll and only blur the
    // input on non-scrolls--blurring the input on scroll makes for a
    // frustrating user experience.
    this.recordTouchStartOutside = evt => {
      if (this.state.focused) {
        // Only blur if the touch is both outside of the input, and
        // above or to the left or right of the keypad (if it has been
        // provided). The reasoning for not blurring when touches occur
        // below the keypad is that the keypad may be anchored above
        // the 'Check answer' bottom bar, in which case, we don't want
        // to dismiss the keypad on check.
        // TODO(charlie): Inject this logic.
        if (!this._container.contains(evt.target)) {
          let touchDidStartInOrBelowKeypad = false;
          if (this.props.keypadElement && this.props.keypadElement.getDOMNode()) {
            const bounds = this._getKeypadBounds();
            for (let i = 0; i < evt.changedTouches.length; i++) {
              const [x, y] = [evt.changedTouches[i].clientX, evt.changedTouches[i].clientY];
              if (bounds.left <= x && bounds.right >= x && bounds.top <= y && bounds.bottom >= y || bounds.bottom < y) {
                touchDidStartInOrBelowKeypad = true;
                break;
              }
            }
          }
          if (!touchDidStartInOrBelowKeypad) {
            this.didTouchOutside = true;
            if (this.dragListener) {
              this.dragListener.detach();
            }
            this.dragListener = new DragListener(() => {
              this.didScroll = true;
              this.dragListener.detach();
            }, evt);
            this.dragListener.attach();
          }
        }
      }
    };
    this.blurOnTouchEndOutside = evt => {
      // If the user didn't scroll, blur the input.
      // TODO(charlie): Verify that the touch that ended actually started
      // outside the keypad. Right now, you can touch down on the keypad,
      // touch elsewhere, release the finger on the keypad, and trigger a
      // dismissal. This code needs to be generalized to handle
      // multi-touch.
      if (this.state.focused && this.didTouchOutside && !this.didScroll) {
        this.blur();
      }
      this.didTouchOutside = false;
      this.didScroll = false;
      if (this.dragListener) {
        this.dragListener.detach();
      }
    };
    window.addEventListener("touchstart", this.recordTouchStartOutside);
    window.addEventListener("touchend", this.blurOnTouchEndOutside);
    window.addEventListener("touchcancel", this.blurOnTouchEndOutside);

    // HACK(benkomalo): if the window resizes, the keypad bounds can
    // change. That's a bit peeking into the internals of the keypad
    // itself, since we know bounds can change only when the viewport
    // changes, but seems like a rare enough thing to get wrong that it's
    // not worth wiring up extra things for the technical "purity" of
    // having the keypad notify of changes to us.
    window.addEventListener("resize", this._clearKeypadBoundsCache);
    window.addEventListener("orientationchange", this._clearKeypadBoundsCache);
  }
  UNSAFE_componentWillReceiveProps(props) {
    if (this.props.keypadElement !== props.keypadElement) {
      this._clearKeypadBoundsCache();
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.mathField.getContent() !== this.props.value) {
      this.mathField.setContent(this.props.value);
    }
    if (prevState.focused !== this.state.focused) {
      this._updateInputPadding();
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener("touchstart", this.recordTouchStartOutside);
    window.removeEventListener("touchend", this.blurOnTouchEndOutside);
    window.removeEventListener("touchcancel", this.blurOnTouchEndOutside);
    // @ts-expect-error [FEI-5003] - TS2769 - No overload matches this call.
    window.removeEventListener("resize", this._clearKeypadBoundsCache());
    window.removeEventListener("orientationchange",
    // @ts-expect-error [FEI-5003] - TS2769 - No overload matches this call.
    this._clearKeypadBoundsCache());
  }
  render() {
    const {
      focused,
      handle
    } = this.state;
    const {
      style
    } = this.props;
    const innerStyle = {
      ...inlineStyles$1.innerContainer,
      borderWidth: this.getBorderWidthPx(),
      ...(focused ? {
        borderColor: wonderBlocksBlue
      } : {}),
      ...style
    };

    // NOTE(diedra): This label explicitly refers to tapping because this field
    // is currently only seen if the user is using a mobile device.
    // We added the tapping instructions because there is currently a bug where
    // Android users need to use two fingers to tap the input field to make the
    // keyboard appear. It should only require one finger, which is how iOS works.
    // TODO(diedra): Fix the bug that is causing Android to require a two finger tap
    // to the open the keyboard, and then remove the second half of this label.
    const ariaLabel = i18n__namespace._("Math input box") + " " + i18n__namespace._("Tap with one or two fingers to open keyboard");
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: styles$e.input,
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchEnd,
      onClick: e => e.stopPropagation(),
      role: "textbox",
      ariaLabel: ariaLabel
    }, /*#__PURE__*/React__namespace.createElement("div", {
      className: "keypad-input"
      // @ts-expect-error [FEI-5003] - TS2322 - Type 'string' is not assignable to type 'number | undefined'.
      ,
      tabIndex: "0",
      ref: node => {
        this.inputRef = node;
      },
      onKeyUp: this.handleKeyUp
    }, /*#__PURE__*/React__namespace.createElement("div", {
      ref: node => {
        this._mathContainer = ReactDOM__default["default"].findDOMNode(node);
      },
      style: innerStyle
    })), focused && handle.visible && /*#__PURE__*/React__namespace.createElement(CursorHandle, _extends({}, handle, {
      onTouchStart: this.onCursorHandleTouchStart,
      onTouchMove: this.onCursorHandleTouchMove,
      onTouchEnd: this.onCursorHandleTouchEnd,
      onTouchCancel: this.onCursorHandleTouchCancel
    })));
  }
}
_defineProperty(MathInput, "defaultProps", {
  style: {},
  value: ""
});
const fontSizePt = 18;
const inputMaxWidth = 128;

// The height of numerals in Symbola (rendered at 18pt) is about 20px (though
// they render at 24px due to padding for ascenders and descenders). We want our
// box to be laid out such that there's 12px of padding between a numeral and the
// edge of the input, so we use this 20px number as our 'base height' and
// account for the ascender and descender padding when computing the additional
// padding in our `render` method.
const numeralHeightPx = 20;
const totalDesiredPadding = 12;
const minHeightPx = numeralHeightPx + totalDesiredPadding * 2;
const minWidthPx = 64;
const styles$e = aphrodite.StyleSheet.create({
  input: {
    position: "relative",
    display: "inline-block",
    verticalAlign: "middle",
    maxWidth: inputMaxWidth
  }
});
const inlineStyles$1 = {
  // Styles for the inner, MathQuill-ified input element. It's important that
  // these are done with regular inline styles rather than Aphrodite classes
  // as MathQuill adds CSS class names to the element outside of the typical
  // React flow; assigning a class to the element can thus disrupt MathQuill
  // behavior. For example, if the client provided new styles to be applied
  // on focus and the styles here were applied with Aphrodite, then Aphrodite
  // would merge the provided styles with the base styles here, producing a
  // new CSS class name that we would apply to the element, clobbering any CSS
  // class names that MathQuill had applied itself.
  innerContainer: {
    backgroundColor: "white",
    minHeight: minHeightPx,
    minWidth: minWidthPx,
    maxWidth: inputMaxWidth,
    boxSizing: "border-box",
    position: "relative",
    borderStyle: "solid",
    borderColor: Color__default["default"].offBlack50,
    borderRadius: 4,
    color: offBlack
  }
};

/**
 * React PropTypes that may be shared between components.
 */

// NOTE(jared): This is no longer guaranteed to be React element
// NOTE(matthewc): only seems to be used in Perseus
const keypadElementPropType = PropTypes__default["default"].shape({
  activate: PropTypes__default["default"].func.isRequired,
  dismiss: PropTypes__default["default"].func.isRequired,
  configure: PropTypes__default["default"].func.isRequired,
  setCursor: PropTypes__default["default"].func.isRequired,
  setKeyHandler: PropTypes__default["default"].func.isRequired,
  getDOMNode: PropTypes__default["default"].func.isRequired
});

// naming convention: verb + noun
// the noun should be one of the other properties in the object that's
// being dispatched

const dismissKeypad = () => {
  return {
    type: "DismissKeypad"
  };
};
const activateKeypad = () => {
  return {
    type: "ActivateKeypad"
  };
};

/**
 * Configure the keypad with the provided configuration parameters.
 */

const configureKeypad = configuration => {
  return {
    type: "ConfigureKeypad",
    configuration
  };
};
const setPageSize = (pageWidthPx, pageHeightPx) => {
  return {
    type: "SetPageSize",
    pageWidthPx,
    pageHeightPx
  };
};
const removeEcho = animationId => {
  return {
    type: "RemoveEcho",
    animationId
  };
};

// Input-related actions.

const setKeyHandler = keyHandler => {
  return {
    type: "SetKeyHandler",
    keyHandler
  };
};
const setCursor = cursor => {
  return {
    type: "SetCursor",
    cursor
  };
};

// Gesture actions

const onSwipeChange = dx => {
  return {
    type: "OnSwipeChange",
    dx
  };
};
const onSwipeEnd = dx => {
  return {
    type: "OnSwipeEnd",
    dx
  };
};
const setActiveNodes = activeNodes => {
  return {
    type: "SetActiveNodes",
    activeNodes
  };
};
const pressKey = (key, borders, initialBounds, inPopover) => {
  return {
    type: "PressKey",
    key,
    borders,
    initialBounds,
    inPopover
  };
};

/**
 * The state machine that backs our gesture system. In particular, this state
 * machine manages the interplay between focuses, touch ups, and swiping.
 * It is entirely ignorant of the existence of popovers and the positions of
 * DOM nodes, operating solely on IDs. The state machine does accommodate for
 * multi-touch interactions, tracking gesture state on a per-touch basis.
 */

// exported for tests

const defaultOptions = {
  longPressWaitTimeMs: 50,
  swipeThresholdPx: 20,
  holdIntervalMs: 250
};
class GestureStateMachine {
  constructor(handlers, options, swipeDisabledNodeIds, multiPressableKeys) {
    _defineProperty(this, "handlers", void 0);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "swipeDisabledNodeIds", void 0);
    _defineProperty(this, "multiPressableKeys", void 0);
    _defineProperty(this, "touchState", void 0);
    _defineProperty(this, "swipeState", void 0);
    this.handlers = handlers;
    this.options = {
      ...defaultOptions,
      ...options
    };
    this.swipeDisabledNodeIds = swipeDisabledNodeIds || [];
    this.multiPressableKeys = multiPressableKeys || [];

    // TODO(charlie): Add types for this file. It's not great that we're now
    // passing around these opaque state objects.
    this.touchState = {};
    this.swipeState = null;
  }
  _maybeCancelLongPressForTouch(touchId) {
    const {
      longPressTimeoutId
    } = this.touchState[touchId];
    if (longPressTimeoutId) {
      clearTimeout(longPressTimeoutId);
      this.touchState[touchId] = {
        ...this.touchState[touchId],
        longPressTimeoutId: null
      };
    }
  }
  _maybeCancelPressAndHoldForTouch(touchId) {
    const {
      pressAndHoldIntervalId
    } = this.touchState[touchId];
    if (pressAndHoldIntervalId) {
      // If there was an interval set to detect holds, clear it out.
      clearInterval(pressAndHoldIntervalId);
      this.touchState[touchId] = {
        ...this.touchState[touchId],
        pressAndHoldIntervalId: null
      };
    }
  }
  _cleanupTouchEvent(touchId) {
    this._maybeCancelLongPressForTouch(touchId);
    this._maybeCancelPressAndHoldForTouch(touchId);
    delete this.touchState[touchId];
  }

  /**
   * Handle a focus event on the node with the given identifier, which may be
   * `null` to indicate that the user has dragged their finger off of any
   * registered nodes, but is still in the middle of a gesture.
   *
   * @param {string|null} id - the identifier of the newly focused node, or
   *                           `null` if no node is focused
   * @param {number} touchId - a unique identifier associated with the touch
   */
  _onFocus(id, touchId) {
    // If we're in the middle of a long-press, cancel it.
    this._maybeCancelLongPressForTouch(touchId);

    // Reset any existing hold-detecting interval.
    this._maybeCancelPressAndHoldForTouch(touchId);

    // Set the focused node ID and handle the focus event.
    // Note: we can call `onFocus` with `null` IDs. The semantics of an
    // `onFocus` with a `null` ID differs from that of `onBlur`. The former
    // indicates that a gesture that can focus future nodes is still in
    // progress, but that no node is currently focused. The latter
    // indicates that the gesture has ended and nothing will be focused.
    this.touchState[touchId] = {
      ...this.touchState[touchId],
      activeNodeId: id
    };
    this.handlers.onFocus(id);
    if (id) {
      // Handle logic for repeating button presses.
      if (this.multiPressableKeys.includes(id)) {
        // Start by triggering a click, iOS style.
        this.handlers.onTrigger(id);

        // Set up a new hold detector for the current button.
        this.touchState[touchId] = {
          ...this.touchState[touchId],
          pressAndHoldIntervalId: setInterval(() => {
            // On every cycle, trigger the click handler.
            this.handlers.onTrigger(id);
          }, this.options.holdIntervalMs)
        };
      } else {
        // Set up a new hold detector for the current button.
        this.touchState[touchId] = {
          ...this.touchState[touchId],
          longPressTimeoutId: setTimeout(() => {
            this.handlers.onLongPress(id);
            this.touchState[touchId] = {
              ...this.touchState[touchId],
              longPressTimeoutId: null
            };
          }, this.options.longPressWaitTimeMs)
        };
      }
    }
  }

  /**
   * Clear out all active gesture information.
   */
  _onSwipeStart() {
    for (const activeTouchId of Object.keys(this.touchState)) {
      this._maybeCancelLongPressForTouch(activeTouchId);
      this._maybeCancelPressAndHoldForTouch(activeTouchId);
    }
    this.touchState = {};
    this.handlers.onBlur();
  }

  /**
   * A function that returns the identifier of the node over which the touch
   * event occurred. This is provided as a piece of lazy computation, as
   * computing the DOM node for a given point is expensive, and the state
   * machine won't always need that information. For example, if the user is
   * swiping, then `onTouchMove` needs to be performant and doesn't care about
   * the node over which the touch occurred.
   *
   * @typedef idComputation
   * @returns {DOMNode} - the identifier of the node over which the touch
   *                      occurred
   */

  /**
   * Handle a touch-start event on the node with the given identifer.
   *
   * @param {idComputation} getId - a function that returns identifier of the
   *                                node over which the start event occurred
   * @param {number} touchId - a unique identifier associated with the touch
   */
  onTouchStart(getId, touchId, pageX) {
    // Ignore any touch events that start mid-swipe.
    if (this.swipeState) {
      return;
    }
    if (this.touchState[touchId]) {
      // It turns out we can get multiple touch starts with no
      // intervening move, end, or cancel events in Android WebViews.
      // TODO(benkomalo): it's not entirely clear why this happens, but
      // it seems to happen with the backspace button. It may be related
      // to FastClick (https://github.com/ftlabs/fastclick/issues/71)
      // though I haven't verified, and it's probably good to be robust
      // here anyways.
      return;
    }
    const startingNodeId = getId();
    this.touchState[touchId] = {
      swipeLocked: this.swipeDisabledNodeIds.includes(startingNodeId),
      startX: pageX
    };
    this._onFocus(startingNodeId, touchId);
  }

  /**
   * Handle a touch-move event on the node with the given identifer.
   *
   * @param {idComputation} getId - a function that returns identifier of the
   *                                node over which the move event occurred
   * @param {number} touchId - a unique identifier associated with the touch
   * @param {number} pageX - the x coordinate of the touch
   * @param {boolean} swipeEnabled - whether the system should allow for
   *                                 transitions into a swiping state
   */
  onTouchMove(getId, touchId, pageX, swipeEnabled) {
    if (this.swipeState) {
      // Only respect the finger that started a swipe. Any other lingering
      // gestures are ignored.
      if (this.swipeState.touchId === touchId) {
        this.handlers.onSwipeChange(pageX - this.swipeState.startX);
      }
    } else if (this.touchState[touchId]) {
      // It could be touch events started outside the keypad and
      // moved into it; ignore them.
      const {
        activeNodeId,
        startX,
        swipeLocked
      } = this.touchState[touchId];
      const dx = pageX - startX;
      const shouldBeginSwiping = swipeEnabled && !swipeLocked && Math.abs(dx) > this.options.swipeThresholdPx;
      if (shouldBeginSwiping) {
        this._onSwipeStart();

        // Trigger the swipe.
        this.swipeState = {
          touchId,
          startX
        };
        this.handlers.onSwipeChange(pageX - this.swipeState.startX);
      } else {
        const id = getId();
        if (id !== activeNodeId) {
          this._onFocus(id, touchId);
        }
      }
    }
  }

  /**
   * Handle a touch-end event on the node with the given identifer.
   *
   * @param {idComputation} getId - a function that returns identifier of the
   *                                node over which the end event occurred
   * @param {number} touchId - a unique identifier associated with the touch
   * @param {number} pageX - the x coordinate of the touch
   */
  onTouchEnd(getId, touchId, pageX) {
    if (this.swipeState) {
      // Only respect the finger that started a swipe. Any other lingering
      // gestures are ignored.
      if (this.swipeState.touchId === touchId) {
        this.handlers.onSwipeEnd(pageX - this.swipeState.startX);
        this.swipeState = null;
      }
    } else if (this.touchState[touchId]) {
      // It could be touch events started outside the keypad and
      // moved into it; ignore them.
      const {
        activeNodeId,
        pressAndHoldIntervalId
      } = this.touchState[touchId];
      this._cleanupTouchEvent(touchId);
      const didPressAndHold = !!pressAndHoldIntervalId;
      if (didPressAndHold) {
        // We don't trigger a touch end if there was a press and hold,
        // because the key has been triggered at least once and calling
        // the onTouchEnd handler would add an extra trigger.
        this.handlers.onBlur();
      } else {
        // Trigger a touch-end. There's no need to notify clients of a
        // blur as clients are responsible for handling any cleanup in
        // their touch-end handlers.
        this.handlers.onTouchEnd(activeNodeId);
      }
    }
  }

  /**
   * Handle a touch-cancel event.
   */
  onTouchCancel(touchId) {
    // If a touch is cancelled and we're swiping, end the swipe with no
    // displacement.
    if (this.swipeState) {
      if (this.swipeState.touchId === touchId) {
        this.handlers.onSwipeEnd(0);
        this.swipeState = null;
      }
    } else if (this.touchState[touchId]) {
      // Otherwise, trigger a full blur. We don't want to trigger a
      // touch-up, since the cancellation means that the user probably
      // didn't release over a key intentionally.
      this._cleanupTouchEvent(touchId);
      this.handlers.onBlur();
    }
  }
}

/**
 * A manager for our node-to-ID system. In particular, this class is
 * responsible for maintaing a mapping between DOM nodes and node IDs, and
 * translating touch events from the raw positions at which they occur to the
 * nodes over which they are occurring. This differs from browser behavior, in
 * which touch events are only sent to the node in which a touch started.
 */

class NodeManager {
  constructor() {
    _defineProperty(this, "_nodesById", void 0);
    _defineProperty(this, "_bordersById", void 0);
    _defineProperty(this, "_orderedIds", void 0);
    _defineProperty(this, "_cachedBoundingBoxesById", void 0);
    // A mapping from IDs to DOM nodes.
    this._nodesById = {};

    // A mapping from IDs to the borders around the DOM nodes, which can be
    // useful for layout purposes.
    this._bordersById = {};

    // An ordered list of IDs, where DOM nodes that are "higher" on the
    // page come earlier in the list. Note that an ID may be present in
    // this ordered list but not be registered to a DOM node (i.e., if it
    // is registered as a child of another DOM node, but hasn't appeared in
    // the DOM yet).
    this._orderedIds = [];

    // Cache bounding boxes aggressively, re-computing on page resize. Our
    // caching here makes the strict assumption that if a node is reasonably
    // assumed to be on-screen, its bounds won't change. For example, if we
    // see that a touch occurred within the bounds of a node, we cache those
    // bounds.
    // TODO(charlie): It'd be great if we could pre-compute these when the
    // page is idle and the keypad is visible (i.e., the nodes are in their
    // proper positions).
    this._cachedBoundingBoxesById = {};
    window.addEventListener("resize", () => {
      this._cachedBoundingBoxesById = {};
    });
  }

  /**
   * Register a DOM node with a given identifier.
   *
   * @param {string} id - the identifier of the given node
   * @param {node} domNode - the DOM node linked to the identifier
   * @param {object} borders - an opaque object describing the node's borders
   */
  registerDOMNode(id, domNode, childIds, borders) {
    this._nodesById[id] = domNode;
    this._bordersById[id] = borders;

    // Make sure that any children appear first.
    // TODO(charlie): This is a very simplistic system that wouldn't
    // properly handle multiple levels of nesting.
    const allIds = [...(childIds || []), id, ...this._orderedIds];

    // De-dupe the list of IDs.
    const orderedIds = [];
    const seenIds = {};
    for (const id of allIds) {
      if (!seenIds[id]) {
        // @ts-expect-error TS2345
        orderedIds.push(id);
        seenIds[id] = true;
      }
    }
    this._orderedIds = orderedIds;
  }

  /**
   * Unregister the DOM node with the given identifier.
   *
   * @param {string} id - the identifier of the node to unregister
   */
  unregisterDOMNode(id) {
    delete this._nodesById[id];
  }

  /**
   * Return the identifier of the topmost node located at the given
   * coordinates.
   *
   * @param {number} x - the x coordinate at which to search for a node
   * @param {number} y - the y coordinate at which to search for a node
   * @returns {null|string} - null or the identifier of the topmost node at
   *                          the given coordinates
   */
  idForCoords(x, y) {
    for (const id of this._orderedIds) {
      const domNode = this._nodesById[id];
      if (domNode) {
        const bounds = domNode.getBoundingClientRect();
        if (bounds.left <= x && bounds.right > x && bounds.top <= y && bounds.bottom > y) {
          this._cachedBoundingBoxesById[id] = bounds;
          return id;
        }
      }
    }
  }

  /**
   * Return the necessary layout information, including the bounds and border
   * values, for the node with the given identifier.
   *
   * @param {string} id - the identifier of the node for which to return the
   *                      layout information
   * @returns {object} - the bounding client rect for the given node, along
   *                     with its borders
   */
  layoutPropsForId(id) {
    if (!this._cachedBoundingBoxesById[id]) {
      const node = this._nodesById[id];
      this._cachedBoundingBoxesById[id] = node ? node.getBoundingClientRect() : new DOMRect();
    }
    return {
      initialBounds: this._cachedBoundingBoxesById[id],
      borders: this._bordersById[id]
    };
  }
}

/**
 * A state machine for the popover state. In particular, this class manages the
 * mapping of parent nodes to their children, and translates touch events that
 * traverse various nodes to actions that are conditioned on whether a popover
 * is present.
 */

class PopoverStateMachine {
  constructor(handlers) {
    _defineProperty(this, "handlers", void 0);
    _defineProperty(this, "popovers", void 0);
    _defineProperty(this, "activePopover", void 0);
    this.handlers = handlers;
    this.activePopover = null;
    this.popovers = {};
  }

  /**
   * Register a popover container as containing a set of children.
   *
   * @param {string} id - the identifier of the popover container
   * @param {string[]} childIds - the identifiers of the nodes contained in
   *                              the popover container
   */
  registerPopover(id, childIds) {
    this.popovers[id] = childIds;
  }

  /**
   * Unregister a popover container.
   *
   * @param {string} id - the identifier of the popover container to
   *                      unregister
   */
  unregisterPopover(id) {
    delete this.popovers[id];
  }

  /**
   * @returns {boolean} - whether a popover is active and visible
   */
  isPopoverVisible() {
    return this.activePopover != null;
  }

  /**
   * Blur the active nodes.
   */
  onBlur() {
    this.activePopover = null;
    this.handlers.onActiveNodesChanged({
      popover: null,
      focus: null
    });
  }

  /**
   * Handle a focus event on the node with the given identifier.
   *
   * @param {string} id - the identifier of the node that was focused
   */
  onFocus(id) {
    if (this.activePopover) {
      // If we have a popover that is currently active, we focus this
      // node if it's in the popover, and remove any highlight otherwise.
      if (this._isNodeInsidePopover(this.activePopover, id)) {
        this.handlers.onActiveNodesChanged({
          popover: {
            parentId: this.activePopover,
            childIds: this.popovers[this.activePopover]
          },
          focus: id
        });
      } else {
        this.handlers.onActiveNodesChanged({
          popover: {
            parentId: this.activePopover,
            childIds: this.popovers[this.activePopover]
          },
          focus: null
        });
      }
    } else {
      this.activePopover = null;
      this.handlers.onActiveNodesChanged({
        popover: null,
        focus: id
      });
    }
  }

  /**
   * Handle a long press event on the node with the given identifier.
   *
   * @param {string} id - the identifier of the node that was long-pressed
   */
  onLongPress(id) {
    // We only care about long presses if they occur on a popover, and we
    // don't already have a popover active.
    if (!this.activePopover && this.popovers[id]) {
      // NOTE(charlie): There's an assumption here that focusing the
      // first child is the correct behavior for a newly focused popover.
      // This relies on the fact that the children are rendered
      // bottom-up. If that rendering changes, this logic will need to
      // change as well.
      this.activePopover = id;
      this.handlers.onActiveNodesChanged({
        popover: {
          parentId: id,
          childIds: this.popovers[id]
        },
        focus: this._defaultNodeForPopover(this.activePopover)
      });
    }
  }

  /**
   * Handle the trigger (click or hold) of the node with the given identifier.
   *
   * @param {string} id - the identifier of the node that was triggered
   */
  onTrigger(id) {
    this.handlers.onClick(id, id, false);
  }

  /**
   * Handle a touch-end event on the node with the given identifier.
   *
   * @param {string} id - the identifier of the node over which the touch
   *                      ended
   */
  onTouchEnd(id) {
    const inPopover = !!this.activePopover;
    if (inPopover) {
      // If we have a popover that is currently active, we trigger a
      // click on this node if and only if it's in the popover, with the
      // exception that, if the node passed back _is_ the active popover,
      // then we trigger its default node. This latter case should only
      // be triggered if the user were to tap down on a popover-enabled
      // node, hold for long enough for the popover to appear, and then
      // release without ever moving their finger, in which case, the
      // underlying gesture system would have no idea that the popover's
      // first child node was now focused.
      if (this._isNodeInsidePopover(this.activePopover, id)) {
        this.handlers.onClick(id, id, inPopover);
      } else if (this.activePopover === id) {
        const keyId = this._defaultNodeForPopover(id);
        this.handlers.onClick(keyId, keyId, inPopover);
      }
    } else if (this.popovers[id]) {
      // Otherwise, if the node is itself a popover revealer, trigger the
      // clicking of its default node, but pass back the popover node ID
      // for layout purposes.
      const keyId = this._defaultNodeForPopover(id);
      const domNodeId = id;
      this.handlers.onClick(keyId, domNodeId, inPopover);
    } else if (id != null) {
      // Finally, if we have no active popover, and we touched up over a
      // valid key, trigger a click.
      this.onTrigger(id);
    }
    this.onBlur();
  }
  _isNodeInsidePopover(popover, id) {
    return this.popovers[popover].includes(id);
  }
  _defaultNodeForPopover(popover) {
    return this.popovers[popover][0];
  }
}

const coordsForEvent = evt => {
  return [evt.changedTouches[0].clientX, evt.changedTouches[0].clientY];
};
class GestureManager {
  constructor(options, handlers, disabledSwipeKeys, multiPressableKeys) {
    _defineProperty(this, "swipeEnabled", void 0);
    _defineProperty(this, "trackEvents", void 0);
    _defineProperty(this, "nodeManager", void 0);
    _defineProperty(this, "popoverStateMachine", void 0);
    _defineProperty(this, "gestureStateMachine", void 0);
    const {
      swipeEnabled
    } = options;
    this.swipeEnabled = swipeEnabled;

    // Events aren't tracked until event tracking is enabled.
    this.trackEvents = false;
    this.nodeManager = new NodeManager();
    this.popoverStateMachine = new PopoverStateMachine({
      onActiveNodesChanged: activeNodes => {
        const {
          popover,
          ...rest
        } = activeNodes;
        handlers.onActiveNodesChanged({
          popover: popover && {
            parentId: popover.parentId,
            bounds: this.nodeManager.layoutPropsForId(popover.parentId).initialBounds,
            childKeyIds: popover.childIds
          },
          ...rest
        });
      },
      /**
       * `onClick` takes two arguments:
       *
       * @param {string} keyId - the identifier key that should initiate
       *                         a click
       * @param {string} domNodeId - the identifier of the DOM node on
       *                             which the click should be considered
       *                             to have occurred
       * @param {bool} inPopover - whether the key was contained within a
       *                           popover
       *
       * These two parameters will often be equivalent. They will differ,
       * though, when a popover button is itself clicked, in which case
       * we need to mimic the effects of clicking on its 'primary' child
       * key, but animate the click on the popover button.
       */
      onClick: (keyId, domNodeId, inPopover) => {
        handlers.onClick(keyId, this.nodeManager.layoutPropsForId(domNodeId), inPopover);
      }
    });
    this.gestureStateMachine = new GestureStateMachine({
      onFocus: id => {
        this.popoverStateMachine.onFocus(id);
      },
      onLongPress: id => {
        this.popoverStateMachine.onLongPress(id);
      },
      onTouchEnd: id => {
        this.popoverStateMachine.onTouchEnd(id);
      },
      onBlur: () => {
        this.popoverStateMachine.onBlur();
      },
      onSwipeChange: handlers.onSwipeChange,
      onSwipeEnd: handlers.onSwipeEnd,
      onTrigger: id => {
        this.popoverStateMachine.onTrigger(id);
      }
    }, {}, disabledSwipeKeys, multiPressableKeys);
  }

  /**
   * Handle a touch-start event that originated in a node registered with the
   * gesture system.
   *
   * @param {TouchEvent} evt - the raw touch event from the browser
   * @param {string} id - the identifier of the DOM node in which the touch
   *                      occurred
   */
  onTouchStart(evt, id) {
    if (!this.trackEvents) {
      return;
    }
    const [x] = coordsForEvent(evt);

    // TODO(charlie): It doesn't seem to be guaranteed that every touch
    // event on `changedTouches` originates from the node through which this
    // touch event was sent. In that case, we'd be inappropriately reporting
    // the starting node ID.
    for (let i = 0; i < evt.changedTouches.length; i++) {
      this.gestureStateMachine.onTouchStart(() => id, evt.changedTouches[i].identifier, x);
    }

    // If an event started in a view that we're managing, we'll handle it
    // all the way through.
    evt.preventDefault();
  }

  /**
   * Handle a touch-move event that originated in a node registered with the
   * gesture system.
   *
   * @param {TouchEvent} evt - the raw touch event from the browser
   */
  onTouchMove(evt) {
    if (!this.trackEvents) {
      return;
    }
    const swipeLocked = this.popoverStateMachine.isPopoverVisible();
    const swipeEnabled = this.swipeEnabled && !swipeLocked;
    const [x, y] = coordsForEvent(evt);
    for (let i = 0; i < evt.changedTouches.length; i++) {
      this.gestureStateMachine.onTouchMove(() => this.nodeManager.idForCoords(x, y), evt.changedTouches[i].identifier, x, swipeEnabled);
    }
  }

  /**
   * Handle a touch-end event that originated in a node registered with the
   * gesture system.
   *
   * @param {TouchEvent} evt - the raw touch event from the browser
   */
  onTouchEnd(evt) {
    if (!this.trackEvents) {
      return;
    }
    const [x, y] = coordsForEvent(evt);
    for (let i = 0; i < evt.changedTouches.length; i++) {
      this.gestureStateMachine.onTouchEnd(() => this.nodeManager.idForCoords(x, y), evt.changedTouches[i].identifier, x);
    }
  }

  /**
   * Handle a touch-cancel event that originated in a node registered with the
   * gesture system.
   *
   * @param {TouchEvent} evt - the raw touch event from the browser
   */
  onTouchCancel(evt) {
    if (!this.trackEvents) {
      return;
    }
    for (let i = 0; i < evt.changedTouches.length; i++) {
      this.gestureStateMachine.onTouchCancel(evt.changedTouches[i].identifier);
    }
  }

  /**
   * Register a DOM node with a given identifier.
   *
   * @param {string} id - the identifier of the given node
   * @param {node} domNode - the DOM node linked to the identifier
   * @param {string[]} childIds - the identifiers of any DOM nodes that
   *                              should be considered children of this node,
   *                              in that they should take priority when
   *                              intercepting touch events
   * @param {object} borders - an opaque object describing the node's borders
   */
  registerDOMNode(id, domNode, childIds, borders) {
    this.nodeManager.registerDOMNode(id, domNode, childIds, borders);
    this.popoverStateMachine.registerPopover(id, childIds);
  }

  /**
   * Unregister the DOM node with the given identifier.
   *
   * @param {string} id - the identifier of the node to unregister
   */
  unregisterDOMNode(id) {
    this.nodeManager.unregisterDOMNode(id);
    this.popoverStateMachine.unregisterPopover(id);
  }

  /**
   * Enable event tracking for the gesture manager.
   */
  enableEventTracking() {
    this.trackEvents = true;
  }

  /**
   * Disable event tracking for the gesture manager. When called, the gesture
   * manager will drop any events received by managed nodes.
   */
  disableEventTracking() {
    this.trackEvents = false;
  }
}

/**
 * This file contains configuration settings for the buttons in the keypad.
 */
// I tried to make the below {[key in Keys]: KeyConfig}
// but we are doing all kinds of sneaky magic that makes it hard to
// type this safely. Leaving it for now as a generic index signature.
const KeyConfigs = {
  // Basic math keys.
  [Keys.PLUS]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a plus sign.
    ariaLabel: i18n__namespace._("Plus")
  },
  [Keys.MINUS]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a minus sign.
    ariaLabel: i18n__namespace._("Minus")
  },
  [Keys.NEGATIVE]: {
    type: KeyType.VALUE,
    // I18N: A label for a minus sign.
    ariaLabel: i18n__namespace._("Negative")
  },
  [Keys.TIMES]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a multiplication sign (represented with an 'x').
    ariaLabel: i18n__namespace._("Multiply")
  },
  [Keys.DIVIDE]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a division sign.
    ariaLabel: i18n__namespace._("Divide")
  },
  [Keys.DECIMAL]: {
    type: KeyType.VALUE,
    // I18N: A label for a decimal symbol.
    ariaLabel: i18n__namespace._("Decimal"),
    icon: decimalSeparator === DecimalSeparator.COMMA ? {
      // TODO(charlie): Get an SVG icon for the comma, or verify with
      // design that the text-rendered version is acceptable.
      type: IconType.TEXT,
      data: ","
    } : {
      type: IconType.SVG,
      data: Keys.PERIOD
    }
  },
  [Keys.PERCENT]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a percent sign.
    ariaLabel: i18n__namespace._("Percent")
  },
  [Keys.CDOT]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a multiplication sign (represented as a dot).
    ariaLabel: i18n__namespace._("Multiply")
  },
  [Keys.EQUAL]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Equals sign")
  },
  [Keys.NEQ]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Not-equals sign")
  },
  [Keys.GT]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a 'greater than' sign (represented as '>').
    ariaLabel: i18n__namespace._("Greater than sign")
  },
  [Keys.LT]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a 'less than' sign (represented as '<').
    ariaLabel: i18n__namespace._("Less than sign")
  },
  [Keys.GEQ]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Greater than or equal to sign")
  },
  [Keys.LEQ]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Less than or equal to sign")
  },
  // mobile native
  [Keys.FRAC_INCLUSIVE]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that creates a new fraction and puts the
    // current expression in the numerator of that fraction.
    ariaLabel: i18n__namespace._("Fraction, with current expression in numerator")
  },
  // mobile native
  [Keys.FRAC_EXCLUSIVE]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that creates a new fraction next to the
    // cursor.
    ariaLabel: i18n__namespace._("Fraction, excluding the current expression")
  },
  // mobile web
  [Keys.FRAC]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that creates a new fraction next to the
    // cursor.
    ariaLabel: i18n__namespace._("Fraction, excluding the current expression")
  },
  [Keys.EXP]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that will allow the user to input a custom
    // exponent.
    ariaLabel: i18n__namespace._("Custom exponent")
  },
  [Keys.EXP_2]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that will square (take to the second
    // power) some math.
    ariaLabel: i18n__namespace._("Square")
  },
  [Keys.EXP_3]: {
    type: KeyType.OPERATOR,
    // I18N: A label for a button that will cube (take to the third power)
    // some math.
    ariaLabel: i18n__namespace._("Cube")
  },
  [Keys.SQRT]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Square root")
  },
  [Keys.CUBE_ROOT]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Cube root")
  },
  [Keys.RADICAL]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Radical with custom root")
  },
  [Keys.LEFT_PAREN]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Left parenthesis")
  },
  [Keys.RIGHT_PAREN]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Right parenthesis")
  },
  [Keys.LN]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Natural logarithm")
  },
  [Keys.LOG]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Logarithm with base 10")
  },
  [Keys.LOG_N]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Logarithm with custom base")
  },
  [Keys.SIN]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Sine")
  },
  [Keys.COS]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Cosine")
  },
  [Keys.TAN]: {
    type: KeyType.OPERATOR,
    ariaLabel: i18n__namespace._("Tangent")
  },
  [Keys.PI]: {
    type: KeyType.VALUE,
    ariaLabel: i18n__namespace._("Pi"),
    icon: {
      type: IconType.MATH,
      data: "\\pi"
    }
  },
  [Keys.THETA]: {
    type: KeyType.VALUE,
    ariaLabel: i18n__namespace._("Theta"),
    icon: {
      type: IconType.MATH,
      data: "\\theta"
    }
  },
  [Keys.NOOP]: {
    type: KeyType.EMPTY
  },
  // Input navigation keys.
  [Keys.UP]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Up arrow")
  },
  [Keys.RIGHT]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Right arrow")
  },
  [Keys.DOWN]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Down arrow")
  },
  [Keys.LEFT]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Left arrow")
  },
  [Keys.JUMP_OUT_PARENTHESES]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right out of a set of parentheses")
  },
  [Keys.JUMP_OUT_EXPONENT]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right out of an exponent")
  },
  [Keys.JUMP_OUT_BASE]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right out of a base")
  },
  [Keys.JUMP_INTO_NUMERATOR]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right into the numerator of a fraction")
  },
  [Keys.JUMP_OUT_NUMERATOR]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right out of the numerator and into the denominator")
  },
  [Keys.JUMP_OUT_DENOMINATOR]: {
    type: KeyType.INPUT_NAVIGATION,
    ariaLabel: i18n__namespace._("Navigate right out of the denominator of a fraction")
  },
  [Keys.BACKSPACE]: {
    type: KeyType.INPUT_NAVIGATION,
    // I18N: A label for a button that will delete some input.
    ariaLabel: i18n__namespace._("Delete")
  },
  // Keypad navigation keys.
  [Keys.DISMISS]: {
    type: KeyType.KEYPAD_NAVIGATION,
    // I18N: A label for a button that will dismiss/hide a keypad.
    ariaLabel: i18n__namespace._("Dismiss")
  },
  // TODO(charlie): Use the numeral color for the 'Many' key.
  // MANY: {
  //     type: KeyType.MANY,
  //     // childKeyIds will be configured by the client.
  // },

  [Keys.PERIOD]: {}
};

// Add in every numeral.
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
for (const num of NUMBERS) {
  // TODO(charlie): Consider removing the SVG icons that we have for the
  // numeral keys. They can be rendered just as easily with text (though that
  // would mean that we'd be using text beyond the variable key).
  const textRepresentation = "".concat(num);
  KeyConfigs["NUM_".concat(num)] = {
    type: KeyType.VALUE,
    ariaLabel: textRepresentation,
    icon: {
      type: IconType.TEXT,
      data: textRepresentation
    }
  };
}

// Add in every variable.
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
for (const letter of LETTERS) {
  const lowerCaseVariable = letter.toLowerCase();
  const upperCaseVariable = letter.toUpperCase();
  for (const textRepresentation of [lowerCaseVariable, upperCaseVariable]) {
    KeyConfigs[textRepresentation] = {
      type: KeyType.VALUE,
      ariaLabel: textRepresentation,
      icon: {
        type: IconType.MATH,
        data: textRepresentation
      }
    };
  }
}
for (const key of Object.keys(KeyConfigs)) {
  KeyConfigs[key] = {
    id: key,
    // Default to an SVG icon indexed by the key name.
    icon: {
      type: IconType.SVG,
      data: key
    },
    ...KeyConfigs[key]
  };
}

// Used to generate unique animation IDs for the echo animations. The actual
// values are irrelevant as long as they are unique.
let _lastAnimationId = 0;
const initialEchoState = {
  echoes: []
};
const echoReducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialEchoState;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case "PressKey":
      const keyConfig = KeyConfigs[action.key];

      // Add in the echo animation if the user performs a math
      // operation.
      if (keyConfig.type === KeyType.VALUE || keyConfig.type === KeyType.OPERATOR) {
        return {
          ...state,
          echoes: [...state.echoes, {
            animationId: "" + _lastAnimationId++,
            animationType: action.inPopover ? EchoAnimationType.LONG_FADE_ONLY : EchoAnimationType.FADE_ONLY,
            borders: action.borders,
            id: keyConfig.id,
            initialBounds: action.initialBounds
          }]
        };
      }
      return state;
    case "RemoveEcho":
      const remainingEchoes = state.echoes.filter(echo => {
        return echo.animationId !== action.animationId;
      });
      return {
        ...state,
        echoes: remainingEchoes
      };
    default:
      return state;
  }
};

const initialInputState = {
  keyHandler: null,
  cursor: {
    context: CursorContext.NONE
  }
};
const inputReducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialInputState;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case "SetKeyHandler":
      return {
        ...state,
        keyHandler: action.keyHandler
      };
    case "PressKey":
      const keyConfig = KeyConfigs[action.key];
      if (keyConfig.type !== KeyType.KEYPAD_NAVIGATION) {
        var _state$keyHandler;
        // This is probably an anti-pattern but it works for the
        // case where we don't actually control the state but we
        // still want to communicate with the other object
        return {
          ...state,
          cursor: (_state$keyHandler = state.keyHandler) === null || _state$keyHandler === void 0 ? void 0 : _state$keyHandler.call(state, keyConfig.id)
        };
      }

      // TODO(kevinb) get state from MathQuill and store it?
      return state;
    case "SetCursor":
      return {
        ...state,
        cursor: action.cursor
      };
    default:
      return state;
  }
};

/**
 * A small triangular decal to sit in the corner of a parent component.
 */
class CornerDecal extends React__namespace.Component {
  render() {
    const {
      style
    } = this.props;
    const containerStyle = [styles$d.container, ...(Array.isArray(style) ? style : [style])];
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: containerStyle
    }, /*#__PURE__*/React__namespace.createElement("svg", {
      width: triangleSizePx,
      height: triangleSizePx,
      viewBox: "4 4 8 8"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: offBlack,
      opacity: "0.3",
      d: "M5.29289322,5.70710678 L10.2928932,10.7071068 C10.9228581,11.3370716 12,10.8909049 12,10 L12,5 C12,4.44771525 11.5522847,4 11,4 L6,4 C5.10909515,4 4.66292836,5.07714192 5.29289322,5.70710678 Z" // @Nolint
    })));
  }
}

const triangleSizePx = 7;
const styles$d = aphrodite.StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    width: triangleSizePx,
    height: triangleSizePx
  }
});

/**
 * Common styles shared across components.
 */
var Styles = aphrodite.StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  column: {
    flexDirection: "column"
  },
  oneColumn: {
    flexGrow: 1
  },
  fullWidth: {
    width: "100%"
  },
  stretch: {
    alignItems: "stretch"
  },
  centered: {
    justifyContent: "center",
    alignItems: "center"
  },
  centeredText: {
    textAlign: "center"
  },
  roundedTopLeft: {
    borderTopLeftRadius: compactKeypadBorderRadiusPx
  },
  roundedTopRight: {
    borderTopRightRadius: compactKeypadBorderRadiusPx
  }
});

const {
  row: row$7,
  centered: centered$4
} = Styles;
class MathIcon extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "_renderMath", () => {
      const {
        math
      } = this.props;
      katex__default["default"].render(math, ReactDOM__default["default"].findDOMNode(this));
    });
  }
  componentDidMount() {
    this._renderMath();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.math !== this.props.math) {
      this._renderMath();
    }
  }
  render() {
    const {
      style
    } = this.props;
    const containerStyle = [row$7, centered$4, styles$c.size, styles$c.base, ...(Array.isArray(style) ? style : [style])];
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: containerStyle
    });
  }
}
const styles$c = aphrodite.StyleSheet.create({
  size: {
    height: iconSizeHeightPx,
    width: iconSizeWidthPx
  },
  base: {
    fontSize: 25
  }
});

class Cos extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M13 12h24v24H13z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M18.182 29.168c1.386 0 2.226-.602 2.674-1.232l-1.162-1.078a1.707 1.707 0 0 1-1.428.728c-1.078 0-1.834-.798-1.834-1.974s.756-1.96 1.834-1.96c.616 0 1.106.252 1.428.728l1.162-1.092c-.448-.616-1.288-1.218-2.674-1.218-2.086 0-3.584 1.47-3.584 3.542 0 2.086 1.498 3.556 3.584 3.556zm6.972 0c2.24 0 3.584-1.624 3.584-3.556 0-1.918-1.344-3.542-3.584-3.542-2.226 0-3.57 1.624-3.57 3.542 0 1.932 1.344 3.556 3.57 3.556zm0-1.582c-1.106 0-1.722-.91-1.722-1.974 0-1.05.616-1.96 1.722-1.96 1.106 0 1.736.91 1.736 1.96 0 1.064-.63 1.974-1.736 1.974zm7.336 1.582c1.876 0 2.926-.938 2.926-2.17 0-2.73-4.004-1.89-4.004-2.898 0-.378.42-.672 1.064-.672.826 0 1.596.35 2.002.784l.714-1.218c-.672-.532-1.582-.924-2.73-.924-1.778 0-2.772.994-2.772 2.128 0 2.66 4.018 1.75 4.018 2.87 0 .42-.364.728-1.134.728-.84 0-1.848-.462-2.338-.924l-.77 1.246c.714.658 1.848 1.05 3.024 1.05z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Cos, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Log extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16.776 29v-9.338h-1.778V29h1.778zm4.9.168c2.24 0 3.584-1.624 3.584-3.556 0-1.918-1.344-3.542-3.584-3.542-2.226 0-3.57 1.624-3.57 3.542 0 1.932 1.344 3.556 3.57 3.556zm0-1.582c-1.106 0-1.722-.91-1.722-1.974 0-1.05.616-1.96 1.722-1.96 1.106 0 1.736.91 1.736 1.96 0 1.064-.63 1.974-1.736 1.974zm7.672 4.158c1.666 0 3.654-.63 3.654-3.206v-6.3H31.21v.868c-.546-.686-1.274-1.036-2.086-1.036-1.708 0-2.982 1.232-2.982 3.444 0 2.254 1.288 3.444 2.982 3.444.826 0 1.554-.392 2.086-1.064v.686c0 1.33-1.008 1.708-1.862 1.708-.854 0-1.568-.238-2.114-.84l-.798 1.288c.854.742 1.75 1.008 2.912 1.008zm.336-4.368c-1.008 0-1.708-.7-1.708-1.862 0-1.162.7-1.862 1.708-1.862.588 0 1.232.322 1.526.77v2.184c-.294.434-.938.77-1.526.77z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Log, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Equal extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16 21h17M16 27h17",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Equal, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

/**
 * An autogenerated component that renders the BACKSPACE iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const Backspace = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M13 24l6 6h14V18H19l-6 6zm-1.414-1.414l6-6A2 2 0 0 1 19 16h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H19a2 2 0 0 1-1.414-.586l-6-6a2 2 0 0 1 0-2.828z",
    fill: "#888D93"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M23 21l6 6M29 21l-6 6",
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
};

class Sqrt extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M14 29l4 6 9-14h7"
    })));
  }
}
_defineProperty(Sqrt, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Exp extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M28 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM30 18h4v4h-4v-4zM14 21c0-.552.456-1 1.002-1h9.996A1 1 0 0 1 26 21v14c0 .552-.456 1-1.002 1h-9.996A1 1 0 0 1 14 35V21zm2 1h8v12h-8V22z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Exp, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Neq extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M19 33l10-18M16 21h17M16 27h17",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Neq, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Geq extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16 33h16M16 30l16-6-16-6",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Geq, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Ln extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M20.836 29v-9.338h-1.778V29h1.778zm8.106 0v-4.774c0-1.316-.714-2.156-2.198-2.156-1.106 0-1.932.532-2.366 1.05v-.882H22.6V29h1.778v-4.55c.294-.406.84-.798 1.54-.798.756 0 1.246.322 1.246 1.26V29h1.778z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Ln, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

/**
 * An autogenerated component that renders the DISMISS iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const Dismiss = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M18 21l6 6 6-6",
    strokeLinecap: "round",
    strokeWidth: "2",
    stroke: "#71B307",
    strokeLinejoin: "round"
  })));
};

class Sin extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M18.655 29.168c1.876 0 2.926-.938 2.926-2.17 0-2.73-4.004-1.89-4.004-2.898 0-.378.42-.672 1.064-.672.826 0 1.596.35 2.002.784l.714-1.218c-.672-.532-1.582-.924-2.73-.924-1.778 0-2.772.994-2.772 2.128 0 2.66 4.018 1.75 4.018 2.87 0 .42-.364.728-1.134.728-.84 0-1.848-.462-2.338-.924l-.77 1.246c.714.658 1.848 1.05 3.024 1.05zm5.124-7.658c.588 0 1.064-.476 1.064-1.064 0-.588-.476-1.05-1.064-1.05a1.06 1.06 0 0 0-1.064 1.05c0 .588.49 1.064 1.064 1.064zm.896 7.49v-6.762h-1.778V29h1.778zm8.106 0v-4.774c0-1.316-.714-2.156-2.198-2.156-1.106 0-1.932.532-2.366 1.05v-.882h-1.778V29h1.778v-4.55c.294-.406.84-.798 1.54-.798.756 0 1.246.322 1.246 1.26V29h1.778z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Sin, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Lt extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M32 30l-16-6 16-6"
    })));
  }
}
_defineProperty(Lt, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class CubeRoot extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M17.91 23.12c1.66 0 2.76-.81 2.76-1.98 0-.96-.86-1.51-1.57-1.58.79-.13 1.46-.72 1.46-1.5 0-1.1-.95-1.83-2.65-1.83-1.23 0-2.11.45-2.67 1.08l.83 1.08c.47-.42 1.05-.64 1.66-.64.64 0 1.12.19 1.12.61 0 .35-.39.52-1.08.52-.25 0-.77 0-.9-.01v1.53c.1-.01.61-.01.9-.01.91 0 1.19.18 1.19.56 0 .37-.38.65-1.12.65-.58 0-1.34-.23-1.82-.7l-.87 1.17c.52.6 1.48 1.05 2.76 1.05z",
      fill: this.props.color
    }), /*#__PURE__*/React__namespace.createElement("path", {
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M14 29l4 6 9-14h7"
    })));
  }
}
_defineProperty(CubeRoot, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Plus extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M19 24h10M24 29V19",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Plus, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Tan extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16.93 29.168c.742 0 1.218-.196 1.484-.434l-.378-1.344c-.098.098-.35.196-.616.196-.392 0-.616-.322-.616-.742v-3.052h1.372v-1.554h-1.372V20.39h-1.792v1.848h-1.12v1.554h1.12v3.528c0 1.204.672 1.848 1.918 1.848zM25.232 29v-4.368c0-1.946-1.414-2.562-2.954-2.562-1.064 0-2.128.336-2.954 1.064l.672 1.19c.574-.532 1.246-.798 1.974-.798.896 0 1.484.448 1.484 1.134v.91c-.448-.532-1.246-.826-2.142-.826-1.078 0-2.352.602-2.352 2.184 0 1.512 1.274 2.24 2.352 2.24.882 0 1.68-.322 2.142-.868v.7h1.778zm-3.206-1.036c-.7 0-1.274-.364-1.274-.994 0-.658.574-1.022 1.274-1.022.574 0 1.134.196 1.428.588v.84c-.294.392-.854.588-1.428.588zM33.338 29v-4.774c0-1.316-.714-2.156-2.198-2.156-1.106 0-1.932.532-2.366 1.05v-.882h-1.778V29h1.778v-4.55c.294-.406.84-.798 1.54-.798.756 0 1.246.322 1.246 1.26V29h1.778z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Tan, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

const Arrow = props => {
  return /*#__PURE__*/React__namespace.createElement("g", _extends({
    fill: "none",
    fillRule: "evenodd"
  }, props), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M22 18l-6 6 6 6M16 24h16"
  }));
};

/**
 * An component that renders the LEFT iconograpy in SVG.
 */
const Left = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement(Arrow, null));
};

/**
 * A component that renders the UP iconograpy in SVG.
 */
const Up = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement(Arrow, {
    transform: "rotate(90 24 24)"
  }));
};

/**
 * A component that renders the DOWN iconograpy in SVG.
 */
const Down = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement(Arrow, {
    transform: "rotate(270 24 24)"
  }));
};

class LeftParen extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M26 14c-4 6-4 14 0 20",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(LeftParen, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class RightParen extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M23 14c4 6 4 14 0 20",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(RightParen, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Gt extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M16 30l16-6-16-6"
    })));
  }
}
_defineProperty(Gt, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Divide extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M19 24h10",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      fill: this.props.color,
      cx: "24",
      cy: "19.5",
      r: "1.5"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      fill: this.props.color,
      cx: "24",
      cy: "28.5",
      r: "1.5"
    })));
  }
}
_defineProperty(Divide, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Period extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      fill: this.props.color,
      cx: "24",
      cy: "30",
      r: "2"
    })));
  }
}
_defineProperty(Period, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Percent extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("g", {
      transform: "translate(12 12)"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h24v24H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16 4L8 20",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      stroke: this.props.color,
      strokeWidth: "2",
      cx: "7",
      cy: "7",
      r: "3"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      stroke: this.props.color,
      strokeWidth: "2",
      cx: "17",
      cy: "17",
      r: "3"
    }))));
  }
}
_defineProperty(Percent, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Times extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M20 20l8 8M28 20l-8 8",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Times, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Exp3 extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M14 21c0-.552.456-1 1.002-1h9.996A1 1 0 0 1 26 21v14c0 .552-.456 1-1.002 1h-9.996A1 1 0 0 1 14 35V21zm2 1h8v12h-8V22zM30.92 23.12c1.66 0 2.76-.81 2.76-1.98 0-.96-.86-1.51-1.57-1.58.79-.13 1.46-.72 1.46-1.5 0-1.1-.95-1.83-2.65-1.83-1.23 0-2.11.45-2.67 1.08l.83 1.08c.47-.42 1.05-.64 1.66-.64.64 0 1.12.19 1.12.61 0 .35-.39.52-1.08.52-.25 0-.77 0-.9-.01v1.53c.1-.01.61-.01.9-.01.91 0 1.19.18 1.19.56 0 .37-.38.65-1.12.65-.58 0-1.34-.23-1.82-.7l-.87 1.17c.52.6 1.48 1.05 2.76 1.05z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Exp3, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Exp2 extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M14 21c0-.552.456-1 1.002-1h9.996A1 1 0 0 1 26 21v14c0 .552-.456 1-1.002 1h-9.996A1 1 0 0 1 14 35V21zm2 1h8v12h-8V22zM33.67 23v-1.5h-2.44c1.66-1.16 2.39-2.03 2.39-3.05 0-1.34-1.13-2.22-2.7-2.22-.93 0-1.99.33-2.7 1.11l.95 1.14c.48-.45 1.04-.73 1.78-.73.49 0 .92.24.92.7 0 .66-.54 1.12-3.43 3.21V23h5.23z",
      fill: this.props.color
    })));
  }
}
_defineProperty(Exp2, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

/**
 * A component that renders the RIGHT iconograpy in SVG.
 */
const Right = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement(Arrow, {
    transform: "rotate(180 24 24)"
  }));
};

class Cdot extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("g", {
      transform: "translate(12 12)"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h24v24H0z"
    }), /*#__PURE__*/React__namespace.createElement("circle", {
      fill: this.props.color,
      cx: "12",
      cy: "12",
      r: "3"
    }))));
  }
}
_defineProperty(Cdot, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class LogN extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M30 28.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM32 30h4v4h-4v-4zM12.776 29v-9.338h-1.778V29h1.778zm4.9.168c2.24 0 3.584-1.624 3.584-3.556 0-1.918-1.344-3.542-3.584-3.542-2.226 0-3.57 1.624-3.57 3.542 0 1.932 1.344 3.556 3.57 3.556zm0-1.582c-1.106 0-1.722-.91-1.722-1.974 0-1.05.616-1.96 1.722-1.96 1.106 0 1.736.91 1.736 1.96 0 1.064-.63 1.974-1.736 1.974zm7.672 4.158c1.666 0 3.654-.63 3.654-3.206v-6.3H27.21v.868c-.546-.686-1.274-1.036-2.086-1.036-1.708 0-2.982 1.232-2.982 3.444 0 2.254 1.288 3.444 2.982 3.444.826 0 1.554-.392 2.086-1.064v.686c0 1.33-1.008 1.708-1.862 1.708-.854 0-1.568-.238-2.114-.84l-.798 1.288c.854.742 1.75 1.008 2.912 1.008zm.336-4.368c-1.008 0-1.708-.7-1.708-1.862 0-1.162.7-1.862 1.708-1.862.588 0 1.232.322 1.526.77v2.184c-.294.434-.938.77-1.526.77z",
      fill: this.props.color
    })));
  }
}
_defineProperty(LogN, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Leq extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M12 12h24v24H12z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M16 33h16M32 30l-16-6 16-6",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Leq, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Minus extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M19 24h10",
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  }
}
_defineProperty(Minus, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class Radical extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M13 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM15 18h4v4h-4v-4z",
      fill: this.props.color
    }), /*#__PURE__*/React__namespace.createElement("path", {
      stroke: this.props.color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M14 29l4 6 9-14h7"
    })));
  }
}
_defineProperty(Radical, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

class FracInclusive extends React__namespace.Component {
  render() {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48"
    }, /*#__PURE__*/React__namespace.createElement("g", {
      fill: "none",
      fillRule: "evenodd"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h48v48H0z"
    }), /*#__PURE__*/React__namespace.createElement("g", {
      transform: "translate(12 12)"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fill: "none",
      d: "M0 0h24v24H0z"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M8 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997H8.997c-.55 0-.997-.453-.997-.997v-6.006zM10 18h4v4h-4v-4z",
      fill: this.props.color
    }), /*#__PURE__*/React__namespace.createElement("rect", {
      fill: this.props.color,
      x: "2",
      y: "11",
      width: "20",
      height: "2",
      rx: "1"
    }), /*#__PURE__*/React__namespace.createElement("path", {
      d: "M8 .997C8 .447 8.453 0 8.997 0h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997H8.997C8.447 8 8 7.547 8 7.003V.997zM10 2h4v4h-4V2z",
      fill: this.props.color
    }))));
  }
}
_defineProperty(FracInclusive, "propTypes", {
  color: PropTypes__default["default"].string.isRequired
});

/**
 * An autogenerated component that renders the JUMP_OUT_PARENTHESES iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpOutParentheses = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M24 18c3 3 3 9 0 12M18 18c-3 3-3 9 0 12",
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M32 27l3-3-3-3M22 24h12"
  })));
};

/**
 * An autogenerated component that renders the JUMP_OUT_EXPONENT iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpOutExponent = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M35 19v16M23 19l8 8M31 23v4h-4",
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M12 12.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM14 14h4v4h-4v-4z",
    fill: "#888D93"
  })));
};

/**
 * An autogenerated component that renders the JUMP_OUT_BASE iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpOutBase = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M12 28.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM14 30h4v4h-4v-4z",
    fill: "#888D93"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M35 13v16M23 29l8-8M27 21h4v4",
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
};

/**
 * An autogenerated component that renders the JUMP_INTO_NUMERATOR iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpIntoNumerator = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M13 16v16M17 22l6-6M23 20v-4h-4",
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M26 27.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM28 29h4v4h-4v-4z",
    fill: "#888D93"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M35 24H25",
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M26 13.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM28 15h4v4h-4v-4z",
    fill: "#78C008"
  })));
};

/**
 * An autogenerated component that renders the JUMP_OUT_NUMERATOR iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpOutNumerator = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    fill: "none",
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M33 29l-3 3-3-3M30 18v14"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M16 27.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM18 29h4v4h-4v-4z",
    fill: "#78C008"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M25 24H15",
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M16 13.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM18 15h4v4h-4v-4z",
    fill: "#888D93"
  })));
};

/**
 * An autogenerated component that renders the JUMP_OUT_DENOMINATOR iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const JumpOutDenominator = () => {
  return /*#__PURE__*/React__namespace.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React__namespace.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React__namespace.createElement("path", {
    d: "M0 0h48v48H0z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M12 12h24v24H12z"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M35 16v16m-4-4v-4h-4m-2 6l6-6",
    stroke: "#78C008",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M14 27.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM16 29h4v4h-4v-4z",
    fill: "#888D93"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M23 24H13",
    stroke: "#888D93",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React__namespace.createElement("path", {
    d: "M14 13.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM16 15h4v4h-4v-4z",
    fill: "#888D93"
  })));
};

/**
 * A directory of autogenerated icon components.
 */

var Iconography = /*#__PURE__*/Object.freeze({
    __proto__: null,
    COS: Cos,
    LOG: Log,
    EQUAL: Equal,
    BACKSPACE: Backspace,
    SQRT: Sqrt,
    EXP: Exp,
    NEQ: Neq,
    GEQ: Geq,
    LN: Ln,
    DISMISS: Dismiss,
    SIN: Sin,
    LT: Lt,
    CUBE_ROOT: CubeRoot,
    PLUS: Plus,
    TAN: Tan,
    LEFT: Left,
    UP: Up,
    DOWN: Down,
    LEFT_PAREN: LeftParen,
    RIGHT_PAREN: RightParen,
    GT: Gt,
    DIVIDE: Divide,
    PERIOD: Period,
    PERCENT: Percent,
    TIMES: Times,
    EXP_3: Exp3,
    EXP_2: Exp2,
    RIGHT: Right,
    CDOT: Cdot,
    LOG_N: LogN,
    LEQ: Leq,
    MINUS: Minus,
    NEGATIVE: Minus,
    RADICAL: Radical,
    FRAC: FracInclusive,
    JUMP_OUT_PARENTHESES: JumpOutParentheses,
    JUMP_OUT_EXPONENT: JumpOutExponent,
    JUMP_OUT_BASE: JumpOutBase,
    JUMP_INTO_NUMERATOR: JumpIntoNumerator,
    JUMP_OUT_NUMERATOR: JumpOutNumerator,
    JUMP_OUT_DENOMINATOR: JumpOutDenominator
});

/**
 * A component that renders a single SVG icon.
 */
class SvgIcon extends React__namespace.Component {
  render() {
    const {
      color,
      name
    } = this.props;

    // eslint-disable-next-line import/namespace
    const SvgForName = Iconography[name];
    return /*#__PURE__*/React__namespace.createElement(SvgForName, {
      color: color
    });
  }
}

/**
 * A component that renders a text-based icon.
 */
const {
  row: row$6,
  centered: centered$3
} = Styles;
class TextIcon extends React__namespace.Component {
  render() {
    const {
      character,
      style
    } = this.props;
    const containerStyle = [row$6, centered$3, styles$b.size, styles$b.base, ...(Array.isArray(style) ? style : [style])];
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: containerStyle
    }, /*#__PURE__*/React__namespace.createElement(Text, null, character));
  }
}
const styles$b = aphrodite.StyleSheet.create({
  size: {
    height: iconSizeHeightPx,
    width: iconSizeWidthPx
  },
  base: {
    fontFamily: "Proxima Nova",
    fontSize: 25
  }
});

/**
 * A component that renders an icon for a symbol with the given name.
 */
const focusedColor = "#FFF";
const unfocusedColor = offBlack;
class Icon extends React__namespace.PureComponent {
  render() {
    const {
      focused,
      icon,
      style
    } = this.props;
    const styleWithFocus = [focused ? styles$a.focused : styles$a.unfocused, ...(Array.isArray(style) ? style : [style])];
    switch (icon.type) {
      case IconType.MATH:
        return /*#__PURE__*/React__namespace.createElement(MathIcon, {
          math: icon.data,
          style: styleWithFocus
        });
      case IconType.SVG:
        // TODO(charlie): Support passing style objects to `SvgIcon`.
        // This will require migrating the individual icons to use
        // `currentColor` and accept a `className` prop, rather than
        // relying on an explicit color prop.
        return /*#__PURE__*/React__namespace.createElement(SvgIcon, {
          name: icon.data,
          color: focused ? focusedColor : unfocusedColor
        });
      case IconType.TEXT:
        return /*#__PURE__*/React__namespace.createElement(TextIcon, {
          character: icon.data,
          style: styleWithFocus
        });
      default:
        throw new Error("No icon or symbol provided");
    }
  }
}
const styles$a = aphrodite.StyleSheet.create({
  unfocused: {
    color: unfocusedColor
  },
  focused: {
    color: focusedColor
  }
});

/**
 * A grid of symbols, rendered as text and positioned based on the number of
 * symbols provided. Up to four symbols will be shown.
 */
const {
  row: row$5,
  column: column$3,
  centered: centered$2,
  fullWidth: fullWidth$3
} = Styles;
class MultiSymbolGrid extends React__namespace.Component {
  render() {
    const {
      focused,
      icons
    } = this.props;

    // Validate that we only received math-based icons. Right now, this
    // component only supports math icons (and it should only be passed
    // variables and Greek letters, which are always rendered as math).
    // Supporting other types of icons is possible but would require
    // some styles coercion and doesn't seem worthwhile right now.
    icons.forEach(icon => {
      if (icon.type !== IconType.MATH) {
        throw new Error("Received invalid icon: type=".concat(icon.type, ", ") + "data=".concat(icon.data));
      }
    });
    if (icons.length === 1) {
      return /*#__PURE__*/React__namespace.createElement(Icon, {
        icon: icons[0],
        focused: focused
      });
    } else {
      const primaryIconStyle = styles$9.base;
      const secondaryIconStyle = [styles$9.base, styles$9.secondary];
      if (icons.length === 2) {
        return /*#__PURE__*/React__namespace.createElement(View, {
          style: [row$5, styles$9.size]
        }, /*#__PURE__*/React__namespace.createElement(View, {
          style: [column$3, centered$2, fullWidth$3, styles$9.middleLeft]
        }, /*#__PURE__*/React__namespace.createElement(Icon, {
          style: primaryIconStyle,
          icon: icons[0],
          focused: focused
        })), /*#__PURE__*/React__namespace.createElement(View, {
          style: [column$3, centered$2, fullWidth$3, styles$9.middleRight]
        }, /*#__PURE__*/React__namespace.createElement(Icon, {
          style: secondaryIconStyle,
          icon: icons[1],
          focused: focused
        })));
      } else if (icons.length >= 3) {
        return /*#__PURE__*/React__namespace.createElement(View, {
          style: [column$3, styles$9.size]
        }, /*#__PURE__*/React__namespace.createElement(View, {
          style: row$5
        }, /*#__PURE__*/React__namespace.createElement(View, {
          style: [centered$2, fullWidth$3, styles$9.topLeft]
        }, /*#__PURE__*/React__namespace.createElement(Icon, {
          style: primaryIconStyle,
          icon: icons[0],
          focused: focused
        })), /*#__PURE__*/React__namespace.createElement(View, {
          style: [centered$2, fullWidth$3, styles$9.topRight]
        }, /*#__PURE__*/React__namespace.createElement(Icon, {
          style: secondaryIconStyle,
          icon: icons[1],
          focused: focused
        }))), /*#__PURE__*/React__namespace.createElement(View, {
          style: row$5
        }, /*#__PURE__*/React__namespace.createElement(View, {
          style: [centered$2, fullWidth$3, styles$9.bottomLeft]
        }, /*#__PURE__*/React__namespace.createElement(Icon, {
          style: secondaryIconStyle,
          icon: icons[2],
          focused: focused
        })), /*#__PURE__*/React__namespace.createElement(View, {
          style: [centered$2, fullWidth$3, styles$9.bottomRight]
        }, icons[3] && /*#__PURE__*/React__namespace.createElement(Icon, {
          style: secondaryIconStyle,
          icon: icons[3],
          focused: focused
        }))));
      }
    }
    throw new Error("Invalid number of icons: ".concat(icons.length));
  }
}
const verticalInsetPx = 2;
const horizontalInsetPx = 4;
const styles$9 = aphrodite.StyleSheet.create({
  size: {
    height: iconSizeHeightPx,
    width: iconSizeWidthPx
  },
  // For the three- and four-icon layouts.
  bottomLeft: {
    marginBottom: verticalInsetPx,
    marginLeft: horizontalInsetPx
  },
  topLeft: {
    marginTop: verticalInsetPx,
    marginLeft: horizontalInsetPx
  },
  topRight: {
    marginTop: verticalInsetPx,
    marginRight: horizontalInsetPx
  },
  bottomRight: {
    marginBottom: verticalInsetPx,
    marginRight: horizontalInsetPx
  },
  // For the two-icon layout.
  middleLeft: {
    marginLeft: horizontalInsetPx
  },
  middleRight: {
    marginRight: horizontalInsetPx
  },
  base: {
    fontSize: 18
  },
  secondary: {
    opacity: 0.3
  }
});

// eslint-disable-next-line react/no-unsafe
class KeypadButton extends React__namespace.PureComponent {
  constructor() {
    super(...arguments);
    _defineProperty(this, "buttonSizeStyle", void 0);
    _defineProperty(this, "_preInjectStyles", () => {
      // HACK(charlie): Pre-inject all of the possible styles for the button.
      // This avoids a flickering effect in the echo animation whereby the
      // echoes vary in size as they animate. Note that we need to account for
      // the "initial" styles that `View` will include, as these styles are
      // applied to `View` components and Aphrodite will consolidate the style
      // object. This method must be called whenever a property that
      // influences the possible outcomes of `this._getFocusStyle` and
      // `this._getButtonStyle` changes (such as `this.buttonSizeStyle`).
      for (const type of Object.values(KeyType)) {
        aphrodite.css(View.styles.initial, ...this._getFocusStyle(type));
        for (const borders of Object.values(BorderStyles)) {
          aphrodite.css(View.styles.initial, ...this._getButtonStyle(type, borders));
        }
      }
    });
    _defineProperty(this, "_getFocusStyle", type => {
      let focusBackgroundStyle;
      if (type === KeyType.INPUT_NAVIGATION || type === KeyType.KEYPAD_NAVIGATION) {
        focusBackgroundStyle = styles$8.light;
      } else {
        focusBackgroundStyle = styles$8.bright;
      }
      return [styles$8.focusBox, focusBackgroundStyle];
    });
    _defineProperty(this, "_getButtonStyle", (type, borders, style) => {
      // Select the appropriate style for the button.
      let backgroundStyle;
      switch (type) {
        case KeyType.EMPTY:
          backgroundStyle = styles$8.empty;
          break;
        case KeyType.MANY:
        case KeyType.VALUE:
          backgroundStyle = styles$8.value;
          break;
        case KeyType.OPERATOR:
          backgroundStyle = styles$8.operator;
          break;
        case KeyType.INPUT_NAVIGATION:
        case KeyType.KEYPAD_NAVIGATION:
          backgroundStyle = styles$8.control;
          break;
        case KeyType.ECHO:
          backgroundStyle = null;
          break;
      }
      const borderStyle = [];
      if (borders.includes(BorderDirection.LEFT)) {
        // @ts-expect-error TS2345
        borderStyle.push(styles$8.leftBorder);
      }
      if (borders.includes(BorderDirection.BOTTOM)) {
        // @ts-expect-error TS2345
        borderStyle.push(styles$8.bottomBorder);
      }
      return [styles$8.buttonBase, backgroundStyle, ...borderStyle, type === KeyType.ECHO && styles$8.echo, this.buttonSizeStyle,
      // React Native allows you to set the 'style' props on user defined
      // components.
      //   See: https://facebook.github.io/react-native/docs/style.html
      ...(Array.isArray(style) ? style : [style])];
    });
  }
  UNSAFE_componentWillMount() {
    this.buttonSizeStyle = styleForButtonDimensions(this.props.heightPx, this.props.widthPx);
  }
  componentDidMount() {
    this._preInjectStyles();
  }
  UNSAFE_componentWillUpdate(newProps, newState) {
    // Only recompute the Aphrodite StyleSheet when the button height has
    // changed. Though it is safe to recompute the StyleSheet (since
    // they're content-addressable), it saves us a bunch of hashing and
    // other work to cache it here.
    if (newProps.heightPx !== this.props.heightPx || newProps.widthPx !== this.props.widthPx) {
      this.buttonSizeStyle = styleForButtonDimensions(newProps.heightPx, newProps.widthPx);
      this._preInjectStyles();
    }
  }
  render() {
    const {
      ariaLabel,
      borders,
      childKeys,
      disabled,
      focused,
      icon,
      onTouchCancel,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      popoverEnabled,
      style,
      type
    } = this.props;

    // We render in the focus state if the key is focused, or if it's an
    // echo.
    const renderFocused = !disabled && focused || popoverEnabled || type === KeyType.ECHO;
    const buttonStyle = this._getButtonStyle(type, borders, style);
    const focusStyle = this._getFocusStyle(type);
    const iconWrapperStyle = [styles$8.iconWrapper, disabled ? styles$8.disabled : undefined];
    const eventHandlers = {
      onTouchCancel,
      onTouchEnd,
      onTouchMove,
      onTouchStart
    };
    const maybeFocusBox = renderFocused && /*#__PURE__*/React__namespace.createElement(View, {
      style: focusStyle
    });
    const maybeCornerDecal = !renderFocused && !disabled && childKeys && childKeys.length > 0 && /*#__PURE__*/React__namespace.createElement(CornerDecal, {
      style: styles$8.decalInset
    });
    if (type === KeyType.EMPTY) {
      return /*#__PURE__*/React__namespace.createElement(View, _extends({
        style: buttonStyle
      }, eventHandlers));
    } else if (type === KeyType.MANY) {
      // TODO(charlie): Make the long-press interaction accessible. See
      // the TODO in key-configs.js for more.
      const manyButtonA11yMarkup = {
        role: "button",
        ariaLabel: childKeys[0].ariaLabel
      };
      const icons = childKeys.map(keyConfig => {
        return keyConfig.icon;
      });
      return /*#__PURE__*/React__namespace.createElement(View, _extends({
        style: buttonStyle
      }, eventHandlers, manyButtonA11yMarkup), maybeFocusBox, /*#__PURE__*/React__namespace.createElement(View, {
        style: iconWrapperStyle
      }, /*#__PURE__*/React__namespace.createElement(MultiSymbolGrid, {
        icons: icons,
        focused: renderFocused
      })), maybeCornerDecal);
    } else {
      const a11yMarkup = {
        role: "button",
        ariaLabel: ariaLabel
      };
      return /*#__PURE__*/React__namespace.createElement(View, _extends({
        style: buttonStyle
      }, eventHandlers, a11yMarkup), maybeFocusBox, /*#__PURE__*/React__namespace.createElement(View, {
        style: iconWrapperStyle
      }, /*#__PURE__*/React__namespace.createElement(Icon, {
        icon: icon,
        focused: renderFocused
      })), maybeCornerDecal);
    }
  }
}
_defineProperty(KeypadButton, "defaultProps", {
  borders: BorderStyles.ALL,
  childKeys: [],
  disabled: false,
  focused: false,
  popoverEnabled: false
});
const focusInsetPx = 4;
const focusBoxZIndex = 0;
const styles$8 = aphrodite.StyleSheet.create({
  buttonBase: {
    flex: 1,
    cursor: "pointer",
    // Make the text unselectable
    userSelect: "none",
    justifyContent: "center",
    alignItems: "center",
    // Borders are made selectively visible.
    borderColor: innerBorderColor,
    borderStyle: innerBorderStyle,
    boxSizing: "border-box"
  },
  decalInset: {
    top: focusInsetPx,
    right: focusInsetPx
  },
  // Overrides for the echo state, where we want to render the borders for
  // layout purposes, but we don't want them to be visible.
  echo: {
    borderColor: "transparent"
  },
  // Background colors and other base styles that may vary between key types.
  value: {
    backgroundColor: valueGrey
  },
  operator: {
    backgroundColor: operatorGrey
  },
  control: {
    backgroundColor: controlGrey
  },
  empty: {
    backgroundColor: emptyGrey,
    cursor: "default"
  },
  bright: {
    backgroundColor: wonderBlocksBlue
  },
  light: {
    backgroundColor: "rgba(33, 36, 44, 0.1)"
  },
  iconWrapper: {
    zIndex: focusBoxZIndex + 1
  },
  focusBox: {
    position: "absolute",
    zIndex: focusBoxZIndex,
    left: focusInsetPx,
    right: focusInsetPx,
    bottom: focusInsetPx,
    top: focusInsetPx,
    borderRadius: 1
  },
  disabled: {
    opacity: 0.3
  },
  // Styles used to render the appropriate borders. Buttons are only allowed
  // to render left and bottom borders, to simplify layout.
  leftBorder: {
    borderLeftWidth: innerBorderWidthPx
  },
  bottomBorder: {
    borderBottomWidth: innerBorderWidthPx
  }
});
const styleForButtonDimensions = (heightPx, widthPx) => {
  return aphrodite.StyleSheet.create({
    // eslint-disable-next-line react-native/no-unused-styles
    buttonSize: {
      height: heightPx,
      width: widthPx,
      maxWidth: widthPx
    }
  }).buttonSize;
};
const mapStateToProps$7 = state => {
  return {
    heightPx: state.layout.buttonDimensions.heightPx,
    widthPx: state.layout.buttonDimensions.widthPx
  };
};
var KeypadButton$1 = reactRedux.connect(mapStateToProps$7, null, null, {
  forwardRef: true
})(KeypadButton);

class EmptyKeypadButton extends React__namespace.Component {
  render() {
    const {
      gestureManager,
      ...rest
    } = this.props;

    // Register touch events on the button, but don't register its DOM node
    // or compute focus state or anything like that. We want the gesture
    // manager to know about touch events that start on empty buttons, but
    // we don't need it to know about their DOM nodes, as it doesn't need
    // to focus them or trigger presses.
    return /*#__PURE__*/React__namespace.createElement(KeypadButton$1, _extends({
      onTouchStart: evt => gestureManager.onTouchStart(evt),
      onTouchEnd: evt => gestureManager.onTouchEnd(evt),
      onTouchMove: evt => gestureManager.onTouchMove(evt),
      onTouchCancel: evt => gestureManager.onTouchCancel(evt)
    }, KeyConfigs.NOOP, rest));
  }
}
const mapStateToProps$6 = state => {
  const {
    gestures
  } = state;
  return {
    gestureManager: gestures.gestureManager
  };
};
var EmptyKeypadButton$1 = reactRedux.connect(mapStateToProps$6, null, null, {
  forwardRef: true
})(EmptyKeypadButton);

class TouchableKeypadButton extends React__namespace.Component {
  shouldComponentUpdate(newProps) {
    // We take advantage of a few different properties of our key
    // configuration system. Namely, we know that the other props flow
    // directly from the ID, and thus don't need to be checked. If a key has
    // a custom style, we bail out (this should be rare).
    return newProps.id !== this.props.id || newProps.gestureManager !== this.props.gestureManager || newProps.focused !== this.props.focused || newProps.disabled !== this.props.disabled || newProps.popoverEnabled !== this.props.popoverEnabled || newProps.type !== this.props.type || !!newProps.style;
  }
  componentWillUnmount() {
    const {
      gestureManager,
      id
    } = this.props;
    gestureManager.unregisterDOMNode(id);
  }
  render() {
    const {
      borders,
      childKeyIds,
      disabled,
      gestureManager,
      id,
      style,
      ...rest
    } = this.props;

    // Only bind the relevant event handlers if the key is enabled.
    const eventHandlers = disabled ? {
      onTouchStart: evt => evt.preventDefault()
    } : {
      onTouchStart: evt => gestureManager.onTouchStart(evt, id),
      onTouchEnd: evt => gestureManager.onTouchEnd(evt),
      onTouchMove: evt => gestureManager.onTouchMove(evt),
      onTouchCancel: evt => gestureManager.onTouchCancel(evt)
    };
    const styleWithAddons = [...(Array.isArray(style) ? style : [style]), styles$7.preventScrolls];
    return /*#__PURE__*/React__namespace.createElement(KeypadButton$1, _extends({
      ref: node => gestureManager.registerDOMNode(id, ReactDOM__default["default"].findDOMNode(node), childKeyIds, borders),
      borders: borders,
      disabled: disabled,
      style: styleWithAddons
    }, eventHandlers, rest));
  }
}
const extractProps = keyConfig => {
  const {
    ariaLabel,
    icon,
    type
  } = keyConfig;
  return {
    ariaLabel,
    icon,
    type
  };
};
const mapStateToProps$5 = (state, ownProps) => {
  var _gestures$popover;
  const {
    gestures
  } = state;
  const {
    keyConfig,
    ...rest
  } = ownProps;
  const {
    id,
    type
  } = keyConfig;
  const childKeyIds = "childKeyIds" in keyConfig ? keyConfig.childKeyIds : undefined;
  const childKeys = childKeyIds ? childKeyIds.map(id => KeyConfigs[id]) : undefined;

  // Override with the default child props, if the key is a multi-symbol key
  // (but not a many-symbol key, which operates under different rules).
  const useFirstChildProps = type !== KeyType.MANY && childKeys && childKeys.length > 0;
  return {
    ...rest,
    childKeyIds: childKeyIds,
    gestureManager: gestures.gestureManager,
    id: id,
    // Add in some gesture state.
    focused: gestures.focus === id,
    popoverEnabled: ((_gestures$popover = gestures.popover) === null || _gestures$popover === void 0 ? void 0 : _gestures$popover.parentId) === id,
    // Pass down the child keys and any extracted props.
    childKeys,
    ...extractProps(useFirstChildProps ? childKeys[0] : keyConfig)
  };
};
const styles$7 = aphrodite.StyleSheet.create({
  preventScrolls: {
    // Touch events that start in the touchable buttons shouldn't be
    // allowed to produce page scrolls.
    touchAction: "none"
  }
});
var TouchableKeypadButton$1 = reactRedux.connect(mapStateToProps$5, null, null, {
  forwardRef: true
})(TouchableKeypadButton);

class ManyKeypadButton extends React__namespace.Component {
  render() {
    const {
      keys,
      ...rest
    } = this.props;

    // If we have no extra symbols, render an empty button. If we have just
    // one, render a standard button. Otherwise, capture them all in a
    // single button.
    if (keys.length === 0) {
      return /*#__PURE__*/React__namespace.createElement(EmptyKeypadButton$1, null);
    } else if (keys.length === 1) {
      const keyConfig = KeyConfigs[keys[0]];
      return /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, _extends({
        keyConfig: keyConfig
      }, rest));
    } else {
      const keyConfig = {
        id: "MANY",
        type: KeyType.MANY,
        childKeyIds: keys
      };
      return /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, _extends({
        keyConfig: keyConfig
      }, rest));
    }
  }
}
_defineProperty(ManyKeypadButton, "defaultProps", {
  keys: []
});

/**
 * This file contains all of the z-index values used throughout the math-input
 * component and its children.
 */

const popover = 1;
const echo = 2;
const keypad = 1060;

class Echo extends React__namespace.Component {
  componentDidMount() {
    // NOTE(charlie): This is somewhat unfortunate, as the component is
    // encoding information about its own animation, of which it should be
    // ignorant. However, there doesn't seem to be a cleaner way to make
    // this happen, and at least here, all the animation context is
    // colocated in this file.
    const {
      animationDurationMs,
      onAnimationFinish
    } = this.props;
    setTimeout(() => onAnimationFinish(), animationDurationMs);
  }
  render() {
    const {
      borders,
      id,
      initialBounds
    } = this.props;
    const {
      icon
    } = KeyConfigs[id];
    const containerStyle = {
      zIndex: echo,
      position: "absolute",
      pointerEvents: "none",
      ...initialBounds
    };

    // NOTE(charlie): In some browsers, Aphrodite doesn't seem to flush its
    // styles quickly enough, so there's a flickering effect on the first
    // animation. Thus, it's much safer to do the styles purely inline.
    // <View> makes this difficult because some of its defaults, which are
    // applied via StyleSheet, will override our inlines.
    return /*#__PURE__*/React__namespace.createElement("div", {
      style: containerStyle
    }, /*#__PURE__*/React__namespace.createElement(KeypadButton$1, {
      icon: icon,
      type: KeyType.ECHO,
      borders: borders
    }));
  }
}
class EchoManager extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "_animationConfigForType", animationType => {
      // NOTE(charlie): These must be kept in sync with the transition
      // durations and classnames specified in echo.css.
      let animationDurationMs;
      let animationTransitionName;
      switch (animationType) {
        case EchoAnimationType.SLIDE_AND_FADE:
          animationDurationMs = 400;
          animationTransitionName = "echo-slide-and-fade";
          break;
        case EchoAnimationType.FADE_ONLY:
          animationDurationMs = 300;
          animationTransitionName = "echo-fade-only";
          break;
        case EchoAnimationType.LONG_FADE_ONLY:
          animationDurationMs = 400;
          animationTransitionName = "echo-long-fade-only";
          break;
        default:
          throw new Error("Invalid echo animation type: ".concat(animationType));
      }
      return {
        animationDurationMs,
        animationTransitionName
      };
    });
  }
  render() {
    const {
      echoes,
      onAnimationFinish
    } = this.props;
    return /*#__PURE__*/React__namespace.createElement("span", null, Object.keys(EchoAnimationType).map(animationType => {
      // Collect the relevant parameters for the animation type, and
      // filter for the appropriate echoes.
      const {
        animationDurationMs,
        animationTransitionName
      } = this._animationConfigForType(animationType);
      const echoesForType = echoes.filter(echo => {
        return echo.animationType === animationType;
      });

      // TODO(charlie): Manage this animation with Aphrodite styles.
      // Right now, there's a bug in the autoprefixer that breaks CSS
      // transitions on mobile Safari.
      // See: https://github.com/Khan/aphrodite/issues/68.
      // As such, we have to do this with a stylesheet.
      return /*#__PURE__*/React__namespace.createElement(reactTransitionGroup.TransitionGroup, {
        key: animationType
      }, echoesForType.map(echo => {
        const {
          animationId
        } = echo;
        return /*#__PURE__*/React__namespace.createElement(reactTransitionGroup.CSSTransition, {
          classNames: animationTransitionName,
          enter: true,
          exit: false,
          timeout: {
            enter: animationDurationMs
          },
          key: animationId
        }, /*#__PURE__*/React__namespace.createElement(Echo, _extends({
          animationDurationMs: animationDurationMs,
          onAnimationFinish: () => onAnimationFinish === null || onAnimationFinish === void 0 ? void 0 : onAnimationFinish(animationId)
        }, echo)));
      }));
    }));
  }
}

/**
 * A popover that renders a set of keys floating above the page.
 */
class MultiSymbolPopover extends React__namespace.Component {
  render() {
    const {
      keys
    } = this.props;

    // TODO(charlie): We have to require this lazily because of a cyclic
    // dependence in our components.
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: styles$6.container
    }, keys.map(key => {
      return /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
        keyConfig: key,
        borders: BorderStyles.NONE
      });
    }));
  }
}
const styles$6 = aphrodite.StyleSheet.create({
  container: {
    flexDirection: "column-reverse",
    position: "relative",
    width: "100%",
    borderRadius: 2,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    zIndex: popover
  },
  // eslint-disable-next-line react-native/no-unused-styles
  popoverButton: {
    backgroundColor: "#FFF",
    borderWidth: 0
  }
});

/**
 * A component that renders and animates the popovers that appear over the
 * multi-functional keys.
 */
// NOTE(charlie): These must be kept in sync with the transition durations and
// classnames specified in popover.less.
const animationTransitionName = "popover";
const animationDurationMs = 200;
// A container component used to position a popover absolutely at a specific
// position.
class PopoverContainer extends React__namespace.Component {
  render() {
    const {
      bounds,
      childKeys
    } = this.props;
    const containerStyle = {
      position: "absolute",
      ...bounds
    };
    return /*#__PURE__*/React__namespace.createElement("div", {
      style: containerStyle
    }, /*#__PURE__*/React__namespace.createElement(MultiSymbolPopover, {
      keys: childKeys
    }));
  }
}
class PopoverManager extends React__namespace.Component {
  render() {
    const {
      popover
    } = this.props;
    return popover ? /*#__PURE__*/React__namespace.createElement(reactTransitionGroup.CSSTransition, {
      in: true,
      classNames: animationTransitionName,
      enter: true,
      exit: false,
      timeout: {
        enter: animationDurationMs
      }
    }, /*#__PURE__*/React__namespace.createElement(PopoverContainer, {
      key: popover.childKeyIds[0],
      bounds: popover.bounds,
      childKeys: popover.childKeyIds.map(id => KeyConfigs[id])
    })) : null;
  }
}

// eslint-disable-next-line react/no-unsafe
class Keypad extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "_isMounted", void 0);
    _defineProperty(this, "_resizeTimeout", void 0);
    _defineProperty(this, "_container", void 0);
    _defineProperty(this, "_computeContainer", () => {
      const domNode = ReactDOM__default["default"].findDOMNode(this);
      this._container = domNode.getBoundingClientRect();
    });
    _defineProperty(this, "_updateSizeAndPosition", () => {
      // Mark the container for recalculation next time the keypad is
      // opened.
      // TODO(charlie): Since we're not recalculating the container
      // immediately, if you were to resize the page while a popover were
      // active, you'd likely get unexpected behavior. This seems very
      // difficult to do and, as such, incredibly unlikely, but we may
      // want to reconsider the caching here.
      this._container = null;
    });
    _defineProperty(this, "_onResize", () => {
      // Whenever the page resizes, we need to recompute the container's
      // bounding box. This is the only time that the bounding box can change.

      // Throttle resize events -- taken from:
      //    https://developer.mozilla.org/en-US/docs/Web/Events/resize
      if (this._resizeTimeout == null) {
        this._resizeTimeout = window.setTimeout(() => {
          this._resizeTimeout = null;
          if (this._isMounted) {
            this._updateSizeAndPosition();
          }
        }, 66);
      }
    });
  }
  componentDidMount() {
    this._isMounted = true;
    window.addEventListener("resize", this._onResize);
    this._updateSizeAndPosition();
  }
  UNSAFE_componentWillReceiveProps(newProps) {
    if (!this._container && (newProps.popover || newProps.echoes.length)) {
      this._computeContainer();
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener("resize", this._onResize);
  }
  render() {
    const {
      children,
      echoes,
      removeEcho,
      popover,
      style
    } = this.props;

    // Translate the echo boxes, as they'll be positioned absolutely to
    // this relative container.
    const relativeEchoes = echoes.map(echo => {
      const {
        initialBounds,
        ...rest
      } = echo;
      return {
        ...rest,
        initialBounds: {
          // @ts-expect-error TS2533
          top: initialBounds.top - this._container.top,
          // @ts-expect-error TS2533
          right: initialBounds.right - this._container.left,
          // @ts-expect-error TS2533
          bottom: initialBounds.bottom - this._container.top,
          // @ts-expect-error TS2533
          left: initialBounds.left - this._container.left,
          width: initialBounds.width,
          height: initialBounds.height
        }
      };
    });

    // Translate the popover bounds from page-absolute to keypad-relative.
    // Note that we only need three bounds, since popovers are anchored to
    // the bottom left corners of the keys over which they appear.
    const relativePopover = popover && {
      ...popover,
      bounds: {
        bottom:
        // @ts-expect-error TS2533
        this._container.height - (
        // @ts-expect-error TS2533
        popover.bounds.bottom - this._container.top),
        // @ts-expect-error TS2533
        left: popover.bounds.left - this._container.left,
        width: popover.bounds.width
      }
    };
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: style
    }, children, /*#__PURE__*/React__namespace.createElement(EchoManager, {
      echoes: relativeEchoes,
      onAnimationFinish: removeEcho
    }), /*#__PURE__*/React__namespace.createElement(PopoverManager, {
      popover: relativePopover
    }));
  }
}
const mapStateToProps$4 = state => {
  return {
    echoes: state.echoes.echoes,
    active: state.keypad.active,
    popover: state.gestures.popover
  };
};
const mapDispatchToProps$1 = dispatch => {
  return {
    removeEcho: animationId => {
      dispatch(removeEcho(animationId));
    }
  };
};
var Keypad$1 = reactRedux.connect(mapStateToProps$4, mapDispatchToProps$1, null, {
  forwardRef: true
})(Keypad);

const IconAsset = function (_ref) {
  let {
    tintColor,
    type
  } = _ref;
  if (type === "Geometry") {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "32",
      height: "32",
      viewBox: "0 0 32 32",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M7.57584 7.09442C7.92723 6.92984 8.3421 6.98339 8.64018 7.23179L26.6402 22.2318C26.9636 22.5013 27.0836 22.9446 26.9403 23.3404C26.7969 23.7363 26.421 24 26 24H8C7.44772 24 7 23.5523 7 23V8.00001C7 7.61199 7.22446 7.259 7.57584 7.09442ZM9 10.1351V17H13C13.5523 17 14 17.4477 14 18V22H23.238L9 10.1351ZM12 22V19H9V22H12Z",
      fill: tintColor
    }));
  } else if (type === "Operators") {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "32",
      height: "32",
      viewBox: "0 0 32 32",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M29 6H30V7H29V6ZM27 6C27 4.89543 27.8954 4 29 4H30C31.1046 4 32 4.89543 32 6V7C32 8.10457 31.1046 9 30 9H29C27.8954 9 27 8.10457 27 7V6ZM11.1318 6.50386C11.3098 6.19229 11.6411 6 12 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H12.5803L8.86824 14.4961C8.68527 14.8163 8.34091 15.0098 7.97225 14.9996C7.6036 14.9894 7.2705 14.7771 7.10557 14.4472L5.10557 10.4472C4.85858 9.95324 5.05881 9.35256 5.55279 9.10557C6.04676 8.85858 6.64744 9.05881 6.89443 9.55279L8.0588 11.8815L11.1318 6.50386ZM7.70676 16.2925C8.09748 16.6829 8.09779 17.316 7.70745 17.7068C7.28543 18.1292 6.84383 18.7303 6.51157 19.3658C6.17039 20.0184 6 20.601 6 21C6 21.3789 6.17235 21.9897 6.51638 22.6649C6.85315 23.3259 7.28488 23.9121 7.66786 24.2557C8.07892 24.6246 8.11314 25.2568 7.74429 25.6679C7.37544 26.0789 6.7432 26.1131 6.33214 25.7443C5.7161 25.1915 5.14783 24.3844 4.73434 23.5728C4.32813 22.7755 3.99999 21.8345 4 21C4.00001 20.1391 4.3301 19.2217 4.73917 18.4392C5.15715 17.6397 5.71554 16.8708 6.29255 16.2932C6.68288 15.9025 7.31605 15.9022 7.70676 16.2925ZM11.2932 16.2925C11.684 15.9022 12.3171 15.9025 12.7075 16.2932C13.2845 16.8708 13.8428 17.6397 14.2608 18.4392C14.6699 19.2217 15 20.1391 15 21C15 21.8345 14.6719 22.7755 14.2657 23.5728C13.8522 24.3844 13.2839 25.1915 12.6679 25.7443C12.2568 26.1131 11.6246 26.0789 11.2557 25.6679C10.8869 25.2568 10.9211 24.6246 11.3321 24.2557C11.7151 23.9121 12.1469 23.3259 12.4836 22.6649C12.8276 21.9897 13 21.3789 13 21C13 20.601 12.8296 20.0184 12.4884 19.3658C12.1562 18.7303 11.7146 18.1292 11.2925 17.7068C10.9022 17.316 10.9025 16.6829 11.2932 16.2925ZM27.9363 17.6489C28.1302 18.166 27.8682 18.7424 27.3511 18.9363L21.848 21L27.3511 23.0637C27.8682 23.2576 28.1302 23.834 27.9363 24.3511C27.7424 24.8682 27.166 25.1302 26.6489 24.9363L18.6489 21.9363C18.2586 21.79 18 21.4168 18 21C18 20.5832 18.2586 20.21 18.6489 20.0637L26.6489 17.0637C27.166 16.8698 27.7424 17.1318 27.9363 17.6489ZM21 8V13H24V8H21ZM20 6C19.4477 6 19 6.44772 19 7V14C19 14.5523 19.4477 15 20 15H25C25.5523 15 26 14.5523 26 14V7C26 6.44772 25.5523 6 25 6H20Z",
      fill: tintColor
    }));
  } else if (type === "Numbers") {
    return /*#__PURE__*/React__namespace.createElement("svg", {
      width: "32",
      height: "32",
      viewBox: "0 0 32 32",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/React__namespace.createElement("path", {
      d: "M10.4123 19.5794V21.0004H4.71434V19.5794H6.73034V14.0214C6.73034 13.9001 6.73267 13.7764 6.73734 13.6504C6.742 13.5244 6.749 13.3961 6.75834 13.2654L5.42834 14.3714C5.335 14.4414 5.244 14.4858 5.15534 14.5044C5.06667 14.5231 4.98267 14.5254 4.90334 14.5114C4.824 14.4928 4.754 14.4648 4.69334 14.4274C4.63267 14.3854 4.586 14.3434 4.55334 14.3014L3.94434 13.4824L7.06634 10.8364H8.65534V19.5794H10.4123ZM18.7924 19.2294C19.0024 19.2294 19.1658 19.2878 19.2824 19.4044C19.4038 19.5211 19.4644 19.6751 19.4644 19.8664V21.0004H12.4224V20.3704C12.4224 20.2491 12.4481 20.1184 12.4994 19.9784C12.5508 19.8338 12.6371 19.7031 12.7584 19.5864L15.7684 16.5694C16.0251 16.3128 16.2514 16.0678 16.4474 15.8344C16.6434 15.5964 16.8068 15.3654 16.9374 15.1414C17.0681 14.9128 17.1661 14.6818 17.2314 14.4484C17.2968 14.2151 17.3294 13.9701 17.3294 13.7134C17.3294 13.2608 17.2128 12.9178 16.9794 12.6844C16.7461 12.4464 16.4171 12.3274 15.9924 12.3274C15.8058 12.3274 15.6331 12.3554 15.4744 12.4114C15.3204 12.4628 15.1804 12.5351 15.0544 12.6284C14.9331 12.7218 14.8281 12.8314 14.7394 12.9574C14.6508 13.0834 14.5854 13.2211 14.5434 13.3704C14.4594 13.6038 14.3451 13.7601 14.2004 13.8394C14.0604 13.9141 13.8598 13.9304 13.5984 13.8884L12.5764 13.7064C12.6511 13.2118 12.7911 12.7778 12.9964 12.4044C13.2018 12.0311 13.4584 11.7208 13.7664 11.4734C14.0744 11.2261 14.4268 11.0418 14.8234 10.9204C15.2201 10.7944 15.6471 10.7314 16.1044 10.7314C16.5851 10.7314 17.0214 10.8038 17.4134 10.9484C17.8101 11.0884 18.1484 11.2868 18.4284 11.5434C18.7084 11.7954 18.9254 12.1011 19.0794 12.4604C19.2334 12.8198 19.3104 13.2164 19.3104 13.6504C19.3104 14.0238 19.2568 14.3691 19.1494 14.6864C19.0421 15.0038 18.8951 15.3071 18.7084 15.5964C18.5264 15.8811 18.3141 16.1588 18.0714 16.4294C17.8288 16.7001 17.5721 16.9731 17.3014 17.2484L15.1454 19.4534C15.3834 19.3834 15.6191 19.3298 15.8524 19.2924C16.0858 19.2504 16.3051 19.2294 16.5104 19.2294H18.7924ZM21.4535 13.7064C21.5282 13.2118 21.6682 12.7778 21.8735 12.4044C22.0789 12.0311 22.3355 11.7208 22.6435 11.4734C22.9515 11.2261 23.3015 11.0418 23.6935 10.9204C24.0902 10.7944 24.5172 10.7314 24.9745 10.7314C25.4599 10.7314 25.8939 10.8014 26.2765 10.9414C26.6639 11.0768 26.9905 11.2634 27.2565 11.5014C27.5225 11.7394 27.7255 12.0171 27.8655 12.3344C28.0102 12.6518 28.0825 12.9924 28.0825 13.3564C28.0825 13.6784 28.0475 13.9631 27.9775 14.2104C27.9122 14.4531 27.8119 14.6654 27.6765 14.8474C27.5459 15.0294 27.3825 15.1834 27.1865 15.3094C26.9952 15.4354 26.7735 15.5404 26.5215 15.6244C27.6882 16.0071 28.2715 16.7841 28.2715 17.9554C28.2715 18.4734 28.1759 18.9308 27.9845 19.3274C27.7932 19.7194 27.5365 20.0484 27.2145 20.3144C26.8925 20.5804 26.5169 20.7811 26.0875 20.9164C25.6629 21.0471 25.2172 21.1124 24.7505 21.1124C24.2559 21.1124 23.8195 21.0564 23.4415 20.9444C23.0635 20.8324 22.7299 20.6644 22.4405 20.4404C22.1559 20.2164 21.9109 19.9364 21.7055 19.6004C21.5002 19.2598 21.3205 18.8631 21.1665 18.4104L22.0205 18.0604C22.2445 17.9671 22.4522 17.9414 22.6435 17.9834C22.8395 18.0254 22.9795 18.1281 23.0635 18.2914C23.1569 18.4688 23.2549 18.6321 23.3575 18.7814C23.4649 18.9308 23.5839 19.0614 23.7145 19.1734C23.8452 19.2808 23.9922 19.3648 24.1555 19.4254C24.3235 19.4861 24.5149 19.5164 24.7295 19.5164C25.0002 19.5164 25.2359 19.4721 25.4365 19.3834C25.6372 19.2948 25.8052 19.1804 25.9405 19.0404C26.0759 18.8958 26.1762 18.7348 26.2415 18.5574C26.3115 18.3754 26.3465 18.1958 26.3465 18.0184C26.3465 17.7851 26.3255 17.5751 26.2835 17.3884C26.2415 17.1971 26.1435 17.0361 25.9895 16.9054C25.8402 16.7701 25.6162 16.6674 25.3175 16.5974C25.0235 16.5228 24.6222 16.4854 24.1135 16.4854V15.1274C24.5382 15.1274 24.8859 15.0924 25.1565 15.0224C25.4272 14.9524 25.6395 14.8544 25.7935 14.7284C25.9475 14.6024 26.0525 14.4508 26.1085 14.2734C26.1692 14.0961 26.1995 13.9024 26.1995 13.6924C26.1995 13.2491 26.0829 12.9108 25.8495 12.6774C25.6209 12.4441 25.2942 12.3274 24.8695 12.3274C24.6829 12.3274 24.5102 12.3554 24.3515 12.4114C24.1975 12.4628 24.0575 12.5351 23.9315 12.6284C23.8102 12.7218 23.7052 12.8314 23.6165 12.9574C23.5279 13.0834 23.4625 13.2211 23.4205 13.3704C23.3319 13.6038 23.2175 13.7601 23.0775 13.8394C22.9375 13.9141 22.7345 13.9304 22.4685 13.8884L21.4535 13.7064Z",
      fill: tintColor
    }));
  }

  // type as never;
  throw new Error("Invalid icon type");
};

const styles$5 = aphrodite.StyleSheet.create({
  base: {
    display: "flex",
    width: 44,
    height: 38,
    boxSizing: "border-box",
    borderRadius: 3,
    border: "1px solid transparent",
    marginRight: 1,
    marginLeft: 1
  },
  hovered: {
    background: "linear-gradient(0deg, rgba(24, 101, 242, 0.32), rgba(24, 101, 242, 0.32)), ".concat(Color__default["default"].white),
    border: "1px solid #1865F2"
  },
  pressed: {
    background: "#1B50B3"
  },
  focused: {
    outline: "none",
    border: "2px solid ".concat(Color__default["default"].blue)
  },
  innerBox: {
    boxSizing: "border-box",
    border: "1px solid transparent",
    borderRadius: 2,
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  innerBoxPressed: {
    border: "1px solid ".concat(Color__default["default"].white)
  },
  activeIndicator: {
    position: "absolute",
    boxSizing: "border-box",
    bottom: 3,
    width: 36,
    height: 3,
    marginLeft: 3
  }
});
function imageTintColor(itemState, hovered, focused, pressed) {
  if (itemState === "disabled") {
    return Color__default["default"].offBlack64;
  } else if (pressed) {
    return Color__default["default"].white;
  } else if (itemState === "active") {
    return Color__default["default"].blue;
  } else if (hovered) {
    return Color__default["default"].blue;
  }
  return Color__default["default"].offBlack64;
}
class TabbarItem extends React__namespace.Component {
  render() {
    const {
      onClick,
      itemType,
      itemState
    } = this.props;
    return /*#__PURE__*/React__namespace.createElement(Clickable__default["default"], {
      onClick: onClick,
      disabled: itemState === "disabled"
    }, _ref => {
      let {
        hovered,
        focused,
        pressed
      } = _ref;
      const tintColor = imageTintColor(itemState, hovered, focused, pressed);
      return /*#__PURE__*/React__namespace.createElement(wonderBlocksCore.View, {
        style: [styles$5.base, itemState !== "disabled" && hovered && styles$5.hovered, focused && styles$5.focused, pressed && styles$5.pressed]
      }, /*#__PURE__*/React__namespace.createElement(wonderBlocksCore.View, {
        style: [styles$5.innerBox, pressed && styles$5.innerBoxPressed]
      }, /*#__PURE__*/React__namespace.createElement(IconAsset, {
        type: itemType,
        tintColor: tintColor
      })), itemState === "active" && /*#__PURE__*/React__namespace.createElement(wonderBlocksCore.View, {
        style: [styles$5.activeIndicator, {
          backgroundColor: tintColor
        }]
      }));
    });
  }
}

const styles$4 = aphrodite.StyleSheet.create({
  tabbar: {
    display: "flex",
    flexDirection: "row",
    background: Color__default["default"].offWhite,
    paddingTop: 2,
    paddingBottom: 2,
    borderTop: "1px solid ".concat(Color__default["default"].offBlack50),
    borderBottom: "1px solid ".concat(Color__default["default"].offBlack50)
  }
});
class Tabbar extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "state", {
      selectedItem: 0
    });
  }
  render() {
    const {
      items,
      onSelect
    } = this.props;
    return /*#__PURE__*/React__namespace.createElement(wonderBlocksCore.View, {
      style: styles$4.tabbar
    }, items.map((item, index) => /*#__PURE__*/React__namespace.createElement(TabbarItem, {
      key: "tabbar-item-".concat(index),
      itemState: index === this.state.selectedItem ? "active" : "inactive",
      itemType: item,
      onClick: () => {
        this.setState({
          selectedItem: index
        });
        onSelect(item);
      }
    })));
  }
}

const {
  column: column$2,
  row: row$4,
  fullWidth: fullWidth$2
} = Styles;
class TwoPageKeypad extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "state", {
      selectedPage: "Numbers"
    });
  }
  render() {
    const {
      leftPage,
      paginationEnabled,
      rightPage
    } = this.props;
    const {
      selectedPage
    } = this.state;
    if (paginationEnabled) {
      return /*#__PURE__*/React__namespace.createElement(Keypad$1, {
        style: [column$2, styles$3.keypad]
      }, /*#__PURE__*/React__namespace.createElement(Tabbar, {
        items: ["Numbers", "Operators"],
        onSelect: selectedItem => {
          this.setState({
            selectedPage: selectedItem
          });
        }
      }), /*#__PURE__*/React__namespace.createElement(View, {
        style: styles$3.borderTop
      }, selectedPage === "Numbers" && rightPage, selectedPage === "Operators" && leftPage));
    } else {
      return /*#__PURE__*/React__namespace.createElement(Keypad$1, {
        style: styles$3.keypad
      }, /*#__PURE__*/React__namespace.createElement(View, {
        style: row$4
      }, /*#__PURE__*/React__namespace.createElement(View, {
        style: fullWidth$2
      }, leftPage), /*#__PURE__*/React__namespace.createElement(View, {
        style: [styles$3.borderLeft, fullWidth$2]
      }, rightPage)));
    }
  }
}
const styles$3 = aphrodite.StyleSheet.create({
  keypad: {
    // Set the background to light grey, so that when the user drags the
    // keypad pages past the edges, there's a grey backdrop.
    backgroundColor: offBlack16
  },
  borderTop: {
    borderTop: "".concat(innerBorderWidthPx, "px ").concat(innerBorderStyle, " ") + "".concat(innerBorderColor)
  },
  borderLeft: {
    borderLeft: "".concat(innerBorderWidthPx, "px ").concat(innerBorderStyle, " ") + "".concat(innerBorderColor),
    boxSizing: "content-box"
  }
});
const mapStateToProps$3 = state => {
  return {
    paginationEnabled: state.layout.paginationEnabled
  };
};
var TwoPageKeypad$1 = reactRedux.connect(mapStateToProps$3, null, null, {
  forwardRef: true
})(TwoPageKeypad);

/**
 * A keypad that includes all of the expression symbols.
 */
const {
  row: row$3,
  column: column$1,
  oneColumn,
  fullWidth: fullWidth$1,
  roundedTopLeft: roundedTopLeft$2,
  roundedTopRight: roundedTopRight$1
} = Styles;
const expressionKeypadLayout = {
  rows: 4,
  columns: 5,
  numPages: 2,
  // Since we include a two-key popover in the top-right, when the popover
  // is visible, the keypad will expand to fill the equivalent of five
  // rows vertically.
  maxVisibleRows: 4
};
class ExpressionKeypad extends React__namespace.Component {
  render() {
    const {
      currentPage,
      cursorContext,
      dynamicJumpOut,
      extraKeys,
      roundTopLeft,
      roundTopRight
    } = this.props;
    let dismissOrJumpOutKey;
    if (dynamicJumpOut) {
      switch (cursorContext) {
        case CursorContext.IN_PARENS:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_PARENTHESES;
          break;
        case CursorContext.IN_SUPER_SCRIPT:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_EXPONENT;
          break;
        case CursorContext.IN_SUB_SCRIPT:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_BASE;
          break;
        case CursorContext.BEFORE_FRACTION:
          dismissOrJumpOutKey = KeyConfigs.JUMP_INTO_NUMERATOR;
          break;
        case CursorContext.IN_NUMERATOR:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_NUMERATOR;
          break;
        case CursorContext.IN_DENOMINATOR:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_DENOMINATOR;
          break;
        case CursorContext.NONE:
        default:
          dismissOrJumpOutKey = KeyConfigs.DISMISS;
          break;
      }
    } else {
      dismissOrJumpOutKey = KeyConfigs.DISMISS;
    }
    const rightPageStyle = [row$3, fullWidth$1, styles$2.rightPage, roundTopRight && roundedTopRight$1];
    const rightPage = /*#__PURE__*/React__namespace.createElement(View, {
      style: rightPageStyle
    }, /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_7,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_4,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_1,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(ManyKeypadButton, {
      keys: extraKeys
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_8,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_5,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_2,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_0,
      borders: BorderStyles.LEFT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_9,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_6,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_3,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.DECIMAL,
      borders: BorderStyles.LEFT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.DIVIDE,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.TIMES,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.MINUS,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.PLUS,
      borders: BorderStyles.LEFT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.FRAC,
      style: roundTopRight && roundedTopRight$1
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.CDOT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.BACKSPACE,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: dismissOrJumpOutKey,
      borders: BorderStyles.LEFT
    })));
    const leftPageStyle = [row$3, fullWidth$1, styles$2.leftPage, roundTopLeft && roundedTopLeft$2];
    const leftPage = /*#__PURE__*/React__namespace.createElement(View, {
      style: leftPageStyle
    }, /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.EXP_2,
      borders: BorderStyles.NONE,
      style: roundTopLeft && roundedTopLeft$2
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.SQRT,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LOG,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.SIN,
      borders: BorderStyles.NONE
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.EXP_3,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.CUBE_ROOT,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LN,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.COS,
      borders: BorderStyles.NONE
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.EXP,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.RADICAL,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LOG_N,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.TAN,
      borders: BorderStyles.NONE
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.GEQ,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.EQUAL,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LEQ
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LEFT_PAREN,
      borders: BorderStyles.LEFT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [column$1, oneColumn]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.GT,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NEQ,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LT,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.RIGHT_PAREN,
      borders: BorderStyles.NONE
    })));
    return /*#__PURE__*/React__namespace.createElement(TwoPageKeypad$1, {
      currentPage: currentPage,
      rightPage: rightPage,
      leftPage: leftPage
    });
  }
}
const styles$2 = aphrodite.StyleSheet.create({
  // NOTE(charlie): These backgrounds are applied to as to fill in some
  // unfortunate 'cracks' in the layout. However, not all keys in the first
  // page use this background color (namely, the 'command' keys, backspace and
  // dismiss).
  // TODO(charlie): Apply the proper background between the 'command' keys.
  rightPage: {
    backgroundColor: valueGrey
  },
  leftPage: {
    backgroundColor: controlGrey
  }
});
const mapStateToProps$2 = state => {
  var _state$input$cursor;
  return {
    currentPage: state.pager.currentPage,
    cursorContext: (_state$input$cursor = state.input.cursor) === null || _state$input$cursor === void 0 ? void 0 : _state$input$cursor.context,
    dynamicJumpOut: !state.layout.navigationPadEnabled
  };
};
var ExpressionKeypad$1 = reactRedux.connect(mapStateToProps$2, null, null, {
  forwardRef: true
})(ExpressionKeypad);

/**
 * A keypad that includes the digits, as well as the symbols required to deal
 * with fractions, decimals, and percents.
 */
const {
  row: row$2,
  roundedTopLeft: roundedTopLeft$1,
  roundedTopRight
} = Styles;
const fractionKeypadLayout = {
  rows: 4,
  columns: 4,
  numPages: 1,
  // Since we include a two-key popover in the top-right, when the popover
  // is visible, the keypad will expand to fill the equivalent of five
  // rows vertically.
  maxVisibleRows: 5
};
class FractionKeypad extends React__namespace.Component {
  render() {
    const {
      cursorContext,
      dynamicJumpOut,
      roundTopLeft,
      roundTopRight
    } = this.props;
    let dismissOrJumpOutKey;
    if (dynamicJumpOut) {
      switch (cursorContext) {
        case CursorContext.IN_PARENS:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_PARENTHESES;
          break;
        case CursorContext.IN_SUPER_SCRIPT:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_EXPONENT;
          break;
        case CursorContext.IN_SUB_SCRIPT:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_BASE;
          break;
        case CursorContext.BEFORE_FRACTION:
          dismissOrJumpOutKey = KeyConfigs.JUMP_INTO_NUMERATOR;
          break;
        case CursorContext.IN_NUMERATOR:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_NUMERATOR;
          break;
        case CursorContext.IN_DENOMINATOR:
          dismissOrJumpOutKey = KeyConfigs.JUMP_OUT_DENOMINATOR;
          break;
        case CursorContext.NONE:
        default:
          dismissOrJumpOutKey = KeyConfigs.DISMISS;
          break;
      }
    } else {
      dismissOrJumpOutKey = KeyConfigs.DISMISS;
    }
    return /*#__PURE__*/React__namespace.createElement(Keypad$1, null, /*#__PURE__*/React__namespace.createElement(View, {
      style: row$2
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_7,
      borders: BorderStyles.NONE,
      style: roundTopLeft && roundedTopLeft$1
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_8,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_9,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.FRAC,
      disabled:
      // NOTE(charlie): It's only sufficient to use
      // `IN_NUMERATOR` and `IN_DENOMINATOR` here because we
      // don't support parentheses in this keypad. If we did,
      // then when the cursor was inside a parenthetical
      // expression in a numerator or denominator, this check
      // would fail.
      cursorContext === CursorContext.IN_NUMERATOR || cursorContext === CursorContext.IN_DENOMINATOR,
      style: roundTopRight && roundedTopRight
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: row$2
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_4,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_5,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_6,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.PERCENT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: row$2
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_1,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_2,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_3,
      borders: BorderStyles.BOTTOM
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.BACKSPACE,
      borders: BorderStyles.LEFT
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: row$2
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NEGATIVE,
      borders: BorderStyles.NONE
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.NUM_0,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.DECIMAL,
      borders: BorderStyles.LEFT
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: dismissOrJumpOutKey,
      borders: BorderStyles.LEFT
    })));
  }
}
const mapStateToProps$1 = state => {
  var _state$input$cursor;
  return {
    cursorContext: (_state$input$cursor = state.input.cursor) === null || _state$input$cursor === void 0 ? void 0 : _state$input$cursor.context,
    dynamicJumpOut: !state.layout.navigationPadEnabled
  };
};
var FractionKeypad$1 = reactRedux.connect(mapStateToProps$1, null, null, {
  forwardRef: true
})(FractionKeypad);

const defaultKeypadType = KeypadType.EXPRESSION;
const keypadForType = {
  [KeypadType.FRACTION]: fractionKeypadLayout,
  [KeypadType.EXPRESSION]: expressionKeypadLayout
};

const initialKeypadState = {
  extraKeys: ["x", "y", Keys.THETA, Keys.PI],
  keypadType: defaultKeypadType,
  active: false
};
const keypadReducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialKeypadState;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case "DismissKeypad":
      return {
        ...state,
        active: false
      };
    case "ActivateKeypad":
      return {
        ...state,
        active: true
      };
    case "ConfigureKeypad":
      return {
        ...state,
        // Default `extraKeys` to the empty array.
        extraKeys: [],
        ...action.configuration
      };
    case "PressKey":
      const keyConfig = KeyConfigs[action.key];
      // NOTE(charlie): Our keypad system operates by triggering key
      // presses with key IDs in a dumb manner, such that the keys
      // don't know what they can do--instead, the store is
      // responsible for interpreting key presses and triggering the
      // right actions when they occur. Hence, we figure off a
      // dismissal here rather than dispatching a dismiss action in
      // the first place.
      if (keyConfig.id === Keys.DISMISS) {
        return keypadReducer(state, {
          type: "DismissKeypad"
        });
      }
      return state;
    default:
      return state;
  }
};

/**
 * An algorithm for computing the appropriate layout parameters for the keypad,
 * including the size of the buttons and whether or not to render fullscreen,
 * taking into account a number of factors including the size of the screen, the
 * orientation of the screen, the presence of browser chrome, the presence of
 * other exercise-related chrome, the size of the input box, the parameters that
 * define the keypad (i.e., the number of rows, columns, and pages), and so
 * forth.
 *
 * The computations herein make some strong assumptions about the sizes of
 * various other elements and the situations under which they will be visible
 * (e.g., browser chrome). However, this is just a heuristic--it's not crucial
 * that our buttons are sized in a pixel-perfect manner, but rather, that we
 * make a balanced use of space.
 *
 * Note that one goal of the algorithm is to avoid resizing the keypad in the
 * face of dynamic browser chrome. In order to avoid that awkwardness, we tend
 * to be conservative in our measurements and make things smaller than they
 * might need to be.
 */
const minButtonHeight = 48;
const maxButtonSize = 64;
const minSpaceAboveKeypad = 32;

// These values are taken from an iPhone 5, but should be consistent with the
// iPhone 4 as well. Regardless, these are meant to be representative of the
// possible types of browser chrome that could appear in various context, rather
// than pixel-perfect for every device.
const safariNavBarWhenShrunk = 44;
const safariNavBarWhenExpanded = 64;
const safariToolbar = 44;

// In mobile Safari, the browser chrome is completely hidden in landscape,
// though a shrunken navbar and full-sized toolbar on scroll. In portrait, the
// shrunken navbar is always visible, but expands on scroll (and the toolbar
// appears as well).
const maxLandscapeBrowserChrome = safariNavBarWhenShrunk + safariToolbar;
const maxPortraitBrowserChrome = safariToolbar + (safariNavBarWhenExpanded - safariNavBarWhenShrunk);

// This represents the 'worst case' aspect ratio that we care about (for
// portrait layouts). It's taken from the iPhone 4. The height is computed by
// taking the height of the device and removing the persistent, shrunken navbar.
// (We don't need to account for the expanded navbar, since we include the
// difference when reserving space above the keypad.)
const worstCaseAspectRatio = 320 / (480 - safariNavBarWhenShrunk);
const computeLayoutParameters = (_ref, _ref2, _ref3, _ref4) => {
  let {
    numColumns,
    numMaxVisibleRows,
    numPages
  } = _ref;
  let {
    pageWidthPx,
    pageHeightPx
  } = _ref2;
  let {
    deviceOrientation,
    deviceType
  } = _ref3;
  let {
    navigationPadEnabled,
    paginationEnabled,
    toolbarEnabled
  } = _ref4;
  // First, compute some values that will be used in multiple computations.
  const effectiveNumColumns = paginationEnabled ? numColumns : numColumns * numPages;

  // Then, compute the button dimensions based on the provided parameters.
  let buttonDimensions;
  if (deviceType === DeviceType.PHONE) {
    const isLandscape = deviceOrientation === DeviceOrientation.LANDSCAPE;

    // In many cases, the browser chrome will already have been factored
    // into `pageHeightPx`. But we have no way of knowing if that's
    // the case or not. As such, we take a conservative approach and
    // assume that the chrome is _never_ included in `pageHeightPx`.
    const browserChromeHeight = isLandscape ? maxLandscapeBrowserChrome : maxPortraitBrowserChrome;

    // Count up all the space that we need to reserve on the page.
    // Namely, we need to account for:
    //  1. Space between the keypad and the top of the page.
    //  2. The presence of the exercise toolbar.
    //  3. The presence of the view pager indicator.
    //  4. Any browser chrome that may appear later.
    const reservedSpace = minSpaceAboveKeypad + browserChromeHeight + (toolbarEnabled ? toolbarHeightPx : 0) + (paginationEnabled ? pageIndicatorHeightPx : 0);

    // Next, compute the effective width and height. We can use the page
    // width as the effective width. For the height, though, we take
    // another conservative measure when in portrait by assuming that
    // the device has the worst possible aspect ratio. In other words,
    // we ignore the device height in portrait and assume the worst.
    // This prevents the keypad from changing size when browser chrome
    // appears and disappears.
    const effectiveWidth = pageWidthPx;
    const effectiveHeight = isLandscape ? pageHeightPx : pageWidthPx / worstCaseAspectRatio;
    const maxKeypadHeight = effectiveHeight - reservedSpace;

    // Finally, compute the button height and width. In computing the
    // height, accommodate for the maximum number of rows that will ever be
    // visible (since the toggling of popovers can increase the number of
    // visible rows).
    const buttonHeightPx = Math.max(Math.min(maxKeypadHeight / numMaxVisibleRows, maxButtonSize), minButtonHeight);
    let buttonWidthPx;
    if (numPages > 1) {
      const effectiveNumColumns = paginationEnabled ? numColumns : numColumns * numPages;
      buttonWidthPx = effectiveWidth / effectiveNumColumns;
    } else {
      buttonWidthPx = isLandscape ? maxButtonSize : effectiveWidth / numColumns;
    }
    buttonDimensions = {
      widthPx: buttonWidthPx,
      heightPx: buttonHeightPx
    };
  } else if (deviceType === DeviceType.TABLET) {
    buttonDimensions = {
      widthPx: maxButtonSize,
      heightPx: maxButtonSize
    };
  } else {
    throw new Error("Invalid device type: " + deviceType);
  }

  // Finally, determine whether the keypad should be rendered in the
  // fullscreen layout by determining its resultant width.
  const numSeparators = (navigationPadEnabled ? 1 : 0) + (!paginationEnabled ? numPages - 1 : 0);
  const keypadWidth = effectiveNumColumns * buttonDimensions.widthPx + (navigationPadEnabled ? navigationPadWidthPx : 0) + numSeparators * innerBorderWidthPx;
  return {
    buttonDimensions,
    layoutMode: keypadWidth >= pageWidthPx ? LayoutMode.FULLSCREEN : LayoutMode.COMPACT
  };
};

const initialLayoutState = {
  gridDimensions: {
    numRows: keypadForType[defaultKeypadType].rows,
    numColumns: keypadForType[defaultKeypadType].columns,
    numMaxVisibleRows: keypadForType[defaultKeypadType].maxVisibleRows,
    numPages: keypadForType[defaultKeypadType].numPages
  },
  buttonDimensions: {
    widthPx: 48,
    heightPx: 48
  },
  pageDimensions: {
    pageWidthPx: 0,
    pageHeightPx: 0
  },
  layoutMode: LayoutMode.FULLSCREEN,
  paginationEnabled: false,
  navigationPadEnabled: false
};

/**
 * Compute the additional layout state based on the provided page and grid
 * dimensions.
 */
const layoutParametersForDimensions = (pageDimensions, gridDimensions) => {
  const {
    pageWidthPx,
    pageHeightPx
  } = pageDimensions;

  // Determine the device type and orientation.
  const deviceOrientation = pageWidthPx > pageHeightPx ? DeviceOrientation.LANDSCAPE : DeviceOrientation.PORTRAIT;
  const deviceType = Math.min(pageWidthPx, pageHeightPx) > tabletCutoffPx ? DeviceType.TABLET : DeviceType.PHONE;

  // Using that information, make some decisions (or assumptions)
  // about the resulting layout.
  const navigationPadEnabled = deviceType === DeviceType.TABLET;
  const paginationEnabled = deviceType === DeviceType.PHONE && deviceOrientation === DeviceOrientation.PORTRAIT;
  const deviceInfo = {
    deviceOrientation,
    deviceType
  };
  const layoutOptions = {
    navigationPadEnabled,
    paginationEnabled,
    // HACK(charlie): It's not great that we're making assumptions about
    // the toolbar (which is rendered by webapp, and should always be
    // visible and anchored to the bottom of the page for phone and
    // tablet exercises). But this is primarily a heuristic (the goal is
    // to preserve a 'good' amount of space between the top of the
    // keypad and the top of the page) so we afford to have some margin
    // of error.
    toolbarEnabled: true
  };
  return {
    ...computeLayoutParameters(gridDimensions, pageDimensions, deviceInfo, layoutOptions),
    // Pass along some of the layout information, so that other
    // components in the heirarchy can adapt appropriately.
    navigationPadEnabled,
    paginationEnabled
  };
};
const layoutReducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialLayoutState;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case "ConfigureKeypad":
      const {
        keypadType
      } = action.configuration;
      const gridDimensions = {
        numRows: keypadForType[keypadType].rows,
        numColumns: keypadForType[keypadType].columns,
        numMaxVisibleRows: keypadForType[keypadType].maxVisibleRows,
        numPages: keypadForType[keypadType].numPages
      };
      return {
        ...state,
        ...layoutParametersForDimensions(state.pageDimensions, gridDimensions),
        gridDimensions
      };
    case "SetPageSize":
      const {
        pageWidthPx,
        pageHeightPx
      } = action;
      const pageDimensions = {
        pageWidthPx,
        pageHeightPx
      };
      return {
        ...state,
        ...layoutParametersForDimensions(pageDimensions, state.gridDimensions),
        pageDimensions
      };
    default:
      return state;
  }
};

class VelocityTracker {
  constructor(options) {
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "_events", void 0);
    this.options = {
      velocityTimeout: 100,
      ...options
    };
    this._events = [];
  }

  /**
   * Pushes an event with the given displacement onto the event buffer,
   * associating it with a timestamp. Note that, as this method computes the
   * timestamp for the event at calltime, it should be called immediately
   * after the event occurs.
   *
   * @param {number} x - the cumulative displacement of the event
   */
  push(x) {
    this._events.push({
      x,
      t: now__default["default"]()
    });
  }

  /**
   * Compute the velocity with respect to the events that have been tracked
   * by the system. Velocity is computed by smoothing linearly over recent
   * displacement values.
   *
   * Note that, for performance reasons, a call to `getVelocity` will clear
   * out the event buffer. As such, repeated calls will not return the same
   * value (in particular, a second call in quick succession will return 0).
   *
   * @returns {number} the velocity associated with the tracker
   */
  getVelocity() {
    const events = this._getEvents();
    if (events.length < 2) {
      return 0;
    } else {
      const current = events[events.length - 1];
      const first = events[0];
      const dt = current.t - first.t;
      return (current.x - first.x) / dt;
    }
  }

  /**
   * Filter the tracked events to exclude any events that occurred too far in
   * the past, and reset the event buffer.
   *
   * @returns {number[]} an array of displacements corresponding to events
   *                     that occurred in the past `velocityTimeout`
   *                     milliseconds
   */
  _getEvents() {
    const threshold = now__default["default"]() - this.options.velocityTimeout;
    const recentEvents = this._events.filter(event => {
      return event.t > threshold;
    });
    this._events = [];
    return recentEvents;
  }
}

// We default to the right-most page. This is done so-as to enforce a
// consistent orientation between the view pager layout and the flattened
// layout, where our default page appears on the far right.
const getDefaultPage = numPages => numPages - 1;
const initialPagerState = {
  animateToPosition: false,
  currentPage: getDefaultPage(keypadForType[defaultKeypadType].numPages),
  // The cumulative differential in the horizontal direction for the
  // current swipe.
  dx: 0,
  numPages: keypadForType[defaultKeypadType].numPages,
  pageWidthPx: 0,
  velocityTracker: new VelocityTracker()
};
const pagerReducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialPagerState;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case "ConfigureKeypad":
      const {
        keypadType
      } = action.configuration;
      const {
        numPages
      } = keypadForType[keypadType];
      return {
        ...state,
        numPages,
        animateToPosition: false,
        currentPage: getDefaultPage(numPages),
        dx: 0
      };
    case "SetPageSize":
      return {
        ...state,
        pageWidthPx: action.pageWidthPx
      };
    case "PressKey":
      const keyConfig = KeyConfigs[action.key];

      // Reset the keypad page if the user performs a math operation.
      if (keyConfig.type === KeyType.VALUE || keyConfig.type === KeyType.OPERATOR) {
        return {
          ...state,
          animateToPosition: true,
          // We start at the right-most page.
          currentPage: getDefaultPage(state.numPages),
          dx: 0
        };
      }
      return state;
    case "OnSwipeChange":
      state.velocityTracker.push(action.dx);
      return {
        ...state,
        animateToPosition: false,
        dx: action.dx
      };
    case "OnSwipeEnd":
      const {
        pageWidthPx,
        velocityTracker
      } = state;
      const {
        dx
      } = action;
      const velocity = velocityTracker.getVelocity();

      // NOTE(charlie): These will need refinement. The velocity comes
      // from Framer.
      const minFlingVelocity = 0.1;
      const minFlingDistance = 10;
      const shouldPageRight = dx < -pageWidthPx / 2 || velocity < -minFlingVelocity && dx < -minFlingDistance;
      const shouldPageLeft = dx > pageWidthPx / 2 || velocity > minFlingVelocity && dx > minFlingDistance;
      if (shouldPageRight) {
        const nextPage = Math.min(state.currentPage + 1, state.numPages - 1);
        return {
          ...state,
          animateToPosition: true,
          currentPage: nextPage,
          dx: 0
        };
      } else if (shouldPageLeft) {
        const prevPage = Math.max(state.currentPage - 1, 0);
        return {
          ...state,
          animateToPosition: true,
          currentPage: prevPage,
          dx: 0
        };
      }
      return {
        ...state,
        animateToPosition: true,
        dx: 0
      };
    default:
      return state;
  }
};

const createStore = () => {
  // TODO(matthewc)[LC-752]: gestureReducer can't be moved from this file
  // because it depends on `store` being in scope (see note below)
  const createGestureManager = swipeEnabled => {
    return new GestureManager({
      swipeEnabled
    }, {
      onSwipeChange: dx => {
        store.dispatch(onSwipeChange(dx));
      },
      onSwipeEnd: dx => {
        store.dispatch(onSwipeEnd(dx));
      },
      onActiveNodesChanged: activeNodes => {
        store.dispatch(setActiveNodes(activeNodes));
      },
      onClick: (key, layoutProps, inPopover) => {
        store.dispatch(pressKey(key, layoutProps.borders, layoutProps.initialBounds, inPopover));
      }
    }, [], [Keys.BACKSPACE, Keys.UP, Keys.RIGHT, Keys.DOWN, Keys.LEFT]);
  };
  const initialGestureState = {
    popover: null,
    focus: null,
    gestureManager: createGestureManager(keypadForType[defaultKeypadType].numPages > 1)
  };
  const gestureReducer = function () {
    let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialGestureState;
    let action = arguments.length > 1 ? arguments[1] : undefined;
    switch (action.type) {
      case "DismissKeypad":
        // NOTE(charlie): In the past, we enforced the "gesture manager
        // will not receive any events when the keypad is hidden"
        // assumption by assuming that the keypad would be hidden when
        // dismissed and, as such, that none of its managed DOM nodes
        // would be able to receive touch events. However, on mobile
        // Safari, we're seeing that some of the keys receive touch
        // events even when off-screen, inexplicably. So, to guard
        // against that bug and make the contract explicit, we enable
        // and disable event tracking on activation and dismissal.
        state.gestureManager.disableEventTracking();
        return state;
      case "ActivateKeypad":
        state.gestureManager.enableEventTracking();
        return state;
      case "SetActiveNodes":
        return {
          ...state,
          ...action.activeNodes
        };
      case "ConfigureKeypad":
        const {
          keypadType
        } = action.configuration;
        const {
          numPages
        } = keypadForType[keypadType];
        const swipeEnabled = numPages > 1;
        return {
          popover: null,
          focus: null,
          gestureManager: createGestureManager(swipeEnabled)
        };
      default:
        return state;
    }
  };
  const reducer = Redux__namespace.combineReducers({
    input: inputReducer,
    keypad: keypadReducer,
    pager: pagerReducer,
    gestures: gestureReducer,
    echoes: echoReducer,
    layout: layoutReducer
  });

  // TODO(charlie): This non-inlined return is necessary so as to allow the
  // gesture manager to dispatch actions on the store in its callbacks. We
  // should come up with a better pattern to remove the two-way dependency.
  // eslint-disable-next-line import/no-deprecated
  const store = Redux__namespace.createStore(reducer);
  return store;
};

/**
 * A component that renders a navigation pad, which consists of an arrow for
 * each possible direction.
 */
const {
  row: row$1,
  column,
  centered: centered$1,
  stretch,
  roundedTopLeft
} = Styles;
class NavigationPad extends React__namespace.Component {
  render() {
    // TODO(charlie): Disable the navigational arrows depending on the
    // cursor context.
    const {
      roundTopLeft,
      style
    } = this.props;
    const containerStyle = [column, centered$1, styles$1.container, roundTopLeft && roundedTopLeft, ...(Array.isArray(style) ? style : [style])];
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: containerStyle
    }, /*#__PURE__*/React__namespace.createElement(View, {
      style: [row$1, centered$1]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.UP,
      borders: BorderStyles.NONE,
      style: [styles$1.navigationKey, styles$1.topArrow]
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [row$1, centered$1, stretch]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.LEFT,
      borders: BorderStyles.NONE,
      style: [styles$1.navigationKey, styles$1.leftArrow]
    }), /*#__PURE__*/React__namespace.createElement(View, {
      style: styles$1.horizontalSpacer
    }), /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.RIGHT,
      borders: BorderStyles.NONE,
      style: [styles$1.navigationKey, styles$1.rightArrow]
    })), /*#__PURE__*/React__namespace.createElement(View, {
      style: [row$1, centered$1]
    }, /*#__PURE__*/React__namespace.createElement(TouchableKeypadButton$1, {
      keyConfig: KeyConfigs.DOWN,
      borders: BorderStyles.NONE,
      style: [styles$1.navigationKey, styles$1.bottomArrow]
    })));
  }
}
const buttonSizePx = 48;
const borderRadiusPx = 4;
const borderWidthPx$1 = 1;
const styles$1 = aphrodite.StyleSheet.create({
  container: {
    backgroundColor: controlGrey,
    width: navigationPadWidthPx
  },
  navigationKey: {
    borderColor: offBlack16,
    backgroundColor: valueGrey,
    width: buttonSizePx,
    height: buttonSizePx,
    // Override the default box-sizing so that our buttons are
    // `buttonSizePx` exclusive of their borders.
    boxSizing: "content-box"
  },
  topArrow: {
    borderTopWidth: borderWidthPx$1,
    borderLeftWidth: borderWidthPx$1,
    borderRightWidth: borderWidthPx$1,
    borderTopLeftRadius: borderRadiusPx,
    borderTopRightRadius: borderRadiusPx
  },
  rightArrow: {
    borderTopWidth: borderWidthPx$1,
    borderRightWidth: borderWidthPx$1,
    borderBottomWidth: borderWidthPx$1,
    borderTopRightRadius: borderRadiusPx,
    borderBottomRightRadius: borderRadiusPx
  },
  bottomArrow: {
    borderBottomWidth: borderWidthPx$1,
    borderLeftWidth: borderWidthPx$1,
    borderRightWidth: borderWidthPx$1,
    borderBottomLeftRadius: borderRadiusPx,
    borderBottomRightRadius: borderRadiusPx
  },
  leftArrow: {
    borderTopWidth: borderWidthPx$1,
    borderBottomWidth: borderWidthPx$1,
    borderLeftWidth: borderWidthPx$1,
    borderTopLeftRadius: borderRadiusPx,
    borderBottomLeftRadius: borderRadiusPx
  },
  horizontalSpacer: {
    background: valueGrey,
    // No need to set a height -- the spacer will be stretched by its
    // parent.
    width: buttonSizePx
  }
});

const {
  row,
  centered,
  fullWidth
} = Styles;
// eslint-disable-next-line react/no-unsafe
class KeypadContainer extends React__namespace.Component {
  constructor() {
    super(...arguments);
    _defineProperty(this, "_resizeTimeout", void 0);
    _defineProperty(this, "hasMounted", void 0);
    _defineProperty(this, "state", {
      hasBeenActivated: false,
      viewportWidth: "100vw"
    });
    _defineProperty(this, "_throttleResizeHandler", () => {
      // Throttle the resize callbacks.
      // https://developer.mozilla.org/en-US/docs/Web/Events/resize
      if (this._resizeTimeout == null) {
        this._resizeTimeout = window.setTimeout(() => {
          this._resizeTimeout = null;
          this._onResize();
        }, 66);
      }
    });
    _defineProperty(this, "_onResize", () => {
      var _this$props$onPageSiz, _this$props;
      // Whenever the page resizes, we need to force an update, as the button
      // heights and keypad width are computed based on horizontal space.
      this.setState({
        viewportWidth: window.innerWidth
      });
      (_this$props$onPageSiz = (_this$props = this.props).onPageSizeChange) === null || _this$props$onPageSiz === void 0 ? void 0 : _this$props$onPageSiz.call(_this$props, window.innerWidth, window.innerHeight);
    });
    _defineProperty(this, "renderKeypad", () => {
      const {
        extraKeys,
        keypadType,
        layoutMode,
        navigationPadEnabled
      } = this.props;
      const keypadProps = {
        extraKeys,
        // HACK(charlie): In order to properly round the corners of the
        // compact keypad, we need to instruct some of our child views to
        // crop themselves. At least we're colocating all the layout
        // information in this component, though.
        roundTopLeft: layoutMode === LayoutMode.COMPACT && !navigationPadEnabled,
        roundTopRight: layoutMode === LayoutMode.COMPACT
      };

      // Select the appropriate keyboard given the type.
      // TODO(charlie): In the future, we might want to move towards a
      // data-driven approach to defining keyboard layouts, and have a
      // generic keyboard that takes some "keyboard data" and renders it.
      // However, the keyboards differ pretty heavily right now and it's not
      // clear what that format would look like exactly. Plus, there aren't
      // very many of them. So to keep us moving, we'll just hardcode.
      switch (keypadType) {
        case KeypadType.FRACTION:
          return /*#__PURE__*/React__namespace.createElement(FractionKeypad$1, keypadProps);
        case KeypadType.EXPRESSION:
          return /*#__PURE__*/React__namespace.createElement(ExpressionKeypad$1, keypadProps);
        default:
          throw new Error("Invalid keypad type: " + keypadType);
      }
    });
  }
  UNSAFE_componentWillMount() {
    if (this.props.active) {
      this.setState({
        hasBeenActivated: this.props.active
      });
    }
  }
  componentDidMount() {
    // Relay the initial size metrics.
    this._onResize();

    // And update it on resize.
    window.addEventListener("resize", this._throttleResizeHandler);
    window.addEventListener("orientationchange", this._throttleResizeHandler);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.state.hasBeenActivated && nextProps.active) {
      this.setState({
        hasBeenActivated: true
      });
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.active && !this.props.active) {
      this.props.onDismiss && this.props.onDismiss();
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._throttleResizeHandler);
    window.removeEventListener("orientationchange", this._throttleResizeHandler);
  }
  render() {
    const {
      active,
      layoutMode,
      navigationPadEnabled,
      onElementMounted,
      style
    } = this.props;
    const {
      hasBeenActivated
    } = this.state;

    // NOTE(charlie): We render the transforms as pure inline styles to
    // avoid an Aphrodite bug in mobile Safari.
    //   See: https://github.com/Khan/aphrodite/issues/68.
    let dynamicStyle = {
      ...(active ? inlineStyles.active : inlineStyles.hidden)
    };
    if (!active && !hasBeenActivated) {
      dynamicStyle = {
        ...dynamicStyle,
        ...inlineStyles.invisible
      };
    }
    const keypadContainerStyle = [row, centered, fullWidth, styles.keypadContainer, ...(Array.isArray(style) ? style : [style])];
    const keypadStyle = [row, styles.keypadBorder, layoutMode === LayoutMode.FULLSCREEN ? styles.fullscreen : styles.compact];

    // TODO(charlie): When the keypad is shorter than the width of the
    // screen, add a border on its left and right edges, and round out the
    // corners.
    return /*#__PURE__*/React__namespace.createElement(View, {
      style: keypadContainerStyle,
      dynamicStyle: dynamicStyle,
      extraClassName: "keypad-container"
    }, /*#__PURE__*/React__namespace.createElement(View, {
      style: keypadStyle,
      ref: element => {
        if (!this.hasMounted && element) {
          this.hasMounted = true;
          onElementMounted(element);
        }
      }
    }, navigationPadEnabled && /*#__PURE__*/React__namespace.createElement(NavigationPad, {
      roundTopLeft: layoutMode === LayoutMode.COMPACT,
      style: styles.navigationPadContainer
    }), /*#__PURE__*/React__namespace.createElement(View, {
      style: styles.keypadLayout
    }, this.renderKeypad())));
  }
}
const keypadAnimationDurationMs = 300;
const borderWidthPx = 1;
const styles = aphrodite.StyleSheet.create({
  keypadContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    position: "fixed",
    transition: "".concat(keypadAnimationDurationMs, "ms ease-out"),
    transitionProperty: "transform",
    zIndex: keypad
  },
  keypadBorder: {
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.1)",
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderStyle: "solid"
  },
  fullscreen: {
    borderTopWidth: borderWidthPx
  },
  compact: {
    borderTopRightRadius: compactKeypadBorderRadiusPx,
    borderTopLeftRadius: compactKeypadBorderRadiusPx,
    borderTopWidth: borderWidthPx,
    borderRightWidth: borderWidthPx,
    borderLeftWidth: borderWidthPx
  },
  navigationPadContainer: {
    // Add a separator between the navigation pad and the keypad.
    borderRight: "".concat(innerBorderWidthPx, "px ").concat(innerBorderStyle, " ") + "".concat(innerBorderColor),
    boxSizing: "content-box"
  },
  // Defer to the navigation pad, such that the navigation pad is always
  // rendered at full-width, and the keypad takes up just the remaining space.
  // TODO(charlie): Avoid shrinking the keys and, instead, make the keypad
  // scrollable.
  keypadLayout: {
    flexGrow: 1,
    // Avoid unitless flex-basis, per: https://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/
    flexBasis: "0%"
  }
});

// Note: these don't go through an autoprefixer/aphrodite.
const inlineStyles = {
  // If the keypad is yet to have ever been activated, we keep it invisible
  // so as to avoid, e.g., the keypad flashing at the bottom of the page
  // during the initial render.
  invisible: {
    visibility: "hidden"
  },
  hidden: {
    transform: "translate3d(0, 100%, 0)"
  },
  active: {
    transform: "translate3d(0, 0, 0)"
  }
};
const mapStateToProps = state => {
  return {
    extraKeys: state.keypad.extraKeys,
    keypadType: state.keypad.keypadType,
    active: state.keypad.active,
    layoutMode: state.layout.layoutMode,
    navigationPadEnabled: state.layout.navigationPadEnabled
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onPageSizeChange: (pageWidthPx, pageHeightPx) => {
      dispatch(setPageSize(pageWidthPx, pageHeightPx));
    }
  };
};
var KeypadContainer$1 = reactRedux.connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(KeypadContainer);

class ProvidedKeypad extends React__namespace.Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "store", void 0);
    _defineProperty(this, "activate", () => {
      this.store.dispatch(activateKeypad());
    });
    _defineProperty(this, "dismiss", () => {
      this.store.dispatch(dismissKeypad());
    });
    _defineProperty(this, "configure", (configuration, cb) => {
      this.store.dispatch(configureKeypad(configuration));

      // HACK(charlie): In Perseus, triggering a focus causes the keypad to
      // animate into view and re-configure. We'd like to provide the option
      // to re-render the re-configured keypad before animating it into view,
      // to avoid jank in the animation. As such, we support passing a
      // callback into `configureKeypad`. However, implementing this properly
      // would require middleware, etc., so we just hack it on with
      // `setTimeout` for now.
      setTimeout(() => cb && cb());
    });
    _defineProperty(this, "setCursor", cursor => {
      this.store.dispatch(setCursor(cursor));
    });
    _defineProperty(this, "setKeyHandler", keyHandler => {
      this.store.dispatch(setKeyHandler(keyHandler));
    });
    _defineProperty(this, "getDOMNode", () => {
      return ReactDOM__default["default"].findDOMNode(this);
    });
    this.store = createStore();
  }
  render() {
    const {
      onElementMounted,
      onDismiss,
      style
    } = this.props;
    return /*#__PURE__*/React__namespace.createElement(reactRedux.Provider, {
      store: this.store
    }, /*#__PURE__*/React__namespace.createElement(KeypadContainer$1, {
      onElementMounted: element => {
        // Append the dispatch methods that we want to expose
        // externally to the returned React element.
        const elementWithDispatchMethods = {
          ...element,
          activate: this.activate,
          dismiss: this.dismiss,
          configure: this.configure,
          setCursor: this.setCursor,
          setKeyHandler: this.setKeyHandler,
          getDOMNode: this.getDOMNode
        };
        onElementMounted && onElementMounted(elementWithDispatchMethods);
      },
      onDismiss: onDismiss,
      style: style
    }));
  }
}

exports.CursorContext = CursorContext;
exports.KeyConfigs = KeyConfigs;
exports.KeyType = KeyType;
exports.Keypad = ProvidedKeypad;
exports.KeypadInput = MathInput;
exports.KeypadType = KeypadType;
exports.Keys = Keys;
exports.keypadElementPropType = keypadElementPropType;
//# sourceMappingURL=index.js.map
