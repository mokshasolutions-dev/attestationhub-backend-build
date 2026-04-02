"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const router = (0, express_1.Router)();
// Application start time for uptime calculation
const startTime = Date.now();
/**
 * GET /api/health
 * Comprehensive health check endpoint
 */
router.get('/', async (_req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    // Check Redis health
    const redisHealth = await services_1.redisService.ping();
    // Check IAM health
    const iamHealth = await services_1.iamService.healthCheck();
    // Determine overall status
    let overallStatus = 'healthy';
    if (!redisHealth.healthy || !iamHealth.healthy) {
        overallStatus = 'degraded';
    }
    if (!redisHealth.healthy && !iamHealth.healthy) {
        overallStatus = 'unhealthy';
    }
    const healthResponse = {
        status: overallStatus,
        version: process.env['npm_package_version'] ?? '1.0.0',
        uptime,
        services: {
            redis: {
                status: redisHealth.healthy ? 'up' : 'down',
                latencyMs: redisHealth.latencyMs,
            },
            iam: {
                status: iamHealth.healthy ? 'up' : 'down',
                latencyMs: iamHealth.latencyMs,
                error: iamHealth.error,
            },
        },
    };
    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
    const response = {
        success: overallStatus !== 'unhealthy',
        data: healthResponse,
    };
    res.status(statusCode).json(response);
});
/**
 * GET /api/health/live
 * Kubernetes liveness probe - just checks if the server is responsive
 */
router.get('/live', (_req, res) => {
    const response = {
        success: true,
        data: { alive: true },
    };
    res.json(response);
});
/**
 * GET /api/health/ready
 * Kubernetes readiness probe - checks if the service is ready to accept traffic
 */
router.get('/ready', async (_req, res) => {
    // Check if Redis is connected
    const redisHealth = await services_1.redisService.ping();
    if (!redisHealth.healthy) {
        const response = {
            success: false,
            data: { ready: false, reason: 'Redis not connected' },
        };
        res.status(503).json(response);
        return;
    }
    const response = {
        success: true,
        data: { ready: true },
    };
    res.json(response);
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map