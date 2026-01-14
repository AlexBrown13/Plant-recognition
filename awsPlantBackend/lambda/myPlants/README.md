# my-plants lambda

aws lambda for **GET /my-plants**.  
returns all plants saved by the **authenticated google user** and adds **presigned s3 imageUrl** for each plant that has an `imageKey`.

## runtime
- python **3.10 / 3.11 / 3.12** (aws runtime)
- no external dependencies (`boto3` is included in lambda)

## environment variables
- `PLANTS_TABLE` (e.g. `PlantsRecognition`)
- `BUCKET_NAME` (e.g. `plant-recognition-images-1-7-2026`)

## authentication
- header: `Authorization: Bearer <google_id_token>`
- user id is derived as: `google_<sub>` (from google `tokeninfo`)

## dynamodb schema
this lambda **queries by `userId`**.

- `userId` (S) — partition key

other stored fields (typical):
`perenualId`, `scientificName`, `commonName`, `watering`, `sunlight[]`, `imageKey`, `createdAt`

## endpoint
- **GET** `/my-plants`
- no request body

returns `plants[]`. if an item has `imageKey`, the lambda adds `imageUrl` (presigned, expires in 1 hour).

## example response
```json
{
  "plants": [
    {
      "perenualId": 223,
      "commonName": "Sweet Briar",
      "imageUrl": "https://s3-presigned..."
    }
  ]
}
