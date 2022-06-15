import { EventEmitter } from "../EventEmitter";
import { Disposable, ExplicitDataSource, TreeDataProvider, TreeItem, TreeItemIndex } from "../types";

export class StaticTreeDataProvider<T = any> implements TreeDataProvider {
    private data: ExplicitDataSource;

    private onDidChangeTreeDataEmitter = new EventEmitter<TreeItemIndex[]>();

    constructor(items: Record<TreeItemIndex, TreeItem<T>>) {
        this.data = { items };
    }

    public getAllData() {
        return this.data.items;
    }

    public async onChangeItemChildren(itemId: TreeItemIndex, newChildren: TreeItemIndex[]): Promise<void> {
        if (!this.data.items[itemId]) return;
        this.data.items[itemId].children = newChildren;
        this.onDidChangeTreeDataEmitter.emit([itemId]);
    }

    public onDidChangeTreeData(listener: (changedItemIds: TreeItemIndex[]) => void): Disposable {
        const handlerId = this.onDidChangeTreeDataEmitter.on((payload) => listener(payload));
        return { dispose: () => this.onDidChangeTreeDataEmitter.off(handlerId) };
    }
}
