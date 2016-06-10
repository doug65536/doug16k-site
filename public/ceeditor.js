;(function($) {
    "use strict";
    
	var ns = 'customEditor',
        template = {},
        backup,
        defaultOptions;
    
    return initPlugin();
    
    function initPlugin() {
        defaultOptions = {
        };
        
        template.root = $('<div/>', {
            'class': 'cee-editor-container'
        });
        
        template.commandBar = $('<div/>', {
            'class': 'cee-editor-command-bar',
            appendTo: template.root
        });
        template.commandBarGroup = $('<div/>', {
            'class': 'cee-editor-command-bar-group',
        });
        template.commandBarButton = $('<button/>', {
            'data-cee-editor-command': ''
        });
        template.commandBarSelect = $('<select/>', {
            'data-cee-editor-command': ''
        });
        template.commandBarOption = $('<option/>', {
            'value': ''
        });
        template.editorContent = $('<div/>', {
            'class': 'cee-editor-content',
            'contenteditable': ''
        });
        
        createControls(createCommandGroup('clipboard'), [
            { command: 'cut' },
            { command: 'copy' },
            { command: 'paste' },
        ]);
        
        createControls(createCommandGroup('delete'), [
            { command: 'delete', icon: 'trash' }
        ]);
        
        createControls(createCommandGroup('undo'), [
            { command: 'undo' },
            { command: 'redo', icon: 'undo fa-flip-horizontal' }
        ]);
        
        createControls(createCommandGroup('font'), [
            { command: 'fontName', select: [
                { text: 'Times New Roman' },
                { text: 'Arial' }
            ]},
            { command: 'fontSize', select: [
                { text: '1' }, { text: '2' },
                { text: '3' }, { text: '4' },
                { text: '5' }, { text: '6' },
                { text: '7' }
            ]}
        ]);
    
        createControls(createCommandGroup('color'), [
            { command: 'backColor', icon: 'paint-brush', ui: 'color' },
            { command: 'foreColor', icon: 'pencil', ui: 'color' },
        ]);
            
        createControls(createCommandGroup('text-decoration'), [
            { command: 'bold' },
            { command: 'italic' },
            { command: 'underline' },
            { command: 'strikeThrough', icon: 'strikethrough' },
            { command: 'removeFormat', icon: 'eraser' },
        ]);
        
        createControls(createCommandGroup('vertical-position'), [
            { command: 'subscript' },
            { command: 'superscript' },
        ]);
        
        createControls(createCommandGroup('link'), [
            { command: 'link' },
            { command: 'unlink' },
        ]);
        
        createControls(createCommandGroup('justify'), [
            { command: 'justifyLeft', icon: 'align-left' },
            { command: 'justifyRight', icon: 'align-right' },
            { command: 'justifyCenter', icon: 'align-center' },
            { command: 'justifyFull', icon: 'align-justify' },
        ]);
            
        createControls(createCommandGroup('paragraph'), [
            { command: 'indent' },
            { command: 'outdent' },
            { command: 'formatBlock', icon: 'paragraph' },
        ]);
    
        createControls(createCommandGroup('selection'), [
            { command: 'selectAll' },
        ]);
    
        createControls(createCommandGroup('create'), [
            { command: 'insertHorizontalRule' },
            { command: 'insertImage', icon: 'picture-o' },
            { command: 'insertOrderedList', icon: 'list-ol' },
            { command: 'insertUnorderedList', icon: 'list-ul' },
        ]);
        
        backup = $.fn[ns];
        $.fn[ns] = customEditorFn;
    }
    
    function customEditorFn() {
        var args = Array.prototype.slice.call(arguments),
            first = args.shift(),
            firstType = typeof first,
            method = firstType === 'string' && first,
            optionsArg = firstType === 'object' && first,
            result;
        this.each(function() {
            var elem = $(this),
                dataName = 'state.' + ns,
                instance = elem.data(dataName);
            if (!instance) {
                instance = editorInstance(elem);
                elem.data(dataName, instance);
                instance.init();
            }
            
            if (method && instance[method]) {
                result = instance[method](args);
			} else if (method) {
				throw new Error('invalid method call: ' + method);
            } else if (optionsArg) {
                result = instance.applyOptions(optionsArg);
            }
            
            if (method === 'destroy')
                elem.data(dataName, undefined);
            
            if (result !== undefined)
                return false;
        });
        return result !== undefined ? result : this;
    }
    
    function editorInstance(placeholder) {
        var options = $.extend({}, defaultOptions),
            container = template.root.clone(),
            content = template.editorContent.clone();
        
        // Initialize content from placeholder
        content.html(placeholder.html());
        container.append(content);
        
        return {
            applyOptions: function(addedOptions) {
                $.extend(options, addedOptions);
            },
            
            init: init,
            
            destroy: function() {
                container.remove();
                placeholder.removeClass('cee-hidden');
            }
        };
        
        function init() {
            container.insertAfter(placeholder.addClass('cee-hidden'));
            
            $('[data-cee-editor-command]', container).addClass(function() {
                var control = $(this),
                    icon = control.attr('data-cee-editor-icon'),
                    command = control.attr('data-cee-editor-command');
                return icon ? ('fa fa-' + icon) : ('fa fa-' + command);
            });
            
            $('.cee-editor-command-bar', container)
            .on('click', '[data-cee-editor-command]', function(event) {
                var control = $(event.target).closest('[data-cee-editor-command]'),
                    ui = control.attr('data-cee-editor-ui'),
                    command = control.attr('data-cee-editor-command'),
                    filter = control.attr('data-cee-editor-filter') || 'null',
                    isButton = control.is('button'),
					uiHandler = ui && uiHandlers[ui],
                    value;
                
				// We only want click from buttons
				if (event.type !== 'click' && isButton)
					return;
				// Ignore click if it is not a button
				if (event.type === 'click' && !isButton)
					return;
				// Prevent submit on button click
				if (event.type === 'click' && isButton)
					event.preventDefault();
				
				if (uiHandler)
					return uiHandler(event);
				
				if (!isButton) {
					value = control.val();
					value = filters[filter](value);
					alert(command + ' ' + value);
					document.execCommand(command, false, value);
				} else {
					document.execCommand(command);
				}
				notifyChange();
            });
            
            $('[data-cee-editor-ui="color"]', container).spectrum({
                preferredFormat: 'hex',
                change: function(color) {
                    var button = $(this),
                        command = button.attr('data-cee-editor-command'),
                        hexColor = '#' + color.toHex();
                    console.log('document.execCommand(', command, ',', hexColor, ')');
                    document.execCommand('styleWithCss', false, true);
                    document.execCommand(command, false, hexColor);
					notifyChange();
                }
            });
			editorContent.on('blur keyup paste input', function(event) {
				notifyChange();
			});
		}
		
		function val(html) {
			if (html === undefined) {
				return editorContent.html();
			} else {
				editorContent.html(html);
				changeContent(html);
        }
    }
    
		function notifyChange() {
			var html = editorContent.html();
			changeContent(html);
		}
		
		function changeContent(html) {
			placeholder.val(html).trigger('input').trigger('change');
		}
    }
    function createCommandGroup(name) {
        var group = template.commandBarGroup.clone();
        template.commandBar.append(group);
        return group;
    }
    
    function createControls(group, controls) {
        return group.append(controls.map(function(control) {
            var elem;
            
            if (control.select) {
                elem = template.commandBarSelect.clone();
                
                elem.append(control.select.map(function(option) {
                    var optionElem = template.commandBarOption.clone();
                    optionElem.attr('value', option.value ? 
                                    option.value :
                                    option.text);
                    optionElem.text(option.text);
                    return optionElem;
                }));
            } else {
                elem = template.commandBarButton.clone();
                
                if (control.icon)
                    elem.addClass('fa fa-' + control.icon);
                else if (control.command)
                    elem.addClass('fa fa-' + control.command);
                
                if (control.ui)
                    elem.attr('data-cee-editor-ui', control.ui);
            }
            
            elem.attr('data-cee-editor-command', control.command);
            
            return elem;
        }));
    }
}(jQuery));

$('.test-me').customEditor();
