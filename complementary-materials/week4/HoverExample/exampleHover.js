function plotchart()
 {
  elem = document.getElementById("main-chart");
  elem.style
  d3.json("OxCGRTdata.json")
    .then(OxCGRTdata =>{
  
    let barchartData = prepareData(OxCGRTdata);

    const width = 800;
    const height = 500;
    margin = ({top: 20, right: 30, bottom: 50, left: 60});

    heightScale = d3.scaleLinear()
      .domain([0,d3.max(barchartData, d => d.cases)]).nice()
      .range([height - margin.bottom, margin.top]);
    widthScale = d3.scaleBand()
      .domain(d3.range(barchartData.length))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(widthScale).tickFormat(i => barchartData[i].code).tickSizeOuter(0))

    yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(heightScale))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("y", -5)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Total number of cases"));

    const svg = d3.select('#main-chart')
      .attr('width', width) // add attribute width to svg
      .attr('height', height); // add attribute height to svg

    svg.selectAll('.bar')
      .data(barchartData)
      .join('rect')
      .attr("class", 'bar')
      .attr('fill', 'purple')
      .attr('x', (d, i) => widthScale(i))
      .attr('y', d => heightScale(d.cases))
      .attr('width', widthScale.bandwidth())
      .attr('height', d => heightScale(0) - heightScale(d.cases))
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "yellow");})
      .on("mouseout", function(d) {
        d3.select(this).attr("fill", "purple");});

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

  })
}

function prepareData(data){

  let fiveDaysAgo = new Date();
  fiveDaysAgo.setHours(0,0,0,0)
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);


  dateCreator = function(str){
    var dt1   = parseInt(str.substring(6,8));
    var mon1  = parseInt(str.substring(4,6));
    var yr1   = parseInt(str.substring(0,4));
    var date = new Date(yr1, mon1-1, dt1);
    return date;
  }; 
  
   return data.filter(d => dateCreator(d.Date).getTime() === fiveDaysAgo.getTime() && d.RegionName === "")
              .map(d => {return {
                      cname : d.CountryName,
                      code : d.CountryCode,
                      cases : +d.ConfirmedCases,
                      deaths : +d.ConfirmedDeaths
                    };}
              )
              .filter(d => d.deaths > 10000)
              .sort((a,b) => b.cases - a.cases);     
          
}