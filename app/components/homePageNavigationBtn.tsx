import { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function homePageNavigationBtn({ href, children, className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition ${className}`}
    >
      {children}
    </Link>
  );
}
