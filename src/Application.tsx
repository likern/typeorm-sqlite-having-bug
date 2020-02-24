import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {createConnection, Connection} from 'typeorm';

import * as entity from './database/entity';
import * as repository from './database/repository';
import * as migration from './database/migration';

const Application = () => {
  const [
    taskRepository,
    setTaskRepository,
  ] = useState<repository.TaskRepository | null>(null);
  const [tasks, setTasks] = useState<entity.Task[] | null>(null);

  // name of tags to filter by ...
  // for "Family" query should return two tasks
  const [filterTags] = useState(['Family']);

  useEffect(() => {
    console.log(`[Application] [useEffect] start of function`);
    let connectionReference: Connection | null = null;
    createConnection({
      type: 'react-native',
      database: 'smarty.db',
      location: 'default',
      logging: 'all',
      entities: entity.allEntities,
      migrations: migration.allMigrations,
      migrationsRun: true,
    })
      .then(connection => {
        console.log(`[Application] connected to sqlite!`);
        connectionReference = connection; // change value by reference to close it later
        setTaskRepository(
          connection.getCustomRepository(repository.TaskRepository),
        );
      })
      .catch(error => {
        console.log(
          `[Application] can't connect to sqlite, because of error [${JSON.stringify(
            error,
          )}]`,
        );
      });

    console.log(`[Application] [useEffect] end of function`);
    return () => {
      console.log(
        `[Application] [useEffect] cleanup useEffect - try to close sqlite connection`,
      );
      if (connectionReference !== null) {
        console.log(
          `[Application] [useEffect] connection is not null - close it`,
        );
        connectionReference.close();
      }
    };
  }, []);

  useEffect(() => {
    if (taskRepository !== null) {
      // search for tasks having all filterTags
      taskRepository
        .createQueryBuilder('task')
        .where(queryBuilder => {
          const subQuery = queryBuilder
            .subQuery()
            .select(['task.id'])
            .from(entity.Task, 'task')
            .innerJoin('task.tags', 'tag')
            .where('tag.label IN (:...filttags)')
            .groupBy('task.id')
            .having('COUNT(task.id) = :count')
            .getQuery();

          return 'task.id IN ' + subQuery;
        })
        .setParameter('filttags', filterTags)
        .setParameter('count', filterTags.length)
        .getMany()
        .then(result => {
          console.log(`typeorm result: [${JSON.stringify(result)}]`);
          setTasks(result);
        })
        .catch(error => {
          console.log(
            `typeorm error: can't execute query because of [${JSON.stringify(
              error,
            )}]`,
          );
        });
    }
  }, [taskRepository, filterTags]);

  return (
    <View style={{width: '100%', height: '100%'}}>
      <Text>{`Number of tasks is ${tasks?.length}`}</Text>
      {taskRepository === null ? (
        <Text>{`Waiting connection to sqlite ...`}</Text>
      ) : tasks === null ? (
        <Text>{`Tasks are ${tasks}`}</Text>
      ) : (
        tasks.map(task => {
          return <Text>{`Task is ${JSON.stringify(task)}`}</Text>;
        })
      )}
    </View>
  );
};

export default Application;
