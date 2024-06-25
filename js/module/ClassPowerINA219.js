/**
 * @class
 * Низкоуровневый класс для работы с регистрами датчика INA219
 */
class LowLevelClassINA {
    /**
     * @constructor
     */
    constructor (_bus, _address) {
        this._I2c = _bus;
        this._Address = _address || 0x40;
    }
    /**
     * @method
     * Чтение слова с датчика
     * @param {Number}  _reg  - Адрес регистра 
     * @returns {Number} res  - двубайтное число без знака
     */
    ReadWord(_reg) {
        this._I2c.writeTo(this._Address, _reg | 0x80);
        const data = this._I2c.readFrom(this._Address, 2);
        return data[0] << 8 | data[1];
    }
    /**
     * @method
     * Запись слова на датчик
     * @param {Number} _reg   - Адрес регистра
     * @param {Number} _data  - Передаваемое байтовое слово
     */
    WriteWord(_reg, _data) {
        this._I2c.writeTo(this._Address, [_reg, _data >> 8, _data]);
    }
    /**
     * @method
     * Проверка датчика
     * @param {Number} _wai     - значение WAI
     * @returns {Boolean} res   - true, если датчик не найден 
     */
    WhoIam(_wai) {
        return (this.ReadWord(0x00) !== (_wai || 0x399F));
    }
    /**
     * @method
     * Перезагружает датчик
     */
    Reset() {
        this.WriteWord(0x00, 0x8000);
    }
    /**
     * @method
     * Настройка калибровочного регистра - стр.17 документации
     * @param {Number} _val     - калибровочное значение
     */
    Calibrate(_val) {
        this.WriteWord(0x05, _val);
    }
    /**
     * @method
     * Перевод слова из беззнакового числа в знаковое
     * @param {Number}  _val  - число, которое нужно преобразовать
     * @returns {Number} res  - двубайтное число со знаком
     */
    UnsignedToSigned(_val) {
        return ((_val & 32768) ? _val - 65536 : _val);
    }
    /**
     * @method
     * Возвращение непреобразованного напряжения на шунте
     * @returns {Number} res   - значение напряжения
     */
    ReadShuntVoltageRaw() {
        return this.UnsignedToSigned(this.ReadWord(0x01));
    }
    /**
     * @method
     * Возвращает непреобразованного нагрузочное напряжение
     * @returns {Float} res   - значение напряжения
     */
    ReadBusVoltageRaw() {
        return this.ReadWord(0x02) >> 3;
    }
    /**
     * @method
     * Возвращает непреобразованного значение силы тока
     * @returns {Float} res   - значение силы тока
     */
    ReadPowerRaw() {
        return this.ReadWord(0x03);
    }
    /**
     * @method
     * Возвращает непреобразованного значение мощности
     * @returns {Float} res   - значение мощности
     */
    ReadCurrentRaw() {
        return this.UnsignedToSigned(this.ReadWord(0x04));
    }    
    /**
     * @method
     * Технический метод - настраивает диапазон напряжения шины
     * @param {Number} _val     - код для маски регистра
     */
    ConfigureBVR(_val) {
        let cfg = this.ReadWord(0x00);
        cfg &= 0xDFFF;
        (_val == 32 ? cfg |= (0x2000) : 0);
        this.WriteWord(0x00, cfg);
    }
    /**
     * @method
     * Технический метод - настраивает диапазон напряжения шунта
     * @param {Number} _val     - код для маски регистра
     */
    ConfigureGain(_val) {
        let cfg = this.ReadWord(0x00);
        const pga = {
            40: 0,
            80: 0x800,
            160: 0x1000,
            320: 0x1800
        };
        cfg &= 0xE7FF;
        cfg |= pga[_val];
        this.WriteWord(0x00, cfg);
    }
    /**
     * @method
     * Технический метод - настраивает режим работы АЦП шины
     * @param {Number} _val     - код для маски регистра 
     */
    ConfigureBusADC(_val) {
        let cfg = this.ReadWord(0x00);
        const adc = {
            9: 0, 10: 0x80, 11: 0x100, 12: 0x180,
            2: 0x480, 4: 0x500, 8: 0x580, 16: 0x600,
            32: 0x680, 64: 0x700, 128: 0x780
        };
        cfg &= 0xF87F;
        cfg |= adc[_val];
        this.WriteWord(0x00, cfg);
    }
    /**
     * @method
     * Технический метод - настраивает режим работы АЦП шунта
     * @param {Number} _val     - код для маски регистра 
     */
    ConfigureShuntADC(_val) {
        let cfg = this.ReadWord(0x00);
        const adc = {
            9: 0, 10: 0x80, 11: 0x100, 12: 0x180,
            2: 0x480, 4: 0x500, 8: 0x580, 16: 0x600,
            32: 0x680, 64: 0x700, 128: 0x780
        };
        cfg &= 0xFF87;
        cfg |= adc[_val] >> 4;
        this.WriteWord(0x00, cfg);
    }
    /**
     * @method
     * Технический метод - настраивает режим работы датчика
     * @param {Number} _val     - код для маски регистра 
     */
    ConfigureMode(_val) {
        let cfg = this.ReadWord(0x00);
        cfg &= 0xFFF8;
        cfg |= _val;
        this.WriteWord(0x00, cfg);
    }
}

/**
 * @class
 * Модуль реализует базовые функции датчика тока и напряжения на базе чипа INA219 по нотации фреймворка.
 */
class ClassPowerINA219 extends ClassSensor {
    /**
     * @constructor
     * @param {Object} _opts   - Объект с параметрами, содержащий шину bus (обязательное поле), 
     * адрес датчика address и его конфигурацию config (опциональные поля)
     */
    constructor(_opts) {
        ClassSensor.call(this, _opts);
        this._Name = 'ClassPowerINA219'; //переопределяем имя типа
        this._Sensor = new LowLevelClassINA(_opts.bus, _opts.address);
        this._Config = _opts.config || {};
        this._MinPeriod = 20;
        this._Interval;
        this.Init();
    }
    /**
     * @method
     * Инициализация датчика, перезагрузка, проверка и калибровка
     */
    Init() {
        this._Sensor.Reset();
        if (this._Sensor.WhoIam(this._Config.WAI)) {throw new Error("INA219 not found!");};

        this._Config.maxCurrent = this._Config.maxCurrent || 3.2768;
        this._Config.rShunt = this._Config.rShunt || 0.1;
        this._Config.currentLSB = (this._Config.maxCurrent * 3.0517578125 / 100000.0);
        this._Sensor.Calibrate((Math.round(0.04096 / (this._Config.currentLSB * this._Config.rShunt))));

        this._Config.busVoltageRange = this._Config.busVoltageRange || 32;
        this._Config.gain = this._Config.gain || 320;
        this._Config.busADC = this._Config.busADC || 12;
        this._Config.shuntADC = this._Config.shuntADC || 12;
        this._Config.mode = this._Config.mode || 7;

        this.SetBusVoltageRange(this._Config.busVoltageRange);
        this.SetGain(this._Config.gain);
        this.SetBusADC(this._Config.busADC);
        this.SetShuntADC(this._Config.shuntADC);
        this.SetSensorMode(this._Config.mode);
    }
    /**
     * @method
     * Устанавливает максимальную силу тока, перекалибровывая датчик
     * @param {Number} _val     - значение максимальной силы тока в амперах
     */
    SetMaxCurrent(_amps) {
        this._Config.maxCurrent = _amps || 3.2768;
        this._Config.currentLSB = (this._Config.maxCurrent * 3.0517578125 / 100000.0);
        this._Sensor.Calibrate((Math.round(0.04096 / (this._Config.currentLSB * this._Config.rShunt))));
    }
    /**
     * @method
     * Устанавливает значение сопротивления шунта, перекалибровывая датчик
     * @param {Number} _val     - значение сопротивления в омах
     */
    SetShuntResist(_ohms) {
        this._Config.rShunt = _ohms || 0.1;
        this._Sensor.Calibrate((Math.round(0.04096 / (this._Config.currentLSB * this._Config.rShunt))));
    }
    /**
     * @method
     * Конфигурирует датчик, настраивает дапазон напряжения на шине
     * @param {Number} _val        - значение диапазона в вольтах - 16 или 32
     */
    SetBusVoltageRange(_bvr) {
        const bvr_values = [16, 32];
        if (bvr_values.includes(_bvr)) {
            this._Sensor.ConfigureBVR(_bvr);
            this._Config.busVoltageRange = _bvr;
        }
    }
    /**
     * @method
     * Конфигурирует датчик, настраивает дапазон напряжения на шунте
     * @param {Number} _val        - значение диапазона в миливольтах - 40, 80, 160 или 320
     */
    SetGain(_gain) {
        const gain_values = [40, 80, 160, 320];
        if (gain_values.includes(_gain)) {
            this._Sensor.ConfigureGain(_gain);
            this._Config.gain = _gain;
        }
    }
    /**
     * @method
     * Конфигурирует датчик, настраивает режим работы АЦП шины
     * @param {Number} _val        - режим работы АЦП: разрядность или количество сэмплов
     */
    SetBusADC(_badc) {
        const adc_values = [9, 10, 11, 12, 2, 4, 8, 16, 32, 64, 128];
        if (adc_values.includes(_badc)) {
            this._Sensor.ConfigureBusADC(_badc);
            this._Config.busADC = _badc;
        }
    }
    /**
     * @method
     * Конфигурирует датчик, настраивает режим работы АЦП шунта
     * @param {Number} _val        - режим работы АЦП: разрядность или количество сэмплов
     */
    SetShuntADC(_sadc) {
        const adc_values = [9, 10, 11, 12, 2, 4, 8, 16, 32, 64, 128];
        if (adc_values.includes(_sadc)) {
            this._Sensor.ConfigureShuntADC(_sadc);
            this._Config.shuntADC = _sadc;
        }
    }
    /**
     * @method
     * Конфигурирует датчик, настраивает режим работы датчика
     * @param {Number} _val        - код режима - от 0 (выкл) до 7 (постоянное считывание)
     */
    SetSensorMode(_mode) {
        const modes = [0, 1, 2, 3, 4, 5, 6, 7];
        if (modes.includes(_mode)) {
            this._Sensor.ConfigureMode(_mode);
            this._Config.mode = _mode;
        }
    }
    /**
     * @method
     * Возвращает напряжение на шунте в миливольтах
     * @returns 
     */
    GetShuntVoltage() {
        return this._Sensor.ReadShuntVoltageRaw() * 0.00001; 
    }
    /**
     * @method
     * Возвращает напряжение на шине в вольтах
     * @returns 
     */
    GetBusVoltage() {
        return this._Sensor.ReadBusVoltageRaw() * 0.004; 
    }
    /**
     * @method
     * Возвращает ток в амперах
     * @returns 
     */
    GetCurrent() {
        return this._Sensor.ReadCurrentRaw() * this._Config.currentLSB; 
    }
    /**
     * @method
     * Возвращает мощность в миниваттах
     * @returns 
     */
    GetPower() {
        return this._Sensor.ReadPowerRaw() * this._Config.currentLSB * 20; 
    }
    /**
     * @method
     * Запускает сбор данных с датчика и передачи их в каналы
     * @param {Number} _period          - частота опроса (минимум 20 мс)
     * @param {Number} _num_channel     - номер канала
     */
    Start(_num_channel, _period) {
        let period = (typeof _period === 'number' & _period >= this._MinPeriod) ? _period    //частота сверяется с минимальной
                 : this._MinPeriod;
        this._ChStatus[_num_channel] = 1;
        if (!this._Interval) {          //если в данный момент не ведется ни одного опроса
            this._Interval = setInterval(() => {
                if (this._ChStatus[0]) this.Ch0_Value = this.GetShuntVoltage();
                if (this._ChStatus[1]) this.Ch1_Value = this.GetBusVoltage();
                if (this._ChStatus[2]) this.Ch2_Value = this.GetCurrent();
                if (this._ChStatus[3]) this.Ch3_Value = this.GetPower();
            }, period);
        }
    }
    /**
     * @method
     * Меняет частоту опроса датчика
     * @param {Number} freq     - новая частота опроса (минимум 20 мс)
     */
    ChangeFreq(_num_channel, freq) {
        clearInterval(this._Interval);
        setTimeout(() => this.Start(freq), this._MinPeriod);
    }
    /**
     * @methhod
     * Останавливает сбор данных с датчика
     * @param {Number} _num_channel   - номер канала, в который должен быть остановлен поток данных
     */
    Stop(_num_channel) {
        this._ChStatus[_num_channel] = 0;
        if (this._ChStatus[0] == 0 && this._ChStatus[1] == 0 && this._ChStatus[2] == 0 && this._ChStatus[3] == 0) {
            clearInterval(this._Interval);
            this._Interval = null;
        }
    }
}	

exports = ClassPowerINA219;