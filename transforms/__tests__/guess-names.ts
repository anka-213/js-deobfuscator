import { defineTest } from "jscodeshift/dist/testUtils";

describe("guess-names", () => {
  //   defineTest(__dirname, "guess-names", null, `RenameObjectPattern`, {
  //     parser: "babel",
  //   });
  defineTest(__dirname, "guess-names", null, `RenameRequireResults`, {
    parser: "babel",
  });
});
