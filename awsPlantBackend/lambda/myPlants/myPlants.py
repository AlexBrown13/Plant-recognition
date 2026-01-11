import json
import os
import boto3
import urllib.request
import urllib.parse
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

PLANTS_TABLE = os.environ["PLANTS_TABLE"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

table = dynamodb.Table(PLANTS_TABLE)

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def lambda_handler(event, context):
    try:
        # 1) read bearer token
        auth = event["headers"].get("Authorization")
        if not auth:
            return resp(401, "Missing Authorization header")

        access_token = auth.replace("Bearer ", "")

        # Verify token by calling Google
        req = urllib.request.Request(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )

        with urllib.request.urlopen(req) as res:
            userinfo = json.loads(res.read())

        #user_id = userinfo["sub"]
        user_id = f"google_{userinfo['sub']}"

        # 3) query dynamodb by userId (PK)
        result = table.query(
            KeyConditionExpression=Key("userId").eq(user_id)
        )
 
        items = convert_decimal(result.get("Items", []))
        # 4) attach presigned imageUrl
        plants = []
        for it in items:
            image_key = it.get("imageKey")
            if image_key:
                it["imageUrl"] = presigned_url(image_key)
            plants.append(it)

        # 5) return
        return resp(200, {"plants": plants})

    except Exception as e:
        print("ERROR:", str(e))
        return resp(500, {"error": "server error", "message": str(e)})


def google_tokeninfo(id_token: str) -> dict:
    # GET https://oauth2.googleapis.com/tokeninfo?id_token=...
    q = urllib.parse.urlencode({"id_token": id_token})
    url = f"https://oauth2.googleapis.com/tokeninfo?{q}"

    with urllib.request.urlopen(url, timeout=10) as r:
        data = r.read().decode("utf-8")
        return json.loads(data)

def presigned_url(image_key: str) -> str:
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": BUCKET_NAME, "Key": image_key},
        ExpiresIn=3600
    )

def convert_decimal(obj):
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
    }