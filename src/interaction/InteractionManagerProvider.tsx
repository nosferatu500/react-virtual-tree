import React, { useMemo } from "react";
import { InteractionManager, InteractionMode } from "../types";
import { useVirtualTreeContext } from "../VirtualTreeContext";
import { ClickArrowToExpandInteractionManager } from "./ClickArrowToExpandInteractionManager";
import { ClickItemToExpandInteractionManager } from "./ClickItemToExpandInteractionManager";

const InteractionManagerContext = React.createContext<InteractionManager>(null as any);
export const useInteractionManager = () => React.useContext(InteractionManagerContext);

export const InteractionManagerProvider: React.FC = (props) => {
    const context = useVirtualTreeContext();

    const interactionManager = useMemo(() => {
        switch (context.defaultInteractionMode ?? InteractionMode.ClickItemToExpand) {
            case InteractionMode.ClickItemToExpand:
                return new ClickItemToExpandInteractionManager(context);
            case InteractionMode.ClickArrowToExpand:
                return new ClickArrowToExpandInteractionManager(context);
            default:
                throw new Error(`Unknown interaction mode ${context.defaultInteractionMode}`);
        }
    }, []); // TODO make sure that context does not need to be refreshed

    return (
        <InteractionManagerContext.Provider value={interactionManager}>
            {props.children}
        </InteractionManagerContext.Provider>
    );
};
