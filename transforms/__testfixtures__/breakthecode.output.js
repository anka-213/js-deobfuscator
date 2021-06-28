'use strict';
var v1 = [
    "680575VSjskW",
    "hidden",
    "#app",
    "input",
    "add",
    "data",
    "application/json",
    "1138771DnkNzm",
    "querySelector",
    "2XDTygo",
    "1079yilIzd",
    "368168VvQIgG",
    "14081gJOvPZ",
    "getAttribute",
    "208866QssNBc",
    "/puzzle-new",
    "cooldown",
    "response",
    "remove",
    "modal-open",
    "status",
    "flags",
    "1512231DKtOVj",
    "then",
    "loading",
    "error",
    "disableSubmit",
    "3171IGRaWO",
    ".answer-popup-success",
    "127LGCEKU"
];
function f1(f1_arg1, f1_arg2) {
    return v1[f1_arg1 - 328];
}
{
    while (true) {
        try {
            var v5 = -parseInt("1512231DKtOVj") + parseInt("1138771DnkNzm") + parseInt("680575VSjskW") + -parseInt("127LGCEKU") * parseInt("14081gJOvPZ") + -parseInt("208866QssNBc") + -parseInt("2XDTygo") * parseInt("368168VvQIgG") + -parseInt("1079yilIzd") * -parseInt("3171IGRaWO");
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
    'el': "#app",
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
            return this.input == '' || this.flags.loading || this.flags.cooldown;
        }
    },
    'methods': {
        'submit': function submit() {
            var v9 = this;
            !this.disableSubmit && this.input !== '' && (this.flags.error = false,
            this.flags.loading = true,
            setTimeout(function() {
                axios.post("/puzzle-new", {
                    'answer': v9.input
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document.querySelector('meta[name=\x22csrf-token\x22]').getAttribute('content'),
                        'Content-Type': "application/json"
                    }
                }).then(function(anon3_arg1) {
                    anon3_arg1.data && (v9.flags.loading = false,
                    document.querySelector('html,\x20body').classList.add("modal-open"),
                    document.querySelector('.answer-popup__div').innerHTML = anon3_arg1.data.content,
                    document.querySelector(".answer-popup-success").classList.remove("hidden"));
                })['catch'](function(anon4_arg1) {
                    anon4_arg1.response && ((anon4_arg1.response.status == 400 || anon4_arg1.response.status == 422 || anon4_arg1.response.status == 429) && (v9.flags.loading = false,
                    v9.flags.error = true,
                    v9.flags.cooldown = true,
                    setTimeout(function() {
                        v9.flags.cooldown = false;
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
