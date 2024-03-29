let dataDomain = "https://data.iflood.vse.gmu.edu";

let colorRanges = {
    "jet":[
        [0.0000,"#000083"],
        [0.0256,"#000c8b"],
        [0.0513,"#001893"],
        [0.0769,"#00249a"],
        [0.1026,"#0030a2"],
        [0.1282,"#003caa"],
        [0.1538,"#0150b3"],
        [0.1795,"#0163bb"],
        [0.2051,"#0277c4"],
        [0.2308,"#028acc"],
        [0.2564,"#039ed5"],
        [0.2821,"#03b1dd"],
        [0.3077,"#04c5e6"],
        [0.3333,"#04d8ee"],
        [0.3590,"#05ecf7"],
        [0.3846,"#05ffff"],
        [0.4103,"#21ffe3"],
        [0.4359,"#3dffc6"],
        [0.4615,"#58ffaa"],
        [0.4872,"#74ff8e"],
        [0.5128,"#90ff71"],
        [0.5385,"#acff55"],
        [0.5641,"#c7ff39"],
        [0.5897,"#e3ff1c"],
        [0.6154,"#ffff00"],
        [0.6410,"#ffe600"],
        [0.6667,"#fecc00"],
        [0.6923,"#feb300"],
        [0.7179,"#fd9900"],
        [0.7436,"#fd8000"],
        [0.7692,"#fc6600"],
        [0.7949,"#fc4d00"],
        [0.8205,"#fb3300"],
        [0.8462,"#fb1900"],
        [0.8718,"#fa0000"],
        [0.8974,"#e20000"],
        [0.9231,"#c90000"],
        [0.9487,"#b10000"],
        [0.9744,"#980000"],
        [1.0000,"#800000"]
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
        [0.0000,"#f28ea0"],
        [0.0030,"#ffcfc8"],
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
        [0.0, '#fefbe6'],
        [0.0256, '#f4f5e2'],
        [0.0513, '#eaefde'],
        [0.0769, '#dfe9db'],
        [0.1026, '#d5e3d7'],
        [0.1282, '#cbddd3'],
        [0.1538, '#c0d8cf'],
        [0.1795, '#b5d3ca'],
        [0.2051, '#abcec6'],
        [0.2308, '#a0c9c1'],
        [0.2564, '#95c4bd'],
        [0.2821, '#86beba'],
        [0.3077, '#76b9b7'],
        [0.3333, '#67b3b3'],
        [0.359, '#57adb0'],
        [0.3846, '#50a7af'],
        [0.4103, '#48a1ad'],
        [0.4359, '#419cac'],
        [0.4615, '#3996aa'],
        [0.4872, '#3290a9'],
        [0.5128, '#2e8aa8'],
        [0.5385, '#2a84a6'],
        [0.5641, '#277da5'],
        [0.5897, '#2377a3'],
        [0.6154, '#1f71a2'],
        [0.641, '#1f6ba1'],
        [0.6667, '#1e64a0'],
        [0.6923, '#1e5e9e'],
        [0.7179, '#1d579d'],
        [0.7436, '#1d519c'],
        [0.7692, '#1e4b94'],
        [0.7949, '#1f458c'],
        [0.8205, '#214084'],
        [0.8462, '#223a7c'],
        [0.8718, '#233474'],
        [0.8974, '#1f306a'],
        [0.9231, '#1c2c5f'],
        [0.9487, '#182855'],
        [0.9744, '#15244a'],
        [1.0, '#112040']
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
    ],
    "winter":[
        [0.0000,"#0000ff"],
        [0.0256,"#0007fc"],
        [0.0513,"#000df8"],
        [0.0769,"#0014f5"],
        [0.1026,"#001af2"],
        [0.1282,"#0021ef"],
        [0.1538,"#0027eb"],
        [0.1795,"#002ee8"],
        [0.2051,"#0034e5"],
        [0.2308,"#003be2"],
        [0.2564,"#0041de"],
        [0.2821,"#0048db"],
        [0.3077,"#004ed8"],
        [0.3333,"#0055d5"],
        [0.3590,"#005cd1"],
        [0.3846,"#0062ce"],
        [0.4103,"#0069cb"],
        [0.4359,"#006fc8"],
        [0.4615,"#0076c4"],
        [0.4872,"#007cc1"],
        [0.5128,"#0083be"],
        [0.5385,"#0089bb"],
        [0.5641,"#0090b7"],
        [0.5897,"#0096b4"],
        [0.6154,"#009db1"],
        [0.6410,"#00a3ae"],
        [0.6667,"#00aaaa"],
        [0.6923,"#00b1a7"],
        [0.7179,"#00b7a4"],
        [0.7436,"#00bea1"],
        [0.7692,"#00c49d"],
        [0.7949,"#00cb9a"],
        [0.8205,"#00d197"],
        [0.8462,"#00d894"],
        [0.8718,"#00de90"],
        [0.8974,"#00e58d"],
        [0.9231,"#00eb8a"],
        [0.9487,"#00f287"],
        [0.9744,"#00f883"],
        [1.0000,"#00ff80"]
    ],
    "velocity-green":[
        [0.0000,"#172313"],
        [0.0256,"#172917"],
        [0.0513,"#172f1b"],
        [0.0769,"#18341e"],
        [0.1026,"#183a22"],
        [0.1282,"#184026"],
        [0.1538,"#154627"],
        [0.1795,"#134c29"],
        [0.2051,"#10532a"],
        [0.2308,"#0e592c"],
        [0.2564,"#0b5f2d"],
        [0.2821,"#11652b"],
        [0.3077,"#166a29"],
        [0.3333,"#1c7027"],
        [0.3590,"#217525"],
        [0.3846,"#277b23"],
        [0.4103,"#32801e"],
        [0.4359,"#3d841a"],
        [0.4615,"#498915"],
        [0.4872,"#548d11"],
        [0.5128,"#5f920c"],
        [0.5385,"#6a960d"],
        [0.5641,"#769a0e"],
        [0.5897,"#819d10"],
        [0.6154,"#8da111"],
        [0.6410,"#98a512"],
        [0.6667,"#a4aa1f"],
        [0.6923,"#b1b02c"],
        [0.7179,"#bdb538"],
        [0.7436,"#c9ba45"],
        [0.7692,"#cfc053"],
        [0.7949,"#d6c660"],
        [0.8205,"#dccc6e"],
        [0.8462,"#e3d27b"],
        [0.8718,"#e9d889"],
        [0.8974,"#eddf97"],
        [0.9231,"#f2e7a4"],
        [0.9487,"#f6eeb2"],
        [0.9744,"#fbf6bf"],
        [1.0000,"#fffdcd"]
    ],
    "density":[
        [0.0000,"#360e24"],
        [0.0256,"#3d102d"],
        [0.0513,"#441236"],
        [0.0769,"#4b133e"],
        [0.1026,"#521547"],
        [0.1282,"#591750"],
        [0.1538,"#5d1b5a"],
        [0.1795,"#612065"],
        [0.2051,"#66246f"],
        [0.2308,"#6a297a"],
        [0.2564,"#6e2d84"],
        [0.2821,"#70338d"],
        [0.3077,"#723a96"],
        [0.3333,"#7440a0"],
        [0.3590,"#7647a9"],
        [0.3846,"#784db2"],
        [0.4103,"#7854b9"],
        [0.4359,"#785bc0"],
        [0.4615,"#7863c7"],
        [0.4872,"#786ace"],
        [0.5128,"#7871d5"],
        [0.5385,"#7779d8"],
        [0.5641,"#7680db"],
        [0.5897,"#7588de"],
        [0.6154,"#748fe1"],
        [0.6410,"#7397e4"],
        [0.6667,"#78a0e4"],
        [0.6923,"#7da8e4"],
        [0.7179,"#81b1e3"],
        [0.7436,"#86b9e3"],
        [0.7692,"#8fbfe3"],
        [0.7949,"#97c5e3"],
        [0.8205,"#a0cae3"],
        [0.8462,"#a8d0e3"],
        [0.8718,"#b1d6e3"],
        [0.8974,"#bcdbe6"],
        [0.9231,"#c6e1e9"],
        [0.9487,"#d1e6eb"],
        [0.9744,"#dbecee"],
        [1.0000,"#e6f1f1"]
    ],
    "rainbow":[
        [0.0, 'rgb(0,52,245)'],
        [0.01568627450980392, 'rgb(0,63,234)'],
        [0.03137254901960784, 'rgb(0,72,223)'],
        [0.047058823529411764, 'rgb(0,81,212)'],
        [0.06274509803921569, 'rgb(0,89,201)'],
        [0.0784313725490196, 'rgb(0,96,189)'],
        [0.09411764705882353, 'rgb(0,103,178)'],
        [0.10980392156862745, 'rgb(0,109,167)'],
        [0.12549019607843137, 'rgb(0,115,157)'],
        [0.1411764705882353, 'rgb(8,119,147)'],
        [0.1568627450980392, 'rgb(28,124,137)'],
        [0.17254901960784313, 'rgb(41,128,128)'],
        [0.18823529411764706, 'rgb(49,132,118)'],
        [0.20392156862745098, 'rgb(55,136,109)'],
        [0.2196078431372549, 'rgb(59,140,99)'],
        [0.23529411764705882, 'rgb(61,144,88)'],
        [0.25098039215686274, 'rgb(63,148,78)'],
        [0.26666666666666666, 'rgb(63,153,66)'],
        [0.2823529411764706, 'rgb(63,157,53)'],
        [0.2980392156862745, 'rgb(63,161,40)'],
        [0.3137254901960784, 'rgb(66,165,27)'],
        [0.32941176470588235, 'rgb(74,168,18)'],
        [0.34509803921568627, 'rgb(85,171,15)'],
        [0.3607843137254902, 'rgb(96,173,16)'],
        [0.3764705882352941, 'rgb(106,175,18)'],
        [0.39215686274509803, 'rgb(116,178,19)'],
        [0.40784313725490196, 'rgb(126,180,21)'],
        [0.4235294117647059, 'rgb(136,182,23)'],
        [0.4392156862745098, 'rgb(145,185,25)'],
        [0.4549019607843137, 'rgb(154,187,27)'],
        [0.47058823529411764, 'rgb(163,189,29)'],
        [0.48627450980392156, 'rgb(172,191,31)'],
        [0.5019607843137255, 'rgb(181,193,32)'],
        [0.5176470588235293, 'rgb(190,195,34)'],
        [0.5333333333333333, 'rgb(198,197,36)'],
        [0.5490196078431373, 'rgb(207,199,38)'],
        [0.5647058823529412, 'rgb(215,201,39)'],
        [0.580392156862745, 'rgb(224,203,41)'],
        [0.596078431372549, 'rgb(232,205,43)'],
        [0.611764705882353, 'rgb(240,205,44)'],
        [0.6274509803921569, 'rgb(246,204,44)'],
        [0.6431372549019607, 'rgb(250,201,43)'],
        [0.6588235294117647, 'rgb(252,196,41)'],
        [0.6745098039215687, 'rgb(253,191,39)'],
        [0.6901960784313725, 'rgb(253,186,37)'],
        [0.7058823529411764, 'rgb(254,180,35)'],
        [0.7215686274509804, 'rgb(254,175,33)'],
        [0.7372549019607844, 'rgb(255,169,30)'],
        [0.7529411764705882, 'rgb(255,163,28)'],
        [0.7686274509803921, 'rgb(255,158,26)'],
        [0.7843137254901961, 'rgb(255,152,24)'],
        [0.8, 'rgb(255,146,21)'],
        [0.8156862745098039, 'rgb(255,140,19)'],
        [0.8313725490196078, 'rgb(255,134,17)'],
        [0.8470588235294118, 'rgb(255,128,14)'],
        [0.8627450980392157, 'rgb(255,121,12)'],
        [0.8784313725490196, 'rgb(255,115,10)'],
        [0.8941176470588235, 'rgb(255,108,7)'],
        [0.9098039215686274, 'rgb(255,101,5)'],
        [0.9254901960784314, 'rgb(255,94,3)'],
        [0.9411764705882353, 'rgb(254,86,2)'],
        [0.9568627450980391, 'rgb(254,77,1)'],
        [0.9725490196078431, 'rgb(254,68,0)'],
        [0.9882352941176471, 'rgb(253,57,0)'],
        [1.0, 'rgb(253,48,0)']
    ]
};

//these are in a dict in case model-specific properties need to be added later, but for now there aren't any
let models = {
    "ChesapeakeBay_ADCIRCSWAN":{},
    "ChesapeakeBay_XBEACH":{},
    "ChesapeakeBay_SUBX":{},
    "Arctic_ADCIRCSWAN":{}
};

let viewLevels = [
    null, //0 is the default/global level
    [[-80.73,40.95],[-72.63,35.59]], //1 is chesapeake
    [[-79.0,40.0],[-76.40,37.96]] //2 is DC
];

let layerGroups = [
    "GMU iFLOOD Data", //0
    "Third Party Data" //1
];

let layers = {
    "waterLevel": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Water Level",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/water/{_h_}.json"],
            [2,"https://data.iflood.vse.gmu.edu/Forecast/PotomacRiver_ADCIRC/DCmodel/Water/Splits/{_h_}.json"]
        ],
        "maxUrl":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/CBmaxele.json"],
            [2,"https://data.iflood.vse.gmu.edu/Forecast/PotomacRiver_ADCIRC/DCmodel/Water/MaxWater/PRmaxele.json"]
        ],
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Water/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Water/Points/{_l_}.json",
        "colorRange":colorRanges["jet"],
        "colorBounds":[-0.5,3],
        "colorProperty":"eleavg",
        "unit":"m",
        "opacity":0.75,
        "reverseBar":true,
        "z":1,
        "img":"/map/layerIcons/waterLevel.png",
        "description":"Predicted water levels from the iFLOOD forecast system forced by the North American Mesoscale (NAM) model and Astronomical Tides. Water level is in meters above the NAVD88 vertical datum."
    },
    "inundation": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Inundation",
        "temporal":false,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/maxinundation.json"]
        ],
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Inundation/",
        "colorRange":colorRanges["jet"],
        "colorBounds":[0,6],
        "colorProperty":"eleavg",
        "unit":"m",
        "opacity":0.75,
        "reverseBar":true,
        "z":2,
        "img":"/map/layerIcons/inundation.png",
        "description":"Predicted maximum inundation depth above ground for the next 84 hours. Inundation is in meters above NAVD88 datum.\n"
    },
    "minPressure": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Atmospheric Pressure",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/pressure/{_h_}.json"],
        ],
        "maxUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/minpressure.json",
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Pressure/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Pressure/Points/{_l_}.json",
        "colorRange":colorRanges["plasma"],
        "colorBounds":[9,11],
        "colorProperty":"eleavg",
        "unit":"kpa",
        "opacity":1,
        "reverseBar":true,
        "z":8,
        "img":"/map/layerIcons/pressure.png",
        "description":"Atmospheric pressure at sea level in the model domain derived from the the North American Mesoscale (NAM) model for next 84 hour forecasts. Atmospheric pressure is given in Kilopascals."
    },
    "windMag": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Wind Magnitude",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/wind/{_h_}.json"],
        ],
        "maxUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/maxwind.json",
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Wind/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Wind/Points/{_l_}.json",
        "colorRange":colorRanges["viridis"],
        "colorBounds":[0,60],
        "colorProperty":"eleavg",
        "unit":"m/s",
        "opacity":1,
        "reverseBar":true,
        "hasParticles":true,
        "particleUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/wind_vectors/{_h_}.json",
        "particleLat":"windx",
        "particleLng":"windy",
        "particleSpeedScale":0.15,
        "particleColor":"rgba(255,255,255,1)",
        "z":10,
        "img":"/map/layerIcons/wind.png",
        "description":"Wind speeds at the surface in the model domain derived from the the North American Mesoscale (NAM) model for next 84 hour forecasts. Winds speeds are given in meters per second."
    },
    "boundary": {
        "group":0,
        "type":"outline",
        "displayName":"Model Boundary",
        "temporal":true,
        "url":dataDomain+"/Model/boundary/ModelBoundary.json",
        "downloadUrl":dataDomain+"/Model/boundary/ModelBoundary.json",
        "color":"#e13835",
        "z":100,
        "img":"/map/layerIcons/boundary.png",
        "description":"Numerical model domain for iFLOOD forecast System."
    },
    "bathy": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Bathymetry",
        "urls":[
            [0,dataDomain+"/Model/CBbathy/BathyV0_simple.json"],
            [1,dataDomain+"/Model/CBbathy/BathyV0_crop.json"]
        ],
        "downloadUrl":"https://d2dyvyp1m8y8xp.cloudfront.net/Model/CBbathy/BathyV0.json",
        "colorRange":colorRanges["bathymetry"],
        "colorBounds":[0,5000],
        "colorProperty":"dmax",
        "unit":"m",
        "opacity":1,
        "reverseBar":false,
        "z":0,
        "img":"/map/layerIcons/bathy.png",
        "description":"Depth of water in the model domain is derived from National Geophysical Data Center's Coastal Relief Model (CRM) and NOAA digital nautical charts. Bathymetry is given in meters."
    },
    "currents": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Currents",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/currents/{_h_}.json"],
        ],
        "maxUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/maxcurrents.json",
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Currents/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Currents/Points/{_l_}.json",
        "colorRange":colorRanges["jet"],
        "colorBounds":[0,2],
        "colorProperty":"eleavg",
        "unit":"m/s",
        "opacity":1,
        "reverseBar":true,
        "hasParticles":true,
        "particleUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/current_vectors/{_h_}.json",
        "particleLat":"windx",
        "particleLng":"windy",
        "particleSpeedScale":5,
        "particleColor":"rgba(200,200,255,1)",
        "z":4,
        "img":"/map/layerIcons/currents.png",
        "description":"Predicted currents velocity and magnitude from the iFLOOD forecast system for next 84 hours. Currents are in meters per second."
    },
    "waveHeight": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Wave Height",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/wave_height/{_h_}.json"],
        ],
        "maxUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/swanHS_max.json",
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Wave_height/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Waves/Points/{_l_}.json",
        "colorRange":colorRanges["jet"],
        "colorBounds":[0,13],
        "colorProperty":"wavhtavg",
        "unit":"m",
        "opacity":1,
        "reverseBar":true,
        "hasParticles":true,
        "particleUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/wave_vectors/{_h_}.json",
        "particleLat":"windx",
        "particleLng":"windy",
        "particleSpeedScale":0.6,
        "particleColor":"#FFFFFF",
        "z":5,
        "img":"/map/layerIcons/waveHeight.png",
        "description":"Significant Wave Height is the average of the highest one-third (33%) of waves (measured from trough to crest) in the model domain derived from the parallel computation of ADCIRC and SWAN. Wave Height is in meters."
    },
    "wavePeriod": {
        "group":0,
        "type":"geoJSON",
        "displayName":"Wave Period",
        "temporal":true,
        "urls":[
            [0,"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/Splits/wave_period/{_h_}.json"],
        ],
        "maxUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/GeoJson/swanTPS_max.json",
        "downloadUrl":"{_ChesapeakeBay_ADCIRCSWAN_DOWNLOAD_}/Downloadable_layers/Wave_period/",
        "pointPlotUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WavePeriod/Points/{_l_}.json",
        "colorRange":colorRanges["density"],
        "colorBounds":[0,20],
        "colorProperty":"wvpdavg",
        "unit":"s",
        "opacity":1,
        "reverseBar":true,
        "hasParticles":false,
        "z":6,
        "img":"/map/layerIcons/wavePeriod.png",
        "description":"Peak Wave Period is the frequency of the waves in the model domain predicted for next 84 hours. Period is in seconds."
    },
    // this is just an example of how the WMS loading works
    // "precip": {
    //     "type":"wmsTile",
    //     "displayName":"CERA Precip",
    //     "url":"https://tc2.nccera-5.renci.org/cerarisk/ceracgi/cera_wms_tiled?day=20180914&time=1200&com=9267&griddomain=HSOFS&tz=utc&unit=ft&legend=nc&ceraversion=8&query=elev&timestep_precimg=prechc24",
    //     "img":"/map/layerIcons/ceraPrecip.png",
    //     "description":"Here there could be some text that explains something about the data, where it came from, how to interpret it, etc."
    // },
    // "precip": {
    //     "group":1,
    //     "type":"arcGIS",
    //     "displayName":"24 Hour Precipitation",
    //     "url":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer",
    //     "downloadUrl":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/19",
    //     "gisLayer":"19",
    //     "img":"/map/layerIcons/temp.png",
    //     "description":"Quantitative Precipitation Accumulation for the previous 24 hours (from NOAA)."
    // },
    "precipForecast": {
        "group":1,
        "type":"arcGIS",
        "displayName":"12-hr Probability of Precipitation",
        "url":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/forecast_meteoceanhydro_sfc_ndfd_time/MapServer",
        "gisLayer":"23",
        "downloadUrl":"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/forecast_meteoceanhydro_sfc_ndfd_time/MapServer/23",
        "img":"/map/layerIcons/precip.png",
        "description":"The Probability of Precipitation for the next 12 hours (from NOAA). The values are expressed in percentages."
    },
    "stormPath": {
        "group":1,
        "type":"stormPath",
        "displayName":"Storm Paths",
        "pointUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/NHCHurricanes/Hurricane/hurricane_points.json",
        "pathUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/NHCHurricanes/Hurricane/hurricane_track.json",
        "polygonUrl":"{_ChesapeakeBay_ADCIRCSWAN_FILES_}/NHCHurricanes/Hurricane/hurricane_polygon.json",
        "pathSprites":{
            "MH":"/map/sprites/majorhurricane.svg",
            "HU":"/map/sprites/hurricane.svg",
            "TS":"/map/sprites/storm.svg"
        },
        "downloadUrl":"https://www.nhc.noaa.gov/",
        "z":8,
        "img":"/map/layerIcons/stormPath.png",
        "description":"Predicted path of storms from NHC.<br><img src='/map/sprites/majorhurricane.svg' width='28'>Major Hurricane<br><img src='/map/sprites/hurricane.svg' width='28'>Hurricane<br><img src='/map/sprites/storm.svg' width='28'>Storm<br><img src='/map/sprites/depression.svg' width='28'>Depression"
    },
    "twitter": {
        "group":1,
        "type":"heatmap",
        "displayName":"Twitter Activity",
        "url":dataDomain+"/SocialMedia/twitterFlood/displayCounts.json",
        "downloadUrl":"https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets",
        "colorRange":colorRanges["plasma"],
        "radius": 25,
        "maxIntensity": 120,
        "img":"/map/layerIcons/twitterHeat.png",
        "description":"Heatmap of recent tweets that mention flooding and flood-related topics. Tweets are matched to locations using data from <a href='https://simplemaps.com/data/us-cities' target='_blank' rel='noopener noreferrer'>SimpleMaps</a>."
    }
};

let stationWaterUrl = "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Water/{_s_}.tsv";
let stationValidationUrl = "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Validation/water/{_s_}.tsv";
let stationWindUrl = "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Wind/{_s_}.tsv";
let stationWavesUrl = "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Waves/{_s_}.tsv";
let stationWavesValidationUrl = "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/Validation/waves/{_s_}.tsv";
let stationLongtermWaterUrl = "{_ChesapeakeBay_SUBX_FILES_}/TimeSeries/LongtermWater/{_s_}.tsv";
let stationarcticWaterUrl = "{_Arctic_ADCIRCSWAN_FILES_}/TimeSeries/Water/{_s_}.tsv";

let markers = {
    "LWTV": {
		"type": "station",
		"pos": {
			"lat": 37.99315172,
			"lng": -76.46280597
		},
		"title": "Lewisetta, VA",
		"stationStr": "LWTV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.512, 0.664, 0.817, 0.969],
		"agency": "NOAA",
        "noaaId": "8635750",
        "navdOffset": -0.25
	},
	"NCDV": {
		"type": "station",
		"pos": {
			"lat": 38.32,
			"lng": -77.03667
		},
		"title": "Dahlgren, VA",
		"stationStr": "NCDV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.633, 0.785, 1.243, 1.852],
		"agency": "NOAA",
        "noaaId": "8635027",
        "navdOffset": -0.281
	},
	"YTVA": {
		"type": "station",
		"pos": {
			"lat": 37.22667,
			"lng": -76.47833
		},
		"title": "Yorktown USCG Training Center, VA",
		"stationStr": "YTVA",
		"hasWater": true,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.741, 0.893, 1.046, 1.198],
		"agency": "NOAA"
	},
	"BISM": {
		"type": "station",
		"pos": {
			"lat": 38.21663931,
			"lng": -76.03618314
		},
		"title": "Bishops Head, MD",
		"stationStr": "BISM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.532, 0.593, 0.745, 0.897],
		"agency": "NOAA",
        "noaaId": "8571421",
        "navdOffset": -0.383
	},
	"BLTM": {
		"type": "station",
		"pos": {
			"lat": 39.26610102,
			"lng": -76.57757239
		},
		"title": "Baltimore, MD",
		"stationStr": "BLTM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.508, 0.66, 1.27, 1.575],
		"agency": "NOAA",
        "noaaId": "8574680",
        "navdOffset": -0.254
	},
	"APAM": {
		"type": "station",
		"pos": {
			"lat": 38.98688586,
			"lng": -76.47987645
		},
		"title": "Annapolis, MD",
		"stationStr": "APAM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.379, 0.561, 0.775, 1.598],
		"agency": "NOAA",
        "noaaId": "8575512",
        "navdOffset": -0.231
	},
	"SLIM": {
		"type": "station",
		"pos": {
			"lat": 38.31574831,
			"lng": -76.44992133
		},
		"title": "Solomons Island, MD",
		"stationStr": "SLIM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.5, 0.652, 0.957, 1.262],
		"agency": "NOAA",
        "noaaId": "8577330",
        "navdOffset": -0.262
	},
	"WASD": {
		"type": "station",
		"pos": {
			"lat": 38.85740644,
			"lng": -77.01952715
		},
		"title": "Washington,DC",
		"stationStr": "WASD",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.703, 0.856, 1.191, 1.709],
		"agency": "NOAA",
        "noaaId": "8594900",
        "navdOffset": -0.424
	},
	"WAVA": {
		"type": "station",
		"pos": {
			"lat": 37.62042779,
			"lng": -75.66673728
		},
		"title": "Wachapreague, VA",
		"stationStr": "WAVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [1.046, 1.198, 1.503, 1.656],
		"agency": "NOAA",
        "noaaId": "8631044",
        "navdOffset": -0.783
	},
	"KPTV": {
		"type": "station",
		"pos": {
			"lat": 37.16343353,
			"lng": -75.99539591
		},
		"title": "Kiptopeke, VA",
		"stationStr": "KPTV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.644, 0.797, 0.949, 1.101],
		"agency": "NOAA",
        "noaaId": "8632200",
        "navdOffset": -0.575
	},
	"WMVA": {
		"type": "station",
		"pos": {
			"lat": 37.60796934,
			"lng": -76.28636827
		},
		"title": "Windmill Point, VA",
		"stationStr": "WMVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.431, 0.583, 0.735, 0.888],
		"agency": "NOAA",
        "noaaId": "8636580",
        "navdOffset": -0.331
	},
	"SWPV": {
		"type": "station",
		"pos": {
			"lat": 36.95016553,
			"lng": -76.33547653
		},
		"title": "Sewells Point, VA",
		"stationStr": "SWPV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.715, 0.867, 1.172, 1.477],
		"agency": "NOAA",
        "noaaId": "8638610",
        "navdOffset": -0.504
	},
	"CBBV": {
		"type": "station",
		"pos": {
			"lat": 36.96454151,
			"lng": -76.12306655
		},
		"title": "Chesapeake Bay Bridge Tunnel",
		"stationStr": "CBBV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasLongtermWater": true,
		"floodLevels": [0.806, 0.959, 1.111, 1.263],
		"agency": "NOAA",
        "noaaId": "8638901",
        "navdOffset": -0.566
	},
	"TBMD": {
		"type": "station",
		"pos": {
			"lat": 39.21628252,
			"lng": -76.25520895
		},
		"title": "Tolchester Beach, MD",
		"stationStr": "TBMD",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
        "hasRealtimeValidation": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.637, 0.79, 1.094, 1.399],
		"agency": "NOAA",
        "noaaId": "8573364",
        "navdOffset": -0.277
	},
	"YKTV": {
		"type": "station",
		"pos": {
			"lat": 37.226667,
			"lng": -76.478333
		},
		"title": "Cheseapeake Bay near YorkTown",
		"stationStr": "YKTV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.741, 0.893, 1.046, 1.198],
		"agency": "AHPS",
        "noaaId": "8637689",
        "navdOffset": -0.478
	},
	"OTVA": {
		"type": "station",
		"pos": {
			"lat": 38.80968632,
			"lng": -77.03553053
		},
		"title": "Old Town Alexandria,VA",
		"stationStr": "OTVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.357, 0.601, 0.875, 1.607],
		"agency": "EXTRA",
        "noaaId": "860005",
        "navdOffset": -0.405
	},
	"SGVA": {
		"type": "station",
		"pos": {
			"lat": 38.138333,
			"lng": -76.5
		},
		"title": "St. George Creek",
		"stationStr": "SGVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.491, 0.644, 0.796, 1.253],
		"agency": "AHPS",
        "noaaId": "860009",
        "navdOffset": -0.271
	},
	"CBVA": {
		"type": "station",
		"pos": {
			"lat": 38.573333,
			"lng": -76.068333
		},
		"title": "Chesapeake Bay at Cambridge",
		"stationStr": "CBVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.578, 0.73, 0.91, 1.035],
		"agency": "AHPS",
        "noaaId": "860010",
        "navdOffset": -0.337
	},
	"CBHD": {
		"type": "station",
		"pos": {
			"lat": 39.537778,
			"lng": -76.089722
		},
		"title": "Chesapeake Bay at Havre De Grace",
		"stationStr": "CBHD",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.75, 0.902, 1.36, 1.817],
		"agency": "AHPS",
        "noaaId": "860011",
        "navdOffset": -0.317
	},
	"CRSM": {
		"type": "station",
		"pos": {
			"lat": 37.9783,
			"lng": -75.8636
		},
		"title": "little annemix river",
		"stationStr": "CRSM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.559, 0.712, 0.864, 1.169],
		"agency": "AHPS",
        "noaaId": "860012",
        "navdOffset": -0.355
	},
	"CHIV": {
		"type": "station",
		"pos": {
			"lat": 37.9023,
			"lng": -75.4078
		},
		"title": "Chincoteague channel near Chincoteague bay inlet",
		"stationStr": "CHIV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.598, 0.903, 1.055, 1.36],
		"agency": "AHPS",
        "noaaId": "860013",
        "navdOffset": -0.468
	},
	"NSWV": {
		"type": "station",
		"pos": {
			"lat": 37.476389,
			"lng": -75.935278
		},
		"title": "Nassawadox creek near Bayford,VA",
		"stationStr": "NSWV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.365, 0.518, 0.67, 0.975],
		"agency": "AHPS",
        "noaaId": "860014",
        "navdOffset": -0.397
	},
	"CCHV": {
		"type": "station",
		"pos": {
			"lat": 37.288969,
			"lng": -75.923546
		},
		"title": "Oyster,VA",
		"stationStr": "CCHV",
		"hasWater": false,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [1.132, 1.284, 1.437, 1.742],
		"agency": "AHPS",
        "noaaId": "860015",
        "navdOffset": -0.849
	},
	"MJBV": {
		"type": "station",
		"pos": {
			"lat": 37.323611,
			"lng": -76.4275
		},
		"title": "Chesapeake Bay near Mobjack Bay",
		"stationStr": "MJBV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.572, 0.725, 1.03, 1.182],
		"agency": "AHPS",
        "noaaId": "860016",
        "navdOffset": -0.494
	},
	"FTMV": {
		"type": "station",
		"pos": {
			"lat": 37.001944,
			"lng": -76.315
		},
		"title": "James River at Fort Monroe,VA",
		"stationStr": "FTMV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.702, 0.855, 1.159, 1.464],
		"agency": "AHPS",
        "noaaId": "860018",
        "navdOffset": -0.517
	},
	"JSFV": {
		"type": "station",
		"pos": {
			"lat": 37.220139,
			"lng": -76.791453
		},
		"title": "James River at Scotland Ferry,VA",
		"stationStr": "JSFV",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.728, 0.88, 1.032, 1.185],
		"agency": "AHPS",
        "noaaId": "860019",
        "navdOffset": -0.339
	},
	"DUKN": {
		"type": "station",
		"pos": {
			"lat": 36.183333,
			"lng": -75.75
		},
		"title": "Coastal Eastern at Duck,NC",
		"stationStr": "DUKN",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.859, 1.012, 1.164, 1.316],
		"agency": "AHPS",
        "noaaId": "8651370",
        "navdOffset": -0.667
	},
	"OCIM": {
		"type": "station",
		"pos": {
			"lat": 38.328333,
			"lng": -75.091667
		},
		"title": "Atlantic Coast near Ocean City,NJ",
		"stationStr": "OCIM",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": true,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860021",
        "navdOffset": -0.51
	},
// Additional Stations for SubX

	"OINC": {
		"type": "station",
		"pos": {
			"lat": 35.795,
			"lng": -75.54833
		},
		"title": "Oregon Inlet Marina, NC",
		"stationStr": "OINC",
		"hasWater": false,
		"hasWind": false,
        "hasLongtermWater": true,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasRealtimeValidation": false,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860023",
        "navdOffset": -0.215
	},
	"HANC": {
		"type": "station",
		"pos": {
			"lat": 35.20833,
			"lng": -75.70333000000001
		},
		"title": "USCG Station Hatteras, NC",
		"stationStr": "HANC",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
        "hasRealtimeValidation": false,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860041",
        "navdOffset": -0.51
	},
	"BEDU": {
		"type": "station",
		"pos": {
			"lat": 34.72,
			"lng": -76.67
		},
		"title": "Beaufort, Duke Marine Lab, NC",
		"stationStr": "BEDU",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860051",
        "navdOffset": -0.51
	},
	"WBNC": {
		"type": "station",
		"pos": {
			"lat": 34.21333,
			"lng": -77.78
		},
		"title": "Wrightsville Beach, NC",
		"stationStr": "WBNC",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860052",
        "navdOffset": -0.51
	},
	"SPSC": {
		"type": "station",
		"pos": {
			"lat": 33.655,
			"lng": -78.91833
		},
		"title": "Springmaid Pier, SC",
		"stationStr": "SPSC",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860053",
        "navdOffset": -0.51
	},
	"FPGA": {
		"type": "station",
		"pos": {
			"lat": 32.03667,
			"lng": -80.90167
		},
		"title": "Fort Pulaski, GA",
		"stationStr": "FPGA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860054",
        "navdOffset": -0.51
	},
	"MAFL": {
		"type": "station",
		"pos": {
			"lat": 30.398329999999998,
			"lng": -81.42833
		},
		"title": "Mayport (Bar Pilots Dock), FL",
		"stationStr": "MAFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860055",
        "navdOffset": -0.51
	},
	"TPFL": {
		"type": "station",
		"pos": {
			"lat": 28.415,
			"lng": -80.59333000000001
		},
		"title": "Trident Pier, FL",
		"stationStr": "TPFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860056",
        "navdOffset": -0.51
	},
	"LWFL": {
		"type": "station",
		"pos": {
			"lat": 26.613329999999998,
			"lng": -80.035
		},
		"title": "Lake Worth Pier, Atlantic Ocean, FL",
		"stationStr": "LWFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PFBE": {
		"type": "station",
		"pos": {
			"lat": 29.113,
			"lng": -90.19833
		},
		"title": "Port Fourchon, LA",
		"stationStr": "PFBE",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PSLA": {
		"type": "station",
		"pos": {
			"lat": 28.9316667,
			"lng": -89.40667
		},
		"title": "Pilots Station East, LA",
		"stationStr": "PSLA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"GILA": {
		"type": "station",
		"pos": {
			"lat": 29.26333,
			"lng": -89.95667
		},
		"title": "Grand Isle, LA",
		"stationStr": "GILA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PTLA": {
		"type": "station",
		"pos": {
			"lat": 29.178333,
			"lng": -89.2583
		},
		"title": "Pilottown, LA",
		"stationStr": "PTLA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"EGOM": {
		"type": "station",
		"pos": {
			"lat": 29.3666667,
			"lng": -91.38333
		},
		"title": "Eugene Island, LA",
		"stationStr": "EGOM",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"FCLA": {
		"type": "station",
		"pos": {
			"lat": 29.5516667,
			"lng": -92.305
		},
		"title": "Freshwater Canal Locks, LA",
		"stationStr": "FCLA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"SBLA": {
		"type": "station",
		"pos": {
			"lat": 29.86833,
			"lng": -89.673333
		},
		"title": "Shell Beach, LA",
		"stationStr": "SBLA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"RDSJ": {
		"type": "station",
		"pos": {
			"lat": 26.7236,
			"lng": -97.4341
		},
		"title": "Shell Beach, LA",
		"stationStr": "RDSJ",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"BBTX": {
		"type": "station",
		"pos": {
			"lat": 27.297,
			"lng": -97.405
		},
		"title": "Baffin Bay, TX",
		"stationStr": "BBTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"AWTX": {
		"type": "station",
		"pos": {
			"lat": 28.2216,
			"lng": -96.7894
		},
		"title": "Aransas Wildlife Refuge (TCOON), TX",
		"stationStr": "AWTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"SATX": {
		"type": "station",
		"pos": {
			"lat": 28.76575,
			"lng": -95.61128
		},
		"title": "Sargent, TX",
		"stationStr": "SATX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"FRTX": {
		"type": "station",
		"pos": {
			"lat": 28.94,
			"lng": -95.30166667
		},
		"title": "Freeport, TX",
		"stationStr": "FRTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"SLTX": {
		"type": "station",
		"pos": {
			"lat": 29.08348,
			"lng": -95.12927
		},
		"title": "San Luis Pass, TX",
		"stationStr": "SLTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"EPTX": {
		"type": "station",
		"pos": {
			"lat": 29.35811,
			"lng": -94.72327
		},
		"title": "Eagle Point, Galveston Bay, TX",
		"stationStr": "EPTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"RPTX": {
		"type": "station",
		"pos": {
			"lat": 29.515,
			"lng": -94.51
		},
		"title": "Rollover Pass, TX",
		"stationStr": "RPTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"TPTX": {
		"type": "station",
		"pos": {
			"lat": 29.68849,
			"lng": -93.83642
		},
		"title": "Texas Point (Sabine Pass), TX",
		"stationStr": "TPTX",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"VAFL": {
		"type": "station",
		"pos": {
			"lat": 24.6817,
			"lng": -81.1075
		},
		"title": "Vaca Key (Florida Bay), FL",
		"stationStr": "VAFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"KWFL": {
		"type": "station",
		"pos": {
			"lat": 24.53792,
			"lng": -81.81235
		},
		"title": "Key West, FL",
		"stationStr": "KWFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"NAFL": {
		"type": "station",
		"pos": {
			"lat": 26.126159,
			"lng": -81.817154
		},
		"title": "Naples (Gulf of Mexico), FL",
		"stationStr": "NAFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PMFL": {
		"type": "station",
		"pos": {
			"lat": 27.64842,
			"lng": -82.56723
		},
		"title": "Port Manatee, FL",
		"stationStr": "PMFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"CBFL": {
		"type": "station",
		"pos": {
			"lat": 27.97774,
			"lng": -82.84025
		},
		"title": "Clearwater Beach, FL",
		"stationStr": "CBFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"VKFL": {
		"type": "station",
		"pos": {
			"lat": 25.72183,
			"lng": -80.16237
		},
		"title": "Virginia Key (Biscayne Bay), FL",
		"stationStr": "VKFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"CKFL": {
		"type": "station",
		"pos": {
			"lat": 29.13328,
			"lng": -83.0156
		},
		"title": "Cedar Key, FL",
		"stationStr": "CKFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"SJPR": {
		"type": "station",
		"pos": {
			"lat": 18.46,
			"lng": -66.117
		},
		"title": "San Juan, La Puntilla, San Juan Bay, PR",
		"stationStr": "SJPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"ARPR": {
		"type": "station",
		"pos": {
			"lat": 18.48,
			"lng": -66.702
		},
		"title": "Arecibo, PR",
		"stationStr": "ARPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"MYPR": {
		"type": "station",
		"pos": {
			"lat": 18.218,
			"lng": -67.162
		},
		"title": "Mayaguez, PR",
		"stationStr": "MYPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"YHPR": {
		"type": "station",
		"pos": {
			"lat": 18.055,
			"lng": -65.833
		},
		"title": "Yabucoa Harbor, PR",
		"stationStr": "YHPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"CAVI": {
		"type": "station",
		"pos": {
			"lat": 18.347,
			"lng": -64.925
		},
		"title": "Charlotte Amalie, VI",
		"stationStr": "CAVI",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"LTVI": {
		"type": "station",
		"pos": {
			"lat": 17.695,
			"lng": -64.753
		},
		"title": "Lime Tree Bay, VI",
		"stationStr": "LTVI",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"BABA": {
		"type": "station",
		"pos": {
			"lat": 17.592,
			"lng": -61.82
		},
		"title": "Barbuda, Antigua and Barbuda",
		"stationStr": "BABA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"SHNJ": {
		"type": "station",
		"pos": {
			"lat": 40.467,
			"lng": -74.01
		},
		"title": "Sandy Hook, NJ",
		"stationStr": "SHNJ",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PCFL": {
		"type": "station",
		"pos": {
			"lat": 30.152,
			"lng": -85.7
		},
		"title": "Panama City, FL",
		"stationStr": "PCFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"MOPR": {
		"type": "station",
		"pos": {
			"lat": 18.09,
			"lng": -67.938
		},
		"title": "Mona Island, PR",
		"stationStr": "MOPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"MGPR": {
		"type": "station",
		"pos": {
			"lat": 17.97,
			"lng": -67.047
		},
		"title": "Magueyes Island, PR",
		"stationStr": "MGPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"EVPR": {
		"type": "station",
		"pos": {
			"lat": 18.093,
			"lng": -65.472
		},
		"title": "Esperanza, Vieques Island, PR",
		"stationStr": "EVPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"ISPR": {
		"type": "station",
		"pos": {
			"lat": 18.152,
			"lng": -65.443
		},
		"title": "Isabel Segunda, Vieques Island, PR",
		"stationStr": "ISPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"CUPR": {
		"type": "station",
		"pos": {
			"lat": 18.302,
			"lng": -65.302
		},
		"title": "Culebra, PR",
		"stationStr": "CUPR",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"LBVI": {
		"type": "station",
		"pos": {
			"lat": 18.318,
			"lng": -64.725
		},
		"title": "Lameshur Bay, St John, VI",
		"stationStr": "LBVI",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"CHVI": {
		"type": "station",
		"pos": {
			"lat": 17.75,
			"lng": -64.705
		},
		"title": "Christiansted Harbor, St Croix, VI",
		"stationStr": "CHVI",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"APFL": {
		"type": "station",
		"pos": {
			"lat": 29.725,
			"lng": -84.98
		},
		"title": "Apalachicola, FL",
		"stationStr": "APFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"FCBL": {
		"type": "station",
		"pos": {
			"lat": 30.213,
			"lng": -85.878
		},
		"title": "Panama City Beach, FL",
		"stationStr": "FCBL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"PEFL": {
		"type": "station",
		"pos": {
			"lat": 30.403,
			"lng": -87.212
		},
		"title": "Pensacola, FL",
		"stationStr": "PEFL",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"MONY": {
		"type": "station",
		"pos": {
			"lat": 41.048,
			"lng": -71.96
		},
		"title": "Montauk, NY",
		"stationStr": "MONY",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},
	"NAMA": {
		"type": "station",
		"pos": {
			"lat": 41.285,
			"lng": -70.097
		},
		"title": "Nantucket Island, MA",
		"stationStr": "NAMA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": false,
        "hasLongtermWater": true,
		"floodLevels": [0.557, 0.709, 1.014, 1.319],
		"agency": "AHPS",
        "noaaId": "860057",
        "navdOffset": -0.51
	},

// Additional Stations for Arctic
   "ANTA2": {
        "type": "iflood",
        "pos": {
            "lat": 61.233889,
            "lng": -149.883889
        },
        "title": "Anchorage, AK",
        "stationStr": "ANTA2",
        "hasWater": true,       
        "hasarcticWater": true,
        "hasWind": false,
        "hasValidationFile": false,
        "hasRealtimeValidation": false,
        "hasWaves": false,
        "hasLongtermWater": false,
        "floodLevels": [8.806, 8.959, 9.111, 9.263],
        "agency": "NOAA",
        "noaaId": "9455920",
        "navdOffset": -1.766
    },
    "PRDA2": {
        "type": "iflood",
        "pos": {
            "lat": 70.400000,
            "lng": -148.526667
        },
        "title": "Prudhoe Bay, AK",
        "stationStr": "PRDA2",
        "hasWater": true,       
        "hasarcticWater": true,
        "hasWind": false,
        "hasValidationFile": false,
        "hasRealtimeValidation": false,
        "hasWaves": false,
        "hasLongtermWater": false,
        "floodLevels": [1.806, 1.959, 2.111, 2.263],
        "agency": "NOAA",
        "noaaId": "9497645",
        "navdOffset": 0
    }, // this last comma is necessary


    //buoys
    "CHVA": {
		"type": "buoy",
		"pos": {
			"lat": 36.915,
			"lng": -75.72
		},
		"title": "Cape Henry,VA",
		"stationStr": "CHVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWavesValidation": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/CHVA.mp4",
		"agency": "SCRIPPS"
	},
	"WIVA": {
		"type": "buoy",
		"pos": {
			"lat": 37.757,
			"lng": -75.334
		},
		"title": "Wallops island,VA",
		"stationStr": "WIVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWavesValidation": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/WIVA.mp4",
		"agency": "USACE"
	},
	"DBDE": {
		"type": "buoy",
		"pos": {
			"lat": 38.461,
			"lng": -74.703
		},
		"title": "Dalware Bay",
		"stationStr": "DBDE",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "NDBC"
	},
	"VBVA": {
		"type": "buoy",
		"pos": {
			"lat": 36.611,
			"lng": -74.843
		},
		"title": "VA Beach Eastern Shore",
		"stationStr": "VBVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWavesValidation": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/VBVA.mp4",
		"agency": "NDBC"
	},
	"DFNC": {
		"type": "buoy",
		"pos": {
			"lat": 36.26,
			"lng": -75.594
		},
		"title": "Duck FRP,NC",
		"stationStr": "DFNC",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWavesValidation": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/DFNC.mp4",
		"agency": "SCRIPPS"
	},
	"FLVA": {
		"type": "buoy",
		"pos": {
			"lat": 36.998,
			"lng": -76.087
		},
		"title": "First Landing,VA",
		"stationStr": "FLVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/FLVA.mp4",
		"agency": "CBIBS"
	},
	"TSVA": {
		"type": "buoy",
		"pos": {
			"lat": 37.026,
			"lng": -76.151
		},
		"title": "Thimble Shoal,VA",
		"stationStr": "TSVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWavesValidation": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/TSVA.mp4",
		"agency": "USNavy"
	},
	"YSVA": {
		"type": "buoy",
		"pos": {
			"lat": 37.201,
			"lng": -76.266
		},
		"title": "York Spit,Va",
		"stationStr": "YSVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasWaveSpectrum": true,
        "waveSpectrumVideoUrl": "{_ChesapeakeBay_ADCIRCSWAN_FILES_}/TimeSeries/WaveSpectrum/YSVA.mp4",
        "agency": "CBIBS"
	},
	"SPVA": {
		"type": "buoy",
		"pos": {
			"lat": 37.567,
			"lng": -76.257
		},
		"title": "Stingray Point,VA",
		"stationStr": "SPVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
	"POMD": {
		"type": "buoy",
		"pos": {
			"lat": 38.033,
			"lng": -76.335
		},
		"title": "Potomac,MD",
		"stationStr": "POMD",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
	"GRMD": {
		"type": "buoy",
		"pos": {
			"lat": 38.556,
			"lng": -76.415
		},
		"title": "Gooses Reef, MD",
		"stationStr": "GRMD",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
	"SUMD": {
		"type": "buoy",
		"pos": {
			"lat": 39.54,
			"lng": -76.074
		},
		"title": "Susquehanna, MD",
		"stationStr": "SUMD",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
	"PAMD": {
		"type": "buoy",
		"pos": {
			"lat": 39.152,
			"lng": -76.391
		},
		"title": "Patapsco, MD",
		"stationStr": "PAMD",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
	"JAVA": {
		"type": "buoy",
		"pos": {
			"lat": 37.211,
			"lng": -76.787
		},
		"title": "Jamestown, VA",
		"stationStr": "JAVA",
		"hasWater": false,
		"hasWind": false,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "CBIBS"
	},
    //iflood stations
    "DIVA": {
		"type": "iflood",
		"pos": {
			"lat": 38.14841981,
			"lng": -75.95974833
		},
		"title": "Deal Island,VA",
		"stationStr": "DIVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasXbeachVideo": true,
        "xbeachVideoUrl": "{_ChesapeakeBay_XBEACH_FILES_}/deal_island/xbeach.mp4",
		"agency": "FHRL"
	},
	"CRVA": {
		"type": "iflood",
		"pos": {
			"lat": 36.817589,
			"lng": -75.96567401
		},
		"title": "Croatan,VA Beach",
		"stationStr": "CRVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasXbeachVideo": true,
        "xbeachVideoUrl": "{_ChesapeakeBay_XBEACH_FILES_}/croatan/xbeach.mp4",
		"agency": "FHRL"
	},
	"PSVA": {
		"type": "iflood",
		"pos": {
			"lat": 38.65984844,
			"lng": -77.23243127
		},
		"title": "Potomac Science Center,VA",
		"stationStr": "PSVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
        "hasRealtimeValidation": true,
		"hasWaves": true,
        "hasCamera": true,
        "cameraStreamId": "1UI9hNhQ1RR",
		"agency": "FHRL",
        "iotId": "SN180050"
	},
	"NHMD": {
		"type": "iflood",
		"pos": {
			"lat": 38.78995789,
			"lng": -77.01942954
		},
		"title": "National Harbour,MD",
		"stationStr": "NHMD",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "EXTRA"
	},
	"MBVA": {
		"type": "iflood",
		"pos": {
			"lat": 37.14935667,
			"lng": -75.93470159
		},
		"title": "Magothy Bay,VA",
		"stationStr": "MBVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
        "hasXbeachVideo": true,
        "xbeachVideoUrl": "{_ChesapeakeBay_XBEACH_FILES_}/magothy_bay/xbeach.mp4",
		"agency": "FHRL"
	},
	"ESVA": {
		"type": "iflood",
		"pos": {
			"lat": 37.11441337,
			"lng": -75.96305337
		},
		"title": "Eastern Shore,VA",
		"stationStr": "ESVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "FHRL"
	},
	"MOVA": {
		"type": "iflood",
		"pos": {
			"lat": 38.22467375,
			"lng": -75.83940896
		},
		"title": "Monie Bay,VA",
		"stationStr": "MOVA",
		"hasWater": true,
		"hasWind": true,
		"hasValidationFile": false,
		"hasWaves": true,
		"agency": "FHRL"
	}
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