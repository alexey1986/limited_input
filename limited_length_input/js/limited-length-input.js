/*
 Limited length component allow to define textarea element and count element which will show the number of characters in the textarea.
 You could also define a character limit (the number of characters which we can input in textfield). If not, textarea will show without
 character counter and without "WARNING" state.
*/
// set default classes

(function () {
    var STATE_EMPTY = 'STATE_EMPTY';
    var STATE_SAFE = 'STATE_SAFE';
    var STATE_WARN = 'STATE_WARN';
    var resizeTimer;

    var limitedLengthInputViewModel = function(attrs, parentScope, element) {
        var vm = can.Map.extend({
            define: {
                message: {
                    get: function (val) {
                        return val;
                    },
                    set: function (newVal) {
                        var textLength = this.attr('useHtmlEntity') ? GLOBOFORCE.escapeHtmlEntities(newVal).length : newVal.length;
                        var state;
                        if (!textLength) {
                            state = STATE_EMPTY;
                        } else if (this.attr('limit') && newVal.length > this.attr('limit')) {
                            state = STATE_WARN;
                        } else {
                            state = STATE_SAFE;
                        }
                        this.attr('state', state);
                        return newVal
                    }
                },
                state: {
                    set: function (newValue) {
                        return newValue;
                    },
                    value: STATE_EMPTY
                },
                isEditing: {
                    get: function () {
                        return this.attr('message') ? true : false;
                    },
                    set: function (newValue) {
                        return newValue;
                    }
                }
            },

            countLength: function () {
                var textAreaValue = this.attr("message");
                var maxLength = this.attr("limit");
                var textLength = this.attr('useHtmlEntity') ? GLOBOFORCE.escapeHtmlEntities(textAreaValue).length : textAreaValue.length;
                return maxLength - textLength;
            },

            textAreaFocusInHandler: function () {
                $(element).trigger('textAreaFocusIn');
                if (this.attr('state') === STATE_EMPTY) {
                    return this.attr("isEditing", true);
                }
            },

            textAreaFocusOutHandler: function () {
                $(element).trigger('textAreaFocusOut');
                if (this.attr('state') === STATE_EMPTY) {
                    return this.attr("isEditing", false);
                }
            },

            textareaHandler: function (element, value) {
                if (value !== this.attr('message')) {
                    this.attr('message', value.trim());
                    this.dispatch('stateChanged', [element]);
                }
                if (this.attr('state') !== STATE_EMPTY && value) {
                    $(element).trigger('textInputed');
                }
                this.resizeInput();
            },

            resizeInput: function () {
                // To prevent resizing of the input just add fixed width via css
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    console.log('resize');

                    var input = $(element).find('textarea');
                    var oldHeight = input.outerHeight();
                    input.height('1px');
                    input.height(input[0].scrollHeight);
                    var newHeight = input.outerHeight();

                    if (oldHeight != newHeight) {
                        $(element).trigger('heightChanged');
                    }
                }, 250);
            },

            getText: function () {
                return this.attr('message');
            },

            setText: function (text) {
                this.attr("isEditing", true);
                this.attr('message', text);
            },

            getState: function () {
                return this.attr('state');
            },

            deactivate: function () {
                this.attr("isEditing", false);
                $(element).trigger('deactivateTextArea');
                return this.attr("disabled", true);
            },

            activate: function () {
                if (this.attr('state') !== STATE_EMPTY) {
                    this.attr("isEditing", true);
                }
                $(element).trigger('activateTextArea');
                return this.attr("disabled", false);
            },

            clear: function () {
                this.attr('message', '');
                this.attr("isEditing", false);
                this.resizeInput();
                $(element).trigger('clearTextArea');
            }
        });

        can.extend(vm.prototype, can.event);

        return vm;
    };

    can.Component.extend({
        tag: "limited-length-input",
        template: can.view("./templates/limited-length-input.stache"),
        viewModel: limitedLengthInputViewModel,
        leakScope: false,
        events: {
            inserted: function () {
                this.viewModel.resizeInput();
            },
            '{scope} stateChanged': function () {
                var state = this.viewModel.attr('state');

                switch (state) {
                    case STATE_EMPTY:
                        this.element.trigger('textDeleted');
                        break;
                    case STATE_SAFE:
                        this.element.trigger('lengthLimitOkay');
                        break;
                    case STATE_WARN:
                        this.element.trigger('lengthLimitExceeded');
                        break;
                    default:
                        break;
                }
            },
            '{window} resize': function () {
                this.viewModel.resizeInput();
            }
        }
    });
}());