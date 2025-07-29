// src/components/SlotActionsSkeleton.tsx
import React from "react";

const SlotActionsSkeleton: React.FC = () => {
    return (
        <tr className="overflow-hidden">
            <td colSpan={9} className="p-4 bg-[var(--md-rgb-color-surface-container)]">
                <div className="space-y-2">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-3 w-40"></div>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center py-1 px-2 bg-[var(--md-rgb-color-surface)] rounded">
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-8"></div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
};

export default SlotActionsSkeleton;