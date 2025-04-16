const Table = ({ columns, data }: any) => {
  return (
    <table className="min-w-full bg-white rounded-md border border-gray-200">
      <thead className="bg-gray-200">
        <tr>
          {columns.map((column: any) => (
            <th
              key={column.accessor}
              className="py-2 px-4 border-b border-gray-200 text-left text-gray-600 bg-neutral-100"
            >
              {column.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, rowIndex: any) => (
          <tr key={rowIndex} className="even:bg-gray-50 hover:bg-neutral-100 transition duration-300 ease-in-out">
            {columns.map((column: any) => (
              <td
                key={column.accessor}
                className="py-2 px-4 border-b border-gray-200 text-gray-800"
              >
                {row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
