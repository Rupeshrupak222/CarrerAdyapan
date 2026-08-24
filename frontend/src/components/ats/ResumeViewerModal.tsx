import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  FileText, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  Cloud,
  RotateCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string;
  candidateName: string;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  isOpen,
  onClose,
  resumeUrl,
  candidateName,
}) => {
  const [zoom, setZoom] = useState(100);
  const [downloading, setDownloading] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  if (!isOpen) return null;

  // Resolve proper full URL for Cloudinary or backend uploads
  const getCleanResumeUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
    return `${backendBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  };

  const resolvedUrl = getCleanResumeUrl(resumeUrl);
  const isCloudinary = resolvedUrl.includes('cloudinary.com') || resolvedUrl.includes('res.cloudinary.com');

  const handleDownload = async () => {
    if (!resolvedUrl) {
      toast.error('No valid resume URL found');
      return;
    }
    setDownloading(true);
    const toastId = toast.loading('Preparing resume download...');
    const filename = `${(candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    try {
      const response = await fetch(resolvedUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('CORS / Network fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Resume downloaded successfully!', { id: toastId });
    } catch {
      // Direct browser download / open fallback
      const link = document.createElement('a');
      link.href = resolvedUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Opened resume for direct download.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const iframeSrc = useGoogleViewer
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(resolvedUrl)}&embedded=true`
    : `${resolvedUrl}#toolbar=0&navpanes=0`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[90vh] overflow-hidden my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Resume — {candidateName}
                </h3>
                {isCloudinary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                    <Cloud className="w-3 h-3" /> Cloudinary CDN
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Verified Candidate Document Viewer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resolvedUrl && (
              <>
                {/* Viewer Mode Switcher */}
                <button
                  type="button"
                  onClick={() => setUseGoogleViewer(!useGoogleViewer)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                  title="Toggle between Native PDF Embed and Google Docs Viewer"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                  <span>{useGoogleViewer ? 'Native Embed' : 'Google Docs Mode'}</span>
                </button>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs text-slate-300">
                  <button 
                    onClick={() => setZoom(z => Math.max(z - 15, 60))}
                    className="p-1 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono w-10 text-center">{zoom}%</span>
                  <button 
                    onClick={() => setZoom(z => Math.min(z + 15, 150))}
                    className="p-1 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2 relative">
          {!resolvedUrl ? (
            <div className="text-center p-8 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Resume Document Available</p>
              <p className="text-xs text-slate-500 max-w-sm">
                This candidate profile does not have a linked resume document URL.
              </p>
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center transition-transform origin-top"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                title={`Resume - ${candidateName}`}
                className="w-full h-full rounded-2xl bg-white border-0 shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span>Adyapan Verified Document Vault</span>
            {isCloudinary && (
              <span className="text-[11px] text-emerald-400 font-semibold">• Cloudinary Hosted</span>
            )}
          </div>

          {resolvedUrl && (
            <a 
              href={resolvedUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-orange-400 text-slate-300 font-semibold flex items-center gap-1 text-[11px] transition-colors"
            >
              Open in New Window <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ResumeViewerModal;

