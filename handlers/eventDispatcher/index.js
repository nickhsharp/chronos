"use strict";

const configs = require("../../scripts/configs.json");
configs.AwsSdk = require("aws-sdk");

const utils = require("utils");
const logger = utils.LOG;

const data = require("../../lib/data").init(configs);
const conns = require("../../lib/conns").init(configs);

module.exports.handler = function(event, context, callback) {
  let failures = [];
  return Promise.all(event.Records.map((record) => {
    const payload = new Buffer(record.kinesis.data, "base64").toString("utf8");
    
    let item;
    try {
      item = JSON.parse(payload);
    } catch(err) {
      item = payload;
    }

    logger.log('Decoded record payload:', item);

    /*
      type: StepFunction | Lambda | SNS | SQS | Kinesis | SES | Https
      Does a best effort send.  In the case of a fail it'll push to a fail queue
    */
    return conns[item.target.type](item).catch((err) => {
      
      failures.push({
        Data: utils.LOG.stringify({
          data: item,
          err: err,
        }),
        PartitionKey: item.timeId
      });

      return;
    })

  })).then(() => {
    if(failures) {
      return conns.deadLetterEvents(failures);
    }
    return;
  }).then(() => {
    logger.log("Success in eventDispatcher");
    callback(null, true);
  }).catch((err) => {
    logger.log("Errors in eventDispatcher", err)
    callback(err, null);
  });
}
