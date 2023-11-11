import { Length } from 'class-validator';

export class CreatePostDto {
  @Length(5, 50)
  title: string;

  @Length(200, 2000)
  body: string;
}
