import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionInputDto } from '../../api/input-dto/question.input-dto';

export class UpdateQuestionCommand extends Command<void> {
  constructor(
    public readonly questionId: string,
    public readonly dto: QuestionInputDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<
  UpdateQuestionCommand,
  void
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrNotFoundFail(
      command.questionId,
    );

    const newCorrectAnswers = command.dto.correctAnswers;
    const hasNoAnswers = !newCorrectAnswers || newCorrectAnswers.length === 0;

    // нельзя опустошить correctAnswers у уже опубликованного вопроса —
    // иначе он останется в игре без правильного ответа
    if (question.published && hasNoAnswers) {
      throw new BadRequestException([
        {
          message: "correctAnswers can't be empty for a published question",
          field: 'correctAnswers',
        },
      ]);
    }

    question.update({
      body: command.dto.body,
      correctAnswers: command.dto.correctAnswers,
    });
    await this.questionsRepository.save(question);
  }
}
