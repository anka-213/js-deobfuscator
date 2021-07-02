// transforms/implicit-icons-to-explicit-imports.ts
import core, {
  ASTNode,
  ASTPath,
  CallExpression,
  Collection,
  ExpressionStatement,
  Identifier,
  JSCodeshift,
  Literal,
  MemberExpression,
  Transform,
  VariableDeclarator,
} from "jscodeshift";
import { isValidIdentifier } from "@babel/types";
// import { Collection } from "jscodeshift";
import { Type } from "ast-types/lib/types";
import { Scope } from "ast-types/lib/scope";
// import { Scope } from "ast-types/lib/scope";
import safeEval from "safe-eval";

const shouldRename = true;

function unescape(str: string) {
  var i = 32;
  while (i < 128) {
    str = str.replace(
      new RegExp("\\\\x" + i.toString(16), "ig"),
      String.fromCharCode(i)
    );
    str = str.replace(
      new RegExp("\\\\u00" + i.toString(16), "ig"),
      String.fromCharCode(i)
    );
    i++;
  }
  str = str.replace(/\\x09/g, "\t");
  return str;
}

function unescapeAll(str: string) {
  str.replace(/\\(x|u00)([0-9]{2})/, (a, b, nr) =>
    String.fromCharCode(parseInt(nr, 16))
  );
}

function unescapeRegExp<T>(value: T) {
  if (!(value instanceof RegExp)) return value;
  return new RegExp(unescape(value.source), value.flags);
}

const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  const example1 = j("/\\x74\\u0072\\u0075\\x65/")
    .find(j.Literal)
    .replaceWith(({ value: { value } }) => j.literal(unescapeRegExp(value)));
  // .forEach(x => console.log(x.value.raw = unescape(x.value.raw)))
  console.log(example1.toSource());
  // Convert the entire file source into a collection of nodes paths.
  Object;
  console.log("Parsing");
  const root = j(file.source, {});
  console.log("Parsed");
  const lits = root
    .find(j.Literal, (x) => typeof x.value === "number")
    .replaceWith((nodePath) => {
      const { node } = nodePath;
      return j.literal(node.value);
    }).length;
  console.log(`Transformed ${lits} numbers`);
  // const myArr = "_0x2889";
  const decl = root.find(j.VariableDeclarator, {
    type: "VariableDeclarator",
    // id: { type: "Identifier", name: myArr },
    id: { type: "Identifier" },
    init: { type: "ArrayExpression" },
  });
  console.log(`Found ${decl.length} array declarations`);

  function evalArray(dcl: Collection<VariableDeclarator>) {
    if (dcl.length == 0) return;
    const fstArr = dcl.paths()[0];
    const fsn = fstArr.node;

    if (!j.Identifier.check(fsn.id)) return;
    const name = fsn.id.name;
    // This should be the first line of a program
    if (fstArr.parent.parent.node.type != "Program") return;
    // if (fstArr.parent.name != 0) return;

    console.log("ready");

    // Find all uses of array
    const uses = root.find(j.Identifier, { name }).paths();
    const topLevel: ASTPath[] = uses.map((use) => {
      while (use?.parent) {
        // console.log(use.parent.node.type)
        if (use.parent.node.type == "Program") return use;
        use = use.parent;
      }
      console.log("failure", use);
    });

    console.log(topLevel.map((x) => x.node.type));
    const lastIdx = topLevel
      .map((x) => +x.name)
      .reduce((x, y) => Math.max(x, y));
    const newBody = fstArr.parent.parent.node.body.slice(0, lastIdx + 1);
    newBody.push(j.returnStatement(j.identifier(name)));
    // console.log(lastIdx)
    // console.log(topLevel.map((x) => x?.name));

    const myFun = j.functionExpression(null, [], j.blockStatement(newBody));
    const callFun = j.callExpression(myFun, []);
    // console.log(j(callFun).toSource())

    // const evaluated = staticEval(callFun, {})
    // TODO: Super unsafe!
    let evaluated : string[]
    try {
      evaluated = safeEval(j(callFun).toSource());
    } catch (e) {
      console.warn(e)
      return
    }
    // console.log(evaluated)
    const newArray = j.arrayExpression(evaluated.map((x) => j.literal(x)));
    fstArr.get("init").replace(newArray);
    // console.log(topLevel.map((x) => j(x).toSource()));

    const transformers = topLevel.filter<ASTPath<ExpressionStatement>>(
      checkPath(j.ExpressionStatement)
    );
    const transformer = transformers.find(
      (x) => x.node.expression.type == "CallExpression"
    );
    if (!transformer) return;
    console.log(transformer);
    transformer.prune();
    return true;
  }
  const eaRes = evalArray(decl);
  console.log(`Evaluated array: ${!!eaRes}`);

  // Convert function expressions to function declarations
  // var f = function(){...}
  // to
  // function f(){...}
  root
    .find(j.VariableDeclaration, {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier" },
          init: { type: "FunctionExpression" },
        },
      ],
    })
    .forEach((vds) => {
      // let vd = vds.get("declarations",0) // as ASTPath<VariableDeclarator>
      // if (!checkPath(j.VariableDeclarator)(vd)) return
      // let name = vd.get("id")
      // if (!checkPath(j.Identifier)(name)) return
      // let fun = vd.get("init")
      // if (!checkPath(j.FunctionExpression)(fun)) return
      // console.log(fun)

      let vd = vds.node.declarations[0];
      if (!j.VariableDeclarator.check(vd)) return;
      let name = vd.id;
      if (!j.Identifier.check(name)) return;
      let fun = vd.init;
      if (!j.FunctionExpression.check(fun)) return;

      vds.replace(j.functionDeclaration(name, fun.params, fun.body));
    });
  // console.log(decl);
  // const dotExprs = root.find(j.MemberExpression, x => x?.property?.type == "Literal" && isValidIdentifier(x?.property.value))
  transformDotExprs(root, j);

  if (shouldRename) {
    // Rename variables
    {
      let varNr = 1;
      const varDecls = root.findVariableDeclarators();
      varDecls.forEach((pth, i) => {
        // const vd: Collection<VariableDeclarator> = j(pth);
        const vd = varDecls.at(i);
        vd.renameTo("v" + varNr);
        varNr++;
      });
      console.log(`Renamed ${varNr} variables`);
    }

    // Rename functions
    {
      let funNr = 1;
      const funDecls = root.find(j.FunctionDeclaration);
      funDecls.forEach((vd) => {
        // const vd: Collection<VariableDeclarator> = j(pth);
        const oldName = vd.value.id.name;
        const newName = "f" + funNr++;
        const rootScope = vd.parentPath.scope;
        const jScope = j(vd.parentPath).closestScope();
        // const vd = funDecls.at(i);
        // pth.value.id.name
        // vd.renameTo("f" + varNr);
        jScope
          .find(j.Identifier, { name: oldName })
          .filter(isVariable(j))
          .forEach((path) => {
            // identifier must refer to declared variable
            let scope = path.scope;
            while (scope && scope !== rootScope) {
              if (scope.declares(oldName)) return;
              scope = scope.parent;
            }
            if (!scope) return; // The variable must be declared
            path.get("name").replace(newName);
          });
        // varNr++;
      });
      console.log(`Renamed ${funNr} functions`);
    }

    // Rename arguments
    const funDeclsA = root.find(j.Function);
    let anon = 1;
    funDeclsA.forEach((fd, i, pths) => {
      // const vd: Collection<VariableDeclarator> = j(pth);
      let argNr = 1;
      const jvd = funDeclsA.at(i);
      const fname = fd.value.id?.name ?? "anon" + anon++;
      const args = jvd
        .map((x) => x.get("params").map((x) => x, null))
        .filter(checkPath(j.Identifier));
      // console.log(args);
      args.forEach((vd) => {
        const oldName = vd.value.name;
        const newName = fname + "_arg" + argNr++;
        const rootScope = vd.scope;
        const jScope = j(vd).closestScope();
        // const vd = funDecls.at(i);
        // pth.value.id.name
        // vd.renameTo("f" + varNr);
        jScope
          .find(j.Identifier, { name: oldName })
          .filter(isVariable(j))
          .forEach((path) => {
            // identifier must refer to declared variable
            let scope = path.scope;
            while (scope && scope !== rootScope) {
              if (scope.declares(oldName)) return;
              scope = scope.parent;
            }
            if (!scope) return; // The variable must be declared
            path.get("name").replace(newName);
          });
      });
    });
    console.log(`Renamed arguments for ${funDeclsA.length} functions`);

    // Remove aliases like "var foo = bar;" and replace foo with bar
    const varisvar = root
      .find(j.VariableDeclarator, {
        type: "VariableDeclarator",
        id: { type: "Identifier" },
        init: { type: "Identifier" },
      })
      .forEach((vd) => {
        // No pattern matching declarations
        if (
          vd.value.id.type != "Identifier" ||
          vd.value.init.type != "Identifier"
        )
          return null;
        const oldName = vd.value.id.name;
        const newName = vd.value.init.name;
        const rootScope = vd.scope;
        const jScope = j(vd).closestScope();
        // vd.scope.bindings

        // We don't replace if the value is changed at any point
        const changes = jScope.find(j.AssignmentExpression, {
          left: { type: "Identifier", name: oldName },
        });
        if (changes.length > 0) return null;

        jScope
          .find(j.Identifier, { name: oldName })
          .filter(isVariable(j))
          .forEach((path) => {
            // identifier must refer to declared variable
            let scope = path.scope;
            while (scope && scope !== rootScope) {
              if (scope.declares(oldName)) return;
              scope = scope.parent;
            }
            if (!scope) return; // The variable must be declared
            path.get("name").replace(newName);
          });
        vd.prune();
      }).length;
    console.log(`Inlined ${varisvar} aliases`);
  }
  // Simplify function return
  // const funs = root.find(j.FunctionDeclaration,{expression: false, body: {type: "BlockStatement"}})
  // let funBod = root.find(j.FunctionDeclaration).paths()[0].value.body.body
  let funBod = root.find(j.FunctionDeclaration).forEach((fun, i) => {
    // Only simplify the first function (since this transformation is fragile)
    if (i > 0) return;
    let stmts = fun.get("body", "body");
    let second_last = stmts.get(stmts.value.length - 2);
    // if (!j.VariableDeclaration.check(last.value)) return null
    if (!checkPath(j.VariableDeclaration)(second_last)) return null;

    second_last.value;
    // We only support a single declarator for now
    if (second_last.value.declarations.length != 1) return null;
    // const varDecl = second_last.value.declarations[0];
    const varDecl = second_last.get("declarations", 0);
    if (!checkPath(j.VariableDeclarator)(varDecl)) return;
    if (varDecl.value.id.type !== "Identifier") return;
    const oldName = varDecl.value.id.name;
    const vd = varDecl;
    // scope.find(j.Identifier, {name: last1.value.id.name})

    const newValue = vd.value.init;
    if (!newValue) return;
    // Don't substitute expressions that contains "="
    const isComplex = j(newValue).find(j.AssignmentExpression);
    if (isComplex.length > 0) return;
    const rootScope = vd.scope;
    const jScope = j(vd).closestScope();
    // vd.scope.bindings

    // We don't replace if the value is changed at any point
    const changes = jScope.find(j.AssignmentExpression, {
      left: { type: "Identifier", name: oldName },
    });
    if (changes.length > 0) return null;

    const uses = jScope.find(j.Identifier, { name: oldName });
    if (uses.length !== 2) return;

    // TODO: Check that the the combined length is not too much

    uses.filter(isVariable(j)).forEach((path) => {
      // identifier must refer to declared variable
      let scope = path.scope;
      while (scope && scope !== rootScope) {
        if (scope.declares(oldName)) return;
        scope = scope.parent;
      }
      if (!scope) return; // The variable must be declared
      path.replace(newValue);
      if (!j.Literal.check(newValue)) return;
      repairInlinedVar(path, newValue);
    });
    vd.prune();

    // Part 2: Resolve expression statement "a = a + 1"
    const es = stmts.get(stmts.value.length - 2);
    if (!checkPath(j.ExpressionStatement)(es)) return null;
    const ae = es.get("expression");
    if (!checkPath(j.AssignmentExpression)(ae)) return null;
    // Not sure if this could happen
    if (ae.scope !== rootScope) return null;
    const l = ae.get("left");
    if (!checkPath(j.Identifier)(l)) return null;
    const oldName2 = l.value.name;
    const r = ae.get("right");
    const newValue2 = r;

    const ret = stmts.get(stmts.value.length - 1);
    if (!checkPath(j.ReturnStatement)(ret)) return null;
    j(ret)
      .find(j.Identifier, { name: oldName2 })
      .filter(isVariable(j))
      .forEach((path) => {
        let scope = path.scope;
        while (scope && scope !== rootScope) {
          if (scope.declares(oldName)) return;
          scope = scope.parent;
        }
        if (!scope) return; // The variable must be declared
        path.replace(newValue2.value);
      });
    es.prune();

    // TODO: Make this into a loop and extract functions

    // let foo = second_last.get("declarations", 0);
    // second_last.value.declarations;
    // // foo.
    // stmts.value.reduceRight((prev, curr, idx, arr) => {
    //   if (
    //     prev.type === "ReturnStatement" &&
    //     curr.type === "VariableDeclaration" &&
    //     curr.declarations.length === 1
    //   ) {
    //     let [dec] = curr.declarations;
    //     if (dec.type == "VariableDeclarator" && dec.id.type === "Identifier") {
    //       // dec.id.scope
    //     }
    //   }
    //   // j.match(curr, {type: "VariableDeclaration"})
    //   // j.match(curr,j.variableDeclaration("var",[j.variableDeclarator(j.identifier("foo"))]))
    //   return curr;
    // });
    // stmts.replace([]);
  });

  // Inline short single return function
  // NOTE: We are not verifying that the scope is the same for the variables after inlining
  root
    .find(j.FunctionDeclaration, {
      body: { body: [{ type: "ReturnStatement" }] },
    })
    .forEach((pth) => {
      const body = pth.get("body", "body");
      // Should never happen, since we already test for this
      if (body.value.length !== 1) return null;
      const expr1 = body.value[0];
      if (expr1.type !== "ReturnStatement") return null;
      const retVal = expr1.argument;
      const retSrc = j(retVal).toSource();
      console.log(retSrc, retSrc.length);
      if (retSrc.length > 30) return;

      const args = pth.value.params;
      // TODO: Support multiple args
      if (args.length == 0) return;
      if (args[0].type !== "Identifier") return;
      const argName = args[0].name;

      const vd = pth;
      const oldName = vd.value.id.name;

      const rootScope = vd.parentPath.scope;
      const jScope = j(vd.parentPath).closestScope();
      // const vd = funDecls.at(i);
      // pth.value.id.name
      // vd.renameTo("f" + varNr);
      jScope
        .find(j.Identifier, { name: oldName })
        .filter(isVariable(j))
        .forEach((path) => {
          // identifier must refer to declared variable
          let scope = path.scope;
          while (scope && scope !== rootScope) {
            if (scope.declares(oldName)) return;
            scope = scope.parent;
          }
          if (!scope) return; // The variable must be declared

          const parent = path.parentPath;
          if (!checkPath(j.CallExpression)(parent)) return;
          const pv = parent.value;
          // TODO: Handle multiple args
          const myArg = pv.arguments[0];

          // Hack to get a deep clone
          const newValue = j(j(retVal).toSource())
            .find(j.ExpressionStatement)
            .paths()[0].value.expression;
          // const newValue = retVal;

          // const myArg = parent.value.type
          // const myValue = j(newValue)
          //   .find(j.Identifier, { name: argName })
          //   .replaceWith((_) => myArg);
          // parent.replace(newValue);
          path.replace(j.arrowFunctionExpression(args, newValue));
          substLambda([path.parent]);
        });

      // NOTE: We might not always want to delete the function
      if (findIdentifier(oldName, jScope, rootScope).length == 1) {
        pth.prune();
      }
    });

  function substLambda(base: ASTPath<CallExpression>[]) {
    // Substitute into simple immediately evaluated lambda expressions
    // NOTE: We are not checking if the substitution is safe
    // root.find(j.CallExpression, { callee: { type: "ArrowFunctionExpression" }})
    base.filter(checkPath(j.CallExpression)).forEach((pth) => {
      const callee = pth.get("callee");
      if (!checkPath(j.ArrowFunctionExpression)(callee)) return;
      const body = callee.value.body;
      if (j.BlockStatement.check(body)) return;
      body;
      const params = callee.value.params;
      if (!params.every((x): x is Identifier => j.Identifier.check(x))) return;
      params;

      const args = pth.value.arguments;

      // if (params.length !== args.length) return
      const jbody = j(callee.get("body"));

      const rootScope = callee.get("body").scope;
      params.forEach((param, i) => {
        const arg = args[i] ?? j.identifier("undefined");
        if (j.SpreadElement.check(arg)) return;

        findIdentifier(param.name, jbody, rootScope).forEach((id) => {
          id.replace(arg);
        });
      });
      pth.replace(body);

      // console.log(pth);
    });
    // fun.value.body.body
  }

  // Subtraction
  root
    .find(j.BinaryExpression, {
      operator: "-",
      left: { type: "Literal" },
      right: { type: "Literal" },
    })
    .replaceWith(({ value }) => {
      const { left, right } = value;
      if (left.type !== "Literal" || right.type !== "Literal") return value;

      return j.literal(+left.value - +right.value);
    });

  // Substitute into simple immediately evaluated function expressions
  // NOTE: We are not checking if the substitution is safe
  // e.g. if we are mutating the local copy of the variables
  /*
  root
    .find(j.CallExpression, { callee: { type: "FunctionExpression" } })
    .forEach((pth) => {
      if (!checkPath(j.ExpressionStatement)(pth.parentPath)) return;
      const callee = pth.get("callee");
      if (!checkPath(j.FunctionExpression)(callee)) return;
      const body = callee.value.body;
      const params = callee.value.params;
      if (!params.every((x): x is Identifier => j.Identifier.check(x))) return;

      const args = pth.value.arguments;

      // if (params.length !== args.length) return
      const jbody = j(callee.get("body"));

      const rootScope = callee.get("body").scope;
      params.forEach((param, i) => {
        const arg = args[i] ?? j.identifier("undefined");
        if (j.SpreadElement.check(arg)) return;

        findIdentifier(param.name, jbody, rootScope).forEach((id) => {
          id.replace(arg);

          // // NOTE: This is not safe at all!
          // // It assumes that the variable is only modified once
          // if (!j.Literal.check(arg)) return;
          // let par = id.parent;
          // if (!checkPath(j.UpdateExpression)(par)) return;
          // let parN = par.node;
          // if (parN.operator !== "++" || !parN.prefix) return;

          // par.replace(j.literal(+arg.value + 1));
        });
      });
      pth.parentPath.replace(body);

      // console.log(pth);
    });
    // */

  // DONE: ![] => false,  !![] => true
  root
    .find(j.UnaryExpression, {
      operator: "!",
      argument: { type: "ArrayExpression" },
    })
    .replaceWith((x) => j.literal(false));

  root
    .find(j.UnaryExpression, {
      operator: "!",
      argument: { type: "Literal", value: false },
    })
    .replaceWith((x) => j.literal(true));

  // Transform: !0 => true
  root
    .find(j.UnaryExpression, {
      operator: "!",
      argument: { type: "Literal", value: 0 },
    })
    .replaceWith((x) => j.literal(true));
  // Transform: !1 => false
  root
    .find(j.UnaryExpression, {
      operator: "!",
      argument: { type: "Literal", value: 1 },
    })
    .replaceWith((x) => j.literal(false));

  // Substitute array indexing with the actual values
  // TODO: Don't do this if the array would be mutated
  root
    .find(j.VariableDeclarator, {
      type: "VariableDeclarator",
      id: { type: "Identifier" },
      init: { type: "ArrayExpression" },
    })
    .forEach((pth, i) => {
      // TODO: Make this less fragile
      // Only substitute the first array
      if (i > 0) return;
      if (pth.value.id.type !== "Identifier") return;
      const arrayName = pth.value.id.name;
      if (pth.value.init.type !== "ArrayExpression") return;
      const values = pth.value.init.elements;

      const rootScope = pth.scope;
      const jScope = j(pth).closestScope();
      findIdentifier(arrayName, jScope, rootScope).forEach((arrUse) => {
        const parent = arrUse.parentPath;
        if (!checkPath(j.MemberExpression)(parent)) return;
        const idx = parent.value.property;
        if (idx.type !== "Literal" || typeof idx.value !== "number") return;
        const newValue = values[idx.value];
        // TODO: Check that newValue is valid
        parent.replace(newValue);
      });
      if (findIdentifier(arrayName, jScope, rootScope).length == 1) {
        pth.prune();
      }
    });

  // Transform the newly formed foo["bar"] into foo.bar
  transformDotExprs(root, j);

  // DONE: Learn subtraction
  // TODO: a && b => if (a) { b }
  // TODO: a , b => { a ; b }
  // Related: return a , b => a ; return b
  // DONE: Apply the non-lambda function to its arguments as well (maybe just FunctionExpression is sufficient, but we need to check that we are in an ExpressionStatement too)
  // TODO: Write some real unit tests (should probably have started with this)
  // DONE: Take a shortcut and run the first part manually and put it in a separate file, so we can figure out what's happening without having to run the complicated code

  // TODO: Handle bundler code (in a separate module):
  // * Rename export, import, etc function arguments to the standard names
  // * Give a number to each function to simplify lookup

  // Alternative naming scheme: global3_fun7_var5

  // IDEA: Generate hashes for library functions so we can find what they were compiled from
  // Naming scheme: scope-depth_var-nr should work for that
  // Convert so it referres to other modules by hash instead of name
  // Problem: Need to find a normal form to be independent of settings

  const result = root.toSource();
  return result;
  // decl.paths()[0]
};

function transformDotExprs(root: Collection, j: core.JSCodeshift) {
  const dotExprs = root
    .find(
      j.MemberExpression,
      ({ property }) =>
        property &&
        property.type == "Literal" &&
        // property.computed &&
        isValidIdentifier(property.value)
    )
    .replaceWith((pth) => {
      let { object, property } = pth.node;
      let ans: MemberExpression = pth.node;
      // console.log(ans);
      if (property.type === "Literal" && typeof property.value === "string") {
        // DONE: Same problem with missing parens for `(a+b)[c]`
        // TODO: Problem with deeper nesting
        if (object.type === "BinaryExpression") {
          object = j.binaryExpression(
            object.operator,
            object.left,
            object.right
          );
        }
        if (object.type === "AssignmentExpression") {
          object = j.assignmentExpression(
            object.operator,
            object.left,
            object.right
          );
        }
        ans = j.memberExpression(object, j.identifier(property.value));
        // // Not the correct way to do things, but might work better
        // pth.node.computed = false;
        // pth.node.property = j.identifier(property.value);
      }
      // console.log(ans);
      return ans;
      // return pth.node;
    }).length;
  console.log(`Transformed ${dotExprs} member-expressions`);
}

function repairInlinedVar(id: ASTPath<Identifier>, arg: Literal) {
  const j = core;

  // NOTE: This is not safe at all!
  // It assumes that the variable is only modified once
  let par = id.parent;
  if (!checkPath(j.UpdateExpression)(par)) return;
  let parN = par.node;
  if (parN.operator !== "++" || !parN.prefix) return;

  par.replace(j.literal(+arg.value + 1));
}

function findIdentifier(name: string, haystack: Collection, rootScope: Scope) {
  const j = core;

  return haystack
    .find(j.Identifier, { name: name })
    .filter(isVariable(j))
    .filter((path) => {
      // identifier must refer to declared variable
      let scope = path.scope;
      while (scope && scope !== rootScope) {
        if (scope.declares(name)) return false;
        scope = scope.parent;
      }
      if (!scope) return false; // The variable must be declared
      // callback(path);
      return true;
    });
}

const isVariable = (j: JSCodeshift) => (path: ASTPath<Identifier>) => {
  const j = core;
  // ignore non-variables
  const parent: unknown = path.parent.node;

  if (
    j.MemberExpression.check(parent) &&
    parent.property === path.node &&
    !parent.computed
  ) {
    // obj.oldName
    return false;
  }

  if (
    j.Property.check(parent) &&
    parent.key === path.node &&
    !parent.computed
  ) {
    // { oldName: 3 }
    return false;
  }

  if (
    j.MethodDefinition.check(parent) &&
    parent.key === path.node &&
    !parent.computed
  ) {
    // class A { oldName() {} }
    return false;
  }

  if (
    j.ClassProperty.check(parent) &&
    parent.key === path.node &&
    !parent.computed
  ) {
    // class A { oldName = 3 }
    return false;
  }

  /*
    if (
      j.JSXAttribute.check(parent) &&
      parent.name === path.node &&
#      !parent.computed
    ) {
#      // <Foo oldName={oldName} />
      return false;
    }
     */

  return true;
};

const checkPath =
  <T extends ASTNode>(t: Type<T>) =>
  (pth: ASTPath<any>): pth is ASTPath<T> => {
    return t.check(pth.value);
  };
// (pth: ASTPath): pth is ASTPath<T> => {

export default transform;
