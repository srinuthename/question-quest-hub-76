
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollingTextProps {
  text: string;
  className?: string;
}

const ScrollingText = ({ text, className }: ScrollingTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const contentWidth = container.scrollWidth;
    const viewportWidth = container.offsetWidth;
    
    // Only apply animation if content is wider than the container
    if (contentWidth > viewportWidth) {
      container.className = cn(container.className, "animate-marquee");
    }
  }, [text]);
  
  return (
    <div className="overflow-hidden relative w-full bg-black/10 py-1.5 px-2 rounded">
      <div 
        ref={containerRef}
        className={cn("whitespace-nowrap inline-block", className)}
      >
        {text}
        <span className="px-4">•</span>
        {text}
      </div>
    </div>
  );
};

export default ScrollingText;
