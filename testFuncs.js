// <testFuncs.js>
// occupied配列, ruleset配列などの内容を表示するための関数群.
/////////////////////////////


//1つ改行
function br1(){  document.writeln('<br>');}
// 2つ改行
function br2(){  document.writeln('<br><br>');}


// 配列occupiedを, 配列要素ごとに表示
function show_occupied_in_elm(){
  var i,j;
  var lenX = OSVars.oc_size.x;
  var lenY = OSVars.oc_size.y;

  for(i=0; i < lenX ; i++){
    for(j=0; j < lenY ; j++){
      if( OSVars.occupied[i][j] != undefined ){
        document.writeln( OSVars.occupied[i][j] + ' ' );
      }
      else {
        document.writeln( '--');      
      }
    } 
    document.writeln( '<br>' );
  }
}

// 配列要素を順番に取り出して0/1で表現
function show_occupied_in_binary(){
  var i, str='';
  var lenX = OSVars.oc_size.x;
  var lenY = OSVars.oc_size.y;  

  for(i=0; i < lenX ; i++, str='' ){
    for(j=0; j < lenY ; j++){
      if( OSVars.occupied[i][j]  ){  str = str.concat( '1' ); }
      else                        {  str = str.concat( '0' ); }
    }
    document.writeln( str );
    document.writeln('<br>');
  }
}

// 配列要素を, 横がx, 縦がyになるように順に取り出して0/1で表現
function show_occupied_in_binary_2(){
  var i, str='', s='';
  var lenX = OSVars.oc_size.x;
  var lenY = OSVars.oc_size.y;  

    for(i=0; i < lenY ; i++, str='', s='' ){
      
      if ( i<10 ) { s = s.concat( '0' );  }
      s = s.concat(  i.toString(10)  );
      document.writeln(s + ' : ');
      for(j=0; j < lenX ; j++){
	  if( OSVars.occupied[j][i]  ){  str = str.concat( '1' ); }
	  else                        {  str = str.concat( '0' ); }
      }
      document.writeln( str );
      document.writeln('<br>');
  }
}

// 配列要素を, 横がx, 縦がyになるように順に取り出して0/1で表現
// ただし, これは最適化の際に使う分だけのコピー
function show_tmpOccupied_in_binary_2( cPoint, occupied ){
    var i, str='', s='';
    var lenX = OSVars.cons.delta+1;
    var lenY = OSVars.cons.delta+1;

    for(i= (cPoint.y-lenY) ; i <= (cPoint.y + lenY) ; i++, str='', s='' ){
      
	if ( i<10 ) { s = s.concat( '0' );  }
	s = s.concat(  i.toString(10)  );
	document.writeln(s + ' : ');
	document.writeln('<tt>');
	for(j= (cPoint.x-lenX); j <= (cPoint.x + lenX) ; j++){
	    if( occupied[j][i]  )                   {  str = str.concat( '1' ); }
	    else if ( occupied[j][i] !== undefined ){  str = str.concat( '0' ); }
	    else                                    {  str = str.concat( 'x' ); }
	}
	document.writeln( str );
	document.writeln('</tt>');
	document.writeln('<br>');
    }
}


// rulesetの内容を出力. 行列の形で.
function show_ruleset(){
  var rs = OSVars.ruleset, i,j;
  var size = rs.length;

  for(i=0; i<size; i++){ document.writeln('------');}
  br1();
  for(i=0; i<size; i++){
    for(j=0; j<size; j++){
      document.writeln( rs[i][j] );  
    }
    br1();
  }
  for(i=0; i<size; i++){ document.writeln('------');}
}


