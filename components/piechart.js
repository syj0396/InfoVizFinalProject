class Piechart {
    margin = {
        top: 10, right: 100, bottom: 40, left: 40
    }

    constructor(svg, tooltip, data, width = 250, height = 250) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;

        this.handlers = {};
    }
    
    initialize() {
        this.svg = d3.select(this.svg);
        this.color = d3.scaleOrdinal().range(d3.schemeCategory10)

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        
        //this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update(data) {

        let pie = d3.pie()
            .value(function(d) {
                return d.value; 
            })
        console.log(pie)
            //.sort(function(a, b) {console.log(a) ; return d3.ascending(a.key, b.key);})
        //let data_ready = pie(d3.entries(data))
/*
        svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
        )
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)*/
    }
}