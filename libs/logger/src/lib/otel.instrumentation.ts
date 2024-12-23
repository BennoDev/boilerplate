import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export const setupOtel = (projectName: string): void => {
    const exporter = new OTLPTraceExporter();

    const sdk = new NodeSDK({
        resource: new Resource({
            [ATTR_SERVICE_NAME]: projectName,
        }),
        traceExporter: exporter,
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter(),
        }),
        spanProcessors: [new SimpleSpanProcessor(exporter)],
        instrumentations: [getNodeAutoInstrumentations()],
        textMapPropagator: new B3Propagator(),
        serviceName: projectName,
    });

    sdk.start();
};
