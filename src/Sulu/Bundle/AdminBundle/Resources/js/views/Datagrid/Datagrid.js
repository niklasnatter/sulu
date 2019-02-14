// @flow
import type {IObservableValue} from 'mobx'; // eslint-disable-line import/named
import {action, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import type {ElementRef} from 'react';
import React from 'react';
import {default as DatagridContainer} from '../../containers/Datagrid';
import SingleDatagridOverlay from '../../containers/SingleDatagridOverlay';
import DatagridStore from '../../containers/Datagrid/stores/DatagridStore';
import {withToolbar} from '../../containers/Toolbar';
import type {ViewProps} from '../../containers/ViewRenderer';
import type {Route} from '../../services/Router/types';
import {translate} from '../../utils/Translator';
import datagridStyles from './datagrid.scss';

const USER_SETTINGS_KEY = 'datagrid';

@observer
class Datagrid extends React.Component<ViewProps> {
    page: IObservableValue<number> = observable.box();
    locale: IObservableValue<string> = observable.box();
    datagridStore: DatagridStore;
    datagrid: ?ElementRef<typeof DatagridContainer>;
    @observable deleting: boolean = false;
    @observable moving: boolean = false;
    @observable showMoveOverlay: boolean = false;

    static getDerivedRouteAttributes(route: Route) {
        const {
            options: {
                resourceKey,
            },
        } = route;

        return {
            active: DatagridStore.getActiveSetting(resourceKey, USER_SETTINGS_KEY),
            sortColumn: DatagridStore.getSortColumnSetting(resourceKey, USER_SETTINGS_KEY),
            sortOrder: DatagridStore.getSortOrderSetting(resourceKey, USER_SETTINGS_KEY),
            limit: DatagridStore.getLimitSetting(resourceKey, USER_SETTINGS_KEY),
        };
    }

    constructor(props: ViewProps) {
        super(props);

        const router = this.props.router;
        const {
            attributes,
            route: {
                options: {
                    adapters,
                    apiOptions = {},
                    datagridKey,
                    locales,
                    resourceKey,
                    routerAttributesToDatagridStore = {},
                },
            },
        } = router;

        if (!resourceKey) {
            throw new Error('The route does not define the mandatory "resourceKey" option');
        }

        if (!datagridKey) {
            throw new Error('The route does not define the mandatory "datagridKey" option');
        }

        if (!adapters) {
            throw new Error('The route does not define the mandatory "adapters" option');
        }

        const observableOptions = {};

        router.bind('page', this.page, 1);
        observableOptions.page = this.page;

        if (locales) {
            router.bind('locale', this.locale);
            observableOptions.locale = this.locale;
        }

        const datagridStoreOptions = this.buildDatagridStoreOptions(
            apiOptions,
            attributes,
            routerAttributesToDatagridStore
        );

        this.datagridStore = new DatagridStore(
            resourceKey,
            datagridKey,
            USER_SETTINGS_KEY,
            observableOptions,
            datagridStoreOptions
        );

        router.bind('active', this.datagridStore.active);
        router.bind('sortColumn', this.datagridStore.sortColumn);
        router.bind('sortOrder', this.datagridStore.sortOrder);
        router.bind('search', this.datagridStore.searchTerm);
        router.bind('limit', this.datagridStore.limit, 10);
    }

    buildDatagridStoreOptions(
        apiOptions: Object,
        attributes: Object,
        routerAttributesToDatagridStore: {[string | number]: string}
    ) {
        const datagridStoreOptions = apiOptions ? apiOptions : {};

        routerAttributesToDatagridStore = toJS(routerAttributesToDatagridStore);
        Object.keys(routerAttributesToDatagridStore).forEach((key) => {
            const attributeName = routerAttributesToDatagridStore[key];
            const datagridOptionKey = isNaN(key) ? key : routerAttributesToDatagridStore[key];

            datagridStoreOptions[datagridOptionKey] = attributes[attributeName];
        });

        return datagridStoreOptions;
    }

    componentWillUnmount() {
        this.datagridStore.destroy();
    }

    handleItemAdd = (rowId: string | number) => {
        const {router} = this.props;
        const {
            route: {
                options: {
                    addRoute,
                },
            },
        } = router;

        router.navigate(addRoute, {locale: this.locale.get(), parentId: rowId});
    };

    handleEditClick = (rowId: string | number) => {
        const {router} = this.props;
        router.navigate(router.route.options.editRoute, {id: rowId, locale: this.locale.get()});
    };

    setDatagridRef = (datagrid: ?ElementRef<typeof DatagridContainer>) => {
        this.datagrid = datagrid;
    };

    @action handleMoveOverlayClose = () => {
        this.showMoveOverlay = false;
    };

    @action handleMoveOverlayConfirm = (item: Object) => {
        this.moving = true;

        this.datagridStore.moveSelection(item.id).then(action(() => {
            this.moving = false;
            this.showMoveOverlay = false;
        }));
    };

    render() {
        const {
            route: {
                options: {
                    adapters,
                    addRoute,
                    editRoute,
                    movable,
                    searchable,
                    title,
                },
            },
        } = this.props.router;

        return (
            <div>
                <DatagridContainer
                    adapters={adapters}
                    header={title && <h1 className={datagridStyles.header}>{translate(title)}</h1>}
                    onItemAdd={addRoute && this.handleItemAdd}
                    onItemClick={editRoute && this.handleEditClick}
                    ref={this.setDatagridRef}
                    searchable={searchable}
                    store={this.datagridStore}
                />
                {movable &&
                    <SingleDatagridOverlay
                        adapter="column_list"
                        allowActivateForDisabledItems={false}
                        clearSelectionOnClose={true}
                        confirmLoading={this.moving}
                        datagridKey={this.datagridStore.datagridKey}
                        disabledIds={this.datagridStore.selectionIds}
                        locale={this.locale}
                        onClose={this.handleMoveOverlayClose}
                        onConfirm={this.handleMoveOverlayConfirm}
                        open={this.showMoveOverlay}
                        options={{includeRoot: true}}
                        reloadOnOpen={true}
                        resourceKey={this.datagridStore.resourceKey}
                        title={translate('sulu_admin.move_items')}
                    />
                }
            </div>
        );
    }
}

export default withToolbar(Datagrid, function() {
    const {router} = this.props;

    const {
        route: {
            options: {
                backRoute,
                addRoute,
                locales,
                movable,
            },
        },
    } = router;

    const backButton = backRoute
        ? {
            onClick: () => {
                const options = {};
                if (this.locale) {
                    options.locale = this.locale.get();
                }
                router.restore(backRoute, options);
            },
        }
        : undefined;
    const locale = locales
        ? {
            value: this.locale.get(),
            onChange: action((locale) => {
                this.locale.set(locale);
            }),
            options: locales.map((locale) => ({
                value: locale,
                label: locale,
            })),
        }
        : undefined;

    const items = [];

    if (addRoute) {
        items.push({
            icon: 'su-plus-circle',
            label: translate('sulu_admin.add'),
            onClick: this.handleItemAdd,
            type: 'button',
        });
    }

    items.push({
        disabled: this.datagridStore.selectionIds.length === 0,
        icon: 'su-trash-alt',
        label: translate('sulu_admin.delete'),
        loading: this.datagridStore.selectionDeleting,
        onClick: this.datagrid.requestSelectionDelete,
        type: 'button',
    });

    if (movable) {
        items.push({
            disabled: this.datagridStore.selectionIds.length === 0,
            icon: 'su-arrows-alt',
            label: translate('sulu_admin.move_selected'),
            onClick: action(() => {
                this.showMoveOverlay = true;
            }),
            type: 'button',
        });
    }

    return {
        backButton,
        locale,
        items,
    };
});
