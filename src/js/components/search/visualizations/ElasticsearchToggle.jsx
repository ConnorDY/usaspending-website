import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    elasticsearch: PropTypes.bool,
    setSearchViewElasticsearch: PropTypes.func
};

export default class ElasticsearchToggle extends React.Component {
    constructor(props) {
        super(props);

        this.toggledSwitch = this.toggledSwitch.bind(this);
    }
    toggledSwitch() {
        const newValue = !this.props.elasticsearch;
        this.props.setSearchViewElasticsearch(newValue);
    }

    render() {
        const normalActive = this.props.elasticsearch ? '' : 'subaward-toggle__label_active';
        const elasticsearchActive = this.props.elasticsearch ? 'subaward-toggle__label_active' : '';
        const switchPosition = this.props.elasticsearch ? 'translate(30 0)' : 'translate(9 0)';
        const currentSelection = this.props.elasticsearch ? 'Elasticsearch' : 'Normal';
        return (
            <button
                className="subaward-toggle"
                onClick={this.toggledSwitch}
                aria-pressed={!this.props.elasticsearch}
                aria-label={`Toggle between Elasticsearch and normal endpoints. Currently selected: ${currentSelection}`}>
                <div className={`subaward-toggle__label ${normalActive}`}>
                    Normal
                </div>
                <svg
                    className="subaward-toggle__switch subaward-switch"
                    width="45"
                    height="24">
                    <filter id="subaward-toggle__filters">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                        <feOffset dx="0" dy="0" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <g
                        className="subaward-switch__graphic"
                        transform="translate(4 2)">
                        <rect
                            className="subaward-switch__track"
                            width="40"
                            height="20"
                            rx="10"
                            ry="10" />
                        <g
                            className="subaward-switch__switch"
                            transform={switchPosition}>
                            <circle
                                className="subaward-switch__switch-fill"
                                cy="10"
                                r="10"
                                filter="url(#subaward-toggle__filters)" />
                        </g>
                    </g>
                </svg>
                <div className={`subaward-toggle__label ${elasticsearchActive}`}>
                    Elasticsearch
                </div>
            </button>
        );
    }
}

ElasticsearchToggle.propTypes = propTypes;
