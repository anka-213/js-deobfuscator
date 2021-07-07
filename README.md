# Experiments with writing a js deobfuscator

The code is in no way production ready, but I've managed to get some success out of it for myself.

The main deobfuscator is `transformers/constant-fold.ts` (yes, bad name, I know) and can be run with:

```
cp path/to/file{.min,}.js
yarn jscodeshift -t transforms/constant-fold.ts path/to/file.js
```

The cp is so you can keep the original, since jscodeshift by default overwrites the file it transforms.

Warning: It can be very slow on large files (and use a lot of memory). I'm not completely sure why.

There are also a few other random transformations that I found useful, mostly for renaming.

If the obfuscated file was a bundle, it can be very helpful to run it through a [debundler](https://github.com/anka-213/debundle).