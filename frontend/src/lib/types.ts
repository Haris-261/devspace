export type Stat={value:string;label:string};
export type Profile={fullName:string;heroIntro:string;heroHeadlines:string[];about:string;contactEmail:string;stats:Stat[];loaderWords?:string[];loaderSubtitle?:string};
export type Project={_id:string;title:string;description:string;imageUrl?:string;technologies:string[];liveUrl:string;featured:boolean;published:boolean;displayOrder:number};
export type Experience={_id:string;company:string;role:string;startDate:string;endDate?:string;current:boolean;description:string;highlights:string[];technologies:string[];displayOrder:number};
export type Skill={_id:string;name:string;category:string;icon?:string;displayOrder:number};
export type Social={_id:string;label:string;url:string;icon:string;enabled:boolean;displayOrder:number};
export type Testimonial={id:string;name:string;role?:string;company?:string;message:string;rating:number;avatarUrl?:string};
export type PortfolioData={profile:Profile;projects:Project[];experience:Experience[];skills:Skill[];socialLinks:Social[];testimonials?:Testimonial[]};
