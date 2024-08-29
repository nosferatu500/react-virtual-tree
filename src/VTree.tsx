import { VList } from "virtua";
import { TNode, TreeNode } from "./TreeNode";

type FileTreeProps = {
    data: TNode[]
    setData: (newData: TNode[]) => void
}
const FileTree: React.FC<FileTreeProps> = ({ data, setData }) => {
    const findNodeAndRemove = (node: TNode, targetNodes: TNode[]): TNode | null => {
        for (let i = 0; i < targetNodes.length; i++) {
            if (targetNodes[i].id === node.id) {
                return targetNodes.splice(i, 1)[0];
            }
            
            if (targetNodes[i].children) {
                const removedNode = findNodeAndRemove(node, targetNodes[i].children);
                if (removedNode) return removedNode;
            }
        }
        return null;
    };

    const moveNode = (draggedNode: TNode, targetNode: TNode, treeData: TNode[]) => {
        // Удаляем узел из текущего положения
        const nodeToMove = findNodeAndRemove(draggedNode, treeData);
        if (!nodeToMove) return;

        // Если targetNode - это папка, добавляем внутрь
        if (targetNode.type === 'folder') {
            targetNode.children = targetNode.children || [];
            targetNode.children.push(nodeToMove);
        } else {
            // Иначе добавляем в одно и то же родительское место
            const parentNode = findParentNode(targetNode, treeData);
            if (!parentNode) return

            const targetIndex = parentNode.children.indexOf(targetNode);
            parentNode.children.splice(targetIndex + 1, 0, nodeToMove);
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

    const handleMoveNode = (draggedNode: TNode, targetNode: TNode) => {
        if (draggedNode.id === targetNode.id) return;
        
        const newTreeData = [...data];
        moveNode(draggedNode, targetNode, newTreeData);
        console.log({newTreeData})
        setData(newTreeData);
    };

    return (
        <VList
            id="vlist"
            // ref={this.listRef}
            // dragDropManager={dragDropManager}
            style={{ height: 500 }}
            count={data.length}>
            {(index) => {
                const item = data[index]
                return <TreeNode key={item.id} node={item} onMove={handleMoveNode} />
            }}
        </VList>
    );
};

export default FileTree;