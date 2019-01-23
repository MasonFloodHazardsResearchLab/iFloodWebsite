# Update an existing user with new alerts (given the confirmation code)

import boto3
import json
import re
import urllib.parse
import random

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

phoneNumberRegex = re.compile(r"^\+1\d{10}$")
emailRegex = re.compile(r"^.*@.*\..*$")

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
    userItem = {}

    if len(event["body"]) > 10000: #at some point if they submit something huge then they must be doing something wrong
        return errorOut("Please select fewer alerts.")

    try:
        data = json.loads(event["body"])
    except:
        return errorOut("Invalid request")

    if not data.get("primaryContact"):
        return errorOut("Please enter a phone number or email address.")

    response = userTable.get_item(
        Key={
            "primaryContact": data["primaryContact"]
        },
        ConsistentRead=True
    )

    if not response.get("Item"):
        return errorOut("User not found.")
    userItem = response.get("Item")

    if not userItem["verified"]:
        return errorOut("You aren't verified yet")

    if not data.get("alerts"):
        return errorOut("Please select at least one alert.")

    if not data.get("code"):
        return errorOut("Please provide verification code.")
    if str(data.get("code")) != userItem["verifyCode"]:
        return errorOut("Incorrect verification code.")

    userItem["alerts"] = json.dumps(data["alerts"])

    # send to dynamo
    response = userTable.put_item(
        Item=userItem
    )

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
        },
        "body": "Success"
    }