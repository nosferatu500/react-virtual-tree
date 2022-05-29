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

export const getItemsLinearly = <T>(
    rootItem: TreeItemIndex,
    viewState: IndividualTreeViewState,
    items: Record<TreeItemIndex, TreeItem<T>>,
    depth = 0
): Array<{ item: TreeItemIndex; depth: number }> => {
    let itemIds: Array<{ item: TreeItemIndex; depth: number }> = [];

    for (const itemId of items[rootItem].children ?? []) {
        const item = items[itemId];
        itemIds.push({ item: itemId, depth: depth });
        if (item.children.length > 0 && !!item.children && viewState.expandedItems?.includes(itemId)) {
            itemIds.push(...getItemsLinearly(itemId, viewState, items, depth + 1));
        }
    }

    return itemIds;
};

export const createTreeItemRenderContext = <T>(
    item: TreeItem<T>,
    context: VirtualTreeContextProps,
    treeId: string
): TreeItemRenderContext => {
    const viewState = context.viewState[treeId];

    const canDrag =
        (viewState?.selectedItems?.length ?? 0) > 0
            ? viewState?.selectedItems?.map((item) => context.items[item]?.canMove).reduce((a, b) => a && b, true) ??
              false
            : item.canMove;

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
        startDragging: () => {
            let selectedItems = viewState?.selectedItems ?? [];

            if (!selectedItems.includes(item.index)) {
                selectedItems = [item.index];
                context.onSelectItems?.(selectedItems, treeId);
            }

            if (canDrag) {
                context.onStartDragItems(
                    selectedItems.map((id) => context.items[id]),
                    treeId
                );
            }
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
            if (e.ctrlKey) {
                if (renderContext.isSelected) {
                    actions.unselectItem();
                } else {
                    actions.addToSelectedItems();
                }
            } else {
                if (item.children.length > 0) {
                    actions.toggleExpandedState();
                }
                actions.selectItem();
            }
        },
        onDoubleClick: () => {
            if (item.children.length > 0) {
                // actions.toggleExpandedState();
            } else {
                context.onPrimaryAction?.(item, treeId);
            }
            // actions.selectItem();
        },
        draggable: canDrag,
        onDragStart: (e) => {
            e.dataTransfer.dropEffect = "copy";
            actions.startDragging();
        },
        onDragOver: (e) => {
            e.preventDefault(); // Allow drop
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

export const createTreeItemRenderContextDependencies = <T>(
    item: TreeItem<T> | undefined,
    context: VirtualForestProps,
    treeId: string
) => [
    context,
    context.viewState[treeId]?.expandedItems,
    context.viewState[treeId]?.selectedItems,
    item?.index ?? "___no_item",
    treeId,
];

export const createTreeInformation = <T>(context: VirtualTreeContextProps, treeId: string): TreeMeta => ({
    isFocused: context.activeTreeId === treeId,
    isRenaming: context.viewState[treeId]?.renamingItem !== undefined,
    areItemsSelected: (context.viewState[treeId]?.selectedItems?.length ?? 0) > 0,
});

export const createTreeInformationDependencies = <T>(context: VirtualTreeContextProps, treeId: string) => [
    context.activeTreeId,
    context.viewState[treeId]?.renamingItem,
    context.viewState[treeId]?.selectedItems,
    treeId,
];
