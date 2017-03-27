"use strict";

/*
  TEMP HACK TEST
*/
let handler = require("../index.js").handler;

handler({
  timeBucket: "11b2-1e0b-ebad4760",
  timeId: "11e7-131b-72461610-bc31-c10a2a61c27e"
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})
