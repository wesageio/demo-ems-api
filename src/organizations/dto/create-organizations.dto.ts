export class CreateOrganizationDto {
    readonly name: string;
    readonly telephone: string;
    readonly email: string;
    readonly location: string;
    readonly website: string;
    readonly workers: number;
    readonly authorId: any;
}
