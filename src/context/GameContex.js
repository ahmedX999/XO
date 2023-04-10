import { createContext, useEffect, useState, useContext } from "react";
import calcBestMove, { calcWinner } from "../helpers/calcSquares";
import { ModalContext } from "./ModalContext";

const GameContext = createContext();

const GameState = (props) => {
  const [screen, setScreen] = useState("start"); // start || game
  const [playMode, setPlayMode] = useState("user"); // user || cpu
  const [activeUser, setActiveUser] = useState("x"); // x || o
  const [squares, setSquares] = useState(new Array(9).fill(""));
  const [xnext, setXnext] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerLine, setWinnerLine] = useState(null);
  const [ties, setTies] = useState({ x: 0, o: 0 });

  const { showModal, hideModal, setModalMode } = useContext(ModalContext);

  useEffect(() => {
    //check if cpu turn
    let currentUser = xnext ? "o" : "x";
    if (playMode === "cpu" && currentUser !== activeUser && !winner) {
      cpuNextMove(squares);
    }
    if (playMode === "cpueasy" && currentUser !== activeUser && !winner) {
      cpuNextMoveeasy(squares);
    }
    checkNoWinner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xnext, winner, screen]);

  const handleStart = (player) => {
    setPlayMode(player);
    setScreen("game");
  };

  const handleSquareClick = (ix) => {
    if (squares[ix] || winner) {
      return;
    }
    let currentUser = xnext ? "o" : "x";
    if (playMode === "cpu" && currentUser !== activeUser) {
      return;
    }
    let ns = [...squares];
    ns[ix] = !xnext ? "x" : "o";
    setSquares(ns);
    setXnext(!xnext);
    checkWinner(ns);
  };

  const checkWinner = (ns) => {
    const isWinner = calcWinner(ns);
    if (isWinner) {
      setWinner(isWinner.winner);
      setWinnerLine(isWinner.line);
      const nties = { ...ties };
      nties[isWinner.winner] += 1;
      setTies(nties);
      showModal();
      setModalMode("winner");
    }
  };

  const cpuNextMoveeasy = (sqrs) => {
    let bestmove = calcBestMove(sqrs, activeUser === "x" ? "o" : "x");
    let ns = [...squares];
    ns[bestmove] = !xnext ? "x" : "o";
    setSquares(ns);
    setXnext(!xnext);
    checkWinner(ns);
  };


  const cpuNextMove = (squares) => {
    let bestmove = minimax(squares, activeUser === "x" ? "o" : "x").index;
    let ns = [...squares];
    ns[bestmove] = !xnext ? "x" : "o";
    setSquares(ns);
    setXnext(!xnext);
    checkWinner(ns);
  };
  
  const minimax = (board, player) => {
    let emptySquares = [];
    board.forEach((square, index) => {
      if (square === "") {
        emptySquares.push(index);
      }
    });
  
    // terminal states
    if (calcWinner(board)) {
      if (calcWinner(board).winner === activeUser) {
        return { score: 10 };
      } else {
        return { score: -10 };
      }
    } else if (emptySquares.length === 0) {
      return { score: 0 };
    }
  
    let moves = [];
    emptySquares.forEach((emptySquare) => {
      let move = {};
      move.index = emptySquare;
      let newBoard = [...board];
      newBoard[emptySquare] = player;
      if (player === activeUser) {
        let result = minimax(newBoard, activeUser === "x" ? "o" : "x");
        move.score = result.score;
      } else {
        let result = minimax(newBoard, activeUser);
        move.score = result.score;
      }
      moves.push(move);
    });
  
    // find the best move
    let bestMove;
    if (player === activeUser) {
      let bestScore = -Infinity;
      moves.forEach((move) => {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach((move) => {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      });
    }
  
    return bestMove;
  };
  

  const handleReset = () => {
    setSquares(new Array(9).fill(""));
    setXnext(false);
    setWinner(null);
    setWinnerLine(null);
    setActiveUser("x");
    setTies({ x: 0, o: 0 });
    hideModal();
    setScreen("start");
  };

  const handleNextRound = () => {
    setSquares(new Array(9).fill(""));
    setXnext(winner === "x");
    setWinner(null);
    setWinnerLine(null);
    hideModal();
  };

  const checkNoWinner = () => {
    const moves = squares.filter((sq) => sq === "");
    if (moves.length === 0) {
      setWinner("no");
      showModal();
      setModalMode("winner");
    }
  };

  return (
    <GameContext.Provider
      value={{
        squares,
        winner,
        winnerLine,
        xnext,
        ties,
        screen,
        activeUser,
        playMode,
        handleStart,
        setActiveUser,
        setPlayMode,
        setTies,
        handleSquareClick,
        handleReset,
        handleNextRound,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
};

export { GameContext, GameState };
