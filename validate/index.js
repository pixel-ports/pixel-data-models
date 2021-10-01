'use strict';
const yargs = require('yargs')
var Ajv = require('ajv');
const fs = require('fs');
const axios = require('axios');

async function parseHeader(str) {
    var header = {
        key: "",
        value: ""
    }
    const words = str.split(':');
    header.key = words[0];
    header.value = words[1];
    return header;
}

async function sendRequest(request) {
    var response;
    try {
        response = await axios.request(request);
    } catch (error) {
        console.log("error sendRequest")
        return Promise.reject(error)
    }
    return response;
}


async function loadSchema(uri) {
    console.log("Load Schema : " + uri)
    var request = {
        method: "GET",
        url: uri,
        headers: {},
        json: true
    };
    try {
        var response = await sendRequest(request);
        if (response.hasOwnProperty("data")) {
            return response.data;
        } else {
            console.log("error loadSchema data "+uri)
            return Promise.reject(response)
        }
    } catch (error) {
        console.log("error loadSchema request "+uri)
        return Promise.reject(error)
    }
}


async function validateSchema(schema) {
    try {
        return await ajv.compileAsync(schema);
    } catch (error) {
        console.log("error validateschema")
        return Promise.reject(error)
    }
}

var ajv = new Ajv({ loadSchema: loadSchema, allErros: true }); // options can be passed, e.g. {allErrors: true}


const argv = yargs
    .option('schema', {
        alias: 's',
        description: 'The file containing the schema',
        type: 'string',
    })
    .option('data', {
        alias: 'd',
        description: 'The file containing the data to check against schema',
        type: 'string',
    })
    .option('schemaUrl', {
        alias: 'u',
        description: 'The link to an online schema',
        type: 'string',
    })
    .option('pixel', {
        alias: 'p',
        description: 'The link to pixel data type',
        type: 'string',
    })
    .option('verb', {
        alias: 'X',
        description: 'verb',
        type: 'string',
    })
    .option('headers', {
        alias: 'H',
        description: 'header',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

(async () => {
    if (argv.schema) {
        console.log("Try to validate schema file : " + argv.schema);
        var json = "";
        var validate=false;
        try {
            json = JSON.parse(fs.readFileSync(argv.schema, 'utf-8'));
            validate=await validateSchema(json);
            console.log("schema : " + argv.schema + " seems valid")
        } catch (error) {
            console.log("Failed to read schema file : ", argv.schema, error)
        }
        if (argv.data && validate) {
            console.log("Try to validate data against the schema file : " + argv.data);
            try {
                json = JSON.parse(fs.readFileSync(argv.data, 'utf-8'));
                //var ok=await validate(json);

                var ok= await validate(json);
                if (ok) {
                    console.log("data : " + argv.data + " seems valid")
                } else {
                    console.log("data : " + argv.data + " have errors  :"+JSON.stringify(validate.errors, null, 4));
                }
            } catch (error) {
                console.log("Failed to read data file : ", argv.data, error)
            }
        }
    }
    if (argv.pixel) {
        console.log("Pixel schema validator");
        var json = "";
        var request = {
            method: argv.verb || "GET",
            url: argv.pixel,
            headers: {},
            json: true
        };
        if (argv.headers) {
            if (typeof argv.headers === "object" && argv.headers.isArray()) {
                for (const str of argv.headers) {
                    var header = await parseHeader(str);
                    request.headers[header.key] = header.value
                }
            } else {
                var header = await parseHeader(argv.headers);
                request.headers[header.key] = header.value;
            }
        }
        try {
            var response = await sendRequest(request);
            if (response.hasOwnProperty("status") && response.status === 200) {
                if (response.hasOwnProperty("data")) {
                    response.data;
                    if ((response.data.hasOwnProperty("schema")) && response.data.schema.hasOwnProperty("value")) {
                        json = response.data.schema.value;
                        //var validate = ajv.compile(json, {loadSchema: loadSchema});
                        try {
                            await validateSchema(json);
                            console.log("schema " + response.data.id + " seems valid")
                        } catch (error) {
                            console.log("Can't validate schemaa "+error)
                        }
                       
                    } else {
                        console.log("no schema found in response " + JSON.stringify(response.data, null, 4))
                    }
                } else {
                    console.log("no data found in response " + JSON.stringify(response, null, 4))
                }
            } else {
                console.log("invalid HTTP response found in response " + JSON.stringify(response, null, 4))
            }
        } catch (error) {
            console.log("Failed to valid schema : ", error)
            //console.log(JSON.stringify(json, null, 4));
        }
    }


})().catch(error => {
    console.log("Schema Validator generate an error : " + error)
});