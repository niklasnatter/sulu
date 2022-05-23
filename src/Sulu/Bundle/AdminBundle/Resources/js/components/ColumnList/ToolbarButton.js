// @flow
import React from 'react';
import classNames from 'classnames';
import Icon from '../Icon';
import toolbarStyles from './toolbar.scss';
import type {ToolbarButton as ToolbarButtonProps} from './types';

export default class ToolbarButton extends React.Component<ToolbarButtonProps> {
    static defaultProps = {
        skin: 'primary',
    };

    handleClick = () => {
        this.props.onClick();
    };

    render = () => {
        const {icon, skin} = this.props;

        const className = classNames(
            toolbarStyles.item,
            toolbarStyles[skin]
        );

        return (
            <button className={className} onClick={this.handleClick} type="button">
                <Icon name={icon} />
            </button>
        );
    };
}
