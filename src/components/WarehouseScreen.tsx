// filepath: `src/components/WarehouseScreen.tsx`
import React from "react";
import { useNavigate } from "react-router-dom";
import { SlotType } from "../../common/SlotType.ts";
import { useAuth } from "../contexts/AuthContext";
import { useFetchAllWarehouseSlots } from "../hooks/data/useFetchAllWarehouseSlots.ts";
import { useFetchUserDevices } from "../hooks/data/useFetchUserDevices.ts";
import ContentLayoutContainer from "./ContentLayoutContainer.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { isAdminUser } from "../config/appConfig";

export type WarehouseScreenProps = {
  slotType: SlotType;
  title: string;
  titleIconSrc: string;
  titleIconWidth: number;
  titleIconHeight: number;
  switchTo: {
    to: string;
    label: string;
    iconSrc: string;
    iconWidth: number;
    iconHeight: number;
    className?: string; // allow per-screen button padding/styling
  };
};

const WarehouseScreen: React.FC<WarehouseScreenProps> = ({
  slotType,
  title,
  titleIconSrc,
  titleIconWidth,
  titleIconHeight,
  switchTo,
}) => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const enabled = !!user && !authLoading;
  const { warehouseSlots, loading: slotsLoading } = useFetchAllWarehouseSlots(
    slotType,
    { enabled }
  );
  const { devices, loading: devicesLoading } = useFetchUserDevices({ enabled });

  const loading = authLoading || slotsLoading || devicesLoading;

  return (
    <div className={"m-6 max-w-[1920px] min-h-screen"}>
      <div className={"flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6"}>
        <div className={"flex flex-row items-center gap-3"}>
          <img src={titleIconSrc} alt={`${title} icon`} width={titleIconWidth} height={titleIconHeight} />
          <h1>{title}</h1>
        </div>
        <button
          onClick={() => navigate(switchTo.to)}
          className={
            switchTo.className ??
            "flex items-center whitespace-nowrap text-[var(--color-text-01)] hover:bg-grey p-2 rounded-lg reset-filters-button"
          }
        >
          <span className="text-xl leading-none">{switchTo.label}</span>
          <img src={switchTo.iconSrc} alt={`${switchTo.label} icon`} width={switchTo.iconWidth}
            height={switchTo.iconHeight} />
        </button>
        <div className="flex items-center gap-4">
          <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline" />
          {user && (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
              )}
              {isAdminUser(user.email) && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-[var(--color-text-01)] hover:bg-grey rounded-lg transition-colors border-0 outline-none bg-transparent cursor-pointer"
                  title="Administrace zařízení"
                >
                  <FontAwesomeIcon icon={faGear} className="text-l pr-1" />
                  Nastavení
                </button>
              )}
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] text-[var(--color-primary-dark)] hover:text-[var(--color-text-02)] rounded-lg transition-colors border border-[var(--color-primary)]/20 shadow-sm"
                title={`Odhlásit se (${user.displayName || user.email})`}
              >
                Odhlásit
              </button>
            </div>
          )}
        </div>
      </div>

      {authLoading && (
        <div className="mb-4 rounded-lg p-3 bg-[var(--color-bg-01)] shadow-inner flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <span>Probíhá přihlašování...</span>
        </div>
      )}

      <ContentLayoutContainer
        warehouseSlots={warehouseSlots}
        loading={loading}
        slotType={slotType}
        devices={devices}
      />
    </div>
  );
};

export default WarehouseScreen;