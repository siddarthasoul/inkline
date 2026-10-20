
import type { Response } from "express";

export class ApiResponse<T> {
    public readonly success = true;

    constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly data: T
    ) { }

    static success<T>(
        res: Response,
        data: T,
        message = "Success"
    ): Response {
        return res.status(200).json(
            new ApiResponse<T>(
                200,
                message,
                data
            )
        );
    }

    static created<T>(
        res: Response,
        data: T,
        message = "Created"
    ): Response {
        return res.status(201).json(
            new ApiResponse<T>(
                201,
                message,
                data
            )
        );
    }

    static noContent(
        res: Response
    ): Response {
        return res.status(204).send();
    }
}
