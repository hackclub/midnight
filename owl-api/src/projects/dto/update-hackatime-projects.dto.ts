import { IsArray, IsString, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class UpdateHackatimeProjectsDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  projectNames: string[];
}
