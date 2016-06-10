;(1&&function(global) {
    "use strict";
    
    // polyfills
    
    if (typeof Array.prototype.findIndex !== 'function') {
        Array.prototype.findIndex = function(predicate, thisArg) {
            if (!this)
                throw new TypeError('Array#find polyfill called with invalid this');
            if (typeof predicate !== 'function')
                throw new TypeError('Array#find requires predicate function');
            
            var length = this.length, i, v;
            for (i = 0; i < length; ++i) {
                v = this[i];
                if (predicate.call(thisArg, v, i, this))
                    return i;
            }
            return -1;
        };
    }
    if (typeof Array.prototype.find !== 'function') {
        Array.prototype.find = function(predicate, thisArg) {
            var index = Array.prototype.findIndex.call(this, predicate, thisArg);
            return index >= 0 && this[index] || undefined;
        };
    }
    
    function classesFromClassName(className) {
        return className && className.split(/\s+/) || [];
    }
    
    function classListRefresh() {
        var element = this._element,
            className = element.getAttribute('class'),
            i,
            classes,
            args;
        
        if (this._className !== className) {
            this._className = className;
            classes = classesFromClassName(className);
            
            args = [0, this.length || 0].concat(classes);
            Array.prototype.splice.apply(this, args);
        }
    }
    
    function ClassListPolyfill(element) {
        this._element = element;
        classListRefresh.call(this);
    }
    ClassListPolyfill.prototype = {};
    ClassListPolyfill.prototype.item = function(i) {
        classListRefresh.call(this);
        return this[+i];
    }
    ClassListPolyfill.prototype.contains = function(name) {
        classListRefresh.call(this);
        var index = Array.prototype.indexOf.call(this, name);
        return index >= 0;
    }
    ClassListPolyfill.prototype.add = function() {
        classListRefresh.call(this);
        Array.prototype.forEach.call(arguments, function(className) {
            var index = Array.prototype.indexOf.call(this, className);
            if (index < 0)
                Array.prototype.push.call(this, className);
        }, this);
        this._className = Array.prototype.join.call(this, ' ');
        this._element.setAttribute('class', this._className);
    };
    ClassListPolyfill.prototype.remove = function() {
        classListRefresh.call(this);
        Array.prototype.forEach.call(arguments, function(className) {
            var index = Array.prototype.indexOf.call(this, className);
            if (index >= 0)
                Array.prototype.splice.call(this, index, 1);
        }, this);
        this._className = Array.prototype.join.call(this, ' ');
        this._element.setAttribute('class', this._className);
    };
    ClassListPolyfill.prototype.toggle = function(className, force) {
        classListRefresh.call(this);
        var existingIndex = Array.prototype.indexOf.call(this, className),
            shouldExist = force !== undefined ? !!force : (existingIndex < 0);
        
        if (existingIndex >= 0 && !shouldExist) {
            Array.prototype.splice.call(this, existingIndex, 1);
        } else if (existingIndex < 0 && shouldExist) {
            Array.prototype.push.call(this, className);
        } else {
            return shouldExist;
        }
        
        this._className = Array.prototype.join.call(this, ' ');
        this._element.setAttribute('class', this._className);
        return shouldExist;
    };
    
    if (!('classList' in SVGElement.prototype)) {
        Object.defineProperty(SVGElement.prototype, 'classList', {
            get: function() {
                return new ClassListPolyfill(this);
            }
        });
    }
}(this));

(function(root) {

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function noop() {}

	// Use polyfill for setImmediate for performance gains
	var asap = (typeof setImmediate === 'function' && setImmediate) ||
		function(fn) { setTimeoutFunc(fn, 1); };

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function() {
			fn.apply(thisArg, arguments);
		}
	}

	var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

	function Promise(fn) {
		if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		this._state = 0;
		this._value = undefined;
		this._deferreds = [];

		doResolve(fn, this)
	}

	function handle(self, deferred) {
		while (self._state === 3) {
			self = self._value;
		}
		if (self._state === 0) {
			self._deferreds.push(deferred);
			return
		}
		asap(function() {
			var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected
			if (cb === null) {
				(self._state === 1 ? resolve : reject)(deferred.promise, self._value);
				return;
			}
			var ret;
			try {
				ret = cb(self._value);
			} catch (e) {
				reject(deferred.promise, e);
				return;
			}
			resolve(deferred.promise, ret);
		})
	}

	function resolve(self, newValue) {
		try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (newValue instanceof Promise) {
					self._state = 3;
					self._value = newValue;
					finale(self);
					return;
				} else if (typeof then === 'function') {
					doResolve(bind(then, newValue), self);
					return;
				}
			}
			self._state = 1;
			self._value = newValue;
			finale(self);
		} catch (e) { reject(self, e); }
	}

	function reject(self, newValue) {
		self._state = 2;
		self._value = newValue;
		finale(self);
	}

	function finale(self) {
		for (var i = 0, len = self._deferreds.length; i < len; i++) {
			handle(self, self._deferreds[i]);
		}
		self._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, promise){
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
		var done = false;
		try {
			fn(function (value) {
				if (done) return;
				done = true;
				resolve(self, value);
			}, function (reason) {
				if (done) return;
				done = true;
				reject(self, reason);
			})
		} catch (ex) {
			if (done) return;
			done = true;
			reject(self, ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
		var prom = new Promise(noop);
		handle(this, new Handler(onFulfilled, onRejected, prom));
		return prom;
	};

	Promise.all = function () {
		var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) return resolve([]);
			var remaining = args.length;
			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) { res(i, val) }, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}
			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for(var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	/**
	 * Set the immediate function to execute callbacks
	 * @param fn {function} Function to execute
	 * @private
	 */
	Promise._setImmediateFn = function _setImmediateFn(fn) {
		asap = fn;
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Promise;
	} else if (!root.Promise) {
		root.Promise = Promise;
	}

})(this);
