
function plotchart()
{
  d3.json("./data/parliamentDataset.json")
    .then(parliamentDataset =>{
    
    const  heightParliament = 200;
    const width = 800;
    
    const arcParliament = d3.arc()
      .innerRadius(heightParliament/2)
      .outerRadius(heightParliament);

    const pieParliament = d3.pie()
      .sort(null)
      .value(d => d.members)
      .startAngle(-Math.PI / 2)
      .endAngle( Math.PI / 2);
    
    const arcs = pieParliament(parliamentDataset);

    const svg = d3.select("#main-chart")
        .attr("width",width)
        .attr("height",heightParliament);

    const pie = svg.append("g")
        .attr("transform", `translate(${heightParliament},${heightParliament})`);
    
    pie.selectAll("path")
      .data(arcs)
      .join("path")
        .attr("stroke", "white")
        .attr("fill", d => d.data.color)
        .attr("d", arcParliament)
      .append("title")
        .text(d => `${d.data.name}: ${d.data.members}`);

    pie.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
        .attr("transform", d => `translate(${arcParliament.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", d => "6px")
            .attr("font-weight", "bold")
            .text(d => `${d.data.name} (${d.data.members})`));

  })
}

