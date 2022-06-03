import React, { FormHTMLAttributes, HTMLProps, InputHTMLAttributes, PropsWithChildren, Ref } from "react";

export type TreeItemIndex = string | number;

export type TreeItem = {
    index: TreeItemIndex;
    title: string;
    isFolder: boolean;
    children: Array<TreeItemIndex>;
    canMove?: boolean;
};

export type TreeItemActions = {
    primaryAction: () => void;
    expandItem: () => void;
    collapseItem: () => void;
    toggleExpandedState: () => void;
    selectItem: () => void;
    unselectItem: () => void;
    addToSelectedItems: () => void;
    selectUpTo: () => void;
    focusItem: () => void;
};

export type TreeItemRenderFlags = {
    isSelected?: boolean;
    isExpanded?: boolean;
    isFocused?: boolean;
    isRenaming?: boolean;
    isDraggingOver?: boolean;
    isDraggingOverParent?: boolean;
    isSearchMatching?: boolean;
    canDrag?: boolean;
};

export type TreeItemRenderContext = {
    elementProps: HTMLProps<any>;
    itemContainerWithoutChildrenProps: HTMLProps<any>;
    itemContainerWithChildrenProps: HTMLProps<any>;
    arrowProps: HTMLProps<any>;
} & TreeItemActions &
    TreeItemRenderFlags;

export type TreeMeta = {
    areItemsSelected?: boolean;
    isRenaming?: boolean;
    isFocused?: boolean;
    isSearching?: boolean;
    search?: string | null;
} & Tree;

export type TreeRenderProps = {
    renderItem?: (props: {
        ref: React.RefObject<HTMLDivElement>;
        item: TreeItem;
        style: any;
        depth: number;
        children: React.ReactNode | null;
        title: React.ReactNode;
        arrow: React.ReactNode;
        context: TreeItemRenderContext;
        treeMeta: TreeMeta;
    }) => React.ReactNode;
    renderItemTitle?: (props: {
        title: string;
        item: TreeItem;
        context: TreeItemRenderContext;
        treeMeta: TreeMeta;
    }) => React.ReactNode;

    renderItemArrow?: (props: {
        item: TreeItem;
        context: TreeItemRenderContext;
        treeMeta: TreeMeta;
    }) => React.ReactNode;
    renderRenameInput?: (props: {
        item: TreeItem;
        inputProps: InputHTMLAttributes<HTMLInputElement>;
        inputRef: Ref<HTMLInputElement>;
        submitButtonProps: HTMLProps<any>;
        formProps: FormHTMLAttributes<HTMLFormElement>;
    }) => React.ReactNode;
    renderDraggingItem?: (props: { items: Array<TreeItem> }) => React.ReactNode;
    renderDraggingItemTitle?: (props: { items: Array<TreeItem> }) => React.ReactNode;
    renderItemsContainer?: (props: {
        children: React.ReactNode;
        containerProps: HTMLProps<any>;
        treeMeta: TreeMeta;
    }) => React.ReactNode;
    renderTreeContainer?: (props: {
        ref: React.RefObject<HTMLDivElement>;
        treeId: string;
        children: React.ReactNode;
        treeMeta: TreeMeta;
    }) => React.ReactNode;
    renderDragBetweenLine?: (props: {
        draggingPosition: DraggingPosition;
        lineProps: HTMLProps<any>;
    }) => React.ReactNode;
    renderSearchInput?: (props: { inputProps: HTMLProps<HTMLInputElement> }) => React.ReactNode;
    renderDepthOffset?: number;
};

export enum InteractionMode {
    ClickItemToExpand = "click-item-to-expand",
    ClickArrowToExpand = "click-arrow-to-expand",
}

export type InteractionManager = {
    mode: InteractionMode;
    createInteractiveElementProps: (
        item: TreeItem,
        treeId: string,
        actions: TreeItemActions,
        renderFlags: TreeItemRenderFlags
    ) => HTMLProps<HTMLElement>;
};

export type TreeCapabilities = {
    defaultInteractionMode?: InteractionMode;
    allowDragAndDrop?: boolean;
    allowDropOnItemWithChildren?: boolean;
    allowDropOnItemWithoutChildren?: boolean;
    allowReorderingItems?: boolean;
    canDrag?: (items: TreeItem[]) => boolean;
    canDropAt?: (items: TreeItem[], target: DraggingPosition) => boolean;
    canInvokePrimaryActionOnItemContainer?: boolean;
    canSearch?: boolean;
    canSearchByStartingTyping?: boolean;
    doesSearchMatchItem?: (search: string, item: TreeItem, itemTitle: string) => boolean;
};

export type IndividualTreeViewState = {
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
    onMissingChildren?: (itemIds: TreeItemIndex[]) => void;
};

export type VirtualForestProps = {
    viewState: TreeViewState;
    keyboardBindings?: KeyboardBindings;
    getItemTitle: (item: TreeItem) => string;
} & TreeRenderProps &
    TreeCapabilities &
    TreeChangeHandlers &
    DataSource;

export type VirtualTreeContextProps = {
    activeTreeId?: string;
    draggingItems?: TreeItem[];
    draggingPosition?: DraggingPosition;
    itemHeight: number;
    treeIds: string[];
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
        getItemTitle: (item: TreeItem) => string;
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

export type TreeContextProps<T = any> = {
    search: string | null;
    setSearch: (searchValue: string | null) => void;
    renamingItem: TreeItemIndex | null;
    setRenamingItem: (item: TreeItemIndex | null) => void;
    renderer: Required<TreeRenderProps>;
    treeMeta: TreeMeta;
    getItemsLinearly: () => Array<{ item: TreeItemIndex; depth: number }>;
} & Tree;

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
    abortRenameItem?: string[];
    toggleSelectItem: string[];
    moveItems: string[];
    abortMovingItems: string[];
    abortSearch: string[];
    startSearch?: string[];
    selectAll?: string[];
}>;
