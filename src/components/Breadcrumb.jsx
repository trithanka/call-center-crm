import React from "react";
import { Link } from "react-router-dom";
import { MdChevronRight, MdHome } from "react-icons/md";

/**
 * Reusable Breadcrumb Component
 * @param {Array} crumbs - Array of breadcrumb objects with { to, label } structure
 * @param {Object} customClassNames - Custom class names for styling
 */
const Breadcrumb = ({ crumbs = [], customClassNames = {} }) => {
  // Don't render if no breadcrumbs
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  const containerClass = customClassNames.container || "border-b border-neutral-200 bg-neutral-100";
  const navClass = customClassNames.nav || "max-w-7xl mx-auto px-6 py-2";

  return (
    <div className={containerClass}>
      <div className={navClass}>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const isFirst = index === 0;
              // Check if breadcrumb is clickable (default to true if not specified)
              const isClickable = crumb.clickable !== false && !isLast;

              return (
                <li key={`${crumb.to}-${index}`} className="flex items-center">
                  {index > 0 && (
                    <MdChevronRight className="w-3 h-3 text-gray-600 mx-1" />
                  )}
                  {isLast || !isClickable ? (
                    <span className="text-xs text-gray-600 flex items-center">
                      {isFirst && (
                        <MdHome className="w-3 h-3 text-gray-600 mr-1" />
                      )}
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.to}
                      className="text-xs text-gray-500 hover:text-emerald-600 transition-colors flex items-center hover:underline"
                    >
                      {isFirst && (
                        <MdHome className="w-3 h-3 text-gray-600 mr-1" />
                      )}
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;

