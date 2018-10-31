from pygeotile.tile import Tile, Point
import os
from urllib.request import urlopen
from multiprocessing.pool import ThreadPool
import time

minZoom = 0
maxZoom = 10

#number of tiles = 4^zoom
#grid dimension max = 2^zoom

tilesToGrab = []

startTime = time.time()

for zoom in range(minZoom,maxZoom+1):
	gridMax = 2**zoom
	for x in range(0,gridMax):
		for y in range(0,gridMax):
			if zoom >= 4 and (x > gridMax/2 or y > gridMax/2): #only interested in north america
				continue
			if zoom >= 6 and ((x < gridMax*0.27 or x > gridMax*0.3) or (y < gridMax*0.367 or y > gridMax*0.4)): #only get the serious zoom levels right around the east coast
				continue
			t = Tile.from_google(x,y,zoom)
			url = "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export?f=image&bbox="+str(t.bounds[0][1])+"%2C"+str(t.bounds[0][0])+"%2C"+str(t.bounds[1][1])+"%2C"+str(t.bounds[1][0])+"&size=256%2C256&imageSR=102113&bboxSR=4326&format=png8&layerDefs=&layers=show%3A19&transparent=true"
			filename = "tiles/%d_%d_%d.png" % (zoom,x,y)
			#print(url)
			tilesToGrab.append((url,filename))

print(str(len(tilesToGrab))+" tiles")
			
def fetch_tile(tileData):
	try:
		img = urlopen(tileData[0])
		imgData = img.read()
		if len(imgData) > 205:
			with open(tileData[1], 'wb') as f:
				f.write(imgData)
	except Exception as e:
		return tileData, False, e
	return tileData, True, None

results = ThreadPool(10).imap_unordered(fetch_tile, tilesToGrab)
for tileData, worked, e in results:
	if worked:
		print(tileData[1])
	else:
		print("Error: "+tileData[0])
		print(e)

print("\ntook %d seconds" % (time.time()-startTime))
	
#t = Tile.from_google(x,y,zoom)
#img = urllib.request.urlopen("https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/forecast_meteoceanhydro_sfc_ndfd_time/MapServer/export?f=image&bbox="+str(t.bounds[0][0])+"%2C"+str(t.bounds[0][1])+"%2C"+str(t.bounds[1][0])+"%2C"+str(t.bounds[1][1])+"&size=256%2C256&imageSR=102113&bboxSR=4326&format=png32&layerDefs=&layers=show%3A31&transparent=true")
#with open("tiles/%d_%d_%d.png" % (zoom,x,y), 'wb') as f:
#	f.write(img.read())