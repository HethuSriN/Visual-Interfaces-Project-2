var selectedBinGlobal = 'month';
// Load and combine multiple datasets
Promise.all([
    d3.csv('data/2024-2025.csv'),
    d3.csv('data/2025quake.csv'),
    d3.csv('data/2024_02-2023_06.csv'),
    d3.csv('data/2023_06-2022_10.csv'),
    d3.csv('data/2022_10-2022_01.csv'),
    d3.csv('data/2021_12-2021_4.csv'),
    d3.csv('data/2021_04-2020_08.csv'),
    d3.csv('data/2020_08-2020_01.csv'),
    d3.csv('data/2019_12-2019_04.csv'),
    d3.csv('data/2019_04-2018_08.csv'),
    d3.csv('data/2018_08-2018_04.csv'),
    d3.csv('data/2018_04-2018_01.csv'),
    d3.csv('data/2017.csv'),
    d3.csv('data/2016.csv'),
    d3.csv('data/2015.csv'),
    d3.csv('data/2014_12-2014_04.csv'),
    d3.csv('data/2014_04-2014_01.csv'),
    d3.csv('data/2013.csv'),
    d3.csv('data/2012.csv'),
    d3.csv('data/2011_01-2011_10.csv'),
    d3.csv('data/2010_12-2010_04.csv'),
    d3.csv('data/2010_03-2010-01.csv'),
    d3.csv('data/2009.csv'),
    d3.csv('data/2008_12-2008_06.csv'),
    d3.csv('data/2008_05-2008_01.csv'),
    d3.csv('data/2007_12-2007_06.csv'),
    d3.csv('data/2007_05-2007_01.csv'),
    d3.csv('data/2006_12-2006_06.csv'),
    d3.csv('data/2006_05-2006_01.csv'),
    d3.csv('data/2005_12-2005_06.csv'),
    d3.csv('data/2005_05-2005_01.csv'),
    d3.csv('data/2004_12-2004_06.csv'),
    d3.csv('data/2004_05-2004_01.csv'),
  ]).then(datasets => {
    // Combine all datasets into one array
    const combinedData = datasets.flat();

    // Standardize date format
    combinedData.forEach(d => {
        d.date = new Date(d.time); // Ensure 'time' is the date field in each dataset
        d.duration = +d.dmin || 0; // Using `dmin` as duration
    });

    // Initial chart rendering
    renderHeatmap(combinedData, 'month');

    // Dropdown control for binning interval
    d3.select('#binning-select').on('change', function () {
        const selectedBin = d3.select(this).property('value');
        selectedBinGlobal = selectedBin;
        renderHeatmap(combinedData, selectedBin);
    });
});

// Function to render the heatmap
function renderHeatmap(data, binningInterval, leafletMap) {
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

            renderFilteredMap(filteredData, leafletMap);   // Filter World Map
            renderFilteredChart(filteredData, selectedViewGlobal); // Filter Chart
            updateTotalCount(filteredData);
            updateAverageMagnitude(filteredData); 
            updateTopLocation(filteredData, d3.select("#impact-metric").property("value"));

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

    // X Axis Label
    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(`Time (${binningInterval.charAt(0).toUpperCase() + binningInterval.slice(1)})`);

    // Y Axis Label
    chart.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-weight", "bold")
        .text("Number of Earthquakes");


    // --- LEGEND BELOW CHART ---
    const legendWidth = 300;
    const legendHeight = 65;

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

function updateTotalCount(filteredData) {
    const totalCount = filteredData.length; // Get the filtered earthquake count
    d3.select("#total-earthquakes").text(totalCount); // Update the displayed total count
}

function updateAverageMagnitude(filteredData) {
    console.log(filteredData); // Debug log
    if (filteredData.length === 0) {
        d3.select("#avg-magnitude-value").text("N/A");
        return;
    }

    const avgMagnitude = d3.mean(filteredData, d => +d.mag); // Ensure numeric
    d3.select("#avg-magnitude-value").text(avgMagnitude.toFixed(2)); // Format to 2 decimal places
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

// Function to render filtered map data (World Map)
function renderFilteredMap(filteredData) {
    leafletMap.updateMap(filteredData);
}

// Function to render filtered chart
function renderFilteredChart(filteredData, selectedViewGlobal) {
    renderChart(filteredData, selectedViewGlobal);  // Update the chart with filtered data
  }

