const kafka = require('kafka-node');

const kafkaClient = new kafka.KafkaClient({
  //  kafkaHost: 'localhost:9092' 
   kafkaHost: 'kafka:9092' 
  });
const consumer = new kafka.Consumer(
  kafkaClient,
  [{ topic: 'editor-events', partition: 0 }],
  { autoCommit: true }
);

const initConsumer = () => {
  consumer.on('message', (message) => {
    console.log('Message received from Kafka:', message.value);
  });

  consumer.on('error', (err) => {
    console.error('Kafka Consumer error:', err);
  });
};

module.exports = { initConsumer };
