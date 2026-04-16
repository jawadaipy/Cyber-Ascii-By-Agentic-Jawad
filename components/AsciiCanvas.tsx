import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { AsciiOptions } from '../types';
import { getAsciiChar } from '../utils/asciiConverter';
import { playStartupSound, playScanSound, startAmbientHum, stopAmbientHum, playButtonSound } from '../utils/soundEffects';
import { ScanEye, Camera, Video, VideoOff, Upload, X, Image as ImageIcon } from 'lucide-react';

interface AsciiCanvasProps {
  options: AsciiOptions;
  onCapture: (imageData: string) => void;
  isCameraOn: boolean;
  onCameraToggle: () => void;
  uploadedImage: string | null;
  onImageUpload: (imageData: string | null) => void;
}

export interface AsciiCanvasHandle {
  triggerCapture: () => void;
}

export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(({ 
  options, 
  onCapture, 
  isCameraOn, 
  onCameraToggle, 
  uploadedImage, 
  onImageUpload 
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevFrameRef = useRef<Float32Array | null>(null);
  const animationRef = useRef<number>();
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    triggerCapture: () => handleCaptureClick()
  }));

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isCameraOn) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        stopAmbientHum();
        return;
      }

      try {
        // Boost camera quality: Requesting HD resolution
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: 'user',
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(e => console.error("Play error:", e));
          playStartupSound();
          startAmbientHum();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopAmbientHum();
    };
  }, [isCameraOn]);

  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            const parent = canvasRef.current.parentElement;
            if (parent) {
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
            } else {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    prevFrameRef.current = null;
  }, [options.fontSize, uploadedImage, isCameraOn]);

  useEffect(() => {
    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      const img = imgRef.current;
      
      const source = uploadedImage ? img : (isCameraOn ? video : null);

      if (!canvas || !hiddenCanvas || !source) {
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#10b981';
          ctx.font = "20px 'Share Tech Mono'";
          ctx.textAlign = 'center';
          ctx.fillText("SYSTEM OFFLINE: NO INPUT DETECTED", canvas.width / 2, canvas.height / 2);
          ctx.font = "14px 'Share Tech Mono'";
          ctx.fillText("ENABLE CAMERA OR UPLOAD IMAGE TO BEGIN", canvas.width / 2, canvas.height / 2 + 30);
        }
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Check if source is ready
      if (source instanceof HTMLVideoElement && source.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }
      if (source instanceof HTMLImageElement && (!source.complete || source.naturalWidth === 0)) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: false });
      const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });

      if (!ctx || !hiddenCtx) {
          animationRef.current = requestAnimationFrame(renderLoop);
          return;
      }

      const charHeight = options.fontSize;
      const charWidth = charHeight * 0.6;
      
      const cols = Math.floor(canvas.width / charWidth);
      const rows = Math.floor(canvas.height / charHeight);

      if (cols <= 0 || rows <= 0) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      if (hiddenCanvas.width !== cols || hiddenCanvas.height !== rows) {
        hiddenCanvas.width = cols;
        hiddenCanvas.height = rows;
        prevFrameRef.current = null;
      }

      hiddenCtx.save();
      if (!uploadedImage) {
        hiddenCtx.translate(cols, 0);
        hiddenCtx.scale(-1, 1);
      }
      hiddenCtx.drawImage(source, 0, 0, cols, rows);
      hiddenCtx.restore();
      
      const frameData = hiddenCtx.getImageData(0, 0, cols, rows);
      const data = frameData.data;

      const pixelCount = data.length;
      if (!prevFrameRef.current || prevFrameRef.current.length !== pixelCount) {
        prevFrameRef.current = new Float32Array(pixelCount);
        for(let i=0; i<pixelCount; i++) prevFrameRef.current[i] = data[i];
      }

      const prev = prevFrameRef.current;
      const inertia = uploadedImage ? 0 : 0.65; // Slightly reduced inertia for more responsiveness

      for (let i = 0; i < pixelCount; i++) {
        const target = data[i];
        const current = prev[i];
        // Sharper transition
        const newValue = current + (target - current) * (1 - inertia);
        prev[i] = newValue;
        data[i] = newValue;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Sharpen text rendering
      ctx.font = `bold ${options.fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));

      if (options.colorMode === 'color') {
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const offset = (y * cols + x) * 4;
                let r = data[offset];
                let g = data[offset + 1];
                let b = data[offset + 2];
                
                // 1. Apply Contrast to individual channels for "pop"
                r = contrastFactor * (r - 128) + 128;
                g = contrastFactor * (g - 128) + 128;
                b = contrastFactor * (b - 128) + 128;

                // 2. Apply Brightness multiplier
                r *= options.brightness;
                g *= options.brightness;
                b *= options.brightness;

                // 3. CyberSaturate: Boost color vibrancy
                // Calculate luminance of the processed pixel
                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                const saturationBoost = 1.4; // 40% saturation increase
                r = luminance + (r - luminance) * saturationBoost;
                g = luminance + (g - luminance) * saturationBoost;
                b = luminance + (b - luminance) * saturationBoost;

                // Clamp values
                r = Math.max(0, Math.min(255, r));
                g = Math.max(0, Math.min(255, g));
                b = Math.max(0, Math.min(255, b));

                // 4. Calculate final brightness for character selection
                const finalBr = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                const char = getAsciiChar(finalBr, options.density);
                
                ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
                ctx.fillText(char, x * charWidth, y * charHeight);
            }
          }
      } else {
          if (options.colorMode === 'matrix') ctx.fillStyle = '#00ff41';
          else if (options.colorMode === 'retro') ctx.fillStyle = '#ffb000';
          else ctx.fillStyle = '#ffffff';

          for (let y = 0; y < rows; y++) {
            let rowText = "";
            for (let x = 0; x < cols; x++) {
                const offset = (y * cols + x) * 4;
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                let br = contrastFactor * (0.2126 * r + 0.7152 * g + 0.0722 * b - 128) + 128;
                br = Math.max(0, Math.min(255, br * options.brightness));
                rowText += getAsciiChar(br, options.density);
            }
            ctx.fillText(rowText, 0, y * charHeight);
          }
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [options, uploadedImage, isCameraOn]);

  const handleCaptureClick = () => {
    if (canvasRef.current) {
        playScanSound();
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onCapture(dataUrl);
    }
  };

  const handleScreenshotClick = () => {
    if (canvasRef.current) {
      playScanSound();
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cyber_ascii_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
          // Turn off camera when image is uploaded for better experience
          if (isCameraOn) onCameraToggle();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    playButtonSound();
    onImageUpload(null);
    if (!isCameraOn) onCameraToggle();
  };

  const handleCameraToggleClick = () => {
    playButtonSound();
    onCameraToggle();
  };

  const handleUploadClick = () => {
    playButtonSound();
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-500 z-50">
                <p>{error}</p>
            </div>
        )}
        
        <video 
            ref={videoRef} 
            className="absolute top-0 left-0 opacity-0 pointer-events-none -z-10 w-1 h-1" 
            playsInline 
            autoPlay 
            muted 
        />
        
        {uploadedImage && (
            <img 
                ref={imgRef}
                src={uploadedImage}
                alt="Upload Source"
                className="absolute top-0 left-0 opacity-0 pointer-events-none -z-10"
                onLoad={() => { prevFrameRef.current = null; }}
            />
        )}

        <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
        />

        <canvas ref={hiddenCanvasRef} className="hidden" />
        <canvas 
          ref={canvasRef} 
          className={`block w-full h-full transition-all duration-500 ${
            options.colorMode === 'matrix' ? '[filter:drop-shadow(0_0_10px_rgba(0,255,65,0.3))]' :
            options.colorMode === 'retro' ? '[filter:drop-shadow(0_0_10px_rgba(255,176,0,0.3))]' :
            options.colorMode === 'color' ? '[filter:saturate(1.2)_drop-shadow(0_0_5px_rgba(255,255,255,0.1))]' :
            ''
          }`} 
        />
        
        {/* Floating Controls Container */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-5 z-40 bg-black/40 p-4 rounded-3xl backdrop-blur-md border border-green-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Camera Toggle */}
            <div className="flex flex-col items-center gap-1">
                <button 
                    onClick={handleCameraToggleClick}
                    className={`p-4 rounded-full border transition-all active:scale-95 group relative ${
                      isCameraOn 
                        ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                >
                    {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <span className="text-[8px] text-white/40 font-mono uppercase">Camera</span>
            </div>

            {/* Upload/Clear Toggle */}
            <div className="flex flex-col items-center gap-1">
                {uploadedImage ? (
                  <button 
                    onClick={clearImage}
                    className="bg-red-500/20 border border-red-500/50 p-4 rounded-full text-red-400 hover:bg-red-500/30 transition-all active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                ) : (
                  <button 
                    onClick={handleUploadClick}
                    className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-full text-blue-400 hover:bg-blue-500/30 transition-all active:scale-95"
                  >
                    <Upload className="w-6 h-6" />
                  </button>
                )}
                <span className="text-[8px] text-white/40 font-mono uppercase">{uploadedImage ? 'Clear' : 'Upload'}</span>
            </div>

            {/* Scan & Analyze Button (Primary) */}
            <div className="flex flex-col items-center gap-2 px-2">
                <button 
                    onClick={handleCaptureClick}
                    className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 p-6 rounded-full backdrop-blur-md transition-all active:scale-95 group relative hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
                >
                    <div className="absolute inset-0 rounded-full border border-green-500 opacity-50 animate-ping"></div>
                    <ScanEye className="w-8 h-8" />
                </button>
                <span className="text-[10px] text-green-500 font-bold tracking-tighter uppercase whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-green-500/20">
                    Neural Scan
                </span>
            </div>

            {/* Screenshot Button */}
            <div className="flex flex-col items-center gap-1">
                <button 
                    onClick={handleScreenshotClick}
                    className="bg-black/60 hover:bg-green-900/80 text-green-400 border border-green-500/50 p-4 rounded-full backdrop-blur-md transition-all active:scale-95 hover:scale-105"
                >
                    <Camera className="w-6 h-6" />
                </button>
                <span className="text-[8px] text-white/40 font-mono uppercase">Save</span>
            </div>
        </div>
    </div>
  );
});