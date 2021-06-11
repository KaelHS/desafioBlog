import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiUser, FiCalendar } from "react-icons/fi";


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home( props: HomeProps ) {
  
  return(
      <div className={styles.posts}>
        <img src="/Logo.svg" alt="logo " />
      { props.postsPagination.results.map( post => (
        <Link href="#" key={post.uid}>
          <a>
            <strong>{ post.data.title }</strong>
            <p>{post.data.subtitle}</p>
            <div>
              <FiCalendar className={styles.infoIcon}/>
              <time>{post.first_publication_date}</time>
              <FiUser className={styles.infoIcon}/>
              <span>{post.data.author}</span>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}

export const getStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], { 
    fetch: [
      'posts.title', 
      'posts.subtitle', 
      'posts.author', 'posts.banner', 
      'posts.content'
    ],
    pageSize: 2,
  });

  const posts = postsResponse.results.map( post => {
    return{
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination
    },
    revalidate: 60*60*8, //8 horas
  }
};
