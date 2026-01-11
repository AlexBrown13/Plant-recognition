
import boto3

def create_table():

    DDB = boto3.resource('dynamodb', region_name='us-east-1')

    params = {
        'TableName': 'PlantsRecognitionUsers',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'}
        ],
        'ProvisionedThroughput': {
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    }
    table = DDB.create_table(**params)
    table.wait_until_exists()
    print ("Done")
    

if __name__ == '__main__':
    create_table()


# cat > create_users_table.py <<'PY'
# import boto3

# def create_table():
#     ddb = boto3.resource("dynamodb", region_name="us-east-1")

#     table = ddb.create_table(
#         TableName="PlantsRecognitionUsers",
#         KeySchema=[
#             {"AttributeName": "userId", "KeyType": "HASH"}
#         ],
#         AttributeDefinitions=[
#             {"AttributeName": "userId", "AttributeType": "S"}
#         ],
#         BillingMode="PAY_PER_REQUEST"  # simpler than ProvisionedThroughput
#     )

#     table.wait_until_exists()
#     print("Done")

# if __name__ == "__main__":
#     create_table()
# PY

# python3 create_users_table.py