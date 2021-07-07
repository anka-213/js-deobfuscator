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
// v3856 + 1;
// =>
// var { foo: foo } = baz;
// foo + 1;

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

// We could generalize this to not just requires:
// var aaa = foo().bar;
// =>
// var bar = foo().bar;

// Remember to check for duplicate names!
// var v324 = require('foo/bar');
// var v538 = require('baz/bar');
// =>
// var bar = require('foo/bar');
// var bar1 = require('baz/bar');

// More ideas:
// When an object {foo: a, bar: b} is returned
// we can rename a to foo and b to bar (just check that the name is not already used)

// Similarly:
// app.updatedDate = foo
// =>
// app.updatedDate = updatedDate

// For Angular:
// Figure out names based on dependency injection
/*
  nest3_arg1.controller("BaseCtrl", [
    "$scope",
    "$rootScope",
    function (nest4_arg1, nest4_arg2) {
        // ...
    }
])
*/
// =>
/*
  nest3_arg1.controller("BaseCtrl", [
    "$scope",
    "$rootScope",
    function ($scope, $rootScope) {
        // ...
    }
])
*/

const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the entire file source into a collection of nodes paths.
//   console.log("Parsing");
  const root = j(file.source, {});
//   console.log("Parsed");

  // j('var a = 1; function(){ var b = 2;}')
  // does the outer scope declare b?

  const vds = root.findVariableDeclarators() // .map(x=>x.get("id")).filter(x => j.ObjectPattern.check(x))

  vds.forEach(pth => {
      
    const init = pth.node.init
    if (!(init && init.type == 'CallExpression' 
        && init.callee.type == 'Identifier'
        && init.callee.name == 'require'
        && init.arguments.length === 1
        && init.arguments[0].type === 'Literal'
        && typeof init.arguments[0].value === 'string')) return
    const newName = init.arguments[0].value
        .replace(/[\/.@-]+/g,'_')
        .replace(/^([0-9])/,'_$1')
    j(pth).renameTo(newName)
  })
  // vds.paths()[0].scope.declares("v3856")
  // console.log(vds.paths()[0].node)
  const result = root.toSource();
  return result;
};

export default transform;

const checkPath =
  <T extends ASTNode>(t: Type<T>) =>
  (pth: ASTPath<any>): pth is ASTPath<T> => {
    return t.check(pth.value);
  };
