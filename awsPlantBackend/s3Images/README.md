# s3 setup (plant images)

this project stores user-uploaded plant images in a private s3 bucket.

# 1) frontend sends imageBase64 to savePlant
# 2) savePlant converts base64 → image bytes
# 3) savePlant generates S3 key: <userId>/<timestamp>-<random>.jpg
# 4) savePlant uploads image bytes to private S3 bucket
# 5) S3 stores the image bytes as an object under that key
# 6) savePlant stores only imageKey in DynamoDB (not the image)
# 7) savePlant returns success to the client

## image handling summary

- frontend sends image as base64 to `POST /identify`
- image is used only for plant recognition and is **not stored**

- when user clicks **save**, frontend sends plant data + `imageBase64` to `POST /save`

- backend uploads the image to s3 with key:
  `<userId>/<timestamp>-<random>.jpg`

- s3 bucket is private

- dynamodb stores only metadata and the `imageKey` (no image data)

- images are later accessed via presigned s3 urls

## region
- us-east-1

## bucket
- name: `plant-recognition-images-1-7-2026`
- keep it **private**

## folder/key format
images are uploaded under: test-user/<timestamp>-<random>.jpg


later, replace `test-user` with the google user id (`sub`).

## permissions (bucket policy)
the lambda execution role must be allowed to upload/download objects.

in aws academy labs, the role is usually:
- `LabRole`

## how to create (aws console)
1) aws console → s3 → **create bucket**
2) bucket name: `plant-recognition-images-1-7-2026`
3) leave bucket private (default)
4) create

## notes
- do **not** store base64 images in dynamodb
- only store the s3 `imageKey`

## bucket policy (required)
paste this in:
s3 → your bucket → **permissions** → **bucket policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppRoleWriteRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<ACCOUNT_ID>:role/LabRole"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::plant-recognition-images-1-7-2026/*"
    }
  ]
}




