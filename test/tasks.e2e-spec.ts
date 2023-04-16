import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TasksModule } from './../src/tasks/tasks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './../src/tasks/schemas/task.model';

describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TasksModule,
        MongooseModule.forRoot('mongodb://localhost/nest-tasks', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });


  // create task without title, without status, 
  it('/tasks (POST) should not create a task without a title', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ status: 'TODO' })
      .expect(400);
  });


  // create task without status
  it('/tasks (POST) should not create a task without a status', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task' })
      .expect(400);
  });
  

  // test createdAt, updateAt
  it('/tasks (POST) should have createdAt and updatedAt fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(201);
  
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });
  
  //test create a task
  it('/tasks (POST) should create a task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(201);

    expect(response.body.title).toEqual('Test Task');
    expect(response.body.status).toEqual('TODO');
  });


  // get not found
  it('/tasks/:id (GET) should return 404 for a non-existent task', async () => {
    const nonExistentTaskId = '6148c2d5b106e384eaf0a461';
    await request(app.getHttpServer())
      .get(`/tasks/${nonExistentTaskId}`)
      .expect(404);
  });
  

  //test get by id
  it('/tasks/:id (GET) should get a task by id', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' });

    const taskId = createResponse.body._id;
    const getResponse = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200);

    expect(getResponse.body.task._id).toEqual(taskId);
    expect(getResponse.body.task.title).toEqual('Test Task');
    expect(getResponse.body.task.status).toEqual('TODO');
  });

    // delete same id twice 
    it('/tasks/:id (DELETE) should return 404 when trying to delete the same task twice', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Test Task', status: 'TODO' });
    
      const taskId = createResponse.body._id;
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(200);
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(404);
    });
    


  // test delete by id
  it('/tasks/:id (DELETE) should delete a task by id', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' });

    const taskId = createResponse.body._id;
    await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(200);
    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
  });
});
