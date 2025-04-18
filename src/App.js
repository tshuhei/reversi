import React, { useState } from 'react';
import './App.css';

const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

function getInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function getOpponent(player) {
  return player === BLACK ? WHITE : BLACK;
}

function isOnBoard(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function getValidMoves(board, player) {
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  const validMoves = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] !== EMPTY) continue;
      for (let [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let hasOpponent = false;
        while (isOnBoard(nx, ny) && board[nx][ny] === getOpponent(player)) {
          nx += dx;
          ny += dy;
          hasOpponent = true;
        }
        if (hasOpponent && isOnBoard(nx, ny) && board[nx][ny] === player) {
          validMoves.push([x, y]);
          break;
        }
      }
    }
  }
  return validMoves;
}

function flipDiscs(board, x, y, player) {
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  let flipped = false;
  for (let [dx, dy] of directions) {
    let nx = x + dx, ny = y + dy;
    const discsToFlip = [];
    while (isOnBoard(nx, ny) && board[nx][ny] === getOpponent(player)) {
      discsToFlip.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    if (discsToFlip.length > 0 && isOnBoard(nx, ny) && board[nx][ny] === player) {
      for (let [fx, fy] of discsToFlip) {
        board[fx][fy] = player;
      }
      flipped = true;
    }
  }
  return flipped;
}

function countDiscs(board) {
  let black = 0, white = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === BLACK) black++;
      else if (cell === WHITE) white++;
    }
  }
  return { black, white };
}

function App() {
  const [board, setBoard] = useState(getInitialBoard());
  const [player, setPlayer] = useState(BLACK);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const validMoves = getValidMoves(board, player);

  function handleClick(x, y) {
    if (gameOver) return;
    if (!validMoves.some(([vx, vy]) => vx === x && vy === y)) return;
    const newBoard = cloneBoard(board);
    newBoard[x][y] = player;
    flipDiscs(newBoard, x, y, player);
    setHistory([...history, { board: cloneBoard(board), player }]);
    const nextPlayer = getOpponent(player);
    if (getValidMoves(newBoard, nextPlayer).length > 0) {
      setBoard(newBoard);
      setPlayer(nextPlayer);
    } else if (getValidMoves(newBoard, player).length > 0) {
      setBoard(newBoard);
      // same player again (opponent pass)
    } else {
      setBoard(newBoard);
      setGameOver(true);
    }
  }

  function handleRestart() {
    setBoard(getInitialBoard());
    setPlayer(BLACK);
    setHistory([]);
    setGameOver(false);
  }

  const { black, white } = countDiscs(board);

  let status;
  if (gameOver) {
    if (black > white) status = '黒の勝ち！';
    else if (white > black) status = '白の勝ち！';
    else status = '引き分け！';
  } else {
    status = player === BLACK ? '黒の番' : '白の番';
    if (validMoves.length === 0) status += '（パス）';
  }

  return (
    <div className="container">
      <h1>オセロ</h1>
      <div className="status">{status}</div>
      <div className="score">● {black}　○ {white}</div>
      <div className="board">
        {board.map((row, x) => (
          <div className="board-row" key={x}>
            {row.map((cell, y) => {
              const isValid = validMoves.some(([vx, vy]) => vx === x && vy === y);
              return (
                <button
                  key={y}
                  className={
                    'cell' +
                    (cell === BLACK ? ' black' : cell === WHITE ? ' white' : '') +
                    (isValid && !gameOver ? ' valid' : '')
                  }
                  onClick={() => handleClick(x, y)}
                  disabled={gameOver || !isValid}
                >
                  {cell === BLACK ? '●' : cell === WHITE ? '○' : isValid && !gameOver ? '・' : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button className="restart" onClick={handleRestart}>リスタート</button>
      <div className="credit">© {new Date().getFullYear()} オセロWebアプリ</div>
    </div>
  );
}

export default App;
