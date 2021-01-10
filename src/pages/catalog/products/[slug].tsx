import { client } from '@/lib/prismic';
import { GetStaticPaths, GetStaticProps } from 'next';
import PrismicDOM from 'prismic-dom';

import { useRouter } from 'next/router';
import { Document } from 'prismic-javascript/types/documents';

interface ProductProps {
  product: Document;
}

export default function Product({ product }: ProductProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>
  }

  return (
    <div>
      <h1>{PrismicDOM.RichText.asText(product.data.title)}</h1>

      <img src={product.data.thumbnail.url} width={300} alt={product.data.thumbnail.alt}/>
      
      <div dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(product.data.description) }}></div>
    
      <p>Price: R$ {product.data.price}</p>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<ProductProps> = async (context) => {
  const { slug } = context.params;

  const product = await client().getByUID('product', slug.toString(), {});

  return {
    props: {
      product,
    },
    revalidate: 5,
  }
}