// Complex i
var complexi = math.complex('i');

// Pauli matrices & gates
var gateX = [[0,1],[1,0]];
var gateY = [[0,math.complex('-i')],[math.complex('i'),0]];
var gateZ = [[1,0],[0,-1]];

// More gates
var gateH = math.multiply(1/math.sqrt(2),[[1,1],[1,-1]]);
var gateSWAP = [[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]];
var gateCNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];

// Standard states
var statePlus = math.multiply(1/math.sqrt(2),[[1],[1]]);
var stateMin = math.multiply(1/math.sqrt(2),[[1],[-1]]);
var stateOne = [[0],[1]];
var stateZero = [[1],[0]];
var stateY = [[math.sqrt(0.5)], [math.multiply(math.sqrt(0.5),complexi)]];
var stateY_min = [[math.sqrt(0.5)], [math.multiply(math.sqrt(0.5),math.complex('-i'))]];

// Standard density matrices
var maxMixed = [[0.5, 0],[0, 0.5]];
var identity = [[1,0],[0,1]];

/**
 * #getVector
 *
 * Computes vector representation of density matrix in Bloch Sphere
 * Returns three.vector with x,y,z coordinates
 * 
 * @param  {Density matrix}
 * @return {vector}
 */
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

/**
 * #getRealValue
 *
 * Returns real part of complex number
 * @param  {num}
 * @return {num}
 */
function getRealValue(num) {
      return math.complex(num).re;
}

// uses two noise matrices to compute new shape of Bloch sphere,
// returns two vectors, first is scaling of each axis, second is position of new center

/**
 * #computeNewBlochSphere
 *
 * Uses two noise matrices to compute new shape of Bloch sphere,
 * returns two vectors, first is scaling of each axis, second is position of new center
 * @param  {E1}
 * @param  {E2}
 * @return {[[scaleX, scaleY, scaleZ], center_X]}
 */
function computeNewBlochSphere(E1, E2) {

    // compute new positions of +/x,y,z
      var newX_p = getVector(channelNoise(stateToDens(statePlus),E1,E2));
      var newY_p = getVector(channelNoise(stateToDens(stateY),E1,E2));
      var newZ_p = getVector(channelNoise(stateToDens(stateZero),E1,E2));
      var newX_m = getVector(channelNoise(stateToDens(stateMin),E1,E2));
      var newY_m = getVector(channelNoise(stateToDens(stateY_min),E1,E2));
      var newZ_m = getVector(channelNoise(stateToDens(stateOne),E1,E2));
	

	// now compute center of ellipsoid in three different ways,
	// and check whether they give the same result
	var center_X = (newX_p.clone().add(newX_m)).divideScalar(2);
	var center_Y = (newY_p.clone().add(newY_m)).divideScalar(2);
	var center_Z = (newZ_p.clone().add(newZ_m)).divideScalar(2);
	

	// checks:
	var dif_XY = center_X.distanceTo(center_Y);
	var dif_XZ = center_X.distanceTo(center_Z);
	var dif_YZ = center_Y.distanceTo(center_Z);
	
	
	var newXAxis = newX_p.clone().sub(center_X);
	var newYAxis = newY_p.clone().sub(center_Y);
	var newZAxis = newZ_p.clone().sub(center_Z);
	
	var scaleX = newXAxis.x;
	var scaleY = newYAxis.y;
	var scaleZ = newZAxis.z;
	
	return [[scaleX, scaleY, scaleZ], center_X];
} // computeNewBlochSphere


// Returns trace of 2x2 matrix

/**
 * #trace
 *
 * Returns trace of 2x2 matrix
 * @param  {matrix}
 * @return {trace}
 */
function trace(matrix){
      return math.add(matrix[0][0],matrix[1][1]);
}

/**
 * getStateFromAngle
 *
 * Computes state of qubit from polar coordinates in BlochSphere
 * Returns vector with alpha and beta for qubit in normal basis
 * 
 * @param  {theta}
 * @param  {phi}
 * @return {[[alpha],[beta]]}
 */
function getStateFromAngle(theta, phi) {
      var alpha = math.cos(theta/2);
      var beta = math.multiply(math.sin(theta/2),math.exp(math.complex(0,phi)));
      return [[alpha],[beta]];
}

/**
 * #getEigenvalues
 *
 * Computes eigenvalues of 2x2 matrix
 * returns array of the 2 eigenvalues of 2x2 matrix
 * @param  {matrix}
 * @return {[lambda1, lambda2]}
 */
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

/**
 * #conjugateTranspose
 * 
 * Returns conjugate transpose of matrix
 * 
 * @param  {matrix}
 * @return {conjugate transposed matrix}
 */
function conjugateTranspose(matrix) {
      return math.conj(math.transpose(matrix));
}

/**
 * #stateToDens
 * 
 * Returns density matrix from qubit state
 * 
 * @param  {state}
 * @return {density matrix}
 */
function stateToDens(state) {
      return math.multiply(state, conjugateTranspose(state));
}

/**
 * #tensorProduct
 *
 * Returns tensorProduct of two states
 * 
 * @param  {state1}
 * @param  {state2}
 * @return {result}
 */
function tensorProduct(state1, state2) {
      return [math.multiply(state1[0],state2[0]),
            math.multiply(state1[0],state2[1]),
            math.multiply(state1[1],state2[0]),
            math.multiply(state1[1],state2[1])]
}

/**
 * #controlledGate
 *
 * Returns controlled version of specified gate
 * 
 * @param  {gate}
 * @return {controlled gate}
 */
function controlledGate(gate) {
      return [[1,0,0,0],[0,1,0,0],[0,0,gate[0][0],gate[0][1]],[0,0,gate[1][0],gate[1][1]]];
}

/**
 * #getPhaseShiftGate
 *
 * Returns phase shift gate with given angle shift
 * 
 * @param  {angle shift}
 * @return {phase shift gate}
 */
function getPhaseShiftGate(shift) {
      return [[1,0],[0,Math.exp(math.multiply(complexi,shift))]];
}

/**
 * #applyGateToState
 *
 * Applies gate to state, returns resulting state
 * 
 * @param  {state}
 * @param  {gate}
 * @return {state after gate}
 */
function applyGateToState(state, gate) {
      return math.multiply(gate,state);
}

/**
 * #applyGateToDensMat
 *
 * Applies gate to density matrix of state, returns resulting density matrix
 * 
 * @param  {density matrix}
 * @param  {gate}
 * @return {density matrix after gate}
 */
function applyGateToDensMat(densMatrix, gate) {
      return math.chain(gate).multiply(densMatrix).multiply(conjugateTranspose(gate)).done();
}

/**
 * #channelNoise
 *
 * Computes the transformation of the density matrix of a state when applying noise matrices E1 and E2
 * Returns resulting density matrix
 * 
 * @param  {density matrix}
 * @param  {E1}
 * @param  {E2}
 * @return {density matrix after noise}
 */
function channelNoise(densMatrix, E1, E2) {
      return math.add(math.chain(E1).multiply(densMatrix).multiply(conjugateTranspose(E1)).done(), 
            math.chain(E2).multiply(densMatrix).multiply(conjugateTranspose(E2)).done());
}

/**
 * #depolNoise
 *
 * Applies depolarization noise to density matrix with parameter r
 * 
 * @param  {density matrix}
 * @param  {r}
 * @return {density matrix after depol}
 */
function depolNoise(densMatrix, r) {
      return math.add(math.multiply(r,densMatrix), math.multiply((1-r),maxMixed));
}

/**
 * #dephaseNoiseX
 *
 * Applies dephasing noise with probability r for bit flip (X-gate) to density matrix
 * 
 * @param  {density matrix}
 * @param  {r}
 * @return {density matrix after dephase}
 */
function dephaseNoiseX(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(1-r),gateX);
      return channelNoise(densMatrix, E1, E2);
}

/**
 * #dephaseNoiseZ
 *
 * Applies dephasing noise with probability r for phase flip (Z-gate) to density matrix
 * @param  {density matrix}
 * @param  {r}
 * @return {density matrix after dephase}
 */
function dephaseNoiseZ(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(1-r),gateZ);
      return channelNoise(densMatrix, E1, E2);
}

/**
 * #ampDampNoise
 *
 * Applies amplitude damping noise with probability r to density matrix
 * 
 * @param  {density matrix}
 * @param  {r}
 * @return {density matrix after ampdamp}
 */
function ampDampNoise(densMatrix, r) {
      var a0 = math.add(stateToDens(stateZero), math.multiply(math.sqrt(r),stateToDens(stateOne)));
      var a1 = math.multiply(math.sqrt(1-r), math.multiply(stateZero,math.transpose(stateOne)));
      return channelNoise(densMatrix, a0, a1);;
}

/**
 * #isPure
 *
 * Checks if density matrix is pure
 * @param  {density matrix}
 * @return {Boolean}
 */
function isPure(densMatrix) {
      return math.round(trace(math.multiply(densMatrix, math.transpose(densMatrix)))) == 1;
}

/**
 * #isValidTrace
 *
 * Check if density matrix is valid: trace should be 1
 * 
 * @param  {density matrix}
 * @return {Boolean}
 */
function isValidTrace(densMatrix) {
      tr = math.complex(trace(densMatrix));
      if (tr.im >= 0.001) {
            return false;
      }
      return (tr.re).toFixed(2) == 1;
}

/**
 * #isValidHermitian
 *
 * Check if density matrix is valid: must be hermitian
 * 
 * @param  {density matrix}
 * @return {Boolean}
 */
function isValidHermitian(densMatrix) {
      return matrixEquals(densMatrix, conjugateTranspose(densMatrix));
}

/**
 * #isValidUnitary
 *
 * Check if unitary is valid
 * 
 * @param  {density matrix}
 * @return {Boolean}
 */
function isValidUnitary(densMatrix) {
      return matrixEquals(math.multiply(densMatrix, conjugateTranspose(densMatrix)),identity);
}

/**
 * #isValidEigenvalues
 *
 * Check if density matrix is valid: eigenvalues should be 0 < lambda < 1
 * @param  {density matrix}
 * @return {Boolean}
 */
function isValidEigenvalues(densMatrix) {
      eigval = getEigenvalues(densMatrix);
      if (eigval[0].im >= 0.001 || eigval[1].im >= 0.001) {
            return false;
      }
      return ((eigval[0].re <= 1) && (eigval[0].re >= 0) && (eigval[1].re <= 1) && (eigval[1].re >= 0));
}

/**
 * #isValidNoiseMatrices
 *
 * Check if noise matrices are valid: sum_j(EjEj') = identity
 * 
 * @param  {E1}
 * @param  {E2}
 * @return {Boolean}
 */
function isValidNoiseMatrices(E1, E2) {
      var mat = math.add(math.multiply(E1,conjugateTranspose(E1)), math.multiply(E2,conjugateTranspose(E2)));
      return matrixEquals(mat, identity);
}

/**
 * #isHamiltonianTrace
 *
 * Check if matrix is hamiltonian: trace == 0
 * 
 * @param  {matrix}
 * @return {Boolean}
 */
function isHamiltonianTrace(matrix) {
      return trace(matrix).toFixed(2) == 0;
}

/**
 * #getPadeApproxExp
 *
 * Computes Pade approximation for the exponent of a matrix
 * Returns resulting matrix
 * 
 * @param  {matrix}
 * @return {result}
 */
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

/**
 * #getUnitaryAtTime
 *
 * Computes unitary at given time for given Hamiltonian
 * Returns Pade approximation of resulting unitary
 * 
 * @param  {hamiltonian}
 * @param  {time}
 * @return {result}
 */
function getUnitaryAtTime(hamiltonian, time) {
      var mat = math.chain(math.complex("-i")).multiply(time).multiply(hamiltonian).done();
      return  getPadeApproxExp(mat);
}

/**
 * #makeMixedState
 *
 * Computes mixed state from four states with probabilities
 * 
 * @param  {densMat1}
 * @param  {prob1}
 * @param  {densMat2}
 * @param  {prob2}
 * @param  {densMat3}
 * @param  {prob3}
 * @param  {densMat4}
 * @param  {prob4}
 * @return {mixed state}
 */
function makeMixedState(densMat1, prob1, densMat2, prob2, densMat3, prob3, densMat4, prob4) {
      var state1 = math.multiply(prob1, densMat1);
      var state2 = math.multiply(prob2, densMat2);
      var state3 = math.multiply(prob3, densMat3);
      var state4 = math.multiply(prob4, densMat4); 

      var matrix = math.add(state1, state2);
      matrix = math.add(matrix, state3);
      matrix = math.add(matrix, state4);

      return matrix;
}

/**
 * #matrixEquals
 *
 * Returns matrix1 == matrix2
 * 
 * @param  {mat1}
 * @param  {mat2}
 * @return {Boolean}
 */
function matrixEquals(mat1, mat2) {
      mat1 = math.round(math.complex(mat1),2);
      mat2 = math.round(math.complex(mat2),2);
      return ((mat1[0][0].im == mat2[0][0].im) && 
              (mat1[1][0].im == mat2[1][0].im) && 
              (mat1[0][1].im == mat2[0][1].im) &&
              (mat1[1][1].im == mat2[1][1].im) &&
              (mat1[0][0].re == mat2[0][0].re) && 
              (mat1[1][0].re == mat2[1][0].re) && 
              (mat1[0][1].re == mat2[0][1].re) &&
              (mat1[1][1].re == mat2[1][1].re));
}

/**
 * #makePhaseGate
 *
 * Returns phaseGate, with phase phi
 * 
 * @param  {angle}
 * @return {matrix}
 */
function makePhaseGate(phi) {
      return [[1,0],[0, math.exp(math.multiply(complexi, phi))]];
}