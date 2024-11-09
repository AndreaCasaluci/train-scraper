import {Body, Controller, Post} from '@nestjs/common';
import {TrenitaliaService} from "./trenitalia.service";
import {TrainRequestDto} from "./dto/request/train-request.dto";

@Controller('trenitalia')
export class TrenitaliaController {
    constructor(private readonly trenitaliaService: TrenitaliaService) {
    }

    @Post("solutions")
    async getTrainSolutions(@Body() data: TrainRequestDto) {
        return this.trenitaliaService.getTrainSolutions(data);
    }
}
