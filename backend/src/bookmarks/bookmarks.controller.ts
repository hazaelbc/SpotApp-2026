import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('saved/:usuarioId')
  getSaved(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.bookmarksService.getSaved(usuarioId);
  }

  @Get('favorites/:usuarioId')
  getFavorites(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.bookmarksService.getFavorites(usuarioId);
  }

  @Get('status/:usuarioId/:placeId')
  status(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('placeId', ParseIntPipe) placeId: number,
  ) {
    return this.bookmarksService.status(usuarioId, placeId);
  }

  @Post('saved/toggle')
  toggleSaved(@Body() body: { usuarioId: number; placeId: number }) {
    return this.bookmarksService.toggleSaved(Number(body.usuarioId), Number(body.placeId));
  }

  @Post('favorites/toggle')
  toggleFavorite(@Body() body: { usuarioId: number; placeId: number }) {
    return this.bookmarksService.toggleFavorite(Number(body.usuarioId), Number(body.placeId));
  }

  @Delete('saved/:usuarioId/:placeId')
  removeSaved(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('placeId', ParseIntPipe) placeId: number,
  ) {
    return this.bookmarksService.removeSaved(usuarioId, placeId);
  }

  @Delete('favorites/:usuarioId/:placeId')
  removeFavorite(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('placeId', ParseIntPipe) placeId: number,
  ) {
    return this.bookmarksService.removeFavorite(usuarioId, placeId);
  }
}
