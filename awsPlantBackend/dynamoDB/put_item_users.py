import boto3
from datetime import datetime

def save_user(google_user):
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table('PlantsRecognitionUsers')

    now = datetime.utcnow().isoformat()

    table.put_item(
        Item={
            "userId": f"google_{google_user['sub']}",
            "email": google_user["email"],
            "name": google_user.get("name", ""),
            "picture": google_user.get("picture", ""),
            "createdAt": now,
            "lastLogin": now
        },
        ConditionExpression="attribute_not_exists(userId)"
    )

    print("User saved")

my_user = {
    "sub": "109876543210987654321",            # Unique Google user ID
    "email": "chenbrown91@gmail.com",           # User's email
    "name": "Chen Brown",                      # Full name
    "picture": "https://lh3.googleusercontent.com/a-/AOh14GhExample",  # Profile picture URL
}

if __name__ == '__main__':
    save_user(my_user)