import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';
import {Task, Tag} from '../entity';

const initialTags: Omit<Tag, 'id'>[] = [
  {
    label: 'Family',
  },
  {
    label: 'Health',
  },
  {
    label: 'Home',
  },
  {
    label: 'Shopping',
  },
];

export class InitializeDatabase1582287513601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'text',
            isGenerated: true,
            isPrimary: true,
            isNullable: false,
            generationStrategy: 'uuid',
          },

          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'id',
            type: 'text',
            isGenerated: true,
            isPrimary: true,
            isNullable: false,
            generationStrategy: 'uuid',
          },
          {
            name: 'label',
            type: 'text',
            isNullable: false,
            isUnique: true,
          },
        ],
      }),
    );

    const TasksTagsTable = new Table({
      name: 'tasks_tags_tags',
      columns: [
        {
          name: 'tasksId',
          type: 'text',
          isNullable: false,
        },
        {
          name: 'tagsId',
          type: 'text',
          isNullable: false,
        },
      ],
    });
    await queryRunner.createTable(TasksTagsTable);
    await queryRunner.createPrimaryKey(TasksTagsTable, ['tasksId', 'tagsId']);
    await queryRunner.createForeignKeys(TasksTagsTable, [
      new TableForeignKey({
        name: 'FK_TASK_ID',
        columnNames: ['tasksId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        name: 'FK_TAG_ID',
        columnNames: ['tagsId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    ]);

    const databaseTags: Tag[] = initialTags.map(tag => {
      const sqliteTag = new Tag();
      sqliteTag.label = tag.label;

      return sqliteTag;
    });

    await queryRunner.manager.save(databaseTags);

    const task1 = new Task();
    task1.title = 'Task with Family and Health tags';
    task1.tags = [databaseTags[0], databaseTags[1]];

    const task2 = new Task();
    task2.title = 'Task with Family and Home tags';
    task2.tags = [databaseTags[0], databaseTags[2]];

    const databaseTasks = [task1, task2];
    queryRunner.manager.save(databaseTasks);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('tags', true, true, true);
    await queryRunner.dropTable('tasks', true, true, true);
    await queryRunner.dropTable('tasks_tags_tags', true, true, true);
  }
}
