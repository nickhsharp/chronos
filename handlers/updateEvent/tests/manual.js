"use strict";

/*
  TEMP HACK TEST
*/
let handler = require("../index.js").handler;

handler({
  data: {
    foo: "bar",
    bing: "baz"
  },
  target: "arn:aws:states:us-west-2:379633348023:stateMachine:Test-StepChooser-v5",
  timeBucket: "11b2-1e0b-ebae7fe0",
  timeId: "11e7-131c-8fc20a40-9808-0d492f0f30d6"
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})
