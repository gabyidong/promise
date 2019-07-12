const SymbolResolveList = Symbol("SymbolResolveList");
const SymbolRejectList = Symbol("SymbolRejectList");
const SymbolPromiseStatus = Symbol("SymbolPromiseStatus");
const SymbolPromiseValue = Symbol("SymbolPromiseValue");

const FULFillED = "fulfilled";
const PENDING = "pending";
const REJECTED = "rejected";
const toString = Object.prototype.toString;

const nextTick = global && process && typeof process.nextTick === "function" ? process.nextTick : requestAnimationFrame || setImmediate;

function CustomPromise(func) {
  this[SymbolResolveList] = new Set();
  this[SymbolRejectList] = new Set();
  this[SymbolPromiseStatus] = PENDING;
  this[SymbolPromiseValue] = null;

  const that = this;

  function resolve(val) {
    if (that[SymbolPromiseStatus] !== PENDING) {
      return;
    }

    that[SymbolPromiseStatus] = FULFillED;
    that[SymbolPromiseValue] = val;

    for (const item of that[SymbolResolveList]) {
      item(val);
    }
  }

  function reject(val) {
    if (that[SymbolPromiseStatus] !== PENDING) {
      return;
    }

    that[SymbolPromiseStatus] = REJECTED;
    that[SymbolPromiseValue] = val;
    for (const item of that[SymbolRejectList]) {
      item(val);
    }
  }

  if (typeof func === "function") {
    func(resolve, reject);
  }
}

CustomPromise.prototype.then = function(onFulfilled, onRejected) {
  if (typeof onFulfilled != "function") {
    onFulfilled = function(x) {
      return x;
    };
  }

  if (typeof onRejected != "function") {
    onRejected = function(x) {
      return x;
    };
  }

  let promise = null;
  const that = this;
  switch (this[SymbolPromiseStatus]) {
    case FULFillED:
      promise = new CustomPromise(function(success, fail) {
        nextTick(function() {
          try {
            const res = onFulfilled(that[SymbolPromiseValue]);
            resolvePromise(promise, res, success, fail);
          } catch (err) {
            fail(err);
          }
        });
      });
    case REJECTED:
      promise = new CustomPromise(function(success, fail) {
        nextTick(function() {
          try {
            const res = onRejected(that[SymbolPromiseValue]);
            resolvePromise(promise, res, success, fail);
          } catch (err) {
            fail(err);
          }
        });
      });
    case PENDING:
    default:
      promise = new CustomPromise(function(success, fail) {
        that[SymbolResolveList].add(function(val) {
          nextTick(function() {
            try {
              const res = onFulfilled(val);
              resolvePromise(promise, res, success, fail);
            } catch (err) {
              fail(err);
            }
          });
        });
        that[SymbolRejectList].add(function(val) {
          nextTick(function() {
            try {
              const res = onRejected(val);
              resolvePromise(promise, res, success, fail);
            } catch (err) {
              fail(err);
            }
          });
        });
      });
  }
  return promise;
};

CustomPromise.prototype.finally = function(callback) {};

function resolvePromise(promise, val, resolve, reject) {
  if (promise === val) {
    throw TypeError("当前Promise类型不对");
  }

  // 如果结果val为promise
  if (val instanceof CustomPromise) {
    promise[SymbolPromiseStatus] = val[SymbolPromiseStatus];
    switch (val[SymbolPromiseStatus]) {
      case FULFillED:
        resolve(val[SymbolPromiseValue]);
        break;
      case REJECTED:
        reject(val[SymbolPromiseValue]);
        break;
      case PENDING:
      default:
    }
    return;
  } else if (typeof val === "function" || toString.call(val) === "[object Object]") {
    let then = val.then;
    if (typeof then === "function") {
      let isUsed = false;
      try {
        then.call(
          x,
          function(y) {
            if (isUsed) {
              return;
            }
            isUsed = true;
            resolvePromise(promise, y, resolve, reject);
          },
          function(r) {
            if (isUsed) {
              return;
            }
            isUsed = true;
            reject(r);
          }
        );
      } catch (err) {
        if (!isUsed) {
          reject(err);
        }
      }
      return;
    }
  }
  resolve(val);
}

CustomPromise.resolve = function(val) {
  return new CustomPromise(function(resolve) {
    resolve(val);
  });
};

CustomPromise.reject = function(err) {
  return new CustomPromise(function(resolve, reject) {
    reject(err);
  });
};

CustomPromise.all = function([...args]) {
  return new CustomPromise(function(resolve, reject) {
    const success = [];
    const result = [];
    function then(index, type = FULFillED) {
      return function(val) {
        if (type === FULFillED) {
          result[index] = val;
          success.push(val);
          if (success.length === args.length) {
            resolve(result);
          }
        }
        if (type === REJECTED) {
          result[index] = val;
          if (result.length === args.length) {
            reject(result);
          }
        }
      };
    }

    for (let i = 0, len = args.length; i < len; i++) {
      if (args[i] instanceof CustomPromise) {
        args[i].then(then(i, FULFillED), then(i, REJECTED));
      } else {
        results[i] = args[i];
      }
    }
  });
};

module.exports = CustomPromise;
