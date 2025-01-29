import { BullMQInstrumentation } from '@appsignal/opentelemetry-instrumentation-bullmq';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK, tracing, logs, metrics, api } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { tryGetEnv } from '@libs/core';

const projectName = tryGetEnv('PROJECT_NAME');
const exporter = new OTLPTraceExporter();

api.metrics.setGlobalMeterProvider(
    new metrics.MeterProvider({
        readers: [
            new metrics.PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporter(),
            }),
        ],
    }),
);

console.log('Setting up OpenTelemetry SDK');

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: projectName,
    }),
    traceExporter: exporter,
    logRecordProcessor: new logs.SimpleLogRecordProcessor(
        new OTLPLogExporter(),
    ),
    spanProcessor: new tracing.SimpleSpanProcessor(exporter),
    instrumentations: [
        getNodeAutoInstrumentations(),
        new BullMQInstrumentation({
            // When true, the producer span is used as the parent of the consumer span.
            // Concretely, this means that there is no separate trace for the job processing.
            // It will be strictly considered a part of the overall trace.
            // This might be what we want, or not.
            // When false, there is still a link from the second trace (the job processing) to the initial trace (the job creation).
            // useProducerSpanAsConsumerParent: true,
        }),
    ],
    textMapPropagator: new B3Propagator(),
    serviceName: projectName,
});

sdk.start();
