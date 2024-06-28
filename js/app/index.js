try {
  let ina = SensorManager.CreateDevice("00");
  ina[0].Start(1000);
  ina[1].Start(1000);
  ina[2].Start(1000);
  ina[3].Start(1000);

  // Вывод данных
  setInterval(() => {
    console.log(`Voltage Shunt: ${(ina[0].Value).toFixed(4)} V    Voltage Bus: ${(ina[1].Value).toFixed(4)} V    Current: ${(ina[2].Value).toFixed(4)} A    Power: ${(ina[3].Value).toFixed(4)} mW`);
  }, 1000);
}
catch (e) {
  console.log(e);
}