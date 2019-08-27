/**
 * AggregatedAwardAmounts.jsx
 * Created by David Trinh 2/8/19
 **/

import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber } from 'helpers/moneyFormatter';

import { determineSpendingScenario } from 'helpers/aggregatedAmountsHelper';
import ChartError from 'components/search/visualizations/ChartError';
import { Table } from 'components/sharedComponents/icons/Icons';
import NoResultsMessage from 'components/sharedComponents/NoResultsMessage';
import AwardsBanner from './AwardsBanner';
import NormalChart from '../../shared/awardAmountsSection/charts/NormalChart';
import ExceedsCurrentChart from '../../shared/awardAmountsSection/charts/ExceedsCurrentChart';
import ExceedsPotentialChart from '../../shared/awardAmountsSection/charts/ExceedsPotentialChart';
import { AWARD_V2_AGGREGATED_AMOUNTS_PROPS } from '../../../../propTypes';
import { CombinedObligatedAmounts, CombinedCurrentAmounts, CombinedPotentialAmounts, CombinedExceedsCurrentAmounts, CombinedExceedsPotentialAmounts } from '../../idv/TooltipContent';
import AwardAmountsTable from '../../shared/awardAmountsSection/AwardAmountsTable';

const propTypes = {
    awardAmounts: AWARD_V2_AGGREGATED_AMOUNTS_PROPS,
    inFlight: PropTypes.bool,
    error: PropTypes.bool,
    jumpToSection: PropTypes.func
};

const tooltipStateBySpendingCategory = {
    obligated: "showObligatedTooltip",
    current: "showCurrentTooltip",
    potential: "showPotentialTooltip",
    exceedsCurrent: "showExceedsCurrentTooltip",
    exceedsPotential: "showExceedsPotentialTooltip"
};

const createShowAndCloseTooltipMethod = (ctx, category) => {
    // ctx is `this`
    // type is one of: obligated, current, potential, exceedsCurrent, or exceedsPotential
    const titleCasedCategory = `${category[0].toUpperCase()}${category.substring(1)}`;
    ctx[`show${titleCasedCategory}Tooltip`] = ctx.showSpendingCategoryTooltip.bind(ctx, category);
    ctx[`close${titleCasedCategory}Tooltip`] = ctx.closeSpendingCategoryTooltip.bind(ctx, category);
};

export default class AggregatedAwardAmounts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showObligatedTooltip: false,
            showCurrentTooltip: false,
            showPotentialTooltip: false,
            showExceedsCurrentTooltip: false,
            showExceedsPotentialTooltip: false
        };

        this.jumpToReferencedAwardsTable = this.jumpToReferencedAwardsTable.bind(this);
        this.getTooltipPropsByCategory = this.getTooltipPropsByCategory.bind(this);
        this.getTooltipPropsBySpendingScenario = this.getTooltipPropsBySpendingScenario.bind(this);
        Object.keys(tooltipStateBySpendingCategory)
            .forEach((spendingCategory) => {
                // for each spending category, add a show/close tool tip method
                createShowAndCloseTooltipMethod(this, spendingCategory);
            });
    }

    getTooltipPropsByCategory(category) {
        const { awardAmounts } = this.props;
        const map = {
            obligated: {
                offsetAdjustments: { top: 0, right: 30 },
                className: "combined-obligated-tt__container",
                tooltipComponent: <CombinedObligatedAmounts total={awardAmounts.totalObligationFormatted} count={awardAmounts.childAwardCount} />
            },
            current: {
                offsetAdjustments: { top: 0, right: 30 },
                className: "combined-current-tt__container",
                tooltipComponent: <CombinedCurrentAmounts total={awardAmounts.baseExercisedOptionsFormatted} count={awardAmounts.childAwardCount} />
            },
            potential: {
                offsetAdjustments: { top: 0, right: 30 },
                className: "combined-potential-tt__container",
                tooltipComponent: <CombinedPotentialAmounts total={awardAmounts.baseAndAllOptionsFormatted} count={awardAmounts.childAwardCount} />
            },
            exceedsCurrent: {
                offsetAdjustments: { top: 0, right: 30 },
                className: "combined-exceeds-current-tt__container",
                tooltipComponent: <CombinedExceedsCurrentAmounts total={awardAmounts.overspendingFormatted} count={awardAmounts.childAwardCount} />
            },
            exceedsPotential: {
                offsetAdjustments: { top: 0, right: 30 },
                className: "combined-exceeds-potential-tt__container",
                tooltipComponent: <CombinedExceedsPotentialAmounts total={awardAmounts.extremeOverspendingFormatted} count={awardAmounts.childAwardCount} />
            }
        };

        return map[category];
    }

    getTooltipPropsBySpendingScenario(spendingScenario) {
        // these are the award amount visualizations needed for every spending scenario
        const spendingCategories = ["obligated", "current", "potential"];
        if (spendingScenario !== "normal") {
            // if exceedsPotential or exceedsCurrent is the spending scenario, add it here as a spendingCategory...
            spendingCategories.push(spendingScenario);
        }

        // Build object with shape: { category1ToolTipProps: {}, category2ToolTipProps: {}, ... }
        return spendingCategories.reduce((acc, category) => {
            // used to reference methods in camelCase
            const titleCasedCategory = `${category[0].toUpperCase()}${category.substring(1)}`;
            const propsForCategory = this.getTooltipPropsByCategory(category);
            return Object.assign(acc, {
                [`${category}TooltipProps`]: Object.assign(propsForCategory, {
                    wide: true,
                    controlledProps: {
                        isControlled: true,
                        isVisible: this.state[`show${titleCasedCategory}Tooltip`],
                        closeTooltip: this[`close${titleCasedCategory}Tooltip`],
                        showTooltip: this[`show${titleCasedCategory}Tooltip`]
                    }
                })
            });
        }, {});
    }

    jumpToReferencedAwardsTable() {
        this.props.jumpToSection('referenced-awards');
    }

    showSpendingCategoryTooltip(category) {
        this.setState({
            [tooltipStateBySpendingCategory[category]]: true
        });
        // hide all other tooltips
        Object.keys(this.state)
            .filter((tooltipState) => tooltipState !== tooltipStateBySpendingCategory[category])
            .forEach((tooltipState) => this.setState({ [tooltipState]: false }));
    }

    closeSpendingCategoryTooltip(category) {
        this.setState({
            [tooltipStateBySpendingCategory[category]]: false
        });
    }

    generateVisualization() {
        const { awardAmounts } = this.props;
        const visualizationType = determineSpendingScenario(awardAmounts);
        let visualization;
        let overspendingRow = null;

        switch (visualizationType) {
            case ('normal'):
                visualization = (<NormalChart awardType="idv" {...this.getTooltipPropsBySpendingScenario('normal')} awardAmounts={awardAmounts} />);
                break;
            case ('exceedsCurrent'):
                visualization = (<ExceedsCurrentChart awardType="idv" {...this.getTooltipPropsBySpendingScenario('exceedsCurrent')} awardAmounts={awardAmounts} />);
                overspendingRow = (
                    <div className="award-amounts__data-content">
                        <div><span className="award-amounts__data-icon award-amounts__data-icon_overspending" />Exceeds Combined Current Award Amounts</div>
                        <span>{awardAmounts.overspendingFormatted}</span>
                    </div>
                );
                break;
            case ('exceedsPotential'):
                visualization = (<ExceedsPotentialChart awardType="idv" {...this.getTooltipPropsBySpendingScenario('exceedsPotential')} awardAmounts={awardAmounts} />);
                overspendingRow = (
                    <div className="award-amounts__data-content">
                        <div><span className="award-amounts__data-icon award-amounts__data-icon_extreme-overspending" />Exceeds Combined Potential Award Amounts</div>
                        <span>{awardAmounts.extremeOverspendingFormatted}</span>
                    </div>
                );
                break;
            default:
                visualization = (
                    <div className="results-table-message-container">
                        <NoResultsMessage
                            title="Chart Not Available"
                            message="Data in this instance is not suitable for charting" />
                    </div>
                );
        }

        return (
            <div className="award-amounts__content">
                <AwardsBanner
                    jumpToReferencedAwardsTable={this.jumpToReferencedAwardsTable} />
                {visualization}
                <div className="award-amounts-children__data-wrapper">
                    <div className="award-amounts-children__data-content">
                        <div>Count of Total Award Orders</div>
                        <span>
                            {formatNumber(awardAmounts.childAwardCount + awardAmounts.grandchildAwardCount)}
                        </span>
                    </div>
                    <div className="award-amounts-children__data-content">
                        <div>Count of Child Award Orders</div>
                        <span>{formatNumber(awardAmounts.childAwardCount)}</span>
                    </div>
                    <div className="award-amounts-children__data-content">
                        <div>Count of Grandchild Award Orders</div>
                        <span>{formatNumber(awardAmounts.grandchildAwardCount)}</span>
                    </div>
                </div>
                <button
                    onClick={this.jumpToReferencedAwardsTable}
                    className="award-viz__button">
                    <div className="award-viz__link-icon">
                        <Table />
                    </div>
                    <div className="award-viz__link-text">
                        View award orders table
                    </div>
                </button>
                <AwardAmountsTable awardType="idv" awardData={awardAmounts}>
                    {overspendingRow}
                </AwardAmountsTable>
            </div>
        );
    }

    render() {
        if (this.props.inFlight) {
            // API request is still pending
            return (
                <div className="visualization-message-container">
                    <div className="visualization-loading">
                        <div className="message">
                            Gathering your data...
                        </div>
                    </div>
                </div>);
        }
        else if (this.props.error) {
            return (<ChartError />);
        }
        return this.generateVisualization();
    }
}
AggregatedAwardAmounts.propTypes = propTypes;

