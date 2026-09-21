import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class DeleteQuestionCommand extends Command<void> {
  constructor(public readonly questionId: string) {
    super();
  }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<
  DeleteQuestionCommand,
  void
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    await this.questionsRepository.softDelete(command.questionId);
  }
}
