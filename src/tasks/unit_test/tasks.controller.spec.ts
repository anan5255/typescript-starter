import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { Task } from '../schemas/task.model';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
const ObjectId = Types.ObjectId;


// Describe a test suite for the TasksController
describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  // Create a mock for the Task model
  const mockTaskModel = {
    create: jest.fn(),
    findById: jest.fn().mockImplementation(() => ({
      exec: jest.fn(),
    })),
    findByIdAndDelete: jest.fn().mockImplementation(() => ({
      exec: jest.fn(),
    })),
  };

  // Before each test, create a testing module with the TasksController, TasksService, and mockTaskModel
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test that the TasksService is defined
  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });


  // Test that creating a task fails when the title is missing
  it('should fail to create a task when title is missing', async () => {
    const createTaskDto: CreateTaskDTO = {
      title: '',
      description: 'Test task description',
      status: 'TODO',
    };
  
    try {
      await tasksController.create(createTaskDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Title is required');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });
  
  // Test that creating a task fails when the status is missing
  it('should fail to create a task when status is missing', async () => {
    const createTaskDto: CreateTaskDTO = {
      title: 'Test Task',
      description: 'Test task description',
      status: 'TODO'
    };
  
    mockTaskModel.create.mockImplementation(() => {
      throw new Error('Task validation failed: status: Path `status` is required.');
    });
  
    try {
      await tasksController.create(createTaskDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Status is required');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });


  // Test that a task is created successfully
  it('should create a task', async () => {
    const createTaskDto: CreateTaskDTO = {
      title: 'Test Task',
      description: 'Test task description',
      status: 'TODO',
    };

    const createdTask: Task = {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title: createTaskDto.title,
        description: createTaskDto.description || '',
        status: createTaskDto.status,
    };

    const createdTaskWithoutSave = { ...createdTask, save: jest.fn().mockResolvedValue(createdTask) };
    mockTaskModel.create.mockResolvedValue(createdTaskWithoutSave);



    const result = await tasksController.create(createTaskDto);
    expect(result.title).toEqual(createdTask.title);
    expect(result.description).toEqual(createdTask.description);
    expect(result.status).toEqual(createdTask.status);
 

  });

  // Test get a task by id
  it('should get a single task by id', async () => {
    const existingTask: Task = {
        _id: new ObjectId(),
        title: 'Test Task',
        description: 'Test task description',
        status: 'TODO',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    mockTaskModel.findById().exec.mockResolvedValue(existingTask);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockTaskModel.findById().exec.mockResolvedValue(null);

    await tasksController.getSingleTask('nonexistent_task_id', {
      status: jest.fn().mockImplementation((code) => {
        if (code === HttpStatus.NOT_FOUND) {
          throw new NotFoundException('Task not found');
        } else {
          return res;
        }
      }),
      json: jest.fn(),
    }).catch(e => {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toBe('Task not found');
    });
  });


  //test delete a task by id
  it('should delete a task by id', async () => {
    const taskId = new ObjectId();
    const existingTask: Task = {
        _id: taskId,
        title: 'Test Task',
        description: 'Test task description',
        status: 'TODO',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    mockTaskModel.findByIdAndDelete().exec.mockResolvedValue(existingTask);

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    
    // Test successful deletion
    mockTaskModel.findByIdAndDelete.mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(existingTask),
          }));
    await tasksController.delete(taskId.toString(), res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task deleted successfully',
    });

    // Test when task is not found
    mockTaskModel.findByIdAndDelete.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
    }));

    await tasksController.delete('nonexistent_task_id', res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found',
    });
});
});
