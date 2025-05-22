
import { cn } from "@/lib/utils";
import { PartyPopper } from "lucide-react";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-gradient-to-r from-[#4b4453] to-[#845ec2] py-3 px-4 flex items-center justify-center shadow-md", className)}>
      <PartyPopper className="h-4 w-4 text-white mr-2" />
      <p className="text-white">&copy; {currentYear} QuizCube. All rights reserved.</p>
      <PartyPopper className="h-4 w-4 text-white ml-2" />
    </footer>
  );
};

export default Footer;
