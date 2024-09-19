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

export function findParentNode<T>(targetNode: TNode<T>, nodes: TNode<T>[]): TNode<T> | null {
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
}

export function findTopmostParentNode<T>(targetNode: TNode<T>, nodes: TNode<T>[]): TNode<T> | null {
    const path: TNode<T>[] = [];

    function findNodePath(currentNode: TNode<T>, target: TNode<T>): boolean {
        path.push(currentNode);

        if (currentNode === target) {
            return true;
        }

        for (const child of currentNode.children) {
            if (findNodePath(child, target)) {
                return true;
            }
        }

        path.pop();
        return false;
    }

    for (const node of nodes) {
        if (findNodePath(node, targetNode)) {
            return path[0];
        }
    }

    return null;
}

export function findNode<T>(nodeId: string, targetNodes: TNode<T>[]): TNode<T> | null {
    for (const item of targetNodes) {
        if (item.id === nodeId) {
            return item;
        }

        if (item.children.length > 0) {
            const foundNode = findNode(nodeId, item.children);
            if (foundNode) return foundNode;
        }
    }

    return null;
}

export function findNodeAndRemove<T>(nodeId: string, targetNodes: TNode<T>[]): TNode<T> | null {
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
}

export function insertNodeBelow<T>(node: TNode<T>, targetNode: TNode<T>, treeData: TNode<T>[]): void {
    const parentNode = findParentNode(targetNode, treeData);
    if (!parentNode) return;

    const targetIndex = parentNode.children.indexOf(targetNode);
    parentNode.children.splice(targetIndex + 1, 0, node);
}

export const moveNode = <T>(
    draggedNodes: TNode<T>[],
    targetNode: TNode<T>,
    treeData: TNode<T>[],
    fileExplorerMode = true,
    drop: string,
    sourceTreeId: string,
    destinationTreeId: string
) => {
    const nodesToMove: TNode<T>[] = [];

    if (sourceTreeId === destinationTreeId) {
        const result: TNode<T>[] = draggedNodes
            .map((item) => findNodeAndRemove(item.id, treeData))
            .filter((node): node is TNode<T> => node !== null);

        if (!result.length) return;

        nodesToMove.push(...result);

        // Update parents data
        if (fileExplorerMode) {
            for (const draggedNode of nodesToMove) {
                if (!draggedNode.isFolder && !targetNode.isFolder) {
                    if (draggedNode.parent !== targetNode.parent) {
                        draggedNode.prevParent = draggedNode.parent;
                        draggedNode.parent = targetNode.parent;
                    }
                } else if (
                    (!draggedNode.isFolder && targetNode.isFolder) ||
                    (draggedNode.isFolder && targetNode.isFolder)
                ) {
                    if (draggedNode.parent !== targetNode.id) {
                        draggedNode.prevParent = draggedNode.parent;
                        draggedNode.parent = targetNode.id;
                    }
                }
            }
        } else {
            for (const draggedNode of nodesToMove) {
                if (draggedNode.parent !== targetNode.id) {
                    draggedNode.prevParent = draggedNode.parent;
                    draggedNode.parent = targetNode.id;
                }
            }
        }
    } else {
        nodesToMove.push(...draggedNodes);

        // Update parents data
        if (fileExplorerMode) {
            for (const draggedNode of nodesToMove) {
                if (!draggedNode.isFolder && !targetNode.isFolder) {
                    draggedNode.prevParent = targetNode.parent;
                    draggedNode.parent = targetNode.parent;
                } else if (
                    (!draggedNode.isFolder && targetNode.isFolder) ||
                    (draggedNode.isFolder && targetNode.isFolder)
                ) {
                    draggedNode.prevParent = targetNode.id;
                    draggedNode.parent = targetNode.id;
                }
            }
        } else {
            for (const draggedNode of nodesToMove) {
                draggedNode.prevParent = targetNode.id;
                draggedNode.parent = targetNode.id;
            }
        }
    }

    if (fileExplorerMode) {
        // Add into folder
        if (targetNode.isFolder) {
            nodesToMove.forEach((node) => targetNode.children.push(node));
        } else {
            // Add on the same level
            const parentNode = findParentNode(targetNode, treeData);
            if (!parentNode) return;

            const targetIndex = parentNode.children.indexOf(targetNode);
            nodesToMove.forEach((node, i) => parentNode.children.splice(targetIndex + 1 + i, 0, node));
        }
    } else {
        if (drop === "child") {
            // Add into folder/node
            nodesToMove.forEach((node) => targetNode.children.push(node));
        } else {
            // Add on the same level (below)
            const parentNode = findParentNode(targetNode, treeData);
            if (!parentNode) return;

            const targetIndex = parentNode.children.indexOf(targetNode);
            const offset = drop === "below" ? 1 : 0;
            nodesToMove.forEach((node, i) => parentNode.children.splice(targetIndex + offset + i, 0, node));
        }
    }
};

export const renameNode = <T>(nodeId: string, newName: string, treeData: TNode<T>[]) => {
    const selectedNode = findNode(nodeId, treeData);
    if (!selectedNode) return;

    selectedNode.name = newName;
};
