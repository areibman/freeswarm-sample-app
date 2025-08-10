import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type]);
  }
  
  // iOS Haptic Feedback (if available)
  if (window.webkit?.messageHandlers?.haptic) {
    window.webkit.messageHandlers.haptic.postMessage(type);
  }
};

// Check if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
};

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [gameMode, setGameMode] = useState<'pvp' | 'pvc'>('pvp');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [showMenu, setShowMenu] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Prevent zoom on double tap
  useEffect(() => {
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    return () => document.removeEventListener('touchend', preventZoom);
  }, []);

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
    if (gameMode === 'pvc' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const move = getBestMove(newBoard);
        if (move !== -1) {
          newBoard[move] = 'O';
          setBoard(newBoard);
          triggerHaptic('medium');

          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setScore(prev => ({
              ...prev,
              [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
            }));
            triggerHaptic('heavy');
          } else if (newBoard.every(cell => cell !== null)) {
            setWinner('O'); // Draw
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
            triggerHaptic('medium');
          } else {
            setCurrentPlayer('X');
          }
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, winner, difficulty]);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || (gameMode === 'pvc' && currentPlayer === 'O')) return;

    triggerHaptic('light');
    
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
      triggerHaptic('heavy');
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('O'); // Draw
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      triggerHaptic('medium');
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, winner, gameMode, currentPlayer]);

  const resetGame = useCallback(() => {
    triggerHaptic('light');
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  }, []);

  const resetScore = useCallback(() => {
    triggerHaptic('medium');
    setScore({ X: 0, O: 0, draws: 0 });
    resetGame();
  }, [resetGame]);

  // Swipe gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
    
    // Swipe threshold
    if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
          // Swipe right - could be used for navigation
        } else {
          // Swipe left - could be used for navigation
        }
      } else {
        // Vertical swipe
        if (diffY > 0) {
          // Swipe down - show menu
          setShowMenu(true);
        } else {
          // Swipe up - hide menu
          setShowMenu(false);
        }
      }
    }
    
    setTouchStart(null);
  }, [touchStart]);

  const isDraw = winner === 'O' && board.every(cell => cell !== null);

  // Calculate responsive sizes
  const gridSize = useMemo(() => {
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    const maxSize = minDimension < 400 ? minDimension * 0.8 : minDimension * 0.6;
    return Math.min(maxSize, 360);
  }, [isLandscape]);

  const cellSize = useMemo(() => {
    return (gridSize - 8) / 3; // Subtract padding
  }, [gridSize]);

  return (
    <div className="min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-safe-top pb-safe-bottom px-4 touch-manipulation">
      {/* Header - Mobile Optimized */}
      <div className="w-full max-w-lg mb-4 xs:mb-6 animate-slide-down">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="text-[10px] xs:text-xs uppercase tracking-wider text-te-black/50">TE-01</div>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -m-2 touch:active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <h1 className="text-2xl xs:text-3xl font-bold uppercase tracking-tight mb-1 px-2">Tic Tac Toe</h1>
        <div className="h-0.5 bg-te-black w-full" />
      </div>

      {/* Collapsible Menu - Mobile Optimized */}
      <div className={`w-full max-w-lg overflow-hidden transition-all duration-300 ${showMenu ? 'max-h-96 mb-4' : 'max-h-0'}`}>
        <div className="bg-te-gray/50 backdrop-blur-sm p-4 rounded-lg animate-slide-up">
          {/* Game Mode Selector */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); triggerHaptic('light'); }}
              className={`flex-1 py-3 px-3 text-[11px] xs:text-xs uppercase tracking-wider font-medium transition-all rounded-lg btn-mobile ${
                gameMode === 'pvp'
                  ? 'bg-te-orange text-te-white shadow-lg'
                  : 'bg-te-white text-te-black touch:active:bg-te-gray'
              }`}
            >
              2 Players
            </button>
            <button
              onClick={() => { setGameMode('pvc'); resetGame(); triggerHaptic('light'); }}
              className={`flex-1 py-3 px-3 text-[11px] xs:text-xs uppercase tracking-wider font-medium transition-all rounded-lg btn-mobile ${
                gameMode === 'pvc'
                  ? 'bg-te-orange text-te-white shadow-lg'
                  : 'bg-te-white text-te-black touch:active:bg-te-gray'
              }`}
            >
              vs CPU
            </button>
          </div>

          {gameMode === 'pvc' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); triggerHaptic('light'); }}
                className={`flex-1 py-3 px-3 text-[11px] xs:text-xs uppercase tracking-wider font-medium transition-all rounded-lg btn-mobile ${
                  difficulty === 'easy'
                    ? 'bg-te-black text-te-white shadow-lg'
                    : 'bg-te-white text-te-black touch:active:bg-te-gray'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); triggerHaptic('light'); }}
                className={`flex-1 py-3 px-3 text-[11px] xs:text-xs uppercase tracking-wider font-medium transition-all rounded-lg btn-mobile ${
                  difficulty === 'hard'
                    ? 'bg-te-black text-te-white shadow-lg'
                    : 'bg-te-white text-te-black touch:active:bg-te-gray'
                }`}
              >
                Hard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Score Display - Mobile Optimized */}
      <div className="w-full max-w-lg mb-4 xs:mb-6">
        <div className="grid grid-cols-3 gap-2 xs:gap-4 bg-te-gray/30 backdrop-blur-sm p-3 xs:p-4 rounded-lg">
          <div className="text-center">
            <div className="text-[10px] xs:text-xs uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
            <div className="text-xl xs:text-2xl font-bold">{score.X}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] xs:text-xs uppercase tracking-wider mb-1 text-te-black/50">Draws</div>
            <div className="text-xl xs:text-2xl font-bold">{score.draws}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] xs:text-xs uppercase tracking-wider mb-1 text-te-black/50">
              {gameMode === 'pvc' ? 'CPU' : 'Player O'}
            </div>
            <div className="text-xl xs:text-2xl font-bold">{score.O}</div>
          </div>
        </div>
      </div>

      {/* Game Board - Fully Responsive */}
      <div 
        ref={boardRef}
        className="relative touch-none"
        style={{ width: gridSize, height: gridSize }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-3 gap-1 bg-te-black p-1 rounded-lg animate-grid-appear h-full">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
              className={`
                bg-te-white flex items-center justify-center
                transition-all duration-200 relative overflow-hidden rounded
                touch:active:scale-95 touch:active:bg-te-gray
                ${!cell && !winner ? 'cursor-pointer' : ''}
                ${winningLine?.includes(index) ? 'bg-te-orange/20 animate-pulse' : ''}
              `}
              style={{ width: cellSize, height: cellSize }}
              aria-label={`Cell ${index + 1}`}
            >
              {cell && (
                <span
                  className={`
                    font-bold animate-mark-appear select-none
                    ${cell === 'X' ? 'text-te-black' : 'text-te-orange'}
                    ${winningLine?.includes(index) ? 'text-shadow-glow scale-110' : ''}
                  `}
                  style={{ fontSize: `${cellSize * 0.5}px` }}
                >
                  {cell}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Display - Mobile Optimized */}
      <div className="w-full max-w-lg mt-4 xs:mt-6 text-center">
        <div className="bg-te-gray/30 backdrop-blur-sm p-3 xs:p-4 rounded-lg">
          {winner ? (
            <div className="animate-slide-up">
              <div className="text-[10px] xs:text-xs uppercase tracking-wider mb-1 xs:mb-2 text-te-black/50">
                {isDraw ? 'Game Draw' : 'Winner'}
              </div>
              <div className={`text-xl xs:text-2xl font-bold ${isDraw ? 'text-te-black' : 'text-te-orange animate-pulse'}`}>
                {isDraw ? 'It\'s a Draw!' : `Player ${winner} Wins!`}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] xs:text-xs uppercase tracking-wider mb-1 xs:mb-2 text-te-black/50">Current Turn</div>
              <div className={`text-xl xs:text-2xl font-bold ${currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'}`}>
                {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU Thinking...' : `Player ${currentPlayer}`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons - Mobile Optimized */}
      <div className="w-full max-w-lg mt-4 xs:mt-6 flex gap-2 px-2">
        <button
          onClick={resetGame}
          className="flex-1 bg-te-black text-te-white py-4 px-4 text-[11px] xs:text-xs uppercase tracking-wider font-medium rounded-lg shadow-lg touch:active:scale-95 transition-all btn-mobile"
        >
          New Game
        </button>
        <button
          onClick={resetScore}
          className="flex-1 bg-te-white text-te-black py-4 px-4 text-[11px] xs:text-xs uppercase tracking-wider font-medium rounded-lg shadow-lg touch:active:scale-95 transition-all btn-mobile border border-te-black/10"
        >
          Reset All
        </button>
      </div>

      {/* Footer - Mobile Optimized */}
      <div className="w-full max-w-lg mt-6 xs:mt-8 text-center">
        <div className="text-[10px] xs:text-xs uppercase tracking-wider text-te-black/30">
          teenage engineering × tic tac toe
        </div>
        {isMobileDevice() && (
          <div className="text-[9px] xs:text-[10px] uppercase tracking-wider text-te-black/20 mt-1">
            Swipe up/down for menu
          </div>
        )}
      </div>
    </div>
  );
};

// Add TypeScript declarations for webkit
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        haptic?: {
          postMessage: (type: string) => void;
        };
      };
    };
  }
}

export default App;
