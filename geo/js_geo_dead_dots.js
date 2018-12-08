
function vis_map(parentDOM, width, height, data) {
	console.log(data);

	const byCounty = d3.nest()
		.key((d) => d["County"])
		.map(data);

	let circle_g = parentDOM.append("g");
	let legend_g = parentDOM.append("g")
		.attr("transform", `translate(${10000}, ${500})`);

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White"]);

	function drawCircles(dataset) {
		function getBoundingBoxCenter (selection) {
			// get the DOM element from a D3 selection
			// you could also use "this" inside .each()
			var element = selection.node();
			// use the native SVG interface to get the bounding box
			var bbox = element.getBBox();
			// randomly generate a point within path

			let newX = bbox.x + Math.floor(Math.random() * bbox.width);
			let newY = bbox.y + Math.floor(Math.random() * bbox.height);
			return [newX, newY];
		}
		circle_g.html("");

		dataset.forEach(function(d){
			that = d3.select("#" + d["County"].replace(" ", "_")) ;

			circle_g.append("circle")
				.attr("cx", getBoundingBoxCenter(that)[0])
				.attr("cy", getBoundingBoxCenter(that)[1])
				.attr("r", 40)
				.attr("fill", color_scale(d["Race"]))
				.classed("dot_" + d["Race"], true);

		});
	}

	drawCircles(data);



	/*-------------
	Legend
	-------------*/

	let legend_circles = legend_g.selectAll("circle")
		.data(["White", "Hispanic", "Black"])

	new_circles = legend_circles.enter()
		.append("circle")
		.attr("cx", 5)
		.attr("cy", (d, i) => i * 500)
		.attr("r", 100)
		.attr("stroke-width", 50)
    	.attr("stroke", (d) => color_scale(d))
    	.attr("fill", (d)=> color_scale(d)) // initial circles are not filled
		.classed("selected", true);

	legend_circles = legend_circles.merge(new_circles);

	legend_g.selectAll("text")
	.data(["White", "Hispanic", "Black"])
	.enter()
	.append("text")
	.attr("x", 250)
	.attr("y", (d, i) => 100 + i * 500)
	.style("font-size", 300)
	.text((d)=> d)

	// event handler for legend
	legend_circles.on("click", function(d){

		// if deselected
		if (d3.select(this).classed("selected")){
			d3.select(this)
				.classed("selected", false)
				.attr("fill", "white");

			circle_g.selectAll(".dot_" + d).classed("hidden", true)
		}
		// if selected
		else{
			d3.select(this)
				.classed("selected", true)
				.attr("fill", color_scale(d));

			circle_g.selectAll(".dot_" + d).classed("hidden", false);
		}
	});

	/*
	* Freaking animation
	*/
	const trigger = parentDOM.append("rect")
		.attr("x", 8000)
		.attr("y", 500)
		.attr("width", 1000)
		.attr("height", 1000)
		.attr("fill", "black");

	// slider
	let slide_width = 6000;
	let startDate = new Date("01/01/1982");
	let endDate = new Date("12/31/2018");
	let moving = false;
	let currVal = 0;
	let targetVal = slide_width;

	let x_slide = d3.scaleTime()
		.domain([startDate, endDate])
		.range([0, slide_width])
		.clamp(true);

	// components of sliders
	let slider = parentDOM.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(500, 500)");

	// the main slide
	slider.append("line")
		.attr("class", "track")
		.attr("x1", x_slide.range()[0])
		.attr("x2", x_slide.range()[1])
		.select(function(){return this.parentNode.appendChild(this.cloneNode(true));}) // what?
		.attr("class", "track-inset")
		.select(function(){return this.parentNode.appendChild(this.cloneNode(true));}) // what?
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function(){slider.interrupt();})
			.on("start drag", function(){
				currVal = d3.event.x;
				update(x_slide.invert(currVal));
			})
		);

	console.log(x_slide.ticks(10));
	// the ticks
	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0, 250)")
		.selectAll("text")
		.data(x_slide.ticks(11))
		.enter()
		.append("text")
		.attr("x", (d) => x_slide(d))
		.attr("y", -20)
		.attr("text-anchor", "middle")
		.style("font-size", "150px")
		.text(function(d){return formatDateIntoYear(d); })
		.style("font-size", 2000);

	let handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 150);

	let label = slider.append("text")
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.attr("x", 0)
		.attr("y", -170)
		.style("font-size", "150px")
		.text(formatDate(startDate))
		// .attr("transfrom", "translate(500, 0)");

	function update(h) {
		// update position and text of label according to slider scale
		handle.attr("cx", x_slide(h));

		label.attr("x", x_slide(h))
		 	.text(formatDate(h));

		// filter dataset and redraw plot
		let newData = data.filter(function(d){
			let year = formatDateIntoYear(d["date"])
			let thisYear = formatDateIntoYear(h)
			return (year == thisYear);
		}); // keep an eye on how to get the Year of d["Date"]
		drawCircles(newData);
	}


	trigger.on("click", function(){

	});

}
