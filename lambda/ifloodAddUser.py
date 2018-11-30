# Add a user to the database and send them a message with a confirmation code

import boto3
import json
import re
import urllib.parse
import random

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

ses = boto3.client('ses') #AWS Simple Email Service
sns = boto3.client('sns') #AWS Simple Notification Service (for SMS)

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

    if emailRegex.search(data["primaryContact"]):
        userItem["primaryContact"] = data["primaryContact"]
        userItem["contactType"] = "email"
    elif phoneNumberRegex.search(data["primaryContact"]):
        userItem["primaryContact"] = data["primaryContact"]
        userItem["contactType"] = "phone"
    else:
        return errorOut("Please enter a vaild phone number or email address.")

    if not data.get("alerts"):
        return errorOut("Please select at least one alert.")

    userItem["alerts"] = json.dumps(data["alerts"])
    userItem["verified"] = False
    userItem["verifyCode"] = str(random.randint(100000,999999))

    verifyLink = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod/confirmuser?primaryContact="+urllib.parse.quote_plus(userItem["primaryContact"])+"&code="+urllib.parse.quote_plus(userItem["verifyCode"])

    #now we send their verification message
    if userItem["contactType"] == "email":
        response = ses.send_email(
            Source="iFLOOD Alerts <alerts@mail.iflood.vse.gmu.edu>",
            Destination={
                'ToAddresses': [
                    userItem["primaryContact"],
                ]
            },
            Message={
                'Subject': {
                    'Data': 'iFLOOD: Alerts Enabled',
                    'Charset': 'utf-8'
                },
                'Body': {
                    'Text': {
                        'Data': "Someone (hopefully you) requested GMU iFLOOD alerts for this email address. To confirm your registration, visit this link: "+verifyLink,
                        'Charset': 'utf-8'
                    }
                }
            }
        )
    elif userItem["contactType"] == "phone":
        response = sns.publish(
            PhoneNumber=userItem["primaryContact"],
            Message="GMU iFlood Alerts: To verify your registration, tap here: "+verifyLink,
        )

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