import React, { PropsWithChildren, useEffect, useState } from "react";
import { createDefaultRenderer } from "./renderers/defaultRender";
import { VirtualForestProps, Tree, TreeItem, VirtualTreeContextProps, DraggingPosition } from "./types";

export const VirtualTreeContext = React.createContext<VirtualTreeContextProps>(null as any);

export const VirtualForest = (props: PropsWithChildren<VirtualForestProps>) => {
    const [trees, setTrees] = useState<Record<string, Tree>>({});
    const [draggingItems, setDraggingItems] = useState<TreeItem[]>();
    const [draggingPosition, setDraggingPosition] = useState<DraggingPosition>();
    const [activeTree, setActiveTree] = useState<string>();
    const [itemHeight, setItemHeight] = useState(4);

    useEffect(() => {
        const dragEndEventListener = () => {
            setDraggingPosition(undefined);
            setDraggingItems(undefined);

            if (draggingItems && draggingPosition && props.onDrop) {
                props.onDrop(draggingItems, draggingPosition);
            }
        };

        window.addEventListener("dragend", dragEndEventListener);

        return () => {
            window.removeEventListener("dragend", dragEndEventListener);
        };
    }, [draggingPosition, draggingItems, props.onDrop]);

    return (
        <VirtualTreeContext.Provider
            // @ts-ignore
            value={{
                ...createDefaultRenderer(props),
                ...props,
                activeTreeId: activeTree,
                draggingPosition: draggingPosition,
                draggingItems: draggingItems,
                itemHeight: itemHeight,
                setActiveTree: (treeId) => {
                    setActiveTree(treeId);
                },
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
                    const height =
                        document.querySelector<HTMLElement>(`[data-rvt-item='${treeId}']`)?.offsetHeight ?? 5;
                    setItemHeight(height);
                },
                onDragAtPosition: (position) => {
                    setDraggingPosition(position);
                },
            }}
        >
            {props.children}
        </VirtualTreeContext.Provider>
    );
};
