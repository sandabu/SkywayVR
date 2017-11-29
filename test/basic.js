"use strict";

const expect = require("chai").expect;
const assert = require("chai").assert;
const config = require("../config/env.json");

let chai = require("chai");
const chaiHttp =require("chai-http");
chai.use(chaiHttp);
const validUrl = require("valid-url");

let URL = config.url;


describe("config/env.jsonは", () => {
  it("有効なURLが指定されているか", () => {
    assert.isOk(validUrl.isUri(URL), "記述されたURLが無効な形式です。");
  });
});

describe("アプリケーションは", () => {
  it("/ にアクセスした時にステータスコード200を返す", (done) => {
    chai.request(URL)
    .get("/")
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
  });
});
