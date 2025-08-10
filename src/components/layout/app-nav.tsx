'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookOpen, Home, Settings, User } from 'lucide-react';

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Home },
  { name: 'デッキ管理', href: '/decks', icon: BookOpen },
  { name: '学習統計', href: '/stats', icon: BarChart3 },
  { name: 'プロフィール', href: '/profile', icon: User },
  { name: '設定', href: '/settings', icon: Settings },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } transition-colors duration-200`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}