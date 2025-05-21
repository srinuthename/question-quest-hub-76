
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ScrollingText from "@/components/ScrollingText";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <header className={cn("bg-transparent text-white py-2 px-4 flex items-center justify-between rounded-lg backdrop-blur-sm", className)}>
      {/* Left section - Logo and brand name (hidden on mobile) */}
      <div className={`${isMobile ? 'hidden' : 'flex items-center gap-2'}`}>
        <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
          <Boxes className="h-6 w-6" />
          <h1 className="text-xl font-bold">QuizCube</h1>
        </Link>
      </div>
      
      {/* Middle section - Scrolling text */}
      <div className="flex-1 mx-4">
        <ScrollingText 
          className="text-white font-medium"
        />
      </div>
      
      {/* Right section - LIVE button (hidden on mobile) */}
      <div className={`flex items-center justify-end ${isMobile ? 'hidden' : 'w-20'}`}>
        <div className="flex items-center gap-1.5 bg-[#c34a36] px-3 py-1.5 rounded-md shadow-lg relative overflow-hidden">
          {/* Pulsing dot with improved animation */}
          <span className="relative flex h-3 w-3 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          
          {/* Text with shadow for better visibility */}
          <span className="text-sm font-bold text-white relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
