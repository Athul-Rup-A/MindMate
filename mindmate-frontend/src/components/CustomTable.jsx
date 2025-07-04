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
                        const shouldShow = typeof action.show === 'function' ? action.show(item, idx) : true;

                        return shouldShow ? (
                          <Button
                            key={i}
                            size="sm"
                            variant={action.variant || 'primary'}
                            className="px-3"
                            onClick={() => action.onClick(item, idx)}
                          >
                            {action.label}
                          </Button>
                        ) : null;
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