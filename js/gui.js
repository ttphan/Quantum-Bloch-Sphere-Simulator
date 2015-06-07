$(document).ready(function() {
	var camera, controls, scene, renderer;

	var activeTab = 1;
	var arrows = [null, null, null, null];

	init();
	animate();
	gui();

	function init() {

		var c = $('#myCanvas')[0];

		// renderer
		renderer = new THREE.WebGLRenderer({canvas: c});
		renderer.setSize(c.width, c.height);
		renderer.autoClear = false;

		// camera
		camera = new THREE.PerspectiveCamera(45, c.width / c.height, 1, 1000);
		camera.position.z = 3;
		camera.position.x = 1;
		camera.position.y = 1;

		// Trackball controls
		controls = new THREE.OrbitControls( camera, c );
		controls.rotateSpeed = 1.0;
		controls.noPan = true;

		controls.minDistance = 2;
		controls.maxDistance = 5;

		controls.addEventListener( 'change', render );

		// scene
		scene = new THREE.Scene();
		sceneCircles = new THREE.Scene();

		// Bloch sphere object
		var blochSphere = new THREE.Object3D();
				
		// sphere
		// the first argument of THREE.SphereGeometry is the radius, the second argument is
		// the segmentsWidth, and the third argument is the segmentsHeight.  Increasing the 
		// segmentsWidth and segmentsHeight will yield a more perfect circle, but will degrade
		// rendering performance
		var sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
		var sphereMaterial = new THREE.MeshBasicMaterial( { 
			color: 0x0099CC, 
			transparent: true, 
			opacity: 0.25 
		});

		var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		blochSphere.add(sphere);

		// circle
		var circles = buildCircles();
		sceneCircles.add(circles);

		// Add axes
		var axes = buildAxes( 1.5 );
		blochSphere.add( axes );

		scene.add(blochSphere);
		render();
	}
		
		
	function drawArrow() {
		var colours = ['red', 'green', 'blue', 'yellow'];
		console.log($("#input_" + activeTab + "_a").val())
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

		var hex = colours[activeTab - 1];
		var arrow = new THREE.ArrowHelper( dir, origin, length, hex );

		if (arrows[activeTab-1] != null) {
			scene.remove(arrows[activeTab-1]);
		}

		arrows[activeTab-1] = arrow;
		scene.add( arrow );

		render();
	} // drawArrow

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}

	function render() {
		renderer.setClearColor( 0xffffff, 1);
		renderer.clear();
		renderer.render(sceneCircles, camera);
		renderer.clearDepth();
		renderer.render(scene, camera);
	}

	function gui() {
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
		    var tab = $(e.target).attr('id');
		    activeTab = parseInt(tab.substring(tab.length-1));	
		});
		
		for (var i = 1; i <= 4; i++) {
			$("#section" + i).append($('<h3>State ' + i + '</h3>'))
					.append($("<div></div>")
					.addClass("col-md-6")
					.append($("<h4>Density Matrix: </h4>"))
					.append($("<input>")
						.attr({
							id: "input_" + i + "_a",
							value: '1.00',
							type: 'text'
						})
						.css({
							'width': '80px',
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
							'width': '80px',
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
							'width': '80px',
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
							'width': '80px',
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
					  .append($("<p>&#936 = 1|0> + 0|1></p>"))
					)
					.append($("<button></button>")
						.attr({id: "btn_show_state_" + i})
						.addClass("btn btn-default btn-md")
						.text("Show state in Bloch-sphere")
					)
				)
				.append($("<div class='sliders col-md-12'></div>")
					.append($("<div class='row'></div>")
						.append($("<div class='col-md-2'></div>")
							.append($("<h4>Theta</h4>")
							)
						)
						.append($("<div class='range-slider col-md-10'></div>")
						    .append($("<input type='text' class='js-range-slider-" + i + "-1' value='' />"))
						)
					)
					.append($("<div class='row'></div>")
						.append($("<div class='col-md-2'></div>")
							.append($("<h4>Phi</h4>")
							)
						)
						.append($("<div class='range-slider col-md-10'></div>")
						    .append($("<input type='text' class='js-range-slider-" + i + "-2' value='' />"))
						)
					)
				)

			// Event listeners to buttons
			$("#btn_show_state_" + i).on('click', drawArrow);

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
		        updateStateGui(i);
		    }
		});

		first = $theta.data("ionRangeSlider");
		second = $phi.data("ionRangeSlider");
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

		drawArrow()
	}
});

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

function buildAxes( length ) {
	var axes = new THREE.Object3D();

	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, true ) ); // +Z
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, false ) ); // -Z

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

function buildCircles() {
	var circles = new THREE.Object3D();

	circles.add(buildCircle(1,32,0));
	circles.add(buildCircle(1,32,'x'));
	circles.add(buildCircle(1,32,'y'));

	return circles;
}

function buildCircle(radius,segments,rot) {
	var circle = new THREE.Object3D();

	var circleGeometry = new THREE.CircleGeometry( radius, segments );
	var lineGeometry = new THREE.CircleGeometry( radius, segments );

	var circleMaterial = new THREE.MeshBasicMaterial( { 
		color: 0xffffff, 
		transparent: true, 
		side: THREE.DoubleSide,
		opacity: 0.3,
		depthWrite: false, 
		depthTest: false
	});
	var lineMaterial = new THREE.LineDashedMaterial( {
		color: 'gray', 
		transparent: true,
		opacity: 0.5,
		depthWrite: false, 
		depthTest: false,
		dashSize: 0.1,
		gapSize: 0.1, 
		linewidth: 1
	});

	lineGeometry.computeLineDistances();

	var base =  new THREE.Mesh(circleGeometry, circleMaterial);
	var line = new THREE.Line(lineGeometry,lineMaterial);

	if (rot ==='x') {	circle.rotation.x = Math.PI/2; }
	else if (rot ==='y') {circle.rotation.y = Math.PI/2; }

	circle.add(base);
	circle.add(line);

	return circle;
}















