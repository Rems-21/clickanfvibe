import React from 'react';
import './Skeleton.css';

/**
 * Skeleton loader component
 * @param {Object} props
 * @param {'card' | 'list' | 'text' | 'circle'} [props.type='text'] - Shape of the skeleton
 * @param {string} [props.width] - Custom width
 * @param {string} [props.height] - Custom height
 * @param {string} [props.className] - Additional classes
 */
function Skeleton({ type = 'text', width, height, className = '' }) {
  const classes = `skeleton skeleton-${type} ${className}`;
  const style = { width, height };

  if (type === 'card') {
    return (
      <div className={classes} style={style}>
        <div className="skeleton-img"></div>
        <div className="skeleton-content">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={classes} style={style}>
        <div className="skeleton-circle"></div>
        <div className="skeleton-content">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
        </div>
      </div>
    );
  }

  return <div className={classes} style={style}></div>;
}

export default Skeleton;
