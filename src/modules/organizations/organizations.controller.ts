import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';

@Roles(Role.Admin)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Request() req, @Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(
      createOrganizationDto,
      req.user.sub,
    );
  }

  @Get()
  async findAll() {
    const orgs = await this.organizationsService.findAll();
    if (!orgs) {
      return [];
    }
    return orgs;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const org = await this.organizationsService.findOne(id);
    if (!org) {
      throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
    }
    return org;
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(
      id,
      updateOrganizationDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
