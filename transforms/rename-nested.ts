// transforms/implicit-icons-to-explicit-imports.ts
import core, {
  ASTNode,
  ASTPath,
  Identifier,
  JSCodeshift,
  Transform,
} from "jscodeshift";
import { Type } from "ast-types/lib/types";


const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the entire file source into a collection of nodes paths.
  Object;
  console.log("Parsing");
  const root = j(file.source, {});
  console.log("Parsed");

  // Rename functions
  {
    let funNr = 1;
    const funDecls = root.find(j.FunctionDeclaration);
    funDecls.forEach((vd) => {
      // const vd: Collection<VariableDeclarator> = j(pth);
      const oldName = vd.value.id.name;
    //   const newName = "f" + funNr++;
      const funId = vd.scope._numFuns = vd.scope._numFuns + 1 || 1
      const newName = `nest${vd.scope.depth+1}_f${funId}`
      // const newName = "nest" + "f" + funNr++;
      const rootScope = vd.parentPath.scope;
      const jScope = j(vd.parentPath).closestScope();

      funNr++;
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
          path.get("name").replace(newName as unknown as ASTNode);
        });
      // varNr++;
    });
    console.log(`Renamed ${funNr} functions`);
  }

//   j.Function

  // Rename variables
  {
    let varNr = 1;
    const varDecls = root.findVariableDeclarators();
    varDecls.forEach((pth, i) => {
      // const vd: Collection<VariableDeclarator> = j(pth);
      const varId = pth.scope._numVars = pth.scope._numVars + 1 || 1
      const vd = varDecls.at(i);
    //   vd.renameTo("v" + varNr);
      vd.renameTo(`n${pth.scope.depth+1}_v${varId}`);
      varNr++;
    });
    console.log(`Renamed ${varNr} variables`);
  }


  // Rename arguments
  const funDeclsA = root.find(j.Function);
  let anon = 1;
  funDeclsA.forEach((fd, i, pths) => {
    // const vd: Collection<VariableDeclarator> = j(pth);
    let argNr = 1;
    const jvd = funDeclsA.at(i);
    // const funId = fd.scope.numAnons = fd.scope.numAnons + 1 || 1
    // const newName = `nest${fd.scope.depth+1}_anon${funId}`
    const newName = `nest${fd.scope.depth+1}`
    const fname = fd.value.id?.name ?? newName;
    // const fname = fd.value.id?.name ?? "anon" + anon++;
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
          // path.get("name").replace(newName as unknown as ASTNode);
          path.replace(j.identifier(newName));
        });
    });
  });
  console.log(`Renamed arguments for ${funDeclsA.length} functions`);

  const result = root.toSource();
  return result;
  // decl.paths()[0]
};

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

export default transform;
