import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 noise select-none">
      {/* Mobile phone frame container */}
      <div className="relative w-full max-w-[420px] min-h-[100dvh] sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[36px] bg-cream shadow-[0_12px_60px_rgba(194,65,12,0.08)] overflow-hidden flex flex-col justify-between border sm:border-stone-200/60">
        
        {/* Background mandala rings */}
        <div className="mandala-ring w-[320px] h-[320px] -top-16 -right-16 animate-spin-slow" aria-hidden="true" />
        <div className="mandala-ring w-[220px] h-[220px] -bottom-10 -left-10 animate-spin-slow" style={{ animationDirection: 'reverse' }} aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center flex-1 px-6 pt-10 pb-8 justify-between">
          
          <div className="flex flex-col items-center w-full">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-terracotta/[0.08] text-terracotta text-xs font-medium tracking-wide mb-6 select-none shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              AI-Powered Heritage
            </div>

            {/* Hero Illustration */}
            <div className="mb-6 flex items-center justify-center animate-fade-in-up">
              <div className="animate-float relative w-44 h-44 flex items-center justify-center">
                {/* Ambient radial glow */}
                <div className="absolute inset-[-15%] rounded-full bg-[radial-gradient(circle,rgba(194,65,12,0.12)_0%,transparent_70%)] pointer-events-none" />
                {/* Circle background container */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFF8EE] to-[#F5EDE0] border-[1.5px] border-terracotta/15 shadow-[0_4px_24px_rgba(194,65,12,0.08),inset_0_2px_8px_rgba(255,255,255,0.7)]" />
                <img
                  src="/hero.jpg"
                  alt="Nataraja line art illustration"
                  className="w-[82%] h-[82%] object-contain rounded-full relative z-10 drop-shadow-sm"
                  onError={(e) => { e.target.src = 'hero.jpg'; }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-center leading-tight mb-2.5 text-stone-900 animate-fade-in-up">
              Shilpa<span className="text-terracotta">Scan</span>
            </h1>

            {/* Tagline */}
            <p className="font-display italic text-terracotta/90 text-base md:text-lg text-center mb-4">
              Point. Discover. Know&nbsp;the&nbsp;Story.
            </p>

            {/* Divider with ornament dot */}
            <div className="flex items-center gap-3 w-3/5 mb-4 opacity-40">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-terracotta to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-terracotta to-transparent" />
            </div>

            {/* Subtitle */}
            <p className="text-stone-600 text-sm text-center leading-relaxed max-w-xs mb-8">
              Scan any temple sculpture and instantly know who it is, what it means, and the story behind&nbsp;it.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-3.5 w-full max-w-xs mb-4">
            {/* Scan Sculpture Primary Button */}
            <Link
              to="/scan"
              id="btn-scan-sculpture"
              className="animate-pulse-glow group flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-gradient-to-br from-terracotta-light to-terracotta-dark text-white font-semibold text-base shadow-lg shadow-terracotta/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Scan Sculpture
            </Link>

            {/* My Heritage Passport Secondary Button */}
            <Link
              to="/passport"
              id="btn-heritage-passport"
              className="group flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl border-2 border-terracotta/25 bg-white/70 backdrop-blur text-terracotta-dark font-semibold text-sm shadow-sm transition-all duration-300 hover:border-terracotta/50 hover:bg-white hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              My Heritage Passport
            </Link>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-1.5 pt-4">
            <svg className="w-4 h-4 text-terracotta/30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 7 7 7 12C7 14.21 8.47 16.1 10.5 16.78V22H13.5V16.78C15.53 16.1 17 14.21 17 12C17 7 12 2 12 2Z" />
            </svg>
            <p className="text-stone-400 text-[10.5px] tracking-widest uppercase text-center select-none">
              Digital Heritage &amp; Culture &#183; Kannada Innovates
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
