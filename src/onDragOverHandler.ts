import { DropTargetMonitor } from "react-dnd";
import { useGetLinearItems } from "./hooks/useGetLinearItems";
import { DraggingPosition, TreeCapabilities, VirtualTreeContextProps } from "./types";

export const isOutsideOfContainer = (clientX: number, clientY: number, hoverBoundingRect: DOMRect) => {
    return (
        clientX < hoverBoundingRect.left ||
        clientX > hoverBoundingRect.right ||
        clientY < hoverBoundingRect.top ||
        clientY > hoverBoundingRect.bottom
    );
};

export const getHoveringPosition = (
    clientY: number,
    treeTop: number,
    itemHeight: number,
    capabilities: TreeCapabilities
) => {
    const hoveringPosition = (clientY - treeTop) / itemHeight;

    const linearIndex = Math.floor(hoveringPosition);
    let offset: "top" | "bottom" | undefined;

    const lineThreshold =
        capabilities.allowDropOnItemWithChildren || capabilities.allowDropOnItemWithoutChildren ? 0.2 : 0.5;

    if (hoveringPosition % 1 < lineThreshold) {
        offset = "top";
    } else if (hoveringPosition % 1 > 1 - lineThreshold) {
        offset = "bottom";
    }

    return { linearIndex, offset };
};

export const onDragOverHandler = (
    draggedItem: any,
    context: VirtualTreeContextProps,
    containerRef: React.MutableRefObject<HTMLElement | undefined | null>,
    monitor: DropTargetMonitor,
    lastHoverCode: React.MutableRefObject<string | undefined>,
    getLinearItems: ReturnType<typeof useGetLinearItems>,
    rootItem: string,
    treeId: string
) => {
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
    const outsideContainer = isOutsideOfContainer(clientX, clientY, hoverBoundingRect);

    let { linearIndex, offset } = getHoveringPosition(clientY, hoverBoundingRect.top, context.itemHeight, context);

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
        const { depth } = targetItem;
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

        const newChildIndex =
            context.items[parent.item].children!.indexOf(targetItem.item) + (offset === "top" ? 0 : 1);

        if (offset === "top" && depth === (linearItems[linearIndex - 1]?.depth ?? -1)) {
            offset = "bottom";
            linearIndex -= 1;
        }

        const draggingPosition: DraggingPosition = offset
            ? {
                  targetType: "between-items",
                  treeId,
                  parentItem: parent.item,
                  depth: targetItem.depth,
                  linearIndex: linearIndex + (offset === "top" ? 0 : 1),
                  childIndex: newChildIndex,
                  linePosition: offset,
              }
            : {
                  targetType: "item",
                  treeId,
                  parentItem: parent.item,
                  targetItem: targetItem.item,
                  depth: targetItem.depth,
                  linearIndex,
              };

        // Prevent inserting parent node into own child node
        // TODO: Check sub nodes also
        if (draggedItem.index === parent.item) {
            console.warn("WARN");
            return;
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
};
