import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async create(createTaskDto: CreateTaskDto, userId?: string) {
    const {
      patientName,
      patientGender,
      patientAge,
      chiefComplaint,
      scheduledTime,
      presentIllness,
      pastHistory,
      familyHistory,
      treatmentPlan,
      goal,
      personalHistory,
    } = createTaskDto;

    // 组装额外信息 JSON
    const extraInfo = JSON.stringify({
      treatmentPlan,
      goal,
      personalHistory,
      // 其他未来扩展字段
    });

    try {
      // 使用事务确保数据一致性
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. 创建核心任务记录
        const task = await tx.consultationTask.create({
          data: {
            status: 'PENDING',
            scheduledTime: new Date(scheduledTime),
            patientName,
            patientGender,
            patientAge,
            chiefComplaint,
          },
        });

        // 2. 创建会诊前文书 (PreDoc)
        await tx.preConsultationDoc.create({
          data: {
            taskId: task.id,
            presentIllness,
            pastHistory,
            familyHistory,
            extraInfo,
          },
        });

        // 3. 记录操作日志 (Audit Log)
        await tx.taskLog.create({
          data: {
            taskId: task.id,
            operatorId: userId || null, // 如果有登录用户
            action: 'TASK_CREATED',
            details: JSON.stringify({ patientName }),
          },
        });

        return task;
      });

      this.logger.log(`Task created successfully: ${result.id}`);
      return result;

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create task: ${err.message}`, err.stack);
      throw error;
    }

  }

  async findAll() {
    return this.prisma.consultationTask.findMany({
      orderBy: { scheduledTime: 'asc' },
      include: {
        experts: {
          include: {
            expert: true,
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.consultationTask.findUnique({
      where: { id },
      include: {
        preDoc: true,
        postDoc: true,
        dialogs: true,
        report: true,
        logs: {
          orderBy: { createdAt: 'desc' }
        },
        opinions: {
          include: {
            expert: {
              include: {
                user: true
              }
            }
          }
        },
        experts: {
          include: {
            expert: {
              include: {
                expertProfile: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 更新状态
      const task = await tx.consultationTask.update({
        where: { id },
        data: { status },
      });

      // 2. 记录日志
      await tx.taskLog.create({
        data: {
          taskId: id,
          operatorId: userId || null,
          action: 'STATUS_CHANGE',
          details: JSON.stringify({ to: status }),
        },
      });

      return task;
    });
  }

  async createDialog(taskId: string, content: string, role: string, startTime: number) {
    // 模拟 AI 清洗过程：
    // 实际项目中，这里会调用 LLM API 将 ASR 文本转换为规范对话
    // 这里我们简单去除首尾空格，并假设如果内容包含"医生"则归为医生，否则为患者(仅作演示)
    
    const cleanContent = content.trim();
    // 简单的模拟逻辑：如果未指定角色，则随机分配或基于关键词
    const finalRole = role || (cleanContent.includes('医生') ? 'DOCTOR' : 'PATIENT');

    const dialog = await this.prisma.consultationDialog.create({
      data: {
        taskId,
        role: finalRole,
        content: cleanContent,
        original: content, // 保留原始 ASR 文本
        startTime,
      },
    });

    // 广播新对话
    this.eventsGateway.broadcastToRoom(taskId, 'DIALOG_CREATED', dialog);
    
    return dialog;
  }

  async generatePostDoc(taskId: string) {
    // 1. 获取当前对话记录
    const dialogs = await this.prisma.consultationDialog.findMany({
      where: { taskId },
      orderBy: { startTime: 'asc' }
    });

    // 2. 模拟 AI 生成逻辑 (简单拼接)
    const summary = dialogs.map(d => `${d.role === 'DOCTOR' ? '医生' : '患者'}: ${d.content}`).join('\n');
    const mockAiContent = `【AI自动生成会诊记录】\n\n一、病史摘要\n${summary.substring(0, 100)}...\n\n二、诊疗意见\n建议完善血常规检查，继续当前药物治疗，观察两周。\n\n(以上内容由 AI 根据 ${dialogs.length} 条对话生成)`;

    // 3. 创建 or 更新 PostDoc
    const doc = await this.prisma.postConsultationDoc.upsert({
      where: { taskId },
      create: {
        taskId,
        aiContent: mockAiContent,
        finalContent: mockAiContent, // 初始时，最终内容 = AI内容
        version: 1,
      },
      update: {
        aiContent: mockAiContent,
        // 如果未提交，覆盖 finalContent；如果已提交，可能需要新版本逻辑（此处简化为覆盖）
        finalContent: mockAiContent,
        version: { increment: 1 }
      }
    });

    return doc;
  }

  async updatePostDoc(taskId: string, content: string, isSubmitted: boolean) {
    const doc = await this.prisma.postConsultationDoc.update({
      where: { taskId },
      data: {
        finalContent: content,
        isSubmitted,
      }
    });

    if (isSubmitted) {
      this.eventsGateway.broadcastToRoom(taskId, 'POST_DOC_SUBMITTED', { isSubmitted: true });
    }

    return doc;
  }

  async createOpinion(taskId: string, expertProfileId: string, content: string, isAudio: boolean) {
    // DEV MODE: 如果没有 expertProfileId，自动创建一个默认专家
    let targetProfileId = expertProfileId;
    if (!targetProfileId || targetProfileId === 'mock-expert-id') {
      const user = await this.prisma.user.upsert({
        where: { username: 'expert_demo' },
        create: {
          username: 'expert_demo',
          password: 'password',
          realName: '李主任',
          role: 'EXPERT',
        },
        update: {},
      });
      
      const profile = await this.prisma.expertProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          department: '精神科',
          titles: JSON.stringify(['主任医师']),
        },
        update: {},
      });
      targetProfileId = profile.id;
    }

    // 模拟 AI 结构化过程
    const aiStructured = isAudio 
      ? `【AI结构化意见】\n核心观点：${content.substring(0, 20)}...\n建议方案：建议进一步心理干预。` 
      : null;

    const opinion = await this.prisma.expertOpinion.create({
      data: {
        taskId,
        expertProfileId: targetProfileId,
        asrText: isAudio ? content : null,
        finalText: isAudio ? aiStructured : content, // 如果是录音，默认最终文本为AI结构化结果；如果是文字，直接存
        aiStructured,
        isSubmitted: true,
      },
      include: {
        expert: {
          include: { user: true }
        }
      }
    });

    this.eventsGateway.broadcastToRoom(taskId, 'OPINION_CREATED', opinion);
    return opinion;
  }

  async toggleOpinionAdoption(id: string, isAiAdopted: boolean) {
    const opinion = await this.prisma.expertOpinion.update({
      where: { id },
      data: { isAiAdopted },
    });
    
    // 广播事件
    this.eventsGateway.broadcastToRoom(opinion.taskId, 'OPINION_UPDATED', opinion);
    return opinion;
  }

  async createReport(taskId: string) {
    // 1. 获取会诊文书
    const postDoc = await this.prisma.postConsultationDoc.findUnique({ where: { taskId } });
    
    // 2. 获取被采纳的专家意见
    const adoptedOpinions = await this.prisma.expertOpinion.findMany({
      where: { taskId, isAiAdopted: true },
      include: { expert: { include: { user: true } } }
    });

    // 3. 组装报告内容
    let summary = postDoc?.finalContent || "（暂无会诊文书）";
    
    if (adoptedOpinions.length > 0) {
      summary += "\n\n【专家联合会诊意见】\n";
      adoptedOpinions.forEach((op, index) => {
        // 优先使用结构化文本，其次使用最终文本
        const content = op.aiStructured || op.finalText;
        summary += `${index + 1}. ${op.expert.user.realName} (${op.expert.department}):\n${content}\n`;
      });
    }

    // 4. 保存报告
    const report = await this.prisma.consultationReport.upsert({
      where: { taskId },
      create: {
        taskId,
        finalSummary: summary,
        finalEducation: "1. 请遵医嘱按时服药。\n2. 建议两周后复诊。\n3. 保持良好的作息规律，避免过度劳累。", // 默认健康宣教模板
        isSigned: false,
      },
      update: {
        finalSummary: summary,
        // finalEducation 保持不变，允许医生手动修改后不被覆盖
      }
    });

    this.eventsGateway.broadcastToRoom(taskId, 'REPORT_UPDATED', report);
    return report;
  }
}





