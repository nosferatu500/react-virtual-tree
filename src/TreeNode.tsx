import React, { CSSProperties, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface TNode<T = unknown> {
    id: React.Key;
    name: string;
    type: "folder" | "file";
    children: TNode<T>[];
    data?: T
}

const ItemTypes = {
    FILE: "file",
    FOLDER: "folder",
};

interface Props<T = unknown> {
    node: TNode<T>;
    onMove: (draggedNodeIds: React.Key[], targetNode: TNode<T>) => void;
    selectedNodes: React.Key[];
    onClickNode: (event: React.MouseEvent, nodeId: React.Key) => void;
    openAll: boolean
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean
}

export const TreeNode = <T, >({ node, selectedNodes, onClickNode, onMove, openAll, canDrop: customCanDrop }: Props<T>) => {
    const [expanded, setExpanded] = useState<boolean>(openAll);

    const isSelected = selectedNodes.includes(node.id);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.FILE,
        item: { nodes: isSelected ? selectedNodes : [node.id], node: node, count: selectedNodes.length },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    preview(getEmptyImage(), { captureDraggingState: true });

    drag(ref)

    const [{ isOver, handlerId, canDrop }, drop] = useDrop({
        accept: ItemTypes.FILE,
        drop: (draggedItem: { nodes: React.Key[] }, monitor) => {
            if (monitor.didDrop()) return;

            onMove(draggedItem.nodes, node);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
            handlerId: monitor.getHandlerId(),
            canDrop: monitor.canDrop(),
        }),
        canDrop: (_item, monitor) => {
            // @ts-expect-error Update types
            const dragSource = monitor.getItem().node
            const dropTarget = node
            if (customCanDrop) {
                return customCanDrop(dragSource, dropTarget)
            }
            
            return true;
        },
    });

    const onClickHandler = (event: React.MouseEvent) => {
        event.stopPropagation();
        onClickNode(event, node.id);
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
                        <span onClick={toggleExpand}>
                            {expanded ? "📂 " : "📁 "}
                        </span>
                        {node.name}
                    </div>
                        
                        {expanded &&
                            node.children.map((childNode) => (
                                <TreeNode
                                    key={childNode.id}
                                    node={childNode}
                                    selectedNodes={selectedNodes}
                                    onClickNode={onClickNode}
                                    onMove={onMove}
                                    openAll={openAll}
                                    canDrop={customCanDrop}
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
