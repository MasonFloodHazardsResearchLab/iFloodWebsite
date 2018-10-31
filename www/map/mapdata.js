let dataDomain = "https://d2dyvyp1m8y8xp.cloudfront.net";

let colorRanges = {
    "kindaJet":[
        [0,"#2700dc"],
        [0.2,"#007cff"],
        [0.35,"#00ffff"],
        [0.55,"#99ff66"],
        [0.7,"#ffff66"],
        [0.92,"#ff6600"],
        [1,"#e60000"]
    ],
    "viridis":[
        [0.0000,"#440154"],
        [0.0256,"#450a5c"],
        [0.0513,"#451263"],
        [0.0769,"#461b6b"],
        [0.1026,"#462372"],
        [0.1282,"#472c7a"],
        [0.1538,"#45337d"],
        [0.1795,"#423b81"],
        [0.2051,"#404284"],
        [0.2308,"#3d4a88"],
        [0.2564,"#3b518b"],
        [0.2821,"#38578c"],
        [0.3077,"#355e8c"],
        [0.3333,"#32648d"],
        [0.3590,"#2f6b8d"],
        [0.3846,"#2c718e"],
        [0.4103,"#2a778e"],
        [0.4359,"#287d8e"],
        [0.4615,"#25848d"],
        [0.4872,"#238a8d"],
        [0.5128,"#21908d"],
        [0.5385,"#22968b"],
        [0.5641,"#239c88"],
        [0.5897,"#25a186"],
        [0.6154,"#26a783"],
        [0.6410,"#27ad81"],
        [0.6667,"#34b47a"],
        [0.6923,"#42bb72"],
        [0.7179,"#4fc16b"],
        [0.7436,"#5cc863"],
        [0.7692,"#6ccc59"],
        [0.7949,"#7bd04f"],
        [0.8205,"#8bd446"],
        [0.8462,"#9ad83c"],
        [0.8718,"#aadc32"],
        [0.8974,"#bbde2f"],
        [0.9231,"#cbe02d"],
        [0.9487,"#dce32a"],
        [0.9744,"#ece528"],
        [1.0000,"#fde725"]
    ],
    "plasma":[
        [0.0000,"#0d0887"],
        [0.0256,"#19078c"],
        [0.0513,"#260691"],
        [0.0769,"#320597"],
        [0.1026,"#3f049c"],
        [0.1282,"#4b03a1"],
        [0.1538,"#5503a2"],
        [0.1795,"#5f03a4"],
        [0.2051,"#6903a5"],
        [0.2308,"#7303a7"],
        [0.2564,"#7d03a8"],
        [0.2821,"#8609a4"],
        [0.3077,"#8e0fa1"],
        [0.3333,"#97169d"],
        [0.3590,"#9f1c9a"],
        [0.3846,"#a82296"],
        [0.4103,"#af2990"],
        [0.4359,"#b6308a"],
        [0.4615,"#bd3885"],
        [0.4872,"#c43f7f"],
        [0.5128,"#cb4679"],
        [0.5385,"#d04d73"],
        [0.5641,"#d5556e"],
        [0.5897,"#db5c68"],
        [0.6154,"#e06463"],
        [0.6410,"#e56b5d"],
        [0.6667,"#ea7556"],
        [0.6923,"#ef804f"],
        [0.7179,"#f38a48"],
        [0.7436,"#f89441"],
        [0.7692,"#f99d3c"],
        [0.7949,"#faa737"],
        [0.8205,"#fbb032"],
        [0.8462,"#fcba2d"],
        [0.8718,"#fdc328"],
        [0.8974,"#face27"],
        [0.9231,"#f8d925"],
        [0.9487,"#f5e324"],
        [0.9744,"#f3ee22"],
        [1.0000,"#f0f921"]
    ],
    "bathymetry":[
        //[0.0000,"#fdfecc"],
        [0.0000,"#ffeacc"],
        [0.0100,"#fdfecc"],
        [0.0256,"#f0f9c6"],
        [0.0513,"#e3f4bf"],
        [0.0769,"#d5f0b9"],
        [0.1026,"#c8ebb2"],
        [0.1282,"#bbe6ac"],
        [0.1538,"#aee1aa"],
        [0.1795,"#a0dca8"],
        [0.2051,"#93d8a7"],
        [0.2308,"#85d3a5"],
        [0.2564,"#78cea3"],
        [0.2821,"#6fc6a3"],
        [0.3077,"#67bea3"],
        [0.3333,"#5eb6a3"],
        [0.3590,"#55aea3"],
        [0.3846,"#52a8a2"],
        [0.4103,"#50a1a1"],
        [0.4359,"#4d9ba0"],
        [0.4615,"#4b949f"],
        [0.4872,"#488e9e"],
        [0.5128,"#46889d"],
        [0.5385,"#44819b"],
        [0.5641,"#437b9a"],
        [0.5897,"#417498"],
        [0.6154,"#3f6e97"],
        [0.6410,"#3f6795"],
        [0.6667,"#3f6092"],
        [0.6923,"#405a90"],
        [0.7179,"#40538d"],
        [0.7436,"#404c8b"],
        [0.7692,"#3f4781"],
        [0.7949,"#3e4177"],
        [0.8205,"#3d3c6e"],
        [0.8462,"#3c3664"],
        [0.8718,"#3b315a"],
        [0.8974,"#372c51"],
        [0.9231,"#332848"],
        [0.9487,"#30233e"],
        [0.9744,"#2c1f35"],
        [1.0000,"#281a2c"]
    ],
    "velocityBlue":[
        [0.0000,"#112040"],
        [0.0256,"#15244a"],
        [0.0513,"#182855"],
        [0.0769,"#1c2c5f"],
        [0.1026,"#1f306a"],
        [0.1282,"#233474"],
        [0.1538,"#223a7c"],
        [0.1795,"#214084"],
        [0.2051,"#1f458c"],
        [0.2308,"#1e4b94"],
        [0.2564,"#1d519c"],
        [0.2821,"#1d579d"],
        [0.3077,"#1e5e9e"],
        [0.3333,"#1e64a0"],
        [0.3590,"#1f6ba1"],
        [0.3846,"#1f71a2"],
        [0.4103,"#2377a3"],
        [0.4359,"#277da5"],
        [0.4615,"#2a84a6"],
        [0.4872,"#2e8aa8"],
        [0.5128,"#3290a9"],
        [0.5385,"#3996aa"],
        [0.5641,"#419cac"],
        [0.5897,"#48a1ad"],
        [0.6154,"#50a7af"],
        [0.6410,"#57adb0"],
        [0.6667,"#67b3b3"],
        [0.6923,"#76b9b7"],
        [0.7179,"#86beba"],
        [0.7436,"#95c4bd"],
        [0.7692,"#a0c9c1"],
        [0.7949,"#abcec6"],
        [0.8205,"#b5d3ca"],
        [0.8462,"#c0d8cf"],
        [0.8718,"#cbddd3"],
        [0.8974,"#d5e3d7"],
        [0.9231,"#dfe9db"],
        [0.9487,"#eaefde"],
        [0.9744,"#f4f5e2"],
        [1.0000,"#fefbe6"]
    ],
    "blueRed":[
        [0.0000,"#0000ff"],
        [0.0256,"#0700f8"],
        [0.0513,"#0d00f2"],
        [0.0769,"#1400eb"],
        [0.1026,"#1a00e5"],
        [0.1282,"#2100de"],
        [0.1538,"#2700d8"],
        [0.1795,"#2e00d1"],
        [0.2051,"#3400cb"],
        [0.2308,"#3b00c4"],
        [0.2564,"#4100be"],
        [0.2821,"#4800b7"],
        [0.3077,"#4e00b1"],
        [0.3333,"#5500aa"],
        [0.3590,"#5c00a3"],
        [0.3846,"#62009d"],
        [0.4103,"#690096"],
        [0.4359,"#6f0090"],
        [0.4615,"#760089"],
        [0.4872,"#7c0083"],
        [0.5128,"#83007c"],
        [0.5385,"#890076"],
        [0.5641,"#90006f"],
        [0.5897,"#960069"],
        [0.6154,"#9d0062"],
        [0.6410,"#a3005c"],
        [0.6667,"#aa0055"],
        [0.6923,"#b1004e"],
        [0.7179,"#b70048"],
        [0.7436,"#be0041"],
        [0.7692,"#c4003b"],
        [0.7949,"#cb0034"],
        [0.8205,"#d1002e"],
        [0.8462,"#d80027"],
        [0.8718,"#de0021"],
        [0.8974,"#e5001a"],
        [0.9231,"#eb0014"],
        [0.9487,"#f2000d"],
        [0.9744,"#f80007"],
        [1.0000,"#ff0000"]
    ]
};

let layerGroups = [
    "GMU iFlood Data", //0
    "Third Party Data" //1
];

let layers = {
    "waterLevel": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Water Level",
        "temporal":true,
        "urls":[
            [0,"{_CURRENT_GMU_}/Splits/water/{_h_}.json"],
        ],
        "downloadUrl":"{_CURRENT_DOWNLOAD_}",
        "colorRange":colorRanges["kindaJet"],
        "colorBounds":[0,2],
        "colorProperty":"elemin",
        "unit":"m",
        "borderFix":false,
        "reverseBar":true,
        "z":2,
        "img":"/map/layerIcons/waterLevel.png",
        "description":"Predicted water levels from the iFLOOD forecast system forced by the North American Mesoscale (NAM) model and Astronomical Tides. Water level is in meters above the NAVD88 vertical datum.",
        "visible":false
    },
    "inundation": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Inundation",
        "urls":[
            [0,"{_CURRENT_GMU_}/GeoJson/maxinundation.json"]
        ],
        "downloadUrl":"{_CURRENT_DOWNLOAD_}/Downloadable_layers/Inundation/",
        "colorRange":colorRanges["kindaJet"],
        "colorBounds":[0,6],
        "colorProperty":"elemin",
        "unit":"m",
        "borderFix":false,
        "reverseBar":true,
        "z":1,
        "img":"/map/layerIcons/inundation.png",
        "description":"Predicted maximum inundation depth above ground for the next 84 hours. Inundation is in meters above NAVD88 datum.\n",
        "visible":false
    },
    "minpressure": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Atmospheric Pressure",
        "temporal":true,
        "urls":[
            [0,"{_CURRENT_GMU_}/Splits/pressure/{_h_}.json"],
        ],
        "downloadUrl":"{_CURRENT_DOWNLOAD_}/Downloadable_layers/Pressure/",
        "colorRange":colorRanges["plasma"],
        "colorBounds":[9,11],
        "colorProperty":"elemin",
        "unit":"kpa",
        "borderFix":true,
        "reverseBar":true,
        "z":4,
        "img":"/map/layerIcons/pressure.png",
        "description":"Atmospheric pressure at sea level in the model domain derived from the the North American Mesoscale (NAM) model for next 84 hour forecasts. Atmospheric pressure is given in Kilopascals.",
        "visible":false
    },
    "windmag": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Wind Magnitude",
        "temporal":true,
        "urls":[
            [0,"{_CURRENT_GMU_}/Splits/wind/{_h_}.json"],
        ],
        "downloadUrl":"{_CURRENT_DOWNLOAD_}/Downloadable_layers/Wind/",
        "colorRange":colorRanges["viridis"],
        "colorBounds":[0,80],
        "colorProperty":"elemin",
        "unit":"m/s",
        "borderFix":true,
        "reverseBar":true,
        "hasParticles":true,
        "particleUrl":"{_CURRENT_GMU_}/Splits/wind_vectors/{_h_}.json",
        "particleLat":"windx",
        "particleLng":"windy",
        "z":5,
        "img":"/map/layerIcons/wind.png",
        "description":"Wind speeds at the surface in the model domain derived from the the North American Mesoscale (NAM) model for next 84 hour forecasts. Winds speeds are given in meters per second.",
        "visible":false
    },
    "boundary": {
        "group":0,
        "type":"outline",
        "displayName":"Model Boundary",
        "temporal":true,
        "url":"https://d2dyvyp1m8y8xp.cloudfront.net/boundary/ModelBoundary.json",
        "downloadUrl":"https://d2dyvyp1m8y8xp.cloudfront.net/boundary/ModelBoundary.json",
        "color":"#e13835",
        "z":10,
        "img":"/map/layerIcons/boundary.png",
        "description":"Numerical model domain for iFlood forecast System.",
        "visible":false
    },
    // "precip": {
    //     "type":"wmsTile",
    //     "displayName":"CERA Precip",
    //     "url":"https://tc2.nccera-5.renci.org/cerarisk/ceracgi/cera_wms_tiled?day=20180914&time=1200&com=9267&griddomain=HSOFS&tz=utc&unit=ft&legend=nc&ceraversion=8&query=elev&timestep_precimg=prechc24",
    //     "img":"/map/layerIcons/ceraPrecip.png",
    //     "description":"Here there could be some text that explains something about the data, where it came from, how to interpret it, etc.",
    //     "visible":false
    // },
    "precip": {
        "group":1,
        "type":"arcGIS",
        "displayName":"24 Hour Precip",
        "url":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer",
        "downloadUrl":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/19",
        "gisLayer":"19",
        "img":"/map/layerIcons/temp.png",
        "description":"24-Hr Quantitative Precipitation Accumulation from NOAA",
        "visible":false
    },
    "bathy": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Bathymetry",
        "urls":[
            [0,"https://d2dyvyp1m8y8xp.cloudfront.net/CBbathy/BathyV0.json"]
        ],
        "downloadUrl":"https://d2dyvyp1m8y8xp.cloudfront.net/CBbathy/BathyV0.json",
        "colorRange":colorRanges["bathymetry"],
        "colorBounds":[0,5000],
        "colorProperty":"dmax",
        "unit":"m",
        "borderFix":true,
        "reverseBar":false,
        "z":0,
        "img":"/map/layerIcons/bathy.png",
        "description":"Depth of water in the model domain is derived from National Geophysical Data Center's Coastal Relief Model (CRM) and NOAA digital nautical charts. Bathymetry is given in meters.",
        "visible":false
    },
    "stormPath": {
        "group":1,
        "type":"stormPath",
        "displayName":"Storm Paths",
        "pointUrl":"{_CURRENT_GMU_}/NHCHurricanes/Hurricane/hurricane_points.json",
        "pathUrl":"{_CURRENT_GMU_}/NHCHurricanes/Hurricane/hurricane_track.json",
        "polygonUrl":"{_CURRENT_GMU_}/NHCHurricanes/Hurricane/hurricane_polygon.json",
        "pathSprites":{
            "HU":"/map/sprites/hurricane.svg",
            "TS":"/map/sprites/storm.svg"
        },
        "downloadUrl":"https://www.nhc.noaa.gov/",
        "z":8,
        "img":"/map/layerIcons/stormPath.png",
        "description":"Predicted path of storms from NHC.<br><img src='/map/sprites/hurricane.svg' width='28'>Hurricane<br><img src='/map/sprites/storm.svg' width='28'>Storm<br><img src='/map/sprites/depression.svg' width='28'>Depression",
        "visible":false
    }
    // "cacheTest": {
    //     "type":"cachedTile",
    //     "displayName":"Cache Test",
    //     "url":"https://d2dyvyp1m8y8xp.cloudfront.net/cacheTest/",
    //     "img":"/map/layerIcons/temp.png",
    //     "description":"Here there could be some text that explains something about the data, where it came from, how to interpret it, etc.",
    //     "visible":false
    // }
};

let stationValidationUrl = "{_CURRENT_GMU_}/TimeSeries/plotly_bias24.tsv";
let markers = {
    "DC": {
        "pos": {
            lat: 38.8545966284, lng: -77.0245558832
        },
        "title":"District of Columbia",
        "stationStr":"WASD2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/WASD2.tsv",
        "hasWind":true,
        "floodLevels": [
            3.7,
            4.2,
            5.3,
            7.0
        ]
    },
    "BH": {
        "pos": {
            lat: 38.216639, lng: -76.036183
        },
        "title":"Bishop head",
        "stationStr":"BISM2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/BISM2.tsv",
        "hasWind":true,
        "floodLevels": [
            3.0,
            3.2,
            3.7,
            4.2
        ]
    },
    "BD": {
        "pos": {
            lat: 39.266101, lng: -76.577572
        },
        "title":"Baltimore",
        "stationStr":"BLTM2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/BLTM2.tsv",
        "hasWind":true,
        "floodLevels": [
            2.5,
            3.0,
            5.0,
            6.0
        ]
    },
    "AN": {
        "pos": {
            lat: 38.986885860000, lng: -76.479876450000
        },
        "title":"Annapolis",
        "stationStr":"APAM2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/APAM2.tsv",
        "hasWind":false,
        "floodLevels": [
            2.0,
            2.6,
            3.3,
            6.0
        ]
    },
    "SO": {
        "pos": {
            lat: 38.315748310000, lng: -76.449921330000
        },
        "title":"Solomons Island",
        "stationStr":"SLIM2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/SLIM2.tsv",
        "hasWind":true,
        "floodLevels": [
            2.5,
            3.0,
            4.0,
            5.0
        ]
    },
    "KP": {
        "pos": {
            lat: 37.163433530000, lng: -75.995395910000
        },
        "title":"Kiptopeke",
        "stationStr":"KPTV2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/KPTV2.tsv",
        "hasWind":true,
        "floodLevels": [
            4.0,
            4.5,
            5.0,
            5.5
        ]
    },
    "SP": {
        "pos": {
            lat: 36.950165530000, lng: -76.335476530000
        },
        "title":"Sewells Point",
        "stationStr":"SWPV2",
        "timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/SWPV2.tsv",
        "hasWind":false,
        "floodLevels": [
            4.0,
            4.5,
            5.5,
            6.5
        ]
    },
    "CB": {
        "pos": {
            lat: 36.964541507100, lng: -76.123066553300
        },
        "title":"Chesapeake Bay Bridge Tunnel",
        "stationStr":"CBBV2",
        //"timeSeriesUrl":"{_CURRENT_GMU_}/TimeSeries/SWPV2.tsv",
        //"hasWind":true,
        "floodLevels": [
            5.0,
            5.5,
            6.0,
            8.0
        ],
        "notice":"Data for this station is temporarily unavailable."
    },
};

let places = {
    "DC": {
        "displayName":"Washington, DC",
        "img":"/map/placeIcons/dc.png",
        "pos": {
            lat: 38.8545966284, lng: -77.0245558832
        },
        "zoom":12
    },
    "chesapeake": {
        "displayName":"Chesapeake",
        "img":"/map/placeIcons/chesapeake.png",
        "pos": {
            lat: 38.2, lng: -76.325
        },
        "zoom":8
    }
};