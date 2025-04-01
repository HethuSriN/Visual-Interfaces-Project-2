// Mini Globe Visualization
function initMiniGlobe(predictions) {
    const width = 250;
    const height = 250;
  
    const svg = d3.select("#mini-globe")
      .attr("width", width)
      .attr("height", height);
  
    const projection = d3.geoOrthographic()
      .scale(100)
      .translate([width / 2, height / 2])
      .clipAngle(90);
  
    const path = d3.geoPath().projection(projection);
    const tooltip = d3.select("#globe-tooltip");
  
    svg.selectAll("*").remove();
  
    svg.append("circle")
      .attr("fill", "#d9f0ff")
      .attr("stroke", "#333")
      .attr("r", projection.scale())
      .attr("cx", width / 2)
      .attr("cy", height / 2);
  
    // 🌍 Load land and draw everything once
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(worldData => {
      const land = topojson.feature(worldData, worldData.objects.land);
  
      // 🗺 Draw the land (only once)
      const landPath = svg.append("path")
        .datum(land)
        .attr("class", "land")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);
  
      // ✨ Glow effect
      const defs = svg.append("defs");
      const filter = defs.append("filter").attr("id", "glow");
      filter.append("feGaussianBlur")
        .attr("stdDeviation", 2.5)
        .attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  
      // 🔴 Plot predicted points
      svg.selectAll(".predicted-quake")
        .data(predictions)
        .enter()
        .append("circle")
        .attr("class", "predicted-quake")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", d => Math.min(Math.sqrt(d.score) * 3, 5))
        .attr("fill", "red")
        .attr("stroke", "#ff8000")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .attr("filter", "url(#glow)")
        .on("mouseover", function (event, d) {
          tooltip.style("display", "block")
            .html(`
              <strong>⚠️ Predicted Risk</strong><br>
              <strong>Latitude:</strong> ${d.lat.toFixed(2)}<br>
              <strong>Longitude:</strong> ${d.lon.toFixed(2)}<br>
              <strong>Risk Score:</strong> ${d.score.toFixed(3)}
            `);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));
  
      // 🔄 Start rotation
      rotateMiniGlobe(svg, projection, path, predictions, landPath);
    });
  }
  

  // Example: Create risk scores by grid region
function computePredictionZones(data) {
    const riskMap = {};
  
    data.forEach(d => {
      const latBin = Math.floor(d.latitude / 5) * 5;
      const lonBin = Math.floor(d.longitude / 5) * 5;
      const key = `${latBin}_${lonBin}`;
  
      const ageFactor = 1 / (Date.now() - new Date(d.time)); // more recent = higher
      const magnitudeFactor = d.mag || 0;
  
      if (!riskMap[key]) riskMap[key] = 0;
      riskMap[key] += magnitudeFactor * ageFactor * 1e10; // normalize
    });
  
    // Convert to prediction points
    const predictions = Object.entries(riskMap)
      .map(([key, score]) => {
        const [lat, lon] = key.split('_').map(Number);
        return { lat, lon, score };
      })
      .filter(d => d.score > 0.01); // filter low-risk
    return predictions;
  }

  function updateMiniGlobe(predictions) {
    const width = 200;
    const height = 200;
  
    const svg = d3.select("#mini-globe")
      .attr("width", width)
      .attr("height", height);
  
    const projection = d3.geoOrthographic()
      .scale(130)
      .translate([width / 2, height / 2])
      .clipAngle(90);
  
    const path = d3.geoPath().projection(projection);
  
    // Clear previous globe
    svg.selectAll("*").remove();
  
    // Draw ocean globe
    svg.append("circle")
      .attr("fill", "#d9f0ff")
      .attr("stroke", "#333")
      .attr("r", projection.scale())
      .attr("cx", width / 2)
      .attr("cy", height / 2);
  
    // Draw land if you have topojson loaded
    if (window.worldData) {
      svg.append("path")
        .datum(topojson.feature(worldData, worldData.objects.land))
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);
    }
  
    // Plot predicted future earthquakes
    svg.selectAll(".predicted-quake")
      .data(predictions)
      .join("circle")
      .attr("class", "predicted-quake")
      .attr("cx", d => projection([d.lon, d.lat])[0])
      .attr("cy", d => projection([d.lon, d.lat])[1])
      .attr("r", d => Math.min(Math.sqrt(d.score) * 6, 10)) // score-to-radius scaling
      .attr("fill", "orange")
      .attr("opacity", 0.7)
      .attr("stroke", "#ff8000")
      .attr("stroke-width", 1)
      .attr("filter", "url(#glow)");
  
    // Add a glow filter for visual effect
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", 2.5)
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  }
  function renderPredictedPoints(predictedData, svg, projection) {
    const tooltip = d3.select("#globe-tooltip");
  
    svg.selectAll(".predicted-point")
      .data(predictedData)
      .enter()
      .append("circle")
      .attr("class", "predicted-point")
      .attr("cx", d => projection([d.longitude, d.latitude])[0])
      .attr("cy", d => projection([d.longitude, d.latitude])[1])
      .attr("r", 4)
      .attr("fill", "red")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        tooltip.style("display", "block")
          .html(`
            <strong>⚠️ Predicted Risk</strong><br>
            <strong>Location:</strong> ${d.place || "Unknown"}<br>
            <strong>Latitude:</strong> ${d.latitude.toFixed(2)}<br>
            <strong>Longitude:</strong> ${d.longitude.toFixed(2)}<br>
            <strong>Predicted Mag:</strong> ${d.predictedMag?.toFixed(1) || "N/A"}
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }
  
//   function rotateMiniGlobe(svg, projection, path, predictions) {
//     let angle = 0;
  
//     d3.timer(() => {
//       angle += 0.2;
//       projection.rotate([angle, -15]);
  
//       // Update circles
//       svg.selectAll(".predicted-quake")
//         .attr("cx", d => projection([d.lon, d.lat])[0])
//         .attr("cy", d => projection([d.lon, d.lat])[1]);
      
//       // Optional: update land outline if you added land features
//     });
//   }

function rotateMiniGlobe(svg, projection, path, predictions, landData) {
    let angle = 0;
  
    const landPath = svg.select(".land"); // ⬅ reference to land path
  
    d3.timer(() => {
      angle += 0.2;
      projection.rotate([angle, -15]);
  
      // 🔄 Update land shape
      landPath.attr("d", path); // Redraw land using updated projection
  
      // 🔄 Update predicted points
      svg.selectAll(".predicted-quake")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1]);
    });
  }
  
  
  
  