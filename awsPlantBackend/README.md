# backend flow

## 0) api gateway (http api) — entry point
- one public base url (stage: `prod`)
- routes -> lambdas:
  - POST /identify -> identifyPlant (node)
  - POST /save -> savePlant (node)
  - POST /save-user -> plant-recognition-save-user (python)
  - GET /my-plants -> plant-recognition-my-plants (python)
  - GET /admin -> plant-recognition-allUsers (python)
- cors allows: origins *, methods POST/GET/OPTIONS, headers Content-Type/Authorization

---

## 1) POST /identify  (identifyPlant lambda)
goal: identify plant from image (no saving)

1) frontend sends HTTP POST to `/identify`
   - body is raw base64 string (or data-url)
   - no auth required 

2) lambda reads the image string from the request
   - supports raw base64 or `data:image/...;base64,...`
   - strips data-url prefix if exists
   - converts base64 -> bytes (Buffer)

3) lambda calls PlantNet
   - sends multipart/form-data
   - field name: `images`
   - file name: `plant.jpg` 
   - gets best match from results[0]

4) lambda extracts:
   - scientificName (cleaned)
   - commonName (first common name if exists)

5) lambda tries to find the same plant in Perenual
   - builds backup queries:
     - first 2 words of scientificName
     - commonName
     - genus only
   - calls `/species-list?q=...` until it finds a result
   - if it finds: takes first result (data[0]) -> plant.id

6) lambda calls Perenual details endpoint
   - `/species/details/<id>`
   - tries to read watering + sunlight
   - normalizes sunlight to array
   - if details fails, keep defaults ("No care available")

7) response to frontend (always returns something)
   - if perenual found:
     { scientificName, commonName, perenualId, watering, sunlight }
   - if perenual not found:
     { scientificName, commonName, perenualId: null, watering: "No care available", sunlight: ["No care available"] }

---

## 2) POST /save  (savePlant lambda)
goal: save plant + store image in S3 + metadata in DynamoDB

1) user clicks “save” in frontend after identify
2) frontend sends POST to `/save`
   - headers: Authorization: Bearer <google_id_token>
   - body JSON:
     { scientificName, commonName, perenualId, watering, sunlight, imageBase64 }

3) savePlant verifies the user
   - reads bearer token from headers
   - calls Google tokeninfo with id_token
   - gets `sub`
   - builds internal userId = `google_<sub>`

4) savePlant parses request body JSON
   - reads plant fields + imageBase64
   - if imageBase64 missing -> 400

5) savePlant normalizes perenualId
   - if missing -> uses Date.now() as numeric fallback
   - else -> Number(perenualId)
   - (because DynamoDB SK must be a number)

6) savePlant uploads image to S3 (private bucket)
   - converts base64 -> bytes
   - generates imageKey:
     `<userId>/<timestamp>-<random>.jpg`
   - PutObject(BUCKET_NAME, imageKey, imageBytes, ContentType=image/jpeg)
   - result: image bytes are now stored in S3 under that key

7) savePlant stores metadata in DynamoDB Plants table
   - table: PlantsRecognition (PK userId, SK perenualId)
   - stores plant fields + `imageKey` + createdAt
   - IMPORTANT: does NOT store base64

8) savePlant responds:
   { ok: true, imageKey }

---

## 3) GET /my-plants  (plant-recognition-my-plants lambda)
goal: return all saved plants for the logged-in user + imageUrl

1) frontend sends GET to `/my-plants`
   - headers: Authorization: Bearer <google_id_token>

2) lambda verifies user with Google tokeninfo
   - gets sub -> builds userId = google_<sub>

3) lambda queries DynamoDB Plants table by userId (PK)
   - Query(Key("userId").eq(userId))
   - returns all plant items for this user
   - converts DynamoDB Decimal values to int/float (JSON-safe)

4) lambda adds imageUrl to each item
   - reads imageKey from item
   - generates presigned S3 GET url (expires 1 hour)
   - attaches `imageUrl` to the item

5) returns:
   { plants: [ ...items with imageKey + imageUrl... ] }

---

## 4) POST /save-user  (plant-recognition-save-user lambda)
goal: save/update the user record in Users table (and compute isAdmin)

1) frontend sends POST to `/save-user`
   - headers: Authorization: Bearer <google_id_token>
   - (body is not needed for identity; lambda uses Google response)

2) lambda verifies token with Google tokeninfo
   - gets sub/email/name/picture

3) lambda decides isAdmin
   - isAdmin = (email == "rupcgroup25.6@gmail.com")

4) lambda upserts user into Users table (PK userId)
   - table: PlantsRecognitionUsers (PK userId)
   - writes: userId, sub, email, name, picture, isAdmin, createdAt, updatedAt
   - note: your code sets createdAt every time (simple approach)

5) returns user info to frontend (including isAdmin)

---

## 5) GET /admin  (plant-recognition-allUsers lambda)
goal: admin-only endpoint to list all users

1) frontend sends GET to `/admin`
   - headers: Authorization: Bearer <google_id_token>

2) lambda verifies token with Google tokeninfo
   - gets sub -> builds userId

3) lambda checks admin permission
   - get_item from Users table with Key { userId }
   - reads isAdmin (defaults False)
   - if not admin -> 403

4) if admin, lambda scans Users table
   - scan returns all users (note: can require pagination if table grows)
   - sorts by createdAt newest-first

5) returns:
   { users: [ ... ] }

---

## storage summary (what goes where)
- S3 bucket (private): stores ONLY image bytes
  - object key = imageKey
- DynamoDB Plants table: stores metadata + imageKey
- DynamoDB Users table: stores user profile + isAdmin
- presigned URLs: created at read time (my-plants), expire after ~1 hour
