import { ClickArrowToExpandInteractionManager } from "../interactionMode/ClickArrowToExpandInteractionManager";
import { ClickItemToExpandInteractionManager } from "../interactionMode/ClickItemToExpandInteractionManager";
import { InteractionMode, TreeEnvironmentContextProps } from "../types";

export const buildInteractionMode = (mode: InteractionMode, environment: TreeEnvironmentContextProps) => {
    switch (mode) {
        case InteractionMode.ClickItemToExpand:
            return new ClickItemToExpandInteractionManager(environment);
        case InteractionMode.ClickArrowToExpand:
            return new ClickArrowToExpandInteractionManager(environment);
        default:
            throw new Error(`Unknown interaction mode ${mode}`);
    }
};
