import { Ref, useImperativeHandle } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useDragAndDrop } from "../controlledEnvironment/DragAndDropProvider";
import { TreeEnvironmentChangeActions, TreeEnvironmentRef } from "../types";

export const useCreatedEnvironmentRef = (ref: Ref<TreeEnvironmentRef>, actions: TreeEnvironmentChangeActions) => {
    const environment = useTreeEnvironment();
    const dnd = useDragAndDrop();

    useImperativeHandle(ref, () => ({
        ...actions,
        ...environment,
        treeEnvironmentContext: environment,
        dragAndDropContext: dnd,
    }));
};
