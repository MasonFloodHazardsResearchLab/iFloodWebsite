import json
import requests

def lambda_handler(event, context):
	params = {x.lower():event['queryStringParameters'][x] for x in event['queryStringParameters']}
	params['application'] = 'GMU_iFlood'
	r = requests.get(
		'https://tidesandcurrents.noaa.gov/api/datagetter',
		params=params
	)
	return {
		'statusCode': 200,
		'headers':{
			'Content-Type':r.headers['Content-Type'],
			'Access-Control-Allow-Origin':'https://iflood.vse.gmu.edu'
		},
		'body': r.text
	}