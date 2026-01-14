import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { ShopService } from './shop.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PurchaseItemDto } from './dto/purchase-item.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Controller('api/shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get('items')
  async getItems() {
    return this.shopService.getItems();
  }

  @Get('items/:id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.getItem(id);
  }
}

@Controller('api/shop/auth')
@UseGuards(AuthGuard)
export class ShopAuthController {
  constructor(private shopService: ShopService) {}

  @Get('balance')
  async getBalance(@Req() req: Request) {
    return this.shopService.getUserBalance(req.user.userId);
  }

  @Post('purchase')
  async purchaseItem(@Body() purchaseItemDto: PurchaseItemDto, @Req() req: Request) {
    return this.shopService.purchaseItem(req.user.userId, purchaseItemDto.itemId, purchaseItemDto.variantId);
  }

  @Get('transactions')
  async getTransactions(@Req() req: Request) {
    return this.shopService.getUserTransactions(req.user.userId);
  }
}

@Controller('api/shop/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
export class ShopAdminController {
  constructor(private shopService: ShopService) {}

  @Get('items')
  async getAllItems() {
    return this.shopService.getAllItems();
  }

  @Post('items')
  async createItem(@Body() createItemDto: CreateItemDto) {
    return this.shopService.createItem(createItemDto);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.shopService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.deleteItem(id);
  }

  @Post('items/:id/variants')
  async createVariant(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.shopService.createVariant(itemId, createVariantDto);
  }

  @Put('variants/:id')
  async updateVariant(
    @Param('id', ParseIntPipe) variantId: number,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.shopService.updateVariant(variantId, updateVariantDto);
  }

  @Delete('variants/:id')
  async deleteVariant(@Param('id', ParseIntPipe) variantId: number) {
    return this.shopService.deleteVariant(variantId);
  }

  @Get('transactions')
  async getAllTransactions() {
    return this.shopService.getAllTransactions();
  }

  @Delete('transactions/:id')
  async refundTransaction(@Param('id', ParseIntPipe) transactionId: number) {
    return this.shopService.refundTransaction(transactionId);
  }

  @Put('transactions/:id/fulfill')
  async markTransactionFulfilled(@Param('id', ParseIntPipe) transactionId: number) {
    return this.shopService.markTransactionFulfilled(transactionId);
  }

  @Delete('transactions/:id/fulfill')
  async unfulfillTransaction(@Param('id', ParseIntPipe) transactionId: number) {
    return this.shopService.unfulfillTransaction(transactionId);
  }
}
