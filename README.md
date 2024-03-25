# AWS DevOps Learning Project

## Description
* Lambda Function(Typescript) + API Gateway + DynamoDB
* Deployed by CDK + Typescript

```bash
# npm run deploy
```

## Notes
* Find the log group of the Lambda function:
```
# aws lambda list-functions
```

* Following all the logs output from this Lambda function:
```
# aws logs tail --follow <log_group_name>
```

* Find all the running CloudFormation stacks:
```
# aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE
```