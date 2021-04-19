// @flow
import React from 'react';
import {computed} from 'mobx';
import type {IObservableValue} from 'mobx';
import jsonpointer from 'json-pointer';
import log from 'loglevel';
import type {FieldTypeProps} from '../../../types';
import ResourceSingleSelect from '../../../containers/ResourceSingleSelect';
import SingleAutoComplete from '../../../containers/SingleAutoComplete';
import SingleSelectionContainer from '../../../containers/SingleSelection';
import userStore from '../../../stores/userStore';
import {translate} from '../../../utils/Translator';

type Value = Object | string | number;
type Props = FieldTypeProps<Value>;

export default class SingleSelection extends React.Component<Props>
{
    constructor(props: Props) {
        super(props);

        if (this.type !== 'list_overlay' && this.type !== 'single_select' && this.type !== 'auto_complete') {
            throw new Error(
                'The Selection field must either be declared as "list_overlay", "single_select" '
                + 'or as "auto_complete", received type was "' + this.type + '"!'
            );
        }
    }

    handleChange = (value: ?Value) => {
        const {onChange, onFinish} = this.props;

        onChange(value);
        onFinish();
    };

    @computed get value(): ?Value {
        const {value, dataPath} = this.props;

        if (this.type === 'auto_complete') {
            // TODO: implement support for id value in auto_complete type
            if (value && typeof value !== 'object') {
                throw new Error(
                    'The "SingleSelection" field of the "auto_complete" type with the path "' + dataPath + '" expects '
                    + 'a serialized object as value. Is it possible that your API returns something else?'
                    + '\n\nThe Sulu form view expects that your API returns the data in the same format as it is sent '
                    + 'to the server when submitting the form.'
                );
            }
        } else {
            if (value && typeof value === 'object') {
                log.warn(
                    'The "SingleSelection" field with the path "' + dataPath + '" expects an id as value but '
                    + 'received an object instead. Is it possible that your API returns a serialized object?'
                    + '\n\nThe Sulu form view expects that your API returns the data in the same format as it is sent '
                    + 'to the server when submitting the form. '
                    + '\nSulu will try to extract the id from the given object heuristically. '
                    + 'This decreases performance and might lead to errors or other unexpected behaviour.'
                );

                return value.id;
            }
        }

        return value;
    }

    @computed get type() {
        const defaultType = this.props.fieldTypeOptions.default_type;
        if (typeof defaultType !== 'string') {
            throw new Error('The "default_type" field-type option must be a string!');
        }

        const {schemaOptions} = this.props;

        const {
            type: {
                value: type = defaultType,
            } = {},
        } = schemaOptions;

        if (typeof type !== 'string') {
            throw new Error('The "type" schema option must be a string!');
        }

        return type;
    }

    @computed get locale(): IObservableValue<string> {
        const {formInspector} = this.props;

        return formInspector.locale ? formInspector.locale : computed(() => userStore.contentLocale);
    }

    @computed get viewName() {
        const {
            fieldTypeOptions: {
                view: {
                    name,
                } = {},
            },
        } = this.props;

        return name;
    }

    @computed get resultToView() {
        const {
            fieldTypeOptions: {
                view: {
                    result_to_view: resultToView,
                } = {},
            },
        } = this.props;

        return resultToView;
    }

    handleItemClick = (itemId: ?string | number, item: ?Object) => {
        const {router} = this.props;

        const {resultToView, viewName} = this;

        if (!router) {
            return;
        }

        router.navigate(
            viewName,
            Object.keys(resultToView).reduce((parameters, resultPath) => {
                parameters[resultToView[resultPath]] = jsonpointer.get(item, '/' + resultPath);
                return parameters;
            }, {})
        );
    };

    render() {
        if (this.type === 'list_overlay') {
            return this.renderListOverlay();
        }

        if (this.type === 'single_select') {
            return this.renderSingleSelect();
        }

        if (this.type === 'auto_complete') {
            return this.renderAutoComplete();
        }

        throw new Error('The "' + this.type + '" type does not exist in the SingleSelection field type.');
    }

    renderListOverlay() {
        const {
            disabled,
            formInspector,
            fieldTypeOptions: {
                resource_key: resourceKey,
                types: {
                    list_overlay: {
                        adapter,
                        detail_options: detailOptions,
                        list_key: listKey,
                        display_properties: displayProperties,
                        empty_text: emptyText,
                        icon,
                        overlay_title: overlayTitle,
                    },
                },
            },
            schemaOptions: {
                form_options_to_list_options: {
                    value: formOptionsToListOptions,
                } = {},
                item_disabled_condition: {
                    value: itemDisabledCondition,
                } = {},
                allow_deselect_for_disabled_items: {
                    value: allowDeselectForDisabledItems = true,
                } = {},
                types: {
                    value: types,
                } = {},
                request_parameters: {
                    value: requestParameters = [],
                } = {},
            } = {},
        } = this.props;

        if (types !== undefined && typeof types !== 'string') {
            throw new Error('The "types" schema option must be a string if given!');
        }

        if (itemDisabledCondition !== undefined && typeof itemDisabledCondition !== 'string') {
            throw new Error('The "item_disabled_condition" schema option must be a string if given!');
        }

        if (allowDeselectForDisabledItems !== undefined && typeof allowDeselectForDisabledItems !== 'boolean') {
            throw new Error('The "allow_deselect_for_disabled_items" schema option must be a boolean if given!');
        }

        if (formOptionsToListOptions && !Array.isArray(formOptionsToListOptions)) {
            throw new Error('The "form_options_to_list_options" option has to be an array if defined!');
        }

        if (!Array.isArray(requestParameters)) {
            throw new Error('The "request_parameters" option has to be an array if defined!');
        }

        const formListOptions = formOptionsToListOptions
            ? formOptionsToListOptions.reduce((currentOptions, formOption) => {
                if (!formOption.name) {
                    throw new Error('All options set in "form_options_to_list_options" must define name!');
                }
                currentOptions[formOption.name] = formInspector.options[formOption.name];

                return currentOptions;
            }, {})
            : undefined;

        const typeOptions = types ? {types} : undefined;

        const listOptions = formListOptions || typeOptions
            ? {
                ...formListOptions,
                ...typeOptions,
            }
            : {};

        if (requestParameters) {
            requestParameters.forEach((parameter) => {
                listOptions[parameter.name] = parameter.value;
                detailOptions[parameter.name] = parameter.value;
            });
        }

        if (detailOptions && typeof detailOptions !== 'object') {
            throw new Error('The "detail_options" option has to be an array if defined!');
        }

        return (
            <SingleSelectionContainer
                adapter={adapter}
                allowDeselectForDisabledItems={!!allowDeselectForDisabledItems}
                detailOptions={detailOptions}
                disabled={!!disabled}
                disabledIds={resourceKey === formInspector.resourceKey && formInspector.id ? [formInspector.id] : []}
                displayProperties={displayProperties}
                emptyText={translate(emptyText)}
                icon={icon}
                itemDisabledCondition={itemDisabledCondition}
                listKey={listKey || resourceKey}
                listOptions={listOptions}
                locale={this.locale}
                onChange={this.handleChange}
                onItemClick={this.viewName && this.resultToView && this.handleItemClick}
                overlayTitle={translate(overlayTitle)}
                resourceKey={resourceKey}
                value={this.value}
            />
        );
    }

    renderSingleSelect() {
        const {
            disabled,
            fieldTypeOptions: {
                resource_key: resourceKey,
                types: {
                    single_select: {
                        display_property: displayProperty,
                        id_property: idProperty,
                        overlay_title: overlayTitle,
                    } = {},
                },
            },
            schemaOptions: {
                editable: {
                    value: editable,
                } = {},
            } = {},
        } = this.props;

        if (typeof displayProperty !== 'string') {
            throw new Error('The "display_property" field-type option must be a string!');
        }

        if (typeof idProperty !== 'string') {
            throw new Error('The "id_property" field-type option must be a string!');
        }

        return (
            <ResourceSingleSelect
                disabled={!!disabled}
                displayProperty={displayProperty}
                editable={!!editable}
                idProperty={idProperty}
                onChange={this.handleChange}
                overlayTitle={translate(overlayTitle)}
                resourceKey={resourceKey}
                value={this.value}
            />
        );
    }

    renderAutoComplete() {
        const {
            disabled,
            dataPath,
            fieldTypeOptions,
            formInspector,
            schemaOptions: {
                data_path_to_auto_complete: {
                    value: dataPathToAutoComplete = [],
                } = {},
            },
        } = this.props;

        if (!fieldTypeOptions.types.auto_complete) {
            throw new Error(
                'The single_selection field needs an "auto_complete" type if rendered as SingleAutoComplete'
            );
        }

        const {
            resource_key: resourceKey,
            types: {
                auto_complete: {
                    display_property: displayProperty,
                    search_properties: searchProperties,
                },
            },
        } = fieldTypeOptions;

        if (!Array.isArray(dataPathToAutoComplete)) {
            throw new Error('The "data_path_to_auto_complete" schemaOption must be an array!');
        }

        const options = dataPathToAutoComplete.reduce((options, schemaEntry) => {
            const {name, value} = schemaEntry;
            if (typeof name !== 'string' || typeof value !== 'string') {
                throw new Error(
                    'An entry of the "data_path_to_auto_complete" schemaOption must provide strings for their name and '
                    + 'value'
                );
            }

            options[value] = formInspector.getValueByPath('/' + name);

            return options;
        }, {});

        return (
            <SingleAutoComplete
                disabled={!!disabled}
                displayProperty={displayProperty}
                id={dataPath}
                onChange={this.handleChange}
                options={options}
                resourceKey={resourceKey}
                searchProperties={searchProperties}
                value={this.value}
            />
        );
    }
}
