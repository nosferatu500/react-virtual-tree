import { Disposable, TreeDataProvider, TreeItem, TreeItemIndex } from "../types";

export class CompleteDataProvider implements Required<TreeDataProvider> {
    private provider: TreeDataProvider;

    constructor(provider: TreeDataProvider) {
        this.provider = provider;
    }

    public getData() {
        return this.provider.getData();
    }

    public async getItem(itemId: TreeItemIndex): Promise<TreeItem> {
        return this.provider.getItem(itemId);
    }

    public async getItems(itemIds: TreeItemIndex[]): Promise<TreeItem[]> {
        console.log(this, this.provider);
        return this.provider.getItems
            ? this.provider.getItems(itemIds)
            : Promise.all(itemIds.map((id) => this.provider.getItem(id)));
    }

    public async onChangeItemChildren(itemId: TreeItemIndex, newChildren: TreeItemIndex[]): Promise<void> {
        return this.provider.onChangeItemChildren?.(itemId, newChildren);
    }

    public componentDidUpdate(listener: (changedItemIds: TreeItemIndex[]) => void): Disposable {
        return this.provider.componentDidUpdate ? this.provider.componentDidUpdate(listener) : { dispose: () => {} };
    }

    public async onRenameItem(item: TreeItem, name: string): Promise<void> {
        return this.provider.onRenameItem?.(item, name);
    }
}
