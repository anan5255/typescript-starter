import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../schemas/task.model';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('TasksService', () => {
  let tasksService: TasksService;
  let mongoServer: MongoMemoryServer;

  // Start the MongoDB memory server before all tests
  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
  });

  // Stop the MongoDB memory server after all tests
  afterAll(async () => {
    await mongoServer.stop();
  });

  // Create a new module and get the TasksService instance before each test
  beforeEach(async () => {
    const uri = mongoServer.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
      ],
      providers: [TasksService],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  // Delete all tasks after each test
  afterEach(async () => {
    await tasksService.deleteAll();
  });

  // Test the create method of TasksService
  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDTO = { title: 'Test Task', status: 'TODO' };
      const result = await tasksService.create(createTaskDto);

      expect(result._id).toBeDefined();
      expect(result.title).toEqual(createTaskDto.title);
      expect(result.status).toEqual(createTaskDto.status);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  // Test the findOne method of TasksService
  describe('findOne', () => {
    it('should find a task by id', async () => {
      const createTaskDto: CreateTaskDTO = {
        title: 'Sample Task',
        status: 'TODO',
      };

      const createdTask = await tasksService.create(createTaskDto);

      const result = await tasksService.findOne(createdTask._id.toString());
      expect(result.title).toEqual(createdTask.title);
      expect(result.status).toEqual(createdTask.status);
      expect(result.createdAt).toEqual(createdTask.createdAt);
      expect(result.updatedAt).toEqual(createdTask.updatedAt);
    });
  });

  // Test the delete method of TasksService
  describe('delete', () => {
    it('should delete a task by id', async () => {
      const createTaskDto: CreateTaskDTO = {
        title: 'Sample Task',
        status: 'TODO',
      };

      const createdTask = await tasksService.create(createTaskDto);

      const deletedTask = await tasksService.delete(createdTask._id.toString());

      expect(deletedTask.title).toEqual(createdTask.title);
      expect(deletedTask.status).toEqual(createdTask.status);
      expect(deletedTask.createdAt).toEqual(createdTask.createdAt);
      expect(deletedTask.updatedAt).toEqual(createdTask.updatedAt);


      const nonExistentTask = await tasksService.findOne(createdTask._id.toString());
      expect(nonExistentTask).toBeNull();
    });
  });
});