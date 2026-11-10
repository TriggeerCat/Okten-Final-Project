import envData from "../../env/env";

export const AUTH_TOKEN_ENUM = {
    access: "access",
    refresh: "refresh",
    // activate / recovery password link (30 minutes)
    action: "action"
} as const;

export type AuthTokens = (typeof AUTH_TOKEN_ENUM)[keyof typeof AUTH_TOKEN_ENUM];

export const getSecretByTokenType = (tokenType: AuthTokens) => {
    switch (tokenType) {
        case AUTH_TOKEN_ENUM.access:
            return envData.JWT_ACCESS_SECRET;
        case AUTH_TOKEN_ENUM.refresh:
            return envData.JWT_REFRESH_SECRET;
        case AUTH_TOKEN_ENUM.action:
            return envData.JWT_ACTION_SECRET;
    }
};

// jsonwebtoken expects seconds, env stores milliseconds
export const getLifetimeByTokenType = (tokenType: AuthTokens) => {
    switch (tokenType) {
        case AUTH_TOKEN_ENUM.access:
            return Math.floor(envData.JWT_ACCESS_LIFETIME / 1000);
        case AUTH_TOKEN_ENUM.refresh:
            return Math.floor(envData.JWT_REFRESH_LIFETIME / 1000);
        case AUTH_TOKEN_ENUM.action:
            return Math.floor(envData.JWT_ACTION_LIFETIME / 1000);
    }
};
