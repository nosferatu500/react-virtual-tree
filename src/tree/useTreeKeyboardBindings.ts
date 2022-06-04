import { useCallback } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useLinearItems } from "../controlledEnvironment/useLinearItems";
import { useHotkey } from "../hotkeys/useHotkey";
import { useKey } from "../hotkeys/useKey";
import { useTree } from "./Tree";
import { useMoveFocusToIndex } from "./useMoveFocusToIndex";
import { useSelectUpTo } from "./useSelectUpTo";
import { useViewState } from "./useViewState";

export const useTreeKeyboardBindings = () => {
    const environment = useTreeEnvironment();
    const { treeId, setRenamingItem, setSearch, renamingItem } = useTree();
    const linearItems = useLinearItems(treeId);
    const viewState = useViewState();
    const moveFocusToIndex = useMoveFocusToIndex();
    const selectUpTo = useSelectUpTo();

    const isActiveTree = environment.activeTreeId === treeId;
    const isRenaming = !!renamingItem;

    useKey(
        "arrowdown",
        useCallback(
            (e) => {
                e.preventDefault();
                const newFocusItem = moveFocusToIndex((currentIndex) => currentIndex + 1);

                if (e.shiftKey) {
                    selectUpTo(newFocusItem);
                }
            },
            [moveFocusToIndex, selectUpTo]
        ),
        isActiveTree && !isRenaming
    );

    useKey(
        "arrowup",
        useCallback(
            (e) => {
                e.preventDefault();

                const newFocusItem = moveFocusToIndex((currentIndex) => currentIndex - 1);

                if (e.shiftKey) {
                    selectUpTo(newFocusItem);
                }
            },
            [moveFocusToIndex, selectUpTo]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "moveFocusToFirstItem",
        useCallback(
            (e) => {
                e.preventDefault();
                moveFocusToIndex(() => 0);
            },
            [moveFocusToIndex]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "moveFocusToLastItem",
        useCallback(
            (e) => {
                e.preventDefault();
                moveFocusToIndex((currentIndex, linearItems) => linearItems.length - 1);
            },
            [moveFocusToIndex]
        ),
        isActiveTree && !isRenaming
    );

    useKey(
        "arrowright",
        useCallback(
            (e) => {
                e.preventDefault();
                moveFocusToIndex((currentIndex, linearItems) => {
                    const item = environment.items[linearItems[currentIndex].item];
                    if (item.hasChildren) {
                        if (viewState.expandedItems?.includes(item.index)) {
                            return currentIndex + 1;
                        }
                        environment.onExpandItem?.(item, treeId);
                    }
                    return currentIndex;
                });
            },
            [environment, moveFocusToIndex, treeId, viewState.expandedItems]
        ),
        isActiveTree && !isRenaming
    );

    useKey(
        "arrowleft",
        useCallback(
            (e) => {
                e.preventDefault();
                moveFocusToIndex((currentIndex, linearItems) => {
                    const item = environment.items[linearItems[currentIndex].item];
                    const itemDepth = linearItems[currentIndex].depth;
                    if (item.hasChildren && viewState.expandedItems?.includes(item.index)) {
                        environment.onCollapseItem?.(item, treeId);
                    } else if (itemDepth > 0) {
                        let parentIndex = currentIndex;
                        for (parentIndex; linearItems[parentIndex].depth !== itemDepth - 1; parentIndex--);
                        return parentIndex;
                    }
                    return currentIndex;
                });
            },
            [environment, moveFocusToIndex, treeId, viewState.expandedItems]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "primaryAction",
        useCallback(
            (e) => {
                e.preventDefault();
                if (viewState.focusedItem !== undefined) {
                    environment.onSelectItems?.([viewState.focusedItem], treeId);
                    environment.onPrimaryAction?.(environment.items[viewState.focusedItem], treeId);
                }
            },
            [environment, treeId, viewState.focusedItem]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "toggleSelectItem",
        useCallback(
            (e) => {
                e.preventDefault();
                if (viewState.focusedItem !== undefined) {
                    if (viewState.selectedItems && viewState.selectedItems.includes(viewState.focusedItem)) {
                        environment.onSelectItems?.(
                            viewState.selectedItems.filter((item) => item !== viewState.focusedItem),
                            treeId
                        );
                    } else {
                        environment.onSelectItems?.(
                            [...(viewState.selectedItems ?? []), viewState.focusedItem],
                            treeId
                        );
                    }
                }
            },
            [environment, treeId, viewState.focusedItem, viewState.selectedItems]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "selectAll",
        useCallback(
            (e) => {
                e.preventDefault();
                environment.onSelectItems?.(
                    linearItems.map(({ item }) => item),
                    treeId
                );
            },
            [environment, linearItems, treeId]
        ),
        isActiveTree && !isRenaming
    );

    useHotkey(
        "renameItem",
        useCallback(
            (e) => {
                if (viewState.focusedItem !== undefined) {
                    e.preventDefault();
                    const item = environment.items[viewState.focusedItem];
                    environment.onStartRenamingItem?.(item, treeId);
                    setRenamingItem(item.index);
                }
            },
            [environment, setRenamingItem, treeId, viewState.focusedItem]
        ),
        isActiveTree && (environment.canRename ?? true) && !isRenaming
    );

    useHotkey(
        "startSearch",
        useCallback(
            (e) => {
                e.preventDefault();
                setSearch("");
                (document.querySelector('[data-rct-search-input="true"]') as any)?.focus?.();
            },
            [setSearch]
        ),
        isActiveTree && !isRenaming
    );
};
