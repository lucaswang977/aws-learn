import * as cdk from 'aws-cdk-lib';
import {
  aws_dynamodb as dynamodb,
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  StackProps,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

const createLambdaWithApig = (
  stack: AppStack,
  baseName: string,
  httpMethod: string
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
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "AppBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    console.log(bucket.bucketName);

    const table = new dynamodb.TableV2(this, "MyTable", {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    createLambdaWithApig(this, "SaveToDb", "GET");
    createLambdaWithApig(this, "FetchFromDb", "GET");
  }
}