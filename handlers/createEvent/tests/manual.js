"use strict";

/*
  TEMP HACK TEST
*/
let handler = require("../index.js").handler;

handler({
  data: {
    foo: "bar1"
  },
  target: {
    arn: "::states::stateMachine:Example",
    type: "StepFunction"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})

handler({
  data: {
    foo: "bar2"
  },
  target: {
    arn: "nick-test",
    type: "Lambda"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})


handler({
  data: {
    foo: "bar3"
  },
  target: {
    arn: "arn:aws:sns:us-west-2:379633348023:chronos-tasks-sns-test",
    type: "SNS"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})


handler({
  data: {
    foo: "bar4"
  },
  target: {
    arn: "https://sqs.us-west-2.amazonaws.com/379633348023/chronos-tasks-test",
    type: "SQS"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})


handler({
  data: {
    foo: "bar5"
  },
  target: {
    arn: "google.com",
    type: "Https"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})

handler({
  data: {
    foo: "bar6"
  },
  target: {
    arn: "chronos-tasks-deadletter",
    type: "Kinesis"
  },
  triggerDate: Date.now() + 3600000 // 1 hour from now
}, {
  authorizer: {
    principalId: 1234
  }
}, (err, ret) => {
  console.log(err, ret)
})



