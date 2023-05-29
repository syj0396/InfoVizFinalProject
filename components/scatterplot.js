class Scatterplot {
    margin = {
        top: 40, right: 100, bottom: 30, left: 100
    }

    constructor(svg, tooltip, data, main = true, width = 450, height = 500) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;
        this.main = main;
        this.handlers = {};
    }
    
    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.zScale = d3.scaleOrdinal().range(d3.schemeTableau10)

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);


        // TODO: create a brush object, set [[0, 0], [this.width, this.height]] as the extent, and bind this.brushCircles as an event listenr
        if (this.main) {
            this.brush = d3.brush()
                .extent([[0, 0], [this.width, this.height]])
                .on("start brush", (event) => {
                    this.brushCircles(event);
                })
        }
    }

    update(data, xVar, yVar, zVar, year) {
        this.xVar = xVar;
        this.yVar = yVar;
        this.zVar = zVar;
        this.data = data.filter(d => {
            let date = new Date(d[""])
            return date.getFullYear() == year;
        }
        )
        
        this.xScale.domain(d3.extent(this.data, d => d[xVar])).range([0, this.width]);
        this.yScale.domain(d3.extent(this.data, d => d[yVar])).range([this.height, 0]);
        let cat = zVar === "홍수기" ? ["홍수기","비홍수기"] : ["봄", "여름","가을","겨울"]
        this.zScale.domain(cat)
        
        //target이 달라지면 이전거 삭제?
        this.circles = this.container.selectAll("circle")
            .data(this.data)
            .join("circle")
            /*.on("click", (e,d) => {
                console.log(d)
                d3.select(e.target)
                    .attr("r", 5)
                    .attr("stroke", "black");
            })*/
            .on("mouseover", (e, d) => {
                this.tooltip.style("display", "none");
                d3.select(e.target)
                    .attr("r", 4)
                    .attr("stroke", null);

                const date = new Date(d[""]);
                /*d3.select(e.target)
                    .attr("r", 5)
                    .attr("stroke", "black");*/
                this.tooltip.select(".tooltip-inner")
                    .html(`<div>${date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}<div/>${this.xVar}: ${Math.round(d[this.xVar]*10)/10}<br />${this.yVar}: ${Math.round(d[this.yVar])/10}`);

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

                this.tooltip.style("display", "block");
            })
            /*.on("mouseout", (e, d) => {
                this.tooltip.style("display", "none");
                d3.select(e.target)
                    .attr("r", 3)
                    .attr("stroke", null);
            });*/

        this.circles
            .transition()
            .attr("cx", d => this.xScale(d[xVar]))
            .attr("cy", d => this.yScale(d[yVar]))
            .attr("fill", d => this.zScale(d[zVar]))
            .attr("r", this.main ? 4 : 4)


        //if (this.main) this.container.call(this.brush);

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale));

        this.legend
            .style("display", "inline")
            .style("font-size", ".8em")
            .attr("transform", `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`)
            .call(d3.legendColor().scale(this.zScale))
    }

    isBrushed(d, selection) {
        let [[x0, y0], [x1, y1]] = selection; // destructuring assignment

        // TODO: return true if d's coordinate is inside the selection
        let x = this.xScale(d[this.xVar]);
        let y = this.yScale(d[this.yVar]);

        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    // this method will be called each time the brush is updated.
    brushCircles(event) {
        let selection = event.selection;

        this.circles.classed("brushed", d => this.isBrushed(d, selection));

        if (this.handlers.brush)
            this.handlers.brush(this.data.filter(d => this.isBrushed(d, selection)));
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}