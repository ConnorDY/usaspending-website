/**
 * TreeMapCell.jsx
 * Created by Emily Gullo 03/15/2017
 **/

import React from 'react';
import _ from 'lodash';

const propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.number,
    total: React.PropTypes.number,
    x0: React.PropTypes.number,
    x1: React.PropTypes.number,
    y0: React.PropTypes.number,
    y1: React.PropTypes.number,
    color: React.PropTypes.string,
    chosen: React.PropTypes.string,
    toggleTooltip: React.PropTypes.func,
    showOverlay: React.PropTypes.bool
};

export default class TreeMapCell extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            label: '',
            overlay: true,
            didProcess: false
        };

        this.mouseIn = this.mouseIn.bind(this);
        this.toggleBorders = this.toggleBorders.bind(this);
    }

    componentDidMount() {
        this.initialRender(this.props.label);
    }

    componentWillReceiveProps(props) {
        this.initialRender(props.label);
    }

    componentDidUpdate() {
        if (!this.state.didProcess) {
            this.truncateText();
        }
    }

    initialRender(label) {
        this.setState({
            label,
            didProcess: false
        });
    }

    truncateText() {
        const labelWidth = this.props.x1 - this.props.x0;

        // determine if the text needs to be truncated
        // get the current label width
        const fullWidth = this.svgText.getBBox().width;

        // accounting for 15px margin
        const maxWidth = labelWidth / 1.5;
        let maxChars = 0;

        let truncatedLabel = this.props.label;

        // make sure that the max width is positive
        if (fullWidth > maxWidth && maxWidth > 0) {
            // the label is going to exceed the available space, truncate it
            // calculate the averge character width
            const avgCharWidth = (fullWidth / this.props.label.length);

            // determine how many characters can fit in the available space
            maxChars = Math.floor((maxWidth) / avgCharWidth);
            // truncate the label
            truncatedLabel = _.truncate(this.props.label, {
                length: maxChars
            });
        }

        this.setState({
            label: truncatedLabel,
            didProcess: true
        });
    }

    mouseIn(label, value) {
        this.props.toggleTooltip(label, value);
        this.setState({
            overlay: false
        });
    }

    toggleBorders() {
        let strokeColor = "white";
        if (this.props.showOverlay === true) {
            if (this.props.label === "Social Security" ||
                this.props.label === "National Defense" ||
                this.props.label === "Medicare") {
                strokeColor = "#F2B733";
            }
        }
        return strokeColor;
    }


    render() {
        const width = (this.props.x1 - this.props.x0);
        const height = (this.props.y1 - this.props.y0);
        let labelView = 'block';
        let percentView = 'block';
        if (height < 20 || width < 50) {
            labelView = 'none';
        }
        if (height < 40 || width < 60) {
            percentView = 'none';
        }
        let color = this.props.color;
        if (this.props.label === this.props.chosen) {
            color = "#F2B733";
        }
        return (
            <g
                transform={`translate(${this.props.x0},${this.props.y0})`}
                onMouseOver={() => {
                    this.mouseIn(this.props.label, this.props.value);
                }}
                onMouseLeave={() => {
                    this.mouseIn('none', '');
                }}>
                <rect
                    className="tile"
                    width={width}
                    height={height}
                    style={{
                        fill: color,
                        stroke: this.toggleBorders(this.props.label)
                    }} />
                <text
                    className="category"
                    x={(width / 2)}
                    y={height / 2}
                    width={width}
                    textAnchor="middle"
                    ref={(text) => {
                        this.svgText = text;
                    }}
                    style={{
                        display: labelView
                    }}>
                    {this.state.label}
                </text>
                <text
                    className="value"
                    x={(width / 2) - 2}
                    y={(height / 2) + 20}
                    width={width}
                    textAnchor="middle"
                    style={{
                        display: percentView
                    }}>
                    {parseFloat((this.props.value / this.props.total) * 100).toFixed(1)}%
                </text>
            </g>
        );
    }
}
TreeMapCell.propTypes = propTypes;
