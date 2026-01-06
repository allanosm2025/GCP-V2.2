import React from 'react';
import { AuditFieldKey, AuditItem } from '../../types';

type EditableField = 'piValue' | 'proposalValue' | 'emailValue' | 'pmValue';

interface AuditTableMobileProps {
  items: AuditItem[];
  editingId: number | null;
  justifyingId: number | null;
  fieldLabels: Record<AuditFieldKey, string>;
  renderStatus: (item: AuditItem) => React.ReactNode;
  renderActions: (item: AuditItem, isEditingRow: boolean) => React.ReactNode;
  renderEditInput: (field: EditableField, borderClassName: string) => React.ReactNode;
  renderJustification: (itemId: number) => React.ReactNode;
}

const AuditTableMobile: React.FC<AuditTableMobileProps> = ({
  items,
  editingId,
  justifyingId,
  fieldLabels,
  renderStatus,
  renderActions,
  renderEditInput,
  renderJustification
}) => {
  return (
    <div className="md:hidden p-4 space-y-4">
      {items.map((item) => {
        const friendlyName = fieldLabels[item.field] || item.field;
        const isEditingRow = editingId === item.id;
        const isJustifyingRow = justifyingId === item.id;

        const proposalMismatch =
          !item.isConsistent && item.proposalValue !== item.piValue && !item.manuallyApproved;
        const emailMismatch = !item.isConsistent && item.emailValue !== item.piValue && !item.manuallyApproved;
        const pmMismatch = !item.isConsistent && item.pmValue !== item.piValue && !item.manuallyApproved;

        return (
          <div
            key={item.id}
            className={`rounded-xl border p-4 ${
              isEditingRow ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm break-words">{friendlyName}</div>
                <div className="mt-2">{renderStatus(item)}</div>
              </div>
              <div className="flex-shrink-0">{renderActions(item, isEditingRow)}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="rounded-lg bg-blue-50/30 p-3 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">PI (Legal)</div>
                <div className="mt-1 min-w-0">
                  {isEditingRow ? (
                    renderEditInput('piValue', 'border-blue-300')
                  ) : (
                    <div className="text-sm text-gray-700 break-words">{item.piValue}</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-indigo-50/30 p-3 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Proposta (Vendas)</div>
                <div className="mt-1 min-w-0">
                  {isEditingRow ? (
                    renderEditInput('proposalValue', 'border-indigo-300')
                  ) : (
                    <div
                      className={`text-sm break-words ${proposalMismatch ? 'font-bold text-red-600' : 'text-gray-700'}`}
                    >
                      {item.proposalValue}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-orange-50/30 p-3 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700">E-mail (Contexto)</div>
                <div className="mt-1 min-w-0">
                  {isEditingRow ? (
                    renderEditInput('emailValue', 'border-orange-300')
                  ) : (
                    <div
                      className={`text-sm break-words ${emailMismatch ? 'font-bold text-red-600' : 'text-gray-700'}`}
                    >
                      {item.emailValue}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-purple-50/30 p-3 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">OPEC (Técnico)</div>
                <div className="mt-1 min-w-0">
                  {isEditingRow ? (
                    renderEditInput('pmValue', 'border-purple-300')
                  ) : (
                    <div className={`text-sm break-words ${pmMismatch ? 'font-bold text-red-600' : 'text-gray-700'}`}>
                      {item.pmValue}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isJustifyingRow && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 animate-fade-in-up">
                {renderJustification(item.id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AuditTableMobile;
