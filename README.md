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

Модуль предназначен для работы с датчиком силы тока и напряжения на базе чипа [INA219](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf). Данная микросхема позволяет с высокой точностью измерять напряжение в диапазоне от 0 до 26 вольт и силу тока. Подключение к микроконтроллеру осуществляется по интерфейсу I2C. Для работы микросхемы требуется небольшая обвязка, главный компонент которой – это шунтирующий резистор. По умолчанию установлен резистор в 0.1 Ом. INA219 вычисляет силу тока, измеряя падение напряжения на шунте. Для этого используется 12-разрядный АЦП, диапазон измеряемых им напряжений составляет ±40 мВ. Этот диапазон может быть увеличен путём деления напряжения на 2, 4 и 8, что позволит измерять напряжение на шунте в диапазонах ±80, ±160 и ±320 мВ соответственно. По умолчанию микросхема INA219 сконфигурирована на измерение напряжения на шунте в диапазоне ±320 мВ. Отсюда верхний предел измеряемого тока – 3.2 А. При необходимости этот предел может быть увеличен путём замены шунта на другой, меньшего номинала. Напряжение основной цепи датчик измеряет между выводами Vin+ и GND. Здесь доступны 2 диапазона: 16 В и 32 В, но максимальное измеряемое напряжение не должно превышать 26 В. На основании полученных значений тока и напряжения вычисляется потребляемая мощность. INA219 позволяет изменять свой I2C адрес, имея возможность настроить до 16 адресов. Модуль является неотъемлемой частью фреймворка EcoLite и имеет следующие архитектурные решения:
- является потомком класса [ClassSensor](https://github.com/Konkery/ModuleSensorArchitecture/blob/main/README.md);
- создаётся через метод глобального объекта [SensorManager](https://github.com/Konkery/ModuleSensorManager/blob/main/README.md) - CreateDevice();
- имеет конфигурацию в файле [device.conf](https://github.com/Konkery/ModuleProcess/blob/main/README.md).

Количество каналов для снятия данных - 4.
</div>

### Конструктор
<div style = "color: #555">

Конструктор принимает объект типа [**SensorOptsType**](https://github.com/Konkery/ModuleSensorArchitecture/blob/main/README.md), который SensorManager формирует из конфигурации *device.conf*. Конфигурация для модуля имеет следующий вид:
```js
"00": {
    "pins": [],
    "bus": "I2C10",
    "address": 64, //0x40
    "name": "INA219",
    "article": "02-501-0106-201-0001",
    "type": "sensor",
    "channelNames": ["vshunt", "vbus", "current", "power"],
    "typeInSignal": "digital",
    "typeOutSignal": "digital",
    "quantityChannel": 4,
    "busTypes": ["i2c"],
    "manufacturingData": {},
    "modules": ["ModulePowerINA219.min.js"],
    "config": {
      "WAI": 14751, //0x399F
      "maxCurrent": 3.2768,
      "rShunt": 0.1,
      "busVoltageRange": 32,
      "gain": 320,
      "busADC": 12,
      "shuntADC": 12,
      "mode": 7
    },				
}
```
ID конфигурации должен быть строкой, представляющий число от 0 до 99, и быть представлено в виде двух цифр. Следует выделить следующие ноды, имеющие особенности для этого модуля:
- <mark style="background-color: lightgreen">address</mark> - адрес датчика на I2C шине. Значение по умолчанию - **0х40**. Адрес на датчике меняется путём соединения адресных выводов A0 и A1 с другими выводами. Для изменения адреса датчика смотреть [документацию](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf), стр. 10, таблица 2;
- <mark style="background-color: lightgreen">config</mark> - объект, содержащий настройки конфигурации датчика. **Необязательное поле**.

Объект *config* необходим для настройки режимов работы сенсора. Все поля являются необязательными, так как имеют значение по умолчанию (далее выделены зеленым). Неподдерживаемые значения будут проигнорированны. Поддерживаются следующие поля конфигурации:
- <mark style="background-color: orange">WAI</mark> - датчики INA219 поставляются в нескольких версиях. Каждая версия имеет своё значение регистра *Who am I*. Значение для версии А - <mark style="background-color: green">14751</mark> (0х399F), оно же и установлено по умолчанию;
- <mark style="background-color: orange">maxCurrent</mark> - максимальное значение силы тока в амперах. Необходимо для автоматической калибровки. Более подробно - смотреть стр. 17 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf). Значение по умолчанию - <mark style="background-color: green">3.2768</mark>;
- <mark style="background-color: orange">rShunt</mark> - сопротивление шунтирующего резистора в омах. Значение по умолчанию - <mark style="background-color: green">0.1</mark>;
- <mark style="background-color: orange">busVoltageRange</mark> - измеряемый диапазон на шине. Поддерживаемые значения: 16 и <mark style="background-color: green">32</mark> (стр. 26 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf));
- <mark style="background-color: orange">gain</mark> - масштабирование или измеряемый диапазон на шунте. Поддерживаемые значения: 40, 80, 160 и <mark style="background-color: green">320</mark> (стр. 26 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf));
- <mark style="background-color: orange">busADC</mark> - режим работы АЦП при работе с напряжением шины. Можно настроить разрядность от 9 до 12 бит, или же устреднение по количеству сэмплов от 2х до 128 в степенях двойки при 12-битной разрядности. Увеличение разрядности и количества сэмплов ведёт к повышению времени измерения и получения конечного значения. Подробнее читать стр. 27 таблицу 6 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf). Поддерживаемые значения: 9, 10, 11, <mark style="background-color: green">12</mark>, 2, 4, 8, 16, 32, 64, 128;
- <mark style="background-color: orange">shuntADC</mark> - режим работы АЦП при работе с напряжением шунта. Настройка аналогична предыдущему пункту (стр. 27 таблица 6 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf)). Поддерживаемые значения: 9, 10, 11, <mark style="background-color: green">12</mark>, 2, 4, 8, 16, 32, 64, 128;
- <mark style="background-color: orange">mode</mark> - режим работы датчика. Здесь настраивается одиночное или постоянное преобразование, выключение всего датчика или АЦП. Подробнее читать стр. 27 таблицу 7 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf). Поддерживаемые значения: 0, 1, 2, 3, 4, 5, 6, <mark style="background-color: green">7</mark>. В режиме по умолчанию происходит постоянное преобразование показаний напряжения с шины и шунта;
- <mark style="background-color: orange">currentLBS</mark> - Калибровочное значение для показаний силы тока и напряжения. Напрямую настроить невозможно - значение вычисляется динамически из полей *rShunt* и *maxCurrent*. Подробнее читать стр. 17 [документации](https://github.com/Konkery/ModulePowerINA219/blob/main/res/INA219_Datasheet.pdf).
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_Sensor</mark> - объект низкоуровневого класса датчика;
- <mark style="background-color: lightblue">_Config</mark> - объект конфигурации по выше описанной нотации;
- <mark style="background-color: lightblue">_MinPeriod</mark> - минимальный интервал опроса датчика - 20 мс;
- <mark style="background-color: lightblue">_Interval</mark> - функция setInterval для опроса датчика.
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Init()</mark> - метод обязывающий провести инициализацию датчика с переданной конфигурацией и калибровкой или со значениями по умолчанию;
- <mark style="background-color: lightblue">SetMaxCurrent(_amps)</mark> - устанавливает максимальное значение силы тока (в амперах), одновременно корректируя калибровочные значения;
- <mark style="background-color: lightblue">SetShuntResist(_ohms)</mark> - устанавливает сопротивление шунта (в омах), одновременно корректируя калибровочные значения;
- <mark style="background-color: lightblue">SetBusVoltageRange(_bvr)</mark> - устанавливает измеряемый диапазон на шине, принимает значения 16 и 32, другие игнорирует;
- <mark style="background-color: lightblue">SetGain(_gain)</mark> - устанавливает масштабирование на шунте, принимает значения 40, 80, 160 и 320, другие игнорирует;
- <mark style="background-color: lightblue">SetBusADC(_badc)</mark> - устанавливает режим работы АЦП при работе с напряжением шины, принимает значения 9, 10, 11, 12, 2, 4, 8, 16, 32, 64 и 128, другие игнорирует;
- <mark style="background-color: lightblue">SetShuntADC(_sadc)</mark> - устанавливает режим работы АЦП при работе с напряжением на шунте, принимает значения 9, 10, 11, 12, 2, 4, 8, 16, 32, 64 и 128, другие игнорирует;
- <mark style="background-color: lightblue">SetSensorMode(_mode)</mark> - режим работы датчика, принимает целые значения от 0 до 8, другие игнорирует;
- <mark style="background-color: lightblue">GetShuntVoltage()</mark> - возвращает значение напряжения на шунте в миливольтах;
- <mark style="background-color: lightblue">GetBusVoltage()</mark> - возвращает значение напряжения на шине в вольтах;
- <mark style="background-color: lightblue">GetCurrent()</mark> - возвращает значение силы тока в амперах;
- <mark style="background-color: lightblue">GetPower()</mark> - возвращает значение мощности в ваттах;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - метод запускает циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода сверяется с минимальным значением, хранящимся в поле *_MinPeriod*, и, если требуется, регулируется;
- <mark style="background-color: lightblue">ChangeFreq(_num_channel, _period)</mark> - метод останавливает опрос указанного канала и запускает его вновь с уже новой частотой.
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - метод прекращает считывание значений с заданного канала.
</div>

### Низкоуровневый класс
<div style = "color: #555">

В модуле присутствует низкоуровневый класс для работы с регистрами датчика.

Поля низкоуровнего класса:
- <mark style="background-color: #AC5207">_I2с</mark> - шина I2C, к которой подключен датчик;
- <mark style="background-color: #AC5207">_Address_</mark> - адрес датчика на I2C шине.

Методы низкоуровнего класса:
- <mark style="background-color: #AC5207">ReadWord(_reg)</mark> - читает 2 байта с указанного региста;
- <mark style="background-color: #AC5207">WriteWord(_reg, _data)</mark> - записывает 2 байта в указанный регистр;
- <mark style="background-color: #AC5207">WhoIam(_wai)</mark> - производит сравнение региста WAI с переданным значением (только младшие 2 байта);
- <mark style="background-color: #AC5207">Reset()</mark> - даёт команду на перезапуск датчика;
- <mark style="background-color: #AC5207">Calibrate(_val)</mark> - записывает в калибровочный регистр переданное значение;
- <mark style="background-color: #AC5207">UnsignedToSigned(_val)</mark> - превращает беззнаковое двубайтовое число в число со знаком;
- <mark style="background-color: #AC5207">ReadShuntVoltageRaw()</mark> - считывает сырое значение напряжения на шунте;
- <mark style="background-color: #AC5207">ReadBusVoltageRaw()</mark> - считывает сырое значение напряжения на шине;
- <mark style="background-color: #AC5207">ReadPowerRaw()</mark> - считывает сырое значение мощности;
- <mark style="background-color: #AC5207">ReadCurrentRaw()</mark> - считывает сырое значение силы тока;
- <mark style="background-color: #AC5207">ConfigureBVR(_val)</mark> - устанавливает соответствующий флаг измеряемого диапазона на шине в конфигурационном регистре;
- <mark style="background-color: #AC5207">ConfigureGain(_val)</mark> - устанавливает соответствующий флаг измеряемого диапазона на шунте в конфигурационном регистре;
- <mark style="background-color: #AC5207">ConfigureBusADC(_val)</mark> - устанавливает соответствующий флаг режима работы АЦП при работе с напряжением на шине;
- <mark style="background-color: #AC5207">ConfigureShuntADC(_val)</mark> - устанавливает соответствующий флаг режима работы АЦП при работе с напряжением на шунте;
- <mark style="background-color: #AC5207">ConfigureMode(_val)</mark> - устанавливает соответствующий флаг режима работы датчика.
</div>

### Возвращаемые данные
<div style = "color: #555">

Датчик предоставляет данные о напряжении тока в вольтах (V) на шине, и в миливольтах (mV) на шунте, силе тока в амперах (A) и мощности в миливаттах (mW).
</div>

### Примеры
<div style = "color: #555">

Фрагмент кода для вывода данных о давлении и температуре в консоль раз в одну секунду. Предполагается, что все необходимые модули уже загружены в систему:
```js
//Создание объекта датчика и массива каналов
try {
  let ina = SensorManager.CreateDevice("00");
  ina[0].Start(1000);
  ina[1].Start(1000);
  ina[2].Start(1000);
  ina[3].Start(1000);

  // Вывод данных
  setInterval(() => {
    console.log(`Voltage Shunt: ${(ina[0].Value).toFixed(4)} mV    Voltage Bus: ${(ina[1].Value).toFixed(4)} V    Current: ${(ina[2].Value).toFixed(4)} A    Power: ${(ina[3].Value).toFixed(4)} mW`);
  }, 1000);
}
catch (e) {
  console.log(e);
}
```
Вывод данных в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>
<div>

# Зависимости
- [ClassSensor](https://github.com/Konkery/ModuleSensorArchitecture/blob/main/README.md)
- [SensorManager](https://github.com/Konkery/ModuleSensorManager/blob/main/README.md)
- [ModuleProcess](https://github.com/Konkery/ModuleProcess/blob/main/README.md)
- [ClassBaseI2CBus](https://github.com/Konkery/ModuleBaseI2CBus/blob/main/README.md)
- [ModuleAppError](https://github.com/Konkery/ModuleAppError/blob/main/README.md)
- [ModuleAppMath](https://github.com/Konkery/ModuleAppMath/blob/main/README.md)


</div>