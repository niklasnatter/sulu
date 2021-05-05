// @flow
import {action, computed, observable} from 'mobx';
import type {IObservableValue} from 'mobx/lib/mobx';
import {arrayMove} from '../../utils';
import {ResourceRequester} from '../../services';

export default class MultiSelectionStore<T = string | number, U: {id: T} = Object> {
    @observable items: Array<U> = [];
    @observable loading: boolean = false;
    resourceKey: string;
    locale: ?IObservableValue<string>;
    idFilterParameter: string;
    requestParameters: {[string]: mixed};

    constructor(
        resourceKey: string,
        selectedItemIds: Array<T>,
        locale: ?IObservableValue<string>,
        idFilterParameter: string = 'ids',
        requestParameters: {[string]: mixed} = {}
    ) {
        this.resourceKey = resourceKey;
        this.locale = locale;
        this.idFilterParameter = idFilterParameter;
        this.requestParameters = requestParameters;

        this.loadItems(selectedItemIds);
    }

    @computed get ids(): Array<T> {
        // TODO use metadata instead of hardcoded id
        return this.items.map((item) => item.id);
    }

    @action set(items: Array<U>) {
        this.items = items;
    }

    getById(id: T): ?U {
        // TODO use metadata instead of hardcoded id
        return this.items.find((item) => item.id === id);
    }

    @action removeById(id: T) {
        // TODO use metadata instead of hardcoded id
        this.items.splice(this.items.findIndex((item) => item.id === id), 1);
    }

    @action move(oldItemIndex: number, newItemIndex: number) {
        this.items = arrayMove(this.items, oldItemIndex, newItemIndex);
    }

    @action setLoading(loading: boolean) {
        this.loading = loading;
    }

    setRequestParameters(requestParameters: {[string]: mixed} ) {
        this.requestParameters = requestParameters;
    }

    loadItems(itemIds: ?Array<T>) {
        if (!itemIds || itemIds.length === 0) {
            this.set([]);
            return;
        }

        this.setLoading(true);
        return ResourceRequester.getList(this.resourceKey, {
            ...this.requestParameters,
            locale: this.locale ? this.locale.get() : undefined,
            [this.idFilterParameter]: itemIds.join(','),
            limit: undefined,
            page: 1,
        }).then(action((data) => {
            const items = data._embedded[this.resourceKey];
            // TODO use metadata instead of hardcoded id
            items.sort((item1, item2) => itemIds.indexOf(item1.id) - itemIds.indexOf(item2.id));

            this.set(items);
            this.setLoading(false);
        }));
    }
}
