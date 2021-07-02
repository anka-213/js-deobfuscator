// transforms/__tests__/constant-fold.ts
import { defineTest } from "jscodeshift/dist/testUtils";

describe("deobfuscate-array-code", () => {
  defineTest(__dirname, "constant-fold", null, `breakthecode`, {
    parser: "babel",
  });
  defineTest(__dirname, "constant-fold", null, `breakthecode.simplified`, {
    parser: "babel",
  });
  defineTest(__dirname, "constant-fold", null, `missing_parens`, {
    parser: "babel",
  });
});
