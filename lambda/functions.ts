import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient()

// TODO: Change to environment with dynamic variable
const tableName = 'arn:aws:dynamodb:us-west-1:919197864738:table/AppStack-MyTable794EDED1-1H0BX04UT5YX0'

export const SaveToDb: Handler<APIGatewayProxyEvent> = async (event) => {
    const params = event.queryStringParameters

    let result = {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request." })
    }
    console.log(params)

    if (params && params['pk'] && params['sk'] && params['value']) {
        const pk = params['pk']
        const sk = params['sk']
        const value = params['value']

        result = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Save to DDB!' }),
        }
        const input: PutItemCommandInput = {
            TableName: tableName,
            Item: {
                'pk': { 'S': pk },
                'sk': { 'S': sk },
                'value': { 'S': value }
            }
        }
        const command = new PutItemCommand(input)
        try {
            const response = await ddb.send(command)
        } catch (err: any) {
            result = {
                statusCode: 500,
                body: JSON.stringify({ message: err.message })
            }
        }
    }
    return result;
};

export const FetchFromDb: Handler<APIGatewayProxyEvent> = async (event) => {
    const params = event.queryStringParameters

    let result = {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request." })
    }

    if (params && params['pk'] && params['sk']) {
        const pk = params['pk']
        const sk = params['sk']

        result = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Fetched with empty result.' }),
        }
        const input: QueryCommandInput = {
            TableName: tableName,
            KeyConditionExpression: "pk = :a and sk = :t",
            ExpressionAttributeValues: {
                ":a": { 'S': pk },
                ":t": { 'S': sk }
            }
        }
        const command = new QueryCommand(input)
        try {
            const response = await ddb.send(command)

            if (response.Items && response.Items.length > 0 && response.Items[0]) {
                const value = response.Items[0]['value']
                result = {
                    statusCode: 200,
                    body: JSON.stringify({ message: `Fetched value: ${value}` }),
                }
            }
        } catch (err: any) {
            if (err) {
                result = {
                    statusCode: 500,
                    body: JSON.stringify({ message: err.message })
                }
            }
        }
    }

    return result
};