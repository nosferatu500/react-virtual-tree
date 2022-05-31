import React, { HTMLProps, useContext } from "react";
import { TreeRenderContext } from "./VirtualTree";
import { VirtualTreeContext } from "./VirtualTreeContext";

export const DragBetweenLine: React.FC<{
    treeId: string,
}> = props => {
    const context = useContext(VirtualTreeContext);
    const renderer = useContext(TreeRenderContext);

    const shouldDisplay =
        context.draggingPosition &&
        context.draggingPosition.treeId === props.treeId &&
        context.draggingPosition.targetType === 'between-items';

    if (!shouldDisplay) {
        return null;
    }

    const lineProps: HTMLProps<any> = {
        onDragOver: e => e.preventDefault(), // Allow dropping
    }

    return (
        <div style={{
            position: 'absolute',
            left: '0',
            right: '0',
            top: `${((context.draggingPosition?.linearIndex ?? 0)) * context.itemHeight}px`
        }}>
            {renderer.renderDragBetweenLine(context.draggingPosition!, lineProps)}
        </div>
    );
};