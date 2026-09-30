// /daily-duas — (সার্ভার-রেন্ডার্ড, indexable)
import { makeCategoryPage } from "@/lib/category-page";

const { Page, metadata: pageMetadata } = makeCategoryPage("daily-duas");

export default Page;
export const metadata = pageMetadata;
