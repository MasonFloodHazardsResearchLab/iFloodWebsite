# Send out alerts to all verified users

import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import urllib.parse

dynamodb = boto3.resource('dynamodb')
userTable = dynamodb.Table('ifloodAlertsUsers')

ses = boto3.client('ses') #AWS Simple Email Service
sns = boto3.client('sns') #AWS Simple Notification Service (for SMS)
s3 = boto3.client('s3') #AWS S3

floodLevelNumbers = {
    "None":0,
    "Action":1,
    "Minor":2,
    "Moderate":3,
    "Major":4
}

def lambda_handler(event, context):
    #get flood levels from s3 file
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="Forecast/"+event["forecastID"]+"/GeoJson/Floodlevels.json"
    )
    floodLevels = json.loads(response['Body'].read().decode('utf-8'))

    allUsers = []

    #scan DynamoDB for all users who are verified
    response = userTable.scan(
        FilterExpression=Key('verified').eq(True)
    )
    allUsers += response['Items']
    while "LastEvaluatedKey" in response:
        response = userTable.scan(
            FilterExpression=Key('verified').eq(True),
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        allUsers += response['Items']

    for userItem in allUsers:
        chosenAlerts = json.loads(userItem["alerts"])
        alertTripped = False #if this stays false then no alerts were triggered
        alertMessage = "iFLOOD Alert:\n\n"
        if chosenAlerts.get("stations"):
            stationsFlooded = []
            for station in chosenAlerts["stations"]:
                if station in floodLevels and floodLevelNumbers[floodLevels[station]["Flood Level"]] >= chosenAlerts["stations"][station] and chosenAlerts["stations"][station] > 0:
                    stationsFlooded.append((station,floodLevels[station]["Flood Level"]))
            if stationsFlooded:
                alertTripped = True
                alertMessage += "Station Flood Levels:\n"
                for stationStatus in stationsFlooded:
                    alertMessage += stationStatus[0] + ": " + stationStatus[1] + "\n"
                alertMessage += "\n"

        unsubLink = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod/removeuser?primaryContact="+urllib.parse.quote_plus(userItem["primaryContact"])

        if alertTripped:
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
                            'Data': 'iFLOOD Alert',
                            'Charset': 'utf-8'
                        },
                        'Body': {
                            'Text': {
                                'Data': alertMessage+"\n\nTo disable iFLOOD alerts, visit this link: "+unsubLink,
                                'Charset': 'utf-8'
                            }
                        }
                    }
                )
            elif userItem["contactType"] == "phone":
                response = sns.publish(
                    PhoneNumber=userItem["primaryContact"],
                    Message=alertMessage,
                )

# if __name__ == "__main__":
#     lambda_handler({"forecastID":"2018110712"}, None)