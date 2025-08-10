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
  const [isPoweredOn, setIsPoweredOn] = useState(true);

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
    if (gameMode === 'pvc' && currentPlayer === 'O' && !winner && isPoweredOn) {
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
  }, [board, currentPlayer, gameMode, winner, difficulty, isPoweredOn]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'pvc' && currentPlayer === 'O') || !isPoweredOn) return;

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
    <div className="min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-4 perspective-1000">
      {/* Main Device Container */}
      <div className="relative max-w-2xl w-full">
        {/* Device Frame */}
        <div className="hardware-panel floating-shadow p-8 animate-slide-in">
          {/* Power Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isPoweredOn ? 'bg-te-orange animate-pulse-glow' : 'bg-te-gray'}`} />
            <span className="text-xs uppercase tracking-wider text-te-black/50">PWR</span>
          </div>

          {/* Screw Details */}
          <div className="absolute top-4 left-4">
            <div className="screw" />
          </div>
          <div className="absolute top-4 right-12">
            <div className="screw" />
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="screw" />
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="screw" />
          </div>

          {/* Header Panel */}
          <div className="depth-layer-1 mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-te-black/50 animate-float">TE-01</div>
              <div className="text-xs uppercase tracking-wider text-te-black/50 animate-float-delayed">V1.0</div>
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-1 animate-scale-in">Tic Tac Toe</h1>
            <div className="h-1 bg-te-black w-full" />
          </div>

          {/* Game Mode Selector */}
          <div className="depth-layer-2 mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setGameMode('pvp'); resetGame(); }}
                className={`hardware-button flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                  gameMode === 'pvp'
                    ? 'bg-te-orange text-te-white'
                    : 'text-te-black hover:bg-te-black/10'
                }`}
              >
                Player vs Player
              </button>
              <button
                onClick={() => { setGameMode('pvc'); resetGame(); }}
                className={`hardware-button flex-1 py-3 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                  gameMode === 'pvc'
                    ? 'bg-te-orange text-te-white'
                    : 'text-te-black hover:bg-te-black/10'
                }`}
              >
                Player vs CPU
              </button>
            </div>

            {gameMode === 'pvc' && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setDifficulty('easy'); resetGame(); }}
                  className={`hardware-button flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                    difficulty === 'easy'
                      ? 'bg-te-black text-te-white'
                      : 'text-te-black hover:bg-te-black/10'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => { setDifficulty('hard'); resetGame(); }}
                  className={`hardware-button flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                    difficulty === 'hard'
                      ? 'bg-te-black text-te-white'
                      : 'text-te-black hover:bg-te-black/10'
                  }`}
                >
                  Hard
                </button>
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="depth-layer-2 mb-6">
            <div className="hardware-panel p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
                  <div className="text-2xl font-bold animate-float">{score.X}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Draw</div>
                  <div className="text-2xl font-bold animate-float-delayed">-</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">
                    {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
                  </div>
                  <div className="text-2xl font-bold animate-float-more-delayed">{score.O}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="depth-layer-3 relative">
            <div className="grid grid-cols-3 gap-1 bg-te-black p-2 rounded-lg floating-shadow">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O') || !isPoweredOn}
                  className={`
                    game-cell w-24 h-24 flex items-center justify-center
                    transition-all duration-200 relative overflow-hidden
                    ${!cell && !winner && isPoweredOn ? 'cursor-pointer' : ''}
                    ${winningLine?.includes(index) ? 'bg-te-orange/20 animate-pulse-glow' : ''}
                  `}
                >
                  {cell && (
                    <span
                      className={`
                        text-5xl font-bold animate-scale-in
                        ${cell === 'X' ? 'text-te-black' : 'text-te-orange'}
                        ${winningLine?.includes(index) ? 'text-shadow-glow' : ''}
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
          <div className="depth-layer-2 mt-6 text-center">
            <div className="hardware-panel p-4">
              {winner ? (
                <div>
                  <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">
                    {isDraw ? 'Game Draw' : 'Winner'}
                  </div>
                  <div className={`text-2xl font-bold animate-scale-in ${isDraw ? 'text-te-black' : 'text-te-orange'}`}>
                    {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">Current Turn</div>
                  <div className={`text-2xl font-bold animate-float ${currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'}`}>
                    {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="depth-layer-2 mt-6 flex gap-2">
            <button
              onClick={resetGame}
              className="hardware-button flex-1 bg-te-black text-te-white py-3 px-6 text-xs uppercase tracking-wider font-medium hover:bg-te-orange transition-colors"
            >
              New Game
            </button>
            <button
              onClick={resetScore}
              className="hardware-button flex-1 bg-te-gray text-te-black py-3 px-6 text-xs uppercase tracking-wider font-medium hover:bg-te-black hover:text-te-white transition-colors"
            >
              Reset Score
            </button>
          </div>

          {/* Power Toggle */}
          <div className="depth-layer-2 mt-4 flex justify-center">
            <button
              onClick={() => setIsPoweredOn(!isPoweredOn)}
              className={`hardware-button px-6 py-2 text-xs uppercase tracking-wider font-medium transition-all ${
                isPoweredOn 
                  ? 'bg-te-orange text-te-white' 
                  : 'bg-te-gray text-te-black hover:bg-te-black hover:text-te-white'
              }`}
            >
              {isPoweredOn ? 'Power Off' : 'Power On'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-slide-in">
          <div className="text-xs uppercase tracking-wider text-te-black/30">
            teenage engineering × tic tac toe
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
