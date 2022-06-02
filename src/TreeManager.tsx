import React, { useContext, useRef, useMemo } from "react";
import { useDrop } from "react-dnd";
import { DragBetweenLine } from "./DragBetweenLine";
import { useFocusWithin } from "./hooks/useFocusWithin";
import { useGetLinearItems } from "./hooks/useGetLinearItems";
import { useTreeKeyboardBindings } from "./hotkeys/useTreeKeyboardBindings";
import { TreeItemChildren } from "./TreeItemChildren";
import { DraggingPosition } from "./types";
import { createTreeMeta, createTreeMetaDeps } from "./utils";
import { TreeContext, TreeRenderContext } from "./VirtualTree";
import { VirtualTreeContext } from "./VirtualTreeContext";

export const TreeManager = (props: {}): JSX.Element => {
    const { treeId, rootItem } = useContext(TreeContext);
    const context = useContext(VirtualTreeContext);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastHoverCode = useRef<string>();
    const getLinearItems = useGetLinearItems(treeId, rootItem);
    const renderers = useContext(TreeRenderContext);
    const isActiveTree = context.activeTreeId === treeId;

    useTreeKeyboardBindings(containerRef.current);

    useFocusWithin(
        containerRef.current,
        () => {
            context.setActiveTree(treeId);
        },
        () => {
            if (isActiveTree) {
                // TODO currently looses focus while dropping in the active tree
                context.setActiveTree(undefined);
            }
        },
        [context.activeTreeId, treeId]
    );

    const meta = useMemo(() => createTreeMeta(context, treeId), createTreeMetaDeps(context, treeId)); // share with tree children

    const rootChildren = context.items[rootItem].children;

    if (!rootChildren) {
        throw Error(`Root ${rootItem} does not contain any children`);
    }

    const treeChildren = (
        <>
            <TreeItemChildren children={rootChildren} depth={0} parentId={treeId} />
            <DragBetweenLine treeId={treeId} />
        </>
    );

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },

        hover(item: any, monitor) {
            if (!context.allowDragAndDrop) {
                return;
            }

            if (!containerRef.current) {
                return;
            }

            const clientOffset = monitor.getClientOffset();
            const clientX = clientOffset?.x ?? -1;
            const clientY = clientOffset?.y ?? -1;

            if (clientX < 0 || clientY < 0) {
                return;
            }

            const hoverBoundingRect = containerRef.current.getBoundingClientRect();
            const outsideContainer =
                clientX < hoverBoundingRect.left ||
                clientX > hoverBoundingRect.right ||
                clientY < hoverBoundingRect.top ||
                clientY > hoverBoundingRect.bottom;

            const hoveringPosition = (clientY - hoverBoundingRect.top) / context.itemHeight;
            let linearIndex = Math.floor(hoveringPosition);
            let offset: "top" | "bottom" | undefined = undefined;

            const lineThreshold =
                context.allowDropOnItemWithChildren || context.allowDropOnItemWithoutChildren ? 0.2 : 0.5;

            if (hoveringPosition % 1 < lineThreshold) {
                offset = "top";
            } else if (hoveringPosition % 1 > 1 - lineThreshold) {
                offset = "bottom";
            }

            const hoveringCode = outsideContainer ? "outside" : `${linearIndex}${offset ?? ""}`;

            if (lastHoverCode.current !== hoveringCode) {
                lastHoverCode.current = hoveringCode;

                if (outsideContainer) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                const linearItems = getLinearItems();

                if (linearIndex < 0 || linearIndex >= linearItems.length) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                const targetItem = linearItems[linearIndex];
                const depth = targetItem.depth;
                const targetItemData = context.items[targetItem.item];

                if (!offset && !context.allowDropOnItemWithoutChildren && !targetItemData.isFolder) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                if (!offset && !context.allowDropOnItemWithChildren && targetItemData.isFolder) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                if (offset && !context.allowReorderingItems) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                let parentLinearIndex = linearIndex;
                for (
                    ;
                    !!linearItems[parentLinearIndex] && linearItems[parentLinearIndex].depth !== depth - 1;
                    parentLinearIndex--
                );

                let parent = linearItems[parentLinearIndex];

                if (!parent) {
                    parent = { item: rootItem, depth: 0 };
                    parentLinearIndex = 0;
                }

                if (context.viewState[treeId]?.selectedItems?.includes(targetItem.item)) {
                    return;
                }

                if (offset === "top" && depth === (linearItems[linearIndex - 1]?.depth ?? -1)) {
                    offset = "bottom";
                    linearIndex -= 1;
                }

                let draggingPosition: DraggingPosition;

                if (offset) {
                    draggingPosition = {
                        targetType: "between-items",
                        treeId: treeId,
                        parentItem: parent.item,
                        depth: targetItem.depth,
                        linearIndex: linearIndex + (offset === "top" ? 0 : 1),
                        childIndex: linearIndex - parentLinearIndex - 1 + (offset === "top" ? 0 : 1),
                        linePosition: offset,
                    };
                } else {
                    draggingPosition = {
                        targetType: "item",
                        treeId: treeId,
                        parentItem: parent.item,
                        targetItem: targetItem.item,
                        depth: targetItem.depth,
                        linearIndex: linearIndex,
                    };
                }

                if (
                    context.canDropAt &&
                    (!context.draggingItems || !context.canDropAt(context.draggingItems, draggingPosition))
                ) {
                    context.onDragAtPosition(undefined);
                    return;
                }

                context.onDragAtPosition(draggingPosition);

                context.setActiveTree(treeId);

                if (context.draggingItems && context.onSelectItems && context.activeTreeId !== treeId) {
                    context.onSelectItems(
                        context.draggingItems.map((item) => item.index),
                        treeId
                    );
                }
            }
        },

        // drop(draggedItem: any, monitor) {
        // }
    });

    drop(containerRef);

    return renderers.renderTreeContainer(containerRef, treeId, treeChildren, meta) as JSX.Element;
};
