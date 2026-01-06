import React from 'react';
import { Database, MapPin, MonitorSmartphone, Zap } from 'lucide-react';
import { StrategyItem, TechFeatures } from '../../types';

export const TechFeaturesEditor = (args: {
  item: StrategyItem;
  onToggle: (id: number, feature: keyof TechFeatures) => void;
}) => {
  const { item, onToggle } = args;

  return (
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.techFeatures.hasFirstParty}
          onChange={() => onToggle(item.id, 'hasFirstParty')}
          className="mr-1"
        />
        CRM
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.techFeatures.hasFootfall}
          onChange={() => onToggle(item.id, 'hasFootfall')}
          className="mr-1"
        />
        Geo
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.techFeatures.isRichMedia}
          onChange={() => onToggle(item.id, 'isRichMedia')}
          className="mr-1"
        />
        Rich
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.techFeatures.isCrossDevice}
          onChange={() => onToggle(item.id, 'isCrossDevice')}
          className="mr-1"
        />
        Cross
      </label>
    </div>
  );
};

export const TechFeaturesDisplay = ({ item }: { item: StrategyItem }) => {
  return (
    <div className="flex justify-center space-x-2">
      {item.techFeatures.hasFirstParty && (
        <div title="1st Party Data" className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
          <Database className="w-4 h-4" />
        </div>
      )}
      {item.techFeatures.hasFootfall && (
        <div title="Footfall" className="p-1.5 bg-orange-100 text-orange-700 rounded-md">
          <MapPin className="w-4 h-4" />
        </div>
      )}
      {item.techFeatures.isRichMedia && (
        <div title="Rich Media" className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
          <Zap className="w-4 h-4" />
        </div>
      )}
      {item.techFeatures.isCrossDevice && (
        <div title="Cross Device" className="p-1.5 bg-green-100 text-green-700 rounded-md">
          <MonitorSmartphone className="w-4 h-4" />
        </div>
      )}
      {!item.techFeatures.hasFirstParty &&
        !item.techFeatures.hasFootfall &&
        !item.techFeatures.isRichMedia &&
        !item.techFeatures.isCrossDevice && (
          <span className="text-gray-300 text-xs font-medium italic">Standard</span>
        )}
    </div>
  );
};
