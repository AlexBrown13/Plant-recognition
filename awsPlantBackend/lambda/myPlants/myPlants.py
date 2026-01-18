import json
import os
import boto3
import urllib.request
import urllib.parse
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# 1) Client sends request with Authorization: Bearer <google_id_token>
# 2) Lambda extracts the ID token from the request headers
# 3) Lambda sends the token to Google to verify it
# 4) Google returns the user's unique "sub"
# 5) Lambda builds userId = "google_" + sub
# 6) Lambda queries DynamoDB for all plants with this userId (PK)
# 7) Lambda generates temporary S3 URL for plant image
# 8) Lambda returns the plants list as JSON


dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

PLANTS_TABLE = os.environ["PLANTS_TABLE"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

table = dynamodb.Table(PLANTS_TABLE)

def lambda_handler(event, context):
    try:
        # 1) read bearer token
        #reads the Authorization header and extracts the Google ID token from it.
        headers = event.get("headers") or {}
        auth = headers.get("authorization") or headers.get("Authorization") or ""
        if not auth.startswith("Bearer "):
            return resp(401, {"error": "missing Authorization Bearer token"})

        id_token = auth[len("Bearer "):].strip()

        # 2) verify token with google -> get sub
        #send the id token to google to verify it, get the user’s sub
        #then build userId = "google_" + sub and use that as the key in dynamodb.
        tokeninfo = google_tokeninfo(id_token)
        sub = tokeninfo.get("sub")
        if not sub:
            return resp(401, {"error": "invalid token (no sub)"})

        user_id = f"google_{sub}"

        # 3) query dynamodb by userId (PK)
        # queries dynamodb for all items with this userId (PK) and converts them into JSON safe values
        result = table.query(
            KeyConditionExpression=Key("userId").eq(user_id)
        )

        items = convert_decimal(result.get("Items", []))

        # 4) attach presigned imageUrl
        plants = []
        for it in items:
            image_key = it.get("imageKey") #get the S3 object key (pointer to the image)
            #the URL points to the bucket, and the key tells S3 which exact image inside the bucket to fetch.
            if image_key: #create a temporary, secure URL
                it["imageUrl"] = presigned_url(image_key)
            plants.append(it)

        # 5) return
        return resp(200, {"plants": plants})

    except Exception as e:
        print("ERROR:", str(e))
        return resp(500, {"error": "server error", "message": str(e)})

def google_tokeninfo(id_token: str) -> dict:
     # Verify a Google ID token by calling Google's tokeninfo endpoint
    # This tells us if the token is valid and who the user is

    # GET https://oauth2.googleapis.com/tokeninfo?id_token=...
     # Encode the token so it can be safely sent in a URL
    q = urllib.parse.urlencode({"id_token": id_token})

    # Build the Google token verification URL
    url = f"https://oauth2.googleapis.com/tokeninfo?{q}"

     # Send the request to Google (timeout after 10 seconds)
    with urllib.request.urlopen(url, timeout=10) as r:
        # Read the response body (bytes)
        data = r.read().decode("utf-8")
         # Parse JSON text into a Python dictionary and return it
        return json.loads(data)

def presigned_url(image_key: str) -> str:
     # Generate a temporary, secure URL to read a private S3 object
    # The URL grants access only to this file and expires after 1 hour
    return s3.generate_presigned_url( 
        ClientMethod="get_object", # Read object from S3
        Params={"Bucket": BUCKET_NAME, "Key": image_key},
        ExpiresIn=3600
    )

def convert_decimal(obj):
     # Recursively convert DynamoDB Decimal values to int or float
    # JSON cannot serialize Decimal, so this is required
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    if isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj

def resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # Allow requests from any origin (CORS)
            "Access-Control-Allow-Headers": "*",   # Allow any request headers
            "Access-Control-Allow-Methods": "GET,OPTIONS",  # Allow GET requests and preflight OPTIONS requests
            "Content-Type": "application/json", # Tell the client the response body is JSON
        }, 
        "body": json.dumps(body),
    }
