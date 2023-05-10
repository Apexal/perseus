import { PerseusError, Errors } from '@khanacademy/perseus-error';
import PropTypes from 'prop-types';

function _extends() {
  _extends = Object.assign || function (target) {
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

/* eslint-disable no-useless-escape */
/**
 * This is the base class for all Selector types. The key method that all
 * selector subclasses must implement is match(). It takes a TraversalState
 * object (from a TreeTransformer traversal) and tests whether the selector
 * matches at the current node. See the comment at the start of this file for
 * more details on the match() method.
 */
class Selector {
  static parse(selectorText) {
    return new Parser(selectorText).parse();
  }

  /**
   * Return an array of the nodes that matched or null if no match.
   * This is the base class so we just throw an exception. All Selector
   * subclasses must provide an implementation of this method.
   */
  match(state) {
    throw new PerseusError("Selector subclasses must implement match()", Errors.NotAllowed);
  }

  /**
   * Selector subclasses all define a toString() method primarily
   * because it makes it easy to write parser tests.
   */
  toString() {
    return "Unknown selector class";
  }
}

/**
 * This class implements a parser for the selector grammar. Pass the source
 * text to the Parser() constructor, and then call the parse() method to
 * obtain a corresponding Selector object. parse() throws an exception
 * if there are syntax errors in the selector.
 *
 * This class is not exported, and you don't need to use it directly.
 * Instead call the static Selector.parse() method.
 */
class Parser {
  // We do lexing with a simple regular expression
  // The array of tokens
  // Which token in the array we're looking at now

  constructor(s) {
    this.tokens = void 0;
    this.tokenIndex = void 0;
    // Normalize whitespace:
    // - remove leading and trailing whitespace
    // - replace runs of whitespace with single space characters
    s = s.trim().replace(/\s+/g, " ");
    // Convert the string to an array of tokens. Note that the TOKENS
    // pattern ignores spaces that do not appear before identifiers
    // or the * wildcard.
    this.tokens = s.match(Parser.TOKENS) || [];
    this.tokenIndex = 0;
  }

  // Return the next token or the empty string if there are no more
  nextToken() {
    return this.tokens[this.tokenIndex] || "";
  }

  // Increment the token index to "consume" the token we were looking at
  // and move on to the next one.
  consume() {
    this.tokenIndex++;
  }

  // Return true if the current token is an identifier or false otherwise
  isIdentifier() {
    // The Parser.TOKENS regexp ensures that we only have to check
    // the first character of a token to know what kind of token it is.
    const c = this.tokens[this.tokenIndex][0];
    return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
  }

  // Consume space tokens until the next token is not a space.
  skipSpace() {
    while (this.nextToken() === " ") {
      this.consume();
    }
  }

  // Parse a comma-separated sequence of tree selectors. This is the
  // entry point for the Parser class and the only method that clients
  // ever need to call.
  parse() {
    // We expect at least one tree selector
    const ts = this.parseTreeSelector();

    // Now see what's next
    let token = this.nextToken();

    // If there is no next token then we're done parsing and can return
    // the tree selector object we got above
    if (!token) {
      return ts;
    }

    // Otherwise, there is more go come and we're going to need a
    // list of tree selectors
    const treeSelectors = [ts];
    while (token) {
      // The only character we allow after a tree selector is a comma
      if (token === ",") {
        this.consume();
      } else {
        throw new ParseError("Expected comma");
      }

      // And if we saw a comma, then it must be followed by another
      // tree selector
      treeSelectors.push(this.parseTreeSelector());
      token = this.nextToken();
    }

    // If we parsed more than one tree selector, return them in a
    // SelectorList object.
    return new SelectorList(treeSelectors);
  }

  // Parse a sequence of node selectors linked together with
  // hierarchy combinators: space, >, + and ~.
  parseTreeSelector() {
    this.skipSpace(); // Ignore space after a comma, for example

    // A tree selector must begin with a node selector
    let ns = this.parseNodeSelector();
    for (;;) {
      // Now check the next token. If there is none, or if it is a
      // comma, then we're done with the treeSelector. Otherwise
      // we expect a combinator followed by another node selector.
      // If we don't see a combinator, we throw an error. If we
      // do see a combinator and another node selector then we
      // combine the current node selector with the new node selector
      // using a Selector subclass that depends on the combinator.
      const token = this.nextToken();
      if (!token || token === ",") {
        break;
      } else if (token === " ") {
        this.consume();
        ns = new AncestorCombinator(ns, this.parseNodeSelector());
      } else if (token === ">") {
        this.consume();
        ns = new ParentCombinator(ns, this.parseNodeSelector());
      } else if (token === "+") {
        this.consume();
        ns = new PreviousCombinator(ns, this.parseNodeSelector());
      } else if (token === "~") {
        this.consume();
        ns = new SiblingCombinator(ns, this.parseNodeSelector());
      } else {
        throw new ParseError("Unexpected token: " + token);
      }
    }
    return ns;
  }

  // Parse a single node selector.
  // For now, this is just a node type or a wildcard.
  //
  // TODO(davidflanagan): we may need to extend this with attribute
  // selectors like 'heading[level=3]', or with pseudo-classes like
  // paragraph:first-child
  parseNodeSelector() {
    // First, skip any whitespace
    this.skipSpace();
    const t = this.nextToken();
    if (t === "*") {
      this.consume();
      return new AnyNode();
    }
    if (this.isIdentifier()) {
      this.consume();
      return new TypeSelector(t);
    }
    throw new ParseError("Expected node type");
  }
}

// We break the input string into tokens with this regexp. Token types
// are identifiers, integers, punctuation and spaces. Note that spaces
// tokens are only returned when they appear before an identifier or
// wildcard token and are otherwise omitted.
Parser.TOKENS = void 0;
Parser.TOKENS = /([a-zA-Z][\w-]*)|(\d+)|[^\s]|(\s(?=[a-zA-Z\*]))/g;

/**
 * This is a trivial Error subclass that the Parser uses to signal parse errors
 */
class ParseError extends Error {
  constructor(message) {
    super(message);
  }
}

/**
 * This Selector subclass is a list of selectors. It matches a node if any of
 * the selectors on the list matches the node. It considers the selectors in
 * order, and returns the array of nodes returned by whichever one matches
 * first.
 */
class SelectorList extends Selector {
  constructor(selectors) {
    super();
    this.selectors = void 0;
    this.selectors = selectors;
  }
  match(state) {
    for (let i = 0; i < this.selectors.length; i++) {
      const s = this.selectors[i];
      const result = s.match(state);
      if (result) {
        return result;
      }
    }
    return null;
  }
  toString() {
    let result = "";
    for (let i = 0; i < this.selectors.length; i++) {
      result += i > 0 ? ", " : "";
      result += this.selectors[i].toString();
    }
    return result;
  }
}

/**
 * This trivial Selector subclass implements the '*' wildcard and
 * matches any node.
 */
class AnyNode extends Selector {
  match(state) {
    return [state.currentNode()];
  }
  toString() {
    return "*";
  }
}

/**
 * This selector subclass implements the <IDENTIFIER> part of the grammar.
 * it matches any node whose `type` property is a specified string
 */
class TypeSelector extends Selector {
  constructor(type) {
    super();
    this.type = void 0;
    this.type = type;
  }
  match(state) {
    const node = state.currentNode();
    if (node.type === this.type) {
      return [node];
    }
    return null;
  }
  toString() {
    return this.type;
  }
}

/**
 * This selector subclass is the superclass of the classes that implement
 * matching for the four combinators. It defines left and right properties for
 * the two selectors that are to be combined, but does not define a match
 * method.
 */
class SelectorCombinator extends Selector {
  constructor(left, right) {
    super();
    this.left = void 0;
    this.right = void 0;
    this.left = left;
    this.right = right;
  }
}

/**
 * This Selector subclass implements the space combinator. It matches if the
 * right selector matches the current node and the left selector matches some
 * ancestor of the current node.
 */
class AncestorCombinator extends SelectorCombinator {
  constructor(left, right) {
    super(left, right);
  }
  match(state) {
    const rightResult = this.right.match(state);
    if (rightResult) {
      state = state.clone();
      while (state.hasParent()) {
        state.goToParent();
        const leftResult = this.left.match(state);
        if (leftResult) {
          return leftResult.concat(rightResult);
        }
      }
    }
    return null;
  }
  toString() {
    return this.left.toString() + " " + this.right.toString();
  }
}

/**
 * This Selector subclass implements the > combinator. It matches if the
 * right selector matches the current node and the left selector matches
 * the parent of the current node.
 */
class ParentCombinator extends SelectorCombinator {
  constructor(left, right) {
    super(left, right);
  }
  match(state) {
    const rightResult = this.right.match(state);
    if (rightResult) {
      if (state.hasParent()) {
        state = state.clone();
        state.goToParent();
        const leftResult = this.left.match(state);
        if (leftResult) {
          return leftResult.concat(rightResult);
        }
      }
    }
    return null;
  }
  toString() {
    return this.left.toString() + " > " + this.right.toString();
  }
}

/**
 * This Selector subclass implements the + combinator. It matches if the
 * right selector matches the current node and the left selector matches
 * the immediate previous sibling of the current node.
 */
class PreviousCombinator extends SelectorCombinator {
  constructor(left, right) {
    super(left, right);
  }
  match(state) {
    const rightResult = this.right.match(state);
    if (rightResult) {
      if (state.hasPreviousSibling()) {
        state = state.clone();
        state.goToPreviousSibling();
        const leftResult = this.left.match(state);
        if (leftResult) {
          return leftResult.concat(rightResult);
        }
      }
    }
    return null;
  }
  toString() {
    return this.left.toString() + " + " + this.right.toString();
  }
}

/**
 * This Selector subclass implements the ~ combinator. It matches if the
 * right selector matches the current node and the left selector matches
 * any previous sibling of the current node.
 */
class SiblingCombinator extends SelectorCombinator {
  constructor(left, right) {
    super(left, right);
  }
  match(state) {
    const rightResult = this.right.match(state);
    if (rightResult) {
      state = state.clone();
      while (state.hasPreviousSibling()) {
        state.goToPreviousSibling();
        const leftResult = this.left.match(state);
        if (leftResult) {
          return leftResult.concat(rightResult);
        }
      }
    }
    return null;
  }
  toString() {
    return this.left.toString() + " ~ " + this.right.toString();
  }
}

/**
 * The Rule class represents a Perseus lint rule. A Rule instance has a check()
 * method that takes the same (node, state, content) arguments that a
 * TreeTransformer traversal callback function does. Call the check() method
 * during a tree traversal to determine whether the current node of the tree
 * violates the rule. If there is no violation, then check() returns
 * null. Otherwise, it returns an object that includes the name of the rule,
 * an error message, and the start and end positions within the node's content
 * string of the lint.
 *
 * A Perseus lint rule consists of a name, a severity, a selector, a pattern
 * (RegExp) and two functions. The check() method uses the selector, pattern,
 * and functions as follows:
 *
 * - First, when determining which rules to apply to a particular piece of
 *   content, each rule can specify an optional function provided in the fifth
 *   parameter to evaluate whether or not we should be applying this rule.
 *   If the function returns false, we don't use the rule on this content.
 *
 * - Next, check() tests whether the node currently being traversed matches
 *   the selector. If it does not, then the rule does not apply at this node
 *   and there is no lint and check() returns null.
 *
 * - If the selector matched, then check() tests the text content of the node
 *   (and its children) against the pattern. If the pattern does not match,
 *   then there is no lint, and check() returns null.
 *
 * - If both the selector and pattern match, then check() calls the function
 *   passing the TraversalState object, the content string for the node, the
 *   array of nodes returned by the selector match, and the array of strings
 *   returned by the pattern match. This function can use these arguments to
 *   implement any kind of lint detection logic it wants. If it determines
 *   that there is no lint, then it should return null. Otherwise, it should
 *   return an error message as a string, or an object with `message`, `start`
 *   and `end` properties. The start and end properties are numbers that mark
 *   the beginning and end of the problematic content. Note that these numbers
 *   are relative to the content string passed to the traversal callback, not
 *   to the entire string that was used to generate the parse tree in the
 *   first place. TODO(davidflanagan): modify the simple-markdown library to
 *   have an option to add the text offset of each node to the parse
 *   tree. This will allows us to pinpoint lint errors within a long string
 *   of markdown text.
 *
 * - If the function returns null, then check() returns null. Otherwise,
 *   check() returns an object with `rule`, `message`, `start` and `end`
 *   properties. The value of the `rule` property is the name of the rule,
 *   which is useful for error reporting purposes.
 *
 * The name, severity, selector, pattern and function arguments to the Rule()
 * constructor are optional, but you may not omit both the selector and the
 * pattern. If you do not specify a selector, a default selector that matches
 * any node of type "text" will be used. If you do not specify a pattern, then
 * any node that matches the selector will be assumed to match the pattern as
 * well. If you don't pass a function as the fourth argument to the Rule()
 * constructor, then you must pass an error message string instead. If you do
 * this, you'll get a default function that unconditionally returns an object
 * that includes the error message and the start and end indexes of the
 * portion of the content string that matched the pattern. If you don't pass a
 * function in the fifth parameter, the rule will be applied in any context.
 *
 * One of the design goals of this Rule class is to allow simple lint rules to
 * be described in JSON files without any JavaScript code. So in addition to
 * the Rule() constructor, the class also defines a Rule.makeRule() factory
 * method. This method takes a single object as its argument and expects the
 * object to have four string properties. The `name` property is passed as the
 * first argument to the Rule() construtctor.  The optional `selector`
 * property, if specified, is passed to Selector.parse() and the resulting
 * Selector object is used as the second argument to Rule().  The optional
 * `pattern` property is converted to a RegExp before being passed as the
 * third argument to Rule(). (See Rule.makePattern() for details on the string
 * to RegExp conversion). Finally, the `message` property specifies an error
 * message that is passed as the final argument to Rule(). You can also use a
 * real RegExp as the value of the `pattern` property or define a custom lint
 * function on the `lint` property instead of setting the `message`
 * property. Doing either of these things means that your rule description can
 * no longer be saved in a JSON file, however.
 *
 * For example, here are two lint rules defined with Rule.makeRule():
 *
 *    let nestedLists = Rule.makeRule({
 *        name: "nested-lists",
 *        selector: "list list",
 *        message: `Nested lists:
 *    nested lists are hard to read on mobile devices;
 *    do not use additional indentation.`,
 *    });
 *
 *    let longParagraph = Rule.makeRule({
 *        name: "long-paragraph",
 *        selector: "paragraph",
 *        pattern: /^.{501,}/,
 *        lint: function(state, content, nodes, match) {
 *            return `Paragraph too long:
 *    This paragraph is ${content.length} characters long.
 *    Shorten it to 500 characters or fewer.`;
 *        },
 *    });
 *
 * Certain advanced lint rules need additional information about the content
 * being linted in order to detect lint. For example, a rule to check for
 * whitespace at the start and end of the URL for an image can't use the
 * information in the node or content arguments because the markdown parser
 * strips leading and trailing whitespace when parsing. (Nevertheless, these
 * spaces have been a practical problem for our content translation process so
 * in order to check for them, a lint rule needs access to the original
 * unparsed source text. Similarly, there are various lint rules that check
 * widget usage. For example, it is easy to write a lint rule to ensure that
 * images have alt text for images encoded in markdown. But when images are
 * added to our content via an image widget we also want to be able to check
 * for alt text. In order to do this, the lint rule needs to be able to look
 * widgets up by name in the widgets object associated with the parse tree.
 *
 * In order to support advanced linting rules like these, the check() method
 * takes a context object as its optional fourth argument, and passes this
 * object on to the lint function of each rule. Rules that require extra
 * context should not assume that they will always get it, and should verify
 * that the necessary context has been supplied before using it. Currently the
 * "content" property of the context object is the unparsed source text if
 * available, and the "widgets" property of the context object is the widget
 * object associated with that content string in the JSON object that defines
 * the Perseus article or exercise that is being linted.
 */
/**
 * A Rule object describes a Perseus lint rule. See the comment at the top of
 * this file for detailed description.
 */
class Rule {
  // The name of the rule
  // The severity of the rule
  // The specified selector or the DEFAULT_SELECTOR
  // A regular expression if one was specified
  // The lint-testing function or a default
  // Checks to see if we should apply a rule or not
  // The error message for use with the default function

  // The comment at the top of this file has detailed docs for
  // this constructor and its arguments
  constructor(name, severity, selector, pattern, lint, applies) {
    this.name = void 0;
    this.severity = void 0;
    this.selector = void 0;
    this.pattern = void 0;
    this.lint = void 0;
    this.applies = void 0;
    this.message = void 0;
    if (!selector && !pattern) {
      throw new PerseusError("Lint rules must have a selector or pattern", Errors.InvalidInput, {
        metadata: {
          name
        }
      });
    }
    this.name = name || "unnamed rule";
    this.severity = severity || Rule.Severity.BULK_WARNING;
    this.selector = selector || Rule.DEFAULT_SELECTOR;
    this.pattern = pattern || null;

    // If we're called with an error message instead of a function then
    // use a default function that will return the message.
    if (typeof lint === "function") {
      this.lint = lint;
      this.message = null;
    } else {
      this.lint = (...args) => this._defaultLintFunction(...args);
      this.message = lint;
    }
    this.applies = applies || function () {
      return true;
    };
  }

  // A factory method for use with rules described in JSON files
  // See the documentation at the start of this file for details.
  static makeRule(options) {
    return new Rule(options.name, options.severity, options.selector ? Selector.parse(options.selector) : null, Rule.makePattern(options.pattern), options.lint || options.message, options.applies);
  }

  // Check the node n to see if it violates this lint rule.  A return value
  // of false means there is no lint.  A returned object indicates a lint
  // error. See the documentation at the top of this file for details.
  check(node, traversalState, content, context) {
    // First, see if we match the selector.
    // If no selector was passed to the constructor, we use a
    // default selector that matches text nodes.
    const selectorMatch = this.selector.match(traversalState);

    // If the selector did not match, then we're done
    if (!selectorMatch) {
      return null;
    }

    // If the selector matched, then see if the pattern matches
    let patternMatch;
    if (this.pattern) {
      patternMatch = content.match(this.pattern);
    } else {
      // If there is no pattern, then just match all of the content.
      // Use a fake RegExp match object to represent this default match.
      patternMatch = Rule.FakePatternMatch(content, content, 0);
    }

    // If there was a pattern and it didn't match, then we're done
    if (!patternMatch) {
      return null;
    }
    try {
      // If we get here, then the selector and pattern have matched
      // so now we call the lint function to see if there is lint.
      const error = this.lint(traversalState, content, selectorMatch, patternMatch, context);
      if (!error) {
        return null; // No lint; we're done
      }

      if (typeof error === "string") {
        // If the lint function returned a string we assume it
        // applies to the entire content of the node and return it.
        return {
          rule: this.name,
          severity: this.severity,
          message: error,
          start: 0,
          end: content.length
        };
      }
      // If the lint function returned an object, then we just
      // add the rule name to the message, start and end.
      return {
        rule: this.name,
        severity: this.severity,
        message: error.message,
        start: error.start,
        end: error.end
      };
    } catch (e) {
      // If the lint function threw an exception we handle that as
      // a special type of lint. We want the user to see the lint
      // warning in this case (even though it is out of their control)
      // so that the bug gets reported. Otherwise we'd never know that
      // a rule was failing.
      return {
        rule: "lint-rule-failure",
        message: `Exception in rule ${this.name}: ${e.message}
Stack trace:
${e.stack}`,
        start: 0,
        end: content.length
      };
    }
  }

  // This internal method is the default lint function that we use when a
  // rule is defined without a function. This is useful for rules where the
  // selector and/or pattern match are enough to indicate lint. This
  // function unconditionally returns the error message that was passed in
  // place of a function, but also adds start and end properties that
  // specify which particular portion of the node content matched the
  // pattern.
  _defaultLintFunction(state, content, selectorMatch, patternMatch, context) {
    return {
      message: this.message || "",
      start: patternMatch.index,
      end: patternMatch.index + patternMatch[0].length
    };
  }

  // The makeRule() factory function uses this static method to turn its
  // argument into a RegExp. If the argument is already a RegExp, we just
  // return it. Otherwise, we compile it into a RegExp and return that.
  // The reason this is necessary is that Rule.makeRule() is designed for
  // use with data from JSON files and JSON files can't include RegExp
  // literals. Strings passed to this function do not need to be delimited
  // with / characters unless you want to include flags for the RegExp.
  //
  // Examples:
  //
  //   input ""        ==> output null
  //   input /foo/     ==> output /foo/
  //   input "foo"     ==> output /foo/
  //   input "/foo/i"  ==> output /foo/i
  //
  static makePattern(pattern) {
    if (!pattern) {
      return null;
    }
    if (pattern instanceof RegExp) {
      return pattern;
    }
    if (pattern[0] === "/") {
      const lastSlash = pattern.lastIndexOf("/");
      const expression = pattern.substring(1, lastSlash);
      const flags = pattern.substring(lastSlash + 1);
      // @ts-expect-error [FEI-5003] - TS2713 - Cannot access 'RegExp.flags' because 'RegExp' is a type, but not a namespace. Did you mean to retrieve the type of the property 'flags' in 'RegExp' with 'RegExp["flags"]'?
      return new RegExp(expression, flags);
    }
    return new RegExp(pattern);
  }

  // This static method returns an string array with index and input
  // properties added, in order to simulate the return value of the
  // String.match() method. We use it when a Rule has no pattern and we
  // want to simulate a match on the entire content string.
  static FakePatternMatch(input, match, index) {
    const result = [match];
    result.index = index;
    result.input = input;
    return result;
  }
}
Rule.DEFAULT_SELECTOR = void 0;
Rule.Severity = {
  ERROR: 1,
  WARNING: 2,
  GUIDELINE: 3,
  BULK_WARNING: 4
};
Rule.DEFAULT_SELECTOR = Selector.parse("text");

/* eslint-disable no-useless-escape */
// Return the portion of a URL between // and /. This is the authority
// portion which is usually just the hostname, but may also include
// a username, password or port. We don't strip those things out because
// we typically want to reject any URL that includes them
const HOSTNAME = /\/\/([^\/]+)/;

// Return the hostname of the URL, with any "www." prefix removed.
// If this is a relative URL with no hostname, return an empty string.
function getHostname(url) {
  if (!url) {
    return "";
  }
  const match = url.match(HOSTNAME);
  return match ? match[1] : "";
}

var AbsoluteUrl = Rule.makeRule({
  name: "absolute-url",
  severity: Rule.Severity.GUIDELINE,
  selector: "link, image",
  lint: function (state, content, nodes, match) {
    const url = nodes[0].target;
    const hostname = getHostname(url);
    if (hostname === "khanacademy.org" || hostname.endsWith(".khanacademy.org")) {
      return `Don't use absolute URLs:
When linking to KA content or images, omit the
https://www.khanacademy.org URL prefix.
Use a relative URL beginning with / instead.`;
    }
  }
});

var BlockquotedMath = Rule.makeRule({
  name: "blockquoted-math",
  severity: Rule.Severity.WARNING,
  selector: "blockQuote math, blockQuote blockMath",
  message: `Blockquoted math:
math should not be indented.`
});

var BlockquotedWidget = Rule.makeRule({
  name: "blockquoted-widget",
  severity: Rule.Severity.WARNING,
  selector: "blockQuote widget",
  message: `Blockquoted widget:
widgets should not be indented.`
});

/* eslint-disable no-useless-escape */
var DoubleSpacingAfterTerminal = Rule.makeRule({
  name: "double-spacing-after-terminal",
  severity: Rule.Severity.BULK_WARNING,
  selector: "paragraph",
  pattern: /[.!\?] {2}/i,
  message: `Use a single space after a sentence-ending period, or
any other kind of terminal punctuation.`
});

var ExtraContentSpacing = Rule.makeRule({
  name: "extra-content-spacing",
  selector: "paragraph",
  pattern: /\s+$/,
  applies: function (context) {
    return context.contentType === "article";
  },
  message: `No extra whitespace at the end of content blocks.`
});

var HeadingLevel1 = Rule.makeRule({
  name: "heading-level-1",
  severity: Rule.Severity.WARNING,
  selector: "heading",
  lint: function (state, content, nodes, match) {
    if (nodes[0].level === 1) {
      return `Don't use level-1 headings:
Begin headings with two or more # characters.`;
    }
  }
});

var HeadingLevelSkip = Rule.makeRule({
  name: "heading-level-skip",
  severity: Rule.Severity.WARNING,
  selector: "heading ~ heading",
  lint: function (state, content, nodes, match) {
    const currentHeading = nodes[1];
    const previousHeading = nodes[0];
    // A heading can have a level less than, the same as
    // or one more than the previous heading. But going up
    // by 2 or more levels is not right
    if (currentHeading.level > previousHeading.level + 1) {
      return `Skipped heading level:
this heading is level ${currentHeading.level} but
the previous heading was level ${previousHeading.level}`;
    }
  }
});

var HeadingSentenceCase = Rule.makeRule({
  name: "heading-sentence-case",
  severity: Rule.Severity.GUIDELINE,
  selector: "heading",
  pattern: /^\W*[a-z]/,
  // first letter is lowercase
  message: `First letter is lowercase:
the first letter of a heading should be capitalized.`
});

// These are 3-letter and longer words that we would not expect to be
// capitalized even in a title-case heading.  See
// http://blog.apastyle.org/apastyle/2012/03/title-case-and-sentence-case-capitalization-in-apa-style.html
const littleWords = {
  and: true,
  nor: true,
  but: true,
  the: true,
  for: true
};
function isCapitalized(word) {
  const c = word[0];
  return c === c.toUpperCase();
}
var HeadingTitleCase = Rule.makeRule({
  name: "heading-title-case",
  severity: Rule.Severity.GUIDELINE,
  selector: "heading",
  pattern: /[^\s:]\s+[A-Z]+[a-z]/,
  locale: "en",
  lint: function (state, content, nodes, match) {
    // We want to assert that heading text is in sentence case, not
    // title case. The pattern above requires a capital letter at the
    // start of the heading and allows them after a colon, or in
    // acronyms that are all capitalized.
    //
    // But we can't warn just because the pattern matched because
    // proper nouns are also allowed bo be capitalized. We're not
    // going to do dictionary lookup to check for proper nouns, so
    // we try a heuristic: if the title is more than 3 words long
    // and if all the words are capitalized or are on the list of
    // words that don't get capitalized, then we'll assume that
    // the heading is incorrectly in title case and will warn.
    // But if there is at least one non-capitalized long word then
    // we're not in title case and we should not warn.
    //
    // TODO(davidflanagan): if this rule causes a lot of false
    // positives, we should tweak it or remove it. Note that it will
    // fail for headings like "World War II in Russia"
    //
    // TODO(davidflanagan): This rule is specific to English.
    // It is marked with a locale property above, but that is NYI
    //
    // for APA style rules for title case

    const heading = content.trim();
    let words = heading.split(/\s+/);

    // Remove the first word and the little words
    words.shift();
    words = words.filter(
    // eslint-disable-next-line no-prototype-builtins
    w => w.length > 2 && !littleWords.hasOwnProperty(w));

    // If there are at least 3 remaining words and all
    // are capitalized, then the heading is in title case.
    if (words.length >= 3 && words.every(w => isCapitalized(w))) {
      return `Title-case heading:
This heading appears to be in title-case, but should be sentence-case.
Only capitalize the first letter and proper nouns.`;
    }
  }
});

var ImageAltText = Rule.makeRule({
  name: "image-alt-text",
  severity: Rule.Severity.WARNING,
  selector: "image",
  lint: function (state, content, nodes, match) {
    const image = nodes[0];
    if (!image.alt || !image.alt.trim()) {
      return `Images should have alt text:
for accessibility, all images should have alt text.
Specify alt text inside square brackets after the !.`;
    }
    if (image.alt.length < 8) {
      return `Images should have alt text:
for accessibility, all images should have descriptive alt text.
This image's alt text is only ${image.alt.length} characters long.`;
    }
  }
});

var ImageInTable = Rule.makeRule({
  name: "image-in-table",
  severity: Rule.Severity.BULK_WARNING,
  selector: "table image",
  message: `Image in table:
do not put images inside of tables.`
});

var ImageSpacesAroundUrls = Rule.makeRule({
  name: "image-spaces-around-urls",
  severity: Rule.Severity.ERROR,
  selector: "image",
  lint: function (state, content, nodes, match, context) {
    const image = nodes[0];
    const url = image.target;

    // The markdown parser strips leading and trailing spaces for us,
    // but they're still a problem for our translation process, so
    // we need to go check for them in the unparsed source string
    // if we have it.
    if (context && context.content) {
      // Find the url in the original content and make sure that the
      // character before is '(' and the character after is ')'
      const index = context.content.indexOf(url);
      if (index === -1) {
        // It is not an error if we didn't find it.
        return;
      }
      if (context.content[index - 1] !== "(" || context.content[index + url.length] !== ")") {
        return `Whitespace before or after image url:
For images, don't include any space or newlines after '(' or before ')'.
Whitespace in image URLs causes translation difficulties.`;
      }
    }
  }
});

// Normally we have one rule per file. But since our selector class
// can't match specific widget types directly, this rule implements
// a number of image widget related rules in one place. This should
// slightly increase efficiency, but it means that if there is more
// than one problem with an image widget, the user will only see one
// problem at a time.
var ImageWidget = Rule.makeRule({
  name: "image-widget",
  severity: Rule.Severity.WARNING,
  selector: "widget",
  lint: function (state, content, nodes, match, context) {
    // This rule only looks at image widgets
    if (state.currentNode().widgetType !== "image") {
      return;
    }

    // If it can't find a definition for the widget it does nothing
    const widget = context && context.widgets && context.widgets[state.currentNode().id];
    if (!widget) {
      return;
    }

    // Make sure there is alt text
    const alt = widget.options.alt;
    if (!alt) {
      return `Images should have alt text:
for accessibility, all images should have a text description.
Add a description in the "Alt Text" box of the image widget.`;
    }

    // Make sure the alt text it is not trivial
    if (alt.trim().length < 8) {
      return `Images should have alt text:
for accessibility, all images should have descriptive alt text.
This image's alt text is only ${alt.trim().length} characters long.`;
    }

    // Make sure there is no math in the caption
    if (widget.options.caption && widget.options.caption.match(/[^\\]\$/)) {
      return `No math in image captions:
Don't include math expressions in image captions.`;
    }
  }
});

var LinkClickHere = Rule.makeRule({
  name: "link-click-here",
  severity: Rule.Severity.WARNING,
  selector: "link",
  pattern: /click here/i,
  message: `Inappropriate link text:
Do not use the words "click here" in links.`
});

var LongParagraph = Rule.makeRule({
  name: "long-paragraph",
  severity: Rule.Severity.GUIDELINE,
  selector: "paragraph",
  pattern: /^.{501,}/,
  lint: function (state, content, nodes, match) {
    return `Paragraph too long:
This paragraph is ${content.length} characters long.
Shorten it to 500 characters or fewer.`;
  }
});

var MathAdjacent = Rule.makeRule({
  name: "math-adjacent",
  severity: Rule.Severity.WARNING,
  selector: "blockMath+blockMath",
  message: `Adjacent math blocks:
combine the blocks between \\begin{align} and \\end{align}`
});

var MathAlignExtraBreak = Rule.makeRule({
  name: "math-align-extra-break",
  severity: Rule.Severity.WARNING,
  selector: "blockMath",
  pattern: /(\\{2,})\s*\\end{align}/,
  message: `Extra space at end of block:
Don't end an align block with backslashes`
});

var MathAlignLinebreaks = Rule.makeRule({
  name: "math-align-linebreaks",
  severity: Rule.Severity.WARNING,
  selector: "blockMath",
  // Match any align block with double backslashes in it
  // Use [\s\S]* instead of .* so we match newlines as well.
  pattern: /\\begin{align}[\s\S]*\\\\[\s\S]+\\end{align}/,
  // Look for double backslashes and ensure that they are
  // followed by optional space and another pair of backslashes.
  // Note that this rule can't know where line breaks belong so
  // it can't tell whether backslashes are completely missing. It just
  // enforces that you don't have the wrong number of pairs of backslashes.
  lint: function (state, content, nodes, match) {
    let text = match[0];
    while (text.length) {
      const index = text.indexOf("\\\\");
      if (index === -1) {
        // No more backslash pairs, so we found no lint
        return null;
      }
      text = text.substring(index + 2);

      // Now we expect to find optional spaces, another pair of
      // backslashes, and more optional spaces not followed immediately
      // by another pair of backslashes.
      const nextpair = text.match(/^\s*\\\\\s*(?!\\\\)/);

      // If that does not match then we either have too few or too
      // many pairs of backslashes.
      if (!nextpair) {
        return "Use four backslashes between lines of an align block";
      }

      // If it did match, then, shorten the string and continue looping
      // (because a single align block may have multiple lines that
      // all must be separated by two sets of double backslashes).
      text = text.substring(nextpair[0].length);
    }
  }
});

var MathEmpty = Rule.makeRule({
  name: "math-empty",
  severity: Rule.Severity.WARNING,
  selector: "math, blockMath",
  pattern: /^$/,
  message: "Empty math: don't use $$ in your markdown."
});

var MathFontSize = Rule.makeRule({
  name: "math-font-size",
  severity: Rule.Severity.GUIDELINE,
  selector: "math, blockMath",
  pattern: /\\(tiny|Tiny|small|large|Large|LARGE|huge|Huge|scriptsize|normalsize)\s*{/,
  message: `Math font size:
Don't change the default font size with \\Large{} or similar commands`
});

var MathFrac = Rule.makeRule({
  name: "math-frac",
  severity: Rule.Severity.GUIDELINE,
  selector: "math, blockMath",
  pattern: /\\frac[ {]/,
  message: "Use \\dfrac instead of \\frac in your math expressions."
});

var MathNested = Rule.makeRule({
  name: "math-nested",
  severity: Rule.Severity.ERROR,
  selector: "math, blockMath",
  pattern: /\\text{[^$}]*\$[^$}]*\$[^}]*}/,
  message: `Nested math:
Don't nest math expressions inside \\text{} blocks`
});

var MathStartsWithSpace = Rule.makeRule({
  name: "math-starts-with-space",
  severity: Rule.Severity.GUIDELINE,
  selector: "math, blockMath",
  pattern: /^\s*(~|\\qquad|\\quad|\\,|\\;|\\:|\\ |\\!|\\enspace|\\phantom)/,
  message: `Math starts with space:
math should not be indented. Do not begin math expressions with
LaTeX space commands like ~, \\;, \\quad, or \\phantom`
});

var MathTextEmpty = Rule.makeRule({
  name: "math-text-empty",
  severity: Rule.Severity.WARNING,
  selector: "math, blockMath",
  pattern: /\\text{\s*}/,
  message: "Empty \\text{} block in math expression"
});

// Because no selector is specified, this rule only applies to text nodes.
// Math and code hold their content directly and do not have text nodes
// beneath them (unlike the HTML DOM) so this rule automatically does not
// apply inside $$ or ``.
var MathWithoutDollars = Rule.makeRule({
  name: "math-without-dollars",
  severity: Rule.Severity.GUIDELINE,
  pattern: /\\\w+{[^}]*}|{|}/,
  message: `This looks like LaTeX:
did you mean to put it inside dollar signs?`
});

var NestedLists = Rule.makeRule({
  name: "nested-lists",
  severity: Rule.Severity.WARNING,
  selector: "list list",
  message: `Nested lists:
nested lists are hard to read on mobile devices;
do not use additional indentation.`
});

var Profanity = Rule.makeRule({
  name: "profanity",
  // This list could obviously be expanded a lot, but I figured we
  // could start with https://en.wikipedia.org/wiki/Seven_dirty_words
  pattern: /\b(shit|piss|fuck|cunt|cocksucker|motherfucker|tits)\b/i,
  message: "Avoid profanity"
});

var TableMissingCells = Rule.makeRule({
  name: "table-missing-cells",
  severity: Rule.Severity.WARNING,
  selector: "table",
  lint: function (state, content, nodes, match) {
    const table = nodes[0];
    const headerLength = table.header.length;
    const rowLengths = table.cells.map(r => r.length);
    for (let r = 0; r < rowLengths.length; r++) {
      if (rowLengths[r] !== headerLength) {
        return `Table rows don't match header:
The table header has ${headerLength} cells, but
Row ${r + 1} has ${rowLengths[r]} cells.`;
      }
    }
  }
});

// Because no selector is specified, this rule only applies to text nodes.
// Math and code hold their content directly and do not have text nodes
// beneath them (unlike the HTML DOM) so this rule automatically does not
// apply inside $$ or ``.
var UnbalancedCodeDelimiters = Rule.makeRule({
  name: "unbalanced-code-delimiters",
  severity: Rule.Severity.ERROR,
  pattern: /[`~]+/,
  message: `Unbalanced code delimiters:
code blocks should begin and end with the same type and number of delimiters`
});

var UnescapedDollar = Rule.makeRule({
  name: "unescaped-dollar",
  severity: Rule.Severity.ERROR,
  selector: "unescapedDollar",
  message: `Unescaped dollar sign:
Dollar signs must appear in pairs or be escaped as \\$`
});

var WidgetInTable = Rule.makeRule({
  name: "widget-in-table",
  severity: Rule.Severity.BULK_WARNING,
  selector: "table widget",
  message: `Widget in table:
do not put widgets inside of tables.`
});

// TODO(davidflanagan):
var AllRules = [AbsoluteUrl, BlockquotedMath, BlockquotedWidget, DoubleSpacingAfterTerminal, ExtraContentSpacing, HeadingLevel1, HeadingLevelSkip, HeadingSentenceCase, HeadingTitleCase, ImageAltText, ImageInTable, LinkClickHere, LongParagraph, MathAdjacent, MathAlignExtraBreak, MathAlignLinebreaks, MathEmpty, MathFontSize, MathFrac, MathNested, MathStartsWithSpace, MathTextEmpty, NestedLists, TableMissingCells, UnescapedDollar, WidgetInTable, Profanity, MathWithoutDollars, UnbalancedCodeDelimiters, ImageSpacesAroundUrls, ImageWidget];

/**
 * TreeTransformer is a class for traversing and transforming trees.  Create a
 * TreeTransformer by passing the root node of the tree to the
 * constructor. Then traverse that tree by calling the traverse() method. The
 * argument to traverse() is a callback function that will be called once for
 * each node in the tree. This is a post-order depth-first traversal: the
 * callback is not called on the a way down, but on the way back up. That is,
 * the children of a node are traversed before the node itself is.
 *
 * The traversal callback function is passed three arguments, the node being
 * traversed, a TraversalState object, and the concatentated text content of
 * the node and all of its descendants. The TraversalState object is the most
 * most interesting argument: it has methods for querying the ancestors and
 * siblings of the node, and for deleting or replacing the node. These
 * transformation methods are why this class is a tree transformer and not
 * just a tree traverser.
 *
 * A typical tree traversal looks like this:
 *
 *   new TreeTransformer(root).traverse((node, state, content) => {
 *       let parent = state.parent();
 *       let previous = state.previousSibling();
 *       // etc.
 *   });
 *
 * The traverse() method descends through nodes and arrays of nodes and calls
 * the traverse callback on each node on the way back up to the root of the
 * tree. (Note that it only calls the callback on the nodes themselves, not
 * any arrays that contain nodes.) A node is loosely defined as any object
 * with a string-valued `type` property. Objects that do not have a type
 * property are assumed to not be part of the tree and are not traversed. When
 * traversing an array, all elements of the array are examined, and any that
 * are nodes or arrays are recursively traversed. When traversing a node, all
 * properties of the object are examined and any node or array values are
 * recursively traversed.  In typical parse trees, the children of a node are
 * in a `children` or `content` array, but this class is designed to handle
 * more general trees.  The Perseus markdown parser, for example, produces
 * nodes of type "table" that have children in the `header` and `cells`
 * properties.
 *
 * CAUTION: the traverse() method does not make any attempt to detect
 * cycles. If you call it on a cyclic graph instead of a tree, it will cause
 * infinite recursion (or, more likely, a stack overflow).
 *
 * TODO(davidflanagan): it probably wouldn't be hard to detect cycles: when
 * pushing a new node onto the containers stack we could just check that it
 * isn't already there.
 *
 * If a node has a text-valued `content` property, it is taken to be the
 * plain-text content of the node. The traverse() method concatenates these
 * content strings and passes them to the traversal callback for each
 * node. This means that the callback has access the full text content of its
 * node and all of the nodes descendants.
 *
 * See the TraversalState class for more information on what information and
 * methods are available to the traversal callback.
 **/

// TreeNode is the type of a node in a parse tree. The only real requirement is
// that every node has a string-valued `type` property

// This is the TreeTransformer class described in detail at the
// top of this file.
class TreeTransformer {
  // To create a tree transformer, just pass the root node of the tree
  constructor(root) {
    this.root = void 0;
    this.root = root;
  }

  // A utility function for determing whether an arbitrary value is a node
  static isNode(n) {
    return n && typeof n === "object" && typeof n.type === "string";
  }

  // Determines whether a value is a node with type "text" and has
  // a text-valued `content` property.
  static isTextNode(n) {
    return TreeTransformer.isNode(n) && n.type === "text" && typeof n.content === "string";
  }

  // This is the main entry point for the traverse() method. See the comment
  // at the top of this file for a detailed description. Note that this
  // method just creates a new TraversalState object to use for this
  // traversal and then invokes the internal _traverse() method to begin the
  // recursion.
  traverse(f) {
    this._traverse(this.root, new TraversalState(this.root), f);
  }

  // Do a post-order traversal of node and its descendants, invoking the
  // callback function f() once for each node and returning the concatenated
  // text content of the node and its descendants. f() is passed three
  // arguments: the current node, a TraversalState object representing the
  // current state of the traversal, and a string that holds the
  // concatenated text of the node and its descendants.
  //
  // This private method holds all the traversal logic and implementation
  // details. Note that this method uses the TraversalState object to store
  // information about the structure of the tree.
  _traverse(n, state, f) {
    let content = "";
    if (TreeTransformer.isNode(n)) {
      // If we were called on a node object, then we handle it
      // this way.
      const node = n; // safe cast; we just tested

      // Put the node on the stack before recursing on its children
      state._containers.push(node);
      state._ancestors.push(node);

      // Record the node's text content if it has any.
      // Usually this is for nodes with a type property of "text",
      // but other nodes types like "math" may also have content.
      // @ts-expect-error [FEI-5003] - TS2339 - Property 'content' does not exist on type 'TreeNode'.
      if (typeof node.content === "string") {
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'content' does not exist on type 'TreeNode'.
        content = node.content;
      }

      // Recurse on the node. If there was content above, then there
      // probably won't be any children to recurse on, but we check
      // anyway.
      //
      // If we wanted to make the traversal completely specific to the
      // actual Perseus parse trees that we'll be dealing with we could
      // put a switch statement here to dispatch on the node type
      // property with specific recursion steps for each known type of
      // node.
      const keys = Object.keys(node);
      keys.forEach(key => {
        // Never recurse on the type property
        if (key === "type") {
          return;
        }
        // Ignore properties that are null or primitive and only
        // recurse on objects and arrays. Note that we don't do a
        // isNode() check here. That is done in the recursive call to
        // _traverse(). Note that the recursive call on each child
        // returns the text content of the child and we add that
        // content to the content for this node. Also note that we
        // push the name of the property we're recursing over onto a
        // TraversalState stack.
        const value = node[key];
        if (value && typeof value === "object") {
          state._indexes.push(key);
          content += this._traverse(value, state, f);
          state._indexes.pop();
        }
      });

      // Restore the stacks after recursing on the children
      state._currentNode = state._ancestors.pop();
      state._containers.pop();

      // And finally call the traversal callback for this node.  Note
      // that this is post-order traversal. We call the callback on the
      // way back up the tree, not on the way down.  That way we already
      // know all the content contained within the node.
      f(node, state, content);
    } else if (Array.isArray(n)) {
      // If we were called on an array instead of a node, then
      // this is the code we use to recurse.
      const nodes = n;

      // Push the array onto the stack. This will allow the
      // TraversalState object to locate siblings of this node.
      state._containers.push(nodes);

      // Now loop through this array and recurse on each element in it.
      // Before recursing on an element, we push its array index on a
      // TraversalState stack so that the TraversalState sibling methods
      // can work. Note that TraversalState methods can alter the length
      // of the array, and change the index of the current node, so we
      // are careful here to test the array length on each iteration and
      // to reset the index when we pop the stack. Also note that we
      // concatentate the text content of the children.
      let index = 0;
      while (index < nodes.length) {
        state._indexes.push(index);
        content += this._traverse(nodes[index], state, f);
        // Casting to convince TypeScript that this is a number
        index = state._indexes.pop() + 1;
      }

      // Pop the array off the stack. Note, however, that we do not call
      // the traversal callback on the array. That function is only
      // called for nodes, not arrays of nodes.
      state._containers.pop();
    }

    // The _traverse() method always returns the text content of
    // this node and its children. This is the one piece of state that
    // is not tracked in the TraversalState object.
    return content;
  }
}

// An instance of this class is passed to the callback function for
// each node traversed. The class itself is not exported, but its
// methods define the API available to the traversal callback.

/**
 * This class represents the state of a tree traversal. An instance is created
 * by the traverse() method of the TreeTransformer class to maintain the state
 * for that traversal, and the instance is passed to the traversal callback
 * function for each node that is traversed. This class is not intended to be
 * instantiated directly, but is exported so that its type can be used for
 * type annotaions.
 **/
class TraversalState {
  // The root node of the tree being traversed

  // These are internal state properties. Use the accessor methods defined
  // below instead of using these properties directly. Note that the
  // _containers and _indexes stacks can have two different types of
  // elements, depending on whether we just recursed on an array or on a
  // node. This is hard for TypeScript to deal with, so you'll see a number of
  // type casts through the any type when working with these two properties.

  // The constructor just stores the root node and creates empty stacks.
  constructor(root) {
    this.root = void 0;
    this._currentNode = void 0;
    this._containers = void 0;
    this._indexes = void 0;
    this._ancestors = void 0;
    this.root = root;

    // When the callback is called, this property will hold the
    // node that is currently being traversed.
    this._currentNode = null;

    // This is a stack of the objects and arrays that we've
    // traversed through before reaching the currentNode.
    // It is different than the ancestors array.
    this._containers = new Stack();

    // This stack has the same number of elements as the _containers
    // stack. The last element of this._indexes[] is the index of
    // the current node in the object or array that is the last element
    // of this._containers[]. If the last element of this._containers[] is
    // an array, then the last element of this stack will be a number.
    // Otherwise if the last container is an object, then the last index
    // will be a string property name.
    this._indexes = new Stack();

    // This is a stack of the ancestor nodes of the current one.
    // It is different than the containers[] stack because it only
    // includes nodes, not arrays.
    this._ancestors = new Stack();
  }

  /**
   * Return the current node in the traversal. Any time the traversal
   * callback is called, this method will return the name value as the
   * first argument to the callback.
   */
  currentNode() {
    return this._currentNode || this.root;
  }

  /**
   * Return the parent of the current node, if there is one, or null.
   */
  parent() {
    return this._ancestors.top();
  }

  /**
   * Return an array of ancestor nodes. The first element of this array is
   * the same as this.parent() and the last element is the root node. If we
   * are currently at the root node, the the returned array will be empty.
   * This method makes a copy of the internal state, so modifications to the
   * returned array have no effect on the traversal.
   */
  ancestors() {
    return this._ancestors.values();
  }

  /**
   * Return the next sibling of this node, if it has one, or null otherwise.
   */
  nextSibling() {
    const siblings = this._containers.top();

    // If we're at the root of the tree or if the parent is an
    // object instead of an array, then there are no siblings.
    if (!siblings || !Array.isArray(siblings)) {
      return null;
    }

    // The top index is a number because the top container is an array
    const index = this._indexes.top();
    if (siblings.length > index + 1) {
      return siblings[index + 1];
    }
    return null; // There is no next sibling
  }

  /**
   * Return the previous sibling of this node, if it has one, or null
   * otherwise.
   */
  previousSibling() {
    const siblings = this._containers.top();

    // If we're at the root of the tree or if the parent is an
    // object instead of an array, then there are no siblings.
    if (!siblings || !Array.isArray(siblings)) {
      return null;
    }

    // The top index is a number because the top container is an array
    const index = this._indexes.top();
    if (index > 0) {
      return siblings[index - 1];
    }
    return null; // There is no previous sibling
  }

  /**
   * Remove the next sibling node (if there is one) from the tree.  Returns
   * the removed sibling or null. This method makes it easy to traverse a
   * tree and concatenate adjacent text nodes into a single node.
   */
  removeNextSibling() {
    const siblings = this._containers.top();
    if (siblings && Array.isArray(siblings)) {
      // top index is a number because top container is an array
      const index = this._indexes.top();
      if (siblings.length > index + 1) {
        return siblings.splice(index + 1, 1)[0];
      }
    }
    return null;
  }

  /**
   * Replace the current node in the tree with the specified nodes.  If no
   * nodes are passed, this is a node deletion. If one node (or array) is
   * passed, this is a 1-for-1 replacement. If more than one node is passed
   * then this is a combination of deletion and insertion.  The new node or
   * nodes will not be traversed, so this method can safely be used to
   * reparent the current node node beneath a new parent.
   *
   * This method throws an error if you attempt to replace the root node of
   * the tree.
   */
  replace(...replacements) {
    const parent = this._containers.top();
    if (!parent) {
      throw new PerseusError("Can't replace the root of the tree", Errors.Internal);
    }

    // The top of the container stack is either an array or an object
    // and the top of the indexes stack is a corresponding array index
    // or object property. This is hard for TypeScript, so we have to do some
    // unsafe casting and be careful when we use which cast version
    if (Array.isArray(parent)) {
      const index = this._indexes.top();
      // For an array parent we just splice the new nodes in
      parent.splice(index, 1, ...replacements);
      // Adjust the index to account for the changed array length.
      // We don't want to traverse any of the newly inserted nodes.
      this._indexes.pop();
      this._indexes.push(index + replacements.length - 1);
    } else {
      const property = this._indexes.top();
      // For an object parent we care how many new nodes there are
      if (replacements.length === 0) {
        // Deletion
        delete parent[property];
      } else if (replacements.length === 1) {
        // Replacement
        parent[property] = replacements[0];
      } else {
        // Replace one node with an array of nodes
        parent[property] = replacements;
      }
    }
  }

  /**
   * Returns true if the current node has a previous sibling and false
   * otherwise. If this method returns false, then previousSibling() will
   * return null, and goToPreviousSibling() will throw an error.
   */
  hasPreviousSibling() {
    return Array.isArray(this._containers.top()) && this._indexes.top() > 0;
  }

  /**
   * Modify this traversal state object to have the state it would have had
   * when visiting the previous sibling. Note that you may want to use
   * clone() to make a copy before modifying the state object like this.
   * This mutator method is not typically used during ordinary tree
   * traversals, but is used by the Selector class for matching multi-node
   * selectors.
   */
  goToPreviousSibling() {
    if (!this.hasPreviousSibling()) {
      throw new PerseusError("goToPreviousSibling(): node has no previous sibling", Errors.Internal);
    }
    this._currentNode = this.previousSibling();
    // Since we know that we have a previous sibling, we know that
    // the value on top of the stack is a number, but we have to do
    // this unsafe cast because TypeScript doesn't know that.
    const index = this._indexes.pop();
    this._indexes.push(index - 1);
  }

  /**
   * Returns true if the current node has an ancestor and false otherwise.
   * If this method returns false, then the parent() method will return
   * null and goToParent() will throw an error
   */
  hasParent() {
    return this._ancestors.size() !== 0;
  }

  /**
   * Modify this object to look like it will look when we (later) visit the
   * parent node of this node. You should not modify the instance passed to
   * the tree traversal callback. Instead, make a copy with the clone()
   * method and modify that.  This mutator method is not typically used
   * during ordinary tree traversals, but is used by the Selector class for
   * matching multi-node selectors that involve parent and ancestor
   * selectors.
   */
  goToParent() {
    if (!this.hasParent()) {
      throw new PerseusError("goToParent(): node has no ancestor", Errors.NotAllowed);
    }
    this._currentNode = this._ancestors.pop();

    // We need to pop the containers and indexes stacks at least once
    // and more as needed until we restore the invariant that
    // this._containers.top()[this.indexes.top()] === this._currentNode
    //
    while (this._containers.size() && this._containers.top()[this._indexes.top()] !== this._currentNode) {
      this._containers.pop();
      this._indexes.pop();
    }
  }

  /**
   * Return a new TraversalState object that is a copy of this one.
   * This method is useful in conjunction with the mutating methods
   * goToParent() and goToPreviousSibling().
   */
  clone() {
    const clone = new TraversalState(this.root);
    clone._currentNode = this._currentNode;
    clone._containers = this._containers.clone();
    clone._indexes = this._indexes.clone();
    clone._ancestors = this._ancestors.clone();
    return clone;
  }

  /**
   * Returns true if this TraversalState object is equal to that
   * TraversalState object, or false otherwise. This method exists
   * primarily for use by our unit tests.
   */
  equals(that) {
    return this.root === that.root && this._currentNode === that._currentNode && this._containers.equals(that._containers) && this._indexes.equals(that._indexes) && this._ancestors.equals(that._ancestors);
  }
}

/**
 * This class is an internal utility that just treats an array as a stack
 * and gives us a top() method so we don't have to write expressions like
 * `ancestors[ancestors.length-1]`. The values() method automatically
 * copies the internal array so we don't have to worry about client code
 * modifying our internal stacks. The use of this Stack abstraction makes
 * the TraversalState class simpler in a number of places.
 */
class Stack {
  constructor(array) {
    this.stack = void 0;
    this.stack = array ? array.slice(0) : [];
  }

  /** Push a value onto the stack. */
  push(v) {
    this.stack.push(v);
  }

  /** Pop a value off of the stack. */
  pop() {
    // @ts-expect-error [FEI-5003] - TS2322 - Type 'T | undefined' is not assignable to type 'T'.
    return this.stack.pop();
  }

  /** Return the top value of the stack without popping it. */
  top() {
    return this.stack[this.stack.length - 1];
  }

  /** Return a copy of the stack as an array */
  values() {
    return this.stack.slice(0);
  }

  /** Return the number of elements in the stack */
  size() {
    return this.stack.length;
  }

  /** Return a string representation of the stack */
  toString() {
    return this.stack.toString();
  }

  /** Return a shallow copy of the stack */
  clone() {
    return new Stack(this.stack);
  }

  /**
   * Compare this stack to another and return true if the contents of
   * the two arrays are the same.
   */
  equals(that) {
    if (!that || !that.stack || that.stack.length !== this.stack.length) {
      return false;
    }
    for (let i = 0; i < this.stack.length; i++) {
      if (this.stack[i] !== that.stack[i]) {
        return false;
      }
    }
    return true;
  }
}

// Define the shape of the linter context object that is passed through the
const linterContextProps = PropTypes.shape({
  contentType: PropTypes.string,
  highlightLint: PropTypes.bool,
  paths: PropTypes.arrayOf(PropTypes.string),
  stack: PropTypes.arrayOf(PropTypes.string)
});
const linterContextDefault = {
  contentType: "",
  highlightLint: false,
  paths: [],
  stack: []
};

const allLintRules = AllRules.filter(r => r.severity < Rule.Severity.BULK_WARNING);

//
// Run the Perseus linter over the specified markdown parse tree,
// with the specified context object, and
// return a (possibly empty) array of lint warning objects.  If the
// highlight argument is true, this function also modifies the parse
// tree to add "lint" nodes that can be visually rendered,
// highlighting the problems for the user. The optional rules argument
// is an array of Rule objects specifying which lint rules should be
// applied to this parse tree. When omitted, a default set of rules is used.
//
// The context object may have additional properties that some lint
// rules require:
//
//   context.content is the source content string that was parsed to create
//   the parse tree.
//
//   context.widgets is the widgets object associated
//   with the content string
//
// TODO: to make this even more general, allow the first argument to be
// a string and run the parser over it in that case? (but ignore highlight
// in that case). This would allow the one function to be used for both
// online linting and batch linting.
//
function runLinter(tree, context, highlight, rules = allLintRules) {
  const warnings = [];
  const tt = new TreeTransformer(tree);

  // The markdown parser often outputs adjacent text nodes. We
  // coalesce them before linting for efficiency and accuracy.
  tt.traverse((node, state, content) => {
    if (TreeTransformer.isTextNode(node)) {
      let next = state.nextSibling();
      while (TreeTransformer.isTextNode(next)) {
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'content' does not exist on type 'TreeNode'. | TS2533 - Object is possibly 'null' or 'undefined'. | TS2339 - Property 'content' does not exist on type 'TreeNode'.
        node.content += next.content;
        state.removeNextSibling();
        next = state.nextSibling();
      }
    }
  });

  // HTML tables are complicated, and the CSS we use in
  // ../components/lint.jsx to display lint does not work to
  // correctly position the lint indicators in the margin when the
  // lint is inside a table. So as a workaround we keep track of all
  // the lint that appears within a table and move it up to the
  // table element itself.
  //
  // It is not ideal to have to do this here,
  // but it is cleaner here than fixing up the lint during rendering
  // in perseus-markdown.jsx. If our lint display was simpler and
  // did not require indicators in the margin, this wouldn't be a
  // problem. Or, if we modified the lint display stuff so that
  // indicator positioning and tooltip display were both handled
  // with JavaScript (instead of pure CSS), then we could avoid this
  // issue too. But using JavaScript has its own downsides: there is
  // risk that the linter JavaScript would interfere with
  // widget-related Javascript.
  let tableWarnings = [];
  let insideTable = false;

  // Traverse through the nodes of the parse tree. At each node, loop
  // through the array of lint rules and check whether there is a
  // lint violation at that node.
  tt.traverse((node, state, content) => {
    const nodeWarnings = [];

    // If our rule is only designed to be tested against a particular
    // content type and we're not in that content type, we don't need to
    // consider that rule.
    const applicableRules = rules.filter(r => r.applies(context));

    // Generate a stack so we can identify our position in the tree in
    // lint rules
    const stack = [...context.stack];
    stack.push(node.type);
    const nodeContext = _extends({}, context, {
      stack: stack.join(".")
    });
    applicableRules.forEach(rule => {
      const warning = rule.check(node, state, content, nodeContext);
      if (warning) {
        // The start and end locations are relative to this
        // particular node, and so are not generally very useful.
        // TODO: When the markdown parser saves the node
        // locations in the source string then we can add
        // these numbers to that one and get and absolute
        // character range that will be useful
        if (warning.start || warning.end) {
          warning.target = content.substring(warning.start, warning.end);
        }

        // Add the warning to the list of all lint we've found
        warnings.push(warning);

        // If we're going to be highlighting lint, then we also
        // need to keep track of warnings specific to this node.
        if (highlight) {
          nodeWarnings.push(warning);
        }
      }
    });

    // If we're not highlighting lint in the tree, then we're done
    // traversing this node.
    if (!highlight) {
      return;
    }

    // If the node we are currently at is a table, and there was lint
    // inside the table, then we want to add that lint here
    if (node.type === "table") {
      if (tableWarnings.length) {
        nodeWarnings.push(...tableWarnings);
      }

      // We're not in a table anymore, and don't have to remember
      // the warnings for the table
      insideTable = false;
      tableWarnings = [];
    } else if (!insideTable) {
      // Otherwise, if we are not already inside a table, check
      // to see if we've entered one. Because this is a post-order
      // traversal we'll see the table contents before the table itself.
      // Note that once we're inside the table, we don't have to
      // do this check each time... We can just wait until we ascend
      // up to the table, then we'll know we're out of it.
      insideTable = state.ancestors().some(n => n.type === "table");
    }

    // If we are inside a table and there were any warnings on
    // this node, then we need to save the warnings for display
    // on the table itself
    if (insideTable && nodeWarnings.length) {
      // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'any' is not assignable to parameter of type 'never'.
      tableWarnings.push(...nodeWarnings);
    }

    // If there were any warnings on this node, and if we're highlighting
    // lint, then reparent the node so we can highlight it. Note that
    // a single node can have multiple warnings. If this happends we
    // concatenate the warnings and newline separate them. (The lint.jsx
    // component that displays the warnings may want to convert the
    // newlines into <br> tags.) We also provide a lint rule name
    // so that lint.jsx can link to a document that provides more details
    // on that particular lint rule. If there is more than one warning
    // we only link to the first rule, however.
    //
    // Note that even if we're inside a table, we still reparent the
    // linty node so that it can be highlighted. We just make a note
    // of whether this lint is inside a table or not.
    if (nodeWarnings.length) {
      nodeWarnings.sort((a, b) => {
        return a.severity - b.severity;
      });
      if (node.type !== "text" || nodeWarnings.length > 1) {
        // If the linty node is not a text node, or if there is more
        // than one warning on a text node, then reparent the entire
        // node under a new lint node and put the warnings there.
        state.replace({
          type: "lint",
          // @ts-expect-error [FEI-5003] - TS2345 - Argument of type '{ type: string; content: TreeNode; message: string; ruleName: any; blockHighlight: any; insideTable: boolean; severity: any; }' is not assignable to parameter of type 'TreeNode'.
          content: node,
          message: nodeWarnings.map(w => w.message).join("\n\n"),
          ruleName: nodeWarnings[0].rule,
          blockHighlight: nodeContext.blockHighlight,
          insideTable: insideTable,
          severity: nodeWarnings[0].severity
        });
      } else {
        //
        // Otherwise, it is a single warning on a text node, and we
        // only want to highlight the actual linty part of that string
        // of text. So we want to replace the text node with (in the
        // general case) three nodes:
        //
        // 1) A new text node that holds the non-linty prefix
        //
        // 2) A lint node that is the parent of a new text node
        // that holds the linty part
        //
        // 3) A new text node that holds the non-linty suffix
        //
        // If the lint begins and/or ends at the boundaries of the
        // original text node, then nodes 1 and/or 3 won't exist, of
        // course.
        //
        // Note that we could generalize this to work with multple
        // warnings on a text node as long as the warnings are
        // non-overlapping. Hopefully, though, multiple warnings in a
        // single text node will be rare in practice. Also, we don't
        // have a good way to display multiple lint indicators on a
        // single line, so keeping them combined in that case might
        // be the best thing, anyway.
        //
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'content' does not exist on type 'TreeNode'.
        const _content = node.content; // Text nodes have content
        const warning = nodeWarnings[0]; // There is only one warning.
        // These are the lint boundaries within the content
        const start = warning.start || 0;
        const end = warning.end || _content.length;
        const prefix = _content.substring(0, start);
        const lint = _content.substring(start, end);
        const suffix = _content.substring(end);
        // TODO(FEI-5003): Give this a real type.
        const replacements = []; // What we'll replace the node with

        // The prefix text node, if there is one
        if (prefix) {
          replacements.push({
            type: "text",
            content: prefix
          });
        }

        // The lint node wrapped around the linty text
        replacements.push({
          type: "lint",
          content: {
            type: "text",
            content: lint
          },
          message: warning.message,
          ruleName: warning.rule,
          insideTable: insideTable,
          severity: warning.severity
        });

        // The suffix node, if there is one
        if (suffix) {
          replacements.push({
            type: "text",
            content: suffix
          });
        }

        // Now replace the lint text node with the one to three
        // nodes in the replacement array
        state.replace(...replacements);
      }
    }
  });
  return warnings;
}
function pushContextStack(context, name) {
  const stack = context.stack || [];
  return _extends({}, context, {
    stack: stack.concat(name)
  });
}

export { Rule, linterContextDefault, linterContextProps, pushContextStack, allLintRules as rules, runLinter };
//# sourceMappingURL=index.js.map
