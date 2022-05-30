import React, { ButtonHTMLAttributes, HTMLProps, InputHTMLAttributes, PropsWithChildren } from "react";

export type TreeItemIndex = string | number;

export type TreeItem<T = any> = {
    index: TreeItemIndex;
    data: T;
    children: Array<TreeItemIndex>;
    canMove?: boolean;
};

type TreePosition = {
    treeId: string;
    parent: TreeItemIndex;
    index: number;
};

export type TreeItemActions = {
    expandItem: () => void;
    collapseItem: () => void;
    toggleExpandedState: () => void;
    selectItem: () => void;
    unselectItem: () => void;
    addToSelectedItems: () => void;
    startDragging: () => void;
};

export type TreeItemRenderFlags = {
    isSelected?: boolean;
    isExpanded?: boolean;
    isFocused?: boolean;
    isRenaming?: boolean;
    isDraggingOver?: boolean;
    isDraggingOverParent?: boolean;
};

export type TreeItemRenderContext = {
    elementProps: HTMLProps<any>;
    itemContainerProps: HTMLProps<any>;
} & TreeItemActions &
    TreeItemRenderFlags;

export type TreeMeta = {
    areItemsSelected?: boolean;
    isRenaming?: boolean;
    isFocused?: boolean;
};

export type TreeRenderProps<T = any> = {
    renderItem?: (
        item: TreeItem<T>,
        depth: number,
        children: React.ReactNode | null,
        context: TreeItemRenderContext,
        meta: TreeMeta
    ) => React.ReactNode;
    renderItemTitle: (item: TreeItem<T>, context: TreeItemRenderContext) => string;
    renderRenameInput?: (
        item: TreeItem<T>,
        inputProps: Partial<InputHTMLAttributes<HTMLInputElement>>,
        submitButtonProps: Partial<ButtonHTMLAttributes<HTMLButtonElement>>
    ) => React.ReactNode;
    renderDraggingItem?: (items: Array<TreeItem<T>>) => React.ReactNode;
    renderDraggingItemTitle?: (items: Array<TreeItem<T>>) => React.ReactNode;
    renderDepthOffset?: number;
    renderTreeContainer?: (
        children: React.ReactNode,
        containerProps: HTMLProps<any>,
        meta: TreeMeta
    ) => React.ReactNode;
    renderDragBetweenLine?: (draggingPosition: DraggingPosition) => React.ReactNode;
};

type TreeCapabilities = {
    selectItemOnClick?: boolean;
};

export type IndividualTreeViewState = {
    renamingItem?: TreeItemIndex;
    selectedItems?: TreeItemIndex[];
    expandedItems?: TreeItemIndex[];
    untruncatedItems?: TreeItemIndex[];
    focusedItem?: TreeItemIndex;
};

type TreeViewState = {
    [treeId: string]: IndividualTreeViewState | undefined;
};

export type DataSource<T = any> = {
    items: Record<TreeItemIndex, TreeItem<T>>;
};

type ImplicitDataSource<T = any> = {
    dataProvider: TreeDataProvider<T>;
};

type TreeChangeHandlers<T = any> = {
    onStartRenamingItem?: (item: TreeItem<T>, treeId: string) => void;
    onCollapseItem?: (item: TreeItem<T>, treeId: string) => void;
    onExpandItem?: (item: TreeItem<T>, treeId: string) => void;
    onRenameItem?: (item: TreeItem<T>, name: string, treeId: string) => void;
    onSelectItems?: (items: TreeItemIndex[], treeId: string) => void;
    onDrop?: (items: TreeItem<T>[], target: DraggingPosition) => void;
    onPrimaryAction?: (items: TreeItem<T>, treeId: string) => void;
    onAddTree?: (tree: Tree) => void;
    onRemoveTree?: (tree: Tree) => void;
    onMissingItems?: (itemIds: TreeItemIndex[]) => void;
};

export type VirtualForestProps<T = any> = {
    viewState: TreeViewState;
} & TreeRenderProps<T> &
    TreeCapabilities &
    TreeChangeHandlers<T> &
    DataSource<T>;

export type VirtualTreeContextProps<T = any> = {
    activeTreeId?: string;
    draggingItems?: TreeItem<T>[];
    draggingPosition?: DraggingPosition;
    itemHeight: number;
    addTree: (tree: Tree<T>) => void;
    removeTree: (treeId: string) => void;
    setActiveTree: (treeId: string | undefined) => void;
    onStartDragItems: (items: TreeItem<T>[], treeId: string) => void;
    onDragAtPosition: (position: DraggingPosition | undefined) => void;
} & VirtualForestProps<T> &
    Required<TreeRenderProps<T>>;

export type DraggingPosition = {
    treeId: string;
    parentItem: TreeItemIndex;
    linearIndex?: number;
    depth: number;
} & (
    | {
          targetType: "item";
          targetItem: TreeItemIndex;
      }
    | {
          targetType: "between-items";
          childIndex: number;
          linePosition: "top" | "bottom";
      }
);

export type VirtualForestWrapperProps<T = any> = PropsWithChildren<
    {
        viewState: TreeViewState;
    } & TreeRenderProps<T> &
        TreeCapabilities &
        ImplicitDataSource<T>
>;

export type Tree<T = any> = {
    treeId: string;
    rootItem: string;
};

export type TreeProps<T = any> = Tree<T> & Partial<TreeRenderProps<T>>;

export type Disposable = {
    dispose: () => void;
};

export type TreeDataProvider<T = any> = {
    componentDidUpdate?: (listener: (changedItemIds: TreeItemIndex[]) => void) => Disposable;
    getItem: (itemId: TreeItemIndex) => Promise<TreeItem>;
    getItems?: (itemIds: TreeItemIndex[]) => Promise<TreeItem[]>;
    onRenameItem?: (item: TreeItem<T>, name: string) => Promise<void>;
    onChangeItemChildren?: (itemId: TreeItemIndex, newChildren: TreeItemIndex[]) => Promise<void>;
};

export type KeyboardBindings = Partial<{
    moveFocusUp: string[];
    moveFocusDown: string[];
    expandItem: string[];
    collapseItem: string[];
    primaryAction: string[];
    moveFocusToFirstItem: string[];
    moveFocusToLastItem: string[];
    expandSiblings: string[];
    renameItem: string[];
    toggleSelectItem: string[];
    startMovingItems: string[];
    completeMovingItems: string[];
    abortMovingItems: string[];
}>;
