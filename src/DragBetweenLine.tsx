import React, { useContext } from "react";
import { TreeRenderContext } from "./VirtualTree";
import { VirtualTreeContext } from "./VirtualTreeContext";

export const DragBetweenLine: React.FC<{
    treeId: string,
}> = props => {
    const virtualTreeContext = useContext(VirtualTreeContext);
    const renderer = useContext(TreeRenderContext);

    const shouldDisplay =
        virtualTreeContext.draggingPosition &&
        virtualTreeContext.draggingPosition.treeId === props.treeId &&
        virtualTreeContext.draggingPosition.targetType === 'between-items';

    if (!shouldDisplay) {
        return null;
    }

    return (
        <div style={{
            position: 'absolute',
            left: '0',
            right: '0',
            top: `${((virtualTreeContext.draggingPosition?.linearIndex ?? 0)) * virtualTreeContext.itemHeight}px`
        }}>
            {renderer.renderDragBetweenLine(virtualTreeContext.draggingPosition!)}
        </div>
    );
};