import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { AssetLinks } from '../../types';
import AssetLinkInputField from './AssetLinkInputField';
import DestinationUrlsEditor from './DestinationUrlsEditor';

const AssetsPanel = (args: {
  links: AssetLinks;
  onLinkChange: (key: keyof AssetLinks, value: string) => void;
  onDestinationUrlChange: (index: number, value: string) => void;
  onAddDestinationUrl: () => void;
  onRemoveDestinationUrl: (index: number) => void;
}) => {
  const { links, onLinkChange, onDestinationUrlChange, onAddDestinationUrl, onRemoveDestinationUrl } = args;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-8 mb-12 shadow-lg relative overflow-hidden border border-white/60">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50"></div>
      <div className="flex items-center mb-8 pb-4 border-b border-slate-100/50">
        <div className="h-10 w-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg text-white">
          <LinkIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Ativos Digitais</h3>
          <p className="text-sm text-slate-500">URLs para o relatório final (Drive, Criativos, etc).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AssetLinkInputField label="Proposta Link" value={links.proposal} placeholder="https://..." onChange={(v) => onLinkChange('proposal', v)} />
        <AssetLinkInputField label="PI Link" value={links.pi} placeholder="https://..." onChange={(v) => onLinkChange('pi', v)} />
        <AssetLinkInputField label="Tabela Preço" value={links.priceTable} placeholder="https://..." onChange={(v) => onLinkChange('priceTable', v)} />
        <AssetLinkInputField label="Thread Link" value={links.emailThread} placeholder="https://..." onChange={(v) => onLinkChange('emailThread', v)} />
        <AssetLinkInputField label="Criativos" value={links.creative} placeholder="https://..." onChange={(v) => onLinkChange('creative', v)} />
        <AssetLinkInputField label="Endereços" value={links.addresses} placeholder="https://..." onChange={(v) => onLinkChange('addresses', v)} />
      </div>

      <DestinationUrlsEditor urls={links.destinationUrls} onAdd={onAddDestinationUrl} onRemove={onRemoveDestinationUrl} onChange={onDestinationUrlChange} />
    </div>
  );
};

export default AssetsPanel;

