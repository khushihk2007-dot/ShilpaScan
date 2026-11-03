import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_SCULPTURES } from '../data/demoSculptures';
import { saveToPassport, isSavedInPassport } from '../services/passport';

export default function DemoPage() {
  const [selectedSculpture, setSelectedSculpture] = useState(null);
  const [activeTab, setActiveTab] = useState('who');
  const [savedStatusMap, setSavedStatusMap] = useState(() => {
    const initialMap = {};
    DEMO_SCULPTURES.forEach(s => {
      initialMap[s.name] = isSavedInPassport(s.name);
    });
    return initialMap;
  });

  function handleSelectSculpture(sculpture) {
    setSelectedSculpture(sculpture);
    setActiveTab('who');
  }

  function handleSave(sculpture) {
    if (!sculpture) return;
    saveToPassport({
      name: sculpture.name,
      title: sculpture.title,
      period: sculpture.period,
      location: sculpture.location,
      who: sculpture.who,
      meaning: sculpture.meaning,
      story: sculpture.story,
      kannada_summary: sculpture.kannada_summary,
      confidence: sculpture.confidence,
      image: sculpture.image
    }, sculpture.image);
    setSavedStatusMap(prev => ({ ...prev, [sculpture.name]: true }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 noise select-none">
      {/* Mobile phone frame */}
      <div className="relative w-full max-w-[420px] min-h-[100dvh] sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[36px] bg-cream shadow-[0_12px_60px_rgba(194,65,12,0.08)] overflow-hidden flex flex-col justify-between border sm:border-stone-200/60">
        
        {/* Background mandala rings */}
        <div className="mandala-ring w-[280px] h-[280px] -top-20 -right-20 animate-spin-slow" aria-hidden="true" />
        <div className="mandala-ring w-[220px] h-[220px] top-1/2 -left-20 animate-spin-slow" style={{ animationDirection: 'reverse' }} aria-hidden="true" />

        <div className="relative z-10 flex-1 flex flex-col px-5 pt-5 pb-6 overflow-y-auto">
          
          {/* TOP NAV BAR */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              id="btn-demo-back"
              aria-label="Back to Home"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta shadow-sm transition-all active:scale-95"
            >
              <svg className="w-5 h-5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-600/20 text-xs font-semibold tracking-wide select-none">
              <span>⚡</span>
              <span>Demo Mode · Pitch Ready</span>
            </div>

            <Link
              to="/passport"
              aria-label="Heritage Passport"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta shadow-sm transition-all active:scale-95"
              title="Heritage Passport"
            >
              <svg className="w-4 h-4 text-terracotta" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 6H18V8H6V6H9L12 2ZM4 10H20V12H4V10ZM6 14H8V20H6V14ZM11 14H13V20H11V14ZM16 14H18V20H16V14ZM3 22H21V20H3V22Z" />
              </svg>
            </Link>
          </div>

          {/* SCREEN TITLE */}
          {!selectedSculpture ? (
            <div className="mb-4 animate-fade-in-up">
              <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 leading-tight">
                Try Demo <span className="text-terracotta">Sculptures</span>
              </h1>
              <p className="font-display italic text-stone-600 text-xs sm:text-sm mt-1">
                Tap any iconic sculpture for an instant live AI analysis demonstration
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3 animate-fade-in-up">
              <button
                onClick={() => setSelectedSculpture(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-terracotta/5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Choose Another Sculpture</span>
              </button>

              <span className="text-[10.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Instant Result
              </span>
            </div>
          )}

          {/* LIST OF 4 DEMO SCULPTURES WITH IMAGES */}
          {!selectedSculpture && (
            <div className="space-y-3 flex-1 animate-fade-in-up">
              {DEMO_SCULPTURES.map((sculpture, index) => (
                <div
                  key={sculpture.id}
                  onClick={() => handleSelectSculpture(sculpture)}
                  className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-terracotta/40 transition-all cursor-pointer active:scale-[0.98]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Sculpture Thumbnail Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sand/30 border border-stone-200/80 shadow-sm flex-shrink-0">
                    <img
                      src={sculpture.image}
                      alt={sculpture.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/sculpture.jpg'; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-terracotta/10 text-terracotta text-[9.5px] font-semibold uppercase tracking-wider truncate">
                        {sculpture.period}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-stone-900 leading-snug truncate group-hover:text-terracotta transition-colors">
                      {sculpture.name}
                    </h3>
                    <p className="font-display italic text-xs text-terracotta font-medium truncate mb-1">
                      {sculpture.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                      <svg className="w-3.5 h-3.5 text-terracotta/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="truncate">{sculpture.location}</span>
                    </div>
                  </div>

                  <div className="text-stone-300 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all pr-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}

              {/* Bottom camera tip */}
              <div className="pt-2 text-center">
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium shadow-sm transition-all"
                >
                  <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                  </svg>
                  <span>Or scan live with Camera</span>
                </Link>
              </div>
            </div>
          )}

          {/* INSTANT FULL RESULT CARD WITH IMAGE BANNER */}
          {selectedSculpture && (
            <div className="flex-1 flex flex-col justify-between animate-card-rise">
              <section className="w-full bg-[#FDF8F1] rounded-[24px] p-4 shadow-xl border border-amber-200/60 text-stone-900">
                {/* Sculpture Photo Banner */}
                <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 border border-stone-200/80 shadow-md">
                  <img
                    src={selectedSculpture.image}
                    alt={selectedSculpture.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { e.target.src = '/sculpture.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-amber-200 text-[9.5px] font-semibold uppercase tracking-wider mb-1">
                        {selectedSculpture.badge || selectedSculpture.period}
                      </span>
                      <h3 className="font-display font-bold text-xl sm:text-2xl leading-none truncate">
                        {selectedSculpture.name}
                      </h3>
                      <p className="font-display italic text-amber-100/90 text-xs mt-0.5 truncate">
                        {selectedSculpture.title}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-semibold text-emerald-300 font-mono border border-emerald-400/30 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {selectedSculpture.confidence}%
                    </span>
                  </div>
                </div>

                {/* Sub-header: Location & Save Button */}
                <div className="flex items-center justify-between gap-2.5 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 truncate">
                    <svg className="w-3.5 h-3.5 text-terracotta flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="truncate">{selectedSculpture.location}</span>
                  </div>

                  {/* Save to Passport Button */}
                  <button
                    id="btn-demo-save"
                    onClick={() => handleSave(selectedSculpture)}
                    disabled={savedStatusMap[selectedSculpture.name]}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex-shrink-0 ${
                      savedStatusMap[selectedSculpture.name]
                        ? 'bg-emerald-600 text-white cursor-default shadow-emerald-700/20'
                        : 'bg-terracotta hover:bg-terracotta-dark active:scale-95 text-white shadow-terracotta/25'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={savedStatusMap[selectedSculpture.name] ? "2.5" : "2"}>
                      {savedStatusMap[selectedSculpture.name] ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      )}
                    </svg>
                    <span>{savedStatusMap[selectedSculpture.name] ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </div>

                {/* Tabs: Who | Meaning | The Story | ಕನ್ನಡ */}
                <div className="flex p-1 rounded-xl bg-stone-200/60 mb-3 gap-1 border border-stone-200/50">
                  {[
                    { id: 'who', label: 'Who' },
                    { id: 'meaning', label: 'Meaning' },
                    { id: 'story', label: 'The Story' },
                    { id: 'kannada', label: 'ಕನ್ನಡ' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Box */}
                <div className="bg-white rounded-xl p-3.5 border border-stone-200/60 min-h-[120px] max-h-[220px] overflow-y-auto text-xs leading-relaxed text-stone-700 shadow-inner">
                  {activeTab === 'who' && (
                    <p className="animate-fade-in-up text-stone-800 leading-relaxed">{selectedSculpture.who}</p>
                  )}
                  {activeTab === 'meaning' && (
                    <p className="animate-fade-in-up text-stone-800 leading-relaxed">{selectedSculpture.meaning}</p>
                  )}
                  {activeTab === 'story' && (
                    <p className="animate-fade-in-up text-stone-800 leading-relaxed">{selectedSculpture.story}</p>
                  )}
                  {activeTab === 'kannada' && (
                    <p className="animate-fade-in-up font-medium text-stone-800 leading-relaxed font-sans text-[12.5px]">
                      {selectedSculpture.kannada_summary}
                    </p>
                  )}
                </div>

                {/* Action Row */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSculpture(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Test Another Demo</span>
                  </button>

                  <Link
                    to="/passport"
                    className="text-[11px] font-medium text-stone-600 hover:text-terracotta flex items-center gap-1"
                  >
                    View Passport →
                  </Link>
                </div>
              </section>

              {/* Bottom camera button option */}
              <div className="pt-4 flex justify-center">
                <Link
                  to="/scan"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                  </svg>
                  <span>Switch to Real Camera Scanner</span>
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
