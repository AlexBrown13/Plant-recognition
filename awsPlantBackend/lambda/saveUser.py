
import json
import urllib.request
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

def lambda_handler(event, context):
    try:
        auth = event["headers"].get("Authorization")
        print("auth", auth)
        if not auth:
            return response(401, "Missing Authorization header")

        access_token = auth.replace("Bearer ", "")
        print("access_token", access_token)

        # Verify token by calling Google
        req = urllib.request.Request(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )

        with urllib.request.urlopen(req) as res:
            userinfo = json.loads(res.read())

        user_id = userinfo["sub"]
        email = userinfo.get("email")
        name = userinfo.get("name")

        table.put_item(
            Item={
                "userId": f"google_{user_id}",
                "email": email,
                "name": name,
                "createdAt": datetime.utcnow().isoformat()
            }
        )

        return response(200, {
            "userId": user_id,
            "email": email,
            "name": name
        })

    except Exception as e:
        print("ERROR:", str(e))
        return response(401, "Invalid Google token")


def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body)
    }