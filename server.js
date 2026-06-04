const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

const mqttBroker = 'mqtts://d115221c.ala.eu-central-1.emqxsl.com:8883';
const mqttUser = 'planta';
const mqttPass = 'planta';
const mqttTopic = 'planta/linea1';

let latestData = { faja1: "-", faja2: "-", bomba: "-", botellas: 0 };

const client = mqtt.connect(mqttBroker, {
  username: mqttUser,
  password: mqttPass,
  clientId: 'Proxy_Planta'
});

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  client.subscribe(mqttTopic, (err) => {
    if(err) console.log('Error al suscribirse:', err);
  });
});

client.on('message', (topic, message) => {
  try { latestData = JSON.parse(message.toString()); }
  catch(e) { console.log('Error parseando JSON', e); }
});

app.get('/api/data', (req, res) => {
  res.json(latestData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));

