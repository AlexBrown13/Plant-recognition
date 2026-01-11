
import boto3

def create_table():

    DDB = boto3.resource('dynamodb', region_name='us-east-1')

    params = {
        'TableName': 'PlantsRecognition',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},   # PK
            {'AttributeName': 'perenualId', 'KeyType': 'RANGE'}, #SK
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'perenualId', 'AttributeType': 'N'}
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


# cat > create_table.py <<'PY'
# import boto3

# def create_table():
#     ddb = boto3.resource("dynamodb", region_name="us-east-1")

#     table = ddb.create_table(
#         TableName="PlantsRecognition",
#         KeySchema=[
#             {"AttributeName": "userId", "KeyType": "HASH"},
#             {"AttributeName": "perenualId", "KeyType": "RANGE"},
#         ],
#         AttributeDefinitions=[
#             {"AttributeName": "userId", "AttributeType": "S"},
#             {"AttributeName": "perenualId", "AttributeType": "N"},
#         ],
#         BillingMode="PAY_PER_REQUEST",  # simplest: no RCU/WCU
#     )

#     table.wait_until_exists()
#     print("Done")

# if __name__ == "__main__":
#     create_table()
# PY

# python3 create_table.py