const kafka = require("kafka-node");

const kafkaClient = new kafka.KafkaClient({
  kafkaHost: "kafka:9092",
});

const consumer = new kafka.Consumer(
  kafkaClient,
  [{ topic: "editor-events", partition: 0 }],
  { autoCommit: true }
);

const initConsumer = (io) => {
  consumer.on("message", async (message) => {
    try {
      const { docId, text } = JSON.parse(message.value);
      console.log(`Kafka Consumer received update for docId "${docId}"`);

      if (!docId) return;

      // Broadcast only to users in the same document room
      io.to(docId).emit("editor-data", { docId, text });

    } catch (error) {
      console.error("Error processing Kafka message:", error);
    }
  });

  consumer.on("error", (err) => {
    console.error("Kafka Consumer error:", err);
  });
};

module.exports = { initConsumer };
