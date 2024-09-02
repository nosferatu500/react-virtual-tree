import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";

interface VTreeProps {
    data: TNode[];
    setData: React.Dispatch<React.SetStateAction<TNode<unknown>[]>>
    selectedNodes: React.Key[];
    onSelectNode: (event: React.MouseEvent, nodeId: React.Key) => void;
    openAll: boolean
}
export const VTree: React.FC<VTreeProps> = ({ data, setData, selectedNodes, onSelectNode, openAll }: VTreeProps) => {
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
                        <VList id="vlist" style={{ height: 500 }} count={data.length}>
                            {(index) => {
                                const item = data[index];
                                return (
                                    <TreeNode
                                        key={item.id}
                                        node={item}
                                        selectedNodes={selectedNodes}
                                        onSelectNode={onSelectNode}
                                        onMove={handleMoveNode}
                                        openAll={openAll}
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