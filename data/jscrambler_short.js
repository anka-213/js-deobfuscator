// See this paper for an algorithm for decompilation:
// https://net.cs.uni-bonn.de/fileadmin/ag/martini/Staff/yakdan/dream_ndss2015.pdf

c6DD[20358] = (function(C, E, O) {
    var K = 2;
    for (; K !== 1; ) {
        switch (K) {
        case 2:
            return {
                l8L: (function o(C, u, V) {
                    var z = 2;
                    for (; z !== 32; ) {
                        switch (z) {
                        // var J = [];
                        case 2: var J = []; z = 1; break;
                        // var x, a n, i, B, F, w;
                        case 1: var x; var a; var n; z = 3; break;
                        case 3: var i; var B; var f; z = 7; break;
                        case 7: var F; var w; z = 14; break;

                        // for (x = 0; x < 48; x+=1) {
                        case 14: x = 0; z = 13; break;
                        case 13: z = x < 48 ? 12 : 10; break;
                            // J[x] = []
                            case 12: J[x] = []; z = 11; break;
                        case 11: x += 1; z = 13; break;
                        // }

                        // for (a = 0; a < 48; a++) {
                        case 10: a = 0; z = 20; break;
                        case 20: z = a < 48 ? 19 : 33; break;
                          // n = 47
                          case 19: n = 48 - 1; z = 18; break;
                          // while (n >= 0) {
                          case 18: z = n >= 0 ? 17 : 34; break;
                            // i = 0; B = 0;
                            case 17: i = 0; B = 0; z = 15; break;
                            // f = B;
                            case 15: f = B; z = 27; break;
                            // do {
                              // f = B; B = V[i]; F = B - f; i++;
                              // f = 0; B = 48; F = 48;
                              case 27: f = B; B = V[i]; F = B - f; i++; z = 23; break;
                            case 23: z = n >= B ? 27 : 22; break;
                            // } while (n >= B) // Loop until B fits in n

                            // w = f + (n - f + u * a) % F;
                            // w = (n + 15 * a) % 48
                            // inverse: n = (((w - 15 * a) % 48) + 48) % 48
                            case 22: w = f + (n - f + u * a) % F;
                                     J[a][w] = J[n]; z = 35; break;
                          case 35: n -= 1; z = 18; break;
                          // }
                        case 34: a += 1; z = 20; break;
                        // }

                        case 33: return J; break;

                        }
                    }
                }
                )(48, E, O)
            };
            break;
        }
    }
}
)(48, 15, [48]);