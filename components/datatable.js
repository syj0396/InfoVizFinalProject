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
            .data(d => columns.map(c => {
                console.log(c)
                if (c === "") {
                    console.log("hey")
                    const date = new Date(d[key]);
                    return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
                } else {
                    return Math.round(d[c] * 100) / 100;
                }
            }))
            .join("td")
            .text(d => d)
    }
}