import {IsNumber, IsString} from 'class-validator';
import {Request, Response} from 'koa';
import {
  Body,
  Controller,
  Ctx,
  Flow,
  Get,
  Header,
  Params,
  Post,
  Query,
  Req,
  Res,
  Session,
  State, User
} from '../../../index';
import {setSomethingSessionFlow, setSomethingStateFlow} from '../flow/flow';

interface InterfaceInput {
  aString: string;

  aNumber: number;
}

class ClassInput {
  @IsString()
  aString: string;

  @IsNumber()
  aNumber: number;
}

@Controller('/arg')
export class ArgController {
  @Post('/:model/:id')
  async twoParams(@Params() params: any, @Params('id') id: any) {
    return {params, id};
  }

  @Post('/bodyRequired')
  async bodyRequired(@Body({required: true}) body: ClassInput) {
    return body;
  }

  @Post('/bodySimple')
  async simpleBody(@Body() body: any) {
    return body;
  }

  @Post('/body')
  async body(@Body() body: ClassInput) {
    return body;
  }

  @Post('/bodySpecific')
  async bodySpecific(@Body('foo') foo: string) {
    return foo;
  }

  @Post('/interface')
  async bodyInterface(@Body() body: InterfaceInput) {
    return body;
  }

  @Flow([setSomethingStateFlow])
  @Post('/state')
  async state(@State() state: any) {
    return state;
  }

  @Flow([setSomethingStateFlow])
  @Get('/user')
  async user(@User() user: any) {
    return user.id;
  }

  @Post('/header')
  async header(@Header() header: any) {
    return header;
  }

  @Get('/query')
  async query(@Query() q: any) {
    return q;
  }

  @Get('/querySingle')
  async querySingle(@Query('amala') q: string) {
    return q;
  }

  @Get('/params/:id')
  async params(@Params() q: any) {
    return q;
  }

  @Get('/paramsSingle/:id')
  async paramsSingle(@Params('id') id: string) {
    return id;
  }

  // Argument primitive casting
  @Get('/paramsCastNumber/:val')
  async paramsCastNumber(@Params('val') val: number) {
    return {type: typeof val, val};
  }

  // sessions
  @Get('/session')
  @Flow(setSomethingSessionFlow)
  async session(@Session() sess: any) {
    return sess;
  }

  @Get('/sessionSingle')
  @Flow(setSomethingSessionFlow)
  async sessionSingle(@Session('amala') sess: string) {
    return sess;
  }

  @Post('/req')
  async req(@Req() req: Request) {
    return req;
  }

  @Post('/res')
  async res(@Res() res: Response) {
    return res ? 'works' : 'did not work';
  }

  @Post('/ctx')
  async ctx(@Ctx() ctx: any) {
    return ctx;
  }
}
