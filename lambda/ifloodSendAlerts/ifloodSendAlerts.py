# Send out alerts to all verified users
from __future__ import absolute_import
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import urllib.parse
from shapely.geometry import Point, shape

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

with open('alertEmail.html', 'r') as emailFile:
    emailTemplate = emailFile.read()

def lambda_handler(event, context):
    #get flood levels from s3 file
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="Forecast/ChesapeakeBay_ADCIRCSWAN/"+event["forecastID"]+"/GeoJson/Floodlevels.json"
    )
    floodLevels = json.loads(response['Body'].read().decode('utf-8'))
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["PreviousforecastID"] + "/GeoJson/Floodlevels.json"
    )
    oldFloodLevels = json.loads(response['Body'].read().decode('utf-8'))

    #get inundation
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["forecastID"] + "/GeoJsonHigh/maxinundationfull.json"
    )
    inundation = json.loads(response['Body'].read().decode('utf-8'))
    inundationShapes = []
    for feature in inundation['features']:
        inundationShapes.append((
            shape(feature['geometry']),
            feature['properties']['elemin']
        ))
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["PreviousforecastID"] + "/GeoJsonHigh/maxinundationfull.json"
    )
    oldInundation = json.loads(response['Body'].read().decode('utf-8'))
    oldInundationShapes = []
    for feature in oldInundation['features']:
        oldInundationShapes.append((
            shape(feature['geometry']),
            feature['properties']['elemin']
        ))

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
        alertMessage = "iFLOOD Alert:\n"
        if chosenAlerts.get("stations"):
            stationsFlooded = []
            for station in chosenAlerts["stations"]:
                if station in floodLevels and station in oldFloodLevels and chosenAlerts["stations"][station] > 0: #make sure their selection is valid
                    if floodLevelNumbers[floodLevels[station]["Flood Level"]] >= chosenAlerts["stations"][station]\
                    and floodLevelNumbers[oldFloodLevels[station]["Flood Level"]] < chosenAlerts["stations"][station]: #only trigger for stations that have just now gone above the user's threshold
                        stationsFlooded.append((station,floodLevels[station]["Flood Level"]))
            if stationsFlooded:
                alertTripped = True
                alertMessage += "\nPredicted Station Flood Levels:\n"
                for stationStatus in stationsFlooded:
                    alertMessage += stationStatus[0] + ": " + stationStatus[1] + "\n"
        if chosenAlerts.get("locations"):
            locationsFlooded = []
            for location in chosenAlerts["locations"]:
                point = Point(location["lng"],location["lat"])
                floodHeight = 0
                for poly in inundationShapes: #poly is a tuple: (shape, height)
                    if poly[0].contains(point) and poly[1] > floodHeight:
                        floodHeight = poly[1]
                oldFloodHeight = 0
                for poly in oldInundationShapes: #poly is a tuple: (shape, height)
                    if poly[0].contains(point) and poly[1] > oldFloodHeight:
                        oldFloodHeight = poly[1]
                if floodHeight > oldFloodHeight:
                    locationsFlooded.append((
                        location["displayName"],
                        floodHeight
                    ))
            if locationsFlooded:
                alertTripped = True
                alertMessage += "\nPredicted Inundation:\n"
                for locationStatus in locationsFlooded:
                    alertMessage += locationStatus[0] + ": " + str(locationStatus[1]) + " meters\n"

        mapLink = "https://iflood.vse.gmu.edu/map/#inundation"
        unsubLink = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod/removeuser?primaryContact="+urllib.parse.quote_plus(userItem["primaryContact"])

        print(userItem["primaryContact"])

        if alertTripped:
            print("run")
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
                            'Data': 'iFLOOD Alert',
                            'Charset': 'utf-8'
                        },
                        'Body': {
                            'Text': {
                                'Data': alertMessage+"\n\n\nTo disable iFLOOD alerts, visit this link: "+unsubLink,
                                'Charset': 'utf-8'
                            },
                            'Html': {
                                'Data': emailTemplate #this is formatted in the style of a jinja template but it's just string replacements
                                    .replace("{{ alertText }}",alertMessage)
                                    .replace("{{ mapLink }}", mapLink)
                                    .replace("{{ unsubscribeLink }}",unsubLink),
                                'Charset': 'utf-8'
                            }

                        }
                    }
                )
            elif userItem["contactType"] == "phone":
                response = sns.publish(
                    PhoneNumber=userItem["primaryContact"],
                    Message=alertMessage+"\nView Data:\n"+mapLink,
                )

# if __name__ == "__main__":
#     lambda_handler({
#         "forecastID": "2018121118",
#         "PreviousforecastID": "2018121106"
#     }, None)