import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import "./TreeNode.css";

export interface TNode<T> {
    id: string;
    name: string;
    isFolder: boolean;
    parent: string | null;
    prevParent?: string | null;
    children: TNode<T>[];
    data?: T;
}

interface Props<T> {
    node: TNode<T>;
    // null for root
    // if everything okay - undefined
    onMove: (
        draggedNodes: TNode<T>[],
        targetNode: TNode<T>,
        drop: "above" | "below" | "child",
        treeId: string,
        currentTreeId: string
    ) => undefined | null;
    selectedNodeIds: string[];
    selectedNodes: TNode<T>[];
    onClickNode: (event: React.MouseEvent, node: TNode<T>, selectedNodes: TNode<T>[]) => void;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => boolean;
    onDrop: (draggedNodes: TNode<T>[], dropTarget: TNode<T>, treeId: string, currentTreeId: string, droppedOnRoot: boolean) => void;
    renderNode?: (text: string) => React.ReactNode;
    dataSet: string;
    canAccept: string[];
    editingNodeId?: string;
    onDoubleClickNode: (node: TNode<T>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (node: TNode<T>) => void;
    newName: string;
    handleKeyDown: (event: React.KeyboardEvent, node: TNode<T>) => void;
}

const TreeNodeComponent = <T,>({
    node,
    selectedNodeIds,
    selectedNodes,
    onClickNode,
    onMove,
    openAll,
    canDrag: customCanDrag,
    canDrop: customCanDrop,
    onDrop: onDropCallback,
    renderNode,
    dataSet,
    editingNodeId,
    onDoubleClickNode,
    handleInputChange,
    handleBlur,
    newName,
    handleKeyDown,
    canAccept,
}: Props<T>) => {
    const [expanded, setExpanded] = useState<boolean>(openAll ?? false);

    const [dropPosition, setDropPosition] = useState<string | null>(null);

    const clickTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setExpanded(openAll ?? false);
    }, [openAll, node.id]);

    useEffect(() => {
        // Cleanup the timer on component unmount
        return () => {
            clearTimeout(clickTimeoutRef.current);
        };
    }, []);

    const isSelected = useMemo(() => selectedNodeIds.includes(node.id), [selectedNodeIds, node.id]);

    const ref = useRef<HTMLDivElement>(null);

    const toggleExpand = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    const [{ isDragging }, drag, preview] = useDrag({
        type: dataSet,
        item: {
            nodes: isSelected ? selectedNodes : [node],
            preview: {
                isFolder: node.isFolder,
                name: node.name,
            },
            count: selectedNodeIds.length,
            treeId: dataSet,
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
        accept: canAccept,
        drop: (
            draggedItem: { nodes: TNode<T>[]; dropPosition: "above" | "below" | "child"; treeId: string },
            monitor
        ) => {
            if (monitor.didDrop()) return;

            const onMoveResult = onMove(draggedItem.nodes, node, draggedItem.dropPosition, draggedItem.treeId, dataSet);

            const droppedOnRoot = onMoveResult === null && draggedItem.dropPosition !== "child";

            onDropCallback(draggedItem.nodes, node, draggedItem.treeId, dataSet, droppedOnRoot);

            setDropPosition(null);
        },
        hover(item, monitor) {
            if (!ref.current) return;

            const boundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (boundingRect.bottom - boundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset!.y - boundingRect.top;

            // Determine if hover is in the upper or lower half
            if (hoverClientY < hoverMiddleY - 6) {
                item.dropPosition = "above";
                setDropPosition("above");
            } else if (hoverClientY > hoverMiddleY + 6) {
                item.dropPosition = "below";
                setDropPosition("below");
            } else {
                item.dropPosition = "child";
                setDropPosition(null);
            }
        },
        collect: (monitor) => {
            return {
                isOver: monitor.isOver({ shallow: true }),
                handlerId: monitor.getHandlerId(),
                canDrop: monitor.canDrop(),
            };
        },
        canDrop: (item, monitor) => {
            if (monitor.isOver({ shallow: true })) {
                if (customCanDrop) {
                    return customCanDrop(item.nodes, node);
                }

                return true;
            }

            return false;
        },
    });

    const onClickHandler = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onClickNode(event, node, selectedNodes);
        },
        [onClickNode, node, selectedNodes]
    );

    const handleNodeClick = useCallback(
        (event: React.MouseEvent) => {
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

            // Delay the click action to differentiate it from a double-click
            clickTimeoutRef.current = setTimeout(() => {
                onClickHandler(event);
            }, 200);
        },
        [onClickHandler]
    );

    const onDoubleClickHandler = useCallback(() => {
        clearTimeout(clickTimeoutRef.current);
        onDoubleClickNode(node);
    }, [onDoubleClickNode, node]);

    const handleBlurCallback = useCallback(() => {
        handleBlur(node);
    }, [handleBlur, node]);

    const handleKeyDownCallback = useCallback(
        (event: React.KeyboardEvent) => {
            handleKeyDown(event, node);
        },
        [handleKeyDown, node]
    );

    drop(ref);

    const nodeStyle: CSSProperties = {
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver && canDrop ? "#e0f7fa" : isSelected ? "#d3d3d3" : "transparent",
        cursor: "pointer",
    };

    let placeholderStyle = "";
    if (dropPosition === "above") {
        placeholderStyle = "placeholder-top";
    } else if (dropPosition === "below") {
        placeholderStyle = "placeholder-bottom";
    }

    return (
        <div key={node.id} ref={ref} data-handler-id={handlerId} className="container">
            <div className={isOver ? placeholderStyle : ""} style={nodeStyle}>
                {node.children.length > 0 ? (
                    <>
                        <div className={editingNodeId === node.id ? "unclippedFolder" : "clippedFolder"}>
                            <span onClick={toggleExpand}>{expanded ? "▼ " : "▶ "}</span>
                            {node.isFolder ? <span>📁 </span> : <span>📄 </span>}
                            <span onClick={handleNodeClick} onDoubleClick={onDoubleClickHandler}>
                                {editingNodeId === node.id ? (
                                    <input
                                        id="renameFolder"
                                        type="text"
                                        value={newName}
                                        onChange={handleInputChange}
                                        onBlur={handleBlurCallback}
                                        onKeyDown={handleKeyDownCallback}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{renderNode ? renderNode(node.name) : node.name}</span>
                                )}
                            </span>
                        </div>

                        {expanded &&
                            node.children.map((childNode) => (
                                <TreeNode
                                    key={childNode.id}
                                    node={childNode}
                                    dataSet={dataSet}
                                    canAccept={canAccept}
                                    selectedNodeIds={selectedNodeIds}
                                    selectedNodes={selectedNodes}
                                    onClickNode={onClickNode}
                                    onMove={onMove}
                                    openAll={openAll}
                                    canDrag={customCanDrag}
                                    canDrop={customCanDrop}
                                    onDrop={onDropCallback}
                                    renderNode={renderNode}
                                    editingNodeId={editingNodeId}
                                    onDoubleClickNode={onDoubleClickNode}
                                    handleInputChange={handleInputChange}
                                    handleBlur={handleBlur}
                                    newName={newName}
                                    handleKeyDown={handleKeyDown}
                                />
                            ))}
                    </>
                ) : (
                    <span
                        className={editingNodeId === node.id ? "unclippedFile" : "clippedFile"}
                        onClick={handleNodeClick}
                    >
                        {node.isFolder ? <span>📁 </span> : <span>📄 </span>}{" "}
                        <span onDoubleClick={onDoubleClickHandler}>
                            {editingNodeId === node.id ? (
                                <input
                                    id="renameFile"
                                    type="text"
                                    value={newName}
                                    onChange={handleInputChange}
                                    onBlur={handleBlurCallback}
                                    onKeyDown={handleKeyDownCallback}
                                    autoFocus
                                />
                            ) : (
                                <span>{renderNode ? renderNode(node.name) : node.name}</span>
                            )}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
};

export const TreeNode: React.FC<any> = React.memo(TreeNodeComponent);
