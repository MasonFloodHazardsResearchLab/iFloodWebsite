# Verify a user if provided the correct confirmation code

import boto3
import urllib.parse

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

sns = boto3.client('sns') #AWS Simple Notification Service (for SMS)

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

    userItem = response.get("Item")

    if userItem["verified"]:
        return errorOut("You've already been verified. You're all set!")

    if data["code"] != userItem["verifyCode"]:
        return errorOut("Verification failed. Make sure you copied the entire URL.")

    #if everything looks good we mark the user verified
    userTable.update_item(
        Key={
            "primaryContact": data["primaryContact"]
        },
        UpdateExpression="SET verified = :t",
        ExpressionAttributeValues={
            ":t":True
        }
    )

    if userItem["contactType"] == "phone":
        unsubLink = "https://iflood.vse.gmu.edu/alerts/link#removeuser?primaryContact=" + urllib.parse.quote_plus(userItem["primaryContact"])
        updateLink = "iflood.vse.gmu.edu/alerts#" + userItem["primaryContact"] + "," + userItem["verifyCode"]
        response = sns.publish(
            PhoneNumber=userItem["primaryContact"],
            Message="Registration complete. To edit your alert subscription, tap here:\n" + updateLink + "\n\nTo unsubscribe, tap here:\n" + unsubLink
        )

    return {
        "isBase64Encoded": False,
        "statusCode": 302,
        "headers": {"Location": "http://iflood.vse.gmu.edu/alerts/success"},
        "body": "http://iflood.vse.gmu.edu/alerts/success"
    }
