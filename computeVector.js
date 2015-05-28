function getVector(a,b,c,d){

      var i = math.complex('i');

      var gateX = [[0,1],[1,0]];
      var gateY = [[0,math.multiply(-1,i)],[i,0]];
      var gateZ = [[1,0],[0,-1]];
      //var gateH = [[][]];

      var densMatrix = [[a,b],[c,d]];

      var xCoor = trace(math.multiply(densMatrix,gateX));
      var yCoor = trace(math.multiply(densMatrix,gateY));
      var zCoor = trace(math.multiply(densMatrix,gateZ));

      var vector = new THREE.Vector3( xCoor, yCoor, zCoor );
      //console.log(vector.x+" "+vector.y+" "+vector.z);
      return vector;
}

function trace(matrix){
      return math.add(matrix[0][0],matrix[1][1]);
}