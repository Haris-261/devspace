import {BadRequestException,Controller,Post,Query,UploadedFile,UseGuards,UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {AuthGuard} from './auth';
import {v2 as cloudinary} from 'cloudinary';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('image',{
    limits:{fileSize:5*1024*1024},
    fileFilter:(_r,f,cb)=>cb(null,/^image\/(jpeg|png|webp|gif)$/.test(f.mimetype))
  }))
  async image(@UploadedFile() file:Express.Multer.File, @Query('folder') folderQuery?: string) {
    if(!file)throw new BadRequestException('Choose a JPG, PNG, WebP, or GIF under 5 MB');
    if(!process.env.CLOUDINARY_CLOUD_NAME)throw new BadRequestException('Cloudinary is not configured');
    cloudinary.config({
      cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
      api_key:process.env.CLOUDINARY_API_KEY,
      api_secret:process.env.CLOUDINARY_API_SECRET
    });
    const folder = folderQuery || 'portfolio/projects';
    const result:any=await new Promise((resolve,reject)=>{
      const stream=cloudinary.uploader.upload_stream(
        {folder,resource_type:'image',transformation:[{width:1200,height:750,crop:'limit',quality:'auto',fetch_format:'auto'}]},
        (e,r)=>e?reject(e):resolve(r)
      );
      stream.end(file.buffer);
    });
    return{url:result.secure_url,publicId:result.public_id};
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('image',{
    limits:{fileSize:2*1024*1024},
    fileFilter:(_r,f,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(f.mimetype))
  }))
  async avatar(@UploadedFile() file:Express.Multer.File) {
    if(!file)throw new BadRequestException('Choose a JPG, PNG, or WebP under 2 MB');
    if(!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WebP are allowed');
    }
    if(file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Avatar must be under 2 MB');
    }
    if(!process.env.CLOUDINARY_CLOUD_NAME)throw new BadRequestException('Cloudinary is not configured');
    cloudinary.config({
      cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
      api_key:process.env.CLOUDINARY_API_KEY,
      api_secret:process.env.CLOUDINARY_API_SECRET
    });
    const result:any=await new Promise((resolve,reject)=>{
      const stream=cloudinary.uploader.upload_stream(
        {folder:'portfolio/testimonials',resource_type:'image'},
        (e,r)=>e?reject(e):resolve(r)
      );
      stream.end(file.buffer);
    });
    return{url:result.secure_url,publicId:result.public_id};
  }
}
