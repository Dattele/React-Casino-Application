import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { getSpecificCard } from '../../Apis/DeckOfCards';

import Layout from '../Layout';

import './CasinoPage.scss';

export default function CasinoPage() {
  const [image, setImage] = useState({ src: '', alt: '' });

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const jackImage = await getSpecificCard('JS');

        setImage({
          src: jackImage.image,
          alt: `${jackImage.value} Of ${jackImage.suit}`,
        });
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };

    fetchImage();
  }, []);

  return (
    <>
      <Helmet>
        <title>Casino</title>
      </Helmet>
      <main className='Card'>
        <div className='Card Card-Body'>
          <h1>Logan's Casino</h1>
          <Layout />
          <img className='Card-Image' src={image.src} alt={image.alt} />
        </div>
      </main>
    </>
  );
}
