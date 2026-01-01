import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class TasksService {
    private prisma;
    private eventsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(createTaskDto: CreateTaskDto, userId?: string): Promise<{
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        scheduledTime: Date;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        experts: ({
            expert: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                role: string;
                username: string;
                password: string;
                realName: string;
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
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        scheduledTime: Date;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        preDoc: {
            presentIllness: string;
            pastHistory: string | null;
            familyHistory: string | null;
            id: string;
            taskId: string;
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
                    role: string;
                    username: string;
                    password: string;
                    realName: string;
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
            audioUrl: string | null;
            asrText: string | null;
            aiStructured: string | null;
            isAiAdopted: boolean;
            finalText: string | null;
            expertProfileId: string;
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
                role: string;
                username: string;
                password: string;
                realName: string;
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
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        scheduledTime: Date;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: string, userId?: string): Promise<{
        patientName: string;
        patientGender: string;
        patientAge: number;
        chiefComplaint: string;
        scheduledTime: Date;
        id: string;
        status: string;
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
                role: string;
                username: string;
                password: string;
                realName: string;
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
        audioUrl: string | null;
        asrText: string | null;
        aiStructured: string | null;
        isAiAdopted: boolean;
        finalText: string | null;
        expertProfileId: string;
    }>;
    toggleOpinionAdoption(id: string, isAiAdopted: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        isSubmitted: boolean;
        audioUrl: string | null;
        asrText: string | null;
        aiStructured: string | null;
        isAiAdopted: boolean;
        finalText: string | null;
        expertProfileId: string;
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
