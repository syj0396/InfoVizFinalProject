class Linechart {
    margin = {
      top: 50,
      right: 20,
      bottom: 40,
      left: 30
    };
  
    constructor(svg, width = 360, height = 200) {
      this.svg = svg;
      this.width = width;
      this.height = height;
    }
  
    initialize() {
      this.svg = d3.select(this.svg);
      this.container = this.svg.append("g");
      this.xAxis = this.svg.append("g");
      this.yAxis = this.svg.append("g");
  
      this.xScale = d3.scaleTime();
      this.yScale = d3.scaleLinear();
  
      this.svg
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
  
      this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }
  
    update(data, xVar, yVar, startDate, endDate) {
        this.data = data;
        this.data.forEach((d, i) => {
            d[xVar] = new Date(d[xVar]);
            d[yVar] = +d[yVar];
        });

        const filteredData = this.data.filter(d => d[xVar] >= startDate && d[xVar] <= endDate);
        this.xScale.domain(d3.extent(filteredData, d => d[xVar])).range([0, this.width]);
        this.yScale.domain([0, d3.max(filteredData, d => d[yVar])]).range([this.height, 0]);

        const line = d3.line()
            .x(d => this.xScale(d[xVar]))
            .y(d => this.yScale(d[yVar]));
    
        this.container.selectAll("path")
        .data([filteredData])
        .join("path")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3);


        this.svg.selectAll(".chart-title").remove();
        let chartTitle = filteredData.length < 10 ? "Weekly" : "Monthly";
        chartTitle +=  "Trend" + `- ${yVar}`;
        this.svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", (this.margin.left+this.width) / 2)
        .attr("y", this.margin.top - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(chartTitle);

        const formatTime = d3.timeFormat("%b %d");
        this.xAxis
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
        .call(d3.axisBottom(this.xScale).ticks(7).tickFormat(formatTime));

        this.yAxis
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .call(d3.axisLeft(this.yScale));
      
    }
    
}