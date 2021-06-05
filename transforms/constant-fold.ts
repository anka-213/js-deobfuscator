// transforms/implicit-icons-to-explicit-imports.ts
import core, {
  ASTNode,
  ASTPath,
  Collection,
  Identifier,
  JSCodeshift,
  MemberExpression,
  Pattern,
  SpreadElement,
  Transform,
  VariableDeclaration,
  VariableDeclarator,
} from "jscodeshift";
import { isValidIdentifier } from "@babel/types";
// import { Collection } from "jscodeshift";
import { Type } from "ast-types/lib/types";
import { Scope } from "ast-types/lib/scope";
// import { Scope } from "ast-types/lib/scope";

const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the entire file source into a collection of nodes paths.
  Object;
  const root = j(file.source, {});
  const lits = root
    .find(j.Literal, (x) => typeof x.value === "number")
    .replaceWith((nodePath) => {
      const { node } = nodePath;
      return j.literal(node.value);
    });
  console.log(`Transformed ${lits.length} numbers`);
  // const myArr = "_0x2889";
  const decl = root.find(j.VariableDeclarator, {
    type: "VariableDeclarator",
    // id: { type: "Identifier", name: myArr },
    id: { type: "Identifier" },
    init: { type: "ArrayExpression" },
  });
  console.log(decl);
  // const dotExprs = root.find(j.MemberExpression, x => x?.property?.type == "Literal" && isValidIdentifier(x?.property.value))
  const dotExprs = root
    .find(
      j.MemberExpression,
      ({ property }) =>
        property.type == "Literal" &&
        // property.computed &&
        isValidIdentifier(property.value)
    )
    .replaceWith((pth) => {
      const { object, property } = pth.node;
      let ans: MemberExpression = pth.node;
      // console.log(ans);
      if (property.type === "Literal" && typeof property.value === "string") {
        ans = j.memberExpression(object, j.identifier(property.value));
      }
      // console.log(ans);
      return ans;
    });
  console.log(`Transformed ${dotExprs.length} member-expressions`);

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
    });

  // Simplify function return
  // const funs = root.find(j.FunctionDeclaration,{expression: false, body: {type: "BlockStatement"}})
  // let funBod = root.find(j.FunctionDeclaration).paths()[0].value.body.body
  let funBod = root.find(j.FunctionDeclaration).forEach((fun) => {
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
        path.replace(newValue);
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
        });
    });

  // Substitute into simple immediately evaluated lambda expressions
  // NOTE: We are not checking if the substitution is safe
  root
    .find(j.CallExpression, { callee: { type: "ArrowFunctionExpression" } })
    .forEach((pth) => {
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

        withIdent(param.name, jbody, rootScope, (id) => {
          id.replace(arg);
        });
      });
      pth.replace(body);

      // console.log(pth);
    });
  // fun.value.body.body

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
      if (typeof left.value !== "number" || typeof right.value !== "number")
        return value;

      return j.literal(left.value - right.value);
    });

  // Substitute into simple immediately evaluated function expressions
  // NOTE: We are not checking if the substitution is safe
  // e.g. if we are mutating the local copy of the variables
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

        withIdent(param.name, jbody, rootScope, (id) => {
          id.replace(arg);
        });
      });
      pth.parentPath.replace(body);

      // console.log(pth);
    });

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

  // DONE: Learn subtraction
  // TODO: a && b => if (a) { b }
  // TODO: a , b => { a ; b }
  // DONE: Apply the non-lambda function to its arguments as well (maybe just FunctionExpression is sufficient, but we need to check that we are in an ExpressionStatement too)
  // TODO: Write some real unit tests (should probably have started with this)
  // TODO: Take a shortcut and run the first part manually and put it in a separate file, so we can figure out what's happening without having to run the complicated code

  console.log(varisvar);
  return root.toSource();
  // decl.paths()[0]
};

function withIdent(
  name: string,
  haystack: Collection,
  rootScope: Scope,
  callback: (path: ASTPath<Identifier>) => void
) {
  const j = core;

  haystack
    .find(j.Identifier, { name: name })
    .filter(isVariable(j))
    .forEach((path) => {
      // identifier must refer to declared variable
      let scope = path.scope;
      while (scope && scope !== rootScope) {
        if (scope.declares(name)) return;
        scope = scope.parent;
      }
      if (!scope) return; // The variable must be declared
      callback(path);
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
