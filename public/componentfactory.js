(function componentWrapper(window, $) {
    "use strict";
    
    var pluginName = 'pluginFactory',
        backup = $[pluginName],
        plugins = newObj();
    
    // Add a function for registering plugins onto $
    $[pluginName] = function(info) {
        var name = info.name,
            plugin = newObj();
        plugins[name] = plugin;
        plugin.instance = pluginInstance();
        
        function pluginInstance() {
            var backup = $.fn[name];
            $.fn[name] = function() {
                var args = Array.prototype.slice.call(arguments);
            };
        }
    };
    
    function newObj(prototype) {
        return Object.create(prototype || null);
    }
}(this, jQuery));
