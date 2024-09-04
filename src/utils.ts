import { TNode } from "./TreeNode";

export function flattenTree<T>(nodes: TNode<T>[], result: TNode<T>[] = []): TNode<T>[] {
    nodes.forEach((node) => {
        result.push(node);
        if (node.children.length > 0) {
            flattenTree(node.children, result);
        }
    });
    return result;
}

export function getAllDescendantIds<T>(node: TNode<T>): string[] {
    let ids: string[] = [];
    node.children.forEach((child) => {
        ids.push(child.id);
        ids = ids.concat(getAllDescendantIds(child));
    });
    return ids;
}

function findParentNode(targetNode: TNode, nodes: TNode[]): TNode | null {
    for (const item of nodes) {
        if (item.children.includes(targetNode)) {
            return item;
        }

        if (item.children.length > 0) {
            const parentNode = findParentNode(targetNode, item.children);
            if (parentNode) return parentNode;
        }
    }
    return null;
};

function findNodeAndRemove(nodeId: string, targetNodes: TNode[]): TNode | null {
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

export const moveNode = (draggedNodeIds: string[], targetNode: TNode, treeData: TNode[]) => {
    const nodesToMove: TNode[] = draggedNodeIds
        .map((id) => findNodeAndRemove(id, treeData))
        .filter((node): node is TNode => node !== null);

    if (!nodesToMove.length) return;

    for (const draggedNode of nodesToMove) {
        if (draggedNode.parent !== targetNode.parent) {
            draggedNode.prevParent = draggedNode.parent
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