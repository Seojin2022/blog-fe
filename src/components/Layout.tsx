import React from 'react';
import Navbar from './Navbar';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';

interface LayoutProps {
  children: React.ReactNode;
  showSidebars?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebars = true }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`flex flex-col md:flex-row gap-12 ${!showSidebars ? 'justify-center' : ''}`}>
          {showSidebars && <SidebarLeft />}
          
          <div className={`flex-1 min-w-0 ${!showSidebars ? 'max-w-3xl' : ''}`}>
            {children}
          </div>
          
          {showSidebars && <SidebarRight />}
        </div>
      </main>
      
      <footer className="border-t border-zinc-100 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} seo-jin.site. Built with React & Tailwind.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
