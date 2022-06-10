import * as React from "react";
import { useDragAndDrop } from "../controlledEnvironment/DragAndDropProvider";
import { useTree } from "./Tree";

export const DragBetweenLine: React.FC<{
    treeId: string;
}> = (props) => {
    const [{ draggingPosition, itemHeight }] = useDragAndDrop();
    const { renderers } = useTree();

    const shouldDisplay =
        draggingPosition && draggingPosition.targetType === "between-items" && draggingPosition.treeId === props.treeId;

    if (!shouldDisplay) {
        return null;
    }

    return (
        <div
            style={{
                position: "absolute",
                left: "0",
                right: "0",
                top: `${(draggingPosition?.linearIndex ?? 0) * itemHeight}px`,
            }}
        >
            {renderers.renderDragBetweenLine({
                draggingPosition: draggingPosition!,
            })}
        </div>
    );
};
