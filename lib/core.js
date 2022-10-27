
const axios = require('axios');

const makeRequest = function (method, url, data, headers) {
    return new Promise(function (resolve, reject) {
        axios({
            method: method,
            url: url,
            headers: headers,
            data: data

        }).then(
            (response) => {
                var result = response.data
                resolve(result)
            },
            (error) => {
                console.log(error)
                reject(error)
            }
        );
    });
}

module.exports = { makeRequest };
