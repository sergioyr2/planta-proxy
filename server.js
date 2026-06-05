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

// --- Datos iniciales ---
let latestData = { 
  faja1: false,
  faja2: false,
  bomba: false,
  servo: false,
  capacitivo: false,
  reflectivo1: false,
  reflectivo2: false,
  inductivo: false,
  botellasEntrada: 0,
  botellasSalida: 0,
  distancia: 0
};

// --- Conexión MQTT ---
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
  try {
    // Parsear JSON recibido
    const msg = JSON.parse(message.toString());
    
    // Asignar solo los campos que necesita el dashboard
    latestData = {
      faja1: msg.faja1 || false,
      faja2: msg.faja2 || false,
      bomba: msg.bomba || false,
      servo: msg.servo || false,
      capacitivo: msg.capacitivo || false,
      reflectivo1: msg.reflectivo1 || false,
      reflectivo2: msg.reflectivo2 || false,
      inductivo: msg.inductivo || false,
      botellasEntrada: msg.botellasEntrada || 0,
      botellasSalida: msg.botellasSalida || 0,
      distancia: msg.distancia || 0
    };
  } catch(e) {
    console.log('Error parseando JSON', e);
  }
});

// --- API REST ---
app.get('/api/data', (req, res) => {
  res.json(latestData);
});

// --- Puerto ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));
