import { useRef, useState } from 'react';
import { extractAiReportFromFile } from './aiReportExtractor';
import { getAvailableGeminiKeysOrAlert } from './geminiKeys';
import { AiReport, CampaignData } from './types';

export const useReportImport = (args: {
  campaign: CampaignData;
  incrementUsage: () => void;
  onDone: (report: AiReport) => void;
}) => {
  const { campaign, incrementUsage, onDone } = args;

  const [reportImportOpen, setReportImportOpen] = useState(false);
  const [reportImportStatus, setReportImportStatus] = useState('');
  const reportImportRunRef = useRef(0);

  const cancelReportImport = () => {
    reportImportRunRef.current += 1;
    setReportImportOpen(false);
    setReportImportStatus('');
  };

  const importReportFile = async (file: File) => {
    const availableKeys = getAvailableGeminiKeysOrAlert();
    if (!availableKeys) return;

    const runId = reportImportRunRef.current + 1;
    reportImportRunRef.current = runId;
    setReportImportOpen(true);
    setReportImportStatus('Iniciando importação do relatório...');

    try {
      incrementUsage();
      const report = await extractAiReportFromFile(file, campaign, availableKeys, (status) => {
        if (reportImportRunRef.current !== runId) return;
        setReportImportStatus(status);
      });

      if (reportImportRunRef.current !== runId) return;

      setReportImportStatus('Atualizando dashboard...');
      onDone(report);
    } catch (e: any) {
      if (reportImportRunRef.current !== runId) return;
      console.error('Erro ao importar relatório:', e);
      alert(`Falha ao importar relatório: ${e?.message || 'Erro desconhecido'}`);
    } finally {
      if (reportImportRunRef.current === runId) {
        setReportImportOpen(false);
        setReportImportStatus('');
      }
    }
  };

  return {
    reportImportOpen,
    reportImportStatus,
    importReportFile,
    cancelReportImport,
  };
};
