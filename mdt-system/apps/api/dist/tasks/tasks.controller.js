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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    create(createTaskDto) {
        const userId = undefined;
        return this.tasksService.create(createTaskDto, userId);
    }
    findAll() {
        return this.tasksService.findAll();
    }
    findOne(id) {
        return this.tasksService.findOne(id);
    }
    updateStatus(id, status) {
        const userId = undefined;
        return this.tasksService.updateStatus(id, status, userId);
    }
    createDialog(id, content, role, startTime) {
        return this.tasksService.createDialog(id, content, role, startTime);
    }
    generatePostDoc(id) {
        return this.tasksService.generatePostDoc(id);
    }
    updatePostDoc(id, content, isSubmitted) {
        return this.tasksService.updatePostDoc(id, content, isSubmitted);
    }
    createOpinion(id, expertProfileId, content, isAudio) {
        return this.tasksService.createOpinion(id, expertProfileId, content, isAudio);
    }
    toggleOpinionAdoption(id, isAdopted) {
        return this.tasksService.toggleOpinionAdoption(id, isAdopted);
    }
    createReport(id) {
        return this.tasksService.createReport(id);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/dialogs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Body)('role')),
    __param(3, (0, common_1.Body)('startTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createDialog", null);
__decorate([
    (0, common_1.Post)(':id/post-doc/generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "generatePostDoc", null);
__decorate([
    (0, common_1.Patch)(':id/post-doc'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Body)('isSubmitted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updatePostDoc", null);
__decorate([
    (0, common_1.Post)(':id/opinions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('expertProfileId')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Body)('isAudio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createOpinion", null);
__decorate([
    (0, common_1.Patch)('opinions/:id/adopt'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isAdopted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "toggleOpinionAdoption", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createReport", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map