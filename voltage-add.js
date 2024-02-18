require('dotenv').config({ path: require('find-config')('.env') });

const { makeRequest } = require("./lib/core");
const fs = require('fs').promises;
const crypto = require('crypto-js');

const { API_KEY: apiKey, NODE_NAME: nodeName, NODE_PASSWORD: nodePassword } = process.env;

async function main() {
    console.log("Creating your node...");
    console.log("Using the apikey:", apiKey);

    const voltageHeaders = { 'X-VOLTAGE-AUTH': apiKey };

    const creationBody = {
        network: "testnet",
        purchased_type: "ondemand",
        type: "lite",
        name: nodeName,
        settings: {
            alias: nodeName,
            autocompaction: false,
            autopilot: false,
            color: "#EF820D",
            grpc: true,
            keysend: true,
            rest: true,
            whitelist: ["1.2.3.4"],
            wumbo: true
        }
    };
    let response = await makeRequest('POST', 'https://api.voltage.cloud/node/create', creationBody, voltageHeaders);
    const nodeId = response.node_id;
    console.log("Created the node: " + nodeId);

    let nodeStatus, nodeApi;
    do {
        const statusBody = { node_id: nodeId };
        response = await makeRequest('POST', 'https://api.voltage.cloud/node', statusBody, voltageHeaders);
        ({ status: nodeStatus, api_endpoint: nodeApi } = response);
        console.log("Found node's status of " + nodeStatus);

        await new Promise(r => setTimeout(r, 5000));
    } while (nodeStatus !== "waiting_init");

    response = await makeRequest('GET', `https://${nodeApi}:8080/v1/genseed`, {}, {});
    const seedPhrase = response.cipher_seed_mnemonic;
    console.log("Got seed phrase: " + seedPhrase);

    console.log("Initializing wallet with password: " + nodePassword);
    const initBody = {
        wallet_password: Buffer.from(nodePassword).toString('base64'),
        cipher_seed_mnemonic: seedPhrase,
        stateless_init: true
    };
    response = await makeRequest('POST', `https://${nodeApi}:8080/v1/initwallet`, initBody, {});
    const nodeMacaroon = response.admin_macaroon;
    console.log("Got Node's Macaroon: " + nodeMacaroon);

    const encryptedSeed = crypto.AES.encrypt(Buffer.from(seedPhrase.join(",")).toString('base64'), nodePassword).toString();
    const encryptedMacaroon = crypto.AES.encrypt(nodeMacaroon, nodePassword).toString();

    await fs.writeFile('macaroons/encrypted.seed', encryptedSeed);
    console.log('Saved encrypted macaroon under macaroons/encrypted.seed');

    await fs.writeFile('macaroons/encrypted.macaroon', encryptedMacaroon);
    console.log('Saved encrypted macaroon under macaroons/encrypted.macaroon');

    console.log("Successfully created your node!");
}

main();
