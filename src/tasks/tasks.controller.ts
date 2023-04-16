import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Res,
  } from '@nestjs/common';
  import { CreateTaskDTO } from './dto/create-task.dto';
  import { Task } from './schemas/task.model';
  import { TasksService } from './tasks.service';
  import { HttpCode } from '@nestjs/common';
  
  @Controller('tasks')
  export class TasksController {
    constructor(private readonly tasksService: TasksService) {}
  
    // Create a new task
    @Post()
    async create(@Body() createTaskDto: CreateTaskDTO): Promise<Task> {
      if (!createTaskDto.title) {
    throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
  }

    try {
      const task = await this.tasksService.create(createTaskDto);
      return task;
  }   catch (error) {
      // Handle error when status is not provided
      if (error.message.includes('status: Path `status` is required.')) {
        throw new HttpException('Status is required', HttpStatus.BAD_REQUEST);
      }

      // Handle other errors and re-throw them
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }


    }

  
    // Get a single task by ID
    @Get(':id')
    async getSingleTask(@Param('id') id: string, @Res() res: any) {
      const task = await this.tasksService.findOne(id);
      // If task not found, return 404 Not Found error
      if (!task) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Task not found',
        });
      }
      // Return the task object with 200 OK status
      return res.status(HttpStatus.OK).json({
        success: true,
        task: task
      });
    }

  // Delete a task by ID
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any): Promise<any> {
    const result = await this.tasksService.delete(id);
    // If task not found, return 404 Not Found error
    if (!result) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Task not found',
      });
    }
    // If task is deleted successfully, return success message with 200 OK status
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Task deleted successfully',
    });
  }

    
}
  