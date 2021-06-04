'use strict';
var v1 = ['2XDTygo', '1079yilIzd', '368168VvQIgG', '14081gJOvPZ', 'getAttribute', '208866QssNBc', '/puzzle-new', 'cooldown', 'response', 'remove', 'modal-open', 'status', 'flags', '1512231DKtOVj', 'then', 'loading', 'error', 'disableSubmit', '3171IGRaWO', '.answer-popup-success', '127LGCEKU', '680575VSjskW', 'hidden', '#app', 'input', 'add', 'data', 'application/json', '1138771DnkNzm', 'querySelector'];
function f1(f1_arg1, f1_arg2) {
    f1_arg1 = f1_arg1 - 328;
    return v1[f1_arg1];
}
(function(anon1_arg1, anon1_arg2) {
    while (!![]) {
        try {
            var v5 = -parseInt(f1(350)) + parseInt(f1(335)) + parseInt(f1(328)) + -parseInt(f1(357)) * parseInt(f1(340)) + -parseInt(f1(342)) + -parseInt(f1(337)) * parseInt(f1(339)) + -parseInt(f1(338)) * -parseInt(f1(355));
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
    'el': f1(330),
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
            return this.input == '' || this.flags[f1(352)] || this[f1(349)][f1(344)];
        }
    },
    'methods': {
        'submit': function submit() {
            var v9 = this;
            !this[f1(354)] && this[f1(331)] !== '' && (this[f1(349)][f1(353)] = ![],
            this[f1(349)].loading = !![],
            setTimeout(function() {
                axios.post(f1(343), {
                    'answer': v9[f1(331)]
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document[f1(336)]('meta[name=\x22csrf-token\x22]')[f1(341)]('content'),
                        'Content-Type': f1(334)
                    }
                })[f1(351)](function(anon3_arg1) {
                    anon3_arg1.data && (v9.flags[f1(352)] = ![],
                    document[f1(336)]('html,\x20body').classList[f1(332)](f1(347)),
                    document[f1(336)]('.answer-popup__div').innerHTML = anon3_arg1[f1(333)].content,
                    document[f1(336)](f1(356)).classList[f1(346)](f1(329)));
                })['catch'](function(anon4_arg1) {
                    anon4_arg1[f1(345)] && ((anon4_arg1.response[f1(348)] == 400 || anon4_arg1[f1(345)][f1(348)] == 422 || anon4_arg1[f1(345)][f1(348)] == 429) && (v9[f1(349)][f1(352)] = ![],
                    v9.flags[f1(353)] = !![],
                    v9[f1(349)][f1(344)] = !![],
                    setTimeout(function() {
                        v9[f1(349)][f1(344)] = ![];
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
