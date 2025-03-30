// Load and combine multiple datasets
Promise.all([
  d3.csv('data/2024-2025.csv'),
  d3.csv('data/2025quake.csv'),
  d3.csv('data/2024_02-2023_06.csv'),
  d3.csv('data/2023_06-2022_10.csv'),
  d3.csv('data/2022_10-2022_01.csv')
]).then(([data1, data2, data3, data4, data5]) => {

// Combine datasets (append data)
const combinedData = [...data1, ...data2, ...data3, ...data4, ...data5];

// Parse and standardize data types
combinedData.forEach(d => {  
    d.latitude = +d.latitude; 
    d.longitude = +d.longitude;
    d.mag = +d.mag;  
    d.date = new Date(d.time);  // Ensure correct date format
});

// Initialize charts and map
leafletMap = new LeafletMap({ parentElement: '#my-map' }, combinedData);
renderHeatmap(combinedData, 'month');
renderMagnitudeChart(combinedData);

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

    renderFilteredMap(filteredData);   // Filter Map
    renderFilteredMagnitudeChart(filteredData); // Filter Magnitude Chart
    handleBrushSelection(filteredData); // Update the total earthquake count
  });

// Reset Filter Logic for Reset Button
document.getElementById("reset-button").addEventListener("click", function() {
    console.log("Resetting data...");
    renderHeatmap(combinedData, 'month');    
    leafletMap.updateMap(combinedData);      
    renderMagnitudeChart(combinedData);      
    updateTotalCount(combinedData); // Reset total count to full dataset
});

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

}).catch(error => console.error(error));
