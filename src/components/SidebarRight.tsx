import React, { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_CONTACT_EMAIL = 'water4072@gmail.com';
const DEFAULT_PORTFOLIO_KO = 'https://www.notion.so/2f65871083cf80568852e64a276473c4';

const SidebarRight = () => {
  const { settings } = useLanguage();
  const [showEmailBubble, setShowEmailBubble] = useState(false);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) setShowEmailBubble(false);
    };
    if (showEmailBubble) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showEmailBubble]);

  const contactEmail = settings.contact_email || DEFAULT_CONTACT_EMAIL;
  const portfolioKo = settings.portfolio_ko || DEFAULT_PORTFOLIO_KO;
  const portfolioEn = settings.portfolio_en;

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-12">
        <div className="space-y-6 px-2">
          <div>
            <a
              href="https://github.com/Seojin2022"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors"
            >
              GITHUB
            </a>
          </div>
          <div ref={emailRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowEmailBubble(!showEmailBubble)}
              className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors"
            >
              EMAIL
            </button>
            {showEmailBubble && (
              <div className="absolute left-0 top-full mt-2 z-50 min-w-[200px]">
                <div className="relative bg-zinc-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
                  <span className="block">{contactEmail}</span>
                  <div
                    className="absolute -top-1.5 left-5 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '6px solid rgb(24 24 27)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            {portfolioKo ? (
              <a href={apiUrl(portfolioKo)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors block">PORTFOLIO (KO)</a>
            ) : (
              <span className="text-sm font-bold text-zinc-300 cursor-default">PORTFOLIO (KO)</span>
            )}
          </div>
          <div>
            {portfolioEn ? (
              <a href={apiUrl(portfolioEn)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors block">PORTFOLIO (EN)</a>
            ) : (
              <span className="text-sm font-bold text-zinc-300 cursor-default">PORTFOLIO (EN)</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;
