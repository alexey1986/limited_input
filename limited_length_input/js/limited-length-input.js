(function () {
    var STATE_EMPTY = 'STATE_EMPTY';
    var STATE_SAFE = 'STATE_SAFE';
    var STATE_WARN = 'STATE_WARN';

    var limitedLengthInputViewModel = function (attrs, parentScope, element) {
        var vm = can.Map.extend({

            define: {
                limit: {
                    value: function () {
                        return attrs.limit;
                    }
                },
                message: {
                    set: function (newVal) {
                        var state;
                        if (!newVal.length) {
                            state = STATE_EMPTY;
                        } else if (newVal.length > this.attr('limit')) {
                            state = STATE_WARN;
                        } else {
                            state = STATE_SAFE;
                        }
                        this.attr('state', state);
                        return newVal
                    },
                    value: function () {
                        return attrs.transmittedMessage ? attrs.transmittedMessage : '';
                    }
                },
                state: {
                    set: function (newValue) {
                        return newValue;
                    },
                    value: STATE_EMPTY
                },
                isEditing: {
                    set: function (newValue) {
                        return newValue;
                    },
                    value: function () {
                        return attrs.transmittedMessage ? true : false;
                    }
                },
                disabled: {
                    value: function () {
                        return attrs.disabled ? true : false;
                    }
                },
                emptyClass: {
                    value: function () {
                        return attrs.emptyClass;
                    }
                },
                safeClass: {
                    value: function () {
                        return attrs.safeClass;
                    }
                },
                warningClass: {
                    value: function () {
                        return attrs.warningClass;
                    }
                },
                emptyCountClass: {
                    value: function () {
                        return attrs.emptyCountClass;
                    }
                },
                safeCountClass: {
                    value: function () {
                        return attrs.emptyCountClass;
                    }
                },
                warningCountClass: {
                    value: function () {
                        return attrs.emptyCountClass;
                    }
                }
            },

            countLength: function () {
                return this.attr("limit") - this.attr("message").length;
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
                    //this.attr('message', value.trim());
                    this.attr('message', value);
                    this.dispatch('stateChanged', [element]);
                }
                if (this.attr('state') !== STATE_EMPTY && value) {
                    $(element).trigger('textInputed');
                }
            },

            resizeInput: function () {
                setTimeout(function () {
                    var input = $(element).find('textarea');
                    var oldHeight = input.outerHeight();
                    input.height('1px');
                    input.height(input[0].scrollHeight);

                    var newHeight = input.outerHeight();

                    if (oldHeight != newHeight) {
                        $(element).trigger('heightChanged');
                    }
                }, 0);
            },

            getText: function () {
                console.log(this.attr('message'));
                return this.attr('message');
            },

            setText: function (text) {
                this.attr("isEditing", true);
                this.attr('message', text);
            },

            getState: function () {
                console.log(this.attr('state'));
                return this.attr('state');
            },

            deactivate: function () {
                $(element).trigger('deactivateTextArea');
                this.attr("isEditing", false);
                return this.attr("disabled", true);
            },

            activate: function () {
                $(element).trigger('activateTextArea');
                if (this.attr('state') !== STATE_EMPTY) {
                    this.attr("isEditing", true);
                }
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
            '{scope} stateChanged': function (target, ev, el) {
                this.viewModel.resizeInput();

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
                // To prevent resizing of the input just add fixed width via css
                this.viewModel.resizeInput();
            }
        }

    });

}());