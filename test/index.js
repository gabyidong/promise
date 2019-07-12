const assert = require("assert");

describe("Promsie", function() {
  describe("reject回调函数执行一致", function() {
    it("Promise", function(done) {
      // const Promise = require("../index");
      const A = new Promise(function(resolve, reject) {
        reject(`AAA`);
        done();
      });

      A.then(
        m => {
          done("后续resolve不应该执行");
        },
        n => {
          console.log(`reject:${n}`);
        }
      );

      A.then(
        m => {
          done("后续resolve不应该执行");
        },
        n => {
          console.log(n);
        }
      );
    });

    it("CustomPromise", function(done) {
      const Promise = require("../index");
      const A = new Promise(function(resolve, reject) {
        reject(`AAA`);
        done();
      });

      A.then(
        m => {
          console.log(`resovle:${m}`);
        },
        n => {
          console.log(`reject:${n}`);
        }
      );

      A.then(
        m => {
          console.log(123);
        },
        n => {
          console.log(n);
        }
      );
    });
  });

  describe("resove 之后 throw Error 情况下执行顺序一致", function() {
    it("标准promise，在报错then方法的promise对象所拥有的reject回调函数不执行，then方法返回的下一个Promise对象所有reject回调函数执行，再往后的Promise对象执行resovle回调函数", function(done) {
      // const Promise = require("../index");
      const A = new Promise(function(resolve, reject) {
        resolve(`AAA`);
      });

      A.then(
        m => {
          throw Error("BBB");
        },
        n => {
          console.log(`reject:${n}`);
        }
      )
        .then(
          m => {
            done("后续resolve不应该执行");
          },
          n => {
            done();
          }
        )
        .then(
          m => {
            done("后续resolve不应该执行");
          },
          n => {
            done();
          }
        );
    });

    it("CustomPromise", function(done) {
      const Promise = require("../index");
      const A = new Promise(function(resolve, reject) {
        resolve(`AAA`);
      });

      A.then(
        m => {
          throw Error("BBB");
        },
        n => {
          console.log(`reject:${n}`);
        }
      ).then(
        m => {
          done("后续resolve不应该执行");
        },
        n => {
          done();
        }
      );
    });
  });
});
