import { getItemsLinearly } from "../utils";
import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";
import { useViewState } from "./useViewState";

export const useGetLinearItems = () => {
    const { rootItem } = useTreeContext();
    const viewState = useViewState();
    const context = useVirtualTreeContext();
    return () => getItemsLinearly(rootItem, viewState, context.items);
};
