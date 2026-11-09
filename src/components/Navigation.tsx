import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Music, Heart } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
}

export function Navigation({ activeSection }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'intro', label: 'Intro', icon: Sparkles },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'soundtrack', label: 'Music', icon: Music },
    { id: 'letter', label: 'Letter', icon: Heart },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto transition-all duration-500 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-1.5 liquid-glass-nav ${
          scrolled ? 'shadow-2xl scale-[0.98]' : ''
        }`}
      >
        {/* Monogram Brand Pill */}
        <div className="flex items-center gap-2 pl-2 pr-3 py-1 mr-0.5 sm:mr-1 border-r border-[#B7D2F0]/15">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#B7D2F0] animate-beacon"
            style={{ boxShadow: '0 0 6px #B7D2F0' }}
          />
          <span className="font-display italic text-[#F4F5FA] text-sm sm:text-base tracking-wide select-none">
            W&B
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'liquid-pill-active text-[#F4F5FA] font-medium'
                    : 'text-[#DCE7F5]/70 hover:text-[#F4F5FA] hover:bg-white/[0.06]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-[#B7D2F0]' : 'text-[#718FB8]'
                  }`}
                />
                <span className="font-mono-code text-[11px] tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
