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

class Code {
    constructor() {
        this.str = '';
        this.int = -1;
    }

    which(selector) {
        $(selector).keydown(function(event) {
            var input = $(this);
            if (event.which == 38) {

                if (app.code.int == -1) {
                    app.code.str = input.val();
                }

                return input.val(app.code.get(++app.code.int));
            } else if (event.which == 40) {
                return input.val(app.code.get(--app.code.int));
            } else if (event.which == 13) {
                
                app.code.set(input.val());
               
                if (input.val().toLowerCase() == 'clear') {
                    $('.output').html('');
                    input.val('');
                } else {
                    app.code.request(input.val());
                }
            }
        });
    }

    handle(data, command) {
        var prefix = '<font class="prefix">' + this.bashrc + '</font>';

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
            app.code.int = now = -1;
            return app.code.str;
        }

        if (now >= history.length) {
            app.code.int = now = history.length - 1;
        }

        return history[history.length - now - 1];
    }

    request(command) {
        $.post('console.php', {
            command: command
        }, function(data) {
            app.code.handle(data, command);
        });
    }

    prefix(prefix) {
        this.bashrc = prefix.split('@').join('<font class="at">@</font>') + ' # ';
        $('.prefix').html(this.bashrc);
        return app.code;
    }
}

var app = $.extend({}, jQuery, {
    code: new Code()
});