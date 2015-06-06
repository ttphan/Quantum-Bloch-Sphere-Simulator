function showState() {
	var a = new Number(document.getElementById("input_a").value);
	var b = new Number(document.getElementById("input_b").value);
	var c = new Number(document.getElementById("input_c").value);
	var d = new Number(document.getElementById("input_d").value);
	var vector = getVector([[a,b],[c,d]]);
	alert("x: "+vector.x+" y: "+vector.y+" z: "+vector.z)
} // showState

function gui() {
	var $range1 = $(".js-range-slider-1"),
	    $range2 = $(".js-range-slider-2"),
	    first,
	    second;

	$range1.ionRangeSlider({
	    type: "single",
	    grid: true,
	    min: 0.0,
	    max: 1.0,
	    from: 1,
	    step: 0.001,
	    onChange: function (data) {
	        second.update({
	            from: Math.sqrt(1 - Math.pow(data.from, 2))
	        });

	        updateStateGui();
	    }
	});

	$range2.ionRangeSlider({
	    type: "single",
	    min: 0.0,
	    max: 1.0,
	    from: 0,
	    step: 0.001,
	    onChange: function (data) {
	        first.update({
	            from: Math.sqrt(1 - Math.pow(data.from, 2))
	        });

	        updateStateGui();
	    }
	});

	first = $range1.data("ionRangeSlider");
	second = $range2.data("ionRangeSlider");

	function updateStateGui() {
		var a = new Number($range1.val());
		var b = new Number($range2.val());

		var elem = document.getElementById("state1Text");
		elem.innerHTML = "&#936 = " + a + "|0> + " + b + "|1>";

		var matrix = stateToDens([[a+0],[b+0]]);
		
		document.getElementById("input_a").value = matrix[0][0].toFixed(2);
		document.getElementById("input_b").value = matrix[0][1].toFixed(2);
		document.getElementById("input_c").value = matrix[1][0].toFixed(2);
		document.getElementById("input_d").value = matrix[1][1].toFixed(2);
	}
}