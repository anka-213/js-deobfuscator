function f1() {
  var v3 = (function () {
        var v4 = true;
        return function (anon2_arg1, anon2_arg2) {
          var v5 = v4
            ? function () {
            if (anon2_arg2) {
              var v7 = anon2_arg2.apply(
                anon2_arg1,
                arguments
              );
              return (anon2_arg2 = null), v7;
            }
          }
            : function () {};
          return (v4 = false), v5;
        };
      })(),
      v8 = v3(this, function () {
        function f2() {
          var v10 = f2.constructor("return /\" + this + \"/")().constructor("^([^ ]+( +[^ ]+)+)+[^ ]}");
          return !v10.test(v8);
        }
        return f2();
      });
  v8();
  var v11 = (function () {
    var v12 = true;
    return function (anon7_arg1, anon7_arg2) {
      var v13 = v12
        ? function () {
        if (anon7_arg2) {
          var v15 = anon7_arg2.apply(anon7_arg1, arguments);
          return (anon7_arg2 = null), v15;
        }
      }
        : function () {};
      return (v12 = false), v13;
    };
  })();
  (function () {
    v11(this, function () {
      var v17 = new RegExp("function *\\( *\\)"),
          v18 = new RegExp(
            "\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)",
            "i"
          ),
          v19 = f3("init");
      !v17.test(v19 + "chain") ||
      !v18.test(v19 + "input")
        ? v19("0")
        : f3();
    })();
  })();
  var v20 = (function () {
      var v21 = true;
      return function (anon13_arg1, anon13_arg2) {
        var v22 = v21
          ? function () {
          if (anon13_arg2) {
            var v24 = anon13_arg2.apply(
              anon13_arg1,
              arguments
            );
            return (anon13_arg2 = null), v24;
          }
        }
          : function () {};
        return (v21 = false), v22;
      };
    })(),
    v25 = v20(this, function () {
      var v27;
      try {
        var v28 = Function("return (function() " + "{}.constructor(\"return this\")( )" + ");");
        v27 = v28();
      } catch (_0x5849c3) {
        v27 = window;
      }
      var v29 = (v27.console =
          v27.console || {}),
        v30 = [
          "log",
          "warn",
          "info",
          "error",
          "exception",
          "table",
          "trace",
        ];
      for (
        var v31 = 0;
        v31 < v30.length;
        v31++
      ) {
        var v32 =
            v20.constructor.prototype.bind(v20),
          v33 = v30[v31],
          v34 = v29[v33] || v32;
        (v32.__proto__ = v20.bind(v20)),
          (v32.toString =
            v34.toString.bind(v34)),
          (v29[v33] = v32);
      }
    });
  v25(), console.log("Hello World!");
}
f1();
function f3(f3_arg1) {
  function f4(f4_arg1) {
    if (typeof f4_arg1 === "string")
      return function (anon17_arg1) {}.constructor("while\x20(true)\x20{}").apply("counter");
    else
      ("" + f4_arg1 / f4_arg1).length !== 1 ||
      f4_arg1 % 20 === 0
        ? function () {
            return true;
          }.constructor("debu" + "gger").call("action")
        : function () {
            return false;
          }.constructor("debu" + "gger").apply("stateObject");
    f4(++f4_arg1);
  }
  try {
    if (f3_arg1) return f4;
    else f4(0);
  } catch (_0x27d4d2) {}
}
setInterval(function () {
  f3();
}, 4000);
