import React, { HTMLProps } from "react";
import { useTreeContext } from "./VirtualTree";
import { useVirtualTreeContext } from "./VirtualTreeContext";

export const DragBetweenLine: React.FC<{
    treeId: string;
}> = (props) => {
    const { draggingPosition, itemHeight } = useVirtualTreeContext();
    const { renderer } = useTreeContext();

    const shouldDisplay =
        draggingPosition && draggingPosition.treeId === props.treeId && draggingPosition.targetType === "between-items";

    if (!shouldDisplay) {
        return null;
    }

    const lineProps: HTMLProps<any> = {
        onDragOver: (e) => e.preventDefault(), // Allow dropping
    };

    return (
        <div
            style={{
                position: "absolute",
                left: "0",
                right: "0",
                top: `${(draggingPosition?.linearIndex ?? 0) * itemHeight}px`,
            }}
        >
            {renderer.renderDragBetweenLine({
                draggingPosition: draggingPosition!,
                lineProps,
            })}
        </div>
    );
};
