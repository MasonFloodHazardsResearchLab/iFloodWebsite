#Map Data Format
The file `mapdata.js` contains information about the various data layers available on the interactive map.

##Layers
####group
An integer, corresponding to the index of the layer group to place this layer under.
####type
The type of data this layer displays. Possible values are:
- `"geoJSON"` - most common
- `"outline"` - similar to geojson, but used to show a boundary instead of data
- `"wmsTile"` - loads image tiles from a [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) server
- `"arcGIS"` - loads image tiles from an ArcGIS server
- `"stormPath"` - shows paths of storms (you probably won't be modifying these)
####displayName
A string representing the name of the layer as displayed to the user
####temporal
A boolean indicating if the layer is temporal (has splits and a max file) or is static across time (like bathymetry)
####url
For all layer types except `geoJSON`, this is the URL of the file/server to load data from.
####urls
For `geoJSON` layers, multiple URLs can be specified for different view levels. You must include a URL for view level 0 (the default). For example:
```javascript
"urls":[
    [0,"{_some_model_FILES_}/some/folder/{_h_}.json"],
    [2,"{_some_model_FILES_}/some/other/folder/{_h_}.json"]
]
```
^ This temporal layer has special data for view level 2. The entries should always be in order, with 0 first. The `{_h_}` will be replaced with the integer of the current hour being viewed.
####maxUrl
For temporal `geoJSON` layers, this is the URL of the maximum file.
####downloadUrl
This is the URL that users will be sent to when they click the `Raw Data` button. For iFLOOD data these usually start with `{_some_model_DOWNLOAD_}/` where "some_model" is replaced by the name of the model the layer comes from.
####colorRange
For `geoJSON` layers, the color range to use. You'll generally be using one from `colorRanges`, such as `colorRanges["jet"]`.
####colorBounds
For `geoJSON` layers, the range of values `[min, max]` in the data (used when coloring the map). Values outside this range will all be the same color.
####colorProperty
For `geoJSON` layers, the geoJSON property to read for determining the color of the data. Usually this is something like `"elemin"`.
####unit
The units the data is in, like `"m/s"` or `"ft"`
####opacity
For `geoJSON` layers, the opacity of the layer. Self explanatory.
####reverseBar
For `geoJSON` layers, determines the direction that the scale bar is drawn in. `true` means the highest number is at the top.
####z
For `geoJSON` layers, the stacking order of the layer. Layers with a higher z are drawn on top of those with a lower z. For best results, no two layers should have the same z value.
####img
The preview icon for the layer.
####description
Text explaining where the data comes from, how to interpret it, etc.