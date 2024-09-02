import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";
import CustomDragLayer from "./CustomDragLayer";

interface VTreeProps<T> {
    data: TNode<T>[];
    setData: React.Dispatch<React.SetStateAction<TNode<T>[]>>
    selectedNodes: React.Key[];
    onClickNode: (event: React.MouseEvent, nodeId: React.Key) => void;
    openAll: boolean
    canDrop?: (dragSource: TNode<T>, dropTarget: TNode<T>) => boolean
}
export const VTree = <T,>({ data, setData, selectedNodes, onClickNode, openAll, canDrop }: VTreeProps<T>) => {
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
                                        selectedNodes={selectedNodes}
                                        onClickNode={onClickNode}
                                        onMove={handleMoveNode}
                                        openAll={openAll}
                                        canDrop={canDrop}
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

export type * from "./TreeNode"