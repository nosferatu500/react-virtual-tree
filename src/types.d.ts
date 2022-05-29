import React, { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from 'react';

type TreeItemIndex = string | number;

type TreeItem<T = any> = {
    index: TreeItemIndex;
    data: T;
    children: Array<TreeItemIndex>;
    canMove?: boolean;
}

type TreePosition = {
    treeId: string;
    parent: TreeItemIndex;
    index: number;
}

type TreeItemActions = {
    expandItem: () => void;
    collapseItem: () => void;
    toggleExpandedState: () => void;
    selectItem: () => void;
    unselectItem: () => void;
    addToSelectedItems: () => void;
    startDragging: () => void;
}

type TreeItemRenderFlags = {
    isSelected?: boolean;
    isExpanded?: boolean;
    isFocused?: boolean;
    isRenaming?: boolean;
    isDraggingOver?: boolean;
    isDraggingOverParent?: boolean;
};

type TreeItemRenderContext = {
    elementProps: HTMLProps<any>;
    containerProps: HTMLProps<any>;

} & TreeItemActions & TreeItemRenderFlags;

type TreeRenderProps<T = any> = {
    renderItem?: (item: TreeItem<T>, depth: number, context: TreeItemRenderContext) => React.ReactNode;
    renderItemTitle: (item: TreeItem<T>, context: TreeItemRenderContext) => string;
    renderRenameInput?: (item: TreeItem<T>, inputProps: Partial<InputHTMLAttributes<HTMLInputElement>>, submitButtonProps: Partial<ButtonHTMLAttributes<HTMLButtonElement>>) => React.ReactNode;
    renderDraggingItem?: (items: Array<TreeItem<T>>) => React.ReactNode;
    renderDraggingItemTitle?: (items: Array<TreeItem<T>>) => React.ReactNode;
    renderDepthOffset?: number;
    renderTreeContainer?: (children: React.ReactNode, containerProps: HTMLProps<any>) => React.ReactNode;
    renderDragBetweenLine?: (draggingPosition: DraggingPosition) => React.ReactNode;
}

type TreeCapabilities = {
    selectItemOnClick?: boolean;
}

type IndividualTreeViewState = {
    renamingItem?: TreeItemIndex;
    selectedItems?: TreeItemIndex[];
    expandedItems?: TreeItemIndex[];
    untruncatedItems?: TreeItemIndex[];
    focusedItem?: TreeItemIndex;
};

type TreeViewState = {
    [treeId: string]: IndividualTreeViewState;
};

type DataSource<T = any> = {
    items: Record<TreeItemIndex, TreeItem<T>>;
};

type ImplicitDataSource<T = any> = {
    dataProvider: TreeDataProvider<T>;
}

type TreeChangeHandlers<T = any> = {
    onStartRenamingItem?: (item: TreeItem<T>, treeId: string) => void;
    onCollapseItem?: (item: TreeItem<T>, treeId: string) => void;
    onExpandItem?: (item: TreeItem<T>, treeId: string) => void;
    onRenameItem?: (item: TreeItem<T>, name: string, treeId: string) => void;
    onSelectItems?: (items: TreeItemIndex[], treeId: string) => void;
    onDrop?: (items: TreePosition[], target: TreePosition) => void;
    onPrimaryAction?: (items: TreeItem<T>, treeId: string) => void;
    onAddTree?: (tree: Tree) => void;
    onRemoveTree?: (tree: Tree) => void;
    onMissingItems?: (itemIds: TreeItemIndex[]) => void;
};

export type VirtualForestProps<T = any> = {
    viewState: TreeViewState;
} & TreeRenderProps<T> & TreeCapabilities & TreeChangeHandlers<T> & DataSource<T>;

type VirtualTreeContextProps<T = any> = {
    draggingItems?: TreeItem<T>[];
    draggingPosition?: DraggingPosition;
    itemHeight: number;
    addTree: (tree: Tree<T>) => void;
    removeTree: (treeId: string) => void;
    onStartDragItems: (items: TreeItem<T>[], treeId: string) => void;
    onDragAtPosition: (position: DraggingPosition | undefined) => void, // TODO
} & VirtualForestProps<T> & Required<TreeRenderProps<T>>;

export type DraggingPosition = {
    treeId: string;
    targetItem: TreeItemIndex;
    childIndex?: number;
    linearIndex?: number;
    depth: number;
    linePosition?: 'top' | 'bottom';
};

export type VirtualForestWrapperProps<T = any> = PropsWithChildren<{
    viewState: TreeViewState;
} & TreeRenderProps<T> & TreeCapabilities & ImplicitDataSource<T>>;

type Tree<T = any> = {
    treeId: string;
    rootItem: string;
}

export type TreeProps<T = any> = Tree<T> & Partial<TreeRenderProps<T>>;

export type TreeDataProvider<T = any> = {
    componentDidUpdate?: (listener: (changedItemIds: TreeItemIndex[]) => void) => void;
    getItem: (itemId: TreeItemIndex) => Promise<TreeItem>;
    getItems?: (itemIds: TreeItemIndex[]) => Promise<TreeItem[]>;
    onRenameItem?: (item: TreeItem<T>, name: string) => void;
};
