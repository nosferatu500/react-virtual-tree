import { HTMLProps } from "react";
import { isControlKey } from "../isControlKey";
import {
    InteractionManager,
    InteractionMode,
    TreeEnvironmentContextProps,
    TreeItem,
    TreeItemActions,
    TreeItemRenderFlags,
} from "../types";

export class ClickArrowToExpandInteractionManager implements InteractionManager {
    public readonly mode = InteractionMode.ClickItemToExpand;

    private environment: TreeEnvironmentContextProps;

    constructor(environment: TreeEnvironmentContextProps) {
        this.environment = environment;
    }

    createInteractiveElementProps(
        item: TreeItem,
        actions: TreeItemActions,
        renderFlags: TreeItemRenderFlags
    ): HTMLProps<HTMLElement> {
        return {
            onClick: (e) => {
                actions.focusItem();
                if (e.shiftKey) {
                    actions.selectUpTo();
                } else if (isControlKey(e)) {
                    if (renderFlags.isSelected) {
                        actions.unselectItem();
                    } else {
                        actions.addToSelectedItems();
                    }
                } else {
                    actions.selectItem();
                    if (!item.hasChildren || this.environment.canInvokePrimaryActionOnItemContainer) {
                        actions.primaryAction();
                    }
                }

                if (this.environment.onClick) {
                    this.environment.onClick(item);
                }
            },
            onFocus: () => {
                actions.focusItem();
            },
            tabIndex: renderFlags.isFocused ? 0 : -1,
        };
    }
}
