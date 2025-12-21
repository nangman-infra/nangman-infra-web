import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MaxLength(100, { message: '이름은 100자 이하여야 합니다.' })
  name: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @MaxLength(2000, { message: '메시지는 2000자 이하여야 합니다.' })
  message: string;
}

