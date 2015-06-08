// Complex i
var complexi = math.complex('i');

// 
var gateX = [[0,1],[1,0]];
var gateY = [[0,math.complex('-i')],[math.complex('i'),0]];
var gateZ = [[1,0],[0,-1]];
var gateH = math.multiply(1/math.sqrt(2),[[1,1],[1,-1]]);
var gateSWAP = [[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]];
var gateCNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
var statePlus = math.multiply(1/math.sqrt(2),[[1],[1]]);
var stateMin = math.multiply(1/math.sqrt(2),[[1],[-1]]);
var stateOne = [[0],[1]];
var stateZero = [[1],[0]];
var stateY = [[math.sqrt(0.5)], [math.multiply(math.sqrt(0.5),complexi)]];
var stateY_min = [[math.sqrt(0.5)], [math.multiply(math.sqrt(0.5),math.complex('-i'))]];
var maxMixed = [[0.5, 0],[0, 0.5]];
var identity = [[1,0],[0,1]];

// Computes vector representation of density matrix in Bloch Sphere
// Returns three.vector with x,y,z coordinates
function getVector(densMatrix){

      // Compute projections of state onto all axes
      var xCoor = trace(math.multiply(densMatrix,gateX));
      var yCoor = trace(math.multiply(densMatrix,gateY));
      var zCoor = trace(math.multiply(densMatrix,gateZ));

      xCoor = getRealValue(xCoor);
      yCoor = getRealValue(yCoor);
      zCoor = getRealValue(zCoor);

      var vector = new THREE.Vector3( xCoor, yCoor, zCoor );
      return vector;
}

// returns real part of complex number
function getRealValue(num) {
      return math.complex(num).re;
}

function transformAxes(E1, E2) {
      var transX = getVector(channelNoise(stateToDens(statePlus),E1,E2));
      var transY = getVector(channelNoise(stateToDens(stateY),E1,E2));
      var transZ = getVector(channelNoise(stateToDens(stateZero),E1,E2));
      return [transX, transY, transZ];
}

// uses two noise matrices to compute new shape of Bloch sphere,
// returns two vectors, first is scaling of each axis, second is position of new center
function computeNewBlochSphere(E1, E2) {
	console.log("computeNewBlochSphere");

    // compute new positions of +/x,y,z
    var newX_p = getVector(channelNoise(stateToDens(statePlus),E1,E2));
    var newY_p = getVector(channelNoise(stateToDens(stateY),E1,E2));
    var newZ_p = getVector(channelNoise(stateToDens(stateZero),E1,E2));
	var newX_m = getVector(channelNoise(stateToDens(stateMin),E1,E2));
    var newY_m = getVector(channelNoise(stateToDens(stateY_min),E1,E2));
    var newZ_m = getVector(channelNoise(stateToDens(stateOne),E1,E2));
	
	console.log("len X_p: " + newX_p.length());
	console.log("len X_m: " + newX_m.length());
	console.log("len Y_p: " + newY_p.length());
	console.log("len Y_m: " + newY_m.length());
	console.log("len Z_p: " + newZ_p.length());
	console.log("len Z_m: " + newZ_m.length());
	
	// now compute center of ellipsoid in three different ways,
	// and check whether they give the same result
	var center_X = (newX_p.add(newX_m)).divideScalar(2);
	var center_Y = (newY_p.add(newY_m)).divideScalar(2);
	var center_Z = (newZ_p.add(newZ_m)).divideScalar(2);
	
	console.log("|center_x|: " + center_X.length());
	console.log("|center_y|: " + center_Y.length());
	console.log("|center_z|: " + center_Z.length());
	
	// checks:
	var dif_XY = center_X.distanceTo(center_Y);
	var dif_XZ = center_X.distanceTo(center_Z);
	var dif_YZ = center_Y.distanceTo(center_Z);
	
	console.log("diffs:");
	console.log("dif_XY: " + dif_XY);
	console.log("dif_XZ: " + dif_XZ);
	console.log("dif_YZ: " + dif_YZ);
} // computeNewBlochSphere

// Returns trace of 2x2 matrix
function trace(matrix){
      return math.add(matrix[0][0],matrix[1][1]);
}

// Computes state of qubit from polar coordinates in BlochSphere
// Returns vector with alpha and beta for qubit in normal basis
function getStateFromAngle(theta, phi) {
      var alpha = math.cos(theta/2);
      var beta = math.multiply(math.sin(theta/2),math.exp(math.complex(0,phi)));
      return [[alpha],[beta]];
}

// Computes eigenvalues of 2x2 matrix
// Returns array of the 2 eigenvalues of 2x2 matrix
function getEigenvalues(matrix) {
      a = matrix[0][0];
      b = matrix[0][1];
      c = matrix[1][0];
      d = matrix[1][1];
      partA = 1;
      partB = math.chain(a).add(d).multiply(-1).done();
      partC = math.subtract(math.multiply(a,d),math.multiply(c,d));
      partsqrt = math.chain(partC).multiply(partA).multiply(-4).add(math.pow(partB,2)).sqrt().done();
      lambda1 = math.chain(-1).multiply(partB).add(partsqrt).multiply(0.5).done();
      lambda2 = math.chain(-1).multiply(partB).subtract(partsqrt).multiply(0.5).done();
      return [lambda1, lambda2];
}

// Returns conjugate transpose of matrix
function conjugateTranspose(matrix) {
      return math.conj(math.transpose(matrix));
}

// Returns density matrix from qubit state
function stateToDens(state) {
      return math.multiply(state, conjugateTranspose(state));
}

// Returns tensorProduct of two states
function tensorProduct(state1, state2) {
      return [math.multiply(state1[0],state2[0]),
            math.multiply(state1[0],state2[1]),
            math.multiply(state1[1],state2[0]),
            math.multiply(state1[1],state2[1])]
}

// Returns controlled version of specified gate
function controlledGate(gate) {
      return [[1,0,0,0],[0,1,0,0],[0,0,gate[0][0],gate[0][1]],[0,0,gate[1][0],gate[1][1]]];
}

// Returns phase shift gate with given angle shift
function getPhaseShiftGate(shift) {
      return [[1,0],[0,Math.exp(math.multiply(complexi,shift))]];
}

// Applies gate to state
// Returns resulting state
function applyGateToState(state, gate) {
      return math.multiply(gate,state);
}

// Applies gate to density matrix of state
// Returns resulting density matrix
function applyGateToDensMat(densMatrix, gate) {
      return math.chain(gate).multiply(densMatrix).multiply(conjugateTranspose(gate));
}

// Computes the transformation of the density matrix of a state when applying noise matrices E1 and E2
// Returns resulting density matrix
function channelNoise(densMatrix, E1, E2) {
      return math.add(math.chain(E1).multiply(densMatrix).multiply(conjugateTranspose(E1)).done(), 
            math.chain(E2).multiply(densMatrix).multiply(conjugateTranspose(E2)).done());
}

// Applies depolarization noise to density matrix
function depolNoise(densMatrix, r) {
      return math.add(math.multiply(r,densMatrix), math.multiply((1-r),maxMixed));
}

// Applies dephasing noise (prob=r) for bitflip (x-gate) to density matrix
function dephaseNoiseX(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(r-1),gateX);
      return channelNoise(densMatrix, E1, E2);
}

// Applies dephasing noise (prob=r) for phase flip (z-gate) to density matrix
function dephaseNoiseZ(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(r-1),gateZ);
      return channelNoise(densMatrix, E1, E2);
}

// Applies amplitude damping noise (prob=r) to density matrix
function ampDampNoise(densMatrix, r) {
      var a0 = math.add(stateToDens(stateZero), math.multiply(math.sqrt(r),stateToDens(stateOne)));
      var a1 = math.multiply(math.sqrt(1-r), math.multiply(stateZero,math.transpose(stateOne)));
      return channelNoise(densMatrix, a0, a1);;
}

// Check if density matrix is pure
function isPure(densMatrix) {
      return math.round(trace(math.multiply(densMatrix, math.transpose(densMatrix)))) == 1;
}

// Check if density matrix is valid: trace should be 1
function isValidTrace(densMatrix) {
      return trace(densMatrix).toFixed(2) == 1;
}

// Check if density matrix is valid: must be hermitian
function isValidHermitian(densMatrix) {
      densMatrix = math.round(densMatrix);
      return matrixEquals(densMatrix, conjugateTranspose(densMatrix));
}

// Check if density matrix is valid: eigenvalues should be 0<lambda<1
function isValidEigenvalues(densMatrix) {
      eigval = getEigenvalues(densMatrix);
      console.log(eigval);
      return ((eigval[0] <= 1) && (eigval[0] >= 0) && (eigval[1] <= 1) && (eigval[1] >= 0));
}

// Check if noise matrices are valid: sum_j(EjEj')=identity
function isValidNoiseMatrices(E1, E2) {
      var mat = math.add(math.multiply(E1,conjugateTranspose(E1)), math.multiply(E2,conjugateTranspose(E2)));
      return matrixEquals(mat, identity);
}

// Check if matrix is hamiltonian: trace==0
function isHamiltonianTrace(matrix) {
      return trace(matrix).toFixed(2) == 0;
}

// Computes pade approximation for the exponent of a matrix
// Returns resulting matrix
function getPadeApproxExp(matrix) {
      var approx = 5;
      var factors = [1,2,9,72,1008,30240];
      var denom = 0;
      var num = 0;
      for (var i = 0; i <= approx; i++) {
            addterm = math.multiply(math.pow(matrix,i), 1/factors[i]);
            num = math.add(num, addterm);
            if (i % 2 == 0) {
                  denom = math.add(denom,addterm);
            } else {
                  denom = math.subtract(denom,addterm);
            }
      }
      return math.divide(num,denom);
}

// Computes unitary at given time for given hamiltonian
// Returns pade approximation of resulting unitary
function getUnitaryAtTime(hamiltonian, time) {
      var mat = math.chain(math.complex("-i")).multiply(time).multiply(hamiltonian).done();
      return  getPadeApproxExp(mat);
}

// Computes mixed state from four states with probabilities
function makeMixedState(densMat1, prob1, densMat2, prob2, densMat3, prob3, densMat4, prob4) {
      return math.chain(math.multiply(densMat1,prob1)).add(math.multiply(densMat2,prob2))
                  .add(math.multiply(densMat3,prob3)).add(math.multiply(densMat2,prob2)).done();
}

// Returns matrix1 == matrix2
function matrixEquals(mat1, mat2) {
      mat1 = math.round(math.complex(mat1),2);
      mat2 = math.round(math.complex(mat2),2);
      return ((mat1[0][0] == mat2[0][0]) && 
              (mat1[1][0] == mat2[1][0]) && 
              (mat1[0][1] == mat2[0][1]) &&
              (mat1[1][1] == mat2[1][1]));
}