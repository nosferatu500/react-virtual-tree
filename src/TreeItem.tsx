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
    const context = useContext(VirtualTreeContext);
    const viewState = useViewState();
    const item = context.items[props.itemIndex];

    const ref = useRef<HTMLDivElement>(null)

    const selectedItems = viewState?.selectedItems?.map(item => context.items[item]);

    const canDrag = (selectedItems &&
        selectedItems.length > 0 &&
        context.allowDragAndDrop &&
        (context.canDrag?.(selectedItems) ?? true) &&
        (
            selectedItems
                .map(item => item.canMove ?? true)
                .reduce((a, b) => a && b, true)
        )) ?? false;

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

        // drop(draggedItem: any, monitor) {

        // }
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
                context.onSelectItems?.(selectedItems, treeId);
            }

            context.onStartDragItems(
                selectedItems.map((id) => context.items[id]),
                treeId
            );
        }
    })

    const opacity = isDragging ? 0.3 : 1
    drag(drop(ref))

    const isExpanded = useMemo(() => viewState.expandedItems?.includes(props.itemIndex), [props.itemIndex, viewState.expandedItems]);
    const renderContext = useMemo(
        () => item && createTreeItemRenderContext(item, context, treeId),
        createTreeItemRenderContextDependencies(item, context, treeId)
    );

    const meta = useMemo(
        () => createTreeInformation(context, treeId),
        createTreeInformationDependencies(context, treeId),
    );

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
    }

    return context.renderItem(ref, context.items[props.itemIndex], itemStyle, props.depth, children, renderContext, meta) || null as any;
} 
