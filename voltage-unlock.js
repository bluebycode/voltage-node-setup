const commander = require('commander');
const fs = require('fs').promises;
require('dotenv').config({ path: require('find-config')('.env') });
const { makeRequest } = require("./lib/core");

async function backup(nodeId, encryptedMacaroon, encryptedSeed) {
    console.log("Uploading the macaroon to your node...");

    const voltageHeaders = { 'X-VOLTAGE-AUTH': process.env.API_KEY };

    const macBody = { node_id: nodeId, macaroon: encryptedMacaroon, name: "admin" };
    let response = await makeRequest('POST', 'https://api.voltage.cloud/node/macaroon', macBody, voltageHeaders);
    console.log("Uploaded macaroon");

    const seedBackBody = { node_id: nodeId, seed: encryptedSeed };
    response = await makeRequest('POST', 'https://api.voltage.cloud/node/upload_seed', seedBackBody, voltageHeaders);
    console.log("Uploaded seed");
}

async function open(fileNamePath) {
    try {
        return await fs.readFile(fileNamePath, { encoding: 'utf8' });
    } catch (err) {
        console.error(err);
    }
    return null;
}

async function main() {
    commander.program
      .version('1.0.0')
      .requiredOption('-n, --node <node-id>', 'Node identifier')
      .option('-m, --macaroon-path <path>', 'Macaroon file location - encrypted', 'encrypted.macaroon')
      .option('-s, --seed-path <path>', 'Seed file location - encrypted', 'encrypted.seed')
      .parse(process.argv);

    const options = commander.program.opts();

    console.log('Macaroon path:', options.macaroonPath);
    console.log('Seed path:', options.seedPath);

    const macaroonContentFile = await open(options.macaroonPath);
    const seedContentFile = await open(options.seedPath);

    await backup(options.node, macaroonContentFile, seedContentFile);
}

main();
