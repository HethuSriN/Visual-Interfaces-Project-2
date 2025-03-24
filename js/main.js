Promise.all([
  d3.csv('data/2024-2025.csv'),
  d3.csv('data/2025quake.csv'),
  d3.csv('data/2024_02-2023_06.csv'),
  d3.csv('data/2023_06-2022_10.csv'),
  d3.csv('data/2022_10-2022_01.csv')
]).then(([data1, data2, data3, data4, data5]) => {
  
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
  renderMagnitudeChart(combinedData);

  // Reset Filter Logic
  document.getElementById("reset-button").addEventListener("click", function() {
      console.log("Resetting data...");
      renderHeatmap(combinedData, 'month');    
      leafletMap.updateMap(combinedData);      
      renderMagnitudeChart(combinedData);      
  });

}).catch(error => console.error(error));
