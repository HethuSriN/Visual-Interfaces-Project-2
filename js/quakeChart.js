var selectedViewGlobal = 'magnitude';

document.addEventListener('DOMContentLoaded', () => {
    d3.select("#view-select").on("change", function () {
        selectedViewGlobal = d3.select(this).property("value");
        if (window.currentFilteredData) {
            renderChart(window.currentFilteredData, selectedViewGlobal);
        }
    });
});

function renderChart(data, viewType) {
    const svg = d3.select("#quake-chart");
    svg.selectAll("*").remove();

    if (!data || data.length === 0) {
        svg.append("text")
            .attr("x", 400)
            .attr("y", 200)
            .attr("text-anchor", "middle")
            .text("No data to display");
        return;
    }

    const margin = { top: 40, right: 40, bottom: 100, left: 90 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let values = [];
    let xAxisLabel = "";

    if (viewType === 'magnitude') {
        values = data.map(d => +d.mag).filter(d => !isNaN(d));
        xAxisLabel = "Magnitude Range";
    } else if (viewType === 'duration') {
        values = data.map(d => +d.dmin || 0).filter(d => !isNaN(d));
        xAxisLabel = "Duration (dmin)";
    } else if (viewType === 'depth') {
        values = data.map(d => +d.depth).filter(d => !isNaN(d));
        xAxisLabel = "Depth (km)";
    }
    
    // Update the total count
    updateTotalCount(data);

    if (values.length === 0) {
        chart.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("No valid data for this view");
        return;
    }

    var bins = d3.bin().thresholds(8)(values);

    const xScale = d3.scaleBand()
        .domain(bins.map(bin => `${(bin.x0 || 0).toFixed(1)} - ${(bin.x1 || 0).toFixed(1)}`))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
        .domain([0, d3.max(bins, d => d.length)]);

    chart.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(`${(d.x0 || 0).toFixed(1)} - ${(d.x1 || 0).toFixed(1)}`))
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
        .on("mouseout", () => d3.select("#chart-tooltip").style("display", "none"))
        .on("click", function (event, d) {
            const min = d.x0;
            const max = d.x1;

            const filtered = (window.currentFilteredData || []).filter(item => {
                if (viewType === 'magnitude') return +item.mag >= min && +item.mag <= max;
                if (viewType === 'duration') return +item.dmin >= min && +item.dmin <= max;
                if (viewType === 'depth') return +item.depth >= min && +item.depth <= max;
                return false;
            });

            window.currentFilteredData = filtered;
            renderFilteredMap(filtered);
            renderFilteredHeatmap(filtered, selectedBinGlobal);
            renderChart(filtered, selectedViewGlobal);
        });

    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g").call(d3.axisLeft(yScale));

    chart.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .text(xAxisLabel);

    chart.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Frequency");
}

