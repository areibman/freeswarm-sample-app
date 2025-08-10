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

  // Audio context for TE-style beeps and clicks
  const audioRef = useRef<AudioContext | null>(null);
  const knobValueRef = useRef<number>(0.5); // 0..1 for pitch/color

  const ensureAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioRef.current!;
  };

  const playBeep = (frequency: number, durationMs = 120, type: OscillatorType = 'square') => {
    const ac = ensureAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = frequency;

    // Short TE-like envelope
    const now = ac.currentTime;
    const attack = 0.005;
    const decay = 0.09;
    const sustain = 0.15;
    const release = 0.08;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + attack);
    gain.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
    gain.gain.setValueAtTime(sustain, now + durationMs / 1000);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000 + release);

    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + release + 0.02);
  };

  const playClick = () => playBeep(220 + 200 * knobValueRef.current, 80, 'triangle');
  const playSuccess = () => playBeep(660, 160, 'square');
  const playError = () => playBeep(120, 140, 'sawtooth');

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
            playSuccess();
          } else if (newBoard.every(cell => cell !== null)) {
            setWinner('O'); // Draw label reused
            playBeep(300, 120, 'triangle');
          } else {
            setCurrentPlayer('X');
            playClick();
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
      playSuccess();
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('O'); // Draw
      playBeep(300, 120, 'triangle');
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      playClick();
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    playBeep(500 + 200 * knobValueRef.current, 80, 'square');
  };

  const resetScore = () => {
    setScore({ X: 0, O: 0 });
    resetGame();
  };

  const isDraw = winner === 'O' && board.every(cell => cell !== null);

  // Parallax tilt and gloss tracking
  const deviceRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = deviceRef.current;
    const inner = innerRef.current;
    if (!host || !inner) return;

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = Math.max(-1, Math.min(1, -dy)) * 6; // tilt extent
      const ry = Math.max(-1, Math.min(1, dx)) * 6;
      host.style.setProperty('--rx', `${rx}deg`);
      host.style.setProperty('--ry', `${ry}deg`);
      host.style.setProperty('--mx', `${((dx + 1) / 2) * 100}%`);
      host.style.setProperty('--my', `${((dy + 1) / 2) * 100}%`);
    };

    const onLeave = () => {
      host.style.setProperty('--rx', `0deg`);
      host.style.setProperty('--ry', `0deg`);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Knob interaction to change pitch/color
  const knobRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const knob = knobRef.current;
    if (!knob) return;
    let dragging = false;

    const onDown = (e: MouseEvent) => {
      dragging = true; e.preventDefault();
    };
    const onUp = () => { dragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx); // -PI..PI
      const norm = (angle + Math.PI) / (2 * Math.PI); // 0..1
      const clamped = Math.min(0.9, Math.max(0.1, norm));
      knobValueRef.current = clamped;
      const deg = 300 * (clamped - 0.5); // -150..150 deg
      knob.style.transform = `rotate(${deg}deg)`;
    };

    knob.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      knob.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-6">
      <div ref={deviceRef} className="device max-w-xl w-full">
        <div ref={innerRef} className="device-inner p-5">
          {/* Top status bar with TE-style labels and knob */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-te-black/50">TE-01</div>
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-wider text-te-black/50">V1.1</div>
              <div className="knob relative" ref={knobRef} aria-label="Pitch knob">
                <div className="knob-pointer" />
              </div>
            </div>
          </div>

          {/* Bezel containing UI */}
          <div className="device-bezel p-4">
            {/* Header */}
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">Tic Tac Toe</h1>
            <div className="h-0.5 bg-te-black/80 w-full mb-4" />

            {/* Game Mode Selector */}
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setGameMode('pvp'); resetGame(); playClick(); }}
                  className={`${gameMode === 'pvp' ? 'bg-te-orange text-te-white' : 'bg-te-gray text-te-black hover:bg-te-black/10'} btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all`}
                >
                  Player vs Player
                </button>
                <button
                  onClick={() => { setGameMode('pvc'); resetGame(); playClick(); }}
                  className={`${gameMode === 'pvc' ? 'bg-te-orange text-te-white' : 'bg-te-gray text-te-black hover:bg-te-black/10'} btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all`}
                >
                  Player vs CPU
                </button>
              </div>

              {gameMode === 'pvc' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDifficulty('easy'); resetGame(); playClick(); }}
                    className={`${difficulty === 'easy' ? 'bg-te-black text-te-white' : 'bg-te-gray text-te-black hover:bg-te-black/10'} btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => { setDifficulty('hard'); resetGame(); playClick(); }}
                    className={`${difficulty === 'hard' ? 'bg-te-black text-te-white' : 'bg-te-gray text-te-black hover:bg-te-black/10'} btn-3d flex-1 py-2 px-4 text-xs uppercase tracking-wider font-medium transition-all`}
                  >
                    Hard
                  </button>
                </div>
              )}
            </div>

            {/* Score Display */}
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4 bg-te-gray p-4 rounded-md">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Player X</div>
                  <div className="text-2xl font-bold">{score.X}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">Draw</div>
                  <div className="text-2xl font-bold">-</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1 text-te-black/50">
                    {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
                  </div>
                  <div className="text-2xl font-bold">{score.O}</div>
                </div>
              </div>
            </div>

            {/* Game Board */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-0 bg-te-black p-1 animate-grid-appear rounded-md">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
                    className={`
                      tile-3d w-24 h-24 bg-te-white flex items-center justify-center
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
                          mark-3d text-5xl font-bold animate-mark-appear
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
              <div className="bg-te-gray p-4 rounded-md">
                {winner ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">
                      {isDraw ? 'Game Draw' : 'Winner'}
                    </div>
                    <div className={`text-2xl font-bold ${isDraw ? 'text-te-black' : 'text-te-orange'}`}>
                      {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50">Current Turn</div>
                    <div className={`text-2xl font-bold ${currentPlayer === 'X' ? 'text-te-black' : 'text-te-orange'}`}>
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
            <div className="mt-5 text-center">
              <div className="text-xs uppercase tracking-wider text-te-black/30">
                teenage engineering × tic tac toe
              </div>
            </div>
          </div>

          {/* Gloss overlay */}
          <div className="device-gloss" />
        </div>
      </div>
    </div>
  );
};

export default App;
