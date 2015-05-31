function showState() {
	var a = new Number(document.getElementById("input_a").value);
	var b = new Number(document.getElementById("input_b").value);
	var c = new Number(document.getElementById("input_c").value);
	var d = new Number(document.getElementById("input_d").value);
	var vector = getVector([[a,b],[c,d]]);
	alert("x: "+vector.x+" y: "+vector.y+" z: "+vector.z)
} // showState

function showLatex() {
	var code = "\\left|\\Psi\\right> = a\\left|1\\right> + b\\left|0\\right>"
	var eqImg = document.getElementById("eqImg");
	eqImg.src = "http://latex.codecogs.com/gif.latex?\\bg_white \\200dpi " + code;
} // showLatex

// function flashtext(ele,col) {
// 	var tmpColCheck = document.getElementById("titel").style.color;

// 	if (tmpColCheck === 'green') {
// 		document.getElementById("titel").style.color = col;
// 	} else {
// 		document.getElementById("titel").style.color = 'green';
// 	}
// } // flashText 

// setInterval(function() {
// 	flashtext('flashingtext','red');
// }, 1000 );