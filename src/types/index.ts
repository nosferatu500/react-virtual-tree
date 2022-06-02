import React, { ButtonHTMLAttributes, HTMLProps, InputHTMLAttributes, PropsWithChildren } from "react";

export type TreeItemIndex = string | number;

export type TreeItem = {
    index: TreeItemIndex;
    title: string;
    isFolder: boolean;
    children: Array<TreeItemIndex>;
    canMove?: boolean;
};

export type TreeItemActions = {
    expandItem: () => void;
    collapseItem: () => void;
    toggleExpandedState: () => void;
    selectItem: () => void;
    unselectItem: () => void;
    addToSelectedItems: () => void;
    focusItem: () => void;
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

export type TreeRenderProps = {
    renderItem?: (
        ref: React.RefObject<HTMLDivElement>,
        item: TreeItem,
        style: any,
        depth: number,
        children: React.ReactNode | null,
        context: TreeItemRenderContext,
        meta: TreeMeta
    ) => React.ReactNode;
    renderItemTitle: (item: TreeItem, context: TreeItemRenderContext) => string;
    renderRenameInput?: (
        item: TreeItem,
        inputProps: Partial<InputHTMLAttributes<HTMLInputElement>>,
        submitButtonProps: Partial<ButtonHTMLAttributes<HTMLButtonElement>>
    ) => React.ReactNode;
    renderDraggingItem?: (items: Array<TreeItem>) => React.ReactNode;
    renderDraggingItemTitle?: (items: Array<TreeItem>) => React.ReactNode;
    renderDepthOffset?: number;
    renderTreeContainer?: (
        ref: React.RefObject<HTMLDivElement>,
        treeId: string,
        children: React.ReactNode,
        meta: TreeMeta
    ) => React.ReactNode;
    renderDragBetweenLine?: (draggingPosition: DraggingPosition, lineProps: HTMLProps<any>) => React.ReactNode;
};

type TreeCapabilities = {
    allowDragAndDrop?: boolean;
    allowDropOnItemWithChildren?: boolean;
    allowDropOnItemWithoutChildren?: boolean;
    allowReorderingItems?: boolean;
    canDrag?: (items: TreeItem[]) => boolean;
    canDropAt?: (items: TreeItem[], target: DraggingPosition) => boolean;
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

export type DataSource = {
    items: Record<TreeItemIndex, TreeItem>;
};

type ImplicitDataSource = {
    dataProvider: TreeDataProvider;
};

type TreeChangeHandlers = {
    onStartRenamingItem?: (item: TreeItem, treeId: string) => void;
    onCollapseItem?: (item: TreeItem, treeId: string) => void;
    onExpandItem?: (item: TreeItem, treeId: string) => void;
    onRenameItem?: (item: TreeItem, name: string, treeId: string) => void;
    onSelectItems?: (items: TreeItemIndex[], treeId: string) => void;
    onFocusItem?: (item: TreeItem, treeId: string) => void;
    onDrop?: (items: TreeItem[], target: DraggingPosition) => void;
    onPrimaryAction?: (items: TreeItem, treeId: string) => void;
    onAddTree?: (tree: Tree) => void;
    onRemoveTree?: (tree: Tree) => void;
    onMissingItems?: (itemIds: TreeItemIndex[]) => void;
};

export type VirtualForestProps = {
    viewState: TreeViewState;
    keyboardBindings?: KeyboardBindings;
} & TreeRenderProps &
    TreeCapabilities &
    TreeChangeHandlers &
    DataSource;

export type VirtualTreeContextProps = {
    activeTreeId?: string;
    draggingItems?: TreeItem[];
    draggingPosition?: DraggingPosition;
    itemHeight: number;
    onClick?: (item: TreeItem) => void;
    addTree: (tree: Tree) => void;
    removeTree: (treeId: string) => void;
    setActiveTree: (treeId: string | undefined) => void;
    onStartDragItems: (items: TreeItem[], treeId: string) => void;
    onDragAtPosition: (position: DraggingPosition | undefined) => void;
} & VirtualForestProps &
    Required<TreeRenderProps>;

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

type onReorderParams = {
    sourceId: string;
    targetId: string;
    itemId: string;
    newItemIndex: number;
};

export type VirtualForestWrapperProps = PropsWithChildren<
    {
        viewState: TreeViewState;
        keyboardBindings?: KeyboardBindings;
        containerSize: { width: number; height: number };
        autoScrollDetectionZone: { vertical: number; horizontal: number };
        allowCollapse?: boolean;
        onChange: (data: Record<TreeItemIndex, TreeItem>) => void;
        onReorder?: (params: onReorderParams) => void;
        onClick?: (item: TreeItem) => void;
    } & TreeRenderProps &
        TreeCapabilities &
        ImplicitDataSource
>;

export type Tree = {
    treeId: string;
    rootItem: string;
};

export type TreeProps = Tree & Partial<TreeRenderProps>;

export type Disposable = {
    dispose: () => void;
};

export type TreeDataProvider = {
    componentDidUpdate?: (listener: (changedItemIds: TreeItemIndex[]) => void) => Disposable;
    getData: () => Record<TreeItemIndex, TreeItem>;
    getItem: (itemId: TreeItemIndex) => Promise<TreeItem>;
    getItems?: (itemIds: TreeItemIndex[]) => Promise<TreeItem[]>;
    onRenameItem?: (item: TreeItem, name: string) => Promise<void>;
    onChangeItemChildren?: (itemId: TreeItemIndex, newChildren: TreeItemIndex[]) => Promise<void>;
};

export type KeyboardBindings = Partial<{
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
