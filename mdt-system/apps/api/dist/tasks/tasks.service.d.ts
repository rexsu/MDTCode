import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class TasksService {
    private prisma;
    private eventsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(createTaskDto: CreateTaskDto, userId?: string): Promise<{
        id: string;
        status: string;
        scheduledTime: Date;
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        experts: ({
            expert: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                password: string;
                realName: string;
                role: string;
            };
        } & {
            id: string;
            status: string;
            taskId: string;
            expertId: string;
            isCore: boolean;
            invitedAt: Date;
            respondedAt: Date | null;
        })[];
    } & {
        id: string;
        status: string;
        scheduledTime: Date;
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        preDoc: {
            id: string;
            taskId: string;
            presentIllness: string;
            pastHistory: string | null;
            familyHistory: string | null;
            extraInfo: string | null;
        };
        dialogs: {
            id: string;
            createdAt: Date;
            taskId: string;
            role: string;
            content: string;
            original: string | null;
            startTime: number | null;
        }[];
        postDoc: {
            id: string;
            updatedAt: Date;
            taskId: string;
            aiContent: string | null;
            finalContent: string | null;
            isSubmitted: boolean;
            version: number;
        };
        opinions: ({
            expert: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    username: string;
                    password: string;
                    realName: string;
                    role: string;
                };
            } & {
                id: string;
                userId: string;
                department: string;
                titles: string;
                signatureUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            isSubmitted: boolean;
            expertProfileId: string;
            audioUrl: string | null;
            asrText: string | null;
            aiStructured: string | null;
            isAiAdopted: boolean;
            finalText: string | null;
        })[];
        report: {
            id: string;
            taskId: string;
            aiSummary: string | null;
            finalSummary: string;
            aiEducation: string | null;
            finalEducation: string;
            pdfUrl: string | null;
            isSigned: boolean;
            completedAt: Date;
        };
        experts: ({
            expert: {
                expertProfile: {
                    id: string;
                    userId: string;
                    department: string;
                    titles: string;
                    signatureUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                password: string;
                realName: string;
                role: string;
            };
        } & {
            id: string;
            status: string;
            taskId: string;
            expertId: string;
            isCore: boolean;
            invitedAt: Date;
            respondedAt: Date | null;
        })[];
        logs: {
            id: string;
            createdAt: Date;
            taskId: string;
            operatorId: string | null;
            action: string;
            details: string | null;
        }[];
    } & {
        id: string;
        status: string;
        scheduledTime: Date;
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: string, userId?: string): Promise<{
        id: string;
        status: string;
        scheduledTime: Date;
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDialog(taskId: string, content: string, role: string, startTime: number): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        role: string;
        content: string;
        original: string | null;
        startTime: number | null;
    }>;
    generatePostDoc(taskId: string): Promise<{
        id: string;
        updatedAt: Date;
        taskId: string;
        aiContent: string | null;
        finalContent: string | null;
        isSubmitted: boolean;
        version: number;
    }>;
    updatePostDoc(taskId: string, content: string, isSubmitted: boolean): Promise<{
        id: string;
        updatedAt: Date;
        taskId: string;
        aiContent: string | null;
        finalContent: string | null;
        isSubmitted: boolean;
        version: number;
    }>;
    createOpinion(taskId: string, expertProfileId: string, content: string, isAudio: boolean): Promise<{
        expert: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                password: string;
                realName: string;
                role: string;
            };
        } & {
            id: string;
            userId: string;
            department: string;
            titles: string;
            signatureUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        isSubmitted: boolean;
        expertProfileId: string;
        audioUrl: string | null;
        asrText: string | null;
        aiStructured: string | null;
        isAiAdopted: boolean;
        finalText: string | null;
    }>;
    toggleOpinionAdoption(id: string, isAiAdopted: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        isSubmitted: boolean;
        expertProfileId: string;
        audioUrl: string | null;
        asrText: string | null;
        aiStructured: string | null;
        isAiAdopted: boolean;
        finalText: string | null;
    }>;
    createReport(taskId: string): Promise<{
        id: string;
        taskId: string;
        aiSummary: string | null;
        finalSummary: string;
        aiEducation: string | null;
        finalEducation: string;
        pdfUrl: string | null;
        isSigned: boolean;
        completedAt: Date;
    }>;
}
