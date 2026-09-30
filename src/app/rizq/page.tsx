// /rizq — (সার্ভার-রেন্ডার্ড, indexable)
import { makeCategoryPage } from "@/lib/category-page";

const { Page, metadata: pageMetadata } = makeCategoryPage("rizq");

export default Page;
export const metadata = pageMetadata;
