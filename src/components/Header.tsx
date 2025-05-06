
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("bg-black text-white py-3 px-4 flex items-center justify-between rounded-lg shadow-md", className)}>
      <div className="w-20">
        {/* This empty div helps with centering the middle content */}
      </div>
      <Link to="/" className="flex items-center gap-2">
        <Boxes className="h-6 w-6" />
        <h1 className="text-xl font-bold">QuizCube</h1>
      </Link>
      <div className="flex items-center w-20 justify-end">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 px-3 py-1.5 rounded-md shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-sm font-bold text-white">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
