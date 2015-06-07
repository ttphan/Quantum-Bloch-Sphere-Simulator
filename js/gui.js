var activeTab = 1;

function showState(i) {
	var a = new Number($("#input_" + i + "_a").val());
	var b = new Number($("#input_" + i + "_b").val());
	var c = new Number($("#input_" + i + "_c").val());
	var d = new Number($("#input_" + i + "_d").val());
	var vector = getVector([[a,b],[c,d]]);
	console.log("x: "+vector.x+" y: "+vector.y+" z: "+vector.z)
} // showState

function gui() {
	for (var i = 1; i <= 4; i++) {
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