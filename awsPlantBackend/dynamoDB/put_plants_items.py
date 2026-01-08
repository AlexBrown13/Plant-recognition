
import boto3

def put_plant_item(user_id, plant):
    """
    Save a plant for a specific user in PlantsRecognition table.
    Table must have:
    - PK: userId
    - SK: plantId
    """
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table('PlantsRecognition')

    item = {
        "userId": user_id,                      # Partition Key
        "perenualId": plant["perenualId"],    # Sort Key
        "scientificName": plant.get("scientificName", ""),
        "commonName": plant.get("commonName", ""),
        "watering": plant.get("watering", ""),
        "sunlight": plant.get("sunlight", []),
        "imageBase64": plant.get("imageBase64", "")
    }

    table.put_item(Item=item)
    print(f"Plant {plant['commonName']} inserted successfully ✅")

# Example usage
user_id = 'google_109876543210987654321'

plant_data = {
    "perenualId": 2,
    "scientificName": "Rosa rubiginosa",
    "commonName": "Sweet Briar Rose",
    "watering": "Medium",
    "sunlight": ["Full Sun"],
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA"
}

if __name__ == "__main__":
    put_plant_item(user_id, plant_data)







# import boto3

# def put_plant_item(user_id):
#     dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
#     table = dynamodb.Table('PlantsRecognition')

#     item = {
#         "userId": user_id,
#         "perenualId": "perenualId",                     # Partition Key
#         "scientificName": "Rosa rubiginosa",
#         "commonName": "Sweet Briar Rose",
#         "watering": "Medium",
#         "sunlight": ["Full Sun"],
#         "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA"  
#     }

#     table.put_item(Item=item)
#     print("Item inserted successfully")

# user_id = 'google_109876543210987654321'


# if __name__ == "__main__":
#     put_plant_item(user_id)

