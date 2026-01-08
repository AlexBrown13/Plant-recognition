# identifyPlant lambda (plant recognition)

aws lambda (node.js 24) for plant identification.

## what it does
- input: base64-encoded image (request body)
- calls PlantNet to identify the plant
- uses the scientific/common name to search Perenual and get the plant ID
- calls Perenual again with the plant ID to retrieve care information
- returns plant care info (watering, sunlight, etc.)

## requirements
- aws lambda runtime: node.js 24
- environment variables:
  - PLANTNET_KEY
  - PERENUAL_KEY

## lambda configuration
- runtime: Node.js 24
- memory: 512 MB (recommended)
- timeout: 20 seconds (PlantNet + Perenual are external APIs)

## request format
send a POST request where the **body is the base64 string** (raw text, not json).

example response:
```json
{
  "scientificName": "Epipremnum pinnatum",
  "commonName": "Pothos",
  "perenualId": 2773,
  "watering": "Average",
  "sunlight": ["part sun/part shade"]
}
