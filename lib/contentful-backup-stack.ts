import * as cdk from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as dotenv from "dotenv";

dotenv.config();

export class ContentfulBackupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      PREFIX,
      SCHEDULE,
      CONTENTFUL_MANAGEMENT_TOKEN,
      CONTENTFUL_SPACE_ID,
      CONTENTFUL_ENVIRONMENT_ID,
      TIMEOUT_MINUTES,
      MEMORY_SIZE,
    } = process.env;

    // Create the bucket to hold the backups
    const bucket = new Bucket(this, `${PREFIX}-contentful-backup-bucket`, {
      versioned: false,
      bucketName: `${PREFIX}-contentful-backup-bucket`,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create Lambda function
    const contentfulBackupFunction = new NodejsFunction(
      this,
      `${PREFIX}-contentful-backup`,
      {
        entry: "./src/contentful-backup/index.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_18_X,
        bundling: {
          nodeModules: ["contentful-cli"],
        },
        // Pass relevant environment variables
        environment: {
          BUCKET_NAME: `${PREFIX}-contentful-backup-bucket`,
          CONTENTFUL_MANAGEMENT_TOKEN: CONTENTFUL_MANAGEMENT_TOKEN as string,
          CONTENTFUL_SPACE_ID: CONTENTFUL_SPACE_ID as string,
          CONTENTFUL_ENVIRONMENT_ID: CONTENTFUL_ENVIRONMENT_ID as string,
        },
        // This function usually needs a longer timeout than the default
        timeout: cdk.Duration.minutes(parseInt(TIMEOUT_MINUTES as string)),
        memorySize: parseInt(MEMORY_SIZE as string),
      }
    );

    // Allow backup function to write to S3 bucket
    bucket.grantWrite(contentfulBackupFunction);

    // Create rule to invoke Lambda function on a schedule
    const rule = new Rule(this, `${PREFIX}-contentful-backup-rule`, {
      schedule: Schedule.expression(SCHEDULE as string),
    });
    rule.addTarget(new LambdaFunction(contentfulBackupFunction));
  }
}
