# identifyPlant lambda (plant recognition)

aws lambda (node.js 24) for plant identification.

## what it does
- input: base64-encoded image (request body). supports raw base64 or `data:image/...;base64,...`
- calls PlantNet to identify the plant
- uses the scientific/common name to search Perenual and get the plant ID
- (best effort) calls Perenual details to retrieve care info (watering, sunlight)
- if Perenual fails or finds nothing, still returns PlantNet identification with `"No care available"`

## requirements
- aws lambda runtime: node.js 24
- environment variables:
  - `PLANTNET_KEY`
  - `PERENUAL_KEY`

## lambda configuration (recommended)
- runtime: Node.js 24
- memory: 512 MB
- timeout: 20 seconds (PlantNet + Perenual are external APIs)

## request format
send a POST request where the **body is the base64 string** (raw text, not json).

## example response
```json
{
  "scientificName": "Epipremnum pinnatum",
  "commonName": "Pothos",
  "perenualId": 2773,
  "watering": "Average",
  "sunlight": ["part sun/part shade"]
}
