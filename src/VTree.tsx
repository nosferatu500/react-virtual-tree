import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";
import { DndContext, DndProvider } from "react-dnd";

type FileTreeProps = {
    data: TNode[]
    setData: (newData: TNode[]) => void
    selectedNodes: React.Key[]
    onSelectNode: (event: React.MouseEvent, nodeId: React.Key) => void
}
const FileTree: React.FC<FileTreeProps> = ({ data, setData, selectedNodes, onSelectNode }) => {
    const findNodeAndRemove = (nodeId: React.Key, targetNodes: TNode[]): TNode | null => {
        for (let i = 0; i < targetNodes.length; i++) {
            if (targetNodes[i].id === nodeId) {
                return targetNodes.splice(i, 1)[0];
            }

            if (targetNodes[i].children) {
                const removedNode = findNodeAndRemove(nodeId, targetNodes[i].children);
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
        if (targetNode.type === 'folder') {
            targetNode.children = targetNode.children || [];
            nodesToMove.forEach((node) => targetNode.children.push(node));
        } else {
            // Add on the same level
            const parentNode = findParentNode(targetNode, treeData);
            if (!parentNode) return

            const targetIndex = parentNode.children.indexOf(targetNode);
            nodesToMove.forEach((node, i) =>
                parentNode.children.splice(targetIndex + 1 + i, 0, node)
            );
        }
    };

    // Рекурсивно ищем родителя узла
    const findParentNode = (node: TNode, treeData: TNode[]): TNode | null => {
        for (let i = 0; i < treeData.length; i++) {
            if (treeData[i].children && treeData[i].children.includes(node)) {
                return treeData[i];
            }

            if (treeData[i].children) {
                const parentNode = findParentNode(node, treeData[i].children);
                if (parentNode) return parentNode;
            }
        }
        return null;
    };

    const handleMoveNode = (draggedNodeIds: React.Key[], targetNode: TNode) => {
        if (draggedNodeIds.includes(targetNode.id)) return;

        const newTreeData = [...data];
        moveNode(draggedNodeIds, targetNode, newTreeData);
        console.log({ newTreeData })
        setData(newTreeData);
    };

    return (
        <DndContext.Consumer>
            {({ dragDropManager }) =>
                dragDropManager ?
                    <DndProvider manager={dragDropManager}>
                        <VList
                            id="vlist"
                            style={{ height: 500 }}
                            count={data.length}>
                            {(index) => {
                                const item = data[index]
                                return <TreeNode
                                    key={item.id}
                                    node={item}
                                    selectedNodes={selectedNodes}
                                    onSelectNode={onSelectNode}
                                    onMove={handleMoveNode}
                                />
                            }}
                        </VList>
                    </DndProvider>
                    : <div> Unable to find dragDropManager </div>
            }
        </DndContext.Consumer>
    );
};

export default FileTree;