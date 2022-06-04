import { useCallback, useEffect, useMemo, useState } from "react";
import { useRenderers } from "../renderers/useRenderers";
import { getItemsLinearly } from "../tree/getItemsLinearly";
import { scrollIntoView } from "../tree/scrollIntoView";
import {
    ControlledTreeEnvironmentProps,
    DraggingPosition,
    LinearItem,
    TreeChangeHandlers,
    TreeConfiguration,
    TreeEnvironmentContextProps,
    TreeItem,
} from "../types";
import { useStableHandler } from "../use-stable-handler";
import { useRefCopy } from "../useRefCopy";
import { buildMapForTrees } from "../utils";

export const useControlledTreeEnvironmentProps = ({
    onExpandItem: onExpandItemProp,
    onCollapseItem: onCollapseProp,
    onDrop: onDropProp,
    ...props
}: ControlledTreeEnvironmentProps): TreeEnvironmentContextProps => {
    const [trees, setTrees] = useState<Record<string, TreeConfiguration>>({});
    const [linearItems, setLinearItems] = useState<Record<string, LinearItem[]>>({});
    const [activeTreeId, setActiveTreeId] = useState<string>();

    const viewStateRef = useRefCopy(props.viewState);

    const treeIds = useMemo(() => Object.keys(trees), [trees]);

    const { onFocusItem, autoFocus, onRegisterTree, onUnregisterTree, items } = props;

    const onFocusItemRef = useRefCopy(onFocusItem);

    const updateLinearItems = useStableHandler(() => {
        setTimeout(() => {
            setLinearItems(
                buildMapForTrees(treeIds, (treeId) =>
                    getItemsLinearly(trees[treeId].rootItem, viewStateRef.current[treeId] ?? {}, items)
                )
            );
        });
    });
    useEffect(() => updateLinearItems(), [items, treeIds, updateLinearItems]);

    const onFocusItemHandler = useCallback<Required<TreeChangeHandlers>["onFocusItem"]>(
        (item, treeId) => {
            if (viewStateRef.current[treeId]?.focusedItem === item.index) {
                return;
            }

            onFocusItemRef.current?.(item, treeId);
            const newItem = document.querySelector(`[data-rct-tree="${treeId}"] [data-rct-item-id="${item.index}"]`);

            if (autoFocus ?? true) {
                if (document.activeElement?.attributes.getNamedItem("data-rct-search-input")?.value !== "true") {
                    // Move DOM focus to item if the current focus is not on the search input
                    (newItem as HTMLElement)?.focus?.();
                } else {
                    // Otherwise just manually scroll into view
                    scrollIntoView(newItem);
                }
            }
        },
        [autoFocus, onFocusItemRef, viewStateRef]
    );

    const registerTree = useCallback(
        (tree: TreeConfiguration) => {
            setTrees((trees) => ({ ...trees, [tree.treeId]: tree }));
            onRegisterTree?.(tree);
            updateLinearItems();
        },
        [onRegisterTree, updateLinearItems]
    );

    const unregisterTree = useCallback(
        (treeId: string) => {
            onUnregisterTree?.(trees[treeId]);
            delete trees[treeId];
            setTrees(trees);
        },
        [onUnregisterTree, trees]
    );

    const onCollapseItem = useCallback(
        (item: TreeItem, treeId: string) => {
            onCollapseProp?.(item, treeId);
            updateLinearItems();
        },
        [onCollapseProp, updateLinearItems]
    );

    const onExpandItem = useCallback(
        (item: TreeItem, treeId: string) => {
            onExpandItemProp?.(item, treeId);
            updateLinearItems();
        },
        [onExpandItemProp, updateLinearItems]
    );

    const onDrop = useCallback(
        (items: TreeItem[], target: DraggingPosition) => {
            onDropProp?.(items, target);
            updateLinearItems();
        },
        [onDropProp, updateLinearItems]
    );

    const setActiveTree = useCallback(
        (treeIdOrSetStateFunction: any, autoFocusTree = true) => {
            const focusTree = (treeId: string | undefined) => {
                if (
                    autoFocusTree &&
                    (autoFocus ?? true) &&
                    treeId &&
                    !document.querySelector(`[data-rct-tree="${treeId}"]`)?.contains(document.activeElement)
                ) {
                    const focusItem = document.querySelector(
                        `[data-rct-tree="${treeId}"] [data-rct-item-focus="true"]`
                    );
                    (focusItem as HTMLElement)?.focus?.();
                }
            };

            if (typeof treeIdOrSetStateFunction === "function") {
                setActiveTreeId((oldValue) => {
                    const treeId = treeIdOrSetStateFunction(oldValue);

                    if (treeId !== oldValue) {
                        focusTree(treeId);
                    }

                    return treeId;
                });
            } else {
                const treeId = treeIdOrSetStateFunction;
                setActiveTreeId(treeId);
                focusTree(treeId);
            }
        },
        [autoFocus]
    );

    const renderers = useRenderers(props);

    return {
        ...renderers,
        ...props,
        onFocusItem: onFocusItemHandler,
        registerTree,
        unregisterTree,
        onExpandItem,
        onCollapseItem,
        onDrop,
        setActiveTree,
        treeIds,
        trees,
        activeTreeId,
        linearItems,
    };
};
