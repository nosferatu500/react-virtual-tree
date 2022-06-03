import React, { useMemo, useRef, useState } from "react";
import { TreeItemChildren } from "./TreeItemChildren";
import { TreeItemIndex } from "./types";
import { useViewState } from "./hooks/useViewState";
import {
    createTreeMeta,
    createTreeMetaDeps,
    createTreeItemRenderContext,
    createTreeItemRenderContextDependencies,
} from "./utils";
import { useVirtualTreeContext } from "./VirtualTreeContext";
import { useDrag, useDrop } from "react-dnd";
import { useTreeContext } from "./VirtualTree";
import { defaultMatcher } from "./search/defaultMatcher";

export const TreeItem = (props: { itemIndex: TreeItemIndex; depth: number }): JSX.Element => {
    const [hasBeenRequested, setHasBeenRequested] = useState(false);
    const { treeId, search, renderer } = useTreeContext();
    const context = useVirtualTreeContext();
    const viewState = useViewState();

    const item = context.items[props.itemIndex];
    const itemTitle = item && context.getItemTitle(item);

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
        //     const dragIndex = draggedItem.index
        //     const hoverIndex = props.itemIndex
        // }
    });

    const [{ isDragging }, drag] = useDrag({
        type: "rvt-item",
        item: () => {
            return { index: props.itemIndex, canMove: item.canMove };
        },
        options: {
            dropEffect: "copy",
        },
        canDrag: () => canDrag,
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
        end(draggedItem, monitor) {
            // onDragStart
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

    const isSearchMatching = useMemo(() => {
        return search === null || search.length === 0 || !item
       ? false : (context.doesSearchMatchItem ?? defaultMatcher)(search, item, itemTitle);
   }, [search, itemTitle]);

    const renderContext = useMemo(
        () => item && createTreeItemRenderContext(item, context, treeId, isSearchMatching),
        createTreeItemRenderContextDependencies(item, context, treeId, isSearchMatching)
    );

    const meta = useMemo(() => createTreeMeta(context, treeId, search), createTreeMetaDeps(context, treeId, search));

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
    const titleComponent = renderer.renderItemTitle(title, item, renderContext, meta);

    return (
        renderer.renderItem(
            ref,
            context.items[props.itemIndex],
            itemStyle,
            props.depth,
            children,
            titleComponent,
            renderContext,
            meta
        ) || (null as any)
    );
};
