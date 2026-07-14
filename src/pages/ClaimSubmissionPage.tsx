import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PlusCircle, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Paperclip,
  Trash2,
  Eye
} from "lucide-react";

interface ClaimSubmissionPageProps {
  onSubmitClaim: (reason: string, amount: number, description: string, file: File | null) => void;
  triggerConfetti: () => void;
}

export const ClaimSubmissionPage: React.FC<ClaimSubmissionPageProps> = ({
  onSubmitClaim,
  triggerConfetti
}) => {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPreviewableImage = file ? file.type.startsWith("image/") : false;

  const setSelectedFile = (selected: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null);
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFakeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!reason.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim()) return;

    setIsSubmitting(true);

    // Simulate standard security checking and transaction review
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      triggerConfetti();

      // Submit upward to state coordinator — the actual file, so it can be
      // uploaded to storage and made viewable later from the Claims Feed.
      onSubmitClaim(reason, parsedAmount, description, file);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Submit Emergency Mutual Claim</h2>
        <p className="text-xs text-slate-500 mt-1">
          Request emergency backing from your circle's shared pool. Friends will vote on release criteria.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="submission-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 md:p-8 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Reason field */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                    Emergency Reason / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urgent Root Canal surgery support"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-matte-black border border-gold-500/15 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm text-slate-100 placeholder:text-slate-600"
                  />
                  <p className="text-[11px] text-slate-500">Keep it short, direct, and completely clear.</p>
                </div>

                {/* Amount field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                    Requested Aid (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="8500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-matte-black border border-gold-500/15 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm pl-8 font-mono font-bold text-slate-100 placeholder:text-slate-600"
                    />
                    <span className="absolute left-4 top-3 text-sm text-gold-500 font-bold font-mono">₹</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Specify precise emergency billing.</p>
                </div>

              </div>

              {/* Description box */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Full Emergency Explanation & Context
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your situation, what happened, why you need support, and how this fund will help you resolve the crisis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-matte-black border border-gold-500/15 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm resize-none text-slate-100 placeholder:text-slate-600"
                />
              </div>

              {/* Upload Receipt Placeholder */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Upload Invoice / Medical Receipt Placeholder
                </label>
                
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gold-500/15 rounded-2xl p-8 text-center hover:bg-gold-500/5 hover:border-gold-500/30 transition-all cursor-pointer relative"
                  >
                    <input
                      type="file"
                      id="receipt-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFakeFileUpload}
                    />
                    <UploadCloud className="w-10 h-10 text-gold-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">Drag and drop receipts, invoices, or prescriptions</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG up to 10MB (Click to browse files)</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {isPreviewableImage && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gold-500/20 flex-shrink-0"
                        />
                      ) : (
                        <div className="p-2 bg-gold-500/10 text-gold-500 rounded-lg flex-shrink-0">
                          <Paperclip className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Ready for group upload verification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPreviewableImage && previewUrl && (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-gold-500 transition-colors cursor-pointer"
                          title="Preview full size"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="p-1.5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mutual Contract Declaration Callout */}
              <div className="p-4 rounded-2xl bg-gold-500/5 border border-gold-500/15 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gold-500 uppercase font-mono">Mutual Trust Clause</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By submitting this request, you declare that this claim is for an active emergency and not a lifestyle expense. The circle reserves the right to vote No or flag this under high risk.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gold-500/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-gold-500/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-matte-black border-t-transparent rounded-full animate-spin" />
                      AI Verifying Claim...
                    </>
                  ) : (
                    <>
                      Submit Mutual Claim <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto shadow-lg shadow-gold-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-200">Claim Submitted & Screened!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your emergency request has been successfully posted. The Gullak AI Risk Model has completed preliminary vetting.
              </p>
            </div>

            {/* AI Screening Indicator */}
            <div className="p-4 rounded-2xl bg-gold-500/5 border border-gold-500/15 inline-flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <div className="text-left text-xs">
                <p className="font-bold text-slate-200">Gullak Guard Score: Looks Legitimate</p>
                <p className="text-slate-400 mt-0.5">Vetted at 94% confidence. Ready for friends to cast ballots.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-matte-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                Go to Claims Feed <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
