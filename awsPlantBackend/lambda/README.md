# saveUser lambda (dynamodb)

## requirements

- AWS Lambda runtime: Python 3.x
- AWS resources:
  - dynamoDB table

## Environment Variables (lambda)

- `USERS_TABLE` = dynamodb table name (e.g. PlantsRecognitionUsers)

## dynamodb table schema

- partition key (PK): `userId` (string)

## Admin Logic

Admin access is determined by comparing the authenticated user’s email to a predefined value:

```python
ADMIN_EMAIL = "rupcgroup25.6@gmail.com"
```

stored item example:

```json
{
  "userId": "google_<sub>",
  "sub": "<sub>",
  "email": "<email>",
  "name": "<name>",
  "picture": "<picture>",
  "isAdmin": false
}
```

# -------------------------------------

# allUsers lambda (dynamodb)

## requirements

- AWS Lambda runtime: Python 3.x
- AWS resources:
  - dynamoDB table

## Environment Variables (lambda)

- `USERS_TABLE` = dynamodb table name (e.g. PlantsRecognitionUsers)

## dynamodb table schema

- partition key (PK): `userId` (string)

Response Format Array

```json
{
  "users": [
    {
      "userId": "google_12345",
      "email": "user@example.com",
      "isAdmin": true,
      "createdAt": "2026-01-14T22:00:00Z"
    }
  ]
}
```
