import { useContext } from "react";
import { TreeIdContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";

export const useViewState = () => {
    const treeId = useContext(TreeIdContext);
    const context = useContext(VirtualTreeContext);
    return context.viewState[treeId] ?? {};
};
