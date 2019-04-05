import boto3

import json, csv
import base64
import requests
import os
import datetime

#s3 setup
s3 = boto3.client("s3")

#twitter setup
client_key = os.environ['TWITTER_CLIENT_KET']
client_secret = os.environ['TWITTER_CLIENT_SECRET']

key_secret = '{}:{}'.format(client_key, client_secret).encode('ascii')
b64_encoded_key = base64.b64encode(key_secret)
b64_encoded_key = b64_encoded_key.decode('ascii')

auth_headers = {
    'Authorization': 'Basic {}'.format(b64_encoded_key),
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
}
auth_data = {
    'grant_type': 'client_credentials'
}
auth_resp = requests.post("https://api.twitter.com/oauth2/token", headers=auth_headers, data=auth_data)
access_token = auth_resp.json()['access_token']

# load in state abbreviations
with open('states.json') as statesFile:
    stateRaw = json.load(statesFile)
    stateLookup = {x.lower():stateRaw[x].lower() for x in stateRaw}

# time to (make the donuts) read in the cities
with open('uscities.csv', 'r', encoding='utf8') as citiesFile:
    cityReader = csv.DictReader(citiesFile)
    cities = [row for row in cityReader]
cityDict = dict()
for city in cities:
    cityDict[city['city'].lower() + ", " + city['state_id'].lower()] = (float(city['lat']),float(city['lng']))

def lambda_handler(event, context):
    search_headers = {
        'Authorization': 'Bearer {}'.format(access_token)
    }
    tweets = []
    nextQuery = "?q=%23flooding%20OR%20%23flood&39.8,-95.583,2500km&result_type=recent&count=100"
    for x in range(250):
        print("query {}".format(x))
        print(nextQuery)
        response = requests.get("https://api.twitter.com/1.1/search/tweets.json" + nextQuery, headers=search_headers).json()
        tweets += response['statuses']
        if 'next_results' in response['search_metadata']:
            nextQuery = response['search_metadata']['next_results']
        else:
            break

    points = []
    locationCounts = dict()
    for tweet in tweets:
        if tweet['user']['location']:
            parts = tweet['user']['location'].replace(", ",",").split(",")
            if len(parts) < 2:
                continue
            if parts[1].lower() in stateLookup: #replace state name with abbreviation
                parts[1] = stateLookup[parts[1].lower()]
            name = parts[0].lower() + ", " + parts[1].lower()
            if name in cityDict:
                points.append(cityDict[name])
                if name in locationCounts:
                    locationCounts[name] += 1
                else:
                    locationCounts[name] = 1
    print()
    print("{} locations found out of {} total tweets".format(len(points), len(tweets)))

    timestamp = datetime.datetime.today().strftime('%Y%m%d%H')

    fileBody = json.dumps(points)
    s3.put_object(
        Body=fileBody,
        Bucket="gmu-iflood-data",
        Key="SocialMedia/twitterFlood/points.json",
        ContentType="text/json",
        CacheControl="max-age=1800"
    )

    fileBody = json.dumps(locationCounts, ensure_ascii=False, indent=4)
    s3.put_object(
        Body=fileBody,
        Bucket="gmu-iflood-data",
        Key="SocialMedia/twitterFlood/"+timestamp+"/locations.json",
        ContentType="text/json"
    )

    fileBody = json.dumps(tweets, ensure_ascii=False, indent=4)
    s3.put_object(
        Body=fileBody,
        Bucket="gmu-iflood-data",
        Key="SocialMedia/twitterFlood/"+timestamp+"/tweets.json",
        ContentType="text/json"
    )