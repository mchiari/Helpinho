const express = require("express");
const { v4: uuidv4 } = require("uuid");
const {
  DynamoDBClient,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { prepareScanResultsArrayForPresentation } = require("./utils");

const REQUESTS_TABLE = process.env.REQUESTS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
const HELPS_TABLE = process.env.HELPS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const helpsRouter = express.Router();

helpsRouter.get("/:requestId", async (req, res) => {
  const { requestId } = req.params;

  const params = {
    TableName: HELPS_TABLE,
    IndexName: "RequestIndex",
    KeyConditionExpression: "requestId = :requestId",
    ExpressionAttributeValues: {
      ":requestId": { S: requestId },
    },
  };

  const requestExists = await checkIfRequestExists(requestId);
  if (!requestExists) {
    return res.status(404).json({ error: "Request ID not found" });
  }

  try {
    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);
    if (Items) {
      const items = Items.map((item) =>
        prepareScanResultsArrayForPresentation(item)
      );
      res.json(items);
    } else {
      res
        .status(404)
        .json({ error: 'Could not find any helps with provided "requestId"' });
    }
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Could not fetch request" });
  }
});

helpsRouter.post("/", async (req, res) => {
  const { requestId, value, helperId } = req.body;

  if (typeof requestId !== "string") {
    return res.status(400).json({ error: '"requestId" must be a string' });
  }

  const requestExists = await checkIfRequestExists(requestId);
  if (!requestExists) {
    return res.status(404).json({ error: "Help request not found" });
  }

  if (typeof value !== "number") {
    return res.status(400).json({ error: '"value" must be a number' });
  } else if (typeof helperId !== "string") {
    return res.status(400).json({ error: '"helperId" must be a string' });
  }

  const newHelpId = uuidv4();

  const params = {
    TableName: HELPS_TABLE,
    Item: { requestId, value, helperId, helpId: newHelpId },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({
      requestId,
      value,
      helperId,
      helpId: newHelpId,
      message: "Help created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fulfill help" });
  }
});

async function checkIfRequestExists(requestId) {
  const params = {
    TableName: REQUESTS_TABLE,
    Key: { requestId },
  };

  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);
    return !!result.Item;
  } catch (error) {
    console.error("Error checking request existence:", error);
    return false;
  }
}

module.exports = { helpsRouter };
