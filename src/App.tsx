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
    <div className="min-h-screen bg-te-white technical-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Depth Layers */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-te-orange rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-te-black rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-te-orange rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <div className="max-w-lg w-full mb-8 depth-layer-1 relative z-10">
        <div className="bg-te-white industrial-border mechanical-shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-te-black/50 industrial-text">TE-01</div>
            <div className="text-xs uppercase tracking-wider text-te-black/50 industrial-text">V1.0</div>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 industrial-text">Tic Tac Toe</h1>
          <div className="h-1 bg-gradient-to-r from-te-orange via-te-black to-te-orange w-full" />
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="max-w-lg w-full mb-6 depth-layer-2 relative z-10">
        <div className="bg-te-white industrial-border mechanical-shadow p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium button-3d transition-all ${
                gameMode === 'pvp'
                  ? 'bg-te-orange text-te-white glow-effect'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10 mechanical-shadow'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium button-3d transition-all ${
                gameMode === 'pvc'
                  ? 'bg-te-orange text-te-white glow-effect'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10 mechanical-shadow'
              }`}
            >
              Player vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium button-3d transition-all ${
                  difficulty === 'easy'
                    ? 'bg-te-black text-te-white glow-effect'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10 mechanical-shadow'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium button-3d transition-all ${
                  difficulty === 'hard'
                    ? 'bg-te-black text-te-white glow-effect'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10 mechanical-shadow'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Score Display */}
      <div className="max-w-lg w-full mb-6 depth-layer-2 relative z-10">
        <div className="bg-te-white industrial-border mechanical-shadow p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 industrial-text">Player X</div>
              <div className="text-3xl font-bold industrial-text">{score.X}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 industrial-text">Draw</div>
              <div className="text-3xl font-bold industrial-text">-</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 industrial-text">
                {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
              </div>
              <div className="text-3xl font-bold industrial-text">{score.O}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="board-container relative z-20">
        <div className="bg-te-white industrial-border mechanical-shadow p-2 board-3d animate-grid-appear">
          <div className="grid grid-cols-3 gap-0 bg-te-black p-1">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                className={`
                  w-24 h-24 bg-te-white flex items-center justify-center
                  cell-3d relative overflow-hidden
                  ${!cell && !winner ? 'hover:bg-te-gray cursor-pointer' : ''}
                  ${winningLine?.includes(index) ? 'bg-te-orange/20 glow-effect' : ''}
                  ${index % 3 !== 2 ? 'border-r-2 border-te-black' : ''}
                  ${index < 6 ? 'border-b-2 border-te-black' : ''}
                `}
              >
                {cell && (
                  <span
                    className={`
                      text-5xl font-bold animate-mark-appear industrial-text
                      ${cell === 'X' ? 'text-te-black' : 'text-te-orange'}
                      ${winningLine?.includes(index) ? 'text-shadow-glow animate-glow-pulse' : ''}
                    `}
                  >
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 290 290">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A1A1A" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <line x1="97" y1="5" x2="97" y2="285" stroke="#1A1A1A" strokeWidth="2"/>
            <line x1="193" y1="5" x2="193" y2="285" stroke="#1A1A1A" strokeWidth="2"/>
            <line x1="5" y1="97" x2="285" y2="97" stroke="#1A1A1A" strokeWidth="2"/>
            <line x1="5" y1="193" x2="285" y2="193" stroke="#1A1A1A" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Status Display */}
      <div className="max-w-lg w-full mt-6 text-center depth-layer-1 relative z-10">
        <div className="bg-te-white industrial-border mechanical-shadow p-4">
          {winner ? (
            <div>
              <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 industrial-text">
                {isDraw ? 'Game Draw' : 'Winner'}
              </div>
              <div className={`text-2xl font-bold industrial-text ${isDraw ? 'text-te-black' : 'text-te-orange'}`}>
                {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 industrial-text">Current Turn</div>
              <div className={`text-2xl font-bold industrial-text ${currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'}`}>
                {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="max-w-lg w-full mt-6 flex gap-2 depth-layer-2 relative z-10">
        <button
          onClick={resetGame}
          className="flex-1 bg-te-black text-te-white py-3 px-6 text-xs uppercase tracking-wider font-medium button-3d hover:bg-te-orange transition-colors mechanical-shadow"
        >
          New Game
        </button>
        <button
          onClick={resetScore}
          className="flex-1 bg-te-gray text-te-black py-3 px-6 text-xs uppercase tracking-wider font-medium button-3d hover:bg-te-black hover:text-te-white transition-colors mechanical-shadow"
        >
          Reset Score
        </button>
      </div>

      {/* Footer */}
      <div className="max-w-lg w-full mt-8 text-center depth-layer-1 relative z-10">
        <div className="bg-te-white industrial-border mechanical-shadow p-3">
          <div className="text-xs uppercase tracking-wider text-te-black/30 industrial-text">
            teenage engineering × tic tac toe
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
