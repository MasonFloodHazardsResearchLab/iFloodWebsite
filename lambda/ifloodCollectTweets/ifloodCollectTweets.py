import boto3

import json, csv
import base64
import requests
import os

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


def lambda_handler(event, context):
    search_headers = {
        'Authorization': 'Bearer {}'.format(access_token)
    }
    tweets = []
    nextQuery = "?q=%23flooding%20OR%20%23flood&geocode=38.033,-76.335,500mi&result_type=recent&count=100"
    for x in range(100):
        print("query {}".format(x))
        print(nextQuery)
        response = requests.get("https://api.twitter.com/1.1/search/tweets.json" + nextQuery, headers=search_headers).json()
        tweets += response['statuses']
        if 'next_results' in response['search_metadata']:
            nextQuery = response['search_metadata']['next_results']
        else:
            break

    # time to (make the donuts) read in the cities
    with open('uscities.csv', 'r', encoding='utf8') as citiesFile:
        cityReader = csv.DictReader(citiesFile)
        cities = [row for row in cityReader]

    locations = []
    locationNames = set()

    for tweet in tweets:
        if tweet['user']['location'] and ", " in tweet['user']['location']:
            parts = tweet['user']['location'].split(", ")
            for city in cities:
                if city['city'].lower() == parts[0].lower() and city['state_id'].lower() == parts[1].lower():
                    locations.append((
                        float(city['lat']),
                        float(city['lng'])
                    ))
                    locationNames.add(parts[0].lower() + ", " + parts[1].lower())
                    break
    print()
    print("{} locations found out of {} total tweets".format(len(locations), len(tweets)))

    fileBody = json.dumps(locations)

    s3.put_object(
        Body=fileBody,
        Bucket="gmu-iflood-data",
        Key="SocialMedia/twitterLocations.json",
        ContentType="text/json"
    )