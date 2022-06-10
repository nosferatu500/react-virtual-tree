import * as React from "react";
import { useCallback } from "react";
import { DropTargetMonitor } from "react-dnd";
import { DraggingPosition } from "../types";
import { useTreeEnvironment } from "./ControlledTreeEnvironment";
import { useGetGetParentOfLinearItem } from "./useGetParentOfLinearItem";

const isOutsideOfContainer = (clientX: number, clientY: number, hoverBoundingRect: DOMRect) => {
    return (
        clientX < hoverBoundingRect.left ||
        clientX > hoverBoundingRect.right ||
        clientY < hoverBoundingRect.top ||
        clientY > hoverBoundingRect.bottom
    );
};

const getHoveringPosition = (
    clientY: number,
    treeTop: number,
    itemHeight: number,
    canDropOnItemWithChildren?: boolean,
    canDropOnItemWithoutChildren?: boolean
) => {
    const hoveringPosition = (clientY - treeTop) / itemHeight;
    const linearIndex = Math.floor(hoveringPosition);
    let offset: "top" | "bottom" | undefined;

    const lineThreshold = canDropOnItemWithChildren || canDropOnItemWithoutChildren ? 0.2 : 0.5;

    if (hoveringPosition % 1 < lineThreshold) {
        offset = "top";
    } else if (hoveringPosition % 1 > 1 - lineThreshold) {
        offset = "bottom";
    }

    return { linearIndex, offset };
};

export const useOnDragOverTreeHandler = (
    lastDragCode: string,
    setLastDragCode: (code: string) => void,
    itemHeight: number,
    onDragAtPosition: (draggingPosition: DraggingPosition | undefined) => void,
    onPerformDrag: (draggingPosition: DraggingPosition) => void
) => {
    const {
        canDropOnItemWithChildren,
        canDropOnItemWithoutChildren,
        canDragAndDrop,
        canDragOnRoot,
        linearItems,
        items,
        canReorderItems,
        viewState,
    } = useTreeEnvironment();
    const getParentOfLinearItem = useGetGetParentOfLinearItem();

    return useCallback(
        (
            draggedItem: any,
            treeId: string,
            containerRef: React.MutableRefObject<HTMLElement | undefined | null>,
            monitor: DropTargetMonitor
        ) => {
            if (!canDragAndDrop) {
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

            const treeBb = containerRef.current.getBoundingClientRect();
            const outsideContainer = isOutsideOfContainer(clientX, clientY, treeBb);

            let { linearIndex, offset } = getHoveringPosition(
                clientY,
                treeBb.top,
                itemHeight,
                canDropOnItemWithChildren,
                canDropOnItemWithoutChildren
            );

            const nextDragCode = outsideContainer ? "outside" : `${treeId}${linearIndex}${offset ?? ""}`;

            if (lastDragCode === nextDragCode) {
                return;
            }

            setLastDragCode(nextDragCode);

            if (outsideContainer) {
                onDragAtPosition(undefined);
                return;
            }

            if (linearIndex < 0 || linearIndex >= linearItems[treeId].length) {
                onDragAtPosition(undefined);
                return;
            }

            const targetItem = linearItems[treeId][linearIndex];
            const { depth } = targetItem;
            const targetItemData = items[targetItem.item];

            if (!offset && !canDropOnItemWithoutChildren && !targetItemData.hasChildren) {
                onDragAtPosition(undefined);
                return;
            }

            if (!offset && !canDropOnItemWithChildren && targetItemData.hasChildren) {
                onDragAtPosition(undefined);
                return;
            }

            if (offset && !canReorderItems) {
                onDragAtPosition(undefined);
                return;
            }

            const parent = getParentOfLinearItem(linearIndex, treeId);

            if (parent.item === "root" && !canDragOnRoot) {
                return;
            }

            if (viewState[treeId]?.selectedItems?.includes(targetItem.item)) {
                return;
            }

            const newChildIndex = items[parent.item].children!.indexOf(targetItem.item) + (offset === "top" ? 0 : 1);

            if (offset === "top" && depth === (linearItems[treeId][linearIndex - 1]?.depth ?? -1)) {
                offset = "bottom";
                linearIndex -= 1;
            }

            let draggingPosition: DraggingPosition;

            if (offset) {
                draggingPosition = {
                    targetType: "between-items",
                    treeId,
                    parentItem: parent.item,
                    depth: targetItem.depth,
                    linearIndex: linearIndex + (offset === "top" ? 0 : 1),
                    // childIndex: linearIndex - parentLinearIndex - 1 + (offset === 'top' ? 0 : 1),
                    // childIndex: environment.items[parent.item].children!.indexOf(targetItem.item) + (offset === 'top' ? 0 : 1),
                    childIndex: newChildIndex,
                    linePosition: offset,
                };
            } else {
                draggingPosition = {
                    targetType: "item",
                    treeId,
                    parentItem: parent.item,
                    targetItem: targetItem.item,
                    depth: targetItem.depth,
                    linearIndex,
                };
            }

            // Prevent inserting parent node into own child node
            // TODO: Check sub nodes also
            if (draggedItem.index === parent.item) {
                console.warn("WARN");
                return;
            }

            onPerformDrag(draggingPosition);
        },
        [
            canDragAndDrop,
            canDropOnItemWithChildren,
            canDropOnItemWithoutChildren,
            canReorderItems,
            getParentOfLinearItem,
            itemHeight,
            items,
            lastDragCode,
            linearItems,
            onDragAtPosition,
            onPerformDrag,
            setLastDragCode,
            viewState,
            canDragOnRoot,
        ]
    );
};
