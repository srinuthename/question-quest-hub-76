
import { cn } from "@/lib/utils";
import { PartyPopper } from "lucide-react";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-slate-900 py-3 px-4 flex items-center justify-center shadow-md", className)}>
      <PartyPopper className="h-4 w-4 text-slate-300 mr-2 animate-pulse" />
      <p className="text-slate-200">&copy; {currentYear} QuizCube. All rights reserved.</p>
      <PartyPopper className="h-4 w-4 text-slate-300 ml-2 animate-pulse" />
    </footer>
  );
};

export default Footer;
