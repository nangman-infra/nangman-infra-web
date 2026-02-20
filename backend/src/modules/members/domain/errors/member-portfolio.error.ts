export class MemberPortfolioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class MemberNotFoundError extends MemberPortfolioError {
  constructor(message = '멤버를 찾을 수 없습니다.') {
    super(message);
  }
}

export class MemberPortfolioJobNotFoundError extends MemberPortfolioError {
  constructor(message = '포트폴리오 PDF 작업을 찾을 수 없습니다.') {
    super(message);
  }
}

export class MemberPortfolioJobNotReadyError extends MemberPortfolioError {
  constructor(message = '포트폴리오 PDF 생성이 아직 완료되지 않았습니다.') {
    super(message);
  }
}

export class MemberPortfolioJobFailedError extends MemberPortfolioError {
  constructor(message = '포트폴리오 PDF 생성에 실패했습니다.') {
    super(message);
  }
}

export class MemberPortfolioDocumentNotFoundError extends MemberPortfolioError {
  constructor(message = '포트폴리오 PDF 결과를 찾을 수 없습니다.') {
    super(message);
  }
}
