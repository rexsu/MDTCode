import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    // TODO: 获取当前登录用户 ID (AuthGuard)
    const userId = undefined; 
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const userId = undefined; // TODO: Auth
    return this.tasksService.updateStatus(id, status, userId);
  }

  @Post(':id/dialogs')
  createDialog(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('role') role: string,
    @Body('startTime') startTime: number
  ) {
    return this.tasksService.createDialog(id, content, role, startTime);
  }

  @Post(':id/post-doc/generate')
  generatePostDoc(@Param('id') id: string) {
    return this.tasksService.generatePostDoc(id);
  }

  @Patch(':id/post-doc')
  updatePostDoc(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('isSubmitted') isSubmitted: boolean
  ) {
    return this.tasksService.updatePostDoc(id, content, isSubmitted);
  }

  @Post(':id/opinions')
  createOpinion(
    @Param('id') id: string,
    @Body('expertProfileId') expertProfileId: string,
    @Body('content') content: string,
    @Body('isAudio') isAudio: boolean
  ) {
    // 临时 Mock：因为现在还没有真实的 expertProfile，我们先随便找一个或创建一个
    // 实际项目中应从 CurrentUser 获取
    return this.tasksService.createOpinion(id, expertProfileId, content, isAudio);
  }

  @Patch('opinions/:id/adopt')
  toggleOpinionAdoption(
    @Param('id') id: string,
    @Body('isAdopted') isAdopted: boolean
  ) {
    return this.tasksService.toggleOpinionAdoption(id, isAdopted);
  }

  @Post(':id/report')
  createReport(@Param('id') id: string) {
    return this.tasksService.createReport(id);
  }
}





