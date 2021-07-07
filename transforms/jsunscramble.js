fs = require("fs");

// Experiment with decoding the obfuscation on jscrambler.com
// Currently hard-coded with the key on the main-website

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// Decoder with the specific key used in the js-file on jscrambler.com
calcIdx = (a, w) => (+w - +15 * a).mod(48);

// matcher = /[a-zA-Z0-9]*\.[Ir]8L\(\)\[([0-9]*)\]\[([0-9]*)\]\[([0-9]*)\]/g;
matcher = /[a-zA-Z0-9]*\.[Ir]8L\(\)(\[([0-9]*)\])*/g;
innerMatch = /\[([0-9]*)\]/g;

deobf = (str) => str.replace(matcher, replacer);

replacer = (str) => {
  let numbers = [...str.matchAll(innerMatch)].map(([_, x]) => +x);
  return numbers.reduce(calcIdx);
};

var regexpSpecial = [
  "[",
  "]",
  "(",
  ")",
  "{",
  "}",
  "*",
  "+",
  "?",
  "|",
  "^",
  "$",
  ".",
  "\\",
];

// replacer = (_, a, w, inner_w) => {
//   let inner_a = calcIdx(a, w);
//   return (result = calcIdx(inner_a, inner_w));
// };

function unescapeAll(str) {
  // return str.replace(/\\(x|u00)([0-9a-f]{2})/gi, (a,b,nr) => String.fromCharCode(parseInt(nr,16)))
  return str.replace(/\\(x|u00)([0-9a-f]{2})/gi, (orig, b, hex_nr) => {
    const nr = parseInt(hex_nr, 16);
    if (nr < 32 || nr >= 128) return orig;
    const value = String.fromCharCode(nr);
    return regexpSpecial.includes(value) ? "\\" + value : value;
  });
}

fs.readFile("data/jscrambler.js", "utf8", (e, x) => {
  global.code = x;
  global.lines = x.split("\n");
  let result = deobf(x);
  result = unescapeAll(result);

  fs.writeFile("data/jscrambler.deobf1.js", result, "utf8", () => null);
});

// [_, a, w, inner_w] = lines[87088].match(matcher);
//
// inner_a = calcIdx(a, w);
// result = calcIdx(inner_a, inner_w);

// lines.filter(x=>x.match(/[rI]8L/))

// See this paper for an algorithm for decompilation:
// https://net.cs.uni-bonn.de/fileadmin/ag/martini/Staff/yakdan/dream_ndss2015.pdf
