import { useState, useEffect } from 'react';
import { Sparkles, Heart, Compass, Music, Image as ImageIcon, BookOpen } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
}

export function Navigation({ activeSection }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'intro', label: 'Intro', icon: Sparkles },
    { id: 'letter', label: 'Letter', icon: Heart },
    { id: 'gallery', label: 'Memories', icon: ImageIcon },
    { id: 'pets', label: 'Constellations', icon: Compass },
    { id: 'soundtrack', label: 'Soundtrack', icon: Music },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'future', label: 'Forever', icon: Sparkles },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto transition-all duration-500 rounded-full px-3 py-2 flex items-center gap-1 sm:gap-2 ${
          scrolled ? 'liquid-glass shadow-2xl' : 'liquid-glass-subtle'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 mr-1 sm:mr-2 border-r border-[#B7D2F0]/20">
          <span className="w-2 h-2 rounded-full bg-[#B7D2F0] animate-pulse" />
          <span className="font-display italic text-[#F4F5FA] text-sm sm:text-base tracking-wide">
            W&B
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-[#B7D2F0]/20 text-[#F4F5FA] border border-[#B7D2F0]/40 shadow-[0_0_12px_rgba(183,210,240,0.3)]'
                  : 'text-[#DCE7F5]/70 hover:text-[#F4F5FA] hover:bg-[#B7D2F0]/10 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                isActive ? 'text-[#B7D2F0]' : 'text-[#718FB8]'
              }`} />
              <span className="hidden md:inline font-mono-code text-[11px] tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
