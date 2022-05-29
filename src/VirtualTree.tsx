import React, { HTMLProps, useContext, useEffect, useMemo, useRef } from 'react';
import { DragBetweenLine } from './DragBetweenLine';
import { TreeItemChildren } from './TreeItemChildren';
import { TreeProps, TreeRenderProps } from './types';
import { getItemsLinearly } from './utils';
import { VirtualTreeContext } from './VirtualTreeContext';

export const TreeRenderContext = React.createContext<Required<TreeRenderProps>>(null as any);
export const TreeIdContext = React.createContext<string>('__no_tree');

export const VirtualTree = <T extends any>(props: TreeProps<T>) => {
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
        onDrag: e => {
            const hoveringPosition = (e.clientY - containerRef.current!.offsetTop) / virtualTreeContext.itemHeight;
            let linearIndex = Math.floor(hoveringPosition);
            let offset: 'top' | 'bottom' | undefined = undefined;

            if (hoveringPosition % 1 < 0.2) {
                offset = 'top';
            } else if (hoveringPosition % 1 > 0.8) {
                offset = 'bottom';
            }

            const hoveringCode = `${linearIndex}${offset ?? ''}`;

            if (lastHoverCode.current !== hoveringCode) {
                lastHoverCode.current = hoveringCode;
                const linearItems = getItemsLinearly(props.rootItem, virtualTreeContext.viewState[props.treeId], virtualTreeContext.items);

                console.log(linearIndex, hoveringPosition, e.clientY, containerRef.current?.offsetTop, virtualTreeContext.itemHeight, containerRef.current)
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

                if (virtualTreeContext.viewState[props.treeId].selectedItems?.includes(linearItems[linearIndex].item)) {
                    return;
                }

                if (offset) {
                    virtualTreeContext.onDragAtPosition({
                        treeId: props.treeId,
                        targetItem: parent.item,
                        depth: linearItems[linearIndex].depth,
                        linearIndex: linearIndex + (offset === 'top' ? 0 : 1),
                        childIndex: linearIndex - parentLinearIndex + (offset === 'top' ? 0 : 1),
                        linePosition: offset,
                    });
                } else {
                    virtualTreeContext.onDragAtPosition({
                        treeId: props.treeId,
                        targetItem: linearItems[linearIndex].item,
                        depth: linearItems[linearIndex].depth,
                        linearIndex: linearIndex,
                        childIndex: undefined,
                    })
                }
            }
        },
        ref: containerRef,
        style: { position: 'relative' }
    };

    return (
        <TreeRenderContext.Provider value={renderer}>
            <TreeIdContext.Provider value={props.treeId}>
                {renderer.renderTreeContainer(treeChildren, containerProps)}
            </TreeIdContext.Provider>
        </TreeRenderContext.Provider>
    );
}
