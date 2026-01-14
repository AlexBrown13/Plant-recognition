
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

TABLE_NAME = "PlantsRecognitionUsers"
REGION = "us-east-1"

# The default user to insert
DEFAULT_USER = {
    "sub": "107314465142826082072",
    "email": "rupcgroup25.6@gmail.com",
    "name": "Ruppin Ruppin",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKjktPxZ_oLD63uWvimSaghkn5TKohUFx-MgEQ_EEt5pjj4yg=s96-c",
    "isAdmin": True
}

def create_table():
    """Create the DynamoDB table if it doesn't exist"""
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
    if TABLE_NAME in existing_tables:
        print(f"Table '{TABLE_NAME}' already exists")
        return dynamodb.Table(TABLE_NAME)

    print(f"Creating table '{TABLE_NAME}'...")
    table = dynamodb.create_table(
        TableName=TABLE_NAME,
        KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "userId", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",  # on-demand mode
    )
    table.wait_until_exists()
    print(f"Table '{TABLE_NAME}' created successfully")
    return table

def save_user(user):
    """Insert a user into the DynamoDB table"""
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)

    now = datetime.utcnow().isoformat()
    item = {
        "userId": f"google_{user['sub']}",
        "sub": user["sub"],
        "email": user["email"],
        "name": user.get("name", ""),
        "picture": user.get("picture", ""),
        "createdAt": now,
        "updatedAt": now,
        "isAdmin": user.get("isAdmin", False),
    }

    try:
        table.put_item(Item=item, ConditionExpression="attribute_not_exists(userId)")
        print(f"User '{item['email']}' saved successfully")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            print(f"User '{item['email']}' already exists")
        else:
            raise

if __name__ == "__main__":
    create_table()
    save_user(DEFAULT_USER)





# import boto3

# def create_table():

#     DDB = boto3.resource('dynamodb', region_name='us-east-1')

#     params = {
#         'TableName': 'PlantsRecognitionUsers',
#         'KeySchema': [
#             {'AttributeName': 'userId', 'KeyType': 'HASH'}
#         ],
#         'AttributeDefinitions': [
#             {'AttributeName': 'userId', 'AttributeType': 'S'}
#         ],
#         'ProvisionedThroughput': {
#             'ReadCapacityUnits': 1,
#             'WriteCapacityUnits': 1
#         }
#     }
#     table = DDB.create_table(**params)
#     table.wait_until_exists()
#     print ("Done")
    

# if __name__ == '__main__':
#     create_table()


# # cat > create_users_table.py <<'PY'
# # import boto3

# # def create_table():
# #     ddb = boto3.resource("dynamodb", region_name="us-east-1")

# #     table = ddb.create_table(
# #         TableName="PlantsRecognitionUsers",
# #         KeySchema=[
# #             {"AttributeName": "userId", "KeyType": "HASH"}
# #         ],
# #         AttributeDefinitions=[
# #             {"AttributeName": "userId", "AttributeType": "S"}
# #         ],
# #         BillingMode="PAY_PER_REQUEST"  # simpler than ProvisionedThroughput
# #     )

# #     table.wait_until_exists()
# #     print("Done")

# # if __name__ == "__main__":
# #     create_table()
# # PY

# # python3 create_users_table.py