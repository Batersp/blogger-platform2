import { DomainExceptionCode } from './domain-exception-codes';

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    extensions?: Extension[];
  }) {
    super();
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }

  static badRequest(extensions: { message: string; field: string }[]) {
    return new DomainException({
      code: DomainExceptionCode.BadRequest,
      extensions: extensions.map((e) => new Extension(e.message, e.field)),
    });
  }

  static notFound(field: string) {
    return new DomainException({
      code: DomainExceptionCode.NotFound,
      extensions: [new Extension('Entity not found', field)],
    });
  }
}
