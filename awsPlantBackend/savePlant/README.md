# savePlant lambda (s3 + dynamodb)

## what it does
1) receives plant info + `imageBase64`
2) verifies google id token from `Authorization: Bearer <google_id_token>`
3) uploads the image to s3
4) stores plant metadata in dynamodb (with `imageKey`)

## requirements
- aws lambda runtime: node.js 24 (or node.js 18+)
- aws resources:
  - s3 bucket (private)
  - dynamodb table

## environment variables (lambda)
- `BUCKET_NAME` = your s3 bucket name
- `PLANTS_TABLE` = dynamodb table name (e.g. `PlantsRecognition`)

## dynamodb table schema
- partition key (PK): `userId` (string)
- sort key (SK): `perenualId` (number)

stored item example:
```json
{
  "userId": "google_109876543210987654321",
  "perenualId": 2773,
  "scientificName": "Epipremnum pinnatum",
  "commonName": "Pothos",
  "watering": "Average",
  "sunlight": ["part sun/part shade"],
  "imageKey": "google_109876543210987654321/1700000000-abcd.jpg",
  "createdAt": "2026-01-08T00:00:00.000Z"
}
