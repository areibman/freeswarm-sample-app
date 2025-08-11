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
    <div className="min-h-screen bg-te-white grid-pattern flex items-center justify-center p-6">
      <div className="perspective-1000">
        <div className="relative preserve-3d [transform:rotateX(6deg)_rotateY(-12deg)] transition-transform duration-500 hover:[transform:rotateX(4deg)_rotateY(-8deg)]">
          <div className="relative w-[360px] md:w-[420px] rounded-[22px] bg-gradient-to-br from-zinc-100 to-zinc-300 border border-zinc-400/60 shadow-2xl inner-bevel p-5">
            {/* Screws */}
            <div className="screw-dot absolute top-3 left-3" />
            <div className="screw-dot absolute top-3 right-3" />
            <div className="screw-dot absolute bottom-3 left-3" />
            <div className="screw-dot absolute bottom-3 right-3" />

            {/* Header / Branding */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="led" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-te-black/60">TE-01</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-te-black/60">V1.0</span>
            </div>

            {/* Screen */}
            <div className="rounded-xl bg-zinc-900 p-3 ring-1 ring-zinc-800 shadow-inner inner-bevel">
              {/* Game Board */}
              <div className="relative mx-auto w-fit">
                <div className="grid grid-cols-3 gap-0 bg-te-black p-1 animate-grid-appear">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                      className={`
                        w-24 h-24 bg-te-white flex items-center justify-center
                        transition-all duration-200 relative overflow-hidden
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
                            ${cell === 'X' ? 'text-te-white' : 'text-te-orange'}
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
              <div className="mt-4 text-center bg-zinc-800/60 text-zinc-200 rounded-md p-3">
                {winner ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider mb-1 text-zinc-400">
                      {isDraw ? 'Game Draw' : 'Winner'}
                    </div>
                    <div className={`text-xl font-bold ${isDraw ? 'text-zinc-100' : 'text-te-orange'}`}>
                      {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider mb-1 text-zinc-400">Current Turn</div>
                    <div className={`text-xl font-bold ${currentPlayer === 'X' ? 'text-zinc-100' : 'text-te-orange'}`}>
                      {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <div className="mt-4">
              {/* Game Mode Selector */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setGameMode('pvp'); resetGame(); }}
                    className={`flex-1 py-2 px-4 text-[10px] uppercase tracking-wider font-medium transition-all rounded-full border border-zinc-400/60 shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_2px_0_0_rgba(0,0,0,0.35)] ${
                      gameMode === 'pvp'
                        ? 'bg-te-orange text-te-white'
                        : 'bg-zinc-200 text-te-black hover:bg-zinc-300'
                    }`}
                  >
                    Player vs Player
                  </button>
                  <button
                    onClick={() => { setGameMode('pvc'); resetGame(); }}
                    className={`flex-1 py-2 px-4 text-[10px] uppercase tracking-wider font-medium transition-all rounded-full border border-zinc-400/60 shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_2px_0_0_rgba(0,0,0,0.35)] ${
                      gameMode === 'pvc'
                        ? 'bg-te-orange text-te-white'
                        : 'bg-zinc-200 text-te-black hover:bg-zinc-300'
                    }`}
                  >
                    Player vs CPU
                  </button>
                </div>

                {gameMode === 'pvc' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setDifficulty('easy'); resetGame(); }}
                      className={`flex-1 py-2 px-4 text-[10px] uppercase tracking-wider font-medium transition-all rounded-full border border-zinc-400/60 shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_2px_0_0_rgba(0,0,0,0.35)] ${
                        difficulty === 'easy'
                          ? 'bg-zinc-900 text-te-white'
                          : 'bg-zinc-200 text-te-black hover:bg-zinc-300'
                      }`}
                    >
                      Easy
                    </button>
                    <button
                      onClick={() => { setDifficulty('hard'); resetGame(); }}
                      className={`flex-1 py-2 px-4 text-[10px] uppercase tracking-wider font-medium transition-all rounded-full border border-zinc-400/60 shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:translate-y-[2px] active:shadow-[0_2px_0_0_rgba(0,0,0,0.35)] ${
                        difficulty === 'hard'
                          ? 'bg-zinc-900 text-te-white'
                          : 'bg-zinc-200 text-te-black hover:bg-zinc-300'
                      }`}
                    >
                      Hard
                    </button>
                  </div>
                )}
              </div>

              {/* Score Display */}
              <div className="mb-3">
                <div className="grid grid-cols-3 gap-3 bg-zinc-200 p-3 rounded-md border border-zinc-400/60">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
                    <div className="text-2xl font-bold">{score.X}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-wider mb-1 text-te-black/50">Draw</div>
                    <div className="text-2xl font-bold">-</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-wider mb-1 text-te-black/50">
                      {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
                    </div>
                    <div className="text-2xl font-bold">{score.O}</div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-zinc-900 text-te-white py-3 px-6 text-[10px] uppercase tracking-wider font-medium rounded-full border border-zinc-700 shadow-[0_6px_0_0_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_0_rgba(0,0,0,0.6)] hover:bg-te-orange transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={resetScore}
                  className="flex-1 bg-zinc-200 text-te-black py-3 px-6 text-[10px] uppercase tracking-wider font-medium rounded-full border border-zinc-400 shadow-[0_6px_0_0_rgba(0,0,0,0.25)] active:translate-y-[3px] active:shadow-[0_3px_0_0_rgba(0,0,0,0.35)] hover:bg-zinc-300 transition-colors"
                >
                  Reset Score
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-te-black/40">
                teenage engineering × tic tac toe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
