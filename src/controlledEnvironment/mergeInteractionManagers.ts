import { InteractionManager } from "../types";

export const mergeInteractionManagers = (
    main: InteractionManager,
    fallback: InteractionManager
): InteractionManager => ({
    mode: main.mode,
    createInteractiveElementProps: (item, actions, renderFlags) => ({
        ...fallback.createInteractiveElementProps(item, actions, renderFlags),
        ...main.createInteractiveElementProps(item, actions, renderFlags),
    }),
});
