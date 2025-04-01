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
    this.soundEnabled = false; // Default: sound is OFF
    this.initVis();
  }
  initVis() {
    let vis = this;
    // let soundEnabled = false;  
    document.getElementById('sound-toggle').addEventListener('click', () => {
      vis.soundEnabled = !vis.soundEnabled;  // Flip the state
    
      // Update button label
      const label = vis.soundEnabled ? '🔈 Sound On' : '🔇 Sound Off';
      document.getElementById('sound-toggle').textContent = label;
    });
  
    //USTOPO
    vis.usTopoUrl = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
    vis.usTopoAttr = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>';

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

    // Define the tile layers
    vis.baseLayers = {
      "WorldTerrainMap": L.tileLayer(vis.Esri_WorldTerrainUrl, { id: 'esri-image',attribution: vis.Esri_WorldTerrainAttr,ext: 'png'}),
      "Cyclosm": L.tileLayer(vis.csmUrl, { attribution: vis.csmAttr, id: 'stamen-terrain', ext: 'png'}),
      "OpenTopoMap": L.tileLayer(vis.topoUrl, { attribution: vis.topoAttr, id: 'opentopomap', ext: 'png'}),
      "ESRI World Imagery": L.tileLayer(vis.esriUrl, { attribution: vis.esriAttr, id: 'esri-image', ext: 'png'}),
      "USGS US TOPO": L.tileLayer(vis.usTopoUrl, { attribution: vis.usTopoAttr, id: 'usgs-us-topo', ext: 'png'}),
    };

    document.getElementById("map-dropdown").addEventListener("change", function() {
      const selectedLayer = this.value;
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
    L.svg({clickable:true}).addTo(vis.theMap);
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane);
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto");    

    // Create a feature group for Leaflet Draw
    const drawnItems = new L.FeatureGroup().addTo(vis.theMap);

    // Initialize Leaflet Draw control with rectangle option
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems
      },
      draw: {
        rectangle: true,  // Enable only rectangle drawing
        polyline: false,
        polygon: false,
        circle: false,
        marker: false
      }
    });

    vis.theMap.addControl(drawControl);  // Add the control to the map

    // Event listener when a rectangle is drawn
    // vis.theMap.on('draw:created', function (e) {
    //   const layer = e.layer;
    //   drawnItems.addLayer(layer);  // Add the drawn rectangle to the feature group

    //   // Filter the data based on the rectangle bounds
    //   const bounds = layer.getBounds();  // Get bounds of the drawn rectangle
    //   const filteredData = vis.data.filter(d =>
    //     d.latitude >= bounds.getSouth() && d.latitude <= bounds.getNorth() &&
    //     d.longitude >= bounds.getWest() && d.longitude <= bounds.getEast()
    //   );

    //   // After filtering, update the map, heatmap, and chart
    //   renderFilteredMap(filteredData);  // Filter the map based on selection
    //   renderFilteredHeatmap(filteredData, selectedBinGlobal);  // Filter the heatmap
    //   renderFilteredChart(filteredData, selectedViewGlobal);  // Filter the chart
    // });
    vis.theMap.on('draw:created', function (e) {
      const layer = e.layer;
      drawnItems.addLayer(layer);
    
      const bounds = layer.getBounds();
    
      const filteredData = vis.data.filter(d =>
        d.latitude >= bounds.getSouth() && d.latitude <= bounds.getNorth() &&
        d.longitude >= bounds.getWest() && d.longitude <= bounds.getEast()
      );
    
      // Store current filtered data globally
      window.currentFilteredData = filteredData;
    
      // Update chart with only filtered data
      renderFilteredMap(filteredData);
      renderFilteredHeatmap(filteredData, selectedBinGlobal);
      renderFilteredChart(filteredData, selectedViewGlobal);  // ⬅ this is key
    });
    

    // Reset button event listener
    document.getElementById("reset-button").addEventListener("click", function () {
      drawnItems.clearLayers();  // Clear all drawn items
      renderFilteredMap(vis.data);  // Reset the map to show all data
      renderFilteredHeatmap(vis.data, selectedBinGlobal);  // Reset the heatmap
      renderFilteredChart(vis.data, selectedViewGlobal);  // Reset the chart
    });

    // Helper function to update the timeline based on filtered data
    function updateTimelineBasedOnData(filteredData) {
      const minDate = d3.min(filteredData, d => d.date);
      const maxDate = d3.max(filteredData, d => d.date);

      const timeline = document.getElementById('timeline');
      timeline.min = minDate.getTime();
      timeline.max = maxDate.getTime();
      timeline.value = minDate.getTime();  // Set to the start of the filtered range

      document.getElementById('timeline-progress').style.width = '0%';
    }

    // Define the getColor function here, so it is accessible
    vis.getColor = function(magnitude) {
      return magnitude >= 6.0 ? "#d73027" :  // Strong (Red)
            magnitude >= 5.0 ? "#fc8d59" :  // Moderate (Orange)
            magnitude >= 4.0 ? "#fee08b" :  // Light (Yellow)
            magnitude >= 3.0 ? "#d9ef8b" :  // Minor (Light Green)
            "#91cf60"; // Weak (Green)
    }

    // Add earthquake markers (dots) to the map
    vis.Dots = vis.svg.selectAll('circle')
      .data(vis.data)
      .join('circle')
      .attr("fill", d => vis.getColor(d.mag))
      .attr("stroke", "black")
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("r", d => Math.max(2, d.mag * 1.5))
      .on('mouseover', function(event, d) {
        // Only play sound if enabled
        if (vis.soundEnabled) {
          // Play sound for the earthquake
          vis.playEarthquakeSound(d); // Call the function to play sound based on earthquake data
      }

        d3.select(this).transition()
          .duration('150')
          .attr("fill", "red")
          .attr('r', d => Math.max(4, d.mag * 2));

        d3.select('#tooltip')
          .style('opacity', 1)
          .html(`
            <strong>Location:</strong> ${d.place} <br>
            <strong>Magnitude:</strong> ${d.mag} <br> 
            <strong>Depth:</strong> ${d.depth} km <br>
            <strong>Time:</strong> ${new Date(d.time).toLocaleString()}
          `);
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseleave', function() {
        d3.select(this).transition()
          .duration('150')
          .attr("fill", d => vis.getColor(d.mag))
          .attr('r', d => Math.max(2, d.mag * 1.5));
        
        d3.select('#tooltip').style('opacity', 0);
      });

    // Event listener for map zoom changes
    vis.theMap.on("zoomend", function() {
      vis.updateVis();
    });
  }

  updateVis() {
    let vis = this;

    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("fill", d => vis.getColor(d.mag))
      .attr("r", d => Math.max(3, d.mag * 2))
  }

  updateMap(filteredData) {
    let vis = this;
    const predictions = computePredictionZones(filteredData);
    initMiniGlobe(predictions.slice(0, 100)); // Show only 100 for performance
  
    // Clear previous points
    vis.svg.selectAll('circle').remove();
  
    // Add filtered data to the map as dots
    vis.Dots = vis.svg.selectAll('circle')
      .data(filteredData)
      .join('circle')
      .attr("fill", d => vis.getColor(d.mag))
      .attr("stroke", "black")
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("r", d => Math.max(2, d.mag * 1.5))
      .on('mouseover', function(event, d) {
        if (vis.soundEnabled) {
          vis.playEarthquakeSound(d);
        }
  
        d3.select(this).transition()
          .duration(150)
          .attr("fill", "red")
          .attr("r", Math.max(4, d.mag * 2));
  
        d3.select('#tooltip')
          .style('opacity', 1)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px')
          .html(`
            <strong>Location:</strong> ${d.place} <br>
            <strong>Magnitude:</strong> ${d.mag} <br> 
            <strong>Depth:</strong> ${d.depth} km <br>
            <strong>Time:</strong> ${new Date(d.time).toLocaleString()}
          `);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).transition()
          .duration(150)
          .attr("fill", vis.getColor(d.mag))
          .attr("r", Math.max(2, d.mag * 1.5));
  
        d3.select('#tooltip').style('opacity', 0);
      });
  }
  

  playEarthquakeSound(earthquake) {
    const magnitude = earthquake.mag;
    const depth = earthquake.depth;
  
    // Map magnitude to volume (0 to 1 scale)
    const volume = Math.min(Math.max(magnitude / 10, 0), 1); // Ensure volume is between 0 and 1
  
    // Map depth to pitch (lower depth = lower pitch)
    const pitch = Math.max(Math.min(2 - depth / 7000, 2), 0.5); // Ensure pitch is between 0.5 and 2
  
    // Use the same sound file but modify volume and pitch based on magnitude and depth
    const sound = new Howl({
      src: ['sounds/earthquake_sound.mp3'],  // Path to your sound file
      volume: volume,                 // Adjust volume based on magnitude
      rate: pitch,                    // Adjust pitch based on depth
      loop: false                     // Set to true if you want it to loop
    });
  
    // Play the sound
    sound.play();
  }
}
