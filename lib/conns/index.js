"use strict";

let utils = require("utils");

module.exports = {
  init: function(configs) {
    let step = new configs.AwsSdk.StepFunctions(configs.aws);
    let lambda = new configs.AwsSdk.Lambda(configs.aws);
    let sns = new configs.AwsSdk.SNS(configs.aws);
    let sqs = new configs.AwsSdk.SQS(configs.aws);
    let kinesis = new configs.AwsSdk.Kinesis(configs.aws);
    let ses = new configs.AwsSdk.SES(configs.aws);

    function queueEvents(items) {
      let records = items.map((item) => {
        return {
          Data: utils.LOG.stringify(item),
          PartitionKey: item.timeId
        }
      });

      return kinesis.putRecords({
        Records: records,
        StreamName: configs.kinesis.chronosTasks
      }).promise();
    }

    function deadLetterEvents(records) {
      return kinesis.putRecords({
        Records: records,
        StreamName: configs.kinesis.chronosTasks
      }).promise();
    }

    function StepFunction(payload) {
      return Promise.resolve()
    }

    function Lambda(payload) {
      return Promise.resolve()
    }

    function SNS(payload) {
      return Promise.resolve()
    }

    function SQS(payload) {
      return Promise.resolve()
    }

    function Kinesis(payload) {
      return Promise.resolve()
    }

    function SES(payload) {
      return Promise.resolve()
    }

    return Object.freeze({
      queueEvents: queueEvents,
      deadLetterEvents: deadLetterEvents,

      StepFunction: StepFunction,
      Lambda: Lambda,
      SNS: SNS,
      SQS: SQS,
      Kinesis: Kinesis,
      SES: SES,

    });
  }
}


// END