# Send out alerts to all verified users
#from __future__ import absolute_import
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

waveLevelNumbers = {
    "Calm":0,
    "Action":1,
    "Major_swell":2
}

with open('alertEmail.html', 'r') as emailFile:
    emailTemplate = emailFile.read()

def loadJSONFromS3(filename):
    print("Downloading: "+filename)
    response = s3.get_object(
        Bucket="gmu-iflood-data",
        Key=filename
    )
    return json.loads(response['Body'].read().decode('utf-8'))

def lambda_handler(event, context):
    #get flood levels from s3 file
    floodLevels = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/"+event["forecastID"]+"/GeoJson/Floodlevels.json")
    oldFloodLevels = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["PreviousforecastID"] + "/GeoJson/Floodlevels.json")

    #get wave levels
    waveLevels = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["forecastID"] + "/GeoJson/wavelevels.json")
    oldWaveLevels = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["PreviousforecastID"] + "/GeoJson/wavelevels.json")

    #get inundation
    inundation = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["forecastID"] + "/GeoJsonHigh/maxinundationfull.json")
    inundationShapes = []
    for feature in inundation['features']:
        inundationShapes.append((
            shape(feature['geometry']),
            feature['properties']['elemin']
        ))
    oldInundation = loadJSONFromS3("Forecast/ChesapeakeBay_ADCIRCSWAN/" + event["PreviousforecastID"] + "/GeoJsonHigh/maxinundationfull.json")
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
        alertMessage = ("🌎 " if userItem["contactType"] == "phone" else "") + "iFLOOD Alert:\n"
        if chosenAlerts.get("water"):
            waterFlooded = {}
            for station in chosenAlerts["water"]:
                if station == "*ALL*":
                    for listedStation in floodLevels:
                        if floodLevelNumbers[floodLevels[listedStation]["Flood Level"]] >= chosenAlerts["water"]["*ALL*"] > floodLevelNumbers[oldFloodLevels[listedStation]["Flood Level"]]:  # only trigger for stations that have just now gone above the user's threshold
                            waterFlooded[listedStation] = floodLevels[listedStation]
                elif station in floodLevels and station in oldFloodLevels and chosenAlerts["water"][station] > 0: #make sure their selection is valid
                    if floodLevelNumbers[floodLevels[station]["Flood Level"]] >= chosenAlerts["water"][station] > floodLevelNumbers[oldFloodLevels[station]["Flood Level"]]:
                        waterFlooded[station] = floodLevels[station]
            if waterFlooded:
                alertTripped = True
                alertMessage += "\n" + ("💧 " if userItem["contactType"] == "phone" else "") + "Predicted Station Flood Levels:\n"
                for station, status in waterFlooded.items():
                    if userItem["contactType"] == "phone":
                        alertMessage += (status["Full Name"] if "Full Name" in status else station) + ":\n" + status["Flood Level"] + " ("+str(status["Flood Stage"])+"m)\n"
                    else:
                        alertMessage += (status["Full Name"] if "Full Name" in status else station) + ": " + status["Flood Level"] + " (" + str(status["Flood Stage"]) + "m) at " + status["Flood Time"] + "\n"
        if chosenAlerts.get("waves"):
            wavesFlooded = {}
            for station in chosenAlerts["waves"]:
                if station == "*ALL*":
                    for listedStation in waveLevels:
                        if waveLevelNumbers[waveLevels[listedStation]["Flood Level"]] >= chosenAlerts["waves"]["*ALL*"] > waveLevelNumbers[oldWaveLevels[listedStation]["Flood Level"]]:  # only trigger for stations that have just now gone above the user's threshold
                            wavesFlooded[listedStation] = waveLevels[listedStation]
                elif station in waveLevels and station in oldWaveLevels and chosenAlerts["waves"][station] > 0: #make sure their selection is valid
                    if waveLevelNumbers[waveLevels[station]["Flood Level"]] >= chosenAlerts["waves"][station] > waveLevelNumbers[oldWaveLevels[station]["Flood Level"]]:
                        wavesFlooded[station] = waveLevels[station]
            if wavesFlooded:
                alertTripped = True
                alertMessage += "\n" + ("🌊 " if userItem["contactType"] == "phone" else "") + "Predicted Wave Heights:\n"
                for station, status in wavesFlooded.items():
                    if userItem["contactType"] == "phone":
                        alertMessage += (status["Full Name"] if "Full Name" in status else station) + ":\n" + status["Flood Level"] + " ("+str(status["Flood Stage"])+"m)\n"
                    else:
                        alertMessage += (status["Full Name"] if "Full Name" in status else station) + ": " + status["Flood Level"] + " (" + str(status["Flood Stage"]) + "m)\n"
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
                alertMessage += "\n" + ("📍 " if userItem["contactType"] == "phone" else "") + "Predicted Inundation:\n"
                for locationStatus in locationsFlooded:
                    alertMessage += locationStatus[0] + ": " + str(locationStatus[1]) + " meters\n"

        mapLink = "https://iflood.vse.gmu.edu/map/#inundation"
        unsubLink = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod/removeuser?primaryContact="+urllib.parse.quote_plus(userItem["primaryContact"])
        updateLink = "https://iflood.vse.gmu.edu/alerts#" + userItem["primaryContact"] + "," + userItem["verifyCode"]

        if alertTripped and userItem["primaryContact"]:
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
                                    .replace("{{ updateLink }}", updateLink)
                                    .replace("{{ unsubscribeLink }}", unsubLink),
                                'Charset': 'utf-8'
                            }
                        }
                    }
                )
            elif userItem["contactType"] == "phone":
                response = sns.publish(
                    PhoneNumber=userItem["primaryContact"],
                    Message=alertMessage+"\n🗺️ View Data:\n"+mapLink,
                )

# if __name__ == "__main__":
#     lambda_handler({
#         "forecastID": "2019010806",
#         "PreviousforecastID": "2019010818"
#     }, None)