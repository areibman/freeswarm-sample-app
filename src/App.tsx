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
    <div className="min-h-screen bg-te-white grid-pattern flex flex-col items-center justify-center p-4" style={{ perspective: '2000px' }}>
      {/* Header with 3D effect */}
      <div className="max-w-lg w-full mb-8 transform-gpu" style={{ transform: 'translateZ(50px)' }}>
        <div className="bg-te-white shadow-te-3d p-4 border-2 border-te-black">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-te-black/50 font-bold">TE-01</div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-te-orange rounded-full animate-pulse-slow"></div>
              <div className="w-2 h-2 bg-te-black rounded-full"></div>
              <div className="w-2 h-2 bg-te-gray-dark rounded-full"></div>
            </div>
            <div className="text-xs uppercase tracking-wider text-te-black/50 font-bold">V1.0</div>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-1 text-3d">Tic Tac Toe</h1>
          <div className="h-1 bg-te-orange w-full shadow-te-3d-sm" />
        </div>
      </div>

      {/* Game Mode Selector with 3D buttons */}
      <div className="max-w-lg w-full mb-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => { setGameMode('pvp'); resetGame(); }}
            className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-bold transition-all btn-3d border-2 border-te-black ${
              gameMode === 'pvp'
                ? 'bg-te-orange text-te-white shadow-te-3d-orange'
                : 'bg-te-white text-te-black shadow-te-3d hover:shadow-te-3d-lg hover:-translate-y-0.5'
            }`}
          >
            Player vs Player
          </button>
          <button
            onClick={() => { setGameMode('pvc'); resetGame(); }}
            className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-bold transition-all btn-3d border-2 border-te-black ${
              gameMode === 'pvc'
                ? 'bg-te-orange text-te-white shadow-te-3d-orange'
                : 'bg-te-white text-te-black shadow-te-3d hover:shadow-te-3d-lg hover:-translate-y-0.5'
            }`}
          >
            Player vs CPU
          </button>
        </div>

        {gameMode === 'pvc' && (
          <div className="flex gap-3">
            <button
              onClick={() => { setDifficulty('easy'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-bold transition-all btn-3d border-2 border-te-black ${
                difficulty === 'easy'
                  ? 'bg-te-black text-te-white shadow-te-3d'
                  : 'bg-te-gray text-te-black shadow-te-3d-sm hover:shadow-te-3d hover:-translate-y-0.5'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => { setDifficulty('hard'); resetGame(); }}
              className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-bold transition-all btn-3d border-2 border-te-black ${
                difficulty === 'hard'
                  ? 'bg-te-black text-te-white shadow-te-3d'
                  : 'bg-te-gray text-te-black shadow-te-3d-sm hover:shadow-te-3d hover:-translate-y-0.5'
              }`}
            >
              Hard
            </button>
          </div>
        )}
      </div>

      {/* Score Display with 3D card effect */}
      <div className="max-w-lg w-full mb-8">
        <div className="grid grid-cols-3 gap-4 bg-te-white p-6 border-2 border-te-black shadow-te-3d-lg card-3d">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 font-bold">Player X</div>
            <div className="text-3xl font-bold text-3d">{score.X}</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 font-bold">Draw</div>
            <div className="text-3xl font-bold text-3d">-</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider mb-2 text-te-black/50 font-bold">
              {gameMode === 'pvc' ? 'CPU O' : 'Player O'}
            </div>
            <div className="text-3xl font-bold text-3d-orange text-te-orange">{score.O}</div>
          </div>
        </div>
      </div>

      {/* Game Board with enhanced 3D effect */}
      <div className="relative mb-8" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(10deg)' }}>
        <div className="absolute inset-0 bg-te-black/20 blur-xl transform translate-y-8" style={{ zIndex: -1 }}></div>
        <div className="grid grid-cols-3 gap-0 bg-te-black p-2 animate-grid-appear board-3d shadow-te-elevated">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || (gameMode === 'pvc' && currentPlayer === 'O')}
              className={`
                w-28 h-28 bg-te-white flex items-center justify-center
                transition-all duration-200 relative overflow-hidden cell-3d
                ${!cell && !winner ? 'hover:bg-te-gray hover:shadow-te-inner cursor-pointer' : ''}
                ${winningLine?.includes(index) ? 'bg-te-orange/30 animate-pulse-slow' : ''}
                ${index % 3 !== 2 ? 'border-r-4 border-te-black' : ''}
                ${index < 6 ? 'border-b-4 border-te-black' : ''}
                shadow-te-inner
              `}
              style={{
                transformStyle: 'preserve-3d',
                transform: winningLine?.includes(index) ? 'translateZ(15px)' : 'translateZ(0)'
              }}
            >
              {cell && (
                <span
                  className={`
                    text-6xl font-bold animate-mark-appear
                    ${cell === 'X' ? 'text-te-black text-3d' : 'text-te-orange text-3d-orange'}
                    ${winningLine?.includes(index) ? 'animate-float-3d' : ''}
                  `}
                >
                  {cell}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Display with 3D card */}
      <div className="max-w-lg w-full mb-6 text-center">
        <div className="bg-te-white p-6 border-2 border-te-black shadow-te-3d-lg card-3d">
          {winner ? (
            <div>
              <div className="text-xs uppercase tracking-wider mb-3 text-te-black/50 font-bold">
                {isDraw ? 'Game Draw' : 'Winner'}
              </div>
              <div className={`text-3xl font-bold ${isDraw ? 'text-te-black text-3d' : 'text-te-orange text-3d-orange animate-pulse-slow'}`}>
                {isDraw ? 'Draw!' : `Player ${winner} Wins!`}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-wider mb-3 text-te-black/50 font-bold">Current Turn</div>
              <div className={`text-3xl font-bold ${currentPlayer === 'X' ? 'text-te-black text-3d' : 'text-te-orange text-3d-orange'}`}>
                {gameMode === 'pvc' && currentPlayer === 'O' ? 'CPU' : 'Player'} {currentPlayer}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons with enhanced 3D effect */}
      <div className="max-w-lg w-full flex gap-3">
        <button
          onClick={resetGame}
          className="flex-1 bg-te-black text-te-white py-4 px-6 text-xs uppercase tracking-wider font-bold 
                     border-2 border-te-black shadow-te-3d-lg btn-3d
                     hover:bg-te-orange hover:shadow-te-3d-orange transition-all"
        >
          New Game
        </button>
        <button
          onClick={resetScore}
          className="flex-1 bg-te-white text-te-black py-4 px-6 text-xs uppercase tracking-wider font-bold 
                     border-2 border-te-black shadow-te-3d btn-3d
                     hover:bg-te-gray hover:shadow-te-3d-lg transition-all"
        >
          Reset Score
        </button>
      </div>

      {/* Footer with 3D text */}
      <div className="max-w-lg w-full mt-12 text-center">
        <div className="text-xs uppercase tracking-wider text-te-black/40 font-bold text-3d">
          teenage engineering × tic tac toe
        </div>
      </div>
    </div>
  );
};

export default App;
