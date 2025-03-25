class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.initVis();
  }
  
  initVis() {
    let vis = this;


    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //TOPO
    vis.topoUrl ='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    //Stamen Water Color
    vis.stnUrl = 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}';
    vis.stnAttr = '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Cyclosm
    vis.csmUrl = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png';
    vis.csmAttr = '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    vis.Esri_WorldTerrainUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}';
    vis.Esri_WorldTerrainAttr = 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS';
    //this is the deafult map layer, where we are showing the map background


    // Define the tile layers
    vis.baseLayers = {
      "WorldTerrainMap": L.tileLayer(vis.Esri_WorldTerrainUrl, { id: 'esri-image',attribution: vis.Esri_WorldTerrainAttr,ext: 'png'}),
      "Cyclosm": L.tileLayer(vis.csmUrl, { attribution: vis.csmAttr, id: 'stamen-terrain', ext: 'png'}),
      "OpenTopoMap": L.tileLayer(vis.topoUrl, { attribution: vis.topoAttr, id: 'opentopomap', ext: 'png'}),
      "ESRI World Imagery": L.tileLayer(vis.esriUrl, { attribution: vis.esriAttr, id: 'esri-image', ext: 'png'}),
      "Stamen Water Color": L.tileLayer(vis.stnUrl, { attribution: vis.stnAttr, id: 'thunderforest-outdoors', ext: 'jpg'}),
    };

    document.getElementById("map-dropdown").addEventListener("change", function() {
      const selectedLayer = this.value;
      // vis.theMap.eachLayer(layer => vis.theMap.removeLayer(layer));
      // Only remove the base layer (not SVG/earthquake points)
      Object.values(vis.baseLayers).forEach(layer => vis.theMap.removeLayer(layer));
      vis.baseLayers[selectedLayer].addTo(vis.theMap);
      vis.updateVis();
    });

    // Set the default base layer
    vis.base_layer = L.tileLayer(vis.Esri_WorldTerrainUrl, {
      id: 'esri-image',
      attribution: vis.Esri_WorldTerrainAttr,
      ext: 'png'
    });

    vis.theMap = L.map('my-map', {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer]
    });

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")    

    // Function to determine marker color based on magnitude
    vis.getColor = function(magnitude) {
      return magnitude >= 6.0 ? "#d73027" :  // Strong (Red)
            magnitude >= 5.0 ? "#fc8d59" :  // Moderate (Orange)
            magnitude >= 4.0 ? "#fee08b" :  // Light (Yellow)
            magnitude >= 3.0 ? "#d9ef8b" :  // Minor (Light Green)
                                "#91cf60";   // Weak (Green)
    };
    // Brushing feature for geographic selection
  const brush = L.rectangle([[35, -120], [45, -100]], {
    color: "#0078A8",
    weight: 2,
    fillOpacity: 0.2
  }).addTo(vis.theMap);

  brush.on('edit', function (e) {
    const bounds = e.target.getBounds();
    const filteredData = vis.data.filter(d =>
        d.latitude >= bounds.getSouth() && d.latitude <= bounds.getNorth() &&
        d.longitude >= bounds.getWest() && d.longitude <= bounds.getEast()
  );

    renderFilteredHeatmap(filteredData);  // Update heatmap based on map selection
    renderFilteredMagnitudeChart(filteredData); // Filter Magnitude Chart
  });


    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data) 
                    .join('circle')
                        .attr("fill", d => vis.getColor(d.mag))  
                        .attr("stroke", "black")
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", d => Math.max(2, d.mag * 1.5))  
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() 
                              .duration('150') 
                              .attr("fill", "red") 
                              .attr('r', d => Math.max(4, d.mag * 2));  

                            //create a tool tip
                            d3.select('#tooltip')
                                .style('opacity', 1)
                                .style('z-index', 1000000)
                                .html(`<strong>Location:</strong> ${d.place} <br> 
                                  <strong>Magnitude:</strong> ${d.mag} <br> 
                                  <strong>Depth:</strong> ${d.depth} km <br>
                                  <strong>Time:</strong> ${new Date(d.time).toLocaleString()}`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') 
                              .attr("fill", d => vis.getColor(d.mag)) 
                              .attr('r', d => Math.max(2, d.mag * 1.5)); 

                            d3.select('#tooltip').style('opacity', 0);

                          })
    
    //handler here for updating the map, as you zoom in and out          
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });

  }

  updateVis() {
    let vis = this;

    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("fill", d => vis.getColor(d.mag))
      .attr("r", d => Math.max(3, d.mag * 2));
  }


  renderVis() {
    let vis = this;
 
  }
  
  updateMap(filteredData) {
    let vis = this;

    // Clear previous points
    vis.svg.selectAll('circle').remove();

    // Add filtered data
    vis.Dots = vis.svg.selectAll('circle')
        .data(filteredData)
        .join('circle')
        .attr("fill", d => vis.getColor(d.mag))
        .attr("stroke", "black")
        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
        .attr("r", d => Math.max(2, d.mag * 1.5));
}

}