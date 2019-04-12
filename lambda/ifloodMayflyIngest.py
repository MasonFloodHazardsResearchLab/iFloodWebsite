import json
import datetime
import boto3
import re

s3 = boto3.client("s3")


def lambda_handler(event, context):
    print(event)
    sensorId = event["body"].split("\n")[0]
    timestamp = datetime.datetime.today().strftime('%Y%m%d%H')
    data = "\n".join(event["body"].split("\n")[1:])
    fileBody = "date,water_level\n" + data
    s3.put_object(
        Body=fileBody,
        Bucket="gmu-iflood-data",
        Key="IOT/" + sensorId + "/" + timestamp + ".csv",
        ContentType="text/csv"
    )

    objResponse = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="IOT/" + sensorId + "/" + "recent.txt",
    )
    oldRecents = objResponse['Body'].read().decode('utf-8').split(',')
    newRecents = [timestamp] + oldRecents[:3]
    recentString = ",".join(newRecents)
    s3.put_object(
        Body=recentString,
        Bucket="gmu-iflood-data",
        Key="IOT/" + sensorId + "/recent.txt",
        ContentType="text/plain",
        CacheControl="max-age=3600"
    )
    # generate running file
    runningData = "\n".join(event["body"].split("\n")[1:])
    for id in newRecents[1:]:
        objResponse = s3.get_object(
            Bucket="gmu-iflood-data",
            Key="IOT/" + sensorId + "/" + id + ".csv",
        )
        dataLines = objResponse['Body'].read().decode('utf-8').split("\n")[1:] # all the lines except the header
        runningData = "\n".join([x for x in dataLines if not re.match(r".*,-9999",x)]) + runningData # remove -9999 data points (it reports that when it can't get a good reading)
    runningBody = "date,water_level\n" + runningData
    s3.put_object(
        Body=runningBody,
        Bucket="gmu-iflood-data",
        Key="IOT/" + sensorId + "/running.csv",
        ContentType="text/csv",
        CacheControl="max-age=3600"
    )

    return {
        'statusCode': 200,
        'body': json.dumps('success')
    }