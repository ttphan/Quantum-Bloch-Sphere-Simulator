$(document).ready(function() {
	var camera_top, controls, scene, renderer_top;

	var camera_bottom, scene_bottom, renderer_bottom;

	var activeTab = 1;
	var arrows = [null, null, null, null, null];
	
	var blochSphere_bottom; // the bottom Bloch sphere
	var transformed_arrows = [null, null, null, null, null];
	var transformed_ball = [null, null, null, null, null];
	var balls = [null, null, null, null, null];

	var transformation = [0.7, 1.3, 0.2];

	var mixedState;

	// Color values
	var sphereColor = 0x045FB4;
	var axesColors = [0xFA5858,0x01DF3A,0x2E64FE];
	var circleColors = [0xffffff, 0xD8D8D8];
	var tabColors = ['red', 'green', 'blue', 'yellow', 'white'];
	var canvasColor = 0x2E2E2E;

	// Geometry detail
	var sphereSegments = [30, 30];
	var circleSegments = 32;

	init();
	animate();
	gui();
	updateBottomBlochSphere( );

	/**
	 * #init
	 * 
	 * Initial THREE.js function
	 */
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

		scene_bottom.add(buildAxes(1.5, axesColors));

		// var circles_bottom = buildCircles(circleColors, transformation);
		// sceneCircles_bottom.add(circles_bottom);

		// blochSphere_bottom.add(circles_bottom);

		scene_bottom.add(blochSphere_bottom);
		
		render();
	}
	
	/**
	 * #animate
	 * 
	 * THREE.js animation
	 */
	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}

	/**
	 * #render
	 * 
	 * THREE.js render, renders both top and bottom canvases
	 */
	function render() {
		renderer_top.setClearColor( canvasColor, 1);
		renderer_top.clear();
		renderer_top.render(sceneCircles, camera_top);
		renderer_top.clearDepth();
		renderer_top.render(scene, camera_top);


		renderer_bottom.setClearColor( canvasColor, 1);
		renderer_bottom.clear();
		renderer_bottom.render(sceneCircles_bottom, camera_top);
		renderer_bottom.clearDepth();
		renderer_bottom.render(scene_bottom, camera_top);
	}

	/**
	 * #gui
	 *
	 * Dynamically constructs the majority of the GUI
	 */
	function gui() {
		$('a[id^="tab"]').on('shown.bs.tab', function(e){
		    var tab = $(e.target).attr('id');
		    activeTab = parseInt(tab.substring(tab.length-1));	
		});

		$('#bottom-tab3').on('shown.bs.tab', function(e){
		    resetBlochSphere();
		});
		
		for (var i = 1; i <= 4; i++) {
			$("#section" + i)
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
						.text("Show state in Bloch sphere")
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
									type: 'number',

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
									type: 'number',
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
		$("#noise-select").on('click', onNoiseSelectionChanged);
		$("#noise-select").on('click', updateBottomBlochSphere);
		$("#noise-update_button").on('click', onNoiseSelectionChanged);
		$("#noise-update_button").on('click', updateBottomBlochSphere);
		$("#gate-update_button").on('click', drawTransformedArrows);
		$("#btn_compute_mixed").on('click', computeMixed);
		$("#gate-select").on('change', drawTransformedArrows);
		$("#noise_r").on('change', updateNoiseSlider);
		$("#noise_slider").on('change', onNoiseSelectionChanged);
		$("#gate-select").on('change', onUnitarySelectionChanged);
		$("#angle_input").on('change', onUnitarySelectionChanged);
		$("#time_slider").on('change', onUnitarySelectionChanged);
		$("#time_t").on('change', updateTimeSlider);

		makeNoiseTab();	
		addEventMixedSliders();	
		onUnitarySelectionChanged();
	}

	/**
	 * #computeTransformedBlochSphere
	 * 
	 * Computes the new Bloch sphere after transformation by a
	 * quantum noise channel.
	 * Returns two vectors, first is scaling of each axis, 
	 * second is position of new center
	 * 
	 * @return {[[scaleX, scaleY, scaleZ], center_X]}
	 */
	function computeTransformedBlochSphere() {
	  var E1 = getE1();
	  var E2 = getE2();
	
	  // we check whether E1 and E2 are defined by user.
	  // if so, we check for validity
	  if ($("#noise-select").val() == "user" && !isValidNoiseMatrices(E1, E2)) {
		errorModal('Error: Invalid noise matrix!', "Sums of product of matrices and their complex conjugates don't add up to the identity!" );
	  	return;
	  } // if
	  return computeNewBlochSphere(getE1(), getE2());
	} // computeTransformedBlochSphere
	
	/**
	 * #updateBottomBlochSphere
	 * 
	 * Draws the bottom Bloch sphere at location center.
	 */
	function updateBottomBlochSphere( ) {
		var tmp = computeTransformedBlochSphere();
		var axes = tmp[0];
		var center = tmp[1];
		
		// Switch z and y axis to compensate for computer graphics/physics
		// difference quirks.
		var temp = center.y;
		center.y = center.z;
		center.z = temp;
		center.z = -1 * center.z;
		
		var temp = axes[1];
		axes[1] = axes[2];
		axes[2] = temp;
		
		var geometry = new THREE.SphereGeometry( 1, 16, 12 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( axes[0], axes[1], axes[2] ) );

		var sphereMaterialNoise = new THREE.MeshBasicMaterial( { 
			color: sphereColor, 
			transparent: true, 
			opacity: 0.25 
		});

		
		var newblochSphere_bottom = new THREE.Object3D();

		var sphere_bottom = new THREE.Mesh(geometry, sphereMaterialNoise);
		newblochSphere_bottom.add(sphere_bottom);

		//newblochSphere_bottom.add(buildAxes(1.5));

		var circles_bottom = buildCircles(circleColors, axes);
		// sceneCircles_bottom.add(circles_bottom)

		// newblochSphere_bottom.add(circles_bottom);
		
		newblochSphere_bottom.translateX(center.x);
		newblochSphere_bottom.translateY(center.y);
		newblochSphere_bottom.translateZ(center.z);

		// replace bottom Bloch sphere:
		scene_bottom.remove(blochSphere_bottom);
		blochSphere_bottom = newblochSphere_bottom;
		scene_bottom.add(newblochSphere_bottom);
		
		drawTransformedArrows();
	} // updateBottomBlochSphere

	/**
	 * #resetBlochSphere
	 *
	 * Resets the bottom Bloch sphere and transformation matrix
	 */
	function resetBlochSphere() {
		// Bloch sphere object
		var newBlochSphere = new THREE.Object3D();
				
		// sphere
		var sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
		var sphereMaterial = new THREE.MeshBasicMaterial( { 
			color: sphereColor, 
			transparent: true, 
			opacity: 0.25 
		});

		var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		newBlochSphere.add(sphere);

		// circle
		var circles = buildCircles(circleColors);
		newBlochSphere.add(circles)

		scene_bottom.remove(blochSphere_bottom)

		blochSphere_bottom = newBlochSphere;
		scene_bottom.add(newBlochSphere);

		$("#noise_slider").data("ionRangeSlider").update({from: 0})
		$("#input_noise_E1_a").val(1);
		$("#input_noise_E1_b").val(0);
		$("#input_noise_E1_c").val(0);
		$("#input_noise_E1_d").val(1);

		$("#input_noise_E2_a").val(0);
		$("#input_noise_E2_b").val(0);
		$("#input_noise_E2_c").val(0);
		$("#input_noise_E2_d").val(0);

		drawTransformedArrows();
	}

	/**
	 * #getE1
	 *
	 * Returns E1, gathers info from input fields
	 * @return {E1}
	 */
	function getE1() {
	  var E1 = [[0,0],[0,0]];
	  E1[0][0] = math.complex($("#input_noise_E1_a").val());
	  E1[0][1] = math.complex($("#input_noise_E1_b").val());
	  E1[1][0] = math.complex($("#input_noise_E1_c").val());
	  E1[1][1] = math.complex($("#input_noise_E1_d").val());
	  return E1
	} // getE1
	
	/**
	 * #getE2
	 *
	 * returns E2, gathers info from input fields
	 * 
	 * @return {E2}
	 */
	function getE2() {
	  var E2 = [[0,0],[0,0]];
	  E2[0][0] = math.complex($("#input_noise_E2_a").val());
	  E2[0][1] = math.complex($("#input_noise_E2_b").val());
	  E2[1][0] = math.complex($("#input_noise_E2_c").val());
	  E2[1][1] = math.complex($("#input_noise_E2_d").val());
	  return E2
	} // getE2


	/**
	 * #drawTransformedArrows
	 * 
	 * Draws all vector arrows after transformation in bottom Bloch sphere
	 */
	function drawTransformedArrows() {
		var tab3isActive = $('.active').find('#bottom-tab3').length > 0;
		// first get noise matrices E1 and E2
		var E1 = getE1();
		var E2 = getE2();
		var unitary = getUnitary();
			  
		// get density matrices of all active arrows
		for (var i = 1; i <= arrows.length; i++) {
		    if (arrows[i-1] != null) {
		    	if (i < 5) {
		    		var matrix = getDensityMatrix(i);

					var a = matrix[0][0];
					var b = matrix[0][1];
					var c = matrix[1][0];
					var d = matrix[1][1];
				}
				else {
					var a = mixedState[0][0];
					var b = mixedState[0][1];
					var c = mixedState[1][0];
					var d = mixedState[1][1];
				}
				
				var transformed_densityMat = channelNoise([[a,b],[c,d]],E1,E2);

				if (tab3isActive) {
				    transformed_densityMat = applyGateToDensMat([[a,b],[c,d]], unitary);
				}

				var dir = getVector(transformed_densityMat);
				
				// Switch z and y axis to compensate for computer graphics/physics
				// difference quirks.
				var temp = dir.y;
				dir.y = dir.z;
				dir.z = temp;
				dir.z = -1 * dir.z;
				
				var origin = computeNewBlochSphere(E1, E2)[1];
				temp = origin.y;
				origin.y = origin.z;
				origin.z = temp;
				origin.z = -1 * origin.z;
				
				var length = dir.length();
				var hex = tabColors[i-1];
				
				//
				// creating the line:
				//
				var arrow = getArrow(origin, dir, hex);

				if (transformed_arrows[i-1] != null) {
					scene_bottom.remove(transformed_arrows[i-1]);
				} // if
				transformed_arrows[i-1] = arrow;
				scene_bottom.add(arrow);
				
				// Also add sphere at end of arrow:
				var ball = getBall(dir, hex);
				
				if (transformed_ball[i-1] != null) {
					scene_bottom.remove(transformed_ball[i-1]);
				} // if

				transformed_ball[i-1] = ball;	
				scene_bottom.add(ball);

			} // if
		} // for
		render();
	} // drawTransformedArrows

	/**
	 * #drawArrow
	 *
	 * Draws state vector arrow of the current active tab in the Bloch sphere. 
	 * If a 3-vector is given as parameter, that vector will be drawn instead.
	 * 
	 * @param  {[x, y, z]}
	 */
	function drawArrow(vector) {
		var index = activeTab - 1;
		var dir = getVector(getDensityMatrix(activeTab));

		if (vector !== undefined) {
			dir = vector;
			index = 4
		} 

	    // Switch z and y axis to compensate for computer graphics/physics
	    // difference quirks.
	    temp = dir.y;
	    dir.y = dir.z;
	    dir.z = temp;
	    dir.z = -1 * dir.z;
		
		var origin = new THREE.Vector3( 0, 0, 0 );
		var length = dir.length();
		var hex = tabColors[index];



		// var arrow = new THREE.ArrowHelper( dir, origin, length, hex );
		var arrow = getArrow( origin, dir, hex );


		if (arrows[index] != null) {
			scene.remove(arrows[index]);
		}

		arrows[index] = arrow;
		scene.add( arrow );





    var ball = getBall(dir, hex);
    if (balls[index-1] != null) scene.remove(balls[index-1]);
    balls[index-1] = ball;
    scene.add(ball);






		
		drawTransformedArrows();

	} // drawArrow

	/**
	 * #ifValidDrawArrow
	 * 
	 * Checks if the density matrix of the current active tab is a valid density
	 * matrix. If true, call drawArrow, if not display error.}
	 */
	function ifValidDrawArrow() {
	    var mat = getDensityMatrix(activeTab)

		if (!isValidTrace(mat) || !isValidHermitian(mat)) {// || !isValidEigenvalues(mat)) {
			errorModal("Error: Invalid state", "This density matrix does not represent a valid state!");
		} else {
			drawArrow();
		}
	}

	/**
	 * #updateTopSlider
	 *
	 * Updates the slider in the top div
	 */
	function updateTopSlider() {
		var textId = this.id.slice(-1);
		var degr = parseFloat(this.value);

		if (degr > 180*textId) {
			this.value = 180*textId;	
		} else if (degr < 0) {
			this.value = 0.00;	
		}

		$('.js-range-slider-1-' + textId).data("ionRangeSlider").update({from: this.value});
		updateStateGui(activeTab);
	}


	/**
	 * #computeMixed
	 *
	 * Computes the mixed state and draws associated state vector arrow.
	 * If the probabilities don't add up to 1, display error.
	 */
	function computeMixed() {
		if (mixedValidityCheck()) {
			var p = [];
			var densMats = [];
			var sliders = $('[class^="js-range-slider-mixed"]');

			sliders.each(function(i) {
				p[i] = $(this).data("ionRangeSlider").result.from;
				densMats[i] = getDensityMatrix(i+1);
			});

			mixedState = makeMixedState(densMats[0], p[0], densMats[1], p[1], densMats[2], p[2], densMats[3], p[3]);
			drawArrow(getVector(mixedState));
		}
		else {
			errorModal('Error: Invalid probabilities', 'Make sure the probabilities of the mixed state wave function add up to 1!');
		}
	}

	/**
	 * #createSliders
	 * 
	 * Creates the sliders in the top div and mixed tabs.
	 * @param  {i: index}
	 */
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

	/**
	 * #makeNoiseTab
	 *
	 * Constructs the noise channel tab
	 */
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


	/**
	 * #updateStateGui
	 *
	 * Updates the state GUI of the top div and draws the quantum state arrow
	 */
	function updateStateGui(i) {
		var $theta = $(".js-range-slider-" + i + "-1"),
		    $phi = $(".js-range-slider-" + i + "-2");

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

		// If there are any active mixed state sliders
		if ($("input[id^='check-active']:checked").length > 1) {
			computeMixed();
		}
	}


	/**
	 * #addEventMixedSliders
	 *
	 * Sets up the connection between the mixed sliders
	 */
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
					finalizeMixed(slider);
					computeMixed();
				}

			})
		})
	}

	/**
	 * #onNoiseSelectionChanged
	 *
	 * Handles the noise selection dropdown events
	 */
	function onNoiseSelectionChanged() {
		$("#noise_r").val(1 - $("#noise_slider").val());

		var x = $("#noise-select").val();
		var r = 1 - parseFloat($("#noise_slider").val());
		var s_r = Math.sqrt(r);
		var s_emr = Math.sqrt(1-r);

		$("#noise-equation-img").removeClass("invisible");
		$("#noise-update_button").addClass("invisible");
		$('#input_noise_E1_a').prop('disabled', true);
		$('#input_noise_E1_b').prop('disabled', true);
		$('#input_noise_E1_c').prop('disabled', true);
		$('#input_noise_E1_d').prop('disabled', true);
		$('#input_noise_E2_a').prop('disabled', true);
		$('#input_noise_E2_b').prop('disabled', true);
		$('#input_noise_E2_c').prop('disabled', true);
		$('#input_noise_E2_d').prop('disabled', true);
		
		
		if (x == "D") { // depolarizing
		  $("#noise-equation-img").attr('src', "img/noiseEq_D.png");
		  setNoiseMatrices([[s_r,0],[0,s_r]], [[0,0],[0,0]]);
		}
		else if (x == "PhX") { // dephase x
		  $("#noise-equation-img").attr('src', "img/noiseEq_PhX.png");
		  setNoiseMatrices([[s_r,0],[0,s_r]], [[0,s_emr],[s_emr,0]]);
		}
		else if (x == "PhZ") { // dephase y
		  $("#noise-equation-img").attr('src', "img/noiseEq_PhZ.png");
		  setNoiseMatrices([[s_r,0],[0,s_r]], [[s_emr,0],[0,-1*s_emr]]);
		}
		else if (x == "A") { // amplitude damping
		  $("#noise-equation-img").attr('src', "img/noiseEq_A.png");
		  setNoiseMatrices([[1,0],[0,s_r]], [[0,s_emr],[0,0]]);
		}
		else if (x == "user") { // user defined function
		  $("#noise-update_button").removeClass("invisible");
		  $("#noise-equation-img").addClass("invisible");
		  $('#input_noise_E1_a').prop('disabled', false);
		  $('#input_noise_E1_b').prop('disabled', false);
		  $('#input_noise_E1_c').prop('disabled', false);
		  $('#input_noise_E1_d').prop('disabled', false);
		  $('#input_noise_E2_a').prop('disabled', false);
		  $('#input_noise_E2_b').prop('disabled', false);
		  $('#input_noise_E2_c').prop('disabled', false);
		  $('#input_noise_E2_d').prop('disabled', false);
		} // if
	}

	function onUnitarySelectionChanged() {
		$("#angle-for-uni").addClass('invisible');

		var gate = $("#gate-select").val();
		var state = $("#state-select").val();
		
		if (gate == "hamil") { // user defined function
		  	$("#hamiltonian").removeClass("invisible");
		  	$("#timeslider").removeClass("invisible");
		  	$(".js-range-slider-unitary").ionRangeSlider({
		  	    type: "single",
		  	    grid: true,
		  	    min: 0,
		  	    max: 100,
		  	    from: 0,
		  	    step: 0.01,
		  		onChange: function (data) {
		  			$('#time_t').val(data.from);
		  	       	drawTransformedArrows();
		  	    },
		  		prettify: function (num) {
		  		  return sliceDecimals(num);
		  		}
		  	});	

		  	var time = parseFloat($("#time_slider").val());
		  	var hamiltonian = getHamiltonian();
			setUnitaryMatrix(getUnitaryAtTime(hamiltonian,time));
			$("#time_t").val($("#time_slider").val());
			drawTransformedArrows();

		}
		else {	
			// Destroy unitary slider if it exists
			var unitarySlider = $(".js-range-slider-unitary").data("ionRangeSlider");
			unitarySlider && unitarySlider.destroy();

			$("#hamiltonian").addClass("invisible");
			$("#timeslider").addClass("invisible");	


			if (gate == "X") { // // Pauli-X
			  	setUnitaryMatrix(gateX);
			}
			else if (gate == "Y") { // // Pauli-Y
			  	setUnitaryMatrix(gateY);
			}
			else if (gate == "Z") { // Pauli-Z
			  	setUnitaryMatrix(gateZ);
			}
			else if (gate == "H") { // Hadamard
			  	setUnitaryMatrix(gateH);
			}
			else if (gate == "R") {
				var angle = parseFloat($("#angle_input").val());
				if (angle > 2) {
					$("#angle_input").val(2);
				} else if (angle < 0) {
					$("#angle_input").val(0);
				}
				var gateR = makePhaseGate(angle*Math.PI);
				setUnitaryMatrix(gateR);
				$("#angle-for-uni").removeClass("invisible");
			}
		}
		if (gate == "user") { // Hadamard	  	
			$("#gate-update_button").removeClass("invisible");
		  	$('#input_gate_a').prop('disabled', false);
		  	$('#input_gate_b').prop('disabled', false);
		  	$('#input_gate_c').prop('disabled', false);
		  	$('#input_gate_d').prop('disabled', false);
		} else {
			$('#input_gate_a').prop('disabled', true);
			$('#input_gate_b').prop('disabled', true);
			$('#input_gate_c').prop('disabled', true);
			$('#input_gate_d').prop('disabled', true);
		}	
	}

	/**
	 * #updateNoiseSlider
	 *
	 * Updates the slider in the noise tab
	 */
	function updateNoiseSlider() {
		var r = 1-this.value;
		if (r < 0) {
			r=0;
		} else if (r>1) {
			r=1;
		}
		$('.js-range-slider-noise').data("ionRangeSlider").update({from: r});
		onNoiseSelectionChanged();
	}

	/**
	 * #updateTimeSlider
	 *
	 * Updates the slider in the unitary tab
	 */
	function updateTimeSlider() {
		var t = this.value;
		if (t < 0) {
			t=0;
		} else if (t>100) {
			t=100;
		}
		$('#time_slider').data("ionRangeSlider").update({from: parseFloat($("#time_t").val())})
		onUnitarySelectionChanged();
	}
});
	

/**
 * #getDensityMatrix
 *
 * Gets the density matrix of state i and returns it in a 2x2 matrix
 * @param  {i: The state id}
 * @return {[a,b, [c,d]]}
 */
function getDensityMatrix(i) {
	var a = math.complex($("#input_" + i + "_a").val());
	var b = math.complex($("#input_" + i + "_b").val());
	var c = math.complex($("#input_" + i + "_c").val());
	var d = math.complex($("#input_" + i + "_d").val());

	return [[a,b],[c,d]];
}

/**
 * #mixedValidityCheck
 *
 * Check if the mixed state is valid and returns the result
 * @return {boolean}
 */
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

/**
 * #errorModal
 *
 * Generic error modal to be displayed upon error or other alerts
 * @param  {title}
 * @param  {body}
 */
function errorModal(title, body) {
	$('#errorModal .modal-title').text(title);
	$('#errorModal .modal-body').text(body);
	$('#errorModal').modal();
}

/**
 * #finalizeMixed
 *
 * Takes care of rounding error in the mixed sliders
 * @param  {slider}
 */
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

/**
 * #updateMixedGui
 *
 * Updates the mixed state tab GUI
 */
function updateMixedGui() {
	var sliders = $('[class^="js-range-slider-mixed"]')
	var states = [];
	
	sliders.each(function(i) {
		states[i] = $(this).data("ionRangeSlider").result.from;
	})

	$('#mixedStateFunction').html("Wave function: &#936 = <span class='state-1'>" + states[0] + 
		"</span>&#x00B7&#936&#x2081 + <span class='state-2'>" + states[1] + 
		"</span>&#x00B7&#936&#x2082 + <span class='state-3'>" + states[2] + 
		"</span>&#x00B7&#936&#x2083 + <span class='state-4'>" + states[3] + 
		"</span>&#x00B7&#936&#x2084"
	);
}

/**
 * #checkActive
 * 
 * Handles the active checkbox events
 * @param  {checkbox}
 */
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

/**
 * #checkActive
 * 
 * Handles the probability lock checkbox events
 * @param  {checkbox}
 */
function checkLock(checkbox) {
	var checkId = checkbox.id.slice(-1);
	$(".js-range-slider-mixed-" + checkId).data("ionRangeSlider").update({from_fixed: checkbox.checked})
}

/**
 * #getUnitary
 *
 * Returns Unitary, gathers info from input fields
 * @return {Unitary}
 */
function getUnitary() {
	var gate = [[0,0],[0,0]];
	gate[0][0] = math.complex($("#input_gate_a").val());
	gate[0][1] = math.complex($("#input_gate_b").val());
	gate[1][0] = math.complex($("#input_gate_c").val());
	gate[1][1] = math.complex($("#input_gate_d").val());
	return gate;
} // getUnitary

/**
 * #getHamiltonian
 *
 * Returns hamiltonian, gathers info from input fields
 * @return {hamiltonian}
 */
function getHamiltonian() {
	var hamil = [[0,0],[0,0]];
	hamil[0][0] = math.complex($("#input_hamil_a").val());
	hamil[0][1] = math.complex($("#input_hamil_b").val());
	hamil[1][0] = math.complex($("#input_hamil_c").val());
	hamil[1][1] = math.complex($("#input_hamil_d").val());
	return hamil;
} // getHamiltonian

/**
 * #setUnitaryMatrix
 *
 * Displays the noise matrices E1 and E2
 * @param {E1}
 * @param {E2}
 */
function setUnitaryMatrix(U) {
    $("#input_gate_a").val(sliceDecimals(U[0][0]));
	$("#input_gate_b").val(sliceDecimals(U[0][1]));
	$("#input_gate_c").val(sliceDecimals(U[1][0]));
	$("#input_gate_d").val(sliceDecimals(U[1][1]));
} // setUnitaryMatrix

/**
 * #setNoiseMatrices
 *
 * Displays the noise matrices E1 and E2
 * @param {E1}
 * @param {E2}
 */
function setNoiseMatrices(E1, E2) {
    $("#input_noise_E1_a").val(sliceDecimals(E1[0][0]));
	$("#input_noise_E1_b").val(sliceDecimals(E1[0][1]));
	$("#input_noise_E1_c").val(sliceDecimals(E1[1][0]));
	$("#input_noise_E1_d").val(sliceDecimals(E1[1][1]));
	
    $("#input_noise_E2_a").val(sliceDecimals(E2[0][0]));
	$("#input_noise_E2_b").val(sliceDecimals(E2[0][1]));
	$("#input_noise_E2_c").val(sliceDecimals(E2[1][0]));
	$("#input_noise_E2_d").val(sliceDecimals(E2[1][1]));
} // setNoiseMatrices

/**
 * #sliceDecimals
 *
 * Rounds numbers to 2 decimals, capable of handling complex objects
 * @param  {number: real or complex}
 * @return {result: real or complex}
 */
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

/**
 * #buildAxes
 * 
 * Constructs and returns the 3 axes for the Bloch sphere
 * 
 * @param  {length}
 * @param  {colors}
 * @return {axes}
 */
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
	axes.add( buildAxisLabel( 'z', new THREE.Vector3( 0, 1.1 * length, 0 ), colors[1], sizeXYZ) ); // +Z
	axes.add( buildAxisLabel( '|0>', new THREE.Vector3( 0.01, 1.1, 0 ), 'white', sizeStates ) ); //|+>
	axes.add( buildAxisLabel( '|1>', new THREE.Vector3( 0.01, -1.15, 0 ), 'white', sizeStates) ); //|->
	axes.add( buildAxisLabel( 'y', new THREE.Vector3( 0, 0, -1.1*length ), colors[2], sizeXYZ ) ); // +Y
	axes.add( buildAxisLabel( '|-i>', new THREE.Vector3( 0, 0.01, 1.2 ), 'white', sizeStates ) ); //|+>
	axes.add( buildAxisLabel( '|i>', new THREE.Vector3( 0, 0.01, -1.2 ), 'white', sizeStates) ); //|->
	return axes;
}

/**
 * #buildAxisLabel
 *
 * Creates the label for the Bloch sphere axis
 * @param  {text}
 * @param  {position}
 * @param  {color}
 * @param  {size}
 * @return {text: THREE.js object}
 */
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

/**
 * #buildAxis
 *
 * Builds axis from source to destination with a specific color and dashed if specified.
 * 
 * @param  {source}
 * @param  {destination}
 * @param  {colorHex}
 * @param  {dashed: boolean}
 * @return {axis}
 */
function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 0.1, gapSize: 0.1 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex, depthTest: false });
	}

	geom.vertices.push( src.clone() );
	geom.vertices.push( dst.clone() );
	geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

	var axis = new THREE.Line( geom, mat, THREE.LinePieces );

	return axis;
}

function getArrow(origin, dir, hex) {
	// var geometry = new THREE.Geometry();

  // console.log(origin, dir);

	// geometry.vertices.push(origin); // start
	// geometry.vertices.push(dir); // end
	
	// var material = new THREE.LineBasicMaterial({color: hex, linewidth: 2});
	// return new THREE.Line(geometry, material);



	// var geometry = new THREE.CylinderGeometry();
	// var material = new THREE.LineBasicMaterial({color: hex, linewidth: 2});
	// return new THREE.Mesh(geometry, material);

  // TODO: upgrade three.js to use CatmullRomCurve3 for vecotr arrows with thickness https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
  // const path = THREE.CatmullRomCurve3([origin, dir]);
  const path = new THREE.LineCurve3(origin, dir);
  const geometry = new THREE.TubeGeometry( path, 20, .01, 8, true);
  const material = new THREE.MeshBasicMaterial( { color: hex } );
  return new THREE.Mesh( geometry, material );
}

function getBall(dir, hex) {
	var geometry2 = new THREE.SphereGeometry( 0.05, 16, 12 );
	var sphereMaterial = new THREE.MeshBasicMaterial({color: hex});
	var ball = new THREE.Mesh(geometry2, sphereMaterial);
	ball.translateX(dir.x);
	ball.translateY(dir.y);
	ball.translateZ(dir.z);
	return ball;
}

/**
 * #buildCircles
 *
 * Creates guiding circles in Bloch spheres. If a vector is supplied, the vector will be used to transform
 * the circles.
 * 
 * @param  {colors}
 * @param  {vector}
 * @return {circles}
 */
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

/**
 * #buildCircle
 *
 * Builds the circle with the specified radius, amount of segments, rotation angle and color. If a vector is
 * supplied, the vector will be used to transform the circle.
 * 
 * @param  {radius}
 * @param  {segments}
 * @param  {rotation}
 * @param  {vector}
 * @param  {colors}
 * @return {circle}
 */
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
			opacity: 0.2,
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
