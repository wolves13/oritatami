/*
  OS-simulator動作前に
  formオブジェクトから値を取得して, 
  設定を行うためのスクリプト.
  <formControl.js>
*/


// 読み込み完了時にイベントハンドラを登録.
window.onload = function () {
    document.forms.onsubmit = firstNextPushed;
};


var changeColor = function (elm, color) {
    elm.style.backgroundColor = color;
};

var btn_onclick = function () {

    var result = [];
    var list = document.getElementsByTagName('input');
    var i;

    for(i=0; i < list.length; i++){
	result.push( list.item(i).value );
    }
    window.alert( result.join('\n'));
    
    return false;
};

var firstNextPushed = function () {
    var i;
    var d = document.forms.delay;
    var a = document.forms.arity;   // ラジオボタンの配列
    var wl = document.forms.wordLength;
    var arity, delay;

    if ( d.value !== null  &&  d.value !== '' ){
	if ( isNaN( d.value ) ){

	    alert('Delay must be natural number.' );
	    d.value = d.defaultValue;
	    d.focus();
	    d.select();
	    return false;
	}
    }
    delay = d.value;

    for (i=0; i < a.length; i++) {
	if ( a[i].checked ){
	    // Arityを選択された値にセットする.
	    arity = a[i].value;
	    break;
	}
    }
    if (arity === undefined){
	alert('Pleae select arity.');
	return false;
    }

    if ( wl.value !== null  &&  wl.value !== '' ){
	if ( isNaN( wl.value ) ){

	    alert('Word length must be natural number.' );
	    wl.value = wl.defaultValue;
	    wl.focus();
	    wl.select();
	    return false;
	}
    }

    // simulator へ反映
    init_a_d( {a: arity, d: delay} );
    OSVars.cons.len = parseInt( wl.value, 10 );

    // 次の設定画面を生成する.
    return secondSettings(arity, delay);
};

var secondSettings = function (arity, delay) {

    var fm = document.forms;
    var firstSettingDiv = document.getElementById('firstSettingDiv');
    var secondSettingDiv = document.getElementById('secondSettingDiv');    
    var beadTypes = fm.beadTypes;
    var indexEqualBeadtype = fm.indexEqualBeadtype;
    var word = fm.word;

    // 以前のinput要素は, 設定を表示するだけの行へ置換する.
    var checkBoxLabel = indexEqualBeadtype.parentNode;   

    firstSettingDiv.removeChild( checkBoxLabel );          // Node 削除

    var arityDiv = document.getElementById('arityDiv');
    var newDiv = document.createElement('div');
    newDiv.innerHTML = 'Arity : ' + arity;
    firstSettingDiv.replaceChild( newDiv, arityDiv );


    var delayLabel = fm.delay.parentNode;
    delayLabel.removeChild( fm.delay );
    delayLabel.innerHTML  = 'Delay : ' + delay;

    var wordLen = fm.wordLength.value;
    var wordLenLabel = fm.wordLength.parentNode;
    wordLenLabel.removeChild( fm.wordLength );
    wordLenLabel.innerHTML = 'Word Length : ' + wordLen;

    // SecondSettingDiv を可視化.
    // checkされていたら, 自動的に(beadtypes, wordの)内容を反映する
    if (  indexEqualBeadtype.checked  ) {
	// beadTypes.disabled = true;
	word.disabled = true;
	// beadTypes.value = wordLen;
	word.innerHTML = '0-' + wordLen;

	OSVars.mode.indexEqualBeadtype = true;
    } 
    secondSettingDiv.style.visibility = "visible";
    secondSettingDiv.style.backgroundColor = "lightblue";
    firstSettingDiv.style.backgroundColor = "white";

    var nextBtnMsgDiv = document.getElementById('btnMsg');
    nextBtnMsgDiv.innerHTML = '(Seed)';
    
    fm.onsubmit = secondNextPushed;
    return false;
};

var secondNextPushed = function () {
    var fm = document.forms;
    var beadTypeNum = fm.beadTypes.value;
    var word = fm.word.innerHTML;
    
    // (Number of bead types), (word)  のcheck.
    //
    //
    // まずは自動で補完されるバージョンを扱うので, 後で実装する.
    //
    //
    //
    
    // word を OS-simulator へ反映する.
    initWord( word );
    
    return thirdSettings( beadTypeNum );
};


var thirdSettings = function ( beadTypeNum ) {

    console.log('beadTypeNum : ' + beadTypeNum );

    var secondSettingDiv = document.getElementById('secondSettingDiv');
    var fm = document.forms;
    
    // Seedの設定画面を生成.
    var beadtypeString = "Number of bead types :" + beadTypeNum ;
    var wordString =     "Word ( bead type array ) : <br>" ;
    secondSettingDiv.innerHTML = beadtypeString + '<br><br>' + wordString + OSVars.word.toString() ;
    secondSettingDiv.style.backgroundColor = "white";

    OSVars.cons.beadTypeNum = parseInt( beadTypeNum, 10 );
    setRuleset();

    // SeedType( [T,F5,F9]*[1,2,3,4] )を選択するラジオボタンを追加
    // 左側の分子3つの並び, 上の4つの並びをそれぞれ1ずつ選択させる.    
    var TFDiv = document.createElement('div');
    TFDiv.innerHTML = "Seed Type <br>  <label><input type='radio' name='TF' value='T'> T <\label> <br> <label><input type='radio' name='TF' value='F5'> F5 <\label> <br> <label><input type='radio' name='TF' value='F9'> F9 <\label> <br>";
    TFDiv.style.backgroundColor = "lightblue";
    TFDiv.style.visibility = 'hidden';
    fm.appendChild( TFDiv );

    var upperInputDiv = document.createElement('div');
    upperInputDiv.innerHTML = "Upper Input <br>  <label><input type='radio' name='upperInput' value=''> T <\label> <br> <label><input type='radio' name='TF' value='F5'> F5 <\label> <br> <label><input type='radio' name='TF' value='F9'> F9 <\label> <br>";

    
    var gridCanvas = document.getElementById('gridCanvas');
    var overCanvas = document.getElementById('overCanvas');
    gridCanvas.style.visibility = 'visible';
    overCanvas.style.visibility = 'visible';

    var dElm = document.documentElement, dBody = document.body;

    var overCanvasRect = overCanvas.getBoundingClientRect();
    // BeadCircleの付近がクリックされたら, 
    // その点の座標を計算するリスナーを登録
    overCanvas.addEventListener('mousedown', function(e) {
	var scrolledX = dElm.scrollLeft  ||  dBody.scrollLeft;       // 画面上部からのスクロール量(Chrome, Firefox)
	var scrolledY = dElm.scrollTop  ||  dBody.scrollTop;       // 画面上部からのスクロール量(Chrome, Firefox)
	var realX = (e.clientX + scrolledX) - overCanvasRect.left;  	// 実際のcanvas座標
	var realY = (e.clientY + scrolledY) - overCanvasRect.top;

	// 斜行座標でのcanvas座標(yから計算する必然性あり.)
	var ocsY = Math.round( realY / UNIT_DIST_Y );
	var floatX = (realX / UNIT_DIST_X) +  (ocsY * Math.sin( ANGLE_IN_OCS ));  
	var ocsX = Math.round( floatX );
	console.log('ocs mouse pos (ocs) : (' + ocsX + ', ' + ocsY + ')' );
    }, false);

    var submitButton = fm.nextButton;
    submitButton.value = "Execute !!";

    var nextBtnMsgDiv = document.getElementById('btnMsg');
    nextBtnMsgDiv.innerHTML = '';
    
    fm.onsubmit = execute;

    return false;
};


var execute = function () {

    /* var worker = new Worker('workerTest.js');
    console.log(OSVars);
    var obj = new Object();
    obj.a = 10;
    obj.b = 20;
    worker.postMessage(  obj  );
    worker.postMessage( {a:  100, b: 200} );

    worker.onmessage = function(e) {
	console.log( 'return from worker.');
	console.log( e.data );
    };
    */
    
    console.log('execute button pushed...')


    /*  3 DNF tautology の検証用RuleSet */

    OSVars.ruleset[368][3]  = true;   // はじめの割り当て
    OSVars.ruleset[3][368]  = true; 
    OSVars.ruleset[366][1]  = true; 
    OSVars.ruleset[1][366]  = true; 


    OSVars.ruleset[113][111]  = true;   // 2つ目の割り当て(コピーだけ)
    OSVars.ruleset[111][113]  = true; 
    OSVars.ruleset[115][360]  = true; 
    OSVars.ruleset[360][115]  = true; 



    /*
      Basic RuleSet
     */

    // 10'', 11'', 12'' => 1,2,3 
    //  1,2,3 => 4,5,6
    for(j=0 ; j <= 3 ; j++){
	for(i=5 ; i <= (5+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-3 + j*56]  = true;     // 2,11''
	    OSVars.ruleset[i-3 + j*56][i + j*56]  = true; 
	}
    }

    for(i=0 ; i <= 3; i++ ){
	OSVars.ruleset[6 + (i*12)][302 + i*4]  = true;   //  3, knife (knife => 302,...)
	OSVars.ruleset[302 + i*4][6 + (i*12)]  = true; 
    }

    for(i=0 ; i <= 3; i++){
	OSVars.ruleset[130 + 12*i][130 + 12*i - (34 + 24*i)]  = true;  // 3,1knif
	OSVars.ruleset[130 + 12*i - (34 + 24*i)][130 + 12*i]  = true; 

	OSVars.ruleset[130 + 12*i][130 + 12*i - (32 + 24*i)]  = true;  // 3,3knif
	OSVars.ruleset[130 + 12*i - (32 + 24*i)][130 + 12*i]  = true; 

	OSVars.ruleset[130 + 12*i][130 + 12*i - (28 + 24*i)]  = true;  // 3,7knif
	OSVars.ruleset[130 + 12*i - (28 + 24*i)][130 + 12*i]  = true; 
    }



    for(j=0 ; j <= 3 ; j++){
	for(i=6 ; i <= (6+12*3) ; i += 12 ){
	    if(j != 0  ||  i == 0){
		OSVars.ruleset[i + j*56][i-9 + j*56]  = true;  // 3,6''
		OSVars.ruleset[i-9 + j*56][i + j*56]  = true; 

		OSVars.ruleset[i + j*56][i-8 + j*56]  = true;  // 3,7''
		OSVars.ruleset[i-8 + j*56][i + j*56]  = true; 
	    }
	    OSVars.ruleset[i + j*56][i-5 + j*56]  = true;  // 3,10''
	    OSVars.ruleset[i-5 + j*56][i + j*56]  = true; 
	}
    }

    for(j=0 ; j <= 3 ; j++){
	for(i=8 ; i <= (8+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-3 + j*56]  = true;           // 5,2
	    OSVars.ruleset[i-3 + j*56][i + j*56]  = true; 
	}
    }

    for(j=0 ; j <= 3 ; j++){
	for(i=9 ; i <= (9+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-7 + j*56]  = true;   // 6,11''
	    OSVars.ruleset[i-7 + j*56][i + j*56]  = true; 

	    OSVars.ruleset[i + j*56][i-5 + j*56]  = true;   // 6,1
	    OSVars.ruleset[i-5 + j*5][i + j*56] = true; 
	}
    }

    
    for(j=0 ; j <= 3 ; j++){
	for(i=10 ; i <= (10+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-9 + j*56]  = true;     // 7,10''
	    OSVars.ruleset[i-9 + j*56][i + j*56]  = true; 
	}
    }


    for(j=0 ; j <= 3 ; j++){
	for(i=11 ; i <= (11+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-3 + j*56]  = true; 
	    OSVars.ruleset[i-3 + j*56][i + j*56]  = true;   // 8,5
	}


	for(i=12 ; i <= (12+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-7 + j*56]  = true; 
	    OSVars.ruleset[i-7 + j*56][i + j*56]  = true;    // 9,2

	    OSVars.ruleset[i + j*56][i-5 + j*56]  = true;   // 9,4
	    OSVars.ruleset[i-5 + j*56][i + j*56]  = true; 
	}


	for(i=13 ; i <= (13+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-9 + j*56]  = true; 
	    OSVars.ruleset[i-9 + j*56][i + j*56]  = true;  // 10,1
	}


	for(i=14 ; i <= (14+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-3 + j*56]  = true; 
	    OSVars.ruleset[i-3 + j*56][i + j*56]  = true;  // 11,8
	}
    }

    // 10,9,8,7  '  =>  3,4,5,6 + 300
    // 12 => 15  (12(i-1) + 3)
    for(i=0 ; i <= 3 ; i++ ){
	OSVars.ruleset[303 + 4*i][15 + 12*i]  = true;  // 12,8'
	OSVars.ruleset[15 + 12*i][303 + 4*i]  = true; 

	OSVars.ruleset[305 + 4*i][15 * 12*i]  = true;  // 12,10'
	OSVars.ruleset[15 + 12*i][305 + 4*i]  = true; 
    }


    // R_T (C1,C2,C4)
    for(i=0; i <= 3 ; i++){
	if(i == 2){ continue; }
	OSVars.ruleset[304 + 4*i][5 + 12*i]  = true;  // 2,9'(v_1)
	OSVars.ruleset[5 + 12*i][304 + 4*i]  = true; 
	OSVars.ruleset[305 + 4*i][6 + 12*i]  = true;  // 3,8'(v_1)
	OSVars.ruleset[6 + 12*i][305 + 4*i]  = true; 
	OSVars.ruleset[306 + 4*i][7 + 12*i]  = true;  // 4,7'(v_1)
	OSVars.ruleset[7 + 12*i][306 + 4*i]  = true; 
	OSVars.ruleset[307 + 4*i][8 + 12*i]  = true;  // 5,10knifff(v_1)
	OSVars.ruleset[8 + 12*i][307 + 4*i]  = true; 
    }
    for(i=0; i <= 3 ; i++){
	if(i == 1){ continue; }
	OSVars.ruleset[117 + 12*i][117 + 12*i - (13 + 24*i)]  = true;  // 2,9'(v_2)
	OSVars.ruleset[117 + 12*i - (13 + 24*i)][117 + 12*i]  = true; 
	OSVars.ruleset[118 + 12*i][118 + 12*i - (15 + 24*i)]  = true;  // 3,8'(v_2)
	OSVars.ruleset[118 + 12*i - (15 + 24*i)][118 + 12*i]  = true; 
	OSVars.ruleset[119 + 12*i][119 + 12*i - (17 + 24*i)]  = true;  // 4,7'(v_2)
	OSVars.ruleset[119 + 12*i - (17 + 24*i)][119 + 12*i]  = true; 
	OSVars.ruleset[120 + 12*i][120 + 12*i - (27 + 24*i)]  = true;  // 5,10knifff(v_2)
	OSVars.ruleset[120 + 12*i - (27 + 24*i)][120 + 12*i]  = true; 
    }


    // R_F (C3, C4)
    for(i=2 ; i <=3 ; i++){
	OSVars.ruleset[305 + 4*i][8 + 12*i]  = true;  // 5,8'(v_1)
	OSVars.ruleset[8 + 12*i][305 + 4*i]  = true; 
	OSVars.ruleset[306 + 4*i][9 + 12*i]  = true;  // 6,7'(v_1)
	OSVars.ruleset[9 + 12*i][306 + 4*i]  = true; 
	OSVars.ruleset[307 + 4*i][10 + 12*i]  = true;  // 7,10knifff(v_1)
	OSVars.ruleset[10 + 12*i][307 + 4*i]  = true; 
    }
    for(i=1 ; i <=3 ; i++){
	if(i == 2){ continue; }	
	OSVars.ruleset[120 + 12*i][120 + 12*i - (17 + 24*i)]  = true;  // 5,8'(v_2)
	OSVars.ruleset[120 + 12*i - (17 + 24*i)][120 + 12*i]  = true; 
	OSVars.ruleset[121 + 12*i][121 + 12*i - (19 + 24*i)]  = true;  // 6,7'(v_2)
	OSVars.ruleset[121 + 12*i - (19 + 24*i)][121 + 12*i]  = true; 
	OSVars.ruleset[122 + 12*i][122 + 12*i - (29 + 24*i)]  = true;  // 7,10knifff(v_2)
	OSVars.ruleset[122 + 12*i - (29 + 24*i)][122 + 12*i]  = true; 
    }


    // formater1 only
    for(i=0 ; i <= 3 ; i++ ){
	OSVars.ruleset[61 + 12*i][61 + 12*i - (13 + 24*i)]  = true;  // 2,9'
	OSVars.ruleset[61 + 12*i - (13 + 24*i)][61 + 12*i]  = true; 

	OSVars.ruleset[61 + 12*i][61 + 12*i - (11 + 24*i)]  = true;  // 2,11'
	OSVars.ruleset[61 + 12*i - (11 + 24*i)][61 + 12*i]  = true; 

	OSVars.ruleset[62 + 12*i][62 + 12*i - (15 + 24*i)]  = true;  // 3,8'
	OSVars.ruleset[62 + 12*i - (15 + 24*i)][62 + 12*i]  = true; 

	OSVars.ruleset[62 + 12*i][62 + 12*i - (12 + 24*i)]  = true;  // 3,11'
	OSVars.ruleset[62 + 12*i - (12 + 24*i)][62 + 12*i]  = true; 

	OSVars.ruleset[63 + 12*i][63 + 12*i - (16 + 24*i)]  = true;  // 4,8'
	OSVars.ruleset[63 + 12*i - (16 + 24*i)][63 + 12*i]  = true; 

	OSVars.ruleset[63 + 12*i][63 + 12*i - (23 + 24*i)]  = true;  // 4,1'
	OSVars.ruleset[63 + 12*i - (23 + 24*i)][63 + 12*i]  = true; 

	OSVars.ruleset[64 + 12*i][64 + 12*i - (27 + 24*i)]  = true;  // 5,10knifff
	OSVars.ruleset[64 + 12*i - (27 + 24*i)][64 + 12*i]  = true; 

	OSVars.ruleset[64 + 12*i][64 + 12*i - (25 + 24*i)]  = true;  // 5,12knifff
	OSVars.ruleset[64 + 12*i - (25 + 24*i)][64 + 12*i]  = true; 


	OSVars.ruleset[71 + 12*i - (28 + 24*i) ][71 + 12*i]  = true;  // 12,4'
	OSVars.ruleset[71 + 12*i][71 + 12*i - (28 + 24*i)]  = true; 

	OSVars.ruleset[71 + 12*i - (26 + 24*i) ][71 + 12*i]  = true;  // 12,6'
	OSVars.ruleset[71 + 12*i][71 + 12*i - (26 + 24*i)]  = true; 

	OSVars.ruleset[71 + 12*i - (24 + 24*i) ][71 + 12*i]  = true;  // 12,8'
	OSVars.ruleset[71 + 12*i][71 + 12*i - (24 + 24*i)]  = true;  

	OSVars.ruleset[71 + 12*i - (22 + 24*i) ][71 + 12*i]  = true;  // 12,10'
	OSVars.ruleset[71 + 12*i][71 + 12*i - (22 + 24*i)]  = true;  
    }


    // formater2 only
    for(i=0 ; i <= 3 ; i++ ){
	OSVars.ruleset[173 + 12*i][173 + 12*i - (13 + 24*i)]  = true;  // 2,9'
	OSVars.ruleset[173 + 12*i - (13 + 24*i)][173 + 12*i]  = true; 

	OSVars.ruleset[173 + 12*i][173 + 12*i - (11 + 24*i)]  = true;  // 2,11'
	OSVars.ruleset[173 + 12*i - (11 + 24*i)][173 + 12*i]  = true; 

	OSVars.ruleset[174 + 12*i][174 + 12*i - (15 + 24*i)]  = true;  // 3,8'
	OSVars.ruleset[174 + 12*i - (15 + 24*i)][174 + 12*i]  = true; 

	OSVars.ruleset[174 + 12*i][174 + 12*i - (12 + 24*i)]  = true;  // 3,11'
	OSVars.ruleset[174 + 12*i - (12 + 24*i)][174 + 12*i]  = true; 

	OSVars.ruleset[175 + 12*i][175 + 12*i - (16 + 24*i)]  = true;  // 4,8'
	OSVars.ruleset[175 + 12*i - (16 + 24*i)][175 + 12*i]  = true; 

	OSVars.ruleset[175 + 12*i][175 + 12*i - (23 + 24*i)]  = true;  // 4,1'
	OSVars.ruleset[175 + 12*i - (23 + 24*i)][175 + 12*i]  = true; 

	OSVars.ruleset[176 + 12*i][176 + 12*i - (27 + 24*i)]  = true;  // 5,10knif
	OSVars.ruleset[176 + 12*i - (27 + 24*i)][176 + 12*i]  = true; 

	OSVars.ruleset[176 + 12*i][176 + 12*i - (25 + 24*i)]  = true;  // 5,12knif
	OSVars.ruleset[176 + 12*i - (25 + 24*i)][176 + 12*i]  = true; 


	OSVars.ruleset[183 + 12*i - (28 + 24*i) ][183 + 12*i]  = true;  // 12,4'
	OSVars.ruleset[183 + 12*i][183 + 12*i - (28 + 24*i)]  = true; 

	OSVars.ruleset[183 + 12*i - (26 + 24*i) ][183 + 12*i]  = true;  // 12,6'
	OSVars.ruleset[183 + 12*i][183 + 12*i - (26 + 24*i)]  = true; 

	OSVars.ruleset[183 + 12*i - (24 + 24*i) ][183 + 12*i]  = true;  // 12,8'
	OSVars.ruleset[183 + 12*i][183 + 12*i - (24 + 24*i)]  = true;  

	OSVars.ruleset[183 + 12*i - (22 + 24*i) ][183 + 12*i]  = true;  // 12,10'
	OSVars.ruleset[183 + 12*i][183 + 12*i - (22 + 24*i)]  = true;  
    }



    for(j=0 ; j <= 3 ; j++){
	for(i=15 ; i <= (15+12*3) ; i += 12 ){
	    OSVars.ruleset[i + j*56][i-9 + j*56]  = true;  // 12,3
	    OSVars.ruleset[i-9 + j*56][i + j*56]  = true; 

	    OSVars.ruleset[i + j*56][i-8 + j*56]  = true;  // 12,4
	    OSVars.ruleset[i-8 + j*56][i + j*56]  = true; 

	    OSVars.ruleset[i + j*56][i-5 + j*56]  = true;  // 12,7
	    OSVars.ruleset[i-5 + j*56][i + j*56]  = true; 
	}
    }



    /* 
       Verification(Bottom) 
    */

    // 4,8,7
    for(i=0; i <= 3 ; i++){
	OSVars.ruleset[227 + 4*i][227 + 4*i - (16 + 16*i)]  = true;  // z[2], 4
	OSVars.ruleset[227 + 4*i - (16 + 16*i)][227 + 4*i]  = true; 
	OSVars.ruleset[227 + 4*i][227 + 4*i - (12 + 16*i)]  = true;  // z[2], 8
	OSVars.ruleset[227 + 4*i - (12 + 16*i)][227 + 4*i]  = true; 

	OSVars.ruleset[228 + 4*i][228 + 4*i - (13 + 16*i)]  = true;  // z[3], 8
	OSVars.ruleset[228 + 4*i - (13 + 16*i)][228 + 4*i]  = true; 
	OSVars.ruleset[228 + 4*i][228 + 4*i - (14 + 16*i)]  = true;  // z[3], 7
	OSVars.ruleset[228 + 4*i - (14 + 16*i)][228 + 4*i]  = true; 
    }    


    // 10, last
    for(i=0; i <= 2 ; i++){
	OSVars.ruleset[229 + 4*i][229 + 4*i - (24 + 16*i)]  = true;  // z[4], 10
	OSVars.ruleset[229 + 4*i - (24 + 16*i)][229 + 4*i]  = true; 
    }

    OSVars.ruleset[241][169]  = true;  
    OSVars.ruleset[169][241]  = true; 


    // z_i[k], a
    for(i=1 ; i < 16 ; i++ ){
	if(i%4 == 0){ continue; }
	OSVars.ruleset[351-i][226+i]  = true;  
	OSVars.ruleset[226+i][351-i]  = true; 
    }





    // 右上
    OSVars.ruleset[53][320]  = true;  
    OSVars.ruleset[320][53]  = true; 
    OSVars.ruleset[53][321]  = true;  
    OSVars.ruleset[321][53]  = true; 

    OSVars.ruleset[55][323]  = true;  
    OSVars.ruleset[323][55]  = true; 

    OSVars.ruleset[57][326]  = true;  
    OSVars.ruleset[326][57]  = true; 

    OSVars.ruleset[59][55]  = true;  
    OSVars.ruleset[55][59]  = true; 


    // 左1
    OSVars.ruleset[108][365]  = true;  
    OSVars.ruleset[365][108]  = true; 

    OSVars.ruleset[111][362]  = true;  
    OSVars.ruleset[362][111]  = true; 

    OSVars.ruleset[112][361]  = true;  
    OSVars.ruleset[361][112]  = true; 
    OSVars.ruleset[112][360]  = true;  
    OSVars.ruleset[360][112]  = true; 



    // 右中
    OSVars.ruleset[165][326]  = true;  
    OSVars.ruleset[326][165]  = true; 
    OSVars.ruleset[165][327]  = true;  
    OSVars.ruleset[327][165]  = true; 

    OSVars.ruleset[167][329]  = true;  
    OSVars.ruleset[329][167]  = true; 
    OSVars.ruleset[167][171]  = true;  
    OSVars.ruleset[171][167]  = true; 

    OSVars.ruleset[169][332]  = true;  
    OSVars.ruleset[332][169]  = true; 


    // 左下
    OSVars.ruleset[225][352]  = true;  
    OSVars.ruleset[352][225]  = true; 

    // RuleSet おわり
    ////////////////////

    // show_occupied_in_binary_2();
    
    console.log( OSVars );

    // シミュレータの実行
    runStatus = runSimu();
    console.log('runSimu finished.');
    
    var fm = document.forms;
    var exeBtn = fm.nextButton;
    exeBtn.disabled = 'true';

    // show_occupied_in_binary_2();

    console.log('step: ' + OSVars.step); 

    for(i=0 ; i<OSVars.step  ; i++){
	var p = OSVars.w_path[ i ];
	var bead = OSVars.occupied[p.x][p.y]
	var str = '';

	str = str.concat('occupied[' + p.x + '][' + p.y + '] == ');
	str = str.concat( 'beadType : ' + bead.beadType ); 
	str = str.concat( '__ index : ' + bead.index ); 
	str = str.concat( '__ bondNum : ' + bead.bondNum ); 
	console.log( str );
    }
    /*  Fixされた鎖をCanvasへ描画 */
    reflectFixedPath();

    var bonds = OSVars.hbonds;
    console.log('---------- Hbonds list ----------'); 
    for(i=0; i < bonds.length; i++){
	console.log( '[' + bonds[i][0].x + ']' + '[' +  bonds[i][0].y +'] << --- >> ['
		     + bonds[i][1].x + ']' + '[' +  bonds[i][1].y +']');
    }
    /* 決定したHbondをCanvasへ描画 */
    reflectFixedHbond();

    // nonDetRoutesが空でない, つまりNon Deterministicならば, 
    // formに, 最適性が等しい構造の表示を順次切り替えるボタンを追加.
    if ( runStatus == false ) {
	if ( nonDetRoutes.length > 0 ) {
	    var p = document.createElement('p');
	    p.innerHTML = '========= Non Deterministic ==========';
	    fm.appendChild( p );
	    var lab = document.createElement('label');
	    var elm = document.createElement('input');
	    var txt = document.createTextNode('(' + nonDetRoutes.length + ' folding routes)');

	    elm.type  =  "button";
	    elm;name  = "route";
	    elm.value  =  "changeRoute";
	    elm.onclick = reflectNonDetRoute();    // イベントハンドラ
	    lab.appendChild( elm );
	    lab.appendChild( txt );
	    fm.appendChild( lab );
	} else {
	    var p = document.createElement('p');
	    p.innerHTML = '========= Non Deterministic in One Route ==========';
	    fm.appendChild( p );
	}
	
    } else {
	var p = document.createElement('p');
	p.innerHTML = '========= Deterministic ==========';
	fm.appendChild( p );
    }

    return false;
};
