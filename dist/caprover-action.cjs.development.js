'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@actions/core');
var core__default = _interopDefault(core);
var fetch = _interopDefault(require('node-fetch'));

function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

var CapRover = /*#__PURE__*/function () {
  function CapRover(url, password) {
    this.url = url;
    this.tokenPromise = this.login(password);
  }
  var _proto = CapRover.prototype;
  _proto.login = /*#__PURE__*/function () {
    var _login = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(password) {
      var response, data;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return fetch("http://" + this.url + "/api/v2/login", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "password": password
              })
            });
          case 3:
            response = _context.sent;
            _context.next = 6;
            return response.json();
          case 6:
            data = _context.sent;
            core.setOutput('response', data);
            return _context.abrupt("return", data.token);
          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            core.setFailed("Failed to create application: " + _context.t0.message);
            throw _context.t0;
          case 15:
          case "end":
            return _context.stop();
        }
      }, _callee, this, [[0, 11]]);
    }));
    function login(_x) {
      return _login.apply(this, arguments);
    }
    return login;
  }();
  _proto.getTokenOrError = /*#__PURE__*/function () {
    var _getTokenOrError = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var timeout;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            timeout = new Promise(function (_, reject) {
              return setTimeout(function () {
                return reject(new Error('Timeout waiting for token'));
              }, 2 * 60 * 1000);
            } // 2 minutes
            );
            _context2.next = 3;
            return Promise.race([this.tokenPromise, timeout]);
          case 3:
            return _context2.abrupt("return", _context2.sent);
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2, this);
    }));
    function getTokenOrError() {
      return _getTokenOrError.apply(this, arguments);
    }
    return getTokenOrError;
  }();
  _proto.createApp = /*#__PURE__*/function () {
    var _createApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(appName) {
      var token, response, data;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return this.getTokenOrError();
          case 3:
            token = _context3.sent;
            _context3.next = 6;
            return fetch("http://" + this.url + "/api/v2/user/apps/appDefinitions/register", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-captain-auth': token
              },
              body: JSON.stringify({
                "appName": appName,
                "hasPersistentData": true
              })
            });
          case 6:
            response = _context3.sent;
            _context3.next = 9;
            return response.json();
          case 9:
            data = _context3.sent;
            core.setOutput('response', data);
            _context3.next = 16;
            break;
          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](0);
            core.setFailed("Failed to create application: " + _context3.t0.message);
          case 16:
          case "end":
            return _context3.stop();
        }
      }, _callee3, this, [[0, 13]]);
    }));
    function createApp(_x2) {
      return _createApp.apply(this, arguments);
    }
    return createApp;
  }();
  _proto.deployApp = /*#__PURE__*/function () {
    var _deployApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(appName, imageTag, imageName) {
      var token, response, data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return this.getTokenOrError();
          case 3:
            token = _context4.sent;
            _context4.next = 6;
            return fetch("http://" + this.url + "/api/v2/user/apps/appData/" + appName, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-captain-auth': token
              },
              body: JSON.stringify({
                "schemaVersion": 2,
                "imageName": (imageName || appName) + ":" + imageTag
              })
            });
          case 6:
            response = _context4.sent;
            _context4.next = 9;
            return response.json();
          case 9:
            data = _context4.sent;
            core.setOutput('response', data);
            _context4.next = 16;
            break;
          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            core.setFailed("Failed to deploy application: " + _context4.t0.message);
          case 16:
          case "end":
            return _context4.stop();
        }
      }, _callee4, this, [[0, 13]]);
    }));
    function deployApp(_x3, _x4, _x5) {
      return _deployApp.apply(this, arguments);
    }
    return deployApp;
  }();
  _proto.getApp = /*#__PURE__*/function () {
    var _getApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(appName) {
      var list, app;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return this.getList();
          case 3:
            list = _context5.sent;
            app = list.appDefinitions.find(function (app) {
              return app.appName === appName;
            });
            if (app) {
              _context5.next = 7;
              break;
            }
            throw new Error("App " + appName + " not found.");
          case 7:
            return _context5.abrupt("return", app);
          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](0);
            core.setFailed("Failed to fetch app: " + _context5.t0.message);
          case 13:
            return _context5.abrupt("return", null);
          case 14:
          case "end":
            return _context5.stop();
        }
      }, _callee5, this, [[0, 10]]);
    }));
    function getApp(_x6) {
      return _getApp.apply(this, arguments);
    }
    return getApp;
  }();
  _proto.getList = /*#__PURE__*/function () {
    var _getList = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      var token, response, data;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return this.getTokenOrError();
          case 3:
            token = _context6.sent;
            _context6.next = 6;
            return fetch("http://" + this.url + "/api/v2/user/apps/appDefinitions", {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-captain-auth': token
              }
            });
          case 6:
            response = _context6.sent;
            _context6.next = 9;
            return response.json();
          case 9:
            data = _context6.sent;
            core.setOutput('response', data);
            return _context6.abrupt("return", data);
          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](0);
            core.setFailed("Failed to fetch list: " + _context6.t0.message);
          case 17:
            return _context6.abrupt("return", {
              appDefinitions: []
            });
          case 18:
          case "end":
            return _context6.stop();
        }
      }, _callee6, this, [[0, 14]]);
    }));
    function getList() {
      return _getList.apply(this, arguments);
    }
    return getList;
  }();
  _proto.deleteApp = /*#__PURE__*/function () {
    var _deleteApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(appName) {
      var _app$volumes, token, app, response, data;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return this.getTokenOrError();
          case 3:
            token = _context7.sent;
            _context7.next = 6;
            return this.getApp(appName);
          case 6:
            app = _context7.sent;
            _context7.next = 9;
            return fetch("http://" + this.url + "/api/v2/user/apps/appDefinitions/delete", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-captain-auth': token
              },
              body: JSON.stringify({
                appName: appName,
                volumes: app == null || (_app$volumes = app.volumes) == null ? void 0 : _app$volumes.map(function (v) {
                  return v.volumeName;
                })
              })
            });
          case 9:
            response = _context7.sent;
            _context7.next = 12;
            return response.json();
          case 12:
            data = _context7.sent;
            core.setOutput('response', data);
            _context7.next = 19;
            break;
          case 16:
            _context7.prev = 16;
            _context7.t0 = _context7["catch"](0);
            core.setFailed("Failed to delete application: " + _context7.t0.message);
          case 19:
          case "end":
            return _context7.stop();
        }
      }, _callee7, this, [[0, 16]]);
    }));
    function deleteApp(_x7) {
      return _deleteApp.apply(this, arguments);
    }
    return deleteApp;
  }();
  return CapRover;
}();

function run() {
  return _run.apply(this, arguments);
}
function _run() {
  _run = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var capRoverUrl, password, appName, imageName, imageTag, operation, caprover;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          capRoverUrl = core__default.getInput('caprover_url', {
            required: true
          });
          password = core__default.getInput('caprover_password', {
            required: true
          });
          appName = core__default.getInput('app_name', {
            required: true
          });
          imageName = core__default.getInput('image_name', {
            required: false
          });
          imageTag = core__default.getInput('image_tag', {
            required: true
          });
          operation = core__default.getInput('operation', {
            required: true
          });
          caprover = new CapRover(capRoverUrl, password);
          _context.t0 = operation;
          _context.next = _context.t0 === 'create' ? 11 : _context.t0 === 'deploy' ? 14 : _context.t0 === 'cleanup' ? 17 : 20;
          break;
        case 11:
          _context.next = 13;
          return caprover.createApp(appName);
        case 13:
          return _context.abrupt("break", 21);
        case 14:
          _context.next = 16;
          return caprover.deployApp(appName, imageTag, imageName);
        case 16:
          return _context.abrupt("break", 21);
        case 17:
          _context.next = 19;
          return caprover.deleteApp(appName);
        case 19:
          return _context.abrupt("break", 21);
        case 20:
          core__default.setFailed("Invalid operation: " + operation);
        case 21:
          _context.next = 26;
          break;
        case 23:
          _context.prev = 23;
          _context.t1 = _context["catch"](0);
          core__default.setFailed(_context.t1 == null ? void 0 : _context.t1.message);
        case 26:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 23]]);
  }));
  return _run.apply(this, arguments);
}
run();
//# sourceMappingURL=caprover-action.cjs.development.js.map
