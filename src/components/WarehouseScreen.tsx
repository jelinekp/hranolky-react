// filepath: /home/pavel/Jelinek/hranolky-react/src/components/WarehouseScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { SlotType } from "../../common/SlotType.ts";
import useAnonymousAuth from "../hooks/signInAnonymously.ts";
import { useFetchAllWarehouseSlots } from "../hooks/useFetchAllWarehouseSlots.ts";
import { useFetchUserDevices } from "../hooks/useFetchUserDevices.ts";
import ContentLayoutContainer from "./ContentLayoutContainer.tsx";

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
  const { user, loading: authLoading } = useAnonymousAuth();

  const enabled = !!user && !authLoading;
  const { warehouseSlots, loading: slotsLoading } = useFetchAllWarehouseSlots(
    "WarehouseSlots",
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
          <img src={switchTo.iconSrc} alt={`${switchTo.label} icon`} width={switchTo.iconWidth} height={switchTo.iconHeight} />
        </button>
        <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-2" />
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

