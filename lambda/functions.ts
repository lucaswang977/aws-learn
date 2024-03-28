import { Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB()
const tableName = 'MyTable'

export const SaveToDb: Handler = async (event, context) => {
    const pk = event['queryStringParameters']['pk']
    const sk = event['queryStringParameters']['sk']
    const value = event['queryStringParameters']['value']
    if (!pk || !sk || !value) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid request." })
        }
    }

    let result = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Save to DDB!' }),
    }
    ddb.putItem({
        TableName: tableName,
        Item: { pk, sk, value }
    }, (err) => {
        if (err) {
            result = {
                statusCode: 500,
                body: JSON.stringify({ message: err.message })
            }
        }
    })

    return result;
};

export const FetchFromDb: Handler = async (event, context) => {
    const pk = event['queryStringParameters']['pk']
    const sk = event['queryStringParameters']['sk']

    if (!pk || !sk) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid request." })
        }
    }

    let result = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Fetched with empty result.' }),
    }

    ddb.query({
        TableName: tableName,
        KeyConditionExpression: "pk = :a and sk = :t",
        ExpressionAttributeValues: {
            ":a": pk,
            ":t": sk
        }
    }, (err, data) => {
        if (err) {
            result = {
                statusCode: 500,
                body: JSON.stringify({ message: err.message })
            }
        } else {
            if (data.Items && data.Items.length > 0 && data.Items[0]) {
                const value = data.Items[0]['value']
                result = {
                    statusCode: 200,
                    body: JSON.stringify({ message: `Fetched value: ${value}` }),
                }
            }
        }
    })

    return result
};