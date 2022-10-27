
require('dotenv').config({ path: require('find-config')('.env') })

const makeRequest = require("./lib/core").makeRequest;
const fs = require('fs');
const crypto = require('crypto-js')

const apiKey = process.env.API_KEY
const nodeName = process.env.NODE_NAME
const nodePassword = process.env.NODE_PASSWORD

async function main() {
    console.log("Creating your node...")
    console.log("Using the apikey:" , apiKey)

    voltageHeaders = {
        'X-VOLTAGE-AUTH': apiKey,
    }

    // Create the Node
    creationBody = {
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
            whitelist: [
              "1.2.3.4"
            ],
            wumbo: true
        }
    }
    response = await makeRequest('POST', 'https://api.voltage.cloud/node/create', creationBody, voltageHeaders)
    nodeId = response.node_id
    console.log("Created the node: "+nodeId)

    // Wait until the node is waiting_init
    do {
        statusBody = {
            node_id: nodeId
        }
        response = await makeRequest('POST', 'https://api.voltage.cloud/node', statusBody, voltageHeaders)
        nodeStatus = response.status
        nodeApi = response.api_endpoint
        console.log("Found node's status of "+nodeStatus)

        // Wait 5 seconds before checking again
        await new Promise(r => setTimeout(r, 5000))
    }
    while (nodeStatus !== "waiting_init")

    // Get a seed for the node
    response = await makeRequest('GET', 'https://' + nodeApi + ':8080/v1/genseed', {}, {})
    seedPhrase = response.cipher_seed_mnemonic
    console.log("Got seed phrase: "+seedPhrase)

    // Initialize the node
    console.log("Initializing wallet with password: "+nodePassword)
    initBody = {
        wallet_password: Buffer.from(nodePassword).toString('base64'),
        cipher_seed_mnemonic: seedPhrase,
        stateless_init: true
    }
    response = await makeRequest('POST', 'https://'+nodeApi+':8080/v1/initwallet', initBody, {})
    nodeMacaroon = response.admin_macaroon
    console.log("Got Node's Macaroon: "+nodeMacaroon)

    // Encrypt the Macaroon and Seed
    encryptedSeed = crypto.AES.encrypt(
        Buffer.from(seedPhrase.join(",")).toString('base64'),
        nodePassword
    ).toString();

    fs.writeFile('macaroons/encrypted.seed', encryptedSeed, function (err) {
        if (err) return console.log(err);
        console.log('Saved encrypted macaroon under macaroons/encrypted.seed');
    });

    encryptedMacaroon = crypto.AES.encrypt(
        nodeMacaroon,
        nodePassword
    ).toString();

    fs.writeFile('macaroons/encrypted.macaroon', encryptedMacaroon, function (err) {
        if (err) return console.log(err);
        console.log('Saved encrypted macaroon under macaroons/encrypted.macaroon');
    });

    console.log("Successfully created your node!")
}

main()
