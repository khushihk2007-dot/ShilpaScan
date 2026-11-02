import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPassportItems, removeFromPassport, getPassportStats } from '../services/passport';

export default function PassportPage() {
  const [items, setItems] = useState([]);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalTab, setModalTab] = useState('who');

  useEffect(() => {
    refreshItems();
  }, []);

  function refreshItems() {
    const loaded = getPassportItems();
    setItems(loaded);
  }

  const stats = getPassportStats(items);

  function handleDelete(item) {
    if (window.confirm(`Remove "${item.name}" from your Heritage Passport?`)) {
      const updated = removeFromPassport(item.id);
      setItems(updated);
      setActiveModalItem(null);
    }
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
              id="btn-back"
              aria-label="Back"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta shadow-sm transition-all active:scale-95"
            >
              <svg className="w-5 h-5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/[0.08] text-terracotta text-xs font-semibold tracking-wide select-none">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 6H18V8H6V6H9L12 2ZM4 10H20V12H4V10ZM6 14H8V20H6V14ZM11 14H13V20H11V14ZM16 14H18V20H16V14ZM3 22H21V20H3V22Z" />
              </svg>
              Heritage Passport
            </div>

            <Link
              to="/scan"
              aria-label="Scan new sculpture"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta text-white shadow-md shadow-terracotta/25 hover:bg-terracotta-dark transition-all active:scale-95"
              title="Scan New Sculpture"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          </div>

          {/* HEADER SECTION */}
          <div className="mb-5 animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 leading-tight">
              My Heritage <span className="text-terracotta">Passport</span>
            </h1>
            <p className="font-display italic text-stone-600 text-sm mt-1">
              Your journey through Karnataka’s temple stories
            </p>
          </div>

          {/* STATS ROW (3 Small Cards) */}
          <div className="grid grid-cols-3 gap-2.5 mb-6 animate-fade-in-up">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm backdrop-blur">
              <div className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15 6H18V8H6V6H9L12 2ZM4 10H20V12H4V10ZM6 14H8V20H6V14ZM11 14H13V20H11V14ZM16 14H18V20H16V14ZM3 22H21V20H3V22Z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-stone-900 leading-none">{stats.temples}</span>
              <span className="text-[10px] text-stone-500 font-medium text-center mt-1 leading-tight">Temples Visited</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm backdrop-blur">
              <div className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-terracotta leading-none">{stats.sculptures}</span>
              <span className="text-[10px] text-stone-500 font-medium text-center mt-1 leading-tight">Sculptures</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm backdrop-blur">
              <div className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-stone-900 leading-none">{stats.cities}</span>
              <span className="text-[10px] text-stone-500 font-medium text-center mt-1 leading-tight">Heritage Cities</span>
            </div>
          </div>

          {/* LIST TITLE */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Saved Sculptures
            </h2>
            <span className="text-xs font-medium text-terracotta">
              {items.length} {items.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>

          {/* LIST OF SAVED SCULPTURES */}
          {items.length > 0 ? (
            <div className="space-y-3 flex-1">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => { setActiveModalItem(item); setModalTab('who'); }}
                  className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-terracotta/40 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sand/40 flex-shrink-0 border border-stone-200">
                    <img
                      src={item.image || '/sculpture.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/sculpture.jpg'; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-terracotta/10 text-terracotta text-[9.5px] font-semibold uppercase tracking-wider truncate">
                        {item.period || 'Historical Era'}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-stone-900 leading-snug truncate">
                      {item.name}
                    </h3>
                    <p className="font-display italic text-xs text-terracotta font-medium truncate mb-1">
                      {item.title || 'Sacred Heritage'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate">
                      <svg className="w-3 h-3 text-terracotta/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="truncate">{item.location || 'Belur / Halebidu'}</span>
                    </div>
                  </div>

                  <div className="text-stone-300 group-hover:text-terracotta transition-colors pr-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 animate-fade-in-up">
              <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-terracotta/[0.06] animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sand to-[#FFF8EE] border border-terracotta/15 flex items-center justify-center shadow-inner">
                  <svg className="w-10 h-10 text-terracotta/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-stone-900 mb-1.5">
                No stories saved yet
              </h3>
              <p className="text-stone-500 text-xs max-w-[240px] leading-relaxed mb-6">
                Go scan your first temple sculpture and unlock its legendary heritage story!
              </p>

              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-terracotta-light to-terracotta text-white font-semibold text-sm shadow-md shadow-terracotta/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                Scan Sculpture
              </Link>
            </div>
          )}

        </div>

        {/* DETAIL MODAL */}
        {activeModalItem && (
          <div className="absolute inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-300">
            <div className="w-full bg-[#FDF8F1] rounded-t-[32px] p-5 shadow-2xl border-t border-amber-200/50 flex flex-col max-h-[85vh] overflow-y-auto animate-card-rise">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-terracotta/10 text-terracotta text-[10px] font-semibold tracking-wider uppercase">
                    {activeModalItem.period || 'Historical Era'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <svg className="w-3 h-3 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {activeModalItem.location}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(activeModalItem)}
                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all active:scale-90"
                    title="Remove from Passport"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs active:scale-90"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Image Banner */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3.5 shadow-sm border border-stone-200">
                <img
                  src={activeModalItem.image || '/sculpture.jpg'}
                  alt={activeModalItem.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.target.src = '/sculpture.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <h3 className="font-display font-bold text-2xl leading-none">{activeModalItem.name}</h3>
                  <p className="font-display italic text-amber-200 text-xs">{activeModalItem.title}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                <button
                  onClick={() => setModalTab('who')}
                  className={`py-1.5 px-1 rounded-xl font-semibold text-[10.5px] transition-all ${modalTab === 'who' ? 'bg-terracotta text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-700 hover:border-terracotta'}`}
                >
                  Who
                </button>
                <button
                  onClick={() => setModalTab('meaning')}
                  className={`py-1.5 px-1 rounded-xl font-semibold text-[10.5px] transition-all ${modalTab === 'meaning' ? 'bg-terracotta text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-700 hover:border-terracotta'}`}
                >
                  Meaning
                </button>
                <button
                  onClick={() => setModalTab('story')}
                  className={`py-1.5 px-1 rounded-xl font-semibold text-[10.5px] transition-all ${modalTab === 'story' ? 'bg-terracotta text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-700 hover:border-terracotta'}`}
                >
                  The Story
                </button>
                <button
                  onClick={() => setModalTab('kannada')}
                  className={`py-1.5 px-1 rounded-xl font-semibold text-[10.5px] transition-all ${modalTab === 'kannada' ? 'bg-terracotta text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-700 hover:border-terracotta'}`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              {/* Tab Content Box */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-700 leading-relaxed shadow-sm min-h-[90px] overflow-y-auto">
                {modalTab === 'who' && (
                  <p><span className="font-semibold text-terracotta">{activeModalItem.name}:</span> {activeModalItem.who}</p>
                )}
                {modalTab === 'meaning' && (
                  <p><span className="font-semibold text-terracotta">Iconography:</span> {activeModalItem.meaning}</p>
                )}
                {modalTab === 'story' && (
                  <p><span className="font-semibold text-terracotta">Legend:</span> {activeModalItem.story}</p>
                )}
                {modalTab === 'kannada' && (
                  <p><span className="font-semibold text-terracotta">ಕನ್ನಡ ಸಾರಾಂಶ:</span> {activeModalItem.kannada_summary || activeModalItem.who}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
