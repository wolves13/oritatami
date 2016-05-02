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

    //RuleSet
    //////////////////////////
    OSVars.ruleset[0][3]  = true;   // はじめの割り当て
    OSVars.ruleset[3][0]  = true; 
    
    for(j=1;j<100;j++){
	OSVars.ruleset[3*j-2][3*(j+1)]  = true;
	OSVars.ruleset[3*(j+1)][3*j-2]  = true;
    }
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
