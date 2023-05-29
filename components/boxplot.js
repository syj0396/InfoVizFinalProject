class Boxplot {
    margin = {
        top: 10, right: 30, bottom: 40, left: 10
    }
    
    constructor(svg, tooltip, data, width = 200, height = 200) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data;
        this.width = width;
        this.height = height;
    }
    
    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
    
        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        this.box = this.container.append("g");
    
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
    
        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }
    
    update(data, xVar) {
        let fData = data.map(d => d[xVar]);
        let data_sorted = fData.sort(d3.ascending);
        let q1 = d3.quantile(data_sorted, .25);
        let median = d3.quantile(data_sorted, .5);
        let q3 = d3.quantile(data_sorted, .75);
        let end = d3.quantile(data_sorted, .99);
        let IQR = q3 - q1;
        let in_min = d3.max([0, q1 - 1.5 * IQR]);
        let in_max = q3 + 1.5 * IQR;
        let min = d3.min(data_sorted);
        let max = d3.max(data_sorted);
        let data_inside = data_sorted.filter(d => d >= in_min && d <= in_max)
        let boxplotData = {
            q1, median, q3, min, max
        }
        
        this.yScale.domain([min, max]).range([this.height, 0]);
        this.xScale.domain([xVar]).range([0, this.margin.left + 10+this.width]).paddingInner(1).paddingOuter(.5);

        let center = this.margin.left+this.width/2;
        let w = 100;
        this.container.selectAll("line").remove();
        this.container.selectAll("rect").remove();
        this.container.selectAll("horizontal_lines").remove();
        this.container.selectAll("circle.outliers").remove();
        this.container
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", this.yScale(d3.min(data_inside)) )
            .attr("y2", this.yScale(d3.max(data_inside)) )
            .attr("stroke", "black");

        this.container
            .append("rect")
            .on("mouseover", (e, d) => {
                this.addTooltip(e, max, q3, median, q1, min);
            })
            .on("mouseout", (d) => {
                this.tooltip.style("display", "none");
            })
            .attr("x", center - w/2)
            .attr("y", this.yScale(q3) )
            .attr("height", (this.yScale(q1)-this.yScale(q3)) )
            .attr("width", w)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

        this.container
            .selectAll("horizontal_lines")
            .data([d3.min(data_inside), median, d3.max(data_inside)])
            .enter()
            .append("line")
            .attr("x1", center-w/2)
            .attr("x2", center+w/2)
            .attr("y1", d => this.yScale(d) )
            .attr("y2",  d => this.yScale(d) )
            .attr("stroke", "black")

        const outliers = data_sorted.filter(d => d < q1 - 1.5 * IQR || d > in_max);

        this.container
                .selectAll("circle.outliers")
                .data(outliers)
                .enter()
                .append("circle")
                .attr("class", "outliers")
                .attr("cx", center)
                .attr("cy", d => this.yScale(d))
                .attr("r", 3)
                .attr("fill", "#DC3545")
                .on("mouseover", (e, d) => {
                    this.addTooltip(e, max, q3, median, q1, min);
                })
                .on("mouseout", (d) => {
                    this.tooltip.style("display", "none");
                });
        
        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale))

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale));
    }

    addTooltip(e, max, q3, median, q1, min) {
        this.tooltip.select(".tooltip-inner")
        .html(`Max: ${Math.round(max*10)/10}<br/>Q3: ${Math.round(q3*10)/10}<br/>Median: ${Math.round(median*10)/10}<br/>Q1: ${Math.round(q1*10)/10}<br/>Min: ${Math.round(min*10)/10}<br/>`)
        .style("text-align", "start")
        Popper.createPopper(e.target, this.tooltip.node(), {
            placement: 'top',
            modifiers: [
                {
                    name: 'arrow',
                    options: {
                        element: this.tooltip.select(".tooltip-arrow").node(),
                    },
                },
            ],
        });
        this.tooltip.style("display", "block")
    }
}