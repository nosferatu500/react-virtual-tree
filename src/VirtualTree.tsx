import React, { HTMLProps, useContext, useEffect, useMemo, useRef } from 'react';
import { DragBetweenLine } from './DragBetweenLine';
// import { useFocusWithin } from './hooks/useFocusWithin';
import { TreeItemChildren } from './TreeItemChildren';
import { TreeProps, TreeRenderProps } from './types';
import { createTreeInformation, createTreeInformationDependencies, getItemsLinearly } from './utils';
import { VirtualTreeContext } from './VirtualTreeContext';

export const TreeRenderContext = React.createContext<Required<TreeRenderProps>>(null as any);
export const TreeIdContext = React.createContext<string>('__no_tree');

export const VirtualTree = (props: TreeProps) => {
    const virtualTreeContext = useContext(VirtualTreeContext);
    const renderer = useMemo<Required<TreeRenderProps>>(() => ({ ...virtualTreeContext, ...props }), [props, virtualTreeContext]);
    const rootItem = virtualTreeContext.items[props.rootItem];
    const containerRef = useRef<HTMLElement>();
    const lastHoverCode = useRef<string>();

    useEffect(() => {
        virtualTreeContext.addTree({
            treeId: props.treeId,
            rootItem: props.rootItem
        });

        return () => virtualTreeContext.removeTree(props.treeId);
    }, [props.treeId, props.rootItem]);

    // useFocusWithin(containerRef.current, () => {
    //     virtualTreeContext.setActiveTree(props.treeId)
    // }, () => {
    //     if (virtualTreeContext.activeTreeId === props.treeId) {
    //         virtualTreeContext.setActiveTree(undefined);
    //     }
    // }, [virtualTreeContext.activeTreeId, props.treeId]);

    const meta = useMemo(
        () => createTreeInformation(virtualTreeContext, props.treeId),
        createTreeInformationDependencies(virtualTreeContext, props.treeId),
    ); // share with tree children

    if (rootItem === undefined) {
        virtualTreeContext.onMissingItems?.([props.rootItem]);
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

    const containerProps: HTMLProps<any> = {
        onDragOver: e => {
            if (!containerRef.current) {
                return;
            }

            if (e.clientX < 0 || e.clientY < 0) {
                return;
            }

            const treeBb = containerRef.current.getBoundingClientRect();
            const outsideContainer = e.clientX < treeBb.left
                || e.clientX > treeBb.right
                || e.clientY < treeBb.top
                || e.clientY > treeBb.bottom;

            const hoveringPosition = (e.clientY - /*containerRef.current!.offsetTop*/ treeBb.top) / virtualTreeContext.itemHeight;
            let linearIndex = Math.floor(hoveringPosition);
            let offset: 'top' | 'bottom' | undefined = undefined;

            if (hoveringPosition % 1 < 0.2) {
                offset = 'top';
            } else if (hoveringPosition % 1 > 0.8) {
                offset = 'bottom';
            }

            const hoveringCode = outsideContainer ? 'outside' : `${linearIndex}${offset ?? ''}`;

            if (lastHoverCode.current !== hoveringCode) {
                lastHoverCode.current = hoveringCode;

                if (outsideContainer) {
                    virtualTreeContext.onDragAtPosition(undefined);
                    return;
                }

                const linearItems = getItemsLinearly(props.rootItem, virtualTreeContext.viewState[props.treeId] ?? {}, virtualTreeContext.items);

                if (linearIndex < 0 || linearIndex >= linearItems.length) {
                    virtualTreeContext.onDragAtPosition(undefined);
                    return;
                }

                const depth = linearItems[linearIndex].depth;
                let parentLinearIndex = linearIndex;
                for (; !!linearItems[parentLinearIndex] && linearItems[parentLinearIndex].depth !== depth - 1; parentLinearIndex--);

                let parent = linearItems[parentLinearIndex];

                if (!parent) {
                    parent = { item: props.rootItem, depth: 0 };
                    parentLinearIndex = 0;
                }

                if (virtualTreeContext.viewState[props.treeId]?.selectedItems?.includes(linearItems[linearIndex].item)) {
                    return;
                }

                if (offset === 'top' && depth === (linearItems[linearIndex - 1]?.depth ?? -1)) {
                    offset = 'bottom';
                    linearIndex -= 1;
                }

                if (offset) {
                    virtualTreeContext.onDragAtPosition({
                        targetType: 'between-items',
                        treeId: props.treeId,
                        parentItem: parent.item,
                        depth: linearItems[linearIndex].depth,
                        linearIndex: linearIndex + (offset === 'top' ? 0 : 1),
                        childIndex: linearIndex - parentLinearIndex - 1 + (offset === 'top' ? 0 : 1),
                        linePosition: offset,
                    });
                } else {
                    virtualTreeContext.onDragAtPosition({
                        targetType: 'item',
                        treeId: props.treeId,
                        parentItem: parent.item,
                        targetItem: linearItems[linearIndex].item,
                        depth: linearItems[linearIndex].depth,
                        linearIndex: linearIndex,
                    })
                }

                virtualTreeContext.setActiveTree(props.treeId);

                if (virtualTreeContext.draggingItems && virtualTreeContext.onSelectItems && virtualTreeContext.activeTreeId !== props.treeId) {
                    virtualTreeContext.onSelectItems(virtualTreeContext.draggingItems.map(item => item.index), props.treeId);
                }
            }
        },
        ref: containerRef,
        style: { position: 'relative' }
    };

    return (
        <TreeRenderContext.Provider value={renderer}>
            <TreeIdContext.Provider value={props.treeId}>
                {renderer.renderTreeContainer(treeChildren, containerProps, meta)}
            </TreeIdContext.Provider>
        </TreeRenderContext.Provider>
    );
}
