import React, { useState, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAppSettings } from '../../hooks/data/useAppSettings';
import { QualityMappings, DimensionAdjustments } from '../../config/appSettings';

const AppSettingsCard: React.FC = () => {
  const { settings, loading, error, updateSettings, saving } = useAppSettings();

  // Local editable state
  const [qualityMappings, setQualityMappings] = useState<QualityMappings>({});
  const [dimensionAdjustments, setDimensionAdjustments] = useState<DimensionAdjustments>({});
  const [inventoryCheckPeriodDays, setInventoryCheckPeriodDays] = useState(75);

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // New entry inputs
  const [newQualityKey, setNewQualityKey] = useState('');
  const [newQualityValue, setNewQualityValue] = useState('');
  const [newDimensionKey, setNewDimensionKey] = useState('');
  const [newDimensionValue, setNewDimensionValue] = useState('');

  // Track settings version to detect external changes
  const prevVersionRef = useRef<number | null>(null);

  // Sync local state when settings load or change externally
  useLayoutEffect(() => {
    if (!loading && prevVersionRef.current !== settings.version) {
      prevVersionRef.current = settings.version;
      setQualityMappings({ ...settings.qualityMappings });
      setDimensionAdjustments({ ...settings.dimensionAdjustments });
      setInventoryCheckPeriodDays(settings.inventoryCheckPeriodDays);
      setHasChanges(false);
    }
  }, [settings, loading]);

  const handleQualityChange = (key: string, value: string) => {
    setQualityMappings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleQualityDelete = (key: string) => {
    setQualityMappings(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setHasChanges(true);
  };

  const handleQualityKeyChange = (value: string) => {
    // Remove any existing dashes and slashes first
    let cleanValue = value.replace(/[-/\\]/g, '').toUpperCase();

    // Limit to 6 characters (3 before dash + 3 after dash = ABC-XYZ)
    cleanValue = cleanValue.slice(0, 6);

    // If we have 3 or more characters, insert dash at position 3
    if (cleanValue.length >= 3) {
      const formatted = cleanValue.slice(0, 3) + '-' + cleanValue.slice(3);
      setNewQualityKey(formatted);
    } else {
      setNewQualityKey(cleanValue);
    }
  };

  const handleAddQuality = () => {
    if (newQualityKey && newQualityValue) {
      setQualityMappings(prev => ({ ...prev, [newQualityKey]: newQualityValue }));
      setNewQualityKey('');
      setNewQualityValue('');
      setHasChanges(true);
    }
  };

  const handleDimensionChange = (key: string, value: number) => {
    setDimensionAdjustments(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleDimensionDelete = (key: string) => {
    setDimensionAdjustments(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setHasChanges(true);
  };

  const handleAddDimension = () => {
    if (newDimensionKey && newDimensionValue) {
      setDimensionAdjustments(prev => ({ ...prev, [newDimensionKey]: parseFloat(newDimensionValue) }));
      setNewDimensionKey('');
      setNewDimensionValue('');
      setHasChanges(true);
    }
  };

  const handleInventoryDaysChange = (value: number) => {
    setInventoryCheckPeriodDays(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updateSettings({
      qualityMappings,
      dimensionAdjustments,
      inventoryCheckPeriodDays,
      collections: settings.collections,
    });
    if (success) {
      setHasChanges(false);
    } else {
      alert('Chyba při ukládání nastavení.');
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl max-w-[900px]">
        <h2 className="text-xl font-bold mb-6">Nastavení aplikace</h2>
        <div className="flex flex-col items-center py-10 gap-4">
          <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl max-w-[900px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Nastavení aplikace</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--color-text-03)]">
            Verze: {settings.version} | Aktualizováno: {new Date(settings.lastUpdated).toLocaleDateString('cs-CZ')}
          </span>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors ${hasChanges && !saving
              ? 'bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-dark)]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
            {saving ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          Chyba při načítání nastavení: {error.message}. Používám výchozí hodnoty.
        </div>
      )}

      {/* Dimension Adjustments */}
      <div className="mb-6">
        <h3 className="mb-3 color-[var(--md-rgb-color-inverse-surface)]">Korekce rozměrů (mm)</h3>
        <div className="space-y-2">
          {Object.entries(dimensionAdjustments).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded min-w-[150px]">{key}</span>
              <span className="text-gray-400">→</span>
              <input
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => handleDimensionChange(key, parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={() => handleDimensionDelete(key)}
                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Odstranit"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="Rozměr (např. 27.0)"
            value={newDimensionKey}
            onChange={(e) => setNewDimensionKey(e.target.value)}
            className="w-32 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)] text-sm min-w-[150px]"
          />
          <span className="text-gray-400">→</span>
          <input
            type="number"
            step="0.1"
            placeholder="Korekce"
            value={newDimensionValue}
            onChange={(e) => setNewDimensionValue(e.target.value)}
            className="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={handleAddDimension}
            disabled={!newDimensionKey || !newDimensionValue}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Přidat"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Inventory Check Period */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Minimální počet dní mezi inventurami:</h3>
        <input
          type="number"
          value={inventoryCheckPeriodDays}
          onChange={(e) => handleInventoryDaysChange(parseInt(e.target.value) || 0)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
          min="1"
        />
      </div>

      {/* Quality Mappings */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3]">Mapování kvalit</h3>
        <div className="space-y-2">
          {Object.entries(qualityMappings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded min-w-[160px]">{key}</span>
              <span className="text-gray-400">→</span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleQualityChange(key, e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={() => handleQualityDelete(key)}
                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Odstranit"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="Kód (např. DUB-XYZ)"
            value={newQualityKey}
            onChange={(e) => handleQualityKeyChange(e.target.value)}
            className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)] text-sm min-w-[160px]"
          />
          <span className="text-gray-400">→</span>
          <input
            type="text"
            placeholder="Název (např. DUB NOVÝ)"
            value={newQualityValue}
            onChange={(e) => setNewQualityValue(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={handleAddQuality}
            disabled={!newQualityKey || !newQualityValue}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Přidat"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {/* Collections (read-only info) */}
      <div>
        <h3 className="font-semibold mb-3">Kolekce Firestore</h3>
        <div className="text-sm text-[var(--color-text-03)] grid grid-cols-2 gap-2">
          <span>Hranolky: <code className="bg-gray-100 px-1 rounded">{settings.collections.beam}</code></span>
          <span>Spárovky: <code className="bg-gray-100 px-1 rounded">{settings.collections.jointer}</code></span>
          <span>Akce: <code className="bg-gray-100 px-1 rounded">{settings.collections.slotActions}</code></span>
          <span>Týdenní report: <code className="bg-gray-100 px-1 rounded">{settings.collections.weeklyReport}</code></span>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsCard;
