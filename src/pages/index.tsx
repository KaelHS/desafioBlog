import React, { useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiUser, FiCalendar } from "react-icons/fi";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


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

export default function Home( {postsPagination}: HomeProps ) {

  const [loadedPosts, setLoadedPosts] = useState(postsPagination.results);
  const [ nextPage, setNextPage ] = useState(postsPagination.next_page);

  async function handleLoadMorePosts ():Promise<void> {

    try{

      const postResponse = await fetch(nextPage)
        .then( response => response.json() )
        .then( data => {
          setNextPage(data.next_page);
          return data.results;
        })

      const results  = postResponse.map( (post: Post) => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }))  
      
      setLoadedPosts([...loadedPosts, ...results])
      


    } catch (err) {
      console.log(err)
    }
  }

  return(
    <>
    <Head>
      <title>Home | spacenews</title>
    </Head>
      <div className={styles.posts}>
        <img src="/Logo.svg" alt="logo " />
      { loadedPosts.map( post => (
        <Link href={`/post/${post.uid}`} key={post.uid}>
          <a>
            <strong>{ post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div>
              <FiCalendar className={styles.infoIcon}/>
              <time>{ format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR}).toLowerCase()}</time>
              <FiUser className={styles.infoIcon}/>
              <span>{post.data.author}</span>
            </div>
          </a>
        </Link>
      ))}
      { nextPage
        && <button 
              type="button"
              onClick={handleLoadMorePosts} >Carregar mais posts</button>
      }
    </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {

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
    pageSize: 1,
  });

  const posts = postsResponse.results.map( post => {
    return{
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })


  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    },
    revalidate: 60*60*8, //8 horas
  }
};
