"use strict";

/*
  TEMP HACK TEST
*/
let handler = require("../index.js").handler;

handler({
  data: {
    foo: "bar"
  },
  target: "arn:aws:states:us-west-2:379633348023:stateMachine:Test-StepChooser-v5",
  type: "StepFunction",
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})
