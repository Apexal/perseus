'use strict';

/* eslint-disable prefer-spread, no-regex-spaces, @typescript-eslint/no-unused-vars, guard-for-in, no-console, no-var */
/**
 * Simple-Markdown
 * ===============
 *
 * Simple-Markdown's primary goal is to be easy to adapt. It aims
 * to be compliant with John Gruber's [Markdown Syntax page][1],
 * but compatiblity with other markdown implementations' edge-cases
 * will be sacrificed where it conflicts with simplicity or
 * extensibility.
 *
 * If your goal is to simply embed a standard markdown implementation
 * in your website, simple-markdown is probably not the best library
 * for you (although it should work). But if you have struggled to
 * customize an existing library to meet your needs, simple-markdown
 * might be able to help.
 *
 * Many of the regexes and original logic has been adapted from
 * the wonderful [marked.js](https://github.com/chjj/marked)
 */

// Type Definitions:

// We want to clarify our defaultRules types a little bit more so clients can
// reuse defaultRules built-ins. So we make some stronger guarantess when
// we can:

// End TypeScript Definitions

var CR_NEWLINE_R = /\r\n?/g;
var TAB_R = /\t/g;
var FORMFEED_R = /\f/g;

/**
 * Turn various whitespace into easy-to-process whitespace
 */
var preprocess = function (source) {
  return source.replace(CR_NEWLINE_R, "\n").replace(FORMFEED_R, "").replace(TAB_R, "    ");
};
var populateInitialState = function (givenState, defaultState) {
  var state = givenState || {};
  if (defaultState != null) {
    for (var prop in defaultState) {
      if (Object.prototype.hasOwnProperty.call(defaultState, prop)) {
        state[prop] = defaultState[prop];
      }
    }
  }
  return state;
};

/**
 * Creates a parser for a given set of rules, with the precedence
 * specified as a list of rules.
 *
 * @param {SimpleMarkdown.ParserRules} rules
 *     an object containing
 *     rule type -> {match, order, parse} objects
 *     (lower order is higher precedence)
 * @param {SimpleMarkdown.OptionalState} [defaultState]
 *
 * @returns {SimpleMarkdown.Parser}
 *     The resulting parse function, with the following parameters:
 *     @source: the input source string to be parsed
 *     @state: an optional object to be threaded through parse
 *         calls. Allows clients to add stateful operations to
 *         parsing, such as keeping track of how many levels deep
 *         some nesting is. For an example use-case, see passage-ref
 *         parsing in src/widgets/passage/passage-markdown.jsx
 */
var parserFor = function (rules, defaultState) {
  // Sorts rules in order of increasing order, then
  // ascending rule name in case of ties.
  var ruleList = Object.keys(rules).filter(function (type) {
    var rule = rules[type];
    if (rule == null || rule.match == null) {
      return false;
    }
    var order = rule.order;
    if ((typeof order !== "number" || !isFinite(order)) && typeof console !== "undefined") {
      console.warn("simple-markdown: Invalid order for rule `" + type + "`: " + String(order));
    }
    return true;
  });
  ruleList.sort(function (typeA, typeB) {
    var ruleA = rules[typeA];
    var ruleB = rules[typeB];
    var orderA = ruleA.order;
    var orderB = ruleB.order;

    // First sort based on increasing order
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    var secondaryOrderA = ruleA.quality ? 0 : 1;
    var secondaryOrderB = ruleB.quality ? 0 : 1;
    if (secondaryOrderA !== secondaryOrderB) {
      return secondaryOrderA - secondaryOrderB;

      // Then based on increasing unicode lexicographic ordering
    } else if (typeA < typeB) {
      return -1;
    } else if (typeA > typeB) {
      return 1;
    } else {
      // Rules should never have the same name,
      // but this is provided for completeness.
      return 0;
    }
  });
  var latestState;
  var nestedParse = function (source, state) {
    var result = [];
    state = state || latestState;
    latestState = state;
    while (source) {
      // store the best match, it's rule, and quality:
      var ruleType = null;
      var rule = null;
      var capture = null;
      var quality = NaN;

      // loop control variables:
      var i = 0;
      var currRuleType = ruleList[0];
      var currRule = rules[currRuleType];
      do {
        var currOrder = currRule.order;
        var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
        var currCapture = currRule.match(source, state, prevCaptureStr);
        if (currCapture) {
          var currQuality = currRule.quality ? currRule.quality(currCapture, state, prevCaptureStr) : 0;
          // This should always be true the first time because
          // the initial quality is NaN (that's why there's the
          // condition negation).
          if (!(currQuality <= quality)) {
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'string' is not assignable to type 'null'.
            ruleType = currRuleType;
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'ParserRule' is not assignable to type 'null'.
            rule = currRule;
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'Capture' is not assignable to type 'null'.
            capture = currCapture;
            quality = currQuality;
          }
        }

        // Move on to the next item.
        // Note that this makes `currRule` be the next item
        i++;
        currRuleType = ruleList[i];
        currRule = rules[currRuleType];
      } while (
      // keep looping while we're still within the ruleList
      currRule && (
      // if we don't have a match yet, continue
      !capture ||
      // or if we have a match, but the next rule is
      // at the same order, and has a quality measurement
      // functions, then this rule must have a quality
      // measurement function (since they are sorted before
      // those without), and we need to check if there is
      // a better quality match
      currRule.order === currOrder && currRule.quality));

      // TODO(aria): Write tests for these
      if (rule == null || capture == null) {
        throw new Error("Could not find a matching rule for the below " + "content. The rule with highest `order` should " + "always match content provided to it. Check " + "the definition of `match` for '" + ruleList[ruleList.length - 1] + "'. It seems to not match the following source:\n" + source);
      }
      // @ts-expect-error [FEI-5003] - TS2339 - Property 'index' does not exist on type 'never'.
      if (capture.index) {
        // If present and non-zero, i.e. a non-^ regexp result:
        throw new Error("`match` must return a capture starting at index 0 " + "(the current parse index). Did you forget a ^ at the " + "start of the RegExp?");
      }

      // @ts-expect-error [FEI-5003] - TS2339 - Property 'parse' does not exist on type 'never'.
      var parsed = rule.parse(capture, nestedParse, state);
      // We maintain the same object here so that rules can
      // store references to the objects they return and
      // modify them later. (oops sorry! but this adds a lot
      // of power--see reflinks.)
      if (Array.isArray(parsed)) {
        Array.prototype.push.apply(result, parsed);
      } else {
        if (parsed == null || typeof parsed !== "object") {
          throw new Error("parse() function returned invalid parse result: '".concat(parsed, "'"));
        }

        // We also let rules override the default type of
        // their parsed node if they would like to, so that
        // there can be a single output function for all links,
        // even if there are several rules to parse them.
        if (parsed.type == null) {
          parsed.type = ruleType;
        }
        result.push(parsed);
      }
      state.prevCapture = capture;
      source = source.substring(state.prevCapture[0].length);
    }
    return result;
  };
  var outerParse = function (source, state) {
    latestState = populateInitialState(state, defaultState);
    if (!latestState.inline && !latestState.disableAutoBlockNewlines) {
      source = source + "\n\n";
    }
    // We store the previous capture so that match functions can
    // use some limited amount of lookbehind. Lists use this to
    // ensure they don't match arbitrary '- ' or '* ' in inline
    // text (see the list rule for more information). This stores
    // the full regex capture object, if there is one.
    latestState.prevCapture = null;
    return nestedParse(preprocess(source), latestState);
  };
  return outerParse;
};

// Creates a match function for an inline scoped element from a regex
var inlineRegex = function (regex) {
  var match = function (source, state, prevCapture) {
    if (state.inline) {
      return regex.exec(source);
    } else {
      return null;
    }
  };
  // @ts-expect-error [FEI-5003] - TS2339 - Property 'regex' does not exist on type '(source: string, state: State, prevCapture: string) => Capture | null | undefined'.
  match.regex = regex;
  return match;
};

// Creates a match function for a block scoped element from a regex
var blockRegex = function (regex) {
  var match = function (source, state) {
    if (state.inline) {
      return null;
    } else {
      return regex.exec(source);
    }
  };
  match.regex = regex;
  return match;
};

// Creates a match function from a regex, ignoring block/inline scope
var anyScopeRegex = function (regex) {
  var match = function (source, state) {
    return regex.exec(source);
  };
  match.regex = regex;
  return match;
};
var TYPE_SYMBOL = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
var reactElement = function (type, key, props) {
  var element = {
    $$typeof: TYPE_SYMBOL,
    type: type,
    key: key == null ? undefined : key,
    ref: null,
    props: props,
    _owner: null
  };
  return element;
};

/** Returns a closed HTML tag.
 * @param {string} tagName - Name of HTML tag (eg. "em" or "a")
 * @param {string} content - Inner content of tag
 * @param {{ [attr: string]: SimpleMarkdown.Attr }} [attributes] - Optional extra attributes of tag as an object of key-value pairs
 *   eg. { "href": "http://google.com" }. Falsey attributes are filtered out.
 * @param {boolean} [isClosed] - boolean that controls whether tag is closed or not (eg. img tags).
 *   defaults to true
 */
var htmlTag = function (tagName, content, attributes, isClosed) {
  attributes = attributes || {};
  isClosed = typeof isClosed !== "undefined" ? isClosed : true;
  var attributeString = "";
  for (var attr in attributes) {
    var attribute = attributes[attr];
    // Removes falsey attributes
    if (Object.prototype.hasOwnProperty.call(attributes, attr) && attribute) {
      attributeString += " " + sanitizeText(attr) + '="' + sanitizeText(attribute) + '"';
    }
  }
  var unclosedTag = "<" + tagName + attributeString + ">";
  if (isClosed) {
    return unclosedTag + content + "</" + tagName + ">";
  } else {
    return unclosedTag;
  }
};
var EMPTY_PROPS = {};

/**
 * @param {string | null | undefined} url - url to sanitize
 * @returns {string | null} - url if safe, or null if a safe url could not be made
 */
var sanitizeUrl = function (url) {
  if (url == null) {
    return null;
  }
  try {
    var prot = new URL(url, "https://localhost").protocol;
    if (prot.indexOf("javascript:") === 0 || prot.indexOf("vbscript:") === 0 || prot.indexOf("data:") === 0) {
      return null;
    }
  } catch (e) {
    // invalid URLs should throw a TypeError
    // see for instance: `new URL("");`
    return null;
  }
  return url;
};
var SANITIZE_TEXT_R = /[<>&"']/g;
var SANITIZE_TEXT_CODES = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;"
};
var sanitizeText = function (text) {
  return String(text).replace(SANITIZE_TEXT_R, function (chr) {
    return SANITIZE_TEXT_CODES[chr];
  });
};
var UNESCAPE_URL_R = /\\([^0-9A-Za-z\s])/g;
var unescapeUrl = function (rawUrlString) {
  return rawUrlString.replace(UNESCAPE_URL_R, "$1");
};

/**
 * Parse some content with the parser `parse`, with state.inline
 * set to true. Useful for block elements; not generally necessary
 * to be used by inline elements (where state.inline is already true.
 */
var parseInline = function (parse, content, state) {
  var isCurrentlyInline = state.inline || false;
  state.inline = true;
  var result = parse(content, state);
  state.inline = isCurrentlyInline;
  return result;
};
var parseBlock = function (parse, content, state) {
  var isCurrentlyInline = state.inline || false;
  state.inline = false;
  var result = parse(content + "\n\n", state);
  state.inline = isCurrentlyInline;
  return result;
};
var parseCaptureInline = function (capture, parse, state) {
  return {
    content: parseInline(parse, capture[1], state)
  };
};
var ignoreCapture = function () {
  return {};
};

// recognize a `*` `-`, `+`, `1.`, `2.`... list bullet
var LIST_BULLET = "(?:[*+-]|\\d+\\.)";
// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
var LIST_ITEM_PREFIX = "( *)(" + LIST_BULLET + ") +";
var LIST_ITEM_PREFIX_R = new RegExp("^" + LIST_ITEM_PREFIX);
// recognize an individual list item:
//  * hi
//    this is part of the same item
//
//    as is this, which is a new paragraph in the same item
//
//  * but this is not part of the same item
var LIST_ITEM_R = new RegExp(LIST_ITEM_PREFIX + "[^\\n]*(?:\\n" + "(?!\\1" + LIST_BULLET + " )[^\\n]*)*(\n|$)", "gm");
var BLOCK_END_R = /\n{2,}$/;
var INLINE_CODE_ESCAPE_BACKTICKS_R = /^ (?= *`)|(` *) $/g;
// recognize the end of a paragraph block inside a list item:
// two or more newlines at end end of the item
var LIST_BLOCK_END_R = BLOCK_END_R;
var LIST_ITEM_END_R = / *\n+$/;
// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
var LIST_R = new RegExp("^( *)(" + LIST_BULLET + ") " + "[\\s\\S]+?(?:\n{2,}(?! )" + "(?!\\1" + LIST_BULLET + " )\\n*" +
// the \\s*$ here is so that we can parse the inside of nested
// lists, where our content might end before we receive two `\n`s
"|\\s*\n*$)");
var LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;
var TABLES = function () {
  var TABLE_ROW_SEPARATOR_TRIM = /^ *\| *| *\| *$/g;
  var TABLE_CELL_END_TRIM = / *$/;
  var TABLE_RIGHT_ALIGN = /^ *-+: *$/;
  var TABLE_CENTER_ALIGN = /^ *:-+: *$/;
  var TABLE_LEFT_ALIGN = /^ *:-+ *$/;

  // TODO: This needs a real type

  var parseTableAlignCapture = function (alignCapture) {
    if (TABLE_RIGHT_ALIGN.test(alignCapture)) {
      return "right";
    } else if (TABLE_CENTER_ALIGN.test(alignCapture)) {
      return "center";
    } else if (TABLE_LEFT_ALIGN.test(alignCapture)) {
      return "left";
    } else {
      return null;
    }
  };
  var parseTableAlign = function (source, parse, state, trimEndSeparators) {
    if (trimEndSeparators) {
      source = source.replace(TABLE_ROW_SEPARATOR_TRIM, "");
    }
    var alignText = source.trim().split("|");
    return alignText.map(parseTableAlignCapture);
  };
  var parseTableRow = function (source, parse, state, trimEndSeparators) {
    var prevInTable = state.inTable;
    state.inTable = true;
    var tableRow = parse(source.trim(), state);
    state.inTable = prevInTable;
    var cells = [[]];
    tableRow.forEach(function (node, i) {
      if (node.type === "tableSeparator") {
        // Filter out empty table separators at the start/end:
        if (!trimEndSeparators || i !== 0 && i !== tableRow.length - 1) {
          // Split the current row:
          cells.push([]);
        }
      } else {
        if (node.type === "text" && (tableRow[i + 1] == null || tableRow[i + 1].type === "tableSeparator")) {
          node.content = node.content.replace(TABLE_CELL_END_TRIM, "");
        }
        // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'SingleASTNode' is not assignable to parameter of type 'never'.
        cells[cells.length - 1].push(node);
      }
    });
    return cells;
  };

  /**
   * @param {string} source
   * @param {SimpleMarkdown.Parser} parse
   * @param {SimpleMarkdown.State} state
   * @param {boolean} trimEndSeparators
   * @returns {SimpleMarkdown.ASTNode[][]}
   */
  var parseTableCells = function (source, parse, state, trimEndSeparators) {
    var rowsText = source.trim().split("\n");
    return rowsText.map(function (rowText) {
      return parseTableRow(rowText, parse, state, trimEndSeparators);
    });
  };

  /**
   * @param {boolean} trimEndSeparators
   * @returns {SimpleMarkdown.SingleNodeParseFunction}
   */
  var parseTable = function (trimEndSeparators) {
    return function (capture, parse, state) {
      state.inline = true;
      var header = parseTableRow(capture[1], parse, state, trimEndSeparators);
      var align = parseTableAlign(capture[2], parse, state, trimEndSeparators);
      var cells = parseTableCells(capture[3], parse, state, trimEndSeparators);
      state.inline = false;
      return {
        type: "table",
        header: header,
        align: align,
        cells: cells
      };
    };
  };
  return {
    parseTable: parseTable(true),
    parseNpTable: parseTable(false),
    TABLE_REGEX: /^ *(\|.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
    NPTABLE_REGEX: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/
  };
}();
var LINK_INSIDE = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*";
var LINK_HREF_AND_TITLE = "\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*";
var AUTOLINK_MAILTO_CHECK_R = /mailto:/i;
var parseRef = function (capture, state, refNode) {
  var ref = (capture[2] || capture[1]).replace(/\s+/g, " ").toLowerCase();

  // We store information about previously seen defs on
  // state._defs (_ to deconflict with client-defined
  // state). If the def for this reflink/refimage has
  // already been seen, we can use its target/source
  // and title here:
  if (state._defs && state._defs[ref]) {
    var def = state._defs[ref];
    // `refNode` can be a link or an image. Both use
    // target and title properties.
    refNode.target = def.target;
    refNode.title = def.title;
  }

  // In case we haven't seen our def yet (or if someone
  // overwrites that def later on), we add this node
  // to the list of ref nodes for that def. Then, when
  // we find the def, we can modify this link/image AST
  // node :).
  // I'm sorry.
  state._refs = state._refs || {};
  state._refs[ref] = state._refs[ref] || [];
  state._refs[ref].push(refNode);
  return refNode;
};
var currOrder = 0;
var defaultRules = {
  Array: {
    react: function (arr, output, state) {
      var oldKey = state.key;
      var result = [];

      // map output over the ast, except group any text
      // nodes together into a single string output.
      for (var i = 0, key = 0; i < arr.length; i++, key++) {
        // `key` is our numerical `state.key`, which we increment for
        // every output node, but don't change for joined text nodes.
        // (i, however, must change for joined text nodes)
        state.key = "" + i;
        var node = arr[i];
        if (node.type === "text") {
          node = {
            type: "text",
            content: node.content
          };
          for (; i + 1 < arr.length && arr[i + 1].type === "text"; i++) {
            node.content += arr[i + 1].content;
          }
        }
        result.push(output(node, state));
      }
      state.key = oldKey;
      return result;
    },
    html: function (arr, output, state) {
      var result = "";

      // map output over the ast, except group any text
      // nodes together into a single string output.
      for (var i = 0; i < arr.length; i++) {
        var node = arr[i];
        if (node.type === "text") {
          node = {
            type: "text",
            content: node.content
          };
          for (; i + 1 < arr.length && arr[i + 1].type === "text"; i++) {
            node.content += arr[i + 1].content;
          }
        }
        result += output(node, state);
      }
      return result;
    }
  },
  heading: {
    order: currOrder++,
    match: blockRegex(/^ *(#{1,6})([^\n]+?)#* *(?:\n *)+\n/),
    parse: function (capture, parse, state) {
      return {
        level: capture[1].length,
        content: parseInline(parse, capture[2].trim(), state)
      };
    },
    react: function (node, output, state) {
      return reactElement("h" + node.level, state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("h" + node.level, output(node.content, state));
    }
  },
  nptable: {
    order: currOrder++,
    match: blockRegex(TABLES.NPTABLE_REGEX),
    parse: TABLES.parseNpTable,
    react: null,
    html: null
  },
  lheading: {
    order: currOrder++,
    match: blockRegex(/^([^\n]+)\n *(=|-){3,} *(?:\n *)+\n/),
    parse: function (capture, parse, state) {
      return {
        type: "heading",
        level: capture[2] === "=" ? 1 : 2,
        content: parseInline(parse, capture[1], state)
      };
    },
    react: null,
    html: null
  },
  hr: {
    order: currOrder++,
    match: blockRegex(/^( *[-*_]){3,} *(?:\n *)+\n/),
    parse: ignoreCapture,
    react: function (node, output, state) {
      return reactElement("hr", state.key, EMPTY_PROPS);
    },
    html: function (node, output, state) {
      return "<hr>";
    }
  },
  codeBlock: {
    order: currOrder++,
    match: blockRegex(/^(?:    [^\n]+\n*)+(?:\n *)+\n/),
    parse: function (capture, parse, state) {
      var content = capture[0].replace(/^    /gm, "").replace(/\n+$/, "");
      return {
        lang: undefined,
        content: content
      };
    },
    react: function (node, output, state) {
      var className = node.lang ? "markdown-code-" + node.lang : undefined;
      return reactElement("pre", state.key, {
        children: reactElement("code", null, {
          className: className,
          children: node.content
        })
      });
    },
    html: function (node, output, state) {
      var className = node.lang ? "markdown-code-" + node.lang : undefined;
      var codeBlock = htmlTag("code", sanitizeText(node.content), {
        class: className
      });
      return htmlTag("pre", codeBlock);
    }
  },
  fence: {
    order: currOrder++,
    match: blockRegex(/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([\s\S]+?)\n?\1 *(?:\n *)+\n/),
    parse: function (capture, parse, state) {
      return {
        type: "codeBlock",
        lang: capture[2] || undefined,
        content: capture[3]
      };
    },
    react: null,
    html: null
  },
  blockQuote: {
    order: currOrder++,
    match: blockRegex(/^( *>[^\n]+(\n[^\n]+)*\n*)+\n{2,}/),
    parse: function (capture, parse, state) {
      var content = capture[0].replace(/^ *> ?/gm, "");
      return {
        content: parse(content, state)
      };
    },
    react: function (node, output, state) {
      return reactElement("blockquote", state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("blockquote", output(node.content, state));
    }
  },
  list: {
    order: currOrder++,
    match: function (source, state) {
      // We only want to break into a list if we are at the start of a
      // line. This is to avoid parsing "hi * there" with "* there"
      // becoming a part of a list.
      // You might wonder, "but that's inline, so of course it wouldn't
      // start a list?". You would be correct! Except that some of our
      // lists can be inline, because they might be inside another list,
      // in which case we can parse with inline scope, but need to allow
      // nested lists inside this inline scope.
      var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
      var isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
      var isListBlock = state._list || !state.inline;
      if (isStartOfLineCapture && isListBlock) {
        source = isStartOfLineCapture[1] + source;
        return LIST_R.exec(source);
      } else {
        return null;
      }
    },
    parse: function (capture, parse, state) {
      var bullet = capture[2];
      var ordered = bullet.length > 1;
      var start = ordered ? +bullet : undefined;
      // @ts-expect-error [FEI-5003] - TS2322 - Type 'RegExpMatchArray | null' is not assignable to type 'string[]'.
      var items = capture[0].replace(LIST_BLOCK_END_R, "\n").match(LIST_ITEM_R);

      // We know this will match here, because of how the regexes are
      // defined

      var lastItemWasAParagraph = false;
      var itemContent = items.map(function (item, i) {
        // We need to see how far indented this item is:
        var prefixCapture = LIST_ITEM_PREFIX_R.exec(item);
        var space = prefixCapture ? prefixCapture[0].length : 0;
        // And then we construct a regex to "unindent" the subsequent
        // lines of the items by that amount:
        var spaceRegex = new RegExp("^ {1," + space + "}", "gm");

        // Before processing the item, we need a couple things
        var content = item
        // remove indents on trailing lines:
        .replace(spaceRegex, "")
        // remove the bullet:
        .replace(LIST_ITEM_PREFIX_R, "");

        // I'm not sur4 why this is necessary again?

        // Handling "loose" lists, like:
        //
        //  * this is wrapped in a paragraph
        //
        //  * as is this
        //
        //  * as is this
        var isLastItem = i === items.length - 1;
        var containsBlocks = content.indexOf("\n\n") !== -1;

        // Any element in a list is a block if it contains multiple
        // newlines. The last element in the list can also be a block
        // if the previous item in the list was a block (this is
        // because non-last items in the list can end with \n\n, but
        // the last item can't, so we just "inherit" this property
        // from our previous element).
        var thisItemIsAParagraph = containsBlocks || isLastItem && lastItemWasAParagraph;
        lastItemWasAParagraph = thisItemIsAParagraph;

        // backup our state for restoration afterwards. We're going to
        // want to set state._list to true, and state.inline depending
        // on our list's looseness.
        var oldStateInline = state.inline;
        var oldStateList = state._list;
        state._list = true;

        // Parse inline if we're in a tight list, or block if we're in
        // a loose list.
        var adjustedContent;
        if (thisItemIsAParagraph) {
          state.inline = false;
          adjustedContent = content.replace(LIST_ITEM_END_R, "\n\n");
        } else {
          state.inline = true;
          adjustedContent = content.replace(LIST_ITEM_END_R, "");
        }
        var result = parse(adjustedContent, state);

        // Restore our state before returning
        state.inline = oldStateInline;
        state._list = oldStateList;
        return result;
      });
      return {
        ordered: ordered,
        start: start,
        items: itemContent
      };
    },
    react: function (node, output, state) {
      var ListWrapper = node.ordered ? "ol" : "ul";
      return reactElement(ListWrapper, state.key, {
        start: node.start,
        children: node.items.map(function (item, i) {
          return reactElement("li", "" + i, {
            children: output(item, state)
          });
        })
      });
    },
    html: function (node, output, state) {
      var listItems = node.items.map(function (item) {
        return htmlTag("li", output(item, state));
      }).join("");
      var listTag = node.ordered ? "ol" : "ul";
      var attributes = {
        start: node.start
      };
      return htmlTag(listTag, listItems, attributes);
    }
  },
  def: {
    order: currOrder++,
    // TODO(aria): This will match without a blank line before the next
    // block element, which is inconsistent with most of the rest of
    // simple-markdown.
    match: blockRegex(/^ *\[([^\]]+)\]: *<?([^\s>]*)>?(?: +["(]([^\n]+)[")])? *\n(?: *\n)*/),
    parse: function (capture, parse, state) {
      var def = capture[1].replace(/\s+/g, " ").toLowerCase();
      var target = capture[2];
      var title = capture[3];

      // Look for previous links/images using this def
      // If any links/images using this def have already been declared,
      // they will have added themselves to the state._refs[def] list
      // (_ to deconflict with client-defined state). We look through
      // that list of reflinks for this def, and modify those AST nodes
      // with our newly found information now.
      // Sorry :(.
      if (state._refs && state._refs[def]) {
        // `refNode` can be a link or an image
        state._refs[def].forEach(function (refNode) {
          refNode.target = target;
          refNode.title = title;
        });
      }

      // Add this def to our map of defs for any future links/images
      // In case we haven't found any or all of the refs referring to
      // this def yet, we add our def to the table of known defs, so
      // that future reflinks can modify themselves appropriately with
      // this information.
      state._defs = state._defs || {};
      state._defs[def] = {
        target: target,
        title: title
      };

      // return the relevant parsed information
      // for debugging only.
      return {
        def: def,
        target: target,
        title: title
      };
    },
    react: function () {
      return null;
    },
    html: function () {
      return "";
    }
  },
  table: {
    order: currOrder++,
    match: blockRegex(TABLES.TABLE_REGEX),
    parse: TABLES.parseTable,
    react: function (node, output, state) {
      var getStyle = function (colIndex) {
        return node.align[colIndex] == null ? {} : {
          textAlign: node.align[colIndex]
        };
      };
      var headers = node.header.map(function (content, i) {
        return reactElement("th", "" + i, {
          style: getStyle(i),
          scope: "col",
          children: output(content, state)
        });
      });
      var rows = node.cells.map(function (row, r) {
        return reactElement("tr", "" + r, {
          children: row.map(function (content, c) {
            return reactElement("td", "" + c, {
              style: getStyle(c),
              children: output(content, state)
            });
          })
        });
      });
      return reactElement("table", state.key, {
        children: [reactElement("thead", "thead", {
          children: reactElement("tr", null, {
            children: headers
          })
        }), reactElement("tbody", "tbody", {
          children: rows
        })]
      });
    },
    html: function (node, output, state) {
      var getStyle = function (colIndex) {
        return node.align[colIndex] == null ? "" : "text-align:" + node.align[colIndex] + ";";
      };
      var headers = node.header.map(function (content, i) {
        return htmlTag("th", output(content, state), {
          style: getStyle(i),
          scope: "col"
        });
      }).join("");
      var rows = node.cells.map(function (row) {
        var cols = row.map(function (content, c) {
          return htmlTag("td", output(content, state), {
            style: getStyle(c)
          });
        }).join("");
        return htmlTag("tr", cols);
      }).join("");
      var thead = htmlTag("thead", htmlTag("tr", headers));
      var tbody = htmlTag("tbody", rows);
      return htmlTag("table", thead + tbody);
    }
  },
  newline: {
    order: currOrder++,
    match: blockRegex(/^(?:\n *)*\n/),
    parse: ignoreCapture,
    react: function (node, output, state) {
      return "\n";
    },
    html: function (node, output, state) {
      return "\n";
    }
  },
  paragraph: {
    order: currOrder++,
    match: blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
    parse: parseCaptureInline,
    react: function (node, output, state) {
      return reactElement("div", state.key, {
        className: "paragraph",
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      var attributes = {
        class: "paragraph"
      };
      return htmlTag("div", output(node.content, state), attributes);
    }
  },
  escape: {
    order: currOrder++,
    // We don't allow escaping numbers, letters, or spaces here so that
    // backslashes used in plain text still get rendered. But allowing
    // escaping anything else provides a very flexible escape mechanism,
    // regardless of how this grammar is extended.
    match: inlineRegex(/^\\([^0-9A-Za-z\s])/),
    parse: function (capture, parse, state) {
      return {
        type: "text",
        content: capture[1]
      };
    },
    react: null,
    html: null
  },
  tableSeparator: {
    order: currOrder++,
    match: function (source, state) {
      if (!state.inTable) {
        return null;
      }
      return /^ *\| */.exec(source);
    },
    parse: function () {
      return {
        type: "tableSeparator"
      };
    },
    // These shouldn't be reached, but in case they are, be reasonable:
    react: function () {
      return " | ";
    },
    html: function () {
      return " &vert; ";
    }
  },
  autolink: {
    order: currOrder++,
    match: inlineRegex(/^<([^: >]+:\/[^ >]+)>/),
    parse: function (capture, parse, state) {
      return {
        type: "link",
        content: [{
          type: "text",
          content: capture[1]
        }],
        target: capture[1]
      };
    },
    react: null,
    html: null
  },
  mailto: {
    order: currOrder++,
    match: inlineRegex(/^<([^ >]+@[^ >]+)>/),
    parse: function (capture, parse, state) {
      var address = capture[1];
      var target = capture[1];

      // Check for a `mailto:` already existing in the link:
      if (!AUTOLINK_MAILTO_CHECK_R.test(target)) {
        target = "mailto:" + target;
      }
      return {
        type: "link",
        content: [{
          type: "text",
          content: address
        }],
        target: target
      };
    },
    react: null,
    html: null
  },
  url: {
    order: currOrder++,
    match: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
    parse: function (capture, parse, state) {
      return {
        type: "link",
        content: [{
          type: "text",
          content: capture[1]
        }],
        target: capture[1],
        title: undefined
      };
    },
    react: null,
    html: null
  },
  link: {
    order: currOrder++,
    match: inlineRegex(new RegExp("^\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)")),
    parse: function (capture, parse, state) {
      var link = {
        content: parse(capture[1], state),
        target: unescapeUrl(capture[2]),
        title: capture[3]
      };
      return link;
    },
    react: function (node, output, state) {
      return reactElement("a", state.key, {
        href: sanitizeUrl(node.target),
        title: node.title,
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      var attributes = {
        href: sanitizeUrl(node.target),
        title: node.title
      };
      return htmlTag("a", output(node.content, state), attributes);
    }
  },
  image: {
    order: currOrder++,
    match: inlineRegex(new RegExp("^!\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)")),
    parse: function (capture, parse, state) {
      var image = {
        alt: capture[1],
        target: unescapeUrl(capture[2]),
        title: capture[3]
      };
      return image;
    },
    react: function (node, output, state) {
      return reactElement("img", state.key, {
        src: sanitizeUrl(node.target),
        alt: node.alt,
        title: node.title
      });
    },
    html: function (node, output, state) {
      var attributes = {
        src: sanitizeUrl(node.target),
        alt: node.alt,
        title: node.title
      };
      return htmlTag("img", "", attributes, false);
    }
  },
  reflink: {
    order: currOrder++,
    match: inlineRegex(new RegExp(
    // The first [part] of the link
    "^\\[(" + LINK_INSIDE + ")\\]" +
    // The [ref] target of the link
    "\\s*\\[([^\\]]*)\\]")),
    parse: function (capture, parse, state) {
      return parseRef(capture, state, {
        type: "link",
        content: parse(capture[1], state)
      });
    },
    react: null,
    html: null
  },
  refimage: {
    order: currOrder++,
    match: inlineRegex(new RegExp(
    // The first [part] of the link
    "^!\\[(" + LINK_INSIDE + ")\\]" +
    // The [ref] target of the link
    "\\s*\\[([^\\]]*)\\]")),
    parse: function (capture, parse, state) {
      return parseRef(capture, state, {
        type: "image",
        alt: capture[1]
      });
    },
    react: null,
    html: null
  },
  em: {
    order: currOrder /* same as strong/u */,
    match: inlineRegex(new RegExp(
    // only match _s surrounding words.
    "^\\b_" + "((?:__|\\\\[\\s\\S]|[^\\\\_])+?)_" + "\\b" +
    // Or match *s:
    "|" +
    // Only match *s that are followed by a non-space:
    "^\\*(?=\\S)(" +
    // Match at least one of:
    "(?:" +
    //  - `**`: so that bolds inside italics don't close the
    //          italics
    "\\*\\*|" +
    //  - escape sequence: so escaped *s don't close us
    "\\\\[\\s\\S]|" +
    //  - whitespace: followed by a non-* (we don't
    //          want ' *' to close an italics--it might
    //          start a list)
    "\\s+(?:\\\\[\\s\\S]|[^\\s\\*\\\\]|\\*\\*)|" +
    //  - non-whitespace, non-*, non-backslash characters
    "[^\\s\\*\\\\]" + ")+?" +
    // followed by a non-space, non-* then *
    ")\\*(?!\\*)")),
    quality: function (capture) {
      // precedence by length, `em` wins ties:
      return capture[0].length + 0.2;
    },
    parse: function (capture, parse, state) {
      return {
        content: parse(capture[2] || capture[1], state)
      };
    },
    react: function (node, output, state) {
      return reactElement("em", state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("em", output(node.content, state));
    }
  },
  strong: {
    order: currOrder /* same as em */,
    match: inlineRegex(/^\*\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/),
    quality: function (capture) {
      // precedence by length, wins ties vs `u`:
      return capture[0].length + 0.1;
    },
    parse: parseCaptureInline,
    react: function (node, output, state) {
      return reactElement("strong", state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("strong", output(node.content, state));
    }
  },
  u: {
    order: currOrder++ /* same as em&strong; increment for next rule */,
    match: inlineRegex(/^__((?:\\[\s\S]|[^\\])+?)__(?!_)/),
    quality: function (capture) {
      // precedence by length, loses all ties
      return capture[0].length;
    },
    parse: parseCaptureInline,
    react: function (node, output, state) {
      return reactElement("u", state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("u", output(node.content, state));
    }
  },
  del: {
    order: currOrder++,
    match: inlineRegex(/^~~(?=\S)((?:\\[\s\S]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/),
    parse: parseCaptureInline,
    react: function (node, output, state) {
      return reactElement("del", state.key, {
        children: output(node.content, state)
      });
    },
    html: function (node, output, state) {
      return htmlTag("del", output(node.content, state));
    }
  },
  inlineCode: {
    order: currOrder++,
    match: inlineRegex(/^(`+)([\s\S]*?[^`])\1(?!`)/),
    parse: function (capture, parse, state) {
      return {
        content: capture[2].replace(INLINE_CODE_ESCAPE_BACKTICKS_R, "$1")
      };
    },
    react: function (node, output, state) {
      return reactElement("code", state.key, {
        children: node.content
      });
    },
    html: function (node, output, state) {
      return htmlTag("code", sanitizeText(node.content));
    }
  },
  br: {
    order: currOrder++,
    match: anyScopeRegex(/^ {2,}\n/),
    parse: ignoreCapture,
    react: function (node, output, state) {
      return reactElement("br", state.key, EMPTY_PROPS);
    },
    html: function (node, output, state) {
      return "<br>";
    }
  },
  text: {
    order: currOrder++,
    // Here we look for anything followed by non-symbols,
    // double newlines, or double-space-newlines
    // We break on any symbol characters so that this grammar
    // is easy to extend without needing to modify this regex
    match: anyScopeRegex(/^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|\n\n| {2,}\n|\w+:\S|$)/),
    parse: function (capture, parse, state) {
      return {
        content: capture[0]
      };
    },
    react: function (node, output, state) {
      return node.content;
    },
    html: function (node, output, state) {
      return sanitizeText(node.content);
    }
  }
};

/** (deprecated) */
var ruleOutput = function (rules, property) {
  if (!property && typeof console !== "undefined") {
    console.warn("simple-markdown ruleOutput should take 'react' or " + "'html' as the second argument.");
  }
  var nestedRuleOutput = function (ast, outputFunc, state) {
    // @ts-expect-error [FEI-5003] - TS2349 - This expression is not callable.
    //   Type 'unknown' has no call signatures.
    return rules[ast.type][property](ast, outputFunc, state);
  };
  return nestedRuleOutput;
};

/** (deprecated)
 */
var reactFor = function (outputFunc) {
  var nestedOutput = function (ast, state) {
    state = state || {};
    if (Array.isArray(ast)) {
      var oldKey = state.key;
      var result = [];

      // map nestedOutput over the ast, except group any text
      // nodes together into a single string output.
      var lastResult = null;
      for (var i = 0; i < ast.length; i++) {
        state.key = "" + i;
        var nodeOut = nestedOutput(ast[i], state);
        if (typeof nodeOut === "string" && typeof lastResult === "string") {
          // @ts-expect-error [FEI-5003] - TS2322 - Type 'string' is not assignable to type 'null'.
          lastResult = lastResult + nodeOut;
          result[result.length - 1] = lastResult;
        } else {
          result.push(nodeOut);
          // @ts-expect-error [FEI-5003] - TS2322 - Type 'ReactNode' is not assignable to type 'null'.
          lastResult = nodeOut;
        }
      }
      state.key = oldKey;
      return result;
    } else {
      return outputFunc(ast, nestedOutput, state);
    }
  };
  return nestedOutput;
};

/** (deprecated)
 */
var htmlFor = function (outputFunc) {
  var nestedOutput = function (ast, state) {
    state = state || {};
    if (Array.isArray(ast)) {
      return ast.map(function (node) {
        return nestedOutput(node, state);
      }).join("");
    } else {
      return outputFunc(ast, nestedOutput, state);
    }
  };
  return nestedOutput;
};
var outputFor = function (rules, property) {
  let defaultState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!property) {
    throw new Error("simple-markdown: outputFor: `property` must be " + "defined. " + "if you just upgraded, you probably need to replace `outputFor` " + "with `reactFor`");
  }
  var latestState;
  var arrayRule = rules.Array || defaultRules.Array;

  // Tricks to convince tsc that this var is not null:
  // @ts-expect-error [FEI-5003] - TS2538 - Type 'symbol' cannot be used as an index type.
  var arrayRuleCheck = arrayRule[property];
  if (!arrayRuleCheck) {
    throw new Error("simple-markdown: outputFor: to join nodes of type `" +
    // @ts-expect-error [FEI-5003] - TS2469 - The '+' operator cannot be applied to type 'symbol'.
    property + "` you must provide an `Array:` joiner rule with that type, " + "Please see the docs for details on specifying an Array rule.");
  }
  var arrayRuleOutput = arrayRuleCheck;
  var nestedOutput = function (ast, state) {
    state = state || latestState;
    latestState = state;
    if (Array.isArray(ast)) {
      return arrayRuleOutput(ast, nestedOutput, state);
    } else {
      // @ts-expect-error [FEI-5003] - TS2349 - This expression is not callable.
      //   Type 'unknown' has no call signatures.
      return rules[ast.type][property](ast, nestedOutput, state);
    }
  };
  var outerOutput = function (ast, state) {
    latestState = populateInitialState(state, defaultState);
    return nestedOutput(ast, latestState);
  };
  return outerOutput;
};

// @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'DefaultRules' is not assignable to parameter of type 'ParserRules'.
var defaultRawParse = parserFor(defaultRules);
var defaultBlockParse = function (source, state) {
  state = state || {};
  state.inline = false;
  return defaultRawParse(source, state);
};
var defaultInlineParse = function (source, state) {
  state = state || {};
  state.inline = true;
  return defaultRawParse(source, state);
};
var defaultImplicitParse = function (source, state) {
  var isBlock = BLOCK_END_R.test(source);
  state = state || {};
  state.inline = !isBlock;
  return defaultRawParse(source, state);
};
var defaultReactOutput = outputFor(defaultRules, "react");
var defaultHtmlOutput = outputFor(defaultRules, "html");
var markdownToReact = function (source, state) {
  return defaultReactOutput(defaultBlockParse(source, state), state);
};
var markdownToHtml = function (source, state) {
  return defaultHtmlOutput(defaultBlockParse(source, state), state);
};

// TODO: This needs definition

var ReactMarkdown = function (props) {
  var divProps = {};
  for (var prop in props) {
    if (prop !== "source" && Object.prototype.hasOwnProperty.call(props, prop)) {
      divProps[prop] = props[prop];
    }
  }
  divProps.children = markdownToReact(props.source);
  return reactElement("div", null, divProps);
};
var SimpleMarkdown = {
  defaultRules: defaultRules,
  parserFor: parserFor,
  outputFor: outputFor,
  inlineRegex: inlineRegex,
  blockRegex: blockRegex,
  anyScopeRegex: anyScopeRegex,
  parseInline: parseInline,
  parseBlock: parseBlock,
  // default wrappers:
  markdownToReact: markdownToReact,
  markdownToHtml: markdownToHtml,
  ReactMarkdown: ReactMarkdown,
  defaultBlockParse: defaultBlockParse,
  defaultInlineParse: defaultInlineParse,
  defaultImplicitParse: defaultImplicitParse,
  defaultReactOutput: defaultReactOutput,
  defaultHtmlOutput: defaultHtmlOutput,
  preprocess: preprocess,
  sanitizeText: sanitizeText,
  sanitizeUrl: sanitizeUrl,
  unescapeUrl: unescapeUrl,
  htmlTag: htmlTag,
  reactElement: reactElement,
  // deprecated:
  defaultRawParse: defaultRawParse,
  ruleOutput: ruleOutput,
  reactFor: reactFor,
  htmlFor: htmlFor,
  defaultParse: function () {
    if (typeof console !== "undefined") {
      console.warn("defaultParse is deprecated, please use `defaultImplicitParse`");
    }
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return defaultImplicitParse.apply(null, args);
  },
  defaultOutput: function () {
    if (typeof console !== "undefined") {
      console.warn("defaultOutput is deprecated, please use `defaultReactOutput`");
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return defaultReactOutput.apply(null, args);
  }
};

module.exports = SimpleMarkdown;
//# sourceMappingURL=index.js.map
