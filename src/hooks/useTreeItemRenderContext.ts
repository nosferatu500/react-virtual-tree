import { HTMLProps, useMemo } from "react";
import { defaultMatcher } from "../search/defaultMatcher";
import {
    TreeItem,
    TreeItemActions,
    TreeItemIndex,
    TreeItemRenderContext,
    TreeItemRenderFlags,
    VirtualForestProps,
    VirtualTreeContextProps,
} from "../types";
import { getItemsLinearly } from "../utils";
import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";

const createTreeItemRenderContext = (
    item: TreeItem,
    context: VirtualTreeContextProps,
    treeId: string,
    isSearchMatching: boolean,
    renamingItem: TreeItemIndex | null,
    rootItem: string
): TreeItemRenderContext => {
    const viewState = context.viewState[treeId];

    const actions: TreeItemActions = {
        primaryAction: () => {
            context.onPrimaryAction?.(context.items[item.index], treeId);
        },
        collapseItem: () => {
            context.onCollapseItem?.(item, treeId);
        },
        expandItem: () => {
            context.onExpandItem?.(item, treeId);
        },
        toggleExpandedState: () => {
            if (viewState?.expandedItems?.includes(item.index)) {
                context.onCollapseItem?.(item, treeId);
            } else {
                context.onExpandItem?.(item, treeId);
            }
        },
        selectItem: () => {
            context.onSelectItems?.([item.index], treeId);
        },
        addToSelectedItems: () => {
            context.onSelectItems?.([...(viewState?.selectedItems ?? []), item.index], treeId);
        },
        unselectItem: () => {
            context.onSelectItems?.(viewState?.selectedItems?.filter((id) => id !== item.index) ?? [], treeId);
        },
        focusItem: () => {
            context.onFocusItem?.(item, treeId);
        },
        selectUpTo: () => {
            if (viewState && viewState.selectedItems && viewState.selectedItems.length > 0) {
                const linearItems = getItemsLinearly(rootItem, viewState, context.items);
                const selectionStart = linearItems.findIndex((linearItem) =>
                    viewState.selectedItems?.includes(linearItem.item)
                );
                const selectionEnd = linearItems.findIndex((linearItem) => linearItem.item === item.index);

                if (selectionStart < selectionEnd) {
                    const selection = linearItems.slice(selectionStart, selectionEnd + 1).map(({ item }) => item);
                    context.onSelectItems?.([...(viewState?.selectedItems ?? []), ...selection], treeId);
                } else {
                    const selection = linearItems.slice(selectionEnd, selectionStart).map(({ item }) => item);
                    context.onSelectItems?.([...(viewState?.selectedItems ?? []), ...selection], treeId);
                }
            } else {
                actions.selectItem();
            }
        },
    };

    const renderContext: TreeItemRenderFlags = {
        isSelected: viewState?.selectedItems?.includes(item.index),
        isExpanded: viewState?.expandedItems?.includes(item.index),
        isFocused: viewState?.focusedItem === item.index,
        isRenaming: renamingItem === item.index,
        isDraggingOver:
            context.draggingPosition &&
            context.draggingPosition.targetType === "item" &&
            context.draggingPosition.targetItem === item.index &&
            context.draggingPosition.treeId === treeId,
        isDraggingOverParent: false,
        isSearchMatching,
    };

    const elementProps: HTMLProps<HTMLElement> = {
        onClick: (e) => {
            actions.focusItem();
            if (e.shiftKey) {
                actions.selectUpTo();
                // TODO: isWindows
            } else if (e.ctrlKey || e.metaKey) {
                if (renderContext.isSelected) {
                    actions.unselectItem();
                } else {
                    actions.addToSelectedItems();
                }
            } else {
                if (item.isFolder) {
                    actions.toggleExpandedState();
                }
                actions.selectItem();

                if (!item.isFolder || context.canInvokePrimaryActionOnItemContainer) {
                    actions.primaryAction();
                }
            }

            if (context.onClick) {
                context.onClick(item);
            }
        },
        onDoubleClick: () => {
            if (item.isFolder) {
                // actions.toggleExpandedState();
            } else {
                context.onPrimaryAction?.(item, treeId);
            }
            // actions.selectItem();
        },
        onFocus: () => {
            actions.focusItem();
        },
        role: "treeitem",
        "aria-expanded": item.isFolder ? (renderContext.isExpanded ? "true" : "false") : undefined,
        tabIndex: !renderContext.isRenaming ? (renderContext.isFocused ? 0 : -1) : undefined,
        ...({
            "data-rvt-item-interactive": true,
            "data-rvt-item-focus": renderContext.isFocused ? "true" : "false",
            "data-rvt-item-id": item.index,
        } as any),
    };

    const itemContainerWithoutChildrenProps: HTMLProps<HTMLElement> = {
        ...({
            "data-rvt-item-container": "true",
        } as any),
    };

    const itemContainerWithChildrenProps: HTMLProps<HTMLElement> = {
        role: "none",
    };

    const arrowProps: HTMLProps<HTMLElement> = {
        onClick: (e) => {
            if (item.isFolder) {
                actions.toggleExpandedState();
            }
            actions.selectItem();
        },
        onFocus: () => {
            actions.focusItem();
        },
        onDragOver: (e) => {
            e.preventDefault(); // Allow drop
        },
        "aria-hidden": true,
        tabIndex: -1,
        // TODO alternative interaction modes
    };

    return {
        ...actions,
        ...renderContext,
        elementProps,
        itemContainerWithoutChildrenProps,
        itemContainerWithChildrenProps,
        arrowProps,
    };
};

const createTreeItemRenderContextDependencies = (
    item: TreeItem | undefined,
    context: VirtualForestProps,
    treeId: string,
    isSearchMatching: boolean,
    renamingItem: TreeItemIndex | null
) => [
    context,
    context.viewState[treeId]?.expandedItems,
    context.viewState[treeId]?.selectedItems,
    renamingItem && renamingItem === item?.index,
    item?.index ?? "___no_item",
    treeId,
    isSearchMatching,
];

export const useTreeItemRenderContext = (item?: TreeItem) => {
    const { treeId, search, rootItem, renamingItem } = useTreeContext();
    const context = useVirtualTreeContext();
    const itemTitle = item && context.getItemTitle(item);

    const isSearchMatching = useMemo(() => {
        return search === null || search.length === 0 || !item || !itemTitle
            ? false
            : (context.doesSearchMatchItem ?? defaultMatcher)(search, item, itemTitle);
    }, [search, itemTitle]);

    return useMemo(
        () => item && createTreeItemRenderContext(item, context, treeId, isSearchMatching, renamingItem, rootItem),
        createTreeItemRenderContextDependencies(item, context, treeId, isSearchMatching, renamingItem)
    );
};
