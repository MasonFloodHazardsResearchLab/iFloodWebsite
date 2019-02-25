import json
import datetime
import email
import csv
import io
import boto3

s3 = boto3.client("s3")


def lambda_handler(event, context):
    print(event)
    if event["Records"][0]["ses"]["mail"]["commonHeaders"]["from"][0] != "hobolink-no-reply@hobolink.com":
        print("ignored")
        return {
            'statusCode': 200,
            'body': json.dumps('ignored')
        }

    filename = "hobo/" + event["Records"][0]["ses"]["mail"]["messageId"]
    print("file: " + filename)
    objResponse = s3.get_object(
        Bucket="gmu-iflood-emails",
        Key=filename,
    )
    rawEmail = objResponse['Body'].read().decode('utf-8')  # prepend all the lines except the header
    emailMsg = email.message_from_string(rawEmail)
    attachment = emailMsg.get_payload()[1]
    csvBody = attachment.get_payload(decode=True).decode('utf-8')

    dataList = csvBody.split("\n")
    dataReader = csv.DictReader(dataList)
    selRows = []
    for row in dataReader:
        selected = dict()
        selected['date'] = datetime.datetime.strptime(row['Date'],"%m/%d/%y %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
        selected['battery'] = row['Battery (RX3000 BATTERY 20160692:20160692-B), V, Neptune']
        selected['wind_speed'] = row['Wind Speed (S-WCF 20160692:20199524-1), m/s, Neptune']
        selected['gust_speed'] = row['Gust Speed (S-WCF 20160692:20199524-2), m/s, Neptune']
        selected['wind_direction'] = row['Wind Direction (S-WCF 20160692:20199524-3), *, Neptune']
        selected['rain_level'] = row['Inches of Rain (S-UCD 20160692:20153413-1), Inches, Neptune Rainfall']
        selected['water_level'] = str(float(row['Water Level (T-SDX-93720 (0-5 ft) 20160692:20142885-3), meters, Neptune']) - 0.52) if row['Water Level (T-SDX-93720 (0-5 ft) 20160692:20142885-3), meters, Neptune'] != "" else ""
        selRows.append(selected)
    fields = ['date', 'battery', 'wind_speed', 'gust_speed', 'wind_direction', 'rain_level', 'water_level']
    outStr = io.StringIO()
    selectedWriter = csv.DictWriter(outStr, fields)
    selectedWriter.writeheader()
    for row in selRows:
        selectedWriter.writerow(row)
    processedBody = outStr.getvalue()

    timestamp = datetime.datetime.today().strftime('%Y%m%d%H')
    # write processed data
    s3.put_object(
        Body=processedBody,
        Bucket="gmu-iflood-data",
        Key="IOT/hobo1/" + timestamp + ".csv",
        ContentType="text/csv"
    )

    # update recent.txt
    objResponse = s3.get_object(
        Bucket="gmu-iflood-data",
        Key="IOT/hobo1/recent.txt",
    )
    oldRecents = objResponse['Body'].read().decode('utf-8').split(',')
    newRecents = [timestamp] + oldRecents[:3]
    recentString = ",".join(newRecents)
    s3.put_object(
        Body=recentString,
        Bucket="gmu-iflood-data",
        Key="IOT/hobo1/recent.txt",
        ContentType="text/plain",
        CacheControl="max-age=3600"
    )

    # generate running file
    runningData = "\n".join(processedBody.split("\n")[1:])
    for id in newRecents[1:]:
        objResponse = s3.get_object(
            Bucket="gmu-iflood-data",
            Key="IOT/hobo1/" + id + ".csv",
        )
        runningData = "\n".join(objResponse['Body'].read().decode('utf-8').split("\n")[1:]) + runningData  # prepend all the lines except the header
    runningBody = ",".join(fields) + "\n" + runningData
    s3.put_object(
        Body=runningBody,
        Bucket="gmu-iflood-data",
        Key="IOT/hobo1/running.csv",
        ContentType="text/csv",
        CacheControl="max-age=3600"
    )

    return {
        'statusCode': 200,
        'body': json.dumps('success')
    }