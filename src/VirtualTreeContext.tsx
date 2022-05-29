import React, { PropsWithChildren, useEffect, useState } from 'react';
import { createDefaultRenderer } from './renderers/defaultRender';
import { VirtualForestProps, Tree, TreeItem, VirtualTreeContextProps, DraggingPosition } from './types';

export const VirtualTreeContext = React.createContext<VirtualTreeContextProps>(null as any);

export const VirtualForest = <T extends any>(props: PropsWithChildren<VirtualForestProps<T>>) => {
    const [trees, setTrees] = useState<Record<string, Tree>>({});
    const [draggingItems, setDraggingItems] = useState<TreeItem<T>[]>();
    const [draggingPosition, setDraggingPosition] = useState<DraggingPosition>();

    const [itemHeight, setItemHeight] = useState(4);

    useEffect(() => {
        const dragEndEventListener = () => {
            console.log("MOUSE UP")
            setDraggingPosition(undefined);
            setDraggingItems(undefined);
        };

        window.addEventListener('dragend', dragEndEventListener);

        return () => {
            window.removeEventListener('dragend', dragEndEventListener);
        }
    }, [])

    return (
        // @ts-ignore
        <VirtualTreeContext.Provider value={{
            ...createDefaultRenderer(props),
            ...props,
            draggingPosition: draggingPosition,
            draggingItems: draggingItems,
            itemHeight: itemHeight,
            addTree: (tree) => {
                setTrees({ ...trees, [tree.treeId]: tree });
                props.onAddTree?.(tree);
            },
            removeTree: (treeId) => {
                props.onRemoveTree?.(trees[treeId]);
                delete trees[treeId];
                setTrees(trees);
            },
            onStartDragItems: (items, treeId) => {
                setDraggingItems(items);
                const height = document.querySelector<HTMLElement>(`[data-rvt-item='${treeId}']`)?.offsetHeight ?? 5;
                setItemHeight(height);
            },
            onDragAtPosition: (position) => {
                setDraggingPosition(position);

                if (position) {
                    console.log(`Dragging in tree ${position.treeId} at item ${position.targetItem} at index ${position.childIndex}, linear index ${position.linearIndex}`);
                }
            },
        }}>
            {props.children}
        </VirtualTreeContext.Provider>
    );
};