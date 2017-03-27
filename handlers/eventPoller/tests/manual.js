"use strict";

/*
  TEMP HACK TEST
*/
let handler = require("../index.js").handler;

handler({}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})
