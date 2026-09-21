import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class PublishQuestionCommand extends Command<void> {
  constructor(
    public readonly questionId: string,
    public readonly published: boolean,
  ) {
    super();
  }
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<
  PublishQuestionCommand,
  void
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrNotFoundFail(
      command.questionId,
    );

    if (command.published && !question.hasCorrectAnswers()) {
      throw new BadRequestException([
        {
          message: "Can't publish a question without correct answers",
          field: 'published',
        },
      ]);
    }

    question.setPublishStatus(command.published);
    await this.questionsRepository.save(question);
  }
}
