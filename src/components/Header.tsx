
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("bg-transparent text-white py-2 px-4 flex items-center justify-between rounded-lg backdrop-blur-sm", className)}>
      <div className="w-20">
        {/* This empty div helps with centering the middle content */}
      </div>
      <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
        <Boxes className="h-6 w-6" />
        <h1 className="text-xl font-bold">QuizCube</h1>
      </Link>
      <div className="flex items-center w-20 justify-end">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-purple-700 px-3 py-1.5 rounded-md shadow-lg relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-[length:200%_100%] animate-[gradient_2s_ease_infinite]"></div>
          
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
