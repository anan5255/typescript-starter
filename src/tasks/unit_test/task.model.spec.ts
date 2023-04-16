import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskSchema } from '../schemas/task.model';

// Describe a test suite for the Task Model
describe('Task Model', () => {
  let taskModel;
 // Before each test, create a testing module with the Task model and its schema
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Task.name),
          useValue: TaskSchema,
        },
      ],
    }).compile();
    // Get the Task model from the module
    taskModel = moduleRef.get<TaskDocument>(getModelToken(Task.name));
  });


  

  // Test that the required properties are defined in a new Task instance
  it('should have the required properties', () => {
    const task = new Task();
    task.title = 'Test task';
    task.status = 'TODO';

    expect(task.title).toBeDefined();
    expect(task.description).toBeUndefined();
    expect(task.status).toBeDefined();
    expect(task.createdAt).toBeUndefined();
    expect(task.updatedAt).toBeUndefined();
  });


  // Test that the optional properties can be set in a new Task instance
  it('should have optional properties', () => {
    const task = new Task();
    task.title = 'Test task';
    task.status = 'TODO';
    task.description = 'A description for the test task';
    task.createdAt = new Date();
    task.updatedAt = new Date();

    expect(task.description).toBeDefined();
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  });
});
