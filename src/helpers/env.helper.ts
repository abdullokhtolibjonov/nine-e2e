import { EnvConfig } from "src/types/env.types";

const ENV = process.env.TEST_ENV || 'staging';



const configs: Record<string, EnvConfig> = {
    staging: {
        BASE_URL: 'https://staging.example.com',
        API_URL: 'https://staging.api.example.com',
        AUTH_TOKEN: 'staging-token-123',
        DEFAULT_TIMEOUT: 5000,
    }
}

export const getConfig = (): EnvConfig => {
    const config = configs[ENV];
    if (!config) {
        throw new Error(`No configuration found for environment: ${ENV}`);
    }
    return config;
};