import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, ExternalLink, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

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

  if (!isOpen) return null;

  const isPdf = resumeUrl?.toLowerCase().includes('.pdf') || !resumeUrl?.includes('.');

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[85vh] overflow-hidden my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Resume — {candidateName}
              </h3>
              <p className="text-[10px] text-slate-400">In-App Document Viewer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resumeUrl && (
              <>
                <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
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

                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2 relative">
          {!resumeUrl ? (
            <div className="text-center p-8 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Resume Document Available</p>
              <p className="text-xs text-slate-500 max-w-sm">
                This candidate did not upload a PDF resume file or the file is stored in candidate profile notes.
              </p>
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center transition-transform origin-top"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <iframe
                src={`${resumeUrl}#toolbar=0&navpanes=0`}
                title={`Resume - ${candidateName}`}
                className="w-full h-full rounded-lg bg-white border-0"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <span>Adyapan Secure Recruiter Document Vault</span>
          {resumeUrl && (
            <a 
              href={resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-orange-400 flex items-center gap-1 text-[11px]"
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
