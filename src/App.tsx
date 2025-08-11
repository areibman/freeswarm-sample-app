import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Loader } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { TEDevice } from './components/TEDevice';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useSoundEffects } from './hooks/useSoundEffects';
import * as THREE from 'three';

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

  const { playButtonClick, playWinSound, playDrawSound, playToggleSwitch, playKnobTurn } = useSoundEffects();

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
          playButtonClick(); // Add sound effect

          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setScore(prev => ({
              ...prev,
              [result.winner as 'X' | 'O']: prev[result.winner as 'X' | 'O'] + 1
            }));
            playWinSound(); // Add win sound
          } else if (newBoard.every(cell => cell !== null)) {
            setWinner('O'); // Draw
            playDrawSound(); // Add draw sound
          } else {
            setCurrentPlayer('X');
          }
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, winner, difficulty, playButtonClick, playWinSound, playDrawSound]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'pvc' && currentPlayer === 'O')) return;

    playButtonClick(); // Add sound effect
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
      playWinSound(); // Add win sound
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('O'); // Draw
      playDrawSound(); // Add draw sound
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    playToggleSwitch(); // Add reset sound
  };

  const resetScore = () => {
    setScore({ X: 0, O: 0 });
    resetGame();
  };

  const handleModeChange = (mode: 'pvp' | 'pvc') => {
    setGameMode(mode);
    resetGame();
    playToggleSwitch();
  };

  const handleDifficultyChange = (diff: 'easy' | 'hard') => {
    setDifficulty(diff);
    resetGame();
    playKnobTurn();
  };

  // Keyboard controls
  useKeyboardControls({
    onReset: resetGame,
    onModeToggle: () => handleModeChange(gameMode === 'pvp' ? 'pvc' : 'pvp'),
    onDifficultyToggle: () => handleDifficultyChange(difficulty === 'easy' ? 'hard' : 'easy'),
    gameMode,
    difficulty
  });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 2, 4]}
          fov={45}
          near={0.1}
          far={100}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ff6b00" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Device */}
        <Suspense fallback={null}>
          <TEDevice
            board={board}
            currentPlayer={currentPlayer}
            winner={winner}
            score={score}
            gameMode={gameMode}
            difficulty={difficulty}
            onCellClick={handleCellClick}
            onReset={resetGame}
            onModeChange={handleModeChange}
            onDifficultyChange={handleDifficultyChange}
            winningLine={winningLine}
          />
        </Suspense>

        {/* Table/Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Grid pattern on surface */}
        <gridHelper
          args={[10, 20, '#333333', '#222222']}
          position={[0, -0.19, 0]}
        />

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={2}
          maxDistance={8}
          target={[0, 0, 0]}
        />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            offset={[0.001, 0.001]}
          />
          <Vignette
            darkness={0.4}
            offset={0.5}
          />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 p-6 text-white no-select ui-overlay">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs uppercase tracking-wider opacity-70">Device Online</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TE-01</h1>
        <p className="text-xs uppercase tracking-wider opacity-50">Tic Tac Toe Edition</p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 p-6 text-white no-select">
        <div className="text-xs uppercase tracking-wider opacity-50 space-y-1">
          <p>Click buttons to play</p>
          <p>Drag to rotate view</p>
          <p>Scroll to zoom</p>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="absolute bottom-0 right-0 p-6 text-white no-select">
        <div className="text-xs uppercase tracking-wider opacity-50 space-y-1">
          <p>[R] Reset Game</p>
          <p>[M] Toggle Mode</p>
          <p>[D] Toggle Difficulty</p>
        </div>
      </div>

      {/* Sound toggle */}
      <div className="absolute top-0 right-0 p-6">
        <button
          className="text-white opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            playToggleSwitch();
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <Loader />
    </div>
  );
};

export default App;
