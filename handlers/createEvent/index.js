"use strict";

const configs = require("../../scripts/configs.json");
configs.AwsSdk = require("aws-sdk");

const utils = require("utils");
const logger = utils.LOG;

const data = require("../../lib/data").init(configs);

module.exports.handler = function(event, context, callback) {
  /*
    @TODO: add in JSON schema validation after picking Schema validation lib
  */
  event.createdBy = utils.DOT.get(context, "$.authorizer.principalId", undefined)

  return data.putTask(event).then((timeId) => {
    callback(null, {
      statusCode: 200,
      body: logger.stringify({
        "timeId": timeId
      })
    });

  }).catch((err) => {
    logger.log("Error in createEvent", err);
    callback({
      statusCode: 500,
      body: logger.stringify({
        "code": 500,
        "message": "error saving task"
      })
    }, null);

  });
}