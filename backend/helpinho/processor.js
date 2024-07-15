const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async function (event, context) {
  for (const message of event.Records) {
    const bodyData = JSON.parse(message.body)
    console.log(bodyData);
    try {
      const command = new PutCommand(bodyData);
      await docClient.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "db updated",
          data: bodyData,
        }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "error update db" }),
      };
    }
  }
};
