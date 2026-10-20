export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly success: boolean;
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string,
        isOperational = true
    ) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.isOperational = isOperational;

        if ('captureStackTrace' in Error) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}