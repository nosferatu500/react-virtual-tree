import { useTreeContext } from "../VirtualTree";
import { useVirtualTreeContext } from "../VirtualTreeContext";

export const useViewState = () => {
    const { treeId } = useTreeContext();
    const context = useVirtualTreeContext();
    return context.viewState[treeId] ?? {};
};
