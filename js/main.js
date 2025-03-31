let combinedData = [];  // Declare combinedData globally
let totalFrames = 0;    // Initialize totalFrames here to avoid undefined errors
let currentTimeIndex = 0;  // Global variable to track the current time index in animation
var leafletMap;
Promise.all([
  d3.csv('data/2024-2025.csv'),
  d3.csv('data/2025quake.csv'),
  d3.csv('data/2024_02-2023_06.csv'),
  d3.csv('data/2023_06-2022_10.csv'),
  d3.csv('data/2022_10-2022_01.csv')
]).then(([data1, data2, data3, data4, data5]) => {

  // Combine datasets (append data)
  combinedData = [...data1, ...data2, ...data3, ...data4, ...data5];
  window.currentFilteredData = combinedData;

  // Now initialize totalFrames after the data is loaded
  totalFrames = combinedData.length;  // Set totalFrames here after data is loaded
  
  // Standardize data types
  combinedData.forEach(d => {  
    d.latitude = +d.latitude; // Ensure latitude is a number
    d.longitude = +d.longitude; // Ensure longitude is a number
    d.mag = +d.mag; // Convert mag to a number explicitly
    d.date = new Date(d.time);  // Ensure correct date format
});

  // Initialize charts
  leafletMap = new LeafletMap({ parentElement: '#my-map' }, combinedData);
  renderHeatmap(combinedData, 'month', leafletMap);
  //renderHeatmap(combinedData, 'month');
  renderChart(combinedData, 'magnitude');
  updateTopLocation(combinedData);


  // Function to update total earthquake count based on current filtered data
  function updateTotalCount(filteredData) {
    const totalCount = filteredData.length;
    d3.select('#total-count')
      .text(`Total Earthquakes: ${totalCount}`);
  }

  // Brush functionality in the heatmap to filter data and update total count
  function handleBrushSelection(filteredData) {
    updateTotalCount(filteredData);  // Update the count based on brush filter
  }
  // Brush interaction in the heatmap
  d3.select('#heatmap')
  .on('brush', function(event) {
    if (!event.selection) return;

    const [x0, x1] = event.selection;

    // Filter the data based on the selection (time bins)
    const selectedDates = xScale.domain().filter(d => {
        const posX = xScale(d) + xScale.bandwidth() / 2; // Midpoint of each band
        return posX >= x0 && posX <= x1;
    });

    const filteredData = combinedData.filter(d => 
        selectedDates.includes(d3.timeFormat(getTimeFormat('month'))(d.date))
    );

    // Update the map with filtered data (based on current time)
    renderFilteredMap(filteredData);

    // Update the heatmap with the filtered data
    renderHeatmap(filteredData, selectedBinGlobal);

    // Update the magnitude chart based on the filtered data
    renderFilteredChart(filteredData, selectedViewGlobal);
    handleBrushSelection(filteredData); // Update the total earthquake count
  });

  let animationInterval;

  // Start the animation when the user clicks the Start button
  document.getElementById('start-animation').addEventListener('click', function () {
    // Hide Start button and show Stop button
    document.getElementById('start-animation').style.display = 'none';
    document.getElementById('stop-animation').style.display = 'inline';

    // Get the selected time range for the animation
    const animationRange = document.getElementById('timeline').value;
    const selectedSpeed = document.getElementById('animation-speed').value;

    // Start the animation
    animateQuakes(animationRange, selectedSpeed);
  });

  // Stop the animation when the user clicks the Stop button
  document.getElementById('stop-animation').addEventListener('click', function () {
    // Stop the animation interval
    clearInterval(animationInterval);

    // Show Start button and hide Stop button
    document.getElementById('start-animation').style.display = 'inline';
    document.getElementById('stop-animation').style.display = 'none';
  });

  function animateQuakes(startTime, speed) {
    // Ensure totalFrames is initialized before starting the animation
    totalFrames = combinedData.length; // Ensure totalFrames is correctly initialized here

    animationInterval = setInterval(function () {
      if (currentTimeIndex < totalFrames) {
        // Get the current data slice for this frame
        const currentData = combinedData.slice(0, currentTimeIndex);

        // Update the map with filtered data (based on current time)
        renderFilteredMap(currentData);

        // Update the heatmap with the filtered data
        renderHeatmap(currentData, selectedBinGlobal);

        // Update the magnitude chart based on the filtered data
        renderFilteredChart(currentData, selectedViewGlobal);

        // Highlight the current time in the timeline
        const progress = (currentTimeIndex / totalFrames) * 100;
        document.getElementById('timeline').value = progress;

        // Increment the time index for the next frame
        currentTimeIndex++;
      } else {
        // When animation is finished, stop the animation
        clearInterval(animationInterval);
      }
    }, speed);
  }

  // Update Total Count on Dropdown Change (for Binning Interval)
 d3.select('#binning-select').on('change', function() {
  const selectedBin = d3.select(this).property('value');
  renderHeatmap(combinedData, selectedBin); // Re-render heatmap with new binning
  updateTotalCount(combinedData);  // Update count after re-render
});

// Update Total Count on View Change (Magnitude, Duration, Depth)
d3.select('#view-select').on('change', function() {
  const selectedView = d3.select(this).property('value');
  renderMagnitudeChart(combinedData, selectedView); // Re-render chart based on view
  updateTotalCount(combinedData);  // Update count after re-render
});

  // Reset Button Logic to Reset All Filters
  document.getElementById('reset-button').addEventListener("click", function () {
    // Reset the dropdowns to their default values
    document.getElementById("binning-select").value = "month";  // Reset the binning dropdown to 'month'
    selectedBinGlobal = 'month';  // Reset the selected binning to 'month'
    document.getElementById("view-select").value = "magnitude";  // Reset the view dropdown to 'magnitude'
    selectedViewGlobal = 'magnitude'; // Reset the selected view to 'magnitude'
    // Reset the map, chart, and filters to their initial state
    window.currentFilteredData = combinedData;
    renderFilteredMap(combinedData);
    renderFilteredHeatmap(combinedData, 'month');
    // renderFilteredChart(combinedData, 'magnitude');
    renderChart(combinedData, 'magnitude');
    
    // Reset the timeline
    document.getElementById('timeline').value = 0;
    currentTimeIndex = 0;  // Reset the animation to the start
    clearInterval(animationInterval);  // Stop the animation if running

    // Reset animation controls
    document.getElementById('start-animation').style.display = 'inline';
    document.getElementById('stop-animation').style.display = 'none';

    // Reset visual progress bar
    document.getElementById('timeline-progress').style.width = '0%';

    updateTotalCount(combinedData); // Reset total count to full dataset
  });

  // Listen for changes to the timeline slider
  document.getElementById('timeline').addEventListener('input', function (event) {
    const selectedValue = event.target.value;
    const selectedTime = (selectedValue / 100) * totalFrames; // Map slider value to total frames
    currentTimeIndex = Math.floor(selectedTime);

    // Update the visualizations immediately based on the timeline
    const filteredData = combinedData.slice(0, currentTimeIndex);
    renderFilteredMap(filteredData);
    renderFilteredHeatmap(filteredData, selectedBinGlobal);
    renderFilteredChart(filteredData, selectedViewGlobal);
  });

}).catch(error => console.error(error));

function updateTopLocation(data, metric = "count") {
  let result;

  if (metric === "count") {
    result = d3.rollups(data, v => v.length, d => d.place);
  } else if (metric === "average") {
    result = d3.rollups(data, v => d3.mean(v, d => +d.mag), d => d.place);
  } else if (metric === "energy") {
    result = d3.rollups(data, v => d3.sum(v, d => Math.pow(10, 1.5 * d.mag)), d => d.place);
  }

  result.sort((a, b) => b[1] - a[1]);

  const top = result[0];
  const displayValue =
    metric === "count" ? `${top[0]} (${top[1]} quakes)` :
    metric === "average" ? `${top[0]} (Avg Mag: ${top[1].toFixed(2)})` :
    `${top[0]} (Energy: ${top[1].toExponential(2)})`;

  d3.select("#location-value").text(displayValue);

  // Dropdown change listener
d3.select("#impact-metric").on("change", function () {
  const selectedMetric = this.value;
  updateTopLocation(combinedData, selectedMetric);
});
}


// Helper function to determine time bin format
function getTimeFormat(interval) {
  switch (interval) {
    case 'day': return '%Y-%m-%d';
    case 'week': return '%Y-%U';
    case 'month': return '%Y-%m';
    case 'year': return '%Y';
    default: return '%Y-%m';
  }
}

function renderFilteredMap(filteredData) {
  window.currentFilteredData = filteredData;
  leafletMap.updateMap(filteredData);  // Update the map with filtered data
}

function renderFilteredHeatmap(filteredData, selectedBinGlobal) {
  renderHeatmap(filteredData, selectedBinGlobal);  // Update the heatmap with filtered data
}

function renderFilteredChart(filteredData, selectedViewGlobal) {
  renderChart(filteredData, selectedViewGlobal);  // Update the chart with filtered data
}

// In main.js - Handle updates from the LeafletMap brushing selection
function updateTimelineBasedOnData(filteredData) {
  const minDate = d3.min(filteredData, d => d.date);  // Get the earliest date
  const maxDate = d3.max(filteredData, d => d.date);  // Get the latest date

  // Set the timeline's min and max to match the filtered data's date range
  const timeline = document.getElementById('timeline');
  timeline.min = minDate.getTime();
  timeline.max = maxDate.getTime();
  timeline.value = minDate.getTime();  // Set the timeline's value to the start date
}
