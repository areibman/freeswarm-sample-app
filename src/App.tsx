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
  const [devicePowered, setDevicePowered] = useState(false);

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
    // Device startup animation
    const timer = setTimeout(() => setDevicePowered(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-te-light-gray via-te-gray to-device-shadow grid-pattern flex flex-col items-center justify-center p-8 device-perspective">
      {/* Device Chassis */}
      <div className={`device-chassis rounded-3xl p-8 max-w-2xl w-full transform transition-all duration-1000 ${devicePowered ? 'animate-device-startup' : 'opacity-0'}`}>
        
        {/* Device Header with Status LEDs */}
        <div className="flex items-center justify-between mb-8 p-4 bg-te-dark-gray rounded-xl shadow-inset-shallow border border-te-black/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${devicePowered ? 'led-indicator animate-screen-flicker' : 'led-off'}`} />
              <span className="text-xs hardware-text text-te-white">PWR</span>
            </div>
            <div className="w-px h-4 bg-te-white/20" />
            <div className="text-xs hardware-text text-te-white/70">TE-TTT-01</div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
              <div className="w-1 h-1 bg-te-white/30 rounded-full" />
            </div>
            <div className="text-xs hardware-text text-te-white/70">V2.0</div>
            <div className="w-px h-4 bg-te-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-xs hardware-text text-te-white">STATUS</span>
              <div className={`w-2 h-2 rounded-full ${winner ? 'bg-te-orange animate-pulse' : currentPlayer === 'X' ? 'bg-te-blue' : 'bg-te-green'} shadow-hardware`} />
            </div>
          </div>
        </div>

        {/* Main Display Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold hardware-text text-te-black mb-2 tracking-wider">
            TIC TAC TOE
          </h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-te-orange to-transparent w-full rounded-full" />
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Game Mode Panel */}
          <div className="bg-te-dark-gray rounded-xl p-4 shadow-hardware">
            <div className="text-xs hardware-text text-te-white/70 mb-3">MODE SELECT</div>
            <div className="space-y-2">
              <button
                onClick={() => { setGameMode('pvp'); resetGame(); }}
                className={`w-full hardware-button py-3 px-4 text-xs hardware-text transition-all rounded-lg ${
                  gameMode === 'pvp'
                    ? 'bg-te-orange text-te-white shadow-hardware-lg'
                    : 'text-te-black hover:shadow-hardware'
                }`}
              >
                PLAYER VS PLAYER
              </button>
              <button
                onClick={() => { setGameMode('pvc'); resetGame(); }}
                className={`w-full hardware-button py-3 px-4 text-xs hardware-text transition-all rounded-lg ${
                  gameMode === 'pvc'
                    ? 'bg-te-orange text-te-white shadow-hardware-lg'
                    : 'text-te-black hover:shadow-hardware'
                }`}
              >
                PLAYER VS CPU
              </button>
            </div>

            {gameMode === 'pvc' && (
              <div className="mt-4 pt-4 border-t border-te-white/20">
                <div className="text-xs hardware-text text-te-white/70 mb-2">DIFFICULTY</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setDifficulty('easy'); resetGame(); }}
                    className={`hardware-button py-2 px-3 text-xs hardware-text transition-all rounded ${
                      difficulty === 'easy'
                        ? 'bg-te-blue text-te-white shadow-hardware'
                        : 'text-te-black hover:shadow-hardware'
                    }`}
                  >
                    EASY
                  </button>
                  <button
                    onClick={() => { setDifficulty('hard'); resetGame(); }}
                    className={`hardware-button py-2 px-3 text-xs hardware-text transition-all rounded ${
                      difficulty === 'hard'
                        ? 'bg-te-red text-te-white shadow-hardware'
                        : 'text-te-black hover:shadow-hardware'
                    }`}
                  >
                    HARD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Score Display Panel */}
          <div className="bg-te-dark-gray rounded-xl p-4 shadow-hardware">
            <div className="text-xs hardware-text text-te-white/70 mb-3">SCORE BOARD</div>
            <div className="screen-lcd rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs hardware-text text-screen-glow">PLAYER X</span>
                <span className="text-2xl font-bold text-screen-glow font-mono">{score.X.toString().padStart(2, '0')}</span>
              </div>
              <div className="h-px bg-screen-glow/30" />
              <div className="flex justify-between items-center">
                <span className="text-xs hardware-text text-screen-glow">
                  {gameMode === 'pvc' ? 'CPU O' : 'PLAYER O'}
                </span>
                <span className="text-2xl font-bold text-screen-glow font-mono">{score.O.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Status Display Panel */}
          <div className="bg-te-dark-gray rounded-xl p-4 shadow-hardware">
            <div className="text-xs hardware-text text-te-white/70 mb-3">GAME STATUS</div>
            <div className="screen-lcd rounded-lg p-4">
              {winner ? (
                <div className="text-center">
                  <div className="text-xs hardware-text text-screen-glow/70 mb-2">
                    {isDraw ? 'DRAW GAME' : 'WINNER'}
                  </div>
                  <div className={`text-xl font-bold hardware-text ${isDraw ? 'text-te-yellow' : 'text-screen-glow'} animate-pulse`}>
                    {isDraw ? 'DRAW!' : `${winner} WINS!`}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-xs hardware-text text-screen-glow/70 mb-2">ACTIVE PLAYER</div>
                  <div className={`text-xl font-bold hardware-text animate-pulse ${
                    currentPlayer === 'X' ? 'text-te-blue' : 'text-te-orange'
                  }`}>
                    {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'PLAYER'} {currentPlayer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Board - Main Hardware Surface */}
        <div className="flex justify-center mb-8">
          <div className="game-surface rounded-2xl p-6 shadow-hardware-xl">
            <div className="relative">
              {/* Hardware Frame with Corner Details */}
              <div className="absolute -inset-2 bg-te-dark-gray rounded-2xl shadow-hardware-xl">
                {/* Corner mounting details */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-te-black/20 rounded-full shadow-inset-shallow" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-te-black/20 rounded-full shadow-inset-shallow" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-te-black/20 rounded-full shadow-inset-shallow" />
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-te-black/20 rounded-full shadow-inset-shallow" />
              </div>
              
              <div className="relative z-10 grid grid-cols-3 gap-2 p-4 bg-te-black/5 rounded-xl shadow-inset-deep">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                    className={`
                      game-cell w-20 h-20 rounded-lg flex items-center justify-center
                      relative overflow-hidden transform transition-all duration-200
                      ${!cell && !winner && !(gameMode === 'pvc' && currentPlayer === 'O') ? 'cursor-pointer hover:scale-105 hover:shadow-hardware' : 'cursor-not-allowed'}
                      ${winningLine?.includes(index) ? 'bg-gradient-to-br from-te-orange/30 to-te-orange/10 shadow-hardware-lg animate-pulse' : ''}
                    `}
                    onMouseDown={(e) => {
                      if (!cell && !winner && !(gameMode === 'pvc' && currentPlayer === 'O')) {
                        e.currentTarget.style.transform = 'scale(0.95) translateY(1px)';
                      }
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = '';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    {cell && (
                      <span
                        className={`
                          text-4xl font-bold animate-mark-appear hardware-text
                          ${cell === 'X' ? 'text-te-blue' : 'text-te-orange'}
                          ${winningLine?.includes(index) ? 'text-shadow-glow animate-pulse' : ''}
                        `}
                      >
                        {cell}
                      </span>
                    )}
                    
                    {/* Cell indicator LEDs */}
                    <div className="absolute top-1 right-1">
                      <div className={`w-1 h-1 rounded-full transition-all ${
                        cell ? 'bg-te-orange shadow-hardware animate-pulse' : 'bg-te-gray/50'
                      }`} />
                    </div>

                    {/* Cell position labels */}
                    <div className="absolute bottom-1 left-1">
                      <div className="text-xs font-mono text-te-black/30">{index + 1}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Hardware Grid Frame */}
              <div className="absolute inset-0 pointer-events-none rounded-xl z-20">
                <div className="w-full h-full border-2 border-te-black/10 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons Panel */}
        <div className="bg-te-dark-gray rounded-xl p-6 shadow-hardware">
          <div className="text-xs hardware-text text-te-white/70 mb-4">CONTROLS</div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={resetGame}
              className="hardware-button bg-te-green text-te-white py-4 px-6 text-sm hardware-text rounded-xl shadow-hardware hover:bg-te-green/90 active:animate-button-press"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-te-white rounded-full" />
                NEW GAME
              </div>
            </button>
            <button
              onClick={resetScore}
              className="hardware-button bg-te-red text-te-white py-4 px-6 text-sm hardware-text rounded-xl shadow-hardware hover:bg-te-red/90 active:animate-button-press"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-te-white rounded-full" />
                RESET SCORE
              </div>
            </button>
          </div>
        </div>

        {/* Device Information Panel */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 bg-te-black/80 rounded-full px-6 py-2 shadow-hardware">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-te-orange rounded-full animate-pulse" />
              <span className="text-xs hardware-text text-te-white/70">TEENAGE ENGINEERING</span>
            </div>
            <div className="w-px h-4 bg-te-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-te-blue rounded-full" />
              <span className="text-xs hardware-text text-te-white/70">TIC TAC TOE DEVICE</span>
            </div>
          </div>
        </div>

        {/* Hardware Details */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-te-black/20 rounded px-2 py-1 shadow-inset-shallow">
            <div className="text-xs hardware-text text-te-black/50">SERIAL</div>
            <div className="text-xs font-mono text-te-black/70">TTT-2024-001</div>
          </div>
          <div className="bg-te-black/20 rounded px-2 py-1 shadow-inset-shallow">
            <div className="text-xs hardware-text text-te-black/50">REV</div>
            <div className="text-xs font-mono text-te-black/70">B.2.1</div>
          </div>
          <div className="bg-te-black/20 rounded px-2 py-1 shadow-inset-shallow">
            <div className="text-xs hardware-text text-te-black/50">MADE</div>
            <div className="text-xs font-mono text-te-black/70">SWEDEN</div>
          </div>
        </div>

        {/* Hardware Ventilation Grilles */}
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="w-1 h-8 bg-te-black/10 rounded-full shadow-inset-shallow" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
