class DataTable {
    constructor(id) {
        this.id = id;
    }

    update(data, x0, x1, xVar, columns) {
        console.log(columns)
        let table = d3.select(this.id);
        data = data.filter(d => d[xVar] >= x0 && d[xVar] < x1);

        table.selectAll("tr").remove();
        table.selectAll("td").remove();
        let rows = table
            .selectAll("tr")
            .data(data)
            .join("tr");

        rows.selectAll("td")
            .data(d => columns.map(c => Math.round(d[c] * 100) / 100))
            .join("td")
            .text(d => d)
    }
}