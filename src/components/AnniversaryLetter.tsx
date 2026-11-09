import { ALL_PHOTOS } from '../data/photos';

export function AnniversaryLetter() {
  const heroPhoto = ALL_PHOTOS.find(p => p.id === 'main-hoodie-mirror') || ALL_PHOTOS[0];

  return (
    <section
      id="letter"
      className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-6 max-w-5xl mx-auto z-10 select-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

        {/* Left: Traditional Watercolor Archival Portrait */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative group w-full max-w-sm">
            <div className="watercolor-portrait-frame">
              <div className="watercolor-canvas aspect-[4/5]">
                <img
                  src={heroPhoto.fullUrl}
                  alt="Wam and Bao"
                  className="w-full h-full object-cover block select-none"
                  loading="lazy"
                />
              </div>

              <div className="mt-3 text-center">
                <span className="font-handwritten text-lg text-[#B7D2F0]">Always my favorite person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sincere Personal Letter */}
        <div className="lg:col-span-7">
          <article className="liquid-glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Letter Header */}
            <div className="border-b border-[#B7D2F0]/15 pb-4 mb-6">
              <h3 className="font-display italic text-3xl sm:text-4xl text-[#F4F5FA] tracking-wide">
                Dear Bao,
              </h3>
            </div>

            {/* Letter Body — Simple, honest, sincere */}
            <div className="space-y-5 font-editorial text-lg sm:text-xl text-[#DCE7F5]/90 leading-relaxed font-light">
              <p>
                Two years together. Looking back at where we started and where we are today,
                I am simply grateful for you.
              </p>

              <p>
                Thank you for being my partner, my peace, and my favorite person to spend ordinary
                days with. You make everything warmer, easier, and full of joy.
              </p>

              <p className="text-[#F4F5FA] font-normal pt-1">
                Happy 2nd Anniversary. Here is to us, and to every day ahead.
              </p>
            </div>

            {/* Sign-off */}
            <div className="mt-8 pt-6 border-t border-[#B7D2F0]/15 flex items-end justify-between">
              <div>
                <p className="font-editorial italic text-sm text-[#718FB8]">
                  With all my love,
                </p>

                <p className="font-handwritten text-4xl sm:text-5xl text-[#B7D2F0] mt-1 drop-shadow-[0_0_12px_rgba(183,210,240,0.4)]">
                  Wam
                </p>
              </div>

              <span className="font-mono-code text-xs text-[#718FB8]">
                November 12, 2026
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
