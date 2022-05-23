// @flow
import React from 'react';
import classNames from 'classnames';
import Icon from '../Icon';
import tableStyles from './table.scss';
import type {Node} from 'react';
import type {SortOrder, Width} from './types';

const ASCENDING_ICON = 'su-angle-up';
const DESCENDING_ICON = 'su-angle-down';

type Props = {|
    children?: Node,
    className?: string,
    name?: string,
    /** Called when column was clicked */
    onClick?: (sortColumn: string, sortOrder: SortOrder) => void, // TODO extract order to own type file
    /** If set, an indicator will show up */
    sortOrder?: ?SortOrder,
    width?: Width,
|};

export default class HeaderCell extends React.PureComponent<Props> {
    static defaultProps = {
        width: 'auto',
    };

    getSortOrderIcon = () => {
        const {sortOrder} = this.props;

        switch (sortOrder) {
            case 'asc':
                return (<Icon className={tableStyles.headerCellSortIcon} name={ASCENDING_ICON} />);
            case 'desc':
                return (<Icon className={tableStyles.headerCellSortIcon} name={DESCENDING_ICON} />);
            default:
                return null;
        }
    };

    handleOnClick = () => {
        const {name, onClick, sortOrder} = this.props;
        if (onClick && name) {
            onClick(name, sortOrder === 'asc' ? 'desc' : 'asc');
        }
    };

    render() {
        const {
            onClick,
            children,
            className,
            width,
        } = this.props;
        const headerCellClass = classNames(
            className,
            tableStyles.headerCell,
            {
                [tableStyles.clickable]: !!onClick,
            },
            {
                [tableStyles[width]]: width !== 'auto',
            }
        );

        return (
            <th className={headerCellClass}>
                {!onClick &&
                    <span>{children}</span>
                }
                {onClick &&
                    <button
                        onClick={this.handleOnClick}
                        type="button"
                    >
                        {children}
                        {this.getSortOrderIcon()}
                    </button>
                }
            </th>
        );
    }
}
