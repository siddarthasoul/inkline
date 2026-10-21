import dotenv from "dotenv";

dotenv.config();

class Env {
    private require(key: string): string {
        const value = process.env[key];

        if (value === undefined || value.trim() === "") {
            throw new Error(`Missing required environment variable: ${key}`);
        }

        return value;
    }

    private getString(key: string, defaultValue?: string): string {
        return process.env[key] ?? defaultValue ?? "";
    }

    private getNumber(key: string, defaultValue?: number): number {
        const value = process.env[key];

        if (!value) {
            if (defaultValue !== undefined) return defaultValue;
            throw new Error(`Missing number environment variable: ${key}`);
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            throw new Error(`${key} must be a valid number`);
        }

        return number;
    }

    private getBoolean(key: string, defaultValue?: boolean): boolean {
        const value = process.env[key];

        if (!value) {
            return defaultValue ?? false;
        }

        return value.toLowerCase() === "true";
    }

    readonly app = {
        name: this.getString("APP_NAME", "artical"),
        env: this.getString("NODE_ENV", "development"),
        debug: this.getBoolean("DEBUG", false),
        apiPrefix: this.getString("API_V1_PREFIX", "/api/v1"),
    };

    readonly server = {
        host: this.getString("HOST", "0.0.0.0"),
        port: this.getNumber("PORT", 8000),
    };

    readonly jwt = {
        secret: this.require("JWT_SECRET"),
        algorithm: this.getString("JWT_ALGORITHM", "HS256"),
        accessTokenExpireMinutes: this.getNumber(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            15
        ),
        refreshTokenExpireDays: this.getNumber(
            "REFRESH_TOKEN_EXPIRE_DAYS",
            7
        ),
    };

    readonly cookie = {
        secure: this.getBoolean("COOKIE_SECURE", false),
        sameSite: this.getString("COOKIE_SAMESITE", "lax"),
        domain: this.getString("COOKIE_DOMAIN"),
    };

    readonly db = {
        mongo_uri: this.require("MONGO_URI"),
        database: this.require("MONGO_DB_NAME"),
    };


    readonly frontend = {
        url: this.getString("FRONTEND_URL"),
    };



    readonly cors = {
        allowedHosts: this.getString("ALLOWED_HOSTS", "*"),
        allowedOrigins: this.getString("ALLOWED_ORIGINS"),
    };

    readonly owner = {
        email: this.getString("OWNER_EMAIL").trim().toLowerCase(),
        password: this.getString("OWNER_PASSWORD"),
    };

    readonly redis = {
        url: this.getString("REDIS_URL"),
        cacheTtlSeconds: this.getNumber("CACHE_TTL_SECONDS", 60),
    };


}

const env = new Env();

export default env;