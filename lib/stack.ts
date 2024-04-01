import * as cdk from 'aws-cdk-lib';
import {
  aws_dynamodb as dynamodb,
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  aws_iam as iam,
  StackProps,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';

const createLambdaWithApig = (
  stack: AppStack,
  baseName: string,
  httpMethod: string,
  table: TableV2
) => {
  const lambdaFunction = new lambda.Function(stack, 'Func' + baseName, {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
    handler: 'functions.' + baseName,
  });

  const api = new apigateway.RestApi(stack, 'Api' + baseName, {
    cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY
  });

  const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

  api.root.addMethod(httpMethod, lambdaIntegration);
  table.grantReadWriteData(lambdaFunction)
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "AppBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const table = new dynamodb.TableV2(this, "MyTable", {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    createLambdaWithApig(this, "SaveToDb", "GET", table);
    createLambdaWithApig(this, "FetchFromDb", "GET", table);
  }
}