import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ShopService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getItems() {
    return this.prisma.shopItem.findMany({
      orderBy: [{ isActive: 'desc' }, { cost: 'asc' }],
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { cost: 'asc' },
        },
      },
    });
  }

  async getAllItems() {
    return this.prisma.shopItem.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        variants: {
          orderBy: { cost: 'asc' },
        },
      },
    });
  }

  async getItem(itemId: number) {
    const item = await this.prisma.shopItem.findUnique({
      where: { itemId },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { cost: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async createItem(createItemDto: CreateItemDto) {
    return this.prisma.shopItem.create({
      data: {
        name: createItemDto.name,
        description: createItemDto.description,
        imageUrl: createItemDto.imageUrl,
        cost: createItemDto.cost,
      },
      include: {
        variants: true,
      },
    });
  }

  async updateItem(itemId: number, updateItemDto: UpdateItemDto) {
    const item = await this.prisma.shopItem.findUnique({
      where: { itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.shopItem.update({
      where: { itemId },
      data: updateItemDto,
      include: {
        variants: true,
      },
    });
  }

  async deleteItem(itemId: number) {
    const item = await this.prisma.shopItem.findUnique({
      where: { itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.shopItem.delete({
      where: { itemId },
    });

    return { deleted: true, itemId };
  }

  async createVariant(itemId: number, data: { name: string; cost: number }) {
    const item = await this.prisma.shopItem.findUnique({
      where: { itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.shopItemVariant.create({
      data: {
        itemId,
        name: data.name,
        cost: data.cost,
      },
    });
  }

  async updateVariant(variantId: number, data: { name?: string; cost?: number; isActive?: boolean }) {
    const variant = await this.prisma.shopItemVariant.findUnique({
      where: { variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.shopItemVariant.update({
      where: { variantId },
      data,
    });
  }

  async deleteVariant(variantId: number) {
    const variant = await this.prisma.shopItemVariant.findUnique({
      where: { variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.prisma.shopItemVariant.delete({
      where: { variantId },
    });

    return { deleted: true, variantId };
  }

  async getUserBalance(userId: number) {
    const totalApprovedHours = await this.prisma.project.aggregate({
      where: { userId },
      _sum: { approvedHours: true },
    });

    const totalSpent = await this.prisma.transaction.aggregate({
      where: { userId },
      _sum: { cost: true },
    });

    const approved = totalApprovedHours._sum.approvedHours ?? 0;
    const spent = totalSpent._sum.cost ?? 0;
    const balance = Math.round((approved - spent) * 10) / 10;

    return {
      totalApprovedHours: approved,
      totalSpent: spent,
      balance,
    };
  }

  async purchaseItem(userId: number, itemId: number, variantId?: number) {
    const item = await this.prisma.shopItem.findUnique({
      where: { itemId },
      include: {
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (!item.isActive) {
      throw new BadRequestException('This item is no longer available');
    }

    if (item.itemId === 1) {
      const existingPurchase = await this.prisma.transaction.findFirst({
        where: { userId, itemId: 1 },
      });

      if (existingPurchase) {
        throw new BadRequestException('You have already purchased a Midnight ticket');
      }
    }

    let cost = item.cost;
    let variant = null;
    let description = item.name;

    if (item.variants.length > 0) {
      if (!variantId) {
        throw new BadRequestException('This item requires selecting a variant');
      }

      variant = item.variants.find(v => v.variantId === variantId);
      if (!variant) {
        throw new BadRequestException('Invalid variant selected');
      }

      cost = variant.cost;
      description = `${item.name} - ${variant.name}`;
    } else if (variantId) {
      throw new BadRequestException('This item does not have variants');
    }

    if (item.description) {
      description += ` - ${item.description}`;
    }

    const { balance } = await this.getUserBalance(userId);

    if (balance < cost) {
      throw new BadRequestException(
        `Insufficient balance. You have ${balance} hours but this item costs ${cost} hours.`,
      );
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        itemId,
        variantId: variant?.variantId || null,
        itemDescription: description,
        cost,
      },
      include: {
        item: true,
        variant: true,
      },
    });

    const newBalance = await this.getUserBalance(userId);

    let specialAction: string | null = null;

    if (item.itemId === 1) {
      console.log('[Midnight Ticket] Processing ticket purchase for user:', userId);
      try {
        const attendApiKey = this.configService.get<string>('ATTEND_API_KEY');
        console.log('[Midnight Ticket] API Key present:', !!attendApiKey);
        
        if (!attendApiKey) {
          console.error('[Midnight Ticket] ATTEND_API_KEY not configured');
        } else {
          const user = await this.prisma.user.findUnique({
            where: { userId },
            select: { firstName: true, lastName: true, email: true },
          });
          console.log('[Midnight Ticket] User found:', user?.email);

          if (user && user.email) {
            console.log('[Midnight Ticket] Sending request to attend API...');
            const response = await fetch('https://attend.hackclub.com/api/v1/events/80acf8b8-8d7d-4ff6-9311-14edcff613b3/participants', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${attendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                first_name: user.firstName || 'Midnight',
                last_name: user.lastName || 'Attendee',
                email: user.email,
              }),
            });

            const responseText = await response.text();
            console.log('[Midnight Ticket] API Response status:', response.status);
            console.log('[Midnight Ticket] API Response body:', responseText);

            if (response.ok) {
              specialAction = 'midnight_ticket';
              console.log('[Midnight Ticket] Success! specialAction set to midnight_ticket');
            } else {
              console.error('[Midnight Ticket] API request failed:', response.status, responseText);
            }
          } else {
            console.error('[Midnight Ticket] User not found or no email');
          }
        }
      } catch (error) {
        console.error('[Midnight Ticket] Failed to register participant:', error);
      }
    }

    return {
      transaction,
      newBalance,
      specialAction,
    };
  }

  async getUserTransactions(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            itemId: true,
            name: true,
            imageUrl: true,
          },
        },
        variant: {
          select: {
            variantId: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTransactions() {
    return this.prisma.transaction.findMany({
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        item: {
          select: {
            itemId: true,
            name: true,
          },
        },
        variant: {
          select: {
            variantId: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundTransaction(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionId },
      include: {
        user: { select: { userId: true, email: true } },
        item: { select: { name: true } },
        variant: { select: { name: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { transactionId },
    });

    const itemName = transaction.variant 
      ? `${transaction.item.name} (${transaction.variant.name})`
      : transaction.item.name;

    console.log(`[Refund] Transaction ${transactionId} refunded: ${transaction.cost} hours returned to user ${transaction.user.email} for "${itemName}"`);

    return {
      refunded: true,
      transactionId,
      refundedAmount: transaction.cost,
      userId: transaction.user.userId,
      itemName,
    };
  }
}
