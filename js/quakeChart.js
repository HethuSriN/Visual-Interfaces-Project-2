// Load and visualize earthquake data
d3.csv('data/2024-2025.csv').then(data => {
    data.forEach(d => {
        d.date = new Date(d.time); // Assume 'time' is your date field
    });

    // Initial Chart Rendering
    renderChart(data, 'month');

    // Dropdown control for binning interval
    d3.select('#binning-select').on('change', function () {
        const selectedBin = d3.select(this).property('value');
        renderChart(data, selectedBin);
    });
});

// Function to render the chart
function renderChart(data, binningInterval) {
    const svg = d3.select("#line-chart");
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
        v => v.length, // Count number of earthquakes in each bin
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

    // Draw Bars
    chart.selectAll(".bar")
        .data(binnedData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => height - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("fill", "#0078A8")
        .on("mouseover", (event, d) => {
            d3.select("#chart-tooltip")
                .style("display", "block")
                .html(`
                    <strong>${d[0]}</strong> <br>
                    Earthquakes: ${d[1]}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => d3.select("#chart-tooltip").style("display", "none"));

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => !(i % Math.floor(xScale.domain().length / 8))))) // Show fewer ticks
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g")
        .call(d3.axisLeft(yScale));

    // Axis Labels
    chart.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Time Period");

    chart.append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Earthquakes");
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
