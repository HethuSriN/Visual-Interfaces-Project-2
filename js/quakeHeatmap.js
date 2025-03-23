// Load earthquake data
d3.csv('data/2024-2025.csv').then(data => {
    data.forEach(d => {
        d.date = new Date(d.time); // Assume 'time' is your date field
    });

    // Initial Chart Rendering
    renderHeatmap(data, 'month');

    // Dropdown control for binning interval
    d3.select('#binning-select').on('change', function () {
        const selectedBin = d3.select(this).property('value');
        renderHeatmap(data, selectedBin);
    });
});

// Function to render the heatmap
function renderHeatmap(data, binningInterval) {
    const svg = d3.select("#heatmap");
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 40, right: 40, bottom: 60, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Time binning logic
    const binnedData = d3.rollups(
        data,
        v => v.length, // Count earthquakes in each bin
        d => d3.timeFormat(getTimeFormat(binningInterval))(d.date)
    );

    const xScale = d3.scaleBand()
        .domain(binnedData.map(d => d[0]))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(binnedData, d => d[1])])
        .nice()
        .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(binnedData, d => d[1])]);

    // Draw Heatmap Squares
    chart.selectAll(".cell")
        .data(binnedData)
        .join("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d[0]))
        .attr("y", 0)
        .attr("width", xScale.bandwidth())
        .attr("height", height)
        .attr("fill", d => colorScale(d[1]))
        .on("mouseover", (event, d) => {
            d3.select("#HeatMap-tooltip")
                .style("display", "block")
                .html(`
                    <strong>${d[0]}</strong> <br>
                    Earthquakes: ${d[1]}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => d3.select("#HeatMap-tooltip").style("display", "none"));

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => !(i % Math.floor(xScale.domain().length / 8))))) // Show fewer ticks
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g")
        .call(d3.axisLeft(yScale));

    // Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 100}, ${margin.top})`);

    legend.append("text")
        .text("Earthquake Frequency")
        .attr("x", -20)
        .attr("y", -10);

    const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    legendGradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateYlOrRd(0));
    legendGradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateYlOrRd(1));

    legend.append("rect")
        .attr("width", 100)
        .attr("height", 10)
        .style("fill", "url(#legend-gradient)");

    legend.append("text").text("Low").attr("x", -5).attr("y", 25);
    legend.append("text").text("High").attr("x", 80).attr("y", 25);
}

// Helper function to determine time bin format
function getTimeFormat(interval) {
    switch (interval) {
        case 'day': return '%Y-%m-%d';
        case 'week': return '%Y-%U';  // Week-based binning
        case 'month': return '%Y-%m'; // Monthly binning
        default: return '%Y-%m';
    }
}
