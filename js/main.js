Promise.all([
  d3.csv('data/2024-2025.csv'),
  d3.csv('data/2025quake.csv'),
  d3.csv('data/2024_02-2023_06.csv'),
  d3.csv('data/2023_06-2022_10.csv'),
  d3.csv('data/2022_10-2022_01.csv')
]).then(([data1, data2, data3, data4, data5]) => {
  
  // Combine datasets (append data)
  const combinedData = [...data1, ...data2, ...data3, ...data4, ...data5];

  combinedData.forEach(d => {  
      d.latitude = +d.latitude; 
      d.longitude = +d.longitude;
      d.mag = +d.mag;  
      d.date = new Date(d.time);  // Ensure correct date format
  });

  // Initialize charts
  leafletMap = new LeafletMap({ parentElement: '#my-map' }, combinedData);
  renderHeatmap(combinedData, 'month');
  renderChart(combinedData, 'magnitude');

  let animationInterval;
  let currentTimeIndex = 0;  // This tracks the current time index in the animation
  let totalFrames = combinedData.length;  // Define totalFrames here

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
    totalFrames = combinedData.length; // Make sure totalFrames is defined
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

        // Update the visual progress bar
        document.getElementById('timeline-progress').style.width = `${progress}%`;

        // Increment the time index for the next frame
        currentTimeIndex++;
      } else {
        // When animation is finished, stop the animation
        clearInterval(animationInterval);
      }
    }, speed);
  }

  // Reset Button Logic to Reset All Filters
  document.getElementById('reset-button').addEventListener("click", function () {
    // Reset the dropdowns to their default values
    document.getElementById("binning-select").value = "month";  // Reset the binning dropdown to 'month'
    document.getElementById("view-select").value = "magnitude";  // Reset the view dropdown to 'magnitude'
    
    // Reset the map, chart, and filters to their initial state
    renderFilteredMap(combinedData);
    renderFilteredHeatmap(combinedData, 'month');
    renderFilteredChart(combinedData, 'magnitude');

    // Reset the timeline
    document.getElementById('timeline').value = 0;
    currentTimeIndex = 0;  // Reset the animation to the start
    clearInterval(animationInterval);  // Stop the animation if running

    // Reset animation controls
    document.getElementById('start-animation').style.display = 'inline';
    document.getElementById('stop-animation').style.display = 'none';

    // Reset visual progress bar
    document.getElementById('timeline-progress').style.width = '0%';
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

// Function to render filtered heatmap
function renderFilteredHeatmap(filteredData, selectedBinGlobal) {
  renderHeatmap(filteredData, selectedBinGlobal);
}

// Function to render filtered map data (World Map)
function renderFilteredMap(filteredData) {
  leafletMap.updateMap(filteredData);
}

// Function to render filtered chart
function renderFilteredChart(filteredData, selectedViewGlobal) {
  quakeChart.renderChart(filteredData, selectedViewGlobal);
}
