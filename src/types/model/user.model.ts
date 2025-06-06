
export interface userModel {
    id: number;
    name: string;
    email: string;
    password: string;
    access_token: string;
    accessTokenFb: string;
    facebookId: string;
    onboardingCompleted: boolean;
    onboardingCompletedAt: Date;
}