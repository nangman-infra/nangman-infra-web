import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import {
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_SUBJECT_MAX_LENGTH,
  CONTACT_MESSAGE_MAX_LENGTH,
} from '../../common/constants/validation';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MaxLength(CONTACT_NAME_MAX_LENGTH, {
    message: `이름은 ${CONTACT_NAME_MAX_LENGTH}자 이하여야 합니다.`,
  })
  name: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MaxLength(CONTACT_SUBJECT_MAX_LENGTH, {
    message: `제목은 ${CONTACT_SUBJECT_MAX_LENGTH}자 이하여야 합니다.`,
  })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @MaxLength(CONTACT_MESSAGE_MAX_LENGTH, {
    message: `메시지는 ${CONTACT_MESSAGE_MAX_LENGTH}자 이하여야 합니다.`,
  })
  message: string;
}
