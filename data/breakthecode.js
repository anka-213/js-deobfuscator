'use strict';
var _0x2889 = ['2XDTygo', '1079yilIzd', '368168VvQIgG', '14081gJOvPZ', 'getAttribute', '208866QssNBc', '/puzzle-new', 'cooldown', 'response', 'remove', 'modal-open', 'status', 'flags', '1512231DKtOVj', 'then', 'loading', 'error', 'disableSubmit', '3171IGRaWO', '.answer-popup-success', '127LGCEKU', '680575VSjskW', 'hidden', '#app', 'input', 'add', 'data', 'application/json', '1138771DnkNzm', 'querySelector'];
var _0x5da1ab = _0x2d95;
function _0x2d95(_0xae0ee9, _0x35d517) {
    _0xae0ee9 = _0xae0ee9 - 0x148;
    var _0x288923 = _0x2889[_0xae0ee9];
    return _0x288923;
}
(function(_0x291c92, _0x1a9ab1) {
    var _0x11122d = _0x2d95;
    while (!![]) {
        try {
            var _0x19959c = -parseInt(_0x11122d(0x15e)) + parseInt(_0x11122d(0x14f)) + parseInt(_0x11122d(0x148)) + -parseInt(_0x11122d(0x165)) * parseInt(_0x11122d(0x154)) + -parseInt(_0x11122d(0x156)) + -parseInt(_0x11122d(0x151)) * parseInt(_0x11122d(0x153)) + -parseInt(_0x11122d(0x152)) * -parseInt(_0x11122d(0x163));
            if (_0x19959c === _0x1a9ab1)
                break;
            else
                _0x291c92['push'](_0x291c92['shift']());
        } catch (_0x9a3e53) {
            _0x291c92['push'](_0x291c92['shift']());
        }
    }
}(_0x2889, 0xf2f3f));
var app = new Vue({
    'el': _0x5da1ab(0x14a),
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
            var _0x468bce = _0x5da1ab;
            return this['input'] == '' || this['flags'][_0x468bce(0x160)] || this[_0x468bce(0x15d)][_0x468bce(0x158)];
        }
    },
    'methods': {
        'submit': function submit() {
            var _0x3176b0 = _0x5da1ab
              , _0x19e8bc = this;
            !this[_0x3176b0(0x162)] && this[_0x3176b0(0x14b)] !== '' && (this[_0x3176b0(0x15d)][_0x3176b0(0x161)] = ![],
            this[_0x3176b0(0x15d)]['loading'] = !![],
            setTimeout(function() {
                var _0x22faee = _0x3176b0;
                axios['post'](_0x22faee(0x157), {
                    'answer': _0x19e8bc[_0x22faee(0x14b)]
                }, {
                    'headers': {
                        'X-CSRF-TOKEN': document[_0x22faee(0x150)]('meta[name=\x22csrf-token\x22]')[_0x22faee(0x155)]('content'),
                        'Content-Type': _0x22faee(0x14e)
                    }
                })[_0x22faee(0x15f)](function(_0x2f653a) {
                    var _0xc793eb = _0x22faee;
                    _0x2f653a['data'] && (_0x19e8bc['flags'][_0xc793eb(0x160)] = ![],
                    document[_0xc793eb(0x150)]('html,\x20body')['classList'][_0xc793eb(0x14c)](_0xc793eb(0x15b)),
                    document[_0xc793eb(0x150)]('.answer-popup__div')['innerHTML'] = _0x2f653a[_0xc793eb(0x14d)]['content'],
                    document[_0xc793eb(0x150)](_0xc793eb(0x164))['classList'][_0xc793eb(0x15a)](_0xc793eb(0x149)));
                })['catch'](function(_0x3b2622) {
                    var _0x10d1da = _0x22faee;
                    _0x3b2622[_0x10d1da(0x159)] && ((_0x3b2622['response'][_0x10d1da(0x15c)] == 0x190 || _0x3b2622[_0x10d1da(0x159)][_0x10d1da(0x15c)] == 0x1a6 || _0x3b2622[_0x10d1da(0x159)][_0x10d1da(0x15c)] == 0x1ad) && (_0x19e8bc[_0x10d1da(0x15d)][_0x10d1da(0x160)] = ![],
                    _0x19e8bc['flags'][_0x10d1da(0x161)] = !![],
                    _0x19e8bc[_0x10d1da(0x15d)][_0x10d1da(0x158)] = !![],
                    setTimeout(function() {
                        var _0x53d4de = _0x10d1da;
                        _0x19e8bc[_0x53d4de(0x15d)][_0x53d4de(0x158)] = ![];
                    }, 0x1388)));
                });
            }, 0x5dc));
        }
    }
});
