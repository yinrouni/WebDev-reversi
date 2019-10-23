defmodule Reversi.Game do 
  def new() do 
    %{
      present: initTiles(),
      timeCount: 0,
      turn: "black",
      text: "",
      player1: nil, 
      player2: nil, 
      players: [],
      gameStatus: "waiting",
      undoStack: [], 
    }
  end
  
  def initTiles() do 
   present =
	 List.duplicate(nil, 8)|>List.duplicate(8)
    
   row3 = Enum.at(present, 3)|>List.replace_at(4, "white")|>List.replace_at(3, "black")
   row4 = Enum.at(present, 4)|>List.replace_at(3, "white")|>List.replace_at(4, "black")
   present = List.replace_at(present, 3, row3)|>List.replace_at(4, row4)
   
   present
  end 

  def client_view(game) do 
     pre = game[:present]
     tc = game[:timeCount]
     txt = game[:text]
     tn = game[:turn]
     ps= game[:players]
     p1 = game[:player1]
     p2 = game[:player2]
     gs = game[:gameStatus]
     us = game[:undoStack]
%{
      present: pre,
      timeCount: tc,
      turn: tn,
      text: txt,
      player1: p1,
      player2: p2,
      players: ps,
      gameStatus: gs,
      undoStack: us, 

}


  end 
  
  def click(game, user, row, col) do
    present = game[:present]
    if (user == game[:player1] && game[:gameStatus] != "waiting" && checkEmpty(present,row,col) && validMove(game,row,col,"black") && game.turn == "black") do
      flips = getFlips(present,row,col,"black")
      npresent = flipTiles(flips,present,"black") 
      newRow = Enum.at(npresent, row) |> List.replace_at(col, "black")
      newTurn = "white"
      npresent = List.replace_at(npresent, row, newRow)
      game = game |> Map.put(:present, npresent)
	   |> Map.put(:turn, newTurn)
      IO.inspect(game)
      game
    else
      if (user == game[:player2] && checkEmpty(present,row,col) && validMove(game,row,col,"white") && game.turn == "white") do
        flips = getFlips(present,row,col,"white")
        npresent = flipTiles(flips,present,"white")         
        newRow = Enum.at(npresent, row) |> List.replace_at(col, "white")
        newTurn = "black"
        npresent = List.replace_at(npresent, row, newRow)
        game = Map.put(game, :present, npresent)
	     |> Map.put(:turn, newTurn)
        game
      else 
        game
      end
    end
  end 

  def checkEmpty(present,row,col) do
    Enum.at(present,row) |> Enum.at(col) == nil
  end
  
  def user_join(game, user) do
    if (!Enum.any?(game.players,fn x-> x== user end))do  
      newplayers = [user|game.players] 
      newGame = Map.put(game,:players, newplayers) |> Map.put(:text, game.text<>"[" <>user<>" joined the game]\n")
      IO.inspect(newGame)
      newGame
    else 
      game
    end
  end
  def user_exit(game, user) do 
    if (Enum.any?(game.players, fn x-> x == user end)) do 
	newplayers = List.delete(game.players, user)
        newGame = Map.put(game, :players, newplayers) |> Map.put(:text, game.text<>"[" <>user<>" left the game]\n")
        newGame
    else
        game =  Map.put(game, :text, game.text<>"["<>user<>" left the game]\n")
	if (user == game.player1) do 
   	  game = Map.put(game, :gameStatus, "over") |> Map.put(:text, game.text<>"\n["<>game.player2<>" wins!!!]\n")
		|>Map.put(:player1, nil)|> Map.put(:players, [game.player2|game.players])
		|> Map.put(:player2, nil)
	 # IO.inspect(game)
        else 
	  game = Map.put(game, :gameStatus, "over")|> Map.put(:text, game.text<>"\n["<>game.player1<>" wins!!!]\n")
		|>Map.put(:player2, nil)|> Map.put(:players, [game.player1|game.players])
		|> Map.put(:player1, nil)
	  
  	end
   end

  end

  def resignation(game, loser) do
	players = [game.player1|game.players]
        nplayers = [game.player2|players]
    if (loser == game.player1) do
	game=Map.put(game, :gameStatus, "over") 
	|> Map.put(:text, game.text<>"\n["<>game.player2<>" wins!!!]\n")
	|> Map.put(:players, nplayers)
	|> Map.put(:player1, nil)|> Map.put(:player2, nil)
    else
      	game =  Map.put(game, :gameStatus, "over")
 	|> Map.put(:text, game.text<>"\n["<>game.player1<>" wins!!!]\n")
    	|> Map.put(:players, nplayers)
	|> Map.put(:player1, nil) |> Map.put(:player2, nil)
	IO.inspect(game)
    end
  end
  def reset(game, user) do 
    game |> Map.put(:present, initTiles()) |> Map.put(:gameStatus, "waiting")

  end
  

  def joinP(game, user) do
    game1 = game
    players = List.delete(game.players, user)

    if (game[:player1] == nil) do
      game = Map.put(game, :player1, user)|> Map.put(:players, players)
      game
    else 
      if (game[:player2] == nil && game[:player1] != user) do 
        game = Map.put(game,:player2, user)|>Map.put(:gameStatus, "on") 
               |> Map.put(:players, players)
        game
      else
       game
      end
    end
  end  
 
  def send(game, user, txt) do
    text = game[:text]
    text = text<> user <>": " <> txt <> "\n"
    IO.inspect(text)
    game = Map.put(game, :text, text)
    game
  end 

  def validMove(game,row,col,color) do
    length(getFlips(game.present,row,col,color)) > 0
  end

  def flipTiles([head | tail],present,color) do
    newRow = Enum.at(present, head.row) |> List.replace_at(head.col, color)
    npresent = List.replace_at(present, head.row, newRow)
    flipTiles(tail,npresent,color)    
  end

  def flipTiles([],present,color) do
    present   
  end

  def getFlips(present,row,col,color) do
    posn = %{row: row, col: col}
    lst = []
    lst
    |> Enum.concat(flipHelper(present,[],%{row: -1, col: 0},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: 1, col: 0},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: 0, col: 1},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: 0, col: -1},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: 1, col: 1},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: -1, col: -1},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: 1, col: -1},posn,color))
    |> Enum.concat(flipHelper(present,[],%{row: -1, col: 1},posn,color))
  end

  def flipHelper(present,acc,dirction,posn,color) do
    posn = %{row: posn.row + dirction.row, col: posn.col + dirction.col}
    if not checkInBoard(posn) do
      []
    else
      cond do
        Enum.at(present,posn.row)|> Enum.at(posn.col) == color ->
          acc

        Enum.at(present,posn.row)|> Enum.at(posn.col) == nil ->
          []
       
        true ->
          flipHelper(present,acc++[posn],dirction,posn,color)
      end
    end    
  end

  def checkInBoard(posn) do
    posn.row >= 0 and posn.row < 8 and posn.col >= 0 and posn.col < 7
  end
end
   
        


