const mqtt = require('mqtt');
const EventEmitter = require('events');

const sensorEvents = new EventEmitter();

let mqttClient = null;
let activeClients = 0;
let lastKnownData = null;

const toggleMQTT = (action) => {
    if (action === 'connect' && !mqttClient) {
        console.log('🚀 MQTT client started...');
        mqttClient = mqtt.connect({
            port: process.env.MQTT_PORT,
            host: process.env.MQTT_HOST,
            protocol: 'mqtt'
        });

        mqttClient.on('connect', () => {
            mqttClient.subscribe(process.env.MQTT_IOT_TOPIC);
        });

        mqttClient.on('message', (topic, message) => {
            try {
                lastKnownData = JSON.parse(message.toString());
                lastKnownData.timestamp = new Date().toISOString(); // Додаємо час

                sensorEvents.emit('newData', lastKnownData);
            } catch (e) {
                console.error('err: ', e);
            }
        });
    } else if (action === 'disconnect' && activeClients === 0 && mqttClient) {
        mqttClient.end();
        mqttClient = null;
    }
};

const initMQTTData = () => {
    console.log('📦 Fetching initial data on startup...');

    activeClients++;
    toggleMQTT('connect');

    sensorEvents.once('newData', (data) => {
        console.log('✅ Initial data received and saved.');
        activeClients--;
        toggleMQTT('disconnect');
    });
};

const iotSubscribe = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    activeClients++;
    toggleMQTT('connect');

    if (lastKnownData) {
        res.write(`data: ${JSON.stringify(lastKnownData)}\n\n`);
    }

    const dataHandler = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sensorEvents.on('newData', dataHandler);

    req.on('close', () => {
        activeClients--;
        sensorEvents.removeListener('newData', dataHandler);
        toggleMQTT('disconnect');
        res.end();
    });
};

module.exports = {
    iotSubscribe,
    initMQTTData
}