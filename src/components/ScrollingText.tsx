
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollingTextProps {
  text: string;
  className?: string;
}

const ScrollingText = ({ text, className }: ScrollingTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000);
    
    return () => clearInterval(pulseInterval);
  }, [text]);
  
  return (
    <>
   <div>
    
   </div>
    <div className="overflow-hidden relative w-full bg-black/10 py-1.5 px-2 rounded">
      <div 
        ref={containerRef}
        className={cn(
          "whitespace-nowrap inline-block transition-all duration-700",
          isAnimating ? "scale-[1.02] text-primary" : "scale-100",
          className
        )}
      >
        {text}
      </div>
    </div> </>
  );
};

export default ScrollingText;
