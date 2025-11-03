import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class UpdateHackatimeProjectsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  projectNames: string[];
}
