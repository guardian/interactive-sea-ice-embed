
import * as d3Select from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import * as d3Array from 'd3-array'
import * as d3Fetch from "d3-fetch"
import * as d3Nest from "d3-collection"
import * as d3Transition from "d3-transition"

const d3 = Object.assign({}, d3Select, d3Nest, d3Shape, d3Scale, d3Array, d3Fetch, d3Transition)

window.frameElement.style.width = "100%";

d3.json("https://interactive.guim.co.uk/docsdata-test/1g2VBp3nYq7LslndadMzz5JRNmQZYGvaV1-TzmD2mwX0.json").then(data => {


	const width = d3.select(".interactive-wrapper").node().clientWidth;
	const height = (width <= 450) ? width : width*(3/5);

	const bottomMargin = 24;
	const leftMargin = 30;
	const rightMargin = 50;

	var x = d3.scaleLinear()
		.domain([0, 365])
		.range([leftMargin, width-rightMargin])

	var y = d3.scaleLinear()
		.domain([0, 34])
		.range([height - bottomMargin, 0])

	var line = d3.line()
		.x(function(d) { return x(d.day); })
		.y(function(d) { return y(d.Vol); });

	const colour = d3.scaleLinear() 
		.domain([1979, 1998, 2018])
		.range(["#00b2ff", "#bdbdbd", "#ff4e36"]);

	const nested = d3.nest()
		.key(f => f.Year)
		.entries(data.sheets.Sheet1);

	const svg = d3.select(".interactive-wrapper")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
	
	window.resize();

	console.log(d3.schemeRdYlBu)

	const xAxis = svg.append("g").classed("x-axis", "true");
	const yAxis = svg.append("g").classed("y-axis", "true");

	xAxis.append("line")
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", height - 24)
		.attr("y2", height - 24)
		.style("stroke-width", "1px")
		.style("stroke", "#dcdcdc");

	
	for(let i = 0; i < 12; i++) {
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		if(((width <= 450) && i % 2 == 0) || width > 450) {
			xAxis.append("line")
				.attr("x1", leftMargin + i*((width-leftMargin-rightMargin)/11))
				.attr("x2", leftMargin + i*((width-leftMargin-rightMargin)/11))
				.attr("y1", height - 24)
				.attr("y2", height - 24 + 5)
				.style("stroke-width", "1px")
				.style("stroke", "#dcdcdc");

			xAxis.append("text")
				.text(months[i])
				.attr("x", leftMargin + i*((width-leftMargin-rightMargin)/11))
				.attr("y", height - 6)
				.classed("label", true);
		}
	}

	for(let i = 0; i < 4; i++) {
		const ticks = [0, 10, 20, 30];

		yAxis.append("line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", y(ticks[i]))
			.attr("y2", y(ticks[i]))
			.style("stroke-width", "1px")
			.style("stroke", "#dcdcdc");

		yAxis.append("text")
			.text(ticks[i])
			.attr("x", 0)
			.attr("y", y(ticks[i]) - 6)
			.classed("label", true);
	}

	d3.select(".y-axis text:last-child").text("30 thousand km3");

	// svg.append("g").selectAll("text")
	// 	.data(nested)
	// 	.enter()
	// 		.append("text")
	// 		.attr("x", leftMargin)
	// 		.attr("y", y(11))
	// 		.text(d => d.key)
	// 		.style("display", "none")
	// 		.classed("year-label", true)
	// 		.transition()
	// 		.delay((d, i) => i*250)
	// 			.style("display", "block")
	// 			.on("end", function(e) {
	// 				d3.select(this).style("display", "none");
	// 			});
	const yearEl = d3.select("#year-to-change");

	const defs = svg.append("defs");

	defs.html(`<marker id="circle" markerWidth="8" markerHeight="8" refX="5" refY="5">
			<circle cx="5" cy="5" r="1.5" style="stroke: none; fill:#000000;"/>
		</marker>`);
		
	
	const yearLabels = ["1980", "1990", "2000", "2010"];


	function startAnimations() {
		svg.append("g").selectAll("path")
		.data(nested)
		.enter()
			.append("path")
			.datum(d => d.values)
			.attr("fill", "none")
			.attr("stroke", d => (d[0].Year == 2018) ? "#000" : colour(d[0].Year))
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", d => (d[0].Year == 2018) ? "4px" : "2px")
			.attr("marker-end", (d) => (d[0].Year == 2018) ? "url(#circle)" : "")
			.style("fill-opacity", "1")
			.attr("d", line)
			.style("display", "none")
			.transition()
			.delay((d, i) => i*250)
				.style("display", "block")
				.on("start", (d) => {
					window.resize();
					yearEl.text(d[0].Year)
				});


		svg.append("g").selectAll("text")
				.data(yearLabels)
				.enter()
					.append("text")
						.text(d => d + "s")
						.attr("x", width - rightMargin + 5)
						.attr("y", d => {
							const dataForYear = nested.filter(f => f.key == d)[0];

							return y(dataForYear.values[0].Vol) + 10;
						})
						.style("fill", d => colour(d))
						.classed("labels", true)
						.style("display", "none")
						.transition()
						.delay((d, i) => {
							return (d - 1979) * 250;
						})
						.style("display", "block");
		setTimeout(() => {
			const g = svg.append("g");
			g.append("text")
				.text("2018")
				.classed("labels", true)
				.style("fill", "#fff")
				.attr("x", x(212) + 12)
				.attr("y", y(7.583) + 12)
				.style("stroke", "#fff")
				.style("stroke-width", "2px")
				.style("font-weight", "bold");
	
			g.append("text")
				.text("2018")
				.classed("labels", true)
				.style("fill", "#000")
				.attr("x", x(212) + 12)
				.attr("y", y(7.583) + 12)
				.style("font-weight", "bold");
	
		}, (2018-1979) * 250);
		
	}

	let animated = false;



	window.setInterval(() => {
		if(animated == false) {
			if(window.frameElement.getBoundingClientRect().top < window.innerHeight * (0.75)) {
				animated = true;

				startAnimations();
			};
		}
	}, 100);

});