const { isFix } = require("../../middleware/auth.middleware");

module.exports = {
  name: "admin/lsgd",
  middleware: [isFix],
  method: "GET",
  run: ({ req, res }) => {
    //  lsgd = [...new Set(global.lsgd)]
    let tableHTML = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Credit Amount</th>
            <th>Additional Description</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i of lsgd) {
      tableHTML += `
        <tr>
          <td>${i.refNo}</td>
          <td>${i.creditAmount}</td>
          <td>${i.addDescription}</td>
        </tr>
      `;
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    res.send(tableHTML);
  },
};
