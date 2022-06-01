import React, { useEffect, useMemo, useState } from "react";
import withScrolling from "@nosferatu500/react-dnd-scrollzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { IndividualTreeViewState, TreeDataProvider, TreeItem, TreeItemIndex, VirtualForestWrapperProps } from "./types";
import { VirtualForest } from "./VirtualTreeContext";

const createDataProvider = (provider: TreeDataProvider): Required<TreeDataProvider> => ({
    ...provider,
    componentDidUpdate: provider.componentDidUpdate ?? (() => ({ dispose: () => {} })),
    getItems: provider.getItems ?? ((itemIds) => Promise.all(itemIds.map((id) => provider.getItem(id)))),
    onRenameItem: provider.onRenameItem ?? (async () => {}),
    onChangeItemChildren: provider.onChangeItemChildren ?? (async () => {}),
    getData: provider.getData ?? (() => {}),
});

const ScrollingComponent = withScrolling(
    React.forwardRef((props, ref) => {
        // @ts-ignore
        const { dragDropManager, ...otherProps } = props;
        // @ts-ignore
        return <div ref={ref} {...otherProps} />;
    })
);

export const VirtualForestWrapper = (props: VirtualForestWrapperProps) => {
    const [currentItems, setCurrentItems] = useState<Record<TreeItemIndex, TreeItem>>({});
    const [viewState, setViewState] = useState(props.viewState);
    const dataProvider = createDataProvider(props.dataProvider);

    const writeItems = useMemo(
        () => (newItems: Record<TreeItemIndex, TreeItem>) => {
            setCurrentItems((oldItems) => ({ ...oldItems, ...newItems }));
        },
        []
    );

    const updateState = (
        treeId: string,
        constructNewState: (oldState: IndividualTreeViewState) => Partial<IndividualTreeViewState>
    ) => {
        setViewState((oldState) => ({
            ...oldState,
            [treeId]: {
                ...oldState[treeId],
                ...constructNewState(oldState[treeId] ?? {}),
            },
        }));
    };

    useEffect(() => {
        const { dispose } = dataProvider.componentDidUpdate((changedItemIds) => {
            dataProvider.getItems(changedItemIds).then((items) => {
                writeItems(items.map((item) => ({ [item.index]: item })).reduce((a, b) => ({ ...a, ...b }), {}));
            });
        });

        return dispose;
    });

    return (
        <VirtualForest
            {...props}
            viewState={viewState}
            items={currentItems}
            onExpandItem={(item, treeId) => {
                updateState(treeId, (old) => ({ ...old, expandedItems: [...(old.expandedItems ?? []), item.index] }));
            }}
            onCollapseItem={(item, treeId) => {
                updateState(treeId, (old) => ({
                    ...old,
                    expandedItems: old.expandedItems?.filter((id) => id !== item.index),
                }));
            }}
            onSelectItems={(items, treeId) => {
                updateState(treeId, (old) => ({ ...old, selectedItems: items }));
            }}
            onStartRenamingItem={(item, treeId) => {
                updateState(treeId, (old) => ({ ...old, renamingItem: item.index }));
            }}
            onRenameItem={(item, name, treeId) => {
                dataProvider.onRenameItem(item, name);
                updateState(treeId, (old) => ({ ...old, renamingItem: undefined }));
            }}
            onDrop={async (items, target) => {
                for (const item of items) {
                    const parent = Object.values(currentItems).find((potentialParent) =>
                        potentialParent.children?.includes(item.index)
                    );
                    const newParent = currentItems[target.parentItem];

                    if (!parent) {
                        throw Error(`Could not find parent of item "${item.index}"`);
                    }

                    if (!parent.children) {
                        throw Error(`Parent "${parent.index}" of item "${item.index}" did not have any children`);
                    }

                    if (target.targetType === "item") {
                        if (target.targetItem === parent.index) {
                            // NOOP
                        } else {
                            await dataProvider.onChangeItemChildren(
                                parent.index,
                                parent.children.filter((child) => child !== item.index)
                            );
                            await dataProvider.onChangeItemChildren(target.targetItem, [
                                ...(currentItems[target.targetItem].children ?? []),
                                item.index,
                            ]);
                        }
                    } else {
                        const newParentChildren = [...(newParent.children ?? [])].filter(
                            (child) => child !== item.index
                        );
                        let newItemIndex = 0;

                        if (target.parentItem === parent.index) {
                            const isOldItemPriorToNewItem =
                                ((newParent.children ?? []).findIndex((child) => child === item.index) ?? Infinity) <
                                target.childIndex;
                            newItemIndex = target.childIndex - (isOldItemPriorToNewItem ? 1 : 0);

                            newParentChildren.splice(newItemIndex, 0, item.index);
                            await dataProvider.onChangeItemChildren(target.parentItem, newParentChildren);
                        } else {
                            newItemIndex = target.childIndex;

                            newParentChildren.splice(newItemIndex, 0, item.index);
                            await dataProvider.onChangeItemChildren(
                                parent.index,
                                parent.children.filter((child) => child !== item.index)
                            );
                            await dataProvider.onChangeItemChildren(target.parentItem, newParentChildren);
                        }

                        if (props.onReorder) {
                            props.onReorder({
                                sourceId: parent.index as string,
                                targetId: target.parentItem as string,
                                itemId: item.index as string,
                                newItemIndex,
                            });
                        }
                    }
                }

                if (props.onChange) {
                    props.onChange(dataProvider.getData());
                }
            }}
            onMissingItems={(itemIds) => {
                dataProvider.getItems(itemIds).then((items) => {
                    writeItems(items.map((item) => ({ [item.index]: item })).reduce((a, b) => ({ ...a, ...b }), {}));
                });
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <ScrollingComponent
                    style={{
                        width: props.containerSize.width,
                        height: props.containerSize.height,
                        overflow: "scroll",
                    }}
                >
                    {props.children}
                </ScrollingComponent>
                {/* {props.children} */}
            </DndProvider>
        </VirtualForest>
    );
};
