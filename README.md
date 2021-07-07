# Experiments with writing a js deobfuscator

The code is in no way production ready, but I've managed to get some success out of it for myself.
In particular, it is using `safe-eval` internally, as a simple way to unscramble the array before proceeding. So probably don't run this on malicious code.

The main deobfuscator is `transformers/constant-fold.ts` (yes, bad name, I know) and can be run with:

```
cp path/to/file{.min,}.js
yarn jscodeshift -t transforms/constant-fold.ts path/to/file.js
```

The cp is so you can keep the original, since jscodeshift by default overwrites the file it transforms.

Warning: It can be very slow on large files (and use a lot of memory). I'm not completely sure why.

There are also a few other random transformations that I found useful, mostly for renaming.

If the obfuscated file was a bundle, it can be very helpful to run it through a [debundler](https://github.com/anka-213/debundle).

# Alternatives
Here are a few other js deobfuscators
* https://github.com/lelinhtinh/de4js
* https://github.com/LostMyCode/javascript-deobfuscator
* https://github.com/sd-soleaio/javascript-deobfuscator
* https://github.com/uwu/synchrony