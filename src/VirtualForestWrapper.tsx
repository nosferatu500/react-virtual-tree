import React, { useEffect, useMemo, useState } from "react";
import withScrolling, { createHorizontalStrength, createVerticalStrength } from "@nosferatu500/react-dnd-scrollzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CompleteDataProvider } from "./static/CompleteDataProvider";
import {
    IndividualTreeViewState,
    TreeDataProvider,
    TreeItem,
    TreeItemIndex,
    VirtualForestWrapperProps,
    VirtualTreeContextProps,
} from "./types";
import { VirtualForest } from "./VirtualTreeContext";

const ScrollingComponent = withScrolling(
    React.forwardRef((props, ref) => {
        // @ts-ignore
        const { dragDropManager, ...otherProps } = props;
        // @ts-ignore
        return <div ref={ref} {...otherProps} />;
    })
);

const verticalStrength = (size: number) => createVerticalStrength(size);
const horizontalStrength = (size: number) => createHorizontalStrength(size);

export const VirtualForestWrapper = React.forwardRef<VirtualTreeContextProps, VirtualForestWrapperProps>(
    (props, ref) => {
        const [currentItems, setCurrentItems] = useState<Record<TreeItemIndex, TreeItem>>({});
        const [viewState, setViewState] = useState(props.viewState);
        const dataProvider = useMemo(() => new CompleteDataProvider(props.dataProvider), [props.dataProvider]);

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
                ref={ref}
                viewState={viewState}
                items={currentItems}
                onExpandItem={(item, treeId) => {
                    updateState(treeId, (old) => ({
                        ...old,
                        expandedItems: [...(old.expandedItems ?? []), item.index],
                    }));
                }}
                onCollapseItem={(item, treeId) => {
                    if (!props.allowCollapse) return;

                    updateState(treeId, (old) => ({
                        ...old,
                        expandedItems: old.expandedItems?.filter((id) => id !== item.index),
                    }));
                }}
                onSelectItems={(items, treeId) => {
                    updateState(treeId, (old) => ({ ...old, selectedItems: items }));
                }}
                onFocusItem={(item, treeId) => {
                    updateState(treeId, (old) => ({ ...old, focusedItem: item.index }));
                }}
                onStartRenamingItem={(item, treeId) => {
                    updateState(treeId, (old) => ({ ...old, renamingItem: item.index }));
                }}
                onRenameItem={async (item, name, treeId) => {
                    await dataProvider.onRenameItem(item, name);
                    updateState(treeId, (old) => ({ ...old, renamingItem: undefined }));
                    const newItem = await dataProvider.getItem(item.index);
                    writeItems({ [item.index]: newItem });
                }}
                onDrop={async (items, target) => {
                    for (const item of items) {
                        const parent = Object.values(currentItems).find((potentialParent) =>
                            potentialParent.children?.includes(item.index)
                        );
                        const newParent = currentItems[target.parentItem];

                        if (!parent) {
                            throw new Error(`Could not find parent of item "${item.index}"`);
                        }

                        if (!parent.children) {
                            throw new Error(
                                `Parent "${parent.index}" of item "${item.index}" did not have any children`
                            );
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
                                    ((newParent.children ?? []).indexOf(item.index) ?? Number.POSITIVE_INFINITY) <
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
                        writeItems(
                            items.map((item) => ({ [item.index]: item })).reduce((a, b) => ({ ...a, ...b }), {})
                        );
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
                        verticalStrength={verticalStrength(props.autoScrollDetectionZone.vertical)}
                        horizontalStrength={horizontalStrength(props.autoScrollDetectionZone.horizontal)}
                    >
                        {props.children}
                    </ScrollingComponent>
                </DndProvider>
            </VirtualForest>
        );
    }
);
