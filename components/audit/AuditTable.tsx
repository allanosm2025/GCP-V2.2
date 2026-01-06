import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Pencil, Check, X, ShieldCheck } from 'lucide-react';
import { AUDIT_FIELD_LABELS, AuditItem } from '../../types';
import AuditTableDesktop from './AuditTableDesktop';
import AuditTableMobile from './AuditTableMobile';

interface AuditTableProps {
  items: AuditItem[];
  onUpdate?: (items: AuditItem[]) => void;
}

const AuditTable: React.FC<AuditTableProps> = ({ items, onUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<AuditItem>>({});
  const [justifyingId, setJustifyingId] = useState<number | null>(null);
  const [justificationText, setJustificationText] = useState('');

  const startEdit = (item: AuditItem) => {
    setEditingId(item.id);
    setEditValues({ ...item });
    setJustifyingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = () => {
    if (!onUpdate || editingId === null) return;

    const updatedItems = items.map((item) => {
      if (item.id === editingId) {
        return { ...item, ...editValues };
      }
      return item;
    });

    onUpdate(updatedItems);
    cancelEdit();
  };

  const openJustify = (id: number) => {
    setJustifyingId(id);
    setJustificationText('');
    setEditingId(null);
  };

  const saveApproval = (id: number) => {
    if (!onUpdate) return;

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          manuallyApproved: true,
          justification: justificationText
        };
      }
      return item;
    });

    onUpdate(updatedItems);
    setJustifyingId(null);
  };

  const handleInputChange = (field: keyof AuditItem, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const renderStatus = (item: AuditItem) => {
    if (item.manuallyApproved) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-help"
          title={item.justification}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          Aprovado*
        </span>
      );
    }

    if (item.isConsistent) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          OK
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Erro
      </span>
    );
  };

  const renderEditInput = (
    field: 'piValue' | 'proposalValue' | 'emailValue' | 'pmValue',
    borderClassName: string
  ) => (
    <input
      className={`w-full border-b ${borderClassName} bg-transparent focus:outline-none text-sm`}
      value={(editValues[field] as string) || ''}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  const renderActions = (item: AuditItem, isEditingRow: boolean) => {
    if (isEditingRow) {
      return (
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={saveEdit} className="text-green-600 hover:text-green-800">
            <Check size={18} />
          </button>
          <button type="button" onClick={cancelEdit} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => startEdit(item)}
          className="text-gray-400 hover:text-primary transition-colors"
          title="Editar Valores"
        >
          <Pencil size={16} />
        </button>
        {!item.isConsistent && !item.manuallyApproved && (
          <button
            type="button"
            onClick={() => openJustify(item.id)}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200"
          >
            Aprovar
          </button>
        )}
      </div>
    );
  };

  const renderJustification = (itemId: number) => (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold text-blue-800 uppercase">Motivo da Aprovação / Ressalva:</label>
      <textarea
        className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
        rows={2}
        placeholder="Descreva por que essa inconsistência é aceitável..."
        value={justificationText}
        onChange={(e) => setJustificationText(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => setJustifyingId(null)}
          className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => saveApproval(itemId)}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!justificationText.trim()}
        >
          Confirmar Aprovação
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 relative">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="font-bold text-lg text-gray-800">Relatório de Divergências</h3>
        <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-center">
          Cross-Check 4 Vias (PI / Proposta / Email / OPEC)
        </span>
      </div>

      <div className="min-h-[400px]">
        <AuditTableMobile
          items={items}
          editingId={editingId}
          justifyingId={justifyingId}
          fieldLabels={AUDIT_FIELD_LABELS}
          renderStatus={renderStatus}
          renderActions={renderActions}
          renderEditInput={renderEditInput}
          renderJustification={renderJustification}
        />

        <AuditTableDesktop
          items={items}
          editingId={editingId}
          justifyingId={justifyingId}
          fieldLabels={AUDIT_FIELD_LABELS}
          renderStatus={renderStatus}
          renderActions={renderActions}
          renderEditInput={renderEditInput}
          renderJustification={renderJustification}
        />
      </div>

      {items.some((i) => !i.isConsistent && !i.manuallyApproved) && (
        <div className="bg-red-50 p-4 border-t border-red-100">
          <p className="text-sm text-red-800 font-medium">Atenção:</p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-1">
            {items
              .filter((i) => !i.isConsistent && !i.manuallyApproved)
              .map((i) => (
                <li key={i.id}>{i.notes || `Inconsistência encontrada em ${AUDIT_FIELD_LABELS[i.field] || i.field}`}</li>
              ))}
          </ul>
        </div>
      )}

      {items.some((i) => i.manuallyApproved) && (
        <div className="bg-green-50 p-4 border-t border-green-100">
          <p className="text-sm text-green-800 font-medium">Itens Aprovados Manualmente:</p>
          <ul className="list-disc list-inside text-sm text-green-700 mt-1">
            {items
              .filter((i) => i.manuallyApproved)
              .map((i) => (
                <li key={i.id}>
                  <span className="font-bold">{AUDIT_FIELD_LABELS[i.field] || i.field}:</span> {i.justification}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuditTable;
