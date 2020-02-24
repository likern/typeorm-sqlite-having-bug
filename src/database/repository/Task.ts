import {EntityRepository, Repository} from 'typeorm';
import * as entity from '../entity';

@EntityRepository(entity.Task)
export class TaskRepository extends Repository<entity.Task> {
  findByTags(tags: string[]): Promise<entity.Task[]> {
    // don't do something usefull, just placeholder
    if (tags.length > 0) {
      return Promise.resolve([]);
    } else {
      return this.find();
    }
  }
}
