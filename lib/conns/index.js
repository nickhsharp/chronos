"use strict";

const utils = require("utils");
const logger = utils.LOG;
const https = require('https');

module.exports = {
  init: function(configs) {
    const step = new configs.AwsSdk.StepFunctions(configs.aws);
    const lambda = new configs.AwsSdk.Lambda(configs.aws);
    const sns = new configs.AwsSdk.SNS(configs.aws);
    const sqs = new configs.AwsSdk.SQS(configs.aws);
    const kinesis = new configs.AwsSdk.Kinesis(configs.aws);
    const ses = new configs.AwsSdk.SES(configs.aws);

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
        StreamName: configs.kinesis.chronosTasksDeadletter
      }).promise();
    }

    function StepFunction(item) {

      let payload = {
        initial: item.data,
        meta: {
          name: item.timeId,
          arn: item.target.arn,
          stage: item.target.stage,
          version: item.target.version,
          alias: item.target.alias
        }
      }

      return lambda.invoke({
        ClientContext: utils.B64.encode(utils.LOG.stringify({
          "source": "chronos", 
          "timeId": item.timeId,
          "timeBucket": item.timeBucket,
        })),
        FunctionName: "StepStarter", 
        InvocationType: "Event", 
        LogType: "None", 
        Payload: utils.LOG.stringify(payload),
      }).promise();
    }

    function Lambda(item) {
      return lambda.invoke({
        ClientContext: utils.B64.encode(utils.LOG.stringify({
          "source": "chronos", 
          "timeId": item.timeId,
          "timeBucket": item.timeBucket,
        })),
        FunctionName: item.target.arn, 
        InvocationType: "Event", 
        LogType: "None", 
        Payload: utils.LOG.stringify(item.data),
        Qualifier: `${item.target.version}` || item.target.alias || "$LATEST"
      }).promise();
    }

    function SNS(item) {
      return sns.publish({
        Message: utils.LOG.stringify({
          "default": item.data
        }),
        MessageStructure: "json",
        MessageAttributes: {
          timeId: {
            DataType: "String",
            StringValue: item.timeId
          },
          timeBucket: {
            DataType: "String",
            StringValue: item.timeBucket
          }
        },
        TopicArn: item.target.arn
      }).promise();
    }

    function SQS(item) {
      return sqs.sendMessage({
        MessageBody: utils.LOG.stringify(item.data),
        QueueUrl: item.target.arn,
        MessageAttributes: {
          timeId: {
            DataType: "String",
            StringValue: item.timeId
          },
          timeBucket: {
            DataType: "String",
            StringValue: item.timeBucket
          }
        }
      }).promise();
    }

    function Kinesis(item) {
      return kinesis.putRecord({
        Data: utils.LOG.stringify(item.data),
        PartitionKey: item.timeId,
        StreamName: item.target.arn
      }).promise();
    }

    function Https(item) {
      const dfd = new utils.DFD();

      const body = utils.LOG.stringify(item.data);
      const req = https.request({
        hostname: "encrypted.google.com",
        port: 443,
        path: "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      }, (res) => {
        /*
          Conceputally early "hangup".  
          We explicitely don't care about the response;
        */
        dfd.resolve();
      });

      req.on("error", (e) => {
        logger.log("Error on HTTPS POST", e);
        dfd.reject(e);
      });
      req.write(body);
      req.end();

      return dfd.promise;
    }

    return Object.freeze({
      queueEvents: queueEvents,
      deadLetterEvents: deadLetterEvents,

      StepFunction: StepFunction,
      Lambda: Lambda,
      SNS: SNS,
      SQS: SQS,
      Kinesis: Kinesis,
      Https: Https,
    });
  }
}


// END