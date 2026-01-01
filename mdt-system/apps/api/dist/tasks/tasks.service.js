"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let TasksService = TasksService_1 = class TasksService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.logger = new common_1.Logger(TasksService_1.name);
    }
    async create(createTaskDto, userId) {
        const { patientName, patientGender, patientAge, chiefComplaint, scheduledTime, presentIllness, pastHistory, familyHistory, treatmentPlan, goal, personalHistory, } = createTaskDto;
        const extraInfo = JSON.stringify({
            treatmentPlan,
            goal,
            personalHistory,
        });
        try {
            const result = await this.prisma.$transaction(async (tx) => {
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
                await tx.preConsultationDoc.create({
                    data: {
                        taskId: task.id,
                        presentIllness,
                        pastHistory,
                        familyHistory,
                        extraInfo,
                    },
                });
                await tx.taskLog.create({
                    data: {
                        taskId: task.id,
                        operatorId: userId || null,
                        action: 'TASK_CREATED',
                        details: JSON.stringify({ patientName }),
                    },
                });
                return task;
            });
            this.logger.log(`Task created successfully: ${result.id}`);
            return result;
        }
        catch (error) {
            const err = error;
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
    async findOne(id) {
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
    async updateStatus(id, status, userId) {
        return this.prisma.$transaction(async (tx) => {
            const task = await tx.consultationTask.update({
                where: { id },
                data: { status },
            });
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
    async createDialog(taskId, content, role, startTime) {
        const cleanContent = content.trim();
        const finalRole = role || (cleanContent.includes('医生') ? 'DOCTOR' : 'PATIENT');
        const dialog = await this.prisma.consultationDialog.create({
            data: {
                taskId,
                role: finalRole,
                content: cleanContent,
                original: content,
                startTime,
            },
        });
        this.eventsGateway.broadcastToRoom(taskId, 'DIALOG_CREATED', dialog);
        return dialog;
    }
    async generatePostDoc(taskId) {
        const dialogs = await this.prisma.consultationDialog.findMany({
            where: { taskId },
            orderBy: { startTime: 'asc' }
        });
        const summary = dialogs.map(d => `${d.role === 'DOCTOR' ? '医生' : '患者'}: ${d.content}`).join('\n');
        const mockAiContent = `【AI自动生成会诊记录】\n\n一、病史摘要\n${summary.substring(0, 100)}...\n\n二、诊疗意见\n建议完善血常规检查，继续当前药物治疗，观察两周。\n\n(以上内容由 AI 根据 ${dialogs.length} 条对话生成)`;
        const doc = await this.prisma.postConsultationDoc.upsert({
            where: { taskId },
            create: {
                taskId,
                aiContent: mockAiContent,
                finalContent: mockAiContent,
                version: 1,
            },
            update: {
                aiContent: mockAiContent,
                finalContent: mockAiContent,
                version: { increment: 1 }
            }
        });
        return doc;
    }
    async updatePostDoc(taskId, content, isSubmitted) {
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
    async createOpinion(taskId, expertProfileId, content, isAudio) {
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
        const aiStructured = isAudio
            ? `【AI结构化意见】\n核心观点：${content.substring(0, 20)}...\n建议方案：建议进一步心理干预。`
            : null;
        const opinion = await this.prisma.expertOpinion.create({
            data: {
                taskId,
                expertProfileId: targetProfileId,
                asrText: isAudio ? content : null,
                finalText: isAudio ? aiStructured : content,
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
    async toggleOpinionAdoption(id, isAiAdopted) {
        const opinion = await this.prisma.expertOpinion.update({
            where: { id },
            data: { isAiAdopted },
        });
        this.eventsGateway.broadcastToRoom(opinion.taskId, 'OPINION_UPDATED', opinion);
        return opinion;
    }
    async createReport(taskId) {
        const postDoc = await this.prisma.postConsultationDoc.findUnique({ where: { taskId } });
        const adoptedOpinions = await this.prisma.expertOpinion.findMany({
            where: { taskId, isAiAdopted: true },
            include: { expert: { include: { user: true } } }
        });
        let summary = postDoc?.finalContent || "（暂无会诊文书）";
        if (adoptedOpinions.length > 0) {
            summary += "\n\n【专家联合会诊意见】\n";
            adoptedOpinions.forEach((op, index) => {
                const content = op.aiStructured || op.finalText;
                summary += `${index + 1}. ${op.expert.user.realName} (${op.expert.department}):\n${content}\n`;
            });
        }
        const report = await this.prisma.consultationReport.upsert({
            where: { taskId },
            create: {
                taskId,
                finalSummary: summary,
                finalEducation: "1. 请遵医嘱按时服药。\n2. 建议两周后复诊。\n3. 保持良好的作息规律，避免过度劳累。",
                isSigned: false,
            },
            update: {
                finalSummary: summary,
            }
        });
        this.eventsGateway.broadcastToRoom(taskId, 'REPORT_UPDATED', report);
        return report;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], TasksService);
//# sourceMappingURL=tasks.service.js.map