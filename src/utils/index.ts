import { HTMLProps } from "react";
import {
    IndividualTreeViewState,
    TreeItem,
    TreeItemActions,
    TreeItemIndex,
    TreeItemRenderContext,
    TreeItemRenderFlags,
    TreeMeta,
    VirtualForestProps,
    VirtualTreeContextProps,
} from "../types";

export const classnames = (...classNames: (string | boolean | undefined)[]) => classNames.filter(Boolean).join(" ");

export const getItemsLinearly = (
    rootItem: TreeItemIndex,
    viewState: IndividualTreeViewState,
    items: Record<TreeItemIndex, TreeItem>,
    depth = 0
): Array<{ item: TreeItemIndex; depth: number }> => {
    const itemIds: Array<{ item: TreeItemIndex; depth: number }> = [];

    for (const itemId of items[rootItem]?.children ?? []) {
        const item = items[itemId];
        itemIds.push({ item: itemId, depth });
        if (item && item.isFolder && !!item.children && viewState.expandedItems?.includes(itemId)) {
            itemIds.push(...getItemsLinearly(itemId, viewState, items, depth + 1));
        }
    }

    return itemIds;
};

export const scrollIntoView = (element: Element | undefined | null) => {
    if (!element) {
        return;
    }

    if ((element as any).scrollIntoViewIfNeeded) {
        (element as any).scrollIntoViewIfNeeded();
    } else {
        const boundingBox = element.getBoundingClientRect();
        const isElementInViewport =
            boundingBox.top >= 0 &&
            boundingBox.left >= 0 &&
            boundingBox.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            boundingBox.right <= (window.innerWidth || document.documentElement.clientWidth);
        if (!isElementInViewport) {
            element.scrollIntoView();
        }
    }
};

export const createTreeItemRenderContext = (
    item: TreeItem,
    context: VirtualTreeContextProps,
    treeId: string,
    isSearchMatching: boolean
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
    };

    const renderContext: TreeItemRenderFlags = {
        isSelected: viewState?.selectedItems?.includes(item.index),
        isExpanded: viewState?.expandedItems?.includes(item.index),
        isFocused: viewState?.focusedItem === item.index,
        isRenaming: viewState?.renamingItem === item.index,
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
            if (e.ctrlKey || e.metaKey) {
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
        ...({
            "data-rvt-item-interactive": true,
            "data-rvt-item-focus": renderContext.isFocused ? "true" : "false",
            "data-rvt-item-id": item.index,
        } as any),
    };

    const containerProps: HTMLProps<HTMLElement> = {
        ...({
            "data-rvt-item-container": "true",
        } as any),
    };

    return {
        ...actions,
        ...renderContext,
        elementProps,
        itemContainerProps: containerProps,
    };
};

export const createTreeItemRenderContextDependencies = (
    item: TreeItem | undefined,
    context: VirtualForestProps,
    treeId: string,
    isSearchMatching: boolean
) => [
    context,
    context.viewState[treeId]?.expandedItems,
    context.viewState[treeId]?.selectedItems,
    item?.index ?? "___no_item",
    treeId,
    isSearchMatching,
];

export const createTreeMeta = (context: VirtualTreeContextProps, treeId: string, search: string | null): TreeMeta => ({
    isFocused: context.activeTreeId === treeId,
    isRenaming: context.viewState[treeId]?.renamingItem !== undefined,
    areItemsSelected: (context.viewState[treeId]?.selectedItems?.length ?? 0) > 0,
    isSearching: search !== null,
    search,
});

export const createTreeMetaDeps = (context: VirtualTreeContextProps, treeId: string, search: string | null) => [
    context.activeTreeId,
    context.viewState[treeId]?.renamingItem,
    context.viewState[treeId]?.selectedItems,
    treeId,
    search,
];
