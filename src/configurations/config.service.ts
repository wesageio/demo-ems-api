import { parse, DotenvParseOutput } from 'dotenv';
import { readFileSync } from 'fs';

export class ConfigService {
    private readonly envConfig: DotenvParseOutput;

    constructor(filePath: string) {
        const parsedConfig = parse(readFileSync(filePath));
        this.envConfig = parsedConfig;
    }

    /**
     * Generic getter
     */
    get(key: string) {
        return this.envConfig[key];
    }

    /**
     * Getters for each environment variable
     */

    public get databaseType() {
        return this.envConfig.DATABASE_TYPE;
    }

    public get databaseHost() {
        return this.envConfig.DATABASE_HOST;
    }

    public get databasePort() {
        return Number(this.envConfig.DATABASE_PORT);
    }

    public get databaseName() {
        return this.envConfig.DATABASE_NAME;
    }

    public get jwtSecret() {
        return this.envConfig.JWT_SECRET;
    }
}
