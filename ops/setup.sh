#!/bin/sh
set -eu

curl --fail-with-body -X PUT "http://elasticsearch:9200/_ingest/pipeline/crud-api-geoip" \
  -H "Content-Type: application/json" \
  --data @/bootstrap/elasticsearch/pipeline.json

curl --fail-with-body -X PUT "http://elasticsearch:9200/_ilm/policy/crud-api-retention" \
  -H "Content-Type: application/json" \
  -d '{"policy":{"phases":{"hot":{"actions":{}},"delete":{"min_age":"30d","actions":{"delete":{}}}}}}'

for object in dashboard/all-logs-overview search/all-log-entries visualization/all-log-total visualization/all-log-errors visualization/all-log-api-events visualization/all-log-events-over-time; do
  status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "http://kibana:5601/api/saved_objects/${object}" -H "kbn-xsrf: product-register-bootstrap")
  if [ "$status" != "200" ] && [ "$status" != "404" ]; then
    echo "Could not remove deprecated Saved Object ${object}: HTTP ${status}" >&2
    exit 1
  fi
done

awk 'index($0, "\"type\":\"map\",\"id\":\"api-request-locations\"") { if (map_seen++) next } index($0, "\"type\":\"visualization\",\"id\":\"api-log-outcomes-over-time\"") { gsub("\"name\":\"crud-api-logs\"", "\"name\":\"kibanaSavedObjectMeta.searchSourceJSON.index\""); if (chart_seen++) next } { print }' \
  /bootstrap/kibana/saved-objects.ndjson > /tmp/saved-objects.ndjson

curl --fail-with-body -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: product-register-bootstrap" \
  -F "file=@/tmp/saved-objects.ndjson"

echo "Observability bootstrap completed."
