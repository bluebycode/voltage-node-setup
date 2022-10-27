**voltage.cloud - setup and unlock a node**
Simple steps suggested by Voltage.cloud to setup a node by Voltage API and LND API.
ref: https://docs.voltage.cloud/api/creating-a-node-example


Create a specific API KEY from [https://account.voltage.cloud/api-keys](https://account.voltage.cloud/api-keys).
Please add ```.env``` file with the API KEY node alias and generated password. Use the .env-sample as template.
````
# Setup the node
$ node voltage-add.js
➜ 
Creating your node...
Using the apikey: XXXXXXXXXX
Created the node: ebafbd83-b3c6-4cb6-8e4d-b452123246e8N
Found node's status of provisioning
Found node's status of provisioning
Found node's status of provisioning
Found node's status of provisioning
Found node's status of waiting_init
Got seed phrase: ability,.......,alone
Initializing wallet with password: XXXXXXXXXXXXXXXXXX
Got Node's Macaroon: AgE...HuA=
Successfully created your node!
Saved encrypted macaroon under macaroons/encrypted.seed
Saved encrypted macaroon under macaroons/encrypted.macaroon

# Files would be under macaroons/{encrypted.macaroon, seed.encrypted}
$ node voltage-unlock.js -n ebafbd83-b3c6-4cb6-8e4d-b452123246e8N \
             -m macaroons/encrypted.macaroon \
             -s macaroons/encrypted.seed 
➜  
Seed path: macaroons/encrypted.seed
Uploading the macaroon to your node...
Uploaded macaroon
Uploaded seed
````
