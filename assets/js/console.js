/**
 *   ___       _
 *  / _ \  ___| |_ ___  _ __  _   _
 * | | | |/ __| __/ _ \| '_ \| | | |
 * | |_| | (__| || (_) | |_) | |_| |
 *  \___/ \___|\__\___/| .__/ \__, |
 *                     |_|    |___/
 * @author  : Supian M <supianidz@gmail.com>
 * @link    : www.octopy.io
 * @license : MIT
 */

class OctopyConsole {
    constructor() {
        this.str = '';
        this.int = -1;
    }

    run(config) {
        $('.prefix').html(
            this.prefix = config.prefix.split('@').join('<font class="at">@</font>') + ' # '
        );

        this.selector = config.selector;
        this.controller = config.controller;

        $.getJSON(config.autocomplete, {}, function(json) {
            Octopy.console.autocomplete(json);
        });

        $(Octopy.console.selector).keydown(function(event) {
            var input = $(this);
            if (event.which == 38) {

                if (Octopy.console.int == -1) {
                    Octopy.console.str = input.val();
                }

                return input.val(Octopy.console.get(++Octopy.console.int));
            } else if (event.which == 40) {
                return input.val(Octopy.console.get(--Octopy.console.int));
            } else if (event.which == 13) {

                Octopy.console.set(input.val());

                if (input.val().toLowerCase() == 'clear') {
                    $('.output').html('');
                    input.val('');
                } else {
                    Octopy.console.request(input.val());
                }
            }
        });
    }

    handle(data, command) {
        var prefix = '<font class="prefix">' + this.prefix + '</font>';

        $('.output').append(
            prefix + command + '<pre>' + data + '</pre>'
        );

        $('input').val('').focus();
    }

    set(command) {
        var storage = localStorage['history'];
        var history = storage ? JSON.parse(storage) : [];

        if (history.length > 100) {
            history.shift();
        }

        history.push(command);

        localStorage['history'] = JSON.stringify(history);
    }

    get(now) {
        var storage = localStorage['history'];
        var history = storage ? JSON.parse(storage) : [];

        if (now < 0) {
            Octopy.console.int = now = -1;
            return Octopy.console.str;
        }

        if (now >= history.length) {
            Octopy.console.int = now = history.length - 1;
        }

        return history[history.length - now - 1];
    }

    request(command) {
        $.post(Octopy.console.controller, {
            command: command
        }, function(data) {
            Octopy.console.handle(data, command);
        });
    }

    autocomplete(suggest) {
        var input = $(Octopy.console.selector);

        input.wrap('<span class="autocomplete" style="position: relative;"></span>');

        var html =
            '<span class="overflow" style="position: absolute; z-index: -10;">' +
            '<span class="repeat" style="opacity: 0;"></span>' +
            '<span class="guess"></span></span>';
        $('.autocomplete').prepend(html);

        var guess = $('.guess');
        var repeat = $('.repeat');
        var search = function(command) {
            var array = [];
            for (var key in suggest) {
                if (!suggest.hasOwnProperty(key))
                    continue;
                var pattern = new RegExp(key);
                if (command.match(pattern)) {
                    array = suggest[key];
                }
            }

            var text = command.split(' ').pop();

            var found = '';
            if (text != '') {
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    if (value.length > text.length &&
                        value.substring(0, text.length) == text) {
                        found = value.substring(text.length, value.length);
                        break;
                    }
                }
            }

            guess.text(found);
        };

        var update = function() {
            var command = input.val();
            repeat.text(command);
            search(command);
        };

        input.keyup(update);
        input.change(update);
        input.keydown(update);
        input.keypress(update);

        input.keydown(function(event) {
            var code = (event.keyCode ? event.keyCode : event.which);
            if (code == 9) {
                input.val(input.val() + guess.text());
                return false;
            }
        });

        return input;
    }
}

var Octopy = $.extend({}, jQuery, {
    console: new OctopyConsole()
});