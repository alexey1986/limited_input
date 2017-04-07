/*
 Limited length component allow to define textarea element and count element which will show the number of characters in the textarea.
 You could also define a character limit (the number of characters which we can input in textfield). If not, textarea will show without
 character counter and without "WARNING" state.
*/

(function () {
    var STATE_EMPTY = 'STATE_EMPTY';
    var STATE_SAFE = 'STATE_SAFE';
    var STATE_WARN = 'STATE_WARN';
    var originalText;

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
                        //var textLength = this.attr('useHtmlEntity') ? GLOBOFORCE.escapeHtmlEntities(newVal).length : newVal.length;
                        var state;
                        //if (!textLength) {
                        if (!newVal.length) {
                            state = STATE_EMPTY;
                        } else if (this.attr('limit') && newVal.length > this.attr('limit')) {
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
                        return attrs.warningCountClass;
                    }
                },
                useHtmlEntity: {
                    value: function () {
                        return attrs.useHtmlEntity
                    }
                },
                // todo: temp
                options: {
                    value: function() {
                        return attrs.options
                    }
                }
            },

            countLength: function () {
                var textAreaValue = this.attr("message").length;
                var maxLength = this.attr("limit");
                //var textLength = useHtmlEntity ? GLOBOFORCE.escapeHtmlEntities(textAreaValue).length : textAreaValue.length;
                //return maxLength - textLength;
                return maxLength - textAreaValue;
            },

            textAreaFocusInHandler: function () {
                console.log(this.attr('options'));
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
                    //this.attr('message', value);
                    this.dispatch('stateChanged', [element]);
                }
                if (this.attr('state') !== STATE_EMPTY && value) {
                    $(element).trigger('textInputed');
                }
            },

            resizeInput: function () {
                /*
                var _debouncedObserver = GLOBOFORCE.debounce(function () {
                */
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
                /*
                }, 50);
                $(window).on('resize', _debouncedObserver);
                */
            },

            getText: function () {
                return this.attr('message');
            },

            setText: function (text) {
                this.attr("isEditing", true);
                this.attr('message', text);
            },

            showOriginalText: function () {
                this.setText(originalText);
            },

            setOriginalText: function (newOriginalText) {
                originalText = newOriginalText;
            },

            getState: function () {
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
            init: function() {
                originalText = this.viewModel.attr('message');
            },
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

                console.log(state)
            },
            '{window} resize': function () {
                // To prevent resizing of the input just add fixed width via css
                this.viewModel.resizeInput();
            }
        }
    });
}());