import React from "react";
import ReactDOM from "react-dom";
import Konva from 'konva';
import _ from "lodash";
import { Stage, Layer, Circle, Rect } from 'react-konva';
export default function game_init(root, channel, user) {
	ReactDOM.render(<Reversi channel={channel} user={user} />, root);
}


let OFFSET=40;
let RADIUS=26;
let SIZE=60;

function Tile(props){
  var x = (props.row + 0.5)*SIZE + OFFSET;
  var y = (props.column + 0.5)*SIZE +OFFSET;
  return <Circle radius={RADIUS} x={x} y={y} fill = {props.color} stroke = "black" strokeWidth={1} />;
}

function Square(props){
  return <Rect x={OFFSET + SIZE * props.row} y={OFFSET + SIZE * props.column} 
	width = {SIZE} height={SIZE} fill="green" stroke="black" strokeWidth={1} 
	onClick={()=>props.onClick(props.row, props.column)} />; 
}

function Chat(props){
  return <div id ="chat">
		<div id="text">{props.text}</div>
		<br />
		<form>
  		<input type="datetime-local" name="bdaytime" />
 		 <input type="submit" value="Send" />
		</form>
		</div>;
}

function StatusButtons(props){
  if (props.gameStatus == "waiting"){
// Add onclick handler
    return <button id="join" onClick={()=>props.onClick("join")}> Join the Game </button>;
  }
  else {
    return <div>
		  <button id='resignation'>Resingnation</button>
	  	<button id='undo'>Undo</button>
	</div>;
  }
}

class Reversi extends React.Component {
  constructor(props){
    super(props);
this.channel = props.channel;
   this.user = props.user; 
    this.state = {
	    present: null,
	    timeCount: 0,
	    turn: null,
	    text: "display",
	    player1: null, 
	    player2: null, 
	    players:[],
	    gameStatus:"waiting",
	    undoStack:[],
    };
	  this.channel.on("update", this.got_view.bind(this));
	  this.channel
	      .join()
	      .receive("ok", this.got_view.bind(this))
	      .receive("error", resp => {console.log("Unable to join", resp);});
  }

  initTiles(){
    var ret = [];
    for (var i = 0; i < 8; i++){
      var row = [];
      for (var j = 0; j < 8; j++){
        row.push(null);
      }
      ret.push(row);
    }
    ret[3][4] = "white";
    ret[4][3] = "white";
    ret[3][3] = "black";
    ret[4][4] = "black";

    return ret;
  }

  initialize(){
    var board =[];
    var colors = this.state.present;
    for (var j = 0; j < 8; j ++){
      for (var i = 0; i < 8; i++){
      	board.push(<Square row={i} column={j} key={i*8+j} onClick={(i, j)=>this.handleClick(i,j)}/>);
	/*if (colors[j][i] != null){
	  borad.push(<Tile color={colors[j][i]} row={i} column={j} key={i*8+n+64} />);
	}*/
      }
    }
    for (var m = 3; m < 5; m ++){
      for (var n = 3; n < 5; n ++){
	if (m==n){
      	  board.push(<Tile color="black" row={m} column={n} key={m*8+n+64} />);
        }
	else{
	  board.push(<Tile color="white" row={m} column={n} key={m*8+n+64} />);
	}
      }
    }
    return board;
  }
/*
  renderTiles(){
    var tiles = [];
    for (var j = 0; j < 8; j++){
      for (var i = 0; i < 8; i++){
        if (this.state.present[i][j] != null){
	  tiles.push(<Tile color={colors[i][j]} row={i} column={j} key={j*8+i+64} />)
	}
      }
    }
    return tiles;
  
  }*/
  handleClick(i, j){
    this.channel.push("click", {user: this.user, row: i, col: j})
	.receive("ok", this.got_view.bind(this));
    console.log("click"+i+"/"+j);
  }
    clickButton(mes){
	  this.channel.push(mes, {user: this.user})
	  		.receive("ok", this.got_view.bind(this));
	  } 
  

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
  }
  render(){
    return <div id="overall">
      <Stage width={600} height={600}>	
        <Layer>
          {this.initialize()}
	</Layer>
      </Stage>
      <StatusButtons gameStatus={this.state.gameStatus} onClick={(mes)=>this.clickButton(mes)}/>
      <Chat text={this.state.text} />
    </div>;
  }
}
