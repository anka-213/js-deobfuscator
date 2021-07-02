// transforms/implicit-icons-to-explicit-imports.ts
import core, {
  ASTNode,
  ASTPath,
  Identifier,
  JSCodeshift,
  Transform,
} from "jscodeshift";
import { Type } from "ast-types/lib/types";

// See this paper for an algorithm for decompilation:
// https://net.cs.uni-bonn.de/fileadmin/ag/martini/Staff/yakdan/dream_ndss2015.pdf

// Convert code like
/*
var z = 2;
for (; z !== 32; ) {
    switch (z) {
    case 2: var sum = 0; z = 14; break;
    case 14: x = 0; z = 13; break;
    case 13: z = x < 48 ? 12 : 33; break;
    case 12: sum += x; z = 11; break;
    case 11: x += 1; z = 13; break;
    case 33: return sum; break;
    }
}
*/
// into
/*
var sum = 0
for (var x = 0; x < 48; x += 1) {
    sum += x;
}

*/

const transform: Transform = (file, api, options) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the entire file source into a collection of nodes paths.
  console.log("Parsing");
  const root = j(file.source, {});
  console.log("Parsed");

  //   const dscr = root.find(j.SwitchStatement).paths()[0].value.discriminant
  root.find(j.SwitchStatement).forEach((pth) => {
    const jpth = j(pth);
    const dscr = pth.value.discriminant;
    if (dscr.type != "Identifier") return;
    const scope = jpth.closestScope();
    const vds = scope.findVariableDeclarators(dscr.name);
    if (vds.length != 1) return;
    const [vd] = vds.paths();
    console.log(j(vd).toSource());

    const initiator = vd.value.init;
    if (initiator?.type !== "Literal") return;
    const initial_state = initiator.value;

    if (
      !checkPath(j.BlockStatement)(pth.parent) ||
      pth.parent.node.body.length != 1
    )
      return;
    const parent = pth.parent.parent;
    if (!checkPath(j.ForStatement)(parent)) return;
    const end_test = parent.node.test;
    console.log(j(end_test).toSource());

    j.BinaryExpression.check(end_test)
    root.map
    j(parent).every

    console.log({initial_state})

    return;
  });

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
