
function plotchart()
 {
  d3.json("./data/.json")
    .then(data =>{
    
    const selectedData = prepareData(data);

    drawChart();

    function prepareData(data){
      let preparedData;
      //...
      return preparedData;
    }

    function drawChart(){
      //...
      const svg = d3.select("#main-chart")
        .attr("width",width)
        .attr("height",height);
      //...
    }

  })
}

