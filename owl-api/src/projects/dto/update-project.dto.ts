import { IsOptional, IsString, IsUrl, MaxLength, IsArray, ArrayMinSize } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  projectTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  // hoursJustification is not user-editable

  @IsUrl()
  @IsOptional()
  playableUrl?: string;

  @IsUrl()
  @IsOptional()
  repoUrl?: string;

  @IsUrl()
  @IsOptional()
  screenshotUrl?: string;

  @IsString()
  @IsOptional()
  airtableRecId?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  nowHackatimeProjects?: string[];
}
