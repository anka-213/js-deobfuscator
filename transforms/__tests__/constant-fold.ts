// transforms/__tests__/constant-fold.ts
import { defineTest } from "jscodeshift/dist/testUtils";

describe("implicit-icons-to-explicit-imports", () => {
  defineTest(
    __dirname,
    "constant-fold",
    null,
    `breakthecode`,
    { parser: "js" }
  );
});
