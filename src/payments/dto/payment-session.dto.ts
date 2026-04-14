import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class PaymentSessionDto {

    @IsString()
    currency!: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => PaymentSessionItemDto)
    items!: PaymentSessionItemDto[];
}

export class PaymentSessionItemDto {

    @IsString()
    name!: string;

    @IsNumber()
    @IsPositive()
    price!: number;

    @IsNumber()
    @IsPositive()
    quantity!: number;

}