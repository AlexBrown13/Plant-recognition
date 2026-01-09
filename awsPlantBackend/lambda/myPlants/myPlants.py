import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
PLANTS_TABLE = os.environ.get("PLANTS_TABLE")
table = dynamodb.Table(PLANTS_TABLE)

def lambda_handler(event, context):
    try:
        print("EVENT:", event)

        # get userId from body 
        body = json.loads(event.get("body", "{}"))
        userId = body.get("userId")

        if not userId:
            return response(400, {"error": "missing userId"})

        # query DynamoDB
        result = table.query(
            KeyConditionExpression=Key("userId").eq(userId)
        )

        items = result.get("Items", [])
        items = convert_decimal(items)

        print("items: ", items)

        return response(200, {
            "userId": userId,
            "count": len(items),
            "plants": items
        })

    except Exception as e:
        print("ERROR:", str(e))
        return response(500, {"error": "server error", "message": str(e)})



def convert_decimal(obj):
    """
    Recursively convert DynamoDB Decimal types to int or float
    """
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj
        

def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }