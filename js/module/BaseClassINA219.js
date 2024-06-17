/**
 * @class
 * Базовый класс для работы с регистрами датчика INA219
 */
class BaseClassINA {
  /**
   * @constructor
   */
  constructor (bus, address, opts) {
      this._i2c = bus;
      this._address = address || 0x40;
      this._opts = opts || {};
      this.Init();
  }
  /**
   * @method
   * Чтение слова с шины
   * @returns {Number} - двубайтное число без знака
   */
  ReadI2C(reg, bytes) {
      if (bytes === undefined) {bytes = 2;}
      this._i2c.writeTo(this._address, reg | 0x80);
      const data = this._i2c.readFrom(this._address, bytes);
      return data[0] << 8 | data[1];
  }
  /**
   * @method
   * Запись слова на шину
   */
  WriteI2C(reg, data) {
      this._i2c.writeTo(this._address, [reg, data >> 8, data]);
  }
  /**
   * @method
   * Инициализация датчика, настройка конфигураций
   */
  Init() {
      this.WriteI2C(0x00, 0x8000);// Ресет
      if (this.ReadI2C(0x00, 2) !== 0x399F) {throw new Error("INA219 not found!");}// Кто я?

      // Настроить максимальную силу тока и сопротивление на шунте
      let maxCurrent = this._opts.maxCurrent || 3.2768;
      this._opts.maxCurrent = maxCurrent;

      let rShunt = this._opts.rShunt || 0.1;
      this._opts.rShunt= rShunt;

      this._opts.currentLSB = (maxCurrent * 3.0517578125 / 100000.0);

      // Записать калибровочное значение
      this.WriteI2C(0x05, (Math.round(0.04096 / (this._opts.currentLSB * rShunt))));

      // Конфигурация
      let config = 0;

      // Диапазон напряжения
      let busVoltageRange = this._opts.busVoltageRange || 32;
      this._opts.busVoltageRange = busVoltageRange;
      if (busVoltageRange == 32) {config |= 0x2000;}

      // Коэффициент передачи
      let gain = this._opts.gain || 8;
      this._opts.gain = gain;       
      switch (gain) {
          case 2:
              config |= (1 << 11);
              break;
          case 4:
              config |= (2 << 11);
              break;
          case 8:
              config |= (3 << 11);
              break;
          default:
              break;
      }

      // Настройка АЦП шины
      let busADC = this._opts.busADC || 12;
      this._opts.busADC = busADC;
      switch (busADC) {
          case 10:
              config |= (1 << 7);
              break;
          case 11:
              config |= (2 << 7);
              break;
          case 12:
              config |= (3 << 7);
              break;
          case 2:
              config |= (9 << 7);
              break;
          case 4:
              config |= (10 << 7);
              break;
          case 8:
              config |= (11 << 7);
              break;
          case 16:
              config |= (12 << 7);
              break;
          case 32:
              config |= (13 << 7);
              break;
          case 64:
              config |= (14 << 7);
              break;
          case 128:
              config |= (15 << 7);
              break;
          default:
              break;
      }

      // Настройка АЦП шунта
      let shuntADC = this._opts.shuntADC || 12;
      this._opts.shuntADC = shuntADC;
      switch (shuntADC) {
          case 10:
              config |= (1 << 3);
              break;
          case 11:
              config |= (2 << 3);
              break;
          case 12:
              config |= (3 << 3);
              break;
          case 2:
              config |= (9 << 3);
              break;
          case 4:
              config |= (10 << 3);
              break;
          case 8:
              config |= (11 << 3);
              break;
          case 16:
              config |= (12 << 3);
              break;
          case 32:
              config |= (13 << 3);
              break;
          case 64:
              config |= (14 << 3);
              break;
          case 128:
              config |= (15 << 3);
              break;
          default:
              break;
      }

      // Настройка режима
      let mode = this._opts.mode || 7;
      this._opts.mode = mode;
      config |= mode;

      this.WriteI2C(0x00, config);
  }
  /**
   * @method
   * Перевод слова из беззнакового числа в знаковое
   * @returns {Number} - двубайтное число со знаком
   */
  UnsignedToSigned(val) {
      return ((val & 32768) ? val - 65536 : val);
  }
  /**
   * @method
   * Вывод текущей конфигурации датчика
   * @returns {Object} opts - объект, содержащий конфигурацию датчика
   */
  GetConfig() {
      return this._opts;
  }
  /**
   * @method
   * Возвращение напряжения на шунте в миливольтах
   * @returns {Float} - значение напряжения
   */
  GetShuntVoltage() {
      return (this.UnsignedToSigned(this.ReadI2C(0x01, 2)) * 0.00001);
  }
  /**
   * @method
   * Возвращает нагрузочное напряжение в вольтах
   * @returns {Float} - значение напряжения
   */
  GetBusVoltage() {
      let data = this.ReadI2C(0x02, 2);
      let flags = data & 0x03;
      if (flags & 0x01) return -100;
      return ((data >> 3) * 0.004);
  }
  /**
   * @method
   * Возвращает значение силы тока в амперах
   * @returns {Float} - значение силы тока
   */
  GetPower() {
      return ((this.ReadI2C(0x03, 2)) * this._opts.currentLSB * 20);
  }
  /**
   * @method
   * Возвращает значение мощности в миливаттах
   * @returns {Float} - значение мощности
   */
  GetCurrent() {
      return (this.UnsignedToSigned(this.ReadI2C(0x04, 2)) * this._opts.currentLSB);
  }
}

exports = BaseClassINA;