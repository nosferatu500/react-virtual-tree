import { useEffect, useState } from "react";
import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";
import CustomDragLayer from "./CustomDragLayer";

interface VTreeProps<T> {
    data: TNode<T>[];
    setData: React.Dispatch<React.SetStateAction<TNode<T>[]>>;
    onClick?: (event: React.MouseEvent, node: TNode<T>) => void;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean;
    onDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => void;
    onSelectionChange?: (selectedNodes: TNode<T>[]) => void
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
}: VTreeProps<T>) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<React.Key[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<TNode<T>[]>([]);

    const [lastSelectedNode, setLastSelectedNode] = useState<TNode<T> | null>(null);

    useEffect(() => {
        if (onSelectionChange) {
          onSelectionChange(selectedNodes);
        }
      }, [selectedNodes, onSelectionChange]);

    const findNodeAndRemove = (nodeId: React.Key, targetNodes: TNode[]): TNode | null => {
        for (let i = 0; i < targetNodes.length; i++) {
            const item = targetNodes[i];

            if (item.id === nodeId) {
                return targetNodes.splice(i, 1)[0];
            }

            if (item.children.length > 0) {
                const removedNode = findNodeAndRemove(nodeId, item.children);
                if (removedNode) return removedNode;
            }
        }
        return null;
    };

    const moveNode = (draggedNodeIds: React.Key[], targetNode: TNode, treeData: TNode[]) => {
        const nodesToMove: TNode[] = [];

        draggedNodeIds.forEach((nodeId) => {
            const node = findNodeAndRemove(nodeId, treeData);
            if (node) nodesToMove.push(node);
        });

        if (!nodesToMove.length) return;

        for (const draggedNode of nodesToMove) {
            if (draggedNode.parent !== targetNode.parent) {
                draggedNode.parent = targetNode.parent
            }
        }

        // Add into folder
        if (targetNode.type === "folder") {
            targetNode.children = targetNode.children || [];
            nodesToMove.forEach((node) => targetNode.children.push(node));
        } else {
            // Add on the same level
            const parentNode = findParentNode(targetNode, treeData);
            if (!parentNode) return;

            const targetIndex = parentNode.children.indexOf(targetNode);
            nodesToMove.forEach((node, i) => parentNode.children.splice(targetIndex + 1 + i, 0, node));
        }
    };

    const findParentNode = (node: TNode, treeData: TNode[]): TNode | null => {
        for (const item of treeData) {
            if (item.children.includes(node)) {
                return item;
            }

            if (item.children.length > 0) {
                const parentNode = findParentNode(node, item.children);
                if (parentNode) return parentNode;
            }
        }
        return null;
    };

    function flattenTree<T>(nodes: TNode<T>[], result: TNode<T>[] = []): TNode<T>[] {
        nodes.forEach((node) => {
            result.push(node);
            flattenTree(node.children, result);
        });
        return result;
    }

    const flatTree = flattenTree(data);

    function getAllDescendantIds<T>(node: TNode<T>): React.Key[] {
        let ids: React.Key[] = [];
        node.children.forEach((child) => {
            ids.push(child.id);
            ids = ids.concat(getAllDescendantIds(child));
        });
        return ids;
    }

    const onClickNode = (event: React.MouseEvent, node: TNode<T>) => {
        if (event.metaKey || event.ctrlKey) {

            let result: TNode<T>[]

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

            setSelectedNodeIds(result.map((item) => item.id));
            setSelectedNodes(result);

            if (onClickCallback) {
                onClickCallback(event, node);
            }

            return;
        }

        if (event.shiftKey && lastSelectedNode) {
            if (lastSelectedNode.parent !== node.parent) {
                return;
            }

            // If Shift is pressed, select a range of nodes
            const startIndex = flatTree.findIndex((n) => n.id === lastSelectedNode.id);
            const endIndex = flatTree.findIndex((n) => n.id === node.id);

            // Determine the range direction
            const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

            // Get nodes within the range
            const rangeNodes = flatTree.slice(start, end + 1);

            // Add range nodes and remove any descendant nodes if their parent is included
            const updatedSelected = [...selectedNodes, ...rangeNodes].filter(
                (node, index, self) =>
                    self.findIndex((n) => n.id === node.id) === index // Remove duplicates
            );

            // Remove descendant nodes if their parent is selected
            const descendantIds = updatedSelected.flatMap((n) => getAllDescendantIds(n));
            const result: TNode<T>[] = updatedSelected.filter((n) => !descendantIds.includes(n.id));

            setSelectedNodeIds(result.map((item) => item.id));
            setSelectedNodes(result);

            if (onClickCallback) {
                onClickCallback(event, node);
            }

            return;
        }

        setSelectedNodeIds([node.id]);
        setSelectedNodes([node]);

        setLastSelectedNode(node);

        if (onClickCallback) {
            onClickCallback(event, node);
        }
    };

    const handleMoveNode = (draggedNodeIds: React.Key[], targetNode: TNode) => {
        if (draggedNodeIds.includes(targetNode.id)) return;

        const newTreeData = [...data];
        moveNode(draggedNodeIds, targetNode, newTreeData);
        setData(newTreeData);
    };

    return (
        <DndContext.Consumer>
            {({ dragDropManager }) =>
                dragDropManager ? (
                    <DndProvider manager={dragDropManager}>
                        <CustomDragLayer />
                        <VList id="vlist" style={{ height: 500 }} count={data.length}>
                            {(index) => {
                                const item = data[index];
                                return (
                                    <TreeNode
                                        key={item.id}
                                        node={item}
                                        selectedNodeIds={selectedNodeIds}
                                        selectedNodes={selectedNodes}
                                        onClickNode={onClickNode}
                                        onMove={handleMoveNode}
                                        openAll={openAll}
                                        canDrag={canDrag}
                                        canDrop={canDrop}
                                        onDrop={onDrop}
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

export type * from "./TreeNode";
