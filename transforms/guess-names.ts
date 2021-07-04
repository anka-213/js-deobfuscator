import core, {
  ASTNode,
  ASTPath,
  Identifier,
  JSCodeshift,
  Transform,
} from "jscodeshift";
import { Type } from "ast-types/lib/types";

// Guess the name of variables based on context
// For use together with the `debundle` tool
// since you probably won't get standalone obfuscated modules very often

// One easy case is:
// var { foo: v3856 } = baz;
// =>
// var { foo: foo } = baz;

// We can also guess that imports from a module should be named the same as the module:
// var v324 = require('foo/bar');
// =>
// var bar = require('foo/bar');
//
// (or foo? or fooBar?)

// When we import a single item, use that for name.
// var v324 = require('foo/bar').Baz;
// =>
// var Baz = require('foo/bar').Baz;

// Remember to check for duplicate names!
// var v324 = require('foo/bar');
// var v538 = require('baz/bar');
// =>
// var bar = require('foo/bar');
// var bar1 = require('baz/bar');

const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the entire file source into a collection of nodes paths.
  console.log("Parsing");
  const root = j(file.source, {});
  console.log("Parsed");

  const result = root.toSource();
  return result;
  // decl.paths()[0]
};

export default transform;

const checkPath =
  <T extends ASTNode>(t: Type<T>) =>
  (pth: ASTPath<any>): pth is ASTPath<T> => {
    return t.check(pth.value);
  };