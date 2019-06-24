
import * as d3 from "d3";

const w = 1200;
const h = 800;
const url = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
const margin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const tooltip = d3.select('body')
        .append('div')
        .attr("id", "tooltip")
        .classed('tooltip', true);

const svg = d3.select('.container').append('svg')
        .attr('id', 'chart')
        .attr('width', w)
        .attr('height', h);

const chart = svg.append('g')
        .classed('display', true)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

const palette = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabebe', '#469990', '#e6beff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075']

const colors  = color => d3.interpolateRgb(color, "#ffffff")(0.2)
const color = d3.scaleOrdinal(palette.map(colors))

const treemap = d3.treemap()
    .size([width, height])
    .paddingInner(5);

init.call(chart)

async function init() {
  try {
    const data  = await d3.json(url);
    
    console.log(data)
    
    const root = d3.hierarchy(data).eachBefore(d => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
      })
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

      treemap(root);
    
      const cell = this.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
              .attr("class", "group")
              .attr("transform", d => `translate(${d.x0}, ${d.y0} )`);
                    
       cell.append("rect")
            .attr("id", d => d.data.id)
            .attr("class", "tile")
            .attr("height", 0)
            .transition()
            .duration(200)
            .delay((d, i) => i * 10)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("data-name", d =>d.data.name)
            .attr("data-category", d =>d.data.category)
            .attr("data-value", d => d.data.value)
            .attr("fill", d => color(d.data.category));
    
       cell.selectAll("rect")
            .on('mouseover', showTooltip)
            .on('touchstart', showTooltip)
            .on('mouseout', hideTooltip)
            .on('touchend', hideTooltip)
    
       cell.append("text")
            .attr('class', 'tile-text')
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter().append("tspan")
            .attr("x", 4)
            .attr("y", (d, i) => 13 + i * 12)
            .text(d => d)
            

      const categories = Array.from(new Set(root.leaves().map(elm => elm.data.category)));
    
      const legend = d3.select("#legend").attr('width', w)

      const legendElm = legend.append("g")
            .classed("legend", true)
            .attr("id", "legend")
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .selectAll("g")
            .data(categories)
            .enter().append("g")
            .attr("transform", (d, i) => 'translate(' + i*(w/18)  + ',' + 0  + ')')
                  
      legendElm.append("rect")                              
             .attr('width', 15)                          
             .attr('height', 15)     
             .attr('class','legend-item')                 
             .attr('fill', d => color(d))
     
      legendElm.append("text")                              
             .attr('x', 15 + 3)                          
             .attr('y', 15 + -2)                       
             .text(d => d);  


    function showTooltip(d,i) {
      tooltip
        .style('opacity', 1)
        .style('left', d3.event.x -(tooltip.node().offsetWidth / 2) + 'px')
        .style('top', d3.event.y + -90 + 'px')
        .attr("data-value", d.data.value)
        .html(
        'Name: ' + d.data.name + 
        '<br>Category: ' + d.data.category + 
        '<br>Value: ' + d.data.value
      )
    }

    function hideTooltip() {
      tooltip
        .style('opacity', 0)
    }
    
} catch(e) {
    console.log(e)
  }
}