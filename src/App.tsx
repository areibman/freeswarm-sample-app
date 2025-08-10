import type React from 'react';
import { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [gameMode, setGameMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (squares: Board): { winner: Player; line: number[] | null } => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: pattern };
      }
    }
    return { winner: null, line: null };
  };

  const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);

    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (squares.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Number.POSITIVE_INFINITY;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: Board): number => {
    if (difficulty === 'easy') {
      // Easy mode: random move with 30% chance of best move
      if (Math.random() < 0.3) {
        return getMinimaxMove(squares);
      }
      const availableMoves = squares.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      // Hard mode: always best move
      return getMinimaxMove(squares);
    }
  };

  const getMinimaxMove = (squares: Board): number => {
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const move = getBestMove(newBoard);
        if (move !== -1) {
          newBoard[move] = 'O';
          setBoard(newBoard);

          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setScore(prev => ({
              ...prev,
              [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
            }));
          } else if (newBoard.every(cell => cell !== null)) {
            setWinner('O'); // Draw
          } else {
            setCurrentPlayer('X');
          }
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, winner, difficulty]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'pvc' && currentPlayer === 'O')) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScore(prev => ({
        ...prev,
        [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
      }));
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('O'); // Draw
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  const resetScore = () => {
    setScore({ X: 0, O: 0 });
    resetGame();
  };

  const isDraw = winner === 'O' && board.every(cell => cell !== null);

  return (
    <div className="min-h-screen bg-te-white te-ambient-light grid-pattern flex flex-col items-center justify-center p-4 perspective-1000">
      {/* Main Hardware Panel Container */}
      <div className="te-hardware-panel te-float max-w-lg w-full p-8 transform transition-all duration-500">
        
        {/* Header with 3D effect */}
        <div className="mb-8 te-interactive">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-te-black/50 te-bezel px-2 py-1 rounded">TE-01</div>
            <div className="text-xs uppercase tracking-wider text-te-black/50 te-bezel px-2 py-1 rounded">V1.0</div>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2 transform transition-transform hover:scale-105">
            Tic Tac Toe
          </h1>
          <div className="h-1 bg-gradient-to-r from-te-orange via-te-black to-te-orange shadow-te-raised" />
        </div>

        {/* Game Mode Selector with 3D buttons */}
        <div className="mb-8">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium rounded transition-all duration-200 ${
                gameMode === 'pvp'
                  ? 'te-orange-button text-te-white shadow-te-deep'
                  : 'te-hardware-button text-te-black'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium rounded transition-all duration-200 ${
                gameMode === 'pvc'
                  ? 'te-orange-button text-te-white shadow-te-deep'
                  : 'te-hardware-button text-te-black'
              }`}
            >
              Player vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-3 animate-grid-appear">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium rounded transition-all duration-200 ${
                  difficulty === 'easy'
                    ? 'te-black-button text-te-white shadow-te-deep'
                    : 'te-hardware-button text-te-black'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium rounded transition-all duration-200 ${
                  difficulty === 'hard'
                    ? 'te-black-button text-te-white shadow-te-deep'
                    : 'te-hardware-button text-te-black'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>

        {/* Score Display with hardware panel styling */}
        <div className="mb-8 te-interactive">
          <div className="te-bezel p-6 rounded-lg">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">Player X</div>
                <div className="text-3xl font-bold te-hardware-panel rounded-lg py-2 px-4 shadow-te-inset">
                  {score.X}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">Draw</div>
                <div className="text-3xl font-bold te-hardware-panel rounded-lg py-2 px-4 shadow-te-inset">
                  -
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">
                  {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
                </div>
                <div className="text-3xl font-bold te-hardware-panel rounded-lg py-2 px-4 shadow-te-inset">
                  {score.O}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board with enhanced 3D effects */}
        <div className="relative mb-8 flex justify-center">
          <div className="te-bezel p-4 rounded-xl">
            <div className="te-game-board grid grid-cols-3 gap-1 bg-te-dark-gray p-2 rounded-lg shadow-te-deep animate-grid-appear">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                  className={`
                    te-cell w-28 h-28 bg-te-white flex items-center justify-center rounded-md
                    transition-all duration-200 relative overflow-hidden shadow-te-hardware
                    ${!cell && !winner ? 'hover:shadow-te-raised cursor-pointer' : ''}
                    ${winningLine?.includes(index) ? 'bg-te-orange/20 animate-glow' : ''}
                  `}
                >
                  {cell && (
                    <span
                      className={`
                        text-6xl font-bold animate-mark-appear transform transition-transform
                        ${cell === 'X' ? 'text-te-black' : 'text-te-orange'}
                        ${winningLine?.includes(index) ? 'text-shadow-glow scale-110' : ''}
                      `}
                    >
                      {cell}
                    </span>
                  )}
                  
                  {/* Cell depth indicator */}
                  <div className="absolute inset-0 rounded-md border border-te-black/10 pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Display with floating effect */}
        <div className="mb-8 te-float">
          <div className="te-hardware-panel p-6 rounded-lg shadow-te-raised">
            {winner ? (
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-3 text-te-black/50">
                  {isDraw ? 'Game Draw' : 'Winner'}
                </div>
                <div className={`text-3xl font-bold transform transition-all duration-300 ${
                  isDraw ? 'text-te-black' : 'text-te-orange animate-pulse'
                }`}>
                  {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-3 text-te-black/50">Current Turn</div>
                <div className={`text-3xl font-bold transition-all duration-300 ${
                  currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'
                }`}>
                  <span className="inline-block transform transition-transform hover:scale-110">
                    {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons with enhanced 3D effects */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={resetGame}
            className="flex-1 te-black-button text-te-white py-4 px-6 text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 hover:animate-tilt"
          >
            <span className="block transform transition-transform group-hover:scale-105">
              New Game
            </span>
          </button>
          <button
            onClick={resetScore}
            className="flex-1 te-hardware-button text-te-black py-4 px-6 text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 hover:animate-tilt"
          >
            <span className="block transform transition-transform group-hover:scale-105">
              Reset Score
            </span>
          </button>
        </div>

        {/* Hardware-style indicators */}
        <div className="flex justify-center gap-4 mb-6">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            gameMode === 'pvp' ? 'bg-te-orange shadow-te-button animate-glow' : 'bg-te-gray shadow-te-inset'
          }`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            gameMode === 'pvc' ? 'bg-te-orange shadow-te-button animate-glow' : 'bg-te-gray shadow-te-inset'
          }`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            !winner && currentPlayer === 'X' ? 'bg-te-black shadow-te-button animate-pulse' : 'bg-te-gray shadow-te-inset'
          }`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            !winner && currentPlayer === 'O' ? 'bg-te-orange shadow-te-button animate-pulse' : 'bg-te-gray shadow-te-inset'
          }`} />
        </div>

        {/* Footer with subtle 3D effect */}
        <div className="text-center te-interactive">
          <div className="text-xs uppercase tracking-wider text-te-black/30 transform transition-all hover:text-te-black/50 hover:scale-105">
            teenage engineering × tic tac toe
          </div>
        </div>
      </div>

      {/* Ambient floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-te-orange/20 rounded-full te-float" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-te-black/10 rounded-full te-float" />
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-te-orange/15 rounded-full te-float" />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-te-black/5 rounded-full te-float" />
      </div>
    </div>
  );
};

export default App;
