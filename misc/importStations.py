#Used to import stations from a JSON file exported from Arslaan's spreadsheet (export to csv then convert csv to json)

import json

with open('stations.json') as f:
    data = json.load(f)

newData = {
    station["Abbreviaton"]:{
        "type":"iflood",
        "pos":{
            "lat": station["lat"],
            "lng": station["lon"]
        },
        "title":station["Fullname"],
        "stationStr":station["Abbreviaton"],
        "hasWater":True,
        "hasWind":True,
        "hasValidation":False,
        "hasWaves":True,
        # "floodLevels": [
        #     station["action (m)"],
        #     station["minor (m)"],
        #     station["moderate (m)"],
        #     station["major (m)"]
        # ],
        "agency":station["Agency"],
    }
    for station in data
    if station["Data Type"] == "iFLOOD"
}

with open('stationsOut.json', 'w') as outfile:
    json.dump(newData, outfile)