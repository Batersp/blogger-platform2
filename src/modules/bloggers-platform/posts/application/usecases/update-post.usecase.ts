import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

interface UpdatePostCommandProps {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  postId: string;
}

export class UpdatePostCommand extends Command<void> {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  postId: string;
  constructor(public init: UpdatePostCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    await this.blogsRepository.findOrNotFoundFail(command.blogId);
    const post = await this.postsRepository.findOrNotFoundFail(command.postId);
    post.update({
      title: command.title,
      shortDescription: command.shortDescription,
      content: command.content,
      blogId: command.blogId,
    });
    await this.postsRepository.save(post);
  }
}
