import React, { useMemo, useRef, useState } from 'react';
import { EmailBatch, EmailInteraction } from '../types';
import { Mail, Clock, Check, MessageSquare, UploadCloud, Loader2, Layers, ChevronDown } from 'lucide-react';

interface EmailTimelineProps {
  emails: EmailInteraction[];
  batches?: EmailBatch[];
  onAddEmailFile?: (file: File) => Promise<void>;
}

const EmailTimeline: React.FC<EmailTimelineProps> = ({ emails, batches, onAddEmailFile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = !onAddEmailFile;

  const effectiveBatches = useMemo(() => {
    if (batches && batches.length) return batches;
    if (emails && emails.length) {
      return [{ id: 'legacy', fileName: 'Thread atual', uploadedAt: '', emails }];
    }
    return [];
  }, [batches, emails]);

  const formatUploadedAt = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('pt-BR');
  };

  const handlePickFile = () => {
    if (!onAddEmailFile || isUploading) return;
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onAddEmailFile) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await onAddEmailFile(file);
    } catch (err: any) {
      setUploadError(err?.message || 'Falha ao processar o arquivo de e-mail.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderTimeline = (items: EmailInteraction[], keyPrefix: string) => (
    <div className="relative sm:border-l-2 sm:border-gray-200 sm:ml-3 space-y-4 sm:space-y-8 pb-4">
      {items.map((email, index) => {
        let Icon = MessageSquare;
        let colorClass = "bg-blue-500";

        if (email.type === 'initial') {
          Icon = Mail;
          colorClass = "bg-gray-400";
        } else if (email.type === 'approval') {
          Icon = Check;
          colorClass = "bg-green-500";
        } else if (email.type === 'negotiation') {
          Icon = MessageSquare;
          colorClass = "bg-orange-400";
        }

        return (
          <div key={`${keyPrefix}_${email.id}_${index}`} className="relative sm:pl-8">
            <div className={`hidden sm:block absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${colorClass} shadow-sm z-10`}></div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <h4 className="font-bold text-gray-800 flex items-center min-w-0">
                  <Icon className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="break-all">{email.sender}</span>
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1 sm:mt-0 break-all">
                  <Clock className="w-3 h-3 mr-1" />
                  {email.date}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed break-words">{email.summary}</p>
              <div className="mt-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${colorClass}`}>
                  {email.type === 'initial' ? 'Envio Inicial' : email.type === 'negotiation' ? 'Negociação' : 'Aprovação Final'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (isReadOnly && effectiveBatches.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary" />
            Cronograma de Aprovação
          </h3>
        </div>

        <div className="space-y-6">
          {effectiveBatches.map((batch) => (
            <details key={batch.id} open className="rounded-xl border border-slate-200 overflow-hidden">
              <summary className="px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-700 break-words sm:truncate">{batch.fileName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {batch.emails.length} itens {batch.uploadedAt ? `• ${formatUploadedAt(batch.uploadedAt)}` : ''}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </summary>
              <div className="p-4 bg-white">
                {batch.emails.length ? renderTimeline(batch.emails, batch.id) : <div className="text-sm text-slate-400">Sem e-mails extraídos.</div>}
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="font-bold text-lg text-gray-800 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary" />
          Cronograma de Aprovação
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {onAddEmailFile && (
            <button
              onClick={handlePickFile}
              disabled={isUploading}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-lg border bg-white text-slate-700 hover:text-primary hover:border-primary/30 transition-all text-xs font-bold shadow-sm disabled:opacity-60"
            >
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Atualizar thread
            </button>
          )}
        </div>
      </div>

      {onAddEmailFile && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.html,.eml"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {uploadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {effectiveBatches.length > 0 ? (
        <div className="space-y-6">
          {effectiveBatches.map((batch) => (
            <div key={batch.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedBatchId((prev) => (prev === batch.id ? null : batch.id))}
                aria-expanded={expandedBatchId === batch.id}
                className="w-full text-left"
              >
                <div
                  className={`px-4 py-3 flex items-center justify-between transition-colors ${expandedBatchId === batch.id ? 'bg-white' : 'bg-slate-50 hover:bg-white'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-700 break-words sm:truncate">{batch.fileName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {batch.emails.length} itens {batch.uploadedAt ? `• ${formatUploadedAt(batch.uploadedAt)}` : ''}
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${expandedBatchId === batch.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {expandedBatchId === batch.id && (
                <div className="p-4 bg-white">
                  {batch.emails.length ? (
                    renderTimeline(batch.emails, batch.id)
                  ) : (
                    <div className="text-sm text-slate-400">Sem e-mails extraídos.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-400">Sem e-mails extraídos.</div>
      )}
    </div>
  );
};

export default EmailTimeline;
