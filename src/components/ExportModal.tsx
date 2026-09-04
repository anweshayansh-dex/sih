import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  FolderArchive,
  Globe,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Share2,
  ShieldCheck,
  Server,
  ArrowRight
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'judges_url' | 'custom_domain' | 'offline_zip'>('judges_url');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedDlLink, setCopiedDlLink] = useState(false);
  const [copiedDomainGuide, setCopiedDomainGuide] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isDevUrl = currentOrigin.includes('ais-dev-');
  const isPreUrl = currentOrigin.includes('ais-pre-');
  const downloadDirectUrl = `${currentOrigin}/api/download-zip`;

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyDlLink = () => {
    navigator.clipboard.writeText(downloadDirectUrl);
    setCopiedDlLink(true);
    setTimeout(() => setCopiedDlLink(false), 2500);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('Expand-Archive -Path .\\bis-sahayak-standalone.zip -DestinationPath .\\bis-sahayak');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleCopyDomainConfig = () => {
    navigator.clipboard.writeText(`Prototype Name: BIS Sahayak\nFramework: Vite + Express (Node.js)\nBuild Command: npm run build\nOutput Directory: dist\nStart Command: npm start\nDeploy Target: Vercel / Render / Cloud Run`);
    setCopiedDomainGuide(true);
    setTimeout(() => setCopiedDomainGuide(false), 2500);
  };

  const handleDirectDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const response = await fetch('/api/download-zip');
      if (!response.ok) throw new Error('Failed to fetch zip');
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'bis-sahayak-standalone.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.warn('Direct blob download failed, opening direct URL in new window:', err);
      window.open(downloadDirectUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3D6B] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Judges Submission &amp; Prototype URLs</h3>
              <p className="text-xs text-blue-200">
                Fix 404 errors, generate public evaluator links, or deploy to a custom domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('judges_url')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'judges_url'
                ? 'border-[#0B3D6B] text-[#0B3D6B]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>1. Working Judges Link (Fix 404)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_domain')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom_domain'
                ? 'border-[#0B3D6B] text-[#0B3D6B]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Custom Domain (bis-sahayak)</span>
          </button>

          <button
            onClick={() => setActiveTab('offline_zip')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'offline_zip'
                ? 'border-[#0B3D6B] text-[#0B3D6B]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>3. Offline Standalone ZIP</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-gray-800 text-xs">
          {/* TAB 1: JUDGES URL & 404 FIX */}
          {activeTab === 'judges_url' && (
            <div className="space-y-4">
              {/* Alert: Why 404 happens */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-950 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900 text-sm">Why the previous link gave a "404 Not Found"</h4>
                  <p className="text-red-800 leading-relaxed">
                    The development link (<code>ais-dev-...</code>) is locked by Google Cloud to your authenticated Google account. If judges or anyone else opens it, Google denies access and shows <strong>404 Not Found</strong>.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Solution */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>How to generate the 100% Working Public Link for Judges:</span>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-emerald-950 pl-1 leading-relaxed">
                  <li>
                    Look at the top-right corner of the <strong>Google AI Studio interface</strong> (outside this window).
                  </li>
                  <li>
                    Click the blue <strong>"Share"</strong> button in the AI Studio header.
                  </li>
                  <li>
                    In the Share dialog, change General Access from <em>Restricted</em> to <strong>"Anyone with the link"</strong> (Public).
                  </li>
                  <li>
                    Click <strong>"Copy Link"</strong>. This generates the official public Google Cloud Run link that anyone can open without logging in.
                  </li>
                  <li>
                    <strong>Test Verification:</strong> Open an <strong>Incognito / Private browser tab</strong> and paste that link. If it opens without asking for a Google sign-in, it will work for the judges!
                  </li>
                </ol>
              </div>

              {/* Current Session URL check */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/80 space-y-2">
                <h4 className="font-bold text-gray-800 text-sm">Active Development Origin (For Author Only):</h4>
                <p className="text-gray-600">
                  This is the origin currently running in your container:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentOrigin}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-mono select-all focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(currentOrigin)}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-semibold text-gray-700 transition cursor-pointer shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <a
                    href={currentOrigin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-[#0B3D6B] hover:bg-[#082e52] text-white rounded-lg font-semibold transition shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Tab</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM DOMAIN WITH PROTOTYPE NAME */}
          {activeTab === 'custom_domain' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-blue-950">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                  <Globe className="w-4 h-4 text-[#0B3D6B]" />
                  <span>Get a dedicated domain name: <code>bis-sahayak.vercel.app</code></span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  We have pre-configured <code>vercel.json</code>, <code>render.yaml</code>, and <code>package.json</code> so you can launch a custom-named public URL in under 2 minutes with 100% free hosting.
                </p>
              </div>

              {/* Option A: Vercel 1-Click */}
              <div className="p-4 border border-gray-200 rounded-xl space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">Option A: Deploy to Vercel (Free <code>bis-sahayak.vercel.app</code>)</h4>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-1 leading-relaxed">
                  <li>In Google AI Studio settings (top right), click <strong>"Export to GitHub"</strong>.</li>
                  <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com</a> and sign in with GitHub.</li>
                  <li>Click <strong>"Add New Project"</strong> &rarr; select the <code>bis-sahayak</code> repository.</li>
                  <li>In Project Name, enter <code>bis-sahayak</code> &rarr; click <strong>Deploy</strong>.</li>
                  <li>Your application will be live immediately at: <code>https://bis-sahayak.vercel.app</code> (or you can connect any custom domain like <code>bis-sahayak.in</code> in Vercel settings).</li>
                </ol>
              </div>

              {/* Option B: Render.com */}
              <div className="p-4 border border-gray-200 rounded-xl space-y-2 bg-white">
                <h4 className="font-bold text-gray-900 text-sm">Option B: Deploy on Render (Free <code>bis-sahayak.onrender.com</code>)</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-1 leading-relaxed">
                  <li>In <a href="https://render.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">render.com</a>, click <strong>"New Web Service"</strong>.</li>
                  <li>Connect your GitHub repository.</li>
                  <li>Render will automatically detect <code>render.yaml</code> and configure the build command (<code>npm run build</code>) and start command (<code>npm start</code>).</li>
                  <li>You receive an instant live URL: <code>https://bis-sahayak.onrender.com</code>.</li>
                </ol>
              </div>

              {/* Copy Config button */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="font-semibold text-gray-700">Need deployment configuration details?</span>
                <button
                  type="button"
                  onClick={handleCopyDomainConfig}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition cursor-pointer"
                >
                  {copiedDomainGuide ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDomainGuide ? 'Copied Config!' : 'Copy Deployment Config'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE OFFLINE ZIP */}
          {activeTab === 'offline_zip' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-[#0B3D6B]/30 bg-blue-50/40">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#0B3D6B]" />
                    <h4 className="font-bold text-[#0B3D6B] text-sm sm:text-base">
                      Download Standalone Executable ZIP
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-[#138808] text-white px-2.5 py-0.5 rounded-full">
                    All-in-One (~290 KB)
                  </span>
                </div>
                <p className="text-gray-600 mb-3 leading-relaxed">
                  Includes the complete compiled production bundle, 117+ Indian Standards, RAG search engine, and double-clickable launch scripts for Windows (<code>start-windows.bat</code>) and Mac/Linux.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDirectDownload}
                    disabled={isDownloading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B3D6B] hover:bg-[#082e52] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Preparing ZIP...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>ZIP Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#FF9933]" />
                        <span>Download ZIP Now</span>
                      </>
                    )}
                  </button>

                  <a
                    href={downloadDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-100 text-[#0B3D6B] border border-[#0B3D6B]/30 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyDlLink}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    {copiedDlLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDlLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Extraction guide */}
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>How to Run Locally:</span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Right-click <code>bis-sahayak-standalone.zip</code> &rarr; select <strong>Extract All...</strong> &rarr; open the folder &rarr; double-click <code>start-windows.bat</code>.
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[11px] text-amber-900">
                      PowerShell Command:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCmd}
                      className="flex items-center gap-1 text-[11px] text-[#0B3D6B] hover:underline font-bold cursor-pointer"
                    >
                      {copiedCmd ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd ? 'Command Copied!' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <code className="block bg-amber-100/80 p-2 rounded-lg text-[11px] font-mono text-amber-950 select-all border border-amber-200">
                    Expand-Archive -Path .\bis-sahayak-standalone.zip -DestinationPath .\bis-sahayak
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500">
            Smart India Hackathon (SIH PS26107) &bull; Prototype: <strong>BIS Sahayak</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
