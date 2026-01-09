# plant-recognition-my-plants Lambda

This AWS Lambda function allows you to query the `PlantsRecognition` DynamoDB table for a user's plants based on their `userId`. It is designed to be used as a backend endpoint, for example, in a React or other frontend application.

---

## Table of Contents

- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [DynamoDB Table Setup](#dynamodb-table-setup)
- [Lambda Function](#lambda-function)
- [Example Request](#example-request)
- [Example Response](#example-response)
- [Error Handling](#error-handling)
- [CORS](#cors)

---

## Requirements

- Python 3.9+ (Lambda runtime)
- AWS SDK for Python (`boto3`)
- DynamoDB table named `PlantsRecognition`
- IAM role with permissions:
  - `dynamodb:Query`
  - `dynamodb:Scan` (optional)
  - `logs:CreateLogGroup`
  - `logs:CreateLogStream`
  - `logs:PutLogEvents`

---

## Environment Variables

The Lambda function requires the following environment variable:

| Name           | Description                     |
| -------------- | ------------------------------- |
| `PLANTS_TABLE` | The name of your DynamoDB table |

Example in Lambda console:

---

## DynamoDB Table Setup

The table must have `userId` as the **Partition Key**. Optional additional fields:

- `plantId` (if multiple plants per user, as **Sort Key**)
- `commonName`
- `watering`
- `sunlight`

Example schema:

| Attribute Name | Type | Key Type      |
| -------------- | ---- | ------------- |
| userId         | S    | Partition Key |
| plantId        | S    | Sort Key      |

---

## Lambda Function

The Lambda function `lambda_handler`:

- Expects a JSON payload with `userId`.
- Queries the DynamoDB table for all items belonging to that user.
- Returns a JSON response containing the list of plants and the count.

## Example Response

{
"userId": "google_109876543210987654321",
"count": 2,
"plants": [
{
"plantId": "1",
"commonName": "Fiddle Leaf Fig",
"watering": "Once a week",
"sunlight": "Indirect light"
},
{
"plantId": "2",
"commonName": "Snake Plant",
"watering": "Every 2 weeks",
"sunlight": "Low to bright light"
}
]
}

## Error Handling

Missing userId:

{
"error": "missing userId"
}

Server error (DynamoDB query fails, etc.):

{
"error": "server error",
"message": "Detailed exception message"
}
