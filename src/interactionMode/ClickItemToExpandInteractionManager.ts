import { HTMLProps } from "react";
import {
    InteractionManager,
    InteractionMode,
    TreeEnvironmentContextProps,
    TreeItem,
    TreeItemActions,
    TreeItemRenderFlags,
} from "../types";

export class ClickItemToExpandInteractionManager implements InteractionManager {
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
                } else if (e.ctrlKey) {
                    if (renderFlags.isSelected) {
                        actions.unselectItem();
                    } else {
                        actions.addToSelectedItems();
                    }
                } else {
                    if (item.hasChildren) {
                        actions.toggleExpandedState();
                    }
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
