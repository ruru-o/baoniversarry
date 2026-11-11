import { useState, useEffect } from 'react';
import { Image as ImageIcon, Music, Heart } from 'lucide-react';

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
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'soundtrack', label: 'Music', icon: Music },
    { id: 'letter', label: 'Letter', icon: Heart },
  ];

  const scrollTo = (id: string) => {
    if (id === 'soundtrack') {
      window.dispatchEvent(new CustomEvent('anniv:play-soundtrack'));
    }

    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto transition-all duration-500 rounded-full px-1.5 sm:px-2 py-1.5 flex items-center gap-0.5 sm:gap-1 liquid-glass-nav ${
          scrolled ? 'shadow-2xl scale-[0.98]' : ''
        }`}
      >
        {/* Navigation Items */}
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
                  ? 'liquid-pill-active text-[#EDF4FF] font-medium'
                  : 'text-[#D7E6F8]/70 hover:text-[#EDF4FF] hover:bg-white/[0.06]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-[#BBD2EF]' : 'text-[#7186A9]'
                }`}
              />
              <span className="font-mono-code text-[11px] tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
