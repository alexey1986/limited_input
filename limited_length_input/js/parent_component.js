(function () {
    can.Component.extend({
        tag: "parent-component",
        template: can.view("./templates/parent-component.stache"),
        viewModel: {
            getText: function() {
                var newVal = can.viewModel('limited-length-input').getText();
                this.attr('newText', newVal);
            },
            getState: function() {
                var state = can.viewModel('limited-length-input').getState();
                console.log(state);
            },
            setText: function() {
                can.viewModel('limited-length-input').setText(this.attr('newText'));
            },
            showOriginalText: function () {
                can.viewModel('limited-length-input').showOriginalText();
            },
            deactivate: function() {
                can.viewModel('limited-length-input').deactivate();
            },
            activate: function() {
                can.viewModel('limited-length-input').activate();
            },
            clear: function() {
                can.viewModel('limited-length-input').clear();
            }
        },
        events: {
            'limited-length-input textInputed': function() {
                console.log('textInputed');
            },
            'limited-length-input textDeleted': function (ele, event, val) {
                //console.log(ele, event, val);
                console.log('textDeleted')
            },
            'limited-length-input heightChanged': function () {
                console.log('heightChanged')
            },
            'limited-length-input deactivateTextArea': function () {
                console.log('deactivateTextArea')
            },
            'limited-length-input activateTextArea': function () {
                console.log('activateTextArea')
            },
            'limited-length-input clearTextArea': function () {
                console.log('clearTextArea')
            },
            'limited-length-input textAreaFocusIn': function () {
                console.log('textAreaFocusIn')
            },
            'limited-length-input textAreaFocusOut': function () {
                console.log('textAreaFocusOut')
            }
        }
    });
}());
