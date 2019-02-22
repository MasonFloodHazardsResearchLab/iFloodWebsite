import json
import datetime
import email
import csv
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

    filename = "hobo/"+event["Records"][0]["ses"]["mail"]["messageId"]
    print("file: "+filename)
    objResponse = s3.get_object(
        Bucket="gmu-iflood-emails",
        Key=filename,
    )
    rawEmail = objResponse['Body'].read().decode('utf-8') # prepend all the lines except the header
    emailMsg = email.message_from_string(rawEmail)
    attachment = emailMsg.get_payload()[1]
    csvBody = attachment.get_payload(decode=True)

    timestamp = datetime.datetime.today().strftime('%Y%m%d%H')
    s3.put_object(
        Body=csvBody,
        Bucket="gmu-iflood-data",
        Key="IOT/hobo1/" + timestamp + ".csv",
        ContentType="text/csv"
    )

    return {
        'statusCode': 200,
        'body': json.dumps('success')
    }