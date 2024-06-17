/**
 * @class
 * Модуль реализует базовые функции датчика тока и напряжения на базе чипа INA219.
 */
class ClassPowerINA219 extends ClassSensor /*ClassMiddleSensor*/ {
    /**
     * @constructor
     * @param {Object} _opts   - Объект с параметрами по нотации ClassMiddleSensor
     */
    constructor(_opts/*, _sensor_props*/) {
        // ClassMiddleSensor.apply(this, [_opts, _sensor_props]);
        ClassSensor.call(this, _opts);
        this._Name = 'ClassPowerINA219'; //переопределяем имя типа
		// this._Sensor = require('BaseClassINA219.min.js').connect(_opts.bus, undefined, _opts_address);
        this._Sensor = new (require('BaseClassINA219.min.js'))(_opts.bus, _opts.address);
        this._MinPeriod = 20;
        this._UsedChannels = [];        // сейчас можно смотреть свойство канала _Channel[i].Status (0 | 1 | 2) вместо создания таких массивов
        this._Interval;
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
        //this._Sensor.setConfig({});
        if (!this._UsedChannels.includes(_num_channel)) this._UsedChannels.push(_num_channel); //номер канала попадает в список опрашиваемых каналов. Если интервал уже запущен с таким же периодои, то даже нет нужды его перезапускать 
        if (!this._Interval) {          //если в данный момент не ведется ни одного опроса
            this._Interval = setInterval(() => {
                if (this._UsedChannels.includes(0)) this.Ch0_Value = this._Sensor.GetShuntVoltage();
                if (this._UsedChannels.includes(1)) this.Ch1_Value = this._Sensor.GetBusVoltage();
                if (this._UsedChannels.includes(2)) this.Ch2_Value = this._Sensor.GetCurrent();
                if (this._UsedChannels.includes(3)) this.Ch3_Value = this._Sensor.GetPower();
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
        if (_num_channel) this._UsedChannels.splice(this._UsedChannels.indexOf(_num_channel));
        else {
            this._UsedChannels = [];
            clearInterval(this._Interval);
            this._Interval = null;
        }
    }
}
	

exports = ClassPowerINA219;