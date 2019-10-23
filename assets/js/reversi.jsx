import React from "react";
import ReactDOM from "react-dom";
import Konva from 'konva';
import _ from "lodash";
import { Stage, Layer, Circle, Rect } from 'react-konva';
export default function game_init(root, channel, user) {
	ReactDOM.render(<Reversi channel={channel} user={user} />, root);
}


let OFFSET=60;
let RADIUS=26;
let SIZE=60;

function Tile(props){
  var x = (props.row + 0.5)*SIZE + OFFSET;
  var y = (props.column + 0.5)*SIZE +OFFSET;
  return <Circle radius={RADIUS} x={x} y={y} fill = {props.color} stroke = "black" strokeWidth={1} />;
}
function tiles(props){
  var t = []
  for (var j = 0; j < 8; j++){
    for (var i = 0; i < 8; i++){
        var x = (j + 0.5)*SIZE + OFFSET;
        var y = (i + 0.5)*SIZE +OFFSET;
	t.push(<Circle radius={RADIUS} x={x} y={y} 
		fill = {props.tiles[i][j]} stroke = "black" strokeWidth={1} />);

    }
  }
  return t;
}

function Square(props){
  return <Rect x={OFFSET + SIZE * props.row} y={OFFSET + SIZE * props.column} 
	width = {SIZE} height={SIZE} fill="green" stroke="black" strokeWidth={1} 
	onClick={()=>props.onClick(props.row, props.column)} />; 
}

function Turn(props){
  var turn = props.turn
  if (turn == "black"){
    return [<Circle radius={RADIUS/3} x={0.5 * SIZE + OFFSET} y={-0.7*SIZE+OFFSET} fill="black" stroke= "red" strokeWidth={2} key="k1"/>,
		  <Circle radius={RADIUS/3} x={0.5 * SIZE + OFFSET} y={-0.25 * SIZE + OFFSET} fill="white" stroke="black" strokeWidth={1} key="k2" />];
  }
  else if (turn == "white"){
    return [<Circle radius={RADIUS/3} x={0.5 * SIZE + OFFSET} y={-0.7*SIZE+OFFSET} fill="black" stroke="black" strokeWidth={1} key="k3"/>,
	  <Circle radius={RADIUS/3} x={0.5*SIZE+OFFSET} y={-0.25 *SIZE+OFFSET} 
	    fill="white" stroke="red" strokeWidth={2} key="k4"/>]
  }
}

function Chat(props){
  return <div id ="chat">
		<div id="text">{props.text}</div>
		<br />
		<form>
  		<input type="text" name="chatText" id="input" action="return false;" method="GET"/>

 		 <input type="button" value="Send" onClick={()=>{
			 props.onClick(document.getElementById("input").value);
		 document.getElementById("input").value = '' ;}}/>
		</form>
		</div>;
}

function StatusButtons(props){
  if (props.gameStatus == "waiting"){
// Add onclick handler
    return <button id="join" onClick={()=>props.onClick("joinP")}> Join the Game </button>;
  }
  else {
    return <div>
		  <button id='resignation'>Resignation</button>
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
	    present: this.initTiles(),
	    timeCount: 0,
	    turn: "black",
	    text: "",
	    player1: null, 
	    player2: null, 
	    players:[],
	    gameStatus:"waiting",
	    undoStack:[],
    };
	  
	  this.channel.on("update", (game) => {
    this.setState(game);
    console.log("update");
    });
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
    console.log(colors);
    console.log(this.state.gameStatus);
    for (var j = 0; j < 8; j ++){
      for (var i = 0; i < 8; i++){
      	board.push(<Square row={i} column={j} key={i*8+j} onClick={(i, j)=>this.handleClick(i,j)}/>);
	//board.push(<Tile color={colors[j][i]} row={i} column={j} key={m*8+n+64} />);	
	      if (colors[j][i] != null){
	  board.push(<Tile color={colors[j][i]} row={i} column={j} key={i*8+j+64} />);
	}
      }
    }
       return board;
  }
  handleClick(i, j){
    this.channel.push("click", {user: this.user, row: j, col: i})
	.receive("ok", this.got_view.bind(this));
    console.log("click"+i+"/"+j);
  }
    clickButton(mes){
	  this.channel.push(mes, {user: this.user})
	  		.receive("ok", this.got_view.bind(this));
	  } 
  sendButton(txt){
    this.channel.push("send", {user: this.user, txt: txt})
	  .receive("ok", this.got_view.bind(this));
    console.log("send " + txt);
  }

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
    console.log(this.state.text);
  }
 
  showTurn() {
    return <Turn turn={this.state.turn} />
  
  }
  render(){
    return <div id="overall">
      <Stage width={600} height={600}>	
        <Layer>
	  {this.showTurn()}
          {this.initialize()}
	</Layer>
      </Stage>
      <StatusButtons gameStatus={this.state.gameStatus} onClick={(mes)=>this.clickButton(mes)}/>
      <p id="player1">{this.state.player1}</p>
      <p id="player2">{this.state.player2}</p>
      <p id="watch">watches: {this.state.players.length}</p>
      <Chat text={this.state.text} onClick={(txt)=>this.sendButton(txt)}/>
    </div>;
  }
}
