import json
import urllib.parse
import urllib.request
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])

# OPTION A: verify GOOGLE ID TOKEN (JWT) via tokeninfo
TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token="
ADMIN_EMAIL = "rupcgroup25.6@gmail.com"

def lambda_handler(event, context):
    try:
        headers = event.get("headers") or {}
        auth = headers.get("Authorization") or headers.get("authorization")
        print("auth", auth)

        if not auth or not auth.startswith("Bearer "):
            return response(401, {"error": "Missing Authorization Bearer token"})

        id_token = auth[len("Bearer "):].strip()
        if not id_token:
            return response(401, {"error": "Empty token"})

        # Verify token by calling Google tokeninfo
        url = TOKENINFO_URL + urllib.parse.quote(id_token, safe="")
        with urllib.request.urlopen(url) as res:
            userinfo = json.loads(res.read())

        # tokeninfo response includes sub/email/name if present
        user_sub = userinfo.get("sub")
        if not user_sub:
            return response(401, {"error": "Invalid token (missing sub)"})

        email = userinfo.get("email")
        name = userinfo.get("name")
        picture = userinfo.get("picture")

        isAdmin = email == ADMIN_EMAIL

        now = datetime.utcnow().isoformat() + "Z"

        # Upsert user
        table.put_item(
            Item={
                "userId": f"google_{user_sub}",
                "sub": user_sub,
                "email": email,
                "name": name,
                "isAdmin": isAdmin,
                "picture": picture,
                "updatedAt": now,
                "createdAt": now,  # simple approach; if you want true createdAt, use UpdateItem with if_not_exists
            }
        )

        return response(200, {
            "userId": f"google_{user_sub}",
            "sub": user_sub,
            "email": email,
            "name": name,
            "picture": picture,
            "isAdmin": isAdmin
        })

    except Exception as e:
        print("ERROR:", str(e))
        return response(401, {"error": "Invalid Google id token"})


def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        },
        "body": json.dumps(body),
    }