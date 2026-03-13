import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, LogIn, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, login, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-emerald-500" />
          <span className="font-sans text-xl font-bold tracking-tight text-white">YEAGER</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/purchases" 
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                My Purchases
              </Link>
              <span className="hidden text-sm text-gray-400 sm:inline-block">{user.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
