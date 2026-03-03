require('dotenv').config();
const { Client } = require('pg');
const AWS = require('aws-sdk');
const path = require('path');
const caPath = path.join(__dirname,"..", "certs", "global-bundle.pem");
AWS.config.update({ region: process.env.AWS_REGION });

async function main() {
  let password = '';
  const sm = new AWS.SecretsManager();
  const sec = await sm.getSecretValue({ SecretId: process.env.DB_SECRET_ID }).promise();
  password = JSON.parse(sec.SecretString).password;

  const client = new Client({
    host: 'electronic-store.cbo8qqucazcj.ap-southeast-1.rds.amazonaws.com',
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password,
    ssl: { rejectUnauthorized: false, ca: require('fs').readFileSync(caPath, "utf-8").toString() }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log(res.rows[0].version);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await client.end();
  }
}
main().catch(console.error);