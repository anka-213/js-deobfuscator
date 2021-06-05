'use strict';
var v1 = ['2XDTygo', '1079yilIzd', '368168VvQIgG', '14081gJOvPZ', 'getAttribute', '208866QssNBc', '/puzzle-new', 'cooldown', 'response', 'remove', 'modal-open', 'status', 'flags', '1512231DKtOVj', 'then', 'loading', 'error', 'disableSubmit', '3171IGRaWO', '.answer-popup-success', '127LGCEKU', '680575VSjskW', 'hidden', '#app', 'input', 'add', 'data', 'application/json', '1138771DnkNzm', 'querySelector'];
function f1(f1_arg1, f1_arg2) {
    return v1[f1_arg1 - 328];
}
{
    while (!![]) {
        try {
            var v5 = -parseInt(v1[22]) + parseInt(v1[7]) + parseInt(v1[0]) + -parseInt(v1[29]) * parseInt(v1[12]) + -parseInt(v1[14]) + -parseInt(v1[9]) * parseInt(v1[11]) + -parseInt(v1[10]) * -parseInt(v1[27]);
            if (v5 === 995135)
                break;
            else
                v1.push(v1.shift());
        } catch (_0x9a3e53) {
            v1.push(v1.shift());
        }
    }
}
var v6 = new Vue({
    'el': v1[2],
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
            return this.input == '' || this.flags[v1[24]] || this[v1[21]][v1[16]];
        }
    },
    'methods': {
        'submit': function submit() {
            var v9 = this;
            !this[v1[26]] && this[v1[3]] !== '' && (this[v1[21]][v1[25]] = ![],
            this[v1[21]].loading = !![],
            setTimeout(function() {
                axios.post(v1[15], {
                    'answer': v9[v1[3]]
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document[v1[8]]('meta[name=\x22csrf-token\x22]')[v1[13]]('content'),
                        'Content-Type': v1[6]
                    }
                })[v1[23]](function(anon3_arg1) {
                    anon3_arg1.data && (v9.flags[v1[24]] = ![],
                    document[v1[8]]('html,\x20body').classList[v1[4]](v1[19]),
                    document[v1[8]]('.answer-popup__div').innerHTML = anon3_arg1[v1[5]].content,
                    document[v1[8]](v1[28]).classList[v1[18]](v1[1]));
                })['catch'](function(anon4_arg1) {
                    anon4_arg1[v1[17]] && ((anon4_arg1.response[v1[20]] == 400 || anon4_arg1[v1[17]][v1[20]] == 422 || anon4_arg1[v1[17]][v1[20]] == 429) && (v9[v1[21]][v1[24]] = ![],
                    v9.flags[v1[25]] = !![],
                    v9[v1[21]][v1[16]] = !![],
                    setTimeout(function() {
                        v9[v1[21]][v1[16]] = ![];
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
