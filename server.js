const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

// --- MQTT Broker ---
const mqttBroker = 'mqtts://d115221c.ala.eu-central-1.emqxsl.com:8883';
const mqttUser = 'planta';
const mqttPass = 'planta';
const mqttTopic = 'planta/linea1';

let latestData = { 
  faja1: "-", 
  faja2: "-", 
  bomba: "-", 
  servoMov: "-", 
  sensorReflectivo1: false,
  sensorReflectivo2: false,
  botellasEntrada: 0,
  botellasSalida: 0,
  distancia: 0
};

const client = mqtt.connect(mqttBroker, {
  username: mqttUser,
  password: mqttPass,
  clientId: 'Proxy_Planta'
});

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  client.subscribe(mqttTopic, (err) => {
    if(err) console.log('Error al suscribirse:', err);
    else console.log('Suscripción OK');
  });
});

client.on('message', (topic, message) => {
  try { latestData = JSON.parse(message.toString()); }
  catch(e) { console.log('Error parseando JSON', e); }
});

// --- Modo simulación opcional ---
const USE_SIMULATION = true;

function generateSimulatedData() {
  return {
    faja1: Math.random() > 0.2 ? "encendida" : "apagada",
    faja2: Math.random() > 0.25 ? "encendida" : "apagada",
    bomba: Math.random() > 0.3 ? "encendida" : "apagada",
    servoMov: Math.random() > 0.5 ? "activo" : "inactivo",
    sensorReflectivo1: Math.random() > 0.4,
    sensorReflectivo2: Math.random() > 0.3,
    botellasEntrada: Math.floor(Math.random() * 3),
    botellasSalida: Math.floor(Math.random() * 2),
    distancia: (Math.random() * 15 + 5).toFixed(1)
  };
}

if (USE_SIMULATION) {
  setInterval(() => {
    latestData = generateSimulatedData();
    console.log("Datos simulados:", latestData);
  }, 1000);
}

// --- API para dashboard ---
app.get('/api/data', (req, res) => {
  res.json(latestData);
});

// --- Railway usa process.env.PORT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));
