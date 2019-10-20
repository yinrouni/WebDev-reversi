defmodule Reversi.Game do 
  def new() do 
    %{
      present: initTiles(),
      timeCount: 0,
      turn: nil,
      text: "",
      player1: nil, 
      player2: nil, 
      players: [],
      gameStatus: "waiting",
      undoStack: []
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
    if (user == game[:player1] && game[:gameStatus] != "waiting") do 
      newRow = Enum.at(present, row) |> List.replace_at(col, "black")
      newTurn = "white"
      npresent = List.replace_at(present, row, newRow)
      game = game |> Map.put(:present, npresent)
	   |> Map.put(:turn, newTurn)
      IO.inspect(game)
      game
    else
    if (user == game[:player2]) do 
      newRow = Enum.at(game.present, row) |> List.replace_at(col, "white")
      newTurn = "black"
      npresent = List.replace_at(present, row, newRow)
      game = Map.put(game, :present, npresent)
	   |> Map.put(:turn, newTurn)
      game
     else 
      game
    end
    end
  end 
  
  def joinP(game, user) do
    game1 = game
    if (game[:player1] == nil) do
      game = Map.put(game, :player1, user)
      game
    else 
      if (game[:player2] == nil) do 
        game = Map.put(game,:player2, user)|>Map.put(:gameStatus, "on")
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
end
   
        


