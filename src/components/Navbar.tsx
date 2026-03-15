import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout as LayoutIcon, Home, User, BookOpen, Mail, Settings, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = location.pathname === '/admin';

  const navItems = [
    { name: t('home'), path: '/' },
    { name: t('blog'), path: '/blog' },
    ...(isAdmin ? [] : [{ name: t('contact'), path: '/contact' }]),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center group">
            <span className="font-black text-2xl tracking-tighter text-zinc-900">seo-jin.site</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-bold transition-colors hover:text-zinc-900 ${
                  location.pathname === item.path ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
                className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 hover:bg-zinc-100 transition-all border border-zinc-100"
              >
                {language === 'en' ? 'KO' : 'EN'}
              </button>

              <Link
                to="/admin"
                className={`p-2 rounded-full hover:bg-zinc-50 transition-all ${
                  location.pathname === '/admin' ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <button className="md:hidden p-2 text-zinc-500">
            <LayoutIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
