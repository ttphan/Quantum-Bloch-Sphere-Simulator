$(document).ready(function() {
	var camera_top, controls, scene, renderer_top;

	var camera_bottom, scene_bottom, renderer_bottom;

	var activeTab = 1;
	var arrows = [null, null, null, null];
	
	var blochSphere_bottom; // the bottom Bloch sphere
	var transformed_arrows = [null, null, null, null];
	var transformed_balletjes = [null, null, null, null];

	var transformation = [0.7, 1.3, 0.2];

	// Color values
	var sphereColor = 0x00BFFF;
	var axesColors = [0xFA5858,0x01DF3A,0x2E64FE];
	var circleColors = [0xffffff, 0xD8D8D8];
	var tabColors = ['red', 'green', 'blue', 'yellow'];

	// Geometry detail
	var sphereSegments = [30, 30];
	var circleSegments = 32;


	init();
	animate();
	gui();
	makeNoiseTab();
	onNoiseSelectionChanged();
	updateBottomBlochSphere( );


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
		scene.add( axes );

		scene.add(blochSphere);
		
		
		/////////////////////// BOTTOM /////////////////////////////////
		var geometry = new THREE.SphereGeometry( 1, 16, 12 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( transformation[0], transformation[1], transformation[2] ) );

		var sphereMaterialNoise = new THREE.MeshBasicMaterial( { 
			color: sphereColor, 
			transparent: true, 
			opacity: 0.25 
		});

		
		blochSphere_bottom = new THREE.Object3D();

		var sphere_bottom = new THREE.Mesh(geometry, sphereMaterialNoise);
		blochSphere_bottom.add(sphere_bottom);

		scene_bottom.add(buildAxes(1.5, axesColors))

		var circles_bottom = buildCircles(circleColors, transformation);
		sceneCircles_bottom.add(circles_bottom)

		blochSphere_bottom.add(circles_bottom);

		scene_bottom.add(blochSphere_bottom)
		

		render();

	}
	
	function computeTransformedBlochSphere() {
	  var E1 = [[0,0],[0,0]];
	  var E2 = [[0,0],[0,0]];
	  
	  E1[0][0] = parseFloat(document.getElementById("input_noise_E1_a").value);
	  E1[0][1] = parseFloat(document.getElementById("input_noise_E1_b").value);
	  E1[1][0] = parseFloat(document.getElementById("input_noise_E1_c").value);
	  E1[1][1] = parseFloat(document.getElementById("input_noise_E1_d").value);
	  
	  E2[0][0] = parseFloat(document.getElementById("input_noise_E2_a").value);
	  E2[0][1] = parseFloat(document.getElementById("input_noise_E2_b").value);
	  E2[1][0] = parseFloat(document.getElementById("input_noise_E2_c").value);
	  E2[1][1] = parseFloat(document.getElementById("input_noise_E2_d").value);
      
	  return computeNewBlochSphere(E1, E2);
	} // computeTransformedBlochSphere
	
	// draws bottom Bloch sphere at location center, with given axis lengths
	function updateBottomBlochSphere( ) {
		var tmp = computeTransformedBlochSphere();
		var axes = tmp[0];
		var center = tmp[1];
		
		// Switch z and y axis to compensate for computer graphics/physics
		// difference quirks.
		var tempHans = center.y;
		center.y = center.z;
		center.z = tempHans;
		center.z = -1 * center.z;
		
		var tempHans = axes[1];
		axes[1] = axes[2];
		axes[2] = tempHans;
		
	
		var geometry = new THREE.SphereGeometry( 1, 16, 12 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( axes[0], axes[1], axes[2] ) );

		var sphereMaterialNoise = new THREE.MeshBasicMaterial( { 
			color: 0x0099CC, 
			transparent: true, 
			opacity: 0.25 
		});

		
		var newblochSphere_bottom = new THREE.Object3D();

		var sphere_bottom = new THREE.Mesh(geometry, sphereMaterialNoise);
		newblochSphere_bottom.add(sphere_bottom);

		//newblochSphere_bottom.add(buildAxes(1.5));

		var circles_bottom = buildCircles(circleColors, axes);
		sceneCircles_bottom.add(circles_bottom)

		newblochSphere_bottom.add(circles_bottom);
		
		newblochSphere_bottom.translateX(center.x);
		newblochSphere_bottom.translateY(center.y);
		newblochSphere_bottom.translateZ(center.z);

		// replace bottom Bloch sphere:
		scene_bottom.remove(blochSphere_bottom);
		blochSphere_bottom = newblochSphere_bottom;
		scene_bottom.add(newblochSphere_bottom);
		
		drawTransformedArrows();
	} // updateBottomBlochSphere
		
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
	
	
	// draws all arrows transformed in bottom Bloch sphere
	function drawTransformedArrows() {
		var colours = ['red', 'green', 'blue', 'yellow'];
			
		// first get noise matrices E1 and E2
		var E1 = [[0,0],[0,0]];
		var E2 = [[0,0],[0,0]];
	  
		E1[0][0] = parseFloat(document.getElementById("input_noise_E1_a").value);
		E1[0][1] = parseFloat(document.getElementById("input_noise_E1_b").value);
		E1[1][0] = parseFloat(document.getElementById("input_noise_E1_c").value);
		E1[1][1] = parseFloat(document.getElementById("input_noise_E1_d").value);
		  
		E2[0][0] = parseFloat(document.getElementById("input_noise_E2_a").value);
		E2[0][1] = parseFloat(document.getElementById("input_noise_E2_b").value);
		E2[1][0] = parseFloat(document.getElementById("input_noise_E2_c").value);
		E2[1][1] = parseFloat(document.getElementById("input_noise_E2_d").value);
			  
		// get density matrices of all active arrows
		for (var i = 1; i <= 4; i++) {
		    if (arrows[i-1] != null) {
				var a = math.complex($("#input_" + i + "_a").val());
				var b = math.complex($("#input_" + i + "_b").val());
				var c = math.complex($("#input_" + i + "_c").val());
				var d = math.complex($("#input_" + i + "_d").val());
				
				var transformed_densityMat = channelNoise([[a,b],[c,d]],E1,E2);
				var dir = getVector(transformed_densityMat);
				//var dir = getVector([[a,b],[c,d]]);
				
				// Switch z and y axis to compensate for computer graphics/physics
				// difference quirks.
				var tempHans = dir.y;
				dir.y = dir.z;
				dir.z = tempHans;
				dir.z = -1 * dir.z;
				
				var origin = computeNewBlochSphere(E1, E2)[1];
				tempHans = origin.y;
				origin.y = origin.z;
				origin.z = tempHans;
				origin.z = -1 * origin.z;
				
				var length = dir.length();

				var hex = colours[i-1];
				
				//
				// creating the fcking line:
				//
				var geometry = new THREE.Geometry();
				
				//geometry.applyMatrix( new THREE.Matrix4().makeScale( axes[0], axes[1], axes[2] ) );
				
				geometry.vertices.push(origin); // start
				geometry.vertices.push(dir); // end
				
				var material = new THREE.LineBasicMaterial({color: hex});
				var arrow = new THREE.Line(geometry, material);
				//arrow.name = "homo";
				
				if (transformed_arrows[i-1] != null) {
					scene_bottom.remove(transformed_arrows[i-1]);
				} // if

				transformed_arrows[i-1] = arrow;
				scene_bottom.add(arrow);
				
				// Also add sphere at end of arrow:
				var geometry2 = new THREE.SphereGeometry( 0.05, 16, 12 );
				//geometry2.applyMatrix( new THREE.Matrix4().makeTranslation(dir.x, dir.y, dir.z));
				var sphereMaterial = new THREE.MeshBasicMaterial({color: hex});
				var balletje = new THREE.Mesh(geometry2, sphereMaterial);
				balletje.translateX(dir.x);
				balletje.translateY(dir.y);
				balletje.translateZ(dir.z);
				
				if (transformed_balletjes[i-1] != null) {
					scene_bottom.remove(transformed_balletjes[i-1]);
				} // if

				transformed_balletjes[i-1] = balletje;	
				scene_bottom.add(balletje);

			} // if
		} // for
		render();
	} // drawTransformedArrows

	function drawArrow() {
	    var dir = getVector(getDensityMatrix(activeTab));

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

		
		drawTransformedArrows();

	} // drawArrow

	function ifValidDrawArrow() {
	    var mat = getDensityMatrix(activeTab)

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

	function computeMixed() {
		if (mixedValidityCheck()) {
			var states = [];
			var sliders = $('[class^="js-range-slider-mixed"]');

			sliders.each(function(i) {
				p = $(this).data("ionRangeSlider").result.from;
				states[i] = math.multiply(p, getDensityMatrix(i+1));
			});

			var mixedState = math.add(states[0], states[1]);
			mixedState = math.add(mixedState, states[2]);
			mixedState = math.add(mixedState, states[3]);

			var dir = getVector(mixedState);
			
		    // Switch z and y axis to compensate for computer graphics/physics
		    // difference quirks.
		    temp = dir.y;
		    dir.y = dir.z;
		    dir.z = temp;
		    dir.z = -1 * dir.z;
			
			var origin = new THREE.Vector3( 0, 0, 0 );
			var length = dir.length();

			var hex = '#551A8B';
			var arrow = new THREE.ArrowHelper( dir, origin, length, hex );

			scene.add( arrow );

			render();
		}
		else {
			errorModal('Error: Invalid probabilities', 'Make sure the probabilities add up to 1!');
		}
	}

	function gui() {
		$('a[id^="tab"]').on('shown.bs.tab', function(e){
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
					.append($("<h4>Wave function: </h4>"))
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


			$("#noise-select").on('change', updateBottomBlochSphere);

			$("#btn_show_state_" + i).on('click', ifValidDrawArrow);
			$("#btn_compute_mixed").on('click', computeMixed);
			$("#angle_" + i + "_2").on('change', updateTopSlider);
			$("#angle_" + i + "_1").on('change', updateTopSlider);


			
			// Initialize sliders
			createSliders(i);
		}

		makeNoiseTab();	
		addEventMixedSliders();	
	}

	function createSliders(i) {
		var $theta = $(".js-range-slider-" + i + "-1"),
		    $phi = $(".js-range-slider-" + i + "-2"),
		    $mixed = $(".js-range-slider-mixed-" + i),
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

		$mixed.ionRangeSlider({
		    type: "single",
		    grid: true,
		    min: 0,
		    max: 1,
		    from: 0,
		    step: 0.01,
		    from_fixed: true
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
			onChange: function (data) {
		       updateBottomBlochSphere();
		    },
			prettify: function (num) {
			  return sliceDecimals(1-num);
			}
		});	

		onNoiseSelectionChanged();
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

function addEventMixedSliders() {
	var sliders = $('[class^="js-range-slider-mixed"]');

	sliders.each(function(index) {
		var slider = $(this).data("ionRangeSlider");
		var self = $(this);

		slider.update({
			onChange: function(data) {
				var slidersActive = $("input[id^='check-active']:checked").length;
				var delta = -1;

				var otherSliders = $('[class^="js-range-slider-mixed"]');
				otherSliders = otherSliders.not(self[0])

				sliders.not(self[0]).each(function() {
					if( $(this).data("ionRangeSlider").options.from_fixed ) {
						otherSliders = otherSliders.not($(this));
					}
				})

				sliders.each(function() {
					delta += $(this).data("ionRangeSlider").result.from;
				})

				otherSliders.each(function() {
					var otherSlider = $(this).data("ionRangeSlider");
					var old_value = otherSlider.result.from;
					var new_value = old_value - delta/(otherSliders.length)

					if (new_value < 0 || data.from == 1) {
						new_value = 0
					}
					if (new_value > 1) {
						new_value = 1
					}

					otherSlider.update({
						from: new_value
					})
				})
			},
			onFinish: function(data) {
				var old_value = data.from;
				finalizeMixed(slider)
			}

		})
	})
}

function getDensityMatrix(i) {
	var a = math.complex($("#input_" + i + "_a").val());
	var b = math.complex($("#input_" + i + "_b").val());
	var c = math.complex($("#input_" + i + "_c").val());
	var d = math.complex($("#input_" + i + "_d").val());

	return [[a,b],[c,d]];
}

function mixedValidityCheck() {
	var sliders = $('[class^="js-range-slider-mixed"]');
	var total = 0;

	sliders.each(function() {
		total += $(this).data("ionRangeSlider").result.from;
	});


	if (+total.toFixed(2) != 1) {
		return false
	}

	return true
}

function errorModal(title, body) {
	$('#errorModal .modal-title').text(title);
	$('#errorModal .modal-body').text(body);
	$('#errorModal').modal();
}

function finalizeMixed(slider) {
	var sliders = $('[class^="js-range-slider-mixed"]');
	var total = 0;
	var old_value = slider.result.from;

	sliders.each(function() {
		total += $(this).data("ionRangeSlider").result.from;
	});

	if (+total.toFixed(2) != 1 && !slider.options.from_fixed) {
		slider.update({from: old_value + (1 - total)})
	}

	updateMixedGui();
}

function updateMixedGui() {
	var sliders = $('[class^="js-range-slider-mixed"]')
	var states = [];
	
	sliders.each(function(i) {
		states[i] = $(this).data("ionRangeSlider").result.from;
	})

	$('#mixedStateFunction').html("Wave function: &#936&#x2098 = <span class='state-1'>" + states[0] + 
		"</span>&#x00B7&#936&#x2081 + <span class='state-2'>" + states[1] + 
		"</span>&#x00B7&#936&#x2082 + <span class='state-3'>" + states[2] + 
		"</span>&#x00B7&#936&#x2083 + <span class='state-4'>" + states[3] + 
		"</span>&#x00B7&#936&#x2084"
	);
}

function checkActive(checkbox) {
	var checkId = checkbox.id.slice(-1);
	$('#check-lock-' + checkId).prop('checked', false);
	$(".js-range-slider-mixed-" + checkId).data("ionRangeSlider").update({from: 0, from_fixed: !checkbox.checked})
	$('#check-lock-' + checkId).prop('disabled', !checkbox.checked);

	var sliders = $('[class^="js-range-slider-mixed"]');

	sliders.each(function() {
		finalizeMixed($(this).data("ionRangeSlider"));
	})
}

function checkLock(checkbox) {
	var checkId = checkbox.id.slice(-1);
	$(".js-range-slider-mixed-" + checkId).data("ionRangeSlider").update({from_fixed: checkbox.checked})
}


function onNoiseSelectionChanged() {
	var x = document.getElementById("noise-select").value;
	var r = 1 - parseFloat(document.getElementById("noise_slider").value);
	var s_r = Math.sqrt(r);
	var s_emr = Math.sqrt(1-r);
	
	
	if (x == "D") { // depolarizing
	  document.getElementById("noise-equation-img").src = "img/noiseEq_D.png";
	  setNoiseMatrices([[s_r,0],[0,s_r]], [[0,0],[0,0]]);
	}
	if (x == "PhX") { // dephase x
	  document.getElementById("noise-equation-img").src = "img/noiseEq_PhX.png";
	  setNoiseMatrices([[s_r,0],[0,s_r]], [[0,s_emr],[s_emr,0]]);
	}
	if (x == "PhZ") { // dephase y
	  document.getElementById("noise-equation-img").src = "img/noiseEq_PhZ.png";
	  setNoiseMatrices([[s_r,0],[0,s_r]], [[s_emr,0],[0,-1*s_emr]]);
	}
	if (x == "A") { // amplitude damping
	  document.getElementById("noise-equation-img").src = "img/noiseEq_A.png";
	  setNoiseMatrices([[1,0],[0,s_r]], [[0,s_emr],[0,0]]);
	}
	if (x == "user") { // user defined function
	  ; // make slider disabled or smth!
	}
}


function setNoiseMatrices(E1, E2) {
    document.getElementById("input_noise_E1_a").value = sliceDecimals(E1[0][0]);
	document.getElementById("input_noise_E1_b").value = sliceDecimals(E1[0][1]);
	document.getElementById("input_noise_E1_c").value = sliceDecimals(E1[1][0]);
	document.getElementById("input_noise_E1_d").value = sliceDecimals(E1[1][1]);
	
    document.getElementById("input_noise_E2_a").value = sliceDecimals(E2[0][0]);
	document.getElementById("input_noise_E2_b").value = sliceDecimals(E2[0][1]);
	document.getElementById("input_noise_E2_c").value = sliceDecimals(E2[1][0]);
	document.getElementById("input_noise_E2_d").value = sliceDecimals(E2[1][1]);
} // setNoiseMatrices

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

	sizeXYZ = 0.1;
	sizeStates = 0.1;
	axes.add( buildAxisLabel( 'x', new THREE.Vector3( 1.1*length, 0, 0 ), colors[0], sizeXYZ) ); // +X
	axes.add( buildAxisLabel( '|+>', new THREE.Vector3( 1.01, 0.02, 0 ), 'white', sizeStates ) ); //|+>
	axes.add( buildAxisLabel( '|->', new THREE.Vector3( -1.2, 0.02, 0 ), 'white', sizeStates) ); //|->
	axes.add( buildAxisLabel( 'z', new THREE.Vector3( 0, 1.1*length, 0 ), colors[1], sizeXYZ) ); // +Z
	axes.add( buildAxisLabel( '|0>', new THREE.Vector3( 0.01, 1.1, 0 ), 'white', sizeStates ) ); //|+>
	axes.add( buildAxisLabel( '|1>', new THREE.Vector3( 0.01, -1.15, 0 ), 'white', sizeStates) ); //|->
	axes.add( buildAxisLabel( 'y', new THREE.Vector3( 0, 0, -1.1*length ), colors[2], sizeXYZ ) ); // +Y
	return axes;
}

function buildAxisLabel (text, pos, color, size) {
	var  textGeo = new THREE.TextGeometry(text, {
        size: size,
        height: 0.01,
        curveSegments: 50,
        font: "helvetiker",
        style: "normal"
    });

	var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
	var  text = new THREE.Mesh(textGeo , textMaterial);
	text.position.x = pos.x;
	text.position.y = pos.y;
	text.position.z = pos.z;
	//text.rotation = camera_top.rotation;
	return text;
}

function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 4, color: colorHex, dashSize: 0.1, gapSize: 0.1 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 4, color: colorHex, depthTest: false });
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
