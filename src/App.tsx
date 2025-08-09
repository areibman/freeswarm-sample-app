import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

// Memoized game cell component for better performance
const GameCell = memo(({ 
  cell, 
  index, 
  isWinning, 
  isDisabled, 
  boardSizeClass, 
  textSizeClasses, 
  onClick 
}: {
  cell: Player;
  index: number;
  isWinning: boolean;
  isDisabled: boolean;
  boardSizeClass: string;
  textSizeClasses: { mark: string };
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`
      ${boardSizeClass} bg-te-white flex items-center justify-center
      transition-all duration-200 relative overflow-hidden touch-optimized active-feedback
      ${!cell && !isDisabled ? 'hover:bg-te-gray cursor-pointer active:bg-te-black/5' : ''}
      ${isWinning ? 'bg-te-orange/20 animate-bounce-gentle' : ''}
      ${index % 3 !== 2 ? 'border-r-2 border-te-black' : ''}
      ${index < 6 ? 'border-b-2 border-te-black' : ''}
    `}
  >
    {cell && (
      <span
        className={`
          ${textSizeClasses.mark} font-bold animate-mark-appear
          ${cell === 'X' ? 'text-te-black' : 'text-te-orange'}
          ${isWinning ? 'text-shadow-glow' : ''}
        `}
      >
        {cell}
      </span>
    )}
  </button>
));

GameCell.displayName = 'GameCell';

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [gameMode, setGameMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
  const [isLandscape, setIsLandscape] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const minimaxCache = useRef(new Map<string, number>());

  // Memoized win patterns for better performance
  const winPatterns = useMemo(() => [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ], []);

  // Handle orientation changes with debouncing
  useEffect(() => {
    let timeoutId: number;
    
    const handleOrientationChange = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsLandscape(window.innerHeight < window.innerWidth);
      }, 100); // Debounce for 100ms
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Reset functions defined early to avoid dependency issues
  const resetGame = useCallback(() => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    minimaxCache.current.clear();
  }, [vibrationEnabled]);

  const resetScore = useCallback(() => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    setScore({ X: 0, O: 0 });
    resetGame();
  }, [vibrationEnabled, resetGame]);

  // Optimized haptic feedback with animation frame
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        navigator.vibrate(pattern);
      });
    }
  }, [vibrationEnabled]);

  // Touch gesture handlers with performance optimizations
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Swipe gestures (minimum 50px distance)
    if (distance > 50) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // Swipe up to reset game
      if (angle < -45 && angle > -135) {
        if (vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        resetGame();
      }
      // Swipe down to reset score
      else if (angle > 45 && angle < 135) {
        if (vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([150, 75, 150]);
        }
        resetScore();
      }
      // Swipe left/right to toggle game mode
      else if (Math.abs(angle) > 135 || Math.abs(angle) < 45) {
        if (vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate(75);
        }
        setGameMode(prev => prev === 'pvp' ? 'pvc' : 'pvp');
        resetGame();
      }
    }

    setTouchStart(null);
  }, [touchStart, vibrationEnabled, resetGame, resetScore]);

  // Double tap to toggle difficulty (when in PvC mode)
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY && gameMode === 'pvc') {
      e.preventDefault();
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([50, 25, 50]);
      }
      setDifficulty(prev => prev === 'easy' ? 'hard' : 'easy');
      resetGame();
    }
    
    setLastTap(now);
  }, [lastTap, gameMode, vibrationEnabled, resetGame]);

  // Memoized winner check function
  const checkWinner = useCallback((squares: Board): { winner: Player; line: number[] | null } => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: pattern };
      }
    }
    return { winner: null, line: null };
  }, [winPatterns]);

  // Optimized minimax algorithm with memoization
  const minimax = useCallback((squares: Board, depth: number, isMaximizing: boolean): number => {
    const boardKey = squares.join('') + depth + isMaximizing;
    if (minimaxCache.current.has(boardKey)) {
      return minimaxCache.current.get(boardKey)!;
    }

    const result = checkWinner(squares);

    if (result.winner === 'O') {
      const score = 10 - depth;
      minimaxCache.current.set(boardKey, score);
      return score;
    }
    if (result.winner === 'X') {
      const score = depth - 10;
      minimaxCache.current.set(boardKey, score);
      return score;
    }
    if (squares.every(s => s !== null)) {
      minimaxCache.current.set(boardKey, 0);
      return 0;
    }

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
      minimaxCache.current.set(boardKey, bestScore);
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
      minimaxCache.current.set(boardKey, bestScore);
      return bestScore;
    }
  }, [checkWinner]);

  const getBestMove = useCallback((squares: Board): number => {
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
  }, [difficulty]);

  const getMinimaxMove = useCallback((squares: Board): number => {
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
  }, [minimax]);

  // Clear minimax cache when game resets
  useEffect(() => {
    if (board.every(cell => cell === null)) {
      minimaxCache.current.clear();
    }
  }, [board]);

  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const move = getBestMove(newBoard);
        if (move !== -1) {
          newBoard[move] = 'O';
          setBoard(newBoard);
          vibrate(100); // CPU move feedback

          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setScore(prev => ({
              ...prev,
              [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
            }));
            vibrate([100, 50, 100]); // Win pattern
          } else if (newBoard.every(cell => cell !== null)) {
            setWinner('O'); // Draw
            vibrate([50, 50, 50]); // Draw pattern
          } else {
            setCurrentPlayer('X');
          }
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, winner, difficulty, vibrate, getBestMove, checkWinner]);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || (gameMode === 'pvc' && currentPlayer === 'O')) return;

    vibrate(75); // Touch feedback
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
      vibrate([200, 100, 200]); // Win celebration
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('O'); // Draw
      vibrate([100, 100, 100]); // Draw pattern
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, winner, gameMode, currentPlayer, vibrate, checkWinner]);



  // Memoized computed values
  const isDraw = useMemo(() => winner === 'O' && board.every(cell => cell !== null), [winner, board]);

  // Memoized responsive layout classes
  const layoutClasses = useMemo(() => {
    const isCompactLandscape = isLandscape && window.innerHeight < 600;
    
    return {
      container: isCompactLandscape 
        ? "min-h-screen bg-te-white grid-pattern flex landscape:flex-row portrait:flex-col items-center justify-center p-2 landscape-compact safe-area-all"
        : "min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-4 safe-area-all",
      maxWidth: isCompactLandscape
        ? "max-w-sm w-full landscape:max-w-xs"
        : "max-w-lg w-full mobile-s:max-w-sm mobile-m:max-w-md mobile-l:max-w-lg",
      boardSize: isCompactLandscape
        ? "w-16 h-16 mobile-s:w-20 mobile-s:h-20"
        : "w-20 h-20 mobile-s:w-24 mobile-s:h-24 mobile-m:w-28 mobile-m:h-28 sm:w-24 sm:h-24",
      panelWidth: isCompactLandscape ? 'landscape:w-1/2' : 'w-full'
    };
  }, [isLandscape]);

  const textSizeClasses = useMemo(() => {
    const isCompactLandscape = isLandscape && window.innerHeight < 600;
    
    return {
      header: isCompactLandscape 
        ? "text-lg mobile-s:text-xl mobile-m:text-2xl" 
        : "text-2xl mobile-s:text-3xl sm:text-3xl",
      mark: isCompactLandscape 
        ? "text-3xl mobile-s:text-4xl" 
        : "text-4xl mobile-s:text-5xl mobile-m:text-5xl sm:text-5xl",
      score: isCompactLandscape 
        ? "text-lg mobile-s:text-xl" 
        : "text-xl mobile-s:text-2xl mobile-m:text-2xl",
      status: isCompactLandscape 
        ? "text-lg mobile-s:text-xl" 
        : "text-xl mobile-s:text-2xl mobile-m:text-2xl"
    };
  }, [isLandscape]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={gameContainerRef}
      className={layoutClasses.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchEndCapture={handleDoubleTap}
    >
      {/* Main Game Content */}
      <div className={`${layoutClasses.panelWidth} flex flex-col items-center`}>
        {/* Header */}
        <div className={`${layoutClasses.maxWidth} mb-4 mobile-s:mb-6 mobile-m:mb-8`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider text-te-black/50">TE-01</div>
            <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider text-te-black/50">V1.0</div>
          </div>
          <h1 className={`${textSizeClasses.header} font-bold uppercase tracking-tight mb-1`}>Tic Tac Toe</h1>
          <div className="h-0.5 bg-te-black w-full" />
        </div>

        {/* Game Mode Selector */}
        <div className={`${layoutClasses.maxWidth} mb-4 mobile-s:mb-6`}>
          <div className="flex gap-1 mobile-s:gap-2 mb-3 mobile-s:mb-4">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`flex-1 py-2 mobile-s:py-3 px-2 mobile-s:px-4 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium transition-all touch-optimized active-feedback ${
                gameMode === 'pvp'
                  ? 'bg-te-orange text-te-white'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10 active:bg-te-black/20'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); }}
              className={`flex-1 py-2 mobile-s:py-3 px-2 mobile-s:px-4 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium transition-all touch-optimized active-feedback ${
                gameMode === 'pvc'
                  ? 'bg-te-orange text-te-white'
                  : 'bg-te-gray text-te-black hover:bg-te-black/10 active:bg-te-black/20'
              }`}
            >
              Player vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-1 mobile-s:gap-2">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`flex-1 py-2 mobile-s:py-3 px-2 mobile-s:px-4 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium transition-all touch-optimized active-feedback ${
                  difficulty === 'easy'
                    ? 'bg-te-black text-te-white'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10 active:bg-te-black/20'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`flex-1 py-2 mobile-s:py-3 px-2 mobile-s:px-4 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium transition-all touch-optimized active-feedback ${
                  difficulty === 'hard'
                    ? 'bg-te-black text-te-white'
                    : 'bg-te-gray text-te-black hover:bg-te-black/10 active:bg-te-black/20'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className={`${layoutClasses.maxWidth} mb-4 mobile-s:mb-6`}>
          <div className="grid grid-cols-3 gap-2 mobile-s:gap-4 bg-te-gray p-3 mobile-s:p-4">
            <div className="text-center">
              <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
              <div className={`${textSizeClasses.score} font-bold`}>{score.X}</div>
            </div>
            <div className="text-center">
              <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider mb-1 text-te-black/50">Draw</div>
              <div className={`${textSizeClasses.score} font-bold`}>-</div>
            </div>
            <div className="text-center">
              <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider mb-1 text-te-black/50">
                {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
              </div>
              <div className={`${textSizeClasses.score} font-bold`}>{score.O}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Board - Center or Side Panel */}
      <div className={`${layoutClasses.panelWidth} flex flex-col items-center`}>
        <div className="relative mb-4 mobile-s:mb-6">
          <div className="grid grid-cols-3 gap-0 bg-te-black p-1 animate-grid-appear">
            {board.map((cell, index) => (
              <GameCell
                key={index}
                cell={cell}
                index={index}
                isWinning={winningLine?.includes(index) ?? false}
                isDisabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                boardSizeClass={layoutClasses.boardSize}
                textSizeClasses={textSizeClasses}
                onClick={() => handleCellClick(index)}
              />
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
        <div className={`${layoutClasses.maxWidth} mb-4 mobile-s:mb-6 text-center`}>
          <div className="bg-te-gray p-3 mobile-s:p-4">
            {winner ? (
              <div>
                <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider mb-2 text-te-black/50">
                  {isDraw ? 'Game Draw' : 'Winner'}
                </div>
                <div className={`${textSizeClasses.status} font-bold ${isDraw ? 'text-te-black' : 'text-te-orange'}`}>
                  {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider mb-2 text-te-black/50">Current Turn</div>
                <div className={`${textSizeClasses.status} font-bold ${currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'}`}>
                  {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className={`${layoutClasses.maxWidth} flex gap-1 mobile-s:gap-2`}>
          <button
            onClick={resetGame}
            className="flex-1 bg-te-black text-te-white py-3 mobile-s:py-4 px-4 mobile-s:px-6 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium hover:bg-te-orange active:bg-te-orange/90 transition-colors touch-optimized active-feedback"
          >
            New Game
          </button>
          <button
            onClick={resetScore}
            className="flex-1 bg-te-gray text-te-black py-3 mobile-s:py-4 px-4 mobile-s:px-6 text-mobile-xs mobile-s:text-xs uppercase tracking-wider font-medium hover:bg-te-black hover:text-te-white active:bg-te-black/90 transition-colors touch-optimized active-feedback"
          >
            Reset Score
          </button>
        </div>

        {/* Mobile Gesture Hints */}
        <div className={`${layoutClasses.maxWidth} mt-4 mobile-s:mt-6 text-center`}>
          <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider text-te-black/30 mb-2">
            Mobile Gestures
          </div>
          <div className="text-mobile-xs uppercase tracking-wider text-te-black/40 space-y-1">
            <div>↑ Swipe Up: New Game</div>
            <div>↓ Swipe Down: Reset Score</div>
            <div>← → Swipe L/R: Toggle Mode</div>
            {gameMode === 'pvc' && <div>Double Tap: Toggle Difficulty</div>}
          </div>
        </div>

        {/* Footer */}
        <div className={`${layoutClasses.maxWidth} mt-4 mobile-s:mt-6 mobile-m:mt-8 text-center`}>
          <div className="text-mobile-xs mobile-s:text-xs uppercase tracking-wider text-te-black/30">
            teenage engineering × tic tac toe
          </div>
          {/* Vibration Toggle for Mobile */}
          {'vibrate' in navigator && (
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className="mt-2 text-mobile-xs mobile-s:text-xs uppercase tracking-wider text-te-black/50 hover:text-te-orange transition-colors"
            >
              Vibration: {vibrationEnabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
