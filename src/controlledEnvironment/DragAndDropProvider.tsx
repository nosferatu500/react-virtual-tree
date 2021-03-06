import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "react-tracked";
import { DragAndDropContextProps, DraggingPosition, TreeItem } from "../types";
import { useCallSoon } from "../useCallSoon";
import { buildMapForTrees } from "../utils";
import { useTreeEnvironment } from "./ControlledTreeEnvironment";
import { useCanDropAt } from "./useCanDropAt";
import { useGetViableDragPositions } from "./useGetViableDragPositions";
import { useOnDragOverTreeHandler } from "./useOnDragOverTreeHandler";

const useValue = ({ propState }: { propState: DragAndDropContextProps }) => {
    const [state, setState] = useState(propState);
    useEffect(() => {
        // or useLayoutEffect
        setState(propState);
    }, [propState]);
    return [state, setState] as const;
};

export const { Provider: DragAndDropContextProvider, useTracked: useDragAndDrop } = createContainer(useValue);

// TODO tidy up
export const DragAndDropProvider: React.FC = (props: any) => {
    const environment = useTreeEnvironment();
    const itemHeight = React.useRef<number>(24);
    const [viableDragPositions, setViableDragPositions] = useState<{ [treeId: string]: DraggingPosition[] }>({});
    const [draggingItems, setDraggingItems] = useState<TreeItem[]>();
    const [draggingPosition, setDraggingPosition] = useState<DraggingPosition>();
    const [dragCode, setDragCode] = useState("_nodrag");
    const getViableDragPositions = useGetViableDragPositions();
    const callSoon = useCallSoon();

    const resetState = useCallback(() => {
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
        itemHeight.current,
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
        (items: TreeItem[]) => {
            const treeViableDragPositions = buildMapForTrees(environment.treeIds, (treeId) =>
                getViableDragPositions(treeId, items)
            );

            setDraggingItems(items);
            // @ts-ignore
            setViableDragPositions(treeViableDragPositions);
        },
        [environment.treeIds, getViableDragPositions]
    );

    const dnd: DragAndDropContextProps = React.useMemo(() => {
        return {
            onStartDraggingItems,
            draggingItems,
            draggingPosition,
            itemHeight: itemHeight.current,
            onDragOverTreeHandler,
            viableDragPositions,
        };
    }, [draggingItems, draggingPosition, onDragOverTreeHandler, onStartDraggingItems, viableDragPositions]);

    useEffect(() => {
        window.addEventListener("dragend", onDropHandler);
        return () => {
            window.removeEventListener("dragend", onDropHandler);
        };
    }, [onDropHandler]);

    return <DragAndDropContextProvider propState={dnd}>{props.children}</DragAndDropContextProvider>;
};
