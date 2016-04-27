/****   *****/
// basicFuncs.js
// Oritatami Simulatorで使用する,
// 基本的な関数をここにまとめる。
/****   *****/

///**  ごく一般的な関数  **///
//

// Function.prototypeを拡張して, メソッド追加関数を定義.
// この拡張により,すべての関数オブジェクトから使えるようになる.
Function.prototype.method = function (name, func){
  if (!this.prototype[name]){
    this.prototype[name] = func;
    return this;
  }
};

// オブジェクト的に書くならこれか? 未使用.
var Bead = function( beadType, index, bondNum ){
    this.beadType = beadType;
    this.index = index;
    this.bondNum = bondNum;

    this.addBondNum = function(){
	bondNum++;
    };
}


// 限定的な利用.
// initial.jsにおいて, seedをハードコードする部分を拡張しただけ.
// occupied配列への反映だけでなく, canvasへの描画も行うように拡張.
var setSeed = function(x, y, obj) {
    OSVars.occupied[x][y] = { beadType: obj.beadType, index : obj.index, bondNum : obj.bondNum };
    
    var overCtx = document.getElementById('overCanvas').getContext('2d');
    drawBeadCircle(x, y, overCtx, 'red');
    drawBeadType(x, y, obj.beadType, overCtx, 'red');
};


// 値が配列かどうか調べる. (例外処理などで使う)
var isArray = function (val){

  return val && 
	 typeof val === 'object' &&
	 val.constructor === Array;
};

// 長さが len である配列を生成.要素はすべて elm となる.
var initArray = function(len, elm){
  var i, a = [];
  for(i=0 ; i<len ; i+= 1){
    a[i] = elm;
  }
  return a;
};

// 配列要素を順番にすべて列挙.
var enumArray = function(a) {
  if(  !( isArray(a) ) ){
      throw {
	  name: 'typeError',
	  message: 'function : [enumArray] needs Array for input arguments.' 
      };
  }
  var i;
  for(i=0 ; i < a.length ; i += 1){
    document.writeln( a[i] );
  }
};

//
//***  OS 特有の関数  ***///
//


// alpha, delta を初期化する.
// オブジェクトリテラルで2つの引数を受け取る. init_a_d( {a: 2, d: 3} )
var init_a_d = function(args){

  for (param in args){
    if(param <= 0){
      throw { name: '',
              message: 'parameters: [alpha, delta] must be positive int.' 
            };
    }
  }
  OSVars.cons.alpha =  parseInt( args['a'] ,10);
  OSVars.cons.delta =  parseInt( args['d'] ,10);
};


// 高分子の系列(数値の配列)を, 入力から生成.
// A:0  U:1  G:2  C:3 といったイメージ.
// 入力form, またはFileから読み込んで初期化するようにしたい.
/***  まだお試し版. 未完成. ***/
var initWord = function( word ) {
    var i;
    var wordLen = OSVars.cons.len;

    // wordが, "0-len" の形式で与えられるなら, 
    // wordLenだけを使って初期化.
    if( OSVars.mode.indexEqualBeadtype ) {
	for(i=0; i < wordLen ; i++){
	    OSVars.word[i] = i;  
	}
    } else {
	// wordをパースする処理.
	// OSVars.word = [49,50,51,0,1,2,3,4,5,6,7,8,9,10,11];
	
	var wordFm = document.forms.word;
	var wordArr = wordFm.value.split(',');
	var bt;
	for( i=0 ; i < wordArr.length ; i++ ) {
	    bt = parseInt(wordArr[i], 10);
	    OSVars.word.push( bt );
	}
    }
};

// OSが動作し始める前にoccupied配列をすべて'false'で初期化する.
// 配列の大きさは2つの引数で指定する.
// （seedの情報を読むものも必要かもしれない）
var initOccupied = function( lenX, lenY ){
  var i,j;
  for(i=0; i < lenX; i++){
    OSVars.occupied.push( [] );
    for(j=0; j < lenY; j++){  OSVars.occupied[i][j] = false;  }
    
  }
};

// UIからの入力を, RULESETに反映する.
// マトリックスとして引数 rulesetに受け取る.
var setRuleset = function( ruleset ){


  // テスト版. ただfalseをセットしているだけ.
  var size = OSVars.cons.beadTypeNum;
  var i;

  OSVars.ruleset = [];
  for(i=0; i<size; i++){
    OSVars.ruleset.push( initArray(size, false));
  }
};


// ある点( cPoint )の周り6(5)点のうち, 
// 占有されていない点のリストを取得する.
// adjacentsはグローバル変数で, 隣接関係を定める. 
var findEmptyPoints = function( cPoint ) {

  var surroundPs = [];  // 周りの点 ( {x:0, y:0}のようなオブジェクト) を保持する.
  var point;
  var step = OSVars.step;

  // 周りの点6個を列挙する.
  // 前の点（と, 次の点) に等しい物は除く. )
  // 途中の点は上手く動作しないが, とりあえずは無視.
  for(i in adjacents){

    if( (cPoint.x + adjacents[i].x) === OSVars.w_path[step-1].x  &&
	(cPoint.y + adjacents[i].y) === OSVars.w_path[step-1].y     )
          { continue;  }
    
    if( OSVars.w_path[step+1] !== undefined && 
	(cPoint + adjacents[i].x) === OSVars.w_path[step+1].x  &&
        (cPoint + adjacents[i].y) === OSVars.w_path[step+1].y     )
          { continue;  }
      
    point = { x: (cPoint.x + adjacents[i].x),
	      y: (cPoint.y + adjacents[i].y)  };
      // document.writeln( 'following point added to sps. <br>');
      // document.writeln( '[' + point.x + ', ' + point.y + ']<br><br>' );       
    surroundPs.push( point );
      // br1();
      
  }
  // document.writeln('sPs size : ' + surroundPs.length + '<br>');

  // 以下, indexが大きい方から調べて削除していくように実装してます
  var i;
  for(i = surroundPs.length - 1; 0 <= i; i--){
    // 周りの点それぞれが, 既に占有されているか調べる.
      if ( surroundPs[i].x < 0  || 
	   surroundPs[i].y < 0  ||
           isOccupied(surroundPs[i].x, surroundPs[i].y, true) ){

	// document.writeln('占有されているか, 不正.');
	// br1();
	surroundPs.splice(i, 1);  // 占有されていたら削除
    }
  }  
  return surroundPs;
};


// 形成可能なhbondの数を数える.
// delay個の高分子の場所が１通り決まったら, その都度呼ばれる.
// 引数 folding_route は, 最適化中に生み出された ""折り方の1パターン""
// であって, 3要素のオブジェクトないことに注意.
// imgは, fragment以外の描画状態を取得したもの.
var countAvailableHbonds = function( folding_route, provisionalMaxH, img ){
    
    var step = OSVars.step;
    var delta = OSVars.cons.delta, alpha = OSVars.cons.alpha;

    if ( OSVars.cons.len - step  < delta ) {   // 残りの鎖がdeltaより小さい場合
	delta = OSVars.cons.len - step ;
    }

    var adjacentBeads = [];       // 周りの点で, 占有されている点.
    var N=0, maxN, possibleN;
    var i, j,k;
    var possibleHbondPos = [];     // hbondを結ぶことが可能な場所を, adjacentBeadsの2つのindexで格納.
    var possibleHbondPositionNum;  // hbondを結ぶことが可能な場所の数.
    var firstPointHbondPos = [];   // 一番根元の高分子が結ぶhbondの情報.
    var fragmentHbondPos = [];     // FP意外のFragment全体が結ぶhbondの情報(NonDet図示用)
    

    // hbond形成可能ヶ所の数
    var positionNum;
    var max = -1;                                   // 同じ i の中での暫定最大本数を保存する
    var combi = [];           // possibleHbondPosにおける, 形成ヶ所を指定する(要素はtrue/false).
    var maxCombi = [];        // combi配列を暫定的に保存するため
    var combinationList = [];  // combi の候補リスト
    var status = false;
    var numArray = [];
    var possibleFirstPointHbondNum = 0; // firstPointが周りと結べる場所を幾つもつか.
    var nonDetFlag = false;              // 最適性が同じで, firstPointのhbond形成パターンが異なる場合が有るか
    var firstPointBondingPatterns = [];  // そのような場合(１行上）に, 複数のパターンを保存する配列.
    var nonDetInOneRoute = [];           // そのような場合（同上）に, 呼び出し元に返す情報として成形したもの.


    // RuleSet配列を参照しつつ, 周りの高分子種類を調べる.
    // 対称配列にするか, typeA - typeB の大きさで判別して配列サイズ半分にするか..
    var areInRuleSet = function (typeA, typeB){

	if( OSVars.ruleset[typeA][typeB] ) {
	    return true;
	}
	return false;
    };

    // occupied配列の部分コピーを生成する.
    //   count_available_hbond では, 
    //   この部分コピーを参照するだけでなく, 編集もする.
    var makeCopyOfOccupied = function( cPoint, size ){
	var occupied = {};
	var p ={};
	var i, j;
	p.x = cPoint.x;
	p.y = cPoint.y;
	
	// まず, x=cPoint.x の場合( y=cPoint.y という軸上の点 )
	occupied[p.x] = [] ;
	for(i= -size ; i <= size ; i++){

	    p.y = cPoint.y + i;
	    if( isOccupied( p.x, p.y) ){
		occupied[ p.x ][ p.y ] = {};
		occupied[ p.x ][ p.y ].beadType = OSVars.occupied[ p.x ][ p.y ].beadType;
		occupied[ p.x ][ p.y ].index = OSVars.occupied[ p.x ][ p.y ].index;
		occupied[ p.x ][ p.y ].bondNum = OSVars.occupied[ p.x ][ p.y ].bondNum;
	    }
	    else {
		occupied[ p.x ][ p.y ] = false;
	    }
	}

	// x != cPoint.x の場合( それ以外 )
	for(i=1; i <= size  ; i++){

	    p.x = cPoint.x + i;
	    occupied[ p.x ] = [];
	    for(j= (i-size) ; j <= size; j++){
		p.y = cPoint.y + j;
		    
		if( isOccupied( p.x, p.y) ){
		    occupied[ p.x ][ p.y ] = {};
		    occupied[ p.x ][ p.y ].beadType = OSVars.occupied[ p.x ][ p.y ].beadType;
		    occupied[ p.x ][ p.y ].index = OSVars.occupied[ p.x ][ p.y ].index;
		    occupied[ p.x ][ p.y ].bondNum = OSVars.occupied[ p.x ][ p.y ].bondNum;
		}
		else {
		    occupied[ p.x ][ p.y ] = false;
		}
	    }

	    p.x = cPoint.x - i;
	    occupied[ p.x ] = [];
	    for(j = -size; j <= (size-i) ; j++){
		p.y = cPoint.y + j;
		    
		if( isOccupied( p.x, p.y) ){
		    occupied[ p.x ][ p.y ] = {};
		    occupied[ p.x ][ p.y ].beadType = OSVars.occupied[ p.x ][ p.y ].beadType;
		    occupied[ p.x ][ p.y ].index = OSVars.occupied[ p.x ][ p.y ].index;
		    occupied[ p.x ][ p.y ].bondNum = OSVars.occupied[ p.x ][ p.y ].bondNum;
		}
		else {
		    occupied[ p.x ][ p.y ] = false;
		}
	    }
	}//

	// 次に, folding_route上の点も占有情報に加える.
	for(i=0; i < delta; i++){
	    p = folding_route[i];
	    occupied[ p.x  ][ p.y ] = { beadType : OSVars.word[step+i],
					index    : step+i,
					bondNum : 0
				      };
	}

	return occupied;
    };


    // 周りの高分子を列挙する関数
    // occupied配列の中身( 3要素のオブジェクト )の並びを返す.
    var findOccupiedPoints = function ( cPoint, idx, occupied) {
	var occupiedPoints = [];
	var point, p;
	var i;
	
	for (i=0; i<6; i++){
	    point = { x: (cPoint.x + adjacents[i].x),
		      y: (cPoint.y + adjacents[i].y)
		    };
	    // 占有されていて, 前後の点でないならばpush
	    if ( p = occupied[ point.x ][ point.y ] ){

		if (  p.index  !== (idx-1)  &&  p.index !== (idx+1)  ){
		    p.x = point.x, p.y = point.y;  // 座標情報を追加
		    occupiedPoints.push( p );
		}
	    }
       	}
	return occupiedPoints;
    };


    var setCombination  = function (c, array) {

	// document.writeln('setCombination called.'); br1();
	var i;
	for(i=0; i<array.length; i++){ array[i] = false; }      // 初期化.

	for(i=0; i<c.length; i++){ // 適用

	    // document.writeln(c[i] + '番目に trueを代入.'); br1();
	    array[ c[i] ] = true;
	}
	return;
    };


    var applyHbond = function ( pos, occupied ) {
	
	var fragNum = pos.fragNum;
	var oppNum = pos.oppositeNum;
	var fragX = folding_route[ fragNum ].x, fragY = folding_route[ fragNum ].y;
	var oppX = adjacentBeads[ fragNum ][ oppNum ].x, oppY = adjacentBeads[ fragNum ][ oppNum ].y;

	var alpha = OSVars.cons.alpha;

	// 両側でbond_numが余っているなら, 値を更新する(+1)
	if ( occupied[ fragX ][ fragY ].bondNum < alpha  && 
              occupied[ oppX ][ oppY ].bondNum < alpha      ) {

	    occupied[ fragX ][ fragY ].bondNum += 1;
	    occupied[ oppX ][ oppY ].bondNum   += 1;
	} else {
	    return false;
	}
	return true;
    };

    // 組み合わせの列挙関数.
    // array配列の要素を selectNum 個 選んだものを要素とする二次元配列を返す.
    var enumCombinations = function( array, selectNum ) {

	var m,n;
	var combis = [];
	var sub;
	var len = array.length;

	if ( len < selectNum ) {
	    // document.writeln(  'no combi.' );
	    return  []; 
	} // 異常入力

	if (len  == selectNum) {
	    combis[0] = array;
	    // document.writeln('select all elements'); br1();
	    return combis;
	} else if ( selectNum == 1 ) {
	    for (m=0; m<len; m++) {
		combis[m] = [array[m]];
	    }　
	}else {
	    for (m=0; m <= (len - selectNum); m++) {
		sub = enumCombinations( array.slice(m+1), selectNum-1);
		for (n=0; n < sub.length; n++) {
		    combis.push( [array[m]].concat( sub[n] ) );
		}
	    }
	}

	return combis;
    };

    // 2つのbonding-patternで, firstPointのhbondの結び方が異なっているか
    var eachFirstPointBondingDifferently = function (c1, c2){
	var i;
	var oppNum;
	// firstPointに関する部分だけcombi配列を調べる.
	for( i=0 ; i < possibleFirstPointHbondNum ; i++ ){
	    if ( c1[i]  !== c2[i] ) {   // combi配列の (true/false)が異なっていて, 
		oppNum = possibleHbondPos[i].oppositeNum;
		if(  adjacentBeads[0][ oppNum ].index  < step ){   // しかもそのhbondの相手が既にfixされているなら
		    return true;
		}
	    }
	}
	return false;
    };


    // routeの最初の点からdelta+1 の範囲をコピーする(folding_route上の点もoccupiedされたと見做すことに注意).
    var tmpOccupied= makeCopyOfOccupied( folding_route[0], delta+1 );          // 変更を加えて使う用
    var staticTmpOccupied = makeCopyOfOccupied( folding_route[0], delta+1 );   // 変更を加えないOriginal

    // show_tmpOccupied_in_binary_2( folding_route[0], tmpOccupied );

    ////////
    // 処理

    // それぞれの高分子の周りの高分子を調べる.
    // すべて変数に保存.
    for(i=0; i<delta; i++){
	adjacentBeads.push(  findOccupiedPoints( folding_route[i], step+i, staticTmpOccupied )   );
    }

    /*
    // テスト用出力
    document.writeln('adjacentBeads.' + '<br>');
    for(i=0; i<delta; i++){
	document.writeln(i + ', ');
	for( j in adjacentBeads[i] ){
	    document.writeln('x :' + adjacentBeads[i][j].x + ' _ ');
	    document.writeln('y :' + adjacentBeads[i][j].y );
	    br1();
	}
	br1();
    }
    */

    // ふらふらしてる各高分子(delta個)が, それぞれ何処とhbond形成可能か調べる.
    // ルールセットにあって, しかも相手のarityが余っている場合のみ記憶.
    // folding_route上の高分子同士の場合は, 重複して考えないようにする.
    for(i=0; i < delta; i++){
	for(j=0; j < adjacentBeads[i].length ; j++){

	    // document.writeln( 'bead1 : ' +  OSVars.word[ step + i]  );       br1();
	    // document.writeln( 'bead2 : ' +  adjacentBeads[i][j].beadType );  br1();


            if ( areInRuleSet(OSVars.word[ step + i ], adjacentBeads[i][j].beadType) &&
                                                adjacentBeads[i][j].bondNum < alpha     ){

		if ( adjacentBeads[i][j].index < step) {
		    possibleHbondPos.push(  { fragNum: i, oppositeNum : j}     ); //場所を記録.
		    // document.writeln( 'bondable : yes' );      br2();
		    if(i == 0) { possibleFirstPointHbondNum += 1; }
		} else if ( (step + i) < adjacentBeads[i][j].index ) {
		    possibleHbondPos.push(  { fragNum: i, oppositeNum : j}     ); //場所を記録.
		    // document.writeln( 'bondable : yes' );      br2();		
		    if (i == 0) { possibleFirstPointHbondNum += 1; }
		} else {
		    // document.writeln( 'already counted.' );      br2();		
		}
	    }else if ( areInRuleSet(OSVars.word[ step + i ], adjacentBeads[i][j].beadType) ) {
		 // document.writeln( 'bondable : no, but are in RuleSet. ' );   br1();
		var bn = adjacentBeads[i][j].bondNum;
		var type = adjacentBeads[i][j].beadType;
		// document.writeln( 'opp beadType : ' + type + ', opp bondNum : ' + bn );   br2();
	    } else{ 
		 // document.writeln( 'bondable : no' );      br2();		
	    }
	}
    }


    // 結びうるhbondの数の最大値を設定する. （動きが怪しくなったらここを疑ってみようか_)
    if ( alpha < 5 ){
	maxN  = (delta * alpha);  // N の値は, d*a より小さい.
    }
    else {
	maxN = 4 * delta + 1;     // alpha が 5(Max) のときは, d*a が 4d+1より大きくなる. 
    }

    /* hbond形成可能数を, 効率的に数えるもの. 全探索を先に実装したあとでやる. 
    // 一番根元の高分子で発生した枝分かれのそれぞれで1回呼び出す.
    var greedyBonding = function (index, abandandList, tmpOccupied){
	// 引数: abandanedList は, 結ばないと決めたhbond形成可能ヶ所を記憶.
	var i;

	// ownIndexで示される高分子が, oppositeIndexで示される高分子とのhbond形成を禁止されているか.
	var isAbandaned = function ( ownIndex, oppositeIndex ){
	    if ( abandanedList[ ownIndex ] ) {
		if ( abandanedList[ ownIndex ][ oppositeIndex ] ) {  return true;  }
	    }
	    return false; 
	}

	// 2番目の高分子から, 貪欲的にhbondを数える.
	for(i = index; i<delta; i++){
	    p = folding_route[i];
	    bNum = tmpOccupied[p.x][p.y].bondNum;   // 自分の残りarity
	    

	    // 暫定の最大数に到達不可とわかった時点で, 数えるのをやめる.
	    if (  N + ((delta-i) * alpha) < provisionalMaxH ) {
		break;
	    }
	}
	return ;
    }
    */
    var l;  // L

    possibleHbondPositionNum = possibleHbondPos.length;
    for(i=0; i < possibleHbondPositionNum; i++){  
	numArray[i] = i;    // 数の列を初期化.
	combi[i] = false;  // combiを初期化.
    }

    // hbond形成可能数の最大値
    var positionNumMax = (possibleHbondPositionNum < maxN ) ?  possibleHbondPositionNum  :  maxN;

    // 大きい方の数から, hbondを結べるか調べていく.
    for (i = positionNumMax; i>0; i--) {
	combinationList = enumCombinations( numArray, i); 

	for (j=0; j < combinationList.length; j++) {
	    N = 0;
	    setCombination( combinationList[j], combi );    // j番目を combi に適用.

	    for(l=0; l<combi.length; l++){
		// document.writeln( l + ' : ' + combi[l]);  br1();
	    }

	    for(k=0; k < possibleHbondPositionNum; k++){
		// document.writeln('checking .... combi[' + k + ']..... ==> ' + combi[k]);  br1();

		if ( combi[k] ){
		    // hbond形成ヶ所を適用. 
		    // 両端のarityが余っていれば, statusにtrue. そうでなければfalseが入る.
		    status = applyHbond( possibleHbondPos[k], tmpOccupied );   
		    // document.writeln(  'apply status   ==>  ' + status ); br1();
		    if ( status === false ){
			break;
		    }
		    N++;                            // 1つ数える.
		}
	    }

	    // 正常な状態で数え終わったら, maxと比較する
	    if ( status ) {
		if ( max < N ) {
		    nonDetFlag = false;
		    max = N; 
		    maxCombi = combi.slice(0);
		    firstPointBondingPatterns = [];
		    firstPointBondingPatterns.push( maxCombi.slice(0) );
		}else if ( N != 0  &&  max == N ) {
		    // firstPointの結ぶhbondに差があるならば, non deterministic.
		    // firstPointの結び方は, combi配列の前半に現れる.
		    // 組み合わせの列挙は, combi配列の前半が同じものについては, 順に並んで列挙される.
		    // よって, maxCombiをここで更新することが有効.
		    if(  eachFirstPointBondingDifferently(combi, maxCombi)  ){
			nonDetFlag = true;
			maxCombi = combi.slice(0);
			firstPointBondingPatterns.push( combi.slice(0) ); // 情報保存
			fpbp = firstPointBondingPatterns;
		    } 
		}
	    }

	    // tmpOccupied配列を元に戻す. (bondNumが変更されているため)
	    tmpOccupied= makeCopyOfOccupied( folding_route[0], delta+1 );

	}
	if( max > 0 ){ break; }  // 実際に i本 結べたならば, これ以上数えない.
    }
    if( max < 0 ) { max = 0; }  // 一本も結べない場合


    if( nonDetFlag === false  ) {
	// firstPointが結ぶHbnodの情報を用意する.
	// 4要素のオブジェクトが配列に保存される.
	for(i=0; i < possibleHbondPositionNum; i++){
	    if( maxCombi[i]  &&  possibleHbondPos[i].fragNum === 0 ) {   
		var n = possibleHbondPos[i].oppositeNum;
		if( adjacentBeads[0][n].index < step ){
		    firstPointHbondPos.push( adjacentBeads[0][n]  );   
		}
	    }
	    else if ( possibleHbondPos[i].fragNUm !== 0) { break; } 
	    // 存在するとすれば 初めの方なので, fragNumが0でなくなったら抜ける.
	}


	// FP以外の, fragment全体が作るhbondの情報を保存
	for(i=0 ; i < possibleHbondPositionNum ; i++ ) {
	    if( maxCombi[i] ){
		var fN = possibleHbondPos[i].fragNum;
		var oN = possibleHbondPos[i].oppositeNum;
		var hbondPair = { frag: folding_route[fN],  opposite: adjacentBeads[ fN ][ oN ] }; 
		fragmentHbondPos.push( hbondPair );
	    }
	}

    } 
    else {    // firstPointのhbond形成パターンが複数有る場合
	for( i=0 ; i<firstPointBondingPatterns.length; i++ ){
	    nonDetInOneRoute.push( [] );
	    for(j=0 ; j<possibleFirstPointHbondNum; j++ ){

		// combi配列の一部に相当する部分がtrueならば, 対応する点の情報を加える
		if ( firstPointBondingPatterns[i][j]  ){  // combi[j]がtrue
		    num = possibleHbondPos[j].oppositeNum;
		    p = adjacentBeads[0][num];
		    if (p.index < step ) {                // 相手が既に固定されていればpush
			nonDetInOneRoute[i].push( p );
		    }
		}
	    }
	}
	firstPointHbondPos = nonDetInOneRoute; // non-deterministic用の配列を入れる
	
	// fragment全体のhbond情報も保存したい.(->Non Det 図示用)
	// 数える処理のところで, 
	// fragment全体のhbond情報を一時保存するように改変する必要あり.
    }

    // Canvasにルートを反映する(Web Worker を利用するか?)
    // reflectTmpRoute( folding_route, img );


    // hbondの数, firstPointの結ぶhbondの情報を返す.
    return {
	h  :  max,
	pos:  firstPointHbondPos,
	fragPos : fragmentHbondPos,
	nonDetFlag: nonDetFlag
    };
};

// 点１つの周りの空点それぞれで再帰呼出しする関数を内部で定義.
// 長さdeltaになるまで折り方を１つずつ検証する.
// 最終的に, hbond最大数, 折り方の組を オブジェクトリテラルで与える.
var enumFoldings = function( firstPoint ){
  
    var delta = OSVars.cons.delta;
    var step = OSVars.step;
    if ( OSVars.cons.len - step  < delta ) {  // 残りの鎖がdeltaより小さい場合
	delta = OSVars.cons.len - step;
    }

    var h_max = -1;
    var route = [];                 // 経路点のスタック
    var optimalRoute = [];          // 最適な折り方

    var equivOptimalRoutes = [];    // 最初の点は一緒で, 最適性が同等な折り方が複数有る場合を記録
    var equivOptHbondPos = [];      // 同様な場合の, hbondの情報を追加.

    var optFirstPointHbondPos;      // 最適なfirstPointのhbond形成パターン
    var firstPoiontHbondPos = [];   // 非決定的になる場合にそなえて, firstPointのhbond形成パターンを複数保存
    var flag = false;

    var overCtx = document.getElementById('overCanvas').getContext('2d');

    // あとで.
    // var img = overCtx.getImageData(0, 0, 1000, 600);

    var j,k;

    var isInRoute = function( point ){
	for(j=0; j< route.length; j++){
	    if (point.x ===  route[j].x && point.y === route[j].y){
		return true;
	    }
	}
	return false;
    };

    var isEachFirstPointFormHbondsDifferently = function (pos1, pos2) {
	var i;

	if ( pos1.length !== pos2.length ) {  // 数の比較
	    return true;
	} else {
	    for(i=0; i<pos1.length; i++){      
		if( pos1[i].index !== pos2[i].index ){  // 相手の比較(順は揃っているので, 探索しなくてよい)
		    return true;
		}
	    }
	}
	return false;
    };

    var folding = function ( knot ) {        // knot は'結び目'の意.
	var i;
	// knot をrouteの先端へ.
        route.push( knot );	

        // 葉に到達( route配列サイズがdelta )したら...
        if( route.length === delta ){

            // 現在の折り方で 形成可能な水素結合数をカウント.
            info = countAvailableHbonds( route, h_max );  

            // max_h_numなどの値と比べる.
	    if ( h_max < info.h ){
		flag = info.nonDetFlag ? true : false;    // フラグ解除
		firstPointHbondPos = [];           // 情報の破棄
		for(i=0; i < (info.pos).length; i++){
		    firstPointHbondPos.push( (info.pos)[i] );   // 空になったところへ更新
		}
                h_max = info.h;
		optFirstPointHbondPos = info.pos;
                optimalRoute = route.slice(0);
		equivOptimalRoutes = [ route.slice(0) ];   // リフレッシュと更新
		equivOptHbondPos = [ info.fragPos ];               // リフレッシュと更新   

	    } else if ( info.h === h_max ){  // hbond数が同じになる折り方の間で, firstPointが作るhbondに差がないか.
                flag = isEachFirstPointFormHbondsDifferently(optFirstPointHbondPos, info.pos); 
		if( flag ) {
		    // Conformationを覚えておく.
		    firstPointHbondPos.push( info.pos );
		}
		equivOptimalRoutes.push( route.slice(0) );  // ルート,
		equivOptHbondPos.push( info.fragPos );             // hbond の情報を保存
            }

	    // 描画状態の復元( あとで!! )
	    // overCtx.putImageData(img, 0, 0)

	    route.pop(); // 最端を取り出す.
	    return ;  //  [routeの長さがdeltaに達した].
        }	
	// 葉でないならば....
        else {
	    // knotの周りの空点を列挙して配列に
            var nextEmptyPoints = findEmptyPoints( knot );
            var i;
	    
	    // routeに含まれる点は, nextEmptyPointsから除外する.
	    for (i = nextEmptyPoints.length -1 ; 0 <= i ; i--){
		if ( isInRoute( nextEmptyPoints[i] )    ){
		    nextEmptyPoints.splice(i, 1);
		}
	    }

            // それぞれの空点を再帰的に呼び出す.
	    for(i=0; i<nextEmptyPoints.length ; i++){
		folding( nextEmptyPoints[i] );
	    }
	}
	route.pop(); // 最端を取り出す.
	return ;  // [周りの点すべての処理終了] or [routeの長さがdeltaに達した].
    };

    // ここで処理開始
    folding( firstPoint );

    return {
	maxHB              :  h_max,  
        optFoldingRoute    :  optimalRoute,
	equivOptRoutes     :  equivOptimalRoutes,
	equivOptHbondPos   :  equivOptHbondPos,
	hbondOpposite      :  optFirstPointHbondPos,
	firstPointHbondPos :  firstPointHbondPos,
	nonDetFlag         :  flag
    }
};

// 1step の最適化を行う.
// OSVars.w_pathの一番先の次の高分子が, どこに固定されるか決定する.
// 引数p は, 既に固定されている最先端の高分子の位置座標.
var optimize = function( p ){

    // document.writeln('はじめに,  [' + p.x + ', ' +  p.y + ']のまわりの空点を探す<br><br>');

    var firstEmptyPoints = findEmptyPoints( p );
    var step = OSVars.step;
    var info;
    var i, j, max_h_num = -1;  // max_h_numは, pまわりの点1つごとに変化する, 最大hbond数
    var optFirstPoint;         // 最適化されるべき鎖の一番初めの点の位置(暫定で最適)を記録する.
    
    var optFoldingRoute;                // 形成可能なhbondが最大な折り方(暫定)を記録.
    var foldingRoutesInNonDet = [];     // 最適性が同じFPが複数あるとき, それぞれの折り方をここに保存する
    
    var optFirstPointHbondOpposite = 0;
    var hbondPosInNonDet = [];     // 最適性が同じFPが複数あるとき, それぞれのHbondの情報を保存
    var firstPointBondingPatterns = [];
    var firstPointBondNum=0;
    
    var non_deterministic_flag = false;  // 最大hbond数になる折り方が複数あるか
    var firstPointPositioning = false;   // firstPointの位置から決めることが出来ないか.
    
    ////////
    // firstEnptyPoints内それぞれについて, 折り方を網羅する.
    for(i=0; i< firstEmptyPoints.length; i++){
	
	// 最初の点だけ固定して, 折り方を網羅. その中で最適なものを取り出す.
	// オブジェクトリテラルで返り値をもらう(maxHB, optFoldingRoute, ...).
	info = enumFoldings(  firstEmptyPoints[i]  );

	// 最大値との比較, 最大値の更新
	if( info.maxHB > max_h_num ){
	    max_h_num = info.maxHB;
	    optFirstPoint = firstEmptyPoints[i]; // optFirstPointを置き換える

	    optFoldingRoute = info.optFoldingRoute;
	    optFirstPointHbondOpposite = info.hbondOpposite;

	    foldingRoutesInNonDet = []; // リフレッシュ
	    hbondPosInNonDet = [] ;
	    for(j=0; j < info.equivOptRoutes.length; j++){
		foldingRoutesInNonDet.push( info.equivOptRoutes[j] );  // 新たに追加
		hbondPosInNonDet.push( info.equivOptHbondPos[j] );
	    }


	    if (  info.nonDetFlag  ) {  // フラグ更新
		non_deterministic_flag = true;
		firstPointBondingPatterns = info.firstPointHbondPos;  // 複数のfirstPointパターンを保存する.
	    } else {
		non_deterministic_flag = false; 
	    }
	    firstPointPositioning = false;

	}
	// '現在の最大hbond数'に等しくなるfirstPointが複数有るなら,
	// 非決定性フラグを立てる.
	else if( info.maxHB === max_h_num ){
            non_deterministic_flag = true;
	    firstPointPositioning = true;
	    for(j=0; j < info.equivOptRoutes.length; j++){
		foldingRoutesInNonDet.push( info.equivOptRoutes[j] );
		hbondPosInNonDet.push( info.equivOptHbondPos[j] );
	    }
	}
    }
    
    // 最大hbond数となる折り方が複数ある場合は, 停止させる(falseを返す).
    if( non_deterministic_flag ){
	console.log('non deterministic !!');
	console.log('simulator stopped, ');
	console.log('during optimization of bead index ... ( ' + step  + ' )');
	console.log('multiple conformations where maxHB is ... ( ' + max_h_num + ' )' );

	if( firstPointPositioning ){
	    console.log('can not even fix first-point position.'); 	    
	    var routes = foldingRoutesInNonDet;
	    nonDetRoutes = routes;                 // グローバル変数に参照を渡す.
	    nonDetHbonds = hbondPosInNonDet;       // (Canvasへの描画に使う)
	    
	    console.log( nonDetHbonds );
	    
	    /*
	    for ( i=0 ; i < routes.length ; i++) {
		console.log( 'route [' + i + ']' ); 
		for ( j=0 ; j < routes[i].length ; j++ ) {
                    console.log( '(' + routes[i][j].x  + ', ' +  routes[i][j].y + ')' );
		}
	    }
	    */
	} else {
	    console.log('successfully fixed first-point position.');
	    console.log('but, can not determine h-bonds of first-point'); 
	    console.log('firstPoint : [' + optFirstPoint.x + '][' + optFirstPoint.y + ']'); 

	    for(i=0; i< firstPointBondingPatterns.length; i++) {
		console.log('pattern(index) ' + i); 
		for(j=0; j< firstPointBondingPatterns[i].length; j++){
		    console.log( firstPointBondingPatterns[i][j].index);  
		}
	    }
	}
	return false;
    }

    //  最適化終了. 
    //////////////////////////////////

    // w_path の最後尾に, 最適化で決定した次の高分子の位置を加える.
    OSVars.w_path[ step ] = optFirstPoint;
    
    // Canvas上にも反映する(Hbond以外).
    var overCtx = document.getElementById('overCanvas').getContext('2d');
    drawBeadType(optFirstPoint.x, optFirstPoint.y, OSVars.word[step], overCtx);
    drawChain(OSVars.w_path[ step - 1 ], optFirstPoint, overCtx);
    drawBeadCircle(optFirstPoint.x, optFirstPoint.y, overCtx);

    var optX = optFirstPoint.x;
    var optY = optFirstPoint.y;    
    // 最適構造において, firstPointがhbondを結ぶなら, その情報を反映する(Canvas上へも).
    for (i=0; i< optFirstPointHbondOpposite.length; i++ ){
	var opposite = optFirstPointHbondOpposite[i];
	OSVars.occupied[ opposite.x ][ opposite.y ].bondNum += 1;   // 相手のbondNum加算
	firstPointBondNum += 1;                                     // 自分のbondNUm加算
	OSVars.hbonds.push( [{x: optX, y: optY }, {x: opposite.x, y: opposite.y }] );  // 全hbond情報の更新
	
	drawHbond(optFirstPoint,opposite, overCtx);
    }
    // update occupied
    OSVars.occupied[ optX ][ optY ] = {
        index    :   step,
        beadType :   OSVars.word[ step ],
        bondNum  :   firstPointBondNum
    };
    return true; // 正常終了
};

// シミュレーターを起動. 最適化を1stepずつ呼び出す.
var runSimu = function (){
    var p;
    
    // optimize()の返り値がfalseでない限り,
    // 最適化の処理を繰り返す.
    var st = true, cnt = 0;
    while( OSVars.step < OSVars.cons.len ) {
	p = OSVars.w_path[ OSVars.step - 1 ];     // [固定された鎖の一番先端] を pとする
	st = optimize( p );    //  p の次を最適化する.
	if( !st ) { break; }
	(OSVars.step)++;
	cnt++;
    }

    if (  OSVars.cons.len  == OSVars.step ) { 
	console.log('最終構造まで Deterministic !!');  
    }
    
    return st;
};


// 
// 座標の情報（占有の有無）を入れた配列を,１列(行)広げる.
var expandGrid = function (expandWidth, expandHeight) {

  // document.writeln( 'Grid expansion occured !! <br>' );
  // メモリが無くなったときの例外処理を追加すべきかもしれない.

  var i;  
  if( expandWidth ){  // X軸方向の拡張
    for(i=0; i < expandWidth; i++){
      OSVars.occupied.push( initArray(OSVars.oc_size.y ,false) );
    }
    OSVars.oc_size.x += expandWidth;
  }

  if ( expandHeight ){  // Y軸方向の拡張(すべてのxについて行う必要がある)
    for(i=0; i < expandHeight ; i++){
      for(j=0; j < OSVars.oc_size.y; j++){
        OSVars.occupied[j].push( false ); 
      }
    }
    OSVars.oc_size.y += expandHeight; 
  }
};

// 座標上の点が高分子によって占有されているか調べる関数.
// この関数は, 本物のoccupied配列を参照する.
////  第3引数adjにtrueが入ると, 
////  現在占有されている点の隣以外へのアクセスに関しては
////  occupied配列の拡張は行わないようになる.
var isOccupied = function ( x, y, adj){
  
    var delta = OSVars.cons.delta; 
    var expandVolume = 3*delta ;// 座標空間の拡大は, 3*dだけおこなう    

  // 指定した座標のデータが存在しないなら, occupiedを拡張する.
  // どれくらい拡張すべきだろうか(16? 32? 64?)
  if( OSVars.oc_size.x <= x   ){
      if( !adj ) { expandGrid(expandVolume, 0); }

      else { 
          if( (OSVars.oc_size.x - x) === 0 ){
            expandGrid(expandVolume, 0);  
          }   
      }
      return false;  // 占有されていないのでfalseを返す.
  } 
  else if( OSVars.oc_size.y  <= y ){

      if( !adj ) { expandGrid(0, expandVolume); }

      else {
          if( (OSVars.oc_size.y - y) === 0 ){
            expandGrid(0, expandVolume); 
          }
      }
      return false;  // 占有されていないのでfalseを返す.
  } 

  // 占有されているか調べる.
  else {
      // この部分は1202に追加. 暫定的な編集. 
      if( x < 0  ||  y < 0 ){  
	  console.log('out of grid is accessed  ( x < 0  or  y < 0 )');
	  return false; 
      }
      return OSVars.occupied[x][y];
  }

  // function命令で関数定義.下に定義しても上で使える.
  function test(){ 
    document.writeln('[' + x + ', ' + y + '] is occupied??<br>');
    document.writeln('Checking occupied[' + x + '][' + y + '].<br>');
  };

};
