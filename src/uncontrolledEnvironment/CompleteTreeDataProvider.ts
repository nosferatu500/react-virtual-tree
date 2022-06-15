import { Disposable, ExplicitDataSource, TreeDataProvider, TreeItem, TreeItemIndex } from "../types";

export class CompleteTreeDataProvider<T = any> implements Required<TreeDataProvider<T>> {
    private provider: TreeDataProvider;

    constructor(provider: TreeDataProvider) {
        this.provider = provider;
    }

    public getAllData() {
        return this.provider.getAllData();
    }

    public async onChangeItemChildren(itemId: TreeItemIndex, newChildren: TreeItemIndex[]): Promise<void> {
        return this.provider.onChangeItemChildren?.(itemId, newChildren);
    }

    public onDidChangeTreeData(listener: (changedItemIds: TreeItemIndex[]) => void): Disposable {
        return this.provider.onDidChangeTreeData ? this.provider.onDidChangeTreeData(listener) : { dispose: () => {} };
    }
}
