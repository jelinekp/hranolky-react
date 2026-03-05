/**
 * Device Row Component
 * 
 * Single row in the admin device table.
 * Extracted from AdminPanel.tsx following SoC principle.
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { DeviceAdminData } from '../../hooks/data/useAdminDevices';

interface DeviceRowProps {
  device: DeviceAdminData;
  isEdited: boolean;
  currentName: string;
  currentPermitted: boolean;
  onEditChange: (deviceId: string, field: keyof DeviceAdminData, value: string | boolean) => void;
  onSave: (deviceId: string) => void;
}

const DeviceRow: React.FC<DeviceRowProps> = ({
  device,
  isEdited,
  currentName,
  currentPermitted,
  onEditChange,
  onSave
}) => {
  return (
    <tr className="border-b border-grey hover:bg-[var(--color-bg-05)] transition-colors group">
      <td className="py-4 px-2 font-mono text-sm text-[var(--color-text-03)]" title={device.id}>
        {device.shortId}
      </td>
      <td className="py-4 px-2">
        <input
          type="text"
          value={currentName}
          onChange={(e) => onEditChange(device.id, 'deviceName', e.target.value)}
          className="bg-transparent border-b border-[var(--color-primary)] hover:border-grey focus:border-black focus:outline-none py-1 px-2 w-full transition-all rounded"
          placeholder="Pojmenujte zařízení..."
        />
      </td>
      <td className="py-4 px-2">
        <span className="px-2 py-1 bg-[var(--color-bg-05)] rounded text-xs font-semibold">
          {device.appVersion}
        </span>
      </td>
      <td className="py-4 px-2 text-sm text-[var(--color-text-03)]">
        {device.lastSeen ? device.lastSeen.toLocaleString('cs-CZ') : 'Nikdy'}
      </td>
      <td className="py-4 px-2 text-center">
        <button
          onClick={() => onEditChange(device.id, 'isInventoryCheckPermitted', !currentPermitted)}
          className={`text-2xl transition-transform active:scale-90 ${currentPermitted ? 'text-green-500' : 'text-gray-300'}`}
          title={currentPermitted ? 'Povolen' : 'Nepovolen'}
        >
          <FontAwesomeIcon icon={currentPermitted ? faCheckCircle : faTimesCircle} />
        </button>
      </td>
      <td className="py-4 px-2 text-right">
        <button
          onClick={() => onSave(device.id)}
          disabled={!isEdited}
          className={`p-2 rounded-lg transition-all ${isEdited
            ? 'bg-[var(--color-primary)] text-black shadow-md hover:bg-[var(--color-primary-dark)] scale-110'
            : 'hidden'
            }`}
          title="Uložit změny"
        >
          Uložit změny
          <FontAwesomeIcon icon={faSave} className='pl-1' />
        </button>
      </td>
    </tr>
  );
};

export default DeviceRow;
