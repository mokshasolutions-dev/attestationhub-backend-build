/**
 * Complete flat configuration object
 */
export interface Config {
    PORT: number;
    NODE_ENV: string;
    TENANT_ID: string;
    DB_BASE_PATH: string;
    IMAGE_BASE_URL: string;
    JWT_SECRET: string;
    API_KEY_SALT: string;
    BCRYPT_SALT_ROUNDS: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    CORS_ALLOWED_ORIGINS: string[];
    REDIS_ENABLED: boolean;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    REDIS_DB: number;
    REDIS_TLS_ENABLED: boolean;
    IAM_BASE_URL: string;
    DASHBOARD_WORKFLOW_API: string;
    LIST_WORKFLOW_API: string;
    DETAILS_WORKFLOW_API: string;
    STAGE_WORKFLOW_API: string;
    STAGE_ACTION_APPLICATION_API: string;
    STAGE_ACTION_ENTITLEMENT_API: string;
    STAGE_ACTION_BIRTHRIGHT_API: string;
    IAM_USERNAME_ENCRYPTED: string;
    IAM_PASSWORD_ENCRYPTED: string;
    IAM_REQUEST_TIMEOUT_MS: number;
    IAM_USE_DUMMY_DATA: boolean;
    LOG_LEVEL: string;
    LOG_FORMAT: 'json' | 'simple';
    AUTH_COOKIE_DOMAIN?: string;
    UI_REDIRECT_URL: string;
    JDBC_FILE_BASE_URL: string;
    JDBC_FILE_STORAGE_PATH: string;
    EVIDENCE_UPLOAD_STORAGE_PATH: string;
}
/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
/**
 * API error structure
 */
export interface ApiError {
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
}
/**
 * Cache status outcomes
 */
export type CacheStatus = 'HIT' | 'MISS' | 'BYPASS';
/**
 * Cache metadata for observability
 */
export interface CacheMetadata {
    status: CacheStatus;
    key?: string;
    latencyMs?: number;
    isDummy?: boolean;
}
/**
 * Response metadata
 */
export interface ResponseMeta {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
}
/**
 * Health check response
 */
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    services: {
        redis: ServiceStatus;
        iam: ServiceStatus;
    };
}
/**
 * Service status for health checks
 */
export interface ServiceStatus {
    status: 'up' | 'down';
    latencyMs?: number;
    error?: string;
}
/**
 * Dashboard Request Payload
 */
export interface DashboardRequest {
    owner: string;
}
/**
 * SailPoint Workflow Request Payload
 */
export interface SailPointWorkflowRequest {
    workflowArgs: {
        owner: string;
        attestationType: string;
    };
}
/**
 * SailPoint Workflow Response
 */
export interface SailPointWorkflowResponse {
    attributes: {
        responseMap: {
            [key: string]: {
                pending?: number;
                autoclosed?: number;
                completed?: number;
                top5items: Array<Record<string, string>>;
            };
        };
    };
    workflowArgs?: {
        [key: string]: {
            pending?: number;
            autoclosed?: number;
            completed?: number;
            top5items: Array<Record<string, string>>;
        };
    };
    success: boolean;
}
/**
 * Final Dashboard Statistics Format
 */
export interface DashboardStats {
    [category: string]: {
        completed?: number;
        pending?: number;
        autoclosed?: number;
        top5items: Array<Record<string, string>>;
    };
}
/**
 * JWT Payload structure
 */
export interface JWTPayload {
    sub: string;
    tenantId: string;
    roles: string[];
    iat: number;
    exp: number;
}
/**
 * Authenticated request user
 */
export interface AuthenticatedUser {
    id: string;
    tenantId: string;
    roles: string[];
}
/**
 * Express request with authenticated user
 */
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            requestId?: string;
        }
    }
}
//# sourceMappingURL=index.d.ts.map