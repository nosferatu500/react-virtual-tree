import React, { useCallback, useMemo, useState } from "react";
import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";
import CustomDragLayer from "./CustomDragLayer";
import { flattenTree, getAllDescendantIds, moveNode, renameNode } from "./utils";

interface VTreeProps<T> {
    data: TNode<T>[];
    setData: React.Dispatch<React.SetStateAction<TNode<T>[]>>;
    onClick?: (event: React.MouseEvent, node: TNode<T>, selectedNodes: TNode<T>[]) => void;
    containerHeight?: number;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => boolean;
    onDrop?: (
        draggedNodes: TNode<T>[],
        dropTarget: TNode<T>,
        treeId: string,
        currentTreeId: string,
        droppedOnRoot: boolean
    ) => void;
    onSelectionChange?: (selectedNodes: TNode<T>[]) => void;
    renderNode?: (text: string) => React.ReactNode;
    onNodeRename?: (node: TNode<T>, newName: string) => void;
    fileExplorerMode?: boolean;
    dataSetName: string;
    allowInteractWith?: string[];
}

export const VTree = <T,>({
    data,
    setData,
    onClick: onClickCallback,
    openAll,
    canDrag,
    canDrop,
    onDrop,
    onSelectionChange,
    containerHeight = 500,
    renderNode,
    fileExplorerMode = true,
    dataSetName,
    onNodeRename,
    allowInteractWith,
}: VTreeProps<T>) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<TNode<T>[]>([]);

    const [lastSelectedNode, setLastSelectedNode] = useState<TNode<T> | null>(null);

    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [newName, setNewName] = useState<string>("");

    const flattenedData = useMemo(() => flattenTree(data), [data]);

    const canAccept: string[] = useMemo(() => {
        return allowInteractWith ? [dataSetName, ...allowInteractWith] : [dataSetName];
    }, [dataSetName, allowInteractWith]);

    const handleNodeSelection = useCallback(
        (nodes: TNode<T>[]) => {
            if (onSelectionChange) {
                onSelectionChange(nodes);
            }

            setSelectedNodes(nodes);
            setSelectedNodeIds(nodes.map((item) => item.id));
        },
        [onSelectionChange]
    );

    const handleOnDrop = useCallback(
        (
            draggedNodes: TNode<T>[],
            dropTarget: TNode<T>,
            treeId: string,
            currentTreeId: string,
            droppedOnRoot: boolean
        ) => {
            if (onDrop) {
                onDrop(draggedNodes, dropTarget, treeId, currentTreeId, droppedOnRoot);
            }

            handleNodeSelection([]);
        },
        [onDrop, handleNodeSelection]
    );

    const onClickNode = useCallback(
        (event: React.MouseEvent, node: TNode<T>) => {
            if (event.metaKey || event.ctrlKey) {
                let result: TNode<T>[];

                // Check if the node is already selected
                const isSelected = selectedNodes.some((selectedNode) => selectedNode.id === node.id);

                if (isSelected) {
                    // Deselect the node if it was already selected
                    result = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
                } else {
                    // Add the clicked node to the selection
                    const updatedSelected = [...selectedNodes, node];

                    // Get all descendant IDs of the clicked node
                    const descendants = getAllDescendantIds(node);

                    // Filter out the descendants from the updated selection
                    result = updatedSelected.filter((selectedNode) => !descendants.includes(selectedNode.id));
                }

                handleNodeSelection(result);

                if (onClickCallback) {
                    onClickCallback(event, node, result);
                }

                return;
            }

            if (event.shiftKey && lastSelectedNode) {
                if (lastSelectedNode.parent !== node.parent) {
                    return;
                }

                // If Shift is pressed, select a range of nodes
                const startIndex = flattenedData.findIndex((n) => n.id === lastSelectedNode.id);
                const endIndex = flattenedData.findIndex((n) => n.id === node.id);

                // Determine the range direction
                const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

                // Get nodes within the range
                const rangeNodes = flattenedData.slice(start, end + 1);

                // Add range nodes and remove any descendant nodes if their parent is included
                const updatedSelected = [...selectedNodes, ...rangeNodes].filter(
                    (node, index, self) => self.findIndex((n) => n.id === node.id) === index // Remove duplicates
                );

                // Remove descendant nodes if their parent is selected
                const descendantIds = updatedSelected.flatMap((n) => getAllDescendantIds(n));
                const result: TNode<T>[] = updatedSelected.filter((n) => !descendantIds.includes(n.id));

                handleNodeSelection(result);

                if (onClickCallback) {
                    onClickCallback(event, node, result);
                }

                return;
            }

            handleNodeSelection([node]);

            setLastSelectedNode(node);

            if (onClickCallback) {
                onClickCallback(event, node, [node]);
            }
        },
        [selectedNodes, lastSelectedNode, flattenedData, handleNodeSelection, onClickCallback]
    );

    const handleMoveNode = useCallback(
        (draggedNodes: TNode<T>[], targetNode: TNode<T>, drop: string, treeId: string, currentTreeId: string) => {
            if (draggedNodes.includes(targetNode)) return;

            const newTreeData = [...data];
            const onMoveResult = moveNode(
                draggedNodes,
                targetNode,
                newTreeData,
                fileExplorerMode,
                drop,
                treeId,
                currentTreeId
            );
            setData(newTreeData);

            return onMoveResult;
        },
        [data, setData, fileExplorerMode]
    );

    const onDoubleClickNode = useCallback((node: TNode<T>) => {
        setEditingNodeId(node.id);
        setNewName(node.name);
    }, []);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(event.target.value);
    }, []);

    const handleRenameConfirm = useCallback(
        (node: TNode<T>) => {
            const trimmedName = newName.trim();
            if (trimmedName && node.name !== trimmedName) {
                const newTreeData = [...data];
                renameNode(node.id, trimmedName, newTreeData);
                setData(newTreeData);
            }

            if (onNodeRename) {
                onNodeRename(node, trimmedName);
            }
            setEditingNodeId(null);
        },
        [newName, onNodeRename, data, setData]
    );

    const handleBlur = useCallback(
        (node: TNode<T>) => {
            handleRenameConfirm(node);
        },
        [handleRenameConfirm]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, node: TNode<T>) => {
            if (event.key === "Enter") {
                handleRenameConfirm(node);
            }

            if (event.key === "Escape") {
                setEditingNodeId(null);
            }
        },
        [handleRenameConfirm]
    );

    return (
        <DndContext.Consumer>
            {({ dragDropManager }) =>
                dragDropManager ? (
                    <DndProvider manager={dragDropManager}>
                        <CustomDragLayer dataSet={dataSetName} />
                        <VList id="vlist" style={{ height: containerHeight }} count={data.length}>
                            {(index) => {
                                const item = data[index];
                                return (
                                    <TreeNode
                                        key={item.id}
                                        node={item}
                                        dataSet={dataSetName}
                                        canAccept={canAccept}
                                        selectedNodeIds={selectedNodeIds}
                                        selectedNodes={selectedNodes}
                                        onClickNode={onClickNode}
                                        onMove={handleMoveNode}
                                        openAll={openAll}
                                        canDrag={canDrag}
                                        canDrop={canDrop}
                                        onDrop={handleOnDrop}
                                        renderNode={renderNode}
                                        editingNodeId={editingNodeId}
                                        onDoubleClickNode={onDoubleClickNode}
                                        handleInputChange={handleInputChange}
                                        handleBlur={handleBlur}
                                        newName={newName}
                                        handleKeyDown={handleKeyDown}
                                    />
                                );
                            }}
                        </VList>
                    </DndProvider>
                ) : (
                    <div> Unable to find dragDropManager </div>
                )
            }
        </DndContext.Consumer>
    );
};
