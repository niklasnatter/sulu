// @flow
import React from 'react';
import {observer} from 'mobx-react';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import userStore from 'sulu-admin-bundle/stores/UserStore';
import {computed} from 'mobx';
import SingleMediaSelectionComponent from '../../SingleMediaSelection';
import type {Value} from '../../SingleMediaSelection';

@observer
export default class SingleMediaSelection extends React.Component<FieldTypeProps<Value>> {
    handleChange = (value: Value) => {
        const {onChange, onFinish} = this.props;

        onChange(value);
        onFinish();
    };

    render() {
        const {formInspector, disabled, value} = this.props;
        const locale = formInspector && formInspector.locale
            ? formInspector.locale
            : computed(() => userStore.contentLocale);

        return (
            <SingleMediaSelectionComponent
                disabled={!!disabled}
                locale={locale}
                onChange={this.handleChange}
                value={value ? value : undefined}
            />
        );
    }
}
