export interface AdAccount {
    id: string;
    name: string;
    account_id: string;
    account_status: number;
    balance: string;
    business: {
        id: string;
        name: string;
    }
    currency: string;
    timezone_name: string;
}