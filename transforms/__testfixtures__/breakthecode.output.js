'use strict';
var v1 = ['2XDTygo', '1079yilIzd', '368168VvQIgG', '14081gJOvPZ', 'getAttribute', '208866QssNBc', '/puzzle-new', 'cooldown', 'response', 'remove', 'modal-open', 'status', 'flags', '1512231DKtOVj', 'then', 'loading', 'error', 'disableSubmit', '3171IGRaWO', '.answer-popup-success', '127LGCEKU', '680575VSjskW', 'hidden', '#app', 'input', 'add', 'data', 'application/json', '1138771DnkNzm', 'querySelector'];
function f1(f1_arg1, f1_arg2) {
    return v1[f1_arg1 - 328];
}
(function(anon1_arg1, anon1_arg2) {
    while (!![]) {
        try {
            var v5 = -parseInt(v1[350 - 328]) + parseInt(v1[335 - 328]) + parseInt(v1[328 - 328]) + -parseInt(v1[357 - 328]) * parseInt(v1[340 - 328]) + -parseInt(v1[342 - 328]) + -parseInt(v1[337 - 328]) * parseInt(v1[339 - 328]) + -parseInt(v1[338 - 328]) * -parseInt(v1[355 - 328]);
            if (v5 === anon1_arg2)
                break;
            else
                anon1_arg1.push(anon1_arg1.shift());
        } catch (_0x9a3e53) {
            anon1_arg1.push(anon1_arg1.shift());
        }
    }
}(v1, 995135));
var v6 = new Vue({
    'el': v1[330 - 328],
    'data': {
        'input': '',
        'flags': {
            'cooldown': ![],
            'loading': ![],
            'error': ![]
        }
    },
    'computed': {
        'disableSubmit': function disableSubmit() {
            return this.input == '' || this.flags[v1[352 - 328]] || this[v1[349 - 328]][v1[344 - 328]];
        }
    },
    'methods': {
        'submit': function submit() {
            var v9 = this;
            !this[v1[354 - 328]] && this[v1[331 - 328]] !== '' && (this[v1[349 - 328]][v1[353 - 328]] = ![],
            this[v1[349 - 328]].loading = !![],
            setTimeout(function() {
                axios.post(v1[343 - 328], {
                    'answer': v9[v1[331 - 328]]
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document[v1[336 - 328]]('meta[name=\x22csrf-token\x22]')[v1[341 - 328]]('content'),
                        'Content-Type': v1[334 - 328]
                    }
                })[v1[351 - 328]](function(anon3_arg1) {
                    anon3_arg1.data && (v9.flags[v1[352 - 328]] = ![],
                    document[v1[336 - 328]]('html,\x20body').classList[v1[332 - 328]](v1[347 - 328]),
                    document[v1[336 - 328]]('.answer-popup__div').innerHTML = anon3_arg1[v1[333 - 328]].content,
                    document[v1[336 - 328]](v1[356 - 328]).classList[v1[346 - 328]](v1[329 - 328]));
                })['catch'](function(anon4_arg1) {
                    anon4_arg1[v1[345 - 328]] && ((anon4_arg1.response[v1[348 - 328]] == 400 || anon4_arg1[v1[345 - 328]][v1[348 - 328]] == 422 || anon4_arg1[v1[345 - 328]][v1[348 - 328]] == 429) && (v9[v1[349 - 328]][v1[352 - 328]] = ![],
                    v9.flags[v1[353 - 328]] = !![],
                    v9[v1[349 - 328]][v1[344 - 328]] = !![],
                    setTimeout(function() {
                        v9[v1[349 - 328]][v1[344 - 328]] = ![];
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
