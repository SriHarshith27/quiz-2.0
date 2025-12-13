import Link from 'next/link';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/">
            <Logo size="md" showText textColor={transparent ? 'text-white' : 'text-gray-900'} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className={`font-medium hover:text-blue-500 transition-colors ${
              transparent ? 'text-white' : 'text-gray-700'
            }`}>
              Features
            </Link>
            <Link href="#how-it-works" className={`font-medium hover:text-blue-500 transition-colors ${
              transparent ? 'text-white' : 'text-gray-700'
            }`}>
              How It Works
            </Link>
            <Link href="#about" className={`font-medium hover:text-blue-500 transition-colors ${
              transparent ? 'text-white' : 'text-gray-700'
            }`}>
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant={transparent ? 'ghost' : 'outline'} size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
