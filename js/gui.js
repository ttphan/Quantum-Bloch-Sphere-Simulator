$(document).ready(function() {
	var camera_top, controls, scene, renderer_top;

	var camera_bottom, scene_bottom, renderer_bottom;

	var activeTab = 1;
	var arrows = [null, null, null, null];
	var transformation = [0.7, 0.2, 0.2];

	// Color values
	var sphereColor = 0x00BFFF;
	var axesColors = [0xffffff,0xffffff,0xffffff];
	var circleColors = [0xffffff, 0xD8D8D8];
	var tabColors = ['red', 'green', 'blue', 'yellow'];

	init();
	animate();
	gui();
	makeNoiseTab();
	onNoiseSelectionChanged();

	function init() {
		var c_top = $('#canvas-top')[0];
		var c_bottom = $('#canvas-bottom')[0];

		// renderer
		//// Top
		renderer_top = new THREE.WebGLRenderer({canvas: c_top});
		renderer_top.setSize(c_top.width, c_top.height);
		renderer_top.autoClear = false;

		//// Bottom
		renderer_bottom = new THREE.WebGLRenderer({canvas: c_bottom});
		renderer_bottom.setSize(c_bottom.width, c_bottom.height);
		renderer_bottom.autoClear = false;

		// camera
		camera_top = new THREE.PerspectiveCamera(45, c_top.width / c_top.height, 1, 1000);
		camera_bottom = new THREE.PerspectiveCamera(45, c_bottom.width / c_bottom.height, 1, 1000);
		camera_top.position.z = camera_bottom.position.z = 3;
		camera_top.position.x = camera_bottom.position.x = 1;
		camera_top.position.y = camera_bottom.position.y = 1;
		
		// Trackball controls
		controls = new THREE.OrbitControls( camera_top, c_top );
		controls.rotateSpeed = 1.0;
		controls.noPan = true;

		controls.minDistance = 2;
		controls.maxDistance = 5;

		controls.addEventListener( 'change', render );

		// scene
		//// Top
		scene = new THREE.Scene();
		sceneCircles = new THREE.Scene();

		//// Bottom
		scene_bottom = new THREE.Scene(); 
		sceneCircles_bottom = new THREE.Scene();


		////////////////////// TOP ////////////////////////////////
		// Bloch sphere object
		var blochSphere = new THREE.Object3D();
				
		// sphere
		var sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
		var sphereMaterial = new THREE.MeshBasicMaterial( { 
			color: sphereColor, 
			transparent: true, 
			opacity: 0.25 
		});

		var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		blochSphere.add(sphere);

		// circle
		var circles = buildCircles(circleColors);
		sceneCircles.add(circles);

		// Add axes
		var axes = buildAxes( 1.5, axesColors );
		blochSphere.add( axes );

		scene.add(blochSphere);

		var geometry = new THREE.SphereGeometry( 1, 16, 12 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( transformation[0], transformation[1], transformation[2] ) );

		var sphereMaterialNoise = new THREE.MeshBasicMaterial( { 
			color: sphereColor, 
			transparent: true, 
			opacity: 0.25 
		});

		/////////////////////// BOTTOM /////////////////////////////////
		var blochSphere_bottom = new THREE.Object3D();

		var sphere_bottom = new THREE.Mesh(geometry, sphereMaterialNoise);
		blochSphere_bottom.add(sphere_bottom);

		blochSphere_bottom.add(buildAxes(1.5, axesColors))

		var circles_bottom = buildCircles(circleColors, transformation);
		sceneCircles_bottom.add(circles_bottom)

		blochSphere_bottom.add(circles_bottom);

		scene_bottom.add(blochSphere_bottom)

		render();
	}
		
	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}

	function render() {
		renderer_top.setClearColor( 0x424242, 1);
		renderer_top.clear();
		renderer_top.render(sceneCircles, camera_top);
		renderer_top.clearDepth();
		renderer_top.render(scene, camera_top);

		renderer_bottom.setClearColor( 0x424242, 1);
		renderer_bottom.clear();
		renderer_bottom.render(sceneCircles_bottom, camera_top);
		renderer_bottom.clearDepth();
		renderer_bottom.render(scene_bottom, camera_top);
	}

	function drawArrow() {
		//var colours = ['red', 'green', 'blue', 'yellow'];
		//console.log($("#input_" + activeTab + "_a").val())
	    var a = math.complex($("#input_" + activeTab + "_a").val());
		var b = math.complex($("#input_" + activeTab + "_b").val());
		var c = math.complex($("#input_" + activeTab + "_c").val());
		var d = math.complex($("#input_" + activeTab + "_d").val());
	    var dir = getVector([[a,b],[c,d]]);

	    // Switch z and y axis to compensate for computer graphics/physics
	    // difference quirks.
	    temp = dir.y;
	    dir.y = dir.z;
	    dir.z = temp;
	    dir.z = -1 * dir.z;
		
		var origin = new THREE.Vector3( 0, 0, 0 );
		var length = dir.length();

		var hex = tabColors[activeTab - 1];
		var arrow = new THREE.ArrowHelper( dir, origin, length, hex );

		if (arrows[activeTab-1] != null) {
			scene.remove(arrows[activeTab-1]);
		}

		arrows[activeTab-1] = arrow;
		scene.add( arrow );

		render();
	} // drawArrow

	function ifValidDrawArrow() {
		var a = math.complex($("#input_" + activeTab + "_a").val());
		var b = math.complex($("#input_" + activeTab + "_b").val());
		var c = math.complex($("#input_" + activeTab + "_c").val());
		var d = math.complex($("#input_" + activeTab + "_d").val());
	    var mat = [[a,b],[c,d]];

		if (!isValidTrace(mat) || !isValidHermitian(mat)) {// || !isValidEigenvalues(mat)) {
			alert("This density matrix does not represent a valid state!");
		} else {
			drawArrow();
		}
	}

	function updateTopSlider() {
		var textId = this.id.slice(-1);
		$('.js-range-slider-1-' + textId).data("ionRangeSlider").update({from: this.value});
		updateStateGui(activeTab);
	}

	function gui() {
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
		    var tab = $(e.target).attr('id');
		    activeTab = parseInt(tab.substring(tab.length-1));	
		});
		
		for (var i = 1; i <= 4; i++) {
			$("#section" + i)//.append($('<h3>State ' + i + '</h3>'))
					.append($("<div></div>")
					.addClass("col-md-6")
					.append($("<h4 id='densityMatText'>Density Matrix: </h4>"))
					.append($("<input>")
						.attr({
							id: "input_" + i + "_a",
							value: '1.00',
							type: 'text'
						})
						.css({
							'width': '90px',
							'margin': '10px'
						})
					)
					.append($("<input>")
						.attr({
							id: "input_" + i + "_b",
							value: '0.00',
							type: 'text'
						})
						.css({
							'width': '90px',
							'margin': '10px'
						})
					)
					.append($("<br/>"))
					.append($("<input>")
						.attr({
							id: "input_" + i + "_c",
							value: '0.00',
							type: 'text'
						})
						.css({
							'width': '90px',
							'margin': '10px'
						})
					)
					.append($("<input>")
						.attr({
							id: "input_" + i + "_d",
							value: '0.00',
							type: 'text'
						})
						.css({
							'width': '90px',
							'margin': '10px'
						})
					)
				)
				.append($("<div></div>")
					.addClass("col-md-6")
					.css({
						'padding-bottom': '30px'
					})
					.append($("<h4>State in standard basis: </h4>"))
					.append($("<div id='state" + i + "Text'></div>")
					  .append($("<p>&#936 = (1)|0> + (0)|1></p>"))
					)
					.append($("<button></button>")
						.attr({id: "btn_show_state_" + i})
						.addClass("btn btn-default btn-md")
						.text("Show state in Bloch-sphere")
					)
				)
				.append($("<div class='sliders col-md-12'></div>")
					.append($("<div class='row'></div>")
						.append($("<div class='col-md-1 smallPadding greekAngles'></div>")
							.append($("<h5>&#x3B8</h5>")
							)
						)
						.append($("<div class='col-md-1 smallPadding'></div>")
							.append($("<input class='inputAngles'>")
								.attr({
									id: "angle_" + i + "_1",
									value: '0.00',
									type: 'text',

								})
							)
						)
						.append($("<div class='range-slider col-md-10'></div>")
						    .append($("<input type='text' class='js-range-slider-" + i + "-1' value='' />"))
						)
					)
					.append($("<div class='row'></div>")
						.append($("<div class='col-md-1 smallPadding greekAngles'></div>")
							.append($("<h5>&#x3C6</h5>")
							)
						)
						.append($("<div class='col-md-1 smallPadding'></div>")
							.append($("<input class='inputAngles'>")
								.attr({
									id: "angle_" + i + "_2",
									value: '0.00',
									type: 'text',
								})
							)
						)
						.append($("<div class='range-slider col-md-10'></div>")
						    .append($("<input type='text' class='js-range-slider-" + i + "-2' value='' />"))
						)
					)
				)

			// Event listeners to buttons
			$("#btn_show_state_" + i).on('click', ifValidDrawArrow);
			$("#angle_" + i + "_2").on('change', updateTopSlider);
			$("#angle_" + i + "_1").on('change', updateTopSlider);

			
			// Initialize sliders
			createSliders(i);
		}
	}

	function createSliders(i) {
		var $theta = $(".js-range-slider-" + i + "-1"),
		    $phi = $(".js-range-slider-" + i + "-2"),
		    first,
		    second;

		$theta.ionRangeSlider({
		    type: "single",
		    grid: true,
		    min: 0,
		    max: 180,
		    from: 0,
		    step: 0.1,
		    onChange: function (data) {
		    	$("#angle_" + i + "_1").val(data.from);
		        updateStateGui(i);
		    }
		});

		$phi.ionRangeSlider({
		    type: "single",
		    grid: true,
		    min: 0,
		    max: 360,
		    from: 0,
		    step: 0.1,
		    onChange: function (data) {
		    	$("#angle_" + i + "_2").val(data.from);
		        updateStateGui(i);
		    }
		});

		first = $theta.data("ionRangeSlider");
		second = $phi.data("ionRangeSlider");
	}
	
	function makeNoiseTab() {
		// slider:
		var $R = $(".js-range-slider-noise");
		$R.ionRangeSlider({
		    type: "single",
		    grid: true,
		    min: 0,
		    max: 1,
		    from: 0,
		    step: 0.01,
		});	
	}

	function updateStateGui(i) {
		var $theta = $(".js-range-slider-" + i + "-1"),
		    $phi = $(".js-range-slider-" + i + "-2")

		var radTheta = parseFloat($theta.val()) / 180 * Math.PI;
		var radPhi = parseFloat($phi.val()) / 180 * Math.PI;

		var amplitudes = getStateFromAngle(radTheta, radPhi);

		var a = amplitudes[0][0];
		var b = amplitudes[1][0];

		$("#state" + i + "Text").html("<p>&#936 = (" + sliceDecimals(a) + ")|0> + (" + sliceDecimals(b) + ")|1></p>");

		var matrix = stateToDens([[a],[b]]);
		
		$("#input_" + i + "_a").val(sliceDecimals(matrix[0][0]));
		$("#input_" + i + "_b").val(sliceDecimals(matrix[0][1]));
		$("#input_" + i + "_c").val(sliceDecimals(matrix[1][0]));
		$("#input_" + i + "_d").val(sliceDecimals(matrix[1][1]));

		drawArrow();
	}
});

function onNoiseSelectionChanged() {
	var x = document.getElementById("noise-select").value;

	if (x == "D") {
	  document.getElementById("noise-equation-img").src = "img/noiseEq_D.png";
	}
	if (x == "PhX") {
	  document.getElementById("noise-equation-img").src = "img/noiseEq_PhX.png";
	}
	if (x == "PhZ") {
	  document.getElementById("noise-equation-img").src = "img/noiseEq_PhZ.png";
	}
	if (x == "A") {
	  document.getElementById("noise-equation-img").src = "img/noiseEq_A.png";
	}
}

function sliceDecimals(number) {
	var result;

	if (typeof number == 'number') {
		result = math.complex(number.toFixed(2));
	}
	else {
		var re = number.re.toFixed(2);
		var im = number.im.toFixed(2);

		result = math.complex(parseFloat(re), parseFloat(im));
	}

	return result;
}

function buildAxes( length, colors ) {
	var axes = new THREE.Object3D();

	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), colors[0], false ) ); // +X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), colors[0], true) ); // -X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), colors[1], false ) ); // +Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), colors[1], true ) ); // -Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), colors[2], true ) ); // +Z
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), colors[2], false ) ); // -Z

	return axes;
}

function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 0.1, gapSize: 0.1 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex, depthTest: false });
	}

	geom.vertices.push( src.clone() );
	geom.vertices.push( dst.clone() );
	geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

	var axis = new THREE.Line( geom, mat, THREE.LinePieces );

	return axis;

}

function buildCircles(colors, vector) {
	var circles = new THREE.Object3D();
	var a, b, c;
	if (vector !== undefined) {
		a = vector[0];
		b = vector[1];
		c = vector[2];
	}

	circles.add(buildCircle(1, 32, 0, [a, b, c], colors));
	circles.add(buildCircle(1, 32, 'x', [a, c, b], colors));
	circles.add(buildCircle(1, 32, 'y', [c, b, a], colors));

	return circles;
}

function buildCircle(radius,segments,rot, vector, colors) {
	var circle = new THREE.Object3D();

	var circleGeometry = new THREE.CircleGeometry( radius, segments );
	var lineGeometry = new THREE.CircleGeometry( radius, segments );

	if (vector !== undefined && vector[0] !== undefined) {
		circleGeometry.applyMatrix( new THREE.Matrix4().makeScale( vector[0], vector[1], vector[2] ) );
		lineGeometry.applyMatrix( new THREE.Matrix4().makeScale( vector[0], vector[1], vector[2] ) );
	}
	
	var lineMaterial = new THREE.LineDashedMaterial( {
		color: colors[1], 
		transparent: true,
		opacity: 0.5,
		depthWrite: false, 
		depthTest: false,
		dashSize: 0.1,
		gapSize: 0.1, 
		linewidth: 1
	});

	lineGeometry.computeLineDistances();
	
	var line = new THREE.Line(lineGeometry,lineMaterial);

	if (rot ==='x') {
		var circleMaterial = new THREE.MeshBasicMaterial( { 
			color: colors[0], 
			transparent: true, 
			side: THREE.DoubleSide,
			opacity: 0.3,
			depthWrite: false, 
			depthTest: false
		});
		var base =  new THREE.Mesh(circleGeometry, circleMaterial);
		circle.rotation.x = Math.PI/2; 
		circle.add(base);
	}
	else if (rot ==='y') {
		circle.rotation.y = Math.PI/2; 
	}

	circle.add(line);

	return circle;
}
