const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const dbCredentials = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectOptions: {
    options: {
      port: 1433,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  },
  logging: false,
};

const dbHeadOffice = new Sequelize(
  "HeadOfficeDB",
  dbCredentials.username,
  dbCredentials.password,
  dbCredentials
);
const dbBranchA = new Sequelize(
  "Branch_A",
  dbCredentials.username,
  dbCredentials.password,
  dbCredentials
);
const dbBranchB = new Sequelize(
  "Branch_B",
  dbCredentials.username,
  dbCredentials.password,
  dbCredentials
);
const dbBranchC = new Sequelize(
  "Branch_C",
  dbCredentials.username,
  dbCredentials.password,
  dbCredentials
);

const branchConnections = new Map();
branchConnections.set(1, dbBranchA);
branchConnections.set(2, dbBranchB);
branchConnections.set(3, dbBranchC);

function getDbByBranchId(branchId) {
  const numBranchId = parseInt(branchId, 10);
  const connection = branchConnections.get(numBranchId);
  if (!connection) {
    throw new Error(
      `Không tìm thấy kết nối CSDL cho chi nhánh ID: ${branchId}`
    );
  }
  return connection;
}

const CONNECT_DB = async () => {
  const connections = [
    { name: "HeadOfficeDB", conn: dbHeadOffice },
    { name: "Branch_A", conn: dbBranchA },
    { name: "Branch_B", conn: dbBranchB },
    { name: "Branch_C", conn: dbBranchC },
  ];

  try {
    for (const { name, conn } of connections) {
      await conn.authenticate();
      console.log(`Database ${name} connected successfully.`);
    }
    console.log("--- Tất cả CSDL đã kết nối thành công ---");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = {
  dbHeadOffice,
  getDbByBranchId,
  branchConnections,
  CONNECT_DB,
};
