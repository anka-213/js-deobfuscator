'use strict';
var v2 = new Vue({
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
            var v3 = this;
            !this.disableSubmit && this.input !== '' && (this.flags.error = false,
            this.flags.loading = true,
            setTimeout(function() {
                axios.post("/puzzle-new", {
                    'answer': v3.input
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document.querySelector('meta[name=\x22csrf-token\x22]').getAttribute('content'),
                        'Content-Type': "application/json"
                    }
                }).then(function(anon2_arg1) {
                    anon2_arg1.data && (v3.flags.loading = false,
                    document.querySelector('html,\x20body').classList.add("modal-open"),
                    document.querySelector('.answer-popup__div').innerHTML = anon2_arg1.data.content,
                    document.querySelector(".answer-popup-success").classList.remove("hidden"));
                })['catch'](function(anon3_arg1) {
                    anon3_arg1.response && ((anon3_arg1.response.status == 400 || anon3_arg1.response.status == 422 || anon3_arg1.response.status == 429) && (v3.flags.loading = false,
                    v3.flags.error = true,
                    v3.flags.cooldown = true,
                    setTimeout(function() {
                        v3.flags.cooldown = false;
                    }, 5000)));
                });
            }, 1500));
        }
    }
});
