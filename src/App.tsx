import type React from 'react';
import { useState, useEffect, useRef } from 'react';

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

  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = panelRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * -4;
    const rotateY = ((x - midX) / midX) * 4;
    element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    const element = panelRef.current;
    if (!element) return;
    element.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className="min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-4 perspective-1000">
      {/* Panel Casing */}
      <div ref={panelRef} onMouseMove={handleTilt} onMouseLeave={resetTilt} className="relative max-w-lg w-full panel-3d shadow-3d-soft p-5 animate-grid-appear tilt-surface" id="panel">
        {/* Screws */}
        <div className="absolute left-3 top-3 screw" />
        <div className="absolute right-3 top-3 screw" />
        <div className="absolute left-3 bottom-3 screw" />
        <div className="absolute right-3 bottom-3 screw" />

        {/* Reflection Layer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 panel-reflection rounded-t-[16px]" />

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`led ${gameMode === 'pvc' && currentPlayer === 'O' ? 'led-orange animate-pulse-slow' : 'led-green'}`} />
              <div className="text-xs uppercase tracking-wider text-te-black/50">TE-01</div>
            </div>
            <div className="text-xs uppercase tracking-wider text-te-black/50">V1.0</div>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-1 text-extrude-black">Tic Tac Toe</h1>
          <div className="h-0.5 bg-te-black w-full" />
        </div>

        {/* Game Mode Selector */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                gameMode === 'pvp'
                  ? 'bg-te-orange text-te-white'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); }}
              className={`btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                gameMode === 'pvc'
                  ? 'bg-te-orange text-te-white'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10'
              }`}
            >
              Player vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                  difficulty === 'easy'
                    ? 'bg-te-black text-te-white'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all ${
                  difficulty === 'hard'
                    ? 'bg-te-black text-te-white'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-4 bg-te-gray p-4 rounded-md tile-3d">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
              <div className="text-2xl font-bold text-extrude-black">{score.X}</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Draw</div>
              <div className="text-2xl font-bold text-extrude-black">-</div>
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">
                {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
              </div>
              <div className="text-2xl font-bold text-extrude-black">{score.O}</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-0 bg-te-black p-1 animate-grid-appear rounded-md shadow-3d-soft">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                className={`
                  w-24 h-24 bg-te-white flex items-center justify-center
                  transition-all duration-200 relative overflow-hidden tile-3d
                  ${!cell && !winner ? 'hover:bg-te-gray cursor-pointer' : ''}
                  ${winningLine?.includes(index) ? 'bg-te-orange/20' : ''}
                  ${index % 3 !== 2 ? 'border-r-2 border-te-black' : ''}
                  ${index < 6 ? 'border-b-2 border-te-black' : ''}
                `}
              >
                {cell && (
                  <span
                    className={`
                      text-5xl font-bold animate-mark-appear
                      ${cell === 'X' ? 'text-te-black text-extrude-black' : 'text-te-orange text-extrude-orange'}
                      ${winningLine?.includes(index) ? 'text-shadow-glow' : ''}
                    `}
                  >
                    {cell}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid Lines Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 290 290">
              <line x1="97" y1="5" x2="97" y2="285" stroke="#1A1A1A" strokeWidth="2"/>
              <line x1="193" y1="5" x2="193" y2="285" stroke="#1A1A1A" strokeWidth="2"/>
              <line x1="5" y1="97" x2="285" y2="97" stroke="#1A1A1A" strokeWidth="2"/>
              <line x1="5" y1="193" x2="285" y2="193" stroke="#1A1A1A" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Status Display */}
        <div className="mt-4 text-center">
          <div className="bg-te-gray p-4 rounded-md tile-3d">
            {winner ? (
              <div>
                <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">
                  {isDraw ? 'Game Draw' : 'Winner'}
                </div>
                <div className={`text-2xl font-bold ${isDraw ? 'text-te-black text-extrude-black' : 'text-te-orange text-extrude-orange'}`}>
                  {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">Current Turn</div>
                <div className={`text-2xl font-bold ${currentPlayer === 'X' ? 'text-te-black text-extrude-black' : 'text-te-orange text-extrude-orange'}`}>
                  {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={resetGame}
            className="btn-3d flex-1 bg-te-black text-te-white py-3 px-6 text-xs uppercase tracking-wider font-medium hover:bg-te-orange transition-colors"
          >
            New Game
          </button>
          <button
            onClick={resetScore}
            className="btn-3d flex-1 bg-te-gray text-te-black py-3 px-6 text-xs uppercase tracking-wider font-medium hover:bg-te-black hover:text-te-white transition-colors"
          >
            Reset Score
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="text-xs uppercase tracking-wider text-te-black/30">
            teenage engineering × tic tac toe
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
