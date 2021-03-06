import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// eslint-disable-next-line import/prefer-default-export
export const LoadingWrapper = ({
    msg = "Loading",
    isLoading,
    children
}) => {
    const [dots, updateDots] = useState("...");

    useEffect(() => {
        const t = setTimeout(() => {
            switch (dots.length) {
                case 2:
                    updateDots("...");
                    break;
                case 3:
                    updateDots("");
                    break;
                case 0:
                    updateDots(".");
                    break;
                default:
                    updateDots("..");
                    break;
            }
        }, 350);

        return () => clearTimeout(t);
    }, [updateDots, dots]);

    if (isLoading) {
        return (
            // Not spending too much time w/ styles here, will have scope to improve later.
            <div className="page__loading">
                <FontAwesomeIcon icon="spinner" spin size="lg" />
                <h4>{`${msg}${dots}`}</h4>
            </div>
        );
    }

    return children;
};

LoadingWrapper.propTypes = {
    msg: PropTypes.string,
    isLoading: PropTypes.bool,
    children: PropTypes.node
};
