import React, { useContext, useMemo, useRef, useState } from 'react';
import { TreeItemChildren } from './TreeItemChildren';
import { TreeItemIndex } from './types';
import { useViewState } from './hooks/useViewState';
import { createTreeInformation, createTreeInformationDependencies, createTreeItemRenderContext, createTreeItemRenderContextDependencies } from './utils';
import { TreeIdContext } from './VirtualTree';
import { VirtualTreeContext } from './VirtualTreeContext';
import { useDrag, useDrop } from 'react-dnd';

export const TreeItem = (props: {
    itemIndex: TreeItemIndex;
    depth: number;
}): JSX.Element => {
    const [hasBeenRequested, setHasBeenRequested] = useState(false);
    const treeId = useContext(TreeIdContext);
    const virtualTreeContext = useContext(VirtualTreeContext);
    const viewState = useViewState();
    const item = virtualTreeContext.items[props.itemIndex];

    const ref = useRef<HTMLDivElement>(null)

    const canDrag =
        (viewState?.selectedItems?.length ?? 0) > 0
            ? viewState?.selectedItems?.map((item) => virtualTreeContext.items[item]?.canMove).reduce((a, b) => a && b, true) ??
            false
            : item?.canMove || false;

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        // hover(item: any, monitor) {
        //     if (!ref.current) {
        //         return
        //     }
        // },
        drop(draggedItem: any, monitor) {
            console.log({ item })
            console.log({ draggedItem })
            console.log("{ monitor }", monitor.getDropResult())


        }
    })

    const [{ isDragging }, drag] = useDrag({
        type: "rvt-item",
        item: () => {
            return { index: props.itemIndex }
        },
        options: {
            dropEffect: "copy"
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
                virtualTreeContext.onSelectItems?.(selectedItems, treeId);
            }

            virtualTreeContext.onStartDragItems(
                selectedItems.map((id) => virtualTreeContext.items[id]),
                treeId
            );
        }
    })

    const opacity = isDragging ? 0.3 : 1
    drag(drop(ref))

    const isExpanded = useMemo(() => viewState.expandedItems?.includes(props.itemIndex), [props.itemIndex, viewState.expandedItems]);
    const renderContext = useMemo(
        () => item && createTreeItemRenderContext(item, virtualTreeContext, treeId),
        createTreeItemRenderContextDependencies(item, virtualTreeContext, treeId)
    );

    const meta = useMemo(
        () => createTreeInformation(virtualTreeContext, treeId),
        createTreeInformationDependencies(virtualTreeContext, treeId),
    );

    if (item === undefined) {
        if (!hasBeenRequested) {
            setHasBeenRequested(true);
            virtualTreeContext.onMissingItems?.([props.itemIndex]);
        }
        return null as any;
    }

    const children = item.isFolder && isExpanded && item.children && (
        <TreeItemChildren depth={props.depth + 1} parentId={props.itemIndex} children={item.children} />
    );

    const itemStyle = {
        opacity,
    }

    return virtualTreeContext.renderItem(ref, virtualTreeContext.items[props.itemIndex], itemStyle, props.depth, children, renderContext, meta) || null as any;
} 
