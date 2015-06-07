var activeTab = 1;

function gui() {
	for (var i = 1; i <= 4; i++) {
		$("#section" + i).append($('<h3>State ' + i + '</h3>'))
			.append($("<p>Density Matrix: </p>"))
			.append($("<input type='text' id='input_" + i + "_a' value='1.00' style='width:60px;'>"))
			.append($("<input type='text' id='input_" + i + "_b' value='0.00' style='width:60px;'>"))
			.append($("<br/>"))
			.append($("<input type='text' id='input_" + i + "_c' value='0.00' style='width:60px;'>"))
			.append($("<input type='text' id='input_" + i + "_d' value='0.00' style='width:60px;'>"))
			.append($("<br/>"))
			.append($("<button id='btn_show_state_" + i + "'>Show state in Bloch-sphere</button>"))
			.append($("<br/>"))
			.append($("<p>State: </p>"))
			.append($("<div id='state" + i + "Text'></div>")
			  .append($("<p>&#936 = 1|0> + 0|1></p>"))
			 )
			.append($("<br/>"))
			.append($("<div class='sliders'></div>")
				.append($("<div class='row'></div>")
					.append($("<div class='range-slider col-md-8'></div>")
					    .append($("<input type='text' class='js-range-slider-" + i + "-1' value='' />"))
					)
					.append($("<div class='col-md-4'></div>")
						.append($("<label><input type='checkbox' name='checkbox' value='value' class='check_negative' id='negative_" + i + "_1' onchange='updateStateGui(1)'> Negative values</label>"))
					)
				)
				.append($("<div class='row'></div>")
					.append($("<div class='range-slider col-md-8'></div>")
					    .append($("<input type='text' class='js-range-slider-" + i + "-2' value='' />"))
					)
					.append($("<div class='col-md-4'></div>")
						.append($("<label><input type='checkbox' name='checkbox' value='value' class='check_negative' id='negative_" + i + "_2' onchange='updateStateGui(1)'> Negative values</label>"))
					)
				)
			)	

		createSliders(i);
	}
}

function createSliders(i) {
	var $range1 = $(".js-range-slider-" + i + "-1"),
	    $range2 = $(".js-range-slider-" + i + "-2"),
	    first,
	    second;

	$range1.ionRangeSlider({
	    type: "single",
	    grid: true,
	    min: 0,
	    max: 1.0,
	    from: 1,
	    step: 0.001,
	    onChange: function (data) {
	        second.update({
	            from: Math.sqrt(1 - Math.pow(data.from, 2))
	        });

	        updateStateGui(i);
	    }
	});

	$range2.ionRangeSlider({
	    type: "single",
	    min: 0,
	    max: 1.0,
	    from: 0,
	    step: 0.001,
	    onChange: function (data) {
	        first.update({
	            from: Math.sqrt(1 - Math.pow(data.from, 2))
	        });

	        updateStateGui(i);
	    }
	});

	first = $range1.data("ionRangeSlider");
	second = $range2.data("ionRangeSlider");
}	

function updateStateGui(i) {
	var $range1 = $(".js-range-slider-" + i + "-1"),
	    $range2 = $(".js-range-slider-" + i + "-2")

	var a = new Number($range1.val());
	var b = new Number($range2.val());

	if ($("#negative_" + i + "_1")[0].checked == true && a != 0) {
		a = a*-1;
	}
	if ($("#negative_" + i + "_2")[0].checked == true && b != 0) {
		b = b*-1;
	}

	$("#state" + i + "Text").html("<p>&#936 = " + a + "|0> + " + b + "|1></p>");

	var matrix = stateToDens([[a+0],[b+0]]);
	
	$("#input_" + i + "_a").val(matrix[0][0].toFixed(2));
	$("#input_" + i + "_b").val(matrix[0][1].toFixed(2));
	$("#input_" + i + "_c").val(matrix[1][0].toFixed(2));
	$("#input_" + i + "_d").val(matrix[1][1].toFixed(2));
}