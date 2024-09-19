import "./CustomDragPreview.css";

interface CustomDragProps {
    node: {
        isFolder: boolean;
        name: string;
    };
    count: number;
}

const CustomDragPreview = ({ node, count }: CustomDragProps) => {
    return (
        <div className="previewBox">
            {node.isFolder ? "📁" : "📄"} {node.name}
            {count > 1 && <div className="countBadge">{count}</div>}
        </div>
    );
};

export default CustomDragPreview;
