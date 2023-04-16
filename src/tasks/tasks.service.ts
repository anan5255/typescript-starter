import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task, TaskDocument } from './schemas/task.model';

@Injectable()
export class TasksService {
  static delete: any;
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}
  
  // Create a new task with the given data and return it
  async create(createTaskDto: CreateTaskDTO): Promise<Task> {
    const updatedCreate = {
      ...createTaskDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const createdTask = await this.taskModel.create(updatedCreate);
    return createdTask.save();
  }

  // Find a task by ID and return it
  async findOne(id: string): Promise<Task> {
    return this.taskModel.findById(id).exec();
  }

  // Delete a task by ID and return it, or return null if it does not exist
  async delete(id: string): Promise<Task | null> {
    const deletedTask = await this.taskModel.findByIdAndDelete(id).exec();
    return deletedTask || null;
  }

  // Delete all tasks in the collection(for unit test)
  async deleteAll(): Promise<void> {
    await this.taskModel.deleteMany({}).exec();
  }

}
