import { IndividualTreeViewState, TreeItem, TreeItemIndex } from "../types";

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
