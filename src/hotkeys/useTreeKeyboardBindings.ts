import { useContext } from "react";
import { useMoveFocusToIndex } from "../hooks/useMoveFocusToIndex";
import { useViewState } from "../hooks/useViewState";
import { TreeContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";
import { useHotkey } from "./useHotkey";
import { useKey } from "./useKey";

export const useTreeKeyboardBindings = (containerRef?: HTMLElement | HTMLDivElement | null) => {
    const viewState = useViewState();
    const { treeId } = useContext(TreeContext);
    const context = useContext(VirtualTreeContext);
    const moveFocusToIndex = useMoveFocusToIndex(containerRef);

    const isActiveTree = context.activeTreeId === treeId;

    useKey('arrowdown', (e) => {
        e.preventDefault();
        moveFocusToIndex(currentIndex => currentIndex + 1);
    }, isActiveTree);
    
    useKey('arrowup', (e) => {
        e.preventDefault();
        moveFocusToIndex(currentIndex => currentIndex - 1);
    }, isActiveTree);
    
    useHotkey('moveFocusToFirstItem', e => {
        e.preventDefault();
        moveFocusToIndex(() => 0);
    }, isActiveTree);
    
    useHotkey('moveFocusToLastItem', e => {
        e.preventDefault();
        moveFocusToIndex((currentIndex, linearItems) => linearItems.length - 1);
    }, isActiveTree);

    useKey('arrowright', (e) => {
        e.preventDefault();
        moveFocusToIndex((currentIndex, linearItems) => {
            const item = context.items[linearItems[currentIndex].item];
            if (item.isFolder) {
                if (viewState.expandedItems?.includes(item.index)) {
                    return currentIndex + 1;
                } else {
                    context.onExpandItem?.(item, treeId);
                }
            }
            return currentIndex;
        });
    }, isActiveTree);

    useKey('arrowleft', (e) => {
        e.preventDefault();
        moveFocusToIndex((currentIndex, linearItems) => {
            const item = context.items[linearItems[currentIndex].item];
            const itemDepth = linearItems[currentIndex].depth;
            if (item.isFolder && viewState.expandedItems?.includes(item.index)) {
                context.onCollapseItem?.(item, treeId);
            } else if (itemDepth > 0) {
                let parentIndex = currentIndex;
                for (parentIndex; linearItems[parentIndex].depth !== itemDepth - 1; parentIndex--);
                return parentIndex;
            }
            return currentIndex;
        });
    }, isActiveTree);
} 