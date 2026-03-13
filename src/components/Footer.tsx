import React from 'react';
import { Shield, Twitter, Disc as Discord, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black/50 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-emerald-500" />
              <span className="font-sans text-xl font-bold tracking-tight text-white">YEAGER</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Premium undetected mod menus and hacks for elite players. 
              Elevate your gameplay with our constantly updated, secure tools.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-emerald-500 transition-colors">Home</a></li>
              <li><a href="/purchases" className="hover:text-emerald-500 transition-colors">My Purchases</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Community</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <Discord className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Yeager Mods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
