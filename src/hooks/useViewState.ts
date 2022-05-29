import { useContext } from "react";
import { TreeIdContext } from "../VirtualTree";
import { VirtualTreeContext } from "../VirtualTreeContext";

export const useViewState = () => {
    const treeId = useContext(TreeIdContext);
    const virtualTreeContext = useContext(VirtualTreeContext);
    return virtualTreeContext.viewState[treeId] ?? {};
};
