import React from 'react';
import { AuditFieldKey, AuditItem } from '../../types';

type EditableField = 'piValue' | 'proposalValue' | 'emailValue' | 'pmValue';

interface AuditTableDesktopProps {
  items: AuditItem[];
  editingId: number | null;
  justifyingId: number | null;
  fieldLabels: Record<AuditFieldKey, string>;
  renderStatus: (item: AuditItem) => React.ReactNode;
  renderActions: (item: AuditItem, isEditingRow: boolean) => React.ReactNode;
  renderEditInput: (field: EditableField, borderClassName: string) => React.ReactNode;
  renderJustification: (itemId: number) => React.ReactNode;
}

const AuditTableDesktop: React.FC<AuditTableDesktopProps> = ({
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
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[900px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-[10px] md:text-xs uppercase tracking-wider">
            <th className="px-3 sm:px-4 py-3 font-semibold border-b">Item Verificado</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-blue-600">PI (Legal)</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-indigo-600">Proposta (Vendas)</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-orange-600">E-mail (Contexto)</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-purple-600">OPEC (Técnico)</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-center">Status</th>
            <th className="px-3 sm:px-4 py-3 font-semibold border-b text-center w-24">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => {
            const friendlyName = fieldLabels[item.field] || item.field;
            const isEditingRow = editingId === item.id;
            const isJustifyingRow = justifyingId === item.id;

            return (
              <React.Fragment key={item.id}>
                <tr className={`transition-colors ${isEditingRow ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-3 sm:px-4 py-4 text-sm font-bold text-gray-800">{friendlyName}</td>

                  <td className="px-3 sm:px-4 py-4 text-sm text-gray-600 bg-blue-50/20">
                    {isEditingRow ? renderEditInput('piValue', 'border-blue-300') : item.piValue}
                  </td>

                  <td
                    className={`px-3 sm:px-4 py-4 text-sm bg-indigo-50/20 ${
                      !item.isConsistent && item.proposalValue !== item.piValue && !item.manuallyApproved
                        ? 'font-bold text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {isEditingRow ? renderEditInput('proposalValue', 'border-indigo-300') : item.proposalValue}
                  </td>

                  <td
                    className={`px-3 sm:px-4 py-4 text-sm bg-orange-50/20 ${
                      !item.isConsistent && item.emailValue !== item.piValue && !item.manuallyApproved
                        ? 'font-bold text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {isEditingRow ? renderEditInput('emailValue', 'border-orange-300') : item.emailValue}
                  </td>

                  <td
                    className={`px-3 sm:px-4 py-4 text-sm bg-purple-50/20 ${
                      !item.isConsistent && item.pmValue !== item.piValue && !item.manuallyApproved
                        ? 'font-bold text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {isEditingRow ? renderEditInput('pmValue', 'border-purple-300') : item.pmValue}
                  </td>

                  <td className="px-3 sm:px-4 py-4 text-center">
                    <div className="flex flex-col items-center">{renderStatus(item)}</div>
                  </td>

                  <td className="px-3 sm:px-4 py-4 text-center">{renderActions(item, isEditingRow)}</td>
                </tr>

                {isJustifyingRow && (
                  <tr className="bg-blue-50 animate-fade-in-up">
                    <td colSpan={7} className="px-4 py-4 border-b border-blue-100">
                      {renderJustification(item.id)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTableDesktop;
