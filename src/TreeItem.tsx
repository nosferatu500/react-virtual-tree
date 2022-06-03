import React, { useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useTreeItemRenderContext } from "./hooks/useTreeItemRenderContext";
import { useViewState } from "./hooks/useViewState";
import { TreeItemChildren } from "./TreeItemChildren";
import { TreeItemIndex } from "./types";
import { useTreeContext } from "./VirtualTree";
import { useVirtualTreeContext } from "./VirtualTreeContext";

export const TreeItem = (props: { itemIndex: TreeItemIndex; depth: number }): JSX.Element => {
    const [hasBeenRequested, setHasBeenRequested] = useState(false);
    const { treeId, renderer, treeMeta } = useTreeContext();
    const context = useVirtualTreeContext();
    const viewState = useViewState();

    const item = context.items[props.itemIndex];

    const ref = useRef<HTMLDivElement>(null);

    const selectedItems = viewState?.selectedItems?.map((item) => context.items[item]) ?? [];

    // const canDrag = (selectedItems &&
    //     selectedItems.length > 0 &&
    const canDrag =
        (context.allowDragAndDrop &&
            (context.canDrag?.(selectedItems) ?? true) &&
            selectedItems.map((item) => item.canMove ?? true).reduce((a, b) => a && b, true)) ??
        false;

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },

        // hover(item: any, monitor) {
        //     if (!ref.current) {
        //         return
        //     }
        // },

        // drop(draggedItem: any, monitor) {
        // },
    });

    const [{ isDragging }, drag] = useDrag({
        type: "rvt-item",
        item: () => {
            return { index: props.itemIndex, canMove: item.canMove, children: item.children };
        },
        options: {
            dropEffect: "copy",
        },
        canDrag: () => canDrag,
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
        end(draggedItem, monitor) {
            let selectedItems = viewState?.selectedItems ?? [];

            if (!selectedItems.includes(draggedItem.index)) {
                selectedItems = [draggedItem.index];
                context.onSelectItems?.(selectedItems, treeId);
            }

            if (draggedItem.canMove) {
                context.onStartDragItems(
                    selectedItems.map((id) => context.items[id]),
                    treeId
                );
            }
        },
    });

    const opacity = isDragging ? 0.3 : 1;
    drag(drop(ref));

    const isExpanded = useMemo(
        () => viewState.expandedItems?.includes(props.itemIndex),
        [props.itemIndex, viewState.expandedItems]
    );

    // Safely assume that renderContext exists, because if not, item also does not exist and the
    // component will exit early anyways
    const renderContext = useTreeItemRenderContext(item)!;

    if (item === undefined) {
        if (!hasBeenRequested) {
            setHasBeenRequested(true);
            context.onMissingItems?.([props.itemIndex]);
        }
        return null as any;
    }

    const children = item.isFolder && isExpanded && item.children && (
        <TreeItemChildren depth={props.depth + 1} parentId={props.itemIndex} children={item.children} />
    );

    const itemStyle = {
        opacity,
    };

    const title = context.getItemTitle(item);
    const titleComponent = renderer.renderItemTitle(title, item, renderContext, treeMeta);

    return (
        renderer.renderItem(
            ref,
            context.items[props.itemIndex],
            itemStyle,
            props.depth,
            children,
            titleComponent,
            renderContext,
            treeMeta
        ) || (null as any)
    );
};
