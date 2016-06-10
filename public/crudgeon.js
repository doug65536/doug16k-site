(function($) {
    "use strict";
    
    var componentTable = [],
        api,
        componentLookup = {};
    
    api = {
        addComponents: function() {
            var args = Array.prototype.slice.call(arguments);
            console.assert(args.every(function(arg) {
                return typeof a === 'object';
            }));
            Array.prototype.push.apply(componentTable, args);
            args.forEach(function(arg) {
                var victim = this[arg.name];
                if (victim)
                    victim.supercededBy = arg;
                arg.supercedes = victim;
                this[arg.name] = arg;
            }, componentLookup);
        }
    }
    
    addComponents({
        name: 'input',

        tag: 'input',

        property: {
            // Core properties
            value: String,
            checked: Boolean,
            disabled: Boolean,
            readOnly: Boolean,

            // Appearance
            placeholder: String,

            // Validation
            min: [Number, Date],
            max: [Number, Date],
            pattern: String,
            minLength: Number,
            maxLength: Number,

            // For image buttons
            src: String
        }
    }, {
        name: 'button',
        base: 'input',
        
        setProperties: {
            type: 'button'
        }
    }, {
        name: 'field',
        
        composite: true,
        
        property: {
            labelText: String,
            value: String
        },
        
        container: {
            def: 'div',
        
            children: [
                {
                    def: 'label',
                    bind: 'labelText'
                }, {
                    def: 'input',
                    bind: 'value'
                }
            ]
        },
    });
    
    var example = [
        {
            def: 'input'
        }
    ];
    
    function makeReturnThisProperty(name) {
        return function() {
            return this[name];
        };
    }
    
    function makeSetThisProperty(name) {
        return function(value) {
            this[name] = value;
        };
    }
}($));