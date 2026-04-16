import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Link as LinkIcon, Type, X } from "lucide-react";

interface UploadCardProps {
  onUpload: (data: { type: "pdf" | "url" | "text"; content: string; file?: File }) => void;
  disabled?: boolean;
}

type Tab = "pdf" | "url" | "text";

export default function UploadCard({ onUpload, disabled }: UploadCardProps) {
  const [tab, setTab] = useState<Tab>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  }, []);

  const handleSubmit = () => {
    if (tab === "pdf" && file) onUpload({ type: "pdf", content: file.name, file });
    else if (tab === "url" && url.trim()) onUpload({ type: "url", content: url.trim() });
    else if (tab === "text" && text.trim()) onUpload({ type: "text", content: text.trim() });
  };

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "url", label: "arXiv URL", icon: LinkIcon },
    { id: "text", label: "Paste Text", icon: Type },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 w-full max-w-2xl mx-auto"
    >
      <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pdf" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="ml-2 p-1 hover:bg-secondary rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a PDF here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                Browse Files
              </label>
            </>
          )}
        </div>
      )}

      {tab === "url" && (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://arxiv.org/abs/2017.xxxxx"
          className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm"
        />
      )}

      {tab === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your research paper text here..."
          rows={8}
          className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder-muted-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm resize-none"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled || (tab === "pdf" && !file) || (tab === "url" && !url.trim()) || (tab === "text" && !text.trim())}
        className="mt-6 w-full py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-primary"
      >
        Generate Episode
      </button>
    </motion.div>
  );
}
