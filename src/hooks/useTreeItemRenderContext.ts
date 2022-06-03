import { HTMLProps, useMemo } from "react";
import { defaultMatcher } from "../search/defaultMatcher";
import {
    TreeItem,
    TreeItemActions,
    TreeItemRenderContext,
    TreeItemRenderFlags,
    VirtualForestProps,
    VirtualTreeContextProps,
} from "../types";
import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";

const createTreeItemRenderContext = (
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

    const containerElementProps: HTMLProps<HTMLElement> = {
        ...({
            "data-rvt-item-container": "true",
        } as any),
    };

    return {
        ...actions,
        ...renderContext,
        elementProps,
        itemContainerProps: containerElementProps,
    };
};

const createTreeItemRenderContextDependencies = (
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

export const useTreeItemRenderContext = (item?: TreeItem) => {
    const { treeId, search } = useTreeContext();
    const context = useVirtualTreeContext();
    const itemTitle = item && context.getItemTitle(item);

    const isSearchMatching = useMemo(() => {
        return search === null || search.length === 0 || !item || !itemTitle
            ? false
            : (context.doesSearchMatchItem ?? defaultMatcher)(search, item, itemTitle);
    }, [search, itemTitle]);

    return useMemo(
        () => item && createTreeItemRenderContext(item, context, treeId, isSearchMatching),
        createTreeItemRenderContextDependencies(item, context, treeId, isSearchMatching)
    );
};
