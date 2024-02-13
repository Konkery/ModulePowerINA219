const err = require('ModuleAppError.min.js');
const NumIs = require('ModuleAppMath.min.js');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number
const ClassI2CBus = require("ClassBaseI2CBus.min.js");

let I2Cbus = new ClassI2CBus();
let _bus = I2Cbus.AddBus({sda: A6, scl: A4, bitrate: 100000}).IDbus;

const powerClass = require('ClassPowerINA219.min.js');
let opts = {bus: _bus, quantityChannel: 3};
let sensor_props = {
    name: "INA219",
    type: "sensor",
    channelNames: ['volts', 'milliamps', 'milliwatts'],
    typeInSignal: "digital",
    typeOutSignal: "digital",
    quantityChannel: 3,
    busType: [ "i2c" ],
    manufacturingData: {
        IDManufacturing: [
            {
                "PowerMeter": "C3424"
            }
        ],
        IDsupplier: [
            {
                "Sensory": "97856"
            }
        ],
        HelpSens: "INA219 Power and Current sensor"
    }
};

let ina219 = new powerClass(opts, sensor_props);

const ch0 = ina219.GetChannel(0);
const ch1 = ina219.GetChannel(1);
const ch2 = ina219.GetChannel(2);


ch0.Start(1000);
ch1.Start(1000);
ch2.Start(1000);

setInterval(() => {
  console.log(`Voltage: ${(ch0.Value).toFixed(2)} V    Current: ${(ch1.Value).toFixed(2)} mA    Power: ${(ch2.Value).toFixed(2)} mW`);
}, 1000);