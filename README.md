<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ModulePowerINA219
<div style = "color: #555">
    <p align="center">
    <img src="./res/logo.png" width="400" title="hover text">
    </p>
</div>

# Лицензия
////

# Описание
<div style = "color: #555">

Модуль предназначен для работы с датчиком силы тока и напряжения на базе чипа [INA219](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf). Модуль является неотъемлемой частью фреймворка EcoLite. Датчик на баз чипа INA219 позволяет получить данные о напряжении, силе тока и мощности. Модуль работает по интерфейсу I2C. Модуль имеет следующие архитектурные решения фреймворка EcoLite:
- является потомком класса [ClassMiddleSensor](https://github.com/Konkery/ModuleSensorArchitecture/blob/main/README.md);
- создаёт шину через глобальный объект [I2Cbus](https://github.com/Konkery/ModuleBaseI2CBus/blob/main/README.md).

Количество каналов для снятия данных - 4.
</div>

### Конструктор
<div style = "color: #555">

Конструктор принимает 1 объект типа **SensorOptsType** и 1 объект типа [**SensorOptsType**](https://github.com/Konkery/ModuleSensorArchitecture/blob/main/README.md):
```js
let sensor_props = {
    name: "INA219",
    type: "sensor",
    channelNames: ['vshunt', 'vbus', 'current', 'power'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 4,
    busType: [ "i2c" ],
};
const _opts = {
    bus: i2c_bus,
    address: 0x40,
}
```
- <mark style="background-color: lightblue">bus</mark> - объект класса I2C, возвращаемый диспетчером I2C шин - [I2Cbus](https://github.com/Konkery/ModuleBaseI2CBus/blob/main/README.md);
- <mark style="background-color: lightblue">address</mark> - адрес датчика на I2C шине. Нужен в случае присутствия нескольких датчиков INA219.
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_Sensor</mark> - объект базового класса;
- <mark style="background-color: lightblue">_MinPeriod</mark> - минимальная частота опроса датчика - 250 мс;
- <mark style="background-color: lightblue">_UsedChannels</mark> - используемые каналы данных по нотации архитектуры фреймворка EcoLite;
- <mark style="background-color: lightblue">_Interval</mark> - функция SetInterval для опроса датчика.
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Init(_sensor_props)</mark> - метод обязывающий провести инициализацию датчика;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - метод запускает циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода сверяется с минимальным значением, хранящимся в поле *_MinPeriod*, и, если требуется, регулируется;
- <mark style="background-color: lightblue">ChangeFreq(_num_channel, _period)</mark> - метод останавливает опрос указанного канала и запускает его вновь с уже новой частотой.
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - метод прекращает считывание значений с заданного канала.
</div>

### Возвращаемые данные
<div style = "color: #555">

Датчик предоставляет данные о напряжении тока в вольтах (V) на шине, и в миливольтах (mV) на шунте, силе тока в милиамперах (mA) и мощности в миливаттах (mW).
</div>

### Примеры
<div style = "color: #555">

Фрагмент кода для вывода данных о давлении и температуре в консоль раз в одну секунду. Предполагается, что все необходимые модули уже загружены в систему:
```js
//Подключение необходимых модулей
const ClassI2CBus = require("ClassBaseI2CBus.min.js");
const err = require("ModuleAppError.min.js");
const NumIs = require("ModuleAppMath.min.js");
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

//Создание I2C шины
let I2Cbus = new ClassI2CBus();
let bus = I2Cbus.AddBus({sda: A6, scl: A4, bitrate: 100000}).IDbus;

//Настройка передаваемых объектов
const powerClass = require('ClassPowerINA219.min.js');
let opts = {bus: _bus, quantityChannel: 4};
let sensor_props = {
    name: "INA219",
    type: "sensor",
    channelNames: ['vshunt', 'vbus', 'current', 'power'],
    typeInSignal: "digital",
    typeOutSignal: "digital",
    quantityChannel: 4,
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
//Создание объекта класса
let ina219 = new powerClass(opts, sensor_props);

const ch0 = ina219.GetChannel(0);
const ch1 = ina219.GetChannel(1);
const ch2 = ina219.GetChannel(2);
const ch3 = ina219.GetChannel(2);

//Создание каналов
ch0.Start(1000);
ch1.Start(1000);
ch2.Start(1000);
ch3.Start(1000);
//Вывод данных
setInterval(() => {
    console.log(`Voltage Shunt: ${(ch0.Value).toFixed(2)} mV    Voltage Bus: ${(ch1.Value).toFixed(2)} V    Current: ${(ch2.Value).toFixed(2)} mA    Power: ${(ch3.Value).toFixed(2)} mW`);
}, 1000);
```
Вывод данных в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>
<div>

# Зависимости
- [ClassBaseI2CBus](https://github.com/Konkery/ModuleBaseI2CBus/blob/main/README.md)
- [ModuleAppError](https://github.com/Konkery/ModuleAppError/blob/main/README.md)
- [ModuleAppMath](https://github.com/Konkery/ModuleAppMath/blob/main/README.md)


</div>