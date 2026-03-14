import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // GET /places?bbox=south,west,north,east&categories=restaurant,cafe,supermarket
  @Get()
  async getPlaces(@Query('bbox') bbox: string, @Query('categories') categories?: string) {
    const categoryList = categories ? categories.split(',').map(k => k.trim()) : undefined;
    return this.placesService.fetchPOIs(bbox, categoryList);
  }
}
