const assert = require('assert');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

var Ajv = require('ajv');
const fs = require('fs');
const axios = require('axios');

var ajv = new Ajv({ loadSchema: loadSchema, allErros: true }); // options can be passed, e.g. {allErrors: true}

async function getSchemaType(schema) {
    if (typeof schema === "object") {
        var type = "";
        if (schema.hasOwnProperty("allOf")) {
            for (const elt of schema.allOf) {
                if (elt.hasOwnProperty("properties")) {
                    if ((elt.properties.hasOwnProperty("type")) && (elt.properties.type.hasOwnProperty("enum") && (elt.properties.type.enum.length > 0))) type = elt.properties.type.enum[0];
                }
            }
        }
        if ((type === "") && schema.hasOwnProperty("properties")) {
            if ((schema.properties.hasOwnProperty("type")) && (schema.properties.type.hasOwnProperty("enum") && (schema.properties.type.enum.length > 0))) type = schema.properties.type.enum[0];

        }
        if (type !== "") {
            return type;
        } else {
            return Promise.reject("Can't find type in schema definition")
        }
    } else {
        return Promise.reject("Not a valid FIWARE schema")
    }
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

async function validateSchema(schema) {
    try {
        var type=await getSchemaType(schema);
        await ajv.compileAsync(schema);
    } catch (error) {
        console.log("Error validate schema : "+error)
        return Promise.reject(error)
    }
}

async function validateSchemaFile(file) { 
    var json = "";
    try {
        json = JSON.parse(fs.readFileSync(file, 'utf-8'));
        await validateSchema(json);
        return true;

    } catch (error) {
        console.log("Failed to read schema file : ", file, error)
        return Promise.reject({ "message" : "Failed to read schema file", "file": file, "error": error})
    }    
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

var datarepo ="/app/data"
describe('Schema', function () {
    this.timeout(10000);

    it('/Pixel/VesselCall', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/VesselCall/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/AirQualityObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/AirQualityObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/EnergyConsumptionMeasurement', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/EnergyConsumptionMeasurement/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/MarpolWaste', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/MarpolWaste/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Noise/NoiseLevelObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Noise/NoiseLevelObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Ping', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Ping/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/TideSensorObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/TideSensorObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Weather/WeatherObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Weather/WeatherObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/WeatherObservedSencrop', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/WeatherObservedSencrop/schema.json")).to.be.fulfilled;
    });

    it('/Pixel/Traffic/TrafficFlowObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Traffic/TrafficFlowObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/MarpolTerminalWaste', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/MarpolTerminalWaste/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Traffic/TrafficFlow', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Traffic/TrafficFlow/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Weather/WindObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Weather/WindObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/KPI/EnvironmentalKeyPerformanceIndicator', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/KPI/EnvironmentalKeyPerformanceIndicator/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/PhotovoltaicMeasurement', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/PhotovoltaicMeasurement/schema.json")).to.be.fulfilled;
    });
    //it('/Device/Device', async () => {
    //    await expect(validateSchemaFile(datarepo+"/Device/Device/schema.json")).to.be.fulfilled;
    //});
    it('/Pixel/Hopu/NoiseLevelObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Hopu/NoiseLevelObserved/schema.json")).to.be.fulfilled;
    });
    it('/Pixel/Hopu/WeatherLevelObserved', async () => {
        await expect(validateSchemaFile(datarepo+"/Pixel/Hopu/WeatherObserved/schema.json")).to.be.fulfilled;
    });
});