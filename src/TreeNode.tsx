import React, { CSSProperties, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface TNode<T = unknown> {
    id: React.Key;
    name: string;
    type: "folder" | "file";
    parent: React.Key | null;
    children: TNode<T>[];
    data?: T;
}

const ItemTypes = {
    FILE: "file",
    FOLDER: "folder",
};

interface Props<T = unknown> {
    node: TNode<T>;
    onMove: (draggedNodeIds: React.Key[], targetNode: TNode<T>) => void;
    selectedNodeIds: React.Key[];
    selectedNodes: TNode<T>[];
    onClickNode: (event: React.MouseEvent, node: TNode<T>) => void;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean;
    onDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => void;
}

export const TreeNode = <T,>({
    node,
    selectedNodeIds,
    selectedNodes,
    onClickNode,
    onMove,
    openAll,
    canDrag: customCanDrag,
    canDrop: customCanDrop,
    onDrop: onDropCallback,
}: Props<T>) => {
    const [expanded, setExpanded] = useState<boolean>(openAll ?? false);

    const isSelected = selectedNodeIds.includes(node.id);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.FILE,
        item: {
            nodeIds: isSelected ? selectedNodeIds : [node.id],
            nodes: isSelected ? selectedNodes : [node],
            node: node,
            count: selectedNodeIds.length,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => {
            if (customCanDrag) {
                return customCanDrag(node);
            }

            return true;
        },
    });

    preview(getEmptyImage(), { captureDraggingState: true });

    drag(ref);

    const [{ isOver, handlerId, canDrop }, drop] = useDrop({
        accept: ItemTypes.FILE,
        drop: (draggedItem: { nodeIds: React.Key[]; nodes: TNode<T>[] }, monitor) => {
            if (monitor.didDrop()) return;

            onMove(draggedItem.nodeIds, node);

            if (onDropCallback) {
                onDropCallback(draggedItem.nodes, node);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
            handlerId: monitor.getHandlerId(),
            canDrop: monitor.canDrop(),
        }),
        canDrop: (_item, monitor) => {
            // @ts-expect-error Update types
            const dragSource = monitor.getItem().node;
            const dropTarget = node;
            if (customCanDrop) {
                return customCanDrop(dragSource, dropTarget);
            }

            return true;
        },
    });

    const onClickHandler = (event: React.MouseEvent) => {
        event.stopPropagation();
        onClickNode(event, node);
    };

    drop(ref);

    const style: CSSProperties = {
        position: "relative",
        marginLeft: 20,
    };

    const nodeStyle: CSSProperties = {
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver && canDrop ? "#e0f7fa" : isSelected ? "#d3d3d3" : "transparent",
        cursor: "pointer",
    };

    return (
        <div key={node.id} ref={ref} data-handler-id={handlerId} style={style}>
            <div style={nodeStyle} onClick={onClickHandler}>
                {node.type === "folder" ? (
                    <>
                        <div>
                            <span onClick={toggleExpand}>{expanded ? "▼ " : "▶ "}</span>
                            {node.name}
                        </div>

                        {expanded &&
                            node.children.map((childNode) => (
                                <TreeNode
                                    key={childNode.id}
                                    node={childNode}
                                    selectedNodeIds={selectedNodeIds}
                                    selectedNodes={selectedNodes}
                                    onClickNode={onClickNode}
                                    onMove={onMove}
                                    openAll={openAll}
                                    canDrag={customCanDrag}
                                    canDrop={customCanDrop}
                                    onDrop={onDropCallback}
                                />
                            ))}
                    </>
                ) : (
                    <span>📄 {node.name}</span>
                )}
            </div>
        </div>
    );
};
