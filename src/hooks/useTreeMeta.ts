import { useMemo } from "react";
import { TreeMeta, VirtualTreeContextProps } from "../types";
import { useVirtualTreeContext } from "../VirtualTreeContext";

const createTreeMeta = (context: VirtualTreeContextProps, treeId: string, search: string | null): TreeMeta => ({
    isFocused: context.activeTreeId === treeId,
    isRenaming: context.viewState[treeId]?.renamingItem !== undefined,
    areItemsSelected: (context.viewState[treeId]?.selectedItems?.length ?? 0) > 0,
    isSearching: search !== null,
    search,
});

const createTreeMetaDeps = (context: VirtualTreeContextProps, treeId: string, search: string | null) => [
    context.activeTreeId,
    context.viewState[treeId]?.renamingItem,
    context.viewState[treeId]?.selectedItems,
    treeId,
    search,
];

export const useTreeMeta = (treeId: string, search: string | null) => {
    const context = useVirtualTreeContext();
    return useMemo(() => createTreeMeta(context, treeId, search), createTreeMetaDeps(context, treeId, search));
};
