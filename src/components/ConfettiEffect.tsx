
import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface ConfettiEffectProps {
  active: boolean;
}

const ConfettiEffect = ({ active }: ConfettiEffectProps) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiIntensity, setConfettiIntensity] = useState(1);

  useEffect(() => {
    if (active) {
      setShowConfetti(true);
      
      // Change confetti intensity over time for a more dynamic effect
      const intensityInterval = setInterval(() => {
        setConfettiIntensity(prev => {
          const newValue = prev === 1 ? 2 : prev === 2 ? 0.5 : 1;
          return newValue;
        });
      }, 3000);
      
      return () => clearInterval(intensityInterval);
    } else {
      setShowConfetti(false);
    }
  }, [active]);

  if (!showConfetti) return null;
  
  // Calculate number of pieces based on screen size and intensity
  const numberOfPieces = Math.min(
    500, 
    Math.max(200, Math.floor(width * height / 1500) * confettiIntensity)
  );

  return (
    <>
      <ReactConfetti
        width={width}
        height={height}
        recycle={true}
        numberOfPieces={numberOfPieces}
        gravity={0.1}
        colors={['#845ec2', '#2c73d2', '#0081cf', '#0089ba', '#008e9b', '#d65db1', '#ff9671', '#ffc75f', '#f9f871']}
        confettiSource={{
          x: width / 2,
          y: 0,
          w: width,
          h: 0
        }}
      />
      {/* Second confetti layer with different settings for more variety */}
      <ReactConfetti
        width={width}
        height={height}
        recycle={true}
        numberOfPieces={numberOfPieces / 2}
        gravity={0.15}
        wind={0.01}
        colors={['#F97316', '#D946EF', '#8B5CF6', '#0EA5E9', '#FFD700', '#FF6347']}
        confettiSource={{
          x: 0,
          y: 0,
          w: width,
          h: 10
        }}
      />
    </>
  );
};

export default ConfettiEffect;
