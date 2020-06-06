/**
 * This file is responsible for generating all the visualisations(graphs) used in this application.
 * @module Visualisations
 * */
/* eslint-env browser, es6 */
/* global d3 */
const DISTRIBUTION_LOAD_LIMIT = 7;

/**
 * Function to prepare graph data. It counts the number of projects staff is either marking
 * or supervising. A first supervisor will supervise and mark work therefore both counters must be incremented.
 * @param projectAllocationData An array of project allocation data.
 * @param supervisorData An array of staff members.
 * @return Array of data containing counts and supervisor full name.
 * */
const prepareGraphData = function (projectAllocationData, supervisorData) {
    let outputArray = [];
    /* Iterate through data array and add data to table*/
    for (let index = 0; index < supervisorData.length; index++) {
        const element = supervisorData[index];
        let totalMarkerCount = 0;
        let totalSupervisorCount = 0;
        const fullName = element.givenNames + " " + element.familyName;
        Object.entries(projectAllocationData).forEach(projectDataTest => {
            /*Check if first or second supervisor*/
            const projectData = projectDataTest[1];
            /*Calculate supervisor counts and marker counts*/
            if (projectData.supervisor === fullName) {
                totalMarkerCount++;
                totalSupervisorCount++;
            } else if (projectData.secondSupervisor === fullName) {
                totalSupervisorCount++;
            } else if (projectData.secondMarker === fullName) {
                totalMarkerCount++;
            }
        });
        outputArray.push({
            supervisorName: fullName,
            supervisorCount: totalSupervisorCount,
            markerCount: totalMarkerCount
        });
    }


    /*Sort list by total count*/
    outputArray.sort((a, b) => {
        /*Sorting array*/
        let aTotalCount = a.supervisorCount + a.markerCount;
        let bTotalCount = b.supervisorCount + b.markerCount;

        //sort string ascending
        if (aTotalCount > bTotalCount) {
            return -1;
        } else if (aTotalCount < bTotalCount) {
            return 1;
        } else {
            //default return value (no sorting)
            return 0;
        }
    });

    return outputArray;
};


/**
 * Function to create graph. It generates a bar chart
 * Sourced from: //https://gist.github.com/mbostock/1134768.
 *  https://www.d3-graph-gallery.com/graph/histogram_basic.html
 *   https://www.d3-graph-gallery.com/graph/custom_legend.html
 *  @param projectAllocationData An array of project allocation data.
 *  @param supervisorData An array of supervisor data.
 * */
const generateGraph = function (projectAllocationData, supervisorData) {
    /* Always remove the existing svg*/
    d3.select("svg").remove();

    /* Prepare data parameters.*/
    const equalDistribution = supervisorData.length / supervisorData.length;
    const dataArray = prepareGraphData(projectAllocationData, supervisorData);
    const countTypes = ["supervisorCount", "markerCount"];
    const margin = {top: 20, right: 200, bottom: 200, left: 50},
        width = (0.85) * document.body.clientWidth - margin.left - margin.right,
        height = (0.75) * document.body.clientHeight - margin.top - margin.bottom;

    /*Create stacks. */
    let barStacks = d3.layout.stack()(countTypes.map(function (countType) {
        return dataArray.map(function (supervisor) {
            return {x: supervisor.supervisorName, y: supervisor[countType]};
        });
    }));
    let colours = ['#e74c3c', '#3498db'];
    /*Create scales */
    const color = d3.scale.ordinal()
        .domain(countTypes)
        .range(colours);

    const xScale = d3.scale.ordinal()
        .domain(barStacks[0].map(function (d) {
            return d.x;
        }))
        .rangeRoundBands([0, width], 0.10);

    const currentDistributionMax = d3.max(barStacks[barStacks.length - 1], function (d) {
        return d.y0 + d.y;
    });

    const yScale = d3.scale.linear()
        .rangeRound([height, 0])
        .domain([0, 1 + Math.max(currentDistributionMax, DISTRIBUTION_LOAD_LIMIT, equalDistribution)]);

    /*Create axis graphics*/
    const xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    const yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format("d"));

    /*Create svg and layers.*/
    let svg = d3.select("#dataPanel").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let layer = svg.selectAll(".layer")
        .data(barStacks)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) {
            return color(i);
        });

    /*Draw rectangles*/
    layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("class", function (d) {
            return d.x;
        })
        .attr("x", function (d) {
            return xScale(d.x);
        })
        .attr("y", function (d) {
            return yScale(d.y + d.y0);
        })
        .attr("height", function (d) {
            return yScale(d.y0) - yScale(d.y + d.y0);
        })
        .attr("width", xScale.rangeBand())
        .on("mousemove", function (d) {
            /*Remove existing tooltip and add new one.*/
            d3.selectAll(".hoverToolTip").remove();
            d3.select("svg")
                .append("text")
                .attr("class", "hoverToolTip")
                .attr("data-html", "true")
                .text("Name: " + d.x)
                .attr("x", d3.mouse(this)[0])
                .attr("y", d3.mouse(this)[1]);
        }).on("mouseleave", function () {
        d3.selectAll(".hoverToolTip").remove();
    });

    countTypes.push("Equal Distribution Line");
    countTypes.push("Max Distribution Line");
    colours.push("green");
    colours.push("yellow");
    // Adding and manipulating labels
    svg.selectAll("textLabels")
        .data(countTypes)
        .enter()
        .append("text")
        .attr("x", width + margin.left)
        .attr("y", function (d, i) {
            return margin.top + i * 20;
        })
        .style("fill", function (d, i) {
            return colours[i];
        })
        .text(function (d) {
            return d;
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-weight", "bold");

    /* Equal Distribution*/
    svg.append("line")
        .attr("class", "averageLine")
        .style("stroke", "green")
        .attr("x1", 0)
        .attr("y1", yScale(equalDistribution * 2))
        .attr("x2", width)
        .attr("y2", yScale(equalDistribution * 2));

    /*max Distribution*/
    svg.append("line")
        .attr("class", "maxLine")
        .style("stroke", "yellow")
        .attr("x1", 0)
        .attr("y1", yScale(DISTRIBUTION_LOAD_LIMIT))
        .attr("x2", width)
        .attr("y2", yScale(DISTRIBUTION_LOAD_LIMIT));

    // Adding and manipulating labels
    svg.selectAll("colourLabels")
        .data(countTypes)
        .enter()
        .append("circle")
        .attr("cx", width + margin.left - 10)
        .attr("cy", function (d, i) {
            return margin.top - 5 + i * 20;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 5)
        .style("fill", function (d, i) {
            return colours[i];
        });


    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-90)");

    // text label for the x axis
    svg.append("text")
        .attr("class", "xlabel")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + margin.bottom * 3 / 4) + ")")
        .style("text-anchor", "middle")
        .text("Staff");


    // text label for the x axis
    svg.append("text")
        .attr("class", "ylabel")
        .attr("x", -height / 2)
        .attr("y", -margin.left * 2 / 3)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Count");

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);
};


export {generateGraph};