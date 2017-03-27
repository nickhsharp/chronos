"use strict";

const configs = require("../../scripts/configs.json");
configs.AwsSdk = require("aws-sdk");

const utils = require("utils");
const logger = utils.LOG;

const data = require("../../lib/data").init(configs);
const conns = require("../../lib/conns").init(configs);

function doTasks(params) {
  return data.findTasks(params).then((ret) => {
    return conns.queueEvents(ret.Items).then(() => {
      if(ret.LastEvaluatedKey) {
        return doTasks({
          LastEvaluatedKey: ret.LastEvaluatedKey
        });
      } 
      return;
    });
  })
}

module.exports.handler = function(event, context, callback) {
  doTasks({}).then((ret) => {
    logger.log("Success in eventPoller", ret);
    callback(null, ret);
  }).catch((err) => {
    logger.log("Error in eventPoller", err);
    callback(err, null);
  });
}
