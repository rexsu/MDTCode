import { IsString, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
  // --- 患者基本信息 (必填) ---
  @IsString()
  patientName: string;

  @IsString()
  patientGender: string; // "男" | "女"

  @IsInt()
  patientAge: number;

  @IsString()
  chiefComplaint: string; // 主诉

  // --- 排班信息 ---
  @IsDateString()
  scheduledTime: string; // ISO 8601 格式时间字符串

  // --- 会诊前文书 (PreDoc) ---
  @IsString()
  presentIllness: string; // 现病史

  @IsString()
  treatmentPlan: string;  // 目前治疗方案 (PRD要求必填，存入 extraInfo 或独立字段，此处暂存 extraInfo)

  @IsString()
  goal: string;           // 会诊目的 (PRD要求必填)

  // --- 选填字段 (将被打包进 extraInfo) ---
  @IsOptional()
  @IsString()
  pastHistory?: string;   // 既往史

  @IsOptional()
  @IsString()
  familyHistory?: string; // 家族史

  @IsOptional()
  @IsString()
  personalHistory?: string; // 个人史
}
