import { FormHTMLAttributes, HTMLProps, InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { useHotkey } from "./hotkeys/useHotkey";
import { TreeItemIndex } from "./types";
import { useTreeContext } from "./VirtualTree";
import { useVirtualTreeContext } from "./VirtualTreeContext";

export const TreeItemRenamingInput: React.FC<{
    itemIndex: TreeItemIndex;
}> = (props) => {
    const { renderer, treeMeta, setRenamingItem, treeId } = useTreeContext();
    const context = useVirtualTreeContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const item = context.items[props.itemIndex];
    const [title, setTitle] = useState(context.getItemTitle(item));

    const abort = () => {
        setRenamingItem(null);
        requestAnimationFrame(() => {
            context.setActiveTree(treeId);
        });
    };

    const confirm = () => {
        context.onRenameItem?.(item, title, treeMeta.treeId);
        setRenamingItem(null);
        requestAnimationFrame(() => {
            context.setActiveTree(treeId);
        });
    };

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        context.setActiveTree(treeId);
    }, [inputRef.current]);

    useHotkey("abortRenameItem", (e) => {
        abort();
    });

    const inputProps: InputHTMLAttributes<HTMLInputElement> = {
        value: title,
        onChange: (e) => {
            console.log("here")
            setTitle(e.target.value);
        },
        onBlur: () => {
            abort();
        },
        "aria-label": `New item name`, // TODO
        tabIndex: 0,
    };

    const submitButtonProps: HTMLProps<any> = {
        onClick: (e) => {
            e.stopPropagation();
            confirm();
        },
    };

    const formProps: FormHTMLAttributes<HTMLFormElement> = {
        onSubmit: (e) => {
            e.preventDefault();
            confirm();
        },
    };

    return renderer.renderRenameInput({
        item,
        inputRef,
        submitButtonProps,
        formProps,
        inputProps,
    }) as JSX.Element;
};
