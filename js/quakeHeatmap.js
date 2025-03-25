// Load and combine multiple datasets
Promise.all([
    d3.csv('data/2023_06-2022_10.csv'),
    d3.csv('data/2022_10-2022_01.csv'),
    d3.csv('data/2024_02-2023_06.csv'),
    d3.csv('data/2025quake.csv'),
    d3.csv('data/2024-2025.csv')
]).then(datasets => {
    // Combine all datasets into one array
    const combinedData = datasets.flat();

    // Standardize date format
    combinedData.forEach(d => {
        d.date = new Date(d.time); // Ensure 'time' is the date field in each dataset
    });

    // Initial chart rendering
    renderHeatmap(combinedData, 'month');

    // Dropdown control for binning interval
    d3.select('#binning-select').on('change', function () {
        const selectedBin = d3.select(this).property('value');
        renderHeatmap(combinedData, selectedBin);
    });
});

// Function to render the heatmap
function renderHeatmap(data, binningInterval) {
    const svg = d3.select("#heatmap");
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 100, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Time binning logic
    const binnedData = d3.rollups(
        data,
        v => v.length,
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

    // Draw Heatmap Cells
    chart.selectAll(".cell")
        .data(binnedData)
        .join("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d[1]))
        .attr("fill", d => colorScale(d[1]))
        .on("mouseover", function (event, d) {
            d3.select("#HeatMap-tooltip")
                .style("display", "block")
                .html(`
                    <strong>${d[0]}</strong><br>
                    Earthquakes: ${d[1]}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px"); // Correct position logic
        })
        .on("mousemove", function(event) {
            d3.select("#HeatMap-tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px"); // Dynamic position update
        })
        .on("mouseout", () => d3.select("#HeatMap-tooltip").style("display", "none"));

    // Brushing for Timeline Interaction
const brush = d3.brushX()
.extent([[0, 0], [width, height]])
.on("brush end", function (event) {
    if (!event.selection) return;

    const [x0, x1] = event.selection;

    // Identify selected range in the `xScale` domain
    const selectedDates = xScale.domain().filter(d => {
        const posX = xScale(d) + xScale.bandwidth() / 2; // Midpoint of each band
        return posX >= x0 && posX <= x1;
    });

    // Filter data by selected dates
    const filteredData = data.filter(d => 
        selectedDates.includes(d3.timeFormat(getTimeFormat(binningInterval))(d.date))
    );

    renderFilteredMap(filteredData);   // Filter Map
    renderFilteredMagnitudeChart(filteredData); // Filter Magnitude Chart
});

chart.append("g")
.attr("class", "brush")
.call(brush);

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => !(i % 5))))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g").call(d3.axisLeft(yScale));



    // --- LEGEND BELOW CHART ---
    const legendWidth = 300;
    const legendHeight = 15;

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(binnedData, d => d[1].count)])
        .range([0, legendWidth]);

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 100})`);

    const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    legendGradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateYlOrRd(0));
    legendGradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateYlOrRd(1));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    legend.append("text").text("Low").attr("x", -20).attr("y", legendHeight / 2 + 5).style("font-size", "12px");
    legend.append("text").text("High").attr("x", legendWidth + 5).attr("y", legendHeight / 2 + 5).style("font-size", "12px");

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5).tickFormat(d3.format(".0f")));
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

// Function to render filtered map data
function renderFilteredMap(filteredData) {
    leafletMap.updateMap(filteredData);
}

// Function to render filtered magnitude chart
function renderFilteredMagnitudeChart(filteredData) {
    renderMagnitudeChart(filteredData);
}

