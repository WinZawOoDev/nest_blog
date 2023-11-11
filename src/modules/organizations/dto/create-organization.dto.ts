import { Length, Max, Min } from 'class-validator';

export class CreateOrganizationDto {
  @Length(10, 20)
  name: string;

  @Length(5, 50)
  service: string;

  @Length(2, 10)
  industry: string;

  @Min(2)
  @Max(50)
  size: number;
}
