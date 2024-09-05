import { useState } from "react";
import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";
import CustomDragLayer from "./CustomDragLayer";
import { flattenTree, getAllDescendantIds, moveNode } from "./utils";

interface VTreeProps<T> {
    data: TNode<T>[];
    setData: React.Dispatch<React.SetStateAction<TNode<T>[]>>;
    onClick?: (event: React.MouseEvent, node: TNode<T>) => void;
    containerHeight?: number;
    allwaysOpenRoot?: boolean;
    openAll?: boolean;
    canDrag?: (dragSource: TNode<T>) => boolean;
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean;
    onDrop?: (draggedNodes: TNode<T>[], dropTarget: TNode<T>) => void;
    onSelectionChange?: (selectedNodes: TNode<T>[]) => void
    renderNode?: (text: string) => React.ReactNode;
}

export const VTree = <T,>({
    data,
    setData,
    onClick: onClickCallback,
    allwaysOpenRoot = true,
    openAll,
    canDrag,
    canDrop,
    onDrop,
    onSelectionChange,
    containerHeight = 500,
    renderNode,
}: VTreeProps<T>) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<TNode<T>[]>([]);

    const [lastSelectedNode, setLastSelectedNode] = useState<TNode<T> | null>(null);

    const flattenedData = flattenTree(data);

    const handleNodeSelection = (nodes: TNode<T>[]) => {
        if (onSelectionChange) {
            onSelectionChange(nodes);
        }

        setSelectedNodes(nodes);
        setSelectedNodeIds(nodes.map((item) => item.id))
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

            handleNodeSelection(result);

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
            const startIndex = flattenedData.findIndex((n) => n.id === lastSelectedNode.id);
            const endIndex = flattenedData.findIndex((n) => n.id === node.id);

            // Determine the range direction
            const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

            // Get nodes within the range
            const rangeNodes = flattenedData.slice(start, end + 1);

            // Add range nodes and remove any descendant nodes if their parent is included
            const updatedSelected = [...selectedNodes, ...rangeNodes].filter(
                (node, index, self) =>
                    self.findIndex((n) => n.id === node.id) === index // Remove duplicates
            );

            // Remove descendant nodes if their parent is selected
            const descendantIds = updatedSelected.flatMap((n) => getAllDescendantIds(n));
            const result: TNode<T>[] = updatedSelected.filter((n) => !descendantIds.includes(n.id));

            handleNodeSelection(result);

            if (onClickCallback) {
                onClickCallback(event, node);
            }

            return;
        }

        handleNodeSelection([node]);

        setLastSelectedNode(node);

        if (onClickCallback) {
            onClickCallback(event, node);
        }
    };

    const handleMoveNode = (draggedNodeIds: string[], targetNode: TNode) => {
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
                        <VList id="vlist" style={{ height: containerHeight }} count={data.length}>
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
                                        allwaysOpenRoot={allwaysOpenRoot}
                                        openAll={openAll}
                                        canDrag={canDrag}
                                        canDrop={canDrop}
                                        onDrop={onDrop}
                                        renderNode={renderNode}
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
