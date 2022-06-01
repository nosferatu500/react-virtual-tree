import { HTMLProps } from "react";
import {
    IndividualTreeViewState,
    VirtualForestProps,
    TreeItem,
    TreeItemActions,
    TreeItemIndex,
    TreeItemRenderContext,
    TreeItemRenderFlags,
    VirtualTreeContextProps,
    TreeMeta,
} from "../types";

export const classnames = (...classNames: (string | boolean | undefined)[]) => classNames.filter(Boolean).join(" ");

export const getItemsLinearly = (
    rootItem: TreeItemIndex,
    viewState: IndividualTreeViewState,
    items: Record<TreeItemIndex, TreeItem>,
    depth = 0
): Array<{ item: TreeItemIndex; depth: number }> => {
    let itemIds: Array<{ item: TreeItemIndex; depth: number }> = [];

    for (const itemId of items[rootItem].children ?? []) {
        const item = items[itemId];
        itemIds.push({ item: itemId, depth: depth });
        if (item.isFolder && !!item.children && viewState.expandedItems?.includes(itemId)) {
            itemIds.push(...getItemsLinearly(itemId, viewState, items, depth + 1));
        }
    }

    return itemIds;
};

export const createTreeItemRenderContext = (
    item: TreeItem,
    context: VirtualTreeContextProps,
    treeId: string
): TreeItemRenderContext => {
    const viewState = context.viewState[treeId];

    const actions: TreeItemActions = {
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
    };

    const elementProps: HTMLProps<HTMLElement> = {
        onClick: (e) => {
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
    };

    const containerProps: HTMLProps<HTMLElement> = {
        ...({
            ["data-rvt-item"]: treeId,
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
    treeId: string
) => [
    context,
    context.viewState[treeId]?.expandedItems,
    context.viewState[treeId]?.selectedItems,
    item?.index ?? "___no_item",
    treeId,
];

export const createTreeInformation = (context: VirtualTreeContextProps, treeId: string): TreeMeta => ({
    isFocused: context.activeTreeId === treeId,
    isRenaming: context.viewState[treeId]?.renamingItem !== undefined,
    areItemsSelected: (context.viewState[treeId]?.selectedItems?.length ?? 0) > 0,
});

export const createTreeInformationDependencies = (context: VirtualTreeContextProps, treeId: string) => [
    context.activeTreeId,
    context.viewState[treeId]?.renamingItem,
    context.viewState[treeId]?.selectedItems,
    treeId,
];
