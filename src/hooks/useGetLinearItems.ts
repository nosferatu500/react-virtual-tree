import { useContext } from "react";
import { getItemsLinearly } from "../utils";
import { VirtualTreeContext } from "../VirtualTreeContext";
import { useViewState } from "./useViewState";

export const useGetLinearItems = (treeId: string, rootItem: string) => {
    const viewState = useViewState();
    const context = useContext(VirtualTreeContext);
    return () => getItemsLinearly(rootItem, viewState, context.items);
};
