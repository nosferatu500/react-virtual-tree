import React, { CSSProperties, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

export interface TNode {
    id: React.Key;
    name: string;
    type: "folder" | "file";
    children: TNode[];
}

const ItemTypes = {
    FILE: "file",
    FOLDER: "folder",
};

interface Props {
    node: TNode;
    onMove: (draggedNodeIds: React.Key[], targetNode: TNode) => void;
    selectedNodes: React.Key[];
    onSelectNode: (event: React.MouseEvent, nodeId: React.Key) => void;
}

export const TreeNode: React.FC<Props> = ({ node, selectedNodes, onSelectNode, onMove }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const isSelected = selectedNodes.includes(node.id);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.FILE,
        item: { nodes: isSelected ? selectedNodes : [node.id] },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

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
    });

    const onClickHandler = (event: React.MouseEvent) => {
        onSelectNode(event, node.id);
    };

    drag(drop(ref));

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
                        <span onClick={toggleExpand}>
                            {expanded ? "📂" : "📁"} {node.name}
                        </span>
                        {expanded &&
                            node.children.map((childNode) => (
                                <TreeNode
                                    key={childNode.id}
                                    node={childNode}
                                    selectedNodes={selectedNodes}
                                    onSelectNode={onSelectNode}
                                    onMove={onMove}
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
