import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DragBetweenLine } from './DragBetweenLine';
import { useFocusWithin } from './hooks/useFocusWithin';
import { TreeItemChildren } from './TreeItemChildren';
import { DraggingPosition, TreeProps, TreeRenderProps } from './types';
import { createTreeInformation, createTreeInformationDependencies, getItemsLinearly } from './utils';
import { VirtualTreeContext } from './VirtualTreeContext';

export const TreeRenderContext = React.createContext<Required<TreeRenderProps>>(null as any);
export const TreeIdContext = React.createContext<string>('__no_tree');

export const VirtualTree = (props: TreeProps) => {
    const context = useContext(VirtualTreeContext);
    const renderer = useMemo<Required<TreeRenderProps>>(() => ({ ...context, ...props }), [props, context]);
    const rootItem = context.items[props.rootItem];
    const lastHoverCode = useRef<string>();

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        context.addTree({
            treeId: props.treeId,
            rootItem: props.rootItem
        });

        return () => context.removeTree(props.treeId);
    }, [props.treeId, props.rootItem]);

    useFocusWithin(ref.current, () => {
        context.setActiveTree(props.treeId)
    }, () => {
        if (context.activeTreeId === props.treeId) {
            context.setActiveTree(undefined);
        }
    }, [context.activeTreeId, props.treeId]);

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },

        hover(item: any, monitor) {
            if (!context.allowDragAndDrop) {
                return;
            }

            if (!ref.current) {
                return
            }

            const clientOffset = monitor.getClientOffset();
            const clientX = (clientOffset?.x ?? -1)
            const clientY = (clientOffset?.y ?? -1)

            if (clientX < 0 || clientY < 0) {
                return;
            }

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const outsideContainer = clientX < hoverBoundingRect.left
                || clientX > hoverBoundingRect.right
                || clientY < hoverBoundingRect.top
                || clientY > hoverBoundingRect.bottom;

            const hoveringPosition = (clientY - hoverBoundingRect.top) / context.itemHeight;
            let linearIndex = Math.floor(hoveringPosition);
            let offset: 'top' | 'bottom' | undefined = undefined;

            const lineThreshold = (context.allowDropOnItemWithChildren || context.allowDropOnItemWithoutChildren) ? 0.2 : 0.5;

            if (hoveringPosition % 1 < lineThreshold) {
                offset = 'top';
            } else if (hoveringPosition % 1 > 1 - lineThreshold) {
                offset = 'bottom';
            }

            const hoveringCode = outsideContainer ? 'outside' : `${linearIndex}${offset ?? ''}`;

            if (lastHoverCode.current !== hoveringCode) {
                lastHoverCode.current = hoveringCode;

                if (outsideContainer) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                const linearItems = getItemsLinearly(props.rootItem, context.viewState[props.treeId] ?? {}, context.items);

                if (linearIndex < 0 || linearIndex >= linearItems.length) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                const targetItem = linearItems[linearIndex];
                const depth = targetItem.depth;
                const targetItemData = context.items[targetItem.item];

                if (!offset && !context.allowDropOnItemWithoutChildren && !targetItemData.isFolder) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                if (!offset && !context.allowDropOnItemWithChildren && targetItemData.isFolder) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                if (offset && !context.allowReorderingItems) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                let parentLinearIndex = linearIndex;
                for (; !!linearItems[parentLinearIndex] && linearItems[parentLinearIndex].depth !== depth - 1; parentLinearIndex--);

                let parent = linearItems[parentLinearIndex];

                if (!parent) {
                    parent = { item: props.rootItem, depth: 0 };
                    parentLinearIndex = 0;
                }

                if (context.viewState[props.treeId]?.selectedItems?.includes(targetItem.item)) {
                    return;
                }

                if (offset === 'top' && depth === (linearItems[linearIndex - 1]?.depth ?? -1)) {
                    offset = 'bottom';
                    linearIndex -= 1;
                }

                let draggingPosition: DraggingPosition;

                if (offset) {
                    draggingPosition = {
                        targetType: 'between-items',
                        treeId: props.treeId,
                        parentItem: parent.item,
                        depth: targetItem.depth,
                        linearIndex: linearIndex + (offset === 'top' ? 0 : 1),
                        childIndex: linearIndex - parentLinearIndex - 1 + (offset === 'top' ? 0 : 1),
                        linePosition: offset,
                    };
                } else {
                    draggingPosition = {
                        targetType: 'item',
                        treeId: props.treeId,
                        parentItem: parent.item,
                        targetItem: targetItem.item,
                        depth: targetItem.depth,
                        linearIndex: linearIndex,
                    }
                }

                if (context.canDropAt && (!context.draggingItems
                    || !context.canDropAt(context.draggingItems, draggingPosition))) {
                        context.onDragAtPosition(undefined);
                    return;
                  }

                context.onDragAtPosition(draggingPosition);

                context.setActiveTree(props.treeId);

                if (context.draggingItems && context.onSelectItems && context.activeTreeId !== props.treeId) {
                    context.onSelectItems(context.draggingItems.map(item => item.index), props.treeId);
                }
            }
        },

        // drop(draggedItem: any, monitor) {
        // }
    })

    const meta = useMemo(
        () => createTreeInformation(context, props.treeId),
        createTreeInformationDependencies(context, props.treeId),
    );

    if (rootItem === undefined) {
        context.onMissingItems?.([props.rootItem]);
        return null;
    }

    const rootChildren = rootItem.children;

    if (!rootChildren) {
        throw Error(`Root ${props.rootItem} does not contain any children`);
    }

    const treeChildren = (
        <>
            <TreeItemChildren children={rootChildren} depth={0} parentId={props.treeId} />
            <DragBetweenLine treeId={props.treeId} />
        </>
    );

    drop(ref)

    return (
        <TreeRenderContext.Provider value={renderer}>
            <TreeIdContext.Provider value={props.treeId}>
                {renderer.renderTreeContainer(ref, treeChildren, meta)}
            </TreeIdContext.Provider>
        </TreeRenderContext.Provider>
    );
}
