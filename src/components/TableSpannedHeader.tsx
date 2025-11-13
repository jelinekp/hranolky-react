import React from "react";

interface TableSpannedHeaderProps {
    label: string;
    colSpan: number;
}

const TableSpannedHeader: React.FC<TableSpannedHeaderProps> = ({ label, colSpan }) => {
    return (
        <th colSpan={colSpan} className="px-2">
            <div className="bg-[var(--md-rgb-color-surface-variant)] rounded-2xl mb-1">
                {label}
            </div>
        </th>
    );
};

export default TableSpannedHeader;

