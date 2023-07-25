interface CaproverApps {
    appName: string;
    volumes: {
        volumeName: string;
    }[];
}
export declare class CapRover {
    private url;
    private tokenPromise;
    constructor(url: string, password: string);
    private login;
    getTokenOrError(): Promise<string>;
    createApp(appName: string): Promise<void>;
    deployApp(appName: string, imageTag: string, imageName?: string): Promise<void>;
    getApp(appName: string): Promise<CaproverApps | null>;
    getList(): Promise<{
        appDefinitions: CaproverApps[];
    }>;
    deleteApp(appName: string): Promise<void>;
}
export {};
