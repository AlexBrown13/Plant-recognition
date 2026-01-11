# my-plants Lambda

AWS Lambda for **GET /my-plants**.  
Returns all plants saved by the **authenticated Google user** with **presigned S3 image URLs**.

---

## Runtime
- Python **3.10+**
- No external dependencies (`boto3` is built-in)

---

## Environment Variables

PLANTS_TABLE=PlantsRecognition
BUCKET_NAME=plant-recognition-images-1-7-2026

---

## Authentication

Header:Authorization: Bearer <google_id_token>
User ID is derived as:google_<sub>


---

## DynamoDB Schema

- `userId` (S) — partition key  
- `perenualId` (N) — sort key  

Other fields:
`scientificName`, `commonName`, `watering`, `sunlight[]`, `imageKey`, `createdAt`

---

## Endpoint

- **GET** `/my-plants`
- No request body

Returns presigned `imageUrl` for each plant.

---

## Example Response

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

