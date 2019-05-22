# Map Data Format
The file `mapdata.js` contains information about the various data layers available on the interactive map.

## URL Patterns
URLs for GeoJSON layers, station XBEACH videos, and pretty much anywhere else in `mapdata.js` where a URL is specified can include special patterns that will be replaced at runtime.
#### Files/Download
For each forecast model (specified in `models`) there are two paths:
- `{_MODELNAMEHERE_FILES_}` points to the current forecast folder for the model based on `recent.txt.`
- `{_MODELNAMEHERE_DOWNLOAD_}` points to the *file browser* for the current forecast folder for the model. This should be used for links that will be directly opened in the user's browser, like the `downloadUrl` of a layer.

## Layers
#### group
An integer, corresponding to the index of the layer group to place this layer under. For example, layers that show under "GMU iFLOOD Data" have group index 0.
#### type
The type of data this layer displays. Possible values are:
- `"geoJSON"` - most common
- `"outline"` - similar to geojson, but used to show a boundary instead of data
- `"wmsTile"` - loads image tiles from a [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) server
- `"arcGIS"` - loads image tiles from an ArcGIS server
- `"stormPath"` - shows paths of storms (you probably won't be modifying these)
- `"heatmap"` - shows a collection of weighted points as a heatmap (used for Twitter data)
#### displayName
A string representing the name of the layer as displayed to the user
#### temporal
A boolean indicating if the layer is temporal (has splits and a max file) or is static across time (like bathymetry)
#### url
For all layer types except `geoJSON`, this is the URL of the file/server to load data from.
#### urls
For `geoJSON` layers, multiple URLs can be specified for different view levels. You must include a URL for view level 0 (the default). For example:
```javascript
"urls":[
    [0,"{_some_model_FILES_}/some/folder/{_h_}.json"],
    [2,"{_some_model_FILES_}/some/other/folder/{_h_}.json"]
]
```
^ This temporal layer has special data for view level 2. The entries should always be in order, with 0 first. The `{_h_}` will be replaced with the integer of the current hour being viewed.
#### maxUrl
For temporal `geoJSON` layers, this is the URL of the file that shows the maximum values over the entire time range.
#### downloadUrl
This is the URL that users will be sent to when they click the `Raw Data` button. For iFLOOD data these usually start with `{_some_model_DOWNLOAD_}/` where "some_model" is replaced by the name of the model the layer comes from.
#### colorRange
For `geoJSON` layers, the color range to use. You'll generally be using one from `colorRanges`, such as `colorRanges["jet"]`.
#### colorBounds
For `geoJSON` layers, the range of values `[min, max]` in the data (used when coloring the map). Values outside this range will all be the same color.
#### colorProperty
For `geoJSON` layers, the geoJSON property to read for determining the color of the data. Usually this is something like `"elemin"`.
#### unit
The units the data is in, like `"m/s"` or `"ft"`
#### opacity
For `geoJSON` layers, the opacity of the layer. Self explanatory.
#### reverseBar
For `geoJSON` layers, determines the direction that the scale bar is drawn in. `true` means the highest number is at the top.
#### z
For `geoJSON` layers, the stacking order of the layer. Layers with a higher z are drawn on top of those with a lower z. For best results, no two layers should have the same z value.
#### gisLayer
For `arcGIS` layers, this is the number of the layer on the map server to read.
#### img
The URL of the preview icon for the layer.
#### description
Text explaining where the data comes from, how to interpret it, etc.

## Stations
#### type
Indicates which kind of station this is:
- `"station"` - the generic lolipop-style icon, generally for stations that have observed water data
- `"buoy""` - wave icon, used for places with observed wave heights
- `"iflood""` - iflood logo icon, used for iFlood IoT stations and other points we track
#### pos
Fairly self-explanatory. This is the location of the station, where the marker appears on the map
#### title
The name of the station/location.
#### stationStr
This is the codename used to look up .tsv files and such for the station. This should match the object name unless you have some special reason. They're all 4-letter codes currently but they can be longer if needed.
#### hasWater
A boolean indicating if this station has a water file located at the global `stationWaterUrl`. If enabled, the plot shows in the relevant tab. For all of these, the key being omitted entirely is the same as explicitly setting it to false.
#### hasValidationFile
A boolean indicating if this station has a water validation file located at the global `stationValidationUrl`.
#### hasWind
A boolean indicating if this station has a wind file located at the global `stationWindUrl`.
#### hasWaves
A boolean indicating if this station has a wave file located at the global `stationWavesUrl`.
#### hasWavesValidation
A boolean indicating if this station has a wave validation file located at the global `stationWavesValidationUrl`.
#### hasLongtermWater
A boolean indicating if this station has a 30-day water file located at the global `stationLongtermWaterUrl`.
#### hasXbeachVideo
A boolean indicating if this station has an XBEACH video file. If this is true, you must also provide `xbeachVideoUrl`.
#### hasWaveSpectrum
A boolean indicating if this station has a wave spectrum video file. If this is true, you must also provide `waveSpectrumVideoUrl`.