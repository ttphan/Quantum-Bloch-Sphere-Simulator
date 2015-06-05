
var complexi = math.complex('i');
var gateX = [[0,1],[1,0]];
var gateY = [[0,math.complex('-i')],[math.complex('i'),0]];
var gateZ = [[1,0],[0,-1]];
var gateH = math.multiply(1/Math.sqrt(2),[[1,1],[1,-1]]);
var gateSWAP = [[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]];
var gateCNOT = [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]];
var statePlus = math.multiply(1/Math.sqrt(2),[[1],[1]]);
var stateMin = math.multiply(1/Math.sqrt(2),[[1],[-1]]);
var stateOne = [[0],[1]];
var stateZero = [[1],[0]];
var maxMixed = [[0.5, 0],[0, 0.5]];

function getVector(densMatrix){
      //var densMatrix = [[a,b],[c,d]];
      var xCoor = trace(math.multiply(densMatrix,gateX));
      var yCoor = trace(math.multiply(densMatrix,gateY));
      var zCoor = trace(math.multiply(densMatrix,gateZ));

      var vector = new THREE.Vector3( xCoor, yCoor, zCoor );
      return vector;
}

function trace(matrix){
      return math.add(matrix[0][0],matrix[1][1]);
}

function conjugateTranspose(matrix) {
      return math.conjugate(math.transpose(matrix));
}

function stateToDens(state) {
      //state = [a,b];
      return math.multiply(state,transpose(state));
}

function tensorProduct(state1,state2) {
      return [math.multiply(state1[0],state2[0]),
            math.multiply(state1[0],state2[1]),
            math.multiply(state1[1],state2[0]),
            math.multiply(state1[1],state2[1])]
}

function controlledGate(gate) {
      return [[1,0,0,0],[0,1,0,0],[0,0,gate[0][0],gate[0][1]],[0,0,gate[1][0],gate[1][1]]];
}

function getPhaseShiftGate(shift) {
      return [[1,0],[0,Math.exp(complexi*shift)]];
}

function applyGate(state,gate) {
      return math.multiply(gate,state);
}

function depolNoise(densMatrix, r) {
      return math.multiply(r,densMatrix) + math.multiply((1-r),maxMixed);
}

function dephaseNoiseX(densMatrix,r) {
      return math.multiply(r,densMatrix) 
            + math.multiply((1-r),math.multiply(math.multiply(gateX,densMatrix),gateX));
}

function dephaseNoiseZ(densMatrix,r) {
      return math.multiply(r,densMatrix) 
            + math.multiply((1-r),math.multiply(math.multiply(gateZ,densMatrix),gateZ));
}

function ampDampNoise(densMatrix,r) {
      a0 = stateToDens(stateZero) + math.multiply(Math.sqrt(r),stateToDens(stateOne));
      a1 = math.multiply(Math.sqrt(1-r), math.multiply(stateZero,stateOne.transpose()));
      return math.multiply(math.multiply(a0,densMatrix), math.conjugateTranspose(a0)) + 
            math.multiply(math.multiply(a1,densMatrix), math.conjugateTranspose(a1));
}

function isPure(densMatrix) {
      return trace(math.multiply(densMatrix, math.transpose(densMatrix))) == 1;
}