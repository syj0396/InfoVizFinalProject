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

    initializeBrush() {
        if (this.main) {
            this.container.append("g")
                .attr("class", "brushed")
                .call(this.brush);
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

        this.xScale.domain([xMin, xMax]).range([0, this.width]);
        this.yScale.domain([0, d3.max(bins, d => d.count)]).range([this.height, 0]);

        this.rect = this.container.selectAll("rect")
            .data(bins)
            .join("rect");

        this.rect
            .transition()
            .attr("x", d => this.xScale(d.x0))
            .attr("y", d => this.yScale(d.count))
            .attr("width", d => this.xScale(d.x1) - this.xScale(d.x0))
            .attr("height", d => this.height - this.yScale(d.count))
            .attr("fill", "lightgray")

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