import React, { PropsWithChildren, useContext, useEffect, useImperativeHandle, useState } from "react";
import { InteractionManagerProvider } from "./interaction/InteractionManagerProvider";
import { createDefaultRenderer } from "./renderers/defaultRender";
import { DraggingPosition, Tree, TreeItem, VirtualForestProps, VirtualTreeContextProps } from "./types";
import { scrollIntoView } from "./utils";

export const VirtualTreeContext = React.createContext<VirtualTreeContextProps>(null as any);

export const useVirtualTreeContext = () => useContext(VirtualTreeContext);

export const VirtualForest = React.forwardRef<VirtualTreeContextProps, PropsWithChildren<VirtualForestProps>>(
    (props, ref) => {
        const [trees, setTrees] = useState<Record<string, Tree>>({});
        const [draggingItems, setDraggingItems] = useState<TreeItem[]>();
        const [draggingPosition, setDraggingPosition] = useState<DraggingPosition>();
        const [activeTreeId, setActiveTreeId] = useState<string>();
        const [itemHeight, setItemHeight] = useState(4);

        const { viewState } = props;

        // Make sure that every tree view state has a focused item
        for (const treeId of Object.keys(trees)) {
            if (!viewState[treeId]?.focusedItem && trees[treeId]) {
                viewState[treeId] = {
                    ...viewState[treeId],
                    focusedItem: props.items[trees[treeId].rootItem]?.children?.[0],
                };
            }
        }

        const onFocusHandler: typeof props.onFocusItem = (item, treeId) => {
            props.onFocusItem?.(item, treeId);
            const newItem = document.querySelector(`[data-rvt-tree="${treeId}"] [data-rvt-item-id="${item.index}"]`);

            if (document.activeElement?.attributes.getNamedItem("data-rvt-search-input")?.value !== "true") {
                // Move DOM focus to item if the current focus is not on the search input
                (newItem as HTMLElement)?.focus?.();
            } else {
                // Otherwise just manually scroll into view
                scrollIntoView(newItem);
            }
        };

        useEffect(() => {
            const dragEndEventListener = () => {
                setDraggingPosition(undefined);
                setDraggingItems(undefined);

                if (draggingItems && draggingPosition && props.onDrop) {
                    props.onDrop(draggingItems, draggingPosition);

                    requestAnimationFrame(() => {
                        onFocusHandler(draggingItems[0], draggingPosition.treeId);
                    });
                }
            };

            window.addEventListener("dragend", dragEndEventListener);

            return () => {
                window.removeEventListener("dragend", dragEndEventListener);
            };
        }, [draggingPosition, draggingItems, props.onDrop]);

        const environmentContextProps: VirtualTreeContextProps = {
            ...createDefaultRenderer(props),
            ...props,
            onFocusItem: onFocusHandler,
            addTree: (tree) => {
                setTrees((trees) => ({ ...trees, [tree.treeId]: tree }));
                props.onRegisterTree?.(tree);
            },
            removeTree: (treeId) => {
                props.onUnregisterTree?.(trees[treeId]);
                delete trees[treeId];
                setTrees(trees);
            },
            onStartDragItems: (items, treeId) => {
                setDraggingItems(items);
                const height =
                    document.querySelector<HTMLElement>(`[data-rvt-tree="${treeId}"] [data-rvt-item-container="true"]`)
                        ?.offsetHeight ?? 5;
                setItemHeight(height);
            },
            onDragAtPosition: (position) => {
                setDraggingPosition(position);
            },
            setActiveTree: (treeId) => {
                setActiveTreeId(treeId);

                if (!document.querySelector(`[data-rvt-tree="${treeId}"]`)?.contains(document.activeElement)) {
                    const focusItem = document.querySelector(
                        `[data-rvt-tree="${treeId}"] [data-rvt-item-focus="true"]`
                    );
                    (focusItem as HTMLElement)?.focus?.();
                }
            },
            treeIds: Object.keys(trees),
            draggingPosition,
            activeTreeId,
            draggingItems,
            itemHeight,
        };

        useImperativeHandle(ref, () => environmentContextProps);

        return (
            <VirtualTreeContext.Provider value={environmentContextProps}>
                <InteractionManagerProvider>{props.children}</InteractionManagerProvider>
            </VirtualTreeContext.Provider>
        );
    }
);
