import { getItemsLinearly } from "../utils";
import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";
import { useGetLinearItems } from "./useGetLinearItems";
import { useViewState } from "./useViewState";

export const useMoveFocusToIndex = (containerRef?: HTMLElement | HTMLDivElement | null) => {
    const { treeId } = useTreeContext();
    const context = useVirtualTreeContext();
    const getLinearItems = useGetLinearItems();
    const viewState = useViewState();

    return (computeNewIndex: (currentIndex: number, linearItems: ReturnType<typeof getItemsLinearly>) => number) => {
        const linearItems = getLinearItems();
        const currentIndex = linearItems.findIndex((item) => item.item === viewState.focusedItem) ?? 0;
        const newIndex = computeNewIndex(currentIndex, linearItems);
        const newIndexBounded = Math.max(0, Math.min(linearItems.length - 1, newIndex));
        context.onFocusItem?.(context.items[linearItems[newIndexBounded].item], treeId);
    };
};
