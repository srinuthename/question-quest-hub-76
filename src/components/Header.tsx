
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("bg-gradient-to-r from-green-600 to-blue-700 text-white py-3 px-4 flex items-center justify-between shadow-md", className)}>
      <div className="flex items-center gap-2">
        <Boxes className="h-6 w-6" />
        <h1 className="text-xl font-bold">QuizCube</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-sm font-medium">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
