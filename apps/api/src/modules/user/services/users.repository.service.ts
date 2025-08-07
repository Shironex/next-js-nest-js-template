import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class usersRepositoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return await this.prismaService.user.findUnique({
      where: { username },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prismaService.user.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await this.prismaService.user.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
