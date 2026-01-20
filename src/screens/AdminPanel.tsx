import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminDevices, DeviceAdminData } from '../hooks/useAdminDevices';
import { useAppConfig } from '../hooks/useAppConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSort, faSortUp, faSortDown, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { isAdminUser } from '../config/appConfig';

type SortConfig = {
  key: keyof DeviceAdminData;
  direction: 'asc' | 'desc';
};

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { devices, loading, updateDevice } = useAdminDevices();
  const { appConfig, loading: appConfigLoading } = useAppConfig();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'deviceName', direction: 'asc' });
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<DeviceAdminData>>({});

  const isAdmin = isAdminUser(user?.email);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Přístup odepřen</h2>
          <p>Tato část je určena pouze pro administrátory.</p>
          <button
            onClick={() => navigate('/hranolky')}
            className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-[var(--color-primary)] transition-colors"
          >
            Zpět na sklad
          </button>
        </div>
      </div>
    );
  }

  const handleSort = (key: keyof DeviceAdminData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedDevices = useMemo(() => {
    const result = [...devices];
    result.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const comparison = valA < valB ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [devices, sortConfig]);

  const handleEditChange = (deviceId: string, field: keyof DeviceAdminData, value: any) => {
    setEditingDevice(deviceId);
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (deviceId: string) => {
    const success = await updateDevice(deviceId, editValues);
    if (success) {
      setEditingDevice(null);
      setEditValues({});
    } else {
      alert('Chyba při ukládání změn.');
    }
  };

  const getSortIcon = (key: keyof DeviceAdminData) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  return (
    <div className="min-h-screen w-full flex justify-center px-6 py-6">
      <div className="w-full max-w-[1400px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-[var(--color-bg-01)] p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/hranolky')}
              className="p-3 hover:bg-grey rounded-full transition-colors text-[var(--color-text-01)]"
              title="Zpět na sklad"
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Administrace terminálů</h1>
              <p className="text-sm text-[var(--color-text-03)]">
                Pokud se změny v Android aplikaci neprojeví, spusťte ji znovu. <br />
                Pokud zde chybí zařízení, nainstalujte na něj poslední APK.
              </p>
            </div>
          </div>
          <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="200" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Devices Card */}
          <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                <span className="text-gray-500">Načítání zařízení...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-grey">
                      <th className="py-4 px-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => handleSort('shortId')}>
                        ID <FontAwesomeIcon icon={getSortIcon('shortId')} className="ml-1 text-xs" />
                      </th>
                      <th className="py-4 px-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => handleSort('deviceName')}>
                        Název zařízení <FontAwesomeIcon icon={getSortIcon('deviceName')} className="ml-1 text-xs" />
                      </th>
                      <th className="py-4 px-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => handleSort('appVersion')}>
                        Verze <FontAwesomeIcon icon={getSortIcon('appVersion')} className="ml-1 text-xs" />
                      </th>
                      <th className="py-4 px-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => handleSort('lastSeen')}>
                        Naposledy <FontAwesomeIcon icon={getSortIcon('lastSeen')} className="ml-1 text-xs" />
                      </th>
                      <th className="py-4 px-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors text-center" onClick={() => handleSort('isInventoryCheckPermitted')}>
                        Inventura <FontAwesomeIcon icon={getSortIcon('isInventoryCheckPermitted')} className="ml-1 text-xs" />
                      </th>
                      <th className="py-4 px-2 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDevices.map((device) => {
                      const isEdited = editingDevice === device.id;
                      const currentName = isEdited && editValues.deviceName !== undefined ? editValues.deviceName : device.deviceName;
                      const currentPermitted = isEdited && editValues.isInventoryCheckPermitted !== undefined ? editValues.isInventoryCheckPermitted : device.isInventoryCheckPermitted;

                      return (
                        <tr key={device.id} className="border-b border-grey hover:bg-[var(--color-bg-05)] transition-colors group">
                          <td className="py-4 px-2 font-mono text-sm text-[var(--color-text-03)]" title={device.id}>
                            {device.shortId}
                          </td>
                          <td className="py-4 px-2">
                            <input
                              type="text"
                              value={currentName}
                              onChange={(e) => handleEditChange(device.id, 'deviceName', e.target.value)}
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
                              onClick={() => handleEditChange(device.id, 'isInventoryCheckPermitted', !currentPermitted)}
                              className={`text-2xl transition-transform active:scale-90 ${currentPermitted ? 'text-green-500' : 'text-gray-300'}`}
                              title={currentPermitted ? 'Povolen' : 'Nepovolen'}
                            >
                              <FontAwesomeIcon icon={currentPermitted ? faCheckCircle : faTimesCircle} />
                            </button>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button
                              onClick={() => handleSave(device.id)}
                              disabled={!isEdited}
                              className={`p-2 rounded-lg transition-all ${isEdited
                                ? 'bg-[var(--color-primary)] text-black shadow-md hover:bg-[var(--color-primary-dark)] scale-110'
                                : 'hidden'
                                }`}
                              title="Uložit změny"
                            >Uložit změny
                              <FontAwesomeIcon icon={faSave} className='pl-1' />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* App Version Card */}
          <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-6">Android aplikace</h2>
            {appConfigLoading ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : appConfig ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-[var(--color-text-03)]">Aktuální verze</span>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">{appConfig.version}</p>
                  <span className="text-xs text-[var(--color-text-03)]">(kód: {appConfig.versionCode})</span>
                </div>
                <div>
                  <span className="text-sm text-[var(--color-text-03)] font-bold">Co je nového:</span>
                  <p className="text-sm mt-1">{appConfig.releaseNotes}</p>
                </div>
                <button
                  onClick={() => window.open(appConfig.downloadUrl, '_blank')}
                  className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-[var(--color-primary)] transition-colors"
                >
                  Stáhnout APK
                </button>
              </div>
            ) : (
              <p className="text-[var(--color-text-03)]">Konfigurace nenalezena</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
