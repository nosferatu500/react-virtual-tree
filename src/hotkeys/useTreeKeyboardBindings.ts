import { useContext } from "react";
import { useMoveFocusToIndex } from "../hooks/useMoveFocusToIndex";
import { useViewState } from "../hooks/useViewState";
import { TreeContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";
import { useHotkey } from "./useHotkey";
import { useKey } from "./useKey";

export const useTreeKeyboardBindings = (containerRef?: HTMLElement | HTMLDivElement | null) => {
    const viewState = useViewState();
    const { treeId } = useContext(TreeContext);
    const context = useContext(VirtualTreeContext);
    const moveFocusToIndex = useMoveFocusToIndex(containerRef);

    const isActiveTree = context.activeTreeId === treeId;

    useKey(
        "arrowdown",
        (e) => {
            e.preventDefault();
            moveFocusToIndex((currentIndex) => currentIndex + 1);
        },
        isActiveTree
    );

    useKey(
        "arrowup",
        (e) => {
            e.preventDefault();
            moveFocusToIndex((currentIndex) => currentIndex - 1);
        },
        isActiveTree
    );

    useHotkey(
        "moveFocusToFirstItem",
        (e) => {
            e.preventDefault();
            moveFocusToIndex(() => 0);
        },
        isActiveTree
    );

    useHotkey(
        "moveFocusToLastItem",
        (e) => {
            e.preventDefault();
            moveFocusToIndex((currentIndex, linearItems) => linearItems.length - 1);
        },
        isActiveTree
    );

    useKey(
        "arrowright",
        (e) => {
            e.preventDefault();
            moveFocusToIndex((currentIndex, linearItems) => {
                const item = context.items[linearItems[currentIndex].item];
                if (item.isFolder) {
                    if (viewState.expandedItems?.includes(item.index)) {
                        return currentIndex + 1;
                    } else {
                        context.onExpandItem?.(item, treeId);
                    }
                }
                return currentIndex;
            });
        },
        isActiveTree
    );

    useKey(
        "arrowleft",
        (e) => {
            e.preventDefault();
            moveFocusToIndex((currentIndex, linearItems) => {
                const item = context.items[linearItems[currentIndex].item];
                const itemDepth = linearItems[currentIndex].depth;
                if (item.isFolder && viewState.expandedItems?.includes(item.index)) {
                    context.onCollapseItem?.(item, treeId);
                } else if (itemDepth > 0) {
                    let parentIndex = currentIndex;
                    for (parentIndex; linearItems[parentIndex].depth !== itemDepth - 1; parentIndex--);
                    return parentIndex;
                }
                return currentIndex;
            });
        },
        isActiveTree
    );

    useHotkey(
        "primaryAction",
        (e) => {
            e.preventDefault();
            if (viewState.focusedItem) {
                context.onSelectItems?.([viewState.focusedItem], treeId);
                context.onPrimaryAction?.(context.items[viewState.focusedItem], treeId);
            }
        },
        isActiveTree
    );

    useHotkey(
        "toggleSelectItem",
        (e) => {
            e.preventDefault();
            if (viewState.focusedItem) {
                if (viewState.selectedItems && viewState.selectedItems.includes(viewState.focusedItem)) {
                    context.onSelectItems?.(
                        viewState.selectedItems.filter((item) => item !== viewState.focusedItem),
                        treeId
                    );
                } else {
                    context.onSelectItems?.([...(viewState.selectedItems ?? []), viewState.focusedItem], treeId);
                }
            }
        },
        isActiveTree
    );

    useHotkey(
        "moveItems",
        (e) => {
            e.preventDefault();
            const selectedItems =
                viewState.selectedItems?.length ?? 0 > 0
                    ? viewState.selectedItems
                    : Object.values(context.viewState).find((state) => state?.selectedItems?.length ?? 0 > 0)
                          ?.selectedItems ?? null;

            if (selectedItems) {
                // TODO move
            }
        },
        isActiveTree
    );
};
