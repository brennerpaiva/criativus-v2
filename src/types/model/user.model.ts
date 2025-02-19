import { AdAccount } from "./ad-account.model";

export interface userModel {
    name: string;
    access_token: string;
    adAccounts: AdAccount[];
}