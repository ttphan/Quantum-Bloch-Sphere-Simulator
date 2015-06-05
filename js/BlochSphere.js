window.onload = function() {
	var camera, controls, scene, renderer;

	init();
	animate();
	gui();

	function init() {
		var c = document.getElementById('myCanvas');

		// renderer
		renderer = new THREE.WebGLRenderer({canvas: c});
		renderer.setSize(c.width, c.height);

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
		blochSphere.add(circles);

		// Add axes
		var axes = buildAxes( 1.5 );
		blochSphere.add( axes );

		scene.add(blochSphere);
		render();
		
		
		function drawArrow( ) {
		    var a = new Number(document.getElementById("input_a").value);
			var b = new Number(document.getElementById("input_b").value);
			var c = new Number(document.getElementById("input_c").value);
			var d = new Number(document.getElementById("input_d").value);
		    var dir = getVector([[a,b],[c,d]]);

		    // Switch z and y axis to compensate for computer graphics/physics
		    // difference quirks.
		    temp = dir.y;
		    dir.y = dir.z;
		    dir.z = temp.im;
		    //dir.y = -1 * dir.y;
			
			var origin = new THREE.Vector3( 0, 0, 0 );
			var length = dir.length();
			console.log(a + ', ' + b + ', ' + c + ', ' + d);
			console.log(dir.x + ', ' + dir.y + ', ' + dir.z);
			console.log(length);
			var hex = '#'+Math.floor(Math.random()*16777215).toString(16);

			var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
			scene.add( new THREE.ArrowHelper( dir, origin, length, hex ) );
			render();
		} // drawArrow
		
		var knop = document.getElementById("knop");
		knop.addEventListener( 'click', drawArrow);

	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}

	function render() {
		renderer.setClearColor( 0xffffff, 1);
		renderer.render(scene, camera);
	}
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
		mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
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
		opacity: 0.1,
		depthWrite: false, 
		depthTest: false
	});
	var lineMaterial = new THREE.LineDashedMaterial( {
		color: 0xffffff, 
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















