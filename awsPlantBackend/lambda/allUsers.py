import json
import os
import boto3
import urllib.request
import urllib.parse
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")

USERS_TABLE = os.environ.get("USERS_TABLE", "PlantsRecognitionUsers")

users_table = dynamodb.Table(USERS_TABLE)


def lambda_handler(event, context):
    try:
        # 1) read bearer token
        headers = event.get("headers") or {}
        auth = headers.get("authorization") or headers.get("Authorization") or ""
        if not auth.startswith("Bearer "):
            return resp(401, {"error": "missing Authorization Bearer token"})

        id_token = auth[len("Bearer "):].strip()

        # 2) verify token with google -> get sub
        tokeninfo = google_tokeninfo(id_token)
        sub = tokeninfo.get("sub")
        if not sub:
            return resp(401, {"error": "invalid token (no sub)"})

        user_id = f"google_{sub}"

        # 3) check if user is admin
        user_response = users_table.get_item(Key={"userId": user_id})
        if "Item" not in user_response:
            return resp(403, {"error": "user not found"})

        user_item = convert_decimal(user_response["Item"])
        is_admin = user_item.get("isAdmin", False)

        if not is_admin:
            return resp(403, {"error": "forbidden: admin access required"})

        # 4) Scan all users from DynamoDB
        users_result = users_table.scan()
        users = convert_decimal(users_result.get("Items", []))

        # Sort by createdAt (newest first) if available
        users.sort(
            key=lambda x: x.get("createdAt", ""),
            reverse=True
        )

        return resp(200, {"users": users})

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
