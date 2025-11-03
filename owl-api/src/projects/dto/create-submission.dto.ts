import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubmissionDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
