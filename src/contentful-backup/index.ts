import { APIGatewayEvent, Context } from "aws-lambda";
import { S3 } from "aws-sdk";
import { BucketName, PutObjectRequest } from "aws-sdk/clients/s3";
import { spawn } from "child_process";
import { readdirSync, readFileSync, unlinkSync } from "fs";
import path = require("path");

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<any> => {
  // Path to the Contentful CLI executable
  const executable = path.join(
    process.env.LAMBDA_TASK_ROOT as string,
    "/node_modules/contentful-cli/bin/contentful.js"
  );
  const exportDir = "/tmp";

  // All the arguments to be assembled into a long command
  const exportArgs: string[] = [
    executable,
    "space",
    "export",
    `--management-token=${process.env.CONTENTFUL_MANAGEMENT_TOKEN}`,
    `--environment-id=${process.env.CONTENTFUL_ENVIRONMENT_ID}`,
    `--space-id=${process.env.CONTENTFUL_SPACE_ID}`,
    `--export-dir=${exportDir}`,
  ];

  const promise = new Promise((resolve, reject) => {
    // Spawn a child process and attach listeners
    const child = spawn("node", exportArgs, {
      stdio: "pipe",
    });

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on("data", (data) => {
      console.error(`stdout: ${data}`);
    });
    child.on("error", (error) => {
      console.error(`stdout: ${error.message}`);
    });
    child.on("close", async (code) => {
      // Reject the promise if the child process (Contentful CLI) was not successful
      if (code !== 0) {
        reject(code);
      }

      const s3 = new S3({ apiVersion: "2006-03-01" });

      const files = readdirSync(exportDir);
      console.log(
        `reading files from ${exportDir}, found ${files.length} files.`
      );
      console.log(`found ${files.length} files.`);

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(exportDir, file);
          console.log(`reading file ${filePath}...`);
          const base64data = readFileSync(filePath);

          // Upload backup file
          const putParams: PutObjectRequest = {
            Bucket: process.env.BUCKET_NAME as BucketName,
            Key: file,
            Body: base64data,
          };

          await s3.upload(putParams).promise();

          // Delete local file
          unlinkSync(filePath);
          console.log(`Done with ${file}`);
        })
      );
      resolve(code);
    });
  });

  return promise;
};
