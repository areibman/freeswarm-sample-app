import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isPowered, setIsPowered] = useState(true);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(100);

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
      if (Math.random() < 0.3) {
        return getMinimaxMove(squares);
      }
      const availableMoves = squares.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
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
    if (gameMode === 'pvc' && currentPlayer === 'O' && !winner && isPowered) {
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
  }, [board, currentPlayer, gameMode, winner, difficulty, isPowered]);

  const handleCellClick = (index: number) => {
    if (!isPowered) return;
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
    if (!isPowered) return;
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  const resetScore = () => {
    if (!isPowered) return;
    setScore({ X: 0, O: 0 });
    resetGame();
  };

  const isDraw = winner === 'O' && board.every(cell => cell !== null);

  // LED Segment Display Component
  const LEDDisplay = ({ value, label }: { value: number | string; label: string }) => (
    <div className="led-display">
      <div className="text-[8px] uppercase tracking-wider mb-1 text-te-black/30 font-bold">{label}</div>
      <div className="bg-black rounded-sm p-2 border-2 border-te-black/20 shadow-inner">
        <div 
          className="font-mono text-2xl font-bold text-te-orange drop-shadow-led transition-opacity"
          style={{ opacity: isPowered ? brightness / 100 : 0.1 }}
        >
          {String(value).padStart(2, '0')}
        </div>
      </div>
    </div>
  );

  // Physical Knob Component
  const Knob = ({ value, onChange, label, min = 0, max = 100 }: any) => (
    <div className="flex flex-col items-center">
      <div className="text-[8px] uppercase tracking-wider mb-2 text-te-black/50 font-bold">{label}</div>
      <motion.div 
        className="relative w-12 h-12"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-knob border-2 border-gray-500"></div>
        <motion.div 
          className="absolute inset-2 bg-gradient-to-b from-white to-gray-200 rounded-full cursor-pointer"
          style={{ 
            transform: `rotate(${(value - min) / (max - min) * 270 - 135}deg)`,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDrag={(e, info) => {
            const newValue = Math.max(min, Math.min(max, value + info.delta.x));
            onChange(newValue);
          }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-te-black rounded-full"></div>
        </motion.div>
      </motion.div>
      <div className="text-[10px] font-mono mt-1 text-te-black/70">{value}</div>
    </div>
  );

  // Toggle Switch Component
  const ToggleSwitch = ({ value, onChange, label, options }: any) => (
    <div className="flex flex-col items-center">
      <div className="text-[8px] uppercase tracking-wider mb-2 text-te-black/50 font-bold">{label}</div>
      <motion.div 
        className="relative bg-te-black rounded-full p-1 cursor-pointer shadow-inner"
        onClick={() => onChange(!value)}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex gap-1">
          {options.map((opt: string, idx: number) => (
            <div key={opt} className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
              (idx === 0 && !value) || (idx === 1 && value) ? 'text-te-orange' : 'text-gray-600'
            }`}>
              {opt}
            </div>
          ))}
        </div>
        <motion.div 
          className="absolute top-1 bottom-1 bg-te-orange rounded-full shadow-lg"
          animate={{ 
            left: value ? '50%' : '4px',
            width: '50%'
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  );

  // Physical Button Component
  const PhysicalButton = ({ onClick, children, variant = 'primary', disabled = false }: any) => (
    <motion.button
      onClick={onClick}
      disabled={disabled || !isPowered}
      className={`
        relative px-6 py-3 font-bold text-xs uppercase tracking-wider
        rounded-sm transition-all shadow-button border-2
        ${variant === 'primary' 
          ? 'bg-gradient-to-b from-te-orange to-orange-600 text-white border-orange-700' 
          : 'bg-gradient-to-b from-gray-300 to-gray-400 text-te-black border-gray-500'
        }
        ${disabled || !isPowered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={!disabled && isPowered ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && isPowered ? { scale: 0.98, y: 1 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <motion.div 
          className="absolute inset-0 bg-white rounded-sm opacity-0"
          animate={{ opacity: disabled || !isPowered ? 0 : [0, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4"
      style={{ filter: `brightness(${isPowered ? brightness / 100 : 0.5})` }}
    >
      {/* Main Device Container */}
      <motion.div 
        className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-2xl shadow-2xl p-8 max-w-4xl w-full border-4 border-gray-400"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Panel - Header and Status */}
        <div className="bg-te-black rounded-lg p-4 mb-6 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-te-orange font-bold text-xs uppercase tracking-wider">TE-X01</div>
              <div className="flex gap-2">
                <motion.div 
                  className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-400' : 'bg-gray-600'}`}
                  animate={isPowered ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className={`w-2 h-2 rounded-full ${gameMode === 'pvc' ? 'bg-blue-400' : 'bg-gray-600'}`} />
                <div className={`w-2 h-2 rounded-full ${winner ? 'bg-red-400' : 'bg-gray-600'}`} />
              </div>
            </div>
            <div className="text-white/50 font-mono text-[10px]">QUANTUM TIC-TAC-TOE v2.0</div>
          </div>
          
          {/* LCD-style Status Display */}
          <div className="bg-black/50 rounded p-2 font-mono text-te-orange text-sm">
            {!isPowered ? (
              <span className="opacity-30">SYSTEM OFFLINE</span>
            ) : winner ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {isDraw ? '>>> DRAW <<<' : `>>> PLAYER ${winner} WINS <<<`}
              </motion.span>
            ) : (
              <span>
                {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU PROCESSING...' : `PLAYER ${currentPlayer} TURN`}
              </span>
            )}
          </div>
        </div>

        {/* Control Panel Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Left Panel - Mode Controls */}
          <div className="bg-white/50 rounded-lg p-4 shadow-panel border border-gray-300">
            <div className="text-[10px] uppercase tracking-wider mb-3 font-bold text-te-black/50">MODE SELECT</div>
            
            <div className="space-y-3">
              <ToggleSwitch 
                value={gameMode === 'pvc'}
                onChange={(v: boolean) => { setGameMode(v ? 'pvc' : 'pvp'); resetGame(); }}
                label="GAME MODE"
                options={['PVP', 'CPU']}
              />
              
              {gameMode === 'pvc' && (
                <ToggleSwitch 
                  value={difficulty === 'hard'}
                  onChange={(v: boolean) => { setDifficulty(v ? 'hard' : 'easy'); resetGame(); }}
                  label="DIFFICULTY"
                  options={['EASY', 'HARD']}
                />
              )}
            </div>
          </div>

          {/* Center Panel - Game Board */}
          <div className="relative">
            <motion.div 
              className="bg-black rounded-lg p-1 shadow-2xl"
              style={{
                transform: 'perspective(1000px) rotateX(10deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="grid grid-cols-3 gap-1">
                <AnimatePresence>
                  {board.map((cell, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O') || !isPowered}
                      className={`
                        relative w-20 h-20 bg-gradient-to-br from-gray-800 to-black
                        flex items-center justify-center cursor-pointer
                        transition-all duration-200 rounded-sm
                        ${!cell && !winner && isPowered ? 'hover:from-gray-700 hover:to-gray-900' : ''}
                        ${winningLine?.includes(index) ? 'ring-2 ring-te-orange ring-offset-2 ring-offset-black' : ''}
                      `}
                      whileHover={!cell && !winner && isPowered ? { 
                        scale: 1.05,
                        boxShadow: '0 0 20px rgba(255, 107, 0, 0.5)'
                      } : {}}
                      whileTap={!cell && !winner && isPowered ? { scale: 0.95 } : {}}
                      style={{
                        transform: 'translateZ(20px)',
                        boxShadow: winningLine?.includes(index) 
                          ? '0 0 30px rgba(255, 107, 0, 0.8)' 
                          : '0 5px 15px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {cell && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ 
                              scale: 1, 
                              rotate: 0,
                              textShadow: cell === 'X' 
                                ? '0 0 20px rgba(255, 255, 255, 0.8)' 
                                : '0 0 20px rgba(255, 107, 0, 0.8)'
                            }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className={`
                              text-4xl font-bold
                              ${cell === 'X' ? 'text-white' : 'text-te-orange'}
                            `}
                          >
                            {cell}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {/* Grid position indicator */}
                      <div className="absolute top-1 right-1 text-[8px] text-gray-600 font-mono">
                        {Math.floor(index / 3) + 1},{(index % 3) + 1}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Score Display */}
          <div className="bg-white/50 rounded-lg p-4 shadow-panel border border-gray-300">
            <div className="text-[10px] uppercase tracking-wider mb-3 font-bold text-te-black/50">SCORE BOARD</div>
            
            <div className="space-y-3">
              <LEDDisplay value={score.X} label="PLAYER X" />
              <LEDDisplay value={score.O} label={gameMode === 'pvc' ? 'CPU O' : 'PLAYER O'} />
            </div>
          </div>
        </div>

        {/* Bottom Control Panel */}
        <div className="bg-white/30 rounded-lg p-4 shadow-inner border border-gray-300">
          <div className="grid grid-cols-4 gap-4 items-center">
            {/* Power Button */}
            <div className="flex flex-col items-center">
              <div className="text-[8px] uppercase tracking-wider mb-2 text-te-black/50 font-bold">POWER</div>
              <motion.button
                onClick={() => setIsPowered(!isPowered)}
                className={`
                  w-16 h-16 rounded-full shadow-lg border-4
                  ${isPowered 
                    ? 'bg-gradient-to-b from-red-500 to-red-600 border-red-700' 
                    : 'bg-gradient-to-b from-gray-400 to-gray-500 border-gray-600'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`text-white font-bold text-xl ${isPowered ? 'drop-shadow-led' : ''}`}>
                  {isPowered ? 'ON' : 'OFF'}
                </div>
              </motion.button>
            </div>

            {/* Volume Knob */}
            <Knob 
              value={volume} 
              onChange={setVolume} 
              label="VOLUME"
              min={0}
              max={100}
            />

            {/* Brightness Knob */}
            <Knob 
              value={brightness} 
              onChange={setBrightness} 
              label="BRIGHTNESS"
              min={20}
              max={100}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <PhysicalButton onClick={resetGame} variant="primary">
                NEW GAME
              </PhysicalButton>
              <PhysicalButton onClick={resetScore} variant="secondary">
                RESET
              </PhysicalButton>
            </div>
          </div>
        </div>

        {/* Bottom Label */}
        <div className="mt-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-te-black/30 font-bold">
            teenage engineering × quantum gaming
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
