var complexi = math.complex('i');
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
var maxMixed = [[0.5, 0],[0, 0.5]];
var identity = [[1,0],[0,1]];

function getVector(densMatrix){
      //var densMatrix = [[a,b],[c,d]];
      var xCoor = trace(math.multiply(densMatrix,gateX));
      var yCoor = trace(math.multiply(densMatrix,gateY));
      var zCoor = trace(math.multiply(densMatrix,gateZ));

      var vector = new THREE.Vector3( xCoor, yCoor, zCoor );
      return vector;
}

function transformAxes(E1, E2) {
      var transX = getVector(channelNoise(stateToDens(statePlus),E1,E2));
      var transY = getVector(channelNoise(stateToDens(stateY),E1,E2));;
      var transZ = getVector(channelNoise(stateToDens(stateZero),E1,E2));;
      return [transX, transY, transZ];
}

function trace(matrix){
      return math.add(matrix[0][0],matrix[1][1]);
}

function getStateFromAngle(theta, phi) {
      var alpha = math.cos(theta/2);
      var beta = math.multiply(math.sin(theta/2),math.exp(math.complex(0,phi)));
      return [[alpha],[beta]];
}

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

function conjugateTranspose(matrix) {
      return math.conj(math.transpose(matrix));
}

function stateToDens(state) {
      //state = [[state[0]],[state[1]]];
      return math.multiply(state, conjugateTranspose(state));
}

function tensorProduct(state1, state2) {
      return [math.multiply(state1[0],state2[0]),
            math.multiply(state1[0],state2[1]),
            math.multiply(state1[1],state2[0]),
            math.multiply(state1[1],state2[1])]
}

function controlledGate(gate) {
      return [[1,0,0,0],[0,1,0,0],[0,0,gate[0][0],gate[0][1]],[0,0,gate[1][0],gate[1][1]]];
}

function getPhaseShiftGate(shift) {
      return [[1,0],[0,Math.exp(math.multiply(complexi,shift))]];
}

function applyGateToState(state, gate) {
      return math.multiply(gate,state);
}

function applyGateToDensMat(densMatrix, gate) {
      return math.chain(gate).multiply(densMatrix).multiply(conjugateTranspose(gate));
}

function channelNoise(densMatrix, E1, E2) {
      return math.add(math.chain(E1).multiply(densMatrix).multiply(conjugateTranspose(E1)).done(), 
            math.chain(E2).multiply(densMatrix).multiply(conjugateTranspose(E2)).done());
}

function depolNoise(densMatrix, r) {
      return math.add(math.multiply(r,densMatrix), math.multiply((1-r),maxMixed));
}

function dephaseNoiseX(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(r-1),gateX);
      return channelNoise(densMatrix, E1, E2);
}

function dephaseNoiseZ(densMatrix, r) {
      var E1 = math.sqrt(r);
      var E2 = math.multiply(math.sqrt(r-1),gateZ);
      return channelNoise(densMatrix, E1, E2);
}

function ampDampNoise(densMatrix, r) {
      var a0 = math.add(stateToDens(stateZero), math.multiply(math.sqrt(r),stateToDens(stateOne)));
      var a1 = math.multiply(math.sqrt(1-r), math.multiply(stateZero,math.transpose(stateOne)));
      return channelNoise(densMatrix, a0, a1);;
}

function isPure(densMatrix) {
      return math.round(trace(math.multiply(densMatrix, math.transpose(densMatrix)))) == 1;
}

function isValidTrace(densMatrix) {
      return trace(densMatrix).toFixed(2) == 1;
}

function isValidHermitian(densMatrix) {
      densMatrix = math.round(densMatrix);
      return matrixEquals(densMatrix, conjugateTranspose(densMatrix));
}

function isValidEigenvalues(densMatrix) {
      eigval = getEigenvalues(densMatrix);
      console.log(eigval);
      return ((eigval[0] <= 1) && (eigval[0] >= 0) && (eigval[1] <= 1) && (eigval[1] >= 0));
}

function isHamiltonianTrace(matrix) {
      return trace(matrix) == 0;
}

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

function getUnitaryAtTime(hamiltonian, time) {
      var mat = math.chain(math.complex("-i")).multiply(time).multiply(hamiltonian).done();
      return  getPadeApproxExp(mat);
}

function makeMixedState(densMat1, prob1, densMat2, prob2) {
      return math.add(math.multiply(densMat1,prob1),math.multiply(densMat2,prob2));
}

function matrixEquals(mat1, mat2) {
      mat1=math.complex(mat1);
      mat2=math.complex(mat2);
      return ((mat1[0][0] == mat2[0][0]) && 
              (mat1[1][0] == mat2[1][0]) && 
              (mat1[0][1] == mat2[0][1]) &&
              (mat1[1][1] == mat2[1][1]));
}