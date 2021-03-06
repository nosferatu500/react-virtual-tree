import * as React from "react";
import { HTMLProps, useRef } from "react";
import { useDrop } from "react-dnd";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useDragAndDrop } from "../controlledEnvironment/DragAndDropProvider";
import { SearchInput } from "../search/SearchInput";
import { TreeItemChildren } from "../treeItem/TreeItemChildren";
import { DragBetweenLine } from "./DragBetweenLine";
import { useTree } from "./Tree";
import { useTreeKeyboardBindings } from "./useTreeKeyboardBindings";

export const TreeManager = (): JSX.Element => {
    const { treeId, rootItem, renderers, treeInformation } = useTree();
    const environment = useTreeEnvironment();
    const containerRef = useRef<HTMLElement>();
    const [{ onDragOverTreeHandler }] = useDragAndDrop();

    useTreeKeyboardBindings();

    const rootChildren = environment.items[rootItem].children;

    if (!rootChildren) {
        throw new Error(`Root ${rootItem} does not contain any children`);
    }

    const treeChildren = (
        <>
            <TreeItemChildren depth={0} parentId={treeId}>
                {rootChildren}
            </TreeItemChildren>
            <DragBetweenLine treeId={treeId} />
            <SearchInput containerRef={containerRef.current} />
        </>
    );

    const containerProps: HTMLProps<any> = {
        style: { position: "relative" },
        role: "tree",
        ...({
            "data-rct-tree": treeId,
        } as any),
    };

    const [, drop] = useDrop({
        accept: "rvt-item",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(draggedItem: any, monitor) {
            onDragOverTreeHandler(draggedItem, treeId, containerRef, monitor);
        },
    });

    drop(containerRef);

    return renderers.renderTreeContainer({
        ref: containerRef as any,
        children: treeChildren,
        info: treeInformation,
        containerProps,
    }) as JSX.Element;
};
