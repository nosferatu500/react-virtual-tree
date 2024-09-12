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
    onMove: (draggedNodeIds: string[], targetNode: TNode<T>, drop: "above" | "below" | "child") => void;
    selectedNodeIds: string[];
    selectedNodes: TNode<T>[];
    onClickNode: (event: React.MouseEvent, node: TNode<T>, selectedNodes: TNode<T>[]) => void;
    allwaysOpenRoot?: boolean;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => boolean;
    onDrop: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => void;
    renderNode?: (text: string) => React.ReactNode;
    dataSet: string;
    editingNodeId?: string;
    onDoubleClickNode: (node: TNode<T>) => void;
    handleInputChange: (event: React.ChangeEvent) => void;
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
    allwaysOpenRoot,
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
}: Props<T>) => {
    const [expanded, setExpanded] = useState<boolean>(openAll ?? false);

    const [dropPosition, setDropPosition] = useState<string | null>(null);

    const clickTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (node.id === "root" && allwaysOpenRoot) {
            setExpanded(true);
        } else {
            setExpanded(openAll ?? false);
        }
    }, [openAll, allwaysOpenRoot, node.id]);

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
        accept: dataSet,
        drop: (
            draggedItem: { nodeIds: string[]; nodes: TNode<T>[]; dropPosition: "above" | "below" | "child" },
            monitor
        ) => {
            if (monitor.didDrop()) return;

            onMove(draggedItem.nodeIds, node, draggedItem.dropPosition);

            onDropCallback(draggedItem.nodes, node);

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
                    <span className={editingNodeId === node.id ? "unclippedFile" : "clippedFile"}  onClick={handleNodeClick}>
                        {node.isFolder ? <span>📁 </span> : <span>📄 </span>}{" "}
                        <span onDoubleClick={onDoubleClickHandler}>
                            {editingNodeId === node.id ? (
                                <input
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
