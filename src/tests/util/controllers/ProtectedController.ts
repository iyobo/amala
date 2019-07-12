import {Controller, Delete, Flow, Get, Patch, Post, Put, Version} from '../../../index';
import {passFlow, unauthorizedFlow} from '../flow/flow';


@Controller('/protected')
@Flow([unauthorizedFlow])
export class ProtectedController {

    @Get('/')
    async hello() {

        return 'okay';
    }

    @Post('/')
    async postRoute() {
        return 'okay';
    }

    @Patch('/')
    async patchRoute() {
        return 'okay';
    }

    @Put('/')
    async putRoute() {
        return 'okay';
    }

    @Delete('/')
    async deleteRoute() {
        return 'okay';
    }

    @Get('/mmm')
    async someRoute() {
        return 'mmm';
    }

    @Get('/mmm')
    @Version('1')
    async v1OnlyRoute() {
        return 'mmm for v1';
    }

    @Get('/passFlow')
    @Flow([passFlow])
    async passFlow() {

        return 'I was allowed';
    }

    @Get('/unauthorized')
    @Flow([unauthorizedFlow])
    async unauthorized() {

        return 'You\'ll never see this';
    }

    @Get('/multiFlow')
    @Flow([passFlow,passFlow,passFlow])
    async multiFlow() {

        return 'multiFlow allowed';
    }

}
