# api gateway setup (http api)

api gateway provides a public https url for calling the lambdas from the frontend.

## region

- us-east-1

## api type

- HTTP API (not REST API)

## routes

this api exposes:

- `POST /identify` → identifyPlant lambda
- `POST /save` → savePlant lambda
- `GET /my-plants` → plant-recognition-my-plants lambda

## stage

- stage name: `prod`

## urls

in discord

## cors (important)

configure cors:

- allowed origins: `*` (for development)
- allowed methods: `POST, OPTIONS,GET`
- allowed headers: `Content-Type, Authorization`

## create (aws console) step-by-step

1. aws console → api gateway → **create api**
2. choose **HTTP API** → build
3. add integrations:
   - lambda: identifyPlant
   - lambda: savePlant
4. create routes:
   - POST `/identify` → identifyPlant
   - POST `/save` → savePlant
   - GET `/my-plants` → my-plants
5. create stage:
   - `prod`
6. configure cors (values above)

## quick test (postman)

### identify

- method: POST
- url: in discord /identify
- body: raw text = base64 string only (no json)

### save

- method: POST
- url: in discord /save
  headers:
- `Content-Type: application/json`
- (later) Authorization: Bearer <google_id_token>

- body (raw json):

```json
{
  "scientificName": "Epipremnum pinnatum",
  "commonName": "Pothos",
  "perenualId": 2773,
  "watering": "Average",
  "sunlight": ["part sun/part shade"],
  "imageBase64": "BASE64_HERE"
}
```

### my-plants

- method: GET
- url: <in discord>/my-plants
  headers:
- Authorization: Bearer <google_id_token>

```json
{
  "plants": [
    {
      "userId": "google_333358543213937353333",
      "perenualId": 223,
      "scientificName": "Rosa rubiginosa",
      "commonName": "Sweet Briar",
      "watering": "Average",
      "sunlight": ["Full Sun"],
      "imageKey": "google_333358543213937353333/1767802223864-6f82c9279ae668.jpg",
      "createdAt": "2026-01-11T16:42:10.123Z",
      "imageUrl": "https://s3-presigned-url..."
    }
  ]
}

```
