# Return an existing user's current alerts (given the confirmation code)

import boto3

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

def errorOut(message):
    return {
        "isBase64Encoded": False,
        "statusCode": 400,
        "headers": {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
        },
        "body": message
    }

def lambda_handler(event, context):

    data = event["queryStringParameters"]

    if not (data.get("primaryContact") and data.get("code")):
        return errorOut("Missing parameters.")

    response = userTable.get_item(
        Key={
            "primaryContact":data["primaryContact"]
        },
        ConsistentRead=True
    )

    if not response.get("Item"):
        return errorOut("User not found.")

    if not response["Item"]["verified"]:
        return errorOut("User not verified yet.")

    if data["code"] != response["Item"]["verifyCode"]:
        return errorOut("Incorrect verification code.")

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": response["Item"]["alerts"]
    }