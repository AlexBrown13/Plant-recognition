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
- allowed methods: `POST, OPTIONS`
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
- url: <in discord>/my-plants?userId=<google_user_id>
  headers:
- Content-Type: application/json
- Authorization: Bearer <google_id_token>

- body (raw json):

```json
{
  "userId": "google_333358543213937353333",
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
      "watering": "Once every 2 weeks",
      "sunlight": "Low to bright indirect light"
    }
  ]
}
```
