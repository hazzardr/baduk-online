import {
  mapValues
} from "./chunk-UTNZYD2N.js";
import {
  isPlainObject
} from "./chunk-FSBVR7H5.js";
import {
  __commonJS,
  __name,
  __toESM
} from "./chunk-MM7DTO55.js";

// ../node_modules/jsdoc-type-pratt-parser/dist/index.js
var require_dist = __commonJS({
  "../node_modules/jsdoc-type-pratt-parser/dist/index.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.jtpp = {}));
    })(exports, function(exports2) {
      "use strict";
      function tokenToString(token) {
        if (token.text !== void 0 && token.text !== "") {
          return `'${token.type}' with value '${token.text}'`;
        } else {
          return `'${token.type}'`;
        }
      }
      __name(tokenToString, "tokenToString");
      const _NoParsletFoundError = class _NoParsletFoundError extends Error {
        constructor(token) {
          super(`No parslet found for token: ${tokenToString(token)}`);
          this.token = token;
          Object.setPrototypeOf(this, _NoParsletFoundError.prototype);
        }
        getToken() {
          return this.token;
        }
      };
      __name(_NoParsletFoundError, "NoParsletFoundError");
      let NoParsletFoundError = _NoParsletFoundError;
      const _EarlyEndOfParseError = class _EarlyEndOfParseError extends Error {
        constructor(token) {
          super(`The parsing ended early. The next token was: ${tokenToString(token)}`);
          this.token = token;
          Object.setPrototypeOf(this, _EarlyEndOfParseError.prototype);
        }
        getToken() {
          return this.token;
        }
      };
      __name(_EarlyEndOfParseError, "EarlyEndOfParseError");
      let EarlyEndOfParseError = _EarlyEndOfParseError;
      const _UnexpectedTypeError = class _UnexpectedTypeError extends Error {
        constructor(result, message) {
          let error = `Unexpected type: '${result.type}'.`;
          if (message !== void 0) {
            error += ` Message: ${message}`;
          }
          super(error);
          Object.setPrototypeOf(this, _UnexpectedTypeError.prototype);
        }
      };
      __name(_UnexpectedTypeError, "UnexpectedTypeError");
      let UnexpectedTypeError = _UnexpectedTypeError;
      function makePunctuationRule(type) {
        return (text) => {
          if (text.startsWith(type)) {
            return { type, text: type };
          } else {
            return null;
          }
        };
      }
      __name(makePunctuationRule, "makePunctuationRule");
      function getQuoted(text) {
        let position = 0;
        let char;
        const mark = text[0];
        let escaped = false;
        if (mark !== "'" && mark !== '"') {
          return null;
        }
        while (position < text.length) {
          position++;
          char = text[position];
          if (!escaped && char === mark) {
            position++;
            break;
          }
          escaped = !escaped && char === "\\";
        }
        if (char !== mark) {
          throw new Error("Unterminated String");
        }
        return text.slice(0, position);
      }
      __name(getQuoted, "getQuoted");
      const identifierStartRegex = new RegExp("[$_\\p{ID_Start}]|\\\\u\\p{Hex_Digit}{4}|\\\\u\\{0*(?:\\p{Hex_Digit}{1,5}|10\\p{Hex_Digit}{4})\\}", "u");
      const identifierContinueRegex = new RegExp("[$\\-\\p{ID_Continue}\\u200C\\u200D]|\\\\u\\p{Hex_Digit}{4}|\\\\u\\{0*(?:\\p{Hex_Digit}{1,5}|10\\p{Hex_Digit}{4})\\}", "u");
      function getIdentifier(text) {
        let char = text[0];
        if (!identifierStartRegex.test(char)) {
          return null;
        }
        let position = 1;
        do {
          char = text[position];
          if (!identifierContinueRegex.test(char)) {
            break;
          }
          position++;
        } while (position < text.length);
        return text.slice(0, position);
      }
      __name(getIdentifier, "getIdentifier");
      const numberRegex = /^(NaN|-?((\d*\.\d+|\d+)([Ee][+-]?\d+)?|Infinity))/;
      function getNumber(text) {
        var _a, _b;
        return (_b = (_a = numberRegex.exec(text)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
      }
      __name(getNumber, "getNumber");
      const identifierRule = /* @__PURE__ */ __name((text) => {
        const value = getIdentifier(text);
        if (value == null) {
          return null;
        }
        return {
          type: "Identifier",
          text: value
        };
      }, "identifierRule");
      function makeKeyWordRule(type) {
        return (text) => {
          if (!text.startsWith(type)) {
            return null;
          }
          const prepends = text[type.length];
          if (prepends !== void 0 && identifierContinueRegex.test(prepends)) {
            return null;
          }
          return {
            type,
            text: type
          };
        };
      }
      __name(makeKeyWordRule, "makeKeyWordRule");
      const stringValueRule = /* @__PURE__ */ __name((text) => {
        const value = getQuoted(text);
        if (value == null) {
          return null;
        }
        return {
          type: "StringValue",
          text: value
        };
      }, "stringValueRule");
      const eofRule = /* @__PURE__ */ __name((text) => {
        if (text.length > 0) {
          return null;
        }
        return {
          type: "EOF",
          text: ""
        };
      }, "eofRule");
      const numberRule = /* @__PURE__ */ __name((text) => {
        const value = getNumber(text);
        if (value === null) {
          return null;
        }
        return {
          type: "Number",
          text: value
        };
      }, "numberRule");
      const rules = [
        eofRule,
        makePunctuationRule("=>"),
        makePunctuationRule("("),
        makePunctuationRule(")"),
        makePunctuationRule("{"),
        makePunctuationRule("}"),
        makePunctuationRule("["),
        makePunctuationRule("]"),
        makePunctuationRule("|"),
        makePunctuationRule("&"),
        makePunctuationRule("<"),
        makePunctuationRule(">"),
        makePunctuationRule(","),
        makePunctuationRule(";"),
        makePunctuationRule("*"),
        makePunctuationRule("?"),
        makePunctuationRule("!"),
        makePunctuationRule("="),
        makePunctuationRule(":"),
        makePunctuationRule("..."),
        makePunctuationRule("."),
        makePunctuationRule("#"),
        makePunctuationRule("~"),
        makePunctuationRule("/"),
        makePunctuationRule("@"),
        makeKeyWordRule("undefined"),
        makeKeyWordRule("null"),
        makeKeyWordRule("function"),
        makeKeyWordRule("this"),
        makeKeyWordRule("new"),
        makeKeyWordRule("module"),
        makeKeyWordRule("event"),
        makeKeyWordRule("extends"),
        makeKeyWordRule("external"),
        makeKeyWordRule("infer"),
        makeKeyWordRule("typeof"),
        makeKeyWordRule("keyof"),
        makeKeyWordRule("readonly"),
        makeKeyWordRule("import"),
        makeKeyWordRule("is"),
        makeKeyWordRule("in"),
        makeKeyWordRule("asserts"),
        numberRule,
        identifierRule,
        stringValueRule
      ];
      const breakingWhitespaceRegex = /^\s*\n\s*/;
      const _Lexer = class _Lexer {
        static create(text) {
          const current = this.read(text);
          text = current.text;
          const next = this.read(text);
          text = next.text;
          return new _Lexer(text, void 0, current.token, next.token);
        }
        constructor(text, previous, current, next) {
          this.text = "";
          this.text = text;
          this.previous = previous;
          this.current = current;
          this.next = next;
        }
        static read(text, startOfLine = false) {
          startOfLine = startOfLine || breakingWhitespaceRegex.test(text);
          text = text.trim();
          for (const rule of rules) {
            const partial = rule(text);
            if (partial !== null) {
              const token = Object.assign(Object.assign({}, partial), { startOfLine });
              text = text.slice(token.text.length);
              return { text, token };
            }
          }
          throw new Error("Unexpected Token " + text);
        }
        advance() {
          const next = _Lexer.read(this.text);
          return new _Lexer(next.text, this.current, this.next, next.token);
        }
      };
      __name(_Lexer, "Lexer");
      let Lexer = _Lexer;
      function assertRootResult(result) {
        if (result === void 0) {
          throw new Error("Unexpected undefined");
        }
        if (result.type === "JsdocTypeKeyValue" || result.type === "JsdocTypeParameterList" || result.type === "JsdocTypeProperty" || result.type === "JsdocTypeReadonlyProperty" || result.type === "JsdocTypeObjectField" || result.type === "JsdocTypeJsdocObjectField" || result.type === "JsdocTypeIndexSignature" || result.type === "JsdocTypeMappedType" || result.type === "JsdocTypeTypeParameter") {
          throw new UnexpectedTypeError(result);
        }
        return result;
      }
      __name(assertRootResult, "assertRootResult");
      function assertPlainKeyValueOrRootResult(result) {
        if (result.type === "JsdocTypeKeyValue") {
          return assertPlainKeyValueResult(result);
        }
        return assertRootResult(result);
      }
      __name(assertPlainKeyValueOrRootResult, "assertPlainKeyValueOrRootResult");
      function assertPlainKeyValueOrNameResult(result) {
        if (result.type === "JsdocTypeName") {
          return result;
        }
        return assertPlainKeyValueResult(result);
      }
      __name(assertPlainKeyValueOrNameResult, "assertPlainKeyValueOrNameResult");
      function assertPlainKeyValueResult(result) {
        if (result.type !== "JsdocTypeKeyValue") {
          throw new UnexpectedTypeError(result);
        }
        return result;
      }
      __name(assertPlainKeyValueResult, "assertPlainKeyValueResult");
      function assertNumberOrVariadicNameResult(result) {
        var _a;
        if (result.type === "JsdocTypeVariadic") {
          if (((_a = result.element) === null || _a === void 0 ? void 0 : _a.type) === "JsdocTypeName") {
            return result;
          }
          throw new UnexpectedTypeError(result);
        }
        if (result.type !== "JsdocTypeNumber" && result.type !== "JsdocTypeName") {
          throw new UnexpectedTypeError(result);
        }
        return result;
      }
      __name(assertNumberOrVariadicNameResult, "assertNumberOrVariadicNameResult");
      function assertArrayOrTupleResult(result) {
        if (result.type === "JsdocTypeTuple") {
          return result;
        }
        if (result.type === "JsdocTypeGeneric" && result.meta.brackets === "square") {
          return result;
        }
        throw new UnexpectedTypeError(result);
      }
      __name(assertArrayOrTupleResult, "assertArrayOrTupleResult");
      function isSquaredProperty(result) {
        return result.type === "JsdocTypeIndexSignature" || result.type === "JsdocTypeMappedType";
      }
      __name(isSquaredProperty, "isSquaredProperty");
      var Precedence;
      (function(Precedence2) {
        Precedence2[Precedence2["ALL"] = 0] = "ALL";
        Precedence2[Precedence2["PARAMETER_LIST"] = 1] = "PARAMETER_LIST";
        Precedence2[Precedence2["OBJECT"] = 2] = "OBJECT";
        Precedence2[Precedence2["KEY_VALUE"] = 3] = "KEY_VALUE";
        Precedence2[Precedence2["INDEX_BRACKETS"] = 4] = "INDEX_BRACKETS";
        Precedence2[Precedence2["UNION"] = 5] = "UNION";
        Precedence2[Precedence2["INTERSECTION"] = 6] = "INTERSECTION";
        Precedence2[Precedence2["PREFIX"] = 7] = "PREFIX";
        Precedence2[Precedence2["INFIX"] = 8] = "INFIX";
        Precedence2[Precedence2["TUPLE"] = 9] = "TUPLE";
        Precedence2[Precedence2["SYMBOL"] = 10] = "SYMBOL";
        Precedence2[Precedence2["OPTIONAL"] = 11] = "OPTIONAL";
        Precedence2[Precedence2["NULLABLE"] = 12] = "NULLABLE";
        Precedence2[Precedence2["KEY_OF_TYPE_OF"] = 13] = "KEY_OF_TYPE_OF";
        Precedence2[Precedence2["FUNCTION"] = 14] = "FUNCTION";
        Precedence2[Precedence2["ARROW"] = 15] = "ARROW";
        Precedence2[Precedence2["ARRAY_BRACKETS"] = 16] = "ARRAY_BRACKETS";
        Precedence2[Precedence2["GENERIC"] = 17] = "GENERIC";
        Precedence2[Precedence2["NAME_PATH"] = 18] = "NAME_PATH";
        Precedence2[Precedence2["PARENTHESIS"] = 19] = "PARENTHESIS";
        Precedence2[Precedence2["SPECIAL_TYPES"] = 20] = "SPECIAL_TYPES";
      })(Precedence || (Precedence = {}));
      const _Parser = class _Parser {
        constructor(grammar, textOrLexer, baseParser) {
          this.grammar = grammar;
          if (typeof textOrLexer === "string") {
            this._lexer = Lexer.create(textOrLexer);
          } else {
            this._lexer = textOrLexer;
          }
          this.baseParser = baseParser;
        }
        get lexer() {
          return this._lexer;
        }
        /**
         * Parses a given string and throws an error if the parse ended before the end of the string.
         */
        parse() {
          const result = this.parseType(Precedence.ALL);
          if (this.lexer.current.type !== "EOF") {
            throw new EarlyEndOfParseError(this.lexer.current);
          }
          return result;
        }
        /**
         * Parses with the current lexer and asserts that the result is a {@link RootResult}.
         */
        parseType(precedence) {
          return assertRootResult(this.parseIntermediateType(precedence));
        }
        /**
         * The main parsing function. First it tries to parse the current state in the prefix step, and then it continues
         * to parse the state in the infix step.
         */
        parseIntermediateType(precedence) {
          const result = this.tryParslets(null, precedence);
          if (result === null) {
            throw new NoParsletFoundError(this.lexer.current);
          }
          return this.parseInfixIntermediateType(result, precedence);
        }
        /**
         * In the infix parsing step the parser continues to parse the current state with all parslets until none returns
         * a result.
         */
        parseInfixIntermediateType(left, precedence) {
          let result = this.tryParslets(left, precedence);
          while (result !== null) {
            left = result;
            result = this.tryParslets(left, precedence);
          }
          return left;
        }
        /**
         * Tries to parse the current state with all parslets in the grammar and returns the first non null result.
         */
        tryParslets(left, precedence) {
          for (const parslet of this.grammar) {
            const result = parslet(this, precedence, left);
            if (result !== null) {
              return result;
            }
          }
          return null;
        }
        /**
         * If the given type equals the current type of the {@link Lexer} advance the lexer. Return true if the lexer was
         * advanced.
         */
        consume(types) {
          if (!Array.isArray(types)) {
            types = [types];
          }
          if (types.includes(this.lexer.current.type)) {
            this._lexer = this.lexer.advance();
            return true;
          } else {
            return false;
          }
        }
        acceptLexerState(parser) {
          this._lexer = parser.lexer;
        }
      };
      __name(_Parser, "Parser");
      let Parser = _Parser;
      function isQuestionMarkUnknownType(next) {
        return next === "}" || next === "EOF" || next === "|" || next === "," || next === ")" || next === ">";
      }
      __name(isQuestionMarkUnknownType, "isQuestionMarkUnknownType");
      const nullableParslet = /* @__PURE__ */ __name((parser, precedence, left) => {
        const type = parser.lexer.current.type;
        const next = parser.lexer.next.type;
        const accept = left == null && type === "?" && !isQuestionMarkUnknownType(next) || left != null && type === "?";
        if (!accept) {
          return null;
        }
        parser.consume("?");
        if (left == null) {
          return {
            type: "JsdocTypeNullable",
            element: parser.parseType(Precedence.NULLABLE),
            meta: {
              position: "prefix"
            }
          };
        } else {
          return {
            type: "JsdocTypeNullable",
            element: assertRootResult(left),
            meta: {
              position: "suffix"
            }
          };
        }
      }, "nullableParslet");
      function composeParslet(options) {
        const parslet = /* @__PURE__ */ __name((parser, curPrecedence, left) => {
          const type = parser.lexer.current.type;
          const next = parser.lexer.next.type;
          if (left === null) {
            if ("parsePrefix" in options) {
              if (options.accept(type, next)) {
                return options.parsePrefix(parser);
              }
            }
          } else {
            if ("parseInfix" in options) {
              if (options.precedence > curPrecedence && options.accept(type, next)) {
                return options.parseInfix(parser, left);
              }
            }
          }
          return null;
        }, "parslet");
        Object.defineProperty(parslet, "name", {
          value: options.name
        });
        return parslet;
      }
      __name(composeParslet, "composeParslet");
      const optionalParslet = composeParslet({
        name: "optionalParslet",
        accept: /* @__PURE__ */ __name((type) => type === "=", "accept"),
        precedence: Precedence.OPTIONAL,
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("=");
          return {
            type: "JsdocTypeOptional",
            element: parser.parseType(Precedence.OPTIONAL),
            meta: {
              position: "prefix"
            }
          };
        }, "parsePrefix"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("=");
          return {
            type: "JsdocTypeOptional",
            element: assertRootResult(left),
            meta: {
              position: "suffix"
            }
          };
        }, "parseInfix")
      });
      const numberParslet = composeParslet({
        name: "numberParslet",
        accept: /* @__PURE__ */ __name((type) => type === "Number", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          const value = parseFloat(parser.lexer.current.text);
          parser.consume("Number");
          return {
            type: "JsdocTypeNumber",
            value
          };
        }, "parsePrefix")
      });
      const parenthesisParslet = composeParslet({
        name: "parenthesisParslet",
        accept: /* @__PURE__ */ __name((type) => type === "(", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("(");
          if (parser.consume(")")) {
            return {
              type: "JsdocTypeParameterList",
              elements: []
            };
          }
          const result = parser.parseIntermediateType(Precedence.ALL);
          if (!parser.consume(")")) {
            throw new Error("Unterminated parenthesis");
          }
          if (result.type === "JsdocTypeParameterList") {
            return result;
          } else if (result.type === "JsdocTypeKeyValue") {
            return {
              type: "JsdocTypeParameterList",
              elements: [result]
            };
          }
          return {
            type: "JsdocTypeParenthesis",
            element: assertRootResult(result)
          };
        }, "parsePrefix")
      });
      const specialTypesParslet = composeParslet({
        name: "specialTypesParslet",
        accept: /* @__PURE__ */ __name((type, next) => type === "?" && isQuestionMarkUnknownType(next) || type === "null" || type === "undefined" || type === "*", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          if (parser.consume("null")) {
            return {
              type: "JsdocTypeNull"
            };
          }
          if (parser.consume("undefined")) {
            return {
              type: "JsdocTypeUndefined"
            };
          }
          if (parser.consume("*")) {
            return {
              type: "JsdocTypeAny"
            };
          }
          if (parser.consume("?")) {
            return {
              type: "JsdocTypeUnknown"
            };
          }
          throw new Error("Unacceptable token: " + parser.lexer.current.text);
        }, "parsePrefix")
      });
      const notNullableParslet = composeParslet({
        name: "notNullableParslet",
        accept: /* @__PURE__ */ __name((type) => type === "!", "accept"),
        precedence: Precedence.NULLABLE,
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("!");
          return {
            type: "JsdocTypeNotNullable",
            element: parser.parseType(Precedence.NULLABLE),
            meta: {
              position: "prefix"
            }
          };
        }, "parsePrefix"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("!");
          return {
            type: "JsdocTypeNotNullable",
            element: assertRootResult(left),
            meta: {
              position: "suffix"
            }
          };
        }, "parseInfix")
      });
      function createParameterListParslet({ allowTrailingComma }) {
        return composeParslet({
          name: "parameterListParslet",
          accept: /* @__PURE__ */ __name((type) => type === ",", "accept"),
          precedence: Precedence.PARAMETER_LIST,
          parseInfix: /* @__PURE__ */ __name((parser, left) => {
            const elements = [
              assertPlainKeyValueOrRootResult(left)
            ];
            parser.consume(",");
            do {
              try {
                const next = parser.parseIntermediateType(Precedence.PARAMETER_LIST);
                elements.push(assertPlainKeyValueOrRootResult(next));
              } catch (e) {
                if (e instanceof NoParsletFoundError) {
                  break;
                } else {
                  throw e;
                }
              }
            } while (parser.consume(","));
            if (elements.length > 0 && elements.slice(0, -1).some((e) => e.type === "JsdocTypeVariadic")) {
              throw new Error("Only the last parameter may be a rest parameter");
            }
            return {
              type: "JsdocTypeParameterList",
              elements
            };
          }, "parseInfix")
        });
      }
      __name(createParameterListParslet, "createParameterListParslet");
      const genericParslet = composeParslet({
        name: "genericParslet",
        accept: /* @__PURE__ */ __name((type, next) => type === "<" || type === "." && next === "<", "accept"),
        precedence: Precedence.GENERIC,
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          const dot = parser.consume(".");
          parser.consume("<");
          const objects = [];
          let infer = false;
          if (parser.consume("infer")) {
            infer = true;
            const left2 = parser.parseIntermediateType(Precedence.SYMBOL);
            if (left2.type !== "JsdocTypeName") {
              throw new UnexpectedTypeError(left2, "A typescript asserts always has to have a name on the left side.");
            }
            objects.push(left2);
          } else {
            do {
              objects.push(parser.parseType(Precedence.PARAMETER_LIST));
            } while (parser.consume(","));
          }
          if (!parser.consume(">")) {
            throw new Error("Unterminated generic parameter list");
          }
          return Object.assign(Object.assign({ type: "JsdocTypeGeneric", left: assertRootResult(left), elements: objects }, infer ? { infer: true } : {}), { meta: {
            brackets: "angle",
            dot
          } });
        }, "parseInfix")
      });
      const unionParslet = composeParslet({
        name: "unionParslet",
        accept: /* @__PURE__ */ __name((type) => type === "|", "accept"),
        precedence: Precedence.UNION,
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("|");
          const elements = [];
          do {
            elements.push(parser.parseType(Precedence.UNION));
          } while (parser.consume("|"));
          return {
            type: "JsdocTypeUnion",
            elements: [assertRootResult(left), ...elements]
          };
        }, "parseInfix")
      });
      const baseGrammar = [
        nullableParslet,
        optionalParslet,
        numberParslet,
        parenthesisParslet,
        specialTypesParslet,
        notNullableParslet,
        createParameterListParslet({
          allowTrailingComma: true
        }),
        genericParslet,
        unionParslet,
        optionalParslet
      ];
      function createNamePathParslet({ allowSquareBracketsOnAnyType, allowJsdocNamePaths, pathGrammar: pathGrammar2 }) {
        return /* @__PURE__ */ __name(function namePathParslet(parser, precedence, left) {
          if (left == null || precedence >= Precedence.NAME_PATH) {
            return null;
          }
          const type = parser.lexer.current.type;
          const next = parser.lexer.next.type;
          const accept = type === "." && next !== "<" || type === "[" && (allowSquareBracketsOnAnyType || left.type === "JsdocTypeName") || allowJsdocNamePaths && (type === "~" || type === "#");
          if (!accept) {
            return null;
          }
          let pathType;
          let brackets = false;
          if (parser.consume(".")) {
            pathType = "property";
          } else if (parser.consume("[")) {
            pathType = "property-brackets";
            brackets = true;
          } else if (parser.consume("~")) {
            pathType = "inner";
          } else {
            parser.consume("#");
            pathType = "instance";
          }
          const pathParser = pathGrammar2 !== null ? new Parser(pathGrammar2, parser.lexer, parser) : parser;
          const parsed = pathParser.parseIntermediateType(Precedence.NAME_PATH);
          parser.acceptLexerState(pathParser);
          let right;
          switch (parsed.type) {
            case "JsdocTypeName":
              right = {
                type: "JsdocTypeProperty",
                value: parsed.value,
                meta: {
                  quote: void 0
                }
              };
              break;
            case "JsdocTypeNumber":
              right = {
                type: "JsdocTypeProperty",
                value: parsed.value.toString(10),
                meta: {
                  quote: void 0
                }
              };
              break;
            case "JsdocTypeStringValue":
              right = {
                type: "JsdocTypeProperty",
                value: parsed.value,
                meta: {
                  quote: parsed.meta.quote
                }
              };
              break;
            case "JsdocTypeSpecialNamePath":
              if (parsed.specialType === "event") {
                right = parsed;
              } else {
                throw new UnexpectedTypeError(parsed, "Type 'JsdocTypeSpecialNamePath' is only allowed with specialType 'event'");
              }
              break;
            default:
              throw new UnexpectedTypeError(parsed, "Expecting 'JsdocTypeName', 'JsdocTypeNumber', 'JsdocStringValue' or 'JsdocTypeSpecialNamePath'");
          }
          if (brackets && !parser.consume("]")) {
            const token = parser.lexer.current;
            throw new Error(`Unterminated square brackets. Next token is '${token.type}' with text '${token.text}'`);
          }
          return {
            type: "JsdocTypeNamePath",
            left: assertRootResult(left),
            right,
            pathType
          };
        }, "namePathParslet");
      }
      __name(createNamePathParslet, "createNamePathParslet");
      function createNameParslet({ allowedAdditionalTokens }) {
        return composeParslet({
          name: "nameParslet",
          accept: /* @__PURE__ */ __name((type) => type === "Identifier" || type === "this" || type === "new" || allowedAdditionalTokens.includes(type), "accept"),
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            const { type, text } = parser.lexer.current;
            parser.consume(type);
            return {
              type: "JsdocTypeName",
              value: text
            };
          }, "parsePrefix")
        });
      }
      __name(createNameParslet, "createNameParslet");
      const stringValueParslet = composeParslet({
        name: "stringValueParslet",
        accept: /* @__PURE__ */ __name((type) => type === "StringValue", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          const text = parser.lexer.current.text;
          parser.consume("StringValue");
          return {
            type: "JsdocTypeStringValue",
            value: text.slice(1, -1),
            meta: {
              quote: text[0] === "'" ? "single" : "double"
            }
          };
        }, "parsePrefix")
      });
      function createSpecialNamePathParslet({ pathGrammar: pathGrammar2, allowedTypes }) {
        return composeParslet({
          name: "specialNamePathParslet",
          accept: /* @__PURE__ */ __name((type) => allowedTypes.includes(type), "accept"),
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            const type = parser.lexer.current.type;
            parser.consume(type);
            if (!parser.consume(":")) {
              return {
                type: "JsdocTypeName",
                value: type
              };
            }
            let result;
            let token = parser.lexer.current;
            if (parser.consume("StringValue")) {
              result = {
                type: "JsdocTypeSpecialNamePath",
                value: token.text.slice(1, -1),
                specialType: type,
                meta: {
                  quote: token.text[0] === "'" ? "single" : "double"
                }
              };
            } else {
              let value = "";
              const allowed = ["Identifier", "@", "/"];
              while (allowed.some((type2) => parser.consume(type2))) {
                value += token.text;
                token = parser.lexer.current;
              }
              result = {
                type: "JsdocTypeSpecialNamePath",
                value,
                specialType: type,
                meta: {
                  quote: void 0
                }
              };
            }
            const moduleParser = new Parser(pathGrammar2, parser.lexer, parser);
            const moduleResult = moduleParser.parseInfixIntermediateType(result, Precedence.ALL);
            parser.acceptLexerState(moduleParser);
            return assertRootResult(moduleResult);
          }, "parsePrefix")
        });
      }
      __name(createSpecialNamePathParslet, "createSpecialNamePathParslet");
      const basePathGrammar = [
        createNameParslet({
          allowedAdditionalTokens: ["external", "module"]
        }),
        stringValueParslet,
        numberParslet,
        createNamePathParslet({
          allowSquareBracketsOnAnyType: false,
          allowJsdocNamePaths: true,
          pathGrammar: null
        })
      ];
      const pathGrammar = [
        ...basePathGrammar,
        createSpecialNamePathParslet({
          allowedTypes: ["event"],
          pathGrammar: basePathGrammar
        })
      ];
      function getParameters(value) {
        let parameters;
        if (value.type === "JsdocTypeParameterList") {
          parameters = value.elements;
        } else if (value.type === "JsdocTypeParenthesis") {
          parameters = [value.element];
        } else {
          throw new UnexpectedTypeError(value);
        }
        return parameters.map((p) => assertPlainKeyValueOrRootResult(p));
      }
      __name(getParameters, "getParameters");
      function getUnnamedParameters(value) {
        const parameters = getParameters(value);
        if (parameters.some((p) => p.type === "JsdocTypeKeyValue")) {
          throw new Error("No parameter should be named");
        }
        return parameters;
      }
      __name(getUnnamedParameters, "getUnnamedParameters");
      function createFunctionParslet({ allowNamedParameters, allowNoReturnType, allowWithoutParenthesis, allowNewAsFunctionKeyword }) {
        return composeParslet({
          name: "functionParslet",
          accept: /* @__PURE__ */ __name((type, next) => type === "function" || allowNewAsFunctionKeyword && type === "new" && next === "(", "accept"),
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            const newKeyword = parser.consume("new");
            parser.consume("function");
            const hasParenthesis = parser.lexer.current.type === "(";
            if (!hasParenthesis) {
              if (!allowWithoutParenthesis) {
                throw new Error("function is missing parameter list");
              }
              return {
                type: "JsdocTypeName",
                value: "function"
              };
            }
            let result = {
              type: "JsdocTypeFunction",
              parameters: [],
              arrow: false,
              constructor: newKeyword,
              parenthesis: hasParenthesis
            };
            const value = parser.parseIntermediateType(Precedence.FUNCTION);
            if (allowNamedParameters === void 0) {
              result.parameters = getUnnamedParameters(value);
            } else if (newKeyword && value.type === "JsdocTypeFunction" && value.arrow) {
              result = value;
              result.constructor = true;
              return result;
            } else {
              result.parameters = getParameters(value);
              for (const p of result.parameters) {
                if (p.type === "JsdocTypeKeyValue" && !allowNamedParameters.includes(p.key)) {
                  throw new Error(`only allowed named parameters are ${allowNamedParameters.join(", ")} but got ${p.type}`);
                }
              }
            }
            if (parser.consume(":")) {
              result.returnType = parser.parseType(Precedence.PREFIX);
            } else {
              if (!allowNoReturnType) {
                throw new Error("function is missing return type");
              }
            }
            return result;
          }, "parsePrefix")
        });
      }
      __name(createFunctionParslet, "createFunctionParslet");
      function createVariadicParslet({ allowPostfix, allowEnclosingBrackets }) {
        return composeParslet({
          name: "variadicParslet",
          accept: /* @__PURE__ */ __name((type) => type === "...", "accept"),
          precedence: Precedence.PREFIX,
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            parser.consume("...");
            const brackets = allowEnclosingBrackets && parser.consume("[");
            try {
              const element = parser.parseType(Precedence.PREFIX);
              if (brackets && !parser.consume("]")) {
                throw new Error("Unterminated variadic type. Missing ']'");
              }
              return {
                type: "JsdocTypeVariadic",
                element: assertRootResult(element),
                meta: {
                  position: "prefix",
                  squareBrackets: brackets
                }
              };
            } catch (e) {
              if (e instanceof NoParsletFoundError) {
                if (brackets) {
                  throw new Error("Empty square brackets for variadic are not allowed.");
                }
                return {
                  type: "JsdocTypeVariadic",
                  meta: {
                    position: void 0,
                    squareBrackets: false
                  }
                };
              } else {
                throw e;
              }
            }
          }, "parsePrefix"),
          parseInfix: allowPostfix ? (parser, left) => {
            parser.consume("...");
            return {
              type: "JsdocTypeVariadic",
              element: assertRootResult(left),
              meta: {
                position: "suffix",
                squareBrackets: false
              }
            };
          } : void 0
        });
      }
      __name(createVariadicParslet, "createVariadicParslet");
      const symbolParslet = composeParslet({
        name: "symbolParslet",
        accept: /* @__PURE__ */ __name((type) => type === "(", "accept"),
        precedence: Precedence.SYMBOL,
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          if (left.type !== "JsdocTypeName") {
            throw new Error("Symbol expects a name on the left side. (Reacting on '(')");
          }
          parser.consume("(");
          const result = {
            type: "JsdocTypeSymbol",
            value: left.value
          };
          if (!parser.consume(")")) {
            const next = parser.parseIntermediateType(Precedence.SYMBOL);
            result.element = assertNumberOrVariadicNameResult(next);
            if (!parser.consume(")")) {
              throw new Error("Symbol does not end after value");
            }
          }
          return result;
        }, "parseInfix")
      });
      const arrayBracketsParslet = composeParslet({
        name: "arrayBracketsParslet",
        precedence: Precedence.ARRAY_BRACKETS,
        accept: /* @__PURE__ */ __name((type, next) => type === "[" && next === "]", "accept"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("[");
          parser.consume("]");
          return {
            type: "JsdocTypeGeneric",
            left: {
              type: "JsdocTypeName",
              value: "Array"
            },
            elements: [
              assertRootResult(left)
            ],
            meta: {
              brackets: "square",
              dot: false
            }
          };
        }, "parseInfix")
      });
      function createObjectParslet({ objectFieldGrammar: objectFieldGrammar2, allowKeyTypes }) {
        return composeParslet({
          name: "objectParslet",
          accept: /* @__PURE__ */ __name((type) => type === "{", "accept"),
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            parser.consume("{");
            const result = {
              type: "JsdocTypeObject",
              meta: {
                separator: "comma"
              },
              elements: []
            };
            if (!parser.consume("}")) {
              let separator;
              const fieldParser = new Parser(objectFieldGrammar2, parser.lexer, parser);
              while (true) {
                fieldParser.acceptLexerState(parser);
                let field = fieldParser.parseIntermediateType(Precedence.OBJECT);
                parser.acceptLexerState(fieldParser);
                if (field === void 0 && allowKeyTypes) {
                  field = parser.parseIntermediateType(Precedence.OBJECT);
                }
                let optional = false;
                if (field.type === "JsdocTypeNullable") {
                  optional = true;
                  field = field.element;
                }
                if (field.type === "JsdocTypeNumber" || field.type === "JsdocTypeName" || field.type === "JsdocTypeStringValue") {
                  let quote2;
                  if (field.type === "JsdocTypeStringValue") {
                    quote2 = field.meta.quote;
                  }
                  result.elements.push({
                    type: "JsdocTypeObjectField",
                    key: field.value.toString(),
                    right: void 0,
                    optional,
                    readonly: false,
                    meta: {
                      quote: quote2
                    }
                  });
                } else if (field.type === "JsdocTypeObjectField" || field.type === "JsdocTypeJsdocObjectField") {
                  result.elements.push(field);
                } else {
                  throw new UnexpectedTypeError(field);
                }
                if (parser.lexer.current.startOfLine) {
                  separator = "linebreak";
                  parser.consume(",") || parser.consume(";");
                } else if (parser.consume(",")) {
                  separator = "comma";
                } else if (parser.consume(";")) {
                  separator = "semicolon";
                } else {
                  break;
                }
                const type = parser.lexer.current.type;
                if (type === "}") {
                  break;
                }
              }
              result.meta.separator = separator !== null && separator !== void 0 ? separator : "comma";
              if (separator === "linebreak") {
                result.meta.propertyIndent = "  ";
              }
              if (!parser.consume("}")) {
                throw new Error("Unterminated record type. Missing '}'");
              }
            }
            return result;
          }, "parsePrefix")
        });
      }
      __name(createObjectParslet, "createObjectParslet");
      function createObjectFieldParslet({ allowSquaredProperties, allowKeyTypes, allowReadonly, allowOptional }) {
        return composeParslet({
          name: "objectFieldParslet",
          precedence: Precedence.KEY_VALUE,
          accept: /* @__PURE__ */ __name((type) => type === ":", "accept"),
          parseInfix: /* @__PURE__ */ __name((parser, left) => {
            var _a;
            let optional = false;
            let readonlyProperty = false;
            if (allowOptional && left.type === "JsdocTypeNullable") {
              optional = true;
              left = left.element;
            }
            if (allowReadonly && left.type === "JsdocTypeReadonlyProperty") {
              readonlyProperty = true;
              left = left.element;
            }
            const parentParser = (_a = parser.baseParser) !== null && _a !== void 0 ? _a : parser;
            parentParser.acceptLexerState(parser);
            if (left.type === "JsdocTypeNumber" || left.type === "JsdocTypeName" || left.type === "JsdocTypeStringValue" || isSquaredProperty(left)) {
              if (isSquaredProperty(left) && !allowSquaredProperties) {
                throw new UnexpectedTypeError(left);
              }
              parentParser.consume(":");
              let quote2;
              if (left.type === "JsdocTypeStringValue") {
                quote2 = left.meta.quote;
              }
              const right = parentParser.parseType(Precedence.KEY_VALUE);
              parser.acceptLexerState(parentParser);
              return {
                type: "JsdocTypeObjectField",
                key: isSquaredProperty(left) ? left : left.value.toString(),
                right,
                optional,
                readonly: readonlyProperty,
                meta: {
                  quote: quote2
                }
              };
            } else {
              if (!allowKeyTypes) {
                throw new UnexpectedTypeError(left);
              }
              parentParser.consume(":");
              const right = parentParser.parseType(Precedence.KEY_VALUE);
              parser.acceptLexerState(parentParser);
              return {
                type: "JsdocTypeJsdocObjectField",
                left: assertRootResult(left),
                right
              };
            }
          }, "parseInfix")
        });
      }
      __name(createObjectFieldParslet, "createObjectFieldParslet");
      function createKeyValueParslet({ allowOptional, allowVariadic }) {
        return composeParslet({
          name: "keyValueParslet",
          precedence: Precedence.KEY_VALUE,
          accept: /* @__PURE__ */ __name((type) => type === ":", "accept"),
          parseInfix: /* @__PURE__ */ __name((parser, left) => {
            let optional = false;
            let variadic = false;
            if (allowOptional && left.type === "JsdocTypeNullable") {
              optional = true;
              left = left.element;
            }
            if (allowVariadic && left.type === "JsdocTypeVariadic" && left.element !== void 0) {
              variadic = true;
              left = left.element;
            }
            if (left.type !== "JsdocTypeName") {
              throw new UnexpectedTypeError(left);
            }
            parser.consume(":");
            const right = parser.parseType(Precedence.KEY_VALUE);
            return {
              type: "JsdocTypeKeyValue",
              key: left.value,
              right,
              optional,
              variadic
            };
          }, "parseInfix")
        });
      }
      __name(createKeyValueParslet, "createKeyValueParslet");
      const jsdocBaseGrammar = [
        ...baseGrammar,
        createFunctionParslet({
          allowWithoutParenthesis: true,
          allowNamedParameters: ["this", "new"],
          allowNoReturnType: true,
          allowNewAsFunctionKeyword: false
        }),
        stringValueParslet,
        createSpecialNamePathParslet({
          allowedTypes: ["module", "external", "event"],
          pathGrammar
        }),
        createVariadicParslet({
          allowEnclosingBrackets: true,
          allowPostfix: true
        }),
        createNameParslet({
          allowedAdditionalTokens: ["keyof"]
        }),
        symbolParslet,
        arrayBracketsParslet,
        createNamePathParslet({
          allowSquareBracketsOnAnyType: false,
          allowJsdocNamePaths: true,
          pathGrammar
        })
      ];
      const jsdocGrammar = [
        ...jsdocBaseGrammar,
        createObjectParslet({
          // jsdoc syntax allows full types as keys, so we need to pull in the full grammar here
          // we leave out the object type deliberately
          objectFieldGrammar: [
            createNameParslet({
              allowedAdditionalTokens: ["typeof", "module", "in"]
            }),
            createObjectFieldParslet({
              allowSquaredProperties: false,
              allowKeyTypes: true,
              allowOptional: false,
              allowReadonly: false
            }),
            ...jsdocBaseGrammar
          ],
          allowKeyTypes: true
        }),
        createKeyValueParslet({
          allowOptional: true,
          allowVariadic: true
        })
      ];
      const typeOfParslet = composeParslet({
        name: "typeOfParslet",
        accept: /* @__PURE__ */ __name((type) => type === "typeof", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("typeof");
          return {
            type: "JsdocTypeTypeof",
            element: parser.parseType(Precedence.KEY_OF_TYPE_OF)
          };
        }, "parsePrefix")
      });
      const objectFieldGrammar$1 = [
        createNameParslet({
          allowedAdditionalTokens: ["typeof", "module", "keyof", "event", "external", "in"]
        }),
        nullableParslet,
        optionalParslet,
        stringValueParslet,
        numberParslet,
        createObjectFieldParslet({
          allowSquaredProperties: false,
          allowKeyTypes: false,
          allowOptional: false,
          allowReadonly: false
        })
      ];
      const closureGrammar = [
        ...baseGrammar,
        createObjectParslet({
          allowKeyTypes: false,
          objectFieldGrammar: objectFieldGrammar$1
        }),
        createNameParslet({
          allowedAdditionalTokens: ["event", "external", "in"]
        }),
        typeOfParslet,
        createFunctionParslet({
          allowWithoutParenthesis: false,
          allowNamedParameters: ["this", "new"],
          allowNoReturnType: true,
          allowNewAsFunctionKeyword: false
        }),
        createVariadicParslet({
          allowEnclosingBrackets: false,
          allowPostfix: false
        }),
        // additional name parslet is needed for some special cases
        createNameParslet({
          allowedAdditionalTokens: ["keyof"]
        }),
        createSpecialNamePathParslet({
          allowedTypes: ["module"],
          pathGrammar
        }),
        createNamePathParslet({
          allowSquareBracketsOnAnyType: false,
          allowJsdocNamePaths: true,
          pathGrammar
        }),
        createKeyValueParslet({
          allowOptional: false,
          allowVariadic: false
        }),
        symbolParslet
      ];
      const assertsParslet = composeParslet({
        name: "assertsParslet",
        accept: /* @__PURE__ */ __name((type) => type === "asserts", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("asserts");
          const left = parser.parseIntermediateType(Precedence.SYMBOL);
          if (left.type !== "JsdocTypeName") {
            throw new UnexpectedTypeError(left, "A typescript asserts always has to have a name on the left side.");
          }
          if (!parser.consume("is")) {
            return {
              type: "JsdocTypeAssertsPlain",
              element: left
            };
          }
          return {
            type: "JsdocTypeAsserts",
            left,
            right: assertRootResult(parser.parseIntermediateType(Precedence.INFIX))
          };
        }, "parsePrefix")
      });
      function createTupleParslet({ allowQuestionMark }) {
        return composeParslet({
          name: "tupleParslet",
          accept: /* @__PURE__ */ __name((type) => type === "[", "accept"),
          parsePrefix: /* @__PURE__ */ __name((parser) => {
            parser.consume("[");
            const result = {
              type: "JsdocTypeTuple",
              elements: []
            };
            if (parser.consume("]")) {
              return result;
            }
            const typeList = parser.parseIntermediateType(Precedence.ALL);
            if (typeList.type === "JsdocTypeParameterList") {
              if (typeList.elements[0].type === "JsdocTypeKeyValue") {
                result.elements = typeList.elements.map(assertPlainKeyValueResult);
              } else {
                result.elements = typeList.elements.map(assertRootResult);
              }
            } else {
              if (typeList.type === "JsdocTypeKeyValue") {
                result.elements = [assertPlainKeyValueResult(typeList)];
              } else {
                result.elements = [assertRootResult(typeList)];
              }
            }
            if (!parser.consume("]")) {
              throw new Error("Unterminated '['");
            }
            if (result.elements.some((e) => e.type === "JsdocTypeUnknown")) {
              throw new Error("Question mark in tuple not allowed");
            }
            return result;
          }, "parsePrefix")
        });
      }
      __name(createTupleParslet, "createTupleParslet");
      const keyOfParslet = composeParslet({
        name: "keyOfParslet",
        accept: /* @__PURE__ */ __name((type) => type === "keyof", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("keyof");
          return {
            type: "JsdocTypeKeyof",
            element: assertRootResult(parser.parseType(Precedence.KEY_OF_TYPE_OF))
          };
        }, "parsePrefix")
      });
      const importParslet = composeParslet({
        name: "importParslet",
        accept: /* @__PURE__ */ __name((type) => type === "import", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("import");
          if (!parser.consume("(")) {
            throw new Error("Missing parenthesis after import keyword");
          }
          const path = parser.parseType(Precedence.PREFIX);
          if (path.type !== "JsdocTypeStringValue") {
            throw new Error("Only string values are allowed as paths for imports");
          }
          if (!parser.consume(")")) {
            throw new Error("Missing closing parenthesis after import keyword");
          }
          return {
            type: "JsdocTypeImport",
            element: path
          };
        }, "parsePrefix")
      });
      const readonlyPropertyParslet = composeParslet({
        name: "readonlyPropertyParslet",
        accept: /* @__PURE__ */ __name((type) => type === "readonly", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("readonly");
          return {
            type: "JsdocTypeReadonlyProperty",
            element: parser.parseIntermediateType(Precedence.KEY_VALUE)
          };
        }, "parsePrefix")
      });
      const arrowFunctionParslet = composeParslet({
        name: "arrowFunctionParslet",
        precedence: Precedence.ARROW,
        accept: /* @__PURE__ */ __name((type) => type === "=>", "accept"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("=>");
          return {
            type: "JsdocTypeFunction",
            parameters: getParameters(left).map(assertPlainKeyValueOrNameResult),
            arrow: true,
            constructor: false,
            parenthesis: true,
            returnType: parser.parseType(Precedence.OBJECT)
          };
        }, "parseInfix")
      });
      const genericArrowFunctionParslet = composeParslet({
        name: "genericArrowFunctionParslet",
        accept: /* @__PURE__ */ __name((type) => type === "<", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          const typeParameters = [];
          parser.consume("<");
          do {
            let defaultValue;
            let name = parser.parseIntermediateType(Precedence.SYMBOL);
            if (name.type === "JsdocTypeOptional") {
              name = name.element;
              defaultValue = parser.parseType(Precedence.SYMBOL);
            }
            if (name.type !== "JsdocTypeName") {
              throw new UnexpectedTypeError(name);
            }
            let constraint;
            if (parser.consume("extends")) {
              constraint = parser.parseType(Precedence.SYMBOL);
              if (constraint.type === "JsdocTypeOptional") {
                constraint = constraint.element;
                defaultValue = parser.parseType(Precedence.SYMBOL);
              }
            }
            const typeParameter = {
              type: "JsdocTypeTypeParameter",
              name
            };
            if (constraint !== void 0) {
              typeParameter.constraint = constraint;
            }
            if (defaultValue !== void 0) {
              typeParameter.defaultValue = defaultValue;
            }
            typeParameters.push(typeParameter);
            if (parser.consume(">")) {
              break;
            }
          } while (parser.consume(","));
          const functionBase = parser.parseIntermediateType(Precedence.SYMBOL);
          functionBase.typeParameters = typeParameters;
          return functionBase;
        }, "parsePrefix")
      });
      const intersectionParslet = composeParslet({
        name: "intersectionParslet",
        accept: /* @__PURE__ */ __name((type) => type === "&", "accept"),
        precedence: Precedence.INTERSECTION,
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("&");
          const elements = [];
          do {
            elements.push(parser.parseType(Precedence.INTERSECTION));
          } while (parser.consume("&"));
          return {
            type: "JsdocTypeIntersection",
            elements: [assertRootResult(left), ...elements]
          };
        }, "parseInfix")
      });
      const predicateParslet = composeParslet({
        name: "predicateParslet",
        precedence: Precedence.INFIX,
        accept: /* @__PURE__ */ __name((type) => type === "is", "accept"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          if (left.type !== "JsdocTypeName") {
            throw new UnexpectedTypeError(left, "A typescript predicate always has to have a name on the left side.");
          }
          parser.consume("is");
          return {
            type: "JsdocTypePredicate",
            left,
            right: assertRootResult(parser.parseIntermediateType(Precedence.INFIX))
          };
        }, "parseInfix")
      });
      const objectSquaredPropertyParslet = composeParslet({
        name: "objectSquareBracketPropertyParslet",
        accept: /* @__PURE__ */ __name((type) => type === "[", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          if (parser.baseParser === void 0) {
            throw new Error("Only allowed inside object grammar");
          }
          parser.consume("[");
          const key = parser.lexer.current.text;
          parser.consume("Identifier");
          let result;
          if (parser.consume(":")) {
            const parentParser = parser.baseParser;
            parentParser.acceptLexerState(parser);
            result = {
              type: "JsdocTypeIndexSignature",
              key,
              right: parentParser.parseType(Precedence.INDEX_BRACKETS)
            };
            parser.acceptLexerState(parentParser);
          } else if (parser.consume("in")) {
            const parentParser = parser.baseParser;
            parentParser.acceptLexerState(parser);
            result = {
              type: "JsdocTypeMappedType",
              key,
              right: parentParser.parseType(Precedence.ARRAY_BRACKETS)
            };
            parser.acceptLexerState(parentParser);
          } else {
            throw new Error("Missing ':' or 'in' inside square bracketed property.");
          }
          if (!parser.consume("]")) {
            throw new Error("Unterminated square brackets");
          }
          return result;
        }, "parsePrefix")
      });
      const readonlyArrayParslet = composeParslet({
        name: "readonlyArrayParslet",
        accept: /* @__PURE__ */ __name((type) => type === "readonly", "accept"),
        parsePrefix: /* @__PURE__ */ __name((parser) => {
          parser.consume("readonly");
          return {
            type: "JsdocTypeReadonlyArray",
            element: assertArrayOrTupleResult(parser.parseIntermediateType(Precedence.ALL))
          };
        }, "parsePrefix")
      });
      const conditionalParslet = composeParslet({
        name: "conditionalParslet",
        precedence: Precedence.INFIX,
        accept: /* @__PURE__ */ __name((type) => type === "extends", "accept"),
        parseInfix: /* @__PURE__ */ __name((parser, left) => {
          parser.consume("extends");
          const extendsType = parser.parseType(Precedence.KEY_OF_TYPE_OF).element;
          const trueType = parser.parseType(Precedence.INFIX);
          parser.consume(":");
          return {
            type: "JsdocTypeConditional",
            checksType: assertRootResult(left),
            extendsType,
            trueType,
            falseType: parser.parseType(Precedence.INFIX)
          };
        }, "parseInfix")
      });
      const objectFieldGrammar = [
        readonlyPropertyParslet,
        createNameParslet({
          allowedAdditionalTokens: ["typeof", "module", "keyof", "event", "external", "in"]
        }),
        nullableParslet,
        optionalParslet,
        stringValueParslet,
        numberParslet,
        createObjectFieldParslet({
          allowSquaredProperties: true,
          allowKeyTypes: false,
          allowOptional: true,
          allowReadonly: true
        }),
        objectSquaredPropertyParslet
      ];
      const typescriptGrammar = [
        ...baseGrammar,
        createObjectParslet({
          allowKeyTypes: false,
          objectFieldGrammar
        }),
        readonlyArrayParslet,
        typeOfParslet,
        keyOfParslet,
        importParslet,
        stringValueParslet,
        createFunctionParslet({
          allowWithoutParenthesis: true,
          allowNoReturnType: false,
          allowNamedParameters: ["this", "new", "args"],
          allowNewAsFunctionKeyword: true
        }),
        createTupleParslet({
          allowQuestionMark: false
        }),
        createVariadicParslet({
          allowEnclosingBrackets: false,
          allowPostfix: false
        }),
        assertsParslet,
        conditionalParslet,
        createNameParslet({
          allowedAdditionalTokens: ["event", "external", "in"]
        }),
        createSpecialNamePathParslet({
          allowedTypes: ["module"],
          pathGrammar
        }),
        arrayBracketsParslet,
        arrowFunctionParslet,
        genericArrowFunctionParslet,
        createNamePathParslet({
          allowSquareBracketsOnAnyType: true,
          allowJsdocNamePaths: false,
          pathGrammar
        }),
        intersectionParslet,
        predicateParslet,
        createKeyValueParslet({
          allowVariadic: true,
          allowOptional: true
        })
      ];
      function parse3(expression, mode) {
        switch (mode) {
          case "closure":
            return new Parser(closureGrammar, expression).parse();
          case "jsdoc":
            return new Parser(jsdocGrammar, expression).parse();
          case "typescript":
            return new Parser(typescriptGrammar, expression).parse();
        }
      }
      __name(parse3, "parse");
      function tryParse(expression, modes = ["typescript", "closure", "jsdoc"]) {
        let error;
        for (const mode of modes) {
          try {
            return parse3(expression, mode);
          } catch (e) {
            error = e;
          }
        }
        throw error;
      }
      __name(tryParse, "tryParse");
      function transform(rules2, parseResult) {
        const rule = rules2[parseResult.type];
        if (rule === void 0) {
          throw new Error(`In this set of transform rules exists no rule for type ${parseResult.type}.`);
        }
        return rule(parseResult, (aParseResult) => transform(rules2, aParseResult));
      }
      __name(transform, "transform");
      function notAvailableTransform(parseResult) {
        throw new Error("This transform is not available. Are you trying the correct parsing mode?");
      }
      __name(notAvailableTransform, "notAvailableTransform");
      function extractSpecialParams(source) {
        const result = {
          params: []
        };
        for (const param of source.parameters) {
          if (param.type === "JsdocTypeKeyValue") {
            if (param.key === "this") {
              result.this = param.right;
            } else if (param.key === "new") {
              result.new = param.right;
            } else {
              result.params.push(param);
            }
          } else {
            result.params.push(param);
          }
        }
        return result;
      }
      __name(extractSpecialParams, "extractSpecialParams");
      function applyPosition(position, target, value) {
        return position === "prefix" ? value + target : target + value;
      }
      __name(applyPosition, "applyPosition");
      function quote(value, quote2) {
        switch (quote2) {
          case "double":
            return `"${value}"`;
          case "single":
            return `'${value}'`;
          case void 0:
            return value;
        }
      }
      __name(quote, "quote");
      function stringifyRules2() {
        return {
          JsdocTypeParenthesis: /* @__PURE__ */ __name((result, transform2) => `(${result.element !== void 0 ? transform2(result.element) : ""})`, "JsdocTypeParenthesis"),
          JsdocTypeKeyof: /* @__PURE__ */ __name((result, transform2) => `keyof ${transform2(result.element)}`, "JsdocTypeKeyof"),
          JsdocTypeFunction: /* @__PURE__ */ __name((result, transform2) => {
            var _a;
            if (!result.arrow) {
              let stringified = result.constructor ? "new" : "function";
              if (!result.parenthesis) {
                return stringified;
              }
              stringified += `(${result.parameters.map(transform2).join(", ")})`;
              if (result.returnType !== void 0) {
                stringified += `: ${transform2(result.returnType)}`;
              }
              return stringified;
            } else {
              if (result.returnType === void 0) {
                throw new Error("Arrow function needs a return type.");
              }
              let stringified = `${result.typeParameters !== void 0 ? `<${(_a = result.typeParameters.map(transform2).join(", ")) !== null && _a !== void 0 ? _a : ""}>` : ""}(${result.parameters.map(transform2).join(", ")}) => ${transform2(result.returnType)}`;
              if (result.constructor) {
                stringified = "new " + stringified;
              }
              return stringified;
            }
          }, "JsdocTypeFunction"),
          JsdocTypeName: /* @__PURE__ */ __name((result) => result.value, "JsdocTypeName"),
          JsdocTypeTuple: /* @__PURE__ */ __name((result, transform2) => `[${result.elements.map(transform2).join(", ")}]`, "JsdocTypeTuple"),
          JsdocTypeVariadic: /* @__PURE__ */ __name((result, transform2) => result.meta.position === void 0 ? "..." : applyPosition(result.meta.position, transform2(result.element), "..."), "JsdocTypeVariadic"),
          JsdocTypeNamePath: /* @__PURE__ */ __name((result, transform2) => {
            const left = transform2(result.left);
            const right = transform2(result.right);
            switch (result.pathType) {
              case "inner":
                return `${left}~${right}`;
              case "instance":
                return `${left}#${right}`;
              case "property":
                return `${left}.${right}`;
              case "property-brackets":
                return `${left}[${right}]`;
            }
          }, "JsdocTypeNamePath"),
          JsdocTypeStringValue: /* @__PURE__ */ __name((result) => quote(result.value, result.meta.quote), "JsdocTypeStringValue"),
          JsdocTypeAny: /* @__PURE__ */ __name(() => "*", "JsdocTypeAny"),
          JsdocTypeGeneric: /* @__PURE__ */ __name((result, transform2) => {
            if (result.meta.brackets === "square") {
              const element = result.elements[0];
              const transformed = transform2(element);
              if (element.type === "JsdocTypeUnion" || element.type === "JsdocTypeIntersection") {
                return `(${transformed})[]`;
              } else {
                return `${transformed}[]`;
              }
            } else {
              return `${transform2(result.left)}${result.meta.dot ? "." : ""}<${result.infer === true ? "infer " : ""}${result.elements.map(transform2).join(", ")}>`;
            }
          }, "JsdocTypeGeneric"),
          JsdocTypeImport: /* @__PURE__ */ __name((result, transform2) => `import(${transform2(result.element)})`, "JsdocTypeImport"),
          JsdocTypeObjectField: /* @__PURE__ */ __name((result, transform2) => {
            let text = "";
            if (result.readonly) {
              text += "readonly ";
            }
            if (typeof result.key === "string") {
              text += quote(result.key, result.meta.quote);
            } else {
              text += transform2(result.key);
            }
            if (result.optional) {
              text += "?";
            }
            if (result.right === void 0) {
              return text;
            } else {
              return text + `: ${transform2(result.right)}`;
            }
          }, "JsdocTypeObjectField"),
          JsdocTypeJsdocObjectField: /* @__PURE__ */ __name((result, transform2) => {
            return `${transform2(result.left)}: ${transform2(result.right)}`;
          }, "JsdocTypeJsdocObjectField"),
          JsdocTypeKeyValue: /* @__PURE__ */ __name((result, transform2) => {
            let text = result.key;
            if (result.optional) {
              text += "?";
            }
            if (result.variadic) {
              text = "..." + text;
            }
            if (result.right === void 0) {
              return text;
            } else {
              return text + `: ${transform2(result.right)}`;
            }
          }, "JsdocTypeKeyValue"),
          JsdocTypeSpecialNamePath: /* @__PURE__ */ __name((result) => `${result.specialType}:${quote(result.value, result.meta.quote)}`, "JsdocTypeSpecialNamePath"),
          JsdocTypeNotNullable: /* @__PURE__ */ __name((result, transform2) => applyPosition(result.meta.position, transform2(result.element), "!"), "JsdocTypeNotNullable"),
          JsdocTypeNull: /* @__PURE__ */ __name(() => "null", "JsdocTypeNull"),
          JsdocTypeNullable: /* @__PURE__ */ __name((result, transform2) => applyPosition(result.meta.position, transform2(result.element), "?"), "JsdocTypeNullable"),
          JsdocTypeNumber: /* @__PURE__ */ __name((result) => result.value.toString(), "JsdocTypeNumber"),
          JsdocTypeObject: /* @__PURE__ */ __name((result, transform2) => {
            var _a, _b;
            return `{${(result.meta.separator === "linebreak" && result.elements.length > 1 ? "\n" + ((_a = result.meta.propertyIndent) !== null && _a !== void 0 ? _a : "") : "") + result.elements.map(transform2).join(result.meta.separator === "comma" ? ", " : result.meta.separator === "linebreak" ? "\n" + ((_b = result.meta.propertyIndent) !== null && _b !== void 0 ? _b : "") : "; ") + (result.meta.separator === "linebreak" && result.elements.length > 1 ? "\n" : "")}}`;
          }, "JsdocTypeObject"),
          JsdocTypeOptional: /* @__PURE__ */ __name((result, transform2) => applyPosition(result.meta.position, transform2(result.element), "="), "JsdocTypeOptional"),
          JsdocTypeSymbol: /* @__PURE__ */ __name((result, transform2) => `${result.value}(${result.element !== void 0 ? transform2(result.element) : ""})`, "JsdocTypeSymbol"),
          JsdocTypeTypeof: /* @__PURE__ */ __name((result, transform2) => `typeof ${transform2(result.element)}`, "JsdocTypeTypeof"),
          JsdocTypeUndefined: /* @__PURE__ */ __name(() => "undefined", "JsdocTypeUndefined"),
          JsdocTypeUnion: /* @__PURE__ */ __name((result, transform2) => result.elements.map(transform2).join(" | "), "JsdocTypeUnion"),
          JsdocTypeUnknown: /* @__PURE__ */ __name(() => "?", "JsdocTypeUnknown"),
          JsdocTypeIntersection: /* @__PURE__ */ __name((result, transform2) => result.elements.map(transform2).join(" & "), "JsdocTypeIntersection"),
          JsdocTypeProperty: /* @__PURE__ */ __name((result) => quote(result.value, result.meta.quote), "JsdocTypeProperty"),
          JsdocTypePredicate: /* @__PURE__ */ __name((result, transform2) => `${transform2(result.left)} is ${transform2(result.right)}`, "JsdocTypePredicate"),
          JsdocTypeIndexSignature: /* @__PURE__ */ __name((result, transform2) => `[${result.key}: ${transform2(result.right)}]`, "JsdocTypeIndexSignature"),
          JsdocTypeMappedType: /* @__PURE__ */ __name((result, transform2) => `[${result.key} in ${transform2(result.right)}]`, "JsdocTypeMappedType"),
          JsdocTypeAsserts: /* @__PURE__ */ __name((result, transform2) => `asserts ${transform2(result.left)} is ${transform2(result.right)}`, "JsdocTypeAsserts"),
          JsdocTypeReadonlyArray: /* @__PURE__ */ __name((result, transform2) => `readonly ${transform2(result.element)}`, "JsdocTypeReadonlyArray"),
          JsdocTypeAssertsPlain: /* @__PURE__ */ __name((result, transform2) => `asserts ${transform2(result.element)}`, "JsdocTypeAssertsPlain"),
          JsdocTypeConditional: /* @__PURE__ */ __name((result, transform2) => `${transform2(result.checksType)} extends ${transform2(result.extendsType)} ? ${transform2(result.trueType)} : ${transform2(result.falseType)}`, "JsdocTypeConditional"),
          JsdocTypeTypeParameter: /* @__PURE__ */ __name((result, transform2) => `${transform2(result.name)}${result.constraint !== void 0 ? ` extends ${transform2(result.constraint)}` : ""}${result.defaultValue !== void 0 ? ` = ${transform2(result.defaultValue)}` : ""}`, "JsdocTypeTypeParameter")
        };
      }
      __name(stringifyRules2, "stringifyRules");
      const storedStringifyRules = stringifyRules2();
      function stringify2(result) {
        return transform(storedStringifyRules, result);
      }
      __name(stringify2, "stringify");
      const reservedWords = [
        "null",
        "true",
        "false",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield"
      ];
      function makeName(value) {
        const result = {
          type: "NameExpression",
          name: value
        };
        if (reservedWords.includes(value)) {
          result.reservedWord = true;
        }
        return result;
      }
      __name(makeName, "makeName");
      const catharsisTransformRules = {
        JsdocTypeOptional: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = transform2(result.element);
          transformed.optional = true;
          return transformed;
        }, "JsdocTypeOptional"),
        JsdocTypeNullable: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = transform2(result.element);
          transformed.nullable = true;
          return transformed;
        }, "JsdocTypeNullable"),
        JsdocTypeNotNullable: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = transform2(result.element);
          transformed.nullable = false;
          return transformed;
        }, "JsdocTypeNotNullable"),
        JsdocTypeVariadic: /* @__PURE__ */ __name((result, transform2) => {
          if (result.element === void 0) {
            throw new Error("dots without value are not allowed in catharsis mode");
          }
          const transformed = transform2(result.element);
          transformed.repeatable = true;
          return transformed;
        }, "JsdocTypeVariadic"),
        JsdocTypeAny: /* @__PURE__ */ __name(() => ({
          type: "AllLiteral"
        }), "JsdocTypeAny"),
        JsdocTypeNull: /* @__PURE__ */ __name(() => ({
          type: "NullLiteral"
        }), "JsdocTypeNull"),
        JsdocTypeStringValue: /* @__PURE__ */ __name((result) => makeName(quote(result.value, result.meta.quote)), "JsdocTypeStringValue"),
        JsdocTypeUndefined: /* @__PURE__ */ __name(() => ({
          type: "UndefinedLiteral"
        }), "JsdocTypeUndefined"),
        JsdocTypeUnknown: /* @__PURE__ */ __name(() => ({
          type: "UnknownLiteral"
        }), "JsdocTypeUnknown"),
        JsdocTypeFunction: /* @__PURE__ */ __name((result, transform2) => {
          const params = extractSpecialParams(result);
          const transformed = {
            type: "FunctionType",
            params: params.params.map(transform2)
          };
          if (params.this !== void 0) {
            transformed.this = transform2(params.this);
          }
          if (params.new !== void 0) {
            transformed.new = transform2(params.new);
          }
          if (result.returnType !== void 0) {
            transformed.result = transform2(result.returnType);
          }
          return transformed;
        }, "JsdocTypeFunction"),
        JsdocTypeGeneric: /* @__PURE__ */ __name((result, transform2) => ({
          type: "TypeApplication",
          applications: result.elements.map((o) => transform2(o)),
          expression: transform2(result.left)
        }), "JsdocTypeGeneric"),
        JsdocTypeSpecialNamePath: /* @__PURE__ */ __name((result) => makeName(result.specialType + ":" + quote(result.value, result.meta.quote)), "JsdocTypeSpecialNamePath"),
        JsdocTypeName: /* @__PURE__ */ __name((result) => {
          if (result.value !== "function") {
            return makeName(result.value);
          } else {
            return {
              type: "FunctionType",
              params: []
            };
          }
        }, "JsdocTypeName"),
        JsdocTypeNumber: /* @__PURE__ */ __name((result) => makeName(result.value.toString()), "JsdocTypeNumber"),
        JsdocTypeObject: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = {
            type: "RecordType",
            fields: []
          };
          for (const field of result.elements) {
            if (field.type !== "JsdocTypeObjectField" && field.type !== "JsdocTypeJsdocObjectField") {
              transformed.fields.push({
                type: "FieldType",
                key: transform2(field),
                value: void 0
              });
            } else {
              transformed.fields.push(transform2(field));
            }
          }
          return transformed;
        }, "JsdocTypeObject"),
        JsdocTypeObjectField: /* @__PURE__ */ __name((result, transform2) => {
          if (typeof result.key !== "string") {
            throw new Error("Index signatures and mapped types are not supported");
          }
          return {
            type: "FieldType",
            key: makeName(quote(result.key, result.meta.quote)),
            value: result.right === void 0 ? void 0 : transform2(result.right)
          };
        }, "JsdocTypeObjectField"),
        JsdocTypeJsdocObjectField: /* @__PURE__ */ __name((result, transform2) => ({
          type: "FieldType",
          key: transform2(result.left),
          value: transform2(result.right)
        }), "JsdocTypeJsdocObjectField"),
        JsdocTypeUnion: /* @__PURE__ */ __name((result, transform2) => ({
          type: "TypeUnion",
          elements: result.elements.map((e) => transform2(e))
        }), "JsdocTypeUnion"),
        JsdocTypeKeyValue: /* @__PURE__ */ __name((result, transform2) => {
          return {
            type: "FieldType",
            key: makeName(result.key),
            value: result.right === void 0 ? void 0 : transform2(result.right)
          };
        }, "JsdocTypeKeyValue"),
        JsdocTypeNamePath: /* @__PURE__ */ __name((result, transform2) => {
          const leftResult = transform2(result.left);
          let rightValue;
          if (result.right.type === "JsdocTypeSpecialNamePath") {
            rightValue = transform2(result.right).name;
          } else {
            rightValue = quote(result.right.value, result.right.meta.quote);
          }
          const joiner = result.pathType === "inner" ? "~" : result.pathType === "instance" ? "#" : ".";
          return makeName(`${leftResult.name}${joiner}${rightValue}`);
        }, "JsdocTypeNamePath"),
        JsdocTypeSymbol: /* @__PURE__ */ __name((result) => {
          let value = "";
          let element = result.element;
          let trailingDots = false;
          if ((element === null || element === void 0 ? void 0 : element.type) === "JsdocTypeVariadic") {
            if (element.meta.position === "prefix") {
              value = "...";
            } else {
              trailingDots = true;
            }
            element = element.element;
          }
          if ((element === null || element === void 0 ? void 0 : element.type) === "JsdocTypeName") {
            value += element.value;
          } else if ((element === null || element === void 0 ? void 0 : element.type) === "JsdocTypeNumber") {
            value += element.value.toString();
          }
          if (trailingDots) {
            value += "...";
          }
          return makeName(`${result.value}(${value})`);
        }, "JsdocTypeSymbol"),
        JsdocTypeParenthesis: /* @__PURE__ */ __name((result, transform2) => transform2(assertRootResult(result.element)), "JsdocTypeParenthesis"),
        JsdocTypeMappedType: notAvailableTransform,
        JsdocTypeIndexSignature: notAvailableTransform,
        JsdocTypeImport: notAvailableTransform,
        JsdocTypeKeyof: notAvailableTransform,
        JsdocTypeTuple: notAvailableTransform,
        JsdocTypeTypeof: notAvailableTransform,
        JsdocTypeIntersection: notAvailableTransform,
        JsdocTypeProperty: notAvailableTransform,
        JsdocTypePredicate: notAvailableTransform,
        JsdocTypeAsserts: notAvailableTransform,
        JsdocTypeReadonlyArray: notAvailableTransform,
        JsdocTypeAssertsPlain: notAvailableTransform,
        JsdocTypeConditional: notAvailableTransform,
        JsdocTypeTypeParameter: notAvailableTransform
      };
      function catharsisTransform(result) {
        return transform(catharsisTransformRules, result);
      }
      __name(catharsisTransform, "catharsisTransform");
      function getQuoteStyle(quote2) {
        switch (quote2) {
          case void 0:
            return "none";
          case "single":
            return "single";
          case "double":
            return "double";
        }
      }
      __name(getQuoteStyle, "getQuoteStyle");
      function getMemberType(type) {
        switch (type) {
          case "inner":
            return "INNER_MEMBER";
          case "instance":
            return "INSTANCE_MEMBER";
          case "property":
            return "MEMBER";
          case "property-brackets":
            return "MEMBER";
        }
      }
      __name(getMemberType, "getMemberType");
      function nestResults(type, results) {
        if (results.length === 2) {
          return {
            type,
            left: results[0],
            right: results[1]
          };
        } else {
          return {
            type,
            left: results[0],
            right: nestResults(type, results.slice(1))
          };
        }
      }
      __name(nestResults, "nestResults");
      const jtpRules = {
        JsdocTypeOptional: /* @__PURE__ */ __name((result, transform2) => ({
          type: "OPTIONAL",
          value: transform2(result.element),
          meta: {
            syntax: result.meta.position === "prefix" ? "PREFIX_EQUAL_SIGN" : "SUFFIX_EQUALS_SIGN"
          }
        }), "JsdocTypeOptional"),
        JsdocTypeNullable: /* @__PURE__ */ __name((result, transform2) => ({
          type: "NULLABLE",
          value: transform2(result.element),
          meta: {
            syntax: result.meta.position === "prefix" ? "PREFIX_QUESTION_MARK" : "SUFFIX_QUESTION_MARK"
          }
        }), "JsdocTypeNullable"),
        JsdocTypeNotNullable: /* @__PURE__ */ __name((result, transform2) => ({
          type: "NOT_NULLABLE",
          value: transform2(result.element),
          meta: {
            syntax: result.meta.position === "prefix" ? "PREFIX_BANG" : "SUFFIX_BANG"
          }
        }), "JsdocTypeNotNullable"),
        JsdocTypeVariadic: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = {
            type: "VARIADIC",
            meta: {
              syntax: result.meta.position === "prefix" ? "PREFIX_DOTS" : result.meta.position === "suffix" ? "SUFFIX_DOTS" : "ONLY_DOTS"
            }
          };
          if (result.element !== void 0) {
            transformed.value = transform2(result.element);
          }
          return transformed;
        }, "JsdocTypeVariadic"),
        JsdocTypeName: /* @__PURE__ */ __name((result) => ({
          type: "NAME",
          name: result.value
        }), "JsdocTypeName"),
        JsdocTypeTypeof: /* @__PURE__ */ __name((result, transform2) => ({
          type: "TYPE_QUERY",
          name: transform2(result.element)
        }), "JsdocTypeTypeof"),
        JsdocTypeTuple: /* @__PURE__ */ __name((result, transform2) => ({
          type: "TUPLE",
          entries: result.elements.map(transform2)
        }), "JsdocTypeTuple"),
        JsdocTypeKeyof: /* @__PURE__ */ __name((result, transform2) => ({
          type: "KEY_QUERY",
          value: transform2(result.element)
        }), "JsdocTypeKeyof"),
        JsdocTypeImport: /* @__PURE__ */ __name((result) => ({
          type: "IMPORT",
          path: {
            type: "STRING_VALUE",
            quoteStyle: getQuoteStyle(result.element.meta.quote),
            string: result.element.value
          }
        }), "JsdocTypeImport"),
        JsdocTypeUndefined: /* @__PURE__ */ __name(() => ({
          type: "NAME",
          name: "undefined"
        }), "JsdocTypeUndefined"),
        JsdocTypeAny: /* @__PURE__ */ __name(() => ({
          type: "ANY"
        }), "JsdocTypeAny"),
        JsdocTypeFunction: /* @__PURE__ */ __name((result, transform2) => {
          const specialParams = extractSpecialParams(result);
          const transformed = {
            type: result.arrow ? "ARROW" : "FUNCTION",
            params: specialParams.params.map((param) => {
              if (param.type === "JsdocTypeKeyValue") {
                if (param.right === void 0) {
                  throw new Error("Function parameter without ':' is not expected to be 'KEY_VALUE'");
                }
                return {
                  type: "NAMED_PARAMETER",
                  name: param.key,
                  typeName: transform2(param.right)
                };
              } else {
                return transform2(param);
              }
            }),
            new: null,
            returns: null
          };
          if (specialParams.this !== void 0) {
            transformed.this = transform2(specialParams.this);
          } else if (!result.arrow) {
            transformed.this = null;
          }
          if (specialParams.new !== void 0) {
            transformed.new = transform2(specialParams.new);
          }
          if (result.returnType !== void 0) {
            transformed.returns = transform2(result.returnType);
          }
          return transformed;
        }, "JsdocTypeFunction"),
        JsdocTypeGeneric: /* @__PURE__ */ __name((result, transform2) => {
          const transformed = {
            type: "GENERIC",
            subject: transform2(result.left),
            objects: result.elements.map(transform2),
            meta: {
              syntax: result.meta.brackets === "square" ? "SQUARE_BRACKET" : result.meta.dot ? "ANGLE_BRACKET_WITH_DOT" : "ANGLE_BRACKET"
            }
          };
          if (result.meta.brackets === "square" && result.elements[0].type === "JsdocTypeFunction" && !result.elements[0].parenthesis) {
            transformed.objects[0] = {
              type: "NAME",
              name: "function"
            };
          }
          return transformed;
        }, "JsdocTypeGeneric"),
        JsdocTypeObjectField: /* @__PURE__ */ __name((result, transform2) => {
          if (typeof result.key !== "string") {
            throw new Error("Index signatures and mapped types are not supported");
          }
          if (result.right === void 0) {
            return {
              type: "RECORD_ENTRY",
              key: result.key,
              quoteStyle: getQuoteStyle(result.meta.quote),
              value: null,
              readonly: false
            };
          }
          let right = transform2(result.right);
          if (result.optional) {
            right = {
              type: "OPTIONAL",
              value: right,
              meta: {
                syntax: "SUFFIX_KEY_QUESTION_MARK"
              }
            };
          }
          return {
            type: "RECORD_ENTRY",
            key: result.key.toString(),
            quoteStyle: getQuoteStyle(result.meta.quote),
            value: right,
            readonly: false
          };
        }, "JsdocTypeObjectField"),
        JsdocTypeJsdocObjectField: /* @__PURE__ */ __name(() => {
          throw new Error("Keys may not be typed in jsdoctypeparser.");
        }, "JsdocTypeJsdocObjectField"),
        JsdocTypeKeyValue: /* @__PURE__ */ __name((result, transform2) => {
          if (result.right === void 0) {
            return {
              type: "RECORD_ENTRY",
              key: result.key,
              quoteStyle: "none",
              value: null,
              readonly: false
            };
          }
          let right = transform2(result.right);
          if (result.optional) {
            right = {
              type: "OPTIONAL",
              value: right,
              meta: {
                syntax: "SUFFIX_KEY_QUESTION_MARK"
              }
            };
          }
          return {
            type: "RECORD_ENTRY",
            key: result.key,
            quoteStyle: "none",
            value: right,
            readonly: false
          };
        }, "JsdocTypeKeyValue"),
        JsdocTypeObject: /* @__PURE__ */ __name((result, transform2) => {
          const entries = [];
          for (const field of result.elements) {
            if (field.type === "JsdocTypeObjectField" || field.type === "JsdocTypeJsdocObjectField") {
              entries.push(transform2(field));
            }
          }
          return {
            type: "RECORD",
            entries
          };
        }, "JsdocTypeObject"),
        JsdocTypeSpecialNamePath: /* @__PURE__ */ __name((result) => {
          if (result.specialType !== "module") {
            throw new Error(`jsdoctypeparser does not support type ${result.specialType} at this point.`);
          }
          return {
            type: "MODULE",
            value: {
              type: "FILE_PATH",
              quoteStyle: getQuoteStyle(result.meta.quote),
              path: result.value
            }
          };
        }, "JsdocTypeSpecialNamePath"),
        JsdocTypeNamePath: /* @__PURE__ */ __name((result, transform2) => {
          let hasEventPrefix = false;
          let name;
          let quoteStyle;
          if (result.right.type === "JsdocTypeSpecialNamePath" && result.right.specialType === "event") {
            hasEventPrefix = true;
            name = result.right.value;
            quoteStyle = getQuoteStyle(result.right.meta.quote);
          } else {
            name = result.right.value;
            quoteStyle = getQuoteStyle(result.right.meta.quote);
          }
          const transformed = {
            type: getMemberType(result.pathType),
            owner: transform2(result.left),
            name,
            quoteStyle,
            hasEventPrefix
          };
          if (transformed.owner.type === "MODULE") {
            const tModule = transformed.owner;
            transformed.owner = transformed.owner.value;
            tModule.value = transformed;
            return tModule;
          } else {
            return transformed;
          }
        }, "JsdocTypeNamePath"),
        JsdocTypeUnion: /* @__PURE__ */ __name((result, transform2) => nestResults("UNION", result.elements.map(transform2)), "JsdocTypeUnion"),
        JsdocTypeParenthesis: /* @__PURE__ */ __name((result, transform2) => ({
          type: "PARENTHESIS",
          value: transform2(assertRootResult(result.element))
        }), "JsdocTypeParenthesis"),
        JsdocTypeNull: /* @__PURE__ */ __name(() => ({
          type: "NAME",
          name: "null"
        }), "JsdocTypeNull"),
        JsdocTypeUnknown: /* @__PURE__ */ __name(() => ({
          type: "UNKNOWN"
        }), "JsdocTypeUnknown"),
        JsdocTypeStringValue: /* @__PURE__ */ __name((result) => ({
          type: "STRING_VALUE",
          quoteStyle: getQuoteStyle(result.meta.quote),
          string: result.value
        }), "JsdocTypeStringValue"),
        JsdocTypeIntersection: /* @__PURE__ */ __name((result, transform2) => nestResults("INTERSECTION", result.elements.map(transform2)), "JsdocTypeIntersection"),
        JsdocTypeNumber: /* @__PURE__ */ __name((result) => ({
          type: "NUMBER_VALUE",
          number: result.value.toString()
        }), "JsdocTypeNumber"),
        JsdocTypeSymbol: notAvailableTransform,
        JsdocTypeProperty: notAvailableTransform,
        JsdocTypePredicate: notAvailableTransform,
        JsdocTypeMappedType: notAvailableTransform,
        JsdocTypeIndexSignature: notAvailableTransform,
        JsdocTypeAsserts: notAvailableTransform,
        JsdocTypeReadonlyArray: notAvailableTransform,
        JsdocTypeAssertsPlain: notAvailableTransform,
        JsdocTypeConditional: notAvailableTransform,
        JsdocTypeTypeParameter: notAvailableTransform
      };
      function jtpTransform(result) {
        return transform(jtpRules, result);
      }
      __name(jtpTransform, "jtpTransform");
      function identityTransformRules() {
        return {
          JsdocTypeIntersection: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeIntersection",
            elements: result.elements.map(transform2)
          }), "JsdocTypeIntersection"),
          JsdocTypeGeneric: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeGeneric",
            left: transform2(result.left),
            elements: result.elements.map(transform2),
            meta: {
              dot: result.meta.dot,
              brackets: result.meta.brackets
            }
          }), "JsdocTypeGeneric"),
          JsdocTypeNullable: /* @__PURE__ */ __name((result) => result, "JsdocTypeNullable"),
          JsdocTypeUnion: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeUnion",
            elements: result.elements.map(transform2)
          }), "JsdocTypeUnion"),
          JsdocTypeUnknown: /* @__PURE__ */ __name((result) => result, "JsdocTypeUnknown"),
          JsdocTypeUndefined: /* @__PURE__ */ __name((result) => result, "JsdocTypeUndefined"),
          JsdocTypeTypeof: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeTypeof",
            element: transform2(result.element)
          }), "JsdocTypeTypeof"),
          JsdocTypeSymbol: /* @__PURE__ */ __name((result, transform2) => {
            const transformed = {
              type: "JsdocTypeSymbol",
              value: result.value
            };
            if (result.element !== void 0) {
              transformed.element = transform2(result.element);
            }
            return transformed;
          }, "JsdocTypeSymbol"),
          JsdocTypeOptional: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeOptional",
            element: transform2(result.element),
            meta: {
              position: result.meta.position
            }
          }), "JsdocTypeOptional"),
          JsdocTypeObject: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeObject",
            meta: {
              separator: "comma"
            },
            elements: result.elements.map(transform2)
          }), "JsdocTypeObject"),
          JsdocTypeNumber: /* @__PURE__ */ __name((result) => result, "JsdocTypeNumber"),
          JsdocTypeNull: /* @__PURE__ */ __name((result) => result, "JsdocTypeNull"),
          JsdocTypeNotNullable: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeNotNullable",
            element: transform2(result.element),
            meta: {
              position: result.meta.position
            }
          }), "JsdocTypeNotNullable"),
          JsdocTypeSpecialNamePath: /* @__PURE__ */ __name((result) => result, "JsdocTypeSpecialNamePath"),
          JsdocTypeObjectField: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeObjectField",
            key: result.key,
            right: result.right === void 0 ? void 0 : transform2(result.right),
            optional: result.optional,
            readonly: result.readonly,
            meta: result.meta
          }), "JsdocTypeObjectField"),
          JsdocTypeJsdocObjectField: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeJsdocObjectField",
            left: transform2(result.left),
            right: transform2(result.right)
          }), "JsdocTypeJsdocObjectField"),
          JsdocTypeKeyValue: /* @__PURE__ */ __name((result, transform2) => {
            return {
              type: "JsdocTypeKeyValue",
              key: result.key,
              right: result.right === void 0 ? void 0 : transform2(result.right),
              optional: result.optional,
              variadic: result.variadic
            };
          }, "JsdocTypeKeyValue"),
          JsdocTypeImport: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeImport",
            element: transform2(result.element)
          }), "JsdocTypeImport"),
          JsdocTypeAny: /* @__PURE__ */ __name((result) => result, "JsdocTypeAny"),
          JsdocTypeStringValue: /* @__PURE__ */ __name((result) => result, "JsdocTypeStringValue"),
          JsdocTypeNamePath: /* @__PURE__ */ __name((result) => result, "JsdocTypeNamePath"),
          JsdocTypeVariadic: /* @__PURE__ */ __name((result, transform2) => {
            const transformed = {
              type: "JsdocTypeVariadic",
              meta: {
                position: result.meta.position,
                squareBrackets: result.meta.squareBrackets
              }
            };
            if (result.element !== void 0) {
              transformed.element = transform2(result.element);
            }
            return transformed;
          }, "JsdocTypeVariadic"),
          JsdocTypeTuple: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeTuple",
            elements: result.elements.map(transform2)
          }), "JsdocTypeTuple"),
          JsdocTypeName: /* @__PURE__ */ __name((result) => result, "JsdocTypeName"),
          JsdocTypeFunction: /* @__PURE__ */ __name((result, transform2) => {
            const transformed = {
              type: "JsdocTypeFunction",
              arrow: result.arrow,
              parameters: result.parameters.map(transform2),
              constructor: result.constructor,
              parenthesis: result.parenthesis
            };
            if (result.returnType !== void 0) {
              transformed.returnType = transform2(result.returnType);
            }
            return transformed;
          }, "JsdocTypeFunction"),
          JsdocTypeKeyof: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeKeyof",
            element: transform2(result.element)
          }), "JsdocTypeKeyof"),
          JsdocTypeParenthesis: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeParenthesis",
            element: transform2(result.element)
          }), "JsdocTypeParenthesis"),
          JsdocTypeProperty: /* @__PURE__ */ __name((result) => result, "JsdocTypeProperty"),
          JsdocTypePredicate: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypePredicate",
            left: transform2(result.left),
            right: transform2(result.right)
          }), "JsdocTypePredicate"),
          JsdocTypeIndexSignature: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeIndexSignature",
            key: result.key,
            right: transform2(result.right)
          }), "JsdocTypeIndexSignature"),
          JsdocTypeMappedType: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeMappedType",
            key: result.key,
            right: transform2(result.right)
          }), "JsdocTypeMappedType"),
          JsdocTypeAsserts: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeAsserts",
            left: transform2(result.left),
            right: transform2(result.right)
          }), "JsdocTypeAsserts"),
          JsdocTypeReadonlyArray: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeReadonlyArray",
            element: transform2(result.element)
          }), "JsdocTypeReadonlyArray"),
          JsdocTypeAssertsPlain: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeAssertsPlain",
            element: transform2(result.element)
          }), "JsdocTypeAssertsPlain"),
          JsdocTypeConditional: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeConditional",
            checksType: transform2(result.checksType),
            extendsType: transform2(result.extendsType),
            trueType: transform2(result.trueType),
            falseType: transform2(result.falseType)
          }), "JsdocTypeConditional"),
          JsdocTypeTypeParameter: /* @__PURE__ */ __name((result, transform2) => ({
            type: "JsdocTypeTypeParameter",
            name: transform2(result.name),
            constraint: result.constraint !== void 0 ? transform2(result.constraint) : void 0,
            defaultValue: result.defaultValue !== void 0 ? transform2(result.defaultValue) : void 0
          }), "JsdocTypeTypeParameter")
        };
      }
      __name(identityTransformRules, "identityTransformRules");
      const visitorKeys = {
        JsdocTypeAny: [],
        JsdocTypeFunction: ["parameters", "returnType"],
        JsdocTypeGeneric: ["left", "elements"],
        JsdocTypeImport: [],
        JsdocTypeIndexSignature: ["right"],
        JsdocTypeIntersection: ["elements"],
        JsdocTypeKeyof: ["element"],
        JsdocTypeKeyValue: ["right"],
        JsdocTypeMappedType: ["right"],
        JsdocTypeName: [],
        JsdocTypeNamePath: ["left", "right"],
        JsdocTypeNotNullable: ["element"],
        JsdocTypeNull: [],
        JsdocTypeNullable: ["element"],
        JsdocTypeNumber: [],
        JsdocTypeObject: ["elements"],
        JsdocTypeObjectField: ["right"],
        JsdocTypeJsdocObjectField: ["left", "right"],
        JsdocTypeOptional: ["element"],
        JsdocTypeParenthesis: ["element"],
        JsdocTypeSpecialNamePath: [],
        JsdocTypeStringValue: [],
        JsdocTypeSymbol: ["element"],
        JsdocTypeTuple: ["elements"],
        JsdocTypeTypeof: ["element"],
        JsdocTypeUndefined: [],
        JsdocTypeUnion: ["elements"],
        JsdocTypeUnknown: [],
        JsdocTypeVariadic: ["element"],
        JsdocTypeProperty: [],
        JsdocTypePredicate: ["left", "right"],
        JsdocTypeAsserts: ["left", "right"],
        JsdocTypeReadonlyArray: ["element"],
        JsdocTypeAssertsPlain: ["element"],
        JsdocTypeConditional: ["checksType", "extendsType", "trueType", "falseType"],
        JsdocTypeTypeParameter: ["name", "constraint", "defaultValue"]
      };
      function _traverse(node, parentNode, property, onEnter, onLeave) {
        onEnter === null || onEnter === void 0 ? void 0 : onEnter(node, parentNode, property);
        const keysToVisit = visitorKeys[node.type];
        for (const key of keysToVisit) {
          const value = node[key];
          if (value !== void 0) {
            if (Array.isArray(value)) {
              for (const element of value) {
                _traverse(element, node, key, onEnter, onLeave);
              }
            } else {
              _traverse(value, node, key, onEnter, onLeave);
            }
          }
        }
        onLeave === null || onLeave === void 0 ? void 0 : onLeave(node, parentNode, property);
      }
      __name(_traverse, "_traverse");
      function traverse(node, onEnter, onLeave) {
        _traverse(node, void 0, void 0, onEnter, onLeave);
      }
      __name(traverse, "traverse");
      exports2.catharsisTransform = catharsisTransform;
      exports2.identityTransformRules = identityTransformRules;
      exports2.jtpTransform = jtpTransform;
      exports2.parse = parse3;
      exports2.stringify = stringify2;
      exports2.stringifyRules = stringifyRules2;
      exports2.transform = transform;
      exports2.traverse = traverse;
      exports2.tryParse = tryParse;
      exports2.visitorKeys = visitorKeys;
    });
  }
});

// src/docs-tools/argTypes/convert/flow/convert.ts
import { UnknownArgTypesError } from "storybook/internal/preview-errors";
var isLiteral = /* @__PURE__ */ __name((type) => type.name === "literal", "isLiteral");
var toEnumOption = /* @__PURE__ */ __name((element) => element.value.replace(/['|"]/g, ""), "toEnumOption");
var convertSig = /* @__PURE__ */ __name((type) => {
  switch (type.type) {
    case "function":
      return { name: "function" };
    case "object":
      const values = {};
      type.signature.properties.forEach((prop) => {
        values[prop.key] = convert(prop.value);
      });
      return {
        name: "object",
        value: values
      };
    default:
      throw new UnknownArgTypesError({ type, language: "Flow" });
  }
}, "convertSig");
var convert = /* @__PURE__ */ __name((type) => {
  const { name, raw } = type;
  const base = {};
  if (typeof raw !== "undefined") {
    base.raw = raw;
  }
  switch (type.name) {
    case "literal":
      return { ...base, name: "other", value: type.value };
    case "string":
    case "number":
    case "symbol":
    case "boolean": {
      return { ...base, name };
    }
    case "Array": {
      return { ...base, name: "array", value: type.elements.map(convert) };
    }
    case "signature":
      return { ...base, ...convertSig(type) };
    case "union":
      if (type.elements?.every(isLiteral)) {
        return { ...base, name: "enum", value: type.elements?.map(toEnumOption) };
      }
      return { ...base, name, value: type.elements?.map(convert) };
    case "intersection":
      return { ...base, name, value: type.elements?.map(convert) };
    default:
      return { ...base, name: "other", value: name };
  }
}, "convert");

// src/docs-tools/argTypes/convert/utils.ts
var QUOTE_REGEX = /^['"]|['"]$/g;
var trimQuotes = /* @__PURE__ */ __name((str2) => str2.replace(QUOTE_REGEX, ""), "trimQuotes");
var includesQuotes = /* @__PURE__ */ __name((str2) => QUOTE_REGEX.test(str2), "includesQuotes");
var parseLiteral = /* @__PURE__ */ __name((str2) => {
  const trimmedValue = trimQuotes(str2);
  return includesQuotes(str2) || Number.isNaN(Number(trimmedValue)) ? trimmedValue : Number(trimmedValue);
}, "parseLiteral");

// src/docs-tools/argTypes/convert/proptypes/convert.ts
var SIGNATURE_REGEXP = /^\(.*\) => /;
var convert2 = /* @__PURE__ */ __name((type) => {
  const { name, raw, computed, value } = type;
  const base = {};
  if (typeof raw !== "undefined") {
    base.raw = raw;
  }
  switch (name) {
    case "enum": {
      const values2 = computed ? value : value.map((v) => parseLiteral(v.value));
      return { ...base, name, value: values2 };
    }
    case "string":
    case "number":
    case "symbol":
      return { ...base, name };
    case "func":
      return { ...base, name: "function" };
    case "bool":
    case "boolean":
      return { ...base, name: "boolean" };
    case "arrayOf":
    case "array":
      return { ...base, name: "array", value: value && convert2(value) };
    case "object":
      return { ...base, name };
    case "objectOf":
      return { ...base, name, value: convert2(value) };
    case "shape":
    case "exact":
      const values = mapValues(value, (field) => convert2(field));
      return { ...base, name: "object", value: values };
    case "union":
      return { ...base, name: "union", value: value.map((v) => convert2(v)) };
    case "instanceOf":
    case "element":
    case "elementType":
    default: {
      if (name?.indexOf("|") > 0) {
        try {
          const literalValues = name.split("|").map((v) => JSON.parse(v));
          return { ...base, name: "enum", value: literalValues };
        } catch (err) {
        }
      }
      const otherVal = value ? `${name}(${value})` : name;
      const otherName = SIGNATURE_REGEXP.test(name) ? "function" : "other";
      return { ...base, name: otherName, value: otherVal };
    }
  }
}, "convert");

// src/docs-tools/argTypes/convert/typescript/convert.ts
import { UnknownArgTypesError as UnknownArgTypesError2 } from "storybook/internal/preview-errors";
var convertSig2 = /* @__PURE__ */ __name((type) => {
  switch (type.type) {
    case "function":
      return { name: "function" };
    case "object":
      const values = {};
      type.signature.properties.forEach((prop) => {
        values[prop.key] = convert3(prop.value);
      });
      return {
        name: "object",
        value: values
      };
    default:
      throw new UnknownArgTypesError2({ type, language: "Typescript" });
  }
}, "convertSig");
var convert3 = /* @__PURE__ */ __name((type) => {
  const { name, raw } = type;
  const base = {};
  if (typeof raw !== "undefined") {
    base.raw = raw;
  }
  switch (type.name) {
    case "string":
    case "number":
    case "symbol":
    case "boolean": {
      return { ...base, name };
    }
    case "Array": {
      return { ...base, name: "array", value: type.elements.map(convert3) };
    }
    case "signature":
      return { ...base, ...convertSig2(type) };
    case "union":
      let result;
      if (type.elements?.every((element) => element.name === "literal")) {
        result = {
          ...base,
          name: "enum",
          // @ts-expect-error fix types
          value: type.elements?.map((v) => parseLiteral(v.value))
        };
      } else {
        result = { ...base, name, value: type.elements?.map(convert3) };
      }
      return result;
    case "intersection":
      return { ...base, name, value: type.elements?.map(convert3) };
    default:
      return { ...base, name: "other", value: name };
  }
}, "convert");

// src/docs-tools/argTypes/convert/index.ts
var convert4 = /* @__PURE__ */ __name((docgenInfo) => {
  const { type, tsType, flowType } = docgenInfo;
  try {
    if (type != null) {
      return convert2(type);
    }
    if (tsType != null) {
      return convert3(tsType);
    }
    if (flowType != null) {
      return convert(flowType);
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}, "convert");

// src/docs-tools/argTypes/docgen/types.ts
var TypeSystem = /* @__PURE__ */ ((TypeSystem2) => {
  TypeSystem2["JAVASCRIPT"] = "JavaScript";
  TypeSystem2["FLOW"] = "Flow";
  TypeSystem2["TYPESCRIPT"] = "TypeScript";
  TypeSystem2["UNKNOWN"] = "Unknown";
  return TypeSystem2;
})(TypeSystem || {});

// src/docs-tools/argTypes/docgen/utils/defaultValue.ts
var BLACKLIST = ["null", "undefined"];
function isDefaultValueBlacklisted(value) {
  return BLACKLIST.some((x) => x === value);
}
__name(isDefaultValueBlacklisted, "isDefaultValueBlacklisted");

// src/docs-tools/argTypes/docgen/utils/string.ts
var str = /* @__PURE__ */ __name((obj) => {
  if (!obj) {
    return "";
  }
  if (typeof obj === "string") {
    return obj;
  }
  throw new Error(`Description: expected string, got: ${JSON.stringify(obj)}`);
}, "str");

// src/docs-tools/argTypes/docgen/utils/docgenInfo.ts
function hasDocgen(component) {
  return !!component.__docgenInfo;
}
__name(hasDocgen, "hasDocgen");
function isValidDocgenSection(docgenSection) {
  return docgenSection != null && Object.keys(docgenSection).length > 0;
}
__name(isValidDocgenSection, "isValidDocgenSection");
function getDocgenSection(component, section) {
  return hasDocgen(component) ? component.__docgenInfo[section] : null;
}
__name(getDocgenSection, "getDocgenSection");
function getDocgenDescription(component) {
  return hasDocgen(component) ? str(component.__docgenInfo.description) : "";
}
__name(getDocgenDescription, "getDocgenDescription");

// ../node_modules/comment-parser/es6/primitives.js
var Markers;
(function(Markers2) {
  Markers2["start"] = "/**";
  Markers2["nostart"] = "/***";
  Markers2["delim"] = "*";
  Markers2["end"] = "*/";
})(Markers = Markers || (Markers = {}));

// ../node_modules/comment-parser/es6/util.js
function isSpace(source) {
  return /^\s+$/.test(source);
}
__name(isSpace, "isSpace");
function splitCR(source) {
  const matches = source.match(/\r+$/);
  return matches == null ? ["", source] : [source.slice(-matches[0].length), source.slice(0, -matches[0].length)];
}
__name(splitCR, "splitCR");
function splitSpace(source) {
  const matches = source.match(/^\s+/);
  return matches == null ? ["", source] : [source.slice(0, matches[0].length), source.slice(matches[0].length)];
}
__name(splitSpace, "splitSpace");
function splitLines(source) {
  return source.split(/\n/);
}
__name(splitLines, "splitLines");
function seedSpec(spec = {}) {
  return Object.assign({ tag: "", name: "", type: "", optional: false, description: "", problems: [], source: [] }, spec);
}
__name(seedSpec, "seedSpec");
function seedTokens(tokens = {}) {
  return Object.assign({ start: "", delimiter: "", postDelimiter: "", tag: "", postTag: "", name: "", postName: "", type: "", postType: "", description: "", end: "", lineEnd: "" }, tokens);
}
__name(seedTokens, "seedTokens");

// ../node_modules/comment-parser/es6/parser/block-parser.js
var reTag = /^@\S+/;
function getParser({ fence = "```" } = {}) {
  const fencer = getFencer(fence);
  const toggleFence = /* @__PURE__ */ __name((source, isFenced) => fencer(source) ? !isFenced : isFenced, "toggleFence");
  return /* @__PURE__ */ __name(function parseBlock(source) {
    const sections = [[]];
    let isFenced = false;
    for (const line of source) {
      if (reTag.test(line.tokens.description) && !isFenced) {
        sections.push([line]);
      } else {
        sections[sections.length - 1].push(line);
      }
      isFenced = toggleFence(line.tokens.description, isFenced);
    }
    return sections;
  }, "parseBlock");
}
__name(getParser, "getParser");
function getFencer(fence) {
  if (typeof fence === "string")
    return (source) => source.split(fence).length % 2 === 0;
  return fence;
}
__name(getFencer, "getFencer");

// ../node_modules/comment-parser/es6/parser/source-parser.js
function getParser2({ startLine = 0, markers = Markers } = {}) {
  let block = null;
  let num = startLine;
  return /* @__PURE__ */ __name(function parseSource(source) {
    let rest = source;
    const tokens = seedTokens();
    [tokens.lineEnd, rest] = splitCR(rest);
    [tokens.start, rest] = splitSpace(rest);
    if (block === null && rest.startsWith(markers.start) && !rest.startsWith(markers.nostart)) {
      block = [];
      tokens.delimiter = rest.slice(0, markers.start.length);
      rest = rest.slice(markers.start.length);
      [tokens.postDelimiter, rest] = splitSpace(rest);
    }
    if (block === null) {
      num++;
      return null;
    }
    const isClosed = rest.trimRight().endsWith(markers.end);
    if (tokens.delimiter === "" && rest.startsWith(markers.delim) && !rest.startsWith(markers.end)) {
      tokens.delimiter = markers.delim;
      rest = rest.slice(markers.delim.length);
      [tokens.postDelimiter, rest] = splitSpace(rest);
    }
    if (isClosed) {
      const trimmed = rest.trimRight();
      tokens.end = rest.slice(trimmed.length - markers.end.length);
      rest = trimmed.slice(0, -markers.end.length);
    }
    tokens.description = rest;
    block.push({ number: num, source, tokens });
    num++;
    if (isClosed) {
      const result = block.slice();
      block = null;
      return result;
    }
    return null;
  }, "parseSource");
}
__name(getParser2, "getParser");

// ../node_modules/comment-parser/es6/parser/spec-parser.js
function getParser3({ tokenizers }) {
  return /* @__PURE__ */ __name(function parseSpec(source) {
    var _a;
    let spec = seedSpec({ source });
    for (const tokenize of tokenizers) {
      spec = tokenize(spec);
      if ((_a = spec.problems[spec.problems.length - 1]) === null || _a === void 0 ? void 0 : _a.critical)
        break;
    }
    return spec;
  }, "parseSpec");
}
__name(getParser3, "getParser");

// ../node_modules/comment-parser/es6/parser/tokenizers/tag.js
function tagTokenizer() {
  return (spec) => {
    const { tokens } = spec.source[0];
    const match = tokens.description.match(/\s*(@(\S+))(\s*)/);
    if (match === null) {
      spec.problems.push({
        code: "spec:tag:prefix",
        message: 'tag should start with "@" symbol',
        line: spec.source[0].number,
        critical: true
      });
      return spec;
    }
    tokens.tag = match[1];
    tokens.postTag = match[3];
    tokens.description = tokens.description.slice(match[0].length);
    spec.tag = match[2];
    return spec;
  };
}
__name(tagTokenizer, "tagTokenizer");

// ../node_modules/comment-parser/es6/parser/tokenizers/type.js
function typeTokenizer(spacing = "compact") {
  const join2 = getJoiner(spacing);
  return (spec) => {
    let curlies = 0;
    let lines = [];
    for (const [i, { tokens }] of spec.source.entries()) {
      let type = "";
      if (i === 0 && tokens.description[0] !== "{")
        return spec;
      for (const ch of tokens.description) {
        if (ch === "{")
          curlies++;
        if (ch === "}")
          curlies--;
        type += ch;
        if (curlies === 0)
          break;
      }
      lines.push([tokens, type]);
      if (curlies === 0)
        break;
    }
    if (curlies !== 0) {
      spec.problems.push({
        code: "spec:type:unpaired-curlies",
        message: "unpaired curlies",
        line: spec.source[0].number,
        critical: true
      });
      return spec;
    }
    const parts = [];
    const offset = lines[0][0].postDelimiter.length;
    for (const [i, [tokens, type]] of lines.entries()) {
      tokens.type = type;
      if (i > 0) {
        tokens.type = tokens.postDelimiter.slice(offset) + type;
        tokens.postDelimiter = tokens.postDelimiter.slice(0, offset);
      }
      [tokens.postType, tokens.description] = splitSpace(tokens.description.slice(type.length));
      parts.push(tokens.type);
    }
    parts[0] = parts[0].slice(1);
    parts[parts.length - 1] = parts[parts.length - 1].slice(0, -1);
    spec.type = join2(parts);
    return spec;
  };
}
__name(typeTokenizer, "typeTokenizer");
var trim = /* @__PURE__ */ __name((x) => x.trim(), "trim");
function getJoiner(spacing) {
  if (spacing === "compact")
    return (t) => t.map(trim).join("");
  else if (spacing === "preserve")
    return (t) => t.join("\n");
  else
    return spacing;
}
__name(getJoiner, "getJoiner");

// ../node_modules/comment-parser/es6/parser/tokenizers/name.js
var isQuoted = /* @__PURE__ */ __name((s) => s && s.startsWith('"') && s.endsWith('"'), "isQuoted");
function nameTokenizer() {
  const typeEnd = /* @__PURE__ */ __name((num, { tokens }, i) => tokens.type === "" ? num : i, "typeEnd");
  return (spec) => {
    const { tokens } = spec.source[spec.source.reduce(typeEnd, 0)];
    const source = tokens.description.trimLeft();
    const quotedGroups = source.split('"');
    if (quotedGroups.length > 1 && quotedGroups[0] === "" && quotedGroups.length % 2 === 1) {
      spec.name = quotedGroups[1];
      tokens.name = `"${quotedGroups[1]}"`;
      [tokens.postName, tokens.description] = splitSpace(source.slice(tokens.name.length));
      return spec;
    }
    let brackets = 0;
    let name = "";
    let optional = false;
    let defaultValue;
    for (const ch of source) {
      if (brackets === 0 && isSpace(ch))
        break;
      if (ch === "[")
        brackets++;
      if (ch === "]")
        brackets--;
      name += ch;
    }
    if (brackets !== 0) {
      spec.problems.push({
        code: "spec:name:unpaired-brackets",
        message: "unpaired brackets",
        line: spec.source[0].number,
        critical: true
      });
      return spec;
    }
    const nameToken = name;
    if (name[0] === "[" && name[name.length - 1] === "]") {
      optional = true;
      name = name.slice(1, -1);
      const parts = name.split("=");
      name = parts[0].trim();
      if (parts[1] !== void 0)
        defaultValue = parts.slice(1).join("=").trim();
      if (name === "") {
        spec.problems.push({
          code: "spec:name:empty-name",
          message: "empty name",
          line: spec.source[0].number,
          critical: true
        });
        return spec;
      }
      if (defaultValue === "") {
        spec.problems.push({
          code: "spec:name:empty-default",
          message: "empty default value",
          line: spec.source[0].number,
          critical: true
        });
        return spec;
      }
      if (!isQuoted(defaultValue) && /=(?!>)/.test(defaultValue)) {
        spec.problems.push({
          code: "spec:name:invalid-default",
          message: "invalid default value syntax",
          line: spec.source[0].number,
          critical: true
        });
        return spec;
      }
    }
    spec.optional = optional;
    spec.name = name;
    tokens.name = nameToken;
    if (defaultValue !== void 0)
      spec.default = defaultValue;
    [tokens.postName, tokens.description] = splitSpace(source.slice(tokens.name.length));
    return spec;
  };
}
__name(nameTokenizer, "nameTokenizer");

// ../node_modules/comment-parser/es6/parser/tokenizers/description.js
function descriptionTokenizer(spacing = "compact", markers = Markers) {
  const join2 = getJoiner2(spacing);
  return (spec) => {
    spec.description = join2(spec.source, markers);
    return spec;
  };
}
__name(descriptionTokenizer, "descriptionTokenizer");
function getJoiner2(spacing) {
  if (spacing === "compact")
    return compactJoiner;
  if (spacing === "preserve")
    return preserveJoiner;
  return spacing;
}
__name(getJoiner2, "getJoiner");
function compactJoiner(lines, markers = Markers) {
  return lines.map(({ tokens: { description } }) => description.trim()).filter((description) => description !== "").join(" ");
}
__name(compactJoiner, "compactJoiner");
var lineNo = /* @__PURE__ */ __name((num, { tokens }, i) => tokens.type === "" ? num : i, "lineNo");
var getDescription = /* @__PURE__ */ __name(({ tokens }) => (tokens.delimiter === "" ? tokens.start : tokens.postDelimiter.slice(1)) + tokens.description, "getDescription");
function preserveJoiner(lines, markers = Markers) {
  if (lines.length === 0)
    return "";
  if (lines[0].tokens.description === "" && lines[0].tokens.delimiter === markers.start)
    lines = lines.slice(1);
  const lastLine = lines[lines.length - 1];
  if (lastLine !== void 0 && lastLine.tokens.description === "" && lastLine.tokens.end.endsWith(markers.end))
    lines = lines.slice(0, -1);
  lines = lines.slice(lines.reduce(lineNo, 0));
  return lines.map(getDescription).join("\n");
}
__name(preserveJoiner, "preserveJoiner");

// ../node_modules/comment-parser/es6/parser/index.js
function getParser4({ startLine = 0, fence = "```", spacing = "compact", markers = Markers, tokenizers = [
  tagTokenizer(),
  typeTokenizer(spacing),
  nameTokenizer(),
  descriptionTokenizer(spacing)
] } = {}) {
  if (startLine < 0 || startLine % 1 > 0)
    throw new Error("Invalid startLine");
  const parseSource = getParser2({ startLine, markers });
  const parseBlock = getParser({ fence });
  const parseSpec = getParser3({ tokenizers });
  const joinDescription = getJoiner2(spacing);
  return function(source) {
    const blocks = [];
    for (const line of splitLines(source)) {
      const lines = parseSource(line);
      if (lines === null)
        continue;
      const sections = parseBlock(lines);
      const specs = sections.slice(1).map(parseSpec);
      blocks.push({
        description: joinDescription(sections[0], markers),
        tags: specs,
        source: lines,
        problems: specs.reduce((acc, spec) => acc.concat(spec.problems), [])
      });
    }
    return blocks;
  };
}
__name(getParser4, "getParser");

// ../node_modules/comment-parser/es6/stringifier/index.js
function join(tokens) {
  return tokens.start + tokens.delimiter + tokens.postDelimiter + tokens.tag + tokens.postTag + tokens.type + tokens.postType + tokens.name + tokens.postName + tokens.description + tokens.end + tokens.lineEnd;
}
__name(join, "join");
function getStringifier() {
  return (block) => block.source.map(({ tokens }) => join(tokens)).join("\n");
}
__name(getStringifier, "getStringifier");

// ../node_modules/comment-parser/es6/stringifier/inspect.js
var zeroWidth = {
  line: 0,
  start: 0,
  delimiter: 0,
  postDelimiter: 0,
  tag: 0,
  postTag: 0,
  name: 0,
  postName: 0,
  type: 0,
  postType: 0,
  description: 0,
  end: 0,
  lineEnd: 0
};
var fields = Object.keys(zeroWidth);

// ../node_modules/comment-parser/es6/index.js
function parse(source, options = {}) {
  return getParser4(options)(source);
}
__name(parse, "parse");
var stringify = getStringifier();

// src/docs-tools/argTypes/jsdocParser.ts
var import_jsdoc_type_pratt_parser = __toESM(require_dist(), 1);
function containsJsDoc(value) {
  return value != null && value.includes("@");
}
__name(containsJsDoc, "containsJsDoc");
function parse2(content) {
  const contentString = content ?? "";
  const mappedLines = contentString.split("\n").map((line) => ` * ${line}`).join("\n");
  const normalisedContent = "/**\n" + mappedLines + "\n*/";
  const ast = parse(normalisedContent, {
    spacing: "preserve"
  });
  if (!ast || ast.length === 0) {
    throw new Error("Cannot parse JSDoc tags.");
  }
  return ast[0];
}
__name(parse2, "parse");
var DEFAULT_OPTIONS = {
  tags: ["param", "arg", "argument", "returns", "ignore", "deprecated"]
};
var parseJsDoc = /* @__PURE__ */ __name((value, options = DEFAULT_OPTIONS) => {
  if (!containsJsDoc(value)) {
    return {
      includesJsDoc: false,
      ignore: false
    };
  }
  const jsDocAst = parse2(value);
  const extractedTags = extractJsDocTags(jsDocAst, options.tags);
  if (extractedTags.ignore) {
    return {
      includesJsDoc: true,
      ignore: true
    };
  }
  return {
    includesJsDoc: true,
    ignore: false,
    // Always use the parsed description to ensure JSDoc is removed from the description.
    description: jsDocAst.description.trim(),
    extractedTags
  };
}, "parseJsDoc");
function extractJsDocTags(ast, tags) {
  const extractedTags = {
    params: null,
    deprecated: null,
    returns: null,
    ignore: false
  };
  for (const tagSpec of ast.tags) {
    if (tags !== void 0 && !tags.includes(tagSpec.tag)) {
      continue;
    }
    if (tagSpec.tag === "ignore") {
      extractedTags.ignore = true;
      break;
    } else {
      switch (tagSpec.tag) {
        // arg & argument are aliases for param.
        case "param":
        case "arg":
        case "argument": {
          const paramTag = extractParam(tagSpec);
          if (paramTag != null) {
            if (extractedTags.params == null) {
              extractedTags.params = [];
            }
            extractedTags.params.push(paramTag);
          }
          break;
        }
        case "deprecated": {
          const deprecatedTag = extractDeprecated(tagSpec);
          if (deprecatedTag != null) {
            extractedTags.deprecated = deprecatedTag;
          }
          break;
        }
        case "returns": {
          const returnsTag = extractReturns(tagSpec);
          if (returnsTag != null) {
            extractedTags.returns = returnsTag;
          }
          break;
        }
        default:
          break;
      }
    }
  }
  return extractedTags;
}
__name(extractJsDocTags, "extractJsDocTags");
function normaliseParamName(name) {
  return name.replace(/[\.-]$/, "");
}
__name(normaliseParamName, "normaliseParamName");
function extractParam(tag) {
  if (!tag.name || tag.name === "-") {
    return null;
  }
  const type = extractType(tag.type);
  return {
    name: tag.name,
    type,
    description: normaliseDescription(tag.description),
    getPrettyName: /* @__PURE__ */ __name(() => {
      return normaliseParamName(tag.name);
    }, "getPrettyName"),
    getTypeName: /* @__PURE__ */ __name(() => {
      return type ? extractTypeName(type) : null;
    }, "getTypeName")
  };
}
__name(extractParam, "extractParam");
function extractDeprecated(tag) {
  if (tag.name) {
    return joinNameAndDescription(tag.name, tag.description);
  }
  return null;
}
__name(extractDeprecated, "extractDeprecated");
function joinNameAndDescription(name, desc) {
  const joined = name === "" ? desc : `${name} ${desc}`;
  return normaliseDescription(joined);
}
__name(joinNameAndDescription, "joinNameAndDescription");
function normaliseDescription(text) {
  const normalised = text.replace(/^- /g, "").trim();
  return normalised === "" ? null : normalised;
}
__name(normaliseDescription, "normaliseDescription");
function extractReturns(tag) {
  const type = extractType(tag.type);
  if (type) {
    return {
      type,
      description: joinNameAndDescription(tag.name, tag.description),
      getTypeName: /* @__PURE__ */ __name(() => {
        return extractTypeName(type);
      }, "getTypeName")
    };
  }
  return null;
}
__name(extractReturns, "extractReturns");
var jsdocStringifyRules = (0, import_jsdoc_type_pratt_parser.stringifyRules)();
var originalJsdocStringifyObject = jsdocStringifyRules.JsdocTypeObject;
jsdocStringifyRules.JsdocTypeAny = () => "any";
jsdocStringifyRules.JsdocTypeObject = (result, transform) => `(${originalJsdocStringifyObject(result, transform)})`;
jsdocStringifyRules.JsdocTypeOptional = (result, transform) => transform(result.element);
jsdocStringifyRules.JsdocTypeNullable = (result, transform) => transform(result.element);
jsdocStringifyRules.JsdocTypeNotNullable = (result, transform) => transform(result.element);
jsdocStringifyRules.JsdocTypeUnion = (result, transform) => result.elements.map(transform).join("|");
function extractType(typeString) {
  try {
    return (0, import_jsdoc_type_pratt_parser.parse)(typeString, "typescript");
  } catch (_err) {
    return null;
  }
}
__name(extractType, "extractType");
function extractTypeName(type) {
  return (0, import_jsdoc_type_pratt_parser.transform)(jsdocStringifyRules, type);
}
__name(extractTypeName, "extractTypeName");

// src/docs-tools/argTypes/utils.ts
var MAX_TYPE_SUMMARY_LENGTH = 90;
var MAX_DEFAULT_VALUE_SUMMARY_LENGTH = 50;
function isTooLongForTypeSummary(value) {
  return value.length > MAX_TYPE_SUMMARY_LENGTH;
}
__name(isTooLongForTypeSummary, "isTooLongForTypeSummary");
function isTooLongForDefaultValueSummary(value) {
  return value.length > MAX_DEFAULT_VALUE_SUMMARY_LENGTH;
}
__name(isTooLongForDefaultValueSummary, "isTooLongForDefaultValueSummary");
function createSummaryValue(summary, detail) {
  if (summary === detail) {
    return { summary };
  }
  return { summary, detail };
}
__name(createSummaryValue, "createSummaryValue");
var normalizeNewlines = /* @__PURE__ */ __name((string) => string.replace(/\\r\\n/g, "\\n"), "normalizeNewlines");

// src/docs-tools/argTypes/docgen/flow/createDefaultValue.ts
function createDefaultValue(defaultValue, type) {
  if (defaultValue != null) {
    const { value } = defaultValue;
    if (!isDefaultValueBlacklisted(value)) {
      return !isTooLongForDefaultValueSummary(value) ? createSummaryValue(value) : createSummaryValue(type?.name, value);
    }
  }
  return null;
}
__name(createDefaultValue, "createDefaultValue");

// src/docs-tools/argTypes/docgen/flow/createType.ts
function generateUnionElement({ name, value, elements, raw }) {
  if (value != null) {
    return value;
  }
  if (elements != null) {
    return elements.map(generateUnionElement).join(" | ");
  }
  if (raw != null) {
    return raw;
  }
  return name;
}
__name(generateUnionElement, "generateUnionElement");
function generateUnion({ name, raw, elements }) {
  if (elements != null) {
    return createSummaryValue(elements.map(generateUnionElement).join(" | "));
  }
  if (raw != null) {
    return createSummaryValue(raw.replace(/^\|\s*/, ""));
  }
  return createSummaryValue(name);
}
__name(generateUnion, "generateUnion");
function generateFuncSignature({ type, raw }) {
  if (raw != null) {
    return createSummaryValue(raw);
  }
  return createSummaryValue(type);
}
__name(generateFuncSignature, "generateFuncSignature");
function generateObjectSignature({ type, raw }) {
  if (raw != null) {
    return !isTooLongForTypeSummary(raw) ? createSummaryValue(raw) : createSummaryValue(type, raw);
  }
  return createSummaryValue(type);
}
__name(generateObjectSignature, "generateObjectSignature");
function generateSignature(flowType) {
  const { type } = flowType;
  return type === "object" ? generateObjectSignature(flowType) : generateFuncSignature(flowType);
}
__name(generateSignature, "generateSignature");
function generateDefault({ name, raw }) {
  if (raw != null) {
    return !isTooLongForTypeSummary(raw) ? createSummaryValue(raw) : createSummaryValue(name, raw);
  }
  return createSummaryValue(name);
}
__name(generateDefault, "generateDefault");
function createType(type) {
  if (type == null) {
    return null;
  }
  switch (type.name) {
    case "union" /* UNION */:
      return generateUnion(type);
    case "signature" /* SIGNATURE */:
      return generateSignature(type);
    default:
      return generateDefault(type);
  }
}
__name(createType, "createType");

// src/docs-tools/argTypes/docgen/flow/createPropDef.ts
var createFlowPropDef = /* @__PURE__ */ __name((propName, docgenInfo) => {
  const { flowType, description, required, defaultValue } = docgenInfo;
  return {
    name: propName,
    type: createType(flowType),
    required,
    description,
    defaultValue: createDefaultValue(defaultValue ?? null, flowType ?? null)
  };
}, "createFlowPropDef");

// src/docs-tools/argTypes/docgen/typeScript/createDefaultValue.ts
function createDefaultValue2({ defaultValue }) {
  if (defaultValue != null) {
    const { value } = defaultValue;
    if (!isDefaultValueBlacklisted(value)) {
      return createSummaryValue(value);
    }
  }
  return null;
}
__name(createDefaultValue2, "createDefaultValue");

// src/docs-tools/argTypes/docgen/typeScript/createType.ts
function createType2({ tsType, required }) {
  if (tsType == null) {
    return null;
  }
  let typeName = tsType.name;
  if (!required) {
    typeName = typeName.replace(" | undefined", "");
  }
  return createSummaryValue(
    ["Array", "Record", "signature"].includes(tsType.name) ? tsType.raw : typeName
  );
}
__name(createType2, "createType");

// src/docs-tools/argTypes/docgen/typeScript/createPropDef.ts
var createTsPropDef = /* @__PURE__ */ __name((propName, docgenInfo) => {
  const { description, required } = docgenInfo;
  return {
    name: propName,
    type: createType2(docgenInfo),
    required,
    description,
    defaultValue: createDefaultValue2(docgenInfo)
  };
}, "createTsPropDef");

// src/docs-tools/argTypes/docgen/createPropDef.ts
function createType3(type) {
  return type != null ? createSummaryValue(type.name) : null;
}
__name(createType3, "createType");
function isReactDocgenTypescript(defaultValue) {
  const { computed, func } = defaultValue;
  return typeof computed === "undefined" && typeof func === "undefined";
}
__name(isReactDocgenTypescript, "isReactDocgenTypescript");
function isStringValued(type) {
  if (!type) {
    return false;
  }
  if (type.name === "string") {
    return true;
  }
  if (type.name === "enum") {
    return Array.isArray(type.value) && type.value.every(
      ({ value: tv }) => typeof tv === "string" && tv[0] === '"' && tv[tv.length - 1] === '"'
    );
  }
  return false;
}
__name(isStringValued, "isStringValued");
function createDefaultValue3(defaultValue, type) {
  if (defaultValue != null) {
    const { value } = defaultValue;
    if (!isDefaultValueBlacklisted(value)) {
      if (isReactDocgenTypescript(defaultValue) && isStringValued(type)) {
        return createSummaryValue(JSON.stringify(value));
      }
      return createSummaryValue(value);
    }
  }
  return null;
}
__name(createDefaultValue3, "createDefaultValue");
function createBasicPropDef(name, type, docgenInfo) {
  const { description, required, defaultValue } = docgenInfo;
  return {
    name,
    type: createType3(type),
    required,
    description,
    defaultValue: createDefaultValue3(defaultValue, type)
  };
}
__name(createBasicPropDef, "createBasicPropDef");
function applyJsDocResult(propDef, jsDocParsingResult) {
  if (jsDocParsingResult?.includesJsDoc) {
    const { description, extractedTags } = jsDocParsingResult;
    if (description != null) {
      propDef.description = jsDocParsingResult.description;
    }
    const value = {
      ...extractedTags,
      params: extractedTags?.params?.map(
        (x) => ({
          name: x.getPrettyName(),
          description: x.description
        })
      )
    };
    if (Object.values(value).filter(Boolean).length > 0) {
      propDef.jsDocTags = value;
    }
  }
  return propDef;
}
__name(applyJsDocResult, "applyJsDocResult");
var javaScriptFactory = /* @__PURE__ */ __name((propName, docgenInfo, jsDocParsingResult) => {
  const propDef = createBasicPropDef(propName, docgenInfo.type, docgenInfo);
  propDef.sbType = convert4(docgenInfo);
  return applyJsDocResult(propDef, jsDocParsingResult);
}, "javaScriptFactory");
var tsFactory = /* @__PURE__ */ __name((propName, docgenInfo, jsDocParsingResult) => {
  const propDef = createTsPropDef(propName, docgenInfo);
  propDef.sbType = convert4(docgenInfo);
  return applyJsDocResult(propDef, jsDocParsingResult);
}, "tsFactory");
var flowFactory = /* @__PURE__ */ __name((propName, docgenInfo, jsDocParsingResult) => {
  const propDef = createFlowPropDef(propName, docgenInfo);
  propDef.sbType = convert4(docgenInfo);
  return applyJsDocResult(propDef, jsDocParsingResult);
}, "flowFactory");
var unknownFactory = /* @__PURE__ */ __name((propName, docgenInfo, jsDocParsingResult) => {
  const propDef = createBasicPropDef(propName, { name: "unknown" }, docgenInfo);
  return applyJsDocResult(propDef, jsDocParsingResult);
}, "unknownFactory");
var getPropDefFactory = /* @__PURE__ */ __name((typeSystem) => {
  switch (typeSystem) {
    case "JavaScript" /* JAVASCRIPT */:
      return javaScriptFactory;
    case "TypeScript" /* TYPESCRIPT */:
      return tsFactory;
    case "Flow" /* FLOW */:
      return flowFactory;
    default:
      return unknownFactory;
  }
}, "getPropDefFactory");

// src/docs-tools/argTypes/docgen/extractDocgenProps.ts
var getTypeSystem = /* @__PURE__ */ __name((docgenInfo) => {
  if (docgenInfo.type != null) {
    return "JavaScript" /* JAVASCRIPT */;
  }
  if (docgenInfo.flowType != null) {
    return "Flow" /* FLOW */;
  }
  if (docgenInfo.tsType != null) {
    return "TypeScript" /* TYPESCRIPT */;
  }
  return "Unknown" /* UNKNOWN */;
}, "getTypeSystem");
var extractComponentSectionArray = /* @__PURE__ */ __name((docgenSection) => {
  const typeSystem = getTypeSystem(docgenSection[0]);
  const createPropDef = getPropDefFactory(typeSystem);
  return docgenSection.map((item) => {
    let sanitizedItem = item;
    if (item.type?.elements) {
      sanitizedItem = {
        ...item,
        type: {
          ...item.type,
          value: item.type.elements
        }
      };
    }
    return extractProp(sanitizedItem.name, sanitizedItem, typeSystem, createPropDef);
  });
}, "extractComponentSectionArray");
var extractComponentSectionObject = /* @__PURE__ */ __name((docgenSection) => {
  const docgenPropsKeys = Object.keys(docgenSection);
  const typeSystem = getTypeSystem(docgenSection[docgenPropsKeys[0]]);
  const createPropDef = getPropDefFactory(typeSystem);
  return docgenPropsKeys.map((propName) => {
    const docgenInfo = docgenSection[propName];
    return docgenInfo != null ? extractProp(propName, docgenInfo, typeSystem, createPropDef) : null;
  }).filter(Boolean);
}, "extractComponentSectionObject");
var extractComponentProps = /* @__PURE__ */ __name((component, section) => {
  const docgenSection = getDocgenSection(component, section);
  if (!isValidDocgenSection(docgenSection)) {
    return [];
  }
  return Array.isArray(docgenSection) ? extractComponentSectionArray(docgenSection) : extractComponentSectionObject(docgenSection);
}, "extractComponentProps");
function extractProp(propName, docgenInfo, typeSystem, createPropDef) {
  const jsDocParsingResult = parseJsDoc(docgenInfo.description);
  const isIgnored = jsDocParsingResult.includesJsDoc && jsDocParsingResult.ignore;
  if (!isIgnored) {
    const propDef = createPropDef(propName, docgenInfo, jsDocParsingResult);
    return {
      propDef,
      jsDocTags: jsDocParsingResult.extractedTags,
      docgenInfo,
      typeSystem
    };
  }
  return null;
}
__name(extractProp, "extractProp");
function extractComponentDescription(component) {
  return component != null ? getDocgenDescription(component) : "";
}
__name(extractComponentDescription, "extractComponentDescription");

// src/preview-api/modules/store/parameters.ts
var combineParameters = /* @__PURE__ */ __name((...parameterSets) => {
  const mergeKeys = {};
  const definedParametersSets = parameterSets.filter(Boolean);
  const combined = definedParametersSets.reduce((acc, parameters) => {
    Object.entries(parameters).forEach(([key, value]) => {
      const existing = acc[key];
      if (Array.isArray(value) || typeof existing === "undefined") {
        acc[key] = value;
      } else if (isPlainObject(value) && isPlainObject(existing)) {
        mergeKeys[key] = true;
      } else if (typeof value !== "undefined") {
        acc[key] = value;
      }
    });
    return acc;
  }, {});
  Object.keys(mergeKeys).forEach((key) => {
    const mergeValues = definedParametersSets.filter(Boolean).map((p) => p[key]).filter((value) => typeof value !== "undefined");
    if (mergeValues.every((value) => isPlainObject(value))) {
      combined[key] = combineParameters(...mergeValues);
    } else {
      combined[key] = mergeValues[mergeValues.length - 1];
    }
  });
  return combined;
}, "combineParameters");

// src/docs-tools/argTypes/enhanceArgTypes.ts
var enhanceArgTypes = /* @__PURE__ */ __name((context) => {
  const {
    component,
    argTypes: userArgTypes,
    parameters: { docs = {} }
  } = context;
  const { extractArgTypes } = docs;
  if (!extractArgTypes || !component) {
    return userArgTypes;
  }
  const extractedArgTypes = extractArgTypes(component);
  return extractedArgTypes ? combineParameters(extractedArgTypes, userArgTypes) : userArgTypes;
}, "enhanceArgTypes");

// src/docs-tools/shared.ts
var ADDON_ID = "storybook/docs";
var PANEL_ID = `${ADDON_ID}/panel`;
var PARAM_KEY = `docs`;
var SNIPPET_RENDERED = `${ADDON_ID}/snippet-rendered`;
var SourceType = /* @__PURE__ */ ((SourceType2) => {
  SourceType2["AUTO"] = "auto";
  SourceType2["CODE"] = "code";
  SourceType2["DYNAMIC"] = "dynamic";
  return SourceType2;
})(SourceType || {});

export {
  combineParameters,
  convert4 as convert,
  TypeSystem,
  isDefaultValueBlacklisted,
  str,
  hasDocgen,
  isValidDocgenSection,
  getDocgenSection,
  getDocgenDescription,
  parseJsDoc,
  MAX_TYPE_SUMMARY_LENGTH,
  MAX_DEFAULT_VALUE_SUMMARY_LENGTH,
  isTooLongForTypeSummary,
  isTooLongForDefaultValueSummary,
  createSummaryValue,
  normalizeNewlines,
  extractComponentSectionArray,
  extractComponentSectionObject,
  extractComponentProps,
  extractComponentDescription,
  enhanceArgTypes,
  ADDON_ID,
  PANEL_ID,
  PARAM_KEY,
  SNIPPET_RENDERED,
  SourceType
};
