"""
This file calculates the average number of tweets found in each city so far. If you change how we search for tweets,
you'll want to delete the old historical data and re-run this after a while to get a new cityAverage.json file.
"""

import boto3
import json

s3 = boto3.client("s3")

response = s3.list_objects(
    Bucket='gmu-iflood-data',
    Prefix='SocialMedia/twitterFlood/',
    Delimiter='/'
)

folderNames = [x.get('Prefix') for x in response.get('CommonPrefixes')]

cityTotals = dict()
for folder in folderNames:
    print(folder)
    objResponse = s3.get_object(
        Bucket="gmu-iflood-data",
        Key=folder+"locations.json",
    )
    data = json.loads(objResponse['Body'].read().decode('utf-8'))
    for key in data:
        if key not in cityTotals:
            cityTotals[key] = 0
        cityTotals[key] += data[key]

print(cityTotals)

with open('cityTotals.json', 'w') as outfile:
    json.dump(cityTotals, outfile, indent=4, sort_keys=True)

cityAverage = {key:cityTotals[key]/len(folderNames) for key in cityTotals}

with open('cityAverage.json', 'w') as outfile:
    json.dump(cityAverage, outfile, indent=4, sort_keys=True)