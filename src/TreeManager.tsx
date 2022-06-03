import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { DragBetweenLine } from "./DragBetweenLine";
import { useFocusWithin } from "./hooks/useFocusWithin";
import { useGetLinearItems } from "./hooks/useGetLinearItems";
import { useTreeKeyboardBindings } from "./hotkeys/useTreeKeyboardBindings";
import { getHoveringPosition, isOutsideOfContainer, onDragOverHandler } from "./onDragOverHandler";
import { SearchInput } from "./search/SearchInput";
import { TreeItemChildren } from "./TreeItemChildren";
import { DraggingPosition } from "./types";
import { useTreeContext } from "./VirtualTree";
import { useVirtualTreeContext } from "./VirtualTreeContext";

export const TreeManager = (props: {}): JSX.Element => {
    const { treeId, rootItem, renderer, treeMeta } = useTreeContext();
    const context = useVirtualTreeContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHoverCode = useRef<string>();
    const getLinearItems = useGetLinearItems();

    const isActiveTree = context.activeTreeId === treeId;

    useTreeKeyboardBindings(containerRef.current);

    useFocusWithin(
        containerRef.current,
        () => {
            context.setActiveTree(treeId);
        },
        () => {
            if (isActiveTree) {
                context.setActiveTree(undefined);
            }
        },
        [context.activeTreeId, treeId, isActiveTree]
    );

    const rootChildren = context.items[rootItem].children;

    if (!rootChildren) {
        throw new Error(`Root ${rootItem} does not contain any children`);
    }

    const treeChildren = (
        <>
            <TreeItemChildren children={rootChildren} depth={0} parentId={treeId} />
            <DragBetweenLine treeId={treeId} />
            <SearchInput containerRef={containerRef.current} />
        </>
    );

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(draggedItem: any, monitor) {
            onDragOverHandler(
                draggedItem,
                context,
                containerRef,
                monitor,
                lastHoverCode,
                getLinearItems,
                rootItem,
                treeId
            );
        },

        // drop(draggedItem: any, monitor) {
        // }
    });

    drop(containerRef);

    return renderer.renderTreeContainer(containerRef, treeId, treeChildren, treeMeta) as JSX.Element;
};
