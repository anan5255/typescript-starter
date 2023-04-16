import { Test } from '@nestjs/testing';
import { TasksModule } from '../tasks.module';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task } from '../schemas/task.model';

describe('TasksModule', () => {
  let tasksModule: TasksModule;

  beforeEach(async () => {
    // Create a new module for each test
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    })
      .overrideProvider(getModelToken(Task.name))
      .useValue({})
      .compile();

    // Get the TasksModule instance
    tasksModule = moduleRef.get<TasksModule>(TasksModule);
  });

  // Test if the TasksModule is defined
  it('should be defined', () => {
    expect(tasksModule).toBeDefined();
  });

  // Test if the TasksController is defined
  it('should have a TasksController', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    })
      .overrideProvider(getModelToken(Task.name))
      .useValue({})
      .compile();

    const tasksController = moduleRef.get<TasksController>(TasksController);
    expect(tasksController).toBeDefined();
  });

  // Test if the TasksService is defined
  it('should have a TasksService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    })
      .overrideProvider(getModelToken(Task.name))
      .useValue({})
      .compile();

    const tasksService = moduleRef.get<TasksService>(TasksService);
    expect(tasksService).toBeDefined();
  });
});
