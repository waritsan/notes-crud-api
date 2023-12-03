'use strict';
import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayProxyCallback } from 'aws-lambda';
// const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)
  };
};

export const createNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayProxyCallback) => {
  let data = JSON.parse(event.body as string);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    }
    await documentClient.put(params).promise();
    cb(null, send(201, data));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

export const updateNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayProxyCallback) => {
  let notesId = event.pathParameters?.id;
  let data = JSON.parse(event.body as string);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body"
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body
      },
      ConditionExpression: "attribute_exists(notesId)"
    };
    await documentClient.update(params).promise();
    cb(null, send(200, data));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

export const deleteNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayProxyCallback) => {
  let notesId = event.pathParameters?.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)"
    };
    await documentClient.delete(params).promise();
    cb(null, send(200, notesId))
  } catch (err) {
    cb(null, send(500, err.message));
  } 
};

export const getAllNotes = async (event: APIGatewayEvent, context: Context, cb: APIGatewayProxyCallback) => {
  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
    };
    const notes = await documentClient.scan(params).promise();
    cb(null, send(200, notes))
  } catch (err) {
    cb(null, send(500, err.message));
  }
};