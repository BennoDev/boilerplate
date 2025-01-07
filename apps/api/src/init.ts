import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK, tracing, logs, metrics } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { tryGetEnv } from '@libs/core';

const projectName = tryGetEnv('PROJECT_NAME');
const exporter = new OTLPTraceExporter();

console.log('Setting up OpenTelemetry SDK');

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: projectName,
    }),
    traceExporter: exporter,
    metricReader: new metrics.PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
    }),
    logRecordProcessor: new logs.SimpleLogRecordProcessor(
        new OTLPLogExporter(),
    ),
    spanProcessor: new tracing.SimpleSpanProcessor(exporter),
    instrumentations: [getNodeAutoInstrumentations({})],
    textMapPropagator: new B3Propagator(),
    serviceName: projectName,
});

sdk.start();
