import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUserShield, faUserCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useUserManagement, UserType } from '../../hooks/data/useUserManagement';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const { admins, allowedUsers, loading, addUser, removeUser } = useUserManagement();
  const { user } = useAuth();

  const [newAdmin, setNewAdmin] = useState('');
  const [newUser, setNewUser] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAddString = async (type: UserType, value: string, setValue: (v: string) => void) => {
    if (!value) return;
    setProcessing(`add-${type}`);
    const success = await addUser(type, value.trim());
    if (success) setValue('');
    setProcessing(null);
  };

  const handleRemove = async (type: UserType, email: string) => {
    if (!window.confirm(`Opravdu chcete odebrat ${email} z ${type === 'Admins' ? 'administrátorů' : 'povolených uživatelů'}?`)) return;
    setProcessing(`remove-${type}-${email}`);
    await removeUser(type, email);
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl max-w-[900px] mt-6">
        <h2 className="text-xl font-bold mb-6">Správa uživatelů</h2>
        <div className="flex flex-col items-center py-4 gap-4">
          <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl max-w-[900px] mt-6">
      <h2 className="text-xl font-bold mb-6">Správa uživatelů</h2>

      <div className="mb-4 text-sm text-gray-500">
        Přihlášen jako: <span className="font-mono text-black">{user?.email}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admins Column */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faUserShield} className="text-[var(--color-primary)]" />
            Administrátoři
          </h3>
          <p className="text-xs text-[var(--color-text-03)] mb-3">Mají plný přístup ke všemu včetně správy zařízení a uživatelů.</p>

          <div className="space-y-2 mb-4">
            {admins.map(email => (
              <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <span className="text-sm truncate mr-2" title={email}>{email}</span>
                <button
                  onClick={() => handleRemove('Admins', email)}
                  disabled={!!processing}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  {processing === `remove-Admins-${email}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email admina"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              value={newAdmin}
              onChange={e => setNewAdmin(e.target.value)}
            />
            <button
              onClick={() => handleAddString('Admins', newAdmin, setNewAdmin)}
              disabled={!newAdmin || !!processing}
              className="bg-gray-200 hover:bg-[var(--color-primary)] hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              {processing === 'add-Admins' ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
            </button>
          </div>
        </div>

        {/* Allowed Users Column */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faUserCheck} className="text-[var(--color-primary)]" />
            Povolení uživatelé
          </h3>
          <p className="text-xs text-[var(--color-text-03)] mb-3">Mohou zobrazovat a editovat data.</p>

          <div className="space-y-2 mb-4">
            {allowedUsers.map(email => (
              <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <span className="text-sm truncate mr-2" title={email}>{email}</span>
                <button
                  onClick={() => handleRemove('AllowedUsers', email)}
                  disabled={!!processing}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  {processing === `remove-AllowedUsers-${email}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email uživatele"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
            />
            <button
              onClick={() => handleAddString('AllowedUsers', newUser, setNewUser)}
              disabled={!newUser || !!processing}
              className="bg-gray-200 hover:bg-[var(--color-primary)] hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              {processing === 'add-AllowedUsers' ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
