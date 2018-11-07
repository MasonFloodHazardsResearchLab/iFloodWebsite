# Verify a user if provided the correct confirmation code

import boto3

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

def errorOut(message):
    return {
        "isBase64Encoded": False,
        "statusCode": 400,
        "headers": {"Content-Type": "text/html"},
        "body": message
    }

def lambda_handler(event, context):

    data = event["queryStringParameters"]

    if not (data.get("primaryContact") and data.get("code")):
        return errorOut("Verification failed. Make sure you copied the entire URL.")

    response = userTable.get_item(
        Key={
            "primaryContact":data["primaryContact"]
        },
        ConsistentRead=True
    )

    if not response.get("Item"):
        return errorOut("Verification failed. Make sure you copied the entire URL.")

    if response["Item"]["verified"]:
        return errorOut("You've already been verified. You're all set!")

    if data["code"] != response["Item"]["verifyCode"]:
        return errorOut("Verification failed. Make sure you copied the entire URL.")

    #if everything looks good we mark the user verified
    response = userTable.update_item(
        Key={
            "primaryContact": data["primaryContact"]
        },
        UpdateExpression="SET verified = :t",
        ExpressionAttributeValues={
            ":t":True
        }
    )

    return {
        "isBase64Encoded": False,
        "statusCode": 302,
        "headers": {"Location": "http://iflood.vse.gmu.edu/alerts/success"},
        "body": "http://iflood.vse.gmu.edu/alerts/success"
    }