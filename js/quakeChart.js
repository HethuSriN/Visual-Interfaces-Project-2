// Load and combine multiple datasets
Promise.all([
    d3.csv('data/2023_06-2022_10.csv'),
    d3.csv('data/2022_10-2022_01.csv'),
    d3.csv('data/2024_02-2023_06.csv'),
    d3.csv('data/2025quake.csv'),
    d3.csv('data/2024-2025.csv')
]).then(datasets => {
    const combinedData = datasets.flat();

    // Standardize data types
    combinedData.forEach(d => {
        d.date = new Date(d.time);  
        d.magnitude = +d.mag;     // Magnitude for visualization
        d.depth = +d.depth;       // Depth for visualization
        d.duration = +d.dmin || 0; // Using `dmin` as duration
    });

    // Initialize visualizations
    renderChart(combinedData, 'magnitude');
    
    d3.select("#view-select").on("change", function () {
        const selectedView = d3.select(this).property("value");
        renderChart(combinedData, selectedView);
    });
});

// Function to render different visualizations based on selection
function renderChart(data, viewType) {
    const svg = d3.select("#quake-chart");
    svg.selectAll("*").remove();  // Clear previous content

    const margin = { top: 40, right: 40, bottom: 100, left: 90 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let xScale, yScale, colorScale, xAxisLabel;

    // Define bins and scales
    let bins;
    if (viewType === 'magnitude') {
        bins = d3.bin().domain([3, 8]).thresholds([3, 4, 5, 6, 7, 8])(data.map(d => d.magnitude));
        colorScale = d3.scaleSequential(d3.interpolateBlues);
        xAxisLabel = "Magnitude Range";
    } else if (viewType === 'duration') {
        bins = d3.bin().domain([0, d3.max(data, d => d.duration)]).thresholds(10)(data.map(d => d.duration));
        colorScale = d3.scaleSequential(d3.interpolateOranges);
        xAxisLabel = "Duration (dmin value as proxy)";
    } else if (viewType === 'depth') {
        bins = d3.bin().domain([0, d3.max(data, d => d.depth)]).thresholds(12)(data.map(d => d.depth));
        colorScale = d3.scaleSequential(d3.interpolateGreens);
        xAxisLabel = "Depth (km)";
    }

    // Scale Definitions
    xScale = d3.scaleBand()
        .domain(bins.map(bin => `${bin.x0} - ${bin.x1}`))
        .range([0, width])
        .padding(0.1);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([height, 0]);

    colorScale.domain([0, d3.max(bins, d => d.length)]);

    // Bars
    chart.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(`${d.x0} - ${d.x1}`))
        .attr("y", d => yScale(d.length))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.length))
        .attr("fill", d => colorScale(d.length))
        .on("mouseover", function (event, d) {
            d3.select("#chart-tooltip")
                .style("display", "block")
                .html(`
                    <strong>Range:</strong> ${d.x0} - ${d.x1} <br>
                    <strong>Count:</strong> ${d.length}
                `);
        })
        .on("mousemove", function (event) {
            d3.select("#chart-tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => d3.select("#chart-tooltip").style("display", "none"));

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g").call(d3.axisLeft(yScale));

    // Axis labels
    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .text(xAxisLabel);

    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Frequency");
}
