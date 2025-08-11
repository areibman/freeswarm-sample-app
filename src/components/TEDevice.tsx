import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, RoundedBox, Text, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

interface TEDeviceProps {
  board: (string | null)[];
  currentPlayer: string | null;
  winner: string | null;
  score: { X: number; O: number };
  gameMode: 'pvp' | 'pvc';
  difficulty: 'easy' | 'hard';
  onCellClick: (index: number) => void;
  onReset: () => void;
  onModeChange: (mode: 'pvp' | 'pvc') => void;
  onDifficultyChange: (diff: 'easy' | 'hard') => void;
  winningLine: number[] | null;
}

// Individual game button component
const GameButton: React.FC<{
  position: [number, number, number];
  value: string | null;
  onClick: () => void;
  isWinning: boolean;
  index: number;
}> = ({ position, value, onClick, isWinning, index }) => {
  const [isPressed, setIsPressed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const targetY = isPressed ? -0.02 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.2
      );
    }
  });

  return (
    <group position={position}>
      {/* Button base */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsPressed(true);
          onClick();
          setTimeout(() => setIsPressed(false), 150);
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[0.18, 0.05, 0.18]} />
        <meshStandardMaterial
          color={isWinning ? '#ff6b00' : value ? '#2a2a2a' : '#f5f5f5'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Button cap */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.16]} />
        <meshStandardMaterial
          color={value === 'X' ? '#1a1a1a' : value === 'O' ? '#ff6b00' : '#e0e0e0'}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* LED indicator */}
      {value && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.12, 0.005, 0.12]} />
          <meshStandardMaterial
            color={value === 'X' ? '#00ff00' : '#ff0000'}
            emissive={value === 'X' ? '#00ff00' : '#ff0000'}
            emissiveIntensity={isWinning ? 2 : 0.5}
          />
        </mesh>
      )}

      {/* Button label */}
      {value && (
        <Text
          position={[0, 0.06, 0]}
          fontSize={0.08}
          color={value === 'X' ? '#ffffff' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          font="/fonts/mono.woff"
        >
          {value}
        </Text>
      )}
    </group>
  );
};

// Knob component for settings
const Knob: React.FC<{
  position: [number, number, number];
  value: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ position, value, onChange, label }) => {
  const knobRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);

  useFrame(() => {
    if (knobRef.current) {
      knobRef.current.rotation.z = -value * Math.PI * 1.5 - Math.PI * 0.75;
    }
  });

  return (
    <group position={position}>
      {/* Knob base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Knob cap */}
      <mesh
        ref={knobRef}
        position={[0, 0.02, 0]}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerMove={(e) => {
          if (isDragging) {
            e.stopPropagation();
            const newValue = Math.max(0, Math.min(1, value + e.movementX * 0.01));
            onChange(newValue);
          }
        }}
        onPointerEnter={() => { document.body.style.cursor = 'grab'; }}
        onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.03, 32]} />
        <meshStandardMaterial
          color="#ff6b00"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Knob indicator */}
      <mesh position={[0, 0.04, 0.03]} rotation={[0, 0, -value * Math.PI * 1.5 - Math.PI * 0.75]}>
        <boxGeometry args={[0.01, 0.03, 0.01]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.08, 0]}
        fontSize={0.025}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Toggle switch component
const ToggleSwitch: React.FC<{
  position: [number, number, number];
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}> = ({ position, value, onChange, label }) => {
  const switchRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (switchRef.current) {
      const targetX = value ? 0.03 : -0.03;
      switchRef.current.position.x = THREE.MathUtils.lerp(
        switchRef.current.position.x,
        targetX,
        0.2
      );
    }
  });

  return (
    <group position={position}>
      {/* Switch base */}
      <mesh>
        <boxGeometry args={[0.1, 0.03, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Switch toggle */}
      <mesh
        ref={switchRef}
        position={[value ? 0.03 : -0.03, 0.02, 0]}
        onClick={() => onChange(!value)}
        onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.04, 0.02, 0.03]} />
        <meshStandardMaterial
          color={value ? '#ff6b00' : '#666666'}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.05, 0]}
        fontSize={0.02}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Main device component
export const TEDevice: React.FC<TEDeviceProps> = ({
  board,
  currentPlayer,
  winner,
  score,
  gameMode,
  difficulty,
  onCellClick,
  onReset,
  onModeChange,
  onDifficultyChange,
  winningLine
}) => {
  const deviceRef = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (deviceRef.current && hover) {
      deviceRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  // Calculate board positions
  const getBoardPosition = (index: number): [number, number, number] => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return [
      (col - 1) * 0.25,
      0.31,
      (row - 1) * 0.25
    ];
  };

  return (
    <group
      ref={deviceRef}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* Main device body */}
      <RoundedBox
        args={[2.2, 0.3, 1.8]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.8}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Orange accent stripe */}
      <Box args={[2.2, 0.02, 0.1]} position={[0, 0.16, -0.8]}>
        <meshStandardMaterial
          color="#ff6b00"
          roughness={0.3}
          metalness={0.5}
        />
      </Box>

      {/* Display screen */}
      <group position={[0, 0.16, 0.3]}>
        <Box args={[1.2, 0.02, 0.6]}>
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.9}
            metalness={0.05}
          />
        </Box>

        {/* Score display */}
        <Text
          position={[-0.4, 0.02, 0]}
          fontSize={0.08}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/mono.woff"
        >
          X: {score.X}
        </Text>

        <Text
          position={[0.4, 0.02, 0]}
          fontSize={0.08}
          color="#ff0000"
          anchorX="center"
          anchorY="middle"
          font="/fonts/mono.woff"
        >
          O: {score.O}
        </Text>

        {/* Status display */}
        <Text
          position={[0, 0.02, 0.2]}
          fontSize={0.04}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {winner ? (winner === 'D' ? 'DRAW!' : `${winner} WINS!`) : `Turn: ${currentPlayer}`}
        </Text>
      </group>

      {/* Game board buttons */}
      <group position={[0, 0, -0.2]}>
        {board.map((cell, index) => (
          <GameButton
            key={index}
            position={getBoardPosition(index)}
            value={cell}
            onClick={() => onCellClick(index)}
            isWinning={winningLine?.includes(index) || false}
            index={index}
          />
        ))}
      </group>

      {/* Control panel */}
      <group position={[0.7, 0.15, 0.5]}>
        {/* Mode switch */}
        <ToggleSwitch
          position={[0, 0, 0]}
          value={gameMode === 'pvc'}
          onChange={(val) => onModeChange(val ? 'pvc' : 'pvp')}
          label="CPU"
        />

        {/* Difficulty knob */}
        {gameMode === 'pvc' && (
          <Knob
            position={[0.2, 0, 0]}
            value={difficulty === 'hard' ? 1 : 0}
            onChange={(val) => onDifficultyChange(val > 0.5 ? 'hard' : 'easy')}
            label="DIFF"
          />
        )}
      </group>

      {/* Reset button */}
      <mesh
        position={[-0.7, 0.15, 0.5]}
        onClick={onReset}
        onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.03, 32]} />
        <meshStandardMaterial
          color="#ff0000"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <Text
        position={[-0.7, 0.08, 0.5]}
        fontSize={0.02}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        RESET
      </Text>

      {/* Device label */}
      <Text
        position={[0, 0.16, -0.7]}
        fontSize={0.04}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
      >
        TE-01 TIC TAC TOE
      </Text>

      {/* Side vents */}
      {[-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((x, i) => (
        <Box key={i} args={[0.02, 0.15, 0.6]} position={[x, 0, 0.6]}>
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </Box>
      ))}
    </group>
  );
};