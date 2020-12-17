
function plotchart()
 {
  d3.json("./data/countryIndices@2.json")
    .then(data =>{
    
    const {selectedData,keys} = prepareData(data);

    const keylv = "t_pollution";

    drawChart();

    function prepareData(data){
      const selectedData = data.map(d => ({
        name:d.countryName,
        population: d.Population.lastValue,
        lifeExpectancy:d.LifeExpectancy.lastValue,
        nurses:d.Nurses.lastValue,
        physicians:d.Physicians.lastValue,
        pollution:d.PM25AirPollution.lastValue,
        waterFacilities: d.SafelyDrinkingWaterServicesPerc.lastValue,
        childMortality:d.MortalityRateUnder5.lastValue,
        t_population: d.Population.tempData,
        t_lifeExpectancy:d.LifeExpectancy.tempData,
        t_nurses:d.Nurses.tempData,
        t_physicians:d.Physicians.tempData,
        t_pollution:d.PM25AirPollution.tempData,
        t_waterFacilities: d.SafelyDrinkingWaterServicesPerc.tempData,
        t_childMortality:d.MortalityRateUnder5.tempData,
      })).sort((a,b) => b.population - a.population);

      //We obtain the keys only for temporal data
      const keys = Object.keys(selectedData[0]).filter(d => d.includes('t_')); 

      return {selectedData,keys};
    }

    function drawChart(){
      //Config sizes
      const width = 900;
      const heightsc = 400;
      const heightbc = 300;
      const padding = 30;
      const height = heightsc + heightbc + padding;
      const marginsc = ({top: 20, right: 250, bottom: 20, left: 250});
      const marginbc = ({top: 20, right: 40, bottom: 20, left: 40});

      //Select SVG from HTML
      const svg = d3.select("#main-chart")
        .attr("width",width)
        .attr("height",height);

      //Tooltip
      const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'barchart-tooltip')
        .style('position', 'absolute')
        .style('z-index', '1')
        .style('visibility', 'hidden')
        .style('padding', '10px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '4px')
        .style('color', '#fff');

      //scatter plot 
      svg.call(drawScatterplot);

      var heightScale, widthScale;
      var barchart;

      //bar chart 
      svg.call(drawBarchart);

      function drawScatterplot(svg){
        //Add the scatter plot element on the SVG
        const scatter = svg.append("g");
      
        //Define scales
        const mortalityScale = d3.scaleLinear()
                    .domain([0,d3.max(selectedData, d => d.childMortality !== 'NA' ? d.childMortality : NaN)]).nice()
                    .range([marginsc.left, width - marginsc.right]);
        const lifeExpectScale = d3.scaleLinear()
                    .domain(d3.extent(selectedData, d => d.lifeExpectancy!== 'NA' ? d.lifeExpectancy : NaN)).nice()
                    .range([heightsc - marginsc.bottom, marginsc.top]);
        const populationScale = d3.scaleSqrt()
                    .domain([0,d3.max(selectedData, d => d.population!== 'NA' ? d.population : NaN)])
                    .range([0, 40]);    
                    
            //axis
        const xAxisSc = g => g
            .attr("transform", `translate(0,${heightsc - marginsc.bottom})`)
            .call(d3.axisBottom(mortalityScale)
                  //.tickFormat(i => selectedData[i].childMortality)
                  .tickSizeOuter(0))

        scatter.append("g")
            .call(xAxisSc);
      
        const yAxisSc = g => g
            .attr("transform", `translate(${marginsc.left},0)`)
            .call(d3.axisLeft(lifeExpectScale))
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", -3)
                .attr("y", -10)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .text("Life Expectancy"))

        scatter.append("g")
            .call(yAxisSc);
        
        //Data points
        scatter.selectAll('circle')
          .data(selectedData)
          .join('circle')
          .attr('cx', d => mortalityScale(d.childMortality))
          .attr('cy', d => lifeExpectScale(d.lifeExpectancy))
          .attr('r', d => populationScale(d.population))
          .attr('fill', 'steelblue')
          .attr('fill-opacity', 0.4)
          .attr('stroke', d => d3.schemeCategory10[d.cluster])
          .on("mouseover", function(e,d) {
            tooltip
              .html(`<b>Country</b>: ${d.name}`);
            let tooltipWidth = tooltip.node().offsetWidth;
            let tooltipHeight = tooltip.node().offsetHeight;
            tooltip
              .style("left", e.pageX - tooltipWidth/2 +'px')
              .style("top", e.pageY-tooltipHeight - 10+'px')
              .style('visibility', 'visible');
            })
          .on("mousemove", function(e,d) {
            let tooltipWidth = tooltip.node().offsetWidth;
            let tooltipHeight = tooltip.node().offsetHeight;
            tooltip
              .style("left", e.pageX - tooltipWidth/2 +'px')
              .style("top", e.pageY-tooltipHeight - 10+'px')
              .style('visibility', 'visible');
          })
          .on("mouseout", function(e,d) {
            tooltip.style('visibility', 'hidden');
          })
          .on('click', function(e,d,i) {
            updateBarchart(d); //This is the big point!!
          })
        }

      //draw (and initialize) barchart
      function drawBarchart(svg){
        //Add the scatter plot element on the SVG
        barchart = svg.append("g")
          .attr('transform',`translate(0,${heightsc+padding})`);
        
        //Define the scales
        heightScale = d3.scaleLinear()
          .domain([0,d3.max(selectedData, d => d3.max(d[keylv], d=> d !== 'NA'?d: NaN))]).nice()
          .range([heightbc - marginbc.bottom, marginbc.top]);
        
        widthScale = d3.scaleBand()
          .domain(d3.range(2001, 2021))
          .range([marginbc.left, width - marginbc.right])
          .padding(0.1);

        //Define the axis
        const xAxisBc = g => g
          .attr("transform", `translate(0,${heightbc - marginbc.bottom})`)
          .call(d3.axisBottom(widthScale)
          .tickSizeOuter(0));

        barchart.append("g")
          .call(xAxisBc);
      
        const yAxisBc = g => g
          .attr("id","yAxisBc")
          .attr("transform", `translate(${marginbc.left},0)`)
          .call(d3.axisLeft(heightScale));

        barchart.append("g")
          .call(yAxisBc);
          
        //This element is empty at the beginning, but it will be updated latter on the function
        barchart.append("text")
              .attr("id","title")
              .attr("x", width - marginbc.right)             
              .attr("y", marginbc.top + 25)
              .attr("text-anchor", "end")  
              .attr("font-size", "25px") 
      
        barchart.append("text")
              .attr("id","keyName")
              .attr("x", marginbc.left + 5)             
              .attr("y", marginbc.top)
              .attr("text-anchor", "start")  
              .attr("font-weight", "bold")
              .attr("font-size", "14px") 
              .text(keylv);
      }

      
          //This function updater the bar chart according to which dot has been clicked
      function updateBarchart(d){
        let max = d3.max(d[keylv], d=> d !== 'NA'?d: NaN) || 0.01;
        heightScale.domain([0,max]).nice();
        
        //Selection is important when updating
        barchart.select('#yAxisBc')
          .transition()
          .call(d3.axisLeft(heightScale));
        
        //We set the text of the title
        barchart.select('#title')
            .text(d.name);
    
        //With the join, the rect will be updated
        //a transition has been added to have a smooth update
        barchart.selectAll('rect')
          .data(d[keylv])
          .join('rect')
          .transition()
        //.delay((d,i)=>100*i)
          .attr('x', (d, i) => widthScale(2001+i))
          .attr('y', d => d!=='NA'? heightScale(d):heightScale(0))
          .attr('width', widthScale.bandwidth())
          .attr('height', d => d!=='NA'? heightScale(0) - heightScale(d):0)
          .attr('fill-opacity', 0.7)
          .attr('fill', 'purple');
      }

    }

  })
}

