import { useDragLayer, XYCoord } from "react-dnd";
import { TNode } from "./TreeNode";
import CustomDragPreview from "./CustomDragPreview";

interface DragLayerProps<T> {
    item: {
        node: TNode<T>;
        count: number;
    };
    isDragging: boolean;
    initialOffset: XYCoord | null;
    currentOffset: XYCoord | null;
    itemType: string | symbol | null;
}

const getItemStyles = (initialOffset: XYCoord | null, currentOffset: XYCoord | null): React.CSSProperties => {
    if (!initialOffset || !currentOffset) {
        return { display: "none" };
    }

    const { x, y } = currentOffset;

    return {
        position: "fixed",
        pointerEvents: "none",
        top: y,
        left: x,
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
    };
};

const CustomDragLayer = <T,>({ dataSet }: { dataSet: string }) => {
    const { item, itemType, isDragging, initialOffset, currentOffset } = useDragLayer<DragLayerProps<T>>((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        isDragging: monitor.isDragging(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getClientOffset(),
    }));

    const itemStyles = getItemStyles(initialOffset, currentOffset);

    // Do not render if not dragging
    if (!isDragging || !item || itemType !== dataSet) return null;

    return (
        <div style={itemStyles}>
            <CustomDragPreview node={item.node} count={item.count} />
        </div>
    );
};

export default CustomDragLayer;
