import { useEffect } from 'react';

interface KeyboardControlsProps {
  onReset: () => void;
  onModeToggle: () => void;
  onDifficultyToggle: () => void;
  gameMode: 'pvp' | 'pvc';
  difficulty: 'easy' | 'hard';
}

export const useKeyboardControls = ({
  onReset,
  onModeToggle,
  onDifficultyToggle,
  gameMode,
  difficulty
}: KeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          onReset();
          break;
        case 'm':
          onModeToggle();
          break;
        case 'd':
          if (gameMode === 'pvc') {
            onDifficultyToggle();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onReset, onModeToggle, onDifficultyToggle, gameMode, difficulty]);
};