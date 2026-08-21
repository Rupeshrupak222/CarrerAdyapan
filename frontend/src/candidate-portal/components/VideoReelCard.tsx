import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';

interface VideoReelCardProps {
  videoSrc: string;
  posterSrc?: string;
  badgeText: string;
  title: string;
  subtitle: string;
  accentBadge?: string;
  dataReveal?: string;
  className?: string;
}

export const VideoReelCard: React.FC<VideoReelCardProps> = ({
  videoSrc,
  posterSrc,
  badgeText,
  title,
  subtitle,
  accentBadge,
  dataReveal = 'right',
  className = '',
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div
      data-reveal={dataReveal}
      className={`relative w-full max-w-[370px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 dark:border-stone-800 bg-stone-950 flex items-center justify-center group select-none transition-all duration-300 hover:shadow-amber-500/10 hover:shadow-2xl ${className}`}
      onClick={toggleAudio}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Subtle Ambient Glow Border */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-white/20 dark:ring-amber-500/20" />

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        {accentBadge ? (
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-400 font-bold text-[11px] flex items-center gap-1.5 shadow-lg">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span>{accentBadge}</span>
          </div>
        ) : <div />}

        <div className="flex items-center gap-2">
          {/* Restart Button */}
          <button
            type="button"
            onClick={handleRestart}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border border-white/20"
            aria-label="Restart Video"
            title="Restart Video"
          >
            <RefreshCw size={14} />
          </button>

          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border border-white/20"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5 text-amber-400" />}
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 border ${
              isMuted
                ? 'bg-amber-500 text-stone-950 font-extrabold border-amber-400 animate-bounce'
                : 'bg-black/70 text-white border-emerald-500/40'
            }`}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <>
                <VolumeX size={14} />
                <span>Tap to Unmute 🔊</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Sound ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Overlay / Bottom Caption */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-end p-6 pointer-events-none transition-all duration-300">
        <div className="space-y-1.5">
          <span className="inline-block text-amber-400 font-bold text-[11px] uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 backdrop-blur-sm">
            {badgeText}
          </span>
          <h3 className="text-white text-lg sm:text-xl font-extrabold leading-snug drop-shadow-md">
            {title}
          </h3>
          <p className="text-stone-300 text-xs leading-relaxed drop-shadow-sm">
            {subtitle}
          </p>
        </div>

        {/* Sound Status Indicator at Bottom */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isMuted ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            {isMuted ? 'Muted (Tap to hear story)' : 'Live Audio Active'}
          </span>
          <span className="text-stone-400">Adyapan Spotlight</span>
        </div>
      </div>
    </div>
  );
};

export default VideoReelCard;
