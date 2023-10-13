import { BaseModel } from ".";

export interface App extends BaseModel {
    chain_id: any;
    name: string;
    intro: string;
    app_id: string;
    app_secret?: string;
    chain_type: number;
}

export interface Main2TestUrl {
    main: string;
    test: string;
}

export interface Core2eSpaceUrl {
    cspace: Main2TestUrl;
    espace: Main2TestUrl;
}

export interface AppWeb3ServiceMeta {
    name: string;
    api_key: string;
    rpc_urls: Core2eSpaceUrl,
    scan_urls: Core2eSpaceUrl,
}