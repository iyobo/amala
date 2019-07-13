import {
    Body,
    Controller,
    Cookie,
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
    State
} from '../../../index';
import {IsNumber, IsString} from 'class-validator';
import {setSomethingStateFlow} from '../flow/flow';

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

    @Post('/header')
    async header(@Header() header: any) {
        return header;
    }

    @Post('/cookie')
    async cookie(@Cookie() cookie: any) {
        return cookie;
    }

    @Get('/query')
    async query(@Query() q: any) {
        return q;
    }

    @Get('/session')
    async session(@Session() sess: any) {
        return sess;
    }

    @Get('/req')
    async req(@Req() req: any) {
        return req;
    }

    @Get('/res')
    async res(@Res() res: any) {
        return res;
    }

    @Get('/ctx')
    async ctx(@Ctx() ctx: any) {
        return ctx;
    }

}
