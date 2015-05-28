window.onload = function() {
	var camera, controls, scene, renderer;

	init();
	animate();

	function init() {
		var c = document.getElementById('myCanvas');

		// renderer
		renderer = new THREE.WebGLRenderer({canvas: c});
		renderer.setSize(c.width, c.height);

		// camera
		camera = new THREE.PerspectiveCamera(45, c.width / c.height, 1, 1000);
		camera.position.z = 5;

		controls = new THREE.TrackballControls( camera, c );
		controls.rotateSpeed = 5.0;

		controls.noZoom = false;
		controls.noPan = true;

		controls.dynamicDampingFactor = 1;

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
			color: 0x00ff00, 
			transparent: true, 
			opacity: 0.25 
		});

		var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		blochSphere.add(sphere);

		// Add axes
		axes = buildAxes( 1.5 );
		blochSphere.add( axes );

		scene.add(blochSphere);
		render();
		
		
		function drawArrow( ) {
		    var a = new Number(document.getElementById("input_a").value);
			var b = new Number(document.getElementById("input_b").value);
			var c = new Number(document.getElementById("input_c").value);
			var d = new Number(document.getElementById("input_d").value);
		    var dir = getVector(a,b,c,d);
			
			var origin = new THREE.Vector3( 0, 0, 0 );
			var length = 1;
			var hex = 0xffff00;

			var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
			scene.add( arrowHelper );
		} // drawArrow
		
		var knop = document.getElementById("knop");
		knop.addEventListener( 'click', drawArrow);

	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}

	function render() {
		renderer.render(scene, camera);
	}
}

function buildAxes( length ) {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

		return axes;
}

function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
	}

	geom.vertices.push( src.clone() );
	geom.vertices.push( dst.clone() );
	geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

	var axis = new THREE.Line( geom, mat, THREE.LinePieces );

	return axis;

}















