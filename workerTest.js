///
/*
  Workerオブジェクトを使うテスト.
  <workerTest.js>
*/
///

var testVal = 0;


onmessage = function (event) {
    // var OSVars  = event.deta;
    // console.log( OSVars.cons.delta );
    
    var workerVal = event.data;
    console.log( workerVal );

    testVal++;
    postMessage( testVal );
};