import boto3
from datetime import datetime, timezone

# writes plant METADATA only (no base64) to DynamoDB
# table schema (our system):
# - PK: userId (S)
# - SK: perenualId (N)
# image bytes go to S3; DB stores only imageKey (S3 key)

def put_plant_item(user_id, plant, table_name="PlantsRecognition", region="us-east-1"):
    dynamodb = boto3.resource("dynamodb", region_name=region)
    table = dynamodb.Table(table_name)

    if plant.get("perenualId") is None:
        raise ValueError("missing perenualId")
    if not plant.get("imageKey"):
        raise ValueError("missing imageKey (store S3 key, not base64)")

    item = {
        "userId": user_id,                      # PK (S)
        "perenualId": int(plant["perenualId"]),  # SK (N)

        "scientificName": plant.get("scientificName"),
        "commonName": plant.get("commonName"),
        "watering": plant.get("watering"),
        "sunlight": plant.get("sunlight", []),

        # pointer to the image in S3 (NOT base64)
        "imageKey": plant["imageKey"],

        # optional metadata
        "createdAt": plant.get("createdAt") or datetime.now(timezone.utc).isoformat(),
    }

    table.put_item(Item=item)
    print(f"saved plant perenualId={item['perenualId']} for userId={user_id} ✅")


# example usage
if __name__ == "__main__":
    user_id = "google_109876543210987654321"

    plant_data = {
        "perenualId": 223,
        "scientificName": "Rosa rubiginosa",
        "commonName": "Sweet Briar Rose",
        "watering": "Average",
        "sunlight": ["Full Sun"],

        # this should come from your save lambda after uploading to S3
        "imageKey": "google_109876543210987654321/1767802223864-6f82c9279ae668.jpg"
    }

    put_plant_item(user_id, plant_data)





# cat > save_plant.py <<'PY'
# import boto3
# from datetime import datetime, timezone

# def put_plant_item(user_id, plant, table_name="PlantsRecognition", region="us-east-1"):
#     dynamodb = boto3.resource("dynamodb", region_name=region)
#     table = dynamodb.Table(table_name)

#     if plant.get("perenualId") is None:
#         raise ValueError("missing perenualId")
#     if not plant.get("imageKey"):
#         raise ValueError("missing imageKey")

#     item = {
#         "userId": user_id,
#         "perenualId": int(plant["perenualId"]),
#         "scientificName": plant.get("scientificName"),
#         "commonName": plant.get("commonName"),
#         "watering": plant.get("watering"),
#         "sunlight": plant.get("sunlight", []),
#         "imageKey": plant["imageKey"],
#         "createdAt": plant.get("createdAt") or datetime.now(timezone.utc).isoformat(),
#     }

#     table.put_item(Item=item)
#     print(f"saved plant perenualId={item['perenualId']} for userId={user_id}")

# if __name__ == "__main__":
#     user_id = "google_109876543210987654321"
#     plant_data = {
#         "perenualId": 223,
#         "scientificName": "Rosa rubiginosa",
#         "commonName": "Sweet Briar Rose",
#         "watering": "Average",
#         "sunlight": ["Full Sun"],
#         "imageKey": "google_109876543210987654321/1767802223864-6f82c9279ae668.jpg"
#     }
#     put_plant_item(user_id, plant_data)
# PY

# python3 save_plant.py