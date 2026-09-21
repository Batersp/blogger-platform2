import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionInputDto } from '../../api/input-dto/question.input-dto';

export class CreateQuestionCommand extends Command<Question> {
  constructor(public readonly dto: QuestionInputDto) {
    super();
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<
  CreateQuestionCommand,
  Question
> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<Question> {
    const question = Question.createInstance({
      body: command.dto.body,
      correctAnswers: command.dto.correctAnswers,
    });
    return this.questionsRepository.save(question);
  }
}
