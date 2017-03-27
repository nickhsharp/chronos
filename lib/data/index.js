"use strict";

const utils = require("utils");
const logger = utils.LOG;

module.exports = {
  init: function(configs) {
    let dynamo = new configs.AwsSdk.DynamoDB(configs.aws);
    let docs = new configs.AwsSdk.DynamoDB.DocumentClient(configs.aws);

    function putTask(params) {
      /*
        params = {
          data: {},
          target: "arn:whatever",
          triggerDate: "unix timestamp",
          type: "StepFunction",
          createdBy: ""
        }
      */

      let timeBucket = utils.UID.v1({
        msecs: Math.floor(params.triggerDate / 1000 / 60) // bucket down to the minute
      });
      params.timeBucket = utils.UID.v1Sortable(timeBucket).substring(0,18);

      let timeId = utils.UID.v1({
        msecs: params.triggerDate
      })
      params.timeId = utils.UID.v1Sortable(timeId);

      params.createdDate = Date.now();

      return docs.put({
        TableName : configs.dynamo.chronosTasks,
        Item: params,
        ReturnConsumedCapacity: "TOTAL"
      }).promise().then((ret) => {
        if(configs.DEBUG) {
          logger.log("putTask", ret);
        }
        return {
          timeBucket: params.timeBucket,
          timeId: params.timeId,
        };
      })
    }

    function deleteTask(params) {
      return docs.delete({
        TableName : configs.dynamo.chronosTasks,
        Key: {
          timeBucket: params.timeBucket,
          timeId: params.timeId,
        },
        ReturnConsumedCapacity: "TOTAL"
      }).promise().then((ret) => {
        if(configs.DEBUG) {
          logger.log("deleteTask", ret);
        }
        return ret;
      });
    }

    function getTask(params) {
      return docs.get({
        TableName : configs.dynamo.chronosTasks,
        Key: {
          timeBucket: params.timeBucket,
          timeId: params.timeId,
        },
        ReturnConsumedCapacity: "TOTAL"
      }).promise().then((ret) => {
        if(configs.DEBUG) {
          logger.log("getTask", ret);
        }
        return ret;
      });
    }

    function updateTask(params) {
      /*
        params = {
          data: {},
          target: "arn:whatever",
          timeId: timeId
        }

        - only allow updating of data, target.
        - if you wanted to update others then call a delete and re-put
      */

      return docs.update({
        TableName: configs.dynamo.chronosTasks,
        Key: { 
          timeBucket: params.timeBucket,
          timeId: params.timeId,
        },
        UpdateExpression: "SET #t = :t, #d = :d",
        ExpressionAttributeNames: {
          "#t" : "target",
          "#d": "data",
        },
        ExpressionAttributeValues: {
          ":t" : params.target,
          ":d" : params.data
        },
        ReturnConsumedCapacity: "TOTAL"
      }).promise().then((ret) => {
        if(configs.DEBUG) {
          logger.log("updatetask", ret);
        }
        return ret;
      });

    }

    function findTasks(params) {
      let timeBucket = utils.UID.v1({
        msecs: Math.floor((Date.now() + 3600000) / 1000 / 60) // bucket down to the minute
      });
      params.timeBucket = utils.UID.v1Sortable(timeBucket).substring(0,18);

      let options = {
        TableName : configs.dynamo.chronosTasks,
        KeyConditionExpression: "timeBucket = :tb",
        ExpressionAttributeValues: {
          ":tb": params.timeBucket
        },
        ReturnConsumedCapacity: "TOTAL",
        Limit: 500,
      }

      if(params.LastEvaluatedKey) {
        options.ExclusiveStartKey = params.LastEvaluatedKey;
      }

      return docs.query(options).promise().then((ret) => {
        if(configs.DEBUG) {
          logger.log("findTasks", ret);
        }
        return ret;
      })
    }


    return Object.freeze({
      putTask: putTask,
      deleteTask: deleteTask,
      getTask: getTask,
      updateTask: updateTask,
      findTasks: findTasks,
    });
  }
}


// END