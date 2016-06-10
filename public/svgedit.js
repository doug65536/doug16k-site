// Copyright 2016 A. Douglas Gale
(function(global) {
    "use strict";
    
    function ListenerCallback(callback, thisArg) {
        this.callback = callback;
        this.thisArg = thisArg;
    }
    ListenerCallback.prototype = {
        isSameAs: function(other) {
            return this.callback === other.callback &&
                this.thisArg === other.thisArg;
        },
        invokeApply: function(args) {
            return this.callback.apply(this.thisArg, args);
        },
        invokeCall: function(/*...*/) {
            return this.invokeApply(Array.prototype.slice.call(arguments));
        }
    };
    
    function UndoStack() {
        // The undo stack is just an array
        this.stack = [];
        
        // This is the undo/redo pointer
        // It points to the last command pushed
        this.ptr = -1;
        this.limit = 1024;
        this.listeners = {
            canUndo: [/*ListenerCallback...*/]
        };
    }
    UndoStack.prototype = {
        constructor: UndoStack,
        
        resetHistory: function() {
            this.stack.splice(0, this.stack.length);
            this.ptr = -1;
        },
        
        addCommand: function(command) {
            this.stack[++this.ptr] = command;
            
            // Truncate stack so new command is last command
            if (this.stack.length > this.ptr + 1)
                this.stack.length = this.ptr + 1;
                
            this.broadcast('canUndo', true, false);
        },
        
        execCommand: function(command) {
            var result = command.exec.apply(command);
            if (result !== false)
                this.addCommand(command);
        },
        
        undo: function() {
            if (!this.canUndo())
                return false;
            
            if (this.stack[this.ptr].undo() === false)
                return false;
            
            --this.ptr;
            
            this.broadcast('canUndo', this.ptr >= 0, true);
            
            return true;
        },
        
        redo: function() {
            if (!this.canRedo())
                return false;
            
            if (this.stack[this.ptr + 1].redo() === false)
                return false;
            
            ++this.ptr;
            
            this.broadcast('canUndo', true, this.ptr < this.stack.length - 1);
            
            return true;
        },
        
        canUndo: function() {
            return this.ptr >= 0;
        },
        
        canRedo: function() {
            return this.ptr + 1 !== this.stack.length;
        },
        
        triggerEvent: function(eventName) {
            var args;
            switch (eventName) {
            case 'canUndo':
                args = [eventName, this.canUndo(), this.canRedo()];
                break;
            
            default:
                console.assert(false);
            }
            this.broadcast.apply(this, args);
        },
        
        onEvent: function(eventName, callback, thisArg) {
            var listeners = this.listeners[eventName],
                listener = new ListenerCallback(callback, thisArg);
            if (listeners.some(this.makeIsSameListener(listener)))
                return false;
                
            listeners.push(listener);

            switch (eventName) {
            case 'canUndo':
                listener.invokeCall(eventName, this.canUndo(), this.canRedo());
                break;
            
            default:
                console.assert(false);
            }
        },
        
        offEvent: function(eventName, callback, thisArg) {
            var listener = new ListenerCallback(callback, thisArg),
                listeners = this.listeners[eventName],
                index;
            index = listeners.findIndex(
                this.makeIsSameListener(listener));
            if (index >= 0)
                listeners.splice(index, 1);
        },
        
        broadcast: function(eventName /*, ...*/) {
            var args = Array.prototype.slice.call(arguments),
                listeners = this.listeners[eventName];
            listeners.forEach(function(listener) {
                listener.invokeApply(args);
            });
        },
        
        makeIsSameListener: function(listener) {
            return function(other) {
                return listener.isSameAs(other);
            };
        }
    };
    
    // A command which contains multiple commands
    // If exec, redo, or undo fail, it rolls back
    // in the other direction with undo, undo, or redo
    // respectively, and returns false
    function CompoundCommand(/* command... */) {
        this.commands = Array.prototype.slice.call(arguments);
    }
    CompoundCommand.prototype = {
        constructor: CompoundCommand,
        
        addCommand: function(command) {
            this.commands.push(command);
        },
        
        addCommands: function(commands) {
            commands.forEach(function(command) {
                this.push(command);
            }, this.commands);
        },
        
        exec: function() {
            var i;
            for (i = 0; i < this.commands.length; ++i) {
                if (this.commands[i].exec() === false) {
                    while (--i >= 0)
                        this.commands[i].undo();
                    return false;
                }
            }
            return true;
        },
        
        undo: function() {
            var i;
            for (i = this.commands.length; i > 0; --i) {
                if (this.commands[i-1].undo() === false) {
                    while (++i < this.commands.length)
                        this.commands[i-1].redo();
                    return false;
                }
            }
            return true;
        },
        
        redo: function() {
            var i,
                commands = this.commands;
            for (i = 0; i < commands.length; ++i) {
                if (commands[i].redo() === false) {
                    while (--i >= 0)
                        commands[i].undo();
                    return false;
                }
            }
        }
    };
    
    function ViewModel() {
        this.values = Object.create(null);
        this.props = Object.create(null);
        this.watchers = Object.create(null);
    }
    ViewModel.prototype = {
        constructor: ViewModel,
        
        initProperties: function(obj) {
            Object.keys(obj).forEach(function(key) {
                this.initProperty(key, obj[key]);
            }, this);
        },
        
        initProperty: function(name, value) {
            Object.defineProperty(this.props, name, {
                get: function() {
                    return this.values[name];
                }.bind(this),
                set: function(value) {
                    var backup = this.values[name];
                    if (backup !== value) {
                        this.values[name] = value;
                        if (this.broadcastWatch(name, 
                                value, backup) === false) {
                            this.values[name] = backup;
                        }
                    }
                }.bind(this)
            });
            this.values[name] = value;
        },
        
        keys: function() {
            return Object.keys(this.values);
        },
        
        has: function(key) {
            return Object.prototype.hasOwnProperty.call(this.props, key);
        },
        
        remove: function(key) {
            delete this.props[key];
            delete this.values[key];
        },
        
        watch: function(callback, thisArg) {
            var globalWatchers = this.watchers[''];
            if (globalWatchers === undefined) {
                globalWatchers = [];
                this.watchers[''] = globalWatchers;
            }
            globalWatchers.push({
                callback: callback,
                thisArg: thisArg
            });
        },
        
        unwatch: function(callback, thisArg) {
            var globalWatchers = this.watchers[''];
            return globalWatchers &&
            globalWatchers.some(function(watcher, index, globalWatchers) {
                if (watcher.callback === callback &&
                        watcher.thisArg === thisArg) {
                    globalWatchers.splice(index, 1);
                    return true;
                }
            });
        },
        
        watchProperties: function(names, callback, thisArg) {
            if (typeof names === 'string')
                names = names.length && names.split(' ') || [];
            names.forEach(function(name) {
                this.watchProperty(name, callback, thisArg);
            }, this);
        },

        watchProperty: function(name, callback, thisArg) {
            var watchers = this.watchers[name],
                value;
            if (watchers === undefined) {
                watchers = [];
                this.watchers[name] = watchers;
            }
            watchers.push({
                callback: callback,
                thisArg: thisArg
            });
            value = this.values[name];
            callback.call(thisArg, name, value, value);
        },
        
        triggerWatch: function(name) {
            var value = this.values[name];
            return this.broadcastWatchArray(this.watchers[name], value, value);
        },

        broadcastWatch: function(name, value, old) {
            return this.broadcastWatchArray(this.watchers[name],
                name, value, old) &&
                this.broadcastWatchArray(this.watchers[''], 
                name, value, old);
        },
        
        broadcastWatchArray: function(watchers, name, value, old) {
            var called = [],
                thisArgs = [];

            if (watchers === undefined)
                return true;
            
            return !watchers.some(function(watcher) {
                var calledIdx = called.indexOf(watcher.callback),
                    thisArgsArray,
                    thisArgsIndex;
                if (calledIdx <= 0) {
                    // Never seen this callback
                    called.push(watcher.callback);
                    thisArgsArray = thisArgs[watcher.thisArg];
                    thisArgs[thisArgs.length] = thisArgsArray;
                } else {
                    // Have seen this callback
                    thisArgsArray = thisArgs[calledIdx];
                    thisArgsIndex = thisArgsArray.indexOf(watcher.thisArg);
                    if (thisArgsIndex < 0) {
                        // Never seen this callback/thisarg
                        thisArgsArray.push(watcher.thisArg);
                    } else {
                        // Already called this one
                        console.log('avoided redundant watcher call');
                        return;
                    }
                }
                
                if (watcher.callback.call(watcher.thisArg, 
                        name, value, old) === false)
                    return true;
            });
        }
    };
    
    function noConflict() {
        var rolledBack = global.Undo;
        global.Undo = backup;
        backup = undefined;
        return rolledBack;
    }

    var backup = global.Undo;
    global.Undo = {};
    global.Undo.noConflict = noConflict;
    global.Undo.UndoStack = UndoStack;
    global.Undo.CompoundCommand = CompoundCommand;
    global.Undo.ViewModel = ViewModel;
}(this));
/* global Undo */

;(function(global) {
    "use strict";
    
    var svgXmlNs = 'http://www.w3.org/2000/svg';

    var api = {},
        emptyArray = [];
    
    var posBase = {
        toString: function() {
            return '(' + this.left + ',' + this.top + ')';
        },
        copyfrom: function(r) {
            this.left = r.left;
            this.top = r.top;
            return this;
        },
        sub: function(r, y) {
            if (y === undefined && typeof r === 'object')
                return toPos(this.left - r.left, this.top - r.top);
            if (typeof r === 'number' && typeof y === 'number')
                return toPos(this.left - r, this.top - y);
            console.assert(false, 'bad arguments');
        },
        add: function(r, y) {
            if (y === undefined && typeof r === 'object')
                return toPos(this.left + r.left, this.top + r.top);
            if (typeof r === 'number' && typeof y === 'number')
                return toPos(this.left + r, this.top + y);
            console.assert(false, 'bad arguments');
        },
        scale: function(s) {
            if (typeof s === 'number')
                return toPos(this.left * s, this.top * s);
            console.assert(false, 'bad arguments');
        },
        vecmul: function(r, y) {
            if (typeof r === 'object' && typeof y === 'undefined')
                return toPos(this.left * r.left, this.top * r.top);
            else if (typeof r === 'number' && typeof y === 'number')
                return toPos(this.left * r, this.top * y);
            console.assert(false, 'bad arguments');
        },
        isEqual: function(r, y) {
            if (typeof r === 'object' && typeof y === 'undefined')
                return this.left === r.left && this.top === r.top;
            else if (typeof r === 'number' && typeof y === 'number')
                return this.left === r && this.top === y;
            console.assert(false, 'bad arguments');
        },
        abs: function() {
            return toPos(Math.abs(this.left), Math.abs(this.top));
        },
        div: function(d) {
            if (typeof d === 'number')
                return toPos(this.left / d, this.top / d);
            console.assert(false, 'bad arguments');
        },
        floor: function() {
            return toPos(Math.floor(this.left), Math.floor(this.top));
        },
        ceil: function() {
            return toPos(Math.ceil(this.left), Math.ceil(this.top));
        },
        round: function() {
            return toPos(Math.round(this.left), Math.round(this.top));
        },
        snap: function(m) {
            return toPos(Math.round(this.left/m)*m, Math.round(this.top/m)*m);
        },
        lenSq: function() {
            return this.left * this.left + this.top * this.top;
        },
        len: function() {
            return Math.sqrt(this.lenSq());
        },
        copy: function() {
            return new Pos2d(this.left, this.top);
        }
    };
    
    function Pos2d(x, y) {
        this.left = x;
        this.top = y;
    }
    Pos2d.prototype = posBase;
    
    function CurvePoint(sp, ep) {
        this.sp = new Pos2d(sp && sp.left || 0, sp && sp.top || 0);
        this.ep = new Pos2d(ep && ep.left || 0, ep && ep.top || 0);
    }
    
    function FlashingCaret() {
        this.rate = 400;
        this.phase = true;
        this.element = this.create();
        this.timer = undefined;
        this.boundTimerHandler = this.timerHandler.bind(this);
    }
    FlashingCaret.prototype = {
        create: function() {
            if (this.element)
                return this.element;
            this.element = createElementWithAttr('div', {
                style: {
                    display: 'none',
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    height: '0',
                    width: 0,
                    'border-left': 'solid black 1px'
                }
            });
            this.timer = setTimeout(this.boundTimerHandler, this.rate);
            return this.element;
        },
        timerHandler: function() {
            var element = this.element,
                phase = this.phase;
            if (element && element.parentNode)
                this.setPhase(!phase);
        },
        setPhase: function(phase) {
            phase = !!phase;
            this.phase = phase;
            var element = this.element,
                style = element && element.style;
            if (style) {
                style.display = phase ? null : 'none';
                this.reset();
            }
        },
        reset: function() {
            var timer = this.timer;
            if (timer !== undefined) {
                clearTimeout(timer);
                this.timer = undefined;
            }
            if (this.element)
                this.timer = setTimeout(this.boundTimerHandler, this.rate);
        },
        place: function(parent, x, y, height) {
            var element = this.create(),
                style = element.style,
                v;
            
            v = x + 'px';
            if (style.left !== v)
                style.left = v;
                
            v = y + 'px';
            if (style.top !== v)
                style.top = v;
            
            v = height + 'px';
            if (style.height !== v)
                style.height = height + 'px';
            
            if (element.parentNode !== parent)
                parent.appendChild(element);
            
            this.setPhase(true);
        },
        remove: function() {
            var element = this.element,
                parent = element && element.parentNode,
                timer = this.timer;
            if (parent)
                parent.removeChild(element);
            this.element = undefined;
            if (timer !== undefined)
                clearTimeout(timer);
        }
    };

    function inherit(ancestor, init) {
        return Object.keys(init).reduce(function(result, key) {
            result[key] = init[key];
            return result;
        }, Object.create(ancestor));
    }
    
    function approxCubicBezierLength(interp) {
        var segments = [],
            t,
            s,
            i,
            lastSpot,
            spot,
            dist;
        s = 1/1000;
        for (i = 0; i < 1000; ++i) {
            t = Math.min(1, s * i);
            spot = interp(t);
            if (lastSpot) {
                dist = spot.sub(lastSpot).len();
                segments.push(dist);
            }
            lastSpot = spot;
        }
        
        // Sort to minimize floating point roundoff and
        // preserve precision
        return segments.sort().reduce(function(a, b) {
            return a + b;
        });
    }
    
    function closestPointOnCubicBezier(p0, p1, p2, p3, p) {
        console.assert(p0 instanceof Pos2d);
        console.assert(p1 instanceof Pos2d);
        console.assert(p2 instanceof Pos2d);
        console.assert(p3 instanceof Pos2d);
        console.assert(p instanceof Pos2d);
        
        // Use simpler dot-product based implementation for straight segments
        if (p1 === p0 && p2 === p3 ||
                p1.isEqual(p0) && p3.isEqual(p2))
            return closestPointOnLineSeg(p0, p3, p, true);
        
        var interp,
            approxLen,
            i, t,
            stepSize,
            spot,
            distSq,
            bestDistSq,
            bestT,
            closest;
        
        interp = makeCubicBezierInterp(p0, p1, p2, p3);
        
        approxLen = approxCubicBezierLength(interp);
            
        bestDistSq = Infinity;
        stepSize = 1/approxLen;
        for (i = 0; i < approxLen; ++i) {
            t = Math.min(1, i * stepSize);
            spot = interp(t);
            distSq = spot.sub(p).lenSq();
            
            if (bestDistSq > distSq) {
                bestDistSq = distSq;
                bestT = t;
                closest = spot;
            }
        }
        
        return {
            closest: closest,
            distance: Math.sqrt(bestDistSq),
            t: bestT
        };
    }
    
    function closestPointOnLineSeg(a, b, p, segmentClamp) {
        var ap = p.sub(a),
            ab = b.sub(a),
            ab2 = ab.left*ab.left + ab.top*ab.top,
            ap_ab = ap.left*ab.left + ap.top*ab.top,
            t = ap_ab / ab2,
            closest,
            distance;
        
        if (segmentClamp)
            t = Math.max(0.0, Math.min(1.0, t));
    
        closest = a.add(ab.scale(t));
        distance = p.sub(closest).len();
        
        return {
            closest: closest,
            distance: distance,
            t: t
        };
    }                                

    function distFromLineSeg(v1, v2, point) {
        var d = v2.sub(v1);
        return Math.abs(
            (v2.top-v1.top) * point.left -
            (v2.left-v1.left) * point.top +
            v2.left*v1.top -
            v2.top*v1.left) /
            Math.sqrt(d.left*d.left + d.top*d.top);
    }

    function toPos(obj, y) {
        if (typeof obj === 'number' && typeof y === 'number') {
            return new Pos2d(obj, y);
        }
        
        if (typeof obj === 'object')
            return new Pos2d(obj.left, obj.top);
        
        return undefined;
    }
    
    function createElementWithAttr(tag, attr, ns) {
        var element;
        
        if (ns)
            element = document.createElementNS(ns, tag);
        else
            element = document.createElement(tag); 

        return setAttributes(element, attr);
    }
    
    function createSvgElementWithAttr(tag, attr) {
        return createElementWithAttr(tag, attr, svgXmlNs);
    }
    
    function newDefer() {
        var defer = {
            promise: null,
            resolve: null,
            reject: null
        };
        
        defer.promise = new Promise(function(resolve, reject) {
            defer.resolve = resolve;
            defer.reject = reject;
        });
        
        return defer;
    }
    
    function buildDragMenu(parent, items) {
        var menuContainer = createElementWithAttr('ul', {
            'class': 'sve-dragmenu'
        });
        menuContainer = createElementWithAttr('ul');
        items.forEach(function(item) {
            var itemType = typeof item,
                itemIsObj = (itemType === 'object'),
                itemText = itemIsObj && item.text || String(item),
                itemId = itemIsObj && item.id || String(item),
                li = createElementWithAttr('li', {
                    'class': 'sve-dragmenu-item',
                    'data-item-id': itemId
                }),
                button = createElementWithAttr('button', {
                    'class': 'sve-dragmenu-button'
                });
            setElementText(button, itemText);
            li.appendChild(button);
            this.appendChild(li);
        }, menuContainer);
        parent.appendChild(menuContainer);
    }
    
    function beginDrag(initEvent, callback, thisArg, options) {
        var dragDiv,
            cap,
            eventNames,
            currentCursor,
            preservedFocus = document.activeElement,
            defer = newDefer(),
            response,
            menuItems = options && options.menu;
        
        dragDiv = createElementWithAttr('div', {
            'class': 'sve-overlay',
            tabindex: 0
        });
        
        if (menuItems)
            buildDragMenu(dragDiv, menuItems);

        cap = {
            dragDiv: dragDiv,
            
            initEvent: initEvent,
            
            haveInit: !!initEvent,
            
            dragStart: toPos(
                (initEvent && initEvent.pageX) || 0,
                (initEvent && initEvent.pageY) || 0),
                
            dragDist:  toPos(0, 0),
            
            cursor: 'default'
        };
        
        cap.dragPos = toPos(cap.dragStart.left, cap.dragStart.top);

        updateCapFromEvent(cap, initEvent);
        
        // Make the initial callback before the element is added to the document        
        cap.response = callback.call(thisArg, initEvent, cap);
        if (cap.response !== undefined)
            return defer.resolve(cap);

        if (currentCursor !== cap.cursor) {
            currentCursor = cap.cursor;
            dragDiv.style.cursor = cap.cursor;
        }
        
        eventNames = [
            'mousemove',
            'contextmenu',
            'mousedown',
            'mouseup',
            'keydown',
            'DOMmousescroll',
            'mousewheel',
            'wheel',
            'keyup',
            'keypress',
            'input',
            'click'
        ];
        
        addEventListeners(dragDiv, eventNames.join(' '), handler);
        
        document.body.appendChild(dragDiv);
        
        dragDiv.focus();
        
        return defer.promise;
        
        function updateCapFromEvent(cap, event) {
            cap.dragDist.left = event.pageX - cap.dragStart.left;
            cap.dragDist.top = event.pageY - cap.dragStart.top;
        }
        
        function handler(event) {
            var restoreFocus;
            
            if (dragDiv === undefined)
                return;
            
            if (event.type === 'contextmenu' ||
                    event.type.substr(0, 5) === 'mouse')
                event.preventDefault();
            
            updateCapFromEvent(cap, event);
            
            cap.response = callback.call(thisArg, event, cap);
            if (cap.response !== undefined) {
                if (document.activeElement &&
                        document.activeElement === dragDiv)
                    restoreFocus = preservedFocus;
                document.body.removeChild(dragDiv);
                cap.dragDiv = undefined;
                dragDiv = undefined;
                
                if (restoreFocus && restoreFocus.focus)
                    restoreFocus.focus();
                
                defer.resolve(cap);
            }
            
            if (['focus', 'blur', 'mousedown', 'keydown'].indexOf(event.type) < 0)
                return returnEventFalse(event);
        }
    }

    function selectHasClass(className) {
        return function(element) {
            return className &&
                element &&
                element.classList &&
                element.classList.contains(className);
        };
    }
    
    function selectHasAttr(attrName) {
        return function(element) {
            return attrName &&
                element &&
                element.hasAttribute &&
                element.hasAttribute(attrName);
        };
    }
    
    function positionOfElement(element) {
        return {
            left: element.offsetLeft,
            top: element.offsetTop
        };
    }

    function childWithClass(parent, className) {
        return Array.prototype.find.call(parent.childNodes,
            selectHasClass(className));
    }
    
    function descendentsMatching(parent, selector) {
        return Array.prototype.slice.call(parent.querySelectorAll(selector));
    }
    
    function descendentMatchingFirst(parent, selector) {
        return parent.querySelector(selector);
    }

    function addEventListeners(element, eventNames, callback, capture) {
        var names,
            wrapper,
            debug = false&&console.log.bind(console);
        if (eventNames) {
            names = eventNames.split(' ');
            if (debug) {
                wrapper = function(event) {
                    var result;
                    debug('before event', event);
                    result = callback.apply(this,
                        Array.prototype.slice.call(arguments));
                    if (result !== undefined)
                        debug('callback result', result);
                    return result;
                };
            }
            names.forEach(function(name) {
                if (debug) {
                    element.addEventListener(name, wrapper, !!capture);
                } else {
                    element.addEventListener(name, callback, !!capture);
                }
            });
        }
        return element;
    }
    
    api.nextTick = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.splice(1, 0, 1);
        setTimeout.apply(global, args);
    };
    
    api.animationFrame = function(callback) {
        var args = Array.prototype.slice.call(arguments),
            requestAnimationFrame = window.requestAnimationFrame;
        if (requestAnimationFrame)
            return requestAnimationFrame.apply(window, args);
        else
            api.nextTick.apply(api, args);
    };

    api.Editor = function(root) {
        var toolbox = childWithClass(root, 'sve-toolbox'),
            propbox = childWithClass(root, 'sve-propbox'),
            toolbar = childWithClass(root, 'sve-toolbar'),
            docContainer,
            curDoc,
            modeHandler,
            modeLookup,
            modifierLookup,
            SelectionHandleElements = makeSelectionHandleClass(),
            selectionHandles = new SelectionHandleElements();
        
        var nextUntitled = 1;

        var toolbarButtons,
            toolboxButtons;
        
        var docWindowTemplate,
            docs = [],
            docsById = {},
            nextDocId = 1,
            nextDocPlace = 0;
        
        addResizerElements(propbox);
            
        //setInterval(function() {
        //    console.log('active', document.activeElement);
        //}, 10000);
        //addEventListeners(window, 'focusin focusout', function(event) {
        //    console.log(event.type, event.target);
        //});
        
        docContainer = childWithClass(root, 'sve-document-container');
        
        // Remove document template from html
        docWindowTemplate = childWithClass(docContainer, 'sve-document');
        docContainer.removeChild(docWindowTemplate);
        
        // Allows playing with document objects in debugger
        window.hack = docsById;
        
        toolbarButtons = descendentsMatching(toolbar, '.sve-toolbar-button')
        .reduce(function(toolbarButtons, element) {
            var name = element.getAttribute('name');
            toolbarButtons[name] = element;
            return toolbarButtons;
        }, {});
        
        toolboxButtons = descendentsMatching(toolbox, 'input[name="tool"]')
        .reduce(function(toolboxButtons, element) {
            var name = element.getAttribute('value');
            toolboxButtons[name] = element;
            return toolboxButtons;
        }, {});
        
        setupDocumentResize();
        
        setupPropertyHandling({
            fontFamily: {
                select: [
                    'sans-serif', 'serif', 'fixed',
                    'Arial', 'Arial Black', 'Trebuchet MS',
                    'Comic Sans',
                    'Courier', 'Cursive', 'Fantasy', 'Georgia',
                    'Monospace', 'Verdana'
                ]
            },
            fill: {
                input: 'color'
            },
            stroke: {
                input: 'color'
            },
            strokeWidth: {
                input: 'number'
            },
            strokeOpacity: {
                input: 'number'
            },
            strokeLineCap: {
                select: ['butt', 'square', 'round']
            },
            strokeLineJoin: {
                select: ['miter', 'round', 'bevel']
            },
            strokeMiterLimit: {
                input: 'number'
            },
            // strokeDashArray
            strokeDashOffset: {
                input: 'number'
            },
            fillRule: {
                select: ['nonzero', 'evenodd']
            },
            sides: {
                input: 'number'
            },
            offset: {
                input: 'number'
            },
            fontVariant: {
                select: ['normal', 'small-caps']
            },
            fontStretch: {
                select: [
                    'normal', 'wider', 'narrower',
                    'ultra-condensed', 'extra-condensed',
                    'condensed', 'semi-condensed', 'semi-expanded',
                    'expanded', 'extra-expanded', 'ultra-expanded'
                ]
            }
        });

        modifierLookup = {
            lin: {
                midcenter: function(selection) {
                    var props = selection.vm.props,
                        realPoints = props.points,
                        realHandles = props.handles,
                        clonedPoints,
                        clonedHandles;
                    
                    clonedPoints = realPoints.map(clonePoint);
                    clonedHandles = realHandles.map(clonePoint);
                    
                    return function(event, cap) {
                        clonedPoints.forEach(translateFromOrig, realPoints);
                        clonedHandles.forEach(translateFromOrig, realHandles);
                        this.vm.triggerWatch('points');
                    
                        function translateFromOrig(origPoint, index, clonedPoints) {
                            this[index].left = origPoint.left + cap.docDragDist.left;
                            this[index].top = origPoint.top + cap.docDragDist.top;
                        }
                    };
                    
                    function clonePoint(point) {
                        return point && toPos(point.left, point.top);
                    }
                }
            },
            txt: {
                midcenter: modifierSimplePosition(['x', 'y']),
                topcenter: modifierSimpleEdge('top', ['fontSize']),
                midright: function(selection) {
                    var vm = selection.vm,
                        props = vm.props,
                        start = toPos(props.x, props.y),
                        startWrapWidth = props.wrapWidth;
                    if (startWrapWidth === 0)
                        return noop;
                    
                    return function(event, cap) {
                        var dist = cap.docDragDist.left,
                            halfDist = dist / 2;
                        props.x = start.left + halfDist;
                        props.wrapWidth = startWrapWidth + dist;
                    };
                }
            },
            cir: 'box',
            sha: 'box',
            img: 'box',
            box: {
                topleft: modifierSimplePosition(['sx', 'sy']),
                topcenter: modifierSimpleEdge('top', ['sy']),
                topright: modifierSimplePosition(['ex', 'sy']),
                
                midleft: modifierSimpleEdge('left', ['sx']),
                midcenter: modifierSimplePosition(['sx', 'sy', 'ex', 'ey']),
                midright: modifierSimpleEdge('left', ['ex']),
                
                bottomleft: modifierSimplePosition(['sx', 'ey']),
                bottomcenter: modifierSimpleEdge('top', ['ey']),
                bottomright: modifierSimplePosition(['ex', 'ey']),
            }
        };
        
        // Registry for each type of document object
        var typeRegistry = {
            lin: {
                type: 'lin',
                
                initProperties: {
                    width: 0,
                    height: 0,
                    
                    minx: 0,
                    miny: 0,
                    
                    maxx: 0,
                    maxy: 0,
                    
                    points: [],
                    handles: [],
                    
                    closed: false,

                    strokeWidth: 3,
                    stroke: 'black',
                    fill: 'none'
                },
                
                elements: {
                    element: function() {
                        return createSvgElementWithAttr('path', {
                            d: 'M0 0L0 0',
                            'path-length': '1'
                        });
                    }
                },
                
                attrBinds: {
                    fill: {
                    },
                    stroke: {
                    },
                    strokeWidth: {
                        attr: 'stroke-width',
                    },
                    strokeLineCap: {
                        attr: 'stroke-linecap',
                    },
                    strokeOpacity: {
                        attr: 'stroke-opacity'
                    },
                    strokeLineJoin: {
                        attr: 'stroke-linejoin'
                    },
                    strokeDashArray: {
                        attr: 'stroke-dasharray'
                    },
                    fillRule: {
                        attr: 'fill-rule'
                    },
                    strokeMiterLimit: {
                        attr: 'stroke-miterlimit'
                    },
                    strokeDashOffset: {
                        attr: 'stroke-dashoffset'
                    }
                },
                
                watchProperties: {
                    'points closed': function(name, value) {
                        var vm = this.vm,
                            props = vm.props,
                            points = props.points,
                            handles = props.handles,
                            minmax,
                            min,
                            max,
                            closedPoints;
                        
                        minmax = points.reduce(function(minmax, point, index) {
                            var min = minmax.min,
                                max = minmax.max;
                            
                            if (min.left > point.left)
                                min.left = point.left;
                            
                            if (min.top > point.top)
                                min.top = point.top;
                            
                            if (max.left < point.left)
                                max.left = point.left;
                            
                            if (max.top < point.top)
                                max.top = point.top;
                            
                            return minmax;
                        }, {
                            min: toPos(Infinity, Infinity),
                            max: toPos(-Infinity, -Infinity)
                        });
                        
                        min = minmax.min;
                        max = minmax.max;
                        props.minx = min.left;
                        props.miny = min.top;
                        props.maxx = max.left;
                        props.maxy = max.top;
                        
                        closedPoints = props.closed ? points.concat(points[0]) : points;
                        
                        var path = closedPoints.map(function(point, index, points) {
                            var handleIndex,
                                startHandle,
                                endHandle,
                                prevPoint,
                                pp,
                                sp,
                                ep;
                            pp = point.sub(min);
                            if (index !== 0) {
                                prevPoint = points[index-1];
                                handleIndex = index * 2 - 2;
                                startHandle = handleIndex >= 0 && handles[handleIndex];
                                endHandle = handles[handleIndex+1];
                                
                                if (startHandle || endHandle) {
                                    if (!startHandle)
                                        startHandle = prevPoint;
                                    if (!endHandle)
                                        endHandle = point;
                                    
                                    sp = startHandle.sub(min);
                                    ep = endHandle.sub(min);
                                    
                                    return 'C' + sp.left + ' ' + sp.top +
                                        ' ' + ep.left + ' ' + ep.top +
                                        ' ' + pp.left + ' ' + pp.top;
                                }
                                return 'L' + pp.left + ' ' + pp.top;
                            }
                            return 'M' + pp.left + ' ' + pp.top;
                        }).join('');
                        
                        if (props.closed)
                            path += 'z';
                        
                        this.element.setAttribute('d', path);
                        
                        this.g.setAttribute('transform', points.length ?
                            'translate(' +
                            min.left + ',' + min.top +
                            ')' :
                            '');
                    },
                },
                
                createDrag: function(event, cap) {
                    var vm = this.vm,
                        props = vm.props,
                        points = props.points,
                        pointsReady = (points.length > 1),
                        lastPoint = pointsReady && points[points.length-1],
                        prevPoint = pointsReady && points[points.length-2],
                        newpos = cap.docDragEnd,
                        segVec = pointsReady && lastPoint.sub(prevPoint),
                        absdist = pointsReady && segVec.abs(),
                        farthest = Math.max(absdist.left, absdist.top),
                        isVertical = (absdist.left < absdist.top);
                    
                    if (event.ctrlKey && pointsReady) {
                        if (isVertical)
                            newpos = toPos(prevPoint.left, newpos.top);
                        else
                            newpos = toPos(newpos.left, prevPoint.top);
                    }
                    
                    cap.cursor = 'crosshair';
                    
                    if (event.type === 'keydown')
                        return;
                    if (event.type === 'keypress') {
                        switch (String.fromCharCode(event.charCode)) {
                        case 'u':
                            if (points.length > 2) {
                                points.splice(points.length-2, 1);
                                vm.triggerWatch('points');
                            }
                            break;
                        }
                    } else if (event.type === 'mousedown' && event.which === 1) {
                        points.push(newpos);
                        if (points.length === 1)
                            points.push(newpos);
                        vm.triggerWatch('points');
                    } else if (event.type === 'mousedown' && event.which === 3) {
                        event.preventDefault();
                    } else if (event.type === 'mouseup' && event.which === 1) {
                        // If first segment and large distance, then done
                        if (points.length === 2 && farthest > 8)
                            return true;
                    } else if (event.type === 'mouseup' && event.which === 3) {
                        points.pop();
                        if (event.shiftKey) {
                            props.closed = true;
                        } else {
                            props.closed = false;
                        }
                        vm.triggerWatch('points');
                        return true;
                    } else if (event.type === 'mousemove') {
                        points[points.length-1] = newpos;
                        vm.triggerWatch('points');
                    }
                },
                
                updateNodes: function(mv, nodePoints, props) {
                    var points = props.points,
                        handles = props.handles,
                        template,
                        nodeRadius = 3,
                        rdz = nodeRadius, // / zoom;
                        closedPoints;
                    
                    if (points.length < 2)
                        return;
                    
                    template = {
                        root: createSvgElementWithAttr('g'),
                        node: createSvgElementWithAttr('rect', {
                            'class': 'sve-node-handle',
                            x: 0,
                            y: 0,
                            width: 2 * rdz,
                            height: 2 * rdz,
                            fill: 'white',
                            'fill-opacity': 0.5,
                            stroke: 'black',
                            'stroke-width': 1 / curDoc.zoom
                        }),
                        handle: createSvgElementWithAttr('circle', {
                            'class': 'sve-node-handle',
                            cx: 0,
                            cy: 0,
                            r: rdz,
                            fill: 'white',
                            'fill-opacity': 0.5,
                            stroke: 'black',
                            'stroke-width': 1 / curDoc.zoom
                        }),
                        handleLine: createSvgElementWithAttr('polyline', {
                            'class': 'sve-node-curve-line',
                            stroke: 'black',
                            'stroke-width': 1 / curDoc.zoom,
                            'stroke-dasharray': '3,1'
                        })
                    };
                    
                    var makeHandleAndLine = function(parent, id) {
                        var handle = template.handle.cloneNode(true),
                            handleLine = template.handleLine.cloneNode(true);
                        setAttributes(handle, {
                            'data-sve-node-id': id
                        });
                        parent.appendChild(handleLine);
                        parent.appendChild(handle);
                        return {
                            handle: handle,
                            handleLine: handleLine
                        };
                    };
                    
                    var prevMainNode;
                    
                    closedPoints = props.closed ? points.concat(points[0]) : points;
                    closedPoints.reduce(function(nodePoints, point, index, closedPoints) {
                        var isLast = (index + 1 === closedPoints.length),
                            element = template.root.cloneNode(true),
                            node,
                            ctrlIndex,
                            prevPoint,
                            startCtrl, endCtrl,
                            startCtrlElements, endCtrlElements,
                            newNode,
                            mainNode;
                        
                        if (!props.closed || !isLast) {
                            node = template.node.cloneNode(true);
                            
                            setAttributes(node, {
                                'data-sve-node-id': nodePoints.length,
                                x: point.left - rdz,
                                y: point.top - rdz,
                                width: rdz * 2,
                                height: rdz * 2
                            });
                            newNode = {
                                source: 'points',
                                mv: mv,
                                element: node,
                                selected: false,
                                point: point,
                                id: nodePoints.length,
                                index: index,
                                update: updateNodeNode,
                                remover: removeNodeNode,
                                del: delNodeNode
                            };
                            nodePoints.push(newNode);
                            newNode.update(newNode);
                            mainNode = newNode;
                            element.appendChild(node);
                        }
                        
                        if (index > 0) {
                            prevPoint = points[index-1];
                            ctrlIndex = (index - 1) * 2;
                            startCtrl = handles[ctrlIndex];
                            endCtrl = handles[ctrlIndex+1];
                            
                            if (startCtrl) {
                                startCtrlElements = makeHandleAndLine(
                                    element, nodePoints.length);
                                newNode = {
                                    source: 'handles',
                                    mv: mv,
                                    element: startCtrlElements.handle,
                                    line: startCtrlElements.handleLine,
                                    from: prevPoint,
                                    selected: false,
                                    point: startCtrl,
                                    id: nodePoints.length,
                                    index: ctrlIndex,
                                    update: updateNodeHandle,
                                    remover: removeNodeHandle,
                                    del: delNodeHandle
                                };
                                nodePoints.push(newNode);
                                newNode.update(newNode);
                                
                                if (prevMainNode && !prevMainNode.related)
                                    prevMainNode.related = [];
                                prevMainNode && prevMainNode.related.push(newNode);
                            }
                            if (endCtrl) {
                                endCtrlElements = makeHandleAndLine(
                                    element, nodePoints.length);
                                newNode = {
                                    source: 'handles',
                                    mv: mv,
                                    element: endCtrlElements.handle,
                                    line: endCtrlElements.handleLine,
                                    from: point,
                                    selected: false,
                                    point: endCtrl,
                                    id: nodePoints.length,
                                    index: ctrlIndex+1,
                                    update: updateNodeHandle,
                                    remover: removeNodeHandle,
                                    del: delNodeHandle
                                };
                                nodePoints.push(newNode);
                                newNode.update(newNode);
                                
                                if (mainNode && !mainNode.related)
                                    mainNode.related = [];
                                mainNode && mainNode.related.push(newNode);
                            }
                        }

                        prevMainNode = mainNode;
                        
                        curDoc.doc.appendChild(element);
                        
                        return nodePoints;
                    }, nodePoints);
                }
            },
            
            box: {
                type: 'box',
                
                initProperties: {
                    width: 0,
                    height: 0,

                    sx: 0,
                    sy: 0,
                    
                    ex: 0,
                    ey: 0,
                    
                    minx: 0,
                    miny: 0,
                    
                    maxx: 0,
                    maxy: 0,
                    
                    strokeWidth: 2,
                    fill: 'none',
                    stroke: 'black'
                },
                
                initPosition: 'sx,sy,ex,ey',
                
                elements: {
                    element: function() {
                        return createSvgElementWithAttr('rect', {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        });
                    }
                },

                attrBinds: {
                    fill: {},
                    width: {},
                    height: {},
                    stroke: {},
                    'strokeWidth': { attr: 'stroke-width' }
                },
                
                watchProperties: {
                    'sx ex': function(name, value) {
                        var props = this.vm.props,
                            minX = Math.min(props.sx, props.ex),
                            maxX = Math.max(props.sx, props.ex);
                        props.width = maxX - minX;
                        props.minx = minX;
                        props.maxx = maxX;
                    },
                    'sy ey': function(name, value) {
                        var props = this.vm.props,
                            minY = Math.min(props.sy, props.ey),
                            maxY = Math.max(props.sy, props.ey);
                        props.height = maxY - minY;
                        props.miny = minY;
                        props.maxy = maxY;
                    },
                    'minx miny': function(name, value) {
                        var props = this.vm.props;
                        this.g.setAttribute('transform', 'translate(' + 
                            props.minx + ',' + props.miny + ')');
                    }
                },
                
                createDrag: function(event, cap) {
                    var props = this.vm.props;
                    props.sx = cap.docDragStart.left;
                    props.sy = cap.docDragStart.top;
                    props.ex = cap.docDragEnd.left;
                    props.ey = cap.docDragEnd.top;

                    cap.cursor = 'crosshair';
                    
                    if (event.type === 'mouseup')
                        return true;
                },
                
                createDragOptions: {
                    absolute: true
                }
            },
            
            cir: {
                type: 'cir',
                
                initProperties: {
                    width: 0,
                    height: 0,

                    sx: 0,
                    sy: 0,
                    
                    ex: 0,
                    ey: 0,
                    
                    fill: 'transparent',
                    stroke: 'black',
                    strokeWidth: 2
                },
                
                elements: {
                    element: function() {
                        return createSvgElementWithAttr('ellipse', {
                            cx: 0,
                            cy: 0,
                            rx: 0,
                            ry: 0
                        });
                    }
                },
                
                initPosition: 'sx,sy,ex,ey',

                attrBinds: {
                    fill: {
                    },
                    stroke: {
                    },
                    'strokeWidth': {
                        attr: 'stroke-width',
                    }
                },
                
                watchProperties: {
                    'sx sy ex ey': function(name, value) {
                        var props = this.vm.props,
                            vx = props.ex - props.sx,
                            vy = props.ey - props.sy,
                            vx2 = vx / 2,
                            vy2 = vy / 2;
                        props.width = vx;
                        props.height = vy;
                        this.g.setAttribute('transform', 'translate(' + 
                            props.sx + ',' + props.sy + ')');
                        setAttributes(this.element, {
                            cx: vx2,
                            cy: vy2,
                            rx: vx2,
                            ry: vy2
                        });
                    }
                },
                
                createDrag: function(event, cap) {
                    var props = this.vm.props;
                    props.sx = cap.docDragStart.left;
                    props.sy = cap.docDragStart.top;
                    props.ex = cap.docDragEnd.left;
                    props.ey = cap.docDragEnd.top;

                    cap.cursor = 'crosshair';
                    
                    if (event.type === 'mouseup') {
                        if (props.width > 0 && props.height > 0) {
                            
                        } else {
                            //g.parentElement.removeChild(g);
                        }
                        return true;
                    }
                },
                
                createDragOptions: {
                    absolute: true
                }
            },
            
            sha: {
                type: 'sha',
                
                initProperties: {
                    width: 0,
                    height: 0,

                    sx: 0,
                    sy: 0,
                    
                    ex: 0,
                    ey: 0,
                    
                    sides: 5,
                    offset: 90,
                    fill: 'none',
                    stroke: 'black',
                    strokeWidth: 2
                },
                
                elements: {
                    element: function() {
                        return createSvgElementWithAttr('path', {
                            d: 'M0 0'
                        });
                    }
                },

                attrBinds: {
                    fill: {
                    },
                    stroke: {
                    },
                    'strokeWidth': {
                        attr: 'stroke-width'
                    }
                },
                
                watchProperties: {
                    'sx sy ex ey sides': function(name, value) {
                        var props = this.vm.props,
                            sx = props.sx,
                            sy = props.sy,
                            ex = props.ex,
                            ey = props.ey,
                            rx = Math.abs(ex - sx) / 2,
                            ry = Math.abs(ey - sy) / 2,
                            vx2 = rx / 2,
                            vy2 = ry / 2,
                            ang = props.offset,
                            sides = props.sides,
                            rad,
                            step = 360 / sides,
                            d = [],
                            x,
                            y,
                            side;
                        
                        for (side = 0; side < props.sides; ++side) {
                            rad = (ang + side * step) / 180.0 * 3.141592653589793;
                            x = rx + Math.cos(rad) * rx;
                            y = ry - Math.sin(rad) * ry;
                            d.push(d.length?'L':'M', x, ' ', y);
                        }
                        
                        props.width = rx * 2;
                        props.height = ry * 2;

                        this.g.setAttribute('transform', 'translate(' + 
                            props.sx + ',' + props.sy + ')');
                            
                        d.push('z');

                        this.element.setAttribute('d', d.join(''));
                    }
                },
                
                createDrag: function(event, cap) {
                    var props = this.vm.props;
                    props.sx = cap.docDragStart.left;
                    props.sy = cap.docDragStart.top;
                    props.ex = cap.docDragEnd.left;
                    props.ey = cap.docDragEnd.top;
                    
                    if (event.type === 'mouseup')
                        return true;
                },
                
                createDragOptions: {
                    absolute: true
                }
            },
            
            txt: {
                type: 'txt',
                
                initProperties: {
                    width: 0,
                    height: 0,
                    
                    minx: 0,
                    maxx: 0,
                    miny: 0,
                    maxy: 0,

                    x: 0,
                    y: 0,
                    
                    wrapWidth: 0,

                    text: [''],
                    lineSpacing: 'auto',
                    
                    fontSize: 22,
                    fontFamily: 'sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontVariant: 'normal',
                    fontStretch: 'normal',
                    textDecoration: 'none',
                    
                    horizontalAlign: 'middle',
                    fill: 'black',
                    stroke: 'none',
                    strokeWidth: 0
                },
                
                initPosition: 'x,y',
                
                elements: {
                    element: function() {
                        return createSvgElementWithAttr('text', {
                            'class': 'sve-editable'
                        });
                    }
                },

                attrBinds: {
                    fill: {
                    },
                    stroke: {
                    },
                    strokeWidth: {
                        attr: 'stroke-width'
                    },
                    horizontalAlign: {
                        attr: 'text-anchor'
                    },
                    wordSpacing: {
                        attr: 'word-spacing'
                    },
                    fontSize: {
                        attr: 'font-size'
                    },
                    fontFamily: {
                        attr: 'font-family'
                    },
                    fontStyle: {
                        attr: 'font-style'
                    },
                    fontVariant: {
                        attr: 'font-variant'
                    },
                    fontWeight: {
                        attr: 'font-weight'
                    },
                    fontStretch: {
                        attr: 'font-stretch'
                    },
                    textDecoration: {
                        attr: 'text-decoration'
                    }
                },
                
                watchProperties: {
                    'text lineSpacing wrapWidth': function(name, value) {
                        var element = this.element,
                            vm = this.vm,
                            props = vm.props,
                            spans = props.text,
                            wrapWidth = props.wrapWidth,
                            measure,
                            bbox,
                            spanElements,
                            tspan,
                            newSpans,
                            words,
                            prevRowHeight,
                            spanText,
                            fixedUpText;
                        
                        // If wrapWidth is > 0, then build a new
                        // spans array, with wordwrap applied.
                        // In this mode, the text array refers
                        // to paragraphs.
                        
                        if (wrapWidth > 0) {
                            measure = element.cloneNode(false);
                            setStyles(measure, { opacity: 0 });
                            element.parentNode.insertBefore(measure, 
                                element.nextNode);
                            tspan = createSvgElementWithAttr('tspan');
                            measure.appendChild(tspan);
                            newSpans = spans.reduce(function(newSpans, para) {
                                var startPos, keepPos, keepPos2,
                                    startPoint,
                                    wrapLine;
                                
                                while (para.length > 0) {
                                    setElementText(tspan, para);
                                    
                                    startPos = tspan.getExtentOfChar(0);
                                    startPoint = makeSVGPoint(element, 
                                        startPos.x + wrapWidth,
                                        startPos.y + startPos.height / 2);
                                    keepPos = tspan.getCharNumAtPosition(startPoint);
                                    if (keepPos < 0)
                                        keepPos2 = para.length;
                                    else
                                        keepPos2 = para.lastIndexOf(' ', keepPos);
                                    if (keepPos2 < 0)
                                        keepPos2 = keepPos;
                                        //keepPos2 = para.indexOf(' ', keepPos);
                                    if (keepPos2 < 0)
                                        keepPos2 = para.length-1;
                                    
                                    // Let the space be at the end of the prior line
                                    // if the algorithm tries to put it at the start
                                    // of the next line
                                    if (para[keepPos2+1] === ' ')
                                        keepPos2 += 1;
                                    
                                    wrapLine = para.substr(0, keepPos2+1);
                                    
                                    // Hyphenate
                                    if (keepPos2 < wrapLine.length &&
                                            wrapLine[keepPos2] !== ' ')
                                        wrapLine += '-';
                                    newSpans.push(fixupText(wrapLine));
                                    
                                    para = para.substr(keepPos2+1);
                                }
                                return newSpans;
                            }, []);
                            measure.parentNode.removeChild(measure);
                            
                            spans = newSpans;
                        }

                        spanElements = this.spanElements;
                        if (!spanElements) {
                            spanElements = [];
                            this.spanElements = spanElements;
                        }
                        
                        // Adjust span count
                        while (spanElements.length < spans.length) {
                            prevRowHeight = spanElements.length ?
                                spanElements[spanElements.length-1]
                                .getExtentOfChar(0).height :
                                0;
                            tspan = createSvgElementWithAttr('tspan', {
                                x: 0,
                                dy: prevRowHeight,
                                'xml:space': 'preserve'
                            });
                            setElementText(tspan, '\u200b');
                            element.appendChild(tspan);
                            spanElements.push(tspan);
                        }
                        while (spanElements.length > spans.length)
                            element.removeChild(spanElements.pop());
                        
                        // Adjust span text
                        spanElements.forEach(function(spanElement, index, spanElements) {
                            var textNode = spanElement.firstChild;
                            spanText = spans[index];
                            fixedUpText = fixupText(spanText);
                            // ? 
                                //spanText.replace(/ /g, '\xa0') : '\u200B';
                            
                            // Update the text if necessary
                            if (textNode.nodeValue !== fixedUpText)
                                textNode.nodeValue = fixedUpText;
                        }, this);
                        
                        bbox = getBoundingDocumentRect(element);
                        props.width = bbox.right - bbox.left;
                        props.height = bbox.bottom - bbox.top;
                        props.minx = bbox.left;
                        props.miny = bbox.top;
                        props.maxx = bbox.right;
                        props.maxy = bbox.bottom;
                    },
                    'x y': function(name, value) {
                        var props = this.vm.props;
                        this.g.setAttribute('transform', 'translate(' + 
                            props.x + ',' + props.y + ')');
                    }
                },
                
                createDrag: function(event, cap) {
                    if (event.type !== 'mouseup')
                        return;
                    return true;
                },
                
                createDragDone: function(cap) {
                    var pos = toPos(cap.docDragEnd),
                        mv = this,
                        vm = mv.vm,
                        props = vm.props;
                    
                    if (cap.dragDist.left > 4) {
                        props.wrapWidth = cap.dragDist.left;

                        props.x = pos.left - cap.dragDist.left / 2;
                        props.y = pos.top;
                    } else {
                        props.x = pos.left;
                        props.y = pos.top;
                    }
                    
                    props.text = ['The quick brown fox jumped over the disestablishmentarian lazy dog and used the entire keyboard very quickly.'];
                    vm.triggerWatch('text');
                    
                    makeTextEditor(curDoc.scrollChild, mv, 0, 0);
                }
            }
        };
        
        modeLookup = {
            sel: function(event) {
                switch (event.type) {
                case 'keypress':
                    switch (String.fromCharCode(event.charCode)) {
                    case 'i':
                        var data = prompt('enter path d attribute value'),
                            reParts = /(M\s*\d+\s+\d+)|(L\s*\d+\s+\d+)|(C\s*\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+)|(Z)/g,
                            reMove = /^\s*M\s*(\d+)\s+(\d+)\s*$/,
                            reLine = /^\s*L\s*(\d+)\s+(\d+)\s*$/,
                            reCurve = /^\s*C\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/,
                            parts = data.match(reParts);
                        
                        curDoc.selectedItems.forEach(function(selection) {
                            var vm = selection.vm,
                                props = vm.props,
                                isLine = (props.type === 'lin'),
                                points = isLine && props.points,
                                handles = isLine && props.handles;
                            if (!points)
                                return;
                            points.splice(0, points.length);
                            handles.splice(0, handles.length);
                            
                            props.closed = false;
                            parts.forEach(function(part, index, parts) {
                                var bits,
                                    handleIndex;
                                switch (part[0]) {
                                case 'M':
                                    bits = part.match(reMove);
                                    points.push(toPos(+bits[1], +bits[2]));
                                    break;
                                
                                case 'L':
                                    bits = part.match(reLine);
                                    points.push(toPos(+bits[1], +bits[2]));
                                    break;
                                    
                                case 'C':
                                    handleIndex = index * 2 - 2;
                                    bits = part.match(reCurve);
                                    handles[handleIndex] = toPos(+bits[1], +bits[2]);
                                    handles[handleIndex+1] = toPos(+bits[3], +bits[4]);
                                    points.push(toPos(+bits[5], +bits[6]));
                                    break;

                                case 'Z':
                                    props.closed = true;
                                    break;
                                    
                                }
                            });
                            vm.triggerWatch('points');
                        });
                        
                        break;
                    }
                }
                if (event.type !== 'mousedown')
                    return;
                
                interactiveDragRectangle(event)
                .then(function(selectedRect) {
                    var hitTester = makeHitTester(curDoc.docModel, curDoc.doc),
                        results;
                    
                    if (selectedRect.size.left < 4 &&
                            selectedRect.size.top < 4) {
                        // Small rectangle, use point selection
                        results = hitTester.testPoint(
                            selectedRect.min.left, selectedRect.min.top);
                        
                        setSelection(results ? [results] : []);
                    } else {
                        // Large rectangle, use rectangle selection
                        results = hitTester.insideRect(
                                selectedRect.min.left, selectedRect.min.top, 
                                selectedRect.max.left, selectedRect.max.top);
                        
                        setSelection(results.hits.map(function(hit) {
                            return hit.mv;
                        }));
                    }
                });
                
                return returnEventFalse(event);
            },
            zoo: function(event) {
                var isWheel,
                    wheelEvents = ['mousewheel', 'DOMmousescroll', 'wheel'],
                    wheelDelta,
                    wheelDir,
                    panning,
                    panStart;
                
                switch (event.type) {
                case 'mousedown':
                case 'mousewheel':    
                case 'DOMmousescroll':
                    isWheel = (wheelEvents.indexOf(event.type) >= 0);
                    wheelDelta = event.deltaY ||
                        -event.wheelDelta;
                    wheelDir = isWheel && (
                        wheelDelta < 0 && 'up' || 'down'),
                    panning = (event.type === 'mousedown' && event.which === 2);
                    panStart = docScrollPixel();
                    
                    beginDocumentDrag(event, function(event, cap) {
                        var halfSize, selCenter,scrollTo, viewWidth, viewHeight;

                        // If not panning, a right drag further than 8 pixels
                        // starts pan drag
                        if (!panning && 
                                cap.initEvent.type === 'mousedown' &&
                                cap.initEvent.which === 3 &&
                                (Math.abs(cap.dragDist.left) > 8 ||
                                Math.abs(cap.dragDist.top) > 8))
                            panning = true;

                        if (panning) {
                            cap.cursor = 'drag';
                            scrollDocumentToPixel(panStart.sub(cap.dragDist));

                            if (event.type === 'mouseup')
                                return true;
                        }
                        
                        if (wheelDir === 'down' ||
                                event.type === 'mouseup' && event.which === 3) {
                            // Zoom out
                            if (curDoc.zoom <= 1/4)
                                return true;
                            
                            curDoc.zoom /= 2;
                            updateDocumentSize();
                        } else if (wheelDir === 'up' ||
                                event.type === 'mouseup' && event.which === 1) {
                            if (curDoc.zoom * 2 >= 1<<16)
                                return true;
                            
                            // Zoom in
                            curDoc.zoom *= 2;
                            updateDocumentSize();
                        } else {
                            return;
                        }
                        
                        // Scroll the center of the selection
                        // to the center of the viewport
                        halfSize = cap.docDragDist.scale(0.5);
                        selCenter = cap.docDragStart.add(halfSize).scale(curDoc.zoom);
                        viewWidth = curDoc.scrollParent.clientWidth;
                        viewHeight = curDoc.scrollParent.clientHeight;
                        scrollTo = selCenter.sub(viewWidth / 2, viewHeight / 2);
                        scrollDocumentToPixel(scrollTo);
                        return true;
                    });
                    
                    return returnEventFalse(event);
                };

                return returnEventFalse(event);
            },
            nod_entered: function() {
                selectionHandles.remove();
                
                modeEnterNodeEdit();
            },
            nod_leaving: function() {
                modeLeaveNodeEdit();
                console.assert(curDoc.nodePoints.length === 0);
                updateSelectionHandles();
            },
            nod: function(event) {
                switch (event.type) {
                case 'keydown':
                    switch (event.which) {
                    case 0x2e:    // DEL
                        curDoc.selectedItems.forEach(function(selection) {
                            var mv = selection.mv,
                                del = selection.del;
                            if (del)
                                del(selection);
                        });
                        break;
                    }
                    break;
                
                case 'keypress':
                    switch (String.fromCharCode(event.charCode)) {
                    case 'c':
                        curDoc.selectedItems.forEach(function(selection) {
                            var mv = selection.mv,
                                vm = mv.vm,
                                props = vm.props,
                                type = props.type,
                                isLine = (type === 'lin'),
                                points = isLine && props.points,
                                handles = isLine && props.handles,
                                currIndex, prevIndex, nextIndex,
                                prevCtrlIndex, nextCtrlIndex,
                                ctrlPrev, ctrlNext,
                                prevPoint, currPoint, nextPoint;
                            
                            if (selection.source !== 'points')
                                return;

                            currIndex = selection.index;
                            
                            // If the path is closed, then
                            // on the first point, the incoming handle
                            // is the last handle
                            if (currIndex === 0 && props.closed) {
                                // First point
                                prevIndex = points.length - 1;
                                prevCtrlIndex = points.length * 2 - 1;
                            } else {
                                prevIndex = currIndex - 1;
                                prevCtrlIndex = currIndex * 2 - 1;
                            }
                            nextIndex = currIndex + 1;
                            nextCtrlIndex = nextIndex * 2 - 2;
                            if (nextIndex >= points.length)
                                nextIndex = 0;
                            prevPoint = points[prevIndex];
                            currPoint = points[currIndex];
                            nextPoint = points[nextIndex];
                            
                            if (prevPoint) {
                                // Point part way toward previous from current
                                ctrlPrev = prevPoint.sub(currPoint)
                                    .scale(0.25).add(currPoint);
                            }
                            
                            if (nextPoint) {
                                // Point part way toward prev from current
                                ctrlNext = nextPoint.sub(currPoint)
                                    .scale(0.25).add(currPoint);
                            }
                            
                            if (prevCtrlIndex >= 0 && ctrlPrev &&
                                    !handles[prevCtrlIndex]) {
                                handles[prevCtrlIndex] = ctrlPrev.copy();
                            }
                            if (nextCtrlIndex < points.length*2 && ctrlNext &&
                                    !handles[nextCtrlIndex]) {
                                handles[nextCtrlIndex] = ctrlNext.copy();
                            }
                            
                            vm.triggerWatch('points');
                        });
                        modeRefresh();
                        break;
                    
                    case 'z':
                        curDoc.selectedItems.forEach(function(selection) {
                            var mv = selection.mv,
                                vm = mv.vm,
                                props = vm.props,
                                type = props.type,
                                isLine = (type === 'lin'),
                                points = isLine && props.points,
                                handles = isLine && props.handles;
                            
                            if (isLine)
                                props.closed = !props.closed;
                        });
                        break;
                    case 'g':
                        
                        break;
                    
                    case 't':
                        curDoc.selectedItems.forEach(function(selection) {
                            var mv = selection.mv,
                                vm = mv.vm,
                                props = vm.props,
                                type = props.type,
                                isLine = (type === 'lin'),
                                points = isLine && props.points,
                                handles = isLine && props.handles,
                                interp;
                            
                            if (isLine) {
                                var n = 40,
                                    s = 1/n,
                                    t,
                                    i,
                                    interp,
                                    d;
                                
                                interp = makeCubicBezierInterp(
                                        points[0], 
                                        handles[0] || points[0],
                                        handles[1] || points[1],
                                        points[1]);
                                for (i = 0; i < n; ++i) {
                                    t = Math.min(1, s * i);
                                    d = interp(t, 2);
                                    console.log(t.toFixed(2), d, d.len());
                                }
                            }
                        });
                        break;
                        
                    }
                }
                if (event.type !== 'mousedown')
                    return true;
                
                var target = event.target;
                
                if (target.classList.contains('sve-node-handle')) {
                    //
                    // User clicked on a node
                    
                    var targetNodeId = +target.getAttribute('data-sve-node-id'),
                        targetWasSelected = false,
                        origPoints,
                        updateQueue = [],
                        targetItem;
                    
                    targetItem = curDoc.nodePoints.find(function(point) {
                        return (point.id === targetNodeId);
                    });
                    
                    targetWasSelected = targetItem.selected;
                    
                    if (!event.ctrlKey && !targetWasSelected) {
                        // Deselect all and select clicked node
                        deselectAllNodes();
                        updateNodeSelection(targetItem, true);
                    } else if (event.ctrlKey) {
                        // Toggle selection
                        updateNodeSelection(targetItem, !targetWasSelected);
                    }

                    origPoints = curDoc.selectedItems.map(function(point) {
                        return toPos(point.point);
                    });
                    
                    beginDocumentDrag(event, function(event, cap) {
                        curDoc.selectedItems.forEach(function(selection, index) {
                            var source = selection.source,
                                point = selection.mv.vm.props[source][selection.index],
                                origPoint = origPoints[index];
                            point.copyfrom(origPoint.add(cap.docDragDist).snap(8));
                            if (selection.update)
                                selection.update(selection);
                            if (updateQueue.indexOf(selection.mv) < 0)
                                updateQueue.push(selection.mv);
                        }, this);
                        updateQueue.forEach(function(mv) {
                            mv.vm.triggerWatch('points');
                        });

                        if (event.type === 'mouseup' && event.which === 1) {
                            curDoc.undoStk.addCommand(new Command_MoveLinePoint({
                                dist: cap.docDragDist.copy(),
                                points: curDoc.selectedItems.map(function(selection, index) {
                                    return {
                                        mv: selection.mv,
                                        index: selection.index,
                                        oldPos: origPoints[index]
                                    };
                                })
                            }));
                            return true;
                        }
                    }, origPoints);
                } else {
                    //
                    // User
                    
                    deselectAllNodes();
                    interactiveDragRectangle(event)
                    .then(function(selectedRect) {
                        var insideRect,
                            path;
                        
                        if (Math.max(selectedRect.size.left, selectedRect.size.top) < 4) {
                            // Find nearest point
                    
                            var objs = curDoc.nodePoints.reduce(function(models, point) {
                                var mv = point.mv,
                                    id = mv.id,
                                    vm = mv.vm,
                                    model = models[id];
                                if (model === undefined)
                                    models[id] = mv;
                                return models;
                            }, Object.create(null));
                            
                            var best = {
                                distance: 32,
                                result: null,
                                mv: null
                            };
                            
                            Object.keys(objs).some(function(key) {
                                var mv = this[key],
                                    vm = mv.vm,
                                    props = vm.props,
                                    type = props.type,
                                    i, e,
                                    points = props.points,
                                    handles = props.handles,
                                    result,
                                    newNode;
                                if (type === 'lin') {
                                    e = points.length;
                                    for (i = 1; i < e; ++i) {
                                        result = closestPointOnCubicBezier(
                                            points[i-1],
                                            handles[i*2-2] || points[i-1],
                                            handles[i*2-1] || points[i],
                                            points[i], 
                                            selectedRect.min);
                                        if (best.distance > result.distance) {
                                            best.distance = result.distance
                                            best.result = result;
                                            best.mv = mv;
                                            best.index = i;
                                        }
                                    }
                                    if (props.closed) {
                                        result = closestPointOnCubicBezier(
                                            points[i-1],
                                            handles[i*2-2] || points[i-1],
                                            handles[i*2-1] || points[0],
                                            points[0], 
                                            selectedRect.min);
                                        if (best.distance > result.distance) {
                                            best.distance = result.distance
                                            best.result = result;
                                            best.mv = mv;
                                            best.index = i;
                                        }
                                    }
                                    
                                    // Insert new node
                                    if (best.result && event.ctrlKey) {
                                        points.splice(best.index, 0,
                                            best.result.closest.snap(8).copy());
                                        handles.splice(best.index*2-1, 0,
                                            undefined, undefined);
                                        vm.triggerWatch('points');
                                        modeRefreshNodeEdit();
                                        return true;
                                    }
                                }
                            }, objs);
                            return;
                        }
                        
                        insideRect = curDoc.nodePoints.filter(function(point) {
                            return (point.point.left >= selectedRect.min.left &&
                                    point.point.top >= selectedRect.min.top &&
                                    point.point.left < selectedRect.max.left &&
                                    point.point.top < selectedRect.max.top);
                        });
                        
                        if (event.shiftKey) {
                            // shift-drag-a-box to append area to selection
                            insideRect.forEach(function(point) {
                                if (!point.selected)
                                    updateNodeSelection(point, true);
                            });
                        } else if (event.ctrlKey) {
                            // ctrl-drag-a-box to deselect within area
                            insideRect.forEach(function(point) {
                                if (point.selected)
                                    updateNodeSelection(point, false);
                            });
                        } else {
                            // Replace selection
                            setNodeSelection(insideRect);
                        }
                    });
                    
                }

                return returnEventFalse(event);
            },
            lin: function(event) {
                if (event.type !== 'mousedown')
                    return returnEventFalse(event);

                createDocItemInteractiveByName(event, 'lin');
                
                return returnEventFalse(event);
            },

            box: function(event) {
                if (event.type !== 'mousedown')
                    return returnEventFalse(event);
                
                createDocItemInteractiveByName(event, 'box');
            },
            cir_entered: function() {
                selectionHandles.remove();
            },
            cir: function(event) {
                if (event.type !== 'mousedown')
                    return returnEventFalse(event);
                
                createDocItemInteractiveByName(event, 'cir');
            },
            sha: function(event) {
                if (event.type !== 'mousedown')
                    return returnEventFalse(event);
                
                createDocItemInteractiveByName(event, 'sha');
            },
            txt_entered: function() {
                curDoc.doc.style.cursor = 'text';
            },
            txt: function(event) {
                var pos,
                    hitTester,
                    mv;

                switch (event.type) {
                case 'mousedown':
                    pos = docPosFromEvent(event);
                    
                    // Holding ctrl key will force creation of new text
                    // Not holding ctrl means click-to-edit-text
                    if (!event.ctrlKey) {
                        // Find txt elements
                        hitTester = makeHitTester(curDoc.docModel, curDoc.doc,
                        function(hitVm, hitProps) {
                            return (hitProps && hitProps.type === 'txt');
                        });
                        
                        // At click point
                        mv = hitTester.testPoint(pos.left, pos.top);
                    }
                    
                    if (mv) {
                        setSelection(mv ? [mv] : []);
                        
                        makeTextEditor(curDoc.scrollChild, mv, {
                            clickPos: pos
                        });
                    } else {
                        createDocItemInteractiveByName(event, 'txt');
                    }
                    
                    break;
                
                default:
                    return returnEventFalse(event);
                }
            },
            txt_leaving: function() {
                curDoc.doc.style.cursor = null;
            },

            img: function(event) {
                return returnEventFalse(event);
            }
        };
        
        modeHandler = modeLookup.sel;

        //var selectIsRoot = selectHasClass('sve-root');
        //var selectIsDocument = selectHasClass('sve-document');
        //var selectIsResizable = selectHasClass('sve-resizable');
        //var selectIsScrollchild = selectHasClass('sve-scrollchild');
        //var selectIsResizer = selectHasClass('sve-resizer');
        //var selectIsWindowDragHandle = selectHasClass('sve-window-drag-handle');
        //var selectIsWindowCloseButton = selectHasClass('sve-doc-close');
        //var selectIsWindowButton = selectHasClass('sve-doc-button');
        //var selectIsWindowMaxButton = selectHasClass('sve-doc-max');
        //var selectIsSelectionHandle = selectHasClass('sve-selection-handle');
        //var selectIsToolbox = selectHasClass('sve-toolbox');
        //var selectIsToolbar = selectHasClass('sve-toolbar');
        //var selectIsPropbox = selectHasClass('sve-propbox');
        //var selectIsPropGroup = selectHasClass('sve-prop-group');
        //var selectIsPropGroupItem = selectHasClass('sve-prop-group-item');
        //var selectIsWindowDragParent = selectHasClass('sve-window-drag-parent');
        //var selectIsToolbarButton = selectHasClass('sve-toolbar-button');
        //var selectIsToolboxItem = selectHasClass('sve-toolbox-item');
        //var selectIsDrawing = selectHasClass('sve-svg');
        
        var selectIs = {
            Root: selectHasClass('sve-root'),
            Document: selectHasClass('sve-document'),
            Resizable: selectHasClass('sve-resizable'),
            Scrollchild: selectHasClass('sve-scrollchild'),
            Resizer: selectHasClass('sve-resizer'),
            WindowDragHandle: selectHasClass('sve-window-drag-handle'),
            WindowCloseButton: selectHasClass('sve-doc-close'),
            WindowButton: selectHasClass('sve-doc-button'),
            WindowMaxButton: selectHasClass('sve-doc-max'),
            SelectionHandle: selectHasClass('sve-selection-handle'),
            Toolbox: selectHasClass('sve-toolbox'),
            Toolbar: selectHasClass('sve-toolbar'),
            Propbox: selectHasClass('sve-propbox'),
            PropGroup: selectHasClass('sve-prop-group'),
            PropGroupItem: selectHasClass('sve-prop-group-item'),
            WindowDragParent: selectHasClass('sve-window-drag-parent'),
            ToolbarButton: selectHasClass('sve-toolbar-button'),
            ToolboxItem: selectHasClass('sve-toolbox-item'),
            Drawing: selectHasClass('sve-svg')
        };
        
        // Initial empty document
        createDocument();

        // ============================================================================
        // Editor functions
        
        function fixupText(spanText) {
            return spanText ? spanText.replace(/ /g, '\xa0') : '\u200B';
        }
        
        function makeSVGPoint(element, x, y) {
            var point = element.nearestViewportElement.createSVGPoint();
            point.x = x;
            point.y = y;
            return point;
        }
        
        function setupPropertyHandling(propertyTypes) {
            var propChild = propbox.querySelector('.sve-propbox-scrollchild'),
                parent = document.createDocumentFragment();
            Object.keys(propertyTypes).forEach(function(key) {
                var info = this[key],
                    element,
                    container,
                    input,
                    span,
                    text;
                
                if (info.select) {
                    element = createElementWithAttr('label', {
                        'class': 'sve-propbox-label'
                    });
                    span = createElementWithAttr('span', {
                        'class': 'sve-propbox-labeltext'
                    });
                    text = document.createTextNode(key);
                    input = createElementWithAttr('select', {
                        'class': 'sve-propbox-input',
                        type: info.input,
                        name: key
                    });
                    info.select.forEach(function(value) {
                        var option = createElementWithAttr('option');
                        option.value = value;
                        setElementText(option, value);
                        this.appendChild(option);
                    }, input);
                    span.appendChild(text);
                    element.appendChild(span);
                    element.appendChild(input);
                } else if (info.input) {
                    element = createElementWithAttr('label', {
                        'class': 'sve-propbox-label'
                    });
                    span = createElementWithAttr('span', {
                        'class': 'sve-propbox-labeltext'
                    });
                    text = document.createTextNode(key);
                    input = createElementWithAttr('input', {
                        'class': 'sve-propbox-input',
                        type: info.input,
                        name: key
                    });
                    span.appendChild(text);
                    element.appendChild(span);
                    element.appendChild(input);
                }
                
                if (element) {
                    container = createElementWithAttr('div', {
                        'class': 'sve-propbox-item'
                    });
                    container.appendChild(element);
                    parent.appendChild(container);
                }
            }, propertyTypes);
            propChild.appendChild(parent);
            
            addEventListeners(propChild, 'click input change', function(event) {
                var target = event.target,
                    name = target.getAttribute('name'),
                    value = target.value;
                console.log(name, 'event=', event.type, name);
                curDoc.selectedItems.forEach(function(selection) {
                    var vm = selection.vm,
                        props = vm.props;

                    if (Object.prototype.hasOwnProperty.call(props, name)) {
                        if (typeof props[name] === 'number')
                            value = Number(value);
                        props[name] = value;
                    } else {
                        console.log('prop', name, 'skipped in', Object.getOwnPropertyNames(props));
                    }
                });
            });
        }
        
        function strSplice(str, start, length, replacement) {
            if (typeof str !== 'string')
                throw new TypeError('strSplice str parameter must be string');
            if (typeof start !== 'number')
                throw new TypeError('strSplice start parameter must be number');
            if (length === undefined)
                length = str.length - start;
            if (replacement === undefined)
                replacement = '';
            
            return str.substr(0, start) + 
                replacement +
                str.substr(start + length);
        }
        
        function getElementBBox(element) {
            var bdr = getBoundingDocumentRect(element);
            return {
                x: bdr.left,
                y: bdr.top,
                width: bdr.width,
                height: bdr.height
            };
            var fvp = element.farthestViewportElement,
                mat = element.getScreenCTM().inverse(),
                bcr = element.getBoundingClientRect(),
                fcr = fvp.getBoundingClientRect(),
                bcs = fvp.createSVGPoint(bcr.left, bcr.top),
                bce = fvp.createSVGPoint(bcr.right, bcr.bottom),
                ts = bcs.matrixTransform(mat),
                te = bcs.matrixTransform(mat);
            return {
                x: ts.x - fcr.left,
                y: ts.y - fcr.top,
                width: te.x - fcr.left - ts.x,
                height: te.y - fcr.left - ts.y
            };
        }

        function makeTextEditor(parent, mv, initOptions) {
            var vm = mv.vm,
                props = vm.props,
                text = props.text,
                caret = new FlashingCaret(),
                padding = 8,
                modal = createElementWithAttr('div', {
                        'class': 'sve-texteditor', 
                        tabindex: '1',
                        style: {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 0,
                            height: 0
                        }
                    });
            
            var currentSpan = 0,
                currentCol = 0,
                selSpan,
                selCol;
            
            addEventListeners(modal, 
                'focus blur keydown keyup keypress'+
                ' mousedown dblclick contextmenu', eventHandler);

            parent.appendChild(modal);

            if (initOptions) {
                if (initOptions.clickPos) {
                    var rowcol = clickPosToRowCol(initOptions.clickPos);
                    currentSpan = rowcol.row;
                    currentCol = rowcol.col;
                }
            }

            modal.focus();

            function clickPosToRowCol(pos) {
                var svgCoord = mv.element.nearestViewportElement.createSVGPoint(),
                    props = mv.vm.props,
                    spanElements = mv.spanElements,
                    ofs,
                    ts,
                    bestClamped,
                    pass;
                svgCoord.x = pos.left - props.x;
                svgCoord.y = pos.top - props.y;
                for (pass = 0; pass < 2; ++pass) {
                    ofs = mv.element.getCharNumAtPosition(svgCoord);
                    if (ofs >= 0)
                        return characterOffsetToRowCol(ofs);
    
                    ts = toPos(pos.left - props.x, pos.top - props.y);
                    
                    if (pass === 1)
                        break;
                    
                    // Clamp the point to each spans bounding box, and find
                    // the one that required the least change to the click
                    // Retry with the point clamped
                    bestClamped = spanElements.reduce(clampReduce,
                        { element: undefined, dist: Infinity, place: null });
                    
                    if (!bestClamped.place)
                        break;
                    
                    svgCoord.x = bestClamped.place.left;
                    svgCoord.y = bestClamped.place.top;
                    
                    // And retry...
                }
                
                function clampReduce(best, spanElement, row) {
                    var bbox = getElementBBox(spanElement),
                        clamped,
                        clampedVec,
                        clampedDist;

                    console.log(bbox.x, bbox.y, bbox.width, bbox.height);

                    clamped = toPos(
                        Math.min(bbox.x + bbox.width - 1,
                        Math.max(bbox.x, ts.left)),
                        Math.min(bbox.y + bbox.height - 1,
                        Math.max(bbox.y, ts.top)));

                    clampedVec = clamped.sub(ts);

                    clampedDist = clampedVec.lenSq();
                    if (best.dist > clampedDist) {
                        best.element = spanElement;
                        best.dist = clampedDist;
                        best.place = clamped;
                    }

                    return best;
                }
            }
            
            function characterOffsetToRowCol(ofs) {
                var row = 0;
                while (row < text.length && ofs >= text[row].length)
                    ofs -= text[row++].length;
                return { row: row, col: ofs };
            }
            
            function eventHandler(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                text = props.text;
                
                var press,
                    handled,
                    temp, temp2,
                    targetSpan,
                    cursorPos,
                    verticalOfs,
                    bound,
                    pos,
                    rowcol;
                    
                switch (event.type) {
                case 'contextmenu':
                    event.preventDefault();
                    return;
                    
                case 'mousedown':
                    event.preventDefault();
                    pos = docPosFromEvent(event);
                    rowcol = clickPosToRowCol(pos);
                    if (rowcol) {
                        currentSpan = rowcol.row;
                        currentCol = rowcol.col;
                        updateDisplay();
                    }
                    break;
                    
                case 'focus':
                    selectionHandles.remove();
                    updateDisplay();
                    break;
                    
                case 'blur':
                    console.log('text editor blur');
                    parent.removeChild(modal);
                    modal = undefined;
                    updateSelectionHandles();
                    return;
                
                case 'keyup':
                    break;
                    
                case 'keydown':
                case 'keypress':
                    console.log('text editor ' + event.type + 
                        ' key' + event.keyCode + ' char' + event.charCode);
                    press = (event.type === 'keypress');
                    handled = true;
                    
                    switch (!press && event.which) {
                    case 46:
                        // del
                        if (currentCol >= text[currentSpan].length
                                && currentSpan < text.length - 1) {
                            currentCol = 0;
                            ++currentSpan;
                        } else if (currentCol < text[currentSpan].length) {
                            ++currentCol;
                        } else {
                            break;
                        }
                        // fall thru!
                    case 8:
                        // backspace
                        if (currentCol > 0) {
                            text[currentSpan] = strSplice(text[currentSpan],
                                --currentCol, 1);
                        } else if (currentSpan > 0) {
                            currentCol = text[currentSpan-1].length;
                            text[currentSpan-1] += text.splice(currentSpan, 1);
                            --currentSpan;
                        }
                        break;
                        
                    case 37:
                        // left
                        if (currentCol > 0)
                            --currentCol;
                        else if (currentSpan > 0)
                            currentCol = text[--currentSpan].length;
                        break;

                    case 39:
                        // right
                        if (currentCol < text[currentSpan].length) {
                            ++currentCol;
                        } else if (currentSpan < text.length - 1) {
                            currentCol = 0;
                            ++currentSpan;
                        }
                        break;
                        
                    case 38:
                        // up
                        if (currentSpan > 0)
                            --currentSpan;
                        if (currentCol > text[currentSpan].length)
                            currentCol = text[currentSpan].length;
                        
                        break;
                        
                    case 40:
                        // down
                        if (currentSpan < text.length - 1)
                            ++currentSpan;

                        if (currentCol > text[currentSpan].length)
                            currentCol = text[currentSpan].length;
                        break;
                    
                    case 36:
                        // home
                        if (event.ctrlKey)
                            currentSpan = 0;
                        
                        currentCol = 0;
                        
                        break;
                    
                    case 35:
                        // end
                        if (event.ctrlKey)
                            currentSpan = text.length - 1;
                        
                        currentCol = text[currentSpan].length;
                        
                        break;
                        
                    case 13:
                        // carry text after cursor to new line in temp
                        temp = text[currentSpan].substr(currentCol);
                        text[currentSpan] = text[currentSpan].substr(0, currentCol);
                        // New row
                        text.splice(++currentSpan, 0, temp);
                        currentCol = 0;
                        break;

                    default:
                        if (press && event.charCode) {
                            text[currentSpan] = strSplice(text[currentSpan], 
                                currentCol++, 0, 
                                String.fromCharCode(event.charCode));
                        } else {
                            handled = false;
                        }
                        break;
                    }
                    if (handled) {
                        console.log('preventing default', event);
                        event.preventDefault();
                    }
                    
                    vm.triggerWatch('text');
                    
                    return updateDisplay(event);
                }
                
                function updateDisplay() {
                    var margin = 3,
                        spanElements;
                    
                    setStyles(modal, {
                        left: ((props.minx - margin) * curDoc.zoom) + 'px',
                        top: ((props.miny - margin) * curDoc.zoom) + 'px',
                        width: ((props.width + 2*margin) * curDoc.zoom) + 'px',
                        height: ((props.height + 2*margin) * curDoc.zoom) + 'px'
                    });
                    
                    spanElements = mv.spanElements;
                    
                    if (spanElements && currentSpan < spanElements.length) {
                        targetSpan = spanElements[currentSpan];
                        bound = getBoundingDocumentRect(targetSpan.parentNode);

                        verticalOfs = props.y - bound.top;

                        if (currentCol === 0) {
                            cursorPos = targetSpan.getExtentOfChar(currentCol);
                            cursorPos = {
                                x: cursorPos.x,
                                y: cursorPos.y + verticalOfs,
                                width: 0,
                                height: cursorPos.height
                            };
                        } else {
                            cursorPos = targetSpan.getExtentOfChar(currentCol-1);
                            cursorPos = {
                                x: cursorPos.x + cursorPos.width,
                                y: cursorPos.y + verticalOfs,
                                width: 0,
                                height: cursorPos.height
                            };
                        }
                        
                        caret.place(modal,
                            (cursorPos.x + 1*margin + bound.width/2) * curDoc.zoom,
                            (cursorPos.y + 1*margin) * curDoc.zoom,
                            cursorPos.height * curDoc.zoom);
                    }
                }
            }
        }

        function updateNodeNode(selection) {
            var point = selection.point;
            setAttributes(selection.element, {
               x: point.left - 3,
               y: point.top - 3
            });
            if (selection.related) {
                selection.related.forEach(function(related) {
                    if (related.update)
                        related.update(related);
                });
            }
        }
        
        function updateNodeHandle(selection) {
            var point = selection.point,
                from = selection.from;
            setAttributes(selection.element, {
               cx: point.left,
               cy: point.top
            });
            setAttributes(selection.line, {
                points: from.left + ',' + from.top + 
                    ' ' + point.left + ',' + point.top
            });
        }
        
        function removeNodeNode(selection) {
            var element = selection.element,
                parent = element.parentNode;
            if (parent)
                parent.removeChild(element);
        }
        
        function removeNodeHandle(selection) {
            var element = selection.element,
                line = selection.line;
            parent = element.parentNode;
            if (parent)
                parent.removeChild(element);
            parent = line.parentNode;
            if (parent)
                parent.removeChild(line);
        }
        
        function delNodeHandle(selection) {
            var mv = selection.mv,
                vm = mv.vm,
                props = vm.props,
                points = props.points,
                handles = props.handles;
            handles[selection.index] = undefined;
            vm.triggerWatch('points');
            modeRefresh();
        }
        
        function delNodeNode(selection) {
            var mv = selection.mv,
                vm = mv.vm,
                props = vm.props,
                points = props.points,
                handles = props.handles,
                index = selection.index,
                handleIndex = index * 2 - 1;
            points.splice(selection.index, 1);
            if (handleIndex >= 0)
                handles.splice(handleIndex, 2);
            else
                handles.shift();
            vm.triggerWatch('points');
            modeRefresh();
        }
        
        function escHtml(text) {
            return (text
                .replace('&', '&amp;')
                .replace(' ', '&#32;')
                .replace('<', '&lt;')
                .replace('"', '&quot;')
                .replace("'", '&apos;'));
        }
        
        function addSplitterElements(parent, rights, lefts) {
            
        }
        
        function addResizerElements(parent) {
            var names = ['T','R','B','L','TL','TR','BL','BR'],
                template;
            template = createElementWithAttr('div', {
                'class': 'sve-resizer',
                'data-sve-resizer': ''
            });
            names.forEach(function(name, index) {
                var element;
                element = (index+1 !== names.length) &&
                    template.cloneNode(true) ||
                    template;
                element.setAttribute('data-sve-resizer', name);
                parent.insertBefore(element, parent.firstChild);
            });
        }
        
        function createDocument(data) {
            var newDocWindow,
                newDocModel = new Undo.ViewModel(),
                newUndoStk = new Undo.UndoStack(),
                newDoc,
                newDocId = nextDocId++,
                newDocPlace,
                titleElement;
            
            // Setup doc model
            newDocModel.initProperties({
                name: data && data.name || ('Untitled-' + nextUntitled++) + '.svg',
                items: [],
                itemsById: {},
                nextId: 1,
                width: data && data.width || 16384,
                height: data && data.height || 16384
            });
            
            // Setup new window elements
            newDocWindow = docWindowTemplate.cloneNode(true);
            newDocWindow.setAttribute('data-sve-doc-id', newDocId);
            
            // Title text
            titleElement = descendentMatchingFirst(newDocWindow, '.sve-doc-title');
            setElementText(titleElement, newDocModel.props.name);

            newDoc = {
                docWindow: newDocWindow,
                scrollParent: childWithClass(newDocWindow, 'sve-scrollparent'),
                scrollChild: null,// = scrollParent.children('.sve-scrollchild'),
                doc: null,
                mode: 'sel',
                zoom: 1.0,
                snapDist: toPos(8, 8),
                nodePoints: [],
                selectedItems: [],
                docModel: newDocModel,
                undoStk: newUndoStk
            };
            newDoc.scrollChild = childWithClass(newDoc.scrollParent, 'sve-scrollchild');
            newDoc.doc = childWithClass(newDoc.scrollChild, 'sve-svg');

            // Setup initial position
            newDocPlace = nextDocPlace;
            setStyles(newDocWindow, {
                left: (64 + newDocPlace * 24) + 'px',
                top: (64 + newDocPlace * 24) + 'px'
            });
            nextDocPlace = (newDocPlace + 1) & 7;
            
            addResizerElements(newDocWindow);

            newDocWindow.classList.remove('sve-hidden');
            
            // Add a document
            docs.push(newDoc);
            docsById[newDocId] = newDoc;
            
            activateDocument(newDoc);
            
            updateDocumentSize(newDocModel.props.width, newDocModel.props.height);

            newUndoStk.onEvent('canUndo', function(eventName, canUndo, canRedo) {
                if (curDoc === newDoc) {
                    toolbarButtons.undo.disabled = !canUndo;
                    toolbarButtons.redo.disabled = !canRedo;
                }
            });
        }
        
        function activateDocument(newDoc) {
            if (curDoc) {
                curDoc.docWindow.classList.remove('sve-doc-active');
            }
            curDoc = newDoc;
            docContainer.appendChild(curDoc.docWindow);
            curDoc.docWindow.classList.add('sve-doc-active');
            curDoc.undoStk.triggerEvent('canUndo');
            toolboxButtons[curDoc.mode].checked = true;
        }
        
        function closeDocument() {
            var index = docs.indexOf(curDoc),
                removedDocs,
                removedDoc;
                
            removedDocs = docs.splice(index, 1);
            removedDoc = removedDocs[0];
            
            curDoc = undefined;
            root.removeChild(removedDoc.docWindow);
            
            if (docs.length > 0) {
                index = Math.min(index, docs.length-1);
                activateDocument(docs[index]);
            } else {
                createDocument();
            }
        }
        
        function maximizeDocument() {
            var dw = curDoc.docWindow,
                style = dw.style,
                restoredNow = dw.classList.toggle('sve-restored'),
                restoredBefore = !restoredNow,
                rect;
            
            if (restoredBefore) {
                dw.setAttribute('data-sve-restoredpos', [
                    style.left, style.top,
                    style.width, style.height
                ].join(','));
                style.left = '';
                style.top = '';
                style.width = '';
                style.height = '';
            } else {
                rect = dw.getAttribute('data-sve-restoredpos');
                rect = rect && rect.split(',');
                if (rect) {
                    style.left = rect[0];
                    style.top = rect[1];
                    style.width = rect[2];
                    style.height = rect[3];
                }
            }
            
            return curDoc.docWindow.classList.toggle('sve-maximized');
        }

        function interestingAncestors(element, untilSelector) {
            var result = [element];
            while (element && !untilSelector(element)) {
                element = element.parentNode;
                if (element)
                    result.push(element);
            }
            return result;
        }
        
        function setupDocumentResize() {
            var lookup = {
                'T': ['top', 'top',    'height'],
                'B': ['top',  'height'],
                'L': ['left', 'left',   'width'],
                'R': ['left',  'width']
            };
            addEventListeners(root, 'mousedown contextmenu click' +
                    ' keydown keypress', function(event) {
                var isClick = (event.type === 'click'),
                    isMousedown = (event.type === 'mousedown'),
                    isContext = (event.type === 'contextmenu'),
                    isKeypress = (event.type === 'keypress'),
                    keyChar = isKeypress && String.fromCharCode(event.charCode),
                    isEnter = isKeypress && keyChar === '\n',
                    isSpace = isKeypress && keyChar === ' ',
                    isActivate = isClick || isEnter || isSpace,
                    ia = interestingAncestors(event.target, selectIs.Root),
                    closestWindowButton = ia.find(selectIs.WindowButton),
                    closestResizer =  ia.find(selectIs.Resizer),
                    closestWindowHandle = ia.find(selectIs.WindowDragHandle),
                    closestDocument = ia.find(selectIs.Document),
                    closestResizable = ia.find(selectIs.Resizable),
                    closestDrawing = ia.find(selectIs.Drawing),
                    closestRoot =  ia.find(selectIs.Root),
                    closestDragParent = ia.find(selectIs.WindowDragParent),
                    isOrdered = closestDragParent &&
                        closestDragParent.classList.contains('sve-window-ordered'),
                    closestToolbarButton = ia.find(selectIs.ToolbarButton),
                    toolbarButtonName = closestToolbarButton &&
                        closestToolbarButton.name,
                    closestToolboxItem = ia.find(selectIs.ToolboxItem),
                    toolboxButtonInput = closestToolboxItem &&
                        descendentMatchingFirst(closestToolboxItem, 'input'),
                    toolboxButtonValue = toolboxButtonInput &&
                        toolboxButtonInput.getAttribute('value'),
                    closestSelectionHandle = ia.find(selectIs.SelectionHandle),
                    handleName = closestSelectionHandle &&
                        closestSelectionHandle.getAttribute('data-sve-handle'),
                    edges = closestResizer &&
                        closestResizer.getAttribute('data-sve-resizer'),
                    documentId = closestDocument &&
                        closestDocument.getAttribute('data-sve-doc-id'),
                    startRect,
                    newSize;
                
                if (isContext) {
                    event.preventDefault();
                    return;
                }

                if (isMousedown && isOrdered && 
                        docContainer.lastChild !== closestDocument)
                    docContainer.appendChild(closestDocument);

                if (closestDocument &&
                        (!curDoc || closestDocument !== curDoc.docWindow)) {
                    activateDocument(docsById[documentId]);
                }

                // Allow click
                if (isMousedown && closestToolbarButton)
                    return;

                if (isActivate && closestToolbarButton) {
                    switch (toolbarButtonName) {
                    case 'new':
                        createDocument();
                        break;
                        
                    case 'undo':
                        curDoc.undoStk.undo();
                        return returnEventFalse(event);
                    case 'redo':
                        curDoc.undoStk.redo();
                        return returnEventFalse(event);
                    }
                }
                
                // In descending priority
                if (isMousedown && closestResizer && closestResizable) {
                    // Window resize
                    startRect = {
                        left: closestResizable.offsetLeft,
                        top: closestResizable.offsetTop,
                        width: closestResizable.offsetWidth,
                        height: closestResizable.offsetHeight
                    };

                    beginDrag(event, function(event, cap) {
                        cap.cursor = 'drag-grab';

                        newSize = {};
                        Array.prototype.forEach.call(edges, function(edge) {
                            var edgeInfo = lookup[edge],
                                source = edgeInfo[0],
                                adj1 = edgeInfo[1],
                                adj2 = edgeInfo[2],
                                dist = cap.dragDist[source];
    
                            newSize[adj1] = startRect[adj1] + dist;
                            
                            if (adj2)
                                newSize[adj2] = startRect[adj2] - dist;
                        });
                        
                        Object.keys(newSize).forEach(function(key) {
                            var value = this[key] + 'px';
                            closestResizable.style[key] = value;
                        }, newSize);
                        
                        if (event.type === 'mouseup')
                            return true;
                    });
                    return returnEventFalse(event);
                }
                
                if (isMousedown && closestWindowHandle) {
                    // Window drag
                    startRect = {
                        left: closestDragParent.offsetLeft,
                        top: closestDragParent.offsetTop,
                        width: closestDragParent.offsetWidth,
                        height: closestDragParent.offsetHeight
                    };
                    
                    beginDrag(event, function(event, cap) {
                        setStyles(closestDragParent, {
                            left: (startRect.left + cap.dragDist.left) + 'px',
                            top: (startRect.top + cap.dragDist.top) + 'px'
                        });
                        
                        if (event.type === 'mouseup')
                            return true;
                    });
                    
                    return returnEventFalse(event);
                }

                // Allow click
                if (isMousedown && toolboxButtonValue)
                    return;
                
                if (isActivate && toolboxButtonValue) {
                    changeMode(toolboxButtonValue, true);
                    return; // allow it
                }
                
                if (isMousedown && closestWindowButton)
                    return;
                
                if (isActivate && closestWindowButton) {
                    if (selectIs.WindowCloseButton(closestWindowButton)) {
                        closeDocument();
                    } else if (isClick &&
                        selectIs.WindowMaxButton(closestWindowButton)) {
                        maximizeDocument();
                    }
                }
                
                //if (closestDrawing) {
                    if (handleName && isMousedown) {
                        var modifierStates = curDoc.selectedItems.map(function(selection) {
                            var type = selection.vm.props.type,
                                modifierHandleLookup = resolveMode(modifierLookup, type),
                                dragFactory = modifierHandleLookup[handleName],
                                dragHandler = dragFactory(selection);
                            
                            return {
                                dm: selection,
                                dragHandler: dragHandler
                            };
                        });
                        
                        var commandGroup = new Undo.CompoundCommand(),
                            commands;
                        
                        beginDocumentDrag(event, function(event, cap) {
                            commands = modifierStates.map(function(state) {
                                return state.dragHandler.call(state.dm, event, cap);
                            });
                            
                            updateSelectionHandles();
                            
                            if (event.type === 'mouseup') {
                                commandGroup.addCommands(commands);
                                return true;
                            }
                        });
                        
                        return returnEventFalse(event);
                    } else if (event.type === 'mousedown' && !closestDrawing) {
                        // Let scrollbar mouse events through
                        return;
                    } else if (typeof modeHandler === 'function') {
                        modeHandler.apply(this, Array.prototype.slice.call(arguments));
                    }
                //}
            }, false);
        }

        function changeMode(value, addModeCommand) {
            var handler;
            if (Object.prototype.hasOwnProperty.call(
                    modeLookup, curDoc.mode + '_leaving')) {
                handler = modeLookup[curDoc.mode + '_leaving'];
                if (handler(curDoc.mode) === false)
                    return false;
            }

            if (addModeCommand)
                curDoc.undoStk.addCommand(new Command_ModeChange(value, curDoc.mode));

            curDoc.mode = value;
            modeHandler = resolveMode(modeLookup, curDoc.mode);

            if (Object.prototype.hasOwnProperty.call(modeLookup, value + '_entered')) {
                handler = modeLookup[value + '_entered'];
                handler(curDoc.mode);
            }
        }
        
        function modeRefresh() {
            if (curDoc.mode === 'nod')
                modeRefreshNodeEdit();
            else
                updateSelectionHandles();
        }
        
        function modeRefreshNodeEdit() {
            modeLeaveNodeEdit();
            modeEnterNodeEdit();
        }

        function modeEnterNodeEdit() {
            curDoc.selectedItems.splice(0, curDoc.selectedItems.length);
            var items = curDoc.docModel.props.items.slice();

            console.assert(curDoc.nodePoints.length === 0);
            items.reduce(function(nodePoints, item) {
                var props = item.vm.props,
                    type = props && props.type,
                    typeData = type && typeRegistry[type],
                    nodeHandler = typeData && typeData.updateNodes;
                
                if (nodeHandler)
                    nodeHandler(item, nodePoints, props);
                
                return nodePoints;
            }, curDoc.nodePoints);
        }
        
        function modeLeaveNodeEdit() {
            deselectAllNodes();
            removeAllNodes().forEach(function(vm) {
                this.push(vm);
            }, curDoc.selectedItems);
        }

        function setNodeSelection(newSelection) {
            var oldSelection = curDoc.selectedItems.slice();
            
            oldSelection.reduceRight(function(unused, point, index) {
                updateNodeSelection(point, false, index);
            }, null);
            newSelection.forEach(function(point) {
                updateNodeSelection(point, true);
            });
        }
        
        function updateNodeSelection(selection, isSelected, indexHint) {
            console.assert(typeof selection.selected === 'boolean');
            console.assert(typeof selection.element === 'object');
            
            selection.selected = isSelected;
            
            setAttributes(selection.element, {
                fill: isSelected ? 'black' : 'white',
                'fill-opacity': isSelected ? '1' : '0.5'
            });
            
            if (isSelected)
                curDoc.selectedItems.push(selection);
            else {
                if (indexHint === undefined)
                    indexHint = curDoc.selectedItems.indexOf(selection);
                curDoc.selectedItems.splice(indexHint, 1);
            }
        }
        
        function closestDistanceFromPath(path, pos, area) {
            var i,
                len,
                ofs,
                step,
                ofsPoint,
                dist,
                bestDist = Infinity,
                bestOffset;
            
            area = getDocumentRect(area);
            
            len = path.getTotalLength();
            
            step = 100 / len;
            
            for (i = 0; i < 100; ++i) {
                ofs = i * step;
                ofsPoint = path.getPointAtLength(ofs);
                ofsPoint = toPos(ofsPoint.x, ofsPoint.y);
                dist = ofsPoint.left * ofsPoint.left +
                    ofsPoint.top * ofsPoint.top;
                if (bestDist > dist) {
                    bestDist = dist;
                    bestOffset = ofs;
                }
            }
            
            return bestDist;
        }
        
        function modifierSimplePosition(names) {
            return function(selection) {
                var vm = selection.vm,
                    props = vm.props,
                    origins = names.map(function(name, index) {
                        return props[name];
                    });
                return function(event, cap) {
                    names.forEach(function(name, index, names) {
                        var sourceName = (index & 1) ? 'top' : 'left',
                            dist = cap.docDragDist[sourceName],
                            snapDist = curDoc.snapDist;
                        props[name] = Math.floor((this[index] + dist) /
                            snapDist[sourceName]) * snapDist[sourceName];
                    }, origins);
                };
            };
        }
        
        function modifierSimpleEdge(source, names) {
            return function(selection) {
                var props = selection.vm.props,
                    origins = names.map(function(name, index) {
                        return props[name];
                    });
                return function(event, cap) {
                    names.forEach(function(name, index, names) {
                        props[name] = this[index] + cap.docDragDist[source];
                    }, origins);
                };
            };
        }
        
        function interactiveDragRectangle(event) {
            console.assert(event.type === 'mousedown');

            var area = getDocumentRect(),
                pos = docPosFromEvent(event, area),
                stPos = toPos(pos.left, pos.top),
                endPos,
                endSize = toPos(0, 0),
                dragRect = createSvgElementWithAttr('rect', {
                    x: pos.left,
                    y: pos.top,
                    width: 0,
                    height: 0,
                    'stroke-dasharray': '5,2',
                    stroke: 'black',
                    'stroke-width': 1/curDoc.zoom,
                    fill: 'none'
                });
            
            curDoc.doc.appendChild(dragRect);
            
            return beginDrag(event, function(event, cap) {
                var results,
                    rect,
                    sx, sy, dx, dy;
                
                cap.cursor = 'crosshair';

                endPos = docPosFromEvent(event);
                endSize = endPos.sub(pos);
                
                sx = pos.left;
                sy = pos.top;
                dx = endSize.left;
                dy = endSize.top;
                
                if (dx < 0) {
                    sx += dx;
                    dx *= -1;
                    stPos.left = sx;
                    endPos.left = sx + dx;
                    endSize.left = dx;
                }
                if (dy < 0) {
                    sy += dy;
                    dy *= -1;
                    stPos.top = sy;
                    endPos.top = sy + dy;
                    endSize.top = dy;
                }

                setAttributes(dragRect, {
                    x: sx,
                    y: sy,
                    width: dx,
                    height: dy
                });
                
                if (event.type === 'mouseup') {
                    pos.left = sx;
                    pos.top = sy;
                    
                    dragRect.parentNode.removeChild(dragRect);
                    dragRect = undefined;
                    
                    return true;
                }
            }).then(function(cap) {
                return {
                    min: stPos,
                    max: endPos,
                    size: endSize
                };
            });
        }
        
        function updateDocumentSize(width, height) {
            var props = curDoc.docModel.props;
            if (width !== undefined)
                props.width = width;
            if (height !== undefined)
                props.height = height;
            setStyles(curDoc.scrollChild, {
                width: (curDoc.zoom*props.width) + 'px',
                height: (curDoc.zoom*props.height) + 'px'
            });
            setStyles(curDoc.doc, {
                width: (curDoc.zoom*props.width) + 'px',
                height: (curDoc.zoom*props.height) + 'px'
            });

            if (width !== undefined || height !== undefined)
                curDoc.doc.setAttribute('viewBox',
                    '0 0 ' + props.width +
                    ' ' + props.height);
            
            setAttributes(curDoc.doc.querySelector('.sve-gridelement'), {
                width: props.width,
                height: props.height
            });
            
            if (selectionHandles)
                updateSelectionHandles();
        }
        
        function scrollDocumentToPixel(pos) {
            curDoc.scrollParent.scrollLeft = pos.left;
            curDoc.scrollParent.scrollTop = pos.top;
        }
        
        function updateSelectionHandles() {
            var rect = boundFromSelection(curDoc.selectedItems);

            if (rect) {
                selectionHandles.reposition(rect.min, rect.max.sub(rect.min), {
                    scale: 1/curDoc.zoom
                });
                selectionHandles.appendTo(curDoc.doc);
            } else {
                selectionHandles.remove();
            }
        }
        
        function deselectAllNodes() {
            curDoc.selectedItems.reduceRight(function(unused, point, index) {
                updateNodeSelection(point, false, index);
            }, null);
        }
        
        function removeAllNodes() {
            var items;
            items = curDoc.nodePoints.splice(0, curDoc.nodePoints.length)
            .reduce(function(unique, point) {
                var element = point.element,
                    remover = point.remover;
                if (remover)
                    remover(point);
                if (unique.indexOf(point.mv) < 0)
                    unique.push(point.mv);
                return unique;
            }, []);
            return items;
        }
        
        function setSelection(selection, rounded) {
            curDoc.selectedItems = selection.slice();
            updateSelectionHandles();
        }
        
        function selectionChanged() {
            var lastValue = Object.create(null),
                multipleValues = Object.create(null);
            curDoc.selectedItems.forEach(function(selection) {
                var vm = selection.vm,
                    props = vm.props;
                
                Object.keys(props).forEach(function(key) {
                    var value = this[key],
                        seen = Object.prototype.hasOwnProperty.call(lastValue, key),
                        last = seen && lastValue[key];
                    if (seen && value !== last)
                        multipleValues[key] = true;
                }, props);
            });
        }
        
        function getBoundingDocumentRect(element, area) {
            var rect;
            
            if (!area)
                area = getDocumentRect();
            
            rect = element.getBoundingClientRect();
            
            rect = {
                left: (rect.left - area.left) / curDoc.zoom,
                top: (rect.top - area.top) / curDoc.zoom,
                right: (rect.right - area.left) / curDoc.zoom,
                bottom: (rect.bottom - area.top) / curDoc.zoom,
                width: 0,
                height: 0
            };
            
            rect.width = rect.right - rect.left;
            rect.height = rect.bottom - rect.top;
            
            return rect;
        }
        
        function boundFromSelection(selection, area) {
            var minBound = toPos(500000, 500000),
                maxBound = toPos(-500000, -500000);
            
            if (!area)
                area = getDocumentRect();
            selection.forEach(function(mv) {
                var rect = getBoundingDocumentRect(mv.element, area);
                
                if (minBound.left > rect.left)
                    minBound.left = rect.left;
                if (minBound.top > rect.top)
                    minBound.top = rect.top;
                if (maxBound.left < rect.right)
                    maxBound.left = rect.right;
                if (maxBound.top < rect.bottom)
                    maxBound.top = rect.bottom;
            });
            
            return selection.length ? {
                min: minBound,
                max: maxBound
            } : undefined;
        }
        
        function selectNone() {
            selectionHandles.remove();
        }
        
        function resolveMode(modeTable, name) {
            var value;
            while ('string' === typeof (value = modeTable[name]))
                name = value;
            return value;
        }
        
        function viewModelFromElem(elem) {
            var docElem = elem.closest('[data-sve-id]'),
                id = docElem.setAttribute('data-sve-id'),
                props = curDoc.docModel.props,
                dm = id && props.itemsById[id];
            return dm;
        }
        
        function createDocItemElement(pos) {
            return createSvgElementWithAttr('g', {
                transform: 'translate(' + pos.left + ',' + pos.top + ')',
                'class': 'sve-doc-elem'
            });
        }
        
        function createDocItemInteractiveByName(event, name) {
            var config = typeRegistry[name];
            return createDocItemInteractive(event, config);
        }

        function createDocItemInteractive(event, config) {
            var pos = docPosFromEvent(event),
                g = createDocItemElement(pos),
                vm = new Undo.ViewModel(),
                dm;
            
            selectNone();

            dm = createNewDocModelItem(vm, g);
            
            // Run element constructors
            Object.keys(config.elements).forEach(function(elementName) {
                var factory = this[elementName],
                    element = factory.call(dm);
                g.appendChild(element);
                dm[elementName] = element;
            }, config.elements);

            vm.initProperty('type', config.type);
            
            // Initialize properties
            Object.keys(config.initProperties).forEach(function(name) {
                var value = this[name],
                    cloneValue = clone(value);
                if (Object.prototype.hasOwnProperty.call(vm.props, name)) {
                    vm.props[name] = cloneValue;
                } else {
                    vm.initProperty(name, cloneValue);
                }
            }, config.initProperties);
            
            // Create watches
            Object.keys(config.watchProperties).forEach(function(names) {
                var handler = this[names];
                vm.watchProperties(names, handler, dm);
            }, config.watchProperties);
            
            if (config.initPosition) {
                config.initPosition.split(',').forEach(function(name, index) {
                    var axis = ((index & 1) ? 'top' : 'left');
                    vm.props[name] = pos[axis];
                });
            }
    
            // Create attribute bindings
            Object.keys(config.attrBinds || {}).forEach(function(propName) {
                var propData = this[propName],
                    attrName = propData.attr || propName,
                    elementName = propData.element || 'element',
                    seemsValid = Object.prototype.hasOwnProperty.call(dm, elementName),
                    element = seemsValid && dm[elementName];
                console.assert(element);
                if (element)
                    bindPropToAttr(element, vm, attrName, propName);
            }, config.attrBinds);

            // Append to document after ready            
            Object.keys(config.elements).forEach(function(elementName) {
                g.appendChild(dm[elementName]);
            });

            return beginDocumentDrag(event, 
                    config.createDrag, dm,
                    config.createDragOptions).then(function(cap) {
                curDoc.undoStk.addCommand(new Command_CreateDocItemInteractive(dm));
                setSelection([dm]);

                if (config.createDragDone)
                    config.createDragDone.call(dm, cap);

                return dm;
            });
        }
        
        function Command_CreateDocItemInteractive(dm) {
            this.dm = dm;
        }
        Command_CreateDocItemInteractive.prototype = {
            undo: function() {
                var dm = this.dm,
                    items = curDoc.docModel.props.items,
                    itemsById = curDoc.docModel.props.itemsById;
                dm.g.parentNode.removeChild(dm.g);
                console.assert(items[items.length-1] === dm);
                items.pop();
                delete itemsById[dm.id];
                curDoc.docModel.triggerWatch('items');
                modeRefresh();
            },
            redo: function() {
                var dm = this.dm,
                    items = curDoc.docModel.props.items,
                    itemsById = curDoc.docModel.props.itemsById;
                curDoc.doc.appendChild(dm.g);
                items.push(dm);
                itemsById[dm.id] = dm;
                curDoc.docModel.triggerWatch('items');
                modeRefresh();
            }
        };
        
        function Command_MoveLinePoint(data) {
            this.data = data;
        }
        Command_MoveLinePoint.prototype = {
            undo: function() {
                this.moveTo(toPos(0, 0));
            },
            
            redo: function() {
                this.moveTo(this.data.dist);
            },
            
            moveTo: function(dist) {
                var data = this.data,
                    affectedPoints = data.points,
                    affectedObjects;
                
                affectedObjects = affectedPoints.reduce(function(affectedObjects, pointMove) {
                    var mv = pointMove.mv,
                        oldPos = pointMove.oldPos,
                        index = pointMove.index,
                        vm = mv.vm,
                        points = vm.props.points;
                    points[index].copyfrom(oldPos.add(dist));
                    if (affectedObjects.indexOf(vm) < 0)
                        affectedObjects.push(vm);
                    return affectedObjects;
                }, []);
                
                affectedObjects.forEach(function(vm) {
                    vm.triggerWatch('points');
                });
                modeRefresh();
            }
        };
        
        function Command_ModeChange(newMode, oldMode) {
            this.newMode = newMode;
            this.oldMode = oldMode;
        }
        Command_ModeChange.prototype = {
            undo: function() {
                var button = toolboxButtons[this.oldMode];
                button.checked = true;
                changeMode(this.oldMode);
            },
            
            redo: function() {
                var button = toolboxButtons[this.newMode];
                button.checked = true;
                changeMode(this.oldMode);
            }
        };
        
        function createNewDocModelItem(vm, element) {
            var dm = {
                id: curDoc.docModel.props.nextId++,
                g: element,
                vm: vm
            };

            // Add the item to the item array and the item lookup by id
            curDoc.docModel.props.items.push(dm);
            curDoc.docModel.props.itemsById[dm.id] = dm;
            curDoc.docModel.triggerWatch('items');
            
            // Append the element to the editor
            element.setAttribute('data-sve-id', dm.id);
            curDoc.doc.appendChild(element);
            
            console.log('curDoc.docModel:', curDoc.docModel);
            
            return dm;
        }
        
        function beginDocumentDrag(initEvent, callback, thisArg, options) {
            var startDocPos = docPosFromEvent(initEvent),
                tmp,
                endDocPos;
            return beginDrag(initEvent, function(event, cap) {
                tmp = docPosFromEvent(event);
                
                if (tmp)
                    endDocPos = tmp;
                    
                if (options && options.absolute) {
                    cap.docDragStart = toPos(
                        Math.min(startDocPos.left, endDocPos.left),
                        Math.min(startDocPos.top, endDocPos.top));
                    cap.docDragEnd = toPos(
                        Math.max(startDocPos.left, endDocPos.left),
                        Math.max(startDocPos.top, endDocPos.top));
                } else {
                    cap.docDragStart = startDocPos.copy();
                    cap.docDragEnd = endDocPos.copy();
                }
                
                cap.docDragDist = endDocPos.sub(startDocPos);
                
                return callback.call(this, event, cap);
            }, thisArg).then(function(selectedRect) {
                selectedRect.docDragStart = startDocPos;
                selectedRect.docDragEnd = endDocPos;
                selectedRect.docDragDist = endDocPos.sub(startDocPos);
                return selectedRect;
            });
        }

        function getDocumentRect(area) {
            return area || curDoc.doc.getBoundingClientRect();
        }
        
        function docPosFromEvent(event, area) {
            var areaRect = getDocumentRect(area),
                pos;
            pos = toPos((event.pageX - areaRect.left) / curDoc.zoom, 
                (event.pageY - areaRect.top) / curDoc.zoom);
            pos.left = Math.round(pos.left / curDoc.snapDist.left) *
                curDoc.snapDist.left;
            pos.top = Math.round(pos.top / curDoc.snapDist.top) *
                curDoc.snapDist.top;
            return pos;
        }
        
        function docScrollPixel() {
            return toPos(curDoc.scrollParent.scrollLeft,
                curDoc.scrollParent.scrollTop);
        }
        
        function docScrollPos() {
            return docScrollPixel().div(curDoc.zoom);
        }
        
        function makeHitTester(docModel, originElement, filter) {
            var originRect = originElement.getBoundingClientRect(),
                lookup = docModel.props.items.reduceRight(function(lookup, mv, index) {
                    var element = mv.element,
                        rect = getBoundingDocumentRect(element, originRect);
                    if (!filter || filter.call(mv, mv && mv.vm,
                            mv && mv.vm && mv.vm.props)) {
                        lookup.push({
                            mv: mv,
                            left: rect && rect.left || 0,
                            top: rect && rect.top || 0,
                            right: rect && rect.right || 0,
                            bottom: rect && rect.bottom || 0
                        });
                    }
                    return lookup;
                }, []);
            
            return {
                testPoint: function self(x, y, all) {
                    var result = lookup.reduce(function(result, item, index, lookup) {
                        if (item.left <= x &&
                                item.right > x &&
                                item.top <= y &&
                                item.bottom > y) {
                            result.push(item.mv);
                        }
                        return result;
                    }, []);
                    if (!all)
                        result = result[0];
                    return result;
                },
                
                intersectsRect: function(left, top, right, bottom) {
                    return lookup.reduce(function(result, item, index, lookup) {
                        if (!(item.top >= bottom ||
                            item.right <= left ||
                            item.bottom <= top ||
                            item.left >= right))
                            result.hits.push(item);
                        else
                            result.misses.push(item);
                        return result;
                    }, {
                        hits: [],
                        misses: []
                    });
                },
                
                insideRect: function(left, top, right, bottom) {
                    return lookup.reduce(function(result, item, index, lookup) {
                        if (item.top >= top &&
                            item.right <= right &&
                            item.bottom <= bottom &&
                            item.left >= left)
                            result.hits.push(item);
                        else
                            result.misses.push(item);
                        return result;
                    }, {
                        hits: [],
                        misses: []
                    });
                },
                
                _lookup: lookup
            };
        }
    };

    function classList(element, value) {
        var classText,
            classes,
            index;
        if (arguments.length === 1) {
            classText = element.getAttribute('class');
            classes = classText && classText.split(/\s+/) || [];
            return classes;
        }
        element.setAttribute('class', value.join(' '));
    }

    function bindBoolToClass(element, vm, name, className, falseClassName) {
        var classes = classList(element);
        if (Object.prototype.hasOwnProperty.call(vm.props, name))
            vm.props[name] = (classes.indexOf(className)>=0);
        else
            vm.initProperty(name, classes.indexOf(className)>=0);

        vm.watchProperty(name, function(name, value) {
            var classes = classList(element),
                removed = value ? falseClassName : className,
                added = value ? className : falseClassName,
                indexAdded = classes.indexOf(added),
                indexRemoved = classes.indexOf(removed);
            
            if (indexRemoved >= 0)
                classes.splice(indexRemoved, 1);
            
            if (indexAdded < 0)
                classes.push(indexAdded);
            
            classList(element, classes);
        });
    }
    
    function bindPropToAttr(element, vm, attrName, propName) {
        if (propName === undefined)
            propName = attrName;
        
        // If the property did not exist, then make
        // a property with its initial value from the attribute
        if (!Object.prototype.hasOwnProperty.call(vm.props, propName))
            vm.initProperty(propName, element.getAttribute(attrName));

        vm.watchProperty(propName, handler);
        
        return handler;
        
        function handler(propName, value, old) {
            if (value === null || value === undefined)
                element.removeAttribute(attrName);
            else
                element.setAttribute(attrName, value);
        }
    }
    
    function clone(val) {
        if (typeof val === 'object') {
            if (val instanceof Array) {
                val = val.map(function(item) {
                    return clone(item);
                });
            } else {
                val = Object.keys(val).reduce(function(result, key) {
                    result[key] = clone(val[key]);
                    return result;
                }, Object.create(Object.getPrototypeOf(val)));
            }
        }
        
        return val;
    }
    
    function extend() {
        var args = Array.prototype.slice.call(arguments),
            base = args.shift();
        return args.reduce(function(base, arg) {
            return Object.keys(arg).reduce(function(base, key) {
                base[key] = arg[key];
                return base;
            }, base);
        }, base);
    }
    
    function createSelectionHandle(params) {
        return createSvgElementWithAttr('rect', {
            'class': 'sve-selection-handle',
            x: params.x || 0,
            y: params.y || 0,
            rx: params.rx || 0,
            ry: params.ry || 0,
            width: params.width || 7,
            height: params.height || 7,
            stroke: params.stroke || 'black',
            'stroke-opacity': 0.5,
            fill: 'white',
            'fill-opacity': 0.5,
            'stroke-width': params.strokeWidth || 2
        });
    }
    
    function makeSelectionHandleClass() {
        function SelectionHandleElements(start, end, options) {
            var template,
                handleElements;

            if (!options)
                options = this.options;
            
            template = createSelectionHandle({
                width: options.handleW,
                height: options.handleH,
                stroke: 'black',
                strokeWidth: 2
            });
            
            this.handleElements = {
                topleft: template.cloneNode(true),
                topcenter: template.cloneNode(true),
                topright: template.cloneNode(true),
                
                midleft: template.cloneNode(true),
                midcenter: template.cloneNode(true),
                midright: template.cloneNode(true),
                
                bottomleft: template.cloneNode(true),
                bottomcenter: template.cloneNode(true),
                bottomright: template
            };
            
            var vertWords = ['top', 'mid', 'bottom'];
            var horzWords = ['left', 'center', 'right'];
            this.rowNames = vertWords.reduce(function(rowNames, vertName, rowIndex) {
                rowNames[vertName] = horzWords.map(function(horzName, colIndex) {
                    return vertName + horzName;
                });
                return rowNames;
            }, {});
            this.colNames = horzWords.reduce(function(colNames, horzName, rowIndex) {
                colNames[horzName] = vertWords.map(function(vertName, colIndex) {
                    return vertName + horzName;
                });
                return colNames;
            }, {});

            Object.keys(this.handleElements).forEach(function(key) {
                var element = this[key];
                element.setAttribute('data-sve-handle', key);
            }, this.handleElements);
        }
        SelectionHandleElements.prototype = {
            constructor: SelectionHandleElements,
            options: {
                handleW: 7,
                handleH: 7,
                handleM: 4,
                scale: 1
            },
            reposition: function(pos, size, options) {
                var tmp,
                    scale;
                
                if (options) {
                    options = extend({}, this.options, options);
                    scale = options.scale;
                    options.handleW *= scale;
                    options.handleH *= scale;
                    //options.handleM *= scale;
                }
                else {
                    options = this.options;
                    scale = options.scale;
                }
                
                Object.keys(this.handleElements).forEach(function(handleName) {
                    setAttributes(this[handleName], {
                        width: options.handleW,
                        height: options.handleH,
                        'stroke-width': 2 * scale
                    });
                }, this.handleElements);

                // left
                tmp = pos.left + 
                    -options.handleW -
                    options.handleM;
                if (tmp === tmp) {
                    this.colNames.left.forEach(function(handleName) {
                        this[handleName].setAttribute('x', tmp);
                    }, this.handleElements);
                }
        
                // center
                tmp = pos.left + size.left / 2 - 
                    options.handleW / 2;
                if (tmp === tmp) {
                    this.colNames.center.forEach(function(handleName) {
                        this[handleName].setAttribute('x', tmp);
                    }, this.handleElements);
                }
                
                // right
                tmp = pos.left + size.left + options.handleM;
                if (tmp === tmp) {
                    this.colNames.right.forEach(function(handleName) {
                        this[handleName].setAttribute('x', tmp);
                    }, this.handleElements);
                }
                
                // top
                tmp = pos.top + -options.handleH - options.handleM;
                if (tmp === tmp) {
                    this.rowNames.top.forEach(function(handleName) {
                        this[handleName].setAttribute('y', tmp);
                    }, this.handleElements);
                }
                
                // mid
                tmp = pos.top + size.top / 2 - options.handleH / 2;
                if (tmp === tmp) {
                    this.rowNames.mid.forEach(function(handleName) {
                        this[handleName].setAttribute('y', tmp);
                    }, this.handleElements);
                }
                
                // bottom
                tmp = pos.top + size.top + options.handleM;
                if (tmp === tmp) {
                    this.rowNames.bottom.forEach(function(handleName) {
                        this[handleName].setAttribute('y', tmp);
                    }, this.handleElements);
                }
            },
            setRounded: function(rounded, options) {
                if (!options)
                    options = this.options;
                Object.keys(this.handleElements).forEach(function(handleName) {
                    setAttributes(this[handleName], {
                        rx: rounded ? options.handleW : 0,
                        ry: rounded ? options.handleH : 0
                    });
                }, this.handleElements);
            },
            appendTo: function(parent) {
                Object.keys(this.handleElements).forEach(function(handleName) {
                    var element = this[handleName];
                    parent.appendChild(element);
                }, this.handleElements);
            },
            remove: function() {
                Object.keys(this.handleElements).forEach(function(handleName) {
                    var element = this[handleName],
                        parent = element.parentNode;
                    if (parent)
                        parent.removeChild(element);
                }, this.handleElements);
            }
        };
        return SelectionHandleElements;
    }
    
    function setStyles(element, styles) {
        Object.keys(styles).forEach(function(key) {
            var value = this[key],
                style = element.style,
                oldValue = style[key];
            // Avoid changes to avoid reflows
            if (oldValue !== value)
                style[key] = value;
        }, styles);
        return element;
    }

    // Quickly set element text by modifying textnode directly when
    // it is the only element, and efficiently reusing the first
    // text node when one exists, and creating a new one if neccesary.
    function setElementText(element, text) {
        //if ('textContent' in element) {
        //    element.textContent = text;
        //    return element;
        //}
        var parts = text.split(/\r\n|\r|\n/),
            firstChild = element.firstChild,
            lastChild = firstChild && element.lastChild;
        if (parts.length === 1 && lastChild && firstChild === lastChild &&
                firstChild.nodeType === window.Node.TEXT_NODE) {
            // Fast path: directly modify textnode
            if (firstChild.nodeValue !== text)
                firstChild.nodeValue = text;
        } else if (parts.length === 1 && !firstChild) {
            element.appendChild(document.createTextNode(text));
        } else {
            // Remove from end of child nodes
            Array.prototype.reduceRight.call(element.childNodes, function(element, node) {
                element.removeChild(node);
                return element;
            }, element);
            parts.forEach(function(part, index) {
                var br = index !== 0 && document.createElement('br'),
                    text = document.createTextNode(part);
                if (br)
                    this.appendChild(br);
                this.appendChild(text);
            }, element);
        }
        return element;
    }
    
    function setAttributes(element, attr) {
        if (attr) {
            console.assert(typeof element === 'object' && element);
            Object.keys(attr).forEach(function(key) {
                var value = this[key];
                // Avoid attribute changes to avoid reflows
                if (key === 'style' && typeof value === 'object')
                    setStyles(element, value);
                else if (element.getAttribute(key) !== value)
                    element.setAttribute(key, value);
            }, attr);
        }
        return element;
    }
    
    // https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B.C3.A9zier_curves
    function makeCubicBezierInterp(p0, p1, p2, p3) {
        console.assert(p0 instanceof Pos2d);
        console.assert(p1 instanceof Pos2d);
        console.assert(p2 instanceof Pos2d);
        console.assert(p3 instanceof Pos2d);

        var d;
        
        if (p1 === p0 && p3 === p2 ||
                p1.isEqual(p0) && p2.isEqual(p3)) {
            // Simple, straight segment
            d = p3.sub(p0);
            return function(t) {
                return p0.add(d.scale(t));
            };
        } else {
            return function(t, derivative) {
                console.assert(t >= 0 && t <= 1);
                
                var omt = 1 - t,
                    omt2 = omt * omt,
                    omt3 = omt2 * omt,
                    t2 = t * t,
                    t3 = t2 * t;
                
                switch (derivative) {
                default:
                    // Interpolate point on path
                    return (p0.scale(omt3)
                        .add(p1.scale(3 * omt2 * t))
                        .add(p2.scale(3 * omt * t2))
                        .add(p3.scale(t3)));
                
                case 1:
                    return (p1.sub(p0).scale(3 * omt2)
                        .add(p2.sub(p1).scale(6 * omt * t))
                        .add(p3.sub(p2).scale(3 * t2)));
                
                case 2:
                    return (p2.sub(p1.scale(2)).add(p0).scale(6 * omt)
                        .add(p3.sub(p2.scale(2)).add(p1).scale(6 * t)));
                }
            };
        }
    }
    
    function returnEventFalse(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return undefined;
    }
    
    function noop() {
    }

    global.sveApi = api;
}(this));
/* global sveApi */

sveApi.animationFrame(function() {
    sveApi.Editor(document.querySelector('.sve-root'));
});
