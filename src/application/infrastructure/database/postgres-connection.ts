const db = require('data-api-client')({
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.PGDBCLUSTERARN,
    database: process.env.PGDATABASE
  });
  
  export default db;