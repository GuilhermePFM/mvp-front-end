#!/bin/bash
set -e

BROKER="broker:9092"
MAX_RETRIES=30
RETENTION_MS=86400000  # 24 hours

echo "=========================================="
echo "Kafka Topic Initialization"
echo "=========================================="
echo "Broker: $BROKER"
echo "Retention: ${RETENTION_MS}ms (24 hours)"
echo ""

# Wait for Kafka broker to be ready
echo "⏳ Waiting for Kafka broker to be ready..."
RETRY_COUNT=0
until /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server $BROKER > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ ERROR: Kafka broker not available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - waiting 2 seconds..."
  sleep 2
done

echo "✅ Kafka broker is ready!"
echo ""

# Create topics
echo "📝 Creating Kafka topics..."
echo ""

# Topic 1: batch-jobs
echo "Creating topic: batch-jobs"
/opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server $BROKER \
  --create \
  --if-not-exists \
  --topic batch-jobs \
  --partitions 1 \
  --replication-factor 1 \
  --config retention.ms=$RETENTION_MS \
  --config cleanup.policy=delete

if [ $? -eq 0 ]; then
  echo "✅ Topic 'batch-jobs' created/verified"
else
  echo "❌ Failed to create topic 'batch-jobs'"
  exit 1
fi

echo ""

# Topic 2: embeddings-results
echo "Creating topic: embeddings-results"
/opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server $BROKER \
  --create \
  --if-not-exists \
  --topic embeddings-results \
  --partitions 1 \
  --replication-factor 1 \
  --config retention.ms=$RETENTION_MS \
  --config cleanup.policy=delete

if [ $? -eq 0 ]; then
  echo "✅ Topic 'embeddings-results' created/verified"
else
  echo "❌ Failed to create topic 'embeddings-results'"
  exit 1
fi

echo ""
echo "=========================================="
echo "📋 Listing all topics:"
echo "=========================================="
/opt/kafka/bin/kafka-topics.sh --bootstrap-server $BROKER --list
echo ""
echo "=========================================="
echo "✅ Topic initialization completed successfully!"
echo "=========================================="