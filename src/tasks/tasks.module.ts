import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  // Declare the TasksController as a controller for this module
  controllers: [TasksController],
  // Declare the TasksService as a provider for this module
  providers: [TasksService],
})
export class TasksModule {}
