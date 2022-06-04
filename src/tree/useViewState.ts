import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useTree } from "./Tree";

export const useViewState = () => {
    const { treeId } = useTree();
    const { viewState } = useTreeEnvironment();
    return viewState[treeId] ?? {};
};
