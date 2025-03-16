const kafka = require('kafka-node');

const kafkaClient = new kafka.KafkaClient({
  //  kafkaHost: 'localhost:9092' 
   kafkaHost: 'kafka:9092' 
  });
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => {
  console.log('Kafka Producer is ready');
});

producer.on('error', (err) => {
  console.error('Kafka Producer error:', err);
});

const sendToKafka = (topic, message) => {
  const payloads = [{ topic, messages: message }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error(`Error sending to Kafka (${topic}):`, err);
    } else {
      console.log(`Message sent to Kafka (${topic}):`, data);
    }
  });
};

module.exports = { sendToKafka };
