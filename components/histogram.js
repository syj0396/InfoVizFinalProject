class Histogram {
    margin = {
        top: 10, right: 10, bottom: 40, left: 40
    }

    constructor(svg, tooltip, data, main = true, width = 250, height = 250) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data;
        this.main = main;
        this.width = width;
        this.height = height;
        this.handlers = {};
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        if (this.main) {
            this.brush = d3.brushX()
                .extent([[0, 0], [this.width, this.height]])
                .on("start brush", (event) => {
                    this.brushBars(event);
                })
        }
    }

    update(data, xVar, numBins) {
        
        const xValues = data.map(d => d[xVar]);
        const xMin = d3.min(xValues);
        const xMax = d3.max(xValues);
        const binWidth = (xMax - xMin) / numBins;

        const bins = [];
        for (let i = 0; i < numBins; i++) {
            bins.push({
                x0: xMin + i * binWidth,
                x1: xMin + (i + 1) * binWidth,
                count: 0
            });
        }

        data.forEach(d => {
            const x = d[xVar];
            for (let i = 0; i < numBins; i++) {
                const bin = bins[i];
                if (x >= bin.x0 && x < bin.x1) {
                    bin.count++;
                    break;
                }
            }
        });

        this.xScale.domain(d3.extent(data, d => d[xVar])).range([0, this.width]);
        this.yScale.domain([0, d3.max(bins, d => d.count)]).range([this.height, 0]);

        let table = d3.select("#p1-data-table");
        this.rect = this.container.selectAll("rect")
            .data(bins)
            .join("rect")
            .on("mouseover", (e, d) => {
                this.tooltip.select(".tooltip-inner")
                    .html(`<strong>${xVar}</strong><br/>${Math.round(d.x0 * 10) / 10}~${Math.round(d.x1 * 10) / 10}<br />Count: ${d.count}`);

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

                let columns = ["", "저수량(현재)", "전일방류량(본댐)","당일유입량","기온(°C)","강수량(mm)","지면온도(°C)","습도(%)"]
                
                let tdata = this.data.filter(da => da[xVar] >= d.x0 && da[xVar] < d.x1);
                table.selectAll("tr").remove();
                table.selectAll("td").remove();
                let rows = table
                    .selectAll("tr")
                    .data(tdata)
                    .join("tr");

                rows.selectAll("td")
                    .data(da => columns.map(c => {
                        if (c === "") {
                            const date = new Date(da[c]);
                            return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
                        } else
                            return Math.round(da[c] * 100) / 100
                    }))
                    .join("td")
                    .text(da => da)
                this.tooltip.style("display", "block");
            })
            .on("mouseout", (d) => {
                table.selectAll("tr").remove();
                table.selectAll("td").remove();
                this.tooltip.style("display", "none");
            });

        let fData = this.data.map(d => d[xVar]);
        let data_sorted = fData.sort(d3.ascending);
        let q1 = d3.quantile(data_sorted, .25);
        let q3 = d3.quantile(data_sorted, .75);
        let in_min = d3.max([0, q1 - 1.5 * (q3-q1)]);
        let in_max = q3 + 1.5 * (q3-q1);
        let outliers = fData.filter(d => d > in_max);
        let outlow = fData.filter(d => d < in_min); 
        let sorted = outliers.sort(d3.ascending);
        let sorted_low = outlow.sort(d3.ascending);
        let color = (d) => this.xScale(d.x1) >= outliers ? "#DC3545" : "lightgray";
        this.rect
            .transition()
            .attr("x", d => this.xScale(d.x0))
            .attr("y", d => this.yScale(d.count))
            .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0))
            .attr("height", d => this.height - this.yScale(d.count))
            //.attr("fill", "#36454f")
            //.attr("fill", d => this.main ? "lightgray" : () => color(d))
        if (sorted[0] != undefined) {
            this.rect.attr("fill", d => d.x0 >= sorted[0] || d.x1 <= sorted_low[sorted_low.length-1] ? "#DC3545" : "#36454f")
        } else {
            this.rect.attr("fill", "#36454f")
        }

        if (this.main) {
            this.container.append("g")
                .attr("class", "brushed")
                .call(this.brush);
        }

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale));
        if (!this.main) {
            let counts = bins.map(b => b.count);
            this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale));
        }
    }

    isBrushed(d, selection) {
    }

    brushBars(event) {
        let selection = event.selection;
        const brushedData = [];
        let x0, x1;
        if (selection) {
            [x0, x1] = selection.map(this.xScale.invert);
            this.rect.classed("brushed", d => {
                let isBrushed = d.x0 >= x0 && d.x1 <= x1;
                
                if (isBrushed)
                    brushedData.push(d);

                return isBrushed;
            })
        }
        brushedData.filter(d => d.count !== 0)
        if (this.handlers.brush) {
            this.handlers.brush(x0, x1, brushedData.length);
        }
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
