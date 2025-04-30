import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-gradient-to-r from-green-600 to-blue-700 text-white py-3 px-4 flex items-center justify-center shadow-md", className)}>
      <p>&copy; {currentYear} QuizCube. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
