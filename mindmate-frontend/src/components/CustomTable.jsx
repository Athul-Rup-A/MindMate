import React from 'react';
import { Table, Button } from 'react-bootstrap';

const CustomTable = ({ columns, data, actions, renderExpandedRow, rowKey }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((item, idx) => (
            <React.Fragment key={rowKey ? rowKey(item, idx) : idx}>
              <tr>
                {columns.map((col, index) => (
                  <td key={index}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(item, idx)
                      : item[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td>
                    <div className="d-flex gap-2 flex-nowrap">
                      {actions.map((action, i) => {
                        const shouldShow = typeof action.show === 'function' ? action.show(item, idx) : action.show !== false;

                        if (!shouldShow) return null;

                        const isDisabled = typeof action.disabled === 'function' ? action.disabled(item, idx) : action.disabled;
                        const label = typeof action.label === 'function' ? action.label(item, idx) : action.label;
                        const variant = typeof action.variant === 'function' ? action.variant(item, idx) : action.variant || 'primary';

                        return (
                          <Button
                            key={i}
                            size="sm"
                            variant={variant}
                            className="w-100"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled && typeof action.onClick === 'function') {
                                action.onClick(item, idx);
                              }
                            }}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>

              {/* Expanded row */}
              {renderExpandedRow && renderExpandedRow(item, idx)}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center">
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default CustomTable;