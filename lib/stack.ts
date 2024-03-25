import * as cdk from 'aws-cdk-lib';
import {
  aws_dynamodb as dynamodb,
  aws_s3 as s3,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export interface AppStackProps extends cdk.StackProps {
  readonly bucketName: string;
  readonly tableName: string;
  readonly lambdaName: string;
  readonly apiName: string;
}

export class AppStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, props.bucketName, {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const table = new dynamodb.Table(this, props.tableName, {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    const lambdaFunction = new lambda.Function(this, props.lambdaName, {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      handler: 'functions.handler',
    });
    const api = new apigateway.RestApi(this, props.apiName);
    const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    api.root.addMethod('GET', lambdaIntegration);
  }
}