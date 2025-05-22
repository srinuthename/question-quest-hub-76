
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
    <header className={cn("bg-transparent py-2 px-4 flex items-center justify-between rounded-lg backdrop-blur-sm", className)}>
      {/* Left section - Logo and brand name (hidden on mobile) */}
      <div className={`${isMobile ? 'hidden' : 'flex items-center gap-2'}`}>
        <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
          <Boxes className="h-12 w-12 text-[#F97316]" />
          <h1 className="text-3xl font-bold text-gradient">QuizCube</h1>
        </Link>
      </div>

      {/* Middle section - Scrolling text */}
      <div className="flex-1 mx-4">
        <ScrollingText
          className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#D946EF]"
        />
      </div>

      {/* Right section - LIVE button (hidden on mobile) */}
      <div className={`flex items-center justify-end ${isMobile ? 'hidden' : 'w-20'}`}>
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] px-3 py-1.5 rounded-md shadow-lg relative overflow-hidden">
          {/* Pulsing dot with improved animation */}
          <span className="relative flex h-3 w-3 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          {/* Text with shadow for better visibility */}
          <span className="text-lg font-bold text-white relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
