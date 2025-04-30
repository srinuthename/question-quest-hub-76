
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn("bg-gray-800 text-white py-2 px-4 text-center text-sm", className)}>
      <p>&copy; {currentYear} QuizCube. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
