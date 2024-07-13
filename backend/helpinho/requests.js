const express = require("express");
const AWS = require("aws-sdk");
const sqs = new AWS.SQS({
  apiVersion: "latest",
  region: process.env.AWS_REGION,
});

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
const CREATE_REQUEST_QUEUE_URL = process.env.CREATE_REQUEST_QUEUE_URL;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const requestsRouter = express.Router();

requestsRouter.get("/", async (req, res) => {
  const { limit, lastKey } = req.query;

  try {
    const params = {
      TableName: REQUESTS_TABLE,
      Limit: limit ? parseInt(limit, 10) : 10,
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(lastKey);
    }

    const command = new ScanCommand(params);
    const { Items, LastEvaluatedKey } = await docClient.send(command);
    if (Items) {
      const items = Items.map((item) =>
        prepareScanResultsArrayForPresentation(item)
      );
      res.json({ items, LastEvaluatedKey });
    } else {
      res.status(404).json({ error: "No requests found" });
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Could not fetch requests" });
  }
});

requestsRouter.get("/user/:userId", async (req, res) => {
  const { limit, lastKey } = req.query;
  const { userId } = req.params;

  try {
    const params = {
      TableName: REQUESTS_TABLE,
      IndexName: "UserIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      Limit: limit ? parseInt(limit, 10) : 10,
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(lastKey);
    }

    const command = new QueryCommand(params);
    const { Items, LastEvaluatedKey } = await docClient.send(command);
    if (Items && Items.length > 0) {
      const items = Items.map((item) =>
        prepareScanResultsArrayForPresentation(item)
      );
      res.json({ items, LastEvaluatedKey });
    } else {
      res.status(404).json({ error: "No requests found for provided userId" });
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Could not fetch requests" });
  }
});

requestsRouter.get("/:requestId", async (req, res) => {
  const { requestId } = req.params;

  const params = {
    TableName: REQUESTS_TABLE,
    Key: {
      requestId: requestId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { title, description, image, goal, userId } = Item;
      res.json({ title, description, image, goal, userId, requestId });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find request with provided "requestId"' });
    }
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Could not fetch request" });
  }
});

requestsRouter.post("/", async (req, res) => {
  const { userId, title, description, image, goal, category } = req.body;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: '"userId" must be a string' });
  }

  const userExists = await checkIfUserExists(userId);
  if (!userExists) {
    return res.status(404).json({ error: "User not found" });
  }

  if (typeof title !== "string") {
    return res.status(400).json({ error: '"title" must be a string' });
  } else if (typeof description !== "string") {
    return res.status(400).json({ error: '"description" must be a string' });
  } else if (typeof image !== "string") {
    return res.status(400).json({ error: '"image" must be a string' });
  } else if (typeof goal !== "number") {
    return res.status(400).json({ error: '"goal" must be a number' });
  } else if (typeof category !== "string") {
    return res.status(400).json({ error: '"category" must be a string' });
  }

  const requestId = uuidv4();

  const params = {
    TableName: REQUESTS_TABLE,
    Item: {
      requestId,
      userId,
      title,
      description,
      image,
      goal,
      category,
      priority: 0,
    },
  };

  try {
    await sqs
      .sendMessage({
        QueueUrl: CREATE_REQUEST_QUEUE_URL,
        MessageBody: JSON.stringify({
          params,
        }),
      })
      .promise();
    return res.status(200).json(requestId);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

async function checkIfUserExists(userId) {
  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
  };

  try {
    const command = new GetCommand(params);
    const result = await docClient.send(command);
    return !!result.Item;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

module.exports = { requestsRouter };
