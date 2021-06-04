// transforms/implicit-icons-to-explicit-imports.ts
import {
  ASTNode,
  ASTPath,
  Identifier,
  JSCodeshift,
  MemberExpression,
  Transform,
  VariableDeclaration,
  VariableDeclarator,
} from "jscodeshift";
import { isValidIdentifier } from "@babel/types";
import { Collection } from "jscodeshift";
import { Type } from "ast-types/lib/types";

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
  decl.renameTo("hello");
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
  const varisvar = root
    .find(j.VariableDeclarator, {
      type: "VariableDeclarator",
      id: { type: "Identifier" },
      init: { type: "Identifier" },
    })
    .forEach((vd) => {
      // No pattern matching declarations
      if (vd.value.id.type != "Identifier" || vd.value.init.type != "Identifier") return null;
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
        .forEach((path) => { // identifier must refer to declared variable
          let scope = path.scope;
          while (scope && scope !== rootScope) {
            if (scope.declares(oldName)) return;
            scope = scope.parent;
          }
          if (!scope) return; // The variable must be declared
          path.get('name').replace(newName)
        });
    });
  // const funs = root.find(j.FunctionDeclaration,{expression: false, body: {type: "BlockStatement"}})
  // let funBod = root.find(j.FunctionDeclaration).paths()[0].value.body.body
  let funBod = root.find(j.FunctionDeclaration).forEach((fun) => {
    let stmts = fun.get("body", "body");
    let last = stmts.get(stmts.value.length - 2);
    // if (!j.VariableDeclaration.check(last.value)) return null
    if (!checkPath(last, j.VariableDeclaration)) return null;
    last.value;
    if (last.value.type === "VariableDeclaration") {
      let last1: ASTPath<VariableDeclaration> =
        last as ASTPath<VariableDeclaration>;
      const varDecl = last1.value.declarations[0];
      if (varDecl.type !== "VariableDeclarator") return;
      if (varDecl.id.type !== "Identifier") return;
      const oldName = varDecl.id.name;
      const scope = j(last1).closestScope();
      // scope.find(j.Identifier, {name: last1.value.id.name})

      let foo = last1.get("declarations", 0);
      last.value.declarations;
      // foo.
    }
    stmts.value.reduceRight((prev, curr, idx, arr) => {
      if (
        prev.type === "ReturnStatement" &&
        curr.type === "VariableDeclaration" &&
        curr.declarations.length === 1
      ) {
        let [dec] = curr.declarations;
        if (dec.type == "VariableDeclarator" && dec.id.type === "Identifier") {
          // dec.id.scope
        }
      }
      // j.match(curr, {type: "VariableDeclaration"})
      // j.match(curr,j.variableDeclaration("var",[j.variableDeclarator(j.identifier("foo"))]))
      return curr;
    });
    // stmts.replace([]);
  });

  console.log(varisvar);
  return root.toSource();
  // decl.paths()[0]
};

const isVariable = (j: JSCodeshift) => (path: ASTPath<Identifier>) => {
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

function checkPath<T extends ASTNode>(
  pth: ASTPath,
  t: Type<T>
): pth is ASTPath<T> {
  return t.check(pth.value);
}

export default transform;
