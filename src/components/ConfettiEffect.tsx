
import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  active: boolean;
}

const ConfettiEffect = ({ active }: ConfettiEffectProps) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (active) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [active]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={true}
      numberOfPieces={200}
      gravity={0.05}
      colors={['#845ec2', '#2c73d2', '#0081cf', '#0089ba', '#008e9b', '#d65db1', '#ff9671']}
      confettiSource={{
        x: width / 2,
        y: 0,
        w: width,
        h: 0
      }}
    />
  );
};

export default ConfettiEffect;
