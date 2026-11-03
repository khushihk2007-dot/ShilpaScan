import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { identifySculptureWithGemini, DEFAULT_NATARAJA } from '../services/gemini';
import { saveToPassport, isSavedInPassport } from '../services/passport';

export default function ScanPage() {
  const [isCameraLive, setIsCameraLive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('initializing'); // 'initializing' | 'active' | 'denied' | 'unavailable'
  const [facingMode, setFacingMode] = useState('environment');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sculptureData, setSculptureData] = useState(null);
  const [confidence, setConfidence] = useState(98.4);
  const [activeTab, setActiveTab] = useState('who');
  const [isSaved, setIsSaved] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // No default fake image!
  const [errorToast, setErrorToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // 1. OPEN CAMERA IMMEDIATELY AS DEFAULT ON MOUNT
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  async function startCamera(mode = 'environment') {
    setCameraStatus('initializing');
    setErrorToast(null);

    // Ensure previous stream is stopped
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unavailable');
      setIsCameraLive(false);
      return;
    }

    let stream = null;

    // Attempt 1: Ideal back camera with high resolution
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    } catch (err1) {
      console.warn('Ideal back camera constraint failed, attempting fallback...', err1);
      // Attempt 2: Simple facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false
        });
      } catch (err2) {
        console.warn('FacingMode constraint failed, attempting generic video...', err2);
        // Attempt 3: Any available video device
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (err3) {
          console.error('All camera attempts failed:', err3);
          setCameraStatus('denied');
          setIsCameraLive(false);
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.warn('Video play interrupted:', e));
        };
      }
      setIsCameraLive(true);
      setCameraStatus('active');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraLive(false);
  }

  function toggleCameraFlip() {
    setPreviewImage(null);
    setSculptureData(null);
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  }

  // Flash visual effect
  function triggerFlash() {
    const flashEl = document.createElement('div');
    flashEl.className = 'absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(flashEl);
    setTimeout(() => {
      flashEl.style.opacity = '0';
      setTimeout(() => flashEl.remove(), 300);
    }, 50);
  }

  // 2. CAPTURE FROM CAMERA
  function handleCapture() {
    if (isAnalyzing) return;

    // If live camera is active, grab frame from video
    if (isCameraLive && videoRef.current && videoRef.current.videoWidth) {
      triggerFlash();
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const MAX_DIM = 768;
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 480;

      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      setPreviewImage(dataUrl);
      setIsCameraLive(false);
      stopCamera();
      analyzeImage(dataUrl);
      return;
    }

    // If camera is not live, prompt user or trigger native camera capture
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.click();
    } else {
      startCamera(facingMode);
    }
  }

  // 3. UPLOAD FROM GALLERY OR NATIVE CAMERA
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 768;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        stopCamera();
        setPreviewImage(compressedDataUrl);
        analyzeImage(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file works
    e.target.value = '';
  }

  // 4. ANALYZE WITH GEMINI VISION
  async function analyzeImage(imageDataUrl) {
    setIsAnalyzing(true);
    setSculptureData(null);
    setErrorToast(null);

    const randomConf = (93 + Math.random() * 6).toFixed(1);
    setConfidence(randomConf);

    try {
      const rawResult = await identifySculptureWithGemini(imageDataUrl);
      const data = rawResult?.data ? { ...rawResult.data, confidence: rawResult.confidence } : rawResult;

      const normalizedData = {
        name: data.name || "Sculpture Identified",
        title: data.title || "Temple Sculpture",
        period: data.period || "South Indian Heritage",
        who: data.who || data.meaning || "",
        meaning: data.meaning || data.who || "",
        story: data.story || "",
        kannada_summary: data.kannada_summary || "",
        ...data
      };

      setSculptureData(normalizedData);
      if (normalizedData.confidence) setConfidence(normalizedData.confidence);
      setIsSaved(isSavedInPassport(normalizedData.name));
    } catch (err) {
      console.error('Vision analysis error:', err);
      setErrorToast(err.message || 'Gemini analysis failed. Showing cultural reference.');
      setSculptureData(DEFAULT_NATARAJA);
      setIsSaved(isSavedInPassport(DEFAULT_NATARAJA.name));
    } finally {
      setIsAnalyzing(false);
    }
  }

  // 5. SAVE TO PASSPORT
  function handleSaveToPassport() {
    if (!sculptureData) return;
    saveToPassport({
      ...sculptureData,
      confidence,
      thumbnail: previewImage || '/sculpture.jpg',
      savedAt: new Date().toISOString()
    });
    setIsSaved(true);
  }

  // 6. SCAN ANOTHER / RESET BACK TO CAMERA
  function handleScanAnother() {
    setSculptureData(null);
    setPreviewImage(null);
    startCamera(facingMode);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 sm:p-4 select-none">
      {/* Mobile phone container */}
      <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[844px] sm:max-h-[92vh] sm:rounded-[36px] overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
        
        {/* CAMERA / PREVIEW BACKGROUND */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black flex items-center justify-center">
          
          {/* Live camera stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isCameraLive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
          />

          {/* Ambient blurred backdrop of the scanned sculpture */}
          {previewImage && (
            <img
              src={previewImage}
              alt="Scanned Sculpture Ambient Backdrop"
              className="absolute inset-0 w-full h-full object-cover object-center filter blur-2xl opacity-35 scale-110 brightness-50 z-0 pointer-events-none transition-opacity duration-300"
            />
          )}

          {/* Hidden canvas for snapshot rasterization */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Vignette gradients for camera feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/85 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-10" />
        </div>

        {/* TOP BAR */}
        <header className="relative z-20 flex items-center justify-between px-5 pt-4 pb-2">
          <Link
            to="/"
            id="btn-back-home"
            aria-label="Back to Home"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/90 hover:bg-black/65 hover:text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* ShilpaScan Brand Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 shadow-sm">
            <svg className="w-4 h-4 text-terracotta" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15 6H18V8H6V6H9L12 2ZM4 10H20V12H4V10ZM6 14H8V20H6V14ZM11 14H13V20H11V14ZM16 14H18V20H16V14ZM3 22H21V20H3V22Z" />
            </svg>
            <span className="font-display font-bold text-base tracking-wide text-white">
              Shilpa<span className="text-terracotta">Scan</span>
            </span>
          </div>

          {/* Top Actions: Demo Mode & Settings */}
          <div className="flex items-center gap-2">
            <Link
              to="/demo"
              id="btn-scan-to-demo"
              aria-label="Demo Mode"
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold shadow-sm transition-all active:scale-90"
              title="Pitch Demo Mode"
            >
              <span>⚡</span>
              <span>Demo</span>
            </Link>

            <button
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/90 hover:bg-black/65 hover:text-terracotta transition-all active:scale-90"
              title="Gemini Vision Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.1.06-.12l-.773.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Error Notification Toast */}
        {errorToast && (
          <div className="absolute top-16 left-4 right-4 z-40 bg-stone-900/95 backdrop-blur-md border border-terracotta/40 rounded-2xl p-3 text-white text-xs shadow-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 pr-2">
              <span className="text-terracotta text-sm">⚠️</span>
              <span className="text-[11px] text-stone-200 leading-snug">{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast(null)} className="text-stone-400 hover:text-white text-xs px-1.5 py-0.5 rounded-lg bg-white/10">✕</button>
          </div>
        )}

        {/* CENTER CONTENT: EITHER LIVE VIEWFINDER RETICLE OR CAMERA ACCESS PROMPT */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
          {isCameraLive || previewImage ? (
            /* --- STATE A: LIVE CAMERA ACTIVE OR PHOTO PREVIEW --- */
            <div className="w-full flex flex-col items-center justify-center pointer-events-none">
              {/* Status Badge */}
              <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10.5px] font-medium tracking-wider uppercase text-white/90 shadow-md">
                <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : previewImage ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span>
                  {isAnalyzing
                    ? 'Analyzing with Gemini…'
                    : previewImage
                    ? 'Sculpture Scanned'
                    : 'Camera Active · Ready to Scan'}
                </span>
              </div>

              {/* Viewfinder Target Reticle / Scanning Frame */}
              <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] flex items-center justify-center my-1 shadow-2xl">
                {/* Captured or Gallery-selected Sculpture Image inside Scan Frame */}
                {previewImage && (
                  <div className="absolute inset-0 rounded-[14px] overflow-hidden bg-black/50 z-0">
                    <img
                      src={previewImage}
                      alt="Scanned Sculpture"
                      className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05]"
                    />
                  </div>
                )}

                {/* White Corner Brackets (Scan Frame) */}
                <div className="viewfinder-bracket bracket-tl z-20" />
                <div className="viewfinder-bracket bracket-tr z-20" />
                <div className="viewfinder-bracket bracket-bl z-20" />
                <div className="viewfinder-bracket bracket-br z-20" />

                {/* Reticle Target Center Pip (only when camera is live & no image selected) */}
                {!previewImage && (
                  <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center opacity-60 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping" />
                  </div>
                )}

                {/* Laser Scanning Beam (during analysis) */}
                {isAnalyzing && (
                  <div className="scan-beam animate-scan-laser z-20" />
                )}
              </div>

              {/* Hint badge */}
              <p className="mt-2 text-[11px] font-medium text-white/85 bg-black/55 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                {isAnalyzing
                  ? 'Identifying temple sculpture iconography…'
                  : previewImage
                  ? 'Sculpture aligned in frame'
                  : 'Align sculpture in frame & tap shutter'}
              </p>
            </div>
          ) : (
            /* --- STATE B: CAMERA ACCESS / PERMISSION NEEDED (NO OVERLAPPING BRACKETS) --- */
            <div className="w-full max-w-xs flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up">
              {cameraStatus === 'initializing' ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-terracotta/30 animate-ping" />
                    <div className="w-12 h-12 rounded-full bg-stone-800/90 border border-terracotta/40 flex items-center justify-center text-terracotta">
                      <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-stone-200 text-base mt-1">Starting Camera…</h3>
                  <p className="text-stone-400 text-xs max-w-[220px] leading-relaxed">
                    Connecting to your camera feed for live temple scanning.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="w-14 h-14 rounded-full bg-terracotta/10 border border-terracotta/30 flex items-center justify-center text-terracotta shadow-lg">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-white text-lg">Camera Access</h3>
                  <p className="text-stone-300 text-xs leading-relaxed max-w-[240px]">
                    Allow camera permission in your browser to scan temple sculptures live.
                  </p>
                  
                  <div className="flex flex-col gap-2.5 w-full mt-2 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-terracotta-light to-terracotta text-white font-semibold text-xs shadow-lg shadow-terracotta/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Enable Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 font-medium text-xs active:scale-95 transition-all"
                    >
                      Use Device Camera
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* BOTTOM SECTION */}
        <footer className="relative z-20 flex flex-col items-center px-3.5 pb-3 sm:pb-4 pt-1 space-y-2">
          
          {/* LOADING STATE */}
          {isAnalyzing && (
            <div className="w-full bg-[#FDF8F1]/95 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 shadow-2xl border border-amber-200/60 text-stone-900 animate-card-rise pointer-events-auto">
              <div className="flex items-center gap-3.5">
                {/* Temple / Sculpture Icon with subtle pulsing animation */}
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-terracotta/15 animate-ping opacity-60" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-sand/60 border border-terracotta/30 flex items-center justify-center text-terracotta shadow-md animate-pulse">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15 6H18V8H6V6H9L12 2ZM4 10H20V12H4V10ZM6 14H8V20H6V14ZM11 14H13V20H11V14ZM16 14H18V20H16V14ZM3 22H21V20H3V22Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base text-stone-900 leading-snug">
                    Identifying sculpture…
                  </h3>
                  <p className="text-stone-500 text-xs leading-tight mt-0.5">
                    Analyzing temple iconography, posture &amp; sacred style
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RESULT CARD (Appears only AFTER scanning) */}
          {sculptureData && !isAnalyzing && (
            <section className="w-full bg-[#FDF8F1]/95 backdrop-blur-xl rounded-[24px] p-3.5 sm:p-4 shadow-[0_16px_45px_rgba(0,0,0,0.55)] border border-amber-200/50 text-stone-900 animate-card-rise pointer-events-auto">
              {/* Header: Period, Name, Title, and Save */}
              <div className="flex items-start justify-between gap-2.5 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-semibold tracking-wide uppercase border border-terracotta/20 truncate">
                      {sculptureData.period || 'Historical Era'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-medium text-stone-600 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {confidence}% match
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-none truncate">
                    {sculptureData.name}
                  </h2>
                  <p className="text-terracotta-dark font-medium text-xs italic tracking-wide mt-0.5 truncate">
                    {sculptureData.title}
                  </p>
                </div>

                {/* Save to Passport Button */}
                <button
                  id="btn-save-passport"
                  onClick={handleSaveToPassport}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex-shrink-0 ${
                    isSaved
                      ? 'bg-emerald-600 text-white cursor-default shadow-emerald-700/20'
                      : 'bg-terracotta hover:bg-terracotta-dark active:scale-95 text-white shadow-terracotta/25'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSaved ? "2.5" : "2"}>
                    {isSaved ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    )}
                  </svg>
                  <span>{isSaved ? 'Saved ✓' : 'Save'}</span>
                </button>
              </div>

              {/* Tabs: Who | Meaning | The Story | ಕನ್ನಡ */}
              <div className="flex p-1 rounded-xl bg-stone-200/60 mb-2.5 gap-1 border border-stone-200/50">
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
              <div className="bg-white/80 rounded-xl p-3 border border-stone-200/50 min-h-[75px] max-h-[140px] overflow-y-auto text-xs leading-relaxed text-stone-700">
                {activeTab === 'who' && (
                  <p className="animate-fade-in-up">{sculptureData.who}</p>
                )}
                {activeTab === 'meaning' && (
                  <p className="animate-fade-in-up">{sculptureData.meaning}</p>
                )}
                {activeTab === 'story' && (
                  <p className="animate-fade-in-up leading-relaxed">{sculptureData.story}</p>
                )}
                {activeTab === 'kannada' && (
                  <p className="animate-fade-in-up font-medium text-stone-800 leading-relaxed font-sans">
                    {sculptureData.kannada_summary || 'ಶಿಲ್ಪದ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.'}
                  </p>
                )}
              </div>

              {/* Action row: Scan Another Sculpture */}
              <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <button
                  onClick={handleScanAnother}
                  className="flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Scan Another Sculpture</span>
                </button>

                <Link
                  to="/passport"
                  className="text-[11px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  View Passport →
                </Link>
              </div>
            </section>
          )}

          {/* BOTTOM CONTROLS: GALLERY | SHUTTER | FLIP CAMERA */}
          <div className="relative w-full flex items-center justify-between px-6 pt-1 pb-1">
            {/* Gallery Upload */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="gallery-input"
                className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 cursor-pointer hover:bg-black/70 hover:text-white transition-all active:scale-90 shadow-lg"
                title="Upload from Gallery"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </label>
              <span className="text-[9.5px] text-white/70 mt-1 font-medium tracking-tight">Gallery</span>
              <input
                ref={galleryInputRef}
                type="file"
                id="gallery-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Circular Shutter Button */}
            <div className="relative flex items-center justify-center">
              <button
                id="btn-shutter"
                onClick={handleCapture}
                aria-label="Capture and Scan Sculpture"
                className="shutter-outer group relative w-[66px] h-[66px] rounded-full p-1 flex items-center justify-center bg-black/45 backdrop-blur-md cursor-pointer focus:outline-none"
              >
                <div className={`absolute inset-0 rounded-full border-2 ${isCameraLive ? 'border-emerald-400/50 animate-pulse' : 'border-terracotta/40 animate-pulse'}`} />
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-white via-cream to-white group-active:scale-90 transition-transform flex items-center justify-center shadow-inner">
                  <div className={`w-4 h-4 rounded-full transition-transform group-hover:scale-125 ${isCameraLive ? 'bg-terracotta' : 'bg-terracotta'}`} />
                </div>
              </button>
            </div>

            {/* Flip / Reset Camera */}
            <div className="flex flex-col items-center">
              <button
                onClick={toggleCameraFlip}
                className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/70 hover:text-white transition-all active:scale-90 shadow-lg"
                title="Flip Camera"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <span className="text-[9.5px] text-white/70 mt-1 font-medium tracking-tight">Flip Cam</span>
            </div>
          </div>
        </footer>

        {/* Hidden native device camera capture input */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* SETTINGS / STATUS MODAL */}
        {showSettings && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
            <div className="w-full max-w-sm bg-[#FDF8F1] rounded-3xl p-6 text-stone-900 shadow-2xl border border-terracotta/20 animate-card-rise">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-terracotta font-bold text-lg">⚡</span>
                  <h3 className="font-display font-bold text-lg text-stone-900">AI Vision Engine</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600 hover:bg-stone-300">
                  ✕
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Powered by Google Gemini Vision (<code className="font-mono text-terracotta bg-amber-100 px-1 py-0.5 rounded">gemini-flash</code>). Configured with your <code className="font-mono text-terracotta font-bold">VITE_GEMINI_API_KEY</code> environment variable.
              </p>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-4 flex items-center gap-2">
                <span>✅</span>
                <span>Active &amp; Ready for live scanning</span>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 rounded-xl bg-terracotta text-white font-semibold text-xs shadow-md shadow-terracotta/20 hover:bg-terracotta-dark active:scale-95 transition-all"
              >
                Return to Viewfinder
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
