export class CreatePropertyDto {
    readonly name: string;
    readonly category: string;
    readonly description: string;
    readonly purchaseDate: Date;
    readonly warranty: number;
    readonly purchaseCost: number;
    readonly status: string;
    readonly attachments: object[];
    readonly authorId: any;
}
