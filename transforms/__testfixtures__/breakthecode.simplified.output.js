'use strict';
// Version with the function for rotating the array already (manually) executed
var v1 = ["680575VSjskW", "hidden", "#app", "input", "add", "data", "application/json", "1138771DnkNzm", "querySelector", "2XDTygo", "1079yilIzd", "368168VvQIgG", "14081gJOvPZ", "getAttribute", "208866QssNBc", "/puzzle-new", "cooldown", "response", "remove", "modal-open", "status", "flags", "1512231DKtOVj", "then", "loading", "error", "disableSubmit", "3171IGRaWO", ".answer-popup-success", "127LGCEKU"]
var v2 = new Vue({
    'el': v1[2],
    'data': {
        'input': '',
        'flags': {
            'cooldown': false,
            'loading': false,
            'error': false
        }
    },
    'computed': {
        'disableSubmit': function disableSubmit() {
            return this.input == '' || this.flags[v1[24]] || this[v1[21]][v1[16]];
        }
    },
    'methods': {
        'submit': function submit() {
            var v3 = this;
            !this[v1[26]] && this[v1[3]] !== '' && (this[v1[21]][v1[25]] = false,
            this[v1[21]].loading = true,
            setTimeout(function() {
                axios.post(v1[15], {
                    'answer': v3[v1[3]]
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document[v1[8]]('meta[name=\x22csrf-token\x22]')[v1[13]]('content'),
                        'Content-Type': v1[6]
                    }
                })[v1[23]](function(anon2_arg1) {
                    anon2_arg1.data && (v3.flags[v1[24]] = false,
                    document[v1[8]]('html,\x20body').classList[v1[4]](v1[19]),
                    document[v1[8]]('.answer-popup__div').innerHTML = anon2_arg1[v1[5]].content,
                    document[v1[8]](v1[28]).classList[v1[18]](v1[1]));
                })['catch'](function(anon3_arg1) {
                    anon3_arg1[v1[17]] && ((anon3_arg1.response[v1[20]] == 400 || anon3_arg1[v1[17]][v1[20]] == 422 || anon3_arg1[v1[17]][v1[20]] == 429) && (v3[v1[21]][v1[24]] = false,
                    v3.flags[v1[25]] = true,
                    v3[v1[21]][v1[16]] = true,
                    setTimeout(function() {
                        v3[v1[21]][v1[16]] = false;
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
