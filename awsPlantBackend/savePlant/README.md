# savePlant lambda (s3 + dynamodb)


## what it does
1) receives plant info + `imageBase64`
2) uploads the image to s3
3) stores plant metadata in dynamodb (with `imageKey`)

> note: google id token verification is currently commented out. the lambda uses `test-user` for now.

## requirements
- aws lambda runtime: node.js 24
- node + npm installed locally (for building the deployment zip)
- aws resources:
  - s3 bucket (private)
  - dynamodb table

## lambda configuration
- runtime: Node.js 24
- memory: 512 MB (recommended)
- timeout: 20 seconds

## environment variables (lambda)
- `BUCKET_NAME` = your s3 bucket name
- `PLANTS_TABLE` = dynamodb table name (default in code: `PlantsRecognition`)
- (later) google client id / aud check if you enable auth

## dynamodb table schema
this code assumes:
- partition key (PK): `userId` (string)
- sort key (SK): `perenualId` (number)


# Deployment Instructions for AWS Lambda with AWS SDK v3
## This lambda uses **AWS SDK v3 packages**, so it **must be deployed as a zip**

## Prepare Folder
Create a folder containing:
- `index.mjs`
open bash on the same folder
  npm init -y
- Install dependencies:
  npm install @aws-sdk/client-s3 @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

## Create Deployment Zip
manually select:
- `index.mjs`
- `package.json`
- `package-lock.json`
- `node_modules/`
Right click → Send to → Compressed (zipped) folder and name it `function.zip`.

## Upload to AWS Lambda
- Select your function → Code source → Upload from → `.zip file`
 -Upload the `function.zip` file.

## Deployment Notes
- Do not store base64 images in DynamoDB; only store the S3 imageKey.
- The bucket must stay private.
- Replace `test-user` with Google sub when authentication is enabled.



stored item example:
```json
{
  "userId": "test-user",
  "perenualId": 2773,
  "scientificName": "Epipremnum pinnatum",
  "commonName": "Pothos",
  "watering": "Average",
  "sunlight": ["part sun/part shade"],
  "imageKey": "test-user/1700000000-abcd.jpg",
  "createdAt": "2026-01-08T00:00:00.000Z"
}

