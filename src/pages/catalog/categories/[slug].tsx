import { client } from '@/lib/prismic';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import PrismicDOM from 'prismic-dom';
import { useRouter } from 'next/router';

import Prismic from 'prismic-javascript';
import { Document } from 'prismic-javascript/types/documents';

interface CategoryProps {
  products: Document[];
  category: Document;
}

export default function Category({ products, category }: CategoryProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>
  }

  return (
    <div>
      <h1>{PrismicDOM.RichText.asText(category.data.title)}</h1>

      <ul>
        {products.map(product => {
          return (
            <li key={product.id}>
              <Link href={`/catalog/products/${product.uid}`}>
                <a>
                  {PrismicDOM.RichText.asText(product.data.title)}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await client().query([
    Prismic.Predicates.at('document.type', 'category')
  ]);

  const paths = categories.results.map(category => {
    return {
      params: { slug: category.uid }
    };
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<CategoryProps> = async (context) => {
  const { slug } = context.params;

  const category = await client().getByUID('category', slug.toString(), {});

  const products = await client().query([
    Prismic.Predicates.at('document.type', 'product'),
    Prismic.Predicates.at('my.product.category', category.id)
  ]);

  return {
    props: {
      products: products.results,
      category,
    },
    revalidate: 60,
  }
}