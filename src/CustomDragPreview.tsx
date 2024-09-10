import { TNode } from "./TreeNode";
import "./CustomDragPreview.css";

interface CustomDragProps<T> {
    node: TNode<T>;
    count: number;
}

const CustomDragPreview = <T,>({ node, count }: CustomDragProps<T>) => {
    return (
        <div className="previewBox">
            {node.isFolder ? "📁" : "📄"} {node.name}
            {count > 1 && <div className="countBadge">{count}</div>}
        </div>
    );
};

export default CustomDragPreview;
