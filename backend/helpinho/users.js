const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const usersRouter = express.Router();

usersRouter.get("/:userId", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name, password } = Item;
      res.json({ userId, name, password });
    } else {
      res.status(404).json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

usersRouter.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  const userId = uuidv4();

  if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  } else if (typeof email !== "string") {
    res.status(400).json({ error: '"email" must be a string' });
  } else if (typeof password !== "string") {
    res.status(400).json({ error: '"password" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: { userId, name, email, password },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

usersRouter.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  } else if (typeof email !== "string") {
    res.status(400).json({ error: '"email" must be a string' });
  } else if (typeof password !== "string") {
    res.status(400).json({ error: '"password" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: "SET #name = :name, #email = :email, #password = :password",
    ExpressionAttributeNames: {
      "#name": "name",
      "#email": "email",
      "#password": "password",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":email": email,
      ":password": password,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const command = new UpdateCommand(params);
    await docClient.send(command);
    res.json({ id: userId, message: "User updated successfully" }).status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update user" });
  }
});

usersRouter.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);
    res.json({ userId: userId, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete user" });
  }
});

module.exports = { usersRouter };