import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import './TreeNode.css';

export interface TNode<T = unknown> {
    id: string;
    name: string;
    type: "folder" | "file";
    parent: string | null;
    prevParent?: string | null;
    children: TNode<T>[];
    data?: T;
}

const ItemTypes = {
    FILE: "file",
    FOLDER: "folder",
};

interface Props<T = unknown> {
    node: TNode<T>;
    onMove: (draggedNodeIds: string[], targetNode: TNode<T>) => void;
    selectedNodeIds: string[];
    selectedNodes: TNode<T>[];
    onClickNode: (event: React.MouseEvent, node: TNode<T>) => void;
    allwaysOpenRoot?: boolean;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean;
    onDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => void;
    renderNode?: (text: string) => React.ReactNode;
}

export const TreeNode = <T,>({
    node,
    selectedNodeIds,
    selectedNodes,
    onClickNode,
    onMove,
    allwaysOpenRoot,
    openAll,
    canDrag: customCanDrag,
    canDrop: customCanDrop,
    onDrop: onDropCallback,
    renderNode,
}: Props<T>) => {
    const [expanded, setExpanded] = useState<boolean>(openAll ?? false);

    useEffect(() => {
        if (node.id === "root" && allwaysOpenRoot) {
            setExpanded(true);
        } else {
            setExpanded(openAll ?? false)
        }
    }, [openAll, allwaysOpenRoot, node.id])

    const isSelected = useMemo(() => selectedNodeIds.includes(node.id), [selectedNodeIds, node.id]);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

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
        drop: (draggedItem: { nodeIds: string[]; nodes: TNode<T>[] }, monitor) => {
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
            if (monitor.isOver({ shallow: true })) {
                const dragSource: { node: TNode<T> } = monitor.getItem();
                const dropTarget = node;
                if (customCanDrop) {
                    return customCanDrop(dragSource.node, dropTarget);
                }

                return true;
            }


            return false;
        },
    });

    const onClickHandler = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        onClickNode(event, node);
    }, [onClickNode, node]);

    drop(ref);

    const nodeStyle: CSSProperties = {
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver && canDrop ? "#e0f7fa" : isSelected ? "#d3d3d3" : "transparent",
        cursor: "pointer",
    };

    return (
        <div key={node.id} ref={ref} data-handler-id={handlerId} className="container">
            <div style={nodeStyle} onClick={onClickHandler}>
                {node.type === "folder" ? (
                    <>
                        <div>
                            <span onClick={toggleExpand}>{expanded ? "▼ " : "▶ "}</span>
                            {renderNode ? renderNode(node.name) : node.name}
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
                                    renderNode={renderNode}
                                />
                            ))}
                    </>
                ) : (
                    <span>📄 {renderNode ? renderNode(node.name) : node.name}</span>
                )}
            </div>
        </div>
    );
};