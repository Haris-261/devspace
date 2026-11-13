import { getPortfolio, getTestimonials } from '@/lib/api';
import Portfolio from '@/components/Portfolio';
import LoaderWords from '@/components/LoaderWords';

export const revalidate = 30;

const DEFAULT_LOADER_WORDS = ['Plan', 'Design', 'Develop', 'Innovate'];

export default async function Page() {
  // Fetch portfolio data and testimonials in parallel — no waterfall
  const [data, freshTestimonials] = await Promise.all([
    getPortfolio(),
    getTestimonials(),
  ]);

  // Merge testimonials: use fresh fetch if portfolio didn't include them
  if ((!data.testimonials || data.testimonials.length === 0) && freshTestimonials.length > 0) {
    data.testimonials = freshTestimonials;
  }

  const loaderWords = data.profile?.loaderWords?.length
    ? data.profile.loaderWords
    : DEFAULT_LOADER_WORDS;
  return (
    <>
      <LoaderWords serverWords={loaderWords} />
      <Portfolio data={data} />
    </>
  );
}
