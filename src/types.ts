import React, { HTMLProps } from "react";
import { DropTargetMonitor } from "react-dnd";

export type TreeItemIndex = string | number;

export interface TreeItem<T = any> {
    index: TreeItemIndex;
    children?: Array<TreeItemIndex>;
    hasChildren?: boolean;
    canMove?: boolean;
    data: T;
}

export interface TreePosition {
    treeId: string;
    parent: TreeItemIndex;
    index: number;
}

export interface TreeItemActions {
    primaryAction: () => void;
    expandItem: () => void;
    collapseItem: () => void;
    toggleExpandedState: () => void;
    selectItem: () => void;
    unselectItem: () => void;
    addToSelectedItems: () => void;
    selectUpTo: () => void;
    startDragging: () => void;
    focusItem: () => void;
}

export interface TreeItemRenderFlags {
    isSelected?: boolean;
    isExpanded?: boolean;
    isFocused?: boolean;
    isDraggingOver?: boolean;
    isDraggingOverParent?: boolean;
    isSearchMatching?: boolean;
    canDrag?: boolean;
    canDropOn?: boolean;
}

export interface TreeItemRenderContext<C extends string = never> extends TreeItemActions, TreeItemRenderFlags {
    interactiveElementProps: HTMLProps<any>;
    itemContainerWithoutChildrenProps: HTMLProps<any>;
    itemContainerWithChildrenProps: HTMLProps<any>;
    arrowProps: HTMLProps<any>;
    viewStateFlags: { [collection in C]: boolean };
}

export interface TreeInformation extends TreeConfiguration {
    areItemsSelected: boolean;
    isFocused: boolean;
    isSearching: boolean;
    search: string | null;
}

export interface TreeRenderProps<T = any, C extends string = never> {
    renderItem?: (props: {
        ref: React.RefObject<HTMLDivElement>;
        item: TreeItem<T>;
        opacity: number;
        depth: number;
        children: React.ReactNode | null;
        title: React.ReactNode;
        arrow: React.ReactNode;
        context: TreeItemRenderContext<C>;
        info: TreeInformation;
    }) => React.ReactElement | null;

    renderItemTitle?: (props: {
        title: string;
        item: TreeItem<T>;
        context: TreeItemRenderContext<C>;
        info: TreeInformation;
    }) => React.ReactElement | null | string;

    renderItemArrow?: (props: {
        item: TreeItem<T>;
        context: TreeItemRenderContext<C>;
        info: TreeInformation;
    }) => React.ReactElement | null;

    renderItemsContainer?: (props: {
        children: React.ReactNode;
        containerProps: HTMLProps<any>;
        info: TreeInformation;
    }) => React.ReactElement | null;

    renderTreeContainer?: (props: {
        ref: React.RefObject<HTMLDivElement>;
        children: React.ReactNode;
        containerProps: HTMLProps<any>;
        info: TreeInformation;
    }) => React.ReactElement | null;

    renderDragBetweenLine?: (props: { draggingPosition: DraggingPosition }) => React.ReactElement | null;

    renderSearchInput?: (props: { inputProps: HTMLProps<HTMLInputElement> }) => React.ReactElement | null;

    renderDepthOffset?: number;
}

export type AllTreeRenderProps<T = any, C extends string = never> = Required<TreeRenderProps<T, C>>;

export enum InteractionMode {
    ClickItemToExpand = "click-item-to-expand",
    ClickArrowToExpand = "click-arrow-to-expand",
}

export interface InteractionManager<C extends string = never> {
    mode: InteractionMode | string;
    extends?: InteractionMode;
    createInteractiveElementProps: (
        item: TreeItem,
        actions: TreeItemActions,
        renderFlags: TreeItemRenderFlags,
        __unsafeViewState?: IndividualTreeViewState<C>
    ) => HTMLProps<HTMLElement>;
}

export interface TreeCapabilities<T = any, C extends string = never> {
    allowCollapse?: boolean;
    defaultInteractionMode?: InteractionMode | InteractionManager<C>;
    canDragOnRoot?: boolean;
    canDragAndDrop?: boolean;
    canDropOnItemWithChildren?: boolean;
    canDropOnItemWithoutChildren?: boolean;
    canReorderItems?: boolean;
    canDrag?: (items: TreeItem<T>[]) => boolean;
    canDropAt?: (items: TreeItem<T>[], target: DraggingPosition) => boolean;
    canInvokePrimaryActionOnItemContainer?: boolean;
    canSearch?: boolean;
    canSearchByStartingTyping?: boolean;
    autoFocus?: boolean;
    doesSearchMatchItem?: (search: string, item: TreeItem<T>, itemTitle: string) => boolean;
    showLiveDescription?: boolean;
}

export type IndividualTreeViewState<C extends string> = {
    selectedItems?: TreeItemIndex[];
    expandedItems?: TreeItemIndex[];
    untruncatedItems?: TreeItemIndex[];
    focusedItem?: TreeItemIndex;
} & { [c in C]: TreeItemIndex | TreeItemIndex[] | undefined };

export interface TreeViewState<C extends string> {
    [treeId: string]: IndividualTreeViewState<C> | undefined;
}

export interface ExplicitDataSource<T = any> {
    items: Record<TreeItemIndex, TreeItem<T>>;
}

export interface ImplicitDataSource<T = any> {
    dataProvider: TreeDataProvider<T>;
}

export type DataSource<T = any> = ExplicitDataSource<T> | ImplicitDataSource<T>;

export interface TreeChangeHandlers<T = any> {
    onCollapseItem?: (item: TreeItem<T>, treeId: string) => void;
    onExpandItem?: (item: TreeItem<T>, treeId: string) => void;
    onSelectItems?: (items: TreeItemIndex[], treeId: string) => void; // TODO TreeItem instead of just index
    onFocusItem?: (item: TreeItem<T>, treeId: string) => void;
    onDrop?: (items: TreeItem<T>[], target: DraggingPosition) => void;
    onPrimaryAction?: (items: TreeItem<T>, treeId: string) => void;
    onRegisterTree?: (tree: TreeConfiguration) => void;
    onUnregisterTree?: (tree: TreeConfiguration) => void;
    onMissingItems?: (itemIds: TreeItemIndex[]) => void;
    onMissingChildren?: (itemIds: TreeItemIndex[]) => void; // TODO
}

export interface TreeEnvironmentChangeActions {
    focusTree: (treeId: string, autoFocus?: boolean) => void;
    collapseItem: (itemId: TreeItemIndex, treeId: string) => void;
    expandItem: (itemId: TreeItemIndex, treeId: string) => void;
    toggleItemExpandedState: (itemId: TreeItemIndex, treeId: string) => void;
    selectItems: (itemsIds: TreeItemIndex[], treeId: string) => void;
    toggleItemSelectStatus: (itemId: TreeItemIndex, treeId: string) => void;
    invokePrimaryAction: (itemId: TreeItemIndex, treeID: string) => void;
    focusItem: (itemId: TreeItemIndex, treeId: string) => void;
    moveFocusUp: (treeId: string) => void;
    moveFocusDown: (treeId: string) => void;
}

export type TreeEnvironmentActionsContextProps = TreeEnvironmentChangeActions;

export interface TreeEnvironmentRef<T = any, C extends string = never>
    extends TreeEnvironmentChangeActions,
        Omit<TreeEnvironmentConfiguration<T, C>, keyof TreeChangeHandlers> {
    treeEnvironmentContext: TreeEnvironmentContextProps;
    dragAndDropContext: DragAndDropContextProps;
}

export interface TreeEnvironmentConfiguration<T = any, C extends string = never>
    extends TreeRenderProps<T, C>,
        TreeCapabilities<T>,
        TreeChangeHandlers<T>,
        ExplicitDataSource<T> {
    viewState: TreeViewState<C>;
    keyboardBindings?: KeyboardBindings;
    getItemTitle: (item: TreeItem<T>) => string;
}

export interface TreeEnvironmentContextProps<T = any, C extends string = never>
    extends Omit<TreeEnvironmentConfiguration<T>, keyof TreeRenderProps>,
        AllTreeRenderProps<T, C> {
    onClick?: (item: TreeItem) => void;
    registerTree: (tree: TreeConfiguration) => void;
    unregisterTree: (treeId: string) => void;
    activeTreeId?: string;
    setActiveTree: (
        treeIdOrSetStateFunction: string | undefined | ((prevState: string | undefined) => string | undefined),
        autoFocus?: boolean
    ) => void;
    treeIds: string[];
    trees: Record<string, TreeConfiguration>;
    linearItems: Record<string, LinearItem[]>;
}

export interface DragAndDropContextProps<T = any> {
    onStartDraggingItems: (items: TreeItem<T>[]) => void;
    draggingItems?: TreeItem<T>[];
    itemHeight: number;
    draggingPosition?: DraggingPosition;
    viableDragPositions?: { [treeId: string]: DraggingPosition[] };
    linearItems?: Array<{ item: TreeItemIndex; depth: number }>;
    onDragOverTreeHandler: (
        e: DragEvent,
        treeId: string,
        containerRef: React.MutableRefObject<HTMLElement | undefined>,
        monitor: DropTargetMonitor
    ) => void;
}

export type DraggingPosition = DraggingPositionItem | DraggingPositionBetweenItems;

export interface AbstractDraggingPosition {
    targetType: "item" | "between-items";
    treeId: string;
    parentItem: TreeItemIndex;
    linearIndex: number;
    depth: number;
}

export interface DraggingPositionItem extends AbstractDraggingPosition {
    targetType: "item";
    targetItem: TreeItemIndex;
}

export interface DraggingPositionBetweenItems extends AbstractDraggingPosition {
    targetType: "between-items";
    childIndex: number;
    linePosition: "top" | "bottom";
}

export interface ControlledTreeEnvironmentProps<T = any, C extends string = never>
    extends TreeEnvironmentConfiguration<T, C> {
    children?: JSX.Element | JSX.Element[] | null;
}

type onReorderParams = {
    sourceId: string;
    targetId: string;
    itemId: string;
    newItemIndex: number;
};

export interface UncontrolledTreeEnvironmentProps<T = any, C extends string = never>
    extends TreeRenderProps<T, C>,
        TreeCapabilities,
        ImplicitDataSource<T>,
        TreeChangeHandlers<T> {
    onClick?: (item: TreeItem) => void;
    onReorder?: (params: onReorderParams) => void;
    onChange: (data: Record<TreeItemIndex, TreeItem>) => void;
    viewState: TreeViewState<C>;
    keyboardBindings?: KeyboardBindings;
    getItemTitle: (item: TreeItem<T>) => string;
    children: JSX.Element | JSX.Element[] | null;
    containerSize: { width: number; height: number };
    autoScrollDetectionZone: { vertical: number; horizontal: number };
    dragDropManager: any;
}

export interface TreeConfiguration {
    treeId: string;
    rootItem: string;
}

export interface TreeProps<T = any, C extends string = never>
    extends TreeConfiguration,
        Partial<TreeRenderProps<T, C>> {}

export interface TreeContextProps extends TreeConfiguration {
    search: string | null;
    setSearch: (searchValue: string | null) => void;
    renderers: AllTreeRenderProps;
    treeInformation: TreeInformation;
    getItemsLinearly: () => Array<{ item: TreeItemIndex; depth: number }>;
}

export interface TreeChangeActions {
    focusTree: (autoFocus?: boolean) => void;
    collapseItem: (itemId: TreeItemIndex) => void;
    expandItem: (itemId: TreeItemIndex) => void;
    toggleItemExpandedState: (itemId: TreeItemIndex) => void;
    selectItems: (itemsIds: TreeItemIndex[]) => void;
    toggleItemSelectStatus: (itemId: TreeItemIndex) => void;
    focusItem: (itemId: TreeItemIndex) => void;
    moveFocusUp: () => void;
    moveFocusDown: () => void;
    invokePrimaryAction: (itemId: TreeItemIndex) => void;
    setSearch: (search: string | null) => void;
    abortSearch: () => void;
}

export type TreeChangeActionsContextProps = TreeChangeActions;

export interface TreeRef<T = any> extends TreeChangeActions, TreeInformation {
    treeContext: TreeContextProps;
    treeEnvironmentContext: TreeEnvironmentContextProps<T>;
    dragAndDropContext: DragAndDropContextProps<T>;
    search: string | null;
}

export interface TreeDataProvider<T = any> {
    onDidChangeTreeData?: (listener: (changedItemIds: TreeItemIndex[]) => void) => Disposable;
    getAllData: () => Record<TreeItemIndex, TreeItem>;
    onChangeItemChildren?: (itemId: TreeItemIndex, newChildren: TreeItemIndex[]) => Promise<void>;
}

export type Disposable = {
    dispose: () => void;
};

export interface LinearItem {
    item: TreeItemIndex;
    depth: number;
}

export interface KeyboardBindings {
    primaryAction?: string[];
    expandSiblings?: string[];
    toggleSelectItem?: string[];
    abortSearch?: string[];
    startSearch?: string[];
}
