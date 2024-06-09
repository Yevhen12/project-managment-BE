import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context, status) {
    const request = context.switchToRpc().getRequest();
    // const { mobile, password } = request.body;
    // if (err || !user) {
    //   if (!mobile) {
    //     throw new HttpException({ message: '手机号不能为空' }, HttpStatus.OK);
    //   } else if (!password) {
    //     throw new HttpException({ message: '密码不能为空' }, HttpStatus.OK);
    //   } else {
    //     throw err || new UnauthorizedException();
    //   }
    // }
    return super.handleRequest(err, request, info, context, status);
  }
}
