import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { DragAndDropContextProps, DraggingPosition, TreeItem } from "../types";
import { useCallSoon } from "../useCallSoon";
import { buildMapForTrees } from "../utils";
import { useTreeEnvironment } from "./ControlledTreeEnvironment";
import { useCanDropAt } from "./useCanDropAt";
import { useGetViableDragPositions } from "./useGetViableDragPositions";
import { useOnDragOverTreeHandler } from "./useOnDragOverTreeHandler";

const DragAndDropContext = React.createContext<DragAndDropContextProps>(null as any);
export const useDragAndDrop = () => React.useContext(DragAndDropContext);

// TODO tidy up
export const DragAndDropProvider: React.FC = (props) => {
    const environment = useTreeEnvironment();
    const [itemHeight, setItemHeight] = useState(24);
    const [viableDragPositions, setViableDragPositions] = useState<{ [treeId: string]: DraggingPosition[] }>({});
    const [draggingItems, setDraggingItems] = useState<TreeItem[]>();
    const [draggingPosition, setDraggingPosition] = useState<DraggingPosition>();
    const [dragCode, setDragCode] = useState("_nodrag");
    const getViableDragPositions = useGetViableDragPositions();
    const callSoon = useCallSoon();

    const resetState = useCallback(() => {
        setItemHeight(24);
        setViableDragPositions({});
        setDraggingItems(undefined);
        setDraggingPosition(undefined);
        setDragCode("_nodrag");
    }, []);

    const canDropAt = useCanDropAt();

    const performDrag = (draggingPosition: DraggingPosition) => {
        if (draggingItems && !canDropAt(draggingPosition, draggingItems)) {
            return;
        }

        setDraggingPosition(draggingPosition);
        environment.setActiveTree(draggingPosition.treeId);

        if (draggingItems && environment.activeTreeId !== draggingPosition.treeId) {
            // TODO maybe do only if draggingItems are different to selectedItems
            environment.onSelectItems?.(
                draggingItems.map((item) => item.index),
                draggingPosition.treeId
            );
        }
    };

    const onDragOverTreeHandler = useOnDragOverTreeHandler(
        dragCode,
        setDragCode,
        itemHeight,
        setDraggingPosition,
        performDrag
    );

    const onDropHandler = useCallback(() => {
        if (draggingItems && draggingPosition && environment.onDrop) {
            environment.onDrop(draggingItems, draggingPosition);

            callSoon(() => {
                environment.onFocusItem?.(draggingItems[0], draggingPosition.treeId);
                resetState();
            });
        }
    }, [draggingItems, draggingPosition, environment, resetState, callSoon]);

    const onStartDraggingItems = useCallback(
        (items: TreeItem[], treeId: string) => {
            const treeViableDragPositions = buildMapForTrees(environment.treeIds, (treeId) =>
                getViableDragPositions(treeId, items)
            );

            // TODO what if trees have different heights and drag target changes?
            const height =
                document.querySelector<HTMLElement>(`[data-rct-tree="${treeId}"] [data-rct-item-container="true"]`)
                    ?.offsetHeight ?? 5;
            setItemHeight(height);
            setDraggingItems(items);
            // @ts-ignore
            setViableDragPositions(treeViableDragPositions);
        },
        [environment.treeIds, getViableDragPositions]
    );

    const dnd: DragAndDropContextProps = {
        onStartDraggingItems,
        draggingItems,
        draggingPosition,
        itemHeight,
        onDragOverTreeHandler,
        viableDragPositions,
    };

    useEffect(() => {
        window.addEventListener("dragend", onDropHandler);
        return () => {
            window.removeEventListener("dragend", onDropHandler);
        };
    }, [onDropHandler]);

    // @ts-ignore
    return <DragAndDropContext.Provider value={dnd}>{props.children}</DragAndDropContext.Provider>;
};
