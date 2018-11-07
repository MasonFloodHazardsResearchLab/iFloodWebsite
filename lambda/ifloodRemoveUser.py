# Remove a user if requested

import boto3

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

ses = boto3.client('ses') #AWS Simple Email Service
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

    if not (data.get("primaryContact")):
        return errorOut("Something went wrong. Make sure you copied the entire URL.")

    response = userTable.get_item(
        Key={
            "primaryContact":data["primaryContact"]
        },
        ConsistentRead=True
    )

    if not response.get("Item"):
        return errorOut("Something went wrong. Make sure you copied the entire URL.")

    userItem = response.get("Item")

    #remove the user
    response = userTable.delete_item(
        Key={
            "primaryContact": data["primaryContact"]
        }
    )

    #send removal message
    if userItem["contactType"] == "email":
        response = ses.send_email(
            Source="iflood.test@williamoconnell.me",
            Destination={
                'ToAddresses': [
                    userItem["primaryContact"],
                ]
            },
            Message={
                'Subject': {
                    'Data': 'iFLOOD: Alerts Disabled',
                    'Charset': 'utf-8'
                },
                'Body': {
                    'Text': {
                        'Data': "You have successfully disabled iFLOOD alerts.",
                        'Charset': 'utf-8'
                    }
                }
            }
        )
    elif userItem["contactType"] == "phone":
        response = sns.publish(
            PhoneNumber=userItem["primaryContact"],
            Message="You have successfully disabled iFLOOD alerts.",
        )

    return {
        "isBase64Encoded": False,
        "statusCode": 302,
        "headers": {"Location": "http://iflood.vse.gmu.edu/alerts/removed"},
        "body": "http://iflood.vse.gmu.edu/alerts/success"
    }