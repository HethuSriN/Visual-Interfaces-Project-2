Promise.all([
  d3.csv('data/2024-2025.csv'),
  d3.csv('data/2025quake.csv'),
  d3.csv('data/2024_02-2023_06.csv'),
  d3.csv('data/2023_06-2022_10.csv'),
  d3.csv('data/2022_10-2022_01.csv')
]).then(([data1, data2, data3, data4, data5]) => {

  // Combine datasets (append data)
  const combinedData = [...data1, ...data2, ...data3, ...data4, ...data5];

  console.log("Number of items: " + combinedData.length);
  console.log(combinedData);
  combinedData.forEach(d => {  
      d.latitude = +d.latitude; 
      d.longitude = +d.longitude;
      d.mag = +d.mag;  // Assuming magnitude is also numeric
  });

  // Initialize chart and then show it
  leafletMap = new LeafletMap({ parentElement: '#my-map' }, combinedData);

}).catch(error => console.error(error));
