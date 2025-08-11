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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-pattern flex flex-col items-center justify-center p-4 perspective-container">
      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none scan-line opacity-30" />
      
      {/* Main Device Container */}
      <div className="max-w-2xl w-full floating-element">
        {/* Device Header */}
        <div className="hardware-surface beveled-edge p-6 mb-6 metallic-texture circuit-pattern">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-te-orange rounded-full animate-pulse led-indicator" />
              <div className="text-xs uppercase tracking-wider text-te-white/60 font-mono">TE-01</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-te-white/30 rounded-full animate-pulse" />
              <div className="text-xs uppercase tracking-wider text-te-white/60 font-mono">V1.0</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-te-white font-display">
            Tic Tac Toe
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-te-orange via-te-orange/50 to-transparent w-full" />
        </div>

        {/* Game Mode Selector */}
        <div className="hardware-surface beveled-edge p-6 mb-6 metallic-texture">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow ${
                gameMode === 'pvp'
                  ? 'hardware-button active'
                  : 'hardware-button'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow ${
                gameMode === 'pvc'
                  ? 'hardware-button active'
                  : 'hardware-button'
              }`}
            >
              Player vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-3">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow ${
                  difficulty === 'easy'
                    ? 'hardware-button active'
                    : 'hardware-button'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow ${
                  difficulty === 'hard'
                    ? 'hardware-button active'
                    : 'hardware-button'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="display-panel beveled-edge p-6 mb-6 panel-inset">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-white/50 font-mono">Player X</div>
              <div className="text-3xl font-bold text-te-white font-display">{score.X}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-white/50 font-mono">Draw</div>
              <div className="text-3xl font-bold text-te-white/30 font-display">-</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-white/50 font-mono">
                {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
              </div>
              <div className="text-3xl font-bold text-te-white font-display">{score.O}</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative perspective-container">
          <div className="grid grid-cols-3 gap-2 bg-te-black p-3 rounded-lg mechanical-appear depth-shadow">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                className={`
                  w-28 h-28 game-cell rounded-lg flex items-center justify-center
                  transition-all duration-300 relative overflow-hidden
                  ${!cell && !winner ? 'hover:scale-105 cursor-pointer' : ''}
                  ${winningLine?.includes(index) ? 'winning glow-effect' : ''}
                `}
              >
                {cell && (
                  <span
                    className={`
                      text-6xl font-bold mechanical-mark
                      ${cell === 'X' ? 'text-te-white' : 'text-te-orange'}
                      ${winningLine?.includes(index) ? 'animate-glow' : ''}
                    `}
                  >
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Status Display */}
        <div className="status-display beveled-edge p-6 mt-6 text-center panel-inset">
          {winner ? (
            <div>
              <div className="text-xs uppercase tracking-wider mb-3 text-te-white/50 font-mono">
                {isDraw ? 'Game Draw' : 'Winner'}
              </div>
              <div className={`text-3xl font-bold font-display ${isDraw ? 'text-te-white' : 'text-te-orange animate-glow'}`}>
                {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-wider mb-3 text-te-white/50 font-mono">Current Turn</div>
              <div className={`text-3xl font-bold font-display ${currentPlayer === 'X' ? 'text-te-white' : 'text-te-orange'}`}>
                {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={resetGame}
            className="flex-1 hardware-button py-4 px-6 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow"
          >
            New Game
          </button>
          <button
            onClick={resetScore}
            className="flex-1 hardware-button py-4 px-6 text-xs uppercase tracking-wider font-medium transition-all duration-200 hardware-glow"
          >
            Reset Score
          </button>
        </div>

        {/* Device Footer */}
        <div className="hardware-surface beveled-edge p-4 mt-6 text-center metallic-texture">
          <div className="text-xs uppercase tracking-wider text-te-white/40 font-mono">
            teenage engineering × tic tac toe
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
