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

    const viewState = props.viewState;

    // Make sure that every tree view state has a focused item
    for (const treeId of Object.keys(trees)) {
        if (!viewState[treeId]?.focusedItem && trees[treeId]) {
            viewState[treeId] = {
                ...viewState[treeId],
                focusedItem: props.items[trees[treeId].rootItem]?.children?.[0],
            };
        }
    }

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
                onFocusItem: (item, treeId) => {
                    props.onFocusItem?.(item, treeId);
                    const newItem = document.querySelector(
                        `[data-rvt-tree="${treeId}"] [data-rvt-item-id="${item.index}"]`
                    );
                    (newItem as HTMLElement)?.focus?.();
                },
                setActiveTree: (treeId) => {
                    setActiveTree(treeId);

                    if (!document.querySelector(`[data-rvt-tree="${treeId}"]`)?.contains(document.activeElement)) {
                        const focusItem = document.querySelector(
                            `[data-rvt-tree="${treeId}"] [data-rvt-item-focus="true"]`
                        );
                        (focusItem as HTMLElement)?.focus?.();
                    }
                },
                addTree: (tree) => {
                    setTrees((trees) => ({ ...trees, [tree.treeId]: tree }));
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
                        document.querySelector<HTMLElement>(
                            `[data-rvt-tree="${treeId}"] [data-rvt-item-container="true"]`
                        )?.offsetHeight ?? 5;
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
