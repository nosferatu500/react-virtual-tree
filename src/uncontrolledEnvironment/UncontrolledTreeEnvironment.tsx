import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { ControlledTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { IndividualTreeViewState, TreeItem, TreeItemIndex, UncontrolledTreeEnvironmentProps } from "../types";
import withScrolling, { createHorizontalStrength, createVerticalStrength } from "../withScrolling";
import { CompleteTreeDataProvider } from "./CompleteTreeDataProvider";

const ScrollingComponent = withScrolling(
    React.forwardRef((props, ref) => {
        // @ts-ignore
        // eslint-disable-next-line react/prop-types
        const { dragDropManager, ...otherProps } = props;
        // @ts-ignore
        return <div ref={ref} {...otherProps} />;
    })
);

const verticalStrength = (size: number) => createVerticalStrength(size);
const horizontalStrength = (size: number) => createHorizontalStrength(size);

export const UncontrolledTreeEnvironment = (props: UncontrolledTreeEnvironmentProps) => {
    const [viewState, setViewState] = useState(props.viewState);
    const missingItemIds = useRef<TreeItemIndex[]>([]);
    const dataProvider = useMemo(() => new CompleteTreeDataProvider(props.dataProvider), [props.dataProvider]);
    const [currentItems, setCurrentItems] = useState<Record<TreeItemIndex, TreeItem>>(dataProvider.getAllData());

    const amendViewState = useCallback(
        (
            treeId: string,
            constructNewState: (oldState: IndividualTreeViewState<any>) => Partial<IndividualTreeViewState<any>>
        ) => {
            setViewState((oldState) => ({
                ...oldState,
                [treeId]: {
                    ...oldState[treeId],
                    ...constructNewState(oldState[treeId] ?? {}),
                },
            }));
        },
        []
    );

    useEffect(() => {
        const { dispose } = dataProvider.onDidChangeTreeData(() => {
            setCurrentItems({ ...dataProvider.getAllData() });
        });

        return dispose;
    }, [dataProvider]);

    return (
        <ControlledTreeEnvironment
            {...props}
            viewState={viewState}
            items={currentItems}
            onExpandItem={(item, treeId) => {
                amendViewState(treeId, (old) => ({
                    ...old,
                    expandedItems: [...(old.expandedItems ?? []), item.index],
                }));
                props.onExpandItem?.(item, treeId);
            }}
            onCollapseItem={(item, treeId) => {
                if (!props.allowCollapse) return;
                amendViewState(treeId, (old) => ({
                    ...old,
                    expandedItems: old.expandedItems?.filter((id) => id !== item.index),
                }));
                props.onCollapseItem?.(item, treeId);
            }}
            onSelectItems={(items, treeId) => {
                amendViewState(treeId, (old) => ({ ...old, selectedItems: items }));
                props.onSelectItems?.(items, treeId);
            }}
            onFocusItem={(item, treeId) => {
                amendViewState(treeId, (old) => ({ ...old, focusedItem: item.index }));
                props.onFocusItem?.(item, treeId);
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
                        throw new Error(`Parent "${parent.index}" of item "${item.index}" did not have any children`);
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

                props.onDrop?.(items, target);

                if (props.onChange) {
                    props.onChange(dataProvider.getAllData());
                }
            }}
            onMissingItems={(itemIds) => {
                // Batch individual fetch-item-calls together
                if (missingItemIds.current.length === 0) {
                    setTimeout(() => {
                        setCurrentItems({ ...dataProvider.getAllData() });
                        missingItemIds.current = [];
                    });
                }

                for (const itemId of itemIds) {
                    if (missingItemIds.current.includes(itemId)) {
                        continue;
                    }
                    missingItemIds.current.push(itemId);
                }

                props.onMissingItems?.(itemIds);
            }}
        >
            <DndProvider manager={props.dragDropManager}>
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
        </ControlledTreeEnvironment>
    );
};
