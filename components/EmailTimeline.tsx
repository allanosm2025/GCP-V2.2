import React from 'react';
import { EmailInteraction } from '../types';
import { Mail, Clock, Check, MessageSquare } from 'lucide-react';

interface EmailTimelineProps {
  emails: EmailInteraction[];
}

const EmailTimeline: React.FC<EmailTimelineProps> = ({ emails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center">
        <Mail className="w-5 h-5 mr-2 text-primary" />
        Cronograma de Aprovação
      </h3>
      
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
        {emails.map((email, index) => {
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
            <div key={email.id} className="relative pl-8">
              {/* Node */}
              <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${colorClass} shadow-sm z-10`}></div>
              
              <div className="bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                  <h4 className="font-bold text-gray-800">{email.sender}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1 sm:mt-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {email.date}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {email.summary}
                </p>
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
    </div>
  );
};

export default EmailTimeline;